# P13 — Production API Architecture & Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Status:** APPROVED & AUTHORITATIVE  

---

## 1. Overview & API Principles

Kai RegAI exposes a RESTful, versioned HTTP API under the `/api/v1` namespace.

### Core Principles
1. **Explicit Versioning**: All production endpoints reside under `/api/v1/` (with unversioned `/health` reserved for infrastructure probes).
2. **Standard Error Envelope**: Uniform response format for all errors:
   ```json
   {
     "error": {
       "code": "ERROR_CODE",
       "message": "Human-readable description",
       "requestId": "REQ-uuid"
     }
   }
   ```
3. **Request Correlation**: Every request receives a unique `X-Request-ID` header, returned in both success and error responses.
4. **Idempotent Mutations**: Financial and synchronization requests support the `Idempotency-Key` header.
5. **No Stack Trace Leakage**: Production errors sanitize database internals, SQL snippets, and filesystem traces.
6. **Payload Quota**: Requests are restricted to a maximum size of 2 MB (HTTP 413 on breach).

---

## 2. Global Headers & Middleware Pipeline

```text
Incoming Request
       │
       ▼
1. Request ID Middleware (`X-Request-ID: REQ-...`)
       ▼
2. CORS Middleware (Origin check, Allowed Methods/Headers)
       ▼
3. Rate Limit Middleware (Sliding window, IP-based, 429 if exceeded)
       ▼
4. Auth Middleware (`Authorization: Bearer <token>`, validates session)
       ▼
5. Route Handler / Controller
       ▼
6. Error Handler (Sanitizes errors, maps status codes)
```

---

## 3. Complete Endpoint Catalogue

### 3.1. Infrastructure & Health

#### `GET /health` / `GET /api/v1/health`
- **Auth:** Public
- **Description:** Liveness and readiness probe for orchestration and load balancers.
- **Response `200 OK`:**
  ```json
  {
    "status": "HEALTHY",
    "version": "1.0.0",
    "uptimeSeconds": 1420,
    "components": {
      "database": "UP",
      "api": "UP"
    }
  }
  ```

---

### 3.2. Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/guest`
- **Auth:** Public
- **Description:** Generates an anonymous guest profile and session token.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "userId": "GST-1727259000-A1B2C3",
        "ownerType": "GUEST",
        "displayName": "Anonymous Seeker"
      },
      "sessionId": "SES-1727259000-D4E5F6",
      "token": "4f9a8b...",
      "expiresAt": "2026-10-25T10:00:00.000Z"
    }
  }
  ```

#### `POST /api/v1/auth/account`
- **Auth:** Public
- **Request Body:** `{ "email": "user@example.com", "displayName": "Name" }`
- **Response `200 OK`:** Returns user session with `USR-...` identifier and bearer token.

#### `POST /api/v1/auth/migrate`
- **Auth:** Required (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "guestId": "GST-1727259000-A1B2C3",
    "accountEmail": "user@example.com",
    "accountDisplayName": "Verified Seeker"
  }
  ```
- **Description:** Atomically upgrades the authenticated guest to an account, reassigning all readings, transactions, and entitlements.

#### `POST /api/v1/auth/logout`
- **Auth:** Required
- **Description:** Revokes the current session immediately.

---

### 3.3. User Profile (`/api/v1/users`)

#### `GET /api/v1/users/me`
- **Auth:** Required
- **Description:** Retrieves the authenticated user profile.

#### `DELETE /api/v1/users/me`
- **Auth:** Required
- **Description:** GDPR-compliant deletion. Cascades to sessions, soft-deletes readings, and revokes entitlements while maintaining financial audit records.

---

### 3.4. Readings (`/api/v1/readings`)

#### `POST /api/v1/readings`
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "readingId": "RDG-1727259000-XYZ",
    "ownerId": "USR-123",
    "schemaVersion": "1.0.0",
    "readingMethod": "MODE_1_CAMERA",
    "reportTier": "STANDARD",
    "contentHash": "sha256-hash",
    "featureSnapshot": { ... },
    "reportSnapshot": { ... },
    "metadata": { ... }
  }
  ```
- **Security Check:** Rejects payload if `ownerId !== requester.userId` (IDOR check) or if raw photographic buffers exist (`PrivacyGuard`).
- **Response `201 Created` / `200 OK` (Duplicate):** Returns `{ "success": true, "data": { ... } }`.

#### `GET /api/v1/readings`
- **Auth:** Required
- **Description:** Lists all active readings belonging exclusively to the requesting user.

#### `GET /api/v1/readings/:id`
- **Auth:** Required
- **Description:** Retrieves reading by ID. Throws `403 Forbidden` if owned by another user.

#### `DELETE /api/v1/readings/:id`
- **Auth:** Required
- **Description:** Soft-deletes reading. IDOR protected.

#### `GET /api/v1/readings/:id/export`
- **Auth:** Required
- **Description:** Generates a secure, standalone JSON export bundle of the reading.

#### `GET /api/v1/readings/:id/access?featureKey=:feature`
- **Auth:** Required
- **Description:** Server-authoritative access evaluation. Returns `{ "decision": "ALLOW" | "DENY", "allowedFeatures": [...] }`.

---

### 3.5. Synchronization (`/api/v1/sync`)

#### `POST /api/v1/sync/batch`
- **Auth:** Required
- **Request Body:** `{ "items": [ { "readingId": "...", "contentHash": "...", ... } ] }`
- **Response `200 OK`:** Returns per-item sync status: `SYNCED`, `CONFLICT`, `REJECTED`, or `DELETED`.

#### `GET /api/v1/sync/pull?since=:timestamp`
- **Auth:** Required
- **Description:** Pulls readings updated since the specified ISO timestamp.

---

### 3.6. Commercial Transactions (`/api/v1/transactions`)

#### `POST /api/v1/transactions`
- **Auth:** Required
- **Headers:** `Idempotency-Key: <unique-key>` (optional, recommended)
- **Request Body:** `{ "productId": "kai_standard", "readingId": "RDG-100", "currency": "USD" }`
- **Response `201 Created`:** Returns pending transaction record.

#### `GET /api/v1/transactions`
- **Auth:** Required
- **Description:** Lists all transactions owned by the requesting user.

#### `POST /api/v1/transactions/:id/verify`
- **Auth:** Required
- **Request Body:** `{ "providerTransactionId": "pi_123", "verificationToken": "..." }`
- **Description:** Verifies payment authenticity, transitions status to `VERIFIED`, and atomically grants active entitlement.

#### `POST /api/v1/transactions/:id/refund`
- **Auth:** Required (Admin or Authorized Owner)
- **Description:** Marks transaction as `REFUNDED`, revokes linked entitlements, and preserves `ReadingRecord`.

---

### 3.7. Entitlements (`/api/v1/entitlements`)

#### `GET /api/v1/entitlements`
- **Auth:** Required
- **Description:** Lists all active and historical entitlements for the current user.

#### `POST /api/v1/entitlements/restore`
- **Auth:** Required
- **Description:** Synchronizes and returns active entitlements across multiple devices.

---

### 3.8. Payment Webhooks (`/api/v1/webhooks/:provider`)

#### `POST /api/v1/webhooks/:provider`
- **Auth:** Signature-based (`X-Signature` or `Stripe-Signature`)
- **Headers:** `X-Signature: <hmac-sha256-hex>`
- **Description:** Processes asynchronous payment events with constant-time cryptographic verification and persistent replay protection.
