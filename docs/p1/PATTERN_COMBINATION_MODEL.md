# Kai RegAI — Pattern Combination Model

## 1. The Principle of Emergent Pattern Interpretation

In classical palmistry (*Hasta Samudrika* and Benham alike), **no single palm feature operates in isolation**. An isolated feature (e.g. a sloping Head Line) changes its expression depending on the hand shape, the thumb, and the underlying planetary mounts.

```
       [Feature A: Sloping Head Line]
                     +
       [Feature B: High Mount of Moon]    ──> Emergent Meaning:
                     +                        "Deep imaginative and artistic synthesis"
       [Feature C: Conic/Water Hand]

                                   vs

       [Feature A: Sloping Head Line]
                     +
       [Feature B: Flat Mount of Moon]    ──> Emergent Meaning:
                     +                        "Restless mental wandering without creative output"
       [Feature C: Stiff Thumb]
```

### Strict Architectural Rule on Combinations
1. **Never Invent Speculative Combinations**: Pattern rules must derive either directly from verified literature (e.g. Benham's chapters on *Mount and Line Combinations*, Shrimali's *Sanyukta Rekha Phala*) or be explicitly tagged as `KAI_REGAI_SYNTHESIS`.
2. **Precedence Hierarchy**: Where an active compound pattern rule matches, it takes precedence over lower-order single-feature rules to prevent contradictory statements in the generated report.

---

## 2. Pattern Combination Rule Schema

Every compound pattern is formalized adhering to `knowledge/schema/pattern_rule.schema.json`:

```json
{
  "$schema": "https://kaireg.ai/schemas/pattern-rule.v1.json",
  "pattern_id": "PAT-LEAD-003",
  "name": "Executive Leadership Configuration (Jupiter Apex + Long Index + Balanced Thumb)",
  "category": "VOCATIONAL_LEADERSHIP",
  "sources": [
    {
      "source_id": "SRC-WST-001",
      "author": "William G. Benham",
      "chapter": "Mount of Jupiter in Combination with Fingers",
      "page_reference": "pp. 142-148"
    },
    {
      "source_id": "SRC-IND-101",
      "author": "Dr. N.D. Shrimali",
      "chapter": "Guru Parvata aur Anguli Vichara",
      "page_reference": "pp. 78-81"
    }
  ],
  "provenance_type": "MULTI_SOURCE_DOCUMENTED",
  "component_features": [
    {
      "feature_path": "mounts.jupiter.prominence",
      "condition": "IN",
      "value": ["WELL_DEVELOPED", "APEX_HIGH"]
    },
    {
      "feature_path": "fingers.index.length_relative_to_ring",
      "condition": "IN",
      "value": ["EQUAL", "LONGER"]
    },
    {
      "feature_path": "thumb.phalanx_ratio",
      "condition": "EQUALS",
      "value": "EQUAL_BALANCE"
    },
    {
      "feature_path": "lines.head_line.continuity",
      "condition": "EQUALS",
      "value": "CONTINUOUS"
    }
  ],
  "emergent_synthesis": {
    "archetype_title": "The Strategic Leader & Benevolent Executive",
    "thematic_domain": "VOCATION_AND_PURPOSE",
    "synthesized_narrative": "A prominent Mount of Jupiter paired with an index finger that commands equal or greater height than the ring finger indicates an innate executive orientation and natural dignity. The balanced phalanges of the thumb ensure that ambition is backed by practical reasoning, preventing impulsiveness. You thrive when given stewardship over projects and people.",
    "modifier_effect": "SUPPRESS_ISOLATED_JUPITER_AND_THUMB_STANDALONE_RULES"
  }
}
```

---

## 3. Canonical Verified Compound Patterns

### Pattern 1: The Resilient Vitality Engine (`PAT-VIT-001`)
* **Component Features**:
  * `lines.life_line.curvature_profile` = `WIDE_ARC`
  * `mounts.venus.prominence` = `FULL`
  * `thumb.flexibility_distal` = `MODERATE` or `SUPPLE`
  * `hand.shape_elemental` = `EARTH` or `FIRE`
* **Emergent Insight**: High constitutional stamina, expansive emotional warmth, strong generative energy, and ability to recover rapidly from physical exertion.
* **Corroborating Sources**: Benham (pp. 312–316), Shrimali (pp. 54–57).

### Pattern 2: The Pragmatic Analyst (`PAT-MIND-002`)
* **Component Features**:
  * `lines.head_line.curvature_profile` = `STRAIGHT_LINEAR`
  * `hand.shape_elemental` = `EARTH` or `AIR` (Square palm)
  * `thumb.flexibility_distal` = `STIFF_UNBENDING`
  * `fingers.joints` = `KNOTTY_PHILOSOPHIC`
* **Emergent Insight**: Uncompromising dedication to empirical evidence, systematic process, and objective scrutiny. Immune to emotional appeals when evaluating logical plans.
* **Corroborating Sources**: Cheiro (*Palmistry for All*, Ch. V), Benham (pp. 210–215).

### Pattern 3: The Intuitive Empathetic Counselor (`PAT-EMO-004`)
* **Component Features**:
  * `lines.heart_line.termination_location` = `MOUNT_OF_JUPITER`
  * `lines.girdle_of_venus` = `PRESENT_CLEAN`
  * `hand.shape_elemental` = `WATER` (Long palm, long fingers)
  * `hand.texture` = `VERY_FINE` or `FINE`
* **Emergent Insight**: Profound emotional receptivity, high empathy, idealistic attachment patterns, and sensitivity to the unspoken emotional currents of others.
* **Corroborating Sources**: Benham (pp. 278–282), Ojha (*Hastarekha Vigyan*, Ch. 7).

---

## 4. The `KAI_REGAI_SYNTHESIS` Namespace

Where Kai RegAI creates new composite patterns to bridge classical Vedic concepts with contemporary psychological frameworks, they must be registered under the explicit namespace:

```json
{
  "pattern_id": "PAT-SYNTH-KAI-001",
  "namespace": "KAI_REGAI_SYNTHESIS",
  "version": "1.0.0",
  "author": "Kai RegAI Core Knowledge Board",
  "review_date": "2026-09-24",
  "synthesis_rationale": "Reconciles classical Hasta Samudrika 'Matsya' marking interpretation with modern reflective vocational guidance.",
  "source_rules_considered": ["RULE-VEDIC-MATSYA-001", "RULE-WST-APOLLO-004"],
  "transparency_notice": "This compound insight is a modern synthesis formulated by Kai RegAI and is not an archaic textual verse."
}
```
