/**
 * Kai RegAI — User Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class UserController {
  constructor(database, auditService) {
    this.database = database;
    this.auditService = auditService;
  }

  getMe(req, res) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: req.user
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  deleteMe(req, res) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const userId = req.user.userId;

      // Atomic user deletion and cascade (preserves financial transactions with minimized PII)
      this.database.transaction(() => {
        // Soft-delete readings
        this.database.prepare(`
          UPDATE readings
          SET deleted_at = ?
          WHERE owner_id = ?;
        `).run(new Date().toISOString(), userId);

        // Revoke active entitlements
        this.database.prepare(`
          UPDATE entitlements
          SET status = 'REVOKED',
              revoked_at = ?
          WHERE owner_id = ? AND status = 'ACTIVE';
        `).run(new Date().toISOString(), userId);

        // Invalidate sessions
        this.database.prepare(`
          DELETE FROM sessions WHERE user_id = ?;
        `).run(userId);

        // Delete user identity
        this.database.prepare(`
          DELETE FROM users WHERE user_id = ?;
        `).run(userId);

        this.auditService?.logEvent({
          eventType: 'USER_DELETED',
          actorId: userId,
          resourceId: userId,
          requestId: req.id,
          details: { ownerType: req.user.ownerType }
        });
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'User account and associated reading data deleted successfully'
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }
}
