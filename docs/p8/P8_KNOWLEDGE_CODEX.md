# P8 Knowledge Codex & Rule Registry Specification

## 1. Executive Summary

The **Kai RegAI Knowledge Codex** is a structured, versioned, and immutable knowledge repository embodying traditional Western Classical and Indian Hasta Samudrika palmistry traditions alongside modern Kai RegAI psychological synthesis.

The codex is decoupled from interpretation execution: rules are defined as pure declarative data with strict schema validation on startup, ensuring zero hidden business logic in UI components or report templates.

---

## 2. Codex Manifest

* **Codex Identifier**: `KAI_REGAI_CODEX`
* **Codex Version**: `1.0.0`
* **Schema Version**: `1.0.0`
* **Supported Epistemic Tiers**:
  1. `1: PHYSICAL_OBSERVATION`
  2. `2: WESTERN_CLASSICAL`
  3. `3: HASTA_SAMUDRIKA`
  4. `4: KAI_REGAI_SYNTHESIS`
* **Primary Source Systems**:
  * `WESTERN_CLASSICAL` (Cheiro, William Benham, modern dermatoglyphic morphology)
  * `HASTA_SAMUDRIKA` (Samudrika Shastra, Narada Samhita, Bhavishya Purana traditions)
  * `KAI_REGAI_SYNTHESIS` (Archetypal, holistic, non-deterministic cognitive reflection)
* **Domains Supported**:
  * `LIFE_LINE` / `AYUR_REKHA`
  * `HEAD_LINE` / `MATRU_REKHA`
  * `HEART_LINE` / `PITRI_REKHA`
  * `FATE_LINE` / `KARMA_REKHA`
  * `SUN_LINE` / `SURYA_REKHA`
  * `CONSTITUTION` (Elemental Archetypes: Fire, Earth, Air, Water)
  * `VOCATION` (Career & Action Orientations)
  * `RELATIONSHIPS` (Interpersonal & Emotional Dynamics)
  * `THUMB` (Willpower, Logic, Agility)
  * `SACRED_MARKS` (Trishula, Yava, Chhatra, Padma)

---

## 3. Directory Layout

```text
src/knowledge/
├── codex/
│   ├── CodexManifest.js       # Manifest, version metadata, registered source systems
│   └── CodexValidator.js      # Static schema, duplicate ID, and operator validator
├── rules/
│   ├── western/
│   │   ├── lifeLineRules.js   # Vitality, physical endurance, stability
│   │   ├── headLineRules.js   # Cognition, focus, analytical vs creative
│   │   ├── heartLineRules.js  # Emotional style, idealism, reserve
│   │   └── fateLineRules.js   # Career clarity, self-direction, Sun line & thumb
│   ├── hastaSamudrika/
│   │   ├── ayurRekhaRules.js  # Prana, lineage resilience, vitality flow
│   │   ├── matruRekhaRules.js # Medha (intellect), mental balance, memory
│   │   └── karmaRekhaRules.js # Dharma, enterprise, Surya Rekha, Trishula, Yava
│   └── synthesis/
│       └── constitutionalRules.js # Elemental types, vocational synergy, cross-line balance
└── index.js                   # Master registry aggregator and startup validation check
```

---

## 4. Rule Distribution & Metrics

| Domain | Western Rules | Hasta Samudrika Rules | Synthesis Rules | Total Rules |
| :--- | :---: | :---: | :---: | :---: |
| **Life / Ayur Rekha** | 3 | 3 | 0 | 6 |
| **Head / Matru Rekha** | 3 | 3 | 0 | 6 |
| **Heart / Pitri Rekha** | 3 | 3 | 0 | 6 |
| **Fate & Sun / Karma & Surya** | 5 | 5 | 0 | 10 |
| **Thumb / Marks** | 2 | 2 | 0 | 4 |
| **Constitution & Vocation** | 0 | 0 | 6 | 6 |
| **Total** | **16** | **16** | **6** | **38** |

All 38 rules are covered by static validation on module import and tested via automated test suites.

---

## 5. Traceability & Source Citations

Every rule includes an explicit source citation guaranteeing epistemic honesty:

* `WEST_LIFE_CURVED_WIDE_001`: Cheiro's *Language of the Hand* (1897); Benham's *The Laws of Scientific Hand Reading* (1900).
* `HS_AYUR_DEEP_CURVED_001`: Samudrika Shastra, Ch. 4 (Ayur Lakshana).
* `WEST_HEAD_STRAIGHT_001`: Saint-Germain, *Practical Palmistry* (1897); Benham (1900).
* `HS_MATRU_STRAIGHT_001`: Hastarekha Vijnana; Narada Samhita (Buddhi Prakarana).
* `WEST_HEART_CURVE_JUPITER_001`: Cheiro (1897); Llewellyn (1904).
* `HS_PITRI_CURVE_GURU_001`: Bhavishya Purana; Samudrika Tilaka.
* `HS_MARK_YAVA_THUMB_001`: Brihat Samhita; Samudrika Lakshana.
* `HS_MARK_TRISHULA_001`: Samudrika Shastra (Raja Yoga Lakshana).
* `SYN_CONST_FIRE_001`: Kai RegAI Archetypal Synthesis Engine.

No rule is ungrounded or anonymous.
