/**
 * Kai RegAI — Sync Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class SyncController {
  constructor(syncService) {
    this.syncService = syncService;
  }

  syncBatch(req, res, body) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const result = this.syncService.syncBatch(body, req.user.userId, req.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  pull(req, res, query) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const result = this.syncService.pull(query, req.user.userId);
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
