/**
 * Automated Verification for DetailedReportScreen & DetailedReportKnowledge
 * Tests all 3 report views matching user reference designs:
 * - View 1: Main Report Overview ("Your Palm Reading Report")
 * - View 2: Detailed Line View ("Heart Line", "Head Line", etc.)
 * - View 3: Life Journey Insights ("Your Life Journey Insights")
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  LINE_CONFIGS, 
  getReportQuickSummary, 
  getDetailedLineData, 
  getLifeJourneyTimeline 
} from '../src/services/DetailedReportKnowledge.js';
import { renderDetailedReportScreen } from '../src/screens/DetailedReportScreen.js';
import { router } from '../src/navigation/router.js';

describe('DetailedReportScreen & Reference Report UI Verification', () => {

  const sampleProfile = {
    hand: 'LEFT',
    shape: 'SQUARE',
    flexibility: 'NATURAL',
    life_line: 'LONG_CLEAR',
    heart_line: 'CURVED',
    head_line: 'SLOPING',
    destiny_line: 'CLEAR',
    sun_line: 'CLEAR',
    marriage_line: 'SINGLE_CLEAR',
    special_markings: 'CROSS'
  };

  test('1. getReportQuickSummary synthesizes 5 core items tailored to user profile', () => {
    const summary = getReportQuickSummary(sampleProfile);
    assert.equal(summary.length, 5);

    const keys = summary.map(s => s.id);
    assert.ok(keys.includes('emotional'));
    assert.ok(keys.includes('mind'));
    assert.ok(keys.includes('vitality'));
    assert.ok(keys.includes('career'));
    assert.ok(keys.includes('inner'));

    assert.ok(summary[0].desc.length > 10);
    assert.ok(summary[1].desc.length > 10);
    assert.ok(summary[2].desc.length > 10);
    assert.ok(summary[3].desc.length > 10);
    assert.ok(summary[4].desc.length > 10);
  });

  test('2. getDetailedLineData returns full data structure for all 6 lines', () => {
    // Heart Line
    const heartData = getDetailedLineData('HEART', sampleProfile);
    assert.equal(heartData.config.name, 'Heart Line');
    assert.equal(heartData.selectedOptionId, 'CURVED');
    assert.equal(heartData.selectedOptionName, 'Curved Upwards');

    // Head Line
    const headData = getDetailedLineData('HEAD', sampleProfile);
    assert.equal(headData.config.name, 'Head Line');
    assert.equal(headData.indications.length, 4);

    // Life Line
    const lifeData = getDetailedLineData('LIFE', sampleProfile);
    assert.equal(lifeData.config.name, 'Life Line');

    // Fate Line
    const fateData = getDetailedLineData('FATE', sampleProfile);
    assert.equal(fateData.config.name, 'Fate Line');

    // Sun Line
    const sunData = getDetailedLineData('SUN', sampleProfile);
    assert.equal(sunData.config.name, 'Sun Line');

    // Other Lines
    const otherData = getDetailedLineData('OTHER', sampleProfile);
    assert.equal(otherData.config.name, 'Other Lines');
  });

  test('3. getLifeJourneyTimeline returns 5 developmental phases and Path Ahead', () => {
    const timeline = getLifeJourneyTimeline(sampleProfile);
    assert.ok(timeline.quote.includes('journey of growth'));
    assert.equal(timeline.phases.length, 5);

    assert.equal(timeline.phases[0].title, 'Early Life');
    assert.equal(timeline.phases[0].years, '0 – 18 years');
    assert.equal(timeline.phases[1].title, 'Growth & Learning');
    assert.equal(timeline.phases[1].years, '19 – 32 years');
    assert.equal(timeline.phases[2].title, 'Career & Progress');
    assert.equal(timeline.phases[2].years, '33 – 45 years');
    assert.equal(timeline.phases[3].title, 'Stability & Relationships');
    assert.equal(timeline.phases[3].years, '46 – 60 years');
    assert.equal(timeline.phases[4].title, 'Wisdom & Legacy');
    assert.equal(timeline.phases[4].years, '60+ years');

    assert.equal(timeline.pathAhead.title, 'Your Path Ahead');
    assert.ok(timeline.pathAhead.text.length > 20);
  });

  test('4. renderDetailedReportScreen renders View 1 Overview matching Reference Image 1', () => {
    let dom = '';
    const listeners = {};
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: (sel) => {
        return {
          addEventListener: (ev, fn) => { listeners[`${sel}:${ev}`] = fn; }
        };
      },
      querySelectorAll: (sel) => {
        return [];
      }
    };

    renderDetailedReportScreen(container, { dossier: { profile: sampleProfile, hand_side: 'Left' } });

    assert.ok(dom.includes('Your Palm Reading Report'), 'Header title');
    assert.ok(dom.includes('A blend of ancient Indian palmistry and modern AI analysis'), 'Header subtitle');
    assert.ok(dom.includes('badge_wisdom_ai.png'), 'Traditional wisdom AI badge');
    assert.ok(dom.includes('palm_overview_lines.jpg'), 'Overview hand with line callouts');
    assert.ok(dom.includes('LEFT PALM • Your Inner Self'), 'Left palm badge');
    assert.ok(dom.includes('Quick Summary'), 'Parchment Quick Summary title');
    assert.ok(dom.includes('Emotional Nature'), 'Summary Item 1');
    assert.ok(dom.includes('Mind & Thinking'), 'Summary Item 2');
    assert.ok(dom.includes('Vitality & Life Path'), 'Summary Item 3');
    assert.ok(dom.includes('Career & Success'), 'Summary Item 4');
    assert.ok(dom.includes('Inner Strength'), 'Summary Item 5');
    assert.ok(dom.includes('Explore Your Detailed Reading'), 'Flourish divider');
    assert.ok(dom.includes('Heart Line'), 'Line Card 1');
    assert.ok(dom.includes('Head Line'), 'Line Card 2');
    assert.ok(dom.includes('Life Line'), 'Line Card 3');
    assert.ok(dom.includes('Fate Line'), 'Line Card 4');
    assert.ok(dom.includes('Sun Line'), 'Line Card 5');
    assert.ok(dom.includes('Other Lines'), 'Line Card 6');
    assert.ok(dom.includes('Your Life Journey Insights'), 'Bottom banner title');
    assert.ok(dom.includes('View Predictions ›'), 'Bottom CTA button');
    assert.ok(!dom.includes('report-brand-title'), 'Duplicate Kai RegAI brand header must be removed');
  });

  test('5. renderDetailedReportScreen renders View 2 with user selected input artwork and without variation carousel', () => {
    let dom = '';
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: () => ({ addEventListener: () => {} }),
      querySelectorAll: () => []
    };

    // Set router preserved state to LINES view
    router.preservedState.detailedReportView = 'LINES';
    router.preservedState.detailedReportLine = 'HEAD';

    const customProfile = {
      ...sampleProfile,
      head_line: 'STRAIGHT'
    };

    renderDetailedReportScreen(container, { dossier: { profile: customProfile, hand_side: 'Left' } });

    // Header duplicate removed
    assert.ok(!dom.includes('report-brand-title'), 'No duplicate Kai RegAI brand title in header');
    assert.ok(dom.includes('report-badge-tradition-wrap'), 'Wisdom AI badge preserved');

    // User's exact chosen input artwork rendered via DetailedPalmArtwork
    assert.ok(dom.includes('detailed-palm-svg'), 'Detailed palm SVG artwork rendered');
    assert.ok(dom.includes('Straight'), 'User selected option name rendered in hand box');
    assert.ok(dom.includes('report-line-callout-pin'), 'Line callout pin rendered');

    // Bottom variation selector section removed
    assert.ok(!dom.includes('report-variations-section'), 'Variation selection section must be removed');
    assert.ok(!dom.includes('data-select-var'), 'No variation selector buttons');

    // Clean up preservedState
    router.preservedState.detailedReportView = 'OVERVIEW';
  });

});
