# P16 User Flows & State Transitions

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P16 — Production UX, Reading Experience & Conversion  

---

## 1. Primary User Journey Flows

### Flow A: Instant Camera Scan (Mode 1)
1. **User lands on Home Screen** (`HomeScreen`).
2. Taps **"Hand Scanner"** (`START_READING`, `mode: "scanner"`).
3. Viewfinder activates (`SCANNER_OPEN`). Palm contour aligns with user hand.
4. Optical quality check passes (illumination > 0.35, blur < 0.20, hand detected) (`HAND_DETECTED`).
5. User taps capture (`CAPTURE_SUCCESS`).
6. 10-second multi-phase scan animation runs with progressive crease line reveal.
7. User arrives at Quick Report (`QUICK_REPORT_VIEW`).
8. User inspects top traits and can tap "Unlock Detailed Dossier" (`PAYWALL_VIEW`).

### Flow B: Deep Guided Reading (Mode 2)
1. **User lands on Home Screen** (`HomeScreen`).
2. Taps **"Guided Palm Reading"** (`START_READING`, `mode: "palm_reading"`).
3. Questionnaire initializes step 1/5 (`QUESTIONNAIRE_STARTED`).
4. User selects hand shape, thumb flexibility, finger spacing, mount textures, and marks.
5. Questionnaire completes step 5/5 (`QUESTIONNAIRE_COMPLETED`).
6. Canonical `PalmFeatureModel` compiled and fed to Rule Engine & Report Engine.
7. User arrives at Detailed Report (`DETAILED_REPORT_VIEW`).
8. Reading automatically stored to local encrypted archive (`READING_SAVED`).

### Flow C: Historical Reopen & Export Flow
1. User navigates to **Archive / Saved Readings**.
2. Selects a previous reading session card.
3. Reading reopens instantaneously from the cached report snapshot—without invoking AI narration or re-running the CV pipeline.
4. User exports report as high-fidelity print document (`PDF_EXPORT`) or privacy-safe social card (`SOCIAL_CARD`).

---

## 2. Error Recovery & Retake Flows

| Failure State | Trigger Condition | User Experience / Remediation |
| :--- | :--- | :--- |
| **Low Illumination** | Mean brightness < 40 / 255 | Real-time warning badge: *"Low Light — Move into brighter ambient lighting"* with viewfinder torch toggle. |
| **Motion Blur** | Laplacian variance < 12.0 | Dynamic warning banner: *"Camera Blur Detected — Hold steady"* with retake button. |
| **Hand Out of Frame** | Hand bounding box < 35% of frame | Viewfinder overlay pulses with alignment arrow guides. |
| **Payment Abandonment** | User closes paywall modal | Dismisses gracefully to previous report view without nagging popups or false urgency counters. |
