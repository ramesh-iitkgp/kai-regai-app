import test from 'node:test';
import assert from 'node:assert/strict';

import { HandPoseValidator, POSE_STATUS } from '../../src/cv/quality/HandPoseValidator.js';

function createMockHandLandmarks({ isFist = false, isTilt = false, isTooFar = false, isTooClose = false, isBackOfHand = false, handSide = 'RIGHT' } = {}) {
  // Base wrist at (0.50, 0.85)
  const wrist = { x: 0.50, y: isTilt ? 0.20 : 0.85 };
  const middleMcp = { x: 0.50, y: isTilt ? 0.80 : 0.55 };

  const landmarks = Array.from({ length: 21 }, (_, i) => ({ id: i, x: 0.5, y: 0.5 }));
  landmarks[0] = wrist;

  // In an open RIGHT PALM facing camera:
  // In an open RIGHT PALM (matching DEFAULT_MAP & HandDetector):
  // Thumb and Index are on the lateral side (Left of Pinky in image coordinates).
  // Index knuckle is at ~0.42, Pinky knuckle is at ~0.66.
  // In the BACK OF RIGHT HAND: Index and Pinky swap horizontal positions!
  let xOffsets;
  if (handSide === 'RIGHT') {
    xOffsets = isBackOfHand ? [0.66, 0.58, 0.50, 0.42] : [0.42, 0.50, 0.58, 0.66];
  } else {
    // Left hand
    xOffsets = isBackOfHand ? [0.42, 0.50, 0.58, 0.66] : [0.66, 0.58, 0.50, 0.42];
  }

  const thumbX = (handSide === 'RIGHT' && !isBackOfHand) || (handSide === 'LEFT' && isBackOfHand) ? 0.32 : 0.68;
  landmarks[1] = { x: thumbX - 0.05, y: 0.75 };
  landmarks[2] = { x: thumbX - 0.02, y: 0.65 };
  landmarks[3] = { x: thumbX, y: 0.58 };
  landmarks[4] = { x: thumbX + 0.02, y: 0.52 }; // Thumb tip

  const scale = isTooFar ? 0.1 : (isTooClose ? 2.5 : 1.0);

  xOffsets.forEach((xBase, fIdx) => {
    const startIdx = 5 + fIdx * 4;
    const mcpX = 0.50 + (xBase - 0.50) * scale;
    const mcpY = isTilt ? 0.80 : (0.55 + fIdx * 0.02);

    landmarks[startIdx] = { x: mcpX, y: mcpY }; // MCP
    landmarks[startIdx + 1] = { x: mcpX, y: isTilt ? 0.88 : (mcpY - 0.12 * scale) }; // PIP
    landmarks[startIdx + 2] = { x: mcpX, y: isTilt ? 0.94 : (mcpY - 0.20 * scale) }; // DIP

    if (isFist) {
      // In a fist, fingertips curl down/inward close to the MCP joint and closer to wrist
      landmarks[startIdx + 3] = { x: mcpX, y: mcpY + 0.02 }; // Curled in
    } else {
      // Open extended finger
      landmarks[startIdx + 3] = { x: mcpX, y: isTilt ? 1.00 : (mcpY - 0.28 * scale) }; // Tip
    }
  });

  return landmarks;
}

test('POSE-1: Identifies authentic open flat right palm as PALM_READY', () => {
  const openPalm = createMockHandLandmarks({ isFist: false, handSide: 'RIGHT' });
  const result = HandPoseValidator.validate(openPalm, { expectedHandedness: 'RIGHT', detectedHandedness: 'RIGHT' });

  assert.equal(result.valid, true);
  assert.equal(result.status, POSE_STATUS.PALM_READY);
  assert.ok(result.message.includes('Hold steady'));
});

test('POSE-2: Rejects closed fist / folded fingers with FIST_DETECTED guidance', () => {
  const fist = createMockHandLandmarks({ isFist: true, handSide: 'RIGHT' });
  const result = HandPoseValidator.validate(fist, { expectedHandedness: 'RIGHT', detectedHandedness: 'RIGHT' });

  assert.equal(result.valid, false);
  assert.equal(result.status, POSE_STATUS.FIST_DETECTED);
  assert.equal(result.message, 'Open your palm flat with fingers extended');
});

test('POSE-3: Rejects missing hand / null landmarks with NO_HAND guidance', () => {
  const r1 = HandPoseValidator.validate(null);
  assert.equal(r1.valid, false);
  assert.equal(r1.status, POSE_STATUS.NO_HAND);
  assert.equal(r1.message, 'Place your open palm in view to scan');

  const r2 = HandPoseValidator.validate([]);
  assert.equal(r2.valid, false);
  assert.equal(r2.status, POSE_STATUS.NO_HAND);
});

