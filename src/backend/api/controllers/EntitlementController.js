/**
 * Kai RegAI — Entitlement Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class EntitlementController {
  constructor(commerceService) {
    this.commerceService = commerceService;
  }

  listEntitlements(req, res) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const list = this.commerceService.getEntitlements(req.user.userId, req.user.userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: list
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  restoreEntitlements(req, res) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const result = this.commerceService.restoreEntitlements(req.user.userId, req.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  evaluateAccess(req, res, readingId, query) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const featureKey = query?.featureKey || query?.feature || null;
      const evaluation = this.commerceService.evaluateAccess({ readingId, featureKey }, req.user.userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: evaluation
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }
}
