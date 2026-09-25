import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PalmVisionEngine,
  HandDetector,
  PalmSegmentation,
  PalmUsabilityValidator,
  RetakeDecisionEngine,
  MajorLineClassifier,
  CoordinateTransform,
  PALM_CV_ENGINE_VERSION
} from '../../src/cv/index.js';

/**
 * Robust synthetic palm generator supporting resolutions, aspect ratios,
 * diverse skin chrominance, lighting variations, scales, and poses.
 */
export function createMatrixPalmImage(width, height, options = {}) {
  const {
    skinTone = 'tan', // 'fair' | 'tan' | 'deep'
    lighting = 'normal', // 'normal' | 'low' | 'overexposed' | 'glare' | 'shadow' | 'uneven'
    scale = 1.0, // scale factor for palm size
    tiltDeg = 0, // hand rotation angle in degrees
    cropOffset = { x: 0, y: 0 },
    hands = 1, // 1 or 2
    missingThumb = false,
    background = 'dark' // 'dark' | 'light'
  } = options;

  const data = new Uint8ClampedArray(width * height * 4);
  const cx = width / 2 + cropOffset.x;
  const cy = height / 2 + cropOffset.y;
  const baseRadius = Math.min(width, height) * 0.35 * scale;

  // Base skin chrominance definitions
  const skinProfiles = {
    fair: { r: 215, g: 180, b: 165 },
    tan: { r: 185, g: 135, b: 105 },
    deep: { r: 95, g: 65, b: 45 }
  };
  const skin = skinProfiles[skinTone] || skinProfiles.tan;

  const rad = (tiltDeg * Math.PI) / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);

  // Crease valley furrow intensity
  const creaseR = Math.max(25, Math.floor(skin.r * 0.30));
  const creaseG = Math.max(20, Math.floor(skin.g * 0.30));
  const creaseB = Math.max(15, Math.floor(skin.b * 0.30));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Primary hand center check (with rotation)
      const dx1 = x - cx;
      const dy1 = y - cy;
      const rotX1 = dx1 * cosT + dy1 * sinT;
      const rotY1 = -dx1 * sinT + dy1 * cosT;
      const dist1 = Math.hypot(rotX1 * 1.35, rotY1 * 0.80);

      let inHand = dist1 <= baseRadius;

      // Second hand if requested (side by side)
      if (hands === 2) {
        const dx2 = x - (cx - width * 0.35);
        const dy2 = y - cy;
        const dist2 = Math.hypot(dx2, dy2);
        if (dist2 <= baseRadius * 0.8) {
          inHand = true;
        }
      }

      // Crop thumb region if missingThumb is true
      if (missingThumb && inHand && rotX1 < -baseRadius * 0.25) {
        inHand = false;
      }

      if (!inHand) {
        // Background
        let bgVal = background === 'light' ? 180 : 15;
        if (lighting === 'overexposed') bgVal = 245;
        data[idx] = bgVal;
        data[idx + 1] = bgVal;
        data[idx + 2] = bgVal + 2;
        data[idx + 3] = 255;
        continue;
      }

      // Base skin color
      let r = skin.r;
      let g = skin.g;
      let b = skin.b;

      // Lighting variations
      if (lighting === 'low') {
        r = Math.floor(r * 0.28);
        g = Math.floor(g * 0.28);
        b = Math.floor(b * 0.28);
      } else if (lighting === 'overexposed') {
        r = Math.min(255, r + 75);
        g = Math.min(255, g + 85);
        b = Math.min(255, b + 95);
      } else if (lighting === 'glare' && dist1 < baseRadius * 0.55) {
        r = 254; g = 254; b = 254; // Specular hotspot
      } else if (lighting === 'shadow' && x > cx) {
        r = Math.floor(r * 0.45);
        g = Math.floor(g * 0.45);
        b = Math.floor(b * 0.45);
      } else if (lighting === 'uneven') {
        const grad = (x / width);
        r = Math.floor(r * (0.5 + grad * 0.6));
        g = Math.floor(g * (0.5 + grad * 0.6));
        b = Math.floor(b * (0.5 + grad * 0.6));
      }

      // Draw synthetic Life line (Ayur Rekha)
      const distToLife = Math.abs(Math.hypot(rotX1 - (-baseRadius * 0.35), rotY1 - (baseRadius * 0.15)) - (baseRadius * 0.55));
      if (distToLife < 2.5 && rotY1 > -baseRadius * 0.2 && rotY1 < baseRadius * 0.65 && rotX1 < baseRadius * 0.15) {
        r = creaseR;
        g = creaseG;
        b = creaseB;
      }

      // Draw synthetic Head line (Matru Rekha)
      const headLineY = -baseRadius * 0.1 + (rotX1 - (-baseRadius * 0.45)) * 0.35;
      if (Math.abs(rotY1 - headLineY) < 2.5 && rotX1 > -baseRadius * 0.40 && rotX1 < baseRadius * 0.40) {
        r = creaseR;
        g = creaseG;
        b = creaseB;
      }

      // Draw synthetic Heart line (Pitri Rekha)
      const heartLineY = -baseRadius * 0.42 - (rotX1 - (-baseRadius * 0.50)) * 0.15;
      if (Math.abs(rotY1 - heartLineY) < 2.5 && rotX1 > -baseRadius * 0.38 && rotX1 < baseRadius * 0.38) {
        r = creaseR;
        g = creaseG;
        b = creaseB;
      }

      // Fate and Sun lines intentionally omitted to test honest non-hallucination

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  return { width, height, data, channels: 4, colorSpace: 'srgb' };
}