test('POSE-4: Rejects excessive tilt / upside down hand with EXCESSIVE_TILT guidance', () => {
  const tilted = createMockHandLandmarks({ isTilt: true, handSide: 'RIGHT' });
  const result = HandPoseValidator.validate(tilted, { expectedHandedness: 'RIGHT', detectedHandedness: 'RIGHT' });

  assert.equal(result.valid, false);
  assert.equal(result.status, POSE_STATUS.EXCESSIVE_TILT);
  assert.equal(result.message, 'Hold your palm upright facing the camera');
});

test('POSE-5: Rejects hand too far with PALM_TOO_FAR guidance', () => {
  const tooFar = createMockHandLandmarks({ isTooFar: true, handSide: 'RIGHT' });
  const result = HandPoseValidator.validate(tooFar, { expectedHandedness: 'RIGHT', detectedHandedness: 'RIGHT' });

  assert.equal(result.valid, false);
  assert.equal(result.status, POSE_STATUS.PALM_TOO_FAR);
  assert.equal(result.message, 'Bring your palm a bit closer to the camera');
});

test('POSE-6: Rejects back of hand (dorsal side) with BACK_OF_HAND guidance', () => {
  // Scenario A: ML classifier detects opposite hand on back-of-hand
  const openPalm = createMockHandLandmarks({ isFist: false, handSide: 'RIGHT' });
  const resML = HandPoseValidator.validate(openPalm, { expectedHandedness: 'RIGHT', detectedHandedness: 'LEFT' });
  assert.equal(resML.valid, false);
  assert.equal(resML.status, POSE_STATUS.BACK_OF_HAND);
  assert.ok(resML.message.includes('Turn your hand around'));

  // Scenario B: Geometric landmark orientation detects flipped knuckles
  const backOfHand = createMockHandLandmarks({ isFist: false, isBackOfHand: true, handSide: 'RIGHT' });
  const resGeom = HandPoseValidator.validate(backOfHand, { expectedHandedness: 'RIGHT' });
  assert.equal(resGeom.valid, false);
  assert.equal(resGeom.status, POSE_STATUS.BACK_OF_HAND);
  assert.ok(resGeom.message.includes('Turn your hand around'));
});

test('POSE-7: Accurately validates Left Palm and rejects Back of Left Hand', () => {
  const leftPalm = createMockHandLandmarks({ isFist: false, handSide: 'LEFT' });
  const resLeft = HandPoseValidator.validate(leftPalm, { expectedHandedness: 'LEFT', detectedHandedness: 'LEFT' });
  assert.equal(resLeft.valid, true);
  assert.equal(resLeft.status, POSE_STATUS.PALM_READY);

  const backOfLeft = createMockHandLandmarks({ isFist: false, isBackOfHand: true, handSide: 'LEFT' });
  const resBackLeft = HandPoseValidator.validate(backOfLeft, { expectedHandedness: 'LEFT' });
  assert.equal(resBackLeft.valid, false);
  assert.equal(resBackLeft.status, POSE_STATUS.BACK_OF_HAND);
  assert.ok(resBackLeft.message.includes('Turn your hand around'));
});

test('POSE-8: Rejects dorsal surface when 3D fingertip depth curves away from camera', () => {
  const palm = createMockHandLandmarks({ isFist: false, handSide: 'RIGHT' });
  // Add 3D coordinates where fingertips recede into the distance (convex back-of-hand posture)
  [5, 9, 13, 17].forEach(idx => { palm[idx].z = 0.0; }); // Knuckles closest to camera
  [8, 12, 16, 20].forEach(idx => { palm[idx].z = 0.16; }); // Tips receded by +0.16

  const resDepth = HandPoseValidator.validate(palm, { expectedHandedness: 'RIGHT' });
  assert.equal(resDepth.valid, false);
  assert.equal(resDepth.status, POSE_STATUS.BACK_OF_HAND);
  assert.ok(resDepth.message.includes('Turn your hand around'));
});

