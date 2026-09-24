# Kai RegAI — Retrieval-Augmented Generation (RAG) Architecture

## 1. Core Retrieval Mandate: Structured Knowledge Over Book Stuffing

A critical architectural constraint in Kai RegAI is that **we do not dump entire books or uncurated text chunks into an LLM context window**.

The RAG Layer in Kai RegAI is a **deterministic, metadata-driven retrieval pipeline** that pulls structured rule records from the Knowledge Base based on verified user features, selected traditions, and requested report chapters.

```
+----------------------------------------------------------------------------------------------------+
|                                    KAI REGAI RAG PIPELINE                                          |
|                                                                                                    |
|  [Input: Verified PalmFeatureModel + Requested Report Domain]                                      |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Deterministic Query Compiler]                                                                    |
|  (e.g., SELECT rules WHERE feature IN hand.features AND tradition = 'HASTA_SAMUDRIKA')             |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Ranked Candidate Knowledge Set]                                                                  |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Conflict & Precedence Pruning] (Pattern rules suppress standalone; conflicts mediated)          |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Compact Assembled InterpretationContext JSON] (< 1,200 tokens)                                   |
|         │                                                                                          |
|         ▼                                                                                          |
|  [Guardrailed Prompt Injection ──> LLM Synthesis ──> Narrative Chapter]                            |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Multi-Vector Query Formulation

Retrieval queries are formed dynamically using four categorical axes:

1. **Target Feature Paths**: e.g., `lines.head_line`, `mounts.jupiter`, `thumb.flexibility_distal`
2. **Feature Values / Morphologies**: e.g., `GENTLE_SLOPE`, `WELL_DEVELOPED`, `SUPPLE`
3. **Active Traditions**: e.g., `["CLASSICAL_INDIAN", "WESTERN_HISTORICAL"]`
4. **Target Report Domain**: e.g., `INTELLECT_AND_COMMUNICATION` or `VOCATION_AND_PURPOSE`

### Example RAG Query:
```json
{
  "query_scope": "CHAPTER_GENERATION",
  "domain": "INTELLECT_AND_COMMUNICATION",
  "features": [
    { "path": "lines.head_line.curvature_profile", "value": "GENTLE_SLOPE" },
    { "path": "lines.head_line.origin_relation_to_life", "value": "SLIGHT_CONTACT" },
    { "path": "fingers.index.length_relative_to_ring", "value": "INDEX_FINGER_LONGER" }
  ],
  "traditions": ["CLASSICAL_INDIAN", "WESTERN_HISTORICAL"],
  "max_rules_to_retrieve": 4
}
```

---

## 3. Context Assembling & Token Budgeting

Rather than passing raw book prose, the retrieval engine packages matched rules into an ultra-dense, factual **Prompt Context Payload**:

```json
{
  "context_header": {
    "reading_type": "MODE_2_GUIDED_PALM_DOSSIER",
    "chapter": "THE_ARCHITECTURE_OF_THOUGHT",
    "subject": "Dominant Right Hand"
  },
  "verified_evidence_items": [
    {
      "rule_id": "RULE-HEAD-0014",
      "source_id": "SRC-WST-001",
      "tradition": "Western Classical (Benham)",
      "core_fact": "Head line gently sloping towards Luna mount indicates creative pragmatism—balancing linear analysis with imaginative ideation.",
      "tone_direction": "Engaging, stimulating, celebrating versatility"
    },
    {
      "rule_id": "RULE-IND-JUP-003",
      "source_id": "SRC-IND-001",
      "tradition": "Classical Indian (Pāṇilekhā / Bṛhat Saṃhitā)",
      "core_fact": "Index finger commanding strong height and upright stature signifies Guru/Jupiter blessing of natural counsel, high discernment, and ethical ambition.",
      "tone_direction": "Grounded, affirming, encouraging mentorship"
    }
  ],
  "safety_constraints": [
    "NO_FATALISM",
    "NO_MEDICAL_OR_LIFESPAN_CLAIMS",
    "NO_FINANCIAL_GUARANTEES"
  ]
}
```

* **Token Efficiency & Latency Governance**:
  * By injecting curated rule abstractions instead of raw pages, the prompt context is designed to remain under **1,200 tokens**.
  * **Latency Performance Specification**:
    * **TARGET**: Sub-2-second end-to-end prompt assembly and retrieval.
    * **MEASUREMENT METHOD**: Server-side request timestamp to assembled context payload generation metric (excluding external LLM inference roundtrip).
    * **BENCHMARK DATASET**: 500 synthetic canonical `PalmFeatureModel` profiles covering edge-case feature counts (1 to 25 features).
    * **ACCEPTANCE THRESHOLD**: $p95 \le 2.0\text{ seconds}$ on standard backend node instances.
    * **ACTUAL RESULT**: `STATUS = TARGET_NOT_YET_BENCHMARKED` (Benchmarking scheduled for Phase P9 / P13).


## 4. Internal Provenance & Audit Retention

Even though the user-facing report is presented in smooth, flowing prose without academic footnotes, **the internal system permanently attaches the exact retrieval chain to every saved report record**:

```json
{
  "report_id": "REP-2026-09-8812",
  "generated_chapter": "The Architecture of Thought",
  "provenance_chain": [
    {
      "paragraph_index": 1,
      "grounded_in_rule": "RULE-HEAD-0014",
      "literature_citation": "William G. Benham, The Laws of Scientific Hand Reading (1901), pp. 230-234",
      "source_authority_tier": "LEVEL_3"
    },
    {
      "paragraph_index": 2,
      "grounded_in_rule": "RULE-IND-JUP-003",
      "literature_citation": "Varāhamihira, Bṛhat Saṃhitā (Ch. 68), verse 34",
      "source_authority_tier": "LEVEL_1"
    }
  ]
}
```

This ensures that any claim in a generated reading can be audited and verified down to the specific verse or page of researched literature.
