# Kai RegAI — P7 Pre-Implementation Repository & Architecture Audit

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P7 — Palm Reading Questionnaire Engine  
**Mode:** Mode 2 — Guided Palm Reading Experience  
**Date:** September 2026  
**Status:** AUDIT COMPLETE — BASELINE VERIFIED  

---

## 1. Frozen Baseline Verification

Before designing Phase P7, the state of the repository was audited against all previous frozen milestones:

- **P5 Base Commit**: `1c2e316` (27/27 tests PASS)
- **P5.1 Base Commit**: `a8a9698` (30/30 tests PASS)
- **P5.2 Base Commit**: `72e1be18047557cef41d1dd7a048dbadd980a861` (40/40 tests PASS)
- **P6 Hand Scanner Experience**: `6484483` (59/59 tests PASS, production build PASS)

### Core Non-Negotiable
The entire computer vision engine (`src/cv/`: `PalmVisionEngine`, `HandDetector`, `PalmUsabilityValidator`, `RetakeDecisionEngine`, `MajorLineClassifier`, etc.) and scanner engine (`src/scanner/`: `ScannerStateMachine`, `CameraCaptureService`, `PalmScannerController`) are frozen and will NOT be modified.

---

## 2. Existing Questionnaire & Mode 2 Code Inspection

1. **`src/screens/GuidedReadingScreen.js`**:
   - Currently acts as an entry screen for Mode 2, allowing the user to pick an active hand (`RIGHT` vs `LEFT`) and displaying a placeholder optical alignment box before routing to `ROUTES.QUESTIONNAIRE`.
   - **Gaps**: It does not yet offer a clear entry choice between camera scanning and pure guided questionnaire, nor does it pass structured session configuration into the questionnaire engine.

2. **`src/screens/QuestionnaireScreen.js`**:
   - Currently a 5-step static wizard created in P4 based on `questionnaireModules` from `QuestionnaireWidget.js`.
   - **Gaps**:
     - Hardcoded 5 tactile steps (`thumb_flexibility`, `palm_firmness`, `thumb_phalanx`, `finger_spacing`, `special_markings`).
     - Major palm crease lines (Life, Head, Heart, Fate, Sun) are completely missing.
     - Lacks conditional branching and dependency evaluation.
     - Lacks an authoritative state machine (`INITIALIZING`, `INTRO`, `IN_PROGRESS`, `REVIEW`, `SUBMITTING`, `COMPLETE`, `ERROR`).
     - Does not provide a "Review & Edit" screen before submission.
     - On completion, it runs a fake 2.5-second `setTimeout` and routes to a hardcoded mock report ID (`RDG-2026-0922-002`) instead of generating a canonical `PalmFeatureModel` and executing interpretation.

3. **`src/components/QuestionnaireWidget.js`**:
   - Contains a rudimentary array of 5 tactile modules with hardcoded radio-like options.
   - Does not implement structured schema rules, dependencies, or observation state validation (`OBSERVED`, `NOT_VISIBLE`, `NOT_SURE`, `NOT_APPLICABLE`).

---

## 3. Existing Canonical Feature Model & Interpretation Audit

1. **`src/models/PalmFeatureModel.js`**:
   - Defines the canonical contract for both Mode 1 and Mode 2:
     - `hand` (`side`, `dominance`, `elemental_shape`, `firmness`, `ratios`)
     - `major_lines` (`life_line`, `head_line`, `heart_line`, `fate_line`, `sun_line`)
     - `thumb` (`flexibility_angle`, `flexibility_type`, `first_phalanx_will`, `second_phalanx_logic`)
     - `mounts` (`jupiter`, `saturn`, `apollo_sun`, `mercury`, `venus`, `moon_luna`)
     - `special_markings` (`TRISHULA_TRIDENT`, `SOLOMON_RING`, `FISH_YAV`, etc.)
     - `quality_score`
     - `provenance` (`mode`, `cv_version` / `source`, `knowledge_version`)
   - **Integration Point**: The P7 Questionnaire Engine must map questionnaire answers directly into an instance of `PalmFeatureModel` with `provenance.mode = 'MODE_2_QUESTIONNAIRE'`.

