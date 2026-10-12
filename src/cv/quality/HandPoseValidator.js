/**
 * Kai RegAI — Real-Time Hand Pose & Palm Usability Validator
 * Phase: P6 — Hand Scanner Experience & Robustness
 * 
 * Verifies that the detected hand is an authentic, OPEN, FLAT palmar surface
 * suitable for chiromancy, preventing false scans on:
 * - Closed fists / folded fingers
 * - Hands moved out of view / momentary flickers
 * - Extreme hand tilts or upside-down poses
 * - Hands too far or excessively close / clipped
 * - Back of hand (dorsal surface)
 */

export const POSE_STATUS = {
  PALM_READY: 'PALM_READY',
  NO_HAND: 'NO_HAND',
  FIST_DETECTED: 'FIST_DETECTED',
  PALM_TOO_FAR: 'PALM_TOO_FAR',
  PALM_TOO_CLOSE: 'PALM_TOO_CLOSE',
  EXCESSIVE_TILT: 'EXCESSIVE_TILT',
  BACK_OF_HAND: 'BACK_OF_HAND'
};

export class HandPoseValidator {
  /**
   * Validate 21-point landmarks for open palm geometry
   * @param {Array<{x: number, y: number, z?: number}> | null} landmarks 
   * @param {Object} [options]
   * @param {string} [options.expectedHandedness='RIGHT'] - 'RIGHT' or 'LEFT'
   * @param {string} [options.detectedHandedness] - 'RIGHT' or 'LEFT' from MediaPipe ML classifier
   * @param {boolean} [options.isMirrored=false]
   * @returns {{ valid: boolean, status: string, message: string, details?: Object }}
   */
  static validate(landmarks, options = {}) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 21) {
      return {
        valid: false,
        status: POSE_STATUS.NO_HAND,
        message: 'Place your open palm in view to scan'
      };
    }

    const wrist = landmarks[0];
    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexTip = landmarks[8];

    const middleMcp = landmarks[9];
    const middlePip = landmarks[10];
    const middleTip = landmarks[12];

    const ringMcp = landmarks[13];
    const ringPip = landmarks[14];
    const ringTip = landmarks[16];

    const pinkyMcp = landmarks[17];
    const pinkyPip = landmarks[18];
    const pinkyTip = landmarks[20];

    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // 1. Check for Closed Fist / Folded Fingers
    // In an open palm, fingertips extend outward away from the wrist beyond the PIP joint.
    // In a fist or curled fingers, fingertips fold into the palm and sit close to MCP/wrist.
    const fingers = [
      { name: 'index', mcp: indexMcp, pip: indexPip, tip: indexTip },
      { name: 'middle', mcp: middleMcp, pip: middlePip, tip: middleTip },
      { name: 'ring', mcp: ringMcp, pip: ringPip, tip: ringTip },
      { name: 'pinky', mcp: pinkyMcp, pip: pinkyPip, tip: pinkyTip }
    ];

    let curledCount = 0;
    for (const f of fingers) {
      const tipToWrist = dist(f.tip, wrist);
      const pipToWrist = dist(f.pip, wrist);
      const tipToMcp = dist(f.tip, f.mcp);
      const pipToMcp = dist(f.pip, f.mcp);

      // Curled if tip is closer to wrist than PIP or collapsed onto MCP
      if (tipToWrist < pipToWrist * 1.05 || tipToMcp < pipToMcp * 0.82) {
        curledCount++;
      }
    }

    if (curledCount >= 2) {
      return {
        valid: false,
        status: POSE_STATUS.FIST_DETECTED,
        message: 'Open your palm flat with fingers extended',
        details: { curledCount }
      };
    }

    // 2. Hand Scale Check (Too Far / Too Close)
    const palmWidth = dist(indexMcp, pinkyMcp);
    const palmHeight = dist(middleMcp, wrist);

    if (palmWidth < 0.08 || palmHeight < 0.10) {
      return {
        valid: false,
        status: POSE_STATUS.PALM_TOO_FAR,
        message: 'Bring your palm a bit closer to the camera',
        details: { palmWidth, palmHeight }
      };
    }

    if (palmWidth > 0.70 || palmHeight > 0.88) {
      return {
        valid: false,
        status: POSE_STATUS.PALM_TOO_CLOSE,
        message: 'Move your hand a bit further back',
        details: { palmWidth, palmHeight }
      };
    }

    // 3. Hand Orientation / Tilt Check (Wrist -> Middle Finger axis)
    const dx = middleMcp.x - wrist.x;
    const dy = wrist.y - middleMcp.y; // Positive when fingers point upward
    const angleRad = Math.atan2(dx, dy);
    const tiltDeg = Math.abs((angleRad * 180) / Math.PI);

    // If fingers point downwards or tilt exceeds 55 degrees
    if (dy <= -0.05 || tiltDeg > 55) {
      return {
        valid: false,
        status: POSE_STATUS.EXCESSIVE_TILT,
        message: 'Hold your palm upright facing the camera',
        details: { tiltDeg, dy }
      };
    }

    // 4. Palmar vs Dorsal Surface (Back of Hand) & Handedness Validation
    const expectedHandedness = (options.expectedHandedness || 'RIGHT').toUpperCase();
    const detectedHandedness = options.detectedHandedness ? options.detectedHandedness.toUpperCase() : null;
    const isMirrored = Boolean(options.isMirrored);
    const targetName = expectedHandedness === 'RIGHT' ? 'right' : 'left';

    // A. Check Handedness Classifier (if available)
    if (detectedHandedness && detectedHandedness !== expectedHandedness) {
      return {
        valid: false,
        status: POSE_STATUS.BACK_OF_HAND,
        message: `Turn your hand around — show your open ${targetName} palm`,
        details: { expectedHandedness, detectedHandedness }
      };
    }

    // B. Geometric Cross-Product Palm Normal Verification
    // Vector up the hand (Wrist -> Middle MCP)
    const vUp = { x: middleMcp.x - wrist.x, y: middleMcp.y - wrist.y };
    // Vector across the knuckles (Pinky MCP -> Index MCP)
    const vAcross = { x: indexMcp.x - pinkyMcp.x, y: indexMcp.y - pinkyMcp.y };
    
    // In canonical screen coordinates (Y down):
    // For an open RIGHT palm facing camera, Thumb & Index are to the lateral side (Left of Pinky, vAcross.x < 0).
    // Fingers point UP (vUp.y < 0).
    // cross = vUp.x * vAcross.y - vUp.y * vAcross.x < 0 (negative).
    // For an open LEFT palm, Index is to the right of Pinky (vAcross.x > 0) => cross > 0 (positive).
    // When the hand is flipped 180 deg to show the back of the hand, Index and Pinky swap,
    // inverting the cross product sign!
    const cross = vUp.x * vAcross.y - vUp.y * vAcross.x;
    const lenUp = Math.hypot(vUp.x, vUp.y);
    const lenAcross = Math.hypot(vAcross.x, vAcross.y);
    const normCross = cross / (lenUp * lenAcross || 1);

    // Canonical sign: RIGHT palm is negative (-1), LEFT palm is positive (+1)
    let expectedSign = expectedHandedness === 'RIGHT' ? -1 : 1;
    if (isMirrored) {
      expectedSign = -expectedSign;
    }

    // Reject if cross product magnitude is distinct and has opposite sign
    if (Math.abs(normCross) >= 0.15 && Math.sign(normCross) !== expectedSign) {
      return {
        valid: false,
        status: POSE_STATUS.BACK_OF_HAND,
        message: `Turn your hand around — show your open ${targetName} palm`,
        details: { normCross, expectedSign }
      };
    }

    // C. 3D Anatomical Depth Check (when z-coordinates are available from MediaPipe)
    if (typeof indexTip?.z === 'number' && typeof indexMcp?.z === 'number') {
      const avgTipZ = ((indexTip.z || 0) + (middleTip.z || 0) + (ringTip.z || 0) + (pinkyTip.z || 0)) / 4;
      const avgMcpZ = ((indexMcp.z || 0) + (middleMcp.z || 0) + (ringMcp.z || 0) + (pinkyMcp.z || 0)) / 4;
      // In dorsal orientation (back of hand), knuckles are closest to camera
      // while resting/extended fingers angle into depth (avgTipZ > avgMcpZ + 0.09)
      if (avgTipZ - avgMcpZ > 0.10) {
        return {
          valid: false,
          status: POSE_STATUS.BACK_OF_HAND,
          message: `Turn your hand around — show your open ${targetName} palm`,
          details: { avgTipZ, avgMcpZ, depthDiff: avgTipZ - avgMcpZ }
        };
      }
    }

    return {
      valid: true,
      status: POSE_STATUS.PALM_READY,
      message: 'Hold steady — reading your palm creases…',
      details: { curledCount, palmWidth, palmHeight, tiltDeg, normCross }
    };
  }
}
