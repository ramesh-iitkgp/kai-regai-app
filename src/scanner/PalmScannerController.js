/**
 * Kai RegAI — Palm Scanner Controller
 * Phase: P6 — Hand Scanner Experience
 * 
 * Central controller coordinating camera streaming, lightweight frame analysis,
 * temporal stability accumulation, countdown orchestration, full P5.2 inference,
 * and canonical PalmFeatureModel translation.
 */

import { SCANNER_STATES, ScannerStateMachine } from './ScannerStateMachine.js';
import { CameraCaptureService, PERMISSION_STATES } from './CameraCaptureService.js';
import { PalmVisionEngine } from '../cv/index.js';
import { PalmFeatureModelAdapter } from '../cv/adapters/PalmFeatureModelAdapter.js';
import { HandDetector } from '../cv/detection/HandDetector.js';
import { ImageQualityAnalyzer } from '../cv/image/ImageQualityAnalyzer.js';
import { PalmUsabilityValidator } from '../cv/quality/PalmUsabilityValidator.js';
import { RetakeDecisionEngine } from '../cv/quality/RetakeDecisionEngine.js';

export class PalmScannerController {
  constructor(options = {}) {
    this.stateMachine = options.stateMachine || new ScannerStateMachine(SCANNER_STATES.INITIALIZING, {
      handSide: options.handSide || 'RIGHT'
    });
    this.cameraService = options.cameraService || new CameraCaptureService();
    this.visionEngine = options.visionEngine || new PalmVisionEngine(options.cvConfig || {});

    this.frameIntervalMs = options.frameIntervalMs || 75; // ~13 Hz responsive preview loop
    this.countdownSeconds = options.countdownSeconds !== undefined ? options.countdownSeconds : 2;
    this.loopTimer = null;
    this.countdownTimer = null;
    this.isRunning = false;

    // Stability criteria
    this.stabilityTarget = options.stabilityTarget || options.stabilityWindow || 3;
    this.stabilityCount = 0;
    this.autoCapture = options.autoCapture !== false; // default true
    this.autoStartLoop = options.autoStartLoop !== false;
    this.enableChoreography = options.enableChoreography !== undefined 
      ? options.enableChoreography 
      : (options.countdownSeconds !== 0 && typeof window !== 'undefined');
    this.choreographyDelayMs = options.choreographyDelayMs !== undefined ? options.choreographyDelayMs : 550;
    this.listeners = new Set();
  }

  get consecutiveStableFrames() {
    return this.stabilityCount;
  }

  getState() {
    return this.stateMachine.getState();
  }

  getContext() {
    return this.stateMachine.getContext();
  }

  subscribe(listener) {
    return this.stateMachine.subscribe(listener);
  }

  /**
   * Start the scanner journey
   */
  async start() {
    this.isRunning = true;
    this.stabilityCount = 0;

    // 1. Check camera hardware availability
    if (!this.cameraService.isAvailable() && !this.cameraService.isMockMode) {
      this.stateMachine.transition(SCANNER_STATES.ERROR, {
        errorMessage: 'Camera hardware is not available on this device or browser.'
      });
      return false;
    }

    // 2. Request permission / start stream
    this.stateMachine.transition(SCANNER_STATES.CAMERA_PERMISSION_REQUIRED, {
      feedbackMessage: 'Please allow camera access to scan your palm'
    });

    const streamResult = await this.cameraService.startStream();
    if (!streamResult.success) {
      if (streamResult.reason === 'PERMISSION_DENIED') {
        this.stateMachine.transition(SCANNER_STATES.ERROR, {
          errorMessage: 'Camera access denied. Please grant permission in your browser or device settings.'
        });
      } else {
        this.stateMachine.transition(SCANNER_STATES.ERROR, {
          errorMessage: 'Unable to initialize camera video stream.'
        });
      }
      return false;
    }

    // 3. Camera ready -> begin searching
    this.stateMachine.transition(SCANNER_STATES.CAMERA_READY, {
      feedbackMessage: 'Camera connected. Position your open palm inside the guide.'
    });

    this.stateMachine.transition(SCANNER_STATES.SEARCHING_FOR_HAND, {
      feedbackMessage: 'Place your palm within the frame'
    });

    // 4. Start lightweight evaluation loop
    if (this.autoStartLoop) {
      this.startPreviewLoop();
    }
    return true;
  }

