/**
 * Kai RegAI — Retake Decision Engine
 * Phase: P5.2 — Real-Palm Robustness & Production Capture Hardening
 * Version: 5.2.0
 * 
 * Deterministic capture-quality gate that evaluates:
 * - Optical quality metrics (sharpness, exposure, contrast, glare, framing)
 * - Hand presence and multi-hand detection
 * - Palm region usability and coverage
 * 
 * Synthesizes actionable, non-technical guidance for the user:
 * - "Move your palm closer."
 * - "Avoid direct glare on the palm."
 * - "Keep the entire palm inside the frame."
 * - "Use brighter, even lighting."
 * - "Hold your hand steady."
 * - "Place your palm flat and fully visible."
 * 
 * Never overwhelms the user with raw engineering diagnostics.
 */

export class RetakeDecisionEngine {
  /**
   * Evaluate capture state and decide whether retake is required
   * @param {import('../types.js').ImageQualityResult} imageQuality
   * @param {import('../types.js').HandDetectionResult} hand
   * @param {import('../types.js').PalmUsabilityResult} [usability]
   * @returns {import('../types.js').RetakeDecision}
   */
  static evaluate(imageQuality, hand, usability = null) {
    const detailedGuidance = [];

    // 1. Optical Quality Deficiencies (evaluated first because optical failure precedes hand analysis)
    if (imageQuality && !imageQuality.passed) {
      const qReasons = imageQuality.reasons || [];

      // Underexposure
      if (qReasons.includes('UNDEREXPOSED') || imageQuality.illumination < 0.40) {
        return {
          action: 'USER_CORRECTION',
          needsRetake: true,
          primaryMessage: 'Use brighter, even lighting.',
          detailedGuidance: ['Move into a well-lit area or use ambient room light.'],
          diagnosticCode: 'F10_UNDEREXPOSED'
        };
      }

      // Overexposure
      if (qReasons.includes('OVEREXPOSED')) {
        return {
          action: 'USER_CORRECTION',
          needsRetake: true,
          primaryMessage: 'Reduce direct lighting or harsh flash.',
          detailedGuidance: ['Move away from intense overhead light.'],
          diagnosticCode: 'F10_OVEREXPOSED'
        };
      }

      // Specular glare
      if (qReasons.includes('SPECULAR_GLARE') || imageQuality.glare < 0.60) {
        return {
          action: 'USER_CORRECTION',
          needsRetake: true,
          primaryMessage: 'Avoid direct glare on the palm.',
          detailedGuidance: ['Tilt your palm slightly away from bright reflections or turn off flash.'],
          diagnosticCode: 'F10_SPECULAR_GLARE'
        };
      }

      // Motion blur / soft focus
      if (qReasons.includes('MOTION_BLUR_OR_SOFT_FOCUS') || imageQuality.sharpness < 0.40) {
        return {
          action: 'RECAPTURE',
          needsRetake: true,
          primaryMessage: 'Hold your hand steady.',
          detailedGuidance: ['Keep your hand and phone completely still until focus locks.'],
          diagnosticCode: 'F10_MOTION_BLUR'
        };
      }

      // Border clipping
      if (qReasons.includes('PALM_CLIPPED_AT_BORDER') || imageQuality.framing < 0.50) {
        return {
          action: 'RECAPTURE',
          needsRetake: true,
          primaryMessage: 'Keep the entire palm inside the frame.',
          detailedGuidance: ['Center your palm inside the alignment guide.'],
          diagnosticCode: 'F11_BORDER_CLIPPED'
        };
      }

      // Low contrast
      if (qReasons.includes('LOW_CONTRAST') || imageQuality.contrast < 0.40) {
        return {
          action: 'USER_CORRECTION',
          needsRetake: true,
          primaryMessage: 'Adjust angle relative to light so palm lines are visible.',
          detailedGuidance: ['Angled light casts subtle shadows across palm creases making them visible.'],
          diagnosticCode: 'F6_LOW_CONTRAST'
        };
      }

      // Low resolution
      if (qReasons.includes('LOW_RESOLUTION') || imageQuality.resolution < 0.50) {
        return {
          action: 'RECAPTURE',
          needsRetake: true,
          primaryMessage: 'Move your palm closer.',
          detailedGuidance: ['Hold your hand closer to improve image resolution.'],
          diagnosticCode: 'F6_LOW_RESOLUTION'
        };
      }

      // Generic optical gate fail
      return {
        action: 'RECAPTURE',
        needsRetake: true,
        primaryMessage: 'Please capture palm again with steady, even lighting.',
        detailedGuidance: imageQuality.recommendations || ['Ensure steady posture and clear lighting.'],
        diagnosticCode: 'F10_OPTICAL_GATE_FAILED'
      };
    }

    // 2. Hand presence check
    if (!hand || !hand.detected) {
      if (hand && hand.reasons && hand.reasons.includes('PALM_TOO_FAR')) {
        return {
          action: 'RECAPTURE',
          needsRetake: true,
          primaryMessage: 'Move your palm closer.',
          detailedGuidance: ['Hold your hand closer so your palm fills the alignment guide.'],
          diagnosticCode: 'F11_PALM_TOO_FAR'
        };
      }
      return {
        action: 'RECAPTURE',
        needsRetake: true,
        primaryMessage: 'Place your palm flat and fully visible inside the frame.',
        detailedGuidance: ['Ensure your hand is open with your palm facing the camera.'],
        diagnosticCode: 'F11_NO_HAND_DETECTED'
      };
    }

    // 3. Multi-hand ambiguity check
    if (hand.multipleHandsDetected || (usability && usability.details && usability.details.isMultiHand)) {
      return {
        action: 'USER_CORRECTION',
        needsRetake: true,
        primaryMessage: 'Ensure only one palm is visible in frame.',
        detailedGuidance: ['Remove secondary hand from camera view to ensure single-palm analysis.'],
        diagnosticCode: 'F11_MULTIPLE_HANDS'
      };
    }

    // 4. Palm Usability & Positioning Checks
    if (usability && !usability.usable) {
      const uReasons = usability.reasons || [];

      if (uReasons.includes('PALM_TOO_FAR') || (usability.details && usability.details.palmAreaFraction < 0.10)) {
        return {
          action: 'RECAPTURE',
          needsRetake: true,
          primaryMessage: 'Move your palm closer.',
          detailedGuidance: ['Hold your hand closer so your palm fills the alignment guide.'],
          diagnosticCode: 'F11_PALM_TOO_FAR'
        };
      }

      if (uReasons.includes('PALM_TOO_CLOSE') || (usability.details && usability.details.palmAreaFraction > 0.88)) {
        return {
          action: 'USER_CORRECTION',
          needsRetake: true,
          primaryMessage: 'Move hand slightly further from camera.',
          detailedGuidance: ['Step back slightly so the outer edges of your palm fit inside the frame.'],
          diagnosticCode: 'F11_PALM_TOO_CLOSE'
        };
      }

      if (uReasons.includes('EXCESSIVE_TILT') || (usability.details && usability.details.tiltAngleDeg > 45.0)) {
        return {
          action: 'USER_CORRECTION',
          needsRetake: true,
          primaryMessage: 'Place your palm flat and upright facing the camera.',
          detailedGuidance: ['Align your hand vertically with your fingers pointing up.'],
          diagnosticCode: 'F11_EXCESSIVE_TILT'
        };
      }

      if (uReasons.includes('PALM_CROPPED')) {
        return {
          action: 'RECAPTURE',
          needsRetake: true,
          primaryMessage: 'Keep the entire palm inside the frame.',
          detailedGuidance: ['Position your hand so no part of the palm is clipped by the screen edges.'],
          diagnosticCode: 'F11_PALM_CROPPED'
        };
      }
    }

    // 5. Warnings on Marginal (but acceptable) captures
    if (usability && usability.warnings && usability.warnings.length > 0) {
      if (usability.warnings.includes('MODERATE_TILT')) {
        detailedGuidance.push('Hand is slightly tilted; upright alignment recommended for optimal readings.');
      }
      if (usability.warnings.includes('PARTIAL_WRIST_VISIBILITY')) {
        detailedGuidance.push('Wrist emergence is partially clipped; lower crease confidence may be reduced.');
      }
    }

    // 6. Optimal or Acceptable capture: PROCEED
    return {
      action: 'PROCEED',
      needsRetake: false,
      primaryMessage: 'Palm capture verified.',
      detailedGuidance,
      diagnosticCode: 'OPTIMAL_CAPTURE'
    };
  }
}
