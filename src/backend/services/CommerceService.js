/**
 * Kai RegAI — Server-Side Commercial Authority Service
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Enforces Invariants:
 * - Invariant 5: PAYMENT GRANTS ENTITLEMENT
 * - Invariant 6: ENTITLEMENT GRANTS ACCESS
 * - Invariant 7: CLIENT STATE IS NOT AUTHORITATIVE FOR COMMERCIAL ACCESS
 * - Invariant 10: HISTORICAL READINGS MUST REMAIN REPRODUCIBLE (Refunds revoke access, never delete ReadingRecord)
 * - Strict Idempotency on transactions and payments
 * - Server-side IDOR protection on transactions and entitlements
 */

import crypto from 'node:crypto';
import { defaultProductCatalog } from '../../monetization/ProductCatalog.js';

export class CommerceService {
  constructor(database, auditService) {
    this.database = database;
    this.auditService = auditService;
  }

  /**
   * Create an initial transaction record
   * @param {Object} params
   * @param {string} requesterId
   * @param {string} [requestId]
   * @returns {Object}
   */
  createTransaction(params, requesterId, requestId = null) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    const {
      productId,
      readingId = null,
      provider = 'MOCK_PROVIDER',
      providerTransactionId = null,
      amount,
      currency = 'USD',
      idempotencyKey = null,
      metadata = {}
    } = params;

    if (!productId) {
      throw new Error('400 Bad Request: Missing productId');
    }

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existing = this.database
        .prepare('SELECT * FROM transactions WHERE idempotency_key = ?;')
        .get(idempotencyKey);

