/**
 * Kai RegAI — P15 Master CV Recall Recovery & Real-Palm Accuracy Test Suite
 * Phase: P15 — CV Recall Recovery & Accuracy Improvement
 * 
 * Verifies:
 * 1. Handedness Prior Mirroring & Symmetry (Left vs Right Hand Sectors)
 * 2. Palm Usability MCP Top-Crop Evaluation (Fingertip vs Palmar Boundary)
 * 3. Transverse Crease Span Calibration (dx >= 0.12)
 * 4. P14 vs P15 Recall & Precision Gates (Life, Head, Heart, Fate, Sun)
 * 5. Latency, Memory, and Temporal Stability Invariants
 * 6. Downstream Pipeline Safety (P8/P9/P10 Epistemic Decoupling)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { MajorLineClassifier } from '../../src/cv/crease/MajorLineClassifier.js';
import { PalmCVConfig } from '../../src/cv/config/defaultConfig.js';
import { PalmUsabilityValidator } from '../../src/cv/quality/PalmUsabilityValidator.js';
import { PalmFeatureModel } from '../../src/models/PalmFeatureModel.js';
import { interpret } from '../../src/interpretation/index.js';

const P15_METRICS_PATH = path.resolve('cv/real-validation/reports/p15_metrics.json');

test('P15.1 Handedness Prior Mirroring & Symmetry', () => {
  const basePriors = PalmCVConfig.classification.searchPriors;

  // Test Right hand priors match base priors
  const rightPriors = MajorLineClassifier.resolvePriors(basePriors, { handedness: 'RIGHT' });
  assert.equal(rightPriors.LIFE.startZone.x[0], basePriors.LIFE.startZone.x[0]);
  assert.equal(rightPriors.LIFE.startZone.x[1], basePriors.LIFE.startZone.x[1]);
  assert.equal(rightPriors.HEAD.startZone.x[0], basePriors.HEAD.startZone.x[0]);
  assert.equal(rightPriors.HEART.startZone.x[0], basePriors.HEART.startZone.x[0]);

  // Test Left hand priors (Horizontally Mirrored: x' = 1 - x)
  const leftPriors = MajorLineClassifier.resolvePriors(basePriors, { handedness: 'LEFT' });
  const expectedLifeMinX = Number((1 - basePriors.LIFE.startZone.x[1]).toFixed(3));
  const expectedLifeMaxX = Number((1 - basePriors.LIFE.startZone.x[0]).toFixed(3));
  assert.equal(leftPriors.LIFE.startZone.x[0], expectedLifeMinX);
  assert.equal(leftPriors.LIFE.startZone.x[1], expectedLifeMaxX);
  assert.equal(leftPriors.HEAD.startZone.x[0], Number((1 - basePriors.HEAD.startZone.x[1]).toFixed(3)));
  assert.equal(leftPriors.HEART.startZone.x[0], Number((1 - basePriors.HEART.startZone.x[1]).toFixed(3)));
  assert.equal(leftPriors.HEART.startZone.x[1], Number((1 - basePriors.HEART.startZone.x[0]).toFixed(3)));

  // Test default fallback (defaults to RIGHT when handedness unspecified)
  const defaultPriors = MajorLineClassifier.resolvePriors(basePriors, {});
  assert.equal(defaultPriors.LIFE.startZone.x[0], basePriors.LIFE.startZone.x[0]);
});

test('P15.2 Palm Usability MCP Top-Crop Evaluation', () => {
  const image = { width: 400, height: 500, data: new Uint8ClampedArray(400 * 500 * 4) };

  // Case A: Fingertips touch top edge (y = 0.01), but MCP joints (landmark 9) are comfortably inside (y = 0.25)
  const safePalmMCP = {
    detected: true,
    confidence: 0.95,
    boundingBox: { x: 50, y: 5, width: 300, height: 400 },
    landmarks: Array.from({ length: 21 }, (_, i) => {
      if (i === 0) return { x: 0.5, y: 0.85 }; // Wrist
      if (i === 9) return { x: 0.5, y: 0.25 }; // Middle finger MCP joint
      if (i === 12) return { x: 0.5, y: 0.01 }; // Fingertip
      return { x: 0.5, y: 0.5 };
    }),
    handedness: 'RIGHT'
  };

  const evalSafe = PalmUsabilityValidator.validate(image, safePalmMCP, { minMarginPercent: 0.03 });
  assert.equal(evalSafe.usable, true, 'Palm with safe MCP joint must be usable');
  assert.ok(!evalSafe.reasons.includes('PALM_CROPPED'), 'Must not report PALM_CROPPED');

  // Case B: Truly clipped palm where MCP joint (landmark 9) is at top border (y = 0.01)
  const croppedPalmMCP = {
    detected: true,
    confidence: 0.95,
    boundingBox: { x: 50, y: 5, width: 300, height: 400 },
    landmarks: Array.from({ length: 21 }, (_, i) => {
      if (i === 0) return { x: 0.5, y: 0.85 }; // Wrist
      if (i === 9) return { x: 0.5, y: 0.01 }; // MCP joint clipped!
      return { x: 0.5, y: 0.5 };
    }),
    handedness: 'RIGHT'
  };

  const evalCropped = PalmUsabilityValidator.validate(image, croppedPalmMCP, { minMarginPercent: 0.03 });
  assert.equal(evalCropped.usable, false, 'Palm with clipped MCP joint must be rejected');
  assert.ok(evalCropped.reasons.includes('PALM_CROPPED'), 'Must report PALM_CROPPED');
});

test('P15.3 Transverse Crease Span Calibration', () => {
  const prior = PalmCVConfig.classification.searchPriors.HEAD;

  // Segment with dx = 0.15 (between 0.12 and 0.18)
  const startA = { x: 0.10, y: 0.40 };
  const endA = { x: 0.25, y: 0.42 };
  const ptsA = [startA, { x: 0.18, y: 0.41 }, endA];

  const scoreA = MajorLineClassifier.scoreAlignment(startA, endA, ptsA, prior, false);
  assert.ok(scoreA > 0, `Transverse span dx=0.15 must score > 0, got ${scoreA}`);

  // Micro-segment with dx = 0.05 (< 0.12)
  const startB = { x: 0.10, y: 0.40 };
  const endB = { x: 0.15, y: 0.41 };
  const ptsB = [startB, endB];

  const scoreB = MajorLineClassifier.scoreAlignment(startB, endB, ptsB, prior, false);
  assert.equal(scoreB, 0, `Micro-segment dx < 0.12 must score 0, got ${scoreB}`);
});

test('P15.4 Recall Recovery & Precision Preservation (P14 vs P15 Gate)', () => {
  assert.ok(fs.existsSync(P15_METRICS_PATH), 'P15 metrics report must exist');
  const metrics = JSON.parse(fs.readFileSync(P15_METRICS_PATH, 'utf8'));

  // Life Line
  assert.ok(metrics.lineMetrics.life.recall >= 0.80, `Life recall must be >= 0.80, got ${metrics.lineMetrics.life.recall}`);
  assert.equal(metrics.lineMetrics.life.precision, 1.0, 'Life precision must remain 1.0000 (0 false positives)');
  assert.ok(metrics.lineMetrics.life.f1 >= 0.85, `Life F1 must be >= 0.85, got ${metrics.lineMetrics.life.f1}`);

  // Head Line
  assert.ok(metrics.lineMetrics.head.recall >= 0.80, `Head recall must be >= 0.80, got ${metrics.lineMetrics.head.recall}`);
  assert.ok(metrics.lineMetrics.head.precision >= 0.95, `Head precision must be >= 0.95, got ${metrics.lineMetrics.head.precision}`);
  assert.ok(metrics.lineMetrics.head.f1 >= 0.85, `Head F1 must be >= 0.85, got ${metrics.lineMetrics.head.f1}`);

  // Heart Line
  assert.ok(metrics.lineMetrics.heart.recall >= 0.60, `Heart recall must be >= 0.60, got ${metrics.lineMetrics.heart.recall}`);
  assert.ok(metrics.lineMetrics.heart.precision >= 0.90, `Heart precision must be >= 0.90, got ${metrics.lineMetrics.heart.precision}`);
  assert.ok(metrics.lineMetrics.heart.f1 >= 0.70, `Heart F1 must be >= 0.70, got ${metrics.lineMetrics.heart.f1}`);

  // Fate & Sun Line False Positive Safeguard
  assert.equal(metrics.lineMetrics.fate.fp, 0, 'Fate false positives must strictly remain 0');
  assert.equal(metrics.lineMetrics.fate.specificity, 1.0, 'Fate specificity must remain 1.0000');
  assert.equal(metrics.lineMetrics.sun.fp, 0, 'Sun false positives must strictly remain 0');
  assert.equal(metrics.lineMetrics.sun.specificity, 1.0, 'Sun specificity must remain 1.0000');
});

test('P15.5 Latency, Memory, and Temporal Stability Invariants', () => {
  const metrics = JSON.parse(fs.readFileSync(P15_METRICS_PATH, 'utf8'));

  // Latency
  assert.ok(metrics.latencyStats.mean <= 75.0, `Mean latency must be <= 75ms, got ${metrics.latencyStats.mean}ms`);
  assert.ok(metrics.latencyStats.p95 <= 110.0, `P95 latency must be <= 110ms, got ${metrics.latencyStats.p95}ms`);

  // Temporal Jitter
  assert.ok(metrics.temporalStability.meanLineJitter <= 0.05, `Temporal jitter must be <= 0.05, got ${metrics.temporalStability.meanLineJitter}`);
  assert.equal(metrics.temporalStability.passed, true, 'Temporal stability suite must pass');

  // Memory
  assert.equal(metrics.memoryLifecycle.leakDetected, false, 'No memory leaks allowed over repeated capture cycles');

  // Confidence Calibration
  assert.ok(metrics.confidenceCalibration.expectedCalibrationError <= 0.15, `ECE must be <= 0.15, got ${metrics.confidenceCalibration.expectedCalibrationError}`);
});

test('P15.6 Downstream Pipeline Safety (P8/P9/P10 Epistemic Decoupling)', () => {
  const model = new PalmFeatureModel({
    major_lines: {
      life_line: { detected: true, confidence: 0.88, length: 'LONG_SWEEPING', depth: 'DEEP_CLEAR' },
      head_line: { detected: true, confidence: 0.85, length: 'LONG' },
      heart_line: { detected: true, confidence: 0.82, curvature: 'CURVED_TO_JUPITER' },
      fate_line: { detected: false, confidence: 0 },
      sun_line: { detected: false, confidence: 0 }
    }
  });

  const dossier = interpret(model, { tradition: 'HASTA_SAMUDRIKA' });
  assert.ok(dossier, 'Interpretation dossier must generate successfully');
  assert.ok(dossier.summary, 'Summary must be present');
  assert.ok(typeof dossier.synthesis_chapters === 'object', 'Synthesis chapters must be an object');
  assert.ok(Object.keys(dossier.synthesis_chapters).length > 0, 'Must contain synthesis chapters');
  assert.ok(Array.isArray(dossier.major_lines), 'Major lines must be present in dossier');

  // Verify epistemic boundary: no deterministic fate claims in summary or chapters
  assert.doesNotMatch(dossier.summary, /will die|fatal accident|guaranteed wealth/i, 'Must not make fatalistic claims in summary');
  for (const text of Object.values(dossier.synthesis_chapters)) {
    if (typeof text === 'string') {
      assert.doesNotMatch(text, /will die|fatal accident|guaranteed wealth/i, 'Must not make fatalistic claims in chapters');
    }
  }
});
