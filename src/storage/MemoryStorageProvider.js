/**
 * Kai RegAI — In-Memory Storage Provider
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * In-memory storage implementation:
 * - High-speed, deterministic execution for test suites & Node CI
 * - Ephemeral fallback when IndexedDB or persistent storage is unavailable
 * - Enforces record cloning to prevent accidental reference mutations
 */

import { StorageProvider } from './StorageProvider.js';
import { ReadingRecord } from './ReadingSchema.js';

export class MemoryStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.readings = new Map();
    this.profiles = new Map();
    this.syncQueue = new Map();
    this.settings = new Map();
    this.initialized = false;
  }

  async init() {
    this.initialized = true;
    return true;
  }

  async saveReading(readingRecord) {
    if (!readingRecord?.readingId) {
      throw new Error('saveReading requires readingRecord with readingId');
    }
    // Clone record deep copy to simulate true storage isolation
    const cloned = JSON.parse(JSON.stringify(readingRecord));
    this.readings.set(readingRecord.readingId, cloned);
    return new ReadingRecord(cloned);
  }

  async getReading(readingId) {
    const raw = this.readings.get(readingId);
    if (!raw) return null;
    return new ReadingRecord(JSON.parse(JSON.stringify(raw)));
  }

  async listReadings(options = {}) {
    const {
      ownerId,
      readingMethod,
      reportTier,
      isFavorite,
      sortBy = 'createdAt',
      order = 'desc',
      limit = 50,
      offset = 0
    } = options;

    let items = Array.from(this.readings.values());

    // Filtering
    if (ownerId) {
      items = items.filter(r => r.ownerId === ownerId);
    }
    if (readingMethod) {
      items = items.filter(r => r.readingMethod === readingMethod);
    }
    if (reportTier) {
      items = items.filter(r => r.reportTier === reportTier);
    }
    if (typeof isFavorite === 'boolean') {
      items = items.filter(r => r.metadata?.isFavorite === isFavorite);
    }

    // Exclude soft-deleted records by default
    items = items.filter(r => r.status !== 'DELETED');

    // Sorting
    items.sort((a, b) => {
      const valA = a[sortBy] || a.createdAt;
      const valB = b[sortBy] || b.createdAt;
      if (order === 'desc') {
        return new Date(valB).getTime() - new Date(valA).getTime();
      }
      return new Date(valA).getTime() - new Date(valB).getTime();
    });

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      records: paginated.map(r => new ReadingRecord(JSON.parse(JSON.stringify(r))))
    };
  }

  async deleteReading(readingId) {
    return this.readings.delete(readingId);
  }

  async saveProfile(profile) {
    if (!profile?.profileId) throw new Error('saveProfile requires profileId');
    const cloned = JSON.parse(JSON.stringify(profile));
    this.profiles.set(profile.profileId, cloned);
    return cloned;
  }

  async getProfile(profileId) {
    const p = this.profiles.get(profileId);
    return p ? JSON.parse(JSON.stringify(p)) : null;
  }

  async enqueueSyncItem(item) {
    if (!item?.itemId) throw new Error('enqueueSyncItem requires itemId');
    this.syncQueue.set(item.itemId, JSON.parse(JSON.stringify(item)));
    return item;
  }

  async getSyncQueue() {
    return Array.from(this.syncQueue.values()).map(i => JSON.parse(JSON.stringify(i)));
  }

  async updateSyncItem(itemId, update) {
    const existing = this.syncQueue.get(itemId);
    if (!existing) return null;
    const merged = { ...existing, ...update };
    this.syncQueue.set(itemId, merged);
    return merged;
  }

  async deleteSyncItem(itemId) {
    return this.syncQueue.delete(itemId);
  }

  async clearAll() {
    this.readings.clear();
    this.profiles.clear();
    this.syncQueue.clear();
    this.settings.clear();
    return true;
  }
}
