# P8 Evidence Model & Provenance Specification

## 1. Overview & Principle

The Kai RegAI Interpretation Engine adheres to the strict core principle:
> **Never invent an observation. Every interpretation claim must possess an unbroken chain of physical evidence.**

The **Evidence Model** bridges the gap between raw normalized palm features (`PalmFeatureModel`) and generated interpretation chapters. When a user asks *"Why did Kai RegAI say this?"*, the evidence collector provides an exact structured breakdown of what features triggered the interpretation, where they came from (Mode 1 camera CV vs Mode 2 questionnaire), and the confidence of that observation.

---

## 2. Canonical Evidence Record Schema

When an interpretation rule evaluates to true in `RuleEngine`, the `EvidenceCollector` extracts all features referenced in the rule's `conditions` and builds an `EvidenceRecord`:

```typescript
interface EvidenceRecord {
  featurePath: string;         // e.g. "lines.heart_line.shape"
  value: any;                  // e.g. "CURVED"
  source: string;              // "MODE_1_CAMERA" | "MODE_2_QUESTIONNAIRE" | "HYBRID" | "DEFAULT"
  confidence: number;          // 0.0 to 1.0 (from CV or question certainty)
  timestamp: string;           // ISO timestamp of capture
  epistemicTier: number;       // 1 (Physical Observation)
  matchedRules: string[];      // Array of Rule IDs supported by this evidence
}
```

---

## 3. Provenance Tracking

Every feature in the normalized context maintains a twin `.provenance` property:

```javascript
{
  "lines.life_line.visibility": "CLEAR",
  "lines.life_line.visibility.provenance": {
    "source": "MODE_1_CAMERA",
    "confidence": 0.94,
    "method": "CONTOUR_PROMINENCE_CV"
  }
}
```

If a feature was gathered through the Mode 2 Guided Questionnaire (e.g. thumb flexibility, skin texture, palm shape), its provenance reflects user-selected confirmation:

```javascript
{
  "thumb.flexibility": "SUPPLE",
  "thumb.flexibility.provenance": {
    "source": "MODE_2_QUESTIONNAIRE",
    "confidence": 0.95,
    "method": "USER_OBSERVATION"
  }
}
```

---

## 4. Evidence Handling for Missing / Negative Data

A major invariant in Kai RegAI is the distinction between **Negative Evidence** vs **Missing Evidence**:

1. **Missing Evidence (`NOT_DETECTED`, `OUT_OF_FRAME`, `UNCLEAR`)**:
   * Does **NOT** imply the physical feature does not exist.
   * Rules requiring `OUT_OF_FRAME` features must **not** fire.
   * Reports explicitly note: *"Crease was not discerned under current lighting or framing"* rather than claiming the user lacks the attribute.
2. **Explicit Observation (`CLEAR`, `FAINT`, `ABSENT_CONGENITAL`)**:
   * Has positive physical evidence.
   * Can be used to evaluate rules explicitly targeted at faint or fragmented creases.

---

## 5. UI Explainability Contract

The `InterpretationDossier` exposes the query method `getExplanation(domain)`:

```javascript
const explanation = dossier.getExplanation("HEART_LINE");
// Returns:
// {
//   domain: "HEART_LINE",
//   rules: [
//     { ruleId: "WEST_HEART_CURVE_JUPITER_001", sourceSystem: "WESTERN_CLASSICAL", ... },
//     { ruleId: "HS_PITRI_CURVE_GURU_001", sourceSystem: "HASTA_SAMUDRIKA", ... }
//   ],
//   evidence: [
//     { featurePath: "lines.heart_line.shape", value: "CURVED", source: "MODE_1_CAMERA", confidence: 0.92 },
//     { featurePath: "lines.heart_line.termination", value: "JUPITER_MOUNT", source: "MODE_1_CAMERA", confidence: 0.88 }
//   ]
// }
```

This guarantees complete transparency in client presentation and developer auditing.
