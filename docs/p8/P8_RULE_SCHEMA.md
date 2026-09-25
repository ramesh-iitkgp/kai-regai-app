# P8 — Interpretation Rule Schema Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P8 — Interpretation / Rule Engine & Knowledge Codex Matching  
**Schema Version:** `1.0.0`  

---

## 1. Declarative Rule Schema Specification

Every rule in the Kai RegAI Knowledge Codex is a declarative object conforming to the following structure:

```json
{
  "ruleId": "WST_HEAD_GENTLE_SLOPE_01",
  "sourceSystem": "WESTERN_CLASSICAL",
  "epistemicTier": 2,
  "domain": "HEAD_LINE",
  "name": "Gentle Sloping Head Line to Mount of Moon",
  "author": "William G. Benham",
  "citation": "The Laws of Scientific Hand Reading, pp. 230-234",
  "conditions": {
    "all_of": [
      {
        "feature": "lines.head_line.detected",
        "operator": "EQUALS",
        "value": true
      },
      {
        "feature": "lines.head_line.slope",
        "operator": "IN",
        "value": ["GENTLE_SLOPE", "GENTLE_SLOPE_TO_LUNA", "SLIGHT_CURVE_TO_MOON"]
      }
    ]
  },
  "interpretation": {
    "title": "Imaginative & Pragmatic Synthesis",
    "archetype": "The Creative Strategist",
    "summary": "Classical Western treatises associate a gentle slope toward the Lunar quadrant with creative intellect harmonizing logic and intuition.",
    "detail": "Benham notes that this descent prevents intellectual rigidity, enabling lateral ideation, artistic sensitivity, and adaptable problem-solving.",
    "synthesis": "You excel at bridging structured reasoning with conceptual, lateral vision."
  },
  "confidence": 0.92
}
```

---

## 2. Condition Operators

| Operator | Type | Behavior | Example |
| :--- | :--- | :--- | :--- |
| `EQUALS` | Value | Exact scalar equality (`===`) | `hand.elemental_shape EQUALS "FIRE"` |
| `NOT_EQUALS`| Value | Scalar inequality (`!==`) | `lines.life_line.status NOT_EQUALS "NOT_DETECTED"` |
| `IN` | Collection | Scalar membership or array intersection | `lines.head_line.slope IN ["GENTLE_SLOPE", "STRAIGHT"]` |
| `NOT_IN` | Collection | Non-membership in target array | `special_markings.types NOT_IN ["NONE_OBSERVED"]` |
| `EXISTS` | Presence | Value is neither `undefined` nor `null` | `thumb.flexibility_type EXISTS true` |
| `NOT_EXISTS`| Presence| Value is `undefined` or `null` | `lines.fate_line.origin NOT_EXISTS true` |
| `GREATER_THAN`| Numeric | Numerical strict greater than (`>`) | `thumb.flexibility_angle GREATER_THAN 40` |
| `LESS_THAN`| Numeric | Numerical strict less than (`<`) | `thumb.flexibility_angle LESS_THAN 20` |
| `GTE` | Numeric | Numerical greater than or equal (`>=`) | `hand.ratios.palm_ratio GTE 1.0` |
| `LTE` | Numeric | Numerical less than or equal (`<=`) | `lines.life_line.confidence LTE 0.50` |

---

## 3. Compound Condition Groups

- `all_of`: Logical conjunction (AND). All sub-conditions must evaluate to `true`.
- `any_of`: Logical disjunction (OR). At least one sub-condition must evaluate to `true`.
- `none_of`: Logical negation (NOR). No sub-condition may evaluate to `true`.
