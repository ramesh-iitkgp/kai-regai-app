/**
 * Kai RegAI — Landmark Smoothing Filter
 * Phase: P6 — Real-time Hand Scanner Experience
 * 
 * Adaptive Exponential Moving Average (EMA) filter for 21-point hand landmarks.
 * Eliminates webcam sensor noise and frame-to-frame coordinate jitter
 * while remaining responsive to intentional hand gestures and repositioning.
 */

export class LandmarkSmoother {
  /**
   * @param {Object} [options]
   * @param {number} [options.baseAlpha=0.30] - Default smoothing coefficient (0 = frozen, 1 = no smoothing)
   * @param {number} [options.stillAlpha=0.15] - Heavy smoothing coefficient when hand is stationary
   * @param {number} [options.motionAlpha=0.65] - Fast responsive coefficient when hand is moving quickly
   * @param {number} [options.jitterThreshold=0.015] - Normalized distance threshold for stationary filtering
   * @param {number} [options.motionThreshold=0.060] - Normalized distance threshold for rapid motion
   * @param {number} [options.maxMissingFrames=5] - Frames to persist previous landmarks across momentary detection drops
   */
  constructor(options = {}) {
    this.baseAlpha = options.baseAlpha ?? 0.30;
    this.stillAlpha = options.stillAlpha ?? 0.15;
    this.motionAlpha = options.motionAlpha ?? 0.65;
    this.jitterThreshold = options.jitterThreshold ?? 0.015;
    this.motionThreshold = options.motionThreshold ?? 0.060;
    this.maxMissingFrames = options.maxMissingFrames ?? 5;

    this.smoothedLandmarks = null;
    this.missingFramesCount = 0;
  }

  /**
   * Reset smoothing state (e.g. when camera flips or session restarts)
   */
  reset() {
    this.smoothedLandmarks = null;
    this.missingFramesCount = 0;
  }

  /**
   * Smooth incoming raw landmarks
   * @param {Array<{x: number, y: number, z?: number, id?: number, name?: string, visibility?: number}> | null} rawLandmarks
   * @returns {Array<{x: number, y: number, z?: number, id?: number, name?: string, visibility?: number}> | null}
   */
  update(rawLandmarks) {
    if (!rawLandmarks || !Array.isArray(rawLandmarks) || rawLandmarks.length === 0) {
      this.missingFramesCount++;
      if (this.missingFramesCount > this.maxMissingFrames) {
        this.smoothedLandmarks = null;
        return null;
      }
      return this.smoothedLandmarks;
    }

    this.missingFramesCount = 0;

    // First detection: seed smoothed buffer directly
    if (!this.smoothedLandmarks || this.smoothedLandmarks.length !== rawLandmarks.length) {
      this.smoothedLandmarks = rawLandmarks.map(pt => ({ ...pt }));
      return this.smoothedLandmarks;
    }

    // Measure overall hand displacement to select adaptive alpha
    let maxDist = 0;
    for (let i = 0; i < rawLandmarks.length; i++) {
      const r = rawLandmarks[i];
      const s = this.smoothedLandmarks[i];
      const d = Math.hypot(r.x - s.x, r.y - s.y);
      if (d > maxDist) maxDist = d;
    }

    // Adaptive alpha selection
    let alpha = this.baseAlpha;
    if (maxDist <= this.jitterThreshold) {
      alpha = this.stillAlpha; // Dampen microscopic sensor jitter
    } else if (maxDist >= this.motionThreshold) {
      alpha = this.motionAlpha; // Instant responsiveness during hand movement
    } else {
      // Linear interpolation between still and motion
      const t = (maxDist - this.jitterThreshold) / (this.motionThreshold - this.jitterThreshold);
      alpha = this.stillAlpha + t * (this.motionAlpha - this.stillAlpha);
    }

    // Apply exponential smoothing across all points
    for (let i = 0; i < rawLandmarks.length; i++) {
      const raw = rawLandmarks[i];
      const smooth = this.smoothedLandmarks[i];

      smooth.x += alpha * (raw.x - smooth.x);
      smooth.y += alpha * (raw.y - smooth.y);

      if (raw.z !== undefined && smooth.z !== undefined) {
        smooth.z += alpha * (raw.z - smooth.z);
      }
      if (raw.visibility !== undefined) {
        smooth.visibility = raw.visibility;
      }
      if (raw.id !== undefined) smooth.id = raw.id;
      if (raw.name !== undefined) smooth.name = raw.name;
    }

    return this.smoothedLandmarks;
  }
}
