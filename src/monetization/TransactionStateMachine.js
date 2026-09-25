/**
 * Kai RegAI — Financial Transaction State Machine
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Enforces deterministic financial transaction state transitions:
 * - Prevents fraudulent state promotion (e.g. FAILED -> VERIFIED)
 * - Guarantees auditability of payment state progression
 */

import { TRANSACTION_STATUS } from './types.js';

export const VALID_TRANSACTION_TRANSITIONS = {
  [TRANSACTION_STATUS.INITIATED]: [
    TRANSACTION_STATUS.PENDING,
    TRANSACTION_STATUS.CANCELLED,
    TRANSACTION_STATUS.FAILED
  ],
  [TRANSACTION_STATUS.PENDING]: [
    TRANSACTION_STATUS.VERIFICATION_REQUIRED,
    TRANSACTION_STATUS.VERIFIED,
    TRANSACTION_STATUS.FAILED,
    TRANSACTION_STATUS.CANCELLED,
    TRANSACTION_STATUS.DUPLICATE
  ],
  [TRANSACTION_STATUS.VERIFICATION_REQUIRED]: [
    TRANSACTION_STATUS.VERIFIED,
    TRANSACTION_STATUS.FAILED
  ],
  [TRANSACTION_STATUS.VERIFIED]: [
    TRANSACTION_STATUS.REFUNDED
  ],
  [TRANSACTION_STATUS.FAILED]: [],
  [TRANSACTION_STATUS.CANCELLED]: [],
  [TRANSACTION_STATUS.REFUNDED]: [],
  [TRANSACTION_STATUS.DUPLICATE]: []
};

export class TransactionStateMachine {
  /**
   * Check if transition is legally permitted
   * @param {string} currentStatus 
   * @param {string} targetStatus 
   * @returns {boolean}
   */
  static canTransition(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) return true; // Idempotent no-op
    const allowed = VALID_TRANSACTION_TRANSITIONS[currentStatus];
    return Array.isArray(allowed) && allowed.includes(targetStatus);
  }

  /**
   * Execute state transition on a Transaction instance
   * @param {import('./TransactionSchema.js').Transaction} txn 
   * @param {string} targetStatus 
   * @param {string} [reason='']
   * @returns {import('./TransactionSchema.js').Transaction}
   */
  static transition(txn, targetStatus, reason = '') {
    if (!txn) throw new Error('transition requires a Transaction instance');

    if (txn.status === targetStatus) {
      return txn; // Idempotent
    }

    if (!this.canTransition(txn.status, targetStatus)) {
      throw new Error(`Illegal transaction transition from '${txn.status}' to '${targetStatus}'`);
    }

    txn.status = targetStatus;

    if (targetStatus === TRANSACTION_STATUS.VERIFIED) {
      txn.verifiedAt = new Date().toISOString();
    }

    txn.metadata = {
      ...txn.metadata,
      lastTransitionReason: reason,
      lastTransitionAt: new Date().toISOString()
    };

    return txn;
  }
}
