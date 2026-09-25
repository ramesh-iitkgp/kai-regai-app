/**
 * Kai RegAI — Auth Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  createGuest(req, res, body) {
    try {
      const clientIp = req.socket?.remoteAddress || '127.0.0.1';
      const session = this.authService.createGuestSession(clientIp, req.id);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: session
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  createOrLoginAccount(req, res, body) {
    try {
      const { email, displayName } = body || {};
      const clientIp = req.socket?.remoteAddress || '127.0.0.1';
      const session = this.authService.createOrLoginAccount({ email, displayName }, clientIp, req.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: session
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  migrateGuest(req, res, body) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session token missing');
      }

      const { guestId, accountEmail, accountDisplayName } = body || {};
      const clientIp = req.socket?.remoteAddress || '127.0.0.1';

      // Security check: Must be the guest user or target account authenticating
      const result = this.authService.migrateGuestToAccount({
        guestId,
        accountEmail,
        accountDisplayName,
        requesterId: req.user.userId,
        clientIp,
        requestId: req.id
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  logout(req, res, body) {
    try {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        this.authService.revokeSession(token, req.id);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }
}
