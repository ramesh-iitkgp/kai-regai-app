# P13 — Production Environment Configuration

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Status:** APPROVED & AUTHORITATIVE  

---

## 1. Environment Variables Specification

The Kai RegAI backend is configured strictly via environment variables.

| Variable | Description | Default (Development) | Production Requirement |
|:---|:---|:---|:---|
| `NODE_ENV` | Runtime environment tier | `development` | `production` |
| `PORT` | HTTP port for server listener | `3000` | Typically `8080` or container-assigned |
| `HOST` | Host address binding | `0.0.0.0` | `0.0.0.0` or private interface |
| `DATABASE_URL` | SQLite file path or memory flag | `:memory:` (or `./data/kai_regai.db`) | `/data/kai_regai_prod.db` (persistent volume) |
| `SESSION_SECRET` | Secret seed for session token HMAC hashing | `kai-regai-dev-session-secret-32bytes` | Mandatory 256-bit cryptographically secure secret |
| `WEBHOOK_SECRET` | Shared HMAC signing secret for payment webhooks | `kai-regai-webhook-secret-p13` | Mandatory provider-matched production webhook secret |
| `CORS_ORIGINS` | Comma-separated list of permitted origins | `http://localhost:5173,http://localhost:3000` | Explicit production domain(s) (e.g. `https://app.kairegai.com`) |

---

## 2. Environment Tiers

### 2.1. Development
- In-memory or local file-backed SQLite database.
- Mock payment provider enabled (`MOCK_PROVIDER`).
- Relaxed rate limiting (120 req/min).

### 2.2. Testing / CI
- Strict in-memory SQLite (`:memory:`).
- Deterministic random seeds.
- Automated migrations executed prior to suite execution.

### 2.3. Production
- High-durability file-backed SQLite on persistent SSD volume with WAL mode enabled.
- Cryptographic keys injected via secure secret manager (e.g. AWS Secrets Manager, GCP Secret Manager).
- Strict CORS origins (no wildcard `*` with credentials).
- HTTPS enforced by upstream reverse proxy / ingress (Cloudflare / NGINX / ALB).

---

## 3. Secret Hygiene & Zero-Commit Policy

- `.env` files are strictly added to `.gitignore` and must never be committed to source control.
- Hardcoded fallback secrets are restricted to development mode and trigger warnings if detected in production.
- Key rotation: Session tokens expire in 30 days, allowing graceful token invalidation during security rotations.
