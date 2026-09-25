# P17 Monitoring, Metrics & Observability

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P17 — Production Deployment & Infrastructure Certification  

---

## 1. Observability Architecture

Kai RegAI monitors production health across four key pillars:

1. **Service Health Probes**:
   * `/health`: Overall system status, database connectivity, applied migrations count, uptime, and memory statistics.
   * `/health/live`: Process liveness check for container supervision.
   * `/health/ready`: Database connectivity check for traffic ingress routing.
2. **Structured Log Telemetry**:
   * Safe JSON logs with correlation IDs (`x-request-id`).
   * Redacted biometrics, redacted credentials, and sanitized error messages.
3. **Resource Telemetry**:
   * Process RSS memory, heap allocation, CPU usage, and storage capacity.
4. **Commercial Funnel Observability**:
   * Guest creations, session logins, reading saves, transaction verifications, entitlement issuances, and webhook events.

---

## 2. Alert Severities & Thresholds

| Severity | Alert Condition | Threshold | Notification Channel | Remediation Time |
| :--- | :--- | :--- | :--- | :---: |
| **P0 (Critical)** | Service Down / Health Probe Failing | `/health` returns non-200 for 2 consecutive checks | PagerDuty / On-Call Phone | < 5 minutes |
| **P0 (Critical)** | Database Unresponsive | Database connection errors or locks exceeding 5s | PagerDuty / On-Call Phone | < 5 minutes |
| **P1 (High)** | Elevated 5xx Errors | 5xx error rate > 1.0% over 5 minutes | Slack Alert / Email | < 15 minutes |
| **P1 (High)** | Disk Capacity Warning | Disk utilization > 85% | Slack Alert / Email | < 30 minutes |
| **P2 (Medium)** | Webhook Signature Failure | Multiple webhook signature failures from payment provider | Slack Alert | < 2 hours |
| **P3 (Low)** | Rate Limit Spikes | Sustained 429 responses from a specific IP | Operational Dashboard | Next Business Day |

---

## 3. False Alert Prevention

* Health probes utilize a 3-strike debounce before declaring an outage.
* Rate limit spikes on single client IPs do not trigger P0/P1 on-call pages.
* Scheduled database backups run with atomic `VACUUM INTO`, preventing spurious database lock warnings.
