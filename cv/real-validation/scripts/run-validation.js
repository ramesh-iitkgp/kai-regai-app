/**
 * Kai RegAI — Real-Palm Validation & Prediction Exporter
 * Phase: P5.1 — Real-Palm Validation & Calibration
 */

import fs from 'fs';
import path from 'path';
import jpeg from 'jpeg-js';
import { PalmVisionEngine } from '../../../src/cv/index.js';
import { Evaluator } from '../../../src/cv/dataset/Evaluator.js';

export async function runRealPalmValidation(customConfig = {}) {
  const engine = new PalmVisionEngine(customConfig);
  const annotDir = path.resolve('cv/real-validation/annotations');
  const rawDir = path.resolve('cv/real-validation/raw');
  const predDir = path.resolve('cv/real-validation/predictions');
  const overlayDir = path.resolve('cv/real-validation/overlays');
  const metricsDir = path.resolve('cv/real-validation/metrics');

  if (!fs.existsSync(annotDir)) {
    console.warn('Annotations directory not found:', annotDir);
    return null;
  }

  const annotFiles = fs.readdirSync(annotDir).filter(f => f.endsWith('.annotation.json')).sort();
  const summary = {
    timestamp: new Date().toISOString(),
    engineVersion: engine.config.version,
    totalEvaluated: annotFiles.length,
    passedQualityGateCount: 0,
    lineMetrics: {
      life: { tp: 0, fp: 0, fn: 0, tn: 0, meanError: 0, hausdorff: 0 },
      head: { tp: 0, fp: 0, fn: 0, tn: 0, meanError: 0, hausdorff: 0 },
      heart: { tp: 0, fp: 0, fn: 0, tn: 0, meanError: 0, hausdorff: 0 },
      fate: { tp: 0, fp: 0, fn: 0, tn: 0, meanError: 0, hausdorff: 0 },
      sun: { tp: 0, fp: 0, fn: 0, tn: 0, meanError: 0, hausdorff: 0 }
    },
    failures: [],
    caseResults: []
  };

  for (const f of annotFiles) {
    const annotPath = path.join(annotDir, f);
    const annot = JSON.parse(fs.readFileSync(annotPath, 'utf8'));
    const imgPath = path.join(rawDir, annot.imageId + '.jpg');

    if (!fs.existsSync(imgPath)) {
      console.warn('Image not found for annotation:', imgPath);
      continue;
    }

    const rawBuf = fs.readFileSync(imgPath);
    const rawImg = jpeg.decode(rawBuf, { useTArray: true });

    const startTime = performance.now();
    const result = await engine.analyze({
      width: rawImg.width,
      height: rawImg.height,
      data: rawImg.data
    }, { handednessHint: annot.handedness });
    const duration = performance.now() - startTime;

    if (result.imageQuality.passed) summary.passedQualityGateCount++;

    // Save prediction artifact
    const predPath = path.join(predDir, annot.imageId + '.prediction.json');
    fs.writeFileSync(predPath, JSON.stringify(result, null, 2));

    const caseResult = {
      imageId: annot.imageId,
      status: result.status,
      qualityScore: result.imageQuality.score,
      processingTimeMs: Number(duration.toFixed(2)),
      lines: {}
    };

    // Evaluate each line against ground truth
    const lineTypes = ['life', 'head', 'heart', 'fate', 'sun'];
    for (const lt of lineTypes) {
      const detLine = result.lines[lt];
      const gtLine = annot.lines[lt];

      const geom = Evaluator.evaluateLineGeometry(detLine, gtLine?.polyline || []);
      const failure = Evaluator.classifyFailure(detLine, gtLine, geom);

      caseResult.lines[lt] = {
        detectedStatus: detLine.status,
        groundTruthStatus: gtLine?.status || 'ABSENT',
        confidence: detLine.confidence,
        meanError: geom.meanPointToCurveDist,
        medianError: geom.medianPointToCurveDist,
        hausdorff: geom.symmetricHausdorff,
        endpointError: geom.endpointError,
        failure
      };

      // Aggregate confusion metrics
      const isDet = detLine.status !== 'NOT_DETECTED';
      const isGt = gtLine && (gtLine.status === 'PRESENT' || gtLine.status === 'PARTIAL');

      const m = summary.lineMetrics[lt];
      if (isDet && isGt) {
        m.tp++;
        m.meanError += geom.meanPointToCurveDist;
        m.hausdorff += geom.symmetricHausdorff;
      } else if (isDet && !isGt) {
        m.fp++;
      } else if (!isDet && isGt) {
        m.fn++;
      } else {
        m.tn++;
      }

      if (failure) {
        summary.failures.push({
          imageId: annot.imageId,
          line: lt,
          code: failure.code,
          mode: failure.mode,
          reason: failure.reason
        });
      }
    }

    // Generate comparison visualization HTML artifact
    const overlayHtml = generateComparisonHtml(annot.imageId, result, annot);
    fs.writeFileSync(path.join(overlayDir, annot.imageId + '.comparison.html'), overlayHtml);

    summary.caseResults.push(caseResult);
  }

  // Normalize average error
  for (const lt of ['life', 'head', 'heart', 'fate', 'sun']) {
    const m = summary.lineMetrics[lt];
    if (m.tp > 0) {
      m.meanError = Number((m.meanError / m.tp).toFixed(4));
      m.hausdorff = Number((m.hausdorff / m.tp).toFixed(4));
    }
  }

  fs.writeFileSync(path.join(metricsDir, 'real_validation_summary.json'), JSON.stringify(summary, null, 2));
  return summary;
}

