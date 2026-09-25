# Kai RegAI — P5 Computer Vision Pipeline Specification
**Phase:** P5 — Palm Computer Vision Engine  
**Version:** `p5.0.0`

---

## Stage-by-Stage Input/Output Contracts

### Stage 1: Ingestion & Normalization (`ImageIngestion.js`)
* **Input:** Raw RGBA pixel buffer, HTML Canvas, or ImageData (`{ width, height, data }`).
* **Algorithm:** Bilinear resampling clamping max dimension to 1024px; fast fixed-point ITU-R BT.601 integer luminance extraction ($Y = (77R + 150G + 29B) \gg 8$).
* **Output:** `PalmImage` (`{ width, height, data: Uint8ClampedArray, channels: 4, metadata }`).

### Stage 2: Optical Quality Assessment (`ImageQualityAnalyzer.js`)
* **Input:** `PalmImage`.
* **Algorithms:**
  * **Sharpness:** Discrete 4-neighbor Laplacian convolution kernel $[0, 1, 0; 1, -4, 1; 0, 1, 0]$ calculating intensity variance $\sigma^2_{\text{Laplacian}}$.
  * **Illumination:** Grayscale histogram mean luminance $Y_{\text{mean}} \in [40, 215]$.
  * **Contrast:** Standard deviation across middle-tone intensities ($\sigma \ge 25.0$).
  * **Specular Glare:** Fraction of pixels with $Y \ge 250$ (maximum allowed 4%).
  * **Framing:** Per-border skin density along top, bottom, left, and right margins. Flagged as clipped if any single margin exceeds 25% foreground density.
* **Output:** `ImageQualityResult` (`{ score, sharpness, illumination, contrast, glare, framing, passed, reasons, recommendations }`).

### Stage 3: Hand Detection & Localization (`HandDetector.js`)
* **Input:** Normalized `PalmImage` + handedness hint (`LEFT` | `RIGHT`).
* **Algorithms:**
  * Primary: MediaPipe Hand Landmarker WebAssembly stream when present.
  * Fallback: Skin-chrominance bounding locus with mass centroid and 21-point anatomical landmark synthesis.
* **Output:** `HandDetectionResult` (`{ detected, handedness, boundingBox, confidence, landmarks }`).

### Stage 4: Palm Segmentation & Rectification (`PalmSegmentation.js`)
* **Input:** `PalmImage` + `HandDetectionResult`.
* **Algorithms:**
  * Computes anatomical vertical orientation angle $\theta = \text{atan2}(dx, dy)$ between Wrist (Landmark 0) and Middle MCP (Landmark 9).
  * Computes palmar span and radius.
  * Samples inverse-rotated $512\times 512$ square patch centered at mid-palm.
  * Generates inner palmar mask ($\text{normDistSq} \le 0.65$) to exclude outer boundary artifacts.
* **Output:** `PalmROI` (`{ mask, roiPatch, roiSize: 512, boundingBox, orientation, scale }`).

### Stage 5: Crease Enhancement Engine (`CreaseEnhancementEngine.js`)
* **Input:** Rectified $512\times 512$ patch + inner mask.
* **Algorithms:**
  * **CLAHE:** $8\times 8$ local contextual grid with clip limit $\tau_{\text{clip}} = 2.5$ and bilinear interpolation across tile CDFs.
  * **Multi-Scale Hessian Filtering:** Computes discrete 2nd derivatives ($I_{xx}, I_{yy}, I_{xy}$) after Gaussian smoothing at fine ($\sigma = 1.0$), medium ($\sigma = 2.0$), and coarse ($\sigma = 3.5$) scales.
  * Valley response: $\lambda_2 = \frac{(I_{xx} + I_{yy}) + \sqrt{(I_{xx} - I_{yy})^2 + 4I_{xy}^2}}{2} \cdot \sigma^2$.
  * Scale-space fusion with configured weights.
* **Output:** `Float32Array` enhanced confidence map normalized to $[0, 1]$.

### Stage 6: Candidate Crease Graph & Skeletonization (`CreaseCandidateGraph.js`)
* **Input:** Enhanced confidence map.
* **Algorithms:**
  * Adaptive threshold binarization at $\tau_{\text{bin}} = 0.18$.
  * Zhang-Suen morphological thinning algorithm iterating until 1-pixel centerline convergence.
  * Graph tracing from line endpoints and bifurcations.
  * Spur pruning (< 12px).
  * Douglas-Peucker polyline simplification ($\epsilon = 1.5$px).
* **Output:** `CreaseCandidate[]` (`{ id, polyline: Point[], confidence, length, continuity, curvature, contrast }`).

### Stage 7: Major Line Classification (`MajorLineClassifier.js`)
* **Input:** Candidate polylines + anatomical search priors.
* **Algorithms:**
  * Bounding search sector matching for Life, Head, Heart, Fate, Sun lines.
  * Directional trajectory orientation and minimum span gating (rejecting transverse creases for vertical priors and vice-versa).
  * Composite scoring based on prior agreement, structural continuity, and local ridge contrast.
  * Rejects candidate matches below confidence cutoff ($\tau_{\text{weak}} = 0.35$).
* **Output:** `Record<'life'|'head'|'heart'|'fate'|'sun', MajorPalmLine>`.
