# Kai RegAI — Data Flow & Entity Contracts

## 1. End-to-End Data Pipeline Architecture

Kai RegAI guarantees that Computer Vision never translates directly to text, and Large Language Models never touch raw pixel matrices. The entire pipeline operates through strongly typed intermediate data contracts:

```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    END-TO-END DATA PIPELINE                                        |
|                                                                                                   |
|  [Raw Camera Frame (RAM)]                                                                         |
|         │                                                                                         |
|         ▼  (Image Quality Gate: Blur, Lighting, Pose Validation)                                 |
|  [CV Landmark Localization & Crease Spline Segmentation]                                          |
|         │                                                                                         |
|         ▼  (Geometry & Topology Normalization)                                                    |
|  [Canonical PalmFeatureModel (JSON)]                                                              |
|         │                                                                                         |
|         ├────────────────────────────────────────┬────────────────────────────────────────┐       |
|         │ (Mode 1: Hand Scanner)                 │ (Mode 2: Palm Reading)                 │       |
|         │ (User observations remain empty)       ▼ (Questionnaire answers merged)         │       |
|         │                                [Enriched PalmFeatureModel]                      │       |
|         │                                        │                                        │       |
|         └────────────────────────────────────────┴────────────────────────────────────────┘       |
|                                                  │                                                |
|                                                  ▼                                                |
|  [Deterministic Rule Engine] ◄── [Governed Palmistry Knowledge Base]                             |
|  (Evaluates conditionals, scores confidence, mediates tradition conflicts)                        |
|                                                  │                                                |
|                                                  ▼                                                |
|  [Structured InterpretationContext JSON] (Vetted traits, citations, tone guidance)               |
|                                                  │                                                |
|                                                  ▼                                                |
|  [RAG Context Assembly & Guardrail Injection]                                                     |
|                                                  │                                                |
|                                                  ▼                                                |
|  [AI Narration Layer (LLM)] (Empathetic storytelling; strictly adheres to input context)         |
|                                                  │                                                |
|                                                  ▼                                                |
|  [Canonical PalmReport Model (JSON)] ──> [Mobile Report Engine & UI Presentation]                 |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Canonical Contract: `PalmFeatureModel`

Both Mode 1 and Mode 2 generate instances of this exact data structure. Mode 1 populates the automated CV fields; Mode 2 supplements the user observation fields:

```json
{
  "$schema": "https://kaireg.ai/schemas/palm-feature-model.v1.json",
  "feature_model_version": "1.0.0",
  "capture_metadata": {
    "timestamp": 1774395600,
    "source_mode": "MODE_1_SCANNER",
    "hand_side": "RIGHT",
    "hand_dominance": "DOMINANT"
  },
  "geometry": {
    "palm_aspect_ratio": 1.05,
    "finger_to_palm_ratio": 0.81,
    "digit_ratio_2d_4d": 0.98,
    "elemental_shape": "EARTH"
  },
  "major_creases": {
    "life_line": {
      "detected": true,
      "curvature_profile": "WIDE_ARC",
      "continuity": "CONTINUOUS",
      "origin_anchor": "MCP_5_THUMB_INTERSPACE",
      "termination_anchor": "BASE_OF_VENUS",
      "depth_class": "DEEP_CLEAR",
      "branches": ["ASCENDING_TO_JUPITER"],
      "confidence": 0.95
    },
    "head_line": {
      "detected": true,
      "curvature_profile": "GENTLE_SLOPE",
      "continuity": "CONTINUOUS",
      "origin_relation_to_life": "SLIGHT_CONTACT",
      "termination_anchor": "UPPER_LUNA",
      "depth_class": "MODERATE",
      "confidence": 0.92
    },
    "heart_line": {
      "detected": true,
      "curvature_profile": "CURVED_UPWARD",
      "continuity": "CONTINUOUS",
      "termination_anchor": "INTERDIGITAL_JUPITER_SATURN",
      "depth_class": "MODERATE",
      "confidence": 0.94
    },
    "fate_line": {
      "detected": true,
      "curvature_profile": "VERTICAL_MEDIAN",
      "continuity": "INTERMITTENT",
      "origin_anchor": "LOWER_PALM_CENTER",
      "termination_anchor": "BASE_OF_SATURN",
      "confidence": 0.78
    },
    "sun_line": {
      "detected": false,
      "confidence": 0.40
    }
  },
  "mounts": {
    "jupiter": { "prominence": "WELL_DEVELOPED", "apex_offset": "CENTERED" },
    "saturn": { "prominence": "NORMAL", "apex_offset": "CENTERED" },
    "sun": { "prominence": "NORMAL", "apex_offset": "CENTERED" },
    "mercury": { "prominence": "WELL_DEVELOPED", "apex_offset": "LATERAL" },
    "venus": { "prominence": "FULL", "firmness": null },
    "moon": { "prominence": "MODERATE", "firmness": null }
  },
  "user_observations": {
    "pad_firmness": "ELASTIC_SPRINGY",
    "thumb_flexibility_distal": "SUPPLE_FLEXIBLE",
    "thumb_phalanx_ratio": "EQUAL_BALANCE",
    "finger_length_comparison": "INDEX_FINGER_LONGER",
    "confirmed_markings": ["MYSTIC_CROSS"]
  }
}
```

---

## 3. Canonical Contract: `ReadingSession`

The master container managing the lifecycle, audit trail, and persistence of a reading:

```json
{
  "$schema": "https://kaireg.ai/schemas/reading-session.v1.json",
  "session_id": "SES-2026-09-4412",
  "user_id": "USR-ANON-8891",
  "reading_mode": "MODE_2_PALM_READING",
  "hand_side": "RIGHT",
  "hand_dominance": "DOMINANT",
  "created_at": 1774395600,
  "completed_at": 1774395780,
  "status": "COMPLETED",
  "quality_gate_result": {
    "passed": true,
    "composite_quality_score": 0.91,
    "checks": {
      "blur_variance": 412.5,
      "illumination_balance": 0.88,
      "pose_tilt_degrees": 4.2
    }
  },
  "palm_feature_model": { "$ref": "#/definitions/PalmFeatureModel" },
  "active_traditions": ["CLASSICAL_INDIAN", "WESTERN_HISTORICAL"],
  "engine_versions": {
    "cv_pipeline_version": "1.0.0-cv",
    "knowledge_base_version": "1.1.0-kb",
    "rule_engine_version": "1.0.0-re",
    "ai_narration_version": "1.0.0-rag"
  },
  "report_artifact": {
    "report_id": "REP-2026-09-8812",
    "report_type": "DETAILED_PALM_DOSSIER",
    "headline_archetype": "The Strategic Visionary & Compassionate Anchor",
    "chapter_count": 5
  }
}
```

---

## 4. Mode Compatibility Proof

* **Mode 1 compatibility**: In Mode 1, `user_observations` fields are set to `null`. The Rule Engine gracefully matches rules whose preconditions only require `major_creases` and `geometry`, emitting a valid Quick Report without error.
* **Mode 2 upgrade**: When a user upgrades from a Quick Scan to a Guided Palm Reading, the existing `PalmFeatureModel` is retained; only the `user_observations` block is hydrated by the questionnaire, eliminating redundant camera rescanning.
