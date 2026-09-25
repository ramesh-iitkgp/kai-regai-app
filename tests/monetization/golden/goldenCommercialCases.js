/**
 * Kai RegAI — Golden Commercial Corpus (15 Authoritative Test Cases)
 * Phase: P12 — Monetization & Entitlement Architecture
 */

import { EntitlementService } from '../../../src/monetization/EntitlementService.js';
import { MemoryStorageProvider } from '../../../src/storage/MemoryStorageProvider.js';
import { MockAuthProvider } from '../../../src/auth/MockAuthProvider.js';
import { MockPaymentProvider, MOCK_SIMULATION_MODE } from '../../../src/monetization/MockPaymentProvider.js';
import { defaultProductCatalog } from '../../../src/monetization/ProductCatalog.js';
import { defaultAccessPolicy } from '../../../src/monetization/AccessPolicy.js';
import { ReadingRecord } from '../../../src/storage/ReadingSchema.js';
import { 
  FEATURE_KEYS, 
  ACCESS_DECISION, 
  PRODUCT_TIERS, 
  TRANSACTION_STATUS, 
  ENTITLEMENT_STATUS 
} from '../../../src/monetization/types.js';

export async function setupTestEnvironment(options = {}) {
  const storage = new MemoryStorageProvider();
  await storage.init();

  const auth = new MockAuthProvider(storage);
  await auth.init();

  const payment = new MockPaymentProvider({
    defaultMode: options.paymentMode || MOCK_SIMULATION_MODE.SUCCESS
  });
  await payment.init();

  const service = new EntitlementService({
    storageProvider: storage,
    authProvider: auth,
    paymentProvider: payment,
    productCatalog: defaultProductCatalog,
    accessPolicy: defaultAccessPolicy
  });
  await service.init();

  return { storage, auth, payment, service };
}

