/**
 * Kai RegAI — Backend Configuration
 * Phase: P13 — Production Backend & Commercial Authority
 */

export const BACKEND_CONFIG = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: '/api/v1',
  session: {
    secret: process.env.SESSION_SECRET || 'kai-regai-dev-session-secret-change-in-prod-32bytes',
    ttlSeconds: 30 * 24 * 60 * 60, // 30 days
    cookieName: 'kai_session'
  },
  rateLimits: {
    defaultMaxRequests: 120,
    windowSeconds: 60,
    authMaxRequests: 20
  },
  database: {
    filename: process.env.DATABASE_URL || ':memory:',
    busyTimeout: 5000
  },
  cors: {
    allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
    allowedMethods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Idempotency-Key,X-Request-Id'
  }
};

export const CONFIG = {
  ...BACKEND_CONFIG,
  port: BACKEND_CONFIG.port,
  host: BACKEND_CONFIG.host,
  databasePath: BACKEND_CONFIG.database.filename,
  webhookSecret: process.env.WEBHOOK_SECRET || 'kai-regai-webhook-secret-p13',
  corsOrigins: BACKEND_CONFIG.cors.allowedOrigins,
  rateLimits: {
    windowMs: BACKEND_CONFIG.rateLimits.windowSeconds * 1000,
    maxRequests: BACKEND_CONFIG.rateLimits.defaultMaxRequests
  }
};
