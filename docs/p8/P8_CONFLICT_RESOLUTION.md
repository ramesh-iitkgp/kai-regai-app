# P8 Conflict Resolution & Traditional Convergence Specification

## 1. Overview & Policy

Traditional systems of palmistry arose in different civilizational contexts:
* **Western Classical** emphasizes character psychology, vocational drive, emotional extroversion/introversion, and mental clarity.
* **Hasta Samudrika** emphasizes constitutional prana (vital force), karmic momentum, familial lineage, and dharmic equilibrium.

**The Golden Law of Kai RegAI Conflict Resolution:**
> **Never force a false consensus. When traditions offer divergent interpretations, celebrate both perspectives as distinct lenses rather than declaring one system "correct" and overwriting the other.**

---

## 2. Taxonomy of Conflicts

The `ConflictResolver` (`src/interpretation/ConflictResolver.js`) detects and handles three classes of divergence:

### Class 1: Cross-Traditional Divergence
Occurs when Western Classical rules and Hasta Samudrika rules analyze the same physical crease but attribute distinct psychological or symbolic tendencies.
* **Resolution**: The engine records a `CROSS_TRADITION_DIVERGENCE` record. In reports, both perspectives are presented side-by-side:
  * Western Perspective: Focus on individual agency and cognitive pattern.
  * Hasta Samudrika Perspective: Focus on constitutional rhythm and dharmic context.
  * Kai RegAI Synthesis: Highlights the complementary nature of both views without contradiction.

### Class 2: Sensor / Provenance Conflicts (Mode 1 vs Mode 2)
Occurs when the camera CV pipeline detects a line as `FAINT` or `PARTIAL`, but the user in the Mode 2 guided questionnaire classifies it as `CLEAR`.
* **Precedence Order**:
  1. If user self-inspection in Mode 2 has high confidence, tactile/visual self-report resolves feature ambiguity for nuanced markings (flexibility, skin texture, fine cross-creases).
  2. For gross geometric coordinates (curvature radius, origin distance), CV contour data is retained.
  3. The conflict is logged with provenance metadata for developer inspection.

### Class 3: Cross-Line Tension
Occurs when different lines suggest contrasting tendencies (e.g. a bold, risk-tolerant Head line paired with an inward, cautious Heart line).
* **Resolution**: Recognized not as a bug, but as human complexity. The Synthesis Engine translates this into an integrated psychological insight: *"A dynamic balance between analytical daring and relational circumspection."*

---

## 3. Conflict Record Schema

```typescript
interface ConflictRecord {
  domain: string;              // e.g. "HEART_LINE"
  type: string;                // "TRADITION_DIVERGENCE" | "PROVENANCE_DISCREPANCY" | "CROSS_FEATURE_TENSION"
  traditions: string[];        // ["WESTERN_CLASSICAL", "HASTA_SAMUDRIKA"]
  ruleIds: string[];           // ["WEST_HEART_CURVE_001", "HS_PITRI_CURVE_001"]
  synthesisStrategy: string;   // "COMPLEMENTARY_DUAL_PERSPECTIVE" | "PROVENANCE_WEIGHTED"
  summary: string;             // Human-readable synthesis of the tension
}
```

---

## 4. Preservation of Source Integrity

Under no circumstances does the engine blend or rewrite a classical source to match a modern Western bias. Every tradition retains its canonical terminology:
* Ayur Rekha / Prana / Shukra Mandala are attributed to **Hasta Samudrika**.
* Life Line / Vitality / Mount of Venus are attributed to **Western Classical**.
* Kai RegAI Synthesis provides the modern reflective bridge.
