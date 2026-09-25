/**
 * Kai RegAI — Monetization & Entitlement Architecture Public Exports
 * Phase: P12 — Monetization & Entitlement Architecture
 */

export * from './types.js';
export { ProductCatalog, defaultProductCatalog, CATALOG_VERSION, PRODUCT_DEFINITIONS } from './ProductCatalog.js';
export { Entitlement, EntitlementSchemaValidator, ENTITLEMENT_SCHEMA_VERSION } from './EntitlementSchema.js';
export { EntitlementStateMachine, VALID_ENTITLEMENT_TRANSITIONS } from './EntitlementStateMachine.js';
export { Transaction, TransactionSchemaValidator, TRANSACTION_SCHEMA_VERSION } from './TransactionSchema.js';
export { TransactionStateMachine, VALID_TRANSACTION_TRANSITIONS } from './TransactionStateMachine.js';
export { PaymentProvider } from './PaymentProvider.js';
export { MockPaymentProvider, defaultPaymentProvider, MOCK_SIMULATION_MODE } from './MockPaymentProvider.js';
export { AccessPolicy, defaultAccessPolicy, FEATURE_TIER_REQUIREMENTS } from './AccessPolicy.js';
export { EntitlementService, defaultEntitlementService } from './EntitlementService.js';
