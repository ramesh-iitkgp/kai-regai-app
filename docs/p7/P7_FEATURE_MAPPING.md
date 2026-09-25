# P7 — Canonical Feature Mapping Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P7 — Palm Reading Questionnaire Engine  

---

## 1. Feature Adapter Contract (`QuestionnaireFeatureAdapter.js`)

Raw user answers are transformed deterministically into an instance of `PalmFeatureModel` (schema `2.0.0`):

```text
Raw Questionnaire Answers
        │
        ▼
QuestionnaireFeatureAdapter.toPalmFeatureModel(answers, sessionId)
        │
        ▼
PalmFeatureModel {
  schema_version: '2.0.0',
  session_id: '...',
  hand: { side, dominance, elemental_shape, firmness, ratios },
  major_lines: { life_line, head_line, heart_line, fate_line, sun_line },
  thumb: { flexibility_angle, flexibility_type, first_phalanx_will, second_phalanx_logic },
  mounts: { jupiter, saturn, apollo_sun, mercury, venus, moon_luna },
  special_markings: [ ... ],
  quality_score: 0.98,
  provenance: {
    mode: 'MODE_2_QUESTIONNAIRE',
    reading_method: 'GUIDED_QUESTIONNAIRE',
    source: 'QUESTIONNAIRE',
    knowledge_version: '1.1.0'
  }
}
```

---

## 2. Crease Line Transformation Rules

| Canonical Field | Source Questionnaire Answer | Mapping Rule |
| :--- | :--- | :--- |
| `detected` | `*_visibility` | `true` if `CLEAR` or `PARTIAL`, `false` if `NOT_VISIBLE` or `NOT_SURE` |
| `status` | `*_visibility` | `CLEAR` -> `DETECTED`<br>`PARTIAL` -> `PARTIAL`<br>`NOT_VISIBLE` -> `NOT_DETECTED`<br>`NOT_SURE` -> `UNCERTAIN` |
| `curvature` / `slope` | `*_curvature` / `*_direction` | Direct string assignment to canonical geometry enum |
| `confidence` | `*_visibility` | `CLEAR`: 0.95<br>`PARTIAL`: 0.70<br>`NOT_SURE`: 0.40 |
| `semantic_color` | Line Identity | Fixed invariant colors: Life=`#A855F7`, Head=`#00D2FF`, Heart=`#F43F5E`, Fate=`#FBBF24`, Sun=`#F59E0B` |
| `polyline` | Mode 2 Invariant | Set to empty array `[]`; triggers SVG fallback path in rendering components |

---

## 3. Thumb & Hand Morphology Mapping

| Canonical Field | Source Answer | Mapping Rule |
| :--- | :--- | :--- |
| `hand.elemental_shape` | `palm_shape` | Direct enum assignment (`FIRE`, `EARTH`, `AIR`, `WATER`) |
| `hand.firmness` | `palm_firmness` | Direct enum assignment (`FIRM_SOLID`, `ELASTIC_RESILIENT`, `SOFT_SUPPLE`) |
| `thumb.flexibility_angle` | `thumb_flexibility` | `SUPPLE_BACKWARD`: 50°<br>`BALANCED_ARC`: 30°<br>`STIFF_RESOLUTE`: 10° |
| `thumb.first_phalanx_will` | `thumb_phalanx_ratio` | `DOMINANT_WILL` -> `STRONG`, else `BALANCED` |
| `thumb.second_phalanx_logic`| `thumb_phalanx_ratio` | `DOMINANT_LOGIC` -> `STRONG`, else `BALANCED` |
