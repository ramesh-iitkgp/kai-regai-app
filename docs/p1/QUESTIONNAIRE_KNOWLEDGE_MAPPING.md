# Kai RegAI — Questionnaire Knowledge Mapping

## 1. Role of the Guided Questionnaire in Mode 2

The Guided Questionnaire bridges the physical limits of 2D camera optics and the multi-dimensional richness of traditional palmistry.

Rather than presenting arbitrary text forms, Kai RegAI employs **tactile, visual, and self-testing UI micro-interactions** that guide the user to observe and confirm their own hand characteristics.

```
+----------------------------------------------------------------------------------------------------+
|                                    MODE 2 INPUT PIPELINE                                           |
|                                                                                                    |
|  [CV Baseline Scan] (Captures 2D hand geometry, major lines, and landmark baseline)                |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Guided Visual Questionnaire] (5 targeted modules collecting tactile & subtle traits)             |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Normalized UserPalmObservations JSON]                                                            |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Merged into Canonical PalmFeatureModel] ──> [Interpretation Rule Engine]                         |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Hardened Questionnaire Specification Matrix

Every question in the questionnaire conforms strictly to the following schema:
```text
question_id
feature_id
property_id
answer_options
interpretation_rules
source_ids
```

### Module 1: Hand Texture & Pad Firmness (Tactile Test)
* **question_id**: `QST-PAD-FIRM-001`
* **feature_id**: `hand.morphology`
* **property_id**: `firmness`
* **Prompt**: *"Gently press the fleshy base of your thumb (the Mount of Venus) with your other hand. How does the pad respond?"*
* **Interactive UI Component**: 3D interactive silicone-style pad button demonstrating springiness.
* **answer_options**:
  1. `ELASTIC_SPRINGY`: *"Fleshy and bounces back immediately"* $\rightarrow$ Maps to robust vitality, warm social appetite.
  2. `FIRM_RESILIENT`: *"Dense, muscular, and solid"* $\rightarrow$ Maps to steadfast stamina, athletic endurance.
  3. `SOFT_FLACCID`: *"Soft, yielding, and gentle"* $\rightarrow$ Maps to high sensitivity, contemplative receptivity.
* **interpretation_rules**: `["RULE-PAD-SPRINGY-001", "RULE-PAD-FIRM-002", "RULE-PAD-SOFT-003"]`
* **source_ids**: `["SRC-WST-001", "SRC-IND-101"]`

### Module 2: The Thumb Flexibility Arc Meter
* **question_id**: `QST-THUMB-FLEX-002`
* **feature_id**: `thumb.structure`
* **property_id**: `flexibility_distal`
* **Prompt**: *"Gently press the top joint of your thumb backward. Does it bend easily or remain resolute?"*
* **Interactive UI Component**: Dynamic vector thumb graphic that flexes dynamically as the user drags a radial slider from $0^\circ$ to $45^\circ+$.
* **answer_options**:
  1. `STIFF_UNBENDING` ($0^\circ - 10^\circ$): Resolute, highly disciplined, unyielding willpower.
  2. `MODERATE_GENTLE` ($11^\circ - 25^\circ$): Balanced, pragmatic, open to reason with firm boundaries.
  3. `SUPPLE_FLEXIBLE` ($26^\circ - 45^\circ+$): Adaptable, generous, versatile, spontaneous.
* **interpretation_rules**: `["RULE-THB-STIFF-001", "RULE-THB-SUPPLE-002"]`
* **source_ids**: `["SRC-WST-001", "SRC-WST-002", "SRC-IND-101"]`

### Module 3: Thumb Willpower vs. Logic Balance
* **question_id**: `QST-THUMB-PHALANX-003`
* **feature_id**: `thumb.structure`
* **property_id**: `phalanx_ratio`
* **Prompt**: *"Compare the length of the top nail segment of your thumb to the middle segment below it."*
* **Interactive UI Component**: Interactive balance scale gauge showing segment proportions.
* **answer_options**:
  1. `EQUAL_BALANCE`: *"Both segments are roughly equal in length"* $\rightarrow$ Harmonious balance of thought and action.
  2. `DOMINANT_WILL`: *"Top segment is noticeably longer"* $\rightarrow$ Drive, executive action, impulse to lead.
  3. `DOMINANT_LOGIC`: *"Middle segment is noticeably longer"* $\rightarrow$ Deep deliberation, analytical debate, planning.
* **interpretation_rules**: `["RULE-THB-EQUAL-001", "RULE-THB-WILL-002", "RULE-THB-LOGIC-003"]`
* **source_ids**: `["SRC-WST-001", "SRC-IND-101"]`

### Module 4: Finger Length & Alignment Gauge
* **question_id**: `QST-FINGER-RATIO-004`
* **feature_id**: `fingers.proportions`
* **property_id**: `index_to_ring_ratio`
* **Prompt**: *"Look at your Index finger (Jupiter) and Ring finger (Apollo). Which one extends higher toward the fingertips?"*
* **Interactive UI Component**: Side-by-side silhouette comparison slider with horizontal target guides.
* **answer_options**:
  1. `RING_FINGER_LONGER`: Ring finger is clearly longer $\rightarrow$ Creative expression, calculated risk-taking, public charm.
  2. `INDEX_FINGER_LONGER`: Index finger is clearly longer $\rightarrow$ Natural leadership, administrative autonomy, high personal standards.
  3. `EQUAL_LENGTH`: Both fingers reach the exact same height $\rightarrow$ Balanced ambition and creative harmony.
* **interpretation_rules**: `["RULE-FNG-APOLLO-LONG-001", "RULE-FNG-JUPITER-LONG-002"]`
* **source_ids**: `["SRC-WST-001", "SRC-IND-002"]`

### Module 5: Sacred Signs & Special Markings Confirmation
* **question_id**: `QST-MARKS-CONFIRM-005`
* **feature_id**: `markings.glyphs`
* **property_id**: `special_signs_confirmed`
* **Prompt**: *"Do you observe any of these distinct traditional markings on your palm?"*
* **Interactive UI Component**: Carousel of stylized illustrated glyph cards with high-contrast macro palm examples.
* **answer_options**:
  * `MATSYA_FISH`: Oval with tail fins near base of palm $\rightarrow$ Auspicious prosperity and resilience.
  * `TRISHULA_TRIDENT`: Clean three-pronged fork rising on Jupiter/Saturn $\rightarrow$ Ethical ascendancy and victory.
  * `MYSTIC_CROSS`: Independent cross in quadrangle between Head & Heart $\rightarrow$ Intuition and contemplative depth.
  * `CHATUSKONA_SQUARE`: Square enclosing a line break or mount $\rightarrow$ Preservation through life transitions.
* **interpretation_rules**: `["RULE-MARK-FISH-001", "RULE-MARK-TRIDENT-002", "RULE-MARK-MYSTIC-003", "RULE-MARK-SQUARE-004"]`
* **source_ids**: `["SRC-IND-001", "SRC-IND-002", "SRC-WST-001"]`

---

## 3. Serialization Contract: `UserPalmObservations`

All questionnaire selections are serialized to conform to `knowledge/schema/observation.schema.json`:

```json
{
  "source_mode": "GUIDED_QUESTIONNAIRE",
  "completion_timestamp": 1774395600,
  "user_responses": {
    "hand_firmness": "ELASTIC_SPRINGY",
    "thumb_flexibility": "SUPPLE_FLEXIBLE",
    "thumb_phalanx_ratio": "EQUAL_BALANCE",
    "finger_length_comparison": "INDEX_FINGER_LONGER",
    "confirmed_markings": ["MYSTIC_CROSS", "CHATUSKONA_SQUARE"]
  }
}
```
