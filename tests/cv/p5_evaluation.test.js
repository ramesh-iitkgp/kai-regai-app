import test from 'node:test';
import assert from 'node:assert/strict';
import { PalmVisionEngine } from '../../src/cv/index.js';
import { GoldenCorpus } from '../../src/cv/dataset/goldenCorpus.js';
import { Evaluator } from '../../src/cv/dataset/Evaluator.js';

test('P5 Evaluation Harness — evaluates golden corpus test cases deterministically', async () => {
  const engine = new PalmVisionEngine();
  const catalog = GoldenCorpus.getCatalog();

  const corpusCases = catalog.map(item => ({
    ...item,
    image: GoldenCorpus.generateCase(item.id, 320, 320)
  }));

  const report = await Evaluator.evaluateCorpus(engine, corpusCases);

  assert.equal(report.totalCases, catalog.length);
  assert.ok(report.qualityGateAccuracy >= 0.80, `Expected quality gate accuracy >= 0.80, got ${report.qualityGateAccuracy}`);

  // Test individual critical failure cases
  const lowLight = report.caseResults.find(c => c.id === 'low_light_palm');
  assert.equal(lowLight.status, 'RECAPTURE_REQUIRED');
  assert.ok(lowLight.reasons.includes('UNDEREXPOSED'));

  const glare = report.caseResults.find(c => c.id === 'specular_glare');
  assert.equal(glare.status, 'RECAPTURE_REQUIRED');
  assert.ok(glare.reasons.includes('SPECULAR_GLARE'));

  const noHand = report.caseResults.find(c => c.id === 'no_hand');
  assert.ok(noHand.status === 'NO_HAND' || noHand.status === 'RECAPTURE_REQUIRED');

  const absentSun = report.caseResults.find(c => c.id === 'absent_sun_line');
  assert.equal(absentSun.lines.sun, 'NOT_DETECTED');
});

test('P5 Evaluation Harness — point-to-curve distance and IoU calculations', () => {
  const detected = {
    status: 'DETECTED',
    polyline: [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }, { x: 0.3, y: 0.3 }],
    continuity: 0.95
  };
  const groundTruth = [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }, { x: 0.3, y: 0.3 }];

  const geomMetrics = Evaluator.evaluateLineGeometry(detected, groundTruth);
  assert.equal(geomMetrics.detected, true);
  assert.equal(geomMetrics.meanPointToCurveDist, 0);
  assert.equal(geomMetrics.endpointError, 0);

  // Mask IoU
  const maskA = new Uint8Array([255, 255, 0, 0]);
  const maskB = new Uint8Array([255, 255, 255, 0]);
  const segMetrics = Evaluator.evaluateSegmentation(maskA, maskB);
  assert.equal(segMetrics.iou, 0.6667);
});
