# Kai RegAI — P5 Computer Vision Data Model
**Phase:** P5 — Palm Computer Vision Engine  
**Version:** `p5.0.0`

---

## 1. Canonical Vision Types

### `PalmVisionResult`
```ts
interface PalmVisionResult {
  status:
    | "SUCCESS"
    | "RECAPTURE_REQUIRED"
    | "NO_HAND"
    | "INSUFFICIENT_EVIDENCE"
    | "PROCESSING_ERROR";

  imageQuality: ImageQualityResult;
  hand: HandDetectionResult;
  palm?: PalmROI;

  lines: {
    life: MajorPalmLine;
    head: MajorPalmLine;
    heart: MajorPalmLine;
    fate: MajorPalmLine;
    sun: MajorPalmLine;
  };

  processing: {
    durationMs: number;
    engineVersion: string;
    stageTimingsMs?: Record<string, number>;
  };
}
```

### `MajorPalmLine`
```ts
interface MajorPalmLine {
  type: "LIFE" | "HEAD" | "HEART" | "FATE" | "SUN";
  status: "DETECTED" | "WEAK" | "PARTIAL" | "NOT_DETECTED" | "AMBIGUOUS";
  polyline: Point[]; // Empty if status === 'NOT_DETECTED'
  confidence: number; // [0, 1]
  continuity: number; // Chord length / Arc length ratio
  visibility: number; // Contrast across ridge
  evidence: {
    contrast: number;
    structuralScore: number;
    geometricPriorScore: number;
    landmarkRelationScore: number;
  };
}
```

### `ImageQualityResult`
```ts
interface ImageQualityResult {
  score: number; // [0, 1] Optical composite score
  sharpness: number; // Laplacian variance ratio
  illumination: number; // Luminance histogram balance
  contrast: number; // Dynamic range standard deviation
  glare: number; // Freedom from specular saturation
  framing: number; // Margin clearance score
  resolution: number; // Spatial density adequacy
  occlusion: number; // Freedom from foreign objects
  passed: boolean;
  reasons: string[];
  recommendations: string[];
}
```

---

## 2. Mapping to Canonical `PalmFeatureModel`

The adapter [PalmFeatureModelAdapter.js](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/src/cv/adapters/PalmFeatureModelAdapter.js) maps the low-level vision result to the canonical product model:

| `PalmVisionResult` Field | Canonical `PalmFeatureModel` Target | Conversion Logic |
| :--- | :--- | :--- |
| `hand.handedness` | `hand.side` | `'LEFT'` \| `'RIGHT'` |
| `imageQuality.score` | `quality_score` | Optical composite score $Q$ |
| `processing.engineVersion` | `provenance.cv_version` | Engine semantic version string (e.g. `'p5.0.0'`) |
| `lines.life.status` | `major_lines.life_line.detected` | `status !== 'NOT_DETECTED'` |
| `lines.life.confidence` | `major_lines.life_line.confidence` | Quantitative evidence confidence |
| `lines.life.polyline` | `major_lines.life_line.polyline` | Normalized vertex array $[0, 1]$ |
| `lines.head.status` | `major_lines.head_line.detected` | `status !== 'NOT_DETECTED'` |
| `lines.sun.status` | `major_lines.sun_line.detected` | Honest absence detection |

---

## 3. SVG Polyline Representation for `PalmLineOverlay`

Normalized $[0, 1]$ polylines are mapped onto the overlay's SVG coordinate space ($360\times 450$):
$$\text{SvgPath} = \text{"M " } + \text{round}(p_0.x \times 360) + \text{" "} + \text{round}(p_0.y \times 450) + \dots$$
Lines with status `NOT_DETECTED` produce empty path strings `""` and are hidden in the presentation layer.
