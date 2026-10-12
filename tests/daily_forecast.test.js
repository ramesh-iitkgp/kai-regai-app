import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyForecastService, VEDIC_RASHIS } from '../src/services/DailyForecastService.js';
import { renderPersonalForecastModal } from '../src/components/PersonalForecastModal.js';
import { i18n } from '../src/services/i18n.js';

describe('Daily Cosmic Forecast & Palm Mount Alignment Service', () => {
  test('Contains all 12 Vedic Rashis with astrological and palm mount attributes', () => {
    assert.equal(VEDIC_RASHIS.length, 12);
    const keys = VEDIC_RASHIS.map(r => r.key);
    assert.deepEqual(keys, [
      'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
      'Simha', 'Kanya', 'Tula', 'Vrishchika',
      'Dhanu', 'Makara', 'Kumbha', 'Meena'
    ]);
  });

  test('Computes deterministic metrics bounded between 70% and 99%', () => {
    const fixedDate = new Date('2026-10-01T12:00:00Z');
    VEDIC_RASHIS.forEach(r => {
      const forecast = dailyForecastService.getForecastForToday(r.key, fixedDate, 'en');
      assert.ok(forecast.metrics.love >= 70 && forecast.metrics.love <= 99);
      assert.ok(forecast.metrics.energy >= 70 && forecast.metrics.energy <= 99);
      assert.ok(forecast.metrics.luck >= 70 && forecast.metrics.luck <= 99);
      assert.ok(forecast.metrics.mind >= 70 && forecast.metrics.mind <= 99);

      // Verify deterministic stability for the same date
      const forecastAgain = dailyForecastService.getForecastForToday(r.key, fixedDate, 'en');
      assert.deepEqual(forecast.metrics, forecastAgain.metrics);
    });
  });

  test('Correlates daily astrological transit with specific palm mount and crease line', () => {
    const makara = dailyForecastService.getForecastForToday('Makara', new Date(), 'en');
    assert.equal(makara.palmMount, 'Mount of Saturn');
    assert.ok(makara.palmLineFocus.includes('Fate Line'));
    assert.ok(makara.palmCorrelate.includes('Mount of Saturn'));

    const dhanu = dailyForecastService.getForecastForToday('Dhanu', new Date(), 'en');
    assert.equal(dhanu.palmMount, 'Mount of Jupiter');
    assert.ok(dhanu.palmCorrelate.includes('Mount of Jupiter'));
  });

  test('Produces localized reflections for regional languages', () => {
    const tamilForecast = dailyForecastService.getForecastForToday('Mesha', new Date(), 'ta');
    assert.equal(tamilForecast.localizedName, 'மேஷம்');
    assert.equal(tamilForecast.graha, 'செவ்வாய் பகவான்');
    assert.equal(tamilForecast.palmMount, 'கீழ் செவ்வாய் மேடு');
    assert.ok(tamilForecast.reflection.length > 10);
    assert.ok(tamilForecast.palmCorrelate.includes('மேடு'));

    const hindiForecast = dailyForecastService.getForecastForToday('Simha', new Date(), 'hi');
    assert.equal(hindiForecast.localizedName, 'सिंह');
    assert.equal(hindiForecast.graha, 'सूर्य देव');
    assert.equal(hindiForecast.palmMount, 'सूर्य पर्वत');
  });

  test('PersonalForecastModal renders complete HTML structure with metrics, alignment and CTA', () => {
    i18n.setLanguage('en');
    const html = renderPersonalForecastModal({ rashi: 'Makara' });
    assert.ok(html.includes('Daily Cosmic Forecast'));
    assert.ok(html.includes('Makara (Capricorn)'));
    assert.ok(html.includes('Mount of Saturn'));
    assert.ok(html.includes('Celestial Transit Reflection'));
    assert.ok(html.includes('forecast-scan-correlate-btn'));
    assert.ok(html.includes('rashi-switch-pill'));
  });

  test('PersonalForecastScreen renders transformation phase, 2x2 domains, timeline, and ₹99 CTA', async () => {
    const { renderPersonalForecastScreen } = await import('../src/screens/PersonalForecastScreen.js');
    let dom = '';
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: () => null,
      querySelectorAll: () => []
    };
    renderPersonalForecastScreen(container);
    assert.ok(dom.includes('TRANSFORMATION'));
    assert.ok(dom.includes('CAREER'));
    assert.ok(dom.includes('EXPANSION'));
    assert.ok(dom.includes('FINANCE'));
    assert.ok(dom.includes('BUILDING'));
    assert.ok(dom.includes('LOVE'));
    assert.ok(dom.includes('DEVELOPING'));
    assert.ok(dom.includes('TRAVEL'));
    assert.ok(dom.includes('ACTIVE'));
    assert.ok(dom.includes('YOUR NEXT 12 MONTHS'));
    assert.ok(dom.includes('COMPLETE YOUR STORY'));
    assert.ok(dom.includes('₹99'));
    assert.ok(dom.includes('CONNECT MY PALM'));
  });

  test('Connect My Palm launches dedicated ₹99 payment page instead of multi-tier programs', async () => {
    const { renderPaywallModal } = await import('../src/components/PaywallModal.js');
    
    // INR Test
    const inrModal = renderPaywallModal({
      productId: 'kai_daily_correlate',
      featureKey: 'kai_daily_correlate',
      currency: 'INR'
    });

    assert.ok(inrModal.includes('Connect Your Palm'), 'Must state Connect Your Palm');
    assert.ok(inrModal.includes('Personal Palm Correlation'), 'Must state Personal Palm Correlation');
    assert.ok(inrModal.includes('₹99'), 'Must clearly show ₹99 price');
    assert.ok(inrModal.includes('PAY ₹99 & CONNECT PALM'), 'CTA button must show PAY ₹99 & CONNECT PALM');
    assert.ok(inrModal.includes('paywall-close-btn'), 'Must have accessible close button');
    assert.ok(inrModal.includes('paywall-restore-btn'), 'Must have restore purchase option');
    
    // Invariant: Must NOT show the generic multi-tier purchase program options
    assert.ok(!inrModal.includes('Master Premium Synthesis'), 'Must not display Master Premium program');
    assert.ok(!inrModal.includes('Standard Dossier'), 'Must not display Standard Dossier program');

    // Multi-currency test (USD)
    const usdModal = renderPaywallModal({
      productId: 'kai_daily_correlate',
      currency: 'USD'
    });
    assert.ok(usdModal.includes('$0.99'), 'Must format USD price properly');
    assert.ok(usdModal.includes('PAY $0.99 & CONNECT PALM'), 'CTA button must show USD formatted price');
  });
});


