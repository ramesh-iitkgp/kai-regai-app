# P13 — Production Security Model & Threat Mitigations

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Status:** APPROVED & AUTHORITATIVE  

---

## 1. Security Philosophy & Invariants

Kai RegAI treats reading interpretations, session identities, and financial transactions as mission-critical boundaries.

Key security tenets:
1. **The Client is Untrusted**: Any client-asserted privilege (`premium: true`, `isUnlocked: true`, `role: admin`) is completely ignored by the server. Access is computed strictly from verified database records.
2. **Cryptographic Token Hashing**: Raw session bearer tokens are never persisted in the database; only SHA-256 hashes are stored.
3. **Defense in Depth**: IDOR checks, payload inspection, rate limiting, and size boundaries guard every request.
4. **Zero Photographic Retention**: The server strictly rejects raw biometric data.

---

## 2. Threat Matrix & Countermeasures

| Threat ID | Threat Description | Attack Vector | Backend Mitigation | Verified By |
|:---|:---|:---|:---|:---|
| **T01** | Insecure Direct Object Reference (IDOR) | Attacker alters `readingId` to read another user's reading | Explicit ownership validation (`row.owner_id === requesterId`); returns `403 Forbidden` | `S01`, `S14` |
| **T02** | Cross-Account Entitlement Snooping | Attacker calls `/api/v1/entitlements` targeting foreign user | Requester ID strictly enforced; returns `403 Forbidden` | `S02` |
| **T03** | Unauthorized Transaction Manipulation | Attacker attempts to verify or list another user's transactions | Strict requester-to-owner verification on all transaction endpoints | `S03` |
| **T04** | Client-Side Privilege Escalation | Attacker sends `premium: true` in reading body | Server evaluates access solely via active database entitlements; returns `DENY` | `S04` |
| **T05** | Entitlement Manufacture | Attacker POSTs a synthetic entitlement to the server | No endpoint allows direct entitlement creation; entitlements require verified transactions | `S05` |
| **T06** | Unverified Transaction Exploit | Attacker submits transaction with `status: "VERIFIED"` | Transaction creation ignores client status, enforcing `status: "PENDING"` | `S06` |
| **T07** | Double Spend / Duplicate Charge | Rapid concurrent or repeated checkout requests | Unique database constraint on `idempotency_key` ensures atomic deduplication | `S07`, `B08` |
| **T08** | Webhook Replay Attack | Attacker re-submits captured legitimate webhook | Persistent `webhook_events` tracking by `(provider, eventId)` prevents double grant | `S08`, `B18` |
| **T09** | Forged Webhook Payload | Attacker synthesizes fake webhook events | HMAC-SHA256 signature verification using `timingSafeEqual` prevents forgery | `S09` |
| **T10** | Session Hijacking / Stale Token | Attacker uses expired or leaked session token | Server validates `expires_at > now` and `revoked_at IS NULL` on every request | `S10`, `S11` |
| **T11** | Denial of Service via Payload Exhaustion | Attacker sends massive payloads (> 2MB) | Streaming body reader enforces 2MB limit with immediate stream destruction and `413` | `S12` |
| **T12** | Raw Biometric Exfiltration | Attacker or buggy client submits camera image | `PrivacyGuard` inspects payload and throws `400 Bad Request` on any image field | `S13` |
| **T13** | Guest Migration Account Takeover | Attacker attempts to claim an existing account without ownership | `migrateGuestToAccount` requires matching requester session, preventing hijacking | `S15`, `B05` |

---

## 3. Session Security & Token Lifecycle

### 3.1. Token Generation & Storage
- Tokens are generated using Node.js native `crypto.randomBytes(32).toString('hex')` (256 bits of entropy).
- Tokens are hashed immediately via `crypto.createHash('sha256').update(token).digest('hex')`.
- The database stores **only** the `token_hash`. In the event of a database compromise, active bearer tokens cannot be derived.

### 3.2. Lifecycle States
```text
[ Token Issued ]
       │
       ▼
 [ ACTIVE ] ──( 30 Days Elapsed )──► [ EXPIRED ] (401 Unauthorized)
       │
       └───( User Logout )────────► [ REVOKED ] (401 Unauthorized)
```

---

## 4. Webhook Security & Constant-Time Validation

To protect against timing side-channel attacks, `SignatureVerifier` utilizes Node's native `timingSafeEqual`:
```javascript
const sigBuf = Buffer.from(signature, 'hex');
const expBuf = Buffer.from(expectedSignature, 'hex');
if (sigBuf.length !== expBuf.length) return false;
return timingSafeEqual(sigBuf, expBuf);
```
Unverified payloads are rejected with `401 Unauthorized` before any database queries execute.

---

## 5. Rate Limiting & Abuse Prevention

A sliding window rate limiter protects endpoints against brute-force attacks and resource exhaustion:
- Window: 60 seconds.
- Limit: 120 requests/min per IP (configurable).
- Standard headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
- Breach response: `429 Too Many Requests`.
