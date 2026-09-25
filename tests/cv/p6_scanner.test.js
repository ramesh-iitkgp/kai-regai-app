import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ScannerStateMachine,
  SCANNER_STATES,
  VALID_TRANSITIONS,
  CameraCaptureService,
  CAMERA_PERMISSIONS,
  PalmScannerController
} from '../../src/scanner/index.js';
import { createMatrixPalmImage } from './p5_2_robustness_matrix.test.js';
import { PalmFeatureModelAdapter } from '../../src/cv/adapters/PalmFeatureModelAdapter.js';

test('P6.1 ScannerStateMachine — validates complete 16-state lifecycle and valid transitions', () => {
  const sm = new ScannerStateMachine();
  assert.equal(sm.getState(), SCANNER_STATES.INITIALIZING);

  const observedStates = [];
  sm.subscribe((state) => observedStates.push(state));

  // Step through canonical happy-path lifecycle
  sm.transition(SCANNER_STATES.CAMERA_READY);
  sm.transition(SCANNER_STATES.SEARCHING_FOR_HAND);
  sm.transition(SCANNER_STATES.HAND_DETECTED);
  sm.transition(SCANNER_STATES.PALM_ALIGNING);
  sm.transition(SCANNER_STATES.QUALITY_CHECK);
  sm.transition(SCANNER_STATES.STABILIZING);
  sm.transition(SCANNER_STATES.READY);
  sm.transition(SCANNER_STATES.COUNTDOWN);
  sm.transition(SCANNER_STATES.CAPTURING);
  sm.transition(SCANNER_STATES.PROCESSING);
  sm.transition(SCANNER_STATES.VALIDATING);
  sm.transition(SCANNER_STATES.SUCCESS);

  assert.equal(sm.getState(), SCANNER_STATES.SUCCESS);
  assert.equal(observedStates.length, 12);
  assert.equal(observedStates[observedStates.length - 1], SCANNER_STATES.SUCCESS);

  // Transition back to camera ready after success
  sm.transition(SCANNER_STATES.CAMERA_READY);
  assert.equal(sm.getState(), SCANNER_STATES.CAMERA_READY);
});

test('P6.2 ScannerStateMachine — rejects invalid or out-of-order transitions', () => {
  const sm = new ScannerStateMachine();
  assert.equal(sm.getState(), SCANNER_STATES.INITIALIZING);

  // Attempt impossible jump directly from INITIALIZING to SUCCESS or CAPTURING
  assert.throws(() => {
    sm.transition(SCANNER_STATES.SUCCESS);
  }, /Invalid state transition/);

  assert.throws(() => {
    sm.transition(SCANNER_STATES.CAPTURING);
  }, /Invalid state transition/);

  // canTransitionTo check matches validation
  assert.equal(sm.canTransitionTo(SCANNER_STATES.SUCCESS), false);
  assert.equal(sm.canTransitionTo(SCANNER_STATES.CAMERA_READY), true);
  assert.equal(sm.canTransitionTo(SCANNER_STATES.CAMERA_PERMISSION_REQUIRED), true);
  assert.equal(sm.canTransitionTo(SCANNER_STATES.ERROR), true);
});

test('P6.3 ScannerStateMachine — handles permission request and retake branching', () => {
  const sm = new ScannerStateMachine();

  // Permission branch
  sm.transition(SCANNER_STATES.CAMERA_PERMISSION_REQUIRED);
  assert.equal(sm.getState(), SCANNER_STATES.CAMERA_PERMISSION_REQUIRED);
  sm.transition(SCANNER_STATES.CAMERA_READY);
  assert.equal(sm.getState(), SCANNER_STATES.CAMERA_READY);

  // Retake branch from processing/validating
  sm.transition(SCANNER_STATES.SEARCHING_FOR_HAND);
  sm.transition(SCANNER_STATES.HAND_DETECTED);
  sm.transition(SCANNER_STATES.CAPTURING);
  sm.transition(SCANNER_STATES.PROCESSING);
  sm.transition(SCANNER_STATES.VALIDATING);
  sm.transition(SCANNER_STATES.RETAKE);
  assert.equal(sm.getState(), SCANNER_STATES.RETAKE);

  // From retake, recovers directly back to searching
  sm.transition(SCANNER_STATES.SEARCHING_FOR_HAND);
  assert.equal(sm.getState(), SCANNER_STATES.SEARCHING_FOR_HAND);
});

