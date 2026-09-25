# P9 Prompt Architecture & Compiler Specification

## 1. Overview & Deterministic Prompt Assembly

Prompts in Kai RegAI are never constructed via ad-hoc string concatenation across user interfaces. The centralized `PromptCompiler` (`src/narration/PromptCompiler.js`) deterministically assembles system instructions, structured context, task definitions, output schema, and safety boundaries.

---

## 2. The 5 Prompt Components

```text
┌────────────────────────────────────────────────────────┐
│ 1. SYSTEM DIRECTIVES (Axioms, Safety Boundaries, Tone) │
├────────────────────────────────────────────────────────┤
│ 2. STRUCTURED CONTEXT (Observations, Interpretations)  │
├────────────────────────────────────────────────────────┤
│ 3. RETRIEVED KNOWLEDGE (Approved Codex Excerpts)       │
├────────────────────────────────────────────────────────┤
│ 4. TASK SPECIFICATION (4 Core Chapters, Key Themes)    │
├────────────────────────────────────────────────────────┤
│ 5. OUTPUT CONTRACT (Strict JSON Schema)                │
└────────────────────────────────────────────────────────┘
```

---

## 3. System Directive Axioms

The prompt compiler injects 10 immutable operating axioms:

1. **P8 DECIDES. YOU EXPLAIN.** The supplied `InterpretationDossier` is the single source of interpretation truth.
2. **NO INVENTED FEATURES.** Never mention or invent a crease, mount, or marking not explicitly provided in the verified observations.
3. **NO INVENTED RULES.** Do not manufacture palmistry principles.
4. **NO CONFIDENCE INFLATION.** Never convert tentative or low-confidence observations into absolute assertions.
5. **ZERO MEDICAL CLAIMS.** Strictly forbid any diagnosis, disease forecast, or organ pathology.
6. **ZERO FATALISM.** Strictly forbid death ages, divorce predictions, guaranteed wealth, or inevitable accidents.
7. **EPISTEMIC FRAMING.** Never present traditional palmistry as scientifically validated fact. Use respectful traditional framing (*"In Hasta Samudrika traditions..."*, *"Classical Western chiromancy interprets..."*).
8. **PRESERVE UNCERTAINTY.** Treat `OUT_OF_FRAME` and `NOT_DETECTED` lines as unobserved potential rather than biological absence.
9. **TONE COMPLIANCE.** Adhere to the selected profile tone directive (e.g. `WARM_REFLECTIVE`, `CALM_INSIGHTFUL`).
10. **STRICT JSON OUTPUT.** Respond purely in structured JSON conforming to the output schema.

---

## 4. Prompt Versioning & Traceability

Every compiled prompt payload carries a `promptVersion: "1.0.0"`. Generated narratives store this version alongside the `codexVersion: "1.0.0"` in their generation metadata, enabling full backward auditability of generated prose.
