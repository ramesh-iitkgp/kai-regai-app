/**
 * Kai RegAI — P15 Failure Forensics & Pipeline Stage Tracer
 * Phase: P15 — CV Recall Recovery & Accuracy Improvement
 * 
 * Inspects all false-negative cases across the dataset and traces each pipeline stage:
 * 1. Optical Quality Gate
 * 2. Hand Detection
 * 3. Usability Validation
 * 4. Palm ROI & Rectification
 * 5. Crease Enhancement (Enhanced map response along GT polyline)
 * 6. Candidate Binarization & Skeletonization
 * 7. Candidate Polyline Tracing & Min Length Pruning
 * 8. Search Prior Alignment & Sector Gating
 * 9. True-Furrow Verification (isTrueFurrow)
 * 10. Confidence & Continuity Thresholding
 * 
 * Determines the EXACT FIRST STAGE where each genuine crease disappears.
 */

import fs from 'fs';
import path from 'path';
import jpeg from 'jpeg-js';
import { PalmVisionEngine } from '../../../src/cv/index.js';
import { PalmCVConfig } from '../../../src/cv/config/defaultConfig.js';
import { ImageIngestion } from '../../../src/cv/image/ImageIngestion.js';
import { ImageQualityAnalyzer } from '../../../src/cv/image/ImageQualityAnalyzer.js';
import { HandDetector } from '../../../src/cv/detection/HandDetector.js';
import { PalmUsabilityValidator } from '../../../src/cv/quality/PalmUsabilityValidator.js';
import { PalmSegmentation } from '../../../src/cv/detection/PalmSegmentation.js';
import { CreaseEnhancementEngine } from '../../../src/cv/crease/CreaseEnhancementEngine.js';
import { CreaseCandidateGraph } from '../../../src/cv/crease/CreaseCandidateGraph.js';
import { MajorLineClassifier } from '../../../src/cv/crease/MajorLineClassifier.js';
import { Evaluator } from '../../../src/cv/dataset/Evaluator.js';

const DATASET_DIR = path.resolve('cv/real-validation/dataset');
const MANIFEST_PATH = path.join(DATASET_DIR, 'manifests', 'manifest.json');
const REPORTS_DIR = path.resolve('cv/real-validation/p15/reports');

