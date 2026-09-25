/**
 * Kai RegAI — Payment Provider Base Interface
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Abstract contract decoupling commercial transactions from specific payment rails:
 * (Apple StoreKit 2, Google Play Billing, Stripe, Mock)
 */

export class PaymentProvider {
  /**
   * Initialize provider SDK / connections
   */
  async init() {
    throw new Error('PaymentProvider.init() must be implemented by subclass');
  }

  /**
   * Initiate a purchase flow
   * @param {Object} purchaseIntent
   * @param {string} purchaseIntent.productId
   * @param {string} purchaseIntent.ownerId
   * @param {string} [purchaseIntent.readingId]
   * @param {string} [purchaseIntent.currency]
   * @param {number} [purchaseIntent.amount]
   * @returns {Promise<import('./TransactionSchema.js').Transaction>}
   */
  async createPurchase(purchaseIntent) {
    throw new Error('createPurchase() must be implemented by subclass');
  }

  /**
   * Query status of an existing transaction
   * @param {string} transactionId 
   * @returns {Promise<import('./TransactionSchema.js').Transaction>}
   */
  async getTransactionStatus(transactionId) {
    throw new Error('getTransactionStatus() must be implemented by subclass');
  }

  /**
   * Authoritatively verify a transaction receipt/token
   * @param {string} transactionId 
   * @param {Object} verificationPayload 
   * @returns {Promise<{ verified: boolean, transaction: import('./TransactionSchema.js').Transaction, error?: string }>}
   */
  async verifyTransaction(transactionId, verificationPayload = {}) {
    throw new Error('verifyTransaction() must be implemented by subclass');
  }

  /**
   * Restore previous purchases for an owner
   * @param {string} ownerId 
   * @returns {Promise<import('./TransactionSchema.js').Transaction[]>}
   */
  async restorePurchases(ownerId) {
    throw new Error('restorePurchases() must be implemented by subclass');
  }

  /**
   * Handle server-side webhook notification
   * @param {Object} payload 
   * @param {string} signature 
   * @returns {Promise<{ handled: boolean, eventType: string }>}
   */
  async handleWebhook(payload, signature) {
    throw new Error('handleWebhook() must be implemented by subclass');
  }
}
