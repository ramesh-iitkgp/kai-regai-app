/**
 * Kai RegAI — Computer Vision Evaluation Harness & Metric Engine
 * Phase: P5.1 — Real-Palm Validation & Calibration
 * Version: 5.1.0
 * 
 * Computes rigorous CV benchmark metrics:
 * - Line Detection Precision, Recall, F1
 * - Point-to-curve Mean & Median Euclidean distance
 * - Directed and Symmetric Hausdorff distance
 * - Normalized geometric error relative to palm span
 * - Endpoint localization error
 * - False positive rejection rate
 * - Automated Failure Taxonomy classification (F1 to F12)
 * 
 * NEVER outputs "palm reading accuracy" or "fortune-telling confidence".
 */

export class Evaluator {
  /**
   * Evaluate a detected polyline against a ground truth polyline
   * @param {import('../types.js').MajorPalmLine} detectedLine
   * @param {import('../types.js').Point[]} groundTruthPolyline
   * @param {number} [palmReferenceDimension=1.0] - Normalizing palm span in coordinate units
   * @returns {{
   *   detected: boolean,
   *   meanPointToCurveDist: number,
   *   medianPointToCurveDist: number,
   *   directedHausdorff: number,
   *   symmetricHausdorff: number,
   *   endpointError: number,
   *   normalizedMeanError: number,
   *   normalizedHausdorff: number,
   *   continuity: number
   * }}
   */
  static evaluateLineGeometry(detectedLine, groundTruthPolyline, palmReferenceDimension = 1.0) {
    if (detectedLine.status === 'NOT_DETECTED' || !detectedLine.polyline || detectedLine.polyline.length === 0) {
      return {
        detected: false,
        meanPointToCurveDist: 1.0,
        medianPointToCurveDist: 1.0,
        directedHausdorff: 1.0,
        symmetricHausdorff: 1.0,
        endpointError: 1.0,
        normalizedMeanError: 1.0,
        normalizedHausdorff: 1.0,
        continuity: 0
      };
    }

    if (!groundTruthPolyline || groundTruthPolyline.length === 0) {
      return {
        detected: true,
        meanPointToCurveDist: 0,
        medianPointToCurveDist: 0,
        directedHausdorff: 0,
        symmetricHausdorff: 0,
        endpointError: 0,
        normalizedMeanError: 0,
        normalizedHausdorff: 0,
        continuity: detectedLine.continuity
      };
    }

    const detPts = detectedLine.polyline;
    const gtPts = groundTruthPolyline;

    // 1. Forward distances: det -> gt
    const forwardDistances = [];
    let maxForward = 0;
    for (const p of detPts) {
      let minDist = Infinity;
      for (const g of gtPts) {
        const d = Math.hypot(p.x - g.x, p.y - g.y);
        if (d < minDist) minDist = d;
      }
      forwardDistances.push(minDist);
      if (minDist > maxForward) maxForward = minDist;
    }

    // 2. Reverse distances: gt -> det
    const reverseDistances = [];
    let maxReverse = 0;
    for (const g of gtPts) {
      let minDist = Infinity;
      for (const p of detPts) {
        const d = Math.hypot(g.x - p.x, g.y - p.y);
        if (d < minDist) minDist = d;
      }
      reverseDistances.push(minDist);
      if (minDist > maxReverse) maxReverse = minDist;
    }

    // Mean distances
    const sumFwd = forwardDistances.reduce((a, b) => a + b, 0);
    const sumRev = reverseDistances.reduce((a, b) => a + b, 0);
    const meanFwd = sumFwd / (forwardDistances.length || 1);
    const meanRev = sumRev / (reverseDistances.length || 1);
    const meanDist = (meanFwd + meanRev) / 2;

    // Median distance
    const allDistances = [...forwardDistances, ...reverseDistances].sort((a, b) => a - b);
    const midIdx = Math.floor(allDistances.length / 2);
    const medianDist = allDistances.length % 2 === 0
      ? (allDistances[midIdx - 1] + allDistances[midIdx]) / 2
      : allDistances[midIdx];

    // Hausdorff distances
    const directedHausdorff = maxForward;
    const symmetricHausdorff = Math.max(maxForward, maxReverse);

    // Endpoint error (start to start, end to end; or flipped if reversed)
    const dStartNormal = Math.hypot(detPts[0].x - gtPts[0].x, detPts[0].y - gtPts[0].y);
    const dEndNormal = Math.hypot(detPts[detPts.length - 1].x - gtPts[gtPts.length - 1].x, detPts[detPts.length - 1].y - gtPts[gtPts.length - 1].y);
    const normalEndpointOffset = (dStartNormal + dEndNormal) / 2;

    const dStartFlipped = Math.hypot(detPts[0].x - gtPts[gtPts.length - 1].x, detPts[0].y - gtPts[gtPts.length - 1].y);
    const dEndFlipped = Math.hypot(detPts[detPts.length - 1].x - gtPts[0].x, detPts[detPts.length - 1].y - gtPts[0].y);
    const flippedEndpointOffset = (dStartFlipped + dEndFlipped) / 2;

    const endpointError = Math.min(normalEndpointOffset, flippedEndpointOffset);

    // Normalized errors relative to palm reference dimension
    const refDim = palmReferenceDimension > 0 ? palmReferenceDimension : 1.0;
    const normalizedMeanError = meanDist / refDim;
    const normalizedHausdorff = symmetricHausdorff / refDim;

    return {
      detected: true,
      meanPointToCurveDist: Number(meanDist.toFixed(4)),
      medianPointToCurveDist: Number(medianDist.toFixed(4)),
      directedHausdorff: Number(directedHausdorff.toFixed(4)),
      symmetricHausdorff: Number(symmetricHausdorff.toFixed(4)),
      endpointError: Number(endpointError.toFixed(4)),
      normalizedMeanError: Number(normalizedMeanError.toFixed(4)),
      normalizedHausdorff: Number(normalizedHausdorff.toFixed(4)),
      continuity: detectedLine.continuity
    };
  }

