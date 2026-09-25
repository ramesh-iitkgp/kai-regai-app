# P11 Pre-Implementation Audit: Secure User, Session & Reading History Architecture

## 1. Executive Summary

Phase P11 introduces the **Secure User, Session & Reading History Architecture** for Kai RegAI without altering the frozen P5–P10 pipeline.
Its core architectural principle is:
> **STORE THE READING, NOT THE PERSON.**
> **P8 DECIDES. P9 EXPLAINS. P10 PRESENTS. P11 PRESERVES.**
> P11 sits strictly downstream of P10. It captures completed, versioned reading snapshots, manages anonymous guest sessions and optional accounts, provides offline-first persistent reading archives, and supports idempotent cloud synchronization while maintaining 100% ephemeral treatment of raw biometric imagery.

This audit evaluates the repository baseline at commit `b1ff3950772844e54a9fc4c228a8478ee9c270ee` across the 16 mandatory architectural dimensions.

---

## 2. Current Application Lifecycle
* **Bootstrap**: `src/main.js` instantiates the global `App` and invokes `app.init()`.
* **View Hierarchy**: Shell containing `#app-header`, `#app-screen-container`, `#app-bottom-nav`, and `#app-modal-container`.
* **Screen Transition**: Handled by `src/navigation/router.js` with declarative routing (`ROUTES`).
* **Current State**: Reading flows (Scanner in P6, Questionnaire in P7) construct an in-memory `ReadingSession`, execute P8 interpretation and P9 narration, and display P10 reports (`QuickReportScreen` and `DetailedReportScreen`).
* **Lifecycle Gap**: When a reading completes, navigating away or refreshing the page loses the reading session. No persistent store exists to preserve readings across reloads.

---

## 3. Current Session Model
* **`ReadingSession` (`src/models/ReadingSession.js`)**:
  * Tracks `session_id`, `user_id` (currently static `'USR-CURRENT'`), `mode`, `hand_side`, `status`, `quality_score`, `palm_feature_model`, `questionnaire_answers`, `report`, and `error_code`.
  * Lifecycle enum `SessionStatus`: `INITIALIZING`, `VIEWFINDER_ACTIVE`, `SCANNING_PROGRESSIVE`, `QUESTIONNAIRE_ACTIVE`, `SYNTHESIZING_REPORT`, `COMPLETED`, `ERROR_RECOVERY`.
  * Currently lives solely in transient JavaScript heap memory.

---

## 4. Current Memory-Only Data
* **Camera Video Buffers**: Ephemeral HTML `<video>` and `<canvas>` frames in `CameraCaptureService.js` are processed in RAM and discarded immediately.
* **Biometric Polylines & Landmarks**: Raw coordinates exist in `PalmFeatureModel` in RAM.
* **Interpretation & Narration**: `InterpretationDossier` and `NarratedReading` are generated in RAM.
* **Reports**: `ReportModel` is rendered in RAM.
* **Privacy Baseline**: Zero biometric image bytes or temporary CV graphs are saved to disk, conforming strictly to P5–P10 privacy mandates.

---

## 5. Current Report Model
* **`ReportModel` (`src/report/ReportSchema.js`)**:
  * Canonical versioned data contract (`schemaVersion: "1.0.0"`).
  * Fields: `reportId`, `generatedAt`, `readingMethod`, `reportTier`, `subject`, `summary`, `sections`, `palmVisualization`, `majorLines`, `features`, `evidence`, `confidence`, `sources`, `uncertaintyNotes`, `metadata`, `export`.
  * Fully decoupled from rendering technologies (Web, Print, PDF, Social Cards).

---

## 6. Current P8/P9/P10 Version Metadata
* Stored in `ReportModel.metadata`:
  * `codexVersion`: `'1.0.0'` (P8 Knowledge Codex)
  * `narrationVersion`: `'1.0.0'` (P9 AI / RAG Narration)
  * `promptVersion`: `'1.0.0'`
  * `generationMode`: `'AI_ORCHESTRATED'` or `'DETERMINISTIC_FALLBACK'`
  * `reportSchemaVersion`: `'1.0.0'` (P10 Report Schema)
* **P11 Significance**: This metadata enables historical readings to be permanently pinned to the exact algorithmic versions that produced them.

---

## 7. Existing Browser Storage
* `ProfileScreen.js` includes a button (`erase-data-btn`) that calls `window.localStorage.clear()`.
* No actual data is written to `localStorage` or `IndexedDB`.
* The reading history displayed in `ReadingsArchiveScreen.js` and `HomeScreen.js` is currently sourced from static in-memory fixture `src/mock/mockReadings.js`.

---

## 8. Existing Backend
* None. Kai RegAI is currently an entirely client-side web application bundled with Vite.

---

## 9. Existing Authentication
* None. User profile data is represented by an in-memory mock object in `ProfileScreen.js`. No authentication tokens, session cookies, or guest identification subsystems are implemented.

