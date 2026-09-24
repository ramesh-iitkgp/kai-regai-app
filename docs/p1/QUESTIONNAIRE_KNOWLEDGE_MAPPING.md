# Kai RegAI — Questionnaire Knowledge Mapping

## 1. Role of the Guided Questionnaire in Mode 2

The Guided Questionnaire bridges the physical limits of 2D camera optics and the multi-dimensional richness of traditional palmistry.

Rather than presenting boring text forms, Kai RegAI employs **tactile, visual, and self-testing UI micro-interactions** that guide the user to observe and confirm their own hand characteristics.

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

## 2. The 5 Interactive Questionnaire Modules

### Module 1: Hand Texture & Pad Firmness (Tactile Test)
* **Prompt**: *"Gently press the fleshy base of your thumb (the Mount of Venus) with your other hand. How does the pad respond?"*
* **Interactive UI Component**: 3D interactive silicone-style pad button demonstrating springiness.
* **Options**:
  1. `ELASTIC_SPRINGY`: *"Fleshy and bounces back immediately"* $\rightarrow$ Maps to robust vitality, warm social appetite.
  2. `FIRM_RESILIENT`: *"Dense, muscular, and solid"* $\rightarrow$ Maps to steadfast stamina, athletic endurance.
  3. `SOFT_FLACCID`: *"Soft, yielding, and gentle"* $\rightarrow$ Maps to high sensitivity, contemplative receptivity.
* **Target Feature Key**: `hand.firmness`

### Module 2: The Thumb Flexibility Arc Meter
* **Prompt**: *"Gently press the top joint of your thumb backward. Does it bend easily or remain resolute?"*
* **Interactive UI Component**: Dynamic vector thumb graphic that flexes dynamically as the user drags a radial slider from $0^\circ$ to $45^\circ+$.
* **Options**:
  1. `STIFF_UNBENDING` ($0^\circ - 10^\circ$): Resolute, highly disciplined, unyielding willpower.
  2. `MODERATE_GENTLE` ($11^\circ - 25^\circ$): Balanced, pragmatic, open to reason with firm boundaries.
  3. `SUPPLE_FLEXIBLE` ($26^\circ - 45^\circ+$): Adaptable, generous, versatile, spontaneous.
* **Target Feature Key**: `thumb.flexibility_distal`

### Module 3: Thumb Willpower vs. Logic Balance
* **Prompt**: *"Compare the length of the top nail segment of your thumb to the middle segment below it."*
* **Interactive UI Component**: Interactive balance scale gauge showing segment proportions.
* **Options**:
  1. `EQUAL_BALANCE`: *"Both segments are roughly equal in length"* $\rightarrow$ Harmonious balance of thought and action.
  2. `DOMINANT_WILL`: *"Top segment is noticeably longer"* $\rightarrow$ Drive, executive action, impulse to lead.
  3. `DOMINANT_LOGIC`: *"Middle segment is noticeably longer"* $\rightarrow$ Deep deliberation, analytical debate, planning.
* **Target Feature Key**: `thumb.phalanx_ratio`

### Module 4: Finger Length & Alignment Gauge
* **Prompt**: *"Look at your Index finger (Jupiter) and Ring finger (Apollo). Which one extends higher toward the fingertips?"*
* **Interactive UI Component**: Side-by-side silhouette comparison slider with horizontal target guides.
* **Options**:
  1. `RING_FINGER_LONGER`: Ring finger is clearly longer $\rightarrow$ Creative expression, calculated risk-taking, public charm.
  2. `INDEX_FINGER_LONGER`: Index finger is clearly longer $\rightarrow$ Natural leadership, administrative autonomy, high personal standards.
  3. `EQUAL_LENGTH`: Both fingers reach the exact same height $\rightarrow$ Balanced ambition and creative harmony.
* **Target Feature Key**: `fingers.index.length_relative_to_ring`

### Module 5: Sacred Signs & Special Markings Confirmation
* **Prompt**: *"Do you observe any of these distinct traditional markings on your palm?"*
* **Interactive UI Component**: Carousel of stylized illustrated glyph cards with high-contrast macro palm examples.
* **Selectable Markings**:
  * **The Fish (*Matsya*)**: Oval with tail fins near the base of the palm or Life line $\rightarrow$ Traditional sign of auspicious resilience and prosperity.
  * **The Trident (*Trishula*)**: Clean three-pronged fork rising onto Jupiter or Saturn $\rightarrow$ Sign of ethical ascendancy and victory.
  * **The Mystic Cross**: Independent cross in the space between Head and Heart lines $\rightarrow$ Deep intuition and philosophical contemplation.
  * **The Square of Protection (*Chatuskona*)**: Square enclosing a line break or mount $\rightarrow$ Preservation through life transitions.
* **Target Feature Key**: `markings.special_signs_confirmed`

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
    "confirmed_markings": ["MYSTIC_CROSS", "SQUARE_ON_LIFE"]
  }
}
```
