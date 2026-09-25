/**
 * Kai RegAI — P13 End-to-End API Integration Suite
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Verifies live HTTP server routing, JSON serialization, headers, status codes,
 * and end-to-end commercial & reading lifecycle over native HTTP.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import { Server } from '../../src/backend/api/Server.js';
import { SignatureVerifier } from '../../src/backend/security/SignatureVerifier.js';

describe('P13 HTTP API Integration Suite', () => {
  let server;
  let port;
  let baseUrl;
  const WEBHOOK_SECRET = 'api_test_webhook_secret_xyz';

  before(async () => {
    // Start on ephemeral port with in-memory DB
    server = new Server({
      port: 0,
      host: '127.0.0.1',
      dbPath: ':memory:',
      webhookSecret: WEBHOOK_SECRET
    });

    const info = await server.start();
    port = info.port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await server.stop();
  });

  function request(path, options = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
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

  it('GET /health returns 200 HEALTHY with component status', async () => {
    const res = await request('/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'HEALTHY');
    assert.equal(res.body.components.database, 'UP');
  });

  it('POST /api/v1/auth/guest creates guest identity & token', async () => {
    const res = await request('/api/v1/auth/guest', { method: 'POST' });
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.user.userId.startsWith('GST-'));
  });

  it('Complete Reading, Purchase, and Entitlement Lifecycle over HTTP', async () => {
    // 1. Authenticate Guest
    const guestRes = await request('/api/v1/auth/guest', { method: 'POST' });
    const token = guestRes.body.data.token;
    const userId = guestRes.body.data.user.userId;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Save Reading
    const readingId = 'RDG-HTTP-E2E-001';
    const readingPayload = {
      readingId,
      ownerId: userId,
      schemaVersion: '1.0.0',
      contentHash: 'hash-http-e2e',
      featureSnapshot: { lineCount: 3 },
      reportSnapshot: { summary: 'Vibrant potential' }
    };

    const saveRes = await request('/api/v1/readings', {
      method: 'POST',
      headers: authHeaders
    }, readingPayload);

    assert.equal(saveRes.statusCode, 201);
    assert.equal(saveRes.body.data.readingId, readingId);

    // 3. Verify Initial Access is DENIED
    const accessPre = await request(`/api/v1/readings/${readingId}/access?featureKey=DETAILED_REPORT`, {
      headers: authHeaders
    });
    assert.equal(accessPre.statusCode, 200);
    assert.equal(accessPre.body.data.decision, 'DENY');

    // 4. Create Transaction
    const txnRes = await request('/api/v1/transactions', {
      method: 'POST',
      headers: { ...authHeaders, 'Idempotency-Key': 'IDEMP-E2E-1' }
    }, {
      productId: 'kai_standard',
      readingId
    });
    assert.equal(txnRes.statusCode, 201);
    const txnId = txnRes.body.data.transaction.transactionId;

    // 5. Verify Transaction
    const verifyRes = await request(`/api/v1/transactions/${txnId}/verify`, {
      method: 'POST',
      headers: authHeaders
    }, {
      providerTransactionId: 'pi_test_live_001'
    });
    assert.equal(verifyRes.statusCode, 200);
    assert.equal(verifyRes.body.data.transaction.status, 'VERIFIED');
    assert.equal(verifyRes.body.data.entitlement.status, 'ACTIVE');

    // 6. Verify Access is now ALLOWED
    const accessPost = await request(`/api/v1/readings/${readingId}/access?featureKey=DETAILED_REPORT`, {
      headers: authHeaders
    });
    assert.equal(accessPost.statusCode, 200);
    assert.equal(accessPost.body.data.decision, 'ALLOW');
  });

  it('POST /api/v1/webhooks/mock_pay verifies HMAC signature & replay protection', async () => {
    const rawPayload = JSON.stringify({
      id: 'evt_http_webhook_01',
      type: 'PAYMENT_SUCCESS',
      amount: 499
    });
    const signature = SignatureVerifier.generateHmacSha256(rawPayload, WEBHOOK_SECRET);

    // Initial delivery
    const res1 = await request('/api/v1/webhooks/mock_pay', {
      method: 'POST',
      headers: { 'x-signature': signature }
    }, rawPayload);

    assert.equal(res1.statusCode, 201);
    assert.equal(res1.body.data.isDuplicate, false);

    // Replay delivery
    const res2 = await request('/api/v1/webhooks/mock_pay', {
      method: 'POST',
      headers: { 'x-signature': signature }
    }, rawPayload);

    assert.equal(res2.statusCode, 200);
    assert.equal(res2.body.data.isDuplicate, true);
  });

  it('Returns standard error envelope for 404 Not Found', async () => {
    const res = await request('/api/v1/unknown_route');
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.ok(res.body.error.requestId);
  });
});
