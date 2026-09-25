/**
 * Kai RegAI — P14 Master Real-Palm Dataset & Accuracy Validation Test Suite
 * Phase: P14 — Real-Palm Dataset & Accuracy Validation
 * 
 * Verifies:
 * 1. Dataset Manifest, Anonymity & PII-Free Architecture
 * 2. Dataset Split Isolation (DEVELOPMENT, CALIBRATION, FINAL_TEST)
 * 3. Ground Truth Geometry, Status Enums & Canonical Coordinate Bounds
 * 4. Evaluation Engine Metrics (Presence, Localization, Hausdorff, Continuity)
 * 5. Confidence Calibration & Expected Calibration Error (ECE)
 * 6. Quality & Retake Decision Stratification
 * 7. Temporal Stability & Memory Lifecycle Bounds
 * 8. Formal Failure Taxonomy (F01–F15) & Error Triage
 * 9. Downstream Pipeline Safety (P8/P9/P10 Epistemic Invariance)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { PalmFeatureModel } from '../../src/models/PalmFeatureModel.js';
import { interpret, InterpretationDossier } from '../../src/interpretation/index.js';

const DATASET_DIR = path.resolve('cv/real-validation/dataset');
const MANIFEST_PATH = path.join(DATASET_DIR, 'manifests', 'manifest.json');
const REPORTS_PATH = path.resolve('cv/real-validation/reports/p14_metrics.json');

test('P14.1 Dataset Manifest & Anonymity Verification', () => {
  assert.ok(fs.existsSync(MANIFEST_PATH), 'Manifest file must exist');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  assert.equal(manifest.datasetVersion, '1.0.0');
  assert.ok(Array.isArray(manifest.palms), 'Palms array must be present');
  assert.equal(manifest.palms.length, 32, 'Golden corpus must contain exactly 32 annotated palms');

  // Verify Privacy & Anonymity — zero personal data
  for (const palm of manifest.palms) {
    assert.match(palm.imageId, /^PALM-\d{4}$/, `Image ID must follow anonymous pattern: ${palm.imageId}`);
    assert.equal(palm.name, undefined, 'Must not store user names');
    assert.equal(palm.email, undefined, 'Must not store email addresses');
    assert.equal(palm.phone, undefined, 'Must not store phone numbers');
    assert.equal(palm.biometricTemplate, undefined, 'Must not store raw biometric templates');

    // Verify files exist on disk
    const imgPath = path.join(DATASET_DIR, 'images', `${palm.imageId}.jpg`);
    const annotPath = path.join(DATASET_DIR, 'annotations', `${palm.imageId}.annotation.json`);
    assert.ok(fs.existsSync(imgPath), `Image file must exist: ${imgPath}`);
    assert.ok(fs.existsSync(annotPath), `Annotation file must exist: ${annotPath}`);
  }
});

test('P14.2 Dataset Split Isolation & Partitioning', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const dev = manifest.palms.filter(p => p.split === 'DEVELOPMENT');
  const calib = manifest.palms.filter(p => p.split === 'CALIBRATION');
  const testSet = manifest.palms.filter(p => p.split === 'FINAL_TEST');

  assert.equal(dev.length, 5, 'Development split count');
  assert.equal(calib.length, 11, 'Calibration split count');
  assert.equal(testSet.length, 16, 'Final Test split count');
  assert.equal(dev.length + calib.length + testSet.length, 32, 'All palms must be cleanly partitioned');

  // Verify mutually disjoint sets
  const devIds = new Set(dev.map(p => p.imageId));
  const calibIds = new Set(calib.map(p => p.imageId));
  const testIds = new Set(testSet.map(p => p.imageId));

  for (const id of devIds) {
    assert.ok(!calibIds.has(id), `Overlap between DEV and CALIB: ${id}`);
    assert.ok(!testIds.has(id), `Overlap between DEV and FINAL_TEST: ${id}`);
  }
  for (const id of calibIds) {
    assert.ok(!testIds.has(id), `Overlap between CALIB and FINAL_TEST: ${id}`);
  }
});

test('P14.3 Ground Truth Geometry & Canonical Coordinate Bounds', () => {
  const annotFiles = fs.readdirSync(path.join(DATASET_DIR, 'annotations')).filter(f => f.endsWith('.json'));
  assert.equal(annotFiles.length, 32);

  const validStatuses = ['PRESENT', 'PARTIAL', 'UNCERTAIN', 'ABSENT'];
  const majorLines = ['life', 'head', 'heart', 'fate', 'sun'];

  for (const file of annotFiles) {
    const annot = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, 'annotations', file), 'utf8'));
    assert.equal(annot.annotationVersion, '1.0.0');
    assert.ok(annot.canonicalCoordinates, 'Must specify canonicalCoordinates metadata');
    assert.equal(annot.canonicalCoordinates.targetWidth, 360);
    assert.equal(annot.canonicalCoordinates.targetHeight, 450);

    for (const lt of majorLines) {
      const line = annot.lines[lt];
      assert.ok(line, `Annotation missing line: ${lt} in ${file}`);
      assert.ok(validStatuses.includes(line.status), `Invalid status: ${line.status}`);

      if (line.status === 'PRESENT' || line.status === 'PARTIAL') {
        assert.ok(Array.isArray(line.polyline), `Polyline missing for visible line ${lt} in ${file}`);
        assert.ok(line.polyline.length >= 2, `Polyline must have >=2 points for ${lt} in ${file}`);

        for (const pt of line.polyline) {
          assert.ok(pt.x >= 0 && pt.x <= 1.0, `Point x out of normalized bounds [0..1]: ${pt.x}`);
          assert.ok(pt.y >= 0 && pt.y <= 1.0, `Point y out of normalized bounds [0..1]: ${pt.y}`);
        }
      }
    }
  }
});

test('P14.4 Evaluation Metrics & Machine-Readable Report Integrity', async () => {
  assert.ok(fs.existsSync(REPORTS_PATH), 'Report file must exist');
  const metrics = JSON.parse(fs.readFileSync(REPORTS_PATH, 'utf8'));

  assert.equal(metrics.datasetVersion, '1.0.0');
  assert.equal(metrics.evaluationVersion, '1.0.0');
  assert.equal(metrics.totalPalms, 32);
  assert.ok(metrics.gitCommit, 'Git commit must be recorded');

  // Verify Line Metrics
  for (const lt of ['life', 'head', 'heart', 'fate', 'sun']) {
    const m = metrics.lineMetrics[lt];
    assert.ok(m, `Metrics missing for ${lt}`);
    assert.equal(m.totalSamples, 32);
    assert.ok(m.precision >= 0 && m.precision <= 1.0, `Precision out of bounds: ${m.precision}`);
    assert.ok(m.recall >= 0 && m.recall <= 1.0, `Recall out of bounds: ${m.recall}`);
    assert.ok(m.f1 >= 0 && m.f1 <= 1.0, `F1 out of bounds: ${m.f1}`);
    assert.ok(m.falsePositiveRate >= 0 && m.falsePositiveRate <= 1.0);
  }

  // Fate and Sun lines must have zero false positives (FPR = 0)
  assert.equal(metrics.lineMetrics.fate.fp, 0, 'Fate line must not have false positives');
  assert.equal(metrics.lineMetrics.fate.falsePositiveRate, 0);
  assert.equal(metrics.lineMetrics.sun.fp, 0, 'Sun line must not have false positives');
  assert.equal(metrics.lineMetrics.sun.falsePositiveRate, 0);

  // Localization error for detected lines
  assert.ok(metrics.lineMetrics.life.meanLocalizationError <= 0.20, 'Life mean localization error within bounds');
  assert.ok(metrics.lineMetrics.head.meanLocalizationError <= 0.25, 'Head mean localization error within bounds');
  assert.ok(metrics.lineMetrics.heart.meanLocalizationError <= 0.25, 'Heart mean localization error within bounds');
});

test('P14.5 Confidence Calibration & Expected Calibration Error (ECE)', () => {
  const metrics = JSON.parse(fs.readFileSync(REPORTS_PATH, 'utf8'));
  const calib = metrics.confidenceCalibration;

  assert.ok(calib, 'Confidence calibration section must exist');
  assert.ok(Array.isArray(calib.bins), 'Calibration bins array must exist');
  assert.ok(calib.expectedCalibrationError >= 0, 'ECE must be non-negative');
  assert.ok(calib.expectedCalibrationError <= 0.15, `ECE ${calib.expectedCalibrationError} exceeds acceptable 0.15 limit`);

  for (const b of calib.bins) {
    if (b.count > 0) {
      assert.ok(b.avgConfidence >= 0.5 && b.avgConfidence <= 1.0);
      assert.ok(b.accuracy >= 0 && b.accuracy <= 1.0);
      assert.ok(b.calibrationError <= 0.20);
    }
  }
});

test('P14.6 Quality Stratification & Retake Decision Evaluation', () => {
  const metrics = JSON.parse(fs.readFileSync(REPORTS_PATH, 'utf8'));
  const qs = metrics.qualityStratification;

  assert.ok(qs.GOOD.samples > 0);
  assert.ok(qs.ACCEPTABLE.samples > 0);
  assert.ok(qs.DIFFICULT.samples > 0);

  const retake = metrics.retakeMetrics;
  assert.equal(retake.totalEvaluated, 32);
  assert.ok(retake.acceptedCount > 0);
  assert.ok(retake.retakeAdvisedCount > 0);
  // Retake advice must not falsely reject too many good images
  assert.ok(retake.falseRejects <= 4, `Too many false rejects: ${retake.falseRejects}`);
});

test('P14.7 Temporal Stability & Memory Lifecycle Bounds', () => {
  const metrics = JSON.parse(fs.readFileSync(REPORTS_PATH, 'utf8'));

  // Temporal Stability
  const temp = metrics.temporalStability;
  assert.ok(temp.passed, 'Temporal stability benchmark must pass');
  assert.ok(temp.meanLineJitter <= 0.05, `Temporal jitter ${temp.meanLineJitter} exceeds 0.05 bound`);
  assert.equal(temp.statusPreservationRate, 1.0, 'Status preservation must be 1.0 across frames');

  // Memory Lifecycle
  const mem = metrics.memoryLifecycle;
  assert.equal(mem.leakDetected, false, 'No memory leak detected over repeated inference');
  assert.ok(mem.deltaMb <= 25, `Memory delta ${mem.deltaMb}MB exceeds 25MB bound`);
});

test('P14.8 Formal Failure Taxonomy (F01–F15) & Triage Classification', () => {
  const metrics = JSON.parse(fs.readFileSync(REPORTS_PATH, 'utf8'));
  const summary = metrics.failureTaxonomySummary;

  assert.ok(summary, 'Failure taxonomy summary must exist');
  assert.ok(summary.F08_FalsePositive >= 0);
  assert.ok(summary.F09_FalseNegative >= 0);
  assert.ok(summary.F07_MajorLineClassification >= 0);

  // Check failure entries triage tags
  const validTriages = ['ALGORITHMIC', 'CAPTURE', 'DATASET', 'ANNOTATION', 'INTEGRATION', 'UNKNOWN'];
  for (const f of metrics.failures) {
    assert.match(f.code, /^F\d{2}$/, `Failure code must match F01-F15 format: ${f.code}`);
    assert.ok(validTriages.includes(f.triage), `Invalid triage tag: ${f.triage}`);
    assert.ok(f.reason, 'Failure reason must be specified');
  }
});

test('P14.9 Downstream Pipeline Safety (P8/P9/P10 Epistemic Invariance)', () => {
  const featureModel = new PalmFeatureModel({
    session_id: 'p14-safety-check',
    quality_score: 0.85,
    major_lines: {
      life_line: { detected: true, status: 'DETECTED', confidence: 0.85, curvature: 'WIDE_ARC', continuity: 'CONTINUOUS' },
      head_line: { detected: true, status: 'DETECTED', confidence: 0.82, curvature: 'STRAIGHT', continuity: 'CONTINUOUS' },
      heart_line: { detected: true, status: 'DETECTED', confidence: 0.88, curvature: 'CURVED', continuity: 'CONTINUOUS' },
      fate_line: { detected: false, status: 'NOT_DETECTED', confidence: 0 },
      sun_line: { detected: false, status: 'NOT_DETECTED', confidence: 0 }
    },
    hand: { elemental_shape: 'EARTH' }
  });

  const dossier = interpret(featureModel);

  // Verify P8 does NOT invent absent claims or deterministic predictions
  assert.ok(dossier instanceof InterpretationDossier);
  assert.equal(dossier.major_lines.length, 5);

  // Verify Fate and Sun are treated as unconfirmed/not detected, not fatalistic absence
  const serialized = JSON.stringify(dossier).toLowerCase();
  assert.ok(!serialized.includes('permanently doomed'));
  assert.ok(!serialized.includes('destiny is impossible'));
  assert.ok(!serialized.includes('will die'));
  assert.ok(!serialized.includes('cancer'));
});
