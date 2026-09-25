# P9 Evidence Consistency Validation Specification

## 1. Overview & Core Mission

The `EvidenceConsistencyChecker` (`src/narration/EvidenceConsistencyChecker.js`) is the primary anti-hallucination barrier between the AI narration layer and the user. It guarantees that every statement made in generated prose is rooted in real physical observations verified in the P8 `InterpretationDossier`.

---

## 2. Verification Protocol

The checker evaluates generated narratives across three strict criteria:

### 2.1 Anti-Hallucination on Unobserved Lines
If a major line is flagged in P8 as `OUT_OF_FRAME` or `NOT_DETECTED`:
* The narrative is strictly forbidden from claiming that the line is deep, continuous, clear, or definitively indicative of an established character trait.
* Violation: If text states *"Your Fate Line is deep and continuous"*, while P8 marks Fate Line as `OUT_OF_FRAME`, the response is immediately rejected and the engine triggers `DeterministicNarrator`.

### 2.2 Confidence Inflation Protection
* Formally: $\text{Narration Confidence} \le \text{P8 Evidence Confidence}$.
* When P8 assigns a `LOW` or `INSUFFICIENT_EVIDENCE` confidence band, narrative text cannot use absolute certainty terms (*"undeniably"*, *"proves beyond doubt"*, *"guarantees"*).
* Such language is flagged as confidence inflation, triggering fallback.

### 2.3 Section Evidence Traceability
* Every section's `evidenceRefs` must resolve to real feature paths or matched rule IDs present in `dossier.evidence`.
* Unsupported references are flagged as ungrounded claims.

---

## 3. Fallback Policy

If any check in the consistency verification protocol fails:
> **DO NOT DISPLAY THE GENERATED NARRATIVE.**
> Immediately fall back to the deterministic P8 wording rendered by `DeterministicNarrator.js`.
