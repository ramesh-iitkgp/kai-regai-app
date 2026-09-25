/**
 * Kai RegAI — Security & Privacy Audit Service
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Persists structured, privacy-safe audit trails for security-sensitive operations:
 * - ACCOUNT_CREATED, ACCOUNT_MIGRATED, READING_CREATED, READING_DELETED
 * - TRANSACTION_VERIFIED, TRANSACTION_REFUNDED, ENTITLEMENT_GRANTED, ENTITLEMENT_REVOKED
 * - WEBHOOK_PROCESSED, AUTH_FAILED, UNAUTHORIZED_ACCESS
 * - Never captures raw biometric content, payment credentials, or passwords
 */

import { randomUUID } from 'node:crypto';

export class AuditService {
  constructor(database) {
    this.database = database;
  }

  /**
   * Record a security/operational audit event
   * @param {Object} params
   * @param {string} params.eventType
   * @param {string} [params.actorId]
   * @param {string} [params.resourceId]
   * @param {string} [params.requestId]
   * @param {Object} [params.details={}]
   * @returns {string} auditId
   */
  logEvent({ eventType, actorId = null, resourceId = null, requestId = null, details = {} }) {
    const auditId = `AUD-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const sanitizedDetails = JSON.stringify(details);

    const stmt = this.database.prepare(`
      INSERT INTO audit_events (audit_id, event_type, actor_id, resource_id, request_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);

    stmt.run(
      auditId,
      eventType,
      actorId,
      resourceId,
      requestId,
      sanitizedDetails,
      new Date().toISOString()
    );

    return auditId;
  }

  /**
   * Query recent audit events
   * @param {Object} filter
   * @returns {Object[]}
   */
  getEvents(filter = {}) {
    let sql = 'SELECT * FROM audit_events WHERE 1=1';
    const params = [];

    if (filter.eventType) {
      sql += ' AND event_type = ?';
      params.push(filter.eventType);
    }
    if (filter.actorId) {
      sql += ' AND actor_id = ?';
      params.push(filter.actorId);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(filter.limit || 50);

    return this.database.prepare(sql).all(...params);
  }
}
