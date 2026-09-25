/**
 * Kai RegAI — Master Entitlement & Monetization Service
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * High-level commercial orchestrator:
 * - Coordinates payment provider, access policy, product catalog, and secure storage
 * - Enforces: "PAYMENT GRANTS ENTITLEMENT. ENTITLEMENT GRANTS ACCESS."
 * - Client UI is NEVER the authority for access decisions
 * - IDOR protection on reading and entitlement boundaries
 * - Atomic guest-to-account entitlement migration
 * - Non-destructive refund handling (ReadingRecord is never deleted on refund)
 */

import { defaultStorageProvider } from '../storage/index.js';
import { defaultAuthProvider } from '../auth/index.js';
import { defaultPaymentProvider } from './MockPaymentProvider.js';
import { defaultProductCatalog } from './ProductCatalog.js';
import { defaultAccessPolicy } from './AccessPolicy.js';
import { Entitlement, EntitlementSchemaValidator } from './EntitlementSchema.js';
import { EntitlementStateMachine } from './EntitlementStateMachine.js';
import { Transaction, TransactionSchemaValidator } from './TransactionSchema.js';
import { TransactionStateMachine } from './TransactionStateMachine.js';
import { 
  ACCESS_DECISION, 
  ENTITLEMENT_STATUS, 
  ENTITLEMENT_SOURCE, 
  TRANSACTION_STATUS, 
  PRODUCT_TIERS 
} from './types.js';

export class EntitlementService {
  constructor(options = {}) {
    this.storage = options.storageProvider || defaultStorageProvider;
    this.auth = options.authProvider || defaultAuthProvider;
    this.payment = options.paymentProvider || defaultPaymentProvider;
    this.catalog = options.productCatalog || defaultProductCatalog;
    this.accessPolicy = options.accessPolicy || defaultAccessPolicy;
  }

  async init() {
    await this.storage.init();
    await this.auth.init();
    await this.payment.init();
    return true;
  }

  /**
   * Evaluate whether the current user can access a feature for a reading
   * @param {string} readingId 
   * @param {string} featureKey 
   * @returns {Promise<boolean>}
   */
  async canAccess(readingId, featureKey) {
    const user = await this.auth.getCurrentUser();
    const entitlements = await this.getEntitlements(user.ownerId);

    return this.accessPolicy.canAccess({
      featureKey,
      ownerId: user.ownerId,
      readingId,
      entitlements
    });
  }

  /**
   * Detailed authoritative access evaluation
   * @param {string} readingId 
   * @param {string} featureKey 
   * @returns {Promise<Object>}
   */
  async evaluateAccess(readingId, featureKey) {
    const user = await this.auth.getCurrentUser();
    const entitlements = await this.getEntitlements(user.ownerId);

    return this.accessPolicy.evaluate({
      featureKey,
      ownerId: user.ownerId,
      readingId,
      entitlements
    });
  }

  /**
   * Retrieve all entitlements owned by an identity
   * @param {string} ownerId 
   * @returns {Promise<Entitlement[]>}
   */
  async getEntitlements(ownerId) {
    const rawList = await this.storage.listEntitlements({ ownerId });
    return (rawList || []).map(raw => new Entitlement(raw));
  }

  /**
   * Retrieve entitlements specifically granting access to a reading
   * @param {string} readingId 
   * @returns {Promise<Entitlement[]>}
   */
  async getReadingEntitlements(readingId) {
    const rawList = await this.storage.listEntitlements({ readingId });
    return (rawList || []).map(raw => new Entitlement(raw));
  }