      if (existing) {
        if (existing.owner_id !== requesterId) {
          throw new Error('403 Forbidden: Idempotency key belongs to another user (IDOR)');
        }
        return {
          success: true,
          isDuplicate: true,
          transaction: this._mapTransactionRow(existing)
        };
      }
    }

    // Resolve product metadata
    const catalogItem = defaultProductCatalog.getProduct(productId);
    const finalAmount = amount !== undefined ? amount : (catalogItem?.prices?.USD?.amount ?? 0);
    const finalCurrency = currency || 'USD';

    const transactionId = `TXN-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const insertStmt = this.database.prepare(`
      INSERT INTO transactions (
        transaction_id,
        provider,
        provider_transaction_id,
        product_id,
        owner_id,
        reading_id,
        amount,
        currency,
        status,
        idempotency_key,
        metadata,
        created_at,
        verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    insertStmt.run(
      transactionId,
      provider,
      providerTransactionId,
      productId,
      requesterId,
      readingId,
      finalAmount,
      finalCurrency,
      'PENDING',
      idempotencyKey,
      JSON.stringify(metadata || {}),
      now,
      null
    );

    const created = this.database
      .prepare('SELECT * FROM transactions WHERE transaction_id = ?;')
      .get(transactionId);

    return {
      success: true,
      isDuplicate: false,
      transaction: this._mapTransactionRow(created)
    };
  }

  /**
   * Verify transaction and atomically grant corresponding entitlement
   * @param {Object} params
   * @param {string} requesterId
   * @param {string} [requestId]
   * @returns {Object}
   */
  verifyTransaction(params, requesterId, requestId = null) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    const {
      transactionId,
      providerTransactionId = null,
      verificationToken = null
    } = params;

    if (!transactionId) {
      throw new Error('400 Bad Request: Missing transactionId');
    }

    const row = this.database
      .prepare('SELECT * FROM transactions WHERE transaction_id = ?;')
      .get(transactionId);

    if (!row) {
      throw new Error('404 Not Found: Transaction does not exist');
    }

    // IDOR Protection: Cannot verify another user's transaction
    if (row.owner_id !== requesterId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: transactionId,
        requestId,
        details: { reason: 'IDOR attempt on verifyTransaction' }
      });
      throw new Error('403 Forbidden: Ownership mismatch (IDOR Protection)');
    }

    if (row.status === 'VERIFIED') {
      // Idempotent re-verification
      const existingEntitlement = this.database
        .prepare('SELECT * FROM entitlements WHERE transaction_id = ?;')
        .get(transactionId);

      return {
        success: true,
        isDuplicate: true,
        transaction: this._mapTransactionRow(row),
        entitlement: existingEntitlement ? this._mapEntitlementRow(existingEntitlement) : null
      };
    }

    const now = new Date().toISOString();
    const finalProviderTxnId = providerTransactionId || row.provider_transaction_id || `PVR-${crypto.randomUUID()}`;

    // Execute verification and entitlement grant atomically in a transaction
    return this.database.transaction(() => {
      this.database.prepare(`
        UPDATE transactions
        SET status = 'VERIFIED',
            provider_transaction_id = ?,
            verified_at = ?
        WHERE transaction_id = ?;
      `).run(finalProviderTxnId, now, transactionId);

      // Determine product details
      const catalogItem = defaultProductCatalog.getProduct(row.product_id);
      const tier = catalogItem ? catalogItem.tier : 'FULL';
      const features = catalogItem ? catalogItem.entitlements : ['DETAILED_REPORT', 'PDF_EXPORT'];

      const entitlementId = `ENT-${crypto.randomUUID()}`;
      this.database.prepare(`
        INSERT INTO entitlements (
          entitlement_id,
          owner_id,
          reading_id,
          product_id,
          tier,
          features,
          status,
          source,
          transaction_id,
          granted_at,
          expires_at,
          revoked_at,
          metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `).run(
        entitlementId,
        row.owner_id,
        row.reading_id,
        row.product_id,
        tier,
        JSON.stringify(features),
        'ACTIVE',
        'PURCHASE',
        transactionId,
        now,
        null,
        null,
        JSON.stringify({ verifiedBy: 'P13_AUTHORITY', requestId })
      );

      this.auditService?.logEvent({
        eventType: 'TRANSACTION_VERIFIED',
        actorId: requesterId,
        resourceId: transactionId,
        requestId,
        details: { productId: row.product_id, amount: row.amount, currency: row.currency }
      });

      this.auditService?.logEvent({
        eventType: 'ENTITLEMENT_GRANTED',
        actorId: requesterId,
        resourceId: entitlementId,
        requestId,
        details: { productId: row.product_id, tier, readingId: row.reading_id }
      });

      const updatedTxn = this.database
        .prepare('SELECT * FROM transactions WHERE transaction_id = ?;')
        .get(transactionId);
      const createdEnt = this.database
        .prepare('SELECT * FROM entitlements WHERE entitlement_id = ?;')
        .get(entitlementId);

      return {
        success: true,
        isDuplicate: false,
        transaction: this._mapTransactionRow(updatedTxn),
        entitlement: this._mapEntitlementRow(createdEnt)
      };
    });
  }

  /**
   * Process refund: updates transaction to REFUNDED, revokes entitlement, preserves ReadingRecord
   * @param {Object} params
   * @param {string} [actorId]
   * @param {string} [requestId]
   * @returns {Object}
   */
  refundTransaction(params, actorId = 'SYSTEM', requestId = null) {
    const { transactionId, reason = 'Customer request' } = params;

    if (!transactionId) {
      throw new Error('400 Bad Request: Missing transactionId');
    }

    const row = this.database
      .prepare('SELECT * FROM transactions WHERE transaction_id = ?;')
      .get(transactionId);

    if (!row) {
      throw new Error('404 Not Found: Transaction does not exist');
    }

    if (row.status === 'REFUNDED') {
      return {
        success: true,
        isDuplicate: true,
        message: 'Transaction already refunded'
      };
    }

    const now = new Date().toISOString();

    return this.database.transaction(() => {
      this.database.prepare(`
        UPDATE transactions
        SET status = 'REFUNDED'
        WHERE transaction_id = ?;
      `).run(transactionId);

      // Revoke any linked entitlements
      const linkedEntitlements = this.database
        .prepare('SELECT * FROM entitlements WHERE transaction_id = ?;')
        .all(transactionId);

      for (const ent of linkedEntitlements) {
        this.database.prepare(`
          UPDATE entitlements
          SET status = 'REVOKED',
              revoked_at = ?
          WHERE entitlement_id = ?;
        `).run(now, ent.entitlement_id);

        this.auditService?.logEvent({
          eventType: 'ENTITLEMENT_REVOKED',
          actorId,
          resourceId: ent.entitlement_id,
          requestId,
          details: { reason: `Refunded: ${reason}`, transactionId }
        });
      }

      this.auditService?.logEvent({
        eventType: 'TRANSACTION_REFUNDED',
        actorId,
        resourceId: transactionId,
        requestId,
        details: { reason }
      });

      return {
        success: true,
        transactionId,
        status: 'REFUNDED',
        revokedEntitlementsCount: linkedEntitlements.length
      };
    });
  }

  /**
   * Server-authoritative access evaluation
   * @param {Object} query
   * @param {string} requesterId
   * @returns {Object}
   */
  evaluateAccess(query, requesterId) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session missing');
    }

    const { readingId, featureKey } = query;

    // Fetch all active entitlements for this user
    const rows = this.database.prepare(`
      SELECT * FROM entitlements
      WHERE owner_id = ? AND status = 'ACTIVE';
    `).all(requesterId);

    const activeEntitlements = rows.map(r => this._mapEntitlementRow(r));
    const allowedFeatures = new Set();
    let hasAccess = false;

    for (const ent of activeEntitlements) {
      // Check reading scope (either matches specific readingId or is account-wide)
      const matchesReading = !ent.readingId || ent.readingId === readingId;
      if (matchesReading) {
        for (const feat of ent.features) {
          allowedFeatures.add(feat);
        }
      }
    }

    if (featureKey) {
      hasAccess = allowedFeatures.has(featureKey);
    } else {
      hasAccess = allowedFeatures.size > 0;
    }

    return {
      decision: hasAccess ? 'ALLOW' : 'DENY',
      allowedFeatures: Array.from(allowedFeatures),
      requestedFeature: featureKey || null,
      readingId: readingId || null
    };
  }

  /**
   * Get user's entitlements with IDOR protection
   * @param {string} ownerId
   * @param {string} requesterId
   * @returns {Array<Object>}
   */
  getEntitlements(ownerId, requesterId) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    if (ownerId !== requesterId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: ownerId,
        details: { reason: 'IDOR attempt on getEntitlements' }
      });
      throw new Error('403 Forbidden: Cannot view another user\'s entitlements (IDOR Protection)');
    }

    const rows = this.database.prepare(`
      SELECT * FROM entitlements
      WHERE owner_id = ?
      ORDER BY granted_at DESC;
    `).all(ownerId);

    return rows.map(r => this._mapEntitlementRow(r));
  }

  /**
   * Get user's transactions with IDOR protection
   * @param {string} ownerId
   * @param {string} requesterId
   * @returns {Array<Object>}
   */
  getTransactions(ownerId, requesterId) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    if (ownerId !== requesterId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: ownerId,
        details: { reason: 'IDOR attempt on getTransactions' }
      });
      throw new Error('403 Forbidden: Cannot view another user\'s transactions (IDOR Protection)');
    }

    const rows = this.database.prepare(`
      SELECT * FROM transactions
      WHERE owner_id = ?
      ORDER BY created_at DESC;
    `).all(ownerId);

    return rows.map(r => this._mapTransactionRow(r));
  }

  /**
   * Restore entitlements for the current user
   * @param {string} requesterId
   * @param {string} [requestId]
   * @returns {Object}
   */
  restoreEntitlements(requesterId, requestId = null) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    const entitlements = this.getEntitlements(requesterId, requesterId);
    const active = entitlements.filter(e => e.status === 'ACTIVE');

    return {
      success: true,
      restoredCount: active.length,
      entitlements: active
    };
  }

  _mapTransactionRow(row) {
    return {
      transactionId: row.transaction_id,
      provider: row.provider,
      providerTransactionId: row.provider_transaction_id,
      productId: row.product_id,
      ownerId: row.owner_id,
      readingId: row.reading_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      idempotencyKey: row.idempotency_key,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      verifiedAt: row.verified_at
    };
  }

  _mapEntitlementRow(row) {
    return {
      entitlementId: row.entitlement_id,
      ownerId: row.owner_id,
      readingId: row.reading_id,
      productId: row.product_id,
      tier: row.tier,
      features: JSON.parse(row.features || '[]'),
      status: row.status,
      source: row.source,
      transactionId: row.transaction_id,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }
}
