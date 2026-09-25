# Kai RegAI — P5 Computer Vision Architecture
**Product:** Kai RegAI  
**Phase:** P5 — Palm Computer Vision Engine  
**Version:** `p5.0.0`  
**Status:** COMPLETE & VERIFIED

---

## 1. Architectural Mission & Invariants

The Kai RegAI Palm Computer Vision Engine extracts geometric, topological, and structural palm crease polylines directly from photographs and video frames.

### Non-Negotiable Invariants:
1. **P4 UI Freeze Preserved:** The P4 presentation layer (`src/screens/`, `src/components/`, `tokens.css`) remains decoupled. The vision engine communicates strictly via view-model adapters and typed data structures.
2. **Real Crease Evidence Only:** No simulated SVG paths or fixed templates. A line is represented by a polyline if and only if verifiable multi-scale ridge/valley evidence exists in the image. If evidence is insufficient, the line returns `status: "NOT_DETECTED"` with an empty polyline `[]`.
3. **No Multimodal Vision LLM Anti-Pattern:** Camera frames are processed locally by the on-device CV engine. Raw hand imagery is NEVER passed directly to an LLM to generate readings.
4. **Zero Palmistry Interpretation in CV:** The engine outputs mathematical coordinates, curvatures, continuity metrics, contrast values, and confidence scores. It contains zero personality, fatalistic, astrological, or medical interpretations.
5. **Quality vs. Accuracy Separation:** The engine score $Q \in [0, 1]$ measures **optical capture quality** (sharpness, lighting, contrast, glare, framing), NEVER "reading accuracy" or "fortune-telling certainty".

---

## 2. End-to-End Pipeline Architecture

```text
CAMERA FRAME / IMAGE BUFFER
           ↓
[ 1. Image Ingestion & Input Normalization ]
     - Clamps resolution to max 1024px
     - Validates buffer integrity & aspect ratio
     - ITU-R BT.601 luminance extraction (Y = 0.299R + 0.587G + 0.114B)
           ↓
[ 2. Image Quality Gate (ImageQualityAnalyzer) ]
     - Laplacian variance sharpness (motion/focus blur)
     - Dynamic range & contrast standard deviation
     - Specular glare saturation check
     - Per-border framing clearance (top, bottom, left, right)
     - Gate: passed == true? (If false → status: RECAPTURE_REQUIRED)
           ↓
[ 3. Hand Detection & Landmark Localization (HandDetector) ]
     - Hand presence & skin-chrominance boundary
     - Handedness classification (LEFT vs RIGHT)
     - 21-point canonical anatomical landmarks (Wrist 0 to Fingertips)
           ↓
[ 4. Palm Segmentation & Rectification (PalmSegmentation) ]
     - Palmar ROI isolation (excluding distal fingers & lower wrist)
     - Anatomical orientation angle θ (Wrist 0 → Middle MCP 9)
     - Inverse rotation into canonical 512×512 square patch
     - Inner palmar falloff mask (excluding outer circumference boundary)
           ↓
[ 5. Multi-Scale Crease Enhancement (CreaseEnhancementEngine) ]
     - Contrast Limited Adaptive Histogram Equalization (CLAHE)
     - Multi-scale Gaussian 2nd derivative / Hessian ridge filter:
       * Fine scale (σ = 1.0, weight = 0.25)
       * Medium scale (σ = 2.0, weight = 0.50)
       * Coarse scale (σ = 3.5, weight = 0.25)
     - Maximum eigenvalue λ₂ directional valley response
     - Scale-space normalized confidence map [0, 1]
           ↓
[ 6. Crease Candidate Graph & Skeletonization (CreaseCandidateGraph) ]
     - Adaptive binarization
     - Zhang-Suen morphological thinning (1-pixel centerlines)
     - Graph traversal from branch nodes & endpoints
     - Spur pruning (< 12px)
     - Douglas-Peucker polyline simplification
           ↓
[ 7. Major Line Classification (MajorLineClassifier) ]
     - Anatomical search priors (Life, Head, Heart, Fate, Sun)
     - Trajectory orientation & minimum span gating
     - Multi-signal scoring (prior agreement + continuity + contrast)
     - Honest NOT_DETECTED designation for absent/faint lines
           ↓
[ 8. Model & Presentation Adapters ]
     - PalmFeatureModelAdapter → canonical PalmFeatureModel
     - SVG Polyline Generator → PalmLineOverlay (360×450 viewBox)
```