2. **Existing Report & Interpretation Architecture**:
   - `src/screens/QuickReportScreen.js` and `src/screens/DetailedReportScreen.js` render readings.
   - In P6, `QuickReportScreen` was updated to accept dynamic `featureModel` and `visionResult` and pass them to `DetailedReportScreen`.
   - `src/mock/mockReadings.js` contains the epistemic structure for dossier chapters (`constitution`, `vocation`, `guidance`) adhering to the 4 epistemic tones (Physical Observation, Western Classical, Hasta Samudrika, Kai RegAI Synthesis).
   - **Integration Point**: A unified `PalmInterpretationEngine` must exist that consumes `PalmFeatureModel` (regardless of whether it came from Mode 1 CV or Mode 2 Questionnaire) and produces the structured reading dossier without hallucinating predictive certainties or medical timelines.

---

## 4. Epistemic Language Standards & Scope Boundaries

- **Observation $\neq$ Conclusion**: The user is only asked to observe physical features ("How clearly can you see the line curving around the thumb?"), not to diagnose their character ("Are you energetic?").
- **Valid Observation States**:
  - `OBSERVED`: User clearly discerns the physical feature.
  - `NOT_OBSERVED` / `NOT_VISIBLE`: User cannot see the line/crease.
  - `NOT_SURE`: User is uncertain.
  - `NOT_APPLICABLE` / `SKIPPED_BY_LOGIC`: Bypassed because a prerequisite was not met (e.g. detailed fate line morphology is skipped if Fate Line is not visible).
- **Not Visible $\neq$ Absent**: The engine must never assert that a user lacks a life or fate line simply because it was not observed or not visible.

---

## 5. Proposed P7 Architecture

```
                        KAI REGAI APPLICATION
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
           MODE 1 (Scanner)                MODE 2 (Questionnaire)
        [PalmScannerController]         [QuestionnaireController]
                 │                                 │
                 ▼                                 ▼
        [PalmVisionResult]             [QuestionnaireResponse]
                 │                                 │
                 ▼                                 ▼
      PalmFeatureModelAdapter             QuestionnaireFeatureAdapter
                 │                                 │
                 └────────────────┬────────────────┘
                                  ▼
                     Canonical PalmFeatureModel
                                  │
                                  ▼
                      PalmInterpretationEngine
                                  │
                                  ▼
                          PalmReadingDossier
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
         QuickReportScreen               DetailedReportScreen
```

### New P7 Modules to Create:
1. `src/questionnaire/QuestionnaireSchema.js`: Declarative schema containing all question groups (Hand Morphology, Life Line, Head Line, Heart Line, Fate Line, Sun Line, Thumb, Sacred Markings) with conditional `showWhen` logic.
2. `src/questionnaire/QuestionnaireStateMachine.js`: Authoritative finite state machine (`INITIALIZING`, `INTRO`, `IN_PROGRESS`, `REVIEW`, `SUBMITTING`, `COMPLETE`, `ERROR`).
3. `src/questionnaire/QuestionnaireEngine.js`: Headless questionnaire runner handling answer recording, backward/forward navigation, dynamic question filtering, stale answer invalidation, progress calculation, and validation.
4. `src/questionnaire/QuestionnaireFeatureAdapter.js`: Maps raw questionnaire answers into canonical `PalmFeatureModel` with `source: 'QUESTIONNAIRE'`.
5. `src/services/PalmInterpretationEngine.js`: Single unified interpretation layer evaluating `PalmFeatureModel` into structured reading dossiers following the 4 epistemic tiers.
6. `src/components/QuestionnaireHUD.js` & `src/screens/QuestionnaireScreen.js`: Interactive, accessible UI widgets for single-select, multi-select, scale, tactile picker, and review screen.

---

## 6. Audit Verdict

All prerequisites are met. The CV engine and Hand Scanner are safely decoupled and protected by existing regression suites. P7 will build the complete Mode 2 Questionnaire Engine and unified interpretation engine without touching or modifying frozen P5/P6 code.
