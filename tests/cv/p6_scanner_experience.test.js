import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ScannerStateMachine,
  SCANNER_STATES,
  PalmScannerController
} from '../../src/scanner/index.js';
import { renderScannerHUD } from '../../src/components/ScannerHUD.js';
import { soundService } from '../../src/services/SoundService.js';
import { PalmFeatureModelAdapter } from '../../src/cv/adapters/PalmFeatureModelAdapter.js';

test('P6-EXP.1: SoundService manages mute state and synthesizes harmonic tones safely', () => {
  assert.equal(typeof soundService.playAlignmentChime, 'function');
  assert.equal(typeof soundService.playLineTone, 'function');
  assert.equal(typeof soundService.playShutterSound, 'function');

  const initialMute = soundService.isMuted();
  soundService.setMuted(true);
  assert.equal(soundService.isMuted(), true);

  // Calling playLineTone while muted should execute silently without throwing
  assert.doesNotThrow(() => soundService.playLineTone('life'));
  assert.doesNotThrow(() => soundService.playLineTone('head'));
  assert.doesNotThrow(() => soundService.playLineTone('heart'));
  assert.doesNotThrow(() => soundService.playLineTone('fate'));
  assert.doesNotThrow(() => soundService.playLineTone('sun'));

  soundService.setMuted(false);
  assert.equal(soundService.isMuted(), false);
  soundService.setMuted(initialMute);
});

test('P6-EXP.2: ScannerHUD renders reference wireframe palm map and scanning progress', () => {
  const html = renderScannerHUD({
    handSide: 'RIGHT',
    state: SCANNER_STATES.PROCESSING,
    scanProgressPercent: 57,
    feedbackMessage: 'Scanning palm creases…',
    isMockActive: true
  });

  // Verify critical HUD controls and attributes matching Screenshot 1 & 2
  assert.ok(html.includes('id="scanner-exit-btn"'), 'Exit button must be present in top-right');
  assert.ok(html.includes('id="scanner-sound-btn"'), 'Sound toggle button must be present');
  assert.ok(html.includes('id="scanner-flip-btn"'), 'Hand flip button must be present');
  assert.ok(html.includes('scanner-map-overlay'), 'Palm wireframe map overlay SVG must be present');
  assert.ok(html.includes('390,1260 440,860 580,850 690,880 800,945 600,1350'), 'Palm polygon coordinates must match reference wireframe');
  assert.ok(html.includes('Scanning 57%'), 'Exact scanning percentage text must be rendered');
  assert.ok(html.includes('scanner-progress-bar'), 'Scanning progress bar element must be present');
  assert.ok(html.includes('width: 57%;'), 'Progress bar width must reflect 57%');
  assert.ok(html.includes('#EF4444'), 'Illuminated crease line in red must match Screenshot 2');
});

test('P6-EXP.3: PalmScannerController executes choreography across all 5 major lines', async () => {
  const observedStages = [];
  const controller = new PalmScannerController({
    stabilityWindow: 1,
    countdownSeconds: 0,
    enableChoreography: true,
    choreographyDelayMs: 5, // rapid timing for unit test
    autoStartLoop: false,
    autoCapture: false
  });

  controller.subscribe((newState, oldState, context) => {
    if (context.scanStage && !observedStages.includes(context.scanStage)) {
      observedStages.push(context.scanStage);
    }
  });

  const { createMatrixPalmImage } = await import('./p5_2_robustness_matrix.test.js');
  const goldenPalm = createMatrixPalmImage(640, 480, { scale: 1.0, lighting: 'normal' });
  controller.cameraService.enableMockMode(() => goldenPalm);

  await controller.start({ videoElement: null });
  const res = await controller.executeCapture();
  assert.equal(res.success, true);
  assert.equal(res.state, SCANNER_STATES.SUCCESS);

  // Verify all 6 stages executed in sequence
  assert.deepEqual(observedStages, ['LIFE', 'HEAD', 'HEART', 'FATE', 'SUN', 'CONSOLIDATE']);
});
