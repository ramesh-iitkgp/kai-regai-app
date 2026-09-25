# P17 Security Hardening & DevSecOps Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. Security Architecture & Threat Model

Kai RegAI implements defense-in-depth across the entire infrastructure stack:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Network Perimeter (Cloudflare Edge)                      │
│    - TLS 1.3 enforced                                       │
│    - DDoS rate limiting & IP reputation filtering           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. HTTP Transport & Ingress Hardening                       │
│    - OWASP Security Headers (CSP, HSTS, X-Content-Type)      │
│    - Explicit CORS origins (No wildcards in production)     │
│    - Strict Request Body bounds (< 2 MB)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Application & Authorization Boundary                     │
│    - In-Memory Sliding Window Rate Limiting                 │
│    - Cryptographic HMAC-SHA256 Webhook Verification         │
│    - IDOR Ownership Checks on all reading queries           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Data Layer & Cryptographic Token Storage                 │
│    - SHA-256 hashed bearer tokens (zero raw token storage)  │
│    - SQLite Foreign Key enforcement & WAL mode              │
│    - Biometric Privacy Shield (rejection of raw images)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Production Security Headers

Verified by automated tests (`tests/backend/p17_production_infrastructure.test.js`):

| Header | Production Value | Protection Provided |
| :--- | :--- | :--- |
| **Content-Security-Policy** | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none';` | Blocks XSS, malicious script injection, and clickjacking frame embedding. |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS for 1 year; prevents SSL stripping. |
| **X-Content-Type-Options** | `nosniff` | Prevents browser MIME-type sniffing attacks. |
| **X-Frame-Options** | `DENY` | Prevents UI redressing and clickjacking. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Protects private URL paths from leaking in HTTP Referer. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Disallows sensor access on backend API responses. |

---

## 3. Secret Management & Rotation Procedure

### Zero Secrets in Repository
* Verified via Git history scans: Zero API keys, private keys, or passwords exist in version control.
* Environment variables injected via runtime secrets management (AWS Parameter Store / Docker secrets / Systemd EnvironmentFile).

### Secret Rotation Runbook
1. **Session Secret Rotation**:
   * Generate new 64-character secret: `openssl rand -hex 32`.
   * Update production environment configuration.
   * Gracefully restart service. Existing sessions expire naturally over 30 days or users re-authenticate seamlessly via anonymous guest tokens.
2. **Webhook Signing Secret Rotation**:
   * Configure new webhook signing secret in payment provider (Apple / Google / Stripe).
   * Update `WEBHOOK_SECRET` in environment.
   * Reload backend process.
