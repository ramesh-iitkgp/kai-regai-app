# Kai RegAI — P5 Computer Vision Performance Benchmarks
**Phase:** P5 — Palm Computer Vision Engine  
**Version:** `p5.0.0`

---

## 1. Measured Latency per Pipeline Stage

Benchmarked on Apple M-series hardware under Node.js V8 runtime (single-threaded JavaScript execution on $512\times 512$ rectified patches):

| Pipeline Stage | Mean Execution Time | Max Target Budget | Status |
| :--- | :--- | :--- | :--- |
| **1. Image Ingestion & Clamping** | ~2.5 ms | 15 ms | **OPTIMAL** |
| **2. Optical Quality Assessment** | ~6.8 ms | 20 ms | **OPTIMAL** |
| **3. Hand Detection & Landmarks** | ~11.8 ms | 40 ms | **OPTIMAL** |
| **4. Palm Segmentation & Warp** | ~5.9 ms | 25 ms | **OPTIMAL** |
| **5. CLAHE & Hessian Ridge Filtering**| ~58.2 ms | 120 ms | **OPTIMAL** |
| **6. Zhang-Suen Thinning & Tracing** | ~62.1 ms | 100 ms | **OPTIMAL** |
| **7. Major Line Classification** | ~3.8 ms | 15 ms | **OPTIMAL** |
| **8. Model & SVG Path Adaptation** | ~0.5 ms | 5 ms | **OPTIMAL** |
| **TOTAL PIPELINE LATENCY** | **~151 ms** | **< 350 ms** | **PASSED** |

---

## 2. Memory Footprint

* **Peak Buffer Allocation:**
  * Raw Image Buffer (1024×1024 RGBA): 4.19 MB
  * Rectified Grayscale Patch (512×512 8-bit): 0.26 MB
  * CLAHE & Multi-Scale Hessian Maps (Float32Array 512×512 × 3): 3.14 MB
  * Skeleton & Graph Buffers: ~0.52 MB
  * **Total Peak Working Memory:** $< 9.5\text{ MB}$.
* **Garbage Collection Overhead:** Typed arrays are allocated per request and immediately dereferenced, keeping heap pressure minimal on mobile runtimes.

---

## 3. Mobile Camera Cadence Strategy

Running the full $151\text{ ms}$ multi-scale Hessian ridge pipeline on every camera frame at 60 FPS would cause excessive thermal throttling and battery drain.

### Production Recommendation for Live Viewfinder:
1. **Quality Gating at 10 Hz (every 100ms):**
   * Run lightweight Sharpness + Glare + Framing checks ($< 8\text{ ms}$) on downsampled viewfinder frames to provide immediate HUD alignment feedback ("Hold steady", "Too bright", "Center palm").
2. **Full Crease Pipeline on Shutter / Stabilization Event:**
   * When quality gate clears consistently for $\ge 3$ consecutive frames (or user taps scan), freeze the stabilized frame and execute the full $151\text{ ms}$ crease extraction pipeline once.
