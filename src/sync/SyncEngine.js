/**
 * Kai RegAI — Sync Engine
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Coordinates client-to-cloud synchronization:
 * - Offline-first: Operates background queue without blocking UI
 * - Opt-in: Guest users remain 100% local by default; sync requires authenticated consent
 * - Conflict resolution: Content-hash idempotency prevents duplicate records
 */

import { SyncQueue, SYNC_STATUS } from './SyncQueue.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';

export class SyncEngine {
  constructor({ storageProvider, authProvider, remoteStore }) {
    this.storage = storageProvider;
    this.auth = authProvider;
    this.remote = remoteStore;
    this.queue = new SyncQueue(storageProvider);
    this.isSyncing = false;
  }

  /**
   * Request synchronization of a reading
   */
  async queueReading(readingId, action = 'UPLOAD') {
    const user = await this.auth.getCurrentUser();
    if (!user || user.ownerType === 'GUEST' || !user.preferences.cloudSyncEnabled) {
      // Guest or sync disabled: stay local
      return null;
    }

    return this.queue.enqueue({
      readingId,
      ownerId: user.ownerId,
      action
    });
  }

  /**
   * Process all pending items in sync queue
   * @returns {Promise<{ processed: number, succeeded: number, failed: number }>}
   */
  async processQueue() {
    if (this.isSyncing) return { processed: 0, succeeded: 0, failed: 0 };

    const user = await this.auth.getCurrentUser();
    if (!user || user.ownerType === 'GUEST' || !user.preferences.cloudSyncEnabled) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    reportTelemetry.logEvent('sync_started', { ownerId: user.ownerId });

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const items = await this.queue.getPendingItems();

      for (const item of items) {
        processed++;
        await this.queue.markItemStatus(item.itemId, SYNC_STATUS.UPLOADING);

        try {
          if (item.action === 'UPLOAD') {
            const reading = await this.storage.getReading(item.readingId);
            if (!reading) {
              await this.queue.removeItem(item.itemId);
              continue;
            }

            const res = await this.remote.saveReading(reading, user.ownerId);
            if (res.success) {
              await this.queue.markItemStatus(item.itemId, SYNC_STATUS.SYNCED);
              await this.queue.removeItem(item.itemId);
              succeeded++;
            }
          } else if (item.action === 'DELETE') {
            await this.remote.deleteReading(item.readingId, user.ownerId);
            await this.queue.markItemStatus(item.itemId, SYNC_STATUS.SYNCED);
            await this.queue.removeItem(item.itemId);
            succeeded++;
          }
        } catch (err) {
          failed++;
          await this.queue.markItemStatus(item.itemId, SYNC_STATUS.FAILED, err.message);
        }
      }

      reportTelemetry.logEvent('sync_completed', { processed, succeeded, failed });
    } catch (err) {
      reportTelemetry.logEvent('sync_failed', { error: err.message });
    } finally {
      this.isSyncing = false;
    }

    return { processed, succeeded, failed };
  }
}
