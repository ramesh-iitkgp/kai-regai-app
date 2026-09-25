/**
 * Kai RegAI — Canonical Reading Record & Schema
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Formal data contract for persisted historical readings:
 * - Versioned schema: "1.0.0"
 * - Immutable snapshots: P8 dossier, P9 narration, P10 report, derived features
 * - Provenance versioning: Pins exact P8 Codex, P9 Narration, P10 Report versions
 * - Zero raw biometric photography or temporary CV buffers
 * - Content integrity hash for corruption detection & deduplication
 */

export const READING_STATUS = {
  CREATING: 'CREATING',
  PROCESSING: 'PROCESSING',
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
  DELETED: 'DELETED'
};

export const OWNER_TYPE = {
  GUEST: 'GUEST',
  ACCOUNT: 'ACCOUNT'
};

export class ReadingRecord {
  constructor(data = {}) {
    this.schemaVersion = data.schemaVersion || '1.0.0';
    this.readingId = data.readingId || `RDG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;

    // Ownership & Identity
    this.ownerId = data.ownerId || 'GST-ANONYMOUS';
    this.ownerType = data.ownerType || OWNER_TYPE.GUEST;

    // Reading execution metadata
    this.readingMethod = data.readingMethod || 'MODE_1_CAMERA';
    this.reportTier = data.reportTier || 'PREMIUM';
    this.status = data.status || READING_STATUS.COMPLETE;

    // Immutable Historical Snapshots (NO raw images)
    this.featureSnapshot = data.featureSnapshot || {};
    this.interpretationSnapshot = data.interpretationSnapshot || {};
    this.narrationSnapshot = data.narrationSnapshot || {};
    this.reportSnapshot = data.reportSnapshot || {};

    // Exact Engine Versions
    this.versions = {
      p8CodexVersion: data.versions?.p8CodexVersion || '1.0.0',
      p9NarrationVersion: data.versions?.p9NarrationVersion || '1.0.0',
      p10ReportSchemaVersion: data.versions?.p10ReportSchemaVersion || '1.0.0'
    };

    // Integrity Signature
    this.contentHash = data.contentHash || '';

    // Mutable User Metadata (isolated from interpretation)
    this.metadata = {
      displayTitle: data.metadata?.displayTitle || this.reportSnapshot?.summary?.title || 'Personal Hastarekha Reading',
      handSide: data.metadata?.handSide || this.reportSnapshot?.subject?.handSide || 'RIGHT',
      confidenceBand: data.metadata?.confidenceBand || this.reportSnapshot?.confidence?.band || 'MODERATE',
      summary: data.metadata?.summary || this.reportSnapshot?.summary?.headline || '',
      isFavorite: data.metadata?.isFavorite || false,
      userNotes: data.metadata?.userNotes || '',
      tags: data.metadata?.tags || ['Vedic', 'Chiromancy']
    };
  }

  /**
   * Produce a payload suitable for content hash computation
   * Excludes mutable user notes/title to keep the reading essence immutable
   */
  getHashPayload() {
    return {
      schemaVersion: this.schemaVersion,
      readingId: this.readingId,
      ownerId: this.ownerId,
      readingMethod: this.readingMethod,
      reportTier: this.reportTier,
      featureSnapshot: this.featureSnapshot,
      interpretationSnapshot: this.interpretationSnapshot,
      narrationSnapshot: this.narrationSnapshot,
      reportSnapshot: this.reportSnapshot,
      versions: this.versions
    };
  }

  toJSON() {
    return {
      schemaVersion: this.schemaVersion,
      readingId: this.readingId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ownerId: this.ownerId,
      ownerType: this.ownerType,
      readingMethod: this.readingMethod,
      reportTier: this.reportTier,
      status: this.status,
      featureSnapshot: this.featureSnapshot,
      interpretationSnapshot: this.interpretationSnapshot,
      narrationSnapshot: this.narrationSnapshot,
      reportSnapshot: this.reportSnapshot,
      versions: this.versions,
      contentHash: this.contentHash,
      metadata: this.metadata
    };
  }
}
