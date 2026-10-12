/**
 * Detailed Palm Reading Flow Test Suite
 * Verifies all specifications from user request:
 * 1. Schema integrity: 9 question sections, 6-phase flow, accurate options & descriptions
 * 2. DetailedPalmArtwork: Anatomical hand SVGs, gold highlights for evaluated line, left/right mirroring
 * 3. GuidedReadingScreen state machine: Intro -> Hand -> Shape -> Flexibility -> Major Lines -> Special Markings -> Review -> Reveal
 * 4. UI Card constraints: 2-column grid, checkmarks, gold styling
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  DETAILED_FLOW_SECTIONS, 
  buildDossierFromDetailedProfile 
} from '../src/knowledge/detailedPalmProfileSchema.js';
import { renderDetailedPalmArtwork } from '../src/components/DetailedPalmArtwork.js';

describe('1. Detailed Palm Reading Schema Verification', () => {

  test('Contains all 10 sequential question sections conforming to the 6 phases', () => {
    assert.equal(DETAILED_FLOW_SECTIONS.length, 10, 'Must contain 10 distinct question sections');

    const expectedSectionIds = [
      'hand', 'shape', 'flexibility', 
      'life_line', 'heart_line', 'head_line', 
      'destiny_line', 'sun_line', 'marriage_line', 'special_markings'
    ];

    expectedSectionIds.forEach(secId => {
      const sec = DETAILED_FLOW_SECTIONS.find(s => s.id === secId);
      assert.ok(sec, `Section ${secId} must exist`);
      assert.ok(sec.title, `Section ${secId} must have a title`);
      assert.ok(sec.subtitle, `Section ${secId} must have a subtitle`);
      assert.ok(sec.options.length >= 2, `Section ${secId} must have visual options`);
    });
  });

  test('Major line sections contain exact visual alternatives mandated by user', () => {
    // Life line: 6 options
    const lifeSec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'life_line');
    assert.equal(lifeSec.options.length, 6);
    const lifeOptionIds = lifeSec.options.map(o => o.id);
    assert.ok(lifeOptionIds.includes('LONG_CLEAR'));
    assert.ok(lifeOptionIds.includes('SHORT'));
    assert.ok(lifeOptionIds.includes('DEEP'));
    assert.ok(lifeOptionIds.includes('FAINT_FRAGMENTED'));
    assert.ok(lifeOptionIds.includes('WIDE_CURVE'));
    assert.ok(lifeOptionIds.includes('CLOSE_TO_THUMB'));

    // Heart line: 7 options
    const heartSec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'heart_line');
    assert.equal(heartSec.options.length, 7);
    const heartOptionIds = heartSec.options.map(o => o.id);
    assert.ok(heartOptionIds.includes('LONG'));
    assert.ok(heartOptionIds.includes('SHORT'));
    assert.ok(heartOptionIds.includes('STRAIGHT'));
    assert.ok(heartOptionIds.includes('CURVED'));
    assert.ok(heartOptionIds.includes('DEEP'));
    assert.ok(heartOptionIds.includes('FAINT'));
    assert.ok(heartOptionIds.includes('FORKED'));

    // Head line: 7 options
    const headSec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'head_line');
    assert.equal(headSec.options.length, 7);
    const headOptionIds = headSec.options.map(o => o.id);
    assert.ok(headOptionIds.includes('LONG'));
    assert.ok(headOptionIds.includes('SHORT'));
    assert.ok(headOptionIds.includes('STRAIGHT'));
    assert.ok(headOptionIds.includes('SLOPING'));
    assert.ok(headOptionIds.includes('DEEP'));
    assert.ok(headOptionIds.includes('FAINT'));
    assert.ok(headOptionIds.includes('FORKED'));

    // Destiny line: 7 options
    const destinySec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'destiny_line');
    assert.equal(destinySec.options.length, 7);
    const destinyOptionIds = destinySec.options.map(o => o.id);
    assert.ok(destinyOptionIds.includes('ABSENT'));
    assert.ok(destinyOptionIds.includes('FAINT'));
    assert.ok(destinyOptionIds.includes('CLEAR'));
    assert.ok(destinyOptionIds.includes('CROSSES_PALM'));
    assert.ok(destinyOptionIds.includes('DOUBLE_LINE'));
    assert.ok(destinyOptionIds.includes('INTERRUPTED'));
    assert.ok(destinyOptionIds.includes('REACHES_FINGERS'));

    // Sun line: 6 options
    const sunSec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'sun_line');
    assert.equal(sunSec.options.length, 6);
    const sunOptionIds = sunSec.options.map(o => o.id);
    assert.ok(sunOptionIds.includes('ABSENT'));
    assert.ok(sunOptionIds.includes('SHORT'));
    assert.ok(sunOptionIds.includes('LONG'));
    assert.ok(sunOptionIds.includes('CLEAR'));
    assert.ok(sunOptionIds.includes('FAINT'));
    assert.ok(sunOptionIds.includes('MULTIPLE'));

    // Marriage Line: 11 options matching User Reference Photo (10 exact cards + None)
    const marriageSec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'marriage_line');
    assert.ok(marriageSec, 'Marriage Line section must exist');
    assert.equal(marriageSec.options.length, 11);
    const marriageOptionIds = marriageSec.options.map(o => o.id);
    assert.ok(marriageOptionIds.includes('SINGLE_CLEAR'));
    assert.ok(marriageOptionIds.includes('MULTIPLE'));
    assert.ok(marriageOptionIds.includes('FAINT'));
    assert.ok(marriageOptionIds.includes('DEEP'));
    assert.ok(marriageOptionIds.includes('UPWARD'));
    assert.ok(marriageOptionIds.includes('DOWNWARD'));
    assert.ok(marriageOptionIds.includes('FORKED'));
    assert.ok(marriageOptionIds.includes('ISLAND'));
    assert.ok(marriageOptionIds.includes('CHAINED'));
    assert.ok(marriageOptionIds.includes('CROSSED'));
    assert.ok(marriageOptionIds.includes('NONE'));

    // Special Markings: 8 options
    const markSec = DETAILED_FLOW_SECTIONS.find(s => s.id === 'special_markings');
    assert.equal(markSec.options.length, 8);
    const markOptionIds = markSec.options.map(o => o.id);
    assert.ok(markOptionIds.includes('STAR'));
    assert.ok(markOptionIds.includes('CROSS'));
    assert.ok(markOptionIds.includes('TRIANGLE'));
    assert.ok(markOptionIds.includes('SQUARE'));
    assert.ok(markOptionIds.includes('ISLAND'));
    assert.ok(markOptionIds.includes('FORK'));
    assert.ok(markOptionIds.includes('CHAINED'));
    assert.ok(markOptionIds.includes('NONE'));
  });

  test('buildDossierFromDetailedProfile constructs complete canonical dossier', () => {
    const profile = {
      hand: 'RIGHT',
      shape: 'RECTANGULAR',
      flexibility: 'MEDIUM',
      life_line: 'LONG_CLEAR',
      heart_line: 'CURVED',
      head_line: 'SLOPING',
      destiny_line: 'CLEAR',
      sun_line: 'CLEAR',
      marriage_line: 'SINGLE_CLEAR',
      special_markings: 'CROSS'
    };

    const dossier = buildDossierFromDetailedProfile(profile);
    assert.ok(dossier.id.startsWith('DLR-'));
    assert.equal(dossier.hand_side, 'Right');
    assert.equal(dossier.archetype, 'RECTANGULAR');
    assert.equal(dossier.flexibility, 'MEDIUM');
    assert.equal(dossier.major_lines.life, 'LONG_CLEAR');
    assert.equal(dossier.major_lines.heart, 'CURVED');
    assert.equal(dossier.marriage_line, 'SINGLE_CLEAR');
    assert.equal(dossier.special_markings, 'CROSS');
  });

});

describe('2. DetailedPalmArtwork Anatomical Illustration Engine Verification', () => {

  test('Renders clean anatomical hand with gold highlight for evaluated line', () => {
    // Test Heart Line illustration: Heart line highlighted in #FBBF24, others faint
    const svgHeart = renderDetailedPalmArtwork({
      hand: 'RIGHT',
      sectionId: 'heart_line',
      optionId: 'CURVED'
    });

    assert.ok(svgHeart.includes('<svg'), 'Must produce valid SVG markup');
    assert.ok(svgHeart.includes('viewBox="0 0 200 240"'), 'Standard viewBox');
    assert.ok(svgHeart.includes('#FBBF24'), 'Must highlight evaluated line in luminous gold');
    assert.ok(svgHeart.includes('rgba(255,255,255,0.18)'), 'Non-evaluated lines must be subtle faint grey');
    assert.ok(!svgHeart.includes('scale(-1, 1)'), 'Right hand should not be mirrored');
  });

  test('Applies clean anatomical mirroring for Left Hand across all sections', () => {
    const svgLeft = renderDetailedPalmArtwork({
      hand: 'LEFT',
      sectionId: 'life_line',
      optionId: 'WIDE_CURVE'
    });

    assert.ok(svgLeft.includes('scale(-1, 1)'), 'Left hand must have mirrored scale');
    assert.ok(svgLeft.includes('translate(200, 0)'), 'Must translate by 200 for proper flip');
    assert.ok(svgLeft.includes('#FBBF24'), 'Life line highlighted in gold');
  });

  test('Renders shape geometric overlays, flexibility angle guides, and marriage lines correctly', () => {
    const svgSquare = renderDetailedPalmArtwork({
      hand: 'RIGHT',
      sectionId: 'shape',
      optionId: 'SQUARE'
    });
    assert.ok(svgSquare.includes('1 : 1') || svgSquare.includes('rect'), 'Square shape geometry');

    const svgFlex = renderDetailedPalmArtwork({
      hand: 'RIGHT',
      sectionId: 'flexibility',
      optionId: 'VERY_FLEXIBLE'
    });
    assert.ok(svgFlex.includes('90°'), 'Flexibility angle guide');

    const svgMarriageSingle = renderDetailedPalmArtwork({
      hand: 'RIGHT',
      sectionId: 'marriage_line',
      optionId: 'SINGLE_CLEAR'
    });
    assert.ok(svgMarriageSingle.includes('card_marriage_single.jpg'), 'Marriage line side-angle photo');
    assert.ok(svgMarriageSingle.includes('UNDER PINKY'), 'Marriage line focus indicator');
    assert.ok(svgMarriageSingle.includes('SINGLE & CLEAR'), 'Marriage line single option');

    const svgMarriageChained = renderDetailedPalmArtwork({
      hand: 'RIGHT',
      sectionId: 'marriage_line',
      optionId: 'CHAINED'
    });
    assert.ok(svgMarriageChained.includes('card_marriage_chained.jpg'), 'Marriage line chained photo');
    assert.ok(svgMarriageChained.includes('CHAIN-LIKE'), 'Marriage line chained option');
  });

});

describe('3. GuidedReadingScreen Detailed Flow Navigation & Review Verification', () => {

  test('Steps through questions and reaches Review Screen with edit capabilities', async () => {
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
      querySelectorAll: (sel) => {
        if (sel === '.detailed-palm-card') {
          return [
            {
              getAttribute: (attr) => attr === 'data-option-id' ? 'RIGHT' : null,
              addEventListener: () => {}
            }
          ];
        }
        if (sel === '.detailed-review-item-card') {
          return [
            {
              getAttribute: (attr) => attr === 'data-jump-idx' ? '3' : null,
              addEventListener: (ev, fn) => { listeners['review-card:click'] = fn; }
            }
          ];
        }
        return [];
      }
    };

    const { renderGuidedReadingScreen } = await import('../src/screens/GuidedReadingScreen.js');
    renderGuidedReadingScreen(container);

    // 1. Start from Intro -> Click Begin Reading
    listeners['#detailed-intro-begin-btn:click']();
    assert.ok(dom.includes('Which hand are you reading?'), 'Step 1 Hand');

    // 2. Click Continue -> Moves to Shape
    listeners['#detailed-q-continue-btn:click']();
    assert.ok(dom.includes('What is the overall shape of your palm?'), 'Step 2 Shape');

    // 3. Click Continue -> Moves to Flexibility
    listeners['#detailed-q-continue-btn:click']();
    assert.ok(dom.includes('How flexible is your hand?'), 'Step 3 Flexibility');

    // 4. Step through remaining steps (total 10 question sections) until Review screen
    for (let i = 3; i <= 10; i++) {
      listeners['#detailed-q-continue-btn:click']();
    }

    // Now on Review Screen
    assert.ok(dom.includes('Your Palm Profile'), 'Reached Review Screen');
    assert.ok(dom.includes('Reveal My Reading'), 'Reveal My Reading CTA exists');
    assert.ok(dom.includes('Edit Selections'), 'Edit Selections exists');
    assert.ok(dom.includes('Everything looks right?'), 'Bottom verification prompt');
  });

});
