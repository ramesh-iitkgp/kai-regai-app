# Kai RegAI — P6 Camera Capture Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P6 — Hand Scanner Experience  
**Status:** COMPLETE & FROZEN  

---

## 1. Camera Lifecycle Management

`CameraCaptureService` manages the full hardware media stream lifecycle across desktop and mobile browsers (iOS Safari, Android Chrome, mobile WebViews).

### Constraints Specification
```javascript
const constraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' }, // Default to high-res back camera
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 }
  }
};
```

---

## 2. Permission States & Recovery

1. **`NOT_REQUESTED`**: Initial state before user engages with scanner.
2. **`REQUESTING`**: `navigator.mediaDevices.getUserMedia` prompt active.
3. **`GRANTED`**: Hardware media stream established.
4. **`DENIED`**: User tapped "Deny" or blocked permissions in browser settings. Recoverable via `CameraPermissionModal` with clear operating system instructions.
5. **`PERMANENTLY_DENIED`**: Blocked at browser policy level. Instructions provided to navigate to device privacy settings.
6. **`UNAVAILABLE`**: Device lacks camera hardware or runs in unsupported environment. Fallback sample testing mode provided.

---

## 3. Optical Controls

- **Camera Flipping (`flipCamera`)**: Toggles dynamically between `environment` (rear) and `user` (selfie) sensors without leaking previous media tracks.
- **Hardware Torch (`toggleTorch`)**: Queries `track.getCapabilities().torch`. If supported by the device, enables illumination for low-light environments.
- **Canvas Snapshotting (`captureFrame`)**: Renders full-resolution video frame to an offscreen canvas with `{ willReadFrequently: true }` and extracts `Uint8ClampedArray` RGBA data.
- **Headless Mock Mode (`enableMockMode`)**: Allows automated test runners and server environments to provide synthetic palm buffers deterministically without native browser video dependencies.
