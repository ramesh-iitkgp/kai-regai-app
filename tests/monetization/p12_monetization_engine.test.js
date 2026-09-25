/**
 * Kai RegAI — Phase P12 Comprehensive Monetization & Commercial Architecture Test Suite
 * Phase: P12 — Monetization & Entitlement Architecture
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PRODUCT_TIERS,
  BILLING_TYPES,
  ENTITLEMENT_STATUS,
  TRANSACTION_STATUS,
  PAYMENT_PROVIDERS,
  FEATURE_KEYS,
  ACCESS_DECISION,
  CURRENCIES,
  ProductCatalog,
  defaultProductCatalog,
  Entitlement,
  EntitlementSchemaValidator,
  EntitlementStateMachine,
  Transaction,
  TransactionSchemaValidator,
  TransactionStateMachine,
  PaymentProvider,
  MockPaymentProvider,
  MOCK_SIMULATION_MODE,
  AccessPolicy,
  defaultAccessPolicy,
  EntitlementService
} from '../../src/monetization/index.js';

import { MemoryStorageProvider } from '../../src/storage/MemoryStorageProvider.js';
import { MockAuthProvider } from '../../src/auth/MockAuthProvider.js';
import { ReadingRecord } from '../../src/storage/ReadingSchema.js';
import { setupTestEnvironment, GOLDEN_COMMERCIAL_CASES } from './golden/goldenCommercialCases.js';

describe('P12.1 Product Catalog & Currency Management', () => {
  it('loads valid product catalog with version and product definitions', () => {
    const catalog = new ProductCatalog();
    assert.equal(catalog.version, '1.0.0');
    assert.ok(catalog.hasProduct('kai_free'));
    assert.ok(catalog.hasProduct('kai_standard'));
    assert.ok(catalog.hasProduct('kai_premium'));
    assert.ok(catalog.hasProduct('kai_annual_pass'));
  });

  it('supports multi-currency pricing configurations', () => {
    const catalog = defaultProductCatalog;
    const inr = catalog.getPrice('kai_standard', CURRENCIES.INR);
    const usd = catalog.getPrice('kai_standard', CURRENCIES.USD);
    const eur = catalog.getPrice('kai_standard', CURRENCIES.EUR);
    const gbp = catalog.getPrice('kai_standard', CURRENCIES.GBP);

    assert.equal(inr.amount, 499);
    assert.equal(usd.amount, 5.99);
    assert.equal(eur.amount, 5.49);
    assert.equal(gbp.amount, 4.99);
    assert.equal(catalog.formatPrice('kai_standard', CURRENCIES.INR), '₹499');
    assert.equal(catalog.formatPrice('kai_standard', CURRENCIES.USD), '$5.99');
  });

  it('filters active products by tier and billing type', () => {
    const catalog = defaultProductCatalog;
    const premiumProds = catalog.listProducts({ tier: PRODUCT_TIERS.PREMIUM });
    assert.ok(premiumProds.length >= 2);

    const subscriptions = catalog.listProducts({ billingType: BILLING_TYPES.SUBSCRIPTION });
    assert.ok(subscriptions.length >= 1);
    assert.equal(subscriptions[0].productId, 'kai_annual_pass');
  });

  it('handles invalid or non-existent product gracefully', () => {
    const catalog = defaultProductCatalog;
    assert.equal(catalog.getProduct('non_existent_product'), null);
    assert.equal(catalog.hasProduct('non_existent_product'), false);
    assert.equal(catalog.getPrice('non_existent_product'), null);
    assert.equal(catalog.formatPrice('non_existent_product'), '—');
  });
});

describe('P12.2 Entitlement Model & State Machine', () => {
  it('instantiates and validates a valid Entitlement contract', async () => {
    const ent = new Entitlement({
      ownerId: 'USR-TEST-01',
      readingId: 'RDG-TEST-01',
      productId: 'kai_standard',
      tier: PRODUCT_TIERS.STANDARD,
      features: [FEATURE_KEYS.DETAILED_REPORT, FEATURE_KEYS.PDF_EXPORT]
    });

    const validation = await EntitlementSchemaValidator.validate(ent);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
    assert.ok(ent.isActive());
    assert.equal(ent.hasFeature(FEATURE_KEYS.DETAILED_REPORT), true);
    assert.equal(ent.hasFeature(FEATURE_KEYS.PREMIUM_REPORT), false);
  });

  it('strictly rejects entitlements containing forbidden biometric or card data', async () => {
    const dirtyEnt = new Entitlement({
      ownerId: 'USR-HACK',
      productId: 'kai_premium',
      metadata: {
        rawImage: 'data:image/png;base64,cameraPayload...'
      }
    });

    const validation = await EntitlementSchemaValidator.validate(dirtyEnt);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Privacy & Security Violation')));
  });

  it('evaluates expiration status deterministically', () => {
    const past = new Date(Date.now() - 10000).toISOString();
    const future = new Date(Date.now() + 100000).toISOString();

    const expiredEnt = new Entitlement({ expiresAt: past });
    const activeEnt = new Entitlement({ expiresAt: future });

    assert.equal(expiredEnt.isExpired(), true);
    assert.equal(expiredEnt.isActive(), false);
    assert.equal(activeEnt.isExpired(), false);
    assert.equal(activeEnt.isActive(), true);
  });

  it('enforces legal transitions in EntitlementStateMachine', () => {
    const ent = new Entitlement({ status: ENTITLEMENT_STATUS.PENDING });

    assert.equal(EntitlementStateMachine.canTransition(ENTITLEMENT_STATUS.PENDING, ENTITLEMENT_STATUS.ACTIVE), true);
    assert.equal(EntitlementStateMachine.canTransition(ENTITLEMENT_STATUS.ACTIVE, ENTITLEMENT_STATUS.REFUNDED), true);
    assert.equal(EntitlementStateMachine.canTransition(ENTITLEMENT_STATUS.REFUNDED, ENTITLEMENT_STATUS.ACTIVE), false);

    EntitlementStateMachine.transition(ent, ENTITLEMENT_STATUS.ACTIVE, 'Verification complete');
    assert.equal(ent.status, ENTITLEMENT_STATUS.ACTIVE);

    EntitlementStateMachine.transition(ent, ENTITLEMENT_STATUS.REFUNDED, 'Refund approved');
    assert.equal(ent.status, ENTITLEMENT_STATUS.REFUNDED);
    assert.ok(ent.revokedAt);

    // Attempting illegal transition throws
    assert.throws(
      () => EntitlementStateMachine.transition(ent, ENTITLEMENT_STATUS.ACTIVE),
      /Illegal entitlement transition/
    );
  });
});

describe('P12.3 Transaction Model & State Machine', () => {
  it('instantiates and validates a clean Transaction record', async () => {
    const txn = new Transaction({
      provider: PAYMENT_PROVIDERS.MOCK,
      productId: 'kai_premium',
      ownerId: 'USR-BUYER',
      readingId: 'RDG-100',
      amount: 999,
      currency: CURRENCIES.INR
    });

    const validation = await TransactionSchemaValidator.validate(txn);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('strictly rejects transactions containing card numbers or CVV fields', async () => {
    const dirtyTxn = new Transaction({
      productId: 'kai_standard',
      ownerId: 'USR-BAD',
      metadata: {
        cardNumber: '4111222233334444',
        cvv: '123'
      }
    });

    const validation = await TransactionSchemaValidator.validate(dirtyTxn);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Security/Privacy Violation')));
  });

  it('enforces legal transitions in TransactionStateMachine', () => {
    const txn = new Transaction({ status: TRANSACTION_STATUS.INITIATED });

    TransactionStateMachine.transition(txn, TRANSACTION_STATUS.PENDING);
    assert.equal(txn.status, TRANSACTION_STATUS.PENDING);

    TransactionStateMachine.transition(txn, TRANSACTION_STATUS.VERIFIED);
    assert.equal(txn.status, TRANSACTION_STATUS.VERIFIED);
    assert.ok(txn.verifiedAt);

    TransactionStateMachine.transition(txn, TRANSACTION_STATUS.REFUNDED);
    assert.equal(txn.status, TRANSACTION_STATUS.REFUNDED);

    assert.throws(
      () => TransactionStateMachine.transition(txn, TRANSACTION_STATUS.VERIFIED),
      /Illegal transaction transition/
    );
  });
});

describe('P12.4 Mock Payment Provider & Simulation Modes', () => {
  it('simulates instantaneous successful checkout', async () => {
    const provider = new MockPaymentProvider({ defaultMode: MOCK_SIMULATION_MODE.SUCCESS });
    const txn = await provider.createPurchase({
      productId: 'kai_standard',
      ownerId: 'USR-1',
      amount: 499
    });

    assert.equal(txn.status, TRANSACTION_STATUS.VERIFIED);
    assert.ok(txn.providerTransactionId.startsWith('MOCK-'));
  });

  it('simulates card payment failure and user cancellation', async () => {
    const provider = new MockPaymentProvider();
    
    provider.setSimulationMode(MOCK_SIMULATION_MODE.FAILED);
    const failTxn = await provider.createPurchase({ productId: 'kai_standard', ownerId: 'USR-1' });
    assert.equal(failTxn.status, TRANSACTION_STATUS.FAILED);

    provider.setSimulationMode(MOCK_SIMULATION_MODE.CANCELLED);
    const cancelTxn = await provider.createPurchase({ productId: 'kai_standard', ownerId: 'USR-1' });
    assert.equal(cancelTxn.status, TRANSACTION_STATUS.CANCELLED);
  });

  it('simulates network timeout error', async () => {
    const provider = new MockPaymentProvider({ defaultMode: MOCK_SIMULATION_MODE.TIMEOUT });
    await assert.rejects(
      async () => { await provider.createPurchase({ productId: 'kai_premium', ownerId: 'USR-1' }); },
      /timed out/
    );
  });
});

describe('P12.5 Access Policy & Report Gating Engine', () => {
  it('allows free features without any active entitlement', () => {
    const policy = defaultAccessPolicy;
    const res = policy.evaluate({ featureKey: FEATURE_KEYS.QUICK_REPORT });
    assert.equal(res.decision, ACCESS_DECISION.ALLOW);
  });

  it('requires purchase for standard/premium features when no entitlement is present', () => {
    const policy = defaultAccessPolicy;
    const resDetailed = policy.evaluate({ featureKey: FEATURE_KEYS.DETAILED_REPORT });
    assert.equal(resDetailed.decision, ACCESS_DECISION.REQUIRES_PURCHASE);
    assert.equal(resDetailed.requiredTier, PRODUCT_TIERS.STANDARD);

    const resPremium = policy.evaluate({ featureKey: FEATURE_KEYS.PREMIUM_REPORT });
    assert.equal(resPremium.decision, ACCESS_DECISION.REQUIRES_PURCHASE);
    assert.equal(resPremium.requiredTier, PRODUCT_TIERS.PREMIUM);
  });

  it('grants access when an active entitlement matches or exceeds required tier', () => {
    const policy = defaultAccessPolicy;
    const standardEnt = new Entitlement({
      ownerId: 'USR-ALICE',
      readingId: 'RDG-1',
      tier: PRODUCT_TIERS.STANDARD,
      features: [FEATURE_KEYS.DETAILED_REPORT, FEATURE_KEYS.PDF_EXPORT]
    });

    const res = policy.evaluate({
      featureKey: FEATURE_KEYS.DETAILED_REPORT,
      ownerId: 'USR-ALICE',
      readingId: 'RDG-1',
      entitlements: [standardEnt]
    });
    assert.equal(res.decision, ACCESS_DECISION.ALLOW);
    assert.ok(res.reason.includes('active STANDARD entitlement'));
  });

  it('blocks access if entitlement belongs to a different owner (IDOR Protection)', () => {
    const policy = defaultAccessPolicy;
    const alicesEnt = new Entitlement({
      ownerId: 'USR-ALICE',
      readingId: 'RDG-1',
      tier: PRODUCT_TIERS.PREMIUM,
      features: [FEATURE_KEYS.PREMIUM_REPORT]
    });

    const res = policy.evaluate({
      featureKey: FEATURE_KEYS.PREMIUM_REPORT,
      ownerId: 'USR-EVE', // Eve attempts to use Alice's entitlement
      readingId: 'RDG-1',
      entitlements: [alicesEnt]
    });
    assert.equal(res.decision, ACCESS_DECISION.REQUIRES_PURCHASE);
  });

  it('produces clean non-destructive preview view models of canonical reports', () => {
    const policy = defaultAccessPolicy;
    const canonicalReport = {
      reportId: 'RDG-1',
      summary: { title: 'Test Reading' },
      sections: [
        { id: 'sec-1', title: 'Constitutional Overview', narrative: 'Text 1' },
        { id: 'sec-2', title: 'Karmic Vocation', narrative: 'Text 2' },
        { id: 'sec-3', title: 'Contemplative Counsel', narrative: 'Text 3' }
      ]
    };

    // Free user preview
    const freeView = policy.filterReport(canonicalReport, { ownerId: 'USR-FREE' });
    assert.equal(freeView.tier, PRODUCT_TIERS.FREE);
    assert.equal(freeView.isFullyUnlocked, false);
    assert.equal(freeView.sections[0].isLocked, false);
    assert.equal(freeView.sections[1].isLocked, true);
    assert.equal(freeView.sections[2].isLocked, true);
    assert.ok(freeView.upsellBanner);

    // Canonical report was not mutated
    assert.equal(canonicalReport.sections[1].isLocked, undefined);
  });
});

describe('P12.6 Entitlement Service Master Workflows', () => {
  it('executes atomic purchase, persistence, and immediate entitlement grant', async () => {
    const { service, storage, auth } = await setupTestEnvironment();
    const user = await auth.getCurrentUser();
    const readingId = 'RDG-SRV-01';

    const res = await service.purchaseProduct({
      productId: 'kai_standard',
      readingId,
      currency: 'INR'
    });

    assert.equal(res.success, true);
    assert.ok(res.transaction.transactionId);
    assert.ok(res.entitlement.entitlementId);

    // Verify stored
    const storedTxn = await storage.getTransaction(res.transaction.transactionId);
    assert.equal(storedTxn.status, TRANSACTION_STATUS.VERIFIED);

    const storedEnts = await storage.listEntitlements({ ownerId: user.ownerId });
    assert.equal(storedEnts.length, 1);
    assert.equal(storedEnts[0].readingId, readingId);

    // Check access
    const allowed = await service.canAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);
    assert.equal(allowed, true);
  });

  it('migrates guest entitlements seamlessly on account registration', async () => {
    const { service, auth, storage } = await setupTestEnvironment();
    const guestId = (await auth.getCurrentUser()).ownerId;
    const readingId = 'RDG-MIGRATE-01';

    // Guest buys standard
    await service.purchaseProduct({ productId: 'kai_standard', readingId });

    // Guest creates account
    const account = await auth.upgradeGuestToAccount({ email: 'newseeker@kairegai.com' });

    // Verify entitlements were reassigned
    const accountEnts = await service.getEntitlements(account.ownerId);
    assert.equal(accountEnts.length, 1);
    assert.equal(accountEnts[0].ownerId, account.ownerId);

    // Upgraded user still has access
    const allowed = await service.canAccess(readingId, FEATURE_KEYS.DETAILED_REPORT);
    assert.equal(allowed, true);
  });

  it('processes non-destructive refunds revoking access while preserving ReadingRecord', async () => {
    const { service, storage } = await setupTestEnvironment();
    const readingId = 'RDG-REFUND-TEST';

    // Save reading
    const reading = new ReadingRecord({
      readingId,
      reportSnapshot: { reportId: readingId, title: 'Preserved Historical Reading' }
    });
    await storage.saveReading(reading);

    // Buy premium
    const buyRes = await service.purchaseProduct({ productId: 'kai_premium', readingId });
    assert.equal((await service.canAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT)), true);

    // Refund
    const refundRes = await service.refundTransaction(buyRes.transaction.transactionId);
    assert.equal(refundRes.transaction.status, TRANSACTION_STATUS.REFUNDED);
    assert.equal(refundRes.entitlement.status, ENTITLEMENT_STATUS.REFUNDED);

    // Access revoked
    assert.equal((await service.canAccess(readingId, FEATURE_KEYS.PREMIUM_REPORT)), false);

    // Reading record strictly preserved
    const stillThere = await storage.getReading(readingId);
    assert.ok(stillThere !== null);
    assert.equal(stillThere.readingId, readingId);
  });
});

describe('P12.7 Golden Commercial Corpus (15 Authoritative Cases)', () => {
  for (const testCase of GOLDEN_COMMERCIAL_CASES) {
    it(`evaluates ${testCase.name} (${testCase.id})`, async () => {
      const result = await testCase.run();

      for (const [key, expectedVal] of Object.entries(testCase.expected)) {
        if (expectedVal === 'MATCH') {
          assert.equal(
            result.firstTxnId,
            result.secondTxnId,
            `Expected firstTxnId and secondTxnId to match for ${testCase.id}`
          );
        } else if (expectedVal === 'GUEST_MATCH') {
          assert.ok(
            result.entitlementOwnerId.startsWith('GST-'),
            `Expected guest owner ID in ${testCase.id}`
          );
        } else if (expectedVal === 'ACCOUNT_MATCH') {
          assert.ok(
            result.migratedEntOwner.startsWith('USR-'),
            `Expected account owner ID in ${testCase.id}`
          );
        } else {
          assert.equal(
            result[key],
            expectedVal,
            `Mismatch in ${testCase.id} for property '${key}': expected ${expectedVal}, got ${result[key]}`
          );
        }
      }
    });
  }
});
