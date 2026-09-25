/**
 * Kai RegAI — API Router & Dispatcher
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Versioned API router for /api/v1/ and /health:
 * - Request ID tracking
 * - Rate limiting
 * - CORS & Origin validation
 * - Request payload size bounds (< 2MB)
 * - Safe JSON parsing
 * - Server-side authentication & authorization dispatch
 */

import { requestIdMiddleware } from './middleware/requestIdMiddleware.js';
import { corsMiddleware } from './middleware/corsMiddleware.js';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware.js';
import { createAuthMiddleware } from './middleware/authMiddleware.js';
import { sendError } from './middleware/errorHandler.js';

export class ApiRouter {
  constructor(controllers, services) {
    this.authController = controllers.authController;
    this.userController = controllers.userController;
    this.readingController = controllers.readingController;
    this.syncController = controllers.syncController;
    this.transactionController = controllers.transactionController;
    this.entitlementController = controllers.entitlementController;
    this.webhookController = controllers.webhookController;
    this.healthController = controllers.healthController;

    this.authMiddleware = createAuthMiddleware(services.authService);
  }

  async handle(req, res) {
    // 1. Core Middlewares
    await new Promise(resolve => requestIdMiddleware(req, res, resolve));

    let corsHandled = false;
    await new Promise(resolve => {
      corsMiddleware(req, res, () => {
        corsHandled = true;
        resolve();
      });
    });
    if (!corsHandled) return; // Handled OPTIONS or terminated

    let rateLimitHandled = false;
    await new Promise(resolve => {
      rateLimitMiddleware(req, res, () => {
        rateLimitHandled = true;
        resolve();
      });
    });
    if (!rateLimitHandled) return; // Rate limit exceeded

    // 2. Parse URL and Query using standard WHATWG URL
    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams.entries());
    const method = req.method.toUpperCase();

    // 3. Health Endpoint
    if (pathname === '/health' || pathname === '/api/v1/health') {
      if (method === 'GET') {
        return this.healthController.getHealth(req, res);
      }
    }