  /**
   * Stop the scanner and release hardware
   */
  stop() {
    this.isRunning = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.cameraService.stopStream();
  }

  /**
   * Switch between left and right hand alignment
   */
  setHandSide(handSide) {
    const valid = handSide === 'LEFT' ? 'LEFT' : 'RIGHT';
    this.stateMachine.updateContext({ handSide: valid });
  }

  /**
   * Toggle hardware torch
   */
  async toggleTorch() {
    return await this.cameraService.toggleTorch();
  }

  /**
   * Flip camera front / back
   */
  async flipCamera() {
    const res = await this.cameraService.flipCamera();
    return res.success;
  }

  /**
   * Lightweight preview analysis loop (runs at ~5 Hz)
   */
  startPreviewLoop() {
    if (this.loopTimer) clearInterval(this.loopTimer);

    this.loopTimer = setInterval(async () => {
      if (!this.isRunning) return;

      const currentState = this.stateMachine.getState();
      // Only run preview analysis when in an active tracking state
      if (![
        SCANNER_STATES.SEARCHING_FOR_HAND,
        SCANNER_STATES.HAND_DETECTED,
        SCANNER_STATES.PALM_ALIGNING,
        SCANNER_STATES.QUALITY_CHECK,
        SCANNER_STATES.STABILIZING
      ].includes(currentState)) {
        return;
      }

      const frame = this.cameraService.captureFrame();
      if (!frame) return;

      await this.evaluatePreviewFrame(frame);
    }, this.frameIntervalMs);
  }

  /**
   * Lightweight frame evaluation
   */
  async evaluatePreviewFrame(frame) {
    const context = this.stateMachine.getContext();
    const handedness = context.handSide || 'RIGHT';

    try {
      // 1. Fast optical check
      const imageQuality = ImageQualityAnalyzer.analyze(frame, this.visionEngine.config.quality);

      // 2. Fast hand detector
      const hand = HandDetector.detect(frame, { expectedHandedness: handedness });

      if (!hand.detected) {
        this.stabilityCount = 0;
        const retake = RetakeDecisionEngine.evaluate(imageQuality, hand, null);
        const noHandPayload = {
          feedbackMessage: retake.primaryMessage || 'Align your palm with the guide',
          stabilityCount: 0,
          landmarks: null,
          handDetected: false
        };
        if (this.stateMachine.getState() !== SCANNER_STATES.SEARCHING_FOR_HAND) {
          this.stateMachine.transition(SCANNER_STATES.SEARCHING_FOR_HAND, noHandPayload);
        } else {
          this.stateMachine.updateContext(noHandPayload);
        }
        return { handDetected: false, usable: false, retake };
      }

      // Live palm tracked! Update context with 21 anatomical landmarks
      this.stateMachine.updateContext({
        landmarks: hand.landmarks,
        hand,
        handDetected: true
      });

      // Hand detected!
      if (this.stateMachine.getState() === SCANNER_STATES.SEARCHING_FOR_HAND) {
        this.stateMachine.transition(SCANNER_STATES.HAND_DETECTED, {
          feedbackMessage: 'Hand detected. Aligning palm…',
          landmarks: hand.landmarks,
          hand,
          handDetected: true
        });
      }

      // 3. Fast usability check
      const usability = PalmUsabilityValidator.validate(frame, hand, this.visionEngine.config.usability);
      const retake = RetakeDecisionEngine.evaluate(imageQuality, hand, usability);

      if (!usability.usable || !imageQuality.passed) {
        this.stabilityCount = 0;
        if (this.stateMachine.getState() !== SCANNER_STATES.PALM_ALIGNING) {
          this.stateMachine.transition(SCANNER_STATES.PALM_ALIGNING, {
            feedbackMessage: retake.primaryMessage || 'Adjust your palm position',
            guidanceDetail: retake.detailedGuidance || [],
            diagnosticCode: retake.diagnosticCode,
            stabilityCount: 0
          });
        } else {
          this.stateMachine.updateContext({
            feedbackMessage: retake.primaryMessage || 'Adjust your palm position',
            guidanceDetail: retake.detailedGuidance || [],
            diagnosticCode: retake.diagnosticCode,
            stabilityCount: 0
          });
        }
        return { handDetected: true, usable: false, retake };
      }

      // Positioning and optical quality are solid! Accumulate stability
      this.stabilityCount++;
      const currentCount = this.stabilityCount;

      if (currentCount < this.stabilityTarget) {
        this.stateMachine.transition(SCANNER_STATES.STABILIZING, {
          feedbackMessage: 'Hold steady…',
          stabilityCount: currentCount,
          stabilityTarget: this.stabilityTarget
        });
        return { handDetected: true, usable: true, stable: false, stabilityCount: currentCount };
      } else {
        // Stability criteria satisfied! Transition to READY
        this.stateMachine.transition(SCANNER_STATES.READY, {
          feedbackMessage: 'Palm aligned. Ready to capture!',
          stabilityCount: currentCount
        });

        if (this.autoCapture) {
          this.startCountdownAndCapture();
        }
        return { handDetected: true, usable: true, stable: true, stabilityCount: currentCount };
      }
    } catch (err) {
      console.warn('[PalmScannerController] Preview frame error:', err);
      return { handDetected: false, error: err };
    }
  }

