/**
 * Face Scanner & Mukha Samudrika Integration Test Suite
 * Tests:
 * 1. Mukha Samudrika Knowledge Base integrity & citations
 * 2. Face Scanner viewfinder, reticle, and capture interface
 * 3. Face Report screen structure, 6 feature bars, 3 feeling gauges, and carousel
 * 4. Navigation flows (Home -> Face Scanner -> Face Report -> Home)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MUKHA_FEATURE_DEFINITIONS,
  MUKHA_FEELINGS_METRICS,
  MUKHA_INSIGHT_CARDS,
  generateFaceReportData
} from '../src/knowledge/mukhaSamudrika/mukhaKnowledgeBase.js';
import { ROUTES } from '../src/navigation/routes.js';
import { router } from '../src/navigation/router.js';

describe('Mukha Samudrika Shastra Knowledge Base Verification', () => {

  test('1. All 6 classical facial features exist with verified citations and Sanskrit terms', () => {
    const requiredKeys = ['EYEBROWS', 'EYES', 'EYELIDS', 'NOSE', 'LIPS', 'CHIN'];
    requiredKeys.forEach(k => {
      const feat = MUKHA_FEATURE_DEFINITIONS[k];
      assert.ok(feat, `Feature definition for ${k} must exist`);
      assert.ok(feat.id, `Feature ${k} must have an ID`);
      assert.ok(feat.label, `Feature ${k} must have a user-facing label`);
      assert.ok(feat.sanskrit, `Feature ${k} must have authentic Sanskrit terminology`);
      assert.ok(feat.source, `Feature ${k} must have verified traditional source`);
      assert.ok(feat.citation, `Feature ${k} must retain citation`);
      assert.ok(typeof feat.defaultScore === 'number', `Feature ${k} must have numeric score`);
    });

    assert.ok(MUKHA_FEATURE_DEFINITIONS.EYEBROWS.citation.includes('Varahamihira'));
    assert.ok(MUKHA_FEATURE_DEFINITIONS.EYES.citation.includes('Garuda Purana'));
    assert.ok(MUKHA_FEATURE_DEFINITIONS.LIPS.citation.includes('Bhavishya Purana'));
  });

  test('2. All 3 feelings metrics are configured with canonical colors and scores', () => {
    const feelings = ['INTUITION', 'KINDNESS', 'PERCEPTION'];
    feelings.forEach(f => {
      const metric = MUKHA_FEELINGS_METRICS[f];
      assert.ok(metric, `Metric ${f} must exist`);
      assert.ok(metric.color, `Metric ${f} must have an arc stroke color`);
      assert.ok(typeof metric.defaultScore === 'number', `Metric ${f} must have default score`);
    });

    assert.equal(MUKHA_FEELINGS_METRICS.INTUITION.defaultScore, 51);
    assert.equal(MUKHA_FEELINGS_METRICS.KINDNESS.defaultScore, 85);
    assert.equal(MUKHA_FEELINGS_METRICS.PERCEPTION.defaultScore, 61);
  });

  test('3. Insight cards contain verified non-deterministic narrative reflections', () => {
    assert.ok(MUKHA_INSIGHT_CARDS.length >= 5, 'Must have at least 5 insight cards');
    MUKHA_INSIGHT_CARDS.forEach(card => {
      assert.ok(card.id, 'Card must have id');
      assert.ok(card.title, 'Card must have title');
      assert.ok(card.body, 'Card must have body');
      assert.ok(card.sanskritRef, 'Card must have Sanskrit grounding');
    });

    const hasSelfReliance = MUKHA_INSIGHT_CARDS.some(c => c.title.includes('rely on yourself'));
    const hasGoalOriented = MUKHA_INSIGHT_CARDS.some(c => c.title.includes('goal-oriented'));
    assert.ok(hasSelfReliance, 'Must contain self-reliance card matching reference video');
    assert.ok(hasGoalOriented, 'Must contain goal-oriented card matching reference video');
  });

  test('4. generateFaceReportData produces valid payload with customizable overrides', () => {
    const data = generateFaceReportData({
      eyebrows: 75,
      intuition: 68
    });
    assert.ok(data.scanTimestamp);
    assert.equal(data.features[0].score, 75);
    assert.equal(data.feelings[0].score, 68);
    assert.ok(data.vedicSummary);
  });

});

describe('Face Scanner & Face Report UI Verification', () => {

  test('5. FaceScannerScreen renders viewfinder, prompt, reticle, and shutter button', async () => {
    let dom = '';
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: (sel) => {
        return {
          addEventListener: () => {},
          style: {},
          classList: { add: () => {}, remove: () => {} }
        };
      }
    };

    const { renderFaceScannerScreen } = await import('../src/screens/FaceScannerScreen.js');
    renderFaceScannerScreen(container);

    assert.ok(dom.includes('Take a photo of your face'), 'Prompt text must match video');
    assert.ok(dom.includes('face-oval-dotted-border'), 'Dotted oval reticle must exist');
    assert.ok(dom.includes('face-shutter-btn'), 'Shutter button must exist');
    assert.ok(dom.includes('MUKHA SAMUDRIKA'), 'Vedic badge must exist');
  });

  test('6. FaceReportScreen renders reference layout (FEATURE ANALYSIS, 3 Insights, Key Takeaways, Action buttons)', async () => {
    let dom = '';
    const listeners = {};
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: (sel) => {
        return {
          addEventListener: (ev, fn) => { listeners[`${sel}:${ev}`] = fn; },
          style: {},
          classList: { add: () => {}, remove: () => {} }
        };
      },
      querySelectorAll: () => []
    };

    const { renderFaceReportScreen } = await import('../src/screens/FaceReportScreen.js');
    renderFaceReportScreen(container);

    // 1. Header & Title Block matching reference design
    assert.ok(dom.includes('Face Reading'), 'Must render Face Reading title');
    assert.ok(dom.includes('Results'), 'Must render Results highlight');
    assert.ok(dom.includes('INSIGHTS FROM YOUR FEATURES'), 'Subtitle must match');

    // 2. FEATURE ANALYSIS Section with 6 items
    assert.ok(dom.includes('FEATURE ANALYSIS'), 'Feature Analysis card header must exist');
    assert.ok(dom.includes('Eyebrows') && dom.includes('Defined'), 'Must render Eyebrows: Defined');
    assert.ok(dom.includes('Eyes') && dom.includes('Expressive'), 'Must render Eyes: Expressive');
    assert.ok(dom.includes('Eyelids') && dom.includes('Balanced'), 'Must render Eyelids: Balanced');
    assert.ok(dom.includes('Nose') && dom.includes('Well-proportioned'), 'Must render Nose: Well-proportioned');
    assert.ok(dom.includes('Lips') && dom.includes('Full'), 'Must render Lips: Full');
    assert.ok(dom.includes('Chin') && dom.includes('Rounded'), 'Must render Chin: Rounded');

    // 3. YOUR PERSONAL INSIGHTS (3 Cards: Intuition, Emotional Nature, Social Nature)
    assert.ok(dom.includes('YOUR PERSONAL INSIGHTS'), 'Personal Insights heading must exist');
    assert.ok(dom.includes('INTUITION') && dom.includes('Strong'), 'Must render Intuition: Strong');
    assert.ok(dom.includes('EMOTIONAL NATURE') && dom.includes('Deep'), 'Must render Emotional Nature: Deep');
    assert.ok(dom.includes('SOCIAL NATURE') && dom.includes('Warm'), 'Must render Social Nature: Warm');

    // 4. KEY TAKEAWAYS Section with 5 Pills
    assert.ok(dom.includes('KEY TAKEAWAYS'), 'Key Takeaways heading must exist');
    assert.ok(dom.includes('Intuitive'), 'Must include Intuitive takeaway');
    assert.ok(dom.includes('Kind &amp; Considerate') || dom.includes('Kind & Considerate'), 'Must include Kind & Considerate takeaway');
    assert.ok(dom.includes('Observant'), 'Must include Observant takeaway');
    assert.ok(dom.includes('Practical'), 'Must include Practical takeaway');
    assert.ok(dom.includes('Adaptable'), 'Must include Adaptable takeaway');

    // 5. Action Buttons (Scan Again & Back to Main Menu)
    assert.ok(dom.includes('Scan Again'), 'Scan Again button must exist');
    assert.ok(dom.includes('Back to Main Menu'), 'Back to Main Menu button must exist');

    // 6. Test Navigation Callbacks
    let navigatedRoute = null;
    const origNav = router.navigate;
    router.navigate = (r) => { navigatedRoute = r; };

    const backMenuHandler = listeners['#face-back-main-menu-btn:click'];
    assert.ok(typeof backMenuHandler === 'function', 'Back to main menu button listener attached');
    backMenuHandler();
    assert.equal(navigatedRoute, ROUTES.HOME);

    const rescanHandler = listeners['#face-rescan-btn:click'];
    assert.ok(typeof rescanHandler === 'function', 'Scan again listener attached');
    rescanHandler();
    assert.equal(navigatedRoute, ROUTES.FACE_SCANNER);

    router.navigate = origNav;
  });

  test('7. ROUTES contains FACE_SCANNER and FACE_REPORT', () => {
    assert.equal(ROUTES.FACE_SCANNER, 'face-scanner');
    assert.equal(ROUTES.FACE_REPORT, 'face-report');
  });

  test('8. FaceDetectorEngine rejects non-face frames with NO_FACE_DETECTED', async () => {
    const { analyzeCanvasFace } = await import('../src/cv/face/FaceDetectorEngine.js');
    
    // Blank / dark frame
    const blank = new Uint8ClampedArray(400 * 400 * 4);
    const result = analyzeCanvasFace({ data: blank, width: 400, height: 400 });
    assert.equal(result.detected, false);
    assert.equal(result.reason, 'NO_FACE_DETECTED');
  });

  test('9. FaceDetectorEngine detects face and generates landmark coordinates & SVG paths', async () => {
    const { analyzeCanvasFace } = await import('../src/cv/face/FaceDetectorEngine.js');
    
    // Create synthetic face-like cluster in central frame
    const width = 400;
    const height = 500;
    const data = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dx = (x - 200) / 90;
        const dy = (y - 240) / 130;
        if (dx * dx + dy * dy <= 1) {
          // Human skin tone
          data[idx] = 220;
          data[idx + 1] = 168;
          data[idx + 2] = 135;
          data[idx + 3] = 255;
        } else {
          data[idx] = 15;
          data[idx + 1] = 15;
          data[idx + 2] = 20;
          data[idx + 3] = 255;
        }
      }
    }

    const result = analyzeCanvasFace({ data, width, height });
    assert.equal(result.detected, true);
    assert.ok(result.confidence > 0.7);
    
    // Verify all key landmark groups exist
    assert.ok(result.landmarks.leftEyebrow.length >= 3);
    assert.ok(result.landmarks.rightEyebrow.length >= 3);
    assert.ok(result.landmarks.leftEye.length >= 3);
    assert.ok(result.landmarks.rightEye.length >= 3);
    assert.ok(result.landmarks.noseTip);
    assert.ok(result.landmarks.lips.length >= 3);
    assert.ok(result.landmarks.chin.length >= 3);

    // Verify SVG paths are non-empty and start with MoveTo
    assert.ok(result.svgPaths.browsPath.startsWith('M'));
    assert.ok(result.svgPaths.eyesPath.startsWith('M'));
    assert.ok(result.svgPaths.nosePath.startsWith('M'));
    assert.ok(result.svgPaths.lipsPath.startsWith('M'));
    assert.ok(result.svgPaths.chinPath.startsWith('M'));

    // Verify geometric metrics are computed
    assert.ok(typeof result.metrics.eyebrows === 'number');
    assert.ok(typeof result.metrics.eyes === 'number');
    assert.ok(typeof result.metrics.lips === 'number');
    assert.ok(result.metrics.intuition > 0);
  });

});

