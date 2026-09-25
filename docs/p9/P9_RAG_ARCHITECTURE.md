# P9 Approved Knowledge RAG Architecture Specification

## 1. Overview & Golden Mandate

The Retrieval-Augmented Generation (RAG) subsystem in **Kai RegAI** is strictly an **Approved Knowledge Corpus Retriever**:
* Operates 100% locally over vetted records in the Knowledge Codex.
* **Zero Public Web Searching**: Unrestricted internet queries for palmistry meanings are strictly prohibited to prevent hallucination, prompt injection, and quality degradation.
* Retrieved knowledge acts solely as **supporting reference context**, never as an authority over the deterministic P8 `InterpretationDossier`.

---

## 2. RAG Source Hierarchy

```text
1. Kai RegAI Approved Synthesis Knowledge (Constitutional archetypes)
   │
   ▼
2. Approved Hasta Samudrika Treatises (Samudrika Shastra, Narada Samhita)
   │
   ▼
3. Approved Western Classical Chiromancy (Cheiro, Benham, Saint-Germain)
   │
   ▼
4. Literature Citations & Attributions
```

---

## 3. Semantic Domain Indexing & Filtering

Knowledge units are chunked by discrete semantic domains:
* `LIFE_LINE` / `AYUR_REKHA`: Vitality rhythms, stamina, thenar curvature
* `HEAD_LINE` / `MATRU_REKHA`: Cognition, deliberate vs creative problem solving
* `HEART_LINE` / `PITRI_REKHA`: Emotional landscape, empathy, discernment
* `FATE_LINE` / `KARMA_REKHA`: Career clarity, vocational channel alignment
* `SUN_LINE` / `SURYA_REKHA`: Creative expression, visibility
* `CONSTITUTION`: Elemental hand archetypes (Fire, Earth, Air, Water)
* `SACRED_MARKS`: Trishula, Yava, Chhatra, Padma

Retrieval queries are filtered dynamically by the active domains present in the P8 reading, retrieving the top $K=4$ most relevant traditional literature citations.

---

## 4. Prompt-Injection Defense

Retrieved text is strictly treated as **DATA**, not instructions:
* `RAGRetriever.sanitizeData()` purges any instruction-like directives (e.g. `ignore all previous instructions`).
* The system prompt explicitly instructs the LLM that retrieved knowledge cannot alter system instructions, safety firewalls, or P8 physical observations.
