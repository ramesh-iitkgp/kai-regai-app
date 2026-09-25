# P6 Pre-Implementation Forensic Audit

## Kai RegAI — Hand Scanner Experience Architecture & Gap Analysis

**Date:** 2026-09-25  
**Baseline Git Commit:** `72e1be18047557cef41d1dd7a048dbadd980a861` (P5.2 Complete & Verified)  
**Status:** In Progress — P6 Pre-Implementation Audit  

---

### 1. Existing Scanner & CV Architecture Review

#### 1.1 Existing Navigation & Screen Shell
* **Router (`src/navigation/router.js`)**: Single-page hash-based routing with parameter passing (`router.navigate(route, params)`).
* **Routes (`src/navigation/routes.js`)**:
  * `ROUTES.HOME` (`#home`)
  * `ROUTES.SCANNER` (`#scanner`)
  * `ROUTES.QUICK_REPORT` (`#quick-report`)
  * `ROUTES.DETAILED_REPORT` (`#detailed-report`)
  * `ROUTES.GUIDED_READING` (`#guided-reading`)
  * `ROUTES.QUESTIONNAIRE` (`#questionnaire`)
* **App Orchestrator (`src/app.js`)**:
  * Mounts screen components into `#screen-container`.
  * Hides header and bottom navigation for `ROUTES.SCANNER`.
  * Renders `ScannerScreen(container)` when navigated to `#scanner`.

#### 1.2 Existing Scanner Screen (`src/screens/ScannerScreen.js`)
* Currently acts as a simulated placeholder:
  * Mounts `renderScannerHUD` with static mock imagery.
  * Clicking *"Begin 10s Optical Scan"* starts `ScannerAnimationController` (`src/components/AnalysisAnimationOverlay.js`), which runs a 10-second `setInterval` through `mockScannerStates.js`.
  * On completion, navigates to `ROUTES.QUICK_REPORT` with `{ hand: currentHand }`, completely bypassing `PalmVisionEngine`.
* **Gap Identified**: No real camera feed; no WebRTC `getUserMedia` stream; no frame capture; no live quality evaluation loop; no state machine for camera permissions, alignment, stability, or capture.

#### 1.3 Existing Computer Vision Engine (`src/cv/`)
* **Frozen Baseline**: P5.2 is complete, calibrated, and passes 40/40 tests.
* **Core Public Interface**:
  ```javascript
  const engine = new PalmVisionEngine(customConfig);
  const result = await engine.analyze(palmImage, { handednessHint });
  ```
  Where `palmImage` is `{ width, height, data }` (`Uint8ClampedArray` RGBA).
* **Quality & Gating Modules**:
  * `ImageQualityAnalyzer.analyze(image, config)`: Returns `{ score, passed, reasons, recommendations, ... }`.
  * `PalmUsabilityValidator.validate(image, handDetection, config)`: Returns `{ usable, score, reasons, warnings, recommendedAction, details }`.
  * `RetakeDecisionEngine.evaluate(imageQuality, hand, usability)`: Returns `{ action, needsRetake, primaryMessage, detailedGuidance, diagnosticCode }`.
* **Result Model**:
  `PalmVisionResult`: `{ status, imageQuality, hand, palm, usability, retakeDecision, lines, processing, diagnostics }`.
* **Model Adapters**:
  * `PalmFeatureModelAdapter.toPalmFeatureModel(visionResult, sessionId)` converts result into `PalmFeatureModel`.
  * `PalmFeatureModelAdapter.polylineToSvgPath(polyline, targetWidth, targetHeight)` generates SVG path strings.
  * `CoordinateTransform` provides reversible transforms between source canvas, canonical ROI, and display viewports.

---

### 2. P6 Integration Gaps & Deficiencies

