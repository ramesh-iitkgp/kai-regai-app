# Kai RegAI — Multi-Dimensional Confidence Model

## 1. Architectural Philosophy: Decoupled Confidence

Conventional AI applications often present users with a single, opaque "AI Confidence: 94%" score. This metric conflates signal clarity with interpretive certainty.

In **Kai RegAI**, confidence is explicitly partitioned into **four independent dimensions**:

```
[Camera Sensor & Segmentation]  ──>  1. Computer Vision Confidence (CV_CONF)
[Scholarly Literature Hierarchy] ──>  2. Source Authority Confidence (SRC_CONF)
[Multi-Tradition Agreement]     ──>  3. Traditional Consensus Score (CONSENSUS_CONF)
[Combined Systemic Weight]      ──>  4. Overall Interpretation Support (INTERP_CONF)
```

**Non-Negotiable Rule**: Never collapse these distinct epistemological vectors into a single arbitrary percentage.

---

## 2. The Four Confidence Dimensions

### Dimension 1: Computer Vision Confidence ($C_{\text{cv}} \in [0.0, 1.0]$)
* **Definition**: The statistical certainty that a physical feature actually exists on the photographed hand.
* **Calculated From**:
  * Segmentation ridge-filter response intensity.
  * 21-landmark tracking jitter and reprojection error.
  * Image quality metrics (Laplacian blur variance, illumination histogram balance, glare ratio).
* **Threshold Gates**:
  * $C_{\text{cv}} \ge 0.85$: High confidence; proceed directly to rule engine.
  * $0.65 \le C_{\text{cv}} < 0.85$: Moderate confidence; mark observation as `PARTIAL` or trigger user confirmation in Mode 2.
  * $C_{\text{cv}} < 0.65$: Low confidence; suppress feature from automated interpretation to prevent hallucinated readings.

### Dimension 2: Source Authority Score ($C_{\text{src}} \in [0.0, 1.0]$)
* **Definition**: The scholarly and historical weight of the cited literature supporting a rule.
* **Derived from Source Authority Hierarchy**:
  * **Level 1 (Primary Classical / Critical Edition)**: $1.00$ (e.g. *Pāṇilekhā*, *Bṛhat Saṃhitā*)
  * **Level 2 (Scholarly Indological Study)**: $0.95$ (e.g. Zysk critical studies)
  * **Level 3 (Foundational Historical Text)**: $0.90$ (e.g. Benham 1901, Cheiro 1916)
  * **Level 4 (Established Modern Reference)**: $0.80$ (e.g. Shrimali, Ojha, Ayer)
  * **Level 5 (Modern Practitioner Monograph)**: $0.60$ (requires corroboration)
  * **Level 6 & 7 (Web / Unverified)**: $0.00$ (disallowed)

### Dimension 3: Traditional Consensus Score ($C_{\text{con}} \in [0.0, 1.0]$)
* **Definition**: The degree of alignment across independent historical schools and traditions.
* **Categorical Mapping**:
  * `MULTI_SOURCE_CROSS_TRADITION_AGREEMENT`: $1.00$ (Both Indian and Western masters share identical conclusion).
  * `MULTI_SOURCE_SINGLE_TRADITION`: $0.85$ (Multiple Indian or multiple Western sources agree internally).
  * `SINGLE_AUTHORITATIVE_SOURCE`: $0.70$ (Documented in one high-level treatise without contradiction).
  * `TRADITION_CONFLICT`: $0.50$ (Active disagreement requiring perspectival mediation).

### Dimension 4: Final Interpretation Support Score ($C_{\text{int}} \in [0.0, 1.0]$)
* **Definition**: The overall epistemic confidence that Kai RegAI can support the generated insight for this specific user.
* **Mathematical Formulation**:
  $$C_{\text{int}} = C_{\text{cv}} \times \left( w_1 C_{\text{src}} + w_2 C_{\text{con}} \right)$$
  *(where weights $w_1 = 0.50, w_2 = 0.50$, subject to normalization)*
* **Safety Property**: If CV confidence is zero (the feature was not observed), the final interpretation score is strictly zero, regardless of how ancient or revered the textual source is.

---

## 3. Machine-Readable Confidence Payload Contract

Every matched interpretation rule emitted to the AI Layer includes the full confidence tuple:

```json
{
  "rule_id": "RULE-LIFE-0042",
  "feature_target": "lines.life_line.curvature_profile",
  "confidence_profile": {
    "cv_detection_confidence": 0.94,
    "source_authority_score": 0.95,
    "traditional_consensus_score": 1.00,
    "overall_interpretation_support": 0.916,
    "flags": ["HIGH_CERTAINTY", "CROSS_TRADITION_CONSENSUS"]
  }
}
```

---

## 4. UI Presentation Guidelines

* In the user-facing report, raw decimals are translated into transparent qualitative badges:
  * $C_{\text{int}} \ge 0.88$: *"Strongly Evident in Your Hand & Broadly Supported Across Traditions"*
  * $0.75 \le C_{\text{int}} < 0.88$: *"Moderately Evident & Sourced from Classical Texts"*
  * Sourced from a single tradition: *"Unique Insight from Classical Hasta Samudrika"*
