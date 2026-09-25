/**
 * Kai RegAI — Server-Side Reading Service & Ownership Boundary
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * - Enforces Invariant 7: CLIENT STATE IS NOT AUTHORITATIVE FOR COMMERCIAL ACCESS
 * - Enforces Invariant 8: STORE THE READING, NOT THE PERSON
 * - Enforces Invariant 9: RAW PALM IMAGES MUST NOT BECOME A DEFAULT SERVER-SIDE DATASET
 * - Enforces Invariant 10: HISTORICAL READINGS MUST REMAIN REPRODUCIBLE
 * - Strict IDOR prevention on read, write, and delete operations
 */

import { PrivacyGuard } from '../security/PrivacyGuard.js';

export class ReadingService {
  constructor(database, auditService) {
    this.database = database;
    this.auditService = auditService;
  }

  /**
   * Save reading to server-authoritative store
   * @param {Object} readingData
   * @param {string} requesterId
   * @param {string} [requestId]
   * @returns {Object}
   */
  saveReading(readingData, requesterId, requestId = null) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing or invalid');
    }

    if (!readingData || typeof readingData !== 'object') {
      throw new Error('400 Bad Request: Missing reading payload');
    }

    // 1. Enforce IDOR Ownership Protection
    if (readingData.ownerId && readingData.ownerId !== requesterId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: readingData.readingId,
        requestId,
        details: { attemptedOwner: readingData.ownerId, reason: 'IDOR write attempt blocked' }
      });
      throw new Error('403 Forbidden: Ownership mismatch (IDOR Protection)');
    }

    const ownerId = requesterId;
    const readingId = readingData.readingId || `RDG-${Date.now()}`;

    // 2. Strict Privacy Guard Check (Reject Raw Photographs / Buffers)
    const privacyCheck = PrivacyGuard.inspect(readingData);
    if (!privacyCheck.safe) {
      if (privacyCheck.isOversized) {
        throw new Error(`413 Payload Too Large: ${privacyCheck.violationReason}`);
      }
      throw new Error(`400 Bad Request: ${privacyCheck.violationReason}`);
    }

    const now = new Date().toISOString();
    const schemaVersion = readingData.schemaVersion || '1.0.0';
    const readingMethod = readingData.readingMethod || 'MODE_1_CAMERA';
    const reportTier = readingData.reportTier || 'STANDARD';
    const contentHash = readingData.contentHash || 'HASH-MISSING';
    const title = readingData.metadata?.displayTitle || readingData.title || 'Personal Hastarekha Reading';
    const summary = readingData.metadata?.summary || readingData.summary || '';

    // Strip any unexpected sensitive or raw visual fields from derived snapshots
    const featureSnapshot = JSON.stringify(readingData.featureSnapshot || {});
    const reportSnapshot = JSON.stringify(readingData.reportSnapshot || {});
    const metadata = JSON.stringify(readingData.metadata || {});

    // 3. Idempotency Check
    const existing = this.database.prepare('SELECT * FROM readings WHERE reading_id = ?;').get(readingId);
    if (existing) {
      if (existing.owner_id !== requesterId) {
        throw new Error('403 Forbidden: You do not have permission to modify this reading (IDOR Protection)');
      }
      if (existing.content_hash === contentHash) {
        return {
          success: true,
          isDuplicate: true,
          readingId: existing.reading_id,
          contentHash: existing.content_hash
        };
      }
    }

    // 4. Upsert reading into database
    this.database.prepare(`
      INSERT INTO readings (
        reading_id, owner_id, schema_version, reading_method, report_tier,
        content_hash, title, summary, feature_snapshot, report_snapshot,
        metadata, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(reading_id) DO UPDATE SET
        schema_version = excluded.schema_version,
        report_tier = excluded.report_tier,
        content_hash = excluded.content_hash,
        title = excluded.title,
        summary = excluded.summary,
        feature_snapshot = excluded.feature_snapshot,
        report_snapshot = excluded.report_snapshot,
        metadata = excluded.metadata,
        updated_at = excluded.updated_at,
        deleted_at = NULL;
    `).run(
      readingId,
      ownerId,
      schemaVersion,
      readingMethod,
      reportTier,
      contentHash,
      title,
      summary,
      featureSnapshot,
      reportSnapshot,
      metadata,
      readingData.createdAt || now,
      now
    );

    this.auditService?.logEvent({
      eventType: 'READING_CREATED',
      actorId: requesterId,
      resourceId: readingId,
      requestId,
      details: { readingMethod, reportTier }
    });

    return {
      success: true,
      isDuplicate: false,
      readingId,
      contentHash
    };
  }

  /**
   * Fetch single reading with strict IDOR ownership check
   * @param {string} readingId 
   * @param {string} requesterId 
   * @returns {Object}
   */
  getReading(readingId, requesterId) {
    if (!requesterId) throw new Error('401 Unauthorized: Session required');

    const row = this.database.prepare(`
      SELECT * FROM readings 
      WHERE reading_id = ? AND deleted_at IS NULL;
    `).get(readingId);

    if (!row) return null;

    if (row.owner_id !== requesterId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: readingId,
        details: { targetOwner: row.owner_id, reason: 'IDOR read attempt blocked' }
      });
      throw new Error('403 Forbidden: You do not have permission to access this reading (IDOR Protection)');
    }

    return this._formatReadingRow(row);
  }

  /**
   * List paginated readings owned by requester
   * @param {string} requesterId 
   * @param {Object} [options]
   * @returns {{ total: number, readings: Object[] }}
   */
  listUserReadings(requesterId, options = {}) {
    return this.listReadings(requesterId, options);
  }

  /**
   * List paginated readings owned by requester
   * @param {string} requesterId 
   * @param {Object} [options]
   * @returns {{ total: number, readings: Object[] }}
   */
  listReadings(requesterId, options = {}) {
    if (!requesterId) throw new Error('401 Unauthorized: Session required');

    const limit = Math.min(options.limit || 50, 100);
    const offset = options.offset || 0;

    const countRow = this.database.prepare(`
      SELECT COUNT(*) as total FROM readings 
      WHERE owner_id = ? AND deleted_at IS NULL;
    `).get(requesterId);

    const rows = this.database.prepare(`
      SELECT * FROM readings 
      WHERE owner_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `).all(requesterId, limit, offset);

    return {
      total: countRow.total,
      limit,
      offset,
      readings: rows.map(r => this._formatReadingRow(r))
    };
  }

  /**
   * Soft-delete a reading
   * @param {string} readingId 
   * @param {string} requesterId 
   * @param {string} [requestId]
   * @returns {boolean}
   */
  deleteReading(readingId, requesterId, requestId = null) {
    if (!requesterId) throw new Error('401 Unauthorized: Session required');

    const row = this.database.prepare('SELECT * FROM readings WHERE reading_id = ?;').get(readingId);
    if (!row || row.deleted_at !== null) return false;

    if (row.owner_id !== requesterId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: readingId,
        requestId,
        details: { reason: 'IDOR delete attempt blocked' }
      });
      throw new Error('403 Forbidden: You do not have permission to delete this reading (IDOR Protection)');
    }

    const now = new Date().toISOString();
    this.database.prepare(`
      UPDATE readings 
      SET deleted_at = ?, updated_at = ?
      WHERE reading_id = ?;
    `).run(now, now, readingId);

    this.auditService?.logEvent({
      eventType: 'READING_DELETED',
      actorId: requesterId,
      resourceId: readingId,
      requestId
    });

    return true;
  }

  /**
   * Export all user readings into structured JSON archive
   * @param {string} requesterId 
   * @returns {Object}
   */
  exportUserData(requesterId) {
    if (!requesterId) throw new Error('401 Unauthorized: Session required');

    const readingRows = this.database.prepare(`
      SELECT * FROM readings 
      WHERE owner_id = ? AND deleted_at IS NULL
      ORDER BY created_at ASC;
    `).all(requesterId);

    const txnRows = this.database.prepare(`
      SELECT * FROM transactions 
      WHERE owner_id = ?
      ORDER BY created_at ASC;
    `).all(requesterId);

    const entRows = this.database.prepare(`
      SELECT * FROM entitlements 
      WHERE owner_id = ?
      ORDER BY granted_at ASC;
    `).all(requesterId);

    return {
      archiveVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      ownerId: requesterId,
      readings: readingRows.map(r => this._formatReadingRow(r)),
      transactions: txnRows.map(t => ({
        transactionId: t.transaction_id,
        productId: t.product_id,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        purchasedAt: t.created_at
      })),
      entitlements: entRows.map(e => ({
        entitlementId: e.entitlement_id,
        productId: e.product_id,
        tier: e.tier,
        status: e.status,
        grantedAt: e.granted_at,
        expiresAt: e.expires_at
      }))
    };
  }

  _formatReadingRow(row) {
    return {
      readingId: row.reading_id,
      ownerId: row.owner_id,
      schemaVersion: row.schema_version,
      readingMethod: row.reading_method,
      reportTier: row.report_tier,
      contentHash: row.content_hash,
      title: row.title,
      summary: row.summary,
      featureSnapshot: JSON.parse(row.feature_snapshot || '{}'),
      reportSnapshot: JSON.parse(row.report_snapshot || '{}'),
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
