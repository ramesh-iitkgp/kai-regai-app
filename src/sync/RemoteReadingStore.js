/**
 * Kai RegAI — Remote Reading Store (Backend Abstraction)
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Server-side storage contract enforcing strict security boundaries:
 * - Server-side authorization & IDOR (Insecure Direct Object Reference) prevention
 * - Idempotency via readingId + contentHash matching
 * - Strict payload size quotas (< 2 MB)
 * - Zero raw biometric photograph retention
 */

export class RemoteReadingStore {
  constructor() {
    this.remoteReadings = new Map();
    this.rateLimitCounters = new Map();
  }

  /**
   * Save reading to remote store
   * @param {Object} record
   * @param {string} requesterId - Derived from authenticated session token
   * @returns {Promise<{ success: boolean, record: Object }>}
   */
  async saveReading(record, requesterId) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    if (record.ownerId !== requesterId) {
      throw new Error('403 Forbidden: Ownership mismatch (IDOR Protection)');
    }

    // Size check (< 2MB)
    const payloadStr = JSON.stringify(record);
    if (payloadStr.length > 2 * 1024 * 1024) {
      throw new Error('413 Payload Too Large: Reading payload exceeds 2MB limit');
    }

    // Biometric check
    if (payloadStr.includes('rawImage') || payloadStr.includes('cameraImage')) {
      throw new Error('400 Bad Request: Raw biometric imagery rejected by remote storage policy');
    }

    // Idempotency check
    const existing = this.remoteReadings.get(record.readingId);
    if (existing) {
      if (existing.contentHash === record.contentHash) {
        return { success: true, record: existing, isDuplicate: true };
      }
    }

    const cloned = JSON.parse(payloadStr);
    this.remoteReadings.set(record.readingId, cloned);
    return { success: true, record: cloned, isDuplicate: false };
  }

  /**
   * Get reading from remote store with ownership check
   * @param {string} readingId
   * @param {string} requesterId
   * @returns {Promise<Object>}
   */
  async getReading(readingId, requesterId) {
    const found = this.remoteReadings.get(readingId);
    if (!found) return null;

    if (found.ownerId !== requesterId) {
      throw new Error('403 Forbidden: You do not have permission to access this reading (IDOR Protection)');
    }

    return JSON.parse(JSON.stringify(found));
  }

  /**
   * Delete reading remotely
   */
  async deleteReading(readingId, requesterId) {
    const found = this.remoteReadings.get(readingId);
    if (!found) return false;

    if (found.ownerId !== requesterId) {
      throw new Error('403 Forbidden: Cannot delete reading owned by another account');
    }

    return this.remoteReadings.delete(readingId);
  }

  /**
   * List user readings from remote store
   */
  async listUserReadings(requesterId) {
    const list = Array.from(this.remoteReadings.values())
      .filter(r => r.ownerId === requesterId);
    return list.map(r => JSON.parse(JSON.stringify(r)));
  }

  clear() {
    this.remoteReadings.clear();
  }
}
