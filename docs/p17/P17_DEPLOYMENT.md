# P17 Production Deployment Architecture & Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. Hosting Architecture & Topology

Kai RegAI deploys as a containerized, single-instance **Modular Monolith** running Node.js 24 on a dedicated Linux VPS / Cloud Container instance (e.g. AWS ECS / Fly.io / Railway / Hetzner Dedicated) equipped with local persistent NVMe storage.

```
 Internet / Mobile Clients
           │
           │ HTTPS (TLS 1.3)
           ▼
┌────────────────────────────────────────┐
│     Cloudflare Edge / Reverse Proxy    │
│  - DDoS Protection & Edge SSL (HSTS)   │
│  - Static Asset Caching (dist/assets)  │
│  - Rate-limit Ingress Safeguard        │
└──────────────────┬─────────────────────┘
                   │
                   │ Encrypted Reverse Proxy (Port 3000)
                   ▼
┌────────────────────────────────────────┐
│         Host Supervision (Docker)      │
│  ┌──────────────────────────────────┐  │
│  │   Kai RegAI Monolith (Node.js 24)│  │
│  │   - node:http (Port 3000)        │  │
│  │   - OWASP Security Headers (CSP) │  │
│  │   - In-flight Request Drainer    │  │
│  │   - RateLimiter (Sliding Window) │  │
│  │   - API v1 Dispatcher            │  │
│  └──────────────────┬───────────────┘  │
│                     │                  │
│                     │ node:sqlite      │
│                     ▼ (DatabaseSync)   │
│  ┌──────────────────────────────────┐  │
│  │ Persistent NVMe Volume (/data)   │  │
│  │ - kai_production.db              │  │
│  │ - kai_production.db-wal          │  │
│  │ - kai_production.db-shm          │  │
│  │ - /backups/ (Daily snapshots)    │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 2. Process Management & Supervision

The production application is supervised by Docker / systemd with restart policy `unless-stopped`:
* Automatic restart on unhandled exit or system reboot.
* Memory limit: Hard cap at 512 MB (application footprint is ~40–60 MB).
* Process restarts monitored and alerted via telemetry heartbeat.

### Systemd Service Definition Example
```ini
[Unit]
Description=Kai RegAI Production Backend Monolith
After=network.target

[Service]
Type=simple
User=kairegai
WorkingDirectory=/opt/kai-regai
ExecStart=/usr/bin/node /opt/kai-regai/src/backend/index.js
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=15
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=/data/kai_production.db
EnvironmentFile=/etc/kai-regai/.env.production

[Install]
WantedBy=multi-user.target
```

---

## 3. Golden Deployment Flow (`P17-DEPLOY-001`)

```
1. Git Commit & Tag
       ↓
2. GitHub Actions CI (300/300 Regression Tests & Vite Build)
       ↓
3. Staging Deployment & Automated Smoke Tests
       ↓
4. Production Pre-Deployment Database Snapshot (BackupService.createBackup)
       ↓
5. Container Rollout / Process Restart
       ↓
6. Database Schema Migrations Run (MigrationEngine.run)
       ↓
7. Health Probes Verification (/health/live & /health/ready)
       ↓
8. Production Smoke Test Execution
       ↓
9. Traffic Open & Operational Telemetry Monitoring
```
