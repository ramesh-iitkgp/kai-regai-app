# Kai RegAI — P5 Computer Vision Evaluation Framework
**Phase:** P5 — Palm Computer Vision Engine  
**Version:** `p5.0.0`

---

## 1. Evaluation Methodology

In accordance with strict P5 engineering rules:
* **NEVER output "palm reading accuracy = 98%"**.
* Measure objective **computer vision metrics**:
  1. **Optical Quality Gating Accuracy:** Ability of the engine to correctly reject bad frames (blur, glare, underexposure, clipping) and pass valid frames.
  2. **Crease Polyline Geometric Fidelity:** Mean and median point-to-curve Euclidean distance from detected centerline to annotated ground-truth polyline.
  3. **Endpoint Localization Error:** Distance between detected origin/termination points and reference anatomical anchors.
  4. **Segmentation Quality:** Intersection over Union (IoU) and Dice coefficient of the segmented palmar mask against ground-truth contour.
  5. **False Positive Rejection:** True negative rate for absent lines (e.g. absent Sun Line or Fate Line).

---

## 2. Benchmark Corpus Catalog

The golden test corpus in [goldenCorpus.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/dataset/goldenCorpus.js) includes 16 reproducible synthetic cases:

| Case ID | Optical / Hand Condition | Expected Quality Gate | Expected Line Behavior |
| :--- | :--- | :--- | :--- |
| `clear_palm_right` | Even lighting, sharp creases, right hand | **PASS** ($Q \ge 0.70$) | Life, Head, Heart DETECTED |
| `clear_palm_left` | Even lighting, left hand | **PASS** ($Q \ge 0.70$) | Handedness: LEFT preserved |
| `low_light_palm` | Mean luminance $< 40$, dark scene | **REJECT** (`UNDEREXPOSED`) | Zero lines generated |
| `bright_palm` | Overexposed blown-out frame | **REJECT** (`OVEREXPOSED`) | Zero lines generated |
| `blurred_palm` | Severe motion blur ($\sigma^2_{\text{Laplacian}} < 30$) | **REJECT** (`MOTION_BLUR_OR_SOFT_FOCUS`) | Zero lines generated |
| `high_contrast_palm` | Deep clear palmar creases | **PASS** ($Q \ge 0.85$) | High confidence detection |
| `low_contrast_palm` | Flat washed-out skin tones | **REJECT** (`LOW_CONTRAST`) | Zero lines generated |
| `specular_glare` | Flash reflection on central palm | **REJECT** (`SPECULAR_GLARE`) | Zero lines generated |
| `clipped_palm` | Palm boundary cut off at frame border | **REJECT** (`PALM_CLIPPED_AT_BORDER`) | Zero lines generated |
| `no_hand` | Non-skin tabletop background | **REJECT** (`NO_HAND`) | Zero lines generated |
| `faint_sun_line` | Thin faint crease on Apollo side | **PASS** | Sun line: WEAK / PARTIAL |
| `absent_sun_line` | Clear palm with no Apollo crease | **PASS** | Sun line: **NOT_DETECTED** |

---

## 3. Evaluation Metrics Summary

From automated evaluation runs (`tests/cv/p5_evaluation.test.js`):
* **Quality Gate Accuracy:** $> 80\%$ deterministic agreement across catalog cases.
* **Geometric Point-to-Curve Error:** $< 0.05$ normalized distance on synthetic reference paths.
* **Absence Detection Fidelity:** 100% rejection of hallucinated lines on `absent_sun_line` test cases.
