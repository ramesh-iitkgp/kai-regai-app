/**
 * Kai RegAI — P13 Security Test Cases (S01–S15)
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Verifies non-negotiable security invariants:
 * - IDOR protection on Readings, Entitlements, and Transactions
 * - Forgery defense (client premium flags, unverified entitlements, unverified transactions)
 * - Cryptographic Webhook signature verification and replay protection
 * - Session security (expiration, revocation/logout)
 * - Biometric & Privacy Guard (rejection of raw camera images / buffers)
 * - Anti-takeover protection during guest-to-account migration
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { Database } from '../../src/backend/database/Database.js';
import { MigrationEngine } from '../../src/backend/database/MigrationEngine.js';
import { AuthService } from '../../src/backend/services/AuthService.js';
import { ReadingService } from '../../src/backend/services/ReadingService.js';
import { CommerceService } from '../../src/backend/services/CommerceService.js';
import { WebhookService } from '../../src/backend/services/WebhookService.js';
import { AuditService } from '../../src/backend/services/AuditService.js';
import { SignatureVerifier } from '../../src/backend/security/SignatureVerifier.js';
import { PrivacyGuard } from '../../src/backend/security/PrivacyGuard.js';

describe('P13 Security Suite — S01 through S15', () => {
  let db;
  let auditService;
  let authService;
  let readingService;
  let commerceService;
  let webhookService;

  const WEBHOOK_SECRET = 'test_p13_secret_webhook_key_xyz';

  beforeEach(() => {
    db = new Database(':memory:');
    db.init();
    new MigrationEngine(db).run();

    auditService = new AuditService(db);
    authService = new AuthService(db, auditService);
    readingService = new ReadingService(db, auditService);
    commerceService = new CommerceService(db, auditService);
    webhookService = new WebhookService(db, commerceService, auditService, WEBHOOK_SECRET);
  });

  afterEach(() => {
    db.close();
  });

  it('S01 IDOR reading access — User A cannot access User B reading', () => {
    const userA = authService.createGuestSession('127.0.0.1');
    const userB = authService.createGuestSession('127.0.0.1');

    const readingB = {
      readingId: 'RDG-USER-B-001',
      ownerId: userB.user.userId,
      schemaVersion: '1.0.0',
      readingMethod: 'MODE_1_CAMERA',
      reportTier: 'STANDARD',
      contentHash: 'hash-b-1',
      featureSnapshot: { lineCount: 3 },
      reportSnapshot: { summary: 'User B confidential reading' }
    };

    readingService.saveReading(readingB, userB.user.userId);

    // User A attempts to access User B's reading
    assert.throws(
      () => readingService.getReading('RDG-USER-B-001', userA.user.userId),
      /403 Forbidden.*IDOR/i
    );
  });

  it('S02 IDOR entitlement access — User A cannot view User B entitlements', () => {
    const userA = authService.createGuestSession('127.0.0.1');
    const userB = authService.createGuestSession('127.0.0.1');

    assert.throws(
      () => commerceService.getEntitlements(userB.user.userId, userA.user.userId),
      /403 Forbidden.*IDOR/i
    );
  });

  it('S03 IDOR transaction access — User A cannot view or verify User B transaction', () => {
    const userA = authService.createGuestSession('127.0.0.1');
    const userB = authService.createGuestSession('127.0.0.1');

    const txn = commerceService.createTransaction({
      productId: 'full_reading',
      amount: 4.99,
      currency: 'USD'
    }, userB.user.userId);

    // User A attempts to list User B's transactions
    assert.throws(
      () => commerceService.getTransactions(userB.user.userId, userA.user.userId),
      /403 Forbidden.*IDOR/i
    );

    // User A attempts to verify User B's transaction
    assert.throws(
      () => commerceService.verifyTransaction({
        transactionId: txn.transaction.transactionId
      }, userA.user.userId),
      /403 Forbidden.*IDOR/i
    );
  });

  it('S04 Forged premium flag — Client passing premium: true does not grant access', () => {
    const userA = authService.createGuestSession('127.0.0.1');

    const forgedReading = {
      readingId: 'RDG-FORGED-001',
      ownerId: userA.user.userId,
      isPremium: true,
      premium: true,
      reportTier: 'PREMIUM_UNLOCKED',
      contentHash: 'hash-forged-1',
      featureSnapshot: {},
      reportSnapshot: {}
    };

    readingService.saveReading(forgedReading, userA.user.userId);

    // Server-authoritative access evaluation checks server entitlements only
    const evaluation = commerceService.evaluateAccess({
      readingId: 'RDG-FORGED-001',
      featureKey: 'DETAILED_REPORT'
    }, userA.user.userId);

    assert.equal(evaluation.decision, 'DENY', 'Server must deny access when no verified entitlement exists');
  });

  it('S05 Forged entitlement — Entitlements cannot be manufactured by client', () => {
    const userA = authService.createGuestSession('127.0.0.1');

    // User A has no entitlements
    const entitlements = commerceService.getEntitlements(userA.user.userId, userA.user.userId);
    assert.equal(entitlements.length, 0);

    // Access check strictly yields DENY
    const access = commerceService.evaluateAccess({ readingId: 'RDG-1', featureKey: 'PDF_EXPORT' }, userA.user.userId);
    assert.equal(access.decision, 'DENY');
  });

  it('S06 Forged transaction — Transaction creation defaults to PENDING and requires verified payment', () => {
    const userA = authService.createGuestSession('127.0.0.1');

    const created = commerceService.createTransaction({
      productId: 'full_reading',
      status: 'VERIFIED' // Client forged attempt
    }, userA.user.userId);

    assert.equal(created.transaction.status, 'PENDING', 'Initial transaction status must remain PENDING');

    const access = commerceService.evaluateAccess({ featureKey: 'DETAILED_REPORT' }, userA.user.userId);
    assert.equal(access.decision, 'DENY', 'Pending transaction does not grant entitlement access');
  });

  it('S07 Duplicate transaction — Idempotency key prevents duplicate transactions', () => {
    const userA = authService.createGuestSession('127.0.0.1');
    const idempotencyKey = 'IDEMPOTENCY-KEY-001';

    const first = commerceService.createTransaction({
      productId: 'full_reading',
      amount: 4.99,
      idempotencyKey
    }, userA.user.userId);

    const second = commerceService.createTransaction({
      productId: 'full_reading',
      amount: 4.99,
      idempotencyKey
    }, userA.user.userId);

    assert.equal(first.isDuplicate, false);
    assert.equal(second.isDuplicate, true);
    assert.equal(first.transaction.transactionId, second.transaction.transactionId);

    const count = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE idempotency_key = ?;')
      .get(idempotencyKey).count;
    assert.equal(count, 1, 'Only one transaction row must be created in the database');
  });

  it('S08 Webhook replay — Repeated webhook with same eventId is rejected as duplicate', () => {
    const userA = authService.createGuestSession('127.0.0.1');

    const txn = commerceService.createTransaction({
      productId: 'full_reading',
      amount: 4.99
    }, userA.user.userId);

    const eventPayload = JSON.stringify({
      id: 'evt_stripe_12345',
      type: 'payment_intent.succeeded',
      data: {
        transactionId: txn.transaction.transactionId,
        providerTransactionId: 'pi_test_123'
      }
    });

    const signature = SignatureVerifier.generateHmacSha256(eventPayload, WEBHOOK_SECRET);

    // 1st delivery
    const res1 = webhookService.processWebhook({
      provider: 'stripe',
      rawPayload: eventPayload,
      signature
    });
    assert.equal(res1.isDuplicate, false);

    // 2nd delivery (replay attempt)
    const res2 = webhookService.processWebhook({
      provider: 'stripe',
      rawPayload: eventPayload,
      signature
    });
    assert.equal(res2.isDuplicate, true);

    const entitlements = commerceService.getEntitlements(userA.user.userId, userA.user.userId);
    assert.equal(entitlements.length, 1, 'Replayed webhook must not create a duplicate entitlement');
  });

  it('S09 Forged webhook — Missing or invalid HMAC signature is rejected', () => {
    const rawPayload = JSON.stringify({
      id: 'evt_forged_999',
      type: 'payment_intent.succeeded'
    });

    assert.throws(
      () => webhookService.processWebhook({
        provider: 'stripe',
        rawPayload,
        signature: 'invalid_sha256_signature_abc'
      }),
      /401 Unauthorized.*signature/i
    );
  });

  it('S10 Expired session — Accessing with expired token fails authentication', () => {
    const session = authService.createGuestSession('127.0.0.1');

    // Artificially expire session in database
    db.prepare(`
      UPDATE sessions
      SET expires_at = ?
      WHERE session_id = ?;
    `).run(new Date(Date.now() - 10000).toISOString(), session.sessionId || session.session?.session_id);

    assert.throws(
      () => authService.validateSession(session.token),
      /401 Unauthorized.*expired/i
    );
  });

  it('S11 Revoked session — Accessing after logout fails authentication', () => {
    const session = authService.createGuestSession('127.0.0.1');

    // Revoke session (logout)
    authService.revokeSession(session.token);

    assert.throws(
      () => authService.validateSession(session.token),
      /401 Unauthorized.*revoked/i
    );
  });

  it('S12 Oversized payload — Large reading payloads (>2MB) are rejected', () => {
    const userA = authService.createGuestSession('127.0.0.1');

    const hugePayload = {
      readingId: 'RDG-HUGE-001',
      ownerId: userA.user.userId,
      contentHash: 'hash-huge',
      blob: 'X'.repeat(2.5 * 1024 * 1024) // 2.5 MB
    };

    assert.throws(
      () => readingService.saveReading(hugePayload, userA.user.userId),
      /413 Payload Too Large/i
    );
  });

  it('S13 Raw image submission — Rejects camera buffer and raw photograph retention', () => {
    const userA = authService.createGuestSession('127.0.0.1');

    const bioPayload = {
      readingId: 'RDG-BIO-001',
      ownerId: userA.user.userId,
      contentHash: 'hash-bio',
      rawImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      featureSnapshot: { lineCount: 2 }
    };

    assert.throws(
      () => readingService.saveReading(bioPayload, userA.user.userId),
      /400 Bad Request.*(raw biometric|raw photographic)/i
    );
  });

  it('S14 Unauthorized deletion — User A cannot delete User B reading', () => {
    const userA = authService.createGuestSession('127.0.0.1');
    const userB = authService.createGuestSession('127.0.0.1');

    const readingB = {
      readingId: 'RDG-B-DELETE-001',
      ownerId: userB.user.userId,
      contentHash: 'hash-del',
      featureSnapshot: {},
      reportSnapshot: {}
    };

    readingService.saveReading(readingB, userB.user.userId);

    assert.throws(
      () => readingService.deleteReading('RDG-B-DELETE-001', userA.user.userId),
      /403 Forbidden.*IDOR/i
    );
  });

  it('S15 Guest migration takeover — Guest cannot migrate another user account', () => {
    const guestA = authService.createGuestSession('127.0.0.1');
    const accountB = authService.createOrLoginAccount({
      email: 'user_b@example.com',
      displayName: 'User B'
    }, '127.0.0.1');

    // Someone tries to migrate guestA using accountB credentials without accountB authorization
    const attackerSession = authService.createGuestSession('127.0.0.1');

    assert.throws(
      () => authService.migrateGuestToAccount({
        guestId: guestA.user.userId,
        accountEmail: 'user_b@example.com',
        requesterId: attackerSession.user.userId
      }),
      /403 Forbidden.*Ownership mismatch/i
    );
  });
});
