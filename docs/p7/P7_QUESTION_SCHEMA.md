# P7 — Questionnaire Schema & Question Specifications

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P7 — Palm Reading Questionnaire Engine  
**Schema Version:** `2.0.0`  

---

## 1. Schema Design Philosophy

The questionnaire engine collects **pure physical observations**, NEVER interpretive conclusions.

### Epistemic Language Invariants:
- **Questions ask what is visible**: "How clearly can you see...", "Does the line appear continuous...", "Where does the line begin..."
- **Questions NEVER ask what it means**: Forbidden: "Is your Life Line lucky?", "Do you have a long life?", "Is your fate strong?"
- **Honest Uncertainty Support**: Every question offers `NOT_SURE`, `NOT_VISIBLE`, or `NOT_APPLICABLE` where appropriate.
- **Not Visible ≠ Absent**: A line reported as `NOT_VISIBLE` is recorded as unobserved in this session, never as a biological defect.

---

## 2. Categories & Questions Reference Table

| Category | Question ID | Title | Question Type | Dependencies (`showWhen`) |
| :--- | :--- | :--- | :--- | :--- |
| **HAND_MORPHOLOGY** | `hand_side` | Dominant Reading Hand | `SINGLE_SELECT` | None (Always active) |
| **HAND_MORPHOLOGY** | `palm_shape` | Palm & Finger Proportions | `SINGLE_SELECT` | None (Always active) |
| **HAND_MORPHOLOGY** | `palm_firmness` | Palmar Pad Firmness & Texture | `SINGLE_SELECT` | None (Always active) |
| **LIFE_LINE** | `life_line_visibility` | Life / Vitality Line Visibility | `SINGLE_SELECT` | None (Always active) |
| **LIFE_LINE** | `life_line_continuity` | Life Line Furrow Continuity | `SINGLE_SELECT` | `life_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **LIFE_LINE** | `life_line_curvature` | Life Line Curvature Arc | `SINGLE_SELECT` | `life_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **HEAD_LINE** | `head_line_visibility` | Head / Intellect Line Visibility | `SINGLE_SELECT` | None (Always active) |
| **HEAD_LINE** | `head_line_direction` | Head Line Direction & Slope | `SINGLE_SELECT` | `head_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **HEAD_LINE** | `head_line_clarity` | Head Line Furrow Clarity | `SINGLE_SELECT` | `head_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **HEART_LINE** | `heart_line_visibility` | Heart / Emotion Line Visibility | `SINGLE_SELECT` | None (Always active) |
| **HEART_LINE** | `heart_line_curvature` | Heart Line Curvature & Destination | `SINGLE_SELECT` | `heart_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **FATE_LINE** | `fate_line_visibility` | Fate / Saturn Line Visibility | `SINGLE_SELECT` | None (Always active) |
| **FATE_LINE** | `fate_line_origin` | Fate Line Starting Region | `SINGLE_SELECT` | `fate_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **SUN_LINE** | `sun_line_visibility` | Sun / Apollo Line Visibility | `SINGLE_SELECT` | None (Always active) |
| **SUN_LINE** | `sun_line_prominence` | Sun Line Prominence | `SINGLE_SELECT` | `sun_line_visibility` in `['CLEAR', 'PARTIAL']` |
| **THUMB** | `thumb_flexibility` | Thumb Backward Flexibility | `SINGLE_SELECT` | None (Always active) |
| **THUMB** | `thumb_phalanx_ratio` | Thumb Phalanx Balance | `SINGLE_SELECT` | None (Always active) |
| **SPECIAL_MARKINGS**| `special_markings_confirmed`| Auspicious Palmar Markings | `MULTI_SELECT` | None (Always active) |

---

## 3. Allowed Observation States
All answers evaluate into one of the canonical observation states:
- `OBSERVED`: User explicitly confirmed feature presence with clear morphological detail.
- `NOT_OBSERVED`: User evaluated region and found feature absent or faint.
- `NOT_SURE`: User inspected hand but was unable to classify ambiguous creases.
- `NOT_VISIBLE`: Feature lies outside visible range or is not discernible.
- `NOT_APPLICABLE`: Skipped by conditional dependency logic (`SKIPPED_BY_LOGIC`).