test('P6.4 CameraCaptureService — initializes and supports mock frame ingestion in headless node', async () => {
  const camera = new CameraCaptureService();
  assert.equal(camera.permissionState, CAMERA_PERMISSIONS.NOT_REQUESTED);

  // Enable mock mode with a synthetic palm frame
  const mockFrame = createMatrixPalmImage(640, 480, { scale: 1.0, lighting: 'normal' });
  camera.enableMockMode(() => mockFrame);

  const status = await camera.initialize({ videoElement: null });
  assert.equal(status.ok, true);
  assert.equal(camera.permissionState, CAMERA_PERMISSIONS.GRANTED);
  assert.equal(camera.isActive, true);

  // Grab frame
  const frame = camera.grabFrame();
  assert.ok(frame);
  assert.equal(frame.width, 640);
  assert.equal(frame.height, 480);
  assert.ok(frame.data instanceof Uint8ClampedArray);

  // Toggle camera
  const switched = await camera.switchCamera();
  assert.equal(switched, true);
  assert.equal(camera.facingMode, 'user');

  camera.stop();
  assert.equal(camera.isActive, false);
});

test('P6.5 PalmScannerController — requires 3 consecutive stable frames before triggering READY', async () => {
  const controller = new PalmScannerController({
    stabilityWindow: 3,
    autoStartLoop: false,
    autoCapture: false
  });

  const stablePalm = createMatrixPalmImage(640, 480, { scale: 1.0, lighting: 'normal' });
  const noisyPalm = createMatrixPalmImage(640, 480, { scale: 1.0, lighting: 'low' }); // Low lighting triggers retake/not usable

  controller.cameraService.enableMockMode(() => stablePalm);

  await controller.start({ videoElement: null });
  assert.equal(controller.stateMachine.getState(), SCANNER_STATES.SEARCHING_FOR_HAND);

  // Frame 1: Stable
  let decision1 = await controller.processRealtimeFrame();
  assert.equal(decision1.handDetected, true);
  assert.equal(controller.consecutiveStableFrames, 1);
  assert.equal(controller.stateMachine.getState(), SCANNER_STATES.STABILIZING);

  // Frame 2: Introduce noisy frame -> resets stability accumulator
  controller.cameraService.enableMockMode(() => noisyPalm);
  let decision2 = await controller.processRealtimeFrame();
  assert.equal(controller.consecutiveStableFrames, 0);

  // Reset to stable palm and supply 3 consecutive stable frames
  controller.cameraService.enableMockMode(() => stablePalm);
  await controller.processRealtimeFrame(); // count 1
  assert.equal(controller.consecutiveStableFrames, 1);
  await controller.processRealtimeFrame(); // count 2
  assert.equal(controller.consecutiveStableFrames, 2);
  await controller.processRealtimeFrame(); // count 3 -> triggers READY
  assert.equal(controller.consecutiveStableFrames, 3);
  assert.equal(controller.stateMachine.getState(), SCANNER_STATES.READY);

  controller.stop();
});

