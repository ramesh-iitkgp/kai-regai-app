# Kai RegAI — Computer Vision (CV) Specification

## 1. Engine Mission & Boundaries

The Kai RegAI Palm Computer Vision Engine is dedicated exclusively to **geometric, topological, and anatomical extraction** from digital camera frames.

```
+-----------------------------------------------------------------------------------+
|                            COMPUTER VISION PIPELINE                               |
|                                                                                   |
|  Live Camera Stream (1080p @ 30/60 fps)                                           |
|         │                                                                         |
|         ▼                                                                         |
|  Hand Detection & Pose Validation (Palmar vs Dorsal; Left vs Right)               |
|         │                                                                         |
|         ▼                                                                         |
|  Quality Gate (Sharpness, Illumination, Distance, Tilt)                           |
|         │                                                                         |
|         ▼                                                                         |
|  21-Point Skeletal Landmark Localization                                          |
|         │                                                                         |
|         ▼                                                                         |
|  Perspective Homography & Palm Surface Rectification                              |
|         │                                                                         |
|         ▼                                                                         |
|  Multi-Scale Crease Segmentation (Life, Head, Heart, Fate, Sun lines)             |
|         │                                                                         |
|         ▼                                                                         |
|  Mount Topology & Geometric Profiling                                             |
|         │                                                                         |
|         ▼                                                                         |
|  Canonical PalmFeatureModel Output (Structured JSON)                              |
+-----------------------------------------------------------------------------------+
```

### Absolute Boundary
* The CV Engine produces mathematical coordinates, curvature coefficients, length ratios, and confidence scores.
* **The CV Engine contains ZERO palmistry interpretation, symbolism, or text generation.**
* **Raw camera frames are NEVER passed to a multimodal LLM to generate palm readings.**

---

## 2. Hand Pose & Quality Validation Stage

Before any line analysis begins, the input frame must clear four deterministic gates:

### Gate 1: Palmar vs. Dorsal Classification
* The system checks anatomical markers (visibility of palm crease zones vs fingernails and knuckle folds).
* If the back of the hand is presented, the engine immediately returns state: `ERROR_DORSAL_HAND_DETECTED` with UI prompt: *"Turn palm toward camera"*.

### Gate 2: Hand Handedness & Orientation
* Classifies **Left Hand** vs **Right Hand**.
* Validates palm upright orientation (wrist at bottom, fingers extended upward $\pm 20^\circ$).
* Rejects closed fists, partially curled fingers, or sideways orientation.

### Gate 3: Illumination & Glare Check
* Calculates histogram balance over the central palmar region.
* Flags underexposure ($< 25\%$ mean brightness) or blown-out highlights/flash glare ($> 90\%$ specular saturation).

### Gate 4: Focus & Motion Sharpness
* Evaluates Laplacian variance of the palm ROI.
* Threshold: $\sigma_{\text{Laplacian}}^2 \ge \tau_{\text{sharpness}}$. Rejects blurred frames with prompt: *"Hold still"*.

---

## 3. Landmark Topology & Rectification

The engine identifies 21 canonical keypoints plus auxiliary palm boundary anchors:

```
          [Tip 8]   [Tip 12]   [Tip 16]   [Tip 20]
             |          |          |          |
          [DIP 7]   [DIP 11]   [DIP 15]   [DIP 19]
             |          |          |          |
          [PIP 6]   [PIP 10]   [PIP 14]   [PIP 18]
             |          |          |          |
  [Tip 4] [MCP 5]───[MCP 9]───[MCP 13]───[MCP 17]
      \      \          |          |          /
    [IP 3]    \         |          |         /
      \        \    [PALM SURFACE REGION]   /
    [MCP 2]     \       |          |       /
        \        \      |          |      /
      [CMC 1]     \     |          |     /
            \______\____|__________|____/
                     [Wrist Point 0]
```

### Homography & Normalization
1. **Palm Coordinate Plane**: Defined with Origin $(0, 0)$ at Wrist Point 0, with vertical axis aligned through MCP 9 (Middle finger base).
2. **Perspective Warp**: Generates a standard $1024 \times 1024$ affine-rectified palm patch independent of hand-to-camera distance or perspective skew.

---

## 4. Crease Line Segmentation

Major palmar creases are segmented using a lightweight U-Net / MobileNet convolutional ridge-filter pipeline optimized for mobile edge inferencing (CoreML on iOS / NNAPI & TensorFlow Lite on Android).

