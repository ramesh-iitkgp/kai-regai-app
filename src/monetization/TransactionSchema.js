/**
 * Kai RegAI — Financial Transaction Contract & Schema Validation
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Formal data contract recording commercial financial transactions:
 * - Records WHAT happened commercially/financially
 * - Provider agnostic (Apple, Google, Stripe, Mock)
 * - Strict security: zero card numbers, CVVs, or bank credentials stored
 * - Versioned schema ("1.0.0")
 */

import { TRANSACTION_STATUS, PAYMENT_PROVIDERS, CURRENCIES } from './types.js';

export const TRANSACTION_SCHEMA_VERSION = '1.0.0';

export class Transaction {
  constructor(data = {}) {
    this.schemaVersion = data.schemaVersion || TRANSACTION_SCHEMA_VERSION;
    this.transactionId = data.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.provider = data.provider || PAYMENT_PROVIDERS.MOCK;
    this.providerTransactionId = data.providerTransactionId || null;
    this.productId = data.productId || 'kai_standard';
    this.ownerId = data.ownerId || 'GUEST';
    this.readingId = data.readingId || null;
    this.amount = typeof data.amount === 'number' ? data.amount : 0;
    this.currency = data.currency || CURRENCIES.INR;
    this.status = data.status || TRANSACTION_STATUS.INITIATED;
    this.purchasedAt = data.purchasedAt || new Date().toISOString();
    this.verifiedAt = data.verifiedAt || null;
    this.idempotencyKey = data.idempotencyKey || `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.metadata = typeof data.metadata === 'object' && data.metadata !== null ? { ...data.metadata } : {};
  }

  isVerified() {
    return this.status === TRANSACTION_STATUS.VERIFIED;
  }

  toJSON() {
    return {
      schemaVersion: this.schemaVersion,
      transactionId: this.transactionId,
      provider: this.provider,
      providerTransactionId: this.providerTransactionId,
      productId: this.productId,
      ownerId: this.ownerId,
      readingId: this.readingId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      purchasedAt: this.purchasedAt,
      verifiedAt: this.verifiedAt,
      idempotencyKey: this.idempotencyKey,
      metadata: this.metadata
    };
  }
}

export class TransactionSchemaValidator {
  /**
   * Validate a Transaction instance or plain object
   * @param {Transaction|Object} txn 
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  static async validate(txn) {
    const errors = [];

    if (!txn || typeof txn !== 'object') {
      return { valid: false, errors: ['Transaction must be a non-null object'] };
    }

    if (txn.schemaVersion !== TRANSACTION_SCHEMA_VERSION) {
      errors.push(`Unsupported transaction schemaVersion: '${txn.schemaVersion}'`);
    }

    if (!txn.transactionId || typeof txn.transactionId !== 'string') {
      errors.push('Missing or invalid transactionId');
    }

    if (!txn.ownerId || typeof txn.ownerId !== 'string') {
      errors.push('Missing or invalid ownerId');
    }

    if (!txn.productId || typeof txn.productId !== 'string') {
      errors.push('Missing or invalid productId');
    }

    if (!Object.values(PAYMENT_PROVIDERS).includes(txn.provider)) {
      errors.push(`Invalid payment provider '${txn.provider}'`);
    }

    if (!Object.values(TRANSACTION_STATUS).includes(txn.status)) {
      errors.push(`Invalid transaction status '${txn.status}'`);
    }

    if (!Object.values(CURRENCIES).includes(txn.currency)) {
      errors.push(`Invalid currency '${txn.currency}'`);
    }

    if (typeof txn.amount !== 'number' || isNaN(txn.amount) || txn.amount < 0) {
      errors.push('Amount must be a non-negative number');
    }

    // Critical PCI-DSS & Biometric Privacy Rule
    const serialized = JSON.stringify(txn);
    const forbiddenPatterns = [
      /cardNumber/i,
      /creditCard/i,
      /\bcvv\b/i,
      /\bcvc\b/i,
      /password/i,
      /secret/i,
      /rawImage/i,
      /cameraFrame/i,
      /imageBuffer/i
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(serialized)) {
        errors.push(`Security/Privacy Violation: sensitive data pattern ${pattern.toString()} detected in Transaction payload`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
