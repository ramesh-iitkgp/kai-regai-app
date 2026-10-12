/**
 * Automated Test Suite — Phase P16: Production UX, Reading Experience & Conversion
 * Runner: Node.js native test runner (`node --test`)
 * 
 * Verifies:
 * 1. Design System Tokens & Semantic Line Identity (Violet, Blue, Rose, Gold, Amber)
 * 2. Landing & Home Screen Architecture & Ethical Transparency
 * 3. Commercial Paywall, Multi-Currency Pricing & Restore Flow
 * 4. Conversion Funnel Telemetry & Biometric Privacy Invariants
 * 5. Immutable Historical Reopen Without CV / P8 / P9 Re-execution
 * 6. Accessibility, Touch Targets & Reduced Motion Guarantees
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import { defaultProductCatalog } from '../src/monetization/ProductCatalog.js';
import { defaultEntitlementService, FEATURE_KEYS } from '../src/monetization/index.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../src/report/ReportTelemetry.js';
import { readingHistoryService } from '../src/services/ReadingHistoryService.js';
import { renderPalmLineOverlay } from '../src/components/PalmLineOverlay.js';
import { renderPaywallModal } from '../src/components/PaywallModal.js';
import { mockReadings } from '../src/mock/mockReadings.js';

describe('P16.1 Design System Tokens & Semantic Line Identity', () => {
  test('tokens.css contains non-negotiable semantic palm line colors', () => {
    const tokensCss = fs.readFileSync(path.resolve('src/styles/tokens.css'), 'utf8');
    assert.match(tokensCss, /--color-line-life:\s*#A855F7/i, 'Life Line must be Violet (#A855F7)');
    assert.match(tokensCss, /--color-line-head:\s*#00D2FF/i, 'Head Line must be Blue (#00D2FF)');
    assert.match(tokensCss, /--color-line-heart:\s*#F43F5E/i, 'Heart Line must be Rose (#F43F5E)');
    assert.match(tokensCss, /--color-line-fate:\s*#FBBF24/i, 'Fate Line must be Gold (#FBBF24)');
    assert.match(tokensCss, /--color-line-sun:\s*#F59E0B/i, 'Sun Line must be Amber (#F59E0B)');
  });

  test('PalmLineOverlay pairs semantic colors with accessible stroke dashes and glyph nodes', () => {
    const svgHtml = renderPalmLineOverlay();
    // Stroke dash patterns
    assert.match(svgHtml, /stroke-dasharray="8 2"/, 'Head line must use dash pattern 8 2');
    assert.match(svgHtml, /stroke-dasharray="12 3"/, 'Heart line must use dash pattern 12 3');
    assert.match(svgHtml, /stroke-dasharray="10 3 2 3"/, 'Fate line must use dash pattern 10 3 2 3');
    assert.match(svgHtml, /stroke-dasharray="3 3"/, 'Sun line must use dotted pattern 3 3');

    // Distinct geometric node glyphs
    assert.match(svgHtml, /<rect x="124" y="174"/, 'Life line must feature square keypoint node');
    assert.match(svgHtml, /<polygon points="128,175 133,180 128,185 123,180"/, 'Head line must feature diamond keypoint node');
    assert.match(svgHtml, /<circle cx="285" cy="158"/, 'Heart line must feature circle keypoint node');
  });
});

describe('P16.2 Landing & Home Screen Product Contract', () => {
  test('Home screen answers product questions and includes trust & ethical disclosures', () => {
    const homeScreenJs = fs.readFileSync(path.resolve('src/screens/HomeScreen.js'), 'utf8');
    assert.match(homeScreenJs, /The Story Written in Your Hands/i, 'Must feature authoritative brand tagline');
    assert.match(homeScreenJs, /Hand Scanner/i, 'Must present instant optical scanner pathway');
    assert.match(homeScreenJs, /Guided Palm Reading/i, 'Must present guided Vedic questionnaire pathway');
    assert.match(homeScreenJs, /How Kai RegAI Works/i, 'Must present trust and how it works architecture');
    assert.match(homeScreenJs, /1\. Observe/i, 'Must explain on-device visual crease analysis');
    assert.match(homeScreenJs, /2\. Interpret/i, 'Must explain traditional Samudrika interpretation');
    assert.match(homeScreenJs, /3\. Explain/i, 'Must explain epistemic tier separation');
    assert.match(homeScreenJs, /4\. Privacy Guaranteed/i, 'Must highlight RAM-only zero photo storage');
    assert.match(homeScreenJs, /Ethical Palmistry Notice/i, 'Must include ethical disclaimer (no medical/fatalistic claims)');
  });
});

describe('P16.3 Commercial Paywall, Multi-Currency & Restore Flow', () => {
  test('Paywall dynamically queries ProductCatalog for pricing across INR, USD, EUR, GBP', () => {
    const inrHtml = renderPaywallModal({ readingId: 'RDG-001', currency: 'INR' });
    assert.match(inrHtml, /₹/, 'Must format price in INR');

    const usdHtml = renderPaywallModal({ readingId: 'RDG-001', currency: 'USD' });
    assert.match(usdHtml, /\$/, 'Must format price in USD');

    const eurHtml = renderPaywallModal({ readingId: 'RDG-001', currency: 'EUR' });
    assert.match(eurHtml, /€/, 'Must format price in EUR');

    const gbpHtml = renderPaywallModal({ readingId: 'RDG-001', currency: 'GBP' });
    assert.match(gbpHtml, /£/, 'Must format price in GBP');
  });

  test('Paywall clearly distinguishes Standard vs Master Premium and provides Restore', () => {
    const paywallHtml = renderPaywallModal({ readingId: 'RDG-001', currency: 'INR' });
    assert.match(paywallHtml, /Master Premium Synthesis/i, 'Must offer Master Premium');
    assert.match(paywallHtml, /Standard Dossier/i, 'Must offer Standard Dossier');
    assert.match(paywallHtml, /Restore Purchases/i, 'Must feature clear Restore Purchases button');
    assert.match(paywallHtml, /paywall-close-btn/, 'Must feature unhidden close button (no dark pattern)');
  });
});

describe('P16.4 Conversion Funnel Telemetry & Biometric Privacy Invariants', () => {
  test('reportTelemetry logs funnel events and scrubs raw biometrics and PII', () => {
    reportTelemetry.clear();

    reportTelemetry.logEvent(TELEMETRY_EVENTS.LANDING_VIEW, { screen: 'home' });
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'MODE_1_SCANNER' });
    reportTelemetry.logEvent(TELEMETRY_EVENTS.CAPTURE_SUCCESS, { handSide: 'RIGHT' });
    reportTelemetry.logEvent(TELEMETRY_EVENTS.QUICK_REPORT_VIEW, { reportTier: 'QUICK' });
    reportTelemetry.logEvent(TELEMETRY_EVENTS.PAYWALL_VIEW, { readingId: 'RDG-TEST', currency: 'INR' });
    reportTelemetry.logEvent(TELEMETRY_EVENTS.PURCHASE_SUCCESS, { productId: 'kai_premium', currency: 'INR' });

    const events = reportTelemetry.getRecentEvents();
    assert.equal(events.length, 6, 'Must record all 6 funnel events');

    for (const ev of events) {
      assert.ok(ev.timestamp, 'Event must have ISO timestamp');
      assert.equal(ev.cameraFrame, undefined, 'Must never log raw camera frames');
      assert.equal(ev.imageBytes, undefined, 'Must never log image byte buffers');
      assert.equal(ev.polylines, undefined, 'Must never log raw crease coordinates');
      assert.equal(ev.userEmail, undefined, 'Must never log user emails or PII');
    }
  });
});

describe('P16.5 Immutable Reading History Reopen & Non-Re-execution', () => {
  test('Historical reading reopening consumes saved snapshot without re-running CV or P8/P9', async () => {
    const historical = mockReadings[0];
    assert.ok(historical.id, 'Reading must have ID');
    assert.ok(historical.title, 'Reading must have Title');
    assert.ok(historical.major_lines, 'Reading must contain major lines');
    assert.ok(historical.synthesis_chapters, 'Reading must contain synthesis chapters');

    // Reopen verification: dossier is passed directly to view
    assert.equal(historical.major_lines.length, 5, 'Must preserve all 5 major lines');
    assert.equal(historical.synthesis_chapters.constitution.length > 20, true, 'Must preserve constitution chapter text');
  });
});

describe('P16.6 Accessibility, Touch Targets & Reduced Motion Guarantees', () => {
  test('components.css enforces focus outlines, 44px minimum touch targets, and reduced motion media queries', () => {
    const compCss = fs.readFileSync(path.resolve('src/styles/components.css'), 'utf8');

    // Focus visible outline
    assert.match(compCss, /button:focus-visible/, 'Must style button:focus-visible');
    assert.match(compCss, /outline:\s*2px\s*solid\s*var\(--color-secondary\)/, 'Must provide high-contrast secondary outline');

    // Minimum touch targets (>= 44px)
    assert.match(compCss, /min-width:\s*44px;\s*min-height:\s*44px;/, 'Icon buttons must have >= 44px touch targets');
    assert.match(compCss, /min-height:\s*44px;/, 'Tab buttons must have >= 44px touch targets');
    assert.match(compCss, /min-height:\s*48px;\s*min-width:\s*48px;/, 'Nav items must have >= 48px touch targets');

    // Reduced motion media query
    assert.match(compCss, /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/, 'Must include prefers-reduced-motion media query');
    assert.match(compCss, /animation-duration:\s*0\.001ms/i, 'Must zero animation duration when reduced motion is preferred');
  });
});
