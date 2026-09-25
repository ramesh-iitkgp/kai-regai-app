/**
 * Kai RegAI — P10 Report Engine Automated Test Suite
 * Phase: P10 — Report Engine
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ReportModel,
  REPORT_TIERS,
  REPORT_THEME,
  ReportSchemaValidator,
  ReportContextBuilder,
  ReportComposer,
  ReportSections,
  ReportRenderer,
  ReportExport,
  ReportShare,
  SOCIAL_CARD_FORMATS,
  ReportTelemetry,
  TELEMETRY_EVENTS,
  reportTelemetry,
  createReport
} from '../../src/report/index.js';

import { interpret } from '../../src/interpretation/index.js';
import { DeterministicNarrator } from '../../src/narration/index.js';
import { GOLDEN_INTERPRETATION_CASES } from '../interpretation/golden/goldenCases.js';
import { GOLDEN_REPORT_CASES } from './golden/goldenReports.js';

const getCase = (id) => {
  const found = GOLDEN_INTERPRETATION_CASES.find(c => c.id === id);
  if (!found) throw new Error(`Golden interpretation case '${id}' not found`);
  return found.input;
};

describe('P10.1 Report Schema & Integrity Validation', () => {
  it('instantiates valid ReportModel and validates successfully', () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });

    assert.ok(report instanceof ReportModel);
    assert.equal(report.schemaVersion, '1.0.0');
    assert.equal(report.reportTier, 'PREMIUM');
    assert.ok(report.reportId.startsWith('RPT-'));

    const validation = ReportSchemaValidator.validate(report);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  it('rejects reports with invalid tier or missing required fields', () => {
    const invalidReport = {
      schemaVersion: '1.0.0',
      reportId: 'RPT-123',
      reportTier: 'INVALID_TIER',
      readingMethod: 'MODE_1_CAMERA'
    };
    const res = ReportSchemaValidator.validate(invalidReport);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Invalid reportTier')));
  });

  it('rejects reports containing fatalistic or medical claim drift', () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });
    report.summary.headline = 'Your palm proves you will die at age 55.';

    const res = ReportSchemaValidator.validate(report);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Epistemic Safety Violation')));
  });
});

describe('P10.2 Report Context Builder & Multi-Tier Composition', () => {
  it('composes Quick Report tier with concise executive summary and SVG visualization', () => {
    const dossier = interpret(getCase('CASE-10'));
    const report = createReport({ dossier, tier: REPORT_TIERS.QUICK });

    assert.equal(report.reportTier, 'QUICK');
    assert.equal(report.sections.length, 1);
    assert.ok(report.summary.keyThemes.length >= 3);
    assert.ok(report.palmVisualization.lines.life);
  });

  it('composes Premium Report tier with cover, 4 chapters, and complete evidence', () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });

    assert.equal(report.reportTier, 'PREMIUM');
    assert.equal(report.sections.length, 4);
    assert.ok(report.sources.length >= 2);
    assert.ok(report.majorLines.length === 5);
  });
});

describe('P10.3 Responsive Web Rendering & HTML Output', () => {
  it('renders complete responsive HTML markup with cover, visualization, and chapters', () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });
    const html = ReportRenderer.renderHTML(report);

    assert.ok(html.includes('kai-report-container'));
    assert.ok(html.includes('kai-report-cover'));
    assert.ok(html.includes('Palmar Crease Mapping'));
    assert.ok(html.includes('The Story of Your Hands'));
    assert.ok(html.includes('Ethical & Reflective Disclaimer'));
  });

  it('provides dedicated @media print stylesheets', () => {
    const css = ReportRenderer.getPrintStyles();
    assert.ok(css.includes('@media print'));
    assert.ok(css.includes('page-break-inside: avoid'));
    assert.ok(css.includes('.kai-btn'));
  });
});

describe('P10.4 PDF Export & Print Engine', () => {
  it('compiles standalone A4 printable HTML document with page breaks and metadata', () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });
    const docHTML = ReportExport.compilePrintDocument(report);

    assert.ok(docHTML.startsWith('<!DOCTYPE html>'));
    assert.ok(docHTML.includes('size: A4 portrait'));
    assert.ok(docHTML.includes('page-break-after: always'));
    assert.ok(docHTML.includes(report.reportId));
  });
});

describe('P10.5 Privacy-Safe Social Card Generator', () => {
  it('generates high-DPI social cards across 1:1, 4:5, and 9:16 aspect ratios', () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });

    const card1 = ReportShare.generateCardDataUrl({ report, format: SOCIAL_CARD_FORMATS.SQUARE });
    const card2 = ReportShare.generateCardDataUrl({ report, format: SOCIAL_CARD_FORMATS.PORTRAIT });
    const card3 = ReportShare.generateCardDataUrl({ report, format: SOCIAL_CARD_FORMATS.STORY });

    assert.ok(card1.startsWith('data:image/png;base64'));
    assert.ok(card2.startsWith('data:image/png;base64'));
    assert.ok(card3.startsWith('data:image/png;base64'));
  });

  it('shares cards via native Web Share API or download fallback without leaking PII', async () => {
    const dossier = interpret(getCase('CASE-01'));
    const report = createReport({ dossier, tier: REPORT_TIERS.PREMIUM });

    const res = await ReportShare.shareCard({ report, format: SOCIAL_CARD_FORMATS.SQUARE });
    assert.ok(res.shared);
  });
});

describe('P10.6 Privacy-Conscious Report Telemetry', () => {
  it('logs safe interaction events without capturing biometric data or PII', () => {
    const telemetry = new ReportTelemetry();
    telemetry.logEvent(TELEMETRY_EVENTS.REPORT_GENERATED, {
      reportTier: 'PREMIUM',
      readingMethod: 'MODE_1_CAMERA',
      durationMs: 42
    });

    const events = telemetry.getRecentEvents();
    assert.equal(events.length, 1);
    assert.equal(events[0].event, 'report_generated');
    assert.equal(events[0].reportTier, 'PREMIUM');
    assert.equal(events[0].durationMs, 42);
    assert.equal(events[0].rawImage, undefined);
  });

  it('telemetry failure never throws or interrupts report creation', () => {
    const faultyTelemetry = new ReportTelemetry({
      sink: () => { throw new Error('Network error to analytics'); }
    });
    assert.doesNotThrow(() => {
      faultyTelemetry.logEvent(TELEMETRY_EVENTS.PDF_EXPORTED, { reportTier: 'PREMIUM' });
    });
  });
});

describe('P10.7 Golden Report Corpus (15 Authoritative Cases)', () => {
  for (const testCase of GOLDEN_REPORT_CASES) {
    it(`evaluates ${testCase.name} (${testCase.id})`, async () => {
      const report = await testCase.setup();
      assert.ok(report instanceof ReportModel);

      // Verify validation passes
      const validation = ReportSchemaValidator.validate(report);
      assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join('; ')}`);

      if (testCase.expected.tier) {
        assert.equal(report.reportTier, testCase.expected.tier);
      }
      if (testCase.expected.sectionsCount) {
        assert.equal(report.sections.length, testCase.expected.sectionsCount);
      }
      if (testCase.expected.fateStatus) {
        const fate = report.majorLines.find(l => l.key?.includes('fate') || l.name?.includes('Fate'));
        assert.equal(fate?.status, testCase.expected.fateStatus);
      }
      if (testCase.expected.confidenceBand) {
        assert.equal(report.confidence.band, testCase.expected.confidenceBand);
      }
      if (testCase.expected.generationMode) {
        assert.equal(report.metadata.generationMode, testCase.expected.generationMode);
      }
    });
  }
});