  /**
   * Execute commercial purchase for a product
   * @param {Object} params
   * @param {string} params.productId
   * @param {string} [params.readingId]
   * @param {string} [params.currency='INR']
   * @param {string} [params.idempotencyKey]
   * @param {Object} [params.metadata]
   * @returns {Promise<{ transaction: Transaction, entitlement: Entitlement|null, success: boolean, error?: string }>}
   */
  async purchaseProduct({ productId, readingId = null, currency = 'INR', idempotencyKey = null, metadata = {} }) {
    const product = this.catalog.getProduct(productId);
    if (!product) {
      throw new Error(`Invalid productId '${productId}'`);
    }

    if (!product.active) {
      throw new Error(`Product '${productId}' is not currently active`);
    }

    const user = await this.auth.getCurrentUser();
    const priceConfig = this.catalog.getPrice(productId, currency);

    // 1. Check idempotency: if this exact transaction was already processed
    if (idempotencyKey) {
      const existingTxns = await this.storage.listTransactions({ ownerId: user.ownerId });
      const dup = existingTxns.find(t => t.idempotencyKey === idempotencyKey);
      if (dup && dup.status === TRANSACTION_STATUS.VERIFIED) {
        const ents = await this.storage.listEntitlements({ ownerId: user.ownerId });
        const matchedEnt = ents.find(e => e.transactionId === dup.transactionId);
        return {
          transaction: new Transaction(dup),
          entitlement: matchedEnt ? new Entitlement(matchedEnt) : null,
          success: true,
          isDuplicate: true
        };
      }
    }

    // 2. Initiate payment via provider abstraction
    const transaction = await this.payment.createPurchase({
      productId,
      ownerId: user.ownerId,
      readingId,
      amount: priceConfig ? priceConfig.amount : 0,
      currency,
      idempotencyKey,
      metadata
    });

    // 3. Validate and persist transaction
    const txnValidation = await TransactionSchemaValidator.validate(transaction);
    if (!txnValidation.valid) {
      throw new Error(`Transaction schema validation failed: ${txnValidation.errors.join('; ')}`);
    }
    await this.storage.saveTransaction(transaction);

    // 4. If transaction is verified, authoritatively grant entitlement
    let grantedEntitlement = null;
    if (transaction.isVerified()) {
      grantedEntitlement = await this._grantEntitlementForTransaction(transaction, product);
    } else if (transaction.status === TRANSACTION_STATUS.PENDING) {
      grantedEntitlement = await this._createPendingEntitlement(transaction, product);
    }

    return {
      transaction,
      entitlement: grantedEntitlement,
      success: transaction.isVerified()
    };
  }

  /**
   * Internal helper to create a pending entitlement
   */
  async _createPendingEntitlement(transaction, product) {
    const entitlement = new Entitlement({
      ownerId: transaction.ownerId,
      readingId: transaction.readingId,
      productId: product.productId,
      tier: product.tier,
      features: product.entitlements,
      status: ENTITLEMENT_STATUS.PENDING,
      source: ENTITLEMENT_SOURCE.PURCHASE,
      transactionId: transaction.transactionId,
      grantedAt: new Date().toISOString(),
      metadata: {
        amount: transaction.amount,
        currency: transaction.currency
      }
    });

    await this.storage.saveEntitlement(entitlement);
    return entitlement;
  }

  /**
   * Verify a pending transaction
   * @param {string} transactionId 
   * @param {Object} [verificationPayload] 
   * @returns {Promise<{ verified: boolean, transaction: Transaction, entitlement: Entitlement|null }>}
   */
  async verifyPurchase(transactionId, verificationPayload = {}) {
    const verification = await this.payment.verifyTransaction(transactionId, verificationPayload);
    if (!verification.verified) {
      return { verified: false, transaction: verification.transaction, entitlement: null };
    }

    const txn = verification.transaction;
    await this.storage.saveTransaction(txn);

    const product = this.catalog.getProduct(txn.productId);

    // If pending entitlement exists for this transaction, transition it to ACTIVE
    const existingEnts = await this.storage.listEntitlements({ ownerId: txn.ownerId });
    const pendingEnt = existingEnts.find(e => e.transactionId === txn.transactionId);
    let entitlement;
    if (pendingEnt) {
      entitlement = new Entitlement(pendingEnt);
      EntitlementStateMachine.transition(entitlement, ENTITLEMENT_STATUS.ACTIVE, 'Transaction verified');
      await this.storage.saveEntitlement(entitlement);
    } else {
      entitlement = await this._grantEntitlementForTransaction(txn, product);
    }

    return {
      verified: true,
      transaction: txn,
      entitlement
    };
  }