---

## 10. Existing API Layer
* No HTTP client or backend sync endpoints exist. Client-side services communicate via direct ES module imports and deterministic pipeline calls.

---

## 11. Existing Privacy Controls
* Biometric data is strictly ephemeral (RAM-only).
* Zero raw palm images, camera frames, or private questionnaire answers are embedded in reports, exported PDFs, social cards, or analytics.
* P10 pre-render safety gate (`ReportSchemaValidator`) blocks fatalistic and medical claim drift.

---

## 12. Existing Telemetry
* `src/report/ReportTelemetry.js` (P10) tracks coarse product milestones (`report_generated`, `report_viewed`, `section_opened`, `pdf_exported`, `share_card_generated`, `report_shared`).
* Non-blocking design: Telemetry dispatch failure never interrupts UI rendering or report generation.
* Sanitizer guarantees zero biometric polylines, images, or PII leak into telemetry events.

---

## 13. Existing Environment Variables
* None required for core reading functionality. The build bundle is free of client credentials.

---

## 14. Existing Deployment Architecture
* Static web application built with Vite into `dist/` (HTML, Vanilla CSS, JS modules, ~326 kB JS bundle). Runs offline or via static web hosting (CDN / GitHub Pages / Cloudflare Pages / Vercel).

---

## 15. Proposed Persistence Architecture (P11)

```text
                                P11 ARCHITECTURE
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   LOCAL ARCHIVE                IDENTITY & AUTH                 SYNC & BACKEND
         │                             │                             │
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ StorageProvider │           │  AuthProvider   │           │   SyncEngine    │
│  ├── IndexedDB  │           │  ├── GuestID    │           │  ├── SyncQueue  │
│  └── Memory     │           │  └── MockAuth   │           │  └── Idempotent │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │                             │                             │
         ▼                             ▼                             ▼
   ReadingRecord                  UserProfile                   RemoteReading
 (Immutable Snapshot)            (Preferences)                  (Encrypted Sync)
```

1. **Storage Abstraction**:
   * `StorageProvider` base interface with `IndexedDBStorageProvider` (for browsers) and `MemoryStorageProvider` (for tests / private browsing).
   * `StorageSerializer` provides deterministic canonical serialization with SHA-256 content hashing for integrity verification and deduplication.
2. **Canonical Reading Archive (`ReadingRecord`)**:
   * Versioned schema (`schemaVersion: "1.0.0"`).
   * Holds immutable historical snapshots:
     * `p8Snapshot`: InterpretationDossier (evidence & rules matched)
     * `p9Snapshot`: NarratedReading (personalized narrative prose)
     * `p10ReportSnapshot`: Canonical ReportModel
     * `featureSnapshot`: Derived lines and metrics (NO raw images)
   * Version signatures (`p8CodexVersion`, `p9NarrationVersion`, `p10ReportSchemaVersion`).
   * Integrity signature (`contentHash`).
3. **Identity & Guest Mode**:
   * `GuestIdentityProvider`: Generates cryptographically secure, random, non-semantic guest IDs (`GST-<uuid>`).
   * Guest readings are stored locally in IndexedDB without requiring signup.
   * `UserProfile`: Minimal user profile (preferences, hand dominance, reading stats).
   * Account Upgrade: Seamless, non-destructive migration of guest readings to authenticated accounts.
4. **Offline-First Synchronization**:
   * `SyncQueue` with explicit lifecycle states (`PENDING`, `UPLOADING`, `SYNCED`, `FAILED`, `RETRY`, `DELETED`).
   * Idempotent operations using deterministic `readingId` and `contentHash`.
   * Synchronization is 100% opt-in; never mandatory.

---

## 16. Security & Migration Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Biometric Image Leakage** | Critical | Raw palm photographs and camera frames are explicitly excluded from `ReadingRecord`. Only derived vector features and interpretations are stored. |
| **Insecure Direct Object Reference (IDOR)** | High | Every reading record enforces strict ownership (`ownerId`, `ownerType`). Queries verify session identity before returning records. |
| **Malformed / Corrupted Storage** | Medium | `ReadingSchemaValidator` validates all records on load. Corrupted records trigger graceful recovery rather than crashing the application. |
| **Claim Drift on Reload** | High | Historical readings are immutable snapshots. Opening a historical reading displays the stored report rather than re-evaluating rules or calling an LLM. |
| **Storage Quota Exceeded / Private Browsing** | Medium | Graceful fallback to `MemoryStorageProvider` with clear user notification that history cannot be persisted. |
| **Schema Evolution / Migration** | Medium | `ReadingMigrationEngine` supports deterministic, tested, forward/backward schema upgrades. |

---

## 17. Audit Conclusion

The repository is clean and ready for Phase P11. Existing P5–P10 modules remain completely untouched and locked. P11 will implement the storage and identity layer to connect completed readings to local persistence, guest profiles, and reading history.
