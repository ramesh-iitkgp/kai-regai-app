# P11 Security Architecture Specification

## 1. Threat Modeling & Defense Matrix

| Threat | Impact | Mitigation in P11 |
| :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | Critical | `RemoteReadingStore` verifies server-side session identity on every operation, preventing User A from accessing User B's readings. |
| **Biometric Image Extraction via Local DB** | Critical | Raw photographs are never persisted. Only derived polyline geometry is retained. |
| **Corrupted / Malformed Storage Manipulation** | High | `ReadingSchemaValidator` validates records on load with SHA-256 integrity verification. |
| **Malicious JSON Archive Import (XSS / Code Exec)** | High | Imported archives are treated strictly as passive JSON data. No scripts, HTML, or functions are executed. |
| **Accidental Overwrites During Sync Retries** | Medium | Idempotent writes keyed by `readingId` and `contentHash`. |
| **Multi-Account Data Leakage on Shared Device** | High | Logging out resets active identity and isolates account reading archives. |
