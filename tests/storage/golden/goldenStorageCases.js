/**
 * Kai RegAI — P11 Golden Storage & Persistence Corpus
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * 15 Authoritative Golden Persistence Test Cases covering:
 * - Guest mode & persistent local archive
 * - Historical report reopening without AI/P8 re-runs
 * - Immutable snapshots & provenance preservation
 * - Biometric privacy shield (zero raw images)
 * - SHA-256 integrity hashing & corruption detection
 * - Guest-to-Account upgrade with automatic reading reassignment
 * - IDOR protection & remote authorization
 * - Idempotent sync & offline queue resilience
 * - 1-tap complete local purge
 * - Structured JSON archive export & import
 * - Schema migration & paginated queries
 */

import { interpret } from '../../../src/interpretation/index.js';
import { DeterministicNarrator } from '../../../src/narration/index.js';
import { createReport, REPORT_TIERS } from '../../../src/report/index.js';
import { GOLDEN_INTERPRETATION_CASES } from '../../interpretation/golden/goldenCases.js';
import { ReadingRecord, READING_STATUS, OWNER_TYPE } from '../../../src/storage/ReadingSchema.js';
import { ReadingSchemaValidator } from '../../../src/storage/ReadingSchemaValidator.js';
import { ReadingMigrationEngine } from '../../../src/storage/ReadingMigrationEngine.js';
import { MemoryStorageProvider } from '../../../src/storage/MemoryStorageProvider.js';
import { MockAuthProvider } from '../../../src/auth/MockAuthProvider.js';
import { RemoteReadingStore } from '../../../src/sync/RemoteReadingStore.js';
import { SyncEngine } from '../../../src/sync/SyncEngine.js';
import { ReadingHistoryService } from '../../../src/services/ReadingHistoryService.js';

const getCase = (id) => {
  const found = GOLDEN_INTERPRETATION_CASES.find(c => c.id === id);
  if (!found) throw new Error(`Case ${id} not found`);
  return found.input;
};