  /**
   * Internal helper to grant entitlement following a verified transaction
   */
  async _grantEntitlementForTransaction(transaction, product) {
    // Check if entitlement already exists for this transaction (idempotency)
    const existingEnts = await this.storage.listEntitlements({ ownerId: transaction.ownerId });
    const duplicate = existingEnts.find(e => e.transactionId === transaction.transactionId);
    if (duplicate) {
      return new Entitlement(duplicate);
    }

    // Compute expiration if subscription
    let expiresAt = null;
    if (product.metadata?.isSubscription && product.metadata?.durationMonths) {
      const d = new Date();
      d.setMonth(d.getMonth() + product.metadata.durationMonths);
      expiresAt = d.toISOString();
    }

    const entitlement = new Entitlement({
      ownerId: transaction.ownerId,
      readingId: transaction.readingId,
      productId: product.productId,
      tier: product.tier,
      features: product.entitlements,
      status: ENTITLEMENT_STATUS.ACTIVE,
      source: ENTITLEMENT_SOURCE.PURCHASE,
      transactionId: transaction.transactionId,
      grantedAt: new Date().toISOString(),
      expiresAt,
      metadata: {
        amount: transaction.amount,
        currency: transaction.currency
      }
    });

    const validation = await EntitlementSchemaValidator.validate(entitlement);
    if (!validation.valid) {
      throw new Error(`Entitlement validation failed: ${validation.errors.join('; ')}`);
    }

    await this.storage.saveEntitlement(entitlement);
    return entitlement;
  }

  /**
   * Restore purchases for user from provider records
   * @param {string} [ownerId]
   * @returns {Promise<{ restoredCount: number, entitlements: Entitlement[] }>}
   */
  async restorePurchases(ownerId = null) {
    const user = await this.auth.getCurrentUser();
    const targetOwnerId = ownerId || user.ownerId;

    const restoredTxns = await this.payment.restorePurchases(targetOwnerId);
    const restoredEntitlements = [];

    for (const txn of restoredTxns) {
      await this.storage.saveTransaction(txn);
      const product = this.catalog.getProduct(txn.productId);
      if (product) {
        const ent = await this._grantEntitlementForTransaction(txn, product);
        restoredEntitlements.push(ent);
      }
    }

    return {
      restoredCount: restoredEntitlements.length,
      entitlements: restoredEntitlements
    };
  }

  /**
   * Refund a transaction and revoke corresponding entitlement
   * CRITICAL INVARIANT: The ReadingRecord is NOT deleted!
   * @param {string} transactionId 
   * @param {string} [reason] 
   * @returns {Promise<{ transaction: Transaction, entitlement: Entitlement|null }>}
   */
  async refundTransaction(transactionId, reason = 'Customer refund request') {
    const txnRaw = await this.storage.getTransaction(transactionId);
    if (!txnRaw) throw new Error(`Transaction '${transactionId}' not found`);

    const txn = new Transaction(txnRaw);
    TransactionStateMachine.transition(txn, TRANSACTION_STATUS.REFUNDED, reason);
    await this.storage.saveTransaction(txn);

    // Revoke matching entitlement
    const ents = await this.storage.listEntitlements({ ownerId: txn.ownerId });
    const matchingEnt = ents.find(e => e.transactionId === transactionId);

    let updatedEnt = null;
    if (matchingEnt) {
      const ent = new Entitlement(matchingEnt);
      EntitlementStateMachine.transition(ent, ENTITLEMENT_STATUS.REFUNDED, reason);
      await this.storage.saveEntitlement(ent);
      updatedEnt = ent;
    }

    return {
      transaction: txn,
      entitlement: updatedEnt
    };
  }

