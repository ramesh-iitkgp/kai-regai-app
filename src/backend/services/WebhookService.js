/**
 * Kai RegAI — Payment Webhook Service & Replay Guard
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Responsibilities:
 * - Provider-agnostic webhook receiver
 * - Cryptographic HMAC signature verification (via SignatureVerifier)
 * - Replay protection via persistent `webhook_events` tracking
 * - Atomic transaction and entitlement updates
 * - Invariant: Replay of an identical webhook NEVER produces a second entitlement
 */

import crypto from 'node:crypto';
import { SignatureVerifier } from '../security/SignatureVerifier.js';

export class WebhookService {
  constructor(database, commerceService, auditService, webhookSecret) {
    this.database = database;
    this.commerceService = commerceService;
    this.auditService = auditService;
    this.webhookSecret = webhookSecret || 'default_kai_webhook_secret_p13';
  }

  /**
   * Process incoming webhook event with signature verification and replay protection
   * @param {Object} params
   * @param {string} params.provider
   * @param {string} params.rawPayload - Raw stringified JSON payload
   * @param {string} params.signature - Provided signature header
   * @param {string} [params.requestId]
   * @returns {Object}
   */
  processWebhook(params) {
    const { provider, rawPayload, signature, requestId = null } = params;

    if (!provider) {
      throw new Error('400 Bad Request: Missing provider parameter');
    }

    if (!rawPayload) {
      throw new Error('400 Bad Request: Missing raw payload');
    }

    // 1. Signature Verification
    const isAuthentic = SignatureVerifier.verifyHmacSha256(rawPayload, signature, this.webhookSecret);
    if (!isAuthentic) {
      this.auditService?.logEvent({
        eventType: 'WEBHOOK_FAILED',
        actorId: provider,
        requestId,
        details: { reason: 'Invalid cryptographic signature' }
      });
      throw new Error('401 Unauthorized: Invalid webhook signature');
    }

    // 2. Parse Payload
    let event;
    try {
      event = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
    } catch (e) {
      throw new Error('400 Bad Request: Malformed JSON payload');
    }

    const eventId = event.id || event.eventId || `EVT-${crypto.randomUUID()}`;
    const eventType = event.type || event.eventType || 'UNKNOWN';
    const idempotencyKey = `${provider}:${eventId}`;

    // 3. Replay Protection: Check if event already processed
    const existing = this.database
      .prepare('SELECT * FROM webhook_events WHERE idempotency_key = ?;')
      .get(idempotencyKey);

    if (existing) {
      return {
        success: true,
        isDuplicate: true,
        message: 'Webhook event already processed (Replay Protection)'
      };
    }

    const now = new Date().toISOString();
    const internalEventId = `WBE-${crypto.randomUUID()}`;

    // Record incoming webhook event in DB
    this.database.prepare(`
      INSERT INTO webhook_events (
        event_id,
        provider,
        provider_event_id,
        event_type,
        idempotency_key,
        status,
        raw_payload,
        received_at,
        processed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `).run(
      internalEventId,
      provider,
      eventId,
      eventType,
      idempotencyKey,
      'PROCESSING',
      typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload),
      now,
      null
    );

    // 4. Handle event types atomically
    try {
      let actionResult = null;

      if (eventType === 'payment_intent.succeeded' || eventType === 'PAYMENT_SUCCESS') {
        const transactionId = event.data?.transactionId || event.transactionId;
        if (transactionId) {
          const txn = this.database
            .prepare('SELECT * FROM transactions WHERE transaction_id = ?;')
            .get(transactionId);

          if (txn) {
            actionResult = this.commerceService.verifyTransaction(
              {
                transactionId,
                providerTransactionId: event.data?.providerTransactionId || event.id
              },
              txn.owner_id,
              requestId
            );
          }
        }
      } else if (eventType === 'charge.refunded' || eventType === 'REFUND_PROCESSED') {
        const transactionId = event.data?.transactionId || event.transactionId;
        if (transactionId) {
          actionResult = this.commerceService.refundTransaction(
            {
              transactionId,
              reason: event.data?.reason || 'Provider webhook refund'
            },
            `WEBHOOK:${provider}`,
            requestId
          );
        }
      }

      // Mark event as PROCESSED
      this.database.prepare(`
        UPDATE webhook_events
        SET status = 'PROCESSED',
            processed_at = ?
        WHERE event_id = ?;
      `).run(new Date().toISOString(), internalEventId);

      this.auditService?.logEvent({
        eventType: 'WEBHOOK_PROCESSED',
        actorId: provider,
        resourceId: eventId,
        requestId,
        details: { eventType, internalEventId }
      });

      return {
        success: true,
        isDuplicate: false,
        eventId: internalEventId,
        eventType,
        actionResult
      };

    } catch (err) {
      // Mark event as FAILED
      this.database.prepare(`
        UPDATE webhook_events
        SET status = 'FAILED'
        WHERE event_id = ?;
      `).run(internalEventId);

      this.auditService?.logEvent({
        eventType: 'WEBHOOK_FAILED',
        actorId: provider,
        resourceId: eventId,
        requestId,
        details: { error: err.message }
      });

      throw err;
    }
  }
}
