# P17 Environment Architecture & Configuration Model

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. Environment Separation Model

Kai RegAI maintains strict separation across environments:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   DEVELOPMENT   │       │     STAGING     │       │   PRODUCTION    │
│  - Localhost    │       │  - Pre-prod VPS │       │  - Dedicated VPS│
│  - In-memory DB │       │  - NVMe test DB │       │  - NVMe prod DB │
│  - Dev secrets  │       │  - Sandbox keys │       │  - Prod secrets │
│  - Debug logs   │       │  - Synthetic QA │       │  - JSON logs    │
│  - Wildcard CORS│       │  - Explicit CORS│       │  - Strict CORS  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Non-Negotiable Invariants
* **Zero Production Credentials in Dev**: Development environments must never point to production databases or payment gateways.
* **Zero Wildcard Origins in Production**: Production CORS strictly enumerates authorized production domains (e.g., `https://kairegai.com`, `https://app.kairegai.com`).
* **Zero In-Memory DB in Production**: Production must mount durable filesystem storage. Startup validation halts if `:memory:` is configured.

---

## 2. Configuration Schema & Variable Matrix

| Variable | Development Default | Staging Requirement | Production Requirement | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `staging` | `production` | Node runtime environment |
| `PORT` | `3000` | `3000` | `3000` | Internal listening port |
| `HOST` | `127.0.0.1` | `0.0.0.0` | `0.0.0.0` | Network binding interface |
| `DATABASE_URL` | `:memory:` | `/data/kai_staging.db` | `/data/kai_prod.db` | SQLite persistent storage path |
| `SESSION_SECRET` | *Dev fallback* | Strong $\ge 32$ chars | Strong $\ge 32$ chars (Hex/Base64) | Session signing key |
| `WEBHOOK_SECRET`| *Dev fallback* | Sandbox signing secret | Live provider signing secret | Payment webhook HMAC key |
| `CORS_ORIGINS` | `*` or localhost | Explicit staging URLs | Explicit production URLs | Authorized web origins |
| `LOG_LEVEL` | `DEBUG` | `INFO` | `INFO` | Structured logging verbosity |

---

## 3. Startup Configuration Validation

Codified in `src/backend/config.js` (`validateConfig`) and enforced in `Server.js` (`validateStartupConfig`):
* If `NODE_ENV === 'production'`, startup validates that:
  1. `SESSION_SECRET` is not the default development placeholder and is $\ge 32$ characters.
  2. `DATABASE_URL` is a persistent filesystem path (not `:memory:`).
  3. `CORS_ORIGINS` does not contain wildcard `*`.
  4. `WEBHOOK_SECRET` is not the default placeholder.
* Any violation aborts startup immediately with exit code 1 and descriptive operational errors.
