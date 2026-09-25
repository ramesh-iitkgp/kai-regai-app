# P14 Dataset Specification — Real-Palm Golden Corpus

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P14 — Real-Palm Dataset & Accuracy Validation  
**Dataset Version:** 1.0.0  
**Protocol Version:** 1.0.0  
**Status:** FROZEN & CERTIFIED  

---

## 1. Executive Overview & Purpose

The P14 Real-Palm Golden Corpus provides an immutable, privacy-safe, statistically representative benchmark dataset to measure the accuracy, robustness, and failure boundaries of the Kai RegAI palm computer vision engine (frozen P5/P5.1/P5.2 baseline) across real-world mobile capture conditions.

In accordance with Phase P14 non-negotiable principles:
- **Measure First, Modify Second**: The dataset establishes quantitative measurement baselines before any algorithmic remediation is considered.
- **Store the Reading, Not the Person**: All samples are strictly anonymized with synthetic, non-semantic IDs (`PALM-0001` through `PALM-0032`). Zero personally identifiable information (PII) or unencrypted biometric templates are stored.
- **Isolation of Final Test Split**: Test sets remain completely isolated from parameter/threshold tuning.

---

## 2. Dataset Storage Architecture

The dataset is organized in a controlled, versioned directory tree located at `cv/real-validation/dataset/`:

```text
cv/real-validation/dataset/
├── images/                  # Real mobile palm captures and portrait JPEG test images
│   ├── PALM-0001.jpg
│   ├── PALM-0002.jpg
│   └── ... (PALM-0032.jpg)
├── annotations/             # Manually verified ground truth polylines and metadata
│   ├── PALM-0001.annotation.json
│   ├── PALM-0002.annotation.json
│   └── ... (PALM-0032.annotation.json)
├── manifests/               # Machine-readable dataset manifest
│   └── manifest.json
├── splits/                  # Partitioning indices (DEVELOPMENT, CALIBRATION, FINAL_TEST)
│   └── splits.json
└── reports/                 # Machine-readable evaluation outputs
    └── p14_metrics.json
```

---

## 3. Privacy & Biometric Safeguards

Strict biometric privacy constraints are enforced:
1. **Anonymous Dataset IDs**: Samples use the standardized format `PALM-XXXX` (`PALM-0001` to `PALM-0032`).
2. **Zero PII**: No names, email addresses, phone numbers, location data, or account identifiers are stored.
3. **No Unencrypted Biometrics**: Only normalized structural feature polylines ($x, y \in [0, 1]$) and qualitative morphological descriptors are preserved.
4. **LocalRAM Processing**: The evaluation harness operates strictly on local file buffers without network transmission or external telemetry leakage.

---

## 4. Dataset Splits & Isolation Protocol

The 32 golden palm samples are strictly partitioned into three disjoint splits:

| Split Name | Sample Count | Percentage | Purpose | Modification Policy |
| :--- | :---: | :---: | :--- | :--- |
| **DEVELOPMENT** | 5 | 15.6% | Algorithm sanity check, rapid diagnostics | Free inspection |
| **CALIBRATION** | 11 | 34.4% | Threshold verification, quality boundary tuning | Inspection during design |
| **FINAL_TEST** | 16 | 50.0% | Unbiased, blinded production accuracy gate | **FROZEN & ISOLATED** |

### No Test-Set Tuning Rule
Under no circumstances may thresholds or classifier parameters be tuned against `FINAL_TEST` samples. Any rerun following parameter tuning invalidates the benchmark.

---

## 5. Dataset Diversity & Stratification Inventory

### 5.1 Handedness Distribution
- **Right Hands**: 18 samples (56.25%)
- **Left Hands**: 14 samples (43.75%)
- Ratio preserves balance without assuming bilateral symmetry.

### 5.2 Resolution & Aspect Ratio Distribution
All images are captured in natural upright portrait orientation ($H \ge W$) corresponding to mobile camera sensors:
- **720 × 1280 (HD Portrait)**: 28 samples (87.5%)
- **576 × 1024 (Mobile Low)**: 2 samples (6.25%)
- **1440 × 2560 (QHD Portrait)**: 2 samples (6.25%)

### 5.3 Optical Quality Tiers
- **GOOD**: 17 samples (53.1%) — High contrast, sharp focus, optimal framing.
- **ACCEPTABLE**: 8 samples (25.0%) — Moderate contrast, slight motion blur, natural skin texture.
- **DIFFICULT**: 4 samples (12.5%) — Strong shadows, micro-wrinkles, faded creases.
- **PARTIAL**: 2 samples (6.3%) — Partial palm margin crop (wrist or radial edge cropped).
- **FAILURE**: 1 sample (3.1%) — Out-of-frame anatomy or severe optical blur.

### 5.4 Lighting Conditions
- **EVEN**: 28 samples (87.5%) — Diffuse ambient indoor/outdoor daylight.
- **LOW**: 1 sample (3.1%) — Under-exposed capture (<30 lux equivalent).
- **HARSH**: 1 sample (3.1%) — Direct directional light with specular hotspots.
- **GLARE**: 1 sample (3.1%) — Strong localized specular reflection across mounts.
- **BACKLIT**: 1 sample (3.1%) — Background brighter than foreground palm.

### 5.5 Hand Orientation & Tilt
- **0° to 10°**: 30 samples (93.75%) — Upright within typical mobile capture guide.
- **20° to 30°**: 1 sample (3.1%) — Moderate tilt testing angle compensation.
- **45° to 60°**: 1 sample (3.1%) — Severe tilt testing RetakeDecisionEngine rejection.

---

## 6. Manifest Schema Reference

Each entry in `cv/real-validation/dataset/manifests/manifest.json` conforms to:

```json
{
  "imageId": "PALM-0001",
  "split": "DEVELOPMENT",
  "handedness": "RIGHT",
  "resolution": {
    "width": 720,
    "height": 1280
  },
  "qualityCategory": "GOOD",
  "lighting": "EVEN",
  "tiltDegrees": 0,
  "scaleCategory": "OPTIMAL",
  "edgeCase": "Baseline real mobile phone capture #1",
  "lineStatuses": {
    "life": "PRESENT",
    "head": "PRESENT",
    "heart": "PRESENT",
    "fate": "ABSENT",
    "sun": "ABSENT"
  }
}
```

---

## 7. Versioning & Governance

- **Dataset Spec Version**: `1.0.0`
- **Git Commit Baseline**: `56de5bf`
- Future expansions must increment the dataset version (`1.1.0`) and append new records with monotonically increasing IDs without modifying or re-indexing frozen baseline samples (`PALM-0001` through `PALM-0032`).