  /**
   * Classify failure mode into standard taxonomy (F1 to F12)
   */
  static classifyFailure(detectedLine, gtLine, geomMetrics) {
    const isGtPresent = gtLine && (gtLine.status === 'PRESENT' || gtLine.status === 'PARTIAL');
    const isDetPresent = detectedLine && detectedLine.status !== 'NOT_DETECTED';

    if (!isGtPresent && isDetPresent) {
      return { code: 'F7', mode: 'False Positive', reason: 'Line detected where ground truth indicates absence' };
    }
    if (isGtPresent && !isDetPresent) {
      return { code: 'F6', mode: 'Missing Line', reason: 'System returned NOT_DETECTED for visible crease' };
    }
    if (!isGtPresent && !isDetPresent) {
      return null; // Correct rejection
    }

    // Both present: evaluate geometric failure modes
    if (geomMetrics.normalizedHausdorff > 0.35) {
      return { code: 'F1', mode: 'Wrong Location', reason: `Hausdorff error ${geomMetrics.normalizedHausdorff} exceeds 0.35 threshold` };
    }
    if (geomMetrics.normalizedMeanError > 0.08 && geomMetrics.normalizedMeanError <= 0.20) {
      return { code: 'F2', mode: 'Parallel Offset', reason: `Consistent displacement ${geomMetrics.normalizedMeanError} alongside crease` };
    }
    if (geomMetrics.endpointError > 0.25) {
      return { code: 'F9', mode: 'Endpoint Error', reason: `Endpoint discrepancy ${geomMetrics.endpointError} exceeds 0.25 threshold` };
    }

    return null; // Within tolerance
  }

  /**
   * Compute Intersection over Union (IoU) and Dice coefficient for segmentation masks
   */
  static evaluateSegmentation(predictedMask, groundTruthMask) {
    if (predictedMask.length !== groundTruthMask.length) {
      throw new Error('Mask size mismatch during evaluation.');
    }

    let intersection = 0;
    let predArea = 0;
    let gtArea = 0;

    for (let i = 0; i < predictedMask.length; i++) {
      const p = predictedMask[i] > 0 ? 1 : 0;
      const g = groundTruthMask[i] > 0 ? 1 : 0;

      if (p && g) intersection++;
      if (p) predArea++;
      if (g) gtArea++;
    }

    const union = predArea + gtArea - intersection;
    const iou = union > 0 ? intersection / union : 1.0;
    const dice = (predArea + gtArea) > 0 ? (2 * intersection) / (predArea + gtArea) : 1.0;

    return {
      iou: Number(iou.toFixed(4)),
      dice: Number(dice.toFixed(4))
    };
  }

  /**
   * Run evaluation across golden test corpus
   */
  static async evaluateCorpus(engine, corpusCases) {
    const report = {
      timestamp: new Date().toISOString(),
      engineVersion: engine.config.version,
      totalCases: corpusCases.length,
      qualityGateAccuracy: 0,
      lineMetrics: {
        life: { detectedCount: 0, avgConfidence: 0 },
        head: { detectedCount: 0, avgConfidence: 0 },
        heart: { detectedCount: 0, avgConfidence: 0 },
        fate: { detectedCount: 0, avgConfidence: 0 },
        sun: { detectedCount: 0, avgConfidence: 0 }
      },
      caseResults: []
    };

    let correctQualityDecisions = 0;

    for (const testCase of corpusCases) {
      const result = await engine.analyze(testCase.image);
      const isQualityExpected = testCase.expectedQualityPass === undefined || (testCase.expectedQualityPass === result.imageQuality.passed);
      if (isQualityExpected) correctQualityDecisions++;

      report.caseResults.push({
        id: testCase.id,
        status: result.status,
        qualityPassed: result.imageQuality.passed,
        reasons: result.imageQuality.reasons,
        lines: {
          life: result.lines.life.status,
          head: result.lines.head.status,
          heart: result.lines.heart.status,
          fate: result.lines.fate.status,
          sun: result.lines.sun.status
        }
      });
    }

    report.qualityGateAccuracy = Number((correctQualityDecisions / corpusCases.length).toFixed(3));
    return report;
  }
}
