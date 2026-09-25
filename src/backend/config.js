/**
 * Kai RegAI — Backend Configuration
 * Phase: P13/P17 — Production Backend & Infrastructure Certification
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

export function validateConfig(config = BACKEND_CONFIG) {
  const errors = [];
  const env = config.env || 'development';

  if (env === 'production' || env === 'staging') {
    // 1. Session secret validation
    if (!config.session?.secret || config.session.secret.includes('dev-session-secret')) {
      errors.push('Production session secret must not use default development placeholder');
    }
    if (config.session?.secret && config.session.secret.length < 32) {
      errors.push('Production session secret must be at least 32 characters in length');
    }

    // 2. Database path validation
    if (config.database?.filename === ':memory:') {
      errors.push('Production database must use a durable filesystem path, not :memory:');
    }

    // 3. Webhook secret validation
    const webhookSecret = process.env.WEBHOOK_SECRET || config.webhookSecret;
    if (!webhookSecret || webhookSecret.includes('kai-regai-webhook-secret-p13')) {
      errors.push('Production webhook secret must not use default development placeholder');
    }

    // 4. CORS origin validation (no wildcard allowed in production)
    const origins = config.cors?.allowedOrigins || [];
    if (origins.includes('*')) {
      errors.push('Production CORS origins must be explicitly enumerated; wildcard * is prohibited');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

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
  },
  validate: () => validateConfig(BACKEND_CONFIG)
};
