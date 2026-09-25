/**
 * Kai RegAI — Master Palm Computer Vision Engine
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Orchestrates the end-to-end CV pipeline:
 * Input Ingestion -> Quality Assessment -> Hand Detection ->
 * Palm Segmentation/Rectification -> Crease Enhancement ->
 * Candidate Extraction -> Major Line Classification -> Quality Gating.
 */

import { PALM_CV_ENGINE_VERSION } from '../types.js';
import { PalmCVConfig } from '../config/defaultConfig.js';
import { ImageIngestion } from '../image/ImageIngestion.js';
import { ImageQualityAnalyzer } from '../image/ImageQualityAnalyzer.js';
import { HandDetector } from '../detection/HandDetector.js';
import { PalmSegmentation } from '../detection/PalmSegmentation.js';
import { CreaseEnhancementEngine } from '../crease/CreaseEnhancementEngine.js';
import { CreaseCandidateGraph } from '../crease/CreaseCandidateGraph.js';
import { MajorLineClassifier } from '../crease/MajorLineClassifier.js';
import { PalmUsabilityValidator } from '../quality/PalmUsabilityValidator.js';
import { RetakeDecisionEngine } from '../quality/RetakeDecisionEngine.js';

export class PalmVisionEngine {
  constructor(customConfig = {}) {
    this.config = { ...PalmCVConfig, ...customConfig };
  }

