/**
 * Kai RegAI — Request ID Middleware
 * Phase: P13 — Production Backend & Commercial Authority
 */

import crypto from 'node:crypto';

export function requestIdMiddleware(req, res, next) {
  const reqId = req.headers['x-request-id'] || `REQ-${crypto.randomUUID()}`;
  req.id = reqId;
  res.setHeader('x-request-id', reqId);
  next();
}
