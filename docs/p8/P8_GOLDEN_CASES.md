# P8 Golden Interpretation Test Corpus Specification

## 1. Overview & Golden Invariants

To guarantee that Kai RegAI never regresses, produces non-deterministic output, or invents missing observations, a 12-case **Golden Corpus** has been established in:
[`tests/interpretation/golden/goldenCases.js`](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/tests/interpretation/golden/goldenCases.js).

Every case asserts:
1. Input `PalmFeatureModel` produces the exact expected matched rules.
2. Confidence score and band are completely deterministic.
3. Epistemic safety holds (0 fatalistic or medical terms).
4. Unobserved features are handled with graceful uncertainty rather than fabrication.

---

## 2. The 12 Golden Test Cases

| Case ID | Name | Core Test Scenario | Expected Outcome |
| :---: | :--- | :--- | :--- |
| **01** | `GOLDEN_01_STRONG_LIFE_LINE` | Clear, deeply etched, wide-sweeping Life Line with high quality capture score (0.95). | Matches `WEST_LIFE_CURVED_WIDE_001` & `HS_AYUR_DEEP_CURVED_001`. Confidence band: `HIGH`. |
| **02** | `GOLDEN_02_PARTIAL_LIFE_LINE` | Faint, segmented Life Line ($C=0.55$). | Matches `WEST_LIFE_FAINT_SEGMENTED_001`. Handled with observation uncertainty; no fatalistic claims. |
| **03** | `GOLDEN_03_INVISIBLE_LIFE_LINE` | Life Line flagged as `NOT_DETECTED`. | Zero Life Line rules fire. Dossier explicitly states line was not discerned. Observation preserved. |
| **04** | `GOLDEN_04_CLEAR_HEAD_LINE` | Straight, long, continuous Head line. | Matches `WEST_HEAD_STRAIGHT_001` & `HS_MATRU_STRAIGHT_001`. Emphasizes analytical clarity. |
| **05** | `GOLDEN_05_CLEAR_HEART_LINE` | Curved Heart line terminating on Mount of Jupiter. | Matches `WEST_HEART_CURVE_JUPITER_001` & `HS_PITRI_CURVE_GURU_001`. Highlights empathetic idealism. |
| **06** | `GOLDEN_06_CLEAR_FATE_LINE` | Continuous Fate line originating from palm base. | Matches `WEST_FATE_STRONG_BASE_001` & `HS_KARMA_DEEP_CENTRAL_001`. Identifies focused vocational drive. |
| **07** | `GOLDEN_07_CLEAR_SUN_LINE` | Well-defined Sun Line on Apollo Mount. | Matches `WEST_SUN_CLEAR_APOLLO_001` & `HS_SURYA_CLEAR_001`. Identifies creative expression & visibility. |
| **08** | `GOLDEN_08_MULTIPLE_UNCERTAIN` | All major lines detected with low confidence ($C=0.48$). | Confidence engine assigns `LOW` band; syntheses express appropriate nuance and restraint. |
| **09** | `GOLDEN_09_QUESTIONNAIRE_DERIVED` | Mode 2 features (flexible thumb, Trishula, Fire palm). | Matches `HS_MARK_TRISHULA_001`, `SYN_CONST_FIRE_001`, and `WEST_THUMB_SUPPLE_001`. |
| **10** | `GOLDEN_10_VISION_DERIVED` | Pure Mode 1 camera scan features with high quality score. | Clean contour matching, high quality aggregate score, full provenance tracking. |
| **11** | `GOLDEN_11_CONFLICTING_SOURCES` | Straight Head line (analytical) + strongly curved Heart line (idealistic). | Resolves via dual-lens synthesis: cognitive pragmatism balanced with emotional depth. |
| **12** | `GOLDEN_12_MISSING_EVIDENCE` | Fate and Sun lines `OUT_OF_FRAME`. | No Fate/Sun rules match; dossier treats absence as unrecorded potential, not negative fate. |

---

## 3. Execution Verification

All 12 cases are tested in:
[`tests/interpretation/p8_rule_engine.test.js`](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/tests/interpretation/p8_rule_engine.test.js)
and pass with 100% determinism across repeat runs.
