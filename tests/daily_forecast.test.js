import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyForecastService, VEDIC_RASHIS } from '../src/services/DailyForecastService.js';
import { renderPersonalForecastModal } from '../src/components/PersonalForecastModal.js';
import { i18n } from '../src/services/i18n.js';
import { solarEvents, formatClock, dayParts } from '../src/astronomy/time/SunTimes.js';
import { scoreGauge, SCORE_MODEL, FAVOURABLE_HOUSES_FROM_MOON } from '../src/astrology/gochara/GocharaRules.js';

const CHENNAI = { name: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' };
const minutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Runs `fn` with a fake browser localStorage holding `values`, then removes it. */
function withStorage(values, fn) {
  const store = { ...values };
  globalThis.window = { localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } };
  try {
    return fn();
  } finally {
    delete globalThis.window;
  }
}

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

  test('Gauges are derived from transits: bounded, deterministic and explained by their drivers', () => {
    const fixedDate = new Date('2026-10-12T02:30:00Z');
    VEDIC_RASHIS.forEach(r => {
      const f = dailyForecastService.getForecastForToday(r.key, fixedDate, 'en', { location: CHENNAI });
      assert.equal(f.metricsSource, 'gochara');
      for (const gauge of ['love', 'energy', 'luck', 'mind']) {
        const v = f.metrics[gauge];
        assert.ok(Number.isInteger(v) && v >= SCORE_MODEL.floor && v <= SCORE_MODEL.ceiling, `${gauge}=${v}`);
        // the gauge must equal what its recorded drivers say
        const expected = Math.round(
          SCORE_MODEL.floor + (SCORE_MODEL.ceiling - SCORE_MODEL.floor) *
          f.metricDetails[gauge].drivers.reduce((sum, d) => sum + (d.favourable ? d.weight : 0), 0)
        );
        assert.equal(v, expected);
      }
      // same inputs, same answer
      const again = dailyForecastService.getForecastForToday(r.key, fixedDate, 'en', { location: CHENNAI });
      assert.deepEqual(f.metrics, again.metrics);
    });
  });

  test('Gauges are not flattery: across signs and days they span the full range and include low days', () => {
    const seen = new Set();
    let lowDays = 0;
    VEDIC_RASHIS.forEach(r => {
      for (let d = 0; d < 30; d++) {
        const f = dailyForecastService.getForecastForToday(r.key, new Date(Date.UTC(2026, 9, 1 + d, 2, 30)), 'en', { location: CHENNAI });
        Object.values(f.metrics).forEach(v => { seen.add(v); if (v < 60) lowDays++; });
      }
    });
    assert.ok(Math.min(...seen) <= 45, 'some days should score low');
    assert.ok(Math.max(...seen) >= 90, 'some days should score high');
    assert.ok(lowDays > 0);
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

  test('Forecast exposes real Moon nakshatra, Jupiter transit house and sunrise-based Rahu Kalam', () => {
    // Monday 12 Oct 2026, 08:00 in Chennai
    const f = dailyForecastService.getForecastForToday('Makara', new Date('2026-10-12T02:30:00Z'), 'en', { location: CHENNAI });
    assert.ok(f.nakshatra && f.nakshatra.name, 'nakshatra present');
    assert.ok(f.nakshatra.pada >= 1 && f.nakshatra.pada <= 4);
    assert.ok(f.planetaryTransit, 'Jupiter transit present');
    assert.ok(f.planetaryTransit.house >= 1 && f.planetaryTransit.house <= 12);
    assert.match(f.rahuKalam, /^\d\d:\d\d - \d\d:\d\d$/);
    // Independent reference (astral library): Chennai sunrise 05:59, sunset 17:51 -> Monday Rahu Kalam is the 2nd eighth, 07:28 - 08:57
    assert.ok(minutes(f.rahuKalam.slice(0, 5)) >= minutes('07:27') && minutes(f.rahuKalam.slice(0, 5)) <= minutes('07:29'), f.rahuKalam);
    assert.equal(f.rahuKalamActive, true);
    assert.equal(f.timesLocation.source, 'custom');
  });

  test('Rahu Kalam is only active inside its window, and the window moves with sunrise', () => {
    const [start, end] = dailyForecastService.getRahuKalam(new Date('2026-10-12T02:30:00Z'), CHENNAI).split(' - ');
    const day = '2026-10-12';
    const ist = (hhmm) => new Date(`${day}T${hhmm}:00+05:30`);
    assert.equal(dailyForecastService.isRahuKalamActive(new Date(ist(start).getTime() - 120000), CHENNAI), false);
    assert.equal(dailyForecastService.isRahuKalamActive(new Date(ist(start).getTime() + 60000), CHENNAI), true);
    assert.equal(dailyForecastService.isRahuKalamActive(new Date(ist(end).getTime() + 120000), CHENNAI), false);

    // Delhi in December has a later sunrise than Chennai in October, so the same weekday window starts later
    const delhi = { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' };
    const dec = dailyForecastService.getRahuKalam(new Date('2026-12-14T04:00:00Z'), delhi); // a Monday
    assert.ok(minutes(dec.slice(0, 5)) > minutes('08:00'), dec);
  });

  test('Timings: Abhijit centres on solar noon, Brahma Muhurta ends 48 minutes before sunrise', () => {
    const f = dailyForecastService.getForecastForToday('Makara', new Date('2026-10-12T02:30:00Z'), 'en', { location: CHENNAI });
    const t = f.timings;
    assert.ok(Math.abs(minutes(t.sunrise) - minutes('05:59')) <= 2, t.sunrise);
    assert.ok(Math.abs(minutes(t.sunset) - minutes('17:51')) <= 2, t.sunset);
    const [aStart, aEnd] = t.abhijit.split(' – ').map(minutes);
    const solarNoon = (minutes(t.sunrise) + minutes(t.sunset)) / 2;
    assert.ok(Math.abs((aStart + aEnd) / 2 - solarNoon) <= 2);
    assert.ok(Math.abs(aEnd - aStart - (minutes(t.sunset) - minutes(t.sunrise)) / 15) <= 2);
    const [bStart, bEnd] = t.brahma.split(' – ').map(minutes);
    assert.equal(minutes(t.sunrise) - bEnd, 48);
    assert.equal(bEnd - bStart, 48);
    assert.ok(f.auspiciousMuhurta.includes(t.abhijit));
  });

  test('Sunrise and sunset agree with an independent library (astral) to within 2 minutes', () => {
    const cases = [
      // [place, lat, lon, tz, y, m, d, sunrise, sunset] from astral 3.2
      ['Chennai', 13.0827, 80.2707, 'Asia/Kolkata', 2026, 10, 12, '05:59', '17:51'],
      ['Delhi', 28.6139, 77.209, 'Asia/Kolkata', 2026, 12, 21, '07:09', '17:28'],
      ['Kolkata', 22.5726, 88.3639, 'Asia/Kolkata', 2026, 3, 20, '05:41', '17:47'],
      ['London', 51.5074, -0.1278, 'Europe/London', 2026, 6, 21, '04:43', '21:21'],
      ['Auckland', -36.8485, 174.7633, 'Pacific/Auckland', 2026, 10, 12, '06:41', '19:33']
    ];
    for (const [name, lat, lon, tz, y, m, d, rise, set] of cases) {
      const ev = solarEvents(y, m, d, lat, lon);
      assert.ok(Math.abs(minutes(formatClock(ev.sunrise, tz)) - minutes(rise)) <= 2, `${name} sunrise`);
      assert.ok(Math.abs(minutes(formatClock(ev.sunset, tz)) - minutes(set)) <= 2, `${name} sunset`);
    }
  });

  test('Polar day/night falls back to an approximate 12-hour day instead of failing', () => {
    const parts = dayParts({ year: 2026, month: 6, day: 21, weekday: 0, lat: 78.2, lon: 15.6 }); // Svalbard midsummer
    assert.equal(parts.approximate, true);
    assert.ok(parts.sunset > parts.sunrise);
  });

  test('Auspicious colour follows the weekday, not a random pick', () => {
    const colourOn = (iso) => dailyForecastService.getForecastForToday('Makara', new Date(iso), 'en', { location: CHENNAI }).auspiciousColor;
    assert.equal(colourOn('2026-10-12T04:00:00Z'), 'Pearl White');   // Monday
    assert.equal(colourOn('2026-10-13T04:00:00Z'), 'Coral Red');     // Tuesday
    assert.equal(colourOn('2026-10-14T04:00:00Z'), 'Emerald Green'); // Wednesday
    assert.equal(colourOn('2026-10-15T04:00:00Z'), 'Sacred Gold');   // Thursday
    assert.equal(colourOn('2026-10-17T04:00:00Z'), 'Royal Indigo');  // Saturday
  });

  test('English reflection matches the day: gentle days are not described as exceptional', () => {
    for (let d = 0; d < 40; d++) {
      const f = dailyForecastService.getForecastForToday('Karka', new Date(Date.UTC(2026, 9, 1 + d, 2, 30)), 'en', { location: CHENNAI });
      const avg = Object.values(f.metrics).reduce((a, b) => a + b, 0) / 4;
      if (avg >= 75) assert.ok(f.reflection.includes('broadly supportive'), f.reflection);
      else if (avg >= 55) assert.ok(f.reflection.includes('mixed'), f.reflection);
      else assert.ok(f.reflection.includes('gentler pace'), f.reflection);
      assert.ok(!f.reflection.includes('exceptional'));
    }
  });

  test('Gochara scoring: all-favourable gives the ceiling, none gives the floor', () => {
    assert.equal(scoreGauge({ venus: 1, moon: 1 }, 'love').value, SCORE_MODEL.ceiling);
    assert.equal(scoreGauge({ venus: 6, moon: 2 }, 'love').value, SCORE_MODEL.floor);
    assert.equal(scoreGauge({ venus: 6, moon: 1 }, 'love').band, 'balanced'); // 40 + 55*0.5 = 67.5 -> 68
    assert.deepEqual([...FAVOURABLE_HOUSES_FROM_MOON.jupiter], [2, 5, 7, 9, 11]);
    assert.throws(() => scoreGauge({}, 'wealth'));
  });

  test("Janma Rashi comes from the birth chart (Moon sign), not the calendar-date Sun sign", () => {
    withStorage({ kai_user_dob: '1998-05-15', kai_user_tob: '12:00', kai_user_lat: '13.0827', kai_user_lon: '80.2707', kai_user_tz: 'Asia/Kolkata', kai_user_rashi: 'Vrishabha' }, () => {
      const r = dailyForecastService.resolveUserRashi();
      assert.equal(r.source, 'birth-chart');
      assert.equal(r.key, 'Dhanu'); // Moon in sidereal Sagittarius; 15 May is the Taurus (Vrishabha) Sun-sign date range
      assert.equal(r.birthTimeUnknown, false);
    });
  });

  test('Rashi resolution falls back to the saved selection, then to the default', () => {
    withStorage({ kai_user_rashi: 'Meena' }, () => {
      assert.deepEqual(dailyForecastService.resolveUserRashi(), { key: 'Meena', source: 'saved-selection', birthTimeUnknown: false });
    });
    withStorage({}, () => {
      assert.equal(dailyForecastService.resolveUserRashi().source, 'default');
    });
  });

  test('Saved place is used for timings; a missing or invalid one falls back to the default and says so', () => {
    withStorage({ kai_user_lat: '19.0760', kai_user_lon: '72.8777', kai_user_tz: 'Asia/Kolkata', kai_user_pob: 'Mumbai, India' }, () => {
      const loc = dailyForecastService.getStoredLocation();
      assert.equal(loc.source, 'saved');
      assert.equal(loc.name, 'Mumbai');
      const f = dailyForecastService.getForecastForToday('Makara', new Date('2026-10-12T02:30:00Z'), 'en');
      assert.equal(f.timesLocation.name, 'Mumbai');
    });
    withStorage({ kai_user_lat: '19.0760', kai_user_lon: '72.8777', kai_user_tz: 'Not/AZone' }, () => {
      assert.equal(dailyForecastService.getStoredLocation().source, 'default');
      assert.doesNotThrow(() => dailyForecastService.getForecastForToday('Makara', new Date('2026-10-12T02:30:00Z'), 'en'));
    });
    withStorage({}, () => {
      const loc = dailyForecastService.getStoredLocation();
      assert.equal(loc.source, 'default');
      assert.equal(loc.name, 'Chennai');
    });
  });

  test("Today's Sky card renders localized labels, the place, and is empty without sky data", async () => {
    const { renderTodaySkyCard, renderTodaySkyLine } = await import('../src/components/TodaySky.js');
    const f = dailyForecastService.getForecastForToday('Makara', new Date('2026-10-12T02:30:00Z'), 'en', { location: { ...CHENNAI, source: 'default' } });

    const en = renderTodaySkyCard(f, 'en');
    assert.ok(en.includes("Today's Sky"));
    assert.ok(en.includes('Moon Nakshatra'));
    assert.ok(en.includes('Jupiter Transit'));
    assert.ok(en.includes('Rahu Kalam'));
    assert.ok(en.includes('Active now'));
    assert.ok(en.includes(f.nakshatra.name));
    assert.ok(en.includes('Chennai'));
    assert.ok(!en.includes('≈'), 'times are calculated, not approximate');

    const hi = renderTodaySkyCard(f, 'hi');
    assert.ok(hi.includes('राहु काल'));

    assert.ok(renderTodaySkyLine(f, 'en').includes('Rahu Kalam'));

    // Graceful when the astronomy engine is unavailable
    assert.equal(renderTodaySkyCard({ nakshatra: null, planetaryTransit: null, rahuKalam: null }, 'en'), '');
    assert.equal(renderTodaySkyLine({}, 'en'), '');
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


