/**
 * Kai RegAI — Reading History Service
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * High-level service orchestrating:
 * - Atomic persistence of completed P10 reports & versioned snapshots
 * - Browsing, filtering, and pagination of user reading history
 * - Offline-first reading reconstruction (Zero AI cost, zero rule re-evaluation)
 * - Safe JSON archive export & import
 * - Complete 1-tap local data purge
 */

import { ReadingRecord, READING_STATUS, OWNER_TYPE } from '../storage/ReadingSchema.js';
import { ReadingSchemaValidator } from '../storage/ReadingSchemaValidator.js';
import { StorageSerializer } from '../storage/StorageSerializer.js';
import { defaultStorageProvider } from '../storage/index.js';
import { defaultAuthProvider } from '../auth/index.js';
import { defaultSyncEngine, SyncEngine, defaultRemoteReadingStore } from '../sync/index.js';
import { ReportModel } from '../report/ReportSchema.js';
import { reportTelemetry } from '../report/ReportTelemetry.js';

export class ReadingHistoryService {
  constructor(options = {}) {
    this.storage = options.storageProvider || defaultStorageProvider;
    this.auth = options.authProvider || defaultAuthProvider;
    this.sync = options.syncEngine || (options.storageProvider ? new SyncEngine({
      storageProvider: this.storage,
      authProvider: this.auth,
      remoteStore: defaultRemoteReadingStore
    }) : defaultSyncEngine);
  }

  async init() {
    await this.storage.init();
    await this.auth.init();
    return true;
  }

  /**
   * Save a completed reading atomically
   * @param {Object} params
   * @param {ReportModel} params.report - P10 canonical ReportModel
   * @param {Object} [params.dossier] - P8 InterpretationDossier
   * @param {Object} [params.narratedReading] - P9 NarratedReading
   * @param {Object} [params.featureModel] - P5/P7 canonical feature model (derived only)
   * @param {string} [params.userNotes] - Optional user annotations
   * @returns {Promise<ReadingRecord>}
   */
  async recordCompletedReading({ report, dossier, narratedReading, featureModel, userNotes = '' }) {
    if (!report) {
      throw new Error('recordCompletedReading requires a valid report');
    }

    const user = await this.auth.getCurrentUser();

    // 1. Build clean derived feature snapshot (Strictly NO raw photographs)
    const featureSnapshot = featureModel ? {
      hand_side: featureModel.hand_side,
      quality_score: featureModel.quality_score,
      major_lines: {
        life: { status: featureModel.major_lines?.life_line?.status || 'DETECTED' },
        head: { status: featureModel.major_lines?.head_line?.status || 'DETECTED' },
        heart: { status: featureModel.major_lines?.heart_line?.status || 'DETECTED' },
        fate: { status: featureModel.major_lines?.fate_line?.status || 'PARTIAL' },
        sun: { status: featureModel.major_lines?.sun_line?.status || 'NOT_DETECTED' }
      },
      tags: featureModel.tags || []
    } : {
      hand_side: report.subject?.handSide || 'RIGHT',
      quality_score: report.confidence?.qualityScore || 0.9,
      tags: []
    };

    // 2. Instantiate ReadingRecord
    const record = new ReadingRecord({
      readingId: report.reportId || `RDG-${Date.now()}`,
      createdAt: report.generatedAt || new Date().toISOString(),
      ownerId: user.ownerId,
      ownerType: user.ownerType,
      readingMethod: report.readingMethod,
      reportTier: report.reportTier,
      status: READING_STATUS.COMPLETE,
      featureSnapshot,
      interpretationSnapshot: dossier ? (dossier.toJSON ? dossier.toJSON() : dossier) : {},
      narrationSnapshot: narratedReading ? (narratedReading.toJSON ? narratedReading.toJSON() : narratedReading) : {},
      reportSnapshot: report.toJSON ? report.toJSON() : report,
      versions: {
        p8CodexVersion: report.metadata?.codexVersion || '1.0.0',
        p9NarrationVersion: report.metadata?.narrationVersion || '1.0.0',
        p10ReportSchemaVersion: report.schemaVersion || '1.0.0'
      },
      metadata: {
        displayTitle: report.summary?.title || 'Personal Hastarekha Reading',
        handSide: report.subject?.handSide || 'RIGHT',
        confidenceBand: report.confidence?.band || 'MODERATE',
        summary: report.summary?.headline || '',
        userNotes: userNotes || '',
        isFavorite: false,
        tags: [report.readingMethodLabel || 'Camera Scan', report.reportTier]
      }
    });

    // 3. Compute deterministic cryptographic integrity hash
    record.contentHash = await StorageSerializer.computeHash(record.getHashPayload());

    // 4. Validate schema, integrity, and zero-biometric invariants
    const validation = await ReadingSchemaValidator.validate(record, { verifyHash: true });
    if (!validation.valid) {
      throw new Error(`ReadingRecord validation failed: ${validation.errors.join('; ')}`);
    }

    // 5. Commit atomically to storage
    const saved = await this.storage.saveReading(record);

    // 6. Update user stats
    user.recordReadingCreated(report.readingMethod);
    await this.storage.saveProfile({ ...user.toJSON(), profileId: 'CURRENT_ACTIVE_PROFILE' });

    // 7. Enqueue for background synchronization if eligible
    if (this.sync) {
      await this.sync.queueReading(saved.readingId, 'UPLOAD');
    }

    // 8. Non-blocking telemetry
    reportTelemetry.logEvent('reading_saved', {
      readingId: saved.readingId,
      reportTier: saved.reportTier,
      readingMethod: saved.readingMethod
    });

    return saved;
  }

