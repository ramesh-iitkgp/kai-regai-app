/**
 * Kai RegAI — Palm Usability & Positioning Validator
 * Phase: P5.2 — Real-Palm Robustness & Production Capture Hardening
 * Version: 5.2.0
 * 
 * Assesses whether the captured palm region provides sufficient usable area,
 * proper scale, acceptable orientation, and unobstructed anatomical zones
 * before crease extraction.
 * 
 * Distinguishes between:
 * - Line actually detected
 * - Line structurally absent
 * - Line outside camera field of view (cropped/out-of-frame)
 * - Insufficient evidence due to extreme scale/tilt
 */

import { PalmCVConfig } from '../config/defaultConfig.js';

export class PalmUsabilityValidator {
  /**
   * Validate palm coverage, orientation, scale, and anatomical field of view
   * @param {import('../types.js').PalmImage} image
   * @param {import('../types.js').HandDetectionResult} hand
   * @param {Object} [customConfig]
   * @returns {import('../types.js').PalmUsabilityResult}
   */
  static validate(image, hand, customConfig = {}) {
    const config = { ...PalmCVConfig.usability, ...customConfig };
    const { width, height } = image;
    const totalArea = width * height;

    const reasons = [];
    const warnings = [];

    if (!hand || !hand.detected || !hand.landmarks || hand.landmarks.length < 21) {
      return {
        usable: false,
        score: 0,
        reasons: ['NO_PALM_DETECTED'],
        warnings: [],
        recommendedAction: 'RECAPTURE',
        details: {
          palmAreaFraction: 0,
          tiltAngleDeg: 0,
          wristVisible: false,
          isMultiHand: false,
          isCropped: true,
          visibleRegions: {
            LIFE: false,
            HEAD: false,
            HEART: false,
            FATE: false,
            SUN: false
          }
        }
      };
    }

    const bbox = hand.boundingBox || { x: 0, y: 0, width, height };
    const bboxArea = bbox.width * bbox.height;
    const palmAreaFraction = Number((bboxArea / totalArea).toFixed(3));

    // 1. Palm Scale Check
    if (palmAreaFraction < config.minPalmAreaFraction) {
      reasons.push('PALM_TOO_FAR');
    } else if (palmAreaFraction > config.maxPalmAreaFraction) {
      reasons.push('PALM_TOO_CLOSE');
    }

    // 2. Hand Orientation / Tilt Calculation (Wrist -> Middle MCP)
    const wrist = hand.landmarks[0];
    const middleMcp = hand.landmarks[9];
    const dx = (middleMcp.x - wrist.x) * width;
    const dy = (wrist.y - middleMcp.y) * height; // Inverted image Y
    const orientationRad = Math.atan2(dx, dy);
    const tiltAngleDeg = Number(Math.abs((orientationRad * 180) / Math.PI).toFixed(1));

    if (tiltAngleDeg > config.maxAcceptableTiltDeg) {
      reasons.push('EXCESSIVE_TILT');
    } else if (tiltAngleDeg > config.warningTiltDeg) {
      warnings.push('MODERATE_TILT');
    }

    // 3. Cropping & Boundary Proximity
    const marginPx = Math.max(3, Math.min(width, height) * 0.02);
    const isLeftClipped = bbox.x <= marginPx;
    const isRightClipped = (bbox.x + bbox.width) >= (width - marginPx);
    const isTopClipped = bbox.y <= marginPx;
    const isBotClipped = (bbox.y + bbox.height) >= (height - marginPx);

    // Natural wrist exit at bottom is acceptable; top/lateral clipping indicates cropped palm
    const isCropped = isLeftClipped || isRightClipped || isTopClipped;
    if (isCropped) {
      reasons.push('PALM_CROPPED');
    }

    const wristVisible = !isBotClipped || (wrist.y <= 0.95);
    if (!wristVisible) {
      warnings.push('PARTIAL_WRIST_VISIBILITY');
    }

    // 4. Multi-hand Presence
    const isMultiHand = Boolean(hand.multipleHandsDetected);
    if (isMultiHand) {
      reasons.push('MULTIPLE_HANDS_DETECTED');
    }

    // 5. Anatomical Region Field-of-View Mapping
    // Determine if the typical anatomical zone for each line is inside the visible image
    const isRightHand = hand.handedness === 'RIGHT';
    const thumbSideClipped = isRightHand ? isLeftClipped : isRightClipped;
    const pinkySideClipped = isRightHand ? isRightClipped : isLeftClipped;

    const visibleRegions = {
      LIFE: !thumbSideClipped && !isBotClipped,
      HEAD: !thumbSideClipped && !pinkySideClipped,
      HEART: !pinkySideClipped && !isTopClipped,
      FATE: wristVisible && !isTopClipped,
      SUN: !pinkySideClipped && wristVisible
    };

    // Usability composite scoring
    let scalePenalty = 0;
    if (palmAreaFraction < config.minPalmAreaFraction) {
      scalePenalty = 1.0 - (palmAreaFraction / config.minPalmAreaFraction);
    } else if (palmAreaFraction > config.maxPalmAreaFraction) {
      scalePenalty = (palmAreaFraction - config.maxPalmAreaFraction) / (1.0 - config.maxPalmAreaFraction);
    }

    const tiltPenalty = Math.min(1.0, tiltAngleDeg / 90.0);
    const cropPenalty = isCropped ? 0.35 : 0;
    const multiPenalty = isMultiHand ? 0.50 : 0;

    const score = Number(Math.max(0, 1.0 - (scalePenalty * 0.4 + tiltPenalty * 0.3 + cropPenalty + multiPenalty)).toFixed(3));

    const usable = reasons.length === 0 && score >= config.minUsabilityScore;

    let recommendedAction = 'PROCEED';
    if (!usable) {
      if (reasons.includes('MULTIPLE_HANDS_DETECTED') || reasons.includes('EXCESSIVE_TILT')) {
        recommendedAction = 'USER_CORRECTION';
      } else if (reasons.includes('PALM_TOO_FAR') || reasons.includes('PALM_CROPPED')) {
        recommendedAction = 'RECAPTURE';
      } else {
        recommendedAction = 'INSUFFICIENT_EVIDENCE';
      }
    }

    return {
      usable,
      score,
      reasons,
      warnings,
      recommendedAction,
      details: {
        palmAreaFraction,
        tiltAngleDeg,
        wristVisible,
        isMultiHand,
        isCropped,
        visibleRegions
      }
    };
  }
}
