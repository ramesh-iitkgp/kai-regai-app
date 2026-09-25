# P8 — Interpretation Engine Architecture

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P8 — Interpretation / Rule Engine & Knowledge Codex Matching  
**Status:** COMPLETE & VERIFIED  

---

## 1. Architectural Mandate: Unidirectional Pipeline

The core architectural invariant of Kai RegAI is the unidirectional pipeline converting raw sensory or questionnaire data into canonical features, matching against declarative rules, and synthesizing an inspectable reading dossier:

```text
Mode 1 Camera (P5/P6 CV)         Mode 2 Questionnaire (P7 Engine)
           │                                    │
           └─────────────────┬──────────────────┘
                             ▼
                 Canonical PalmFeatureModel
                 (Schema v2.0.0 with Provenance)
                             │
                             ▼
             ┌───────────────────────────────┐
             │    P8 INTERPRETATION LAYER    │
             ├───────────────────────────────┤
             │ 1. Feature Normalization      │
             │    (FeatureNormalizer.js)     │
             │ 2. Rule Evaluation            │
             │    (RuleEngine.js)            │
             │ 3. Evidence Collection        │
             │    (EvidenceCollector.js)     │
             │ 4. Knowledge Codex Matching   │
             │    (MASTER_RULE_REGISTRY)     │
             │ 5. Confidence Propagation     │
             │    (ConfidenceEngine.js)      │
             │ 6. Conflict Reconciliation    │
             │    (ConflictResolver.js)      │
             │ 7. Cross-Line Synthesis       │
             │    (SynthesisEngine.js)       │
             │ 8. Epistemic Safety Gating    │
             │    (EpistemicGate.js)         │
             └───────────────┬───────────────┘
                             ▼
                   InterpretationDossier
                   (Full Audit & Evidence Trail)
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
              Quick Report      Detailed Report
```

---

## 2. Decoupled Modular Structure

The engine strictly separates execution logic from declarative knowledge rules:

```text
src/
├── knowledge/                         # Declarative Knowledge Base & Rules
│   ├── codex/
│   │   ├── CodexManifest.js           # Manifest, schema metadata, domain registration
│   │   └── CodexValidator.js          # Static validation of schemas, operators & integrity
│   ├── rules/
│   │   ├── western/                   # Tier 2 Classical Western chiromancy rules
│   │   │   ├── lifeLineRules.js
│   │   │   ├── headLineRules.js
│   │   │   ├── heartLineRules.js
│   │   │   └── fateLineRules.js (includes Sun & Thumb)
│   │   ├── hastaSamudrika/            # Tier 3 Classical Indian Samudrika rules
│   │   │   ├── ayurRekhaRules.js
│   │   │   ├── matruRekhaRules.js
│   │   │   └── karmaRekhaRules.js (includes Surya & Markings)
│   │   └── synthesis/                 # Tier 4 Cross-line patterns & constitutional archetypes
│   │       └── constitutionalRules.js (includes Vocation & Cross-Line)
│   └── index.js                       # Master Rule Registry & Validator export
│
├── interpretation/                    # Execution & Synthesis Pipeline
│   ├── FeatureNormalizer.js           # Dot-path context mapping
│   ├── RuleEngine.js                  # Deterministic condition matching
│   ├── EvidenceCollector.js           # Traceability & explanation trail binding
│   ├── ConfidenceEngine.js            # Propagated confidence & epistemic bands
│   ├── ConflictResolver.js            # Tradition consensus & divergence management
│   ├── SynthesisEngine.js             # Chapter & line prose synthesis
│   ├── EpistemicGate.js               # Forbidden fatalism/medical assertion scanner
│   ├── InterpretationDossier.js       # Master report view model with explainability API
│   └── index.js                       # Master interpret() pipeline entry point
│
└── services/
    └── PalmInterpretationEngine.js    # Backward-compatible gateway delegating to interpret()
```

---

## 3. Four Epistemic Tiers Preserved

1. **Tier 1 — Physical Observation**: Sensor and tactile facts (e.g. continuous curvature, transverse trajectory, phalanx ratio). Zero predictive speculation.
2. **Tier 2 — Western Classical**: Attributed interpretations from historical Western authorities (Benham, Cheiro, D'Arpentigny).
3. **Tier 3 — Hasta Samudrika**: Attributed commentary from classical Indian treatises (*Bhavishya Purana*, Shrimali, *Pāṇilekhā*).
4. **Tier 4 — Kai RegAI Synthesis**: Multi-line character synthesis, reflective vocational counsel, and contemplative prompts without deterministic certainty.

---

## 4. Determinism Law

Given the exact same `PalmFeatureModel` and the same `Codex` version, `interpret(featureModel)` guarantees 100% deterministic results:
- Rules are sorted and evaluated in fixed alphabetical order by `ruleId`.
- No random selection or stochastic sampling.
- No generative LLM hallucination of palm rules.