  /**
   * Fetch single reading by ID
   */
  async getReading(readingId) {
    const raw = await this.storage.getReading(readingId);
    if (!raw) return null;

    const validation = await ReadingSchemaValidator.validate(raw);
    if (!validation.valid) {
      // Return with corrupted flag for recovery
      raw.status = 'CORRUPTED';
      raw.corruptionErrors = validation.errors;
    }
    return raw;
  }

  /**
   * List paginated user reading history
   */
  async listHistory(options = {}) {
    const user = await this.auth.getCurrentUser();
    const result = await this.storage.listReadings({
      ownerId: user.ownerId,
      ...options
    });

    reportTelemetry.logEvent('history_opened', {
      total: result.total,
      limit: result.limit
    });

    return result;
  }

  /**
   * Delete an individual reading
   */
  async deleteReading(readingId) {
    const reading = await this.storage.getReading(readingId);
    if (!reading) return false;

    await this.storage.deleteReading(readingId);

    if (this.sync) {
      await this.sync.queueReading(readingId, 'DELETE');
    }

    reportTelemetry.logEvent('reading_deleted', { readingId });
    return true;
  }

  /**
   * Reopen a historical report without calling AI or re-running P8
   * @param {string} readingId
   * @returns {Promise<ReportModel>}
   */
  async reopenReport(readingId) {
    const record = await this.getReading(readingId);
    if (!record) {
      throw new Error(`Reading '${readingId}' not found in local archive`);
    }

    if (record.status === 'CORRUPTED') {
      throw new Error(`Cannot reopen corrupted reading '${readingId}'`);
    }

    // Return stored report snapshot instantiated into ReportModel
    return new ReportModel(record.reportSnapshot);
  }

  /**
   * Export all user readings into structured JSON archive
   */
  async exportArchiveJSON() {
    const user = await this.auth.getCurrentUser();
    const { records } = await this.storage.listReadings({ ownerId: user.ownerId, limit: 10000 });

    const archive = {
      archiveVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      ownerId: user.ownerId,
      totalReadings: records.length,
      readings: records.map(r => r.toJSON ? r.toJSON() : r)
    };

    return JSON.stringify(archive, null, 2);
  }

  /**
   * Import readings from structured JSON archive with strict validation
   */
  async importArchiveJSON(jsonString) {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (!Array.isArray(parsed.readings)) {
      throw new Error('Archive must contain a readings array');
    }

    const user = await this.auth.getCurrentUser();
    let imported = 0;

    for (const raw of parsed.readings) {
      // Re-assign to current user to prevent cross-account impersonation
      raw.ownerId = user.ownerId;
      raw.ownerType = user.ownerType;

      const record = new ReadingRecord(raw);
      const validation = await ReadingSchemaValidator.validate(record);
      if (validation.valid) {
        await this.storage.saveReading(record);
        imported++;
      }
    }

    return { imported, total: parsed.readings.length };
  }

  /**
   * Complete 1-tap local data purge
   */
  async purgeAllData() {
    await this.storage.clearAll();
    await this.auth.logout();
    reportTelemetry.logEvent('local_data_purged');
    return true;
  }
}

export const readingHistoryService = new ReadingHistoryService();
