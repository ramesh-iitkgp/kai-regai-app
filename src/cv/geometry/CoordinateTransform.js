/**
 * Kai RegAI — Bidirectional Coordinate Transformation System
 * Phase: P5.1 — Real-Palm Validation & Calibration
 * Version: 5.1.0
 * 
 * Provides mathematically exact, reversible transformations between:
 * 1. Original Image Space: (X_orig, Y_orig)
 * 2. Ingestion/Normalized Image Space: (X_img, Y_img)
 * 3. Rectified Palm ROI Patch Space: (X_patch, Y_patch) in [0, 512]x[0, 512]
 * 4. Normalized Patch Space: (x_norm, y_norm) in [0, 1]x[0, 1]
 * 5. SVG Overlay Space: (x_overlay, y_overlay) in [0, 360]x[0, 450]
 */

export class CoordinateTransform {
  /**
   * Transform point from Original Image to Rectified Palm ROI patch
   * @param {import('../types.js').Point} pt - Point in original image coordinates
   * @param {import('../types.js').PalmROI} palmROI - Rectified palm ROI metadata
   * @param {Object} [imageMeta] - Metadata containing scale if original image was clamped
   * @returns {import('../types.js').Point} Point in [0, 512] patch coordinates
   */
  static imageToPalmROI(pt, palmROI, imageMeta = {}) {
    const clampScale = imageMeta.clampScale || 1.0;
    const xImg = pt.x * clampScale;
    const yImg = pt.y * clampScale;

    const cx = palmROI.boundingBox.x + palmROI.boundingBox.width / 2;
    const cy = palmROI.boundingBox.y + palmROI.boundingBox.height / 2;
    const theta = palmROI.orientation;
    const scale = palmROI.scale;
    const canonicalSize = palmROI.roiSize || 512;

    const dx = xImg - cx;
    const dy = yImg - cy;

    // Rotate by -theta to un-rotate into canonical vertical frame
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const u = dx * cosTheta + dy * sinTheta;
    const v = -dx * sinTheta + dy * cosTheta;

    return {
      x: canonicalSize / 2 + u / scale,
      y: canonicalSize / 2 + v / scale
    };
  }

  /**
   * Transform point from Rectified Palm ROI patch to Normalized [0, 1] space
   * @param {import('../types.js').Point} pt - Point in patch coordinates [0, 512]
   * @param {number} [roiSize=512]
   * @returns {import('../types.js').Point} Normalized point in [0, 1]x[0, 1]
   */
  static palmROIToNormalized(pt, roiSize = 512) {
    return {
      x: pt.x / roiSize,
      y: pt.y / roiSize
    };
  }

  /**
   * Transform point from Normalized [0, 1] space to SVG Overlay space (360x450)
   * @param {import('../types.js').Point} pt - Normalized point in [0, 1]
   * @param {number} [targetW=360]
   * @param {number} [targetH=450]
   * @returns {import('../types.js').Point} Point in SVG overlay coordinates
   */
  static normalizedToOverlay(pt, targetW = 360, targetH = 450) {
    return {
      x: pt.x * targetW,
      y: pt.y * targetH
    };
  }

  /**
   * Transform point from SVG Overlay space (360x450) back to Normalized [0, 1]
   * @param {import('../types.js').Point} pt - Point in SVG overlay coordinates
   * @param {number} [targetW=360]
   * @param {number} [targetH=450]
   * @returns {import('../types.js').Point} Normalized point in [0, 1]
   */
  static overlayToNormalized(pt, targetW = 360, targetH = 450) {
    return {
      x: pt.x / targetW,
      y: pt.y / targetH
    };
  }

  /**
   * Transform point from Normalized [0, 1] space back to Rectified Palm ROI patch
   * @param {import('../types.js').Point} pt - Normalized point in [0, 1]
   * @param {number} [roiSize=512]
   * @returns {import('../types.js').Point} Point in [0, roiSize]
   */
  static normalizedToPalmROI(pt, roiSize = 512) {
    return {
      x: pt.x * roiSize,
      y: pt.y * roiSize
    };
  }

  /**
   * Transform point from Rectified Palm ROI patch back to Original Image space
   * @param {import('../types.js').Point} pt - Point in patch coordinates [0, 512]
   * @param {import('../types.js').PalmROI} palmROI - Rectified palm ROI metadata
   * @param {Object} [imageMeta] - Metadata containing scale if original image was clamped
   * @returns {import('../types.js').Point} Point in original image coordinates
   */
  static palmROIToImage(pt, palmROI, imageMeta = {}) {
    const clampScale = imageMeta.clampScale || 1.0;
    const cx = palmROI.boundingBox.x + palmROI.boundingBox.width / 2;
    const cy = palmROI.boundingBox.y + palmROI.boundingBox.height / 2;
    const theta = palmROI.orientation;
    const scale = palmROI.scale;
    const canonicalSize = palmROI.roiSize || 512;

    const u = (pt.x - canonicalSize / 2) * scale;
    const v = (pt.y - canonicalSize / 2) * scale;

    // Rotate by +theta to restore original image orientation
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const dx = u * cosTheta - v * sinTheta;
    const dy = u * sinTheta + v * cosTheta;

    const xImg = cx + dx;
    const yImg = cy + dy;

    return {
      x: xImg / clampScale,
      y: yImg / clampScale
    };
  }

  /**
   * Complete End-to-End round-trip: Original -> Overlay
   */
  static originalToOverlay(pt, palmROI, imageMeta = {}, targetW = 360, targetH = 450) {
    const roiPt = this.imageToPalmROI(pt, palmROI, imageMeta);
    const normPt = this.palmROIToNormalized(roiPt, palmROI.roiSize || 512);
    return this.normalizedToOverlay(normPt, targetW, targetH);
  }

  /**
   * Complete End-to-End round-trip: Overlay -> Original
   */
  static overlayToOriginal(pt, palmROI, imageMeta = {}, targetW = 360, targetH = 450) {
    const normPt = this.overlayToNormalized(pt, targetW, targetH);
    const roiPt = this.normalizedToPalmROI(normPt, palmROI.roiSize || 512);
    return this.palmROIToImage(roiPt, palmROI, imageMeta);
  }

  /**
   * Transform an entire polyline between coordinate frames
   */
  static transformPolyline(polyline, transformFn) {
    return polyline.map(pt => transformFn(pt));
  }
}
