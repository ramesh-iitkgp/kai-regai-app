/**
 * Kai RegAI — Reading Migration Engine
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Provides deterministic schema migrations for persisted reading records:
 * - Upgrades legacy reading snapshots to latest schemaVersion ("1.0.0")
 * - Preserves physical observations, interpretation, and narrative integrity
 * - Never silently discards data or invents new features during migration
 */

import { ReadingRecord, READING_STATUS, OWNER_TYPE } from './ReadingSchema.js';
import { StorageSerializer } from './StorageSerializer.js';

export class ReadingMigrationEngine {
  static CURRENT_VERSION = '1.0.0';

  /**
   * Migrate record to CURRENT_VERSION if needed
   * @param {Object} rawRecord
   * @returns {Promise<ReadingRecord>}
   */
  static async migrate(rawRecord) {
    if (!rawRecord || typeof rawRecord !== 'object') {
      throw new Error('Migration failed: rawRecord must be an object');
    }

    const version = rawRecord.schemaVersion || '0.9.0';

    if (version === this.CURRENT_VERSION) {
      // Already at target version, return normalized instance
      return new ReadingRecord(rawRecord);
    }

    let migrated = { ...rawRecord };

    // Step 1: Migrate 0.9.0 (pre-P10 / early mock) -> 1.0.0
    if (version === '0.9.0' || !rawRecord.schemaVersion) {
      migrated = await this.migrateFrom090To100(migrated);
    }

    // Recalculate content hash for migrated record
    const recordInstance = new ReadingRecord(migrated);
    recordInstance.contentHash = await StorageSerializer.computeHash(recordInstance.getHashPayload());
    recordInstance.updatedAt = new Date().toISOString();

    return recordInstance;
  }

  /**
   * Migration 0.9.0 -> 1.0.0
   * @param {Object} record
   * @returns {Promise<Object>}
   */
  static async migrateFrom090To100(record) {
    const updated = {
      ...record,
      schemaVersion: '1.0.0',
      ownerId: record.ownerId || record.user_id || 'GST-ANONYMOUS',
      ownerType: record.ownerType || OWNER_TYPE.GUEST,
      status: record.status || READING_STATUS.COMPLETE,
      versions: {
        p8CodexVersion: record.versions?.p8CodexVersion || record.provenance?.codex_version || '1.0.0',
        p9NarrationVersion: record.versions?.p9NarrationVersion || '1.0.0',
        p10ReportSchemaVersion: record.versions?.p10ReportSchemaVersion || '1.0.0'
      },
      metadata: {
        displayTitle: record.metadata?.displayTitle || record.title || 'Personal Hastarekha Reading',
        handSide: record.metadata?.handSide || record.hand_side || 'RIGHT',
        confidenceBand: record.metadata?.confidenceBand || record.confidence_band || 'MODERATE',
        summary: record.metadata?.summary || record.summary || '',
        isFavorite: record.metadata?.isFavorite || false,
        userNotes: record.metadata?.userNotes || '',
        tags: record.metadata?.tags || record.tags || ['Vedic', 'Chiromancy']
      }
    };

    return updated;
  }
}
