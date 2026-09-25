# P17 Operations Runbook

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. One-Command Operational Procedures

All operational commands run via standardized system scripts or npm scripts:

| Operation | Command | Expected Output / Behavior |
| :--- | :--- | :--- |
| **Start Service** | `systemctl start kai-regai` | Starts Node.js 24 process, mounts SQLite DB, runs pending migrations. |
| **Stop Service** | `systemctl stop kai-regai` | Sends `SIGTERM`, drains active HTTP requests, flushes WAL checkpoint, exits 0. |
| **Restart Service** | `systemctl restart kai-regai` | Graceful restart with less than 250ms downtime. |
| **Check Status** | `systemctl status kai-regai` | Active (running), shows PID, memory consumption, uptime. |
| **View Live Logs** | `journalctl -u kai-regai -f -o json` | Real-time JSON structured logs. |
| **Trigger Backup** | `npm run db:backup` | Generates point-in-time `.db` snapshot and `.manifest.json`. |
| **Check Health** | `curl -f http://127.0.0.1:3000/health` | Returns HTTP 200 with `{ "status": "HEALTHY", "components": { ... } }`. |
| **Run Migrations** | `npm run db:migrate` | Runs idempotent pending schema migrations. |

---

## 2. Log Management & Privacy Masking

Production logs are structured JSON formatted to standard output:
```json
{
  "timestamp": "2026-09-25T22:30:00.123Z",
  "level": "INFO",
  "requestId": "REQ-7b819f20-91a2-4a0b-93f5-7f1c1a938219",
  "method": "POST",
  "path": "/api/v1/readings",
  "statusCode": 201,
  "durationMs": 4.2,
  "clientIp": "198.51.100.42"
}
```

### Strict Redaction Invariants
* **Zero Biometrics**: Coordinates, landmark arrays, and line trace coordinates are NEVER logged.
* **Zero Session Tokens**: Bearer tokens are stripped before logging; only hashed session IDs are recorded.
* **Zero Financial Data**: Card numbers, CVV/CVC, expiration dates, and payment tokens are completely scrubbed.
* **Zero Stack Traces**: Production 500 errors print generic error codes; internal stack traces are isolated to secure error monitors.

---

## 3. Incident Response Playbooks

### A. Database Unresponsive / Locked (`SQLITE_BUSY`)
1. **Detect**: Monitor alerts elevated 500 errors with code `INTERNAL_SERVER_ERROR`.
2. **Contain**: Verify if a long-running transaction or backup process is stalled.
3. **Remediate**: Execute WAL checkpoint:
   ```bash
   sqlite3 /data/kai_production.db "PRAGMA wal_checkpoint(TRUNCATE);"
   ```
4. **Verify**: Query `/health` endpoint to ensure `components.database: "UP"`.

### B. Storage Volume Above 85% Capacity
1. **Detect**: Disk capacity alert fires at 80% and 85% thresholds.
2. **Analyze**: Check `/data/backups/` and system journal logs:
   ```bash
   du -sh /data/*
   ```
3. **Purge Old Backups**: Backups older than 14 days are automatically pruned:
   ```bash
   find /data/backups/ -name "kai_backup_*.db" -mtime +14 -delete
   find /data/backups/ -name "kai_backup_*.manifest.json" -mtime +14 -delete
   ```
