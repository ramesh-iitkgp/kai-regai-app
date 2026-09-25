/**
 * Kai RegAI — Palm Segmentation & Rectification Engine
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Extracts the palmar region of interest (ROI) excluding distal fingers and lower wrist.
 * Computes anatomical orientation angle (wrist -> middle finger MCP) to rectify
 * the palm into a canonical vertical coordinate frame.
 */

import { PalmCVConfig } from '../config/defaultConfig.js';
import { ImageIngestion } from '../image/ImageIngestion.js';

export class PalmSegmentation {
  /**
   * Segment and rectify palmar ROI from detected hand
   * @param {import('../types.js').PalmImage} image
   * @param {import('../types.js').HandDetectionResult} handResult
   * @returns {import('../types.js').PalmROI & { roiPatch: Uint8Array, roiSize: number }}
   */
  static extractPalmROI(image, handResult) {
    if (!handResult.detected || !handResult.landmarks || handResult.landmarks.length < 21) {
      throw new Error('Cannot extract Palm ROI: valid hand landmarks not detected.');
    }

    const { width, height } = image;
    const gray = ImageIngestion.toGrayscale(image);
    const landmarks = handResult.landmarks;

    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];

    // Convert normalized coordinates to pixel space
    const wristPx = { x: wrist.x * width, y: wrist.y * height };
    const middleMcpPx = { x: middleMcp.x * width, y: middleMcp.y * height };
    const indexMcpPx = { x: indexMcp.x * width, y: indexMcp.y * height };
    const pinkyMcpPx = { x: pinkyMcp.x * width, y: pinkyMcp.y * height };

    // Orientation angle in radians (vertical alignment: 0 rad means straight up from wrist)
    const dx = middleMcpPx.x - wristPx.x;
    const dy = wristPx.y - middleMcpPx.y; // Inverted image Y
    const orientation = Math.atan2(dx, dy);

    // Palm center estimated at midpoint between wrist and middle MCP
    const palmCenterX = (wristPx.x + middleMcpPx.x) / 2;
    const palmCenterY = (wristPx.y + middleMcpPx.y) / 2;

    // Palm span: distance between index MCP and pinky MCP
    const palmSpan = Math.hypot(pinkyMcpPx.x - indexMcpPx.x, pinkyMcpPx.y - indexMcpPx.y);
    const palmHeight = Math.hypot(middleMcpPx.x - wristPx.x, middleMcpPx.y - wristPx.y);
    const palmRadius = Math.max(palmSpan, palmHeight) * 0.75;

    // Bounding box in source image coords
    const roiBox = {
      x: Math.max(0, Math.round(palmCenterX - palmRadius)),
      y: Math.max(0, Math.round(palmCenterY - palmRadius)),
      width: Math.min(width - 1, Math.round(palmRadius * 2)),
      height: Math.min(height - 1, Math.round(palmRadius * 2))
    };

    const canonicalSize = PalmCVConfig.resolution.canonicalRoiSize;
    const roiPatch = new Uint8Array(canonicalSize * canonicalSize);
    const mask = new Uint8Array(canonicalSize * canonicalSize);

    // Sample rectified patch with inverse rotation
    const cosTheta = Math.cos(orientation);
    const sinTheta = Math.sin(orientation);
    const scale = (palmRadius * 2) / canonicalSize;

    for (let py = 0; py < canonicalSize; py++) {
      const v = (py - canonicalSize / 2) * scale;
      for (let px = 0; px < canonicalSize; px++) {
        const u = (px - canonicalSize / 2) * scale;

        // Rotate (u, v) by orientation
        const srcX = Math.round(palmCenterX + u * cosTheta - v * sinTheta);
        const srcY = Math.round(palmCenterY + u * sinTheta + v * cosTheta);

        const patchIdx = py * canonicalSize + px;
        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const val = gray[srcY * width + srcX];
          roiPatch[patchIdx] = val;

          // Circular palmar mask (elliptical falloff avoiding outer boundary edge)
          const normDistSq = (u * u) / (palmSpan * palmSpan || 1) + (v * v) / (palmHeight * palmHeight || 1);
          mask[patchIdx] = normDistSq <= 0.65 ? 255 : 0;
        } else {
          roiPatch[patchIdx] = 0;
          mask[patchIdx] = 0;
        }
      }
    }

    return {
      mask,
      roiPatch,
      roiSize: canonicalSize,
      boundingBox: roiBox,
      landmarks,
      orientation,
      scale
    };
  }
}