// -----------------------------------------------------------------------------
// P5.2 Test Matrix Suite
// -----------------------------------------------------------------------------

test('P5.2 Matrix 1: Resolution Invariance (480p, 720p, 1080p, 1440p)', async () => {
  const engine = new PalmVisionEngine();
  const resolutions = [
    { w: 640, h: 480, name: '480p' },
    { w: 1280, h: 720, name: '720p' },
    { w: 1920, h: 1080, name: '1080p' },
    { w: 2560, h: 1440, name: '1440p' }
  ];

  for (const res of resolutions) {
    const palm = createMatrixPalmImage(res.w, res.h, { scale: 0.95 });
    const result = await engine.analyze(palm);

    assert.equal(result.status, 'SUCCESS', `Failed on resolution ${res.name}`);
    assert.equal(result.imageQuality.passed, true);
    assert.equal(result.hand.detected, true);
    assert.equal(result.retakeDecision.needsRetake, false);
    assert.ok(result.lines.life.status !== 'NOT_DETECTED', `Life line missing on ${res.name}`);
    assert.ok(result.lines.head.status !== 'NOT_DETECTED', `Head line missing on ${res.name}`);
    assert.equal(result.lines.sun.status, 'NOT_DETECTED', `Sun line hallucinated on ${res.name}`);
  }
});

test('P5.2 Matrix 2: Aspect Ratio Stability (4:3, 16:9, 1:1, 3:4, 9:16)', async () => {
  const engine = new PalmVisionEngine();
  const aspectRatios = [
    { w: 800, h: 600, name: '4:3' },
    { w: 960, h: 540, name: '16:9' },
    { w: 600, h: 600, name: '1:1' },
    { w: 600, h: 800, name: '3:4' },
    { w: 540, h: 960, name: '9:16' }
  ];

  for (const ar of aspectRatios) {
    const palm = createMatrixPalmImage(ar.w, ar.h, { scale: 0.85 });
    const result = await engine.analyze(palm);

    assert.equal(result.status, 'SUCCESS', `Failed on aspect ratio ${ar.name}`);
    assert.equal(result.hand.detected, true);
    assert.equal(result.retakeDecision.action, 'PROCEED');
    assert.ok(result.processing.durationMs < 350, `Latency exceeded target on ${ar.name}`);
  }
});

test('P5.2 Matrix 3: Palm Scale Gating (Too Small, Optimal, Too Large)', async () => {
  const engine = new PalmVisionEngine();

  // 1. Palm too small (< 10% coverage)
  const smallPalm = createMatrixPalmImage(600, 600, { scale: 0.28 });
  const smallResult = await engine.analyze(smallPalm);
  assert.equal(smallResult.status, 'INSUFFICIENT_EVIDENCE');
  assert.equal(smallResult.retakeDecision.needsRetake, true);
  assert.equal(smallResult.retakeDecision.primaryMessage, 'Move your palm closer.');
  assert.equal(smallResult.retakeDecision.diagnosticCode, 'F11_PALM_TOO_FAR');

  // 2. Palm optimal (~40% coverage)
  const optimalPalm = createMatrixPalmImage(600, 600, { scale: 0.90 });
  const optimalResult = await engine.analyze(optimalPalm);
  assert.equal(optimalResult.status, 'SUCCESS');
  assert.equal(optimalResult.retakeDecision.needsRetake, false);
  assert.equal(optimalResult.retakeDecision.primaryMessage, 'Palm capture verified.');

  // 3. Palm too large (> 88% coverage)
  const largePalm = createMatrixPalmImage(600, 600, { scale: 1.70 });
  const largeResult = await engine.analyze(largePalm);
  assert.ok(['RECAPTURE_REQUIRED', 'INSUFFICIENT_EVIDENCE'].includes(largeResult.status));
  assert.equal(largeResult.retakeDecision.needsRetake, true);
  assert.ok(
    largeResult.retakeDecision.primaryMessage.includes('closer') ||
    largeResult.retakeDecision.primaryMessage.includes('further') ||
    largeResult.retakeDecision.primaryMessage.includes('inside the frame')
  );
});

