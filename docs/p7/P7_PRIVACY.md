# P7 — Privacy & Biometric Sensitivity Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P7 — Palm Reading Questionnaire Engine  

---

## 1. Ephemeral, RAM-Only Processing

In strict adherence to Kai RegAI governance:
- **No Persistent PII**: Mode 2 does not collect names, phone numbers, email addresses, or location data.
- **Session-Scoped Memory**: Questionnaire answers are held in memory during the active session.
- **No External Telemetry or Network Calls**: The questionnaire engine runs 100% locally in the client runtime without sending raw observations or biometrics to external servers.
- **Zero-Purge Compliance**: Purging session data instantly clears all recorded responses and resets the questionnaire state machine.

---

## 2. Store Compliance & Biometric Safeguards

- **Google Play & Apple App Store Compliance**: Mode 2 does not require camera or biometric sensor permissions, providing a private alternative for privacy-conscious users.
- **Epistemic Integrity**: Missing lines are never marked as biological or health defects. Reports clearly state that observations reflect subjective visual inspection rather than clinical medical diagnosis.