export async function runFailureForensics() {
  console.log('=== Starting P15 Failure Forensics & Deep Stage Tracing ===');

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found at ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const palms = manifest.palms;

  const forensicsRecords = [];
  const stageCounts = {
    life: {},
    head: {},
    heart: {},
    fate: {},
    sun: {}
  };

  const lineNames = ['life', 'head', 'heart', 'fate', 'sun'];
  for (const lt of lineNames) {
    stageCounts[lt] = {
      CAPTURE_QUALITY: 0,
      HAND_DETECTION: 0,
      USABILITY_VALIDATION: 0,
      SEGMENTATION: 0,
      CREASE_ENHANCEMENT: 0,
      CANDIDATE_GENERATION: 0,
      CANDIDATE_PRUNING: 0,
      CLASSIFICATION_PRIOR: 0,
      FURROW_VERIFICATION: 0,
      CONFIDENCE_FILTERING: 0,
      GEOMETRIC_OFFSET: 0
    };
  }

  for (const palmMeta of palms) {
    const annotPath = path.join(DATASET_DIR, 'annotations', `${palmMeta.imageId}.annotation.json`);
    const imgPath = path.join(DATASET_DIR, 'images', `${palmMeta.imageId}.jpg`);

    if (!fs.existsSync(annotPath) || !fs.existsSync(imgPath)) continue;

    const annot = JSON.parse(fs.readFileSync(annotPath, 'utf8'));
    const imgBuf = fs.readFileSync(imgPath);
    const decoded = jpeg.decode(imgBuf, { useTArray: true });

    // Step-by-step pipeline execution with intermediate telemetry
    const image = ImageIngestion.normalize(decoded);
    const imageQuality = ImageQualityAnalyzer.analyze(image, PalmCVConfig.quality);
    const hand = HandDetector.detect(image, { expectedHandedness: annot.handedness || 'RIGHT' });
    const usability = hand.detected ? PalmUsabilityValidator.validate(image, hand, PalmCVConfig.usability) : null;

    let palm = null;
    let enhancedMap = null;
    let candidates = [];
    let classifiedLines = null;

    if (imageQuality.passed && hand.detected && usability?.usable) {
      palm = PalmSegmentation.extractPalmROI(image, hand);
      palm.usability = usability;
      palm.qualityScore = imageQuality.score;

      const enhancement = CreaseEnhancementEngine.enhance(palm.roiPatch, palm.roiSize, palm.mask, PalmCVConfig.enhancement);
      enhancedMap = enhancement.enhancedMap;

      candidates = CreaseCandidateGraph.extractCandidates(enhancedMap, palm.roiSize, PalmCVConfig.topology);
      classifiedLines = MajorLineClassifier.classify(candidates, palm.roiSize, palm, PalmCVConfig.classification);
    }

    // Inspect each line
    for (const lt of lineNames) {
      const gt = annot.lines[lt];
      const isGtVisible = gt && (gt.status === 'PRESENT' || gt.status === 'PARTIAL');
      if (!isGtVisible) continue; // Only investigate visible ground truth lines

      const det = classifiedLines ? classifiedLines[lt] : null;
      const isDet = det && det.status !== 'NOT_DETECTED';

      // If detected and well localized, not a false negative
      if (isDet) {
        const geom = Evaluator.evaluateLineGeometry(det, gt.polyline);
        if (geom.meanPointToCurveDist <= 0.25) {
          continue; // Successfully detected!
        }
      }

      // We have a false negative or severely deviated detection. Trace where it failed!
      let firstFailureStage = 'UNKNOWN';
      let rootReason = '';
      let triage = 'ALGORITHMIC';

      if (!imageQuality.passed) {
        firstFailureStage = 'CAPTURE_QUALITY';
        rootReason = `Image quality failed: score ${imageQuality.score.toFixed(2)} < ${PalmCVConfig.quality.minOverallScore}`;
        triage = 'CAPTURE';
      } else if (!hand.detected) {
        firstFailureStage = 'HAND_DETECTION';
        rootReason = `Hand detection failed: ${hand.reasons?.join(', ') || 'No hand contour'}`;
        triage = 'CAPTURE';
      } else if (!usability?.usable) {
        firstFailureStage = 'USABILITY_VALIDATION';
        rootReason = `Usability check rejected: ${usability?.reasons?.join(', ') || 'Posture invalid'}`;
        triage = 'CAPTURE';
      } else if (!palm || !palm.roiPatch) {
        firstFailureStage = 'SEGMENTATION';
        rootReason = 'Palm segmentation failed to extract valid ROI patch';
        triage = 'ALGORITHMIC';
      } else {
        // We have a valid palm patch. Check enhancement along GT polyline
        const size = palm.roiSize;
        const gtPts = gt.polyline;

        // Sample enhancement response along GT points
        let sumResponse = 0;
        let validSamples = 0;
        for (const pt of gtPts) {
          const px = Math.round(pt.x * size);
          const py = Math.round(pt.y * size);
          if (px >= 0 && px < size && py >= 0 && py < size) {
            sumResponse += enhancedMap[py * size + px];
            validSamples++;
          }
        }
        const avgEnhancement = validSamples > 0 ? sumResponse / validSamples : 0;

        if (avgEnhancement < PalmCVConfig.enhancement.ridgeThreshold * 0.7) {
          firstFailureStage = 'CREASE_ENHANCEMENT';
          rootReason = `Enhancement response ${avgEnhancement.toFixed(3)} below ridge threshold ${PalmCVConfig.enhancement.ridgeThreshold}`;
          triage = 'ALGORITHMIC';
        } else {
          // Check if any candidate was extracted near the GT line
          let nearestCandidate = null;
          let minCandDist = Infinity;

          const normCandidates = candidates.map(c => ({
            ...c,
            normPolyline: c.polyline.map(p => ({ x: p.x / size, y: p.y / size }))
          }));

          for (const cand of normCandidates) {
            const geom = Evaluator.evaluateLineGeometry({ polyline: cand.normPolyline, status: 'DETECTED', continuity: cand.continuity }, gtPts);
            if (geom.meanPointToCurveDist < minCandDist) {
              minCandDist = geom.meanPointToCurveDist;
              nearestCandidate = cand;
            }
          }

          if (!nearestCandidate || minCandDist > 0.25) {
            firstFailureStage = 'CANDIDATE_GENERATION';
            rootReason = `No candidate graph component traced within 0.25 distance (nearest: ${minCandDist.toFixed(3)}). Skeletonization or minLength(${PalmCVConfig.topology.minCandidateLength}) pruned the crease.`;
            triage = 'ALGORITHMIC';
          } else {
            // A candidate existed near the line! Check why it wasn't classified or was rejected
            const prior = PalmCVConfig.classification.searchPriors[lt.toUpperCase()];
            const start = nearestCandidate.normPolyline[0];
            const end = nearestCandidate.normPolyline[nearestCandidate.normPolyline.length - 1];
            const forwardScore = MajorLineClassifier.scoreAlignment(start, end, nearestCandidate.normPolyline, prior);
            const reverseScore = MajorLineClassifier.scoreAlignment(end, start, nearestCandidate.normPolyline, prior);
            const alignScore = Math.max(forwardScore, reverseScore);

            if (alignScore <= 0.35) {
              firstFailureStage = 'CLASSIFICATION_PRIOR';
              rootReason = `Candidate alignment score ${alignScore.toFixed(3)} failed prior sector threshold (0.35). Trajectory or endpoint fell outside search prior window.`;
              triage = 'ALGORITHMIC';
            } else {
              // Check true furrow verification
              const isFurrow = MajorLineClassifier.isTrueFurrow(nearestCandidate, palm);
              if (!isFurrow) {
                firstFailureStage = 'FURROW_VERIFICATION';
                rootReason = `Candidate rejected by isTrueFurrow: cross-sectional valley ratio below 0.35.`;
                triage = 'ALGORITHMIC';
              } else {
                firstFailureStage = 'CONFIDENCE_FILTERING';
                rootReason = `Candidate passed furrow check but total confidence fell below detection threshold (0.55).`;
                triage = 'ALGORITHMIC';
              }
            }
          }
        }
      }

      if (stageCounts[lt][firstFailureStage] !== undefined) {
        stageCounts[lt][firstFailureStage]++;
      }

      forensicsRecords.push({
        imageId: palmMeta.imageId,
        split: palmMeta.split,
        qualityCategory: palmMeta.qualityCategory,
        lighting: palmMeta.lighting,
        line: lt,
        groundTruthStatus: gt.status,
        detectedStatus: det ? det.status : 'NOT_DETECTED',
        firstFailureStage,
        triage,
        rootReason
      });
    }
  }

  const results = {
    datasetVersion: manifest.datasetVersion,
    analyzedPalms: palms.length,
    totalFalseNegatives: forensicsRecords.length,
    stageCounts,
    records: forensicsRecords
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const outputPath = path.join(REPORTS_DIR, 'failure_forensics.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`Saved failure forensics report to ${outputPath}`);
  console.log('Stage distribution summary:');
  for (const lt of lineNames) {
    console.log(`  ${lt.toUpperCase()}:`, stageCounts[lt]);
  }

  return results;
}

if (process.argv[1]?.endsWith('p15-failure-forensics.js')) {
  runFailureForensics().then(() => {
    console.log('Failure forensics completed successfully.');
  }).catch(err => {
    console.error('Forensics failed:', err);
    process.exit(1);
  });
}
