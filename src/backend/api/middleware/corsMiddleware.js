/**
 * Kai RegAI — CORS Middleware
 * Phase: P13/P17 — Production Backend & Infrastructure Certification
 */

import { CONFIG } from '../../config.js';

export function corsMiddleware(req, res, next) {
  const origin = req.headers['origin'];
  const allowedOrigins = CONFIG.corsOrigins || [];
  const isProduction = CONFIG.env === 'production' || CONFIG.env === 'staging';

  if (origin) {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!isProduction && allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  } else if (!isProduction && allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, Idempotency-Key, x-signature');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  next();
}
