# P13 — Production Backend & Commercial Authority Completion Report

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Author:** Principal Backend Architect & Commercial Systems Lead  
**Date:** September 2026  
**Status:** COMPLETE & FROZEN  

---

## 1. Executive Summary

Phase P13 establishes the **authoritative production backend and commercial boundary** for Kai RegAI without rewriting or compromising the frozen P5–P12 contracts. Built as a high-performance **modular monolith** using native Node.js 24 LTS capabilities (`node:sqlite`, `node:http`, `node:crypto`), the system enforces:
- Invariant 5: PAYMENT GRANTS ENTITLEMENT.
- Invariant 6: ENTITLEMENT GRANTS ACCESS.
- Invariant 7: CLIENT STATE IS NOT AUTHORITATIVE FOR COMMERCIAL ACCESS.
- Invariant 8: STORE THE READING, NOT THE PERSON.
- Invariant 9: RAW PALM IMAGES MUST NOT BECOME A DEFAULT SERVER-SIDE DATASET.
- Invariant 10: HISTORICAL READINGS MUST REMAIN REPRODUCIBLE.
- "THE CLIENT REQUESTS. THE SERVER DECIDES."

All 15 non-negotiable security test cases (S01–S15), 20 golden backend cases (B01–B20), 5 end-to-end API integration tests, and the full 229-test P5–P12 regression suite passed with 100% success (269/269 tests green).

---

## 2. Starting Git Checkpoint

- **Baseline Commit:** `bd8d18a` (P12 Monetization & Entitlement Architecture Complete).
- **Baseline Regression:** 229/229 passing tests.
- **Baseline Build Time:** 85 ms.

---

## 3. Backend Architecture

The backend is implemented in `src/backend/` as a modular monolith:
- **`src/backend/database/`**: Relational persistence via native `node:sqlite` (`DatabaseSync`), enforcing foreign key constraints and Write-Ahead Logging (WAL).
- **`src/backend/security/`**: Token hashing, sliding-window rate limiting, constant-time HMAC signature verification, and biometric payload filtering.
- **`src/backend/services/`**: Domain services for Authentication, Readings, Commerce, Synchronization, Webhooks, and Auditing.
- **`src/backend/api/`**: Middleware pipelines, domain controllers, and an HTTP router serving `/health` and `/api/v1/*`.

---

## 4. API Architecture