test('POSE-9: Accurately validates DEFAULT_MAP wireframe coordinates as PALM_READY', () => {
  // Canonical reference wireframe (Thumb on left at x~0.39, Index at x~0.44, Pinky at x~0.80)
  const landmarks = Array.from({ length: 21 }, (_, i) => ({ id: i, x: 0.5, y: 0.5 }));
  landmarks[0] = { x: 0.60, y: 0.85 }; // Wrist
  landmarks[1] = { x: 0.39, y: 0.75 };
  landmarks[2] = { x: 0.32, y: 0.65 };
  landmarks[4] = { x: 0.28, y: 0.55 }; // Thumb tip
  landmarks[5] = { x: 0.44, y: 0.55 }; // Index MCP
  landmarks[8] = { x: 0.44, y: 0.25 }; // Index Tip
  landmarks[9] = { x: 0.58, y: 0.53 }; // Middle MCP
  landmarks[12] = { x: 0.59, y: 0.22 }; // Middle Tip
  landmarks[13] = { x: 0.69, y: 0.55 }; // Ring MCP
  landmarks[16] = { x: 0.72, y: 0.26 }; // Ring Tip
  landmarks[17] = { x: 0.80, y: 0.58 }; // Pinky MCP
  landmarks[20] = { x: 0.85, y: 0.35 }; // Pinky Tip

  const res = HandPoseValidator.validate(landmarks, { expectedHandedness: 'RIGHT' });
  assert.equal(res.valid, true);
  assert.equal(res.status, POSE_STATUS.PALM_READY);
});

test('POSE-10: Correctly validates mirrored front camera stream without false rejection', () => {
  // Mirrored right palm: Index is at x~0.58, Pinky is at x~0.20
  const mirroredRightPalm = Array.from({ length: 21 }, (_, i) => ({ id: i, x: 0.5, y: 0.5 }));
  mirroredRightPalm[0] = { x: 0.40, y: 0.85 };
  mirroredRightPalm[1] = { x: 0.61, y: 0.75 };
  mirroredRightPalm[5] = { x: 0.56, y: 0.55 };
  mirroredRightPalm[8] = { x: 0.56, y: 0.25 };
  mirroredRightPalm[9] = { x: 0.42, y: 0.53 };
  mirroredRightPalm[12] = { x: 0.41, y: 0.22 };
  mirroredRightPalm[13] = { x: 0.31, y: 0.55 };
  mirroredRightPalm[16] = { x: 0.28, y: 0.26 };
  mirroredRightPalm[17] = { x: 0.20, y: 0.58 };
  mirroredRightPalm[20] = { x: 0.15, y: 0.35 };

  const resMirrored = HandPoseValidator.validate(mirroredRightPalm, { expectedHandedness: 'RIGHT', isMirrored: true });
  assert.equal(resMirrored.valid, true);
  assert.equal(resMirrored.status, POSE_STATUS.PALM_READY);
});

test('POSE-11: 4-Way Comprehensive Verification (Right Palm front/back & Left Palm front/back)', () => {
  // 1. Right Palm Front (Palmar surface): MUST be accepted
  const rightFront = createMockHandLandmarks({ isFist: false, isBackOfHand: false, handSide: 'RIGHT' });
  const resRF = HandPoseValidator.validate(rightFront, { expectedHandedness: 'RIGHT', detectedHandedness: 'RIGHT' });
  assert.equal(resRF.valid, true, 'Right Palm front must be accepted');
  assert.equal(resRF.status, POSE_STATUS.PALM_READY);

  // 2. Right Hand Back (Dorsal surface): MUST be rejected
  const rightBack = createMockHandLandmarks({ isFist: false, isBackOfHand: true, handSide: 'RIGHT' });
  const resRB = HandPoseValidator.validate(rightBack, { expectedHandedness: 'RIGHT' });
  assert.equal(resRB.valid, false, 'Right Hand back must be rejected');
  assert.equal(resRB.status, POSE_STATUS.BACK_OF_HAND);
  assert.ok(resRB.message.includes('Turn your hand around'));

  // 3. Left Palm Front (Palmar surface): MUST be accepted
  const leftFront = createMockHandLandmarks({ isFist: false, isBackOfHand: false, handSide: 'LEFT' });
  const resLF = HandPoseValidator.validate(leftFront, { expectedHandedness: 'LEFT', detectedHandedness: 'LEFT' });
  assert.equal(resLF.valid, true, 'Left Palm front must be accepted');
  assert.equal(resLF.status, POSE_STATUS.PALM_READY);

  // 4. Left Hand Back (Dorsal surface): MUST be rejected
  const leftBack = createMockHandLandmarks({ isFist: false, isBackOfHand: true, handSide: 'LEFT' });
  const resLB = HandPoseValidator.validate(leftBack, { expectedHandedness: 'LEFT' });
  assert.equal(resLB.valid, false, 'Left Hand back must be rejected');
  assert.equal(resLB.status, POSE_STATUS.BACK_OF_HAND);
  assert.ok(resLB.message.includes('Turn your hand around'));
});
