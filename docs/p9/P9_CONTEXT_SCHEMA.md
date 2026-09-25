# P9 Narration Context Schema Specification

## 1. Overview & Context Firewall

The **Narration Context** is the formal bounded data structure compiled by `NarrationContextBuilder.js` (`src/narration/NarrationContextBuilder.js`) and provided to the prompt compiler and AI narrator.

It acts as a **Context Firewall**:
* Prevents prompt dumping of raw implementation details.
* Excludes uncurated internal rule trees or raw coordinate vectors.
* Encapsulates physical observations, matched traditional interpretations, synthesized themes, explicit uncertainty, and safety constraints.

---

## 2. Canonical JSON Schema

```typescript
interface NarrationContext {
  // Reading subject & capture provenance
  subjectProfile: {
    readingMethod: "MODE_1_CAMERA" | "MODE_2_QUESTIONNAIRE";
    methodLabel: string;               // e.g. "Rapid Camera Scan" or "Guided Palm Reading"
    handSide: "RIGHT" | "LEFT";
    handDominance: "DOMINANT" | "PASSIVE";
    overallConfidence: number;         // 0.0 - 1.0 (from P8 aggregate confidence)
    confidenceBand: "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT_EVIDENCE";
    qualityScore: number;              // 0.0 - 1.0 (optical or questionnaire certainty)
  };

  // Tier 1 Physical Observations
  observations: Array<{
    lineKey: string;                   // e.g. "life_line", "head_line"
    name: string;                      // e.g. "Life Line (Ayur Rekha)"
    status: "DETECTED" | "PARTIAL" | "OUT_OF_FRAME" | "NOT_DETECTED";
    description: string;               // Physical contour description
    confidence: number;
  }>;

  // Tier 2 (Western) & Tier 3 (Hasta Samudrika) Matched Interpretations
  interpretations: Array<{
    domain: string;
    tradition: "WESTERN_CLASSICAL" | "HASTA_SAMUDRIKA";
    epistemicTier: 2 | 3;
    summary: string;
    attribution: string;               // Literature source citation
  }>;

  // Tier 4 Kai RegAI Thematic Synthesis
  synthesisThemes: Array<{
    theme: "CONSTITUTION" | "VOCATION" | "RELATIONSHIPS" | "GUIDANCE";
    label: string;
    content: string;
  }>;

  // Explicit Observation Uncertainty
  uncertainty: Array<{
    feature: string;
    issue: "OUT_OF_FRAME" | "NOT_DETECTED" | "PARTIAL_OR_FAINT";
    note: string;
  }>;

  // Evidence trace records
  evidence: Array<{
    featurePath: string;
    value: any;
    source: string;
    confidence: number;
    ruleId: string;
  }>;

  // Approved Traditional Source Attributions
  sources: Array<{
    id: string;
    name: string;
    tradition: string;
  }>;

  // Features block (Mounts, Thumb, Sacred Markings)
  features: {
    mounts?: Array<{ name: string; icon: string; note: string }>;
    thumb?: { angle?: string; balance?: string; interpretation?: string };
    markings?: Array<{ name: string; tradition: string; note: string }>;
  };

  // Optional user focus inquiry (sanitized)
  userFocus: string | null;

  // Explicit safety boundaries
  constraints: string[];
}
```

---

## 3. Strict Operating Invariants

1. **Zero Raw Images**: Neither raw pixel buffers nor base64 images are ever passed to the Narration Context.
2. **Missing Feature Integrity**: If a line is `OUT_OF_FRAME` or `NOT_DETECTED`, it is never omitted; it is explicitly placed in the `uncertainty` collection with guidance that it represents unrecorded potential rather than biological absence.
