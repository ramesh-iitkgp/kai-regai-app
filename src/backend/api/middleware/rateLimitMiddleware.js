/**
 * Kai RegAI — Rate Limiting Middleware
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { RateLimiter } from '../../security/RateLimiter.js';
import { CONFIG } from '../../config.js';

const maxRequests = CONFIG.rateLimits.maxRequests || 120;
const limiter = new RateLimiter({
  windowSeconds: (CONFIG.rateLimits.windowMs || 60000) / 1000,
  defaultMaxRequests: maxRequests
});

export function rateLimitMiddleware(req, res, next) {
  const ip = req.socket?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const check = limiter.check(ip, maxRequests);

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', check.remaining);
  res.setHeader('X-RateLimit-Reset', check.resetSeconds);

  if (!check.allowed) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        requestId: req.id || null
      }
    }));
    return;
  }

  next();
}
