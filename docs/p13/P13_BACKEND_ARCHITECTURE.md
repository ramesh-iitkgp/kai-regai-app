# P13 — Production Backend Architecture Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Status:** APPROVED & AUTHORITATIVE  

---

## 1. Executive Summary & Design Philosophy

Phase P13 establishes the **authoritative production backend boundary** for Kai RegAI. Prior phases (P5–P12) established deterministic palm computer vision, guided questionnaires, codex matching rule synthesis (P8), empathetic AI narration (P9), multi-tier report presentation (P10), resilient client-side persistence and sync queuing (P11), and commercial entitlement modeling (P12).

P13 constructs a zero-dependency, high-speed **modular monolith backend** in Node.js 24 using native capabilities:
- Native `node:sqlite` (`DatabaseSync`) with WAL mode, foreign keys, and atomic transactions.
- Native `node:http` API server with clean middleware pipelines and request correlation.
- Native `node:crypto` constant-time HMAC-SHA256 signature verification and cryptographically secure token hashing.

### Core Architectural Principle
> **THE CLIENT REQUESTS. THE SERVER DECIDES.**  
> **PAYMENT PROVIDER $\longrightarrow$ SERVER VERIFICATION $\longrightarrow$ TRANSACTION $\longrightarrow$ ENTITLEMENT $\longrightarrow$ AUTHORIZED ACCESS.**

---

## 2. The 10 Core Architectural Invariants

Every backend service, repository, and controller strictly enforces the 10 Kai RegAI architectural invariants:

1. **Invariant 1: P8 DECIDES.**  
   The backend does NOT invent, alter, or interpret palmistry rules.
2. **Invariant 2: P9 EXPLAINS.**  
   The backend does NOT re-generate or modify empathetic narrative synthesis.
3. **Invariant 3: P10 PRESENTS.**  
   The backend does NOT dictate UI report presentation or card styling.
4. **Invariant 4: P11 PRESERVES.**  
   The backend integrates cleanly with P11 ReadingRecord schemas, maintaining provenance and reproducible reading snapshots.
5. **Invariant 5: PAYMENT GRANTS ENTITLEMENT.**  
   Entitlements are granted exclusively through verified financial events or authorized administrative actions.
6. **Invariant 6: ENTITLEMENT GRANTS ACCESS.**  
   Access to premium reading tiers, detailed chapters, and PDF exports is gated strictly by active server-side entitlements.
7. **Invariant 7: CLIENT STATE IS NOT AUTHORITATIVE FOR COMMERCIAL ACCESS.**  
   A client sending `isPremium: true` or tampering with local flags is rejected; access decisions are resolved server-side.
8. **Invariant 8: STORE THE READING, NOT THE PERSON.**  
   The backend stores reading snapshots and telemetry without tracking invasive identity vectors.
9. **Invariant 9: RAW PALM IMAGES MUST NOT BECOME A DEFAULT SERVER-SIDE DATASET.**  
   Raw photographs, camera buffers, and pixel matrices are strictly rejected at the API and service boundary via `PrivacyGuard`.
10. **Invariant 10: HISTORICAL READINGS MUST REMAIN REPRODUCIBLE.**  
    Financial events such as refunds, cancellations, and subscription expirations revoke premium access but **never delete or alter the historical ReadingRecord**.

---

## 3. High-Level System Architecture

```text
                               ┌────────────────────────────────┐
                               │        KAI REGAI CLIENT        │
                               │   (Offline-First / P11 Sync)   │
                               └───────────────┬────────────────┘
                                               │ HTTPS / API v1
                                               ▼
                               ┌────────────────────────────────┐
                               │           API ROUTER           │
                               │  - Request ID   - Rate Limit   │
                               │  - CORS / Auth  - 2MB Quota    │
                               └───────────────┬────────────────┘
                                               │
             ┌───────────────────┬─────────────┴───────┬────────────────────┐
             ▼                   ▼                     ▼                    ▼
     ┌───────────────┐   ┌───────────────┐     ┌───────────────┐    ┌───────────────┐
     │  AUTH SERVICE │   │READING SERVICE│     │COMMERCE SERVC │    │ SYNC SERVICE  │
     │ - Guest Sess  │   │ - IDOR Shield │     │ - Transactions│    │ - Batch Sync  │
     │ - Account Sess│   │ - PrivacyGuard│     │ - Entitlements│    │ - Conflict Det│
     │ - Migration   │   │ - Snapshot St.│     │ - Access Eval │    │ - Pull/Push   │
     └───────┬───────┘   └───────┬───────┘     └───────┬───────┘    └───────┬───────┘
             │                   │                     │                    │
             └───────────────────┼─────────────────────┼────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐         ┌───────────────────────┐
                     │   WEBHOOK SERVICE     │◄────────┤   PAYMENT PROVIDER    │
                     │ - HMAC Signature      │         │   (Stripe / Apple /   │
                     │ - Replay Guard        │         │    Google / Mock)     │
                     └───────────┬───────────┘         └───────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   AUDIT & TELEMETRY   │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  RELATIONAL DATABASE  │
                     │ (SQLite WAL / Tables) │
                     └───────────────────────┘
```

