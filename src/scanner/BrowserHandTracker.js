/**
 * Kai RegAI — Browser Hand Tracker Service
 * Phase: P6 — Real-Time Hand Scanner Experience
 * 
 * Provides rock-solid, 60fps, zero-jitter hand landmark tracking in the browser.
 * Leverages MediaPipe Hands (via WebAssembly/GPU) with automatic fallback to
 * HandDetector contour engine and integrated adaptive LandmarkSmoother.
 */

import { LandmarkSmoother } from './LandmarkSmoother.js';
import { HandDetector } from '../cv/detection/HandDetector.js';

export class BrowserHandTracker {
  constructor(options = {}) {
    this.smoother = new LandmarkSmoother({
      baseAlpha: options.baseAlpha ?? 0.35,
      stillAlpha: options.stillAlpha ?? 0.15,
      motionAlpha: options.motionAlpha ?? 0.70
    });
    this.mediaPipeHands = null;
    this.isMediaPipeReady = false;
    this.isTracking = false;
    this.videoElement = null;
    this.animFrameId = null;
    this.onFrameCallback = null;
    this.fallbackCanvas = null;
    this.expectedHandedness = options.expectedHandedness || 'RIGHT';
    this.isMirrored = options.isMirrored !== undefined ? Boolean(options.isMirrored) : false;
    this.lastProcessedTime = 0;
    this.minIntervalMs = options.minIntervalMs || 25; // Up to 40 FPS tracking
  }