  /**
   * Analyze palm image and extract geometric crease models
   * @param {import('../types.js').PalmImage | Object} rawInput
   * @param {Object} [options]
   * @param {string} [options.handednessHint='RIGHT']
   * @returns {Promise<import('../types.js').PalmVisionResult>}
   */
  async analyze(rawInput, options = {}) {
    const startTime = performance.now();
    const stageTimingsMs = {};

    try {
      // 1. Ingestion & Input Normalization
      const t0 = performance.now();
      const image = ImageIngestion.normalize(rawInput);
      stageTimingsMs.ingestion = Number((performance.now() - t0).toFixed(2));

      // 2. Optical Quality Assessment Gate
      const t1 = performance.now();
      const imageQuality = ImageQualityAnalyzer.analyze(image, this.config.quality);
      stageTimingsMs.quality = Number((performance.now() - t1).toFixed(2));

      if (!imageQuality.passed) {
        const retakeDecision = RetakeDecisionEngine.evaluate(imageQuality, null, null);
        return this.createFailureResult('RECAPTURE_REQUIRED', imageQuality, null, null, startTime, stageTimingsMs, null, retakeDecision);
      }

      // 3. Hand Detection & Landmark Localization
      const t2 = performance.now();
      const hand = HandDetector.detect(image, { expectedHandedness: options.handednessHint || 'RIGHT' });
      stageTimingsMs.handDetection = Number((performance.now() - t2).toFixed(2));

      if (!hand.detected) {
        const retakeDecision = RetakeDecisionEngine.evaluate(imageQuality, hand, null);
        const failureStatus = hand.reasons?.includes('PALM_TOO_FAR') ? 'INSUFFICIENT_EVIDENCE' : 'NO_HAND';
        return this.createFailureResult(failureStatus, imageQuality, hand, null, startTime, stageTimingsMs, null, retakeDecision);
      }

      // 3b. Palm Usability & Positioning Validation (P5.2 Hardening)
      const t2b = performance.now();
      const usability = PalmUsabilityValidator.validate(image, hand, this.config.usability);
      const retakeDecision = RetakeDecisionEngine.evaluate(imageQuality, hand, usability);
      stageTimingsMs.usability = Number((performance.now() - t2b).toFixed(2));

      if (!usability.usable) {
        const failureStatus = retakeDecision.action === 'USER_CORRECTION' ? 'RECAPTURE_REQUIRED' : 'INSUFFICIENT_EVIDENCE';
        return this.createFailureResult(failureStatus, imageQuality, hand, null, startTime, stageTimingsMs, usability, retakeDecision);
      }

      // 4. Palm ROI Extraction & Rectification
      const t3 = performance.now();
      const palm = PalmSegmentation.extractPalmROI(image, hand);
      palm.usability = usability;
      palm.qualityScore = imageQuality.score;
      palm.handedness = hand.handedness || options.handednessHint || 'RIGHT';
      stageTimingsMs.segmentation = Number((performance.now() - t3).toFixed(2));

      // 5. Multi-Scale Crease Enhancement (CLAHE + Hessian ridge filter)
      const t4 = performance.now();
      const { enhancedMap } = CreaseEnhancementEngine.enhance(palm.roiPatch, palm.roiSize, palm.mask, this.config.enhancement);
      stageTimingsMs.enhancement = Number((performance.now() - t4).toFixed(2));

      // 6. Candidate Crease Graph & Skeletonization
      const t5 = performance.now();
      const candidates = CreaseCandidateGraph.extractCandidates(enhancedMap, palm.roiSize, this.config.topology);
      stageTimingsMs.candidates = Number((performance.now() - t5).toFixed(2));

      // 7. Major Line Identification (Anatomical Search Priors)
      const t6 = performance.now();
      const lines = MajorLineClassifier.classify(candidates, palm.roiSize, palm, this.config.classification);
      stageTimingsMs.classification = Number((performance.now() - t6).toFixed(2));

      const totalDuration = Number((performance.now() - startTime).toFixed(2));

      return {
        status: 'SUCCESS',
        imageQuality,
        hand,
        palm,
        usability,
        retakeDecision,
        lines,
        processing: {
          durationMs: totalDuration,
          engineVersion: PALM_CV_ENGINE_VERSION,
          stageTimingsMs
        },
        diagnostics: {
          phase: 'P5.2',
          imageQuality,
          handDetection: hand,
          palmRegion: {
            roiBox: palm.boundingBox,
            scale: palm.scale,
            orientation: palm.orientation
          },
          usability,
          retakeDecision,
          processingTimeMs: totalDuration
        }
      };
    } catch (err) {
      const totalDuration = Number((performance.now() - startTime).toFixed(2));
      const fallbackQuality = {
        score: 0,
        sharpness: 0,
        illumination: 0,
        contrast: 0,
        glare: 0,
        framing: 0,
        resolution: 0,
        occlusion: 0,
        passed: false,
        reasons: [err.message || 'UNEXPECTED_PIPELINE_ERROR'],
        recommendations: ['Please try capturing again with steady lighting.']
      };
      const fallbackHand = { detected: false, handedness: 'UNKNOWN', confidence: 0 };
      const fallbackDecision = RetakeDecisionEngine.evaluate(fallbackQuality, fallbackHand, null);

      return {
        status: 'PROCESSING_ERROR',
        imageQuality: fallbackQuality,
        hand: fallbackHand,
        retakeDecision: fallbackDecision,
        lines: {
          life: MajorLineClassifier.createEmptyLine('LIFE'),
          head: MajorLineClassifier.createEmptyLine('HEAD'),
          heart: MajorLineClassifier.createEmptyLine('HEART'),
          fate: MajorLineClassifier.createEmptyLine('FATE'),
          sun: MajorLineClassifier.createEmptyLine('SUN')
        },
        processing: {
          durationMs: totalDuration,
          engineVersion: PALM_CV_ENGINE_VERSION,
          stageTimingsMs
        }
      };
    }
  }

  createFailureResult(status, imageQuality, hand, palm, startTime, stageTimingsMs, usability = null, retakeDecision = null) {
    const totalDuration = Number((performance.now() - startTime).toFixed(2));
    const decision = retakeDecision || RetakeDecisionEngine.evaluate(imageQuality, hand, usability);

    return {
      status,
      imageQuality,
      hand: hand || { detected: false, handedness: 'UNKNOWN', confidence: 0 },
      palm: palm || undefined,
      usability: usability || undefined,
      retakeDecision: decision,
      lines: {
        life: MajorLineClassifier.createEmptyLine('LIFE'),
        head: MajorLineClassifier.createEmptyLine('HEAD'),
        heart: MajorLineClassifier.createEmptyLine('HEART'),
        fate: MajorLineClassifier.createEmptyLine('FATE'),
        sun: MajorLineClassifier.createEmptyLine('SUN')
      },
      processing: {
        durationMs: totalDuration,
        engineVersion: PALM_CV_ENGINE_VERSION,
        stageTimingsMs
      },
      diagnostics: {
        phase: 'P5.2',
        imageQuality,
        handDetection: hand,
        usability,
        retakeDecision: decision,
        processingTimeMs: totalDuration
      }
    };
  }
}