---

## 4. Service Boundaries & Responsibilities

### 4.1. AuthService (`src/backend/services/AuthService.js`)
- Issues anonymous guest identities (`GST-...`) and authenticated accounts (`USR-...`).
- Generates cryptographically random 256-bit bearer tokens.
- Persists only SHA-256 hashed tokens in `sessions` table (zero plaintext secret exposure in DB).
- Enforces session expiration (30-day default) and immediate revocation (logout).
- Performs **atomic guest-to-account migration** (`migrateGuestToAccount`), reassigning readings, transactions, and entitlements within an ACID transaction.

### 4.2. ReadingService (`src/backend/services/ReadingService.js`)
- Server-authoritative repository for reading records.
- Enforces strict Insecure Direct Object Reference (IDOR) protection: `row.owner_id === requesterId`.
- Integrates `PrivacyGuard`: scans payloads and immediately rejects raw photographic properties (`rawImage`, `cameraImage`, `imageBuffer`, base64 image prefixes).
- Preserves historical provenance: saves `schemaVersion`, `contentHash`, `featureSnapshot`, and `reportSnapshot`.
- Supports soft deletion (`deleted_at`) and verified export bundles.

### 4.3. CommerceService (`src/backend/services/CommerceService.js`)
- Authoritative commercial orchestrator:
  - `createTransaction`: Records pending transaction with multi-currency catalog resolution and idempotency checks.
  - `verifyTransaction`: Validates payment proof, marks `VERIFIED`, and atomically inserts an `ACTIVE` entitlement.
  - `evaluateAccess`: Authoritatively checks whether an active entitlement grants a requested `featureKey` (reading-scoped or account-wide).
  - `refundTransaction`: Transitions transaction to `REFUNDED` and revokes linked entitlements while strictly leaving the underlying `ReadingRecord` intact.
  - `restoreEntitlements`: Returns all active entitlements for authenticated user across devices.

### 4.4. SyncService (`src/backend/services/SyncService.js`)
- Coordinates batch upload and pull synchronization compatible with P11 `SyncEngine`.
- Validates each item for ownership, size limits, and biometric privacy.
- Detects conflicts: if a reading already exists with a different content hash, flags as `CONFLICT` rather than overwriting historical evidence.
- Handles deletion propagation.

### 4.5. WebhookService (`src/backend/services/WebhookService.js`)
- Ingests asynchronous payment events from providers.
- Verifies cryptographic HMAC-SHA256 signatures via constant-time buffer comparison (`SignatureVerifier`).
- Implements persistent replay protection via `webhook_events` table: duplicate `(provider, eventId)` submissions are acknowledged idempotently without duplicating entitlements.

### 4.6. AuditService (`src/backend/services/AuditService.js`)
- Records structured security audit logs for critical operations: `ACCOUNT_CREATED`, `ACCOUNT_MIGRATED`, `READING_CREATED`, `READING_DELETED`, `TRANSACTION_VERIFIED`, `ENTITLEMENT_GRANTED`, `ENTITLEMENT_REVOKED`, `WEBHOOK_PROCESSED`, `UNAUTHORIZED_ACCESS`.
- Privacy-safe: never logs raw reading content, tokens, or biometric attributes.

---

## 5. Persistence & Database Architecture

The backend utilizes an optimized relational schema managed by `MigrationEngine`:
- **`schema_migrations`**: Versioned, repeatable migration tracker.
- **`users`**: User identities with `owner_type` (`GUEST` vs `ACCOUNT`).
- **`sessions`**: Bearer token hashes, user foreign key, and expiration timestamps.
- **`readings`**: Feature models, report snapshots, content hashes, and deletion markers.
- **`transactions`**: Financial records, idempotency keys, and verification status.
- **`entitlements`**: Granted commercial tiers, features, and active/revoked lifecycle status.
- **`webhook_events`**: Provider event IDs and processing status for replay guard.
- **`audit_events`**: Security event ledger with request correlation.
