# P8 Epistemic Safety Gates & Ethics Specification

## 1. Ethical Mission & Boundaries

Kai RegAI is built strictly for personal reflection, cultural appreciation of traditional palmistry, and psychological contemplation. It is **NOT** fortune-telling, medical diagnosis, financial counseling, or deterministic fate.

The `EpistemicGate` (`src/interpretation/EpistemicGate.js`) acts as the final mandatory firewall before any text or structured dossier is delivered to the client layer.

---

## 2. Forbidden Claims Taxonomy

The Epistemic Gate screens all rule outputs, syntheses, and dossier chapters against three zero-tolerance violation categories:

### 2.1 Category A: Fatalistic & Future-Deterministic Predictions
Traditional folklore occasionally contains fatalistic predictions of doom, divorce, or exact lifespans. Kai RegAI strictly forbids all such claims.
* **Forbidden Examples**:
  * ❌ *"You will live until age 78."*
  * ❌ *"You are destined to divorce twice."*
  * ❌ *"You will experience a catastrophic accident in your 40s."*
  * ❌ *"Guaranteed great wealth is in your future."*
  * ❌ *"You cannot avoid this misfortune."*
* **Remediation / Safe Reframing**:
  * Reframe determinism into reflective personal orientation:
  * ✅ *"Traditional palmistry associates deep crease continuity with constitutional resilience and vitality flow."*
  * ✅ *"Classical sources interpret this marking as a call toward intentional career focus and self-discipline."*

### 2.2 Category B: Medical Diagnoses & Clinical Health Claims
Palmistry must never mimic or replace medical or psychiatric evaluation.
* **Forbidden Examples**:
  * ❌ *"Heart line shows cardiac weakness or artery blockage."*
  * ❌ *"Island on the head line indicates clinical depression or neurological disease."*
  * ❌ *"Gastrointestinal disorder detected in the lower palm."*
* **Remediation**:
  * Medical claims are blocked unconditionally. Rules containing biological diagnostics are purged from the Codex.

### 2.3 Category C: False Epistemic Certainty
Presenting speculative traditional beliefs as verified empirical or scientific facts.
* **Forbidden Examples**:
  * ❌ *"Science proves that your palm lines dictate your soulmate."*
  * ❌ *"It is certain that you possess psychic powers."*
* **Remediation**:
  * Explicit traditional framing: *"In traditional Indian palmistry (Hasta Samudrika)..."*, *"According to Western classical palmistry..."*.

---

## 3. Epistemic Gate Implementation Mechanics

1. **Pre-Evaluation Static Verification**:
   The `CodexValidator` scans all rule text during startup to ensure no fatalistic or medical patterns exist in the Knowledge Codex.
2. **Runtime Dossier Filter**:
   The `EpistemicGate.validate(dossier)` inspects all synthesized strings, titles, summaries, and evidence labels:
   * Rejects texts containing regex patterns:
     `/\b(you will die|fatal|inevitable death|destined to divorce|guaranteed wealth|diagnos|heart disease|cancer|stroke)\b/i`
   * Flags and sanitizes certainty assertions:
     `/\b(guaranteed|certainly will|undeniably destined)\b/i` $\rightarrow$ transformed to conditional framing (*"traditionally associated with"*, *"often viewed as an indicator of"*).
3. **Audit Trail**:
   Any detected safety intervention logs an entry in `dossier.metadata.safetyInterventions` for developer review.
