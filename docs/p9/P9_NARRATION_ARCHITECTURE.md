# P9 Narration Engine Architecture Specification

## 1. Executive Summary & Core Mandate

The **Kai RegAI AI / RAG Narration Engine** transforms the deterministic, verified `InterpretationDossier` produced by Phase P8 into personalized, culturally resonant, empathetic narratives.

The foundational law of Kai RegAI Narration is:
> **P8 DECIDES. P9 EXPLAINS.**
> P8 is the single source of interpretation truth. P9 is strictly a narration, synthesis, tone-calibration, and natural-language presentation layer. P9 has zero authority to inspect raw pixels, invent palm features, alter rule matching, or generate deterministic future predictions or medical diagnoses.

---

## 2. End-to-End Pipeline

```text
                     RAW PALM SCAN / INPUT
                              │
                     P5 / P6 (CV) / P7 (Questionnaire)
                              │
                              ▼
                      PalmFeatureModel
                              │
                           P8 Engine
                              │
                              ▼
                    InterpretationDossier
                              │
               ┌──────────────┴──────────────┐
               │                             │
       Evidence Records               Knowledge Codex
               │                             │
               └──────────────┬──────────────┘
                              ▼
                    NarrationContextBuilder
                              │
                              ▼
                     Approved Local RAG
                              │
                              ▼
                      ThemeAggregator
                              │
                              ▼
                       PromptCompiler
                              │
                              ▼
                   LLMProvider (Mock/Vendor)
                              │
                              ▼
                  NarrationSchemaValidator
                              │
                              ▼
                  NarrationSafetyGate (Firewall)
                              │
                              ▼
                 EvidenceConsistencyChecker
                           /     \
                        PASS     FAIL
                         │         │
                         ▼         ▼
                 AI Narrated   Deterministic
                   Reading        Fallback
                         │         │
                         └────┬────┘
                              ▼
                       NarratedReading
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
          Quick Report               Detailed Report
```

---

## 3. Core Architectural Modules

The engine is encapsulated under `src/narration/`:

| Module | Responsibility |
| :--- | :--- |
| **`NarratedReading.js`** | Canonical versioned data contract for narration outputs (`schemaVersion: 1.0.0`). |
| **`NarrationContextBuilder.js`** | Context Firewall converting raw dossier into bounded, clean payload. |
| **`ThemeAggregator.js`** | Eliminates repetitive line citations by clustering compatible rules into higher-order themes. |
| **`RAGRetriever.js`** | Local, codex-bounded knowledge retrieval (zero public web search). |
| **`PromptCompiler.js`** | Deterministically compiles system directives, context, and JSON output schema. |
| **`NarrationSchemaValidator.js`** | Rejects malformed or incomplete AI responses. |
| **`NarrationSafetyGate.js`** | Double-layer epistemic firewall blocking fatalism, death ages, divorce, and diseases. |
| **`EvidenceConsistencyChecker.js`**| Anti-hallucination engine verifying all claims against physical evidence. |
| **`LLMProvider.js` / `MockLLMProvider.js`** | Pluggable vendor abstraction with zero external test dependencies. |
| **`DeterministicNarrator.js`** | High-quality offline fallback narrator ensuring 100% service uptime. |
| **`index.js`** | Master orchestration entry point (`narrate()`). |

---

## 4. Double-Layer Epistemic Defense

1. **Layer 1 (P8 EpistemicGate)**: Static rules and interpretations are pre-screened to ensure no fatalistic or medical statements exist in the Knowledge Codex.
2. **Layer 2 (P9 NarrationSafetyGate & EvidenceConsistencyChecker)**: AI generated prose is actively scanned post-generation. Any violation triggers immediate fallback to `DeterministicNarrator`.
