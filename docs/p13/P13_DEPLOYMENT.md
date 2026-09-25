# P13 — Production Deployment & Reliability Architecture

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Status:** APPROVED & AUTHORITATIVE  

---

## 1. Modular Monolith Deployment Model

Kai RegAI deploys as a lightweight, single-process **modular monolith** running on Node.js 24 LTS.
It requires no external daemon dependencies (no separate Redis, no external microservices, zero npm database driver binaries).

```text
                  HTTPS Internet Traffic
                            │
                            ▼
              Reverse Proxy / Cloudflare CDN
              - SSL/TLS Termination
              - DDoS Mitigation
                            │ (HTTP/2 Internal)
                            ▼
               Kai RegAI Backend Container
               (node:http / node:sqlite / node:crypto)
                            │
                            ▼
                Persistent Storage Volume
                 (/data/kai_regai_prod.db)
```

---

## 2. Process Lifecycle & Startup Orchestration

1. **Configuration Load**: Parses environment variables (`src/backend/config.js`).
2. **Database Initialization**: Connects to SQLite and enforces `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;`.
3. **Automated Schema Migrations**: `MigrationEngine` evaluates `schema_migrations` table and applies pending migrations sequentially within an ACID transaction.
4. **Service Wiring**: Injects dependencies into `AuthService`, `ReadingService`, `CommerceService`, `SyncService`, and `WebhookService`.
5. **HTTP Listener**: Listens on configured host/port, ready to serve requests.
6. **Graceful Shutdown**: Catches `SIGTERM` and `SIGINT`, ceases new connection acceptance, flushes active database transactions, and closes database cleanly.

---

## 3. Health Checks & Probes

- **Liveness & Readiness**: `GET /health` returns `200 OK` when the internal HTTP listener and SQLite database connection are operational (`SELECT 1;`).
- Response latency target: `< 5ms`.
- Orchestrators (Kubernetes, AWS ECS, Docker Compose) should map HTTP probe directly to `/health`.

---

## 4. Backup & Disaster Recovery Design

### 4.1. SQLite WAL Backup (`VACUUM INTO`)
Because SQLite operates in Write-Ahead Logging (WAL) mode, online, non-blocking backups can be performed while active reads and writes are underway:
```bash
sqlite3 /data/kai_regai_prod.db "VACUUM INTO '/backups/backup_$(date +%Y%m%d_%H%M%S).db';"
```

### 4.2. Retention & Recovery Objectives
- **RPO (Recovery Point Objective)**: < 1 hour via hourly WAL backup snapshots.
- **RTO (Recovery Time Objective)**: < 5 minutes (swapping file into place and restarting container).
