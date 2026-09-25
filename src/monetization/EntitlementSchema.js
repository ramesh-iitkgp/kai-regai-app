/**
 * Kai RegAI — Entitlement Contract & Schema Validation
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Formal data contract defining user access permissions:
 * - Decoupled from financial transactions (Transaction != Entitlement)
 * - Versioned schema ("1.0.0")
 * - Bounded lifecycle with expiration, revocation, and idempotency
 * - Zero biometric or photographic payload leakage
 */

import { ENTITLEMENT_STATUS, ENTITLEMENT_SOURCE, PRODUCT_TIERS } from './types.js';

export const ENTITLEMENT_SCHEMA_VERSION = '1.0.0';

export class Entitlement {
  constructor(data = {}) {
    this.schemaVersion = data.schemaVersion || ENTITLEMENT_SCHEMA_VERSION;
    this.entitlementId = data.entitlementId || `ENT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.ownerId = data.ownerId || 'GUEST';
    this.readingId = data.readingId || null; // Nullable if account-wide subscription
    this.productId = data.productId || 'kai_free';
    this.tier = data.tier || PRODUCT_TIERS.FREE;
    this.features = Array.isArray(data.features) ? [...data.features] : [];
    this.status = data.status || ENTITLEMENT_STATUS.ACTIVE;
    this.source = data.source || ENTITLEMENT_SOURCE.PURCHASE;
    this.transactionId = data.transactionId || null;
    this.grantedAt = data.grantedAt || new Date().toISOString();
    this.expiresAt = data.expiresAt || null;
    this.revokedAt = data.revokedAt || null;
    this.metadata = typeof data.metadata === 'object' && data.metadata !== null ? { ...data.metadata } : {};
  }

  /**
   * Check if entitlement is currently expired
   * @param {Date|string} [asOfTime]
   * @returns {boolean}
   */
  isExpired(asOfTime = new Date()) {
    if (!this.expiresAt) return false;
    const now = new Date(asOfTime).getTime();
    const expiry = new Date(this.expiresAt).getTime();
    return now >= expiry;
  }

  /**
   * Check if entitlement is currently active and unexpired
   * @param {Date|string} [asOfTime]
   * @returns {boolean}
   */
  isActive(asOfTime = new Date()) {
    if (this.status !== ENTITLEMENT_STATUS.ACTIVE) return false;
    if (this.revokedAt) return false;
    return !this.isExpired(asOfTime);
  }

  /**
   * Check if this entitlement grants a specific feature
   * @param {string} featureKey 
   * @returns {boolean}
   */
  hasFeature(featureKey) {
    if (!this.isActive()) return false;
    return this.features.includes(featureKey);
  }

  toJSON() {
    return {
      schemaVersion: this.schemaVersion,
      entitlementId: this.entitlementId,
      ownerId: this.ownerId,
      readingId: this.readingId,
      productId: this.productId,
      tier: this.tier,
      features: this.features,
      status: this.status,
      source: this.source,
      transactionId: this.transactionId,
      grantedAt: this.grantedAt,
      expiresAt: this.expiresAt,
      revokedAt: this.revokedAt,
      metadata: this.metadata
    };
  }
}

export class EntitlementSchemaValidator {
  /**
   * Validate an Entitlement instance or plain object
   * @param {Entitlement|Object} entitlement 
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  static async validate(entitlement) {
    const errors = [];

    if (!entitlement || typeof entitlement !== 'object') {
      return { valid: false, errors: ['Entitlement must be a non-null object'] };
    }

    if (entitlement.schemaVersion !== ENTITLEMENT_SCHEMA_VERSION) {
      errors.push(`Unsupported entitlement schemaVersion: '${entitlement.schemaVersion}'`);
    }

    if (!entitlement.entitlementId || typeof entitlement.entitlementId !== 'string') {
      errors.push('Missing or invalid entitlementId');
    }

    if (!entitlement.ownerId || typeof entitlement.ownerId !== 'string') {
      errors.push('Missing or invalid ownerId');
    }

    if (!entitlement.productId || typeof entitlement.productId !== 'string') {
      errors.push('Missing or invalid productId');
    }

    if (!Object.values(PRODUCT_TIERS).includes(entitlement.tier)) {
      errors.push(`Invalid tier '${entitlement.tier}'`);
    }

    if (!Object.values(ENTITLEMENT_STATUS).includes(entitlement.status)) {
      errors.push(`Invalid entitlement status '${entitlement.status}'`);
    }

    if (!Object.values(ENTITLEMENT_SOURCE).includes(entitlement.source)) {
      errors.push(`Invalid entitlement source '${entitlement.source}'`);
    }

    if (!Array.isArray(entitlement.features)) {
      errors.push('features must be an array of feature keys');
    }

    // Biometric & sensitive data privacy check
    const serialized = JSON.stringify(entitlement);
    const forbiddenPatterns = [
      /rawImage/i,
      /cameraImage/i,
      /imageBuffer/i,
      /cameraFrame/i,
      /base64/i,
      /creditCard/i,
      /cvv/i,
      /cardNumber/i
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(serialized)) {
        errors.push(`Privacy & Security Violation: forbidden pattern ${pattern.toString()} detected in Entitlement payload`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
