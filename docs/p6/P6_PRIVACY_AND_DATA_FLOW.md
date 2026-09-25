# Kai RegAI — P6 Privacy & Data Flow Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P6 — Hand Scanner Experience  
**Status:** COMPLETE & FROZEN  

---

## 1. Biometric Imagery Principles

Palm images are sensitive biometric-like personal representations. Kai RegAI operates under strict privacy safeguards:

1. **Zero Persistent Photo Storage by Default**: Palm image buffers exist exclusively in volatile device RAM during active scanning and feature extraction.
2. **Ephemeral Frame Lifecycle**: Video preview frames captured by `CameraCaptureService.captureFrame()` are processed synchronously or within transient promise chains and immediately garbage-collected.
3. **No Unencrypted Network Transmission**: The P5.2 computer vision engine and `PalmFeatureModelAdapter` execute entirely client-side. No raw palm photography is uploaded to external clouds or logged to external servers.
4. **No Raw Images in Logs or Diagnostics**: Diagnostic overlays and error reporting log only discrete scalar telemetry (`F11_EXCESSIVE_TILT`, `score: 0.94`), never base64 image data strings.
5. **Instant Biometric Purge**: In the User Profile (`ProfileScreen`), a 1-tap "Purge Biometric Data" control purges all cached feature models and resets reading session state.

---

## 2. Ephemeral Data Flow Pipeline

```
Camera Sensor (Hardware)
   │
   ▼
MediaStream Track
   │
   ▼ (RAM Only)
HTMLVideoElement
   │
   ▼ (Temporary Canvas Extraction)
OffscreenCanvas.getImageData() -> Uint8ClampedArray
   │
   ▼
PalmScannerController
   │
   ▼
PalmVisionEngine.analyze() [Frozen P5.2 Client Engine]
   │
   ▼
PalmVisionResult (Discrete Polylines & Scores)
   │
   ▼
PalmFeatureModel (Normalized Geometry)
   │
   ▼
Garbage Collection of Uint8ClampedArray
```