export const GOLDEN_COMMERCIAL_CASES = [
  {
    id: 'GOLDEN_COM_01_FREE_READING',
    name: 'Case 01 — Baseline Free Reading Access & Paywall Gating',
    async run() {
      const { service } = await setupTestEnvironment();
      const readingId = 'RDG-FREE-01';

      const quickDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.QUICK_REPORT);
      const detailedDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);
      const pdfDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PDF_EXPORT);

      return {
        quickAccess: quickDecision.decision,
        detailedAccess: detailedDecision.decision,
        pdfAccess: pdfDecision.decision,
        detailedRequiredTier: detailedDecision.requiredTier
      };
    },
    expected: {
      quickAccess: ACCESS_DECISION.ALLOW,
      detailedAccess: ACCESS_DECISION.REQUIRES_PURCHASE,
      pdfAccess: ACCESS_DECISION.REQUIRES_PURCHASE,
      detailedRequiredTier: PRODUCT_TIERS.STANDARD
    }
  },
  {
    id: 'GOLDEN_COM_02_STANDARD_PURCHASE',
    name: 'Case 02 — Standard Tier Purchase Unlocks Chapter I & II and PDF',
    async run() {
      const { service } = await setupTestEnvironment();
      const readingId = 'RDG-STD-02';

      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_standard',
        readingId,
        currency: 'INR'
      });

      const detailedDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);
      const pdfDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PDF_EXPORT);
      const premiumDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);

      return {
        purchaseSuccess: purchaseRes.success,
        entitlementTier: purchaseRes.entitlement?.tier,
        detailedAccess: detailedDecision.decision,
        pdfAccess: pdfDecision.decision,
        premiumAccess: premiumDecision.decision
      };
    },
    expected: {
      purchaseSuccess: true,
      entitlementTier: PRODUCT_TIERS.STANDARD,
      detailedAccess: ACCESS_DECISION.ALLOW,
      pdfAccess: ACCESS_DECISION.ALLOW,
      premiumAccess: ACCESS_DECISION.REQUIRES_PURCHASE
    }
  },
  {
    id: 'GOLDEN_COM_03_PREMIUM_PURCHASE',
    name: 'Case 03 — Master Premium Purchase Unlocks All Chapters & Features',
    async run() {
      const { service } = await setupTestEnvironment();
      const readingId = 'RDG-PREM-03';

      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_premium',
        readingId,
        currency: 'USD'
      });

      const premiumDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);
      const guidanceDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.CHAPTER_GUIDANCE);
      const socialDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.SOCIAL_CARD);
      const markingsDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.SACRED_MARKINGS);

      return {
        purchaseSuccess: purchaseRes.success,
        entitlementTier: purchaseRes.entitlement?.tier,
        premiumAccess: premiumDecision.decision,
        guidanceAccess: guidanceDecision.decision,
        socialAccess: socialDecision.decision,
        markingsAccess: markingsDecision.decision
      };
    },
    expected: {
      purchaseSuccess: true,
      entitlementTier: PRODUCT_TIERS.PREMIUM,
      premiumAccess: ACCESS_DECISION.ALLOW,
      guidanceAccess: ACCESS_DECISION.ALLOW,
      socialAccess: ACCESS_DECISION.ALLOW,
      markingsAccess: ACCESS_DECISION.ALLOW
    }
  },
  {
    id: 'GOLDEN_COM_04_PURCHASE_PENDING',
    name: 'Case 04 — Asynchronous Pending Purchase Verification',
    async run() {
      const { service, payment } = await setupTestEnvironment({
        paymentMode: MOCK_SIMULATION_MODE.PENDING
      });
      const readingId = 'RDG-PEND-04';

      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_standard',
        readingId
      });

      const accessBefore = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);

      // Complete verification
      const verifyRes = await service.verifyPurchase(purchaseRes.transaction.transactionId);
      const accessAfter = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);

      return {
        initialStatus: purchaseRes.transaction.status,
        accessBefore: accessBefore.decision,
        verifySuccess: verifyRes.verified,
        accessAfter: accessAfter.decision
      };
    },
    expected: {
      initialStatus: TRANSACTION_STATUS.PENDING,
      accessBefore: ACCESS_DECISION.PENDING,
      verifySuccess: true,
      accessAfter: ACCESS_DECISION.ALLOW
    }
  },
  {
    id: 'GOLDEN_COM_05_PURCHASE_FAILURE',
    name: 'Case 05 — Payment Gateway Failure Leaves Reading Unaltered',
    async run() {
      const { service } = await setupTestEnvironment({
        paymentMode: MOCK_SIMULATION_MODE.FAILED
      });
      const readingId = 'RDG-FAIL-05';

      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_premium',
        readingId
      });

      const accessDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);

      return {
        purchaseSuccess: purchaseRes.success,
        txnStatus: purchaseRes.transaction.status,
        accessDecision: accessDecision.decision
      };
    },
    expected: {
      purchaseSuccess: false,
      txnStatus: TRANSACTION_STATUS.FAILED,
      accessDecision: ACCESS_DECISION.REQUIRES_PURCHASE
    }
  },
  {
    id: 'GOLDEN_COM_06_PURCHASE_CANCELLED',
    name: 'Case 06 — User Aborted Checkout Session Handling',
    async run() {
      const { service } = await setupTestEnvironment({
        paymentMode: MOCK_SIMULATION_MODE.CANCELLED
      });
      const readingId = 'RDG-CANCEL-06';

      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_standard',
        readingId
      });

      const accessDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);

      return {
        purchaseSuccess: purchaseRes.success,
        txnStatus: purchaseRes.transaction.status,
        accessDecision: accessDecision.decision
      };
    },
    expected: {
      purchaseSuccess: false,
      txnStatus: TRANSACTION_STATUS.CANCELLED,
      accessDecision: ACCESS_DECISION.REQUIRES_PURCHASE
    }
  },
  {
    id: 'GOLDEN_COM_07_DUPLICATE_IDEMPOTENCY',
    name: 'Case 07 — Duplicate Transaction Idempotency Prevents Double Charge',
    async run() {
      const { service, storage } = await setupTestEnvironment();
      const idempotencyKey = 'IDEM-TEST-12345';
      const readingId = 'RDG-DUP-07';

      const firstRes = await service.purchaseProduct({
        productId: 'kai_premium',
        readingId,
        idempotencyKey
      });

      const secondRes = await service.purchaseProduct({
        productId: 'kai_premium',
        readingId,
        idempotencyKey
      });

      const allTxns = await storage.listTransactions();
      const allEnts = await storage.listEntitlements();

      return {
        firstTxnId: firstRes.transaction.transactionId,
        secondTxnId: secondRes.transaction.transactionId,
        isDuplicateFlag: secondRes.isDuplicate,
        totalPersistedTransactions: allTxns.length,
        totalPersistedEntitlements: allEnts.length
      };
    },
    expected: {
      firstTxnId: 'MATCH', // compared in assertion
      secondTxnId: 'MATCH',
      isDuplicateFlag: true,
      totalPersistedTransactions: 1,
      totalPersistedEntitlements: 1
    }
  },
  {
    id: 'GOLDEN_COM_08_RESTORE_PURCHASES',
    name: 'Case 08 — Restore Verified Purchases Re-establishes Entitlements',
    async run() {
      const { service, storage, auth } = await setupTestEnvironment();
      const readingId = 'RDG-RESTORE-08';

      // 1. Initial purchase
      await service.purchaseProduct({ productId: 'kai_standard', readingId });

      // 2. Clear local entitlements (simulate cache wipe)
      const user = await auth.getCurrentUser();
      const ents = await storage.listEntitlements({ ownerId: user.ownerId });
      for (const e of ents) {
        await storage.deleteEntitlement(e.entitlementId);
      }

      // Check access lost temporarily
      const accessBefore = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);

      // 3. Restore
      const restoreRes = await service.restorePurchases();
      const accessAfter = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);

      return {
        accessBefore: accessBefore.decision,
        restoredCount: restoreRes.restoredCount,
        accessAfter: accessAfter.decision
      };
    },
    expected: {
      accessBefore: ACCESS_DECISION.REQUIRES_PURCHASE,
      restoredCount: 1,
      accessAfter: ACCESS_DECISION.ALLOW
    }
  },
  {
    id: 'GOLDEN_COM_09_REFUND_NON_DESTRUCTIVE',
    name: 'Case 09 — Refund Revokes Access Without Deleting Historical Reading',
    async run() {
      const { service, storage } = await setupTestEnvironment();
      const readingId = 'RDG-REFUND-09';

      // Seed a reading record in storage
      const readingRecord = new ReadingRecord({
        readingId,
        reportSnapshot: { reportId: readingId, title: 'Preserved Palm Reading' }
      });
      await storage.saveReading(readingRecord);

      // Purchase Premium
      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_premium',
        readingId
      });

      const accessBefore = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);

      // Process refund
      const refundRes = await service.refundTransaction(purchaseRes.transaction.transactionId);
      const accessAfter = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);
      const persistedReading = await storage.getReading(readingId);

      return {
        accessBefore: accessBefore.decision,
        refundTxnStatus: refundRes.transaction.status,
        refundEntStatus: refundRes.entitlement?.status,
        accessAfter: accessAfter.decision,
        readingStillExists: persistedReading !== null
      };
    },
    expected: {
      accessBefore: ACCESS_DECISION.ALLOW,
      refundTxnStatus: TRANSACTION_STATUS.REFUNDED,
      refundEntStatus: ENTITLEMENT_STATUS.REFUNDED,
      accessAfter: ACCESS_DECISION.REQUIRES_PURCHASE,
      readingStillExists: true
    }
  },
  {
    id: 'GOLDEN_COM_10_ENTITLEMENT_EXPIRATION',
    name: 'Case 10 — Entitlement Expiration Enforces Gating at Deadline',
    async run() {
      const { service, storage, auth } = await setupTestEnvironment();
      const readingId = 'RDG-EXPIRY-10';
      const user = await auth.getCurrentUser();

      // Grant entitlement expired 1 hour ago
      const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
      const expiredEnt = await service.grantPromotionalEntitlement({
        ownerId: user.ownerId,
        readingId,
        productId: 'kai_premium',
        expiresAt: pastDate
      });

      const isExpiredMethod = expiredEnt.isExpired();
      const accessDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);

      return {
        isExpiredMethod,
        accessDecision: accessDecision.decision
      };
    },
    expected: {
      isExpiredMethod: true,
      accessDecision: ACCESS_DECISION.REQUIRES_PURCHASE
    }
  },
  {
    id: 'GOLDEN_COM_11_GUEST_PURCHASE',
    name: 'Case 11 — Anonymous Guest Reading Checkout Flow',
    async run() {
      const { service, auth } = await setupTestEnvironment();
      const readingId = 'RDG-GST-11';
      const guestUser = await auth.getCurrentUser();

      const isGuestIdentity = guestUser.ownerId.startsWith('GST-');

      const purchaseRes = await service.purchaseProduct({
        productId: 'kai_standard',
        readingId
      });

      const accessDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);

      return {
        isGuestIdentity,
        entitlementOwnerId: purchaseRes.entitlement?.ownerId,
        accessDecision: accessDecision.decision
      };
    },
    expected: {
      isGuestIdentity: true,
      entitlementOwnerId: 'GUEST_MATCH',
      accessDecision: ACCESS_DECISION.ALLOW
    }
  },
  {
    id: 'GOLDEN_COM_12_GUEST_TO_ACCOUNT_UPGRADE',
    name: 'Case 12 — Guest-to-Account Upgrade Migrates Commercial Entitlements',
    async run() {
      const { service, auth, storage } = await setupTestEnvironment();
      const readingId = 'RDG-UPGRADE-12';
      const guestId = (await auth.getCurrentUser()).ownerId;

      // Guest purchases premium
      await service.purchaseProduct({
        productId: 'kai_premium',
        readingId
      });

      // Guest signs up for an account
      const accountUser = await auth.upgradeGuestToAccount({ email: 'seeker@kairegai.com' });

      // Verify entitlement reassigned to new account ownerId
      const accountEnts = await service.getEntitlements(accountUser.ownerId);
      const accessDecision = await service.evaluateAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT);

      return {
        newOwnerId: accountUser.ownerId.startsWith('USR-'),
        totalAccountEntitlements: accountEnts.length,
        migratedEntOwner: accountEnts[0]?.ownerId,
        accessDecision: accessDecision.decision
      };
    },
    expected: {
      newOwnerId: true,
      totalAccountEntitlements: 1,
      migratedEntOwner: 'ACCOUNT_MATCH',
      accessDecision: ACCESS_DECISION.ALLOW
    }
  },
  {
    id: 'GOLDEN_COM_13_IDOR_PREVENTION',
    name: 'Case 13 — IDOR Protection Blocks Cross-Account Reading Hijacking',
    async run() {
      const { service, storage } = await setupTestEnvironment();
      const readingId = 'RDG-ALICE-13';

      // User Alice purchases premium
      await service.grantPromotionalEntitlement({
        ownerId: 'USR-ALICE',
        readingId,
        productId: 'kai_premium'
      });

      // User Eve attempts to access Alice's reading
      const eveEnts = await service.getEntitlements('USR-EVE');
      const eveDecision = defaultAccessPolicy.evaluate({
        featureKey: FEATURE_KEYS.PREMIUM_REPORT,
        ownerId: 'USR-EVE',
        readingId,
        entitlements: eveEnts
      });

      return {
        eveEntitlementsCount: eveEnts.length,
        eveAccessDecision: eveDecision.decision
      };
    },
    expected: {
      eveEntitlementsCount: 0,
      eveAccessDecision: ACCESS_DECISION.REQUIRES_PURCHASE
    }
  },
  {
    id: 'GOLDEN_COM_14_OFFLINE_REOPEN',
    name: 'Case 14 — Offline Entitlement Cache Evaluation with Zero Latency',
    async run() {
      const { service } = await setupTestEnvironment();
      const readingId = 'RDG-OFFLINE-14';

      await service.purchaseProduct({ productId: 'kai_standard', readingId });

      // Simulate offline query by timing local access evaluation
      const t0 = performance.now();
      const decision = await service.evaluateAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);
      const elapsedMs = performance.now() - t0;

      return {
        decision: decision.decision,
        isFast: elapsedMs < 5.0
      };
    },
    expected: {
      decision: ACCESS_DECISION.ALLOW,
      isFast: true
    }
  },
  {
    id: 'GOLDEN_COM_15_HISTORICAL_REPORT_PRESERVED',
    name: 'Case 15 — Historical Report Reopening Preserves Canonical Observations',
    async run() {
      const { service, storage } = await setupTestEnvironment();
      const readingId = 'RDG-HIST-15';

      const sampleReport = {
        reportId: readingId,
        schemaVersion: '1.0.0',
        summary: { title: 'Authentic Palm Reading', headline: 'Insightful' },
        sections: [
          { id: 'sec-1', title: 'Constitutional Matrix', narrative: 'Deep Fire essence.' },
          { id: 'sec-2', title: 'Karmic Vocation', narrative: 'Pragmatic leadership.' },
          { id: 'sec-3', title: 'Contemplative Counsel', narrative: 'Mindful equilibrium.' }
        ]
      };

      // 1. Free view (Gated presentation)
      const freeGatedView = await service.getReportAccessView(sampleReport);

      // 2. Purchase Standard
      await service.purchaseProduct({ productId: 'kai_standard', readingId });
      const standardGatedView = await service.getReportAccessView(sampleReport);

      // 3. Purchase Premium
      await service.purchaseProduct({ productId: 'kai_premium', readingId });
      const premiumGatedView = await service.getReportAccessView(sampleReport);

      return {
        freeSec1Locked: freeGatedView.sections[0].isLocked,
        freeSec2Locked: freeGatedView.sections[1].isLocked,
        stdSec2Locked: standardGatedView.sections[1].isLocked,
        stdSec3Locked: standardGatedView.sections[2].isLocked,
        premSec3Locked: premiumGatedView.sections[2].isLocked,
        premFullyUnlocked: premiumGatedView.isFullyUnlocked
      };
    },
    expected: {
      freeSec1Locked: false,
      freeSec2Locked: true,
      stdSec2Locked: false,
      stdSec3Locked: true,
      premSec3Locked: false,
      premFullyUnlocked: true
    }
  }
];