    // 4. Read Body for Mutating Requests
    let body = null;
    let rawBody = '';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        const bodyData = await this._readBody(req);
        rawBody = bodyData.raw;
        body = bodyData.parsed;
      } catch (err) {
        return sendError(res, err, req.id);
      }
    }

    // Helper for protected routes
    const requireAuth = async () => {
      return new Promise(resolve => {
        this.authMiddleware(req, res, () => resolve(true), { required: true });
      });
    };

    try {
      // 5. Route Matching

      // --- AUTH ROUTES ---
      if (pathname === '/api/v1/auth/guest' && method === 'POST') {
        return this.authController.createGuest(req, res, body);
      }
      if (pathname === '/api/v1/auth/account' && method === 'POST') {
        return this.authController.createOrLoginAccount(req, res, body);
      }
      if (pathname === '/api/v1/auth/migrate' && method === 'POST') {
        if (!await requireAuth()) return;
        return this.authController.migrateGuest(req, res, body);
      }
      if (pathname === '/api/v1/auth/logout' && method === 'POST') {
        return this.authController.logout(req, res, body);
      }

      // --- USER ROUTES ---
      if (pathname === '/api/v1/users/me') {
        if (!await requireAuth()) return;
        if (method === 'GET') return this.userController.getMe(req, res);
        if (method === 'DELETE') return this.userController.deleteMe(req, res);
      }

      // --- READING ROUTES ---
      if (pathname === '/api/v1/readings') {
        if (!await requireAuth()) return;
        if (method === 'POST') return this.readingController.saveReading(req, res, body);
        if (method === 'GET') return this.readingController.listReadings(req, res);
      }

      const readingMatch = pathname.match(/^\/api\/v1\/readings\/([a-zA-Z0-9_-]+)$/);
      if (readingMatch) {
        const readingId = readingMatch[1];
        if (!await requireAuth()) return;
        if (method === 'GET') return this.readingController.getReading(req, res, readingId);
        if (method === 'DELETE') return this.readingController.deleteReading(req, res, readingId);
      }

      const readingExportMatch = pathname.match(/^\/api\/v1\/readings\/([a-zA-Z0-9_-]+)\/export$/);
      if (readingExportMatch && method === 'GET') {
        const readingId = readingExportMatch[1];
        if (!await requireAuth()) return;
        return this.readingController.exportReading(req, res, readingId);
      }

      // --- ACCESS EVALUATION ROUTE ---
      const readingAccessMatch = pathname.match(/^\/api\/v1\/readings\/([a-zA-Z0-9_-]+)\/access$/);
      if (readingAccessMatch && method === 'GET') {
        const readingId = readingAccessMatch[1];
        if (!await requireAuth()) return;
        return this.entitlementController.evaluateAccess(req, res, readingId, query);
      }

      // --- SYNC ROUTES ---
      if (pathname === '/api/v1/sync/batch' && method === 'POST') {
        if (!await requireAuth()) return;
        return this.syncController.syncBatch(req, res, body);
      }
      if (pathname === '/api/v1/sync/pull' && method === 'GET') {
        if (!await requireAuth()) return;
        return this.syncController.pull(req, res, query);
      }

      // --- TRANSACTION ROUTES ---
      if (pathname === '/api/v1/transactions') {
        if (!await requireAuth()) return;
        if (method === 'POST') return this.transactionController.createTransaction(req, res, body);
        if (method === 'GET') return this.transactionController.listTransactions(req, res);
      }

      const txnVerifyMatch = pathname.match(/^\/api\/v1\/transactions\/([a-zA-Z0-9_-]+)\/verify$/);
      if (txnVerifyMatch && method === 'POST') {
        const transactionId = txnVerifyMatch[1];
        if (!await requireAuth()) return;
        return this.transactionController.verifyTransaction(req, res, transactionId, body);
      }

      const txnRefundMatch = pathname.match(/^\/api\/v1\/transactions\/([a-zA-Z0-9_-]+)\/refund$/);
      if (txnRefundMatch && method === 'POST') {
        const transactionId = txnRefundMatch[1];
        if (!await requireAuth()) return;
        return this.transactionController.refundTransaction(req, res, transactionId, body);
      }

      // --- ENTITLEMENT ROUTES ---
      if (pathname === '/api/v1/entitlements' && method === 'GET') {
        if (!await requireAuth()) return;
        return this.entitlementController.listEntitlements(req, res);
      }
      if (pathname === '/api/v1/entitlements/restore' && method === 'POST') {
        if (!await requireAuth()) return;
        return this.entitlementController.restoreEntitlements(req, res);
      }

      // --- WEBHOOK ROUTES ---
      const webhookMatch = pathname.match(/^\/api\/v1\/webhooks\/([a-zA-Z0-9_-]+)$/);
      if (webhookMatch && method === 'POST') {
        const provider = webhookMatch[1];
        return this.webhookController.handleWebhook(req, res, provider, rawBody);
      }

      // 404 Route Not Found
      return sendError(res, new Error('404 Not Found: Endpoint does not exist'), req.id, 404);

    } catch (err) {
      return sendError(res, err, req.id);
    }
  }

  _readBody(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2MB limit

      req.on('data', chunk => {
        data += chunk;
        if (data.length > MAX_PAYLOAD_BYTES) {
          req.destroy();
          reject(new Error('413 Payload Too Large: Request exceeds 2MB limit'));
        }
      });

      req.on('end', () => {
        if (!data || data.trim() === '') {
          return resolve({ raw: '', parsed: null });
        }
        try {
          const parsed = JSON.parse(data);
          resolve({ raw: data, parsed });
        } catch (e) {
          reject(new Error('400 Bad Request: Malformed JSON body'));
        }
      });

      req.on('error', err => reject(err));
    });
  }
}
