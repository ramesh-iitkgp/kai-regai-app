/**
 * Kai RegAI — Entitlement State Machine
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Enforces deterministic entitlement lifecycle transitions:
 * - Prevents illegal client state manipulation
 * - Ensures audit logging of status transitions
 */

import { ENTITLEMENT_STATUS } from './types.js';

export const VALID_ENTITLEMENT_TRANSITIONS = {
  [ENTITLEMENT_STATUS.PENDING]: [
    ENTITLEMENT_STATUS.ACTIVE,
    ENTITLEMENT_STATUS.FAILED,
    ENTITLEMENT_STATUS.CANCELLED
  ],
  [ENTITLEMENT_STATUS.ACTIVE]: [
    ENTITLEMENT_STATUS.EXPIRED,
    ENTITLEMENT_STATUS.REVOKED,
    ENTITLEMENT_STATUS.REFUNDED
  ],
  [ENTITLEMENT_STATUS.EXPIRED]: [
    ENTITLEMENT_STATUS.ACTIVE // e.g. subscription renewal
  ],
  [ENTITLEMENT_STATUS.REVOKED]: [], // Terminal unless reinstated by explicit administrative grant
  [ENTITLEMENT_STATUS.REFUNDED]: [], // Terminal state
  [ENTITLEMENT_STATUS.CANCELLED]: [], // Terminal state
  [ENTITLEMENT_STATUS.FAILED]: [] // Terminal state
};

export class EntitlementStateMachine {
  /**
   * Check if transition is legally permitted
   * @param {string} currentStatus 
   * @param {string} targetStatus 
   * @returns {boolean}
   */
  static canTransition(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) return true; // Idempotent no-op
    const allowed = VALID_ENTITLEMENT_TRANSITIONS[currentStatus];
    return Array.isArray(allowed) && allowed.includes(targetStatus);
  }

  /**
   * Execute state transition on an Entitlement instance
   * @param {import('./EntitlementSchema.js').Entitlement} entitlement 
   * @param {string} targetStatus 
   * @param {string} [reason='']
   * @returns {import('./EntitlementSchema.js').Entitlement}
   */
  static transition(entitlement, targetStatus, reason = '') {
    if (!entitlement) throw new Error('transition requires an Entitlement instance');

    if (entitlement.status === targetStatus) {
      return entitlement; // Idempotent
    }

    if (!this.canTransition(entitlement.status, targetStatus)) {
      throw new Error(`Illegal entitlement transition from '${entitlement.status}' to '${targetStatus}'`);
    }

    entitlement.status = targetStatus;

    if (targetStatus === ENTITLEMENT_STATUS.REVOKED || targetStatus === ENTITLEMENT_STATUS.REFUNDED) {
      entitlement.revokedAt = new Date().toISOString();
    }

    entitlement.metadata = {
      ...entitlement.metadata,
      lastTransitionReason: reason,
      lastTransitionAt: new Date().toISOString()
    };

    return entitlement;
  }
}