---

## 3. Module Boundaries & Implementation Map

| Subsystem | Source Path | Responsibilities |
| :--- | :--- | :--- |
| **Canonical Types** | [src/cv/types.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/types.js) | Standard contracts: `PalmVisionResult`, `MajorPalmLine`, `ImageQualityResult`, `PalmROI`. |
| **Configuration** | [src/cv/config/defaultConfig.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/config/defaultConfig.js) | Externalized thresholds for sharpness, illumination, scales, and anatomical priors. |
| **Ingestion** | [src/cv/image/ImageIngestion.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/image/ImageIngestion.js) | Bilinear downsampling, grayscale conversion, orientation metadata preservation. |
| **Quality Engine** | [src/cv/image/ImageQualityAnalyzer.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/image/ImageQualityAnalyzer.js) | Discrete Laplacian variance, specular glare fraction, per-border framing density. |
| **Hand Detector** | [src/cv/detection/HandDetector.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/detection/HandDetector.js) | Dual-tier detector: external landmark provider + native skin-locus contour fallback. |
| **Segmentation** | [src/cv/detection/PalmSegmentation.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/detection/PalmSegmentation.js) | Wrist-to-MCP9 angle rectification, 512×512 patch extraction, inner palmar mask. |
| **Enhancement** | [src/cv/crease/CreaseEnhancementEngine.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/crease/CreaseEnhancementEngine.js) | CLAHE (8×8 grid) + multi-scale Hessian 2nd-derivative valley response. |
| **Topology** | [src/cv/crease/CreaseCandidateGraph.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/crease/CreaseCandidateGraph.js) | Zhang-Suen thinning, endpoint path tracing, Douglas-Peucker simplification. |
| **Classifier** | [src/cv/crease/MajorLineClassifier.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/crease/MajorLineClassifier.js) | Anatomical search priors, directional span validation, NOT_DETECTED enforcement. |
| **Orchestrator** | [src/cv/adapters/PalmVisionEngine.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/adapters/PalmVisionEngine.js) | High-level API facade, stage execution profiling, structured error gates. |
| **Model Adapter** | [src/cv/adapters/PalmFeatureModelAdapter.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/adapters/PalmFeatureModelAdapter.js) | Converts `PalmVisionResult` to canonical `PalmFeatureModel` and SVG paths. |
| **Golden Corpus** | [src/cv/dataset/goldenCorpus.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/dataset/goldenCorpus.js) | 16 reproducible synthetic test cases covering difficult optical conditions. |
| **Evaluator** | [src/cv/dataset/Evaluator.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/dataset/Evaluator.js) | Hausdorff distance, endpoint localization error, segmentation IoU & Dice. |

---

## 4. Quality Gate & Failure Contract

When input frames do not meet strict optical quality thresholds, the engine guarantees **zero false positive lines**:
```json
{
  "status": "RECAPTURE_REQUIRED",
  "imageQuality": {
    "score": 0.42,
    "sharpness": 0.15,
    "passed": false,
    "reasons": ["MOTION_BLUR_OR_SOFT_FOCUS"],
    "recommendations": ["Hold your hand and phone steady until focus locks."]
  },
  "lines": {
    "life": { "status": "NOT_DETECTED", "polyline": [] },
    "head": { "status": "NOT_DETECTED", "polyline": [] },
    "heart": { "status": "NOT_DETECTED", "polyline": [] },
    "fate": { "status": "NOT_DETECTED", "polyline": [] },
    "sun": { "status": "NOT_DETECTED", "polyline": [] }
  }
}
```