  /**
   * Grant promotional or administrative entitlement (Auditable)
   * @param {Object} params
   * @returns {Promise<Entitlement>}
   */
  async grantPromotionalEntitlement({ ownerId, readingId = null, productId = 'kai_premium', reason = 'Promotional Grant', expiresAt = null }) {
    const product = this.catalog.getProduct(productId);
    if (!product) throw new Error(`Product '${productId}' not found`);

    const entitlement = new Entitlement({
      ownerId,
      readingId,
      productId,
      tier: product.tier,
      features: product.entitlements,
      status: ENTITLEMENT_STATUS.ACTIVE,
      source: ENTITLEMENT_SOURCE.PROMOTIONAL,
      grantedAt: new Date().toISOString(),
      expiresAt,
      metadata: { grantReason: reason }
    });

    const validation = await EntitlementSchemaValidator.validate(entitlement);
    if (!validation.valid) throw new Error(`Promotional entitlement validation failed: ${validation.errors.join('; ')}`);

    await this.storage.saveEntitlement(entitlement);
    return entitlement;
  }

  /**
   * Revoke an entitlement
   * @param {string} entitlementId 
   * @param {string} [reason]
   * @returns {Promise<Entitlement>}
   */
  async revokeEntitlement(entitlementId, reason = 'Administrative revocation') {
    const raw = await this.storage.getEntitlement(entitlementId);
    if (!raw) throw new Error(`Entitlement '${entitlementId}' not found`);

    const ent = new Entitlement(raw);
    EntitlementStateMachine.transition(ent, ENTITLEMENT_STATUS.REVOKED, reason);
    await this.storage.saveEntitlement(ent);
    return ent;
  }

  /**
   * Atomically reassign all guest entitlements and transactions to upgraded user account
   * @param {string} guestId 
   * @param {string} newOwnerId 
   * @returns {Promise<{ migratedEntitlements: number, migratedTransactions: number }>}
   */
  async migrateGuestEntitlements(guestId, newOwnerId) {
    if (!guestId || !newOwnerId) throw new Error('migrateGuestEntitlements requires guestId and newOwnerId');
    if (guestId === newOwnerId) return { migratedEntitlements: 0, migratedTransactions: 0 };

    const guestEnts = await this.storage.listEntitlements({ ownerId: guestId });
    let entCount = 0;
    for (const raw of guestEnts) {
      const ent = new Entitlement({
        ...raw,
        ownerId: newOwnerId,
        metadata: {
          ...raw.metadata,
          migratedFromGuestId: guestId,
          migratedAt: new Date().toISOString()
        }
      });
      await this.storage.saveEntitlement(ent);
      entCount++;
    }

    const guestTxns = await this.storage.listTransactions({ ownerId: guestId });
    let txnCount = 0;
    for (const raw of guestTxns) {
      const txn = new Transaction({
        ...raw,
        ownerId: newOwnerId,
        metadata: {
          ...raw.metadata,
          migratedFromGuestId: guestId,
          migratedAt: new Date().toISOString()
        }
      });
      await this.storage.saveTransaction(txn);
      txnCount++;
    }

    return {
      migratedEntitlements: entCount,
      migratedTransactions: txnCount
    };
  }

  /**
   * Produce a gated report presentation model without mutating the underlying ReportModel
   * @param {import('../report/ReportSchema.js').ReportModel} reportModel 
   * @returns {Promise<Object>}
   */
  async getReportAccessView(reportModel) {
    const user = await this.auth.getCurrentUser();
    const entitlements = await this.getEntitlements(user.ownerId);

    return this.accessPolicy.filterReport(reportModel, {
      ownerId: user.ownerId,
      readingId: reportModel.reportId,
      entitlements
    });
  }
}

export const defaultEntitlementService = new EntitlementService();