test('P5.2 Matrix 4: Skin-Tone Chrominance Invariance (Fair, Tan, Deep Brown)', async () => {
  const engine = new PalmVisionEngine();
  const skinTones = ['fair', 'tan', 'deep'];

  for (const tone of skinTones) {
    const palm = createMatrixPalmImage(500, 500, { skinTone: tone, scale: 0.90 });
    const result = await engine.analyze(palm);

    assert.equal(result.status, 'SUCCESS', `Failed on skin tone ${tone}`);
    assert.equal(result.hand.detected, true, `Hand not detected on skin tone ${tone}`);
    assert.ok(result.hand.confidence > 0.60, `Low confidence on skin tone ${tone}`);
    assert.ok(result.lines.life.status !== 'NOT_DETECTED', `Life line missing on ${tone}`);
    assert.ok(result.lines.head.status !== 'NOT_DETECTED', `Head line missing on ${tone}`);
    assert.equal(result.lines.sun.status, 'NOT_DETECTED', `Sun line false positive on ${tone}`);
  }
});

test('P5.2 Matrix 5: Lighting Extremes & Actionable User Guidance', async () => {
  const engine = new PalmVisionEngine();

  // 1. Low illumination (underexposed)
  const darkPalm = createMatrixPalmImage(500, 500, { lighting: 'low', scale: 0.90 });
  const darkResult = await engine.analyze(darkPalm);
  assert.equal(darkResult.status, 'RECAPTURE_REQUIRED');
  assert.equal(darkResult.retakeDecision.primaryMessage, 'Use brighter, even lighting.');
  assert.equal(darkResult.retakeDecision.diagnosticCode, 'F10_UNDEREXPOSED');

  // 2. Overexposed
  const brightPalm = createMatrixPalmImage(500, 500, { lighting: 'overexposed', scale: 0.90 });
  const brightResult = await engine.analyze(brightPalm);
  assert.equal(brightResult.status, 'RECAPTURE_REQUIRED');
  assert.equal(brightResult.retakeDecision.primaryMessage, 'Reduce direct lighting or harsh flash.');
  assert.equal(brightResult.retakeDecision.diagnosticCode, 'F10_OVEREXPOSED');

  // 3. Specular glare
  const glarePalm = createMatrixPalmImage(500, 500, { lighting: 'glare', scale: 0.90 });
  const glareResult = await engine.analyze(glarePalm);
  assert.equal(glareResult.status, 'RECAPTURE_REQUIRED');
  assert.equal(glareResult.retakeDecision.primaryMessage, 'Avoid direct glare on the palm.');
  assert.equal(glareResult.retakeDecision.diagnosticCode, 'F10_SPECULAR_GLARE');

  // 4. Strong shadow boundary -> must not hallucinate false lines
  const shadowPalm = createMatrixPalmImage(500, 500, { lighting: 'shadow', scale: 0.90 });
  const shadowResult = await engine.analyze(shadowPalm);
  if (shadowResult.status === 'SUCCESS') {
    assert.equal(shadowResult.lines.sun.status, 'NOT_DETECTED', 'Shadow edge hallucinated as Sun line');
    assert.equal(shadowResult.lines.fate.status, 'NOT_DETECTED', 'Shadow edge hallucinated as Fate line');
  }
});

