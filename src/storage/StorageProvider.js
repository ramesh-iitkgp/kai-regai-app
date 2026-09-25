/**
 * Kai RegAI — Base Storage Provider Interface
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Abstract contract decoupled from specific storage backends:
 * (Memory, IndexedDB, SQLite, etc.)
 */

export class StorageProvider {
  async init() {
    throw new Error('StorageProvider.init() must be implemented by subclass');
  }

  // Reading Records
  async saveReading(readingRecord) {
    throw new Error('saveReading() not implemented');
  }

  async getReading(readingId) {
    throw new Error('getReading() not implemented');
  }

  async listReadings(options = {}) {
    throw new Error('listReadings() not implemented');
  }

  async deleteReading(readingId) {
    throw new Error('deleteReading() not implemented');
  }

  // User Profile
  async saveProfile(profile) {
    throw new Error('saveProfile() not implemented');
  }

  async getProfile(profileId) {
    throw new Error('getProfile() not implemented');
  }

  // Sync Queue
  async enqueueSyncItem(item) {
    throw new Error('enqueueSyncItem() not implemented');
  }

  async getSyncQueue() {
    throw new Error('getSyncQueue() not implemented');
  }

  async updateSyncItem(itemId, update) {
    throw new Error('updateSyncItem() not implemented');
  }

  async deleteSyncItem(itemId) {
    throw new Error('deleteSyncItem() not implemented');
  }

  // Entitlements
  async saveEntitlement(entitlement) {
    throw new Error('saveEntitlement() not implemented');
  }

  async getEntitlement(entitlementId) {
    throw new Error('getEntitlement() not implemented');
  }

  async listEntitlements(options = {}) {
    throw new Error('listEntitlements() not implemented');
  }

  async deleteEntitlement(entitlementId) {
    throw new Error('deleteEntitlement() not implemented');
  }

  // Transactions
  async saveTransaction(transaction) {
    throw new Error('saveTransaction() not implemented');
  }

  async getTransaction(transactionId) {
    throw new Error('getTransaction() not implemented');
  }

  async listTransactions(options = {}) {
    throw new Error('listTransactions() not implemented');
  }

  // Complete Local Purge
  async clearAll() {
    throw new Error('clearAll() not implemented');
  }
}
