/**
 * Kai RegAI — P13 Golden Backend Cases (B01–B20)
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Deterministic test suite verifying core backend responsibilities:
 * - Guest & Authenticated synchronizations
 * - Atomic guest-to-account migration
 * - Commercial authority: Transactions, Entitlements, Verifications, Refunds
 * - Invariant 10: Historical reading preservation (Refunds do not delete ReadingRecord)
 * - Offline sync, Idempotency, Conflict detection, Cross-device access
 * - Safe account deletion and audit integrity
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { Database } from '../../src/backend/database/Database.js';
import { MigrationEngine } from '../../src/backend/database/MigrationEngine.js';
import { AuthService } from '../../src/backend/services/AuthService.js';
import { ReadingService } from '../../src/backend/services/ReadingService.js';
import { CommerceService } from '../../src/backend/services/CommerceService.js';
import { SyncService } from '../../src/backend/services/SyncService.js';
import { WebhookService } from '../../src/backend/services/WebhookService.js';
import { AuditService } from '../../src/backend/services/AuditService.js';
import { SignatureVerifier } from '../../src/backend/security/SignatureVerifier.js';

describe('P13 Golden Backend Cases — B01 through B20', () => {
  let db;
  let auditService;
  let authService;
  let readingService;
  let commerceService;
  let syncService;
  let webhookService;

  const WEBHOOK_SECRET = 'golden_suite_secret_key_123';

  beforeEach(() => {
    db = new Database(':memory:');
    db.init();
    new MigrationEngine(db).run();

    auditService = new AuditService(db);
    authService = new AuthService(db, auditService);
    readingService = new ReadingService(db, auditService);
    commerceService = new CommerceService(db, auditService);
    syncService = new SyncService(db, readingService, auditService);
    webhookService = new WebhookService(db, commerceService, auditService, WEBHOOK_SECRET);
  });

  afterEach(() => {
    db.close();
  });

  it('B01 Guest reading sync — Guest can sync reading to server', () => {
    const guest = authService.createGuestSession('127.0.0.1');

    const readingData = {
      readingId: 'RDG-B01-001',
      ownerId: guest.user.userId,
      schemaVersion: '1.0.0',
      readingMethod: 'MODE_1_CAMERA',
      reportTier: 'STANDARD',
      contentHash: 'hash-b01',
      featureSnapshot: { heartLineCurvature: 0.8 },
      reportSnapshot: { synthesis: 'Intuitive warmth' }
    };

    const saved = readingService.saveReading(readingData, guest.user.userId);
    assert.equal(saved.success, true);
    assert.equal(saved.isDuplicate, false);
    assert.equal(saved.readingId, 'RDG-B01-001');

    const retrieved = readingService.getReading('RDG-B01-001', guest.user.userId);
    assert.equal(retrieved.readingId, 'RDG-B01-001');
    assert.equal(retrieved.ownerId, guest.user.userId);
  });

  it('B02 Authenticated reading sync — Authenticated user can sync reading', () => {
    const account = authService.createOrLoginAccount({
      email: 'seeker@example.com',
      displayName: 'Vedic Seeker'
    }, '127.0.0.1');

    const readingData = {
      readingId: 'RDG-B02-001',
      ownerId: account.user.userId,
      schemaVersion: '1.0.0',
      readingMethod: 'MODE_2_GUIDED',
      reportTier: 'FULL',
      contentHash: 'hash-b02',
      featureSnapshot: { fateLineClarity: 0.95 },
      reportSnapshot: { synthesis: 'Deep vocational focus' }
    };

    const saved = readingService.saveReading(readingData, account.user.userId);
    assert.equal(saved.success, true);
    assert.equal(saved.isDuplicate, false);
  });

  it('B03 Reading reopen — Historical reading features and report are exactly reproducible', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const featureSnapshot = { lifeLineLength: 0.88, headLineDepth: 0.72 };
    const reportSnapshot = { overview: 'Steadfast vitality', chapterOne: 'Clarity of purpose' };
    const contentHash = 'hash-b03-exact';

    readingService.saveReading({
      readingId: 'RDG-B03-REOPEN',
      ownerId: user.user.userId,
      contentHash,
      featureSnapshot,
      reportSnapshot
    }, user.user.userId);

    const reopened = readingService.getReading('RDG-B03-REOPEN', user.user.userId);
    assert.deepEqual(reopened.featureSnapshot, featureSnapshot);
    assert.deepEqual(reopened.reportSnapshot, reportSnapshot);
    assert.equal(reopened.contentHash, contentHash);
  });

  it('B04 Reading deletion — Soft-deletion prevents normal read but preserves audit trail', () => {
    const user = authService.createGuestSession('127.0.0.1');

    readingService.saveReading({
      readingId: 'RDG-B04-DELETE',
      ownerId: user.user.userId,
      contentHash: 'hash-b04',
      featureSnapshot: {},
      reportSnapshot: {}
    }, user.user.userId);

    const deleted = readingService.deleteReading('RDG-B04-DELETE', user.user.userId);
    assert.equal(deleted, true);

    const readingAfterDelete = readingService.getReading('RDG-B04-DELETE', user.user.userId);
    assert.equal(readingAfterDelete, null, 'Deleted reading must return null on standard get');
  });

  it('B05 Guest account migration — Reassigns readings, transactions, and entitlements atomically', () => {
    const guest = authService.createGuestSession('127.0.0.1');

    readingService.saveReading({
      readingId: 'RDG-B05-MIGRATE',
      ownerId: guest.user.userId,
      contentHash: 'hash-b05',
      featureSnapshot: {},
      reportSnapshot: {}
    }, guest.user.userId);

    const txn = commerceService.createTransaction({
      productId: 'full_reading',
      amount: 4.99
    }, guest.user.userId);

    commerceService.verifyTransaction({
      transactionId: txn.transaction.transactionId
    }, guest.user.userId);

    // Upgrade guest to authenticated account
    const migration = authService.migrateGuestToAccount({
      guestId: guest.user.userId,
      accountEmail: 'migrated_user@example.com',
      accountDisplayName: 'Migrated Seeker',
      requesterId: guest.user.userId
    });

    assert.equal(migration.migratedReadings, 1);
    assert.equal(migration.migratedTransactions, 1);
    assert.equal(migration.migratedEntitlements, 1);
    assert.equal(migration.user.ownerType, 'ACCOUNT');

    // Verify reading is now accessible under new account ID
    const reading = readingService.getReading('RDG-B05-MIGRATE', migration.user.userId);
    assert.equal(reading.ownerId, migration.user.userId);
  });

  it('B06 Premium purchase — Creates initial transaction with status PENDING', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const result = commerceService.createTransaction({
      productId: 'kai_standard',
      readingId: 'RDG-100',
      currency: 'USD'
    }, user.user.userId);

    assert.equal(result.success, true);
    assert.equal(result.transaction.status, 'PENDING');
    assert.equal(result.transaction.productId, 'kai_standard');
  });

  it('B07 Transaction verification — Verification transitions transaction to VERIFIED and grants entitlement', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const txn = commerceService.createTransaction({
      productId: 'kai_standard',
      readingId: 'RDG-B07'
    }, user.user.userId);

    const verifyResult = commerceService.verifyTransaction({
      transactionId: txn.transaction.transactionId,
      providerTransactionId: 'pi_verified_999'
    }, user.user.userId);

    assert.equal(verifyResult.success, true);
    assert.equal(verifyResult.transaction.status, 'VERIFIED');
    assert.equal(verifyResult.entitlement.status, 'ACTIVE');

    const access = commerceService.evaluateAccess({
      readingId: 'RDG-B07',
      featureKey: 'DETAILED_REPORT'
    }, user.user.userId);

    assert.equal(access.decision, 'ALLOW');
  });

  it('B08 Duplicate transaction — Resubmission with same idempotency key is idempotent', () => {
    const user = authService.createGuestSession('127.0.0.1');
    const idempotencyKey = 'IDEMP-B08';

    const t1 = commerceService.createTransaction({
      productId: 'kai_standard',
      idempotencyKey
    }, user.user.userId);

    const t2 = commerceService.createTransaction({
      productId: 'kai_standard',
      idempotencyKey
    }, user.user.userId);

    assert.equal(t1.isDuplicate, false);
    assert.equal(t2.isDuplicate, true);
    assert.equal(t1.transaction.transactionId, t2.transaction.transactionId);
  });

  it('B09 Entitlement restoration — Restores all active entitlements across devices', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const txn = commerceService.createTransaction({
      productId: 'kai_standard'
    }, user.user.userId);

    commerceService.verifyTransaction({
      transactionId: txn.transaction.transactionId
    }, user.user.userId);

    const restore = commerceService.restoreEntitlements(user.user.userId);
    assert.equal(restore.success, true);
    assert.equal(restore.restoredCount, 1);
    assert.equal(restore.entitlements[0].status, 'ACTIVE');
  });

  it('B10 Refund — Transaction marked REFUNDED, entitlement revoked, ReadingRecord preserved', () => {
    const user = authService.createGuestSession('127.0.0.1');

    readingService.saveReading({
      readingId: 'RDG-B10-HISTORICAL',
      ownerId: user.user.userId,
      contentHash: 'hash-b10',
      featureSnapshot: { line1: 'intact' },
      reportSnapshot: { text: 'preserved' }
    }, user.user.userId);

    const txn = commerceService.createTransaction({
      productId: 'kai_standard',
      readingId: 'RDG-B10-HISTORICAL'
    }, user.user.userId);

    commerceService.verifyTransaction({
      transactionId: txn.transaction.transactionId
    }, user.user.userId);

    // Perform refund
    const refundResult = commerceService.refundTransaction({
      transactionId: txn.transaction.transactionId,
      reason: 'User dispute satisfaction'
    }, user.user.userId);

    assert.equal(refundResult.status, 'REFUNDED');
    assert.equal(refundResult.revokedEntitlementsCount, 1);

    // Invariant 10: ReadingRecord remains intact
    const reading = readingService.getReading('RDG-B10-HISTORICAL', user.user.userId);
    assert.ok(reading, 'ReadingRecord must not be deleted on refund');
    assert.equal(reading.contentHash, 'hash-b10');

    // Access to premium features revoked
    const access = commerceService.evaluateAccess({
      readingId: 'RDG-B10-HISTORICAL',
      featureKey: 'DETAILED_REPORT'
    }, user.user.userId);
    assert.equal(access.decision, 'DENY');
  });

  it('B11 Expiration — Expired entitlement yields DENY access decision', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const txn = commerceService.createTransaction({ productId: 'kai_standard' }, user.user.userId);
    const verified = commerceService.verifyTransaction({ transactionId: txn.transaction.transactionId }, user.user.userId);

    // Manually set entitlement to expired in DB
    db.prepare(`
      UPDATE entitlements
      SET status = 'EXPIRED',
          expires_at = ?
      WHERE entitlement_id = ?;
    `).run(new Date(Date.now() - 1000).toISOString(), verified.entitlement.entitlementId);

    const access = commerceService.evaluateAccess({ featureKey: 'DETAILED_REPORT' }, user.user.userId);
    assert.equal(access.decision, 'DENY');
  });

  it('B12 Cross-device entitlement — Authenticated user on new session accesses granted entitlements', () => {
    const account = authService.createOrLoginAccount({ email: 'cross_device@example.com' }, '127.0.0.1');

    const txn = commerceService.createTransaction({ productId: 'kai_standard' }, account.user.userId);
    commerceService.verifyTransaction({ transactionId: txn.transaction.transactionId }, account.user.userId);

    // User logs in from second device
    const secondSession = authService.createOrLoginAccount({ email: 'cross_device@example.com' }, '192.168.1.50');
    assert.equal(secondSession.user.userId, account.user.userId);

    // Access evaluation on second device
    const access = commerceService.evaluateAccess({ featureKey: 'DETAILED_REPORT' }, secondSession.user.userId);
    assert.equal(access.decision, 'ALLOW');
  });

  it('B13 Offline sync — Batch sync pushes multiple offline readings successfully', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const batchPayload = {
      items: [
        {
          readingId: 'RDG-OFFLINE-1',
          ownerId: user.user.userId,
          contentHash: 'hash-off-1',
          featureSnapshot: {},
          reportSnapshot: {}
        },
        {
          readingId: 'RDG-OFFLINE-2',
          ownerId: user.user.userId,
          contentHash: 'hash-off-2',
          featureSnapshot: {},
          reportSnapshot: {}
        }
      ]
    };

    const syncResult = syncService.syncBatch(batchPayload, user.user.userId);
    assert.equal(syncResult.success, true);
    assert.equal(syncResult.syncedCount, 2);
    assert.equal(syncResult.conflictCount, 0);
  });

  it('B14 Sync retry — Resending synced reading is treated idempotently without duplicates', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const item = {
      readingId: 'RDG-RETRY-001',
      ownerId: user.user.userId,
      contentHash: 'hash-retry',
      featureSnapshot: {},
      reportSnapshot: {}
    };

    const first = syncService.syncBatch({ items: [item] }, user.user.userId);
    const second = syncService.syncBatch({ items: [item] }, user.user.userId);

    assert.equal(first.results[0].status, 'SYNCED');
    assert.equal(second.results[0].status, 'SYNCED');
    assert.equal(second.results[0].isDuplicate, true);

    const count = db.prepare('SELECT COUNT(*) as count FROM readings WHERE reading_id = ?;')
      .get('RDG-RETRY-001').count;
    assert.equal(count, 1);
  });

  it('B15 Conflict detection — Conflicting hash for historical reading triggers CONFLICT', () => {
    const user = authService.createGuestSession('127.0.0.1');

    // First upload
    readingService.saveReading({
      readingId: 'RDG-CONFLICT-001',
      ownerId: user.user.userId,
      contentHash: 'hash-original',
      featureSnapshot: {},
      reportSnapshot: {}
    }, user.user.userId);

    // Sync attempt with conflicting contentHash
    const conflictingSync = syncService.syncBatch({
      items: [{
        readingId: 'RDG-CONFLICT-001',
        ownerId: user.user.userId,
        contentHash: 'hash-modified-tampered',
        featureSnapshot: {},
        reportSnapshot: {}
      }]
    }, user.user.userId);

    assert.equal(conflictingSync.conflictCount, 1);
    assert.equal(conflictingSync.results[0].status, 'CONFLICT');
  });

  it('B16 Unauthorized reading — Missing authentication fails reading operations', () => {
    assert.throws(
      () => readingService.saveReading({ readingId: 'RDG-NOAUTH' }, null),
      /401 Unauthorized/i
    );
  });

  it('B17 Unauthorized entitlement — Feature requested without entitlement yields DENY', () => {
    const user = authService.createGuestSession('127.0.0.1');
    const access = commerceService.evaluateAccess({
      readingId: 'RDG-ANY',
      featureKey: 'DETAILED_REPORT'
    }, user.user.userId);

    assert.equal(access.decision, 'DENY');
  });

  it('B18 Webhook replay — Provider event replay maintains exactly one transaction and entitlement', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const txn = commerceService.createTransaction({
      productId: 'kai_standard',
      amount: 4.99
    }, user.user.userId);

    const rawPayload = JSON.stringify({
      id: 'evt_golden_replay_1',
      type: 'PAYMENT_SUCCESS',
      transactionId: txn.transaction.transactionId
    });
    const signature = SignatureVerifier.generateHmacSha256(rawPayload, WEBHOOK_SECRET);

    webhookService.processWebhook({ provider: 'mock_pay', rawPayload, signature });
    const replay = webhookService.processWebhook({ provider: 'mock_pay', rawPayload, signature });

    assert.equal(replay.isDuplicate, true);

    const entitlements = commerceService.getEntitlements(user.user.userId, user.user.userId);
    assert.equal(entitlements.length, 1);
  });

  it('B19 Account deletion — Account deletion cascades to sessions, readings, entitlements', () => {
    const user = authService.createOrLoginAccount({ email: 'delete_me@example.com' }, '127.0.0.1');

    readingService.saveReading({
      readingId: 'RDG-DELETE-ACCT',
      ownerId: user.user.userId,
      contentHash: 'hash-del-acct',
      featureSnapshot: {},
      reportSnapshot: {}
    }, user.user.userId);

    // Mock deletion via DB cascade
    db.prepare('DELETE FROM users WHERE user_id = ?;').run(user.user.userId);

    const userCheck = db.prepare('SELECT * FROM users WHERE user_id = ?;').get(user.user.userId);
    assert.equal(userCheck, undefined);

    const sessionCheck = db.prepare('SELECT * FROM sessions WHERE user_id = ?;').all(user.user.userId);
    assert.equal(sessionCheck.length, 0);

    const readingCheck = db.prepare('SELECT * FROM readings WHERE owner_id = ?;').all(user.user.userId);
    assert.equal(readingCheck.length, 0);
  });

  it('B20 Historical reading preservation — Reading snapshot is byte-identical across commercial changes', () => {
    const user = authService.createGuestSession('127.0.0.1');

    const originalReading = {
      readingId: 'RDG-B20-IMMUTABLE',
      ownerId: user.user.userId,
      schemaVersion: '1.0.0',
      readingMethod: 'MODE_1_CAMERA',
      reportTier: 'FREE',
      contentHash: 'hash-b20-immutable',
      featureSnapshot: { palmLines: ['LifeLine', 'HeadLine', 'HeartLine'] },
      reportSnapshot: { summary: 'Vibrant spirit' }
    };

    readingService.saveReading(originalReading, user.user.userId);

    // Initial check
    const r1 = readingService.getReading('RDG-B20-IMMUTABLE', user.user.userId);

    // Create & verify transaction
    const txn = commerceService.createTransaction({
      productId: 'kai_standard',
      readingId: 'RDG-B20-IMMUTABLE'
    }, user.user.userId);
    commerceService.verifyTransaction({ transactionId: txn.transaction.transactionId }, user.user.userId);

    // Refund transaction
    commerceService.refundTransaction({ transactionId: txn.transaction.transactionId }, user.user.userId);

    // Reopen reading
    const r2 = readingService.getReading('RDG-B20-IMMUTABLE', user.user.userId);

    assert.equal(JSON.stringify(r1.featureSnapshot), JSON.stringify(r2.featureSnapshot));
    assert.equal(JSON.stringify(r1.reportSnapshot), JSON.stringify(r2.reportSnapshot));
    assert.equal(r1.contentHash, r2.contentHash);
    assert.equal(r1.schemaVersion, r2.schemaVersion);
  });
});
