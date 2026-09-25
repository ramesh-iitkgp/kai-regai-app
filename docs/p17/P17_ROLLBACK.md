# P17 Rollback Architecture & Runbook

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. Rollback Strategy & Invariants

A production deployment is only considered certified when its rollback path has been tested and verified.

### Core Rollback Invariants
* **Application Rollback vs Database Rollback**: Never blindly roll application code backwards across incompatible database migrations.
* **Database Snapshot Mandatory**: Every production deployment is preceded by an automated atomic snapshot (`BackupService.createBackup`) prior to executing new schema migrations.
* **Zero Downtime Code Rollback**: If a newly deployed container fails health checks (`/health/live` or `/health/ready`), traffic is immediately redirected to the previous container image without dropping active connections.

---

## 2. Rollback Golden Flow (`P17-ROLLBACK-001`)

```
   Version N Active
          │
          ▼
   Deploy Version N+1
          │
          ▼
   Ingress Probes / Smoke Tests Fail
          │
          ▼
   1. Stop Rollout & Isolate N+1 Container
          │
          ▼
   2. Assess Database Migration Status:
      - If no migrations were run: Instant container rollback to Version N.
      - If additive migrations were run (backwards-compatible): Instant container rollback to Version N.
      - If breaking migration was run: Restore pre-deployment database backup taken in Step 0.
          │
          ▼
   3. Relaunch Version N Application
          │
          ▼
   4. Execute Health Verification (/health/ready)
          │
          ▼
   5. Reopen Canary Reading to Verify Service Integrity
```

---

## 3. Forward-Fix vs Restore Policy

1. **Non-Breaking Schema Changes**:
   * Additive columns, new indexes, and new tables are backwards-compatible. The previous application version continues operating safely without rolling back the database.
2. **Destructive or Breaking Changes**:
   * Breaking changes are strictly prohibited in minor/patch releases. If an emergency rollback is required following a breaking schema change, the system executes an atomic restore from the pre-deployment snapshot.