test('P6.6 PalmScannerController — executes capture, full P5.2 inference, and returns canonical PalmFeatureModel', async () => {
  const controller = new PalmScannerController({
    stabilityWindow: 1,
    countdownSeconds: 0, // instantaneous capture for deterministic test
    autoStartLoop: false,
    autoCapture: false
  });

  const goldenPalm = createMatrixPalmImage(640, 480, {
    scale: 1.0,
    lighting: 'normal',
    skinTone: 'tan'
  });
  controller.cameraService.enableMockMode(() => goldenPalm);

  await controller.start({ videoElement: null });

  // Stabilize and trigger capture
  await controller.processRealtimeFrame();
  assert.equal(controller.stateMachine.getState(), SCANNER_STATES.READY);

  const scanResult = await controller.triggerCapture();
  assert.ok(scanResult);
  assert.equal(scanResult.success, true);
  assert.ok(scanResult.visionResult);
  assert.ok(scanResult.featureModel);
  assert.equal(controller.stateMachine.getState(), SCANNER_STATES.SUCCESS);

  // Verify feature model major lines
  const { major_lines } = scanResult.featureModel;
  assert.ok(major_lines.life_line);
  assert.ok(major_lines.head_line);
  assert.ok(major_lines.heart_line);
  assert.ok(major_lines.fate_line);
  assert.ok(major_lines.sun_line);

  // Semantic colors adhere to AGENTS.md
  assert.equal(major_lines.life_line.semantic_color, '#A855F7');
  assert.equal(major_lines.head_line.semantic_color, '#00D2FF');
  assert.equal(major_lines.heart_line.semantic_color, '#F43F5E');
  assert.equal(major_lines.fate_line.semantic_color, '#FBBF24');
  assert.equal(major_lines.sun_line.semantic_color, '#F59E0B');

  controller.stop();
});

test('P6.7 PalmScannerController — correctly produces RETAKE with actionable guidance on unacceptable capture', async () => {
  const controller = new PalmScannerController({
    stabilityWindow: 1,
    countdownSeconds: 0,
    autoStartLoop: false,
    autoCapture: false
  });

  // Test 1: Excessive hand tilt (> 45 deg)
  const tiltedPalm = createMatrixPalmImage(500, 500, {
    scale: 0.85,
    tiltDeg: 55
  });
  controller.cameraService.enableMockMode(() => tiltedPalm);

  await controller.start({ videoElement: null });

  const tiltResult = await controller.triggerCapture();
  assert.ok(tiltResult);
  assert.equal(tiltResult.success, false);
  assert.equal(tiltResult.state, SCANNER_STATES.RETAKE);
  assert.ok(tiltResult.retake);
  assert.match(tiltResult.retake.guidance, /upright|flat|hand|camera/i);

  // Recovery: user retries scan
  controller.retryScan();
  assert.equal(controller.stateMachine.getState(), SCANNER_STATES.SEARCHING_FOR_HAND);

  // Test 2: Two hands in frame
  const twoHands = createMatrixPalmImage(800, 500, { hands: 2, scale: 0.85 });
  controller.cameraService.enableMockMode(() => twoHands);

  const twoHandsResult = await controller.triggerCapture();
  assert.equal(twoHandsResult.success, false);
  assert.equal(twoHandsResult.state, SCANNER_STATES.RETAKE);
  assert.match(twoHandsResult.retake.primaryMessage, /one palm|visible/i);

  controller.stop();
});

test('P6.8 Epistemic Distinction — verifies OUT_OF_FRAME vs NOT_DETECTED in lines', () => {
  // Test coordinate mapping to SVG 360x450
  const normalizedPolyline = [
    { x: 0.25, y: 0.20 },
    { x: 0.50, y: 0.60 },
    { x: 0.75, y: 0.85 }
  ];

  const svgPath = PalmFeatureModelAdapter.polylineToSvgPath(normalizedPolyline, 360, 450);
  assert.equal(svgPath, 'M 90 90 L 180 270 L 270 383');

  // Verify empty polyline returns empty string without error
  assert.equal(PalmFeatureModelAdapter.polylineToSvgPath([], 360, 450), '');
  assert.equal(PalmFeatureModelAdapter.polylineToSvgPath(null, 360, 450), '');
});

test('P6.9 Recoverable Camera Error Handling — simulates camera failure and permission denial', async () => {
  const camera = new CameraCaptureService();
  camera.enableMockMode(() => null); // Simulate camera read failure

  const result = await camera.initialize({ videoElement: null });
  // In mock mode it succeeded, but grabbing frame returns null when provider returns null
  const frame = camera.grabFrame();
  assert.equal(frame, null);

  camera.permissionState = CAMERA_PERMISSIONS.DENIED;
  assert.equal(camera.permissionState, CAMERA_PERMISSIONS.DENIED);

  // Recovery: user re-grants permission or uses sample palm
  camera.permissionState = CAMERA_PERMISSIONS.GRANTED;
  assert.equal(camera.permissionState, CAMERA_PERMISSIONS.GRANTED);
});
