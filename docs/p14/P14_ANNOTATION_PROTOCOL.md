# P14 Annotation Protocol — Ground Truth Standards & Quality Gates

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P14 — Real-Palm Dataset & Accuracy Validation  
**Protocol Version:** 1.0.0  
**Status:** FROZEN & CERTIFIED  

---

## 1. Objective & Scope

This protocol establishes the standardized, reproducible methodology for generating, verifying, and maintaining expert ground truth annotations for major palm lines across the Kai RegAI dataset.

Ground truth quality takes absolute precedence over algorithm scores:
- **No Artificial Inflation**: Annotations must never be shifted or simplified to accommodate algorithm errors.
- **Epistemic Honesty**: If an anatomical crease is ambiguous or interrupted, it must be marked `PARTIAL` or `UNCERTAIN` rather than forcibly traced.
- **Coordinate System Invariance**: All geometric annotations must map deterministically to the canonical 360 × 450 coordinate system.

---

## 2. Major Palm Line Definitions & Boundary Anchors

Every palm image is annotated for the 5 major lines:

### 2.1 Life Line (`life`)
- **Anatomical Origin**: Radial margin between index finger base (Jupiter mount) and thumb web.
- **Trajectory**: Sweeps downward around the thenar eminence (Venus mount) towards the wrist crease (rascette).
- **Termination**: Base of thenar eminence or proximal wrist margin.
- **Color Token**: Violet (`#A855F7`).

### 2.2 Head Line (`head`)
- **Anatomical Origin**: Radial palm margin near or confluent with the Life Line origin.
- **Trajectory**: Transversely crosses the palm towards the ulnar percussion (distal Luna / lower Mars mount).
- **Termination**: Mid-palm or lower hypothenar border.
- **Color Token**: Blue (`#00D2FF`).

### 2.3 Heart Line (`heart`)
- **Anatomical Origin**: Ulnar margin below the pinky finger (Mercury mount).
- **Trajectory**: Traverses horizontally across upper mounts towards Jupiter/Saturn space.
- **Termination**: Below index or middle finger mount.
- **Color Token**: Rose (`#F43F5E`).

### 2.4 Fate Line (`fate`)
- **Anatomical Origin**: Proximal wrist center, lower palm, or Luna mount.
- **Trajectory**: Ascends vertically towards the base of the middle finger (Saturn mount).
- **Termination**: Plain of Mars or base of Saturn finger.
- **Color Token**: Gold (`#FBBF24`).

### 2.5 Sun Line (`sun`)
- **Anatomical Origin**: Hypothenar area, Plain of Mars, or heart line junction.
- **Trajectory**: Ascends vertically towards the base of the ring finger (Apollo mount).
- **Termination**: Apollo mount.
- **Color Token**: Amber (`#F59E0B`).

---

## 3. Presence Categorization Standard

Every line is assigned exactly one presence classification:

| Status | Definition | Polyline Required? |
| :--- | :--- | :---: |
| **PRESENT** | The crease is clearly visible, continuous or semi-continuous with distinct contrast against epidermal skin. | **Yes** ($\ge 2$ points) |
| **PARTIAL** | The crease is faint, fragmented, or interrupted, but visible along $\ge 30\%$ of its anatomical span. | **Yes** ($\ge 2$ points) |
| **UNCERTAIN** | Crease visibility is ambiguous due to micro-wrinkles, low contrast, glare, or motion blur. | Optional |
| **ABSENT** | Anatomical site is clearly visible and free of the designated major crease. | **No** (Empty polyline) |

---

## 4. Geometric Polyline Standard

For `PRESENT` and `PARTIAL` lines:
1. **Centroid Alignment**: Points must trace the deepest trough of the crease furrow, not lateral skin ridges.
2. **Order & Directionality**:
   - `life`: Traced from radial origin downward towards the wrist.
   - `head`: Traced from radial origin transversely towards the hypothenar margin.
   - `heart`: Traced from ulnar start towards index/middle finger mounts.
   - `fate`: Traced from proximal base upward towards Saturn mount.
   - `sun`: Traced from proximal start upward towards Apollo mount.
3. **Normalized Coordinates**:
   $$\forall p = (x, y), \quad 0.0 \le x \le 1.0, \quad 0.0 \le y \le 1.0$$
4. **Sampling Density**: Polylines contain between 5 and 30 discrete vertex points sufficient to capture natural anatomic curvature without piecewise artifacts.

---

## 5. Ground Truth File Schema

Stored under `cv/real-validation/dataset/annotations/<imageId>.annotation.json`:

```json
{
  "datasetVersion": "1.0.0",
  "annotationVersion": "1.0.0",
  "protocolVersion": "1.0.0",
  "canonicalCoordinates": {
    "targetWidth": 360,
    "targetHeight": 450
  },
  "imageId": "PALM-0001",
  "split": "DEVELOPMENT",
  "handedness": "RIGHT",
  "annotatorId": "expert_lead_annotator",
  "qualityCategory": "GOOD",
  "lighting": "EVEN",
  "tiltDegrees": 0,
  "scaleCategory": "OPTIMAL",
  "edgeCaseDescription": "Baseline mobile capture #1",
  "lines": {
    "life": {
      "status": "PRESENT",
      "polyline": [
        { "x": 0.197, "y": 0.635 },
        { "x": 0.211, "y": 0.633 },
        { "x": 0.234, "y": 0.648 }
      ]
    },
    "fate": {
      "status": "ABSENT",
      "polyline": []
    }
  }
}
```

---

## 6. Verification Quality Gates

Before an annotation file is admitted to the dataset:
1. **Schema Integrity**: Validates `datasetVersion`, `annotationVersion`, and `canonicalCoordinates`.
2. **Boundary Gate**: All polyline coordinates must reside strictly within $[0.0, 1.0]$.
3. **Length Gate**: Non-empty polylines must contain at least 2 coordinate points.
4. **Semantic Exclusivity**: If status is `ABSENT`, polyline must be empty `[]`.
5. **No PII Gate**: The annotation file must contain no user identifiers or unhashed personal metadata.
