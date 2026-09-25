# P8 Confidence Model & Propagation Specification

## 1. Overview & Core Distinction

> **CONFIDENCE $\neq$ TRUTH**
> In Kai RegAI, a confidence score represents the mathematical certainty that a specific interpretation is supported by the physical palm observations and provenance evidence.
> It **never** represents the likelihood or scientific validity of traditional metaphysical claims.

---

## 2. Confidence Mathematical Model

The confidence engine calculates confidence at three levels:

### 2.1 Feature-Level Confidence ($C_{\text{feat}}$)
Derived from the computer vision detector quality score or questionnaire self-report certainty:
* Mode 1 CV: $C_{\text{feat}} = \text{clarity} \times \text{prominence} \times \text{framing\_stability} \in [0.4, 0.98]$
* Mode 2 Questionnaire: $C_{\text{feat}} = 0.95$ (direct tactile/visual self-inspection)

### 2.2 Rule-Matched Confidence ($C_{\text{rule}}$)
When a rule matches, its score is the geometric product of the rule's intrinsic base confidence $C_{\text{base}}$ and the minimum confidence of its required features:

$$C_{\text{rule}} = C_{\text{base}} \times \min_{f \in \text{conditions}}(C_f)$$

### 2.3 Aggregate Dossier Confidence ($C_{\text{agg}}$)
The overall reading session confidence synthesizes all collected evidence and the session quality score:

$$C_{\text{agg}} = 0.5 \times \left(\frac{1}{N}\sum_{i=1}^N C_{e_i}\right) + 0.5 \times Q_{\text{session}}$$

Where:
* $N$ is the count of valid evidence records ($N \ge 1$, otherwise $0.30$)
* $Q_{\text{session}}$ is the provenance quality score (defaulting to 0.85 if unmeasured)

---

## 3. Epistemic Confidence Bands

The continuous score $C_{\text{agg}} \in [0.0, 1.0]$ maps deterministically into 4 discrete Epistemic Bands:

| Band | Range | Interpretation Guarantee | UI Presentation |
| :--- | :---: | :--- | :--- |
| **`HIGH`** | $C \ge 0.85$ | Robust multi-feature verification with high capture clarity. | Green indicator, full traditional synthesis unlocked. |
| **`MODERATE`** | $0.65 \le C < 0.85$ | Adequate crease visibility or single-tradition predominance. | Cyan indicator, balanced reflective synthesis. |
| **`LOW`** | $0.45 \le C < 0.65$ | Faint lines, partial occlusion, or mild angle skew. | Amber indicator, notes observation uncertainty. |
| **`INSUFFICIENT_EVIDENCE`** | $C < 0.45$ | Out-of-frame features or major detection failure. | Muted indicator, invites retake or guided manual questions. |

---

## 4. Preservation of Observation Uncertainty

When evidence is missing or uncertain, the confidence engine clamps chapter scores and injects caveat metadata into the dossier:
* If $C_{\text{agg}} < 0.65$, `confidence.isConstrained` is set to `true`.
* User-facing text automatically appends nuance indicators (e.g. *"This reflection is based on partial crease clarity; subtle secondary branches were outside primary focal resolution."*).