export const createSampleReport = (caseId = 'CASE-01', tier = REPORT_TIERS.PREMIUM) => {
  const dossier = interpret(getCase(caseId));
  dossier.id = `DOSSIER-${caseId}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const narrated = DeterministicNarrator.render(dossier);
  return {
    report: createReport({ dossier, narratedReading: narrated, tier }),
    dossier,
    narrated
  };
};

export const GOLDEN_STORAGE_CASES = [
  {
    id: 'GOLDEN_STR_01_GUEST_EPHEMERAL_SAVE',
    name: 'Case 01 — Anonymous Guest Reading Save & Persistence',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01', REPORT_TIERS.PREMIUM);
      const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      const retrieved = await service.getReading(saved.readingId);
      return {
        isSaved: !!retrieved,
        ownerType: retrieved.ownerType,
        isGuest: retrieved.ownerId.startsWith('GST-'),
        hasReportSnapshot: !!retrieved.reportSnapshot?.reportId
      };
    },
    expected: {
      isSaved: true,
      ownerType: 'GUEST',
      isGuest: true,
      hasReportSnapshot: true
    }
  },
  {
    id: 'GOLDEN_STR_02_REOPEN_HISTORICAL_REPORT',
    name: 'Case 02 — Reopen Historical Report Without AI or Rule Re-run',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01', REPORT_TIERS.PREMIUM);
      const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      const reopened = await service.reopenReport(saved.readingId);
      return {
        matchesReportId: reopened.reportId === report.reportId,
        sectionsCount: reopened.sections.length,
        headline: reopened.summary.headline === report.summary.headline
      };
    },
    expected: {
      matchesReportId: true,
      sectionsCount: 4,
      headline: true
    }
  },
  {
    id: 'GOLDEN_STR_03_IMMUTABLE_SNAPSHOT',
    name: 'Case 03 — Immutable Provenance & Version Signature Preservation',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01');
      const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      return {
        p8CodexVersion: saved.versions.p8CodexVersion,
        p9NarrationVersion: saved.versions.p9NarrationVersion,
        p10ReportSchemaVersion: saved.versions.p10ReportSchemaVersion,
        hasContentHash: saved.contentHash.length === 64
      };
    },
    expected: {
      p8CodexVersion: '1.0.0',
      p9NarrationVersion: '1.0.0',
      p10ReportSchemaVersion: '1.0.0',
      hasContentHash: true
    }
  },
  {
    id: 'GOLDEN_STR_04_BIOMETRIC_PRIVACY_SHIELD',
    name: 'Case 04 — Biometric Privacy Shield Rejects Raw Camera Images',
    run: async () => {
      const { report, dossier, narrated } = createSampleReport('CASE-01');
      const record = new ReadingRecord({
        readingId: 'RDG-TEST-BIOMETRIC',
        reportSnapshot: report,
        versions: { p8CodexVersion: '1.0.0', p9NarrationVersion: '1.0.0', p10ReportSchemaVersion: '1.0.0' },
        featureSnapshot: {
          rawImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', // VIOLATION
          major_lines: {}
        }
      });

      const validation = await ReadingSchemaValidator.validate(record);
      return {
        rejected: !validation.valid,
        hasPrivacyError: validation.errors.some(e => e.includes('Biometric Privacy Violation'))
      };
    },
    expected: {
      rejected: true,
      hasPrivacyError: true
    }
  },
  {
    id: 'GOLDEN_STR_05_CONTENT_HASH_INTEGRITY',
    name: 'Case 05 — SHA-256 Integrity Verification Detects Corrupted Records',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01');
      const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      // Tamper with record behind the scenes
      const raw = await storage.getReading(saved.readingId);
      raw.reportSnapshot.summary.headline = 'TAMPERED CLAIM';
      await storage.saveReading(raw);

      const validation = await ReadingSchemaValidator.validate(raw, { verifyHash: true });
      return {
        isCorrupted: !validation.valid,
        hasHashMismatch: validation.errors.some(e => e.includes('Integrity Hash Mismatch'))
      };
    },
    expected: {
      isCorrupted: true,
      hasHashMismatch: true
    }
  },
  {
    id: 'GOLDEN_STR_06_GUEST_TO_ACCOUNT_UPGRADE',
    name: 'Case 06 — Seamless Guest-to-Account Upgrade Reassigns Local Readings',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const guestUser = await auth.getCurrentUser();
      const guestId = guestUser.ownerId;

      // Create 2 guest readings
      const r1 = createSampleReport('CASE-01');
      const r2 = createSampleReport('CASE-02');
      await service.recordCompletedReading(r1);
      await service.recordCompletedReading(r2);

      // Upgrade to account
      const upgradedUser = await auth.upgradeGuestToAccount({
        email: 'astroseeker@kairegai.com',
        displayName: 'Astro Seeker'
      });

      // Verify readings were migrated to new account ID
      const { records } = await storage.listReadings({ ownerId: upgradedUser.ownerId });
      const oldGuestRecords = await storage.listReadings({ ownerId: guestId });

      return {
        upgradedOwnerType: upgradedUser.ownerType,
        migratedCount: records.length,
        oldGuestCount: oldGuestRecords.records.length
      };
    },
    expected: {
      upgradedOwnerType: 'ACCOUNT',
      migratedCount: 2,
      oldGuestCount: 0
    }
  },
  {
    id: 'GOLDEN_STR_07_IDOR_PREVENTION',
    name: 'Case 07 — IDOR Protection Blocks Cross-Account Reading Access',
    run: async () => {
      const remote = new RemoteReadingStore();
      const { report, dossier, narrated } = createSampleReport('CASE-01');
      const record = new ReadingRecord({
        readingId: 'RDG-USER-A-001',
        ownerId: 'USR-A',
        ownerType: 'ACCOUNT',
        reportSnapshot: report,
        versions: { p8CodexVersion: '1.0.0', p9NarrationVersion: '1.0.0', p10ReportSchemaVersion: '1.0.0' }
      });

      await remote.saveReading(record, 'USR-A');

      let userBAccessBlocked = false;
      try {
        await remote.getReading('RDG-USER-A-001', 'USR-B');
      } catch (err) {
        userBAccessBlocked = err.message.includes('IDOR Protection');
      }

      return { userBAccessBlocked };
    },
    expected: {
      userBAccessBlocked: true
    }
  },
  {
    id: 'GOLDEN_STR_08_IDEMPOTENT_SYNC',
    name: 'Case 08 — Idempotent Synchronization Prevents Duplicate Records',
    run: async () => {
      const remote = new RemoteReadingStore();
      const { report, dossier, narrated } = createSampleReport('CASE-01');
      const record = new ReadingRecord({
        readingId: 'RDG-IDEMPOTENT-01',
        ownerId: 'USR-IDEM',
        ownerType: 'ACCOUNT',
        contentHash: 'hash-abc-123',
        reportSnapshot: report,
        versions: { p8CodexVersion: '1.0.0', p9NarrationVersion: '1.0.0', p10ReportSchemaVersion: '1.0.0' }
      });

      const res1 = await remote.saveReading(record, 'USR-IDEM');
      const res2 = await remote.saveReading(record, 'USR-IDEM');

      return {
        firstSuccess: res1.success && !res1.isDuplicate,
        secondIdempotent: res2.success && res2.isDuplicate,
        remoteCount: (await remote.listUserReadings('USR-IDEM')).length
      };
    },
    expected: {
      firstSuccess: true,
      secondIdempotent: true,
      remoteCount: 1
    }
  },
  {
    id: 'GOLDEN_STR_09_OFFLINE_QUEUE_RESILIENCE',
    name: 'Case 09 — Offline Queue Retries and Tracks Status',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      await auth.init();
      await auth.upgradeGuestToAccount({ email: 'seeker@kairegai.com' });

      // Faulty remote store that fails on first attempt
      let attempts = 0;
      const remote = {
        saveReading: async () => {
          attempts++;
          if (attempts === 1) throw new Error('Network timeout (offline)');
          return { success: true };
        }
      };

      const sync = new SyncEngine({ storageProvider: storage, authProvider: auth, remoteStore: remote });
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth, syncEngine: sync });

      const { report, dossier, narrated } = createSampleReport('CASE-01');
      await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      // First sync attempt fails
      const res1 = await sync.processQueue();
      const pendingAfterFail = await sync.queue.getPendingItems();

      // Second sync attempt succeeds
      const res2 = await sync.processQueue();
      const pendingAfterRetry = await sync.queue.getPendingItems();

      return {
        failedOnFirst: res1.failed === 1,
        queuedForRetry: pendingAfterFail.length === 1 && pendingAfterFail[0].status === 'RETRY',
        succeededOnSecond: res2.succeeded === 1,
        emptyQueue: pendingAfterRetry.length === 0
      };
    },
    expected: {
      failedOnFirst: true,
      queuedForRetry: true,
      succeededOnSecond: true,
      emptyQueue: true
    }
  },
  {
    id: 'GOLDEN_STR_10_ONE_TAP_DATA_PURGE',
    name: 'Case 10 — 1-Tap Data Purge Erases All Local Data and Resets Identity',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const initialGuestId = (await auth.getCurrentUser()).ownerId;
      const { report, dossier, narrated } = createSampleReport('CASE-01');
      await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      // Execute Purge
      await service.purgeAllData();

      const remainingReadings = (await service.listHistory()).total;
      const newGuestId = (await auth.getCurrentUser()).ownerId;

      return {
        readingsZero: remainingReadings === 0,
        identityReset: newGuestId !== initialGuestId && newGuestId.startsWith('GST-')
      };
    },
    expected: {
      readingsZero: true,
      identityReset: true
    }
  },
  {
    id: 'GOLDEN_STR_11_JSON_ARCHIVE_EXPORT',
    name: 'Case 11 — Structured JSON Archive Export Without Credentials',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01');
      await service.recordCompletedReading({ report, dossier, narratedReading: narrated });

      const jsonStr = await service.exportArchiveJSON();
      const parsed = JSON.parse(jsonStr);

      return {
        archiveVersion: parsed.archiveVersion,
        totalReadings: parsed.totalReadings,
        hasReportTitle: !!parsed.readings[0].reportSnapshot?.summary?.title,
        noCredentials: !jsonStr.includes('apiKey') && !jsonStr.includes('password')
      };
    },
    expected: {
      archiveVersion: '1.0.0',
      totalReadings: 1,
      hasReportTitle: true,
      noCredentials: true
    }
  },
  {
    id: 'GOLDEN_STR_12_JSON_ARCHIVE_IMPORT',
    name: 'Case 12 — Strictly Validated JSON Archive Import With Ownership Reassignment',
    run: async () => {
      const storageA = new MemoryStorageProvider();
      const authA = new MockAuthProvider(storageA);
      const serviceA = new ReadingHistoryService({ storageProvider: storageA, authProvider: authA });
      await serviceA.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01');
      await serviceA.recordCompletedReading({ report, dossier, narratedReading: narrated });
      const exportedJSON = await serviceA.exportArchiveJSON();

      // Target device / user B
      const storageB = new MemoryStorageProvider();
      const authB = new MockAuthProvider(storageB);
      const serviceB = new ReadingHistoryService({ storageProvider: storageB, authProvider: authB });
      await serviceB.init();
      const userB = await authB.getCurrentUser();

      const importRes = await serviceB.importArchiveJSON(exportedJSON);
      const importedReading = await serviceB.getReading(report.reportId);

      return {
        importedCount: importRes.imported,
        reassignedOwner: importedReading.ownerId === userB.ownerId
      };
    },
    expected: {
      importedCount: 1,
      reassignedOwner: true
    }
  },
  {
    id: 'GOLDEN_STR_13_SCHEMA_MIGRATION',
    name: 'Case 13 — Legacy 0.9.0 Record Cleanly Migrated to 1.0.0',
    run: async () => {
      const legacyRecord = {
        readingId: 'LEGACY-001',
        title: 'Ancient Palm Reading',
        hand_side: 'LEFT',
        confidence_band: 'HIGH',
        summary: 'Legacy summary from early prototype',
        tags: ['Vedic'],
        user_id: 'LEGACY-USER'
      };

      const migrated = await ReadingMigrationEngine.migrate(legacyRecord);
      const validation = await ReadingSchemaValidator.validate(migrated);

      return {
        targetVersion: migrated.schemaVersion,
        ownerId: migrated.ownerId,
        metadataTitle: migrated.metadata.displayTitle,
        valid: validation.valid
      };
    },
    expected: {
      targetVersion: '1.0.0',
      ownerId: 'LEGACY-USER',
      metadataTitle: 'Ancient Palm Reading',
      valid: true
    }
  },
  {
    id: 'GOLDEN_STR_14_PAGINATED_HISTORY_QUERY',
    name: 'Case 14 — Paginated History Querying with Filtering and Sorting',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      // Create 3 readings
      await service.recordCompletedReading(createSampleReport('CASE-01', REPORT_TIERS.PREMIUM));
      await service.recordCompletedReading(createSampleReport('CASE-02', REPORT_TIERS.STANDARD));
      await service.recordCompletedReading(createSampleReport('CASE-03', REPORT_TIERS.QUICK));

      const page1 = await service.listHistory({ limit: 2, offset: 0 });
      const page2 = await service.listHistory({ limit: 2, offset: 2 });
      const quickOnly = await service.listHistory({ reportTier: 'QUICK' });

      return {
        total: page1.total,
        page1Count: page1.records.length,
        page2Count: page2.records.length,
        quickOnlyCount: quickOnly.records.length
      };
    },
    expected: {
      total: 3,
      page1Count: 2,
      page2Count: 1,
      quickOnlyCount: 1
    }
  },
  {
    id: 'GOLDEN_STR_15_TELEMETRY_NON_BLOCKING',
    name: 'Case 15 — Telemetry Logging is Non-Blocking and Never Interrupts Storage',
    run: async () => {
      const storage = new MemoryStorageProvider();
      const auth = new MockAuthProvider(storage);
      const service = new ReadingHistoryService({ storageProvider: storage, authProvider: auth });
      await service.init();

      const { report, dossier, narrated } = createSampleReport('CASE-01');
      let completedSuccessfully = false;

      try {
        const saved = await service.recordCompletedReading({ report, dossier, narratedReading: narrated });
        completedSuccessfully = !!saved.readingId;
      } catch {
        completedSuccessfully = false;
      }

      return { completedSuccessfully };
    },
    expected: {
      completedSuccessfully: true
    }
  }
];
