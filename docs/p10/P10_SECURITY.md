# P10 Security Architecture Specification

## 1. Threat Model & Mitigations

| Threat | Impact | Mitigation in P10 |
| :--- | :--- | :--- |
| **Credential Leakage in Client Export** | High | PDF and social exports consume only `ReportModel` fields. Zero environment variables, API keys, or database URLs are exposed. |
| **Biometric Image Extraction via PDF** | High | PDF exports embed derived vector SVG line geometry only. Raw camera image buffers are never embedded. |
| **Cross-Site Scripting (XSS) via Reports** | High | Dynamic narrative strings undergo text node escaping or validated HTML interpolation. |
| **Fatalistic Claim Drift** | High | `ReportSchemaValidator` runs pre-render checks against medical and fatalistic regex dictionaries. |
| **Guessable Report URLs** | Medium | When stored/exported, report IDs use cryptographic random tokens (`RPT-<timestamp>-<hash>`). |
