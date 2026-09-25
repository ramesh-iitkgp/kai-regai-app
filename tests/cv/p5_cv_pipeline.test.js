import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PalmVisionEngine,
  HandDetector,
  PalmSegmentation,
  CreaseEnhancementEngine,
  CreaseCandidateGraph,
  MajorLineClassifier,
  PalmFeatureModelAdapter,
  PALM_CV_ENGINE_VERSION
} from '../../src/cv/index.js';

/**
 * Deterministic synthetic palm generator
 */
function createSyntheticPalmImage(width = 400, height = 400, options = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const palmRadius = 140;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const distFromCenter = Math.hypot(x - cx, y - cy);

      // Outside palm boundary -> dark background
      if (distFromCenter > palmRadius) {
        data[idx] = 12;
        data[idx + 1] = 12;
        data[idx + 2] = 14;
        data[idx + 3] = 255;
        continue;
      }

      // Base palm skin color (warm tone)
      let r = 195;
      let g = 145;
      let b = 115;

      // Draw synthetic Life line arc (thumb side to lower wrist)
      const distToLife = Math.abs(Math.hypot(x - (cx - 50), y - (cy + 20)) - 75);
      if (distToLife < 2.5 && y > cy - 30 && y < cy + 85 && x < cx + 20) {
        r = 50; g = 35; b = 30; // Dark crease valley
      }

      // Draw synthetic Head line (transverse across mid-palm)
      const headLineY = cy - 10 + (x - (cx - 60)) * 0.35;
      if (Math.abs(y - headLineY) < 2.5 && x > cx - 60 && x < cx + 60) {
        r = 50; g = 35; b = 30;
      }

      // Draw synthetic Heart line (transverse upper palm)
      const heartLineY = cy - 55 - (x - (cx - 70)) * 0.15;
      if (Math.abs(y - heartLineY) < 2.5 && x > cx - 70 && x < cx + 70) {
        r = 50; g = 35; b = 30;
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  return { width, height, data };
}

test('P5.2 Hand Detector — identifies hand contour, handedness, and 21 landmarks', () => {
  const palm = createSyntheticPalmImage(360, 360);
  const result = HandDetector.detect(palm, { expectedHandedness: 'RIGHT' });

  assert.equal(result.detected, true);
  assert.equal(result.handedness, 'RIGHT');
  assert.ok(result.confidence > 0.70);
  assert.ok(result.boundingBox.width > 150);
  assert.equal(result.landmarks.length, 21);
  assert.equal(result.landmarks[0].name, 'WRIST');
  assert.equal(result.landmarks[9].name, 'MIDDLE_MCP');
});

test('P5.3 Palm Segmentation — extracts rectified square palmar patch and orientation', () => {
  const palm = createSyntheticPalmImage(360, 360);
  const hand = HandDetector.detect(palm);
  const roi = PalmSegmentation.extractPalmROI(palm, hand);

  assert.equal(roi.roiSize, 512);
  assert.equal(roi.roiPatch.length, 512 * 512);
  assert.equal(roi.mask.length, 512 * 512);
  assert.ok(typeof roi.orientation === 'number');
  assert.ok(roi.scale > 0);
});

test('P5.4 Crease Enhancement Engine — produces multi-scale Hessian response', () => {
  const palm = createSyntheticPalmImage(360, 360);
  const hand = HandDetector.detect(palm);
  const roi = PalmSegmentation.extractPalmROI(palm, hand);
  const enhanced = CreaseEnhancementEngine.enhance(roi.roiPatch, roi.roiSize, roi.mask);

  assert.equal(enhanced.enhancedMap.length, 512 * 512);
  assert.ok(enhanced.scaleMaps.fine instanceof Float32Array);
  assert.ok(enhanced.scaleMaps.medium instanceof Float32Array);
  assert.ok(enhanced.scaleMaps.coarse instanceof Float32Array);

  // Check normalized scale bounds [0, 1]
  let hasPositiveResponse = false;
  for (let i = 0; i < enhanced.enhancedMap.length; i++) {
    assert.ok(enhanced.enhancedMap[i] >= 0 && enhanced.enhancedMap[i] <= 1.0);
    if (enhanced.enhancedMap[i] > 0.3) hasPositiveResponse = true;
  }
  assert.equal(hasPositiveResponse, true);
});

test('P5.5 Crease Candidate Graph — performs skeletonization and extracts candidate polylines', () => {
  const palm = createSyntheticPalmImage(360, 360);
  const hand = HandDetector.detect(palm);
  const roi = PalmSegmentation.extractPalmROI(palm, hand);
  const { enhancedMap } = CreaseEnhancementEngine.enhance(roi.roiPatch, roi.roiSize, roi.mask);
  const candidates = CreaseCandidateGraph.extractCandidates(enhancedMap, roi.roiSize);

  assert.ok(Array.isArray(candidates));
  assert.ok(candidates.length > 0, 'Expected at least one candidate crease path');
  assert.ok(candidates[0].polyline.length >= 2);
  assert.ok(candidates[0].confidence > 0);
  assert.ok(candidates[0].length > 0);
});

test('P5.6 Major Line Classifier — identifies present lines and marks missing ones NOT_DETECTED without hallucination', () => {
  const palm = createSyntheticPalmImage(360, 360);
  const hand = HandDetector.detect(palm);
  const roi = PalmSegmentation.extractPalmROI(palm, hand);
  const { enhancedMap } = CreaseEnhancementEngine.enhance(roi.roiPatch, roi.roiSize, roi.mask);
  const candidates = CreaseCandidateGraph.extractCandidates(enhancedMap, roi.roiSize);
  const lines = MajorLineClassifier.classify(candidates, roi.roiSize, roi);

  assert.ok(lines.life);
  assert.ok(lines.head);
  assert.ok(lines.heart);
  assert.ok(lines.fate);
  assert.ok(lines.sun);

  // In our synthetic image, Life and Head are distinctly drawn
  assert.ok(['DETECTED', 'WEAK', 'PARTIAL'].includes(lines.life.status));
  assert.ok(['DETECTED', 'WEAK', 'PARTIAL'].includes(lines.head.status));

  // In our synthetic image, Sun line was intentionally NOT drawn -> must return NOT_DETECTED with empty polyline
  assert.equal(lines.sun.status, 'NOT_DETECTED');
  assert.equal(lines.sun.polyline.length, 0);
  assert.equal(lines.sun.confidence, 0);
});

test('P5.7 PalmVisionEngine — executes complete pipeline end-to-end', async () => {
  const engine = new PalmVisionEngine();
  const palm = createSyntheticPalmImage(360, 360);
  const result = await engine.analyze(palm);

  assert.equal(result.status, 'SUCCESS');
  assert.equal(result.processing.engineVersion, PALM_CV_ENGINE_VERSION);
  assert.ok(result.processing.durationMs > 0);
  assert.ok(result.imageQuality.passed);
  assert.ok(result.imageQuality.score >= 0.70);
  assert.equal(result.hand.detected, true);
  assert.ok(result.lines.life);
  assert.ok(result.lines.head);
  assert.ok(result.lines.heart);
  assert.ok(result.lines.fate);
  assert.ok(result.lines.sun);
});

test('P5.8 PalmFeatureModelAdapter — bridges vision result to canonical model and SVG paths', async () => {
  const engine = new PalmVisionEngine();
  const palm = createSyntheticPalmImage(360, 360);
  const visionResult = await engine.analyze(palm);

  const featureModel = PalmFeatureModelAdapter.toPalmFeatureModel(visionResult, 'SESS-TEST-001');
  assert.equal(featureModel.session_id, 'SESS-TEST-001');
  assert.equal(featureModel.provenance.cv_version, PALM_CV_ENGINE_VERSION);
  assert.equal(featureModel.major_lines.life_line.semantic_color, '#A855F7');
  assert.equal(featureModel.major_lines.head_line.semantic_color, '#00D2FF');

  // Convert polyline to SVG path
  const svgPath = PalmFeatureModelAdapter.polylineToSvgPath(visionResult.lines.life.polyline, 360, 450);
  if (visionResult.lines.life.status !== 'NOT_DETECTED') {
    assert.ok(svgPath.startsWith('M '));
    assert.ok(svgPath.includes('L '));
  } else {
    assert.equal(svgPath, '');
  }
});
