/**
 * Kai RegAI — Transaction Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class TransactionController {
  constructor(commerceService) {
    this.commerceService = commerceService;
  }

  createTransaction(req, res, body) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const idempotencyKey = req.headers['idempotency-key'] || body?.idempotencyKey || null;
      const params = {
        ...body,
        idempotencyKey
      };

      const result = this.commerceService.createTransaction(params, req.user.userId, req.id);
      res.writeHead(result.isDuplicate ? 200 : 201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  listTransactions(req, res) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const list = this.commerceService.getTransactions(req.user.userId, req.user.userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: list
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  verifyTransaction(req, res, transactionId, body) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const params = {
        transactionId,
        providerTransactionId: body?.providerTransactionId || null,
        verificationToken: body?.verificationToken || null
      };

      const result = this.commerceService.verifyTransaction(params, req.user.userId, req.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  refundTransaction(req, res, transactionId, body) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const result = this.commerceService.refundTransaction(
        {
          transactionId,
          reason: body?.reason || 'Customer requested refund'
        },
        req.user.userId,
        req.id
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }
}
