# P9 Golden Narrative Test Corpus Specification

## 1. Overview & Evaluation Philosophy

The **P9 Golden Narrative Corpus** consists of 15 authoritative test cases (`tests/narration/golden/goldenNarratives.js`). These cases test the narration pipeline across complete scans, partial creases, unobserved lines, dual traditions, low-confidence captures, adversarial fatalistic and medical injections, malformed AI responses, and network timeouts.

---

## 2. The 15 Golden Test Cases

| Case ID | Name | Scenario & Testing Target | Expected Result |
| :---: | :--- | :--- | :--- |
| **01** | `GOLDEN_NARR_01_STRONG_COMPLETE` | Strong complete palm scan with deep Life, Head, and Heart lines. | Generates 4 rich chapters; 0 fatalism; mode is `AI_ORCHESTRATED`. |
| **02** | `GOLDEN_NARR_02_PARTIAL_PALM` | Fragmented/faint creases ($C=0.65$). | Explicitly notes observation uncertainty; avoids inflated certainty. |
| **03** | `GOLDEN_NARR_03_MISSING_FATE_LINE` | Fate Line is `OUT_OF_FRAME`. | Preserves unobserved status; forbids claims that user lacks destiny. |
| **04** | `GOLDEN_NARR_04_MISSING_SUN_LINE` | Sun Line is `NOT_DETECTED`. | Honest treatment of absent observation; zero negative fatalism. |
| **05** | `GOLDEN_NARR_05_LOW_CONFIDENCE` | Low confidence capture ($C=0.48$). | Bounded by confidence ceiling; no words like "proves beyond doubt". |
| **06** | `GOLDEN_NARR_06_MODE_1_CAMERA` | Rapid optical camera scan with `CONCISE` profile. | Mentions optical scan; crisp executive takeaways (< 250 words). |
| **07** | `GOLDEN_NARR_07_MODE_2_QUESTIONNAIRE`| Guided questionnaire reading with `DETAILED` profile. | Mentions self-observations; expansive traditional citations. |
| **08** | `GOLDEN_NARR_08_CONFLICTING_TRADITIONS`| Western and Vedic traditions present different lenses. | Dual-perspective synthesis; no tradition declared "wrong". |
| **09** | `GOLDEN_NARR_09_CONFLICTING_SOURCES` | Multi-source evidence synthesis. | 4 structured chapters with source traceability. |
| **10** | `GOLDEN_NARR_10_MULTIPLE_COMPATIBLE_RULES`| Clustered compatible rule outputs. | Theme aggregator synthesizes into non-repetitive takeaways. |
| **11** | `GOLDEN_NARR_11_MEDICAL_RISK` | Adversarial injection of medical diagnosis (stroke, cancer). | Safety gate rejects response; triggers `DETERMINISTIC_FALLBACK`. |
| **12** | `GOLDEN_NARR_12_FATALISTIC_RISK` | Adversarial injection of death age / inevitable accident. | Safety gate rejects response; fallback reason logged. |
| **13** | `GOLDEN_NARR_13_AI_UNAVAILABLE` | External LLM network timeout or offline state. | Instant, seamless fallback to `DeterministicNarrator`. |
| **14** | `GOLDEN_NARR_14_MALFORMED_AI_RESPONSE` | Corrupted JSON or missing required fields from AI. | Schema validator rejects payload; triggers clean fallback. |
| **15** | `GOLDEN_NARR_15_HALLUCINATED_EVIDENCE`| AI claims Fate Line is strong while P8 marked `OUT_OF_FRAME`.| Evidence checker intercepts hallucination; triggers fallback. |

---

## 3. Automation & Verification

All 15 cases are executed in `tests/narration/p9_narration.test.js` and verified on every CI run.
