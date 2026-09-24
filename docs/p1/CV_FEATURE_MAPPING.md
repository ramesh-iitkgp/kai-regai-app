# Kai RegAI — Computer Vision Feature Compatibility Mapping

## 1. Feature Detectability Classification Matrix

Every feature in the Kai RegAI taxonomy is assigned an explicit feasibility class based on mobile camera sensor limitations, edge compute budgets, and mathematical detectability:

```
[CV_DETECTABLE]             ──> Can be automatically and reliably extracted from 1080p camera feed.
[CV_PARTIALLY_DETECTABLE]   ──> Detectable under optimal lighting; requires thresholding or user confirmation.
[USER_INPUT_REQUIRED]       ──> Tactile, muscular, or subtle features impossible to measure via 2D camera.
[HYBRID]                    ──> Initial estimate by CV, refined or confirmed via interactive UI picker.
```

---

## 2. Complete Taxonomy Mapping Table

| Feature Domain & Key | Detection Class | Detection Mechanism & Limitations | Mode 1 (Hand Scanner ~10s) Scope | Mode 2 (Guided Reading) Scope |
|---|---|---|---|---|
| **Hand Presence & Pose** | `CV_DETECTABLE` | MediaPipe / CoreML 21 Hand Landmarks. Detects palmar surface. | **Core Gate** | **Core Gate** |
| **Palmar vs Dorsal View** | `CV_DETECTABLE` | Crease region detection vs fingernails / knuckles. | **Core Gate** | **Core Gate** |
| **Palm Aspect Ratio** | `CV_DETECTABLE` | Landmark bounding box ratio (MCP to wrist / palm width). | **Active** | **Active** |
| **Finger-to-Palm Ratio** | `CV_DETECTABLE` | Length of middle finger divided by palm height. | **Active** | **Active** |
| **Elemental Hand Shape** | `CV_DETECTABLE` | Combines palm ratio & finger ratio into Earth/Air/Fire/Water. | **Active (Primary)** | **Active (Primary)** |
| **Skin Grain Texture** | `USER_INPUT_REQUIRED` | Cannot reliably resolve microscopic dermal texture across variable phone cameras. | *Excluded* | **Questionnaire Card** |
| **Palm / Pad Firmness** | `USER_INPUT_REQUIRED` | Purely tactile (requires physical pressure on palm pad). | *Excluded* | **Questionnaire Card** |
| **Dorsal Flexibility** | `USER_INPUT_REQUIRED` | Requires physical resistance measurement against flat surface. | *Excluded* | **Questionnaire Card** |
| **Finger Length Ratios** | `CV_DETECTABLE` | 2D:4D ratio (Index vs Ring finger length relative to tips). | **Active** | **Active** |
| **Interdigital Gaps** | `CV_DETECTABLE` | Webbing contour gaps between fingers when fingers held open. | **Active** | **Active** |
| **Finger Phalange Nodes** | `CV_PARTIALLY_DETECTABLE`| Knottiness of joints; sensitive to lighting angle. | *Excluded* | **Hybrid Confirm** |
| **Thumb Setting Angle** | `CV_DETECTABLE` | Angle between index MCP and thumb distal axis. | **Active** | **Active** |
| **Thumb Distal Flexibility**| `USER_INPUT_REQUIRED`| Requires user to actively press thumb backward. | *Excluded* | **Interactive Arc Meter** |
| **Thumb Phalanx Ratio** | `CV_PARTIALLY_DETECTABLE`| Segment 1 (Will) vs Segment 2 (Logic) length measurement. | *Excluded* | **Interactive Gauge** |
| **Thumb Yava / Rice Sign** | `HYBRID` | Fine crease pattern on inner thumb joint. | *Excluded* | **Visual Confirm Card** |
| **Life Line Presence** | `CV_DETECTABLE` | High-contrast ridge segmentation around Venus mount. | **Active (Violet)** | **Active (Violet)** |
| **Life Line Curvature** | `CV_DETECTABLE` | Spline fitting: calculates radius $R_{\text{arc}}$ around thumb base. | **Active** | **Active** |
| **Life Line Continuity** | `CV_PARTIALLY_DETECTABLE`| Detects major line interruptions ($>2.5\text{mm}$). | **Active** | **Active** |
| **Head Line Trajectory** | `CV_DETECTABLE` | Slope angle: Straight (transverse) vs curved to Luna. | **Active (Blue)** | **Active (Blue)** |
| **Head Line Separation** | `CV_DETECTABLE` | Distance between Head origin and Life Line origin at radial edge. | **Active** | **Active** |
| **Heart Line Curvature** | `CV_DETECTABLE` | Arc profile across upper palm; termination mount locus. | **Active (Rose)** | **Active (Rose)** |
| **Fate Line Presence** | `CV_PARTIALLY_DETECTABLE`| Vertical median crease; can be faint in 35% of population. | **Active (Gold)** | **Active (Gold)** |
| **Sun Line Presence** | `CV_PARTIALLY_DETECTABLE`| Longitudinal ridge beneath Apollo mount; faint in many hands. | **Active (Amber)** | **Active (Amber)** |
| **Mount Prominence (Venus)**| `CV_PARTIALLY_DETECTABLE`| 2D area calculation; depth shading estimation. | **Active (Approx)** | **Active + Confirm** |
| **Mount Prominence (Luna)** | `CV_PARTIALLY_DETECTABLE`| Hypothecar pad area and curvature. | **Active (Approx)** | **Active + Confirm** |
| **Subtle Minor Lines** | `USER_INPUT_REQUIRED` | Fine lateral union creases (percussion of pinky) too fine for phone cameras. | *Excluded* | **Guided Line Picker** |
| **Sacred Vedic Marks** | `HYBRID` | Fish, Trident, Lotus require subtle multi-line intersection verification. | *Excluded* | **Interactive Sign Card** |

---

## 3. Strict Operating Rules for Hand Scanner (Mode 1)

1. **Anti-Hallucination Scope Lock**: The Hand Scanner is **forbidden** from making assertions based on features classified as `USER_INPUT_REQUIRED` (e.g. skin texture, thumb flexibility, subtle marriage lines).
2. **Confidence Floor**: If the CV confidence for a major line falls below $0.70$ during the scan, that specific line is skipped in the Quick Report rather than guessing its trajectory.
3. **Approved Real-Time Scan Highlights**:
   * Life Line: **Violet** (`#A855F7`)
   * Head Line: **Blue** (`#00D2FF`)
   * Heart Line: **Rose** (`#F43F5E`)
   * Fate Line: **Gold** (`#FBBF24`)
   * Sun Line: **Amber** (`#F59E0B`)
