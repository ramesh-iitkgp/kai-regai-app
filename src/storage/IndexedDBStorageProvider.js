/**
 * Kai RegAI — IndexedDB Storage Provider
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Production browser storage provider:
 * - Versioned database: "KaiRegAI_DB" (v1)
 * - Structured object stores: readings, profiles, syncQueue, settings
 * - Indexed queries on ownerId, createdAt, readingMethod
 * - Transparent fallback to MemoryStorageProvider in Node/SSR/Private browsing
 */

import { StorageProvider } from './StorageProvider.js';
import { MemoryStorageProvider } from './MemoryStorageProvider.js';
import { ReadingRecord } from './ReadingSchema.js';

export class IndexedDBStorageProvider extends StorageProvider {
  constructor(options = {}) {
    super();
    this.dbName = options.dbName || 'KaiRegAI_DB';
    this.version = options.version || 2;
    this.db = null;
    this.fallback = null;
  }

  isIndexedDBAvailable() {
    return typeof globalThis !== 'undefined' &&
           typeof globalThis.indexedDB !== 'undefined' &&
           globalThis.indexedDB !== null;
  }

  async init() {
    if (!this.isIndexedDBAvailable()) {
      this.fallback = new MemoryStorageProvider();
      return this.fallback.init();
    }

    return new Promise((resolve, reject) => {
      try {
        const request = globalThis.indexedDB.open(this.dbName, this.version);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Readings Store
          if (!db.objectStoreNames.contains('readings')) {
            const readingsStore = db.createObjectStore('readings', { keyPath: 'readingId' });
            readingsStore.createIndex('ownerId', 'ownerId', { unique: false });
            readingsStore.createIndex('createdAt', 'createdAt', { unique: false });
            readingsStore.createIndex('readingMethod', 'readingMethod', { unique: false });
            readingsStore.createIndex('status', 'status', { unique: false });
          }

          // Profiles Store
          if (!db.objectStoreNames.contains('profiles')) {
            db.createObjectStore('profiles', { keyPath: 'profileId' });
          }

          // Sync Queue Store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'itemId' });
            syncStore.createIndex('status', 'status', { unique: false });
            syncStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          // Settings Store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }

          // Entitlements Store
          if (!db.objectStoreNames.contains('entitlements')) {
            const entStore = db.createObjectStore('entitlements', { keyPath: 'entitlementId' });
            entStore.createIndex('ownerId', 'ownerId', { unique: false });
            entStore.createIndex('readingId', 'readingId', { unique: false });
            entStore.createIndex('status', 'status', { unique: false });
          }

          // Transactions Store
          if (!db.objectStoreNames.contains('transactions')) {
            const txnStore = db.createObjectStore('transactions', { keyPath: 'transactionId' });
            txnStore.createIndex('ownerId', 'ownerId', { unique: false });
            txnStore.createIndex('status', 'status', { unique: false });
            txnStore.createIndex('idempotencyKey', 'idempotencyKey', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(true);
        };

        request.onerror = (event) => {
          // Fall back gracefully if IndexedDB access is blocked (e.g. strict private window)
          this.fallback = new MemoryStorageProvider();
          this.fallback.init().then(resolve).catch(reject);
        };
      } catch (err) {
        this.fallback = new MemoryStorageProvider();
        this.fallback.init().then(resolve).catch(reject);
      }
    });
  }

  _ensureBackend() {
    if (this.fallback) return this.fallback;
    if (!this.db || !this.isIndexedDBAvailable()) {
      if (!this.fallback) {
        this.fallback = new MemoryStorageProvider();
        this.fallback.init();
      }
      return this.fallback;
    }
    return null;
  }

  async saveReading(readingRecord) {
    const backend = this._ensureBackend();
    if (backend) return backend.saveReading(readingRecord);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('readings', 'readwrite');
      const store = tx.objectStore('readings');
      const serialized = readingRecord.toJSON ? readingRecord.toJSON() : readingRecord;
      const req = store.put(serialized);

      req.onsuccess = () => resolve(new ReadingRecord(serialized));
      req.onerror = () => reject(req.error);
    });
  }

  async getReading(readingId) {
    const backend = this._ensureBackend();
    if (backend) return backend.getReading(readingId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('readings', 'readonly');
      const store = tx.objectStore('readings');
      const req = store.get(readingId);

      req.onsuccess = () => {
        if (!req.result) resolve(null);
        else resolve(new ReadingRecord(req.result));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async listReadings(options = {}) {
    const backend = this._ensureBackend();
    if (backend) return backend.listReadings(options);
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

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('readings', 'readonly');
      const store = tx.objectStore('readings');
      const req = store.getAll();

      req.onsuccess = () => {
        let items = req.result || [];

        if (ownerId) items = items.filter(r => r.ownerId === ownerId);
        if (readingMethod) items = items.filter(r => r.readingMethod === readingMethod);
        if (reportTier) items = items.filter(r => r.reportTier === reportTier);
        if (typeof isFavorite === 'boolean') items = items.filter(r => r.metadata?.isFavorite === isFavorite);
        items = items.filter(r => r.status !== 'DELETED');

        items.sort((a, b) => {
          const valA = a[sortBy] || a.createdAt;
          const valB = b[sortBy] || b.createdAt;
          if (order === 'desc') return new Date(valB).getTime() - new Date(valA).getTime();
          return new Date(valA).getTime() - new Date(valB).getTime();
        });

        const total = items.length;
        const paginated = items.slice(offset, offset + limit);

        resolve({
          total,
          limit,
          offset,
          records: paginated.map(r => new ReadingRecord(r))
        });
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteReading(readingId) {
    const backend = this._ensureBackend();
    if (backend) return backend.deleteReading(readingId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('readings', 'readwrite');
      const store = tx.objectStore('readings');
      const req = store.delete(readingId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async saveProfile(profile) {
    const backend = this._ensureBackend();
    if (backend) return backend.saveProfile(profile);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const req = store.put(profile);

      req.onsuccess = () => resolve(profile);
      req.onerror = () => reject(req.error);
    });
  }

  async getProfile(profileId) {
    const backend = this._ensureBackend();
    if (backend) return backend.getProfile(profileId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const req = store.get(profileId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async enqueueSyncItem(item) {
    const backend = this._ensureBackend();
    if (backend) return backend.enqueueSyncItem(item);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const req = store.put(item);

      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async getSyncQueue() {
    const backend = this._ensureBackend();
    if (backend) return backend.getSyncQueue();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async updateSyncItem(itemId, update) {
    const backend = this._ensureBackend();
    if (backend) return backend.updateSyncItem(itemId, update);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const getReq = store.get(itemId);

      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) {
          resolve(null);
          return;
        }
        const merged = { ...existing, ...update };
        const putReq = store.put(merged);
        putReq.onsuccess = () => resolve(merged);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async deleteSyncItem(itemId) {
    const backend = this._ensureBackend();
    if (backend) return backend.deleteSyncItem(itemId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const req = store.delete(itemId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // Entitlements
  async saveEntitlement(entitlement) {
    const backend = this._ensureBackend();
    if (backend) return backend.saveEntitlement(entitlement);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('entitlements', 'readwrite');
      const store = tx.objectStore('entitlements');
      const serialized = entitlement.toJSON ? entitlement.toJSON() : entitlement;
      const req = store.put(serialized);
      req.onsuccess = () => resolve(serialized);
      req.onerror = () => reject(req.error);
    });
  }

  async getEntitlement(entitlementId) {
    const backend = this._ensureBackend();
    if (backend) return backend.getEntitlement(entitlementId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('entitlements', 'readonly');
      const store = tx.objectStore('entitlements');
      const req = store.get(entitlementId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async listEntitlements(options = {}) {
    const backend = this._ensureBackend();
    if (backend) return backend.listEntitlements(options);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('entitlements', 'readonly');
      const store = tx.objectStore('entitlements');
      const req = store.getAll();
      req.onsuccess = () => {
        let items = req.result || [];
        if (options.ownerId) {
          items = items.filter(e => e.ownerId === options.ownerId);
        }
        if (options.readingId) {
          items = items.filter(e => e.readingId === options.readingId || e.readingId === null);
        }
        if (options.status) {
          items = items.filter(e => e.status === options.status);
        }
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteEntitlement(entitlementId) {
    const backend = this._ensureBackend();
    if (backend) return backend.deleteEntitlement(entitlementId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('entitlements', 'readwrite');
      const store = tx.objectStore('entitlements');
      const req = store.delete(entitlementId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // Transactions
  async saveTransaction(transaction) {
    const backend = this._ensureBackend();
    if (backend) return backend.saveTransaction(transaction);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const serialized = transaction.toJSON ? transaction.toJSON() : transaction;
      const req = store.put(serialized);
      req.onsuccess = () => resolve(serialized);
      req.onerror = () => reject(req.error);
    });
  }

  async getTransaction(transactionId) {
    const backend = this._ensureBackend();
    if (backend) return backend.getTransaction(transactionId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const req = store.get(transactionId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async listTransactions(options = {}) {
    const backend = this._ensureBackend();
    if (backend) return backend.listTransactions(options);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const req = store.getAll();
      req.onsuccess = () => {
        let items = req.result || [];
        if (options.ownerId) {
          items = items.filter(t => t.ownerId === options.ownerId);
        }
        if (options.status) {
          items = items.filter(t => t.status === options.status);
        }
        if (options.productId) {
          items = items.filter(t => t.productId === options.productId);
        }
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async clearAll() {
    const backend = this._ensureBackend();
    if (backend) return backend.clearAll();
    return new Promise((resolve, reject) => {
      const storeNames = ['readings', 'profiles', 'syncQueue', 'settings'];
      if (this.db.objectStoreNames.contains('entitlements')) storeNames.push('entitlements');
      if (this.db.objectStoreNames.contains('transactions')) storeNames.push('transactions');
      const tx = this.db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}
