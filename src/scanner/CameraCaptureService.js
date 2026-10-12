/**
 * Kai RegAI — Camera Capture Service
 * Phase: P6 — Hand Scanner Experience
 * 
 * Manages device camera stream lifecycle, video element attachment,
 * permission states, torch control, camera flipping, and canvas frame grabbing.
 */

export const PERMISSION_STATES = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  REQUESTING: 'REQUESTING',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  PERMANENTLY_DENIED: 'PERMANENTLY_DENIED',
  UNAVAILABLE: 'UNAVAILABLE'
};

export class CameraCaptureService {
  constructor(options = {}) {
    this.videoElement = null;
    this.canvasElement = null;
    this.stream = null;
    this.track = null;
    this.facingMode = options.facingMode || 'environment'; // default to back camera
    this.isTorchOn = false;
    this.permissionState = PERMISSION_STATES.NOT_REQUESTED;
    this.listeners = new Set();
    this.isMockMode = false;
    this.mockFrameProvider = null;
  }

  getPermissionState() {
    return this.permissionState;
  }

  isAvailable() {
    return typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';
  }

  /**
   * Attach video element for viewfinder rendering
   * @param {HTMLVideoElement} video 
   */
  attachVideoElement(video) {
    this.videoElement = video;
    if (this.stream && this.videoElement) {
      this.videoElement.srcObject = this.stream;
      this.videoElement.play().catch(err => {
        console.warn('[CameraCaptureService] Autoplay play error:', err);
      });
    }
  }

  get isActive() {
    if (this.isMockMode) return Boolean(this.isMockActive);
    return Boolean(this.stream);
  }

  /**
   * Determine whether the active camera stream is front/user-facing (selfie/webcam)
   * On Mac/PC desktop or when facingMode is 'user', the camera faces the user and requires mirroring.
   * @returns {boolean}
   */
  isUserFacing() {
    if (this.track && typeof this.track.getSettings === 'function') {
      const settings = this.track.getSettings();
      if (settings.facingMode) {
        return settings.facingMode === 'user';
      }
    }
    // Fallback: On non-mobile desktop/laptop, the built-in webcam is user-facing
    if (typeof navigator !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      if (!isMobile) return true;
    }
    return this.facingMode === 'user';
  }

  get isMirrored() {
    return this.isUserFacing();
  }

  /**
   * Request camera permission and start media stream
   */
  async startStream() {
    if (this.isMockMode) {
      this.isMockActive = true;
      this.setPermissionState(PERMISSION_STATES.GRANTED);
      return { success: true };
    }

    if (!this.isAvailable()) {
      this.setPermissionState(PERMISSION_STATES.UNAVAILABLE);
      return { success: false, reason: 'CAMERA_UNAVAILABLE' };
    }

    this.setPermissionState(PERMISSION_STATES.REQUESTING);

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: this.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.track = this.stream.getVideoTracks()[0] || null;
      this.setPermissionState(PERMISSION_STATES.GRANTED);

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play().catch(() => {});
      }

      return { success: true };
    } catch (err) {
      console.warn('[CameraCaptureService] getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.setPermissionState(PERMISSION_STATES.DENIED);
        return { success: false, reason: 'PERMISSION_DENIED', error: err };
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.setPermissionState(PERMISSION_STATES.UNAVAILABLE);
        return { success: false, reason: 'CAMERA_UNAVAILABLE', error: err };
      } else {
        this.setPermissionState(PERMISSION_STATES.UNAVAILABLE);
        return { success: false, reason: 'CAMERA_ERROR', error: err };
      }
    }
  }

  /**
   * Stop all active video tracks and release hardware
   */
  stopStream() {
    this.isMockActive = false;
    if (this.track) {
      try {
        if (this.isTorchOn) {
          this.track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
          this.isTorchOn = false;
        }
        this.track.stop();
      } catch (e) {}
      this.track = null;
    }
    if (this.stream) {
      try {
        this.stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.stream = null;
    }
    if (this.videoElement) {
      try {
        this.videoElement.srcObject = null;
      } catch (e) {}
    }
  }

  /**
   * Flip between back and front cameras
   */
  async flipCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.stopStream();
    return await this.startStream();
  }

  /**
   * Toggle hardware flashlight if supported
   */
  async toggleTorch() {
    if (!this.track) return false;
    const capabilities = typeof this.track.getCapabilities === 'function' ? this.track.getCapabilities() : {};
    if (!capabilities.torch) {
      return false;
    }

    try {
      this.isTorchOn = !this.isTorchOn;
      await this.track.applyConstraints({
        advanced: [{ torch: this.isTorchOn }]
      });
      return this.isTorchOn;
    } catch (err) {
      console.warn('[CameraCaptureService] Torch toggle failed:', err);
      this.isTorchOn = false;
      return false;
    }
  }

  /**
   * Capture a single high-fidelity snapshot from the live video stream
   * @param {Object} [cropOptions]
   * @returns {import('../cv/types.js').PalmImage | null}
   */
  captureFrame(cropOptions = null) {
    if (this.isMockMode && this.mockFrameProvider) {
      return this.mockFrameProvider();
    }

    if (!this.videoElement || this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
      return null;
    }

    const vw = this.videoElement.videoWidth;
    const vh = this.videoElement.videoHeight;

    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
    }

    const canvas = this.canvasElement;
    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(this.videoElement, 0, 0, vw, vh);
    const imgData = ctx.getImageData(0, 0, vw, vh);

    return {
      width: vw,
      height: vh,
      data: imgData.data
    };
  }

  /**
   * Capture a compressed base64 JPEG image from the live video stream
   * @param {number} [quality=0.85]
   * @returns {string | null} Data URL
   */
  captureDataUrl(quality = 0.85) {
    if (!this.videoElement || this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
      return null;
    }
    const vw = this.videoElement.videoWidth;
    const vh = this.videoElement.videoHeight;
    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
    }
    const canvas = this.canvasElement;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(this.videoElement, 0, 0, vw, vh);
    try {
      return canvas.toDataURL('image/jpeg', quality);
    } catch (e) {
      return null;
    }
  }

  /**
   * Enable headless / test simulation mock provider
   */
  enableMockMode(frameProvider) {
    this.isMockMode = true;
    this.mockFrameProvider = frameProvider;
    this.setPermissionState(PERMISSION_STATES.GRANTED);
  }

  setPermissionState(state) {
    this.permissionState = state;
    for (const listener of this.listeners) {
      listener(this.permissionState);
    }
  }

  onPermissionChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Aliases for convenience and external callers
  async initialize(options = {}) {
    if (options.videoElement) {
      this.attachVideoElement(options.videoElement);
    }
    const res = await this.startStream();
    return { ok: res.success, ...res };
  }

  grabFrame(cropOptions = null) {
    const frame = this.captureFrame(cropOptions);
    if (!frame) return null;
    return {
      ...frame,
      timestamp: Date.now()
    };
  }

  async switchCamera() {
    const res = await this.flipCamera();
    return res.success;
  }

  stop() {
    this.stopStream();
  }
}