function generateComparisonHtml(imageId, result, annot) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kai RegAI Comparison — ${imageId}</title>
  <style>
    body { font-family: monospace; background: #0f141c; color: #e2e8f0; padding: 20px; }
    .card { background: #18202c; border: 1px solid #283548; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #334155; padding: 8px; text-align: left; }
    th { background: #1e293b; color: #38bdf8; }
    .tag { padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .tag-pass { background: #14532d; color: #4ade80; }
    .tag-fail { background: #7f1d1d; color: #f87171; }
  </style>
</head>
<body>
  <h1>Validation Artifact: ${imageId}</h1>
  <div class="card">
    <p><b>Status:</b> ${result.status} | <b>Quality Score:</b> ${result.imageQuality.score} | <b>Duration:</b> ${result.processing.durationMs}ms</p>
    <table>
      <tr><th>Line</th><th>Detected</th><th>Ground Truth</th><th>Confidence</th><th>Hausdorff Error</th><th>Status</th></tr>
      ${['life', 'head', 'heart', 'fate', 'sun'].map(l => `
        <tr>
          <td style="text-transform:uppercase;">${l}</td>
          <td>${result.lines[l].status}</td>
          <td>${annot.lines[l]?.status || 'ABSENT'}</td>
          <td>${result.lines[l].confidence}</td>
          <td>${result.lines[l].polyline.length > 0 ? 'Evaluated' : 'N/A'}</td>
          <td><span class="tag ${result.lines[l].status === 'NOT_DETECTED' && annot.lines[l]?.status === 'ABSENT' || result.lines[l].status !== 'NOT_DETECTED' && annot.lines[l]?.status === 'PRESENT' ? 'tag-pass' : 'tag-fail'}">${result.lines[l].status === 'NOT_DETECTED' && annot.lines[l]?.status === 'ABSENT' || result.lines[l].status !== 'NOT_DETECTED' && annot.lines[l]?.status === 'PRESENT' ? 'MATCH' : 'DISCREPANCY'}</span></td>
        </tr>
      `).join('')}
    </table>
  </div>
</body>
</html>`;
}

// Direct execution
if (process.argv[1]?.endsWith('run-validation.js')) {
  runRealPalmValidation().then(s => {
    console.log('Real-Palm Validation Complete:');
    console.log(`Evaluated: ${s.totalCases || s.totalEvaluated} cases`);
    console.log('Passed Quality Gate:', s.passedQualityGateCount);
    console.log('Line Metrics:', s.lineMetrics);
    console.log('Failures Tagged:', s.failures.length);
  });
}