  /**
   * Dynamically loads MediaPipe Hands from CDN if not already in window
   */
  async loadMediaPipeCDN() {
    if (typeof window === 'undefined') return false;
    if (window.Hands) {
      return true;
    }

    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load MediaPipe Hands script'));
        document.head.appendChild(script);
      });
      return Boolean(window.Hands);
    } catch (err) {
      console.warn('[BrowserHandTracker] MediaPipe CDN load skipped, using fallback:', err?.message);
      return false;
    }
  }

  /**
   * Initialize MediaPipe Hands model
   */
  async initialize() {
    if (typeof window === 'undefined') return false;

    const available = await this.loadMediaPipeCDN();
    if (!available || !window.Hands) {
      this.isMediaPipeReady = false;
      return false;
    }

    try {
      this.mediaPipeHands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.mediaPipeHands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.50
      });

      this.mediaPipeHands.onResults((results) => {
        this.handleMediaPipeResults(results);
      });

      this.isMediaPipeReady = true;
      return true;
    } catch (err) {
      console.warn('[BrowserHandTracker] MediaPipe Hands init error:', err);
      this.isMediaPipeReady = false;
      return false;
    }
  }

  /**
   * Handle results from MediaPipe Hands inference
   */
  handleMediaPipeResults(results) {
    if (!this.isTracking || !this.onFrameCallback) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const rawLm = results.multiHandLandmarks[0];
      let handednessLabel = results.multiHandedness?.[0]?.label?.toUpperCase();
      if (handednessLabel) {
        // MediaPipe Hands ML model is trained assuming a mirrored selfie camera.
        // For unmirrored streams (e.g. mobile rear camera), invert the reported label.
        // For user-facing streams, the frame is pre-mirrored via mirrorCanvas so label is exact.
        if (!this.isMirrored) {
          handednessLabel = handednessLabel === 'RIGHT' ? 'LEFT' : 'RIGHT';
        }
      } else {
        handednessLabel = this.expectedHandedness;
      }

      // Canonical 21 landmarks with IDs
      // Pre-mirrored canvas ensures landmarks naturally map 1:1 to screen space
      const rawPoints = rawLm.map((pt, idx) => ({
        id: idx,
        x: pt.x,
        y: pt.y,
        z: pt.z,
        visibility: pt.visibility ?? 1.0
      }));

      // Apply adaptive EMA smoothing to eradicate jitter
      const smoothed = this.smoother.update(rawPoints);

      this.onFrameCallback({
        detected: true,
        landmarks: smoothed || rawPoints,
        rawLandmarks: rawPoints,
        handedness: handednessLabel,
        isMediaPipe: true
      });
    } else {
      // Landmark dropped: notify smoother (retains grace buffer for momentary drops)
      const persisted = this.smoother.update(null);
      this.onFrameCallback({
        detected: Boolean(persisted),
        landmarks: persisted,
        rawLandmarks: null,
        handedness: this.expectedHandedness,
        isMediaPipe: true
      });
    }
  }

  /**
   * Start tracking on the provided video element
   * @param {HTMLVideoElement} videoElement 
   * @param {Function} onFrameCallback - Receives ({ detected, landmarks, handedness, isMediaPipe })
   */
  start(videoElement, onFrameCallback) {
    this.videoElement = videoElement;
    this.onFrameCallback = onFrameCallback;
    this.isTracking = true;
    this.smoother.reset();

    // Begin render frame loop
    const trackLoop = async (now) => {
      if (!this.isTracking) return;

      if (now - this.lastProcessedTime >= this.minIntervalMs) {
        this.lastProcessedTime = now;
        await this.processCurrentFrame();
      }

      this.animFrameId = requestAnimationFrame(trackLoop);
    };

    this.animFrameId = requestAnimationFrame(trackLoop);
  }

  /**
   * Process a single video frame
   */
  async processCurrentFrame() {
    if (!this.videoElement || this.videoElement.readyState < 2) return;
    if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) return;

    if (this.isMediaPipeReady && this.mediaPipeHands) {
      try {
        let inputSource = this.videoElement;

        // When using a mirrored user-facing camera (e.g. laptop webcam),
        // pre-mirror the frame horizontally so MediaPipe receives the mirrored selfie
        // it was specifically trained for. This ensures:
        // 1. Right palm is classified as RIGHT palm (not left/back)
        // 2. Back-of-hand is accurately identified as dorsal surface and rejected
        // 3. Landmark coordinates naturally match the CSS-mirrored video 1:1
        if (this.isMirrored) {
          if (!this.mirrorCanvas) {
            this.mirrorCanvas = document.createElement('canvas');
          }
          const vw = this.videoElement.videoWidth || 640;
          const vh = this.videoElement.videoHeight || 480;
          if (this.mirrorCanvas.width !== vw || this.mirrorCanvas.height !== vh) {
            this.mirrorCanvas.width = vw;
            this.mirrorCanvas.height = vh;
          }
          const ctx = this.mirrorCanvas.getContext('2d');
          if (ctx) {
            ctx.save();
            ctx.translate(vw, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(this.videoElement, 0, 0, vw, vh);
            ctx.restore();
            inputSource = this.mirrorCanvas;
          }
        }

        await this.mediaPipeHands.send({ image: inputSource });
        return;
      } catch (err) {
        // Fall back to contour detector if MediaPipe throws
      }
    }

    // Fallback: Algorithmic skin locus & contour detection
    this.runContourFallback();
  }

  /**
   * Pure JS contour fallback when MediaPipe is offline or unsupported
   */
  runContourFallback() {
    if (!this.videoElement || !this.onFrameCallback) return;

    // Sub-sample frame to 320x240 for 30+ FPS pure JS contour performance
    const targetW = 320;
    const targetH = 240;

    if (!this.fallbackCanvas) {
      this.fallbackCanvas = document.createElement('canvas');
      this.fallbackCanvas.width = targetW;
      this.fallbackCanvas.height = targetH;
    }

    const ctx = this.fallbackCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (this.isMirrored) {
      ctx.save();
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(this.videoElement, 0, 0, targetW, targetH);
      ctx.restore();
    } else {
      ctx.drawImage(this.videoElement, 0, 0, targetW, targetH);
    }
    const imgData = ctx.getImageData(0, 0, targetW, targetH);

    const hand = HandDetector.detect({
      width: targetW,
      height: targetH,
      data: imgData.data
    }, { expectedHandedness: this.expectedHandedness });

    if (hand.detected && hand.landmarks?.length >= 21) {
      const smoothed = this.smoother.update(hand.landmarks);
      this.onFrameCallback({
        detected: true,
        landmarks: smoothed || hand.landmarks,
        rawLandmarks: hand.landmarks,
        handedness: hand.handedness,
        isMediaPipe: false
      });
    } else {
      const persisted = this.smoother.update(null);
      this.onFrameCallback({
        detected: Boolean(persisted),
        landmarks: persisted,
        rawLandmarks: null,
        handedness: this.expectedHandedness,
        isMediaPipe: false
      });
    }
  }

  /**
   * Stop tracking and clean up resources
   */
  stop() {
    this.isTracking = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.smoother.reset();
    this.videoElement = null;
    this.onFrameCallback = null;
  }

  /**
   * Set expected handedness ('LEFT' | 'RIGHT')
   * @param {string} handedness 
   * @param {boolean} [isMirrored=null]
   */
  setHandedness(handedness, isMirrored = null) {
    this.expectedHandedness = handedness === 'LEFT' ? 'LEFT' : 'RIGHT';
    if (isMirrored !== null) {
      this.isMirrored = Boolean(isMirrored);
    }
  }

  /**
   * Computes exact screen coordinate projection for video styled with object-fit: cover
   * Maps normalized landmark (0..1, 0..1) to viewport pixels without aspect-ratio distortion.
   * 
   * @param {number} boxW - Viewport / container width
   * @param {number} boxH - Viewport / container height
   * @param {number} vidW - Raw video stream width
   * @param {number} vidH - Raw video stream height
   * @param {boolean} isMirrored - True if webcam is flipped horizontally
   * @returns {(normX: number, normY: number) => {x: number, y: number}}
   */
  static computeCoverProjection(boxW, boxH, vidW, vidH, isMirrored = false) {
    if (!vidW || !vidH || !boxW || !boxH) {
      return (normX, normY) => ({
        x: Math.round(isMirrored ? (1 - normX) * boxW : normX * boxW),
        y: Math.round(normY * boxH)
      });
    }

    const scale = Math.max(boxW / vidW, boxH / vidH);
    const renderedW = vidW * scale;
    const renderedH = vidH * scale;
    const offsetX = (boxW - renderedW) / 2;
    const offsetY = (boxH - renderedH) / 2;

    return (normX, normY) => {
      const projX = isMirrored ? (1 - normX) : normX;
      return {
        x: Math.round(offsetX + projX * renderedW),
        y: Math.round(offsetY + normY * renderedH)
      };
    };
  }
}
