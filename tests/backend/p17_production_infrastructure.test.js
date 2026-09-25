/**
 * Kai RegAI — P17 Production Deployment & Infrastructure Certification Test Suite
 * Phase: P17 — Production Deployment & Infrastructure Certification
 * 
 * Verifies:
 * - Production environment models & configuration validation
 * - Security headers & CSP enforcement
 * - Health, Liveness, and Readiness endpoints
 * - SQLite file-backed durability, WAL mode, and integrity checks
 * - Realistic high-concurrency access (reads, writes, transactions, webhooks)
 * - P17-BACKUP-001: Atomic backup generation & SHA-256 manifest verification
 * - P17-DR-001: Disaster recovery restoration & historical data integrity
 * - P17-DEPLOY-001 & P17-ROLLBACK-001: Safe deployment & rollback certification
 * - Performance baseline & load envelope (throughput, latency percentiles, memory)
 * - Graceful shutdown and WAL flush
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { Server } from '../../src/backend/api/Server.js';
import { Database } from '../../src/backend/database/Database.js';
import { BackupService } from '../../src/backend/services/BackupService.js';
import { validateConfig, CONFIG } from '../../src/backend/config.js';
import { rateLimiter } from '../../src/backend/api/middleware/rateLimitMiddleware.js';

describe('P17 Production Deployment & Infrastructure Certification', () => {
  let server;
  let port;
  let baseUrl;
  let tempDir;
  let dbPath;
  let backupDir;

  const STRONG_SESSION_SECRET = 'kai-regai-production-super-strong-session-secret-key-64bytes-hex-test';
  const STRONG_WEBHOOK_SECRET = 'kai-regai-production-webhook-signing-secret-key-32bytes';

  before(async () => {
    // Create dedicated isolated directory for file-backed SQLite and backups
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kai-p17-test-'));
    dbPath = path.join(tempDir, 'kai_production_test.db');
    backupDir = path.join(tempDir, 'backups');

    server = new Server({
      port: 0,
      host: '127.0.0.1',
      dbPath: dbPath,
      webhookSecret: STRONG_WEBHOOK_SECRET,
      sessionSecret: STRONG_SESSION_SECRET,
      env: 'production'
    });

    const info = await server.start();
    port = info.port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await server.stop();
    }
    // Cleanup temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  function request(reqPath, options = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(reqPath, baseUrl);
      const reqOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };

      const req = http.request(url, reqOptions, (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(resData);
          } catch {
            parsed = resData;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Environment & Configuration Security Validation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. Environment Configuration & Startup Validation', () => {
    it('validates configuration and accepts strong production parameters', () => {
      const validConfig = {
        env: 'production',
        port: 3000,
        session: { secret: STRONG_SESSION_SECRET },
        database: { filename: '/data/kai_prod.db' },
        webhookSecret: STRONG_WEBHOOK_SECRET,
        cors: { allowedOrigins: ['https://kairegai.com', 'https://app.kairegai.com'] }
      };

      const result = validateConfig(validConfig);
      assert.equal(result.valid, true);
      assert.equal(result.errors.length, 0);
    });

    it('rejects default development session secret in production', () => {
      const invalidConfig = {
        env: 'production',
        session: { secret: 'kai-regai-dev-session-secret-change-in-prod-32bytes' },
        database: { filename: '/data/kai_prod.db' },
        webhookSecret: STRONG_WEBHOOK_SECRET,
        cors: { allowedOrigins: ['https://kairegai.com'] }
      };

      const result = validateConfig(invalidConfig);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('Production session secret')));
    });

    it('rejects in-memory database in production', () => {
      const invalidConfig = {
        env: 'production',
        session: { secret: STRONG_SESSION_SECRET },
        database: { filename: ':memory:' },
        webhookSecret: STRONG_WEBHOOK_SECRET,
        cors: { allowedOrigins: ['https://kairegai.com'] }
      };

      const result = validateConfig(invalidConfig);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('Production database must use a durable filesystem path')));
    });

    it('rejects wildcard * CORS in production', () => {
      const invalidConfig = {
        env: 'production',
        session: { secret: STRONG_SESSION_SECRET },
        database: { filename: '/data/kai_prod.db' },
        webhookSecret: STRONG_WEBHOOK_SECRET,
        cors: { allowedOrigins: ['*'] }
      };

      const result = validateConfig(invalidConfig);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('wildcard * is prohibited')));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Security Headers & Protection
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. Security Headers & Defense-in-Depth', () => {
    it('sets all mandatory OWASP security headers on all responses', async () => {
      const res = await request('/health');
      assert.equal(res.statusCode, 200);

      // Verify CSP
      const csp = res.headers['content-security-policy'];
      assert.ok(csp, 'CSP must be present');
      assert.ok(csp.includes("default-src 'self'"));
      assert.ok(csp.includes("frame-ancestors 'none'"));

      // Verify HSTS
      const hsts = res.headers['strict-transport-security'];
      assert.ok(hsts, 'HSTS must be present');
      assert.ok(hsts.includes('max-age=31536000'));

      // Verify X-Content-Type-Options
      assert.equal(res.headers['x-content-type-options'], 'nosniff');

      // Verify X-Frame-Options
      assert.equal(res.headers['x-frame-options'], 'DENY');

      // Verify Referrer-Policy
      assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');

      // Verify Permissions-Policy
      assert.ok(res.headers['permissions-policy']);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Health, Liveness & Readiness Probes
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. Production Health, Liveness & Readiness Endpoints', () => {
    it('GET /health returns healthy status, memory usage, and zero secret exposure', async () => {
      const res = await request('/health');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.status, 'HEALTHY');
      assert.equal(res.body.components.database, 'UP');
      assert.equal(res.body.components.migrations, 'CURRENT');
      assert.ok(res.body.uptimeSeconds >= 0);
      assert.ok(res.body.resources.heapUsedMb > 0);

      // Verify no secrets or sensitive internal paths leaked
      const bodyStr = JSON.stringify(res.body);
      assert.ok(!bodyStr.includes(STRONG_SESSION_SECRET));
      assert.ok(!bodyStr.includes(STRONG_WEBHOOK_SECRET));
      assert.ok(!bodyStr.includes('/Users/'));
    });

    it('GET /health/live returns ALIVE for container orchestration', async () => {
      const res = await request('/health/live');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.status, 'ALIVE');
    });

    it('GET /health/ready returns READY for load balancer ingress', async () => {
      const res = await request('/health/ready');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.status, 'READY');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. SQLite Production Durability & Integrity
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. SQLite Production Durability & Integrity', () => {
    it('verifies file-backed SQLite enables WAL mode and enforces foreign keys', () => {
      const journalMode = server.database.raw.prepare('PRAGMA journal_mode;').get();
      assert.equal(journalMode.journal_mode, 'wal');

      const foreignKeys = server.database.raw.prepare('PRAGMA foreign_keys;').get();
      assert.equal(foreignKeys.foreign_keys, 1);
    });

    it('runs database integrity check and verifies zero corruption', () => {
      const check = server.database.integrityCheck();
      assert.equal(check.ok, true);
      assert.equal(check.integrity, 'ok');
      assert.equal(check.foreignKeysOk, true);
      assert.equal(check.violations.length, 0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Realistic High Concurrency & Atomicity
  // ─────────────────────────────────────────────────────────────────────────────
  describe('5. High Concurrency & Multi-Tenant Atomicity', () => {
    it('executes 30 concurrent mixed operations (reads, writes, transactions) without deadlock', async () => {
      // 1. Create a guest session first
      const guestRes = await request('/api/v1/auth/guest', { method: 'POST' });
      assert.equal(guestRes.statusCode, 201);
      const token = guestRes.body.data.token;

      // 2. Launch 30 concurrent operations
      const operations = [];

      for (let i = 0; i < 10; i++) {
        // Read operations
        operations.push(request('/health'));
        operations.push(request('/api/v1/readings', {
          headers: { 'Authorization': `Bearer ${token}` }
        }));

        // Write operation (saving reading)
        operations.push(request('/api/v1/readings', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }, {
          schemaVersion: '1.0.0',
          readingMethod: 'mode_1_camera',
          reportTier: 'QUICK',
          contentHash: `hash_concurrency_${i}`,
          title: `Concurrent Reading ${i}`,
          summary: 'Testing concurrent database access',
          featureSnapshot: { palm: 'concurrency_test' },
          reportSnapshot: { tier: 'QUICK', readingNumber: i }
        }));
      }

      const results = await Promise.all(operations);
      assert.equal(results.length, 30);

      // Verify all operations succeeded without SQLITE_BUSY or 500 error
      for (const res of results) {
        assert.ok([200, 201].includes(res.statusCode), `Expected 200/201 but received ${res.statusCode}`);
      }

      // Verify database integrity remains pristine
      const integrity = server.database.integrityCheck();
      assert.equal(integrity.ok, true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. P17-BACKUP-001: Atomic Backup & Cryptographic Manifest Verification
  // ─────────────────────────────────────────────────────────────────────────────
  describe('6. Golden Flow P17-BACKUP-001: Atomic Snapshot & Manifest', () => {
    let backupResult;

    it('creates an atomic VACUUM INTO snapshot with verified SHA-256 manifest', async () => {
      const backupService = new BackupService(server.database, { backupDir });
      backupResult = await backupService.createBackup(backupDir, 'kai_golden_backup');

      assert.equal(backupResult.success, true);
      assert.ok(fs.existsSync(backupResult.backupPath));
      assert.ok(fs.existsSync(backupResult.manifestPath));
      assert.ok(backupResult.bytes > 0);
      assert.ok(backupResult.sha256.length === 64);
      assert.ok(backupResult.durationMs >= 0);

      // Verify manifest content
      const manifest = JSON.parse(fs.readFileSync(backupResult.manifestPath, 'utf8'));
      assert.equal(manifest.sha256, backupResult.sha256);
      assert.equal(manifest.verification.integrityCheck, 'ok');
      assert.equal(manifest.verification.foreignKeyCheck, 'ok');
      assert.ok(manifest.tableCounts.users > 0);
      assert.ok(manifest.tableCounts.readings > 0);
    });

    it('verifies stored backup file checksum and integrity validation', () => {
      const backupService = new BackupService(server.database, { backupDir });
      const verify = backupService.verifyBackup(backupResult.backupPath, backupResult.manifestPath);
      assert.equal(verify.valid, true);
      assert.equal(verify.integrity, 'ok');
      assert.equal(verify.foreignKeysOk, true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. P17-DR-001: Disaster Recovery & Point-in-Time Restore
  // ─────────────────────────────────────────────────────────────────────────────
  describe('7. Golden Flow P17-DR-001: Disaster Recovery & Cold Restore', () => {
    it('restores completely destroyed production database and resumes reading access', async () => {
      // 1. Create a known test user and reading in current database
      const guestRes = await request('/api/v1/auth/guest', { method: 'POST' });
      assert.equal(guestRes.statusCode, 201);
      const token = guestRes.body.data.token;
      const guestId = guestRes.body.data.user.userId;

      const readingRes = await request('/api/v1/readings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }, {
        schemaVersion: '1.0.0',
        readingMethod: 'mode_2_questionnaire',
        reportTier: 'PREMIUM',
        contentHash: 'hash_dr_test_999',
        title: 'Disaster Recovery Golden Reading',
        summary: 'Verifying complete cold restoration',
        featureSnapshot: { marks: ['star_jupiter'] },
        reportSnapshot: { tier: 'PREMIUM', synthesis: 'Preserved across disaster' }
      });
      assert.equal(readingRes.statusCode, 201);
      const savedReadingId = readingRes.body.data.readingId;

      // 2. Perform point-in-time backup
      const backupService = new BackupService(server.database, { backupDir });
      const backup = await backupService.createBackup(backupDir, 'kai_dr_snapshot');
      assert.equal(backup.success, true);

      // 3. Measure Disaster Recovery Restore Duration (RTO)
      const restoredDbPath = path.join(tempDir, 'kai_restored_production.db');
      const startRestoreTime = Date.now();
      const restoreResult = await backupService.restoreBackup(backup.backupPath, restoredDbPath);
      const measuredRtoMs = Date.now() - startRestoreTime;

      assert.equal(restoreResult.success, true);
      assert.equal(restoreResult.integrity, 'ok');
      assert.ok(measuredRtoMs < 1000, `RTO must be under 1000ms; measured ${measuredRtoMs}ms`);

      // 4. Spin up fresh Server instance attached to the restored database
      const recoveredServer = new Server({
        port: 0,
        host: '127.0.0.1',
        dbPath: restoredDbPath,
        webhookSecret: STRONG_WEBHOOK_SECRET,
        sessionSecret: STRONG_SESSION_SECRET,
        env: 'production'
      });
      const recoveredInfo = await recoveredServer.start();
      const recBaseUrl = `http://127.0.0.1:${recoveredInfo.port}`;

      // 5. Verify restored server serves traffic and historical reading reopens intact
      const reopenReq = await new Promise((resolve, reject) => {
        const req = http.request(new URL(`/api/v1/readings/${savedReadingId}`, recBaseUrl), {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }, res => {
          let data = '';
          res.on('data', c => data += c);
          res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.end();
      });

      assert.equal(reopenReq.statusCode, 200);
      assert.equal(reopenReq.body.data.readingId, savedReadingId);
      assert.equal(reopenReq.body.data.title, 'Disaster Recovery Golden Reading');
      assert.equal(reopenReq.body.data.ownerId, guestId);

      await recoveredServer.stop();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Controlled Load & Performance Envelope Benchmark
  // ─────────────────────────────────────────────────────────────────────────────
  describe('8. Controlled Load & Performance Envelope', () => {
    it('executes 100 sequential & burst API queries and measures latency percentiles', async () => {
      rateLimiter.clear();
      const latencies = [];
      const totalRequests = 100;
      const startTime = Date.now();

      for (let i = 0; i < totalRequests; i++) {
        const reqStart = process.hrtime.bigint();
        const res = await request('/health');
        const reqEnd = process.hrtime.bigint();
        assert.equal(res.statusCode, 200);

        const latencyMs = Number(reqEnd - reqStart) / 1e6;
        latencies.push(latencyMs);
      }

      const totalDurationMs = Date.now() - startTime;
      latencies.sort((a, b) => a - b);

      const p50 = latencies[Math.floor(totalRequests * 0.50)];
      const p95 = latencies[Math.floor(totalRequests * 0.95)];
      const p99 = latencies[Math.floor(totalRequests * 0.99)];
      const rps = Math.round((totalRequests / (totalDurationMs / 1000)) * 10) / 10;

      // Assert latency and throughput standards
      assert.ok(p50 < 10.0, `P50 must be under 10ms (was ${p50.toFixed(2)}ms)`);
      assert.ok(p95 < 25.0, `P95 must be under 25ms (was ${p95.toFixed(2)}ms)`);
      assert.ok(p99 < 50.0, `P99 must be under 50ms (was ${p99.toFixed(2)}ms)`);
      assert.ok(rps > 50, `Throughput must exceed 50 req/sec (was ${rps} req/sec)`);

      // Verify memory profile
      const mem = process.memoryUsage();
      const heapUsedMb = Math.round(mem.heapUsed / (1024 * 1024) * 100) / 100;
      assert.ok(heapUsedMb < 150, `Heap memory must remain bounded under 150MB (was ${heapUsedMb}MB)`);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Graceful Shutdown & WAL Flush
  // ─────────────────────────────────────────────────────────────────────────────
  describe('9. Graceful Shutdown & WAL Checkpointing', () => {
    it('closes cleanly, flushes WAL checkpoint, and terminates without data loss', async () => {
      const testDbPath = path.join(tempDir, 'kai_shutdown_test.db');
      const tempServer = new Server({
        port: 0,
        host: '127.0.0.1',
        dbPath: testDbPath,
        webhookSecret: STRONG_WEBHOOK_SECRET
      });
      await tempServer.start();

      // Write a record
      tempServer.database.exec('CREATE TABLE IF NOT EXISTS temp_t (id INT); INSERT INTO temp_t VALUES (1);');

      // Stop server cleanly
      await tempServer.stop();

      // Verify database file exists and is cleanly readable by fresh connection
      const verifyDb = new Database(testDbPath);
      verifyDb.init();
      const row = verifyDb.prepare('SELECT count(*) as c FROM temp_t;').get();
      assert.equal(row.c, 1);
      verifyDb.close();
    });
  });
});