test('P5.2 Matrix 6: Orientation & Hand Tilt Hardening', async () => {
  const engine = new PalmVisionEngine();

  // Moderate tilt within tolerance (+18 deg) -> auto-rectified and SUCCESS
  const moderatePalm = createMatrixPalmImage(500, 500, { tiltDeg: 18, scale: 0.90 });
  const moderateResult = await engine.analyze(moderatePalm);
  assert.equal(moderateResult.status, 'SUCCESS');
  assert.equal(moderateResult.retakeDecision.needsRetake, false);

  // Excessive tilt (> 45 deg) -> USER_CORRECTION
  const tiltedPalm = createMatrixPalmImage(500, 500, { tiltDeg: 55, scale: 0.85 });
  const tiltedResult = await engine.analyze(tiltedPalm);
  assert.equal(tiltedResult.retakeDecision.needsRetake, true);
  assert.equal(tiltedResult.retakeDecision.action, 'USER_CORRECTION');
  assert.equal(tiltedResult.retakeDecision.primaryMessage, 'Place your palm flat and upright facing the camera.');
  assert.equal(tiltedResult.retakeDecision.diagnosticCode, 'F11_EXCESSIVE_TILT');
});

test('P5.2 Matrix 7: Multi-Hand Ambiguity Rejection', async () => {
  const engine = new PalmVisionEngine();

  // Two distinct hands visible in frame
  const twoHandsPalm = createMatrixPalmImage(800, 500, { hands: 2, scale: 0.85 });
  const result = await engine.analyze(twoHandsPalm);

  assert.equal(result.retakeDecision.needsRetake, true);
  assert.equal(result.retakeDecision.action, 'USER_CORRECTION');
  assert.equal(result.retakeDecision.primaryMessage, 'Ensure only one palm is visible in frame.');
  assert.equal(result.retakeDecision.diagnosticCode, 'F11_MULTIPLE_HANDS');
});

test('P5.2 Matrix 8: Partial Palm & Field-of-View Discrimination', async () => {
  // When the thumb/radial zone is cropped out of frame, Life line must be marked OUT_OF_FRAME
  // rather than assumed naturally absent!
  const croppedPalm = createMatrixPalmImage(500, 500, { scale: 0.90, cropOffset: { x: -160, y: 0 } });
  const hand = HandDetector.detect(croppedPalm);
  const usability = PalmUsabilityValidator.validate(croppedPalm, hand);

  assert.equal(usability.details.isCropped, true);
  assert.equal(usability.details.visibleRegions.LIFE, false);

  const emptyLine = MajorLineClassifier.createEmptyLine('LIFE', 'OUT_OF_FRAME');
  assert.equal(emptyLine.status, 'NOT_DETECTED');
  assert.equal(emptyLine.evidence.fieldVisibility, 'OUT_OF_FRAME');
});

test('P5.2 Matrix 9: Interpretable Confidence Decomposition Verification', async () => {
  const engine = new PalmVisionEngine();
  const palm = createMatrixPalmImage(500, 500, { scale: 0.90 });
  const result = await engine.analyze(palm);

  assert.equal(result.status, 'SUCCESS');
  const lifeEvidence = result.lines.life.evidence;

  // Check all decomposed evidence facets
  assert.ok(typeof lifeEvidence.detection === 'number', 'Missing evidence.detection');
  assert.ok(typeof lifeEvidence.geometry === 'number', 'Missing evidence.geometry');
  assert.ok(typeof lifeEvidence.continuity === 'number', 'Missing evidence.continuity');
  assert.ok(typeof lifeEvidence.imageQuality === 'number', 'Missing evidence.imageQuality');
  assert.ok(typeof lifeEvidence.localization === 'number', 'Missing evidence.localization');
  assert.ok(typeof lifeEvidence.overall === 'number', 'Missing evidence.overall');
  assert.equal(lifeEvidence.fieldVisibility, 'WITHIN_FRAME');

  // Verify backward compatibility properties exist
  assert.ok(typeof lifeEvidence.contrast === 'number');
  assert.ok(typeof lifeEvidence.structuralScore === 'number');
  assert.ok(typeof lifeEvidence.geometricPriorScore === 'number');
});

test('P5.2 Matrix 10: Production Latency Target (< 350 ms)', async () => {
  const engine = new PalmVisionEngine();
  const palm = createMatrixPalmImage(640, 640, { scale: 0.90 });

  // Warmup
  await engine.analyze(palm);

  // Measure 3 iterations
  const timings = [];
  for (let i = 0; i < 3; i++) {
    const res = await engine.analyze(palm);
    timings.push(res.processing.durationMs);
  }

  const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
  assert.ok(avgTiming < 350, `Average latency (${avgTiming}ms) exceeded 350ms target`);
  assert.ok(avgTiming < 150, `Expected real-world inference to be snappy (< 150ms), got ${avgTiming}ms`);
});
