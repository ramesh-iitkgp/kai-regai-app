/**
 * Kai RegAI — Phase P11 Comprehensive Persistence & User History Verification Suite
 * Phase: P11 — Secure User, Session & Reading History Architecture
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { StorageSerializer } from '../../src/storage/StorageSerializer.js';
import { ReadingRecord, READING_STATUS, OWNER_TYPE } from '../../src/storage/ReadingSchema.js';
import { ReadingSchemaValidator } from '../../src/storage/ReadingSchemaValidator.js';
import { ReadingMigrationEngine } from '../../src/storage/ReadingMigrationEngine.js';
import { MemoryStorageProvider } from '../../src/storage/MemoryStorageProvider.js';
import { IndexedDBStorageProvider } from '../../src/storage/IndexedDBStorageProvider.js';
import { GuestIdentityProvider } from '../../src/auth/GuestIdentityProvider.js';
import { MockAuthProvider } from '../../src/auth/MockAuthProvider.js';
import { SyncQueue, SYNC_STATUS } from '../../src/sync/SyncQueue.js';
import { RemoteReadingStore } from '../../src/sync/RemoteReadingStore.js';
import { SyncEngine } from '../../src/sync/SyncEngine.js';
import { ReadingHistoryService } from '../../src/services/ReadingHistoryService.js';
import { GOLDEN_STORAGE_CASES, createSampleReport } from './golden/goldenStorageCases.js';

describe('P11.1 Canonical Serialization & Cryptographic Hashing', () => {
  it('canonicalizes object keys in alphabetical order', () => {
    const objA = { z: 1, a: 2, m: { b: 3, a: 4 } };
    const objB = { a: 2, m: { a: 4, b: 3 }, z: 1 };
    assert.equal(StorageSerializer.serialize(objA), StorageSerializer.serialize(objB));
  });

  it('computes deterministic SHA-256 content hashes', async () => {
    const payload = { readingId: 'RDG-1', reportTier: 'PREMIUM' };
    const hash1 = await StorageSerializer.computeHash(payload);
    const hash2 = await StorageSerializer.computeHash(payload);
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });
});

describe('P11.2 Reading Schema & Integrity Validation', () => {
  it('validates a complete ReadingRecord successfully', async () => {
    const { report } = createSampleReport('CASE-01');
    const record = new ReadingRecord({
      readingId: 'RDG-VALID-01',
      reportSnapshot: report,
      versions: { p8CodexVersion: '1.0.0', p9NarrationVersion: '1.0.0', p10ReportSchemaVersion: '1.0.0' }
    });
    record.contentHash = await StorageSerializer.computeHash(record.getHashPayload());

    const res = await ReadingSchemaValidator.validate(record, { verifyHash: true });
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  it('rejects records with unsupported schema version or missing reportSnapshot', async () => {
    const record = new ReadingRecord({
      schemaVersion: '2.0.0',
      status: READING_STATUS.COMPLETE,
      reportSnapshot: null
    });
    const res = await ReadingSchemaValidator.validate(record);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Unsupported schemaVersion')));
  });

  it('strictly rejects records containing raw biometric camera buffers', async () => {
    const record = new ReadingRecord({
      readingId: 'RDG-PRIVACY-VIOLATION',
      reportSnapshot: {},
      featureSnapshot: {
        rawFrame: 'data:image/png;base64,cameraBytes...'
      }
    });
    const res = await ReadingSchemaValidator.validate(record);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Biometric Privacy Violation')));
  });
});

describe('P11.3 Reading Migration Engine', () => {
  it('migrates legacy 0.9.0 record into 1.0.0 without data loss', async () => {
    const legacy = {
      readingId: 'LEGACY-01',
      title: 'Old Palm Reading',
      user_id: 'LEGACY-GUEST',
      summary: 'Legacy summary'
    };
    const migrated = await ReadingMigrationEngine.migrate(legacy);
    assert.equal(migrated.schemaVersion, '1.0.0');
    assert.equal(migrated.ownerId, 'LEGACY-GUEST');
    assert.equal(migrated.metadata.displayTitle, 'Old Palm Reading');
    assert.ok(migrated.contentHash.length > 0);
  });
});

describe('P11.4 Storage Providers (Memory & IndexedDB)', () => {
  it('executes CRUD operations in MemoryStorageProvider', async () => {
    const storage = new MemoryStorageProvider();
    await storage.init();

    const { report } = createSampleReport('CASE-01');
    const record = new ReadingRecord({ readingId: 'RDG-CRUD-01', reportSnapshot: report });
    await storage.saveReading(record);

    const fetched = await storage.getReading('RDG-CRUD-01');
    assert.equal(fetched.readingId, 'RDG-CRUD-01');

    const list = await storage.listReadings();
    assert.equal(list.total, 1);

    await storage.deleteReading('RDG-CRUD-01');
    assert.equal((await storage.getReading('RDG-CRUD-01')), null);
  });

  it('gracefully falls back when IndexedDB is unavailable', async () => {
    const idbStorage = new IndexedDBStorageProvider();
    await idbStorage.init();
    assert.ok(idbStorage.fallback instanceof MemoryStorageProvider);

    const { report } = createSampleReport('CASE-01');
    const record = new ReadingRecord({ readingId: 'RDG-FALLBACK-01', reportSnapshot: report });
    await idbStorage.saveReading(record);

    const fetched = await idbStorage.getReading('RDG-FALLBACK-01');
    assert.equal(fetched.readingId, 'RDG-FALLBACK-01');
  });
});

describe('P11.5 Identity, Guest Mode & Account Upgrade', () => {
  it('initializes anonymous guest identity with non-semantic ID', async () => {
    const storage = new MemoryStorageProvider();
    const guestProvider = new GuestIdentityProvider(storage);
    const guestId1 = await guestProvider.getOrCreateGuestId();
    const guestId2 = await guestProvider.getOrCreateGuestId();

    assert.equal(guestId1, guestId2);
    assert.ok(guestId1.startsWith('GST-'));
  });

  it('upgrades guest session to authenticated account and reassigns readings', async () => {
    const storage = new MemoryStorageProvider();
    const auth = new MockAuthProvider(storage);
    await auth.init();

    const guestId = (await auth.getCurrentUser()).ownerId;

    // Create guest reading
    const { report } = createSampleReport('CASE-01');
    const record = new ReadingRecord({ readingId: 'RDG-MIGRATE-01', ownerId: guestId, reportSnapshot: report });
    await storage.saveReading(record);

    // Upgrade
    const accountUser = await auth.upgradeGuestToAccount({ email: 'seeker@kairegai.com' });
    assert.equal(accountUser.ownerType, OWNER_TYPE.ACCOUNT);

    // Verify reading reassigned
    const updated = await storage.getReading('RDG-MIGRATE-01');
    assert.equal(updated.ownerId, accountUser.ownerId);
    assert.equal(updated.ownerType, OWNER_TYPE.ACCOUNT);
  });
});

describe('P11.6 Offline Sync Queue & Remote Store Security', () => {
  it('manages queue item states and bounded retry', async () => {
    const storage = new MemoryStorageProvider();
    const queue = new SyncQueue(storage);

    const item = await queue.enqueue({ readingId: 'RDG-SYNC-01', ownerId: 'USR-1', action: 'UPLOAD' });
    assert.equal(item.status, SYNC_STATUS.PENDING);

    await queue.markItemStatus(item.itemId, SYNC_STATUS.FAILED, 'Timeout');
    const pending = await queue.getPendingItems();
    assert.equal(pending[0].status, SYNC_STATUS.RETRY);
  });

  it('enforces IDOR protection on remote reading store', async () => {
    const remote = new RemoteReadingStore();
    const { report } = createSampleReport('CASE-01');
    const record = new ReadingRecord({ readingId: 'RDG-REMOTE-01', ownerId: 'USR-ALICE', reportSnapshot: report });

    await remote.saveReading(record, 'USR-ALICE');

    await assert.rejects(
      async () => { await remote.getReading('RDG-REMOTE-01', 'USR-EVE'); },
      /IDOR Protection/
    );
  });

  it('supports idempotent upload deduplication', async () => {
    const remote = new RemoteReadingStore();
    const { report } = createSampleReport('CASE-01');
    const record = new ReadingRecord({
      readingId: 'RDG-IDEM-01',
      ownerId: 'USR-BOB',
      contentHash: 'hash-123',
      reportSnapshot: report
    });

    const res1 = await remote.saveReading(record, 'USR-BOB');
    const res2 = await remote.saveReading(record, 'USR-BOB');
    assert.equal(res1.isDuplicate, false);
    assert.equal(res2.isDuplicate, true);
  });
});

describe('P11.7 Reading History Master Service', () => {
  it('records completed report atomically and lists paginated history', async () => {
    const storage = new MemoryStorageProvider();
    const auth = new MockAuthProvider(storage);
    const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
    await service.init();

    const { report, dossier, narrated } = createSampleReport('CASE-01');
    const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });
    assert.ok(saved.readingId);

    const history = await service.listHistory();
    assert.equal(history.total, 1);
    assert.equal(history.records[0].readingId, saved.readingId);
  });

  it('reopens historical reading without AI or P8 re-run', async () => {
    const storage = new MemoryStorageProvider();
    const auth = new MockAuthProvider(storage);
    const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
    await service.init();

    const { report, dossier, narrated } = createSampleReport('CASE-01');
    const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

    const reopened = await service.reopenReport(saved.readingId);
    assert.equal(reopened.reportId, report.reportId);
    assert.equal(reopened.summary.headline, report.summary.headline);
  });

  it('exports and imports structured JSON archives with validation', async () => {
    const storage = new MemoryStorageProvider();
    const auth = new MockAuthProvider(storage);
    const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
    await service.init();

    const { report, dossier, narrated } = createSampleReport('CASE-01');
    await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

    const exportedJSON = await service.exportArchiveJSON();
    assert.ok(exportedJSON.includes('archiveVersion'));

    // Clear and re-import
    await storage.clearAll();
    assert.equal((await service.listHistory()).total, 0);

    const importRes = await service.importArchiveJSON(exportedJSON);
    assert.equal(importRes.imported, 1);
    assert.equal((await service.listHistory()).total, 1);
  });

  it('purges all data on 1-tap data erase', async () => {
    const storage = new MemoryStorageProvider();
    const auth = new MockAuthProvider(storage);
    const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
    await service.init();

    const { report, dossier, narrated } = createSampleReport('CASE-01');
    await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

    await service.purgeAllData();
    assert.equal((await service.listHistory()).total, 0);
  });
});

describe('P11.8 Golden Persistence Corpus (15 Authoritative Cases)', () => {
  for (const testCase of GOLDEN_STORAGE_CASES) {
    it(`evaluates ${testCase.name} (${testCase.id})`, async () => {
      const result = await testCase.run();
      for (const [key, expectedVal] of Object.entries(testCase.expected)) {
        assert.equal(
          result[key],
          expectedVal,
          `Mismatch in ${testCase.id} for property '${key}': expected ${expectedVal}, got ${result[key]}`
        );
      }
    });
  }
});