  /**
   * Process a single real-time frame
   */
  async processRealtimeFrame(frame = null) {
    const targetFrame = frame || this.cameraService.captureFrame();
    if (!targetFrame) return { handDetected: false, usable: false };
    return await this.evaluatePreviewFrame(targetFrame);
  }

  /**
   * Countdown choreography: 3 -> 2 -> 1 -> CAPTURE
   */
  startCountdownAndCapture() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    if (this.countdownSeconds === 0) {
      return this.executeCapture();
    }

    let count = this.countdownSeconds;
    this.stateMachine.transition(SCANNER_STATES.COUNTDOWN, {
      countdown: count,
      feedbackMessage: `Hold steady… ${count}`
    });

    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        this.stateMachine.updateContext({
          countdown: count,
          feedbackMessage: `Hold steady… ${count}`
        });
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.executeCapture();
      }
    }, 700);
  }

  /**
   * Trigger instantaneous capture
   */
  async triggerCapture() {
    return await this.executeCapture();
  }

  /**
   * Grab high-resolution frame and invoke P5.2 inference pipeline
   */
  async executeCapture() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    this.stateMachine.transition(SCANNER_STATES.CAPTURING, {
      feedbackMessage: 'Capturing high-resolution palm snapshot…'
    });

    const frame = this.cameraService.captureFrame();
    if (!frame) {
      this.stateMachine.transition(SCANNER_STATES.RETAKE, {
        feedbackMessage: 'Failed to capture frame. Please try again.',
        diagnosticCode: 'CAPTURE_FAILED'
      });
      return {
        success: false,
        state: SCANNER_STATES.RETAKE,
        retake: { guidance: 'Failed to capture frame. Please try again.' }
      };
    }

    this.stateMachine.transition(SCANNER_STATES.PROCESSING, {
      feedbackMessage: 'Analyzing visible palm creases…',
      capturedImage: frame
    });

    const context = this.stateMachine.getContext();
    const handedness = context.handSide || 'RIGHT';

    try {
      const startTime = performance.now();
      const visionResult = await this.visionEngine.analyze(frame, { handednessHint: handedness });
      const durationMs = Number((performance.now() - startTime).toFixed(1));

      if (visionResult.status === 'SUCCESS') {
        const featureModel = PalmFeatureModelAdapter.toPalmFeatureModel(visionResult, `session-${Date.now()}`);

        // Sacred Choreographed Line Scan Progression with Smooth Percentage (0% -> 100%)
        if (this.enableChoreography && this.choreographyDelayMs > 0) {
          const stages = [
            { stage: 'LIFE', line: 'LIFE', color: '#A855F7', msg: 'Tracing Vitality & Life Rhythm…', targetPct: 25 },
            { stage: 'HEAD', line: 'HEAD', color: '#00D2FF', msg: 'Mapping Thought Architecture…', targetPct: 45 },
            { stage: 'HEART', line: 'HEART', color: '#EF4444', msg: 'Attuning Emotional Landscape…', targetPct: 65 },
            { stage: 'FATE', line: 'FATE', color: '#FBBF24', msg: 'Discerning Purpose & Direction…', targetPct: 82 },
            { stage: 'SUN', line: 'SUN', color: '#F59E0B', msg: 'Illuminating Creative Expression…', targetPct: 94 },
            { stage: 'CONSOLIDATE', line: 'ALL', color: '#10B981', msg: 'Consolidating Palm Geometry…', targetPct: 100 }
          ];

          let currentPct = 5;
          for (const s of stages) {
            if (!this.isRunning) break;
            const target = s.targetPct;
            const steps = 6;
            const stepIncrement = (target - currentPct) / steps;
            const stepDelay = Math.max(10, Math.floor(this.choreographyDelayMs / steps));

            for (let step = 0; step < steps; step++) {
              if (!this.isRunning) break;
              currentPct = Math.min(100, Math.round(currentPct + stepIncrement));
              this.stateMachine.updateContext({
                scanStage: s.stage,
                highlightedLine: s.line,
                laserColor: s.color,
                feedbackMessage: s.msg,
                scanProgressPercent: currentPct,
                featureModel
              });
              await new Promise(r => setTimeout(r, stepDelay));
            }
          }
        }

        this.stateMachine.transition(SCANNER_STATES.VALIDATING, {
          feedbackMessage: 'Validating crease geometry…',
          visionResult,
          featureModel
        });

        this.stateMachine.transition(SCANNER_STATES.SUCCESS, {
          feedbackMessage: 'Palm scan complete!',
          visionResult,
          featureModel,
          durationMs
        });
        return {
          success: true,
          state: SCANNER_STATES.SUCCESS,
          visionResult,
          featureModel,
          durationMs
        };
      } else {
        const retake = visionResult.retakeDecision || {
          primaryMessage: 'Please capture your palm under even lighting.',
          diagnosticCode: visionResult.status
        };

        this.stateMachine.transition(SCANNER_STATES.RETAKE, {
          feedbackMessage: retake.primaryMessage,
          guidanceDetail: retake.detailedGuidance || [],
          diagnosticCode: retake.diagnosticCode,
          visionResult
        });
        return {
          success: false,
          state: SCANNER_STATES.RETAKE,
          retake: {
            ...retake,
            guidance: retake.detailedGuidance?.[0] || retake.primaryMessage
          },
          visionResult
        };
      }
    } catch (err) {
      console.error('[PalmScannerController] CV analysis error:', err);
      this.stateMachine.transition(SCANNER_STATES.ERROR, {
        errorMessage: 'An unexpected error occurred during palm analysis. Please try again.'
      });
      return {
        success: false,
        state: SCANNER_STATES.ERROR,
        error: err
      };
    }
  }

  /**
   * Reset scanner to repeat scan or recapture
   */
  retryScan() {
    this.stabilityCount = 0;
    const context = this.stateMachine.getContext();
    this.stateMachine.transition(SCANNER_STATES.SEARCHING_FOR_HAND, {
      feedbackMessage: 'Place your palm within the frame',
      stabilityCount: 0,
      visionResult: null,
      featureModel: null
    });
    this.startPreviewLoop();
  }
}
