/**
 * Palm Reading (Mode 2 — Hasta Samudrika Shastra) Integration Test Suite
 * Tests:
 * 1. Knowledge Base integrity & Sanskrit alignments matching video reference (4:50 - 6:57)
 * 2. PalmArtwork SVG generator for both Left and Right palms
 * 3. Dual hand analysis (Dakshina Kara / Right vs Vama Kara / Left)
 * 4. GuidedReadingScreen UI flow (Intro -> Question Carousel -> Synthesis -> Results)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PALM_READING_QUESTIONS,
  generatePalmReadingDossier
} from '../src/knowledge/hastaSamudrika/palmReadingQuestions.js';
import {
  renderOpenPalmArtwork,
  renderSideHandArtwork
} from '../src/components/PalmArtwork.js';
import { ROUTES } from '../src/navigation/routes.js';
import { router } from '../src/navigation/router.js';

describe('1. Hasta Samudrika Palm Reading Knowledge Base Verification', () => {

  test('All 6 questions exist and align Western concepts with classical Indian tradition', () => {
    assert.equal(PALM_READING_QUESTIONS.length, 6, 'Must contain exactly 6 core questions');
    
    const expectedIds = ['flexibility', 'head_line', 'heart_line', 'marriage_line', 'fate_line', 'life_line'];
    expectedIds.forEach(id => {
      const q = PALM_READING_QUESTIONS.find(item => item.id === id);
      assert.ok(q, `Question ${id} must exist`);
      assert.ok(q.sanskritTitle, `Question ${id} must have authentic Sanskrit title`);
      assert.ok(q.options.length >= 3, `Question ${id} must have at least 3 visual options`);
    });

    // Check specific Indian alignment requested by user
    const headQ = PALM_READING_QUESTIONS.find(q => q.id === 'head_line');
    assert.ok(headQ.sanskritTitle.includes('शिरो रेखा') || headQ.sanskritTitle.includes('Shiro Rekha'));

    const heartQ = PALM_READING_QUESTIONS.find(q => q.id === 'heart_line');
    assert.ok(heartQ.sanskritTitle.includes('हृदय रेखा') || heartQ.sanskritTitle.includes('Hridaya Rekha'));

    const fateQ = PALM_READING_QUESTIONS.find(q => q.id === 'fate_line');
    assert.ok(fateQ.sanskritTitle.includes('भाग्य रेखा') || fateQ.sanskritTitle.includes('Bhagya Rekha'));

    const lifeQ = PALM_READING_QUESTIONS.find(q => q.id === 'life_line');
    assert.ok(lifeQ.sanskritTitle.includes('जीवित रेखा') || lifeQ.sanskritTitle.includes('Jivita Rekha'));

    const marriageQ = PALM_READING_QUESTIONS.find(q => q.id === 'marriage_line');
    assert.ok(marriageQ.sanskritTitle.includes('विवाह रेखा') || marriageQ.sanskritTitle.includes('Vivaha Rekha'));
  });

  test('Every option includes Vedic interpretation, elemental resonance, and active vs passive palm notes', () => {
    PALM_READING_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        assert.ok(opt.id, `Option must have id in ${q.id}`);
        assert.ok(opt.label, `Option must have label in ${q.id}`);
        assert.ok(opt.sanskritLabel, `Option must have Sanskrit label in ${q.id}`);
        assert.ok(opt.interpretation.summary, `Must have summary interpretation in ${opt.id}`);
        assert.ok(opt.interpretation.detail, `Must have detailed treatise reference in ${opt.id}`);
        assert.ok(opt.interpretation.element, `Must have elemental resonance in ${opt.id}`);
        assert.ok(opt.interpretation.activeVsPassive, `Must provide Right vs Left hand distinction in ${opt.id}`);
      });
    });
  });

  test('generatePalmReadingDossier builds complete comparative dossier for both Right and Left hands', () => {
    const rightDossier = generatePalmReadingDossier({}, 'RIGHT');
    assert.equal(rightDossier.hand, 'RIGHT');
    assert.ok(rightDossier.handTitle.includes('Dakshina Kara'));
    assert.equal(rightDossier.results.length, 6);

    const leftDossier = generatePalmReadingDossier({}, 'LEFT');
    assert.equal(leftDossier.hand, 'LEFT');
    assert.ok(leftDossier.handTitle.includes('Vama Kara'));
    assert.equal(leftDossier.results.length, 6);
  });

});

describe('2. PalmArtwork SVG Generation for Both Hands', () => {

  test('Open palm artwork renders correctly for RIGHT hand without mirroring', () => {
    const svg = renderOpenPalmArtwork({ hand: 'RIGHT', highlightLine: 'ALL' });
    assert.ok(svg.includes('<svg'), 'Must produce SVG markup');
    assert.ok(svg.includes('viewBox="0 0 240 300"'), 'Must have correct viewBox');
    assert.ok(!svg.includes('scale(-1, 1)'), 'Right hand should not be mirrored');
    // Check approved line colors
    assert.ok(svg.includes('#A855F7'), 'Life line violet must be present');
    assert.ok(svg.includes('#00D2FF'), 'Head line blue must be present');
    assert.ok(svg.includes('#F43F5E'), 'Heart line rose must be present');
    assert.ok(svg.includes('#FBBF24'), 'Fate line gold must be present');
  });

  test('Open palm artwork for LEFT hand applies accurate anatomical mirroring', () => {
    const svg = renderOpenPalmArtwork({ hand: 'LEFT', highlightLine: 'LIFE' });
    assert.ok(svg.includes('<svg'), 'Must produce SVG markup');
    assert.ok(svg.includes('scale(-1, 1)'), 'Left hand must have mirrored transform');
    assert.ok(svg.includes('translate(240, 0)'), 'Must translate by viewBox width before scaling');
  });

  test('Side hand artwork renders for Flexibility and Marriage lines for both hands', () => {
    const flexRight = renderSideHandArtwork({ hand: 'RIGHT', mode: 'FLEXIBILITY', variant: 'VERY_FLEXIBLE' });
    assert.ok(flexRight.includes('palm-art-side-svg'));
    assert.ok(!flexRight.includes('scale(-1, 1)'));

    const flexLeft = renderSideHandArtwork({ hand: 'LEFT', mode: 'FLEXIBILITY', variant: 'NOT_FLEXIBLE' });
    assert.ok(flexLeft.includes('scale(-1, 1)'));

    const marriageRight = renderSideHandArtwork({ hand: 'RIGHT', mode: 'MARRIAGE', variant: 'TWO_LINES' });
    assert.ok(marriageRight.includes('palm-art-marriage-svg'));
    assert.ok(marriageRight.includes('#F59E0B'), 'Marriage line must be amber');
  });

});

describe('3. GuidedReadingScreen Interactive Flow Verification', () => {

  test('Renders Detailed Palm Reading Intro (6-step vertical indicator, Begin Reading CTA)', async () => {
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

    const { renderGuidedReadingScreen } = await import('../src/screens/GuidedReadingScreen.js');
    renderGuidedReadingScreen(container);

    // 1. Verify Intro Title, Subtitle, & Explanation
    assert.ok(dom.includes('Detailed Palm Reading'), 'Title must match specification');
    assert.ok(dom.includes('Help us understand the unique features of your hand.'), 'Subtitle must match');
    assert.ok(dom.includes('Choose the image that most closely matches your palm.'), 'Explanation must match');

    // 2. Verify 6-Phase Vertical Indicator
    assert.ok(dom.includes('Hand'), 'Phase 1 Hand exists');
    assert.ok(dom.includes('Shape'), 'Phase 2 Shape exists');
    assert.ok(dom.includes('Flexibility'), 'Phase 3 Flexibility exists');
    assert.ok(dom.includes('Major Lines'), 'Phase 4 Major Lines exists');
    assert.ok(dom.includes('Special Lines'), 'Phase 5 Special Lines exists');
    assert.ok(dom.includes('Review'), 'Phase 6 Review exists');

    // 3. Verify Begin Reading CTA
    assert.ok(dom.includes('Begin Reading'), 'Begin Reading button must exist');
    const beginHandler = listeners['#detailed-intro-begin-btn:click'];
    assert.ok(typeof beginHandler === 'function', 'Begin button must have click listener');

    // 4. Click Begin Reading -> Advances to Hand Selection Step
    beginHandler();
    assert.ok(dom.includes('Which hand are you reading?'), 'Advances to Hand Selection step');
    assert.ok(dom.includes('Select the hand shown in your palm.'), 'Hand selection subtitle');
    assert.ok(dom.includes('Left Hand'), 'Left hand option exists');
    assert.ok(dom.includes('Right Hand'), 'Right hand option exists');
    assert.ok(dom.includes('Continue'), 'Continue button exists');
  });

});