### Feature Parameters Extracted per Line:
* **Life Line**:
  * Origin point relative to MCP 5 (Index base) and CMC 1 (Thumb base).
  * Curvature radius ($R_{\text{arc}}$) around Mount of Venus.
  * Termination point (near wrist center vs curving around base of thumb).
  * Continuity (number and position of breaks, islands, or overlapping branches).
* **Head Line**:
  * Attachment index to Life Line at origin (Separate, Touching, or Extended overlap).
  * Trajectory angle: Straight/transverse (towards Upper Mars) vs sloping downward (towards Mount of Moon).
  * Depth consistency and terminal forks (*Writer's Fork*).
* **Heart Line**:
  * Origin on ulnar percussion beneath pinky finger.
  * Trajectory: Straight transverse vs curved upward.
  * Termination anchor: Under Saturn (MCP 9), under Jupiter (MCP 5), or between Jupiter and Saturn.
* **Fate Line (Saturn Line)**:
  * Presence flag and start locus (Wrist, Moon, or Life Line).
  * Continuity along the vertical median axis terminating towards Saturn Mount.
* **Sun Line (Apollo Line)**:
  * Detection of faint or distinct longitudinal ridges beneath Apollo Mount (MCP 13).

---

## 5. Mount Topography & Geometry Extraction

The palmar surface is partitioned into 8 geometric sectors based on landmark anchors:

| Mount Name | Anatomical Locus Anchor | Metric Extracted |
|---|---|---|
| **Mount of Jupiter** | Beneath index MCP 5 | Surface area, elevation profile, center offset |
| **Mount of Saturn** | Beneath middle MCP 9 | Elevation relative to Jupiter/Sun |
| **Mount of Sun (Apollo)** | Beneath ring MCP 13 | Symmetry and clarity |
| **Mount of Mercury** | Beneath little finger MCP 17 | Lateral percussion displacement |
| **Upper Mars** | Percussion edge between Mercury & Moon | Breadth and muscular fullness |
| **Lower Mars** | Webbing crevice inside thumb crease | Tension and prominence |
| **Mount of Venus** | Enclosed within the Life Line arc | Volumetric fullness and cross-hatching |
| **Mount of Moon (Luna)** | Lower hypothecar pad opposite Venus | Fullness towards wrist edge |

---

## 6. Output Contract: `PalmFeatureModel`

The engine packages all observations into a strictly typed canonical schema:

```json
{
  "engine_version": "1.0.0-cv",
  "capture_timestamp": 1774395000,
  "hand_side": "RIGHT",
  "confidence_overall": 0.94,
  "geometry": {
    "palm_aspect_ratio": 1.08,
    "finger_ratios": {
      "index_to_ring": 0.98,
      "middle_to_palm": 0.81
    },
    "elemental_shape_suggestion": "EARTH"
  },
  "major_creases": {
    "life_line": {
      "detected": true,
      "confidence": 0.96,
      "curvature_class": "WIDE_ARC",
      "origin": "INDEPENDENT_JUPITER_GAP",
      "termination": "BASE_OF_VENUS",
      "continuity": "UNBROKEN",
      "normalized_depth": 0.82
    },
    "head_line": {
      "detected": true,
      "confidence": 0.93,
      "trajectory": "GENTLE_SLOPE_TO_LUNA",
      "origin_relation_to_life": "SLIGHT_CONTACT",
      "termination_fork": false
    },
    "heart_line": {
      "detected": true,
      "confidence": 0.95,
      "trajectory": "CURVED_UPWARD",
      "termination": "INTERDIGITAL_JUPITER_SATURN",
      "chaining": false
    },
    "fate_line": {
      "detected": true,
      "confidence": 0.78,
      "origin": "LOWER_PALM_CENTER",
      "termination": "BASE_OF_SATURN",
      "continuity": "INTERMITTENT"
    },
    "sun_line": {
      "detected": true,
      "confidence": 0.65,
      "termination": "BASE_OF_APOLLO"
    }
  }
}
```

---

## 7. Performance & Privacy Safeguards

1. **On-Device Execution**: CV inferencing is run locally on the client mobile device whenever supported by hardware.
2. **Zero Raw Image Upload by Default**: Only the extracted JSON `PalmFeatureModel` is transmitted to the backend for interpretation.
3. **Latency Target**:
   * Real-time tracking at 30 fps during viewfinder alignment.
   * Full feature extraction in $< 1200\text{ ms}$ upon scan trigger.
