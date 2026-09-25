/**
 * Kai RegAI — Server-Side Synchronization Service
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Coordinates cross-device synchronization:
 * - Compatible with P11 SyncEngine & ReadingRecord
 * - Batch upload with per-item status and conflict detection
 * - Idempotent sync using readingId + contentHash
 * - Historical snapshot preservation (immutable readings)
 * - Deletion propagation
 * - IDOR protection on all sync operations
 * - Rejects any raw photographic data via PrivacyGuard
 */

import { PrivacyGuard } from '../security/PrivacyGuard.js';

export class SyncService {
  constructor(database, readingService, auditService) {
    this.database = database;
    this.readingService = readingService;
    this.auditService = auditService;
  }

  /**
   * Batch synchronize client readings to the server
   * @param {Object} payload { items: Array<Object>, syncMode: 'MERGE' | 'REPLACE' }
   * @param {string} requesterId
   * @param {string} [requestId]
   * @returns {Object}
   */
  syncBatch(payload, requesterId, requestId = null) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing or invalid');
    }

    if (!payload || !Array.isArray(payload.items)) {
      throw new Error('400 Bad Request: Expected { items: [...] }');
    }

    const items = payload.items;
    const results = [];

    for (const item of items) {
      try {
        // 1. Deletion Sync
        if (item.deleted || item.action === 'DELETE') {
          const readingId = item.readingId;
          if (!readingId) {
            results.push({ readingId: null, status: 'REJECTED', error: 'Missing readingId for deletion' });
            continue;
          }

          const existing = this.database
            .prepare('SELECT * FROM readings WHERE reading_id = ?;')
            .get(readingId);

          if (!existing) {
            results.push({ readingId, status: 'DELETED', isDuplicate: true });
            continue;
          }

          if (existing.owner_id !== requesterId) {
            this.auditService?.logEvent({
              eventType: 'UNAUTHORIZED_ACCESS',
              actorId: requesterId,
              resourceId: readingId,
              requestId,
              details: { reason: 'Unauthorized sync deletion attempt' }
            });
            results.push({ readingId, status: 'REJECTED', error: '403 Forbidden: IDOR violation' });
            continue;
          }

          this.readingService.deleteReading(readingId, requesterId, requestId);
          results.push({ readingId, status: 'DELETED' });
          continue;
        }

        // 2. Ownership Verification
        if (item.ownerId && item.ownerId !== requesterId) {
          this.auditService?.logEvent({
            eventType: 'UNAUTHORIZED_ACCESS',
            actorId: requesterId,
            resourceId: item.readingId,
            requestId,
            details: { attemptedOwner: item.ownerId, reason: 'IDOR attempt during sync' }
          });
          results.push({ readingId: item.readingId, status: 'REJECTED', error: '403 Forbidden: IDOR violation' });
          continue;
        }

        // 3. Privacy Guard Check (Reject Raw Camera Images)
        const privacy = PrivacyGuard.inspect(item);
        if (!privacy.safe) {
          results.push({ readingId: item.readingId, status: 'REJECTED', error: privacy.violationReason });
          continue;
        }

        // 4. Conflict / Idempotency Check
        const existing = this.database
          .prepare('SELECT * FROM readings WHERE reading_id = ?;')
          .get(item.readingId);

        if (existing) {
          if (existing.owner_id !== requesterId) {
            results.push({ readingId: item.readingId, status: 'REJECTED', error: '403 Forbidden: Ownership mismatch' });
            continue;
          }

          // Invariant 10: Historical readings are immutable snapshots
          if (existing.content_hash === item.contentHash) {
            results.push({ readingId: item.readingId, status: 'SYNCED', isDuplicate: true });
            continue;
          } else {
            // Content hash mismatch for the same readingId is a conflict
            results.push({
              readingId: item.readingId,
              status: 'CONFLICT',
              serverHash: existing.content_hash,
              clientHash: item.contentHash,
              error: 'Conflict: Immutable historical reading already exists with different content hash'
            });
            continue;
          }
        }

        // 5. Store Reading
        const saved = this.readingService.saveReading(item, requesterId, requestId);
        results.push({
          readingId: saved.readingId,
          status: 'SYNCED',
          isDuplicate: saved.isDuplicate
        });

      } catch (err) {
        results.push({
          readingId: item.readingId || null,
          status: 'REJECTED',
          error: err.message
        });
      }
    }

    return {
      success: true,
      processed: items.length,
      syncedCount: results.filter(r => r.status === 'SYNCED' || r.status === 'DELETED').length,
      conflictCount: results.filter(r => r.status === 'CONFLICT').length,
      rejectedCount: results.filter(r => r.status === 'REJECTED').length,
      results
    };
  }

  /**
   * Pull changes since a given timestamp or all readings
   * @param {Object} query { since: string }
   * @param {string} requesterId
   * @returns {Object}
   */
  pull(query, requesterId) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing or invalid');
    }

    const { since = null } = query || {};
    let rows;

    if (since) {
      rows = this.database.prepare(`
        SELECT * FROM readings
        WHERE owner_id = ? AND updated_at > ?
        ORDER BY updated_at ASC;
      `).all(requesterId, since);
    } else {
      rows = this.database.prepare(`
        SELECT * FROM readings
        WHERE owner_id = ? AND deleted_at IS NULL
        ORDER BY created_at DESC;
      `).all(requesterId);
    }

    const readings = rows.map(r => this.readingService._mapRowToRecord(r));

    return {
      success: true,
      count: readings.length,
      serverTime: new Date().toISOString(),
      readings
    };
  }
}
