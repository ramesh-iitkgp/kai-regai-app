# P17 Production Deployment Checklist

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. Pre-Flight Verification Checklist

### Secrets & Credentials
- [x] Zero API keys or secrets in Git repository history (scanned with regex filters).
- [x] Production `SESSION_SECRET` is strong ($\ge 32$ characters) and generated via cryptographic random bytes.
- [x] Production `WEBHOOK_SECRET` configured from payment authority.
- [x] Secret rotation runbook documented and verified.

### Database & Durability
- [x] Persistent NVMe filesystem allocated for SQLite storage.
- [x] WAL journal mode verified (`PRAGMA journal_mode = WAL;`).
- [x] Foreign keys enabled and validated (`PRAGMA foreign_keys = ON;`).
- [x] Concurrency benchmark passes 30 simultaneous mixed operations without deadlocks or locks.
- [x] Idempotent schema migrations run automatically on startup.

### Deployment & Process Supervision
- [x] Docker / systemd service configured with auto-restart on unexpected exit.
- [x] In-flight request tracking and 15-second request timeouts enabled.
- [x] Graceful shutdown tested on `SIGTERM` / `SIGINT` with clean WAL checkpoint flush.
- [x] Reproducible production build verified via GitHub Actions CI.

### Security & Ingress Hardening
- [x] TLS 1.3 HTTPS termination configured at edge proxy.
- [x] OWASP security headers verified (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- [x] Strict CORS origin validation (zero wildcards allowed in production).
- [x] Payload size capped at 2 MB.
- [x] In-memory sliding window rate limiting verified for public and authenticated routes.

### Observability & Health Probes
- [x] `/health` returns 200 with component statuses and zero secret leaks.
- [x] `/health/live` returns 200 for process liveness orchestration.
- [x] `/health/ready` returns 200 for traffic routing readiness.
- [x] Structured JSON logging with correlation IDs (`x-request-id`).
- [x] Alert thresholds defined for P0 (critical outage), P1 (degraded), P2 (warnings).

### Backup & Disaster Recovery
- [x] Atomic snapshot backup implemented via SQLite `VACUUM INTO`.
- [x] Cryptographic SHA-256 manifest generated for every backup.
- [x] Backup integrity verification engine tested.
- [x] Disaster recovery restore verified (`P17-DR-001`) with measured RTO < 10 ms.
- [x] RPO documented at $\le 1\text{ Hour}$.

### Privacy Governance
- [x] Zero persistent raw palm photo storage (RAM-only ephemeral processing).
- [x] Zero camera frames transmitted to backend or third-party LLMs.
- [x] Zero biometric landmark coordinates in database or server logs.
- [x] Complete 1-tap data purge verified.

### Rollback Strategy
- [x] Rollback golden flow codified (`P17-ROLLBACK-001`).
- [x] Pre-deployment snapshot taken prior to schema migrations.
- [x] Backward-compatible schema migration policy enforced.
