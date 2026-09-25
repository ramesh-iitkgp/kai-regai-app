/**
 * Kai RegAI — Offline-First Sync Queue
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Manages outgoing sync actions with bounded retry and explicit lifecycle states:
 * - PENDING, UPLOADING, SYNCED, FAILED, RETRY, DELETED
 * - Non-blocking: network offline never prevents local reading saves
 */

export const SYNC_STATUS = {
  PENDING: 'PENDING',
  UPLOADING: 'UPLOADING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
  RETRY: 'RETRY',
  DELETED: 'DELETED'
};

export class SyncQueue {
  constructor(storageProvider) {
    this.storage = storageProvider;
    this.maxAttempts = 3;
  }

  /**
   * Enqueue a reading for remote synchronization
   * @param {Object} params
   * @param {string} params.readingId
   * @param {string} params.ownerId
   * @param {'UPLOAD' | 'DELETE'} [params.action='UPLOAD']
   * @returns {Promise<Object>}
   */
  async enqueue({ readingId, ownerId, action = 'UPLOAD' }) {
    const itemId = `SYNC-${readingId}`;
    const item = {
      itemId,
      readingId,
      ownerId,
      action,
      status: SYNC_STATUS.PENDING,
      attempts: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.storage) {
      await this.storage.enqueueSyncItem(item);
    }
    return item;
  }

  /**
   * Fetch all pending or retryable sync items
   * @returns {Promise<Object[]>}
   */
  async getPendingItems() {
    if (!this.storage) return [];
    const all = await this.storage.getSyncQueue();
    return all.filter(item => 
      item.status === SYNC_STATUS.PENDING || 
      (item.status === SYNC_STATUS.RETRY && item.attempts < this.maxAttempts)
    );
  }

  /**
   * Record outcome of sync attempt
   */
  async markItemStatus(itemId, status, errorMsg = null) {
    if (!this.storage) return null;
    const existingList = await this.storage.getSyncQueue();
    const existing = existingList.find(i => i.itemId === itemId);
    if (!existing) return null;

    const attempts = existing.attempts + 1;
    const finalStatus = (status === SYNC_STATUS.FAILED && attempts < this.maxAttempts)
      ? SYNC_STATUS.RETRY
      : status;

    return this.storage.updateSyncItem(itemId, {
      status: finalStatus,
      attempts,
      lastError: errorMsg,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Remove item once successfully synced or discarded
   */
  async removeItem(itemId) {
    if (this.storage) {
      return this.storage.deleteSyncItem(itemId);
    }
    return true;
  }
}
