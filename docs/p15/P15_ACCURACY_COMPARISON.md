# P15 Accuracy Comparison & Statistical Evaluation

**Product:** Kai RegAI  
**Phase:** P15 — CV Recall Recovery & Real-Palm Accuracy Improvement  
**Corpus:** 32 Real Palms (`1.0.0`)  
**Frozen Baseline:** P14 Final Certification (`ac0c0e53887cb5bd55874c00c340a6c5a5a3733f`)

---

## 1. Full Dataset Master Comparison (32 Real Palms)

| Metric | P14 Frozen Baseline | P15 Certified Result | Absolute Change | Relative Change |
| :--- | :---: | :---: | :---: | :---: |
| **Life Precision** | `1.0000` | **`1.0000`** | `0.0000` | Preserved (0 FP) |
| **Life Recall** | `0.2813` | **`0.8438`** | `+0.5625` | **+200.0%** |
| **Life F1** | `0.4391` | **`0.9153`** | `+0.4762` | **+108.4%** |
| **Head Precision** | `0.9444` | **`0.9630`** | `+0.0186` | **+1.97%** |
| **Head Recall** | `0.5484` | **`0.8387`** | `+0.2903` | **+52.93%** |
| **Head F1** | `0.6939` | **`0.8966`** | `+0.2027` | **+29.21%** |
| **Heart Precision** | `0.9091` | **`0.9091`** | `0.0000` | Preserved |
| **Heart Recall** | `0.3333` | **`0.6667`** | `+0.3334` | **+100.0%** |
| **Heart F1** | `0.4878` | **`0.7693`** | `+0.2815` | **+57.71%** |
| **Fate False Positives** | `0` | **`0`** | `0` | Preserved (0 FP) |
| **Fate Specificity** | `1.0000` | **`1.0000`** | `0.0000` | Preserved |
| **Sun False Positives** | `0` | **`0`** | `0` | Preserved (0 FP) |
| **Sun Specificity** | `1.0000` | **`1.0000`** | `0.0000` | Preserved |
| **Life Mean Localization Error** | `0.1400` | **`0.1400`** | `0.0000` | Invariant |
| **Head Mean Localization Error** | `0.1800` | **`0.1600`** | `-0.0200` | Improved |
| **Heart Mean Localization Error**| `0.1400` | **`0.2100`** | `+0.0700` | Safe bound (<0.25) |
| **Temporal Jitter** | `0.0321` | **`0.0321`** | `0.0000` | Stable (<0.05) |
| **Confidence ECE** | `0.0787` | **`0.0931`** | `+0.0144` | Well within (<0.15) |
| **Mean Latency** | `54.20 ms` | **`52.70 ms`** | `-1.50 ms` | -2.77% (Faster) |
| **Median Latency** | `57.55 ms` | **`57.15 ms`** | `-0.40 ms` | Faster |
| **P95 Latency** | `97.69 ms` | **`82.51 ms`** | `-15.18 ms` | -15.54% (Faster) |
| **Memory Delta (25 iter)** | `+1.78 MB` | **`-3.39 MB`** | `-5.17 MB` | No leak detected |

---

## 2. Dataset Split Breakdown

### 2.1 DEVELOPMENT Split (5 Palms)
* **Life Line:** Recall = `1.0000` (5/5), Precision = `1.0000`
* **Head Line:** Recall = `1.0000` (4/4), Precision = `0.8000`
* **Heart Line:** Recall = `0.7500` (3/4), Precision = `0.7500`
* **Fate / Sun:** 0 False Positives, Specificity = `1.0000`

### 2.2 CALIBRATION Split (11 Palms)
* **Life Line:** Recall = `0.8182` (9/11), Precision = `1.0000`
* **Head Line:** Recall = `0.8182` (9/11), Precision = `1.0000`
* **Heart Line:** Recall = `0.7273` (8/11), Precision = `1.0000`
* **Fate / Sun:** 0 False Positives, Specificity = `1.0000`

### 2.3 PROTECTED FINAL TEST Split (16 Palms)
*The final test split was kept strictly isolated until the candidate configuration was frozen.*
* **Life Line:** Recall = **`0.8125`** (13/16), Precision = **`1.0000`** (0 false positives)
* **Head Line:** Recall = **`0.8125`** (13/16), Precision = **`1.0000`** (0 false positives)
* **Heart Line:** Recall = **`0.6000`** (9/15), Precision = **`0.9000`**
* **Fate / Sun:** **0 False Positives**, Specificity = **`1.0000`**

---

## 3. Analysis & Key Conclusions

1. **Recall Recovery:**
   * **Life Line recall tripled** from `0.2813` to `0.8438`, while maintaining **100% precision** across all 32 palms.
   * **Head Line recall surged** from `0.5484` to `0.8387`, with precision improving from `0.9444` to `0.9630`.
   * **Heart Line recall doubled** from `0.3333` to `0.6667`, with precision held at `0.9091`.
2. **Safety & False Positive Protection:**
   * Across the entire dataset, **0 false positives** were generated for Fate and Sun lines.
   * Epidermal micro-wrinkles did not trigger major line classifications.
3. **Runtime & Stability Invariants:**
   * P95 latency reduced from `97.69 ms` to `82.51 ms`, well beneath the real-time threshold.
   * Temporal jitter remained identical at `0.0321` (within 0.05 budget), guaranteeing zero visual flicker in live scanner tracking.
   * Confidence calibration remained robust with ECE at `0.0931` (budget < 0.15).