| Component / Layer | Existing State (P5.2) | P6 Requirement | Action Required |
| :--- | :--- | :--- | :--- |
| **Camera Hardware Layer** | None (static URL mockup image) | WebRTC `getUserMedia` with back/front toggle, torch control, aspect ratio fitting | Build `CameraCaptureService` with permission tracking & canvas extraction |
| **Scanner Controller** | None (direct timer in UI) | Dedicated controller orchestrating preview frames, lightweight quality checks, and full inference | Build `PalmScannerController` |
| **State Machine** | None (implicit booleans in `ScannerScreen`) | Formal 16-state finite state machine with deterministic transitions | Build `ScannerStateMachine` |
| **Scanner Intro** | None (immediately enters viewfinder) | Clean introductory modal or step explaining hand placement | Build Scanner Intro step |
| **Real-Time Quality HUD** | Hardcoded static HTML badges (`"Lighting Optimal"`, etc.) | Dynamic HUD reflecting real-time `RetakeDecisionEngine` & `PalmUsabilityValidator` outputs | Refactor `ScannerHUD.js` to bind to real-time state |
| **Temporal Stability** | Only tested in synthetic offline test | Real-time 3-5 frame stability accumulator before capture trigger | Implement stability accumulator in `PalmScannerController` |
| **Capture Choreography** | None | Countdown ($3 \dots 2 \dots 1 \rightarrow \text{Capture}$) with haptic/visual flash confirmation | Implement capture choreography in `ScannerScreen` |
| **Processing Animation** | Generic 10s timer cycling mock steps | Real processing feedback synchronized with actual `PalmVisionEngine.analyze()` runtime | Connect `AnalysisAnimationOverlay` to real inference |
| **Quick Report Screen** | Hardcoded `mockReadings[0]` | Consumes real `PalmVisionResult` & `PalmFeatureModel` with actual detected SVG lines | Update `QuickReportScreen.js` to render live scan results |
| **Developer Diagnostics** | Exists in CV data object, but no UI | Toggleable overlay displaying real-time FPS, quality scores, tilt, latency, and bounds | Create developer diagnostics overlay |

---

### 3. Proposed P6 Architecture

```text
┌────────────────────────────────────────────────────────┐
│                      Scanner UI                        │
│   (ScannerScreen, ScannerHUD, QualityHUD, Overlays)    │
└──────────────────────────┬─────────────────────────────┘
                           │ Dispatches user events
                           │ Subscribes to state updates
                           ▼
┌────────────────────────────────────────────────────────┐
│                 ScannerStateMachine                    │
│   States: INITIALIZING → CAMERA_READY → ALIGNING ...   │
└──────────────────────────┬─────────────────────────────┘
                           │ Controls
                           ▼
┌────────────────────────────────────────────────────────┐
│                PalmScannerController                   │
│   - Orchestrates CameraCaptureService                  │
│   - Runs lightweight frame sampling loop               │
│   - Accumulates temporal stability window              │
│   - Triggers full PalmVisionEngine inference           │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌────────────────────────────┐ ┌─────────────────────────┐
│    CameraCaptureService    │ │    PalmVisionEngine     │
│  - getUserMedia stream     │ │  (Frozen P5.2 Baseline) │
│  - Canvas video frame grab │ │  - Quality Analyzer     │
│  - Permissions state       │ │  - Hand Detector        │
│  - Torch & flip controls   │ │  - Usability Validator  │
└────────────────────────────┘ │  - Crease Pipeline      │
                               │  - Major Line Classifier│
                               └─────────────────────────┘
```

---

### 4. Reusable Project Assets
* **Design Tokens (`src/styles/tokens.css`, `components.css`)**: Luxury dark theme, gold accents (`var(--color-secondary)`), cyan telemetry (`var(--color-tertiary)`), purple/blue line accents.
* **Overlay Component (`src/components/PalmLineOverlay.js`)**: Fully capable of rendering dynamic SVG paths with accessible symbols and dashed stroke patterns.
* **Error Calibration Modal (`src/components/ErrorCalibrationModal.js`)**: Ready for actionable retake flows.
* **Models**: `PalmFeatureModel`, `ReadingSession`.

---

### 5. Non-Negotiable Boundaries for P6
1. **P5.2 CV Pipeline is Frozen**: Under no circumstances will `PalmVisionEngine`, `CreaseEnhancementEngine`, `HandDetector`, or `MajorLineClassifier` algorithms be rewritten or bypassed.
2. **Epistemic Layer Separation**: The camera and CV engine detect creases. The interpretation engine interprets them. Never invoke LLMs or hardcode interpretations directly in camera components.
3. **Privacy Invariant**: Video streams and captured frame buffers remain strictly in RAM; zero automatic uploads, zero persistent image caching, and zero photo serialization into storage without explicit user interaction.
