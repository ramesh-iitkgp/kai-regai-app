# Kai RegAI — P5 Computer Vision Known Limitations
**Phase:** P5 — Palm Computer Vision Engine  
**Version:** `p5.0.0`

---

## 1. Known Algorithmic Limitations

1. **Severe Flash Specular Glare:**
   * Flash reflections on sweaty or oily skin saturate pixels to $Y \ge 250$. The engine detects this and returns `RECAPTURE_REQUIRED` with recommendation `"Tilt hand slightly to eliminate shiny reflections"`. It does not attempt to hallucinate creases underneath blown-out specular highlights.
2. **Highly Calloused or Weathered Hands:**
   * Severe skin texture and micro-wrinkles produce high-frequency directional responses. While the multi-scale Hessian filter weights medium ($\sigma = 2.0$) and coarse ($\sigma = 3.5$) scales higher to suppress fine wrinkles, deep scars or manual labor calluses near the thenar eminence can occasionally be detected as candidate fragments.
3. **Faint Sun Line & Fragmented Fate Lines:**
   * In traditional palmistry and real human anatomy, the Sun Line (Surya Rekha) and Fate Line (Urdhva Rekha) are frequently faint, interrupted, or completely absent. The engine prioritizes truthfulness over visual completeness: if image evidence is below threshold, it reports `NOT_DETECTED` rather than creating a decorative line.
4. **Complex Background Interference:**
   * The skin-chrominance fallback detector performs best against uniform neutral or dark backgrounds. Cluttered scenes containing human faces or wooden furniture of identical skin-tone hue can cause imprecise bounding contours if MediaPipe landmarks are unavailable.
5. **Dorsal (Back-of-Hand) Rejection:**
   * Dorsal hands lacking crease patterns trigger `NO_HAND` or `RECAPTURE_REQUIRED` due to absence of major palmar valley signatures.

---

## 2. Epistemic & Non-Claim Boundaries

1. **NO Medical or Diagnostic Claims:**
   * Crease structures (including simian creases or Sydney lines) must NEVER be used to infer medical conditions, genetic anomalies, or health status.
2. **NO Deterministic Fortune Telling:**
   * The computer vision pipeline outputs strictly geometric polylines and physical observables ($x, y$ coordinates, curvature, arc length, depth, and contrast).
3. **Strict Epistemic Decoupling:**
   * The CV engine provides zero narrative interpretation or astrological symbolism. All interpretation belongs strictly to subsequent knowledge and rule engine phases.
