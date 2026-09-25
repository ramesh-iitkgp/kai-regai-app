/**
 * Kai RegAI — Mock Payment Provider
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Deterministic sandbox payment provider for testing, QA, and offline development:
 * - Simulates full transaction lifecycles (SUCCESS, PENDING, FAILED, CANCELLED, REFUNDED, DUPLICATE, TIMEOUT)
 * - Zero external network dependency
 * - Cryptographic mock receipts and idempotent transaction restoration
 */

import { PaymentProvider } from './PaymentProvider.js';
import { Transaction } from './TransactionSchema.js';
import { TransactionStateMachine } from './TransactionStateMachine.js';
import { TRANSACTION_STATUS, PAYMENT_PROVIDERS } from './types.js';

export const MOCK_SIMULATION_MODE = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  DUPLICATE: 'DUPLICATE',
  TIMEOUT: 'TIMEOUT'
};

export class MockPaymentProvider extends PaymentProvider {
  constructor(options = {}) {
    super();
    this.providerName = PAYMENT_PROVIDERS.MOCK;
    this.simulationMode = options.defaultMode || MOCK_SIMULATION_MODE.SUCCESS;
    this.transactions = new Map();
    this.idempotencyMap = new Map();
    this.simulatedLatencyMs = options.simulatedLatencyMs || 0;
  }

  async init() {
    return true;
  }

  setSimulationMode(mode) {
    if (!Object.values(MOCK_SIMULATION_MODE).includes(mode)) {
      throw new Error(`Invalid mock simulation mode '${mode}'`);
    }
    this.simulationMode = mode;
  }

  async createPurchase(purchaseIntent) {
    if (!purchaseIntent?.productId || !purchaseIntent?.ownerId) {
      throw new Error('createPurchase requires productId and ownerId');
    }

    // Check idempotency key if supplied
    if (purchaseIntent.idempotencyKey && this.idempotencyMap.has(purchaseIntent.idempotencyKey)) {
      const existingId = this.idempotencyMap.get(purchaseIntent.idempotencyKey);
      const existingTxn = this.transactions.get(existingId);
      if (this.simulationMode === MOCK_SIMULATION_MODE.DUPLICATE) {
        existingTxn.status = TRANSACTION_STATUS.DUPLICATE;
      }
      return new Transaction(existingTxn);
    }

    if (this.simulationMode === MOCK_SIMULATION_MODE.TIMEOUT) {
      throw new Error('Payment provider connection timed out');
    }

    const txn = new Transaction({
      provider: PAYMENT_PROVIDERS.MOCK,
      providerTransactionId: `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      productId: purchaseIntent.productId,
      ownerId: purchaseIntent.ownerId,
      readingId: purchaseIntent.readingId || null,
      amount: purchaseIntent.amount ?? 0,
      currency: purchaseIntent.currency || 'INR',
      status: TRANSACTION_STATUS.PENDING,
      idempotencyKey: purchaseIntent.idempotencyKey,
      metadata: {
        ...purchaseIntent.metadata,
        simulationMode: this.simulationMode
      }
    });

    if (this.simulationMode === MOCK_SIMULATION_MODE.CANCELLED) {
      TransactionStateMachine.transition(txn, TRANSACTION_STATUS.CANCELLED, 'User cancelled mock payment');
    } else if (this.simulationMode === MOCK_SIMULATION_MODE.FAILED) {
      TransactionStateMachine.transition(txn, TRANSACTION_STATUS.FAILED, 'Mock card payment declined');
    } else if (this.simulationMode === MOCK_SIMULATION_MODE.SUCCESS) {
      TransactionStateMachine.transition(txn, TRANSACTION_STATUS.VERIFIED, 'Mock automatic sandbox authorization');
    }

    this.transactions.set(txn.transactionId, txn.toJSON());
    if (txn.idempotencyKey) {
      this.idempotencyMap.set(txn.idempotencyKey, txn.transactionId);
    }

    return new Transaction(txn);
  }

  async getTransactionStatus(transactionId) {
    const raw = this.transactions.get(transactionId);
    if (!raw) return null;
    return new Transaction(raw);
  }

  async verifyTransaction(transactionId, verificationPayload = {}) {
    const raw = this.transactions.get(transactionId);
    if (!raw) {
      return { verified: false, transaction: null, error: `Transaction '${transactionId}' not found` };
    }

    const txn = new Transaction(raw);

    if (this.simulationMode === MOCK_SIMULATION_MODE.FAILED) {
      return { verified: false, transaction: txn, error: 'Payment receipt signature verification failed' };
    }

    if (txn.status !== TRANSACTION_STATUS.VERIFIED) {
      TransactionStateMachine.transition(txn, TRANSACTION_STATUS.VERIFIED, 'Manual receipt verification approved');
      this.transactions.set(txn.transactionId, txn.toJSON());
    }

    return {
      verified: true,
      transaction: new Transaction(txn)
    };
  }

  async restorePurchases(ownerId) {
    const matching = [];
    for (const raw of this.transactions.values()) {
      if (raw.ownerId === ownerId && raw.status === TRANSACTION_STATUS.VERIFIED) {
        matching.push(new Transaction(raw));
      }
    }
    return matching;
  }

  async refundTransaction(transactionId, reason = 'Customer requested refund') {
    const raw = this.transactions.get(transactionId);
    if (!raw) throw new Error(`Transaction '${transactionId}' not found`);

    const txn = new Transaction(raw);
    TransactionStateMachine.transition(txn, TRANSACTION_STATUS.REFUNDED, reason);
    this.transactions.set(txn.transactionId, txn.toJSON());
    return new Transaction(txn);
  }

  async handleWebhook(payload, signature) {
    if (!payload?.transactionId) {
      return { handled: false, eventType: 'UNKNOWN' };
    }
    const raw = this.transactions.get(payload.transactionId);
    if (!raw) return { handled: false, eventType: 'NOT_FOUND' };

    const txn = new Transaction(raw);
    if (payload.action === 'REFUND') {
      TransactionStateMachine.transition(txn, TRANSACTION_STATUS.REFUNDED, 'Webhook refund notice');
      this.transactions.set(txn.transactionId, txn.toJSON());
      return { handled: true, eventType: 'REFUND' };
    }

    return { handled: true, eventType: 'ACK' };
  }
}

export const defaultPaymentProvider = new MockPaymentProvider();
