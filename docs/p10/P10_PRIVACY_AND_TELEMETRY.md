# P10 Privacy & Telemetry Governance

## 1. Zero Biometric & PII Transmission Policy

Kai RegAI treats palm geometry and readings with strict privacy controls:
1. **No Raw Palm Image Retention**: Camera frames are processed ephemerally in RAM and discarded immediately. No raw palm photography is embedded in reports or telemetry.
2. **No Landmark Coordinates in Telemetry**: Only coarse metrics (`durationMs`, `reportTier`, `readingMethod`) are collected.
3. **No Private Questionnaire Data**: Individual questionnaire selections are excluded from analytics.

---

## 2. Telemetry Invariant Matrix

| Field | Allowed in Telemetry? | Rationale |
| :--- | :--- | :--- |
| `event` | YES | Standard product analytics string (e.g. `report_generated`). |
| `reportTier` | YES | Aggregated tier usage (`QUICK`, `STANDARD`, `PREMIUM`). |
| `readingMethod` | YES | Aggregated method usage (`MODE_1_CAMERA`, `MODE_2_QUESTIONNAIRE`). |
| `durationMs` | YES | Pipeline performance tracking. |
| User Name / Email | **NO** | Strict zero-PII compliance. |
| Palm Image Bytes | **NO** | Strict zero-biometric leakage. |
| Hand Coordinates | **NO** | Raw anatomical data must remain local. |
| Full Reading Prose | **NO** | Narrative remains personal and confidential. |