- Versioned API: `/api/v1/`
- Infrastructure Probe: `/health` (exposing liveness, readiness, and uptime).
- Request Correlation: `X-Request-ID` assigned to every request and attached to response headers.
- Standard Error Model:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable description",
      "requestId": "REQ-uuid"
    }
  }
  ```
- Strict 2MB payload ceiling enforced at streaming socket level.

---

## 5. Authentication

- Full dual-mode support:
  - Ephemeral Guest Sessions (`GST-...`)
  - Authenticated Accounts (`USR-...`)
- Tokens: 256-bit entropy bearer tokens.
- Storage: Cryptographic SHA-256 token hashing in SQLite (plaintext tokens are never stored in the database).
- Expiration: 30-day default TTL.
- Revocation: Immediate session invalidation on logout.

---

## 6. Authorization

- Server-side authorization on all operations.
- The server independently computes:
  1. Who is requesting?
  2. What resource is being accessed?
  3. Who owns the resource?
  4. What verified entitlement exists?
  5. Is the requested feature permitted?

---

## 7. Reading Ownership & IDOR Protection

- Server-side readings have explicit ownership: `readings.owner_id REFERENCES users(user_id)`.
- Enforces strict Insecure Direct Object Reference (IDOR) checks on all reads, updates, exports, and deletions.
- Any attempt by User A to access User B's reading immediately throws `403 Forbidden` and creates a security audit event.

---

## 8. Synchronization

- Batch sync endpoint (`POST /api/v1/sync/batch`) compatible with P11 `SyncEngine` and `SyncQueue`.
- Per-item status tracking: `SYNCED`, `CONFLICT`, `REJECTED`, `DELETED`.
- Conflict policy: Historical readings are immutable snapshots. Submitting conflicting content hashes triggers a `CONFLICT` status rather than overwriting historical evidence.
- Pull sync endpoint (`GET /api/v1/sync/pull?since=:timestamp`).

---

## 9. Transactions

- Implemented in `src/backend/services/CommerceService.js`.
- Transaction lifecycle states: `PENDING` $\rightarrow$ `VERIFIED` $\rightarrow$ `REFUNDED`.
- Multi-currency product catalog integration via `defaultProductCatalog`.
- Transaction creation defaults to `PENDING`; client attempts to pass forged `VERIFIED` status are ignored.

---

## 10. Entitlements

- Authoritative entitlement model:
  - `owner_id`: Account or guest identifier.
  - `product_id` & `tier`: Product identifier and tier.
  - `features`: Array of granted feature keys (e.g. `DETAILED_REPORT`, `PDF_EXPORT`).
  - `status`: `ACTIVE`, `EXPIRED`, `REVOKED`.
- Granted exclusively upon transaction verification or webhook confirmation.
- Restored across devices via `POST /api/v1/entitlements/restore`.

---

## 11. Webhooks

- Provider-agnostic receiver: `POST /api/v1/webhooks/:provider`.
- Cryptographic verification via HMAC-SHA256 and constant-time buffer comparison (`timingSafeEqual`).
- Forged or unsigned payloads return `401 Unauthorized`.
- Atomic transaction and entitlement updates within an ACID database transaction.

---

## 12. Idempotency

- Transactions support `Idempotency-Key` header with database-level uniqueness constraints.
- Re-submitting the same transaction request returns the existing transaction without duplicate rows.
- Webhook events are deduplicated via `(provider, eventId)` tracking in `webhook_events`, preventing double-entitlements.

---

## 13. Security

- 15 non-negotiable security test cases (S01–S15) implemented and verified:
  - S01: IDOR reading access (PASS)
  - S02: IDOR entitlement access (PASS)
  - S03: IDOR transaction access (PASS)
  - S04: Forged premium flag defense (PASS)
  - S05: Forged entitlement defense (PASS)
  - S06: Forged transaction defense (PASS)
  - S07: Duplicate transaction idempotency (PASS)
  - S08: Webhook replay defense (PASS)
  - S09: Forged webhook signature defense (PASS)
  - S10: Expired session defense (PASS)
  - S11: Revoked session defense (PASS)
  - S12: Oversized payload defense (PASS)
  - S13: Raw image submission defense (PASS)
  - S14: Unauthorized deletion defense (PASS)
  - S15: Guest migration takeover defense (PASS)

---

## 14. Privacy

- Strict adherence to:
  - Invariant 8: STORE THE READING, NOT THE PERSON.
  - Invariant 9: RAW PALM IMAGES MUST NOT BECOME A DEFAULT SERVER-SIDE DATASET.
- `PrivacyGuard` inspects all incoming payloads and rejects raw photographic properties (`rawImage`, `cameraImage`, `imageBuffer`, base64 image strings, credit card numbers, CVVs).
- GDPR-compliant account deletion cascades cleanly (`DELETE /api/v1/users/me`).

---

## 15. Database

- Relational engine: Native Node.js 24 `DatabaseSync` (`node:sqlite`).
- Configuration:
  - `PRAGMA foreign_keys = ON;`
  - `PRAGMA journal_mode = WAL;`
- Tables:
  1. `schema_migrations`
  2. `users`
  3. `sessions`
  4. `readings`
  5. `transactions`
  6. `entitlements`
  7. `webhook_events`
  8. `audit_events`

---

## 16. Migrations

- Managed via `MigrationEngine` (`src/backend/database/MigrationEngine.js`).
- Versioned, repeatable, and idempotent.
- Migration `001_initial_production_schema` automatically applied on server initialization.

---

## 17. Observability

- Non-sensitive security audit logging via `AuditService`.
- Correlation tracking via `X-Request-ID`.
- Safe health endpoint (`GET /health`) exposing database status, uptime, and version without internal trace leakage.

---

## 18. Deployment

- Single-container or Node.js runtime process deployment.
- High-performance zero-dependency footprint.
- Non-blocking online SQLite WAL backups via `VACUUM INTO`.

---

## 19. Testing

- Test Framework: Native `node:test` runner.
- Security Test Suite: `tests/backend/p13_security_cases.test.js` (15 tests)
- Golden Backend Suite: `tests/backend/p13_golden_backend_cases.test.js` (20 tests)
- HTTP API Integration Suite: `tests/backend/p13_api_integration.test.js` (5 tests)
- Total P13 Tests: 40 tests (100% pass)

---

## 20. Golden Cases

- B01: Guest reading sync (PASS)
- B02: Authenticated reading sync (PASS)
- B03: Reading reopen (PASS)
- B04: Reading deletion (PASS)
- B05: Guest account migration (PASS)
- B06: Premium purchase (PASS)
- B07: Transaction verification (PASS)
- B08: Duplicate transaction (PASS)
- B09: Entitlement restoration (PASS)
- B10: Refund & reading preservation (PASS)
- B11: Expiration access denial (PASS)
- B12: Cross-device entitlement (PASS)
- B13: Offline sync (PASS)
- B14: Sync retry (PASS)
- B15: Conflict detection (PASS)
- B16: Unauthorized reading access (PASS)
- B17: Unauthorized entitlement access (PASS)
- B18: Webhook replay protection (PASS)
- B19: Account deletion (PASS)
- B20: Historical reading preservation (PASS)

---

## 21. Regression Results

```text
Baseline (P12):   229 / 229 PASS
P13 Additions:     40 /  40 PASS
Total Suite:      269 / 269 PASS (100%)
Regression Count:   0 failures
Execution Time:   1.69 seconds
Build Status:     PASS (73ms)
```

---

## 22. Performance

- HTTP Health Check: `4.16 ms`
- Guest Session Creation: `1.65 ms`
- End-to-End Reading + Purchase + Verification: `2.78 ms`
- Full 40-test backend suite execution: `70 ms`

---

## 23. Known Limitations

- Production multi-region active-active database replication is outside the scope of single-node SQLite; automated WAL streaming or Litestream is recommended for distributed multi-datacenter deployments.
- In-memory rate limiting operates per server node; distributed setups should back rate-limiters with Redis or sticky sessions.

---

## 24. Deferred Work

- Live production credentials for Stripe, Apple StoreKit, and Google Play Billing (intentionally deferred per Section 69; mock provider sandbox verified).
- Recurring subscription automated dunning engines (deferred to post-P13 production launch).

---

## 25. Final Status

```text
══════════════════════════════════════════════
PHASE P13 STATUS: COMPLETE & FROZEN
P0 Blockers: 0
P1 Blockers: 0
P2 Blockers: 0
P3 Blockers: 0
══════════════════════════════════════════════
```
