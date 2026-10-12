/**
 * Automated Test Suite — Vedic & Western Astrology Engines & Chart Builder
 * 
 * Verifies:
 * - Ayanamsa algorithms (Lahiri, Raman, KP)
 * - 27 Nakshatras and 108 Padas with boundary conditions
 * - Vimshottari Mahadasha 120-year cycle and balance at birth
 * - Vedic chart generation & whole sign placements
 * - Western chart generation & tropical placements
 * - Major Ptolemaic aspects & applying/separating dynamics
 * - Common BirthChart contract & input hashing
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateAyanamsa, tropicalToSidereal } from '../../src/astrology/vedic/Ayanamsa.js';
import { calculateNakshatra } from '../../src/astrology/nakshatra/NakshatraCalculator.js';
import { NAKSHATRAS } from '../../src/astrology/nakshatra/NakshatraData.js';
import { calculateVimshottariDasha } from '../../src/astrology/vedic/VimshottariDasha.js';
import { calculateVedicChart } from '../../src/astrology/vedic/VedicChartEngine.js';
import { calculateWesternChart } from '../../src/astrology/western/WesternChartEngine.js';
import { getSignPlacement, ZODIAC_SIGNS } from '../../src/astrology/common/ZodiacSigns.js';
import { getPlanetaryDignity } from '../../src/astrology/common/Dignities.js';
import { calculateAspects, getAngularSeparation, determineAspectDirection } from '../../src/astrology/aspects/AspectCalculator.js';
import { buildBirthChart, generateInputHash } from '../../src/astrology/chartBuilder/BirthChartBuilder.js';

test('Astrology Engine — Ayanamsa Calculations', () => {
  // Epoch J2000.0 (JD 2451545.0): Lahiri Ayanamsa is approximately 23.85° (23° 51')
  const lahiriJ2000 = calculateAyanamsa(2451545.0, 'LAHIRI');
  assert.ok(lahiriJ2000 >= 23.8 && lahiriJ2000 <= 23.9, `Lahiri J2000 was ${lahiriJ2000}°`);

  // Raman ayanamsa
  const ramanJ2000 = calculateAyanamsa(2451545.0, 'RAMAN');
  assert.ok(ramanJ2000 >= 22.0 && ramanJ2000 <= 23.0);

  // Tropical (ayanamsa = 0)
  assert.equal(calculateAyanamsa(2451545.0, 'TROPICAL'), 0.0);

  // Sidereal conversion
  const trop = 100.0;
  const sid = tropicalToSidereal(trop, 23.85);
  assert.ok(Math.abs(sid - 76.15) < 0.001);
});

test('Astrology Engine — 27 Nakshatras & 108 Padas with Boundary Tests', () => {
  assert.equal(NAKSHATRAS.length, 27);

  // First degree of Ashwini: 0.0°
  const ashwiniStart = calculateNakshatra(0.0);
  assert.equal(ashwiniStart.nakshatraIndex, 0);
  assert.equal(ashwiniStart.nakshatraName, 'Ashwini');
  assert.equal(ashwiniStart.pada, 1);
  assert.equal(ashwiniStart.ruler, 'ketu');

  // Exact boundary between Pada 1 and Pada 2: 3° 20' = 3.333333°
  const ashwiniPada2 = calculateNakshatra(3.34);
  assert.equal(ashwiniPada2.pada, 2);

  // Exact boundary between Ashwini and Bharani: 13° 20' = 13.333333°
  const bharaniStart = calculateNakshatra(13.34);
  assert.equal(bharaniStart.nakshatraIndex, 1);
  assert.equal(bharaniStart.nakshatraName, 'Bharani');
  assert.equal(bharaniStart.pada, 1);
  assert.equal(bharaniStart.ruler, 'venus');

  // Last nakshatra Revati: 346° 40' to 360° (Pada 4 at 359.9°)
  const revatiEnd = calculateNakshatra(359.9);
  assert.equal(revatiEnd.nakshatraIndex, 26);
  assert.equal(revatiEnd.nakshatraName, 'Revati');
  assert.equal(revatiEnd.pada, 4);
  assert.equal(revatiEnd.ruler, 'mercury');
});

test('Astrology Engine — Vimshottari Mahadasha Cycles', () => {
  // Moon in Ashwini (Ketu ruler, 7 year duration) at middle of nakshatra (50% elapsed)
  const dasha = calculateVimshottariDasha(6.666667, '2000-01-01');
  assert.equal(dasha.birthMoonRuler, 'ketu');
  assert.equal(dasha.periods.length, 9);
  assert.equal(dasha.periods[0].ruler, 'ketu');
  // First period duration should be ~3.5 years (remaining balance)
  assert.ok(Math.abs(dasha.periods[0].durationYears - 3.5) < 0.1);
  // Second period must be Venus (20 years)
  assert.equal(dasha.periods[1].ruler, 'venus');
  assert.equal(dasha.periods[1].durationYears, 20);
  // Third period must be Sun (6 years)
  assert.equal(dasha.periods[2].ruler, 'sun');
  assert.equal(dasha.periods[2].durationYears, 6);
});

test('Astrology Engine — Planetary Dignities (Exaltation & Debilitation)', () => {
  // Sun exalted in Aries (Mesha, index 0, around 10°)
  assert.equal(getPlanetaryDignity('sun', 0, 10.0), 'EXALTED');
  // Sun debilitated in Libra (Tula, index 6)
  assert.equal(getPlanetaryDignity('sun', 6, 10.0), 'DEBILITATED');
  // Jupiter exalted in Cancer (Karka, index 3)
  assert.equal(getPlanetaryDignity('jupiter', 3, 5.0), 'EXALTED');
  // Jupiter debilitated in Capricorn (Makara, index 9)
  assert.equal(getPlanetaryDignity('jupiter', 9, 5.0), 'DEBILITATED');
  // Mars in own sign Scorpio (Vrishchika, index 7)
  assert.equal(getPlanetaryDignity('mars', 7, 15.0), 'OWN_SIGN');
});

test('Astrology Engine — Western Ptolemaic Aspects', () => {
  const bodies = [
    { key: 'sun', name: 'Sun', longitude: 10.0, speedDegPerDay: 1.0 },
    { key: 'moon', name: 'Moon', longitude: 130.0, speedDegPerDay: 13.0 }, // 120° = Trine
    { key: 'mars', name: 'Mars', longitude: 100.0, speedDegPerDay: 0.5 }, // 90° from Sun = Square
    { key: 'jupiter', name: 'Jupiter', longitude: 190.0, speedDegPerDay: 0.08 } // 180° from Sun = Opposition
  ];

  const aspects = calculateAspects(bodies);
  assert.ok(aspects.length >= 3);

  const trine = aspects.find(a => a.aspect === 'TRINE');
  assert.ok(trine);
  assert.equal(trine.targetAngle, 120);
  assert.equal(trine.actualSeparation, 120);

  const square = aspects.find(a => a.aspect === 'SQUARE');
  assert.ok(square);
  assert.equal(square.targetAngle, 90);

  const opp = aspects.find(a => a.aspect === 'OPPOSITION');
  assert.ok(opp);
  assert.equal(opp.targetAngle, 180);
});

test('Astrology Engine — Full Vedic Chart Generation', () => {
  const chart = calculateVedicChart({
    year: 1990, month: 5, day: 15, hour: 14, minute: 30, second: 0,
    latitude: 13.0827, longitude: 80.2707,
    timezone: 'Asia/Kolkata',
    ayanamsa: 'LAHIRI_CHITRAPAKSHA'
  });

  assert.equal(chart.system, 'VEDIC');
  assert.ok(chart.ascendant);
  assert.equal(chart.houses.length, 12);
  assert.ok(chart.planets.sun);
  assert.ok(chart.planets.moon);
  assert.ok(chart.planets.rahu);
  assert.ok(chart.planets.ketu);
  assert.ok(chart.dasha);
  assert.ok(chart.janmaNakshatra);
  assert.ok(chart.janmaPada >= 1 && chart.janmaPada <= 4);
});

test('Astrology Engine — Full Western Chart Generation', () => {
  const chart = calculateWesternChart({
    year: 1990, month: 5, day: 15, hour: 14, minute: 30, second: 0,
    latitude: 40.7128, longitude: -74.0060,
    timezone: 'America/New_York',
    houseSystem: 'PLACIDUS'
  });

  assert.equal(chart.system, 'WESTERN');
  assert.equal(chart.zodiacType, 'TROPICAL');
  assert.ok(chart.ascendant);
  assert.ok(chart.chartRuler);
  assert.equal(chart.houses.length, 12);
  assert.ok(chart.aspects.length > 0);
  assert.ok(chart.balances.elements.EARTH >= 1);
});

test('Astrology Engine — Common BirthChart Contract & Hashing', () => {
  const birthParams = {
    year: 1995, month: 10, day: 24, hour: 8, minute: 0,
    latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata'
  };

  const hash1 = generateInputHash(birthParams, 'VEDIC');
  const hash2 = generateInputHash(birthParams, 'VEDIC');
  assert.equal(hash1, hash2, 'Hash must be strictly deterministic');

  const chart = buildBirthChart({ system: 'VEDIC', birthParams });
  assert.equal(chart.astrologySystem, 'VEDIC');
  assert.equal(chart.inputHash, hash1);
  assert.ok(chart.id.startsWith('chart_'));
  assert.ok(chart.planetaryPositions.list.length >= 10);
});

test('Astrology Engine — Unknown Birth Time Safeguard (Vedic & Western)', () => {
  // Vedic unknown time
  const vedicUnknown = calculateVedicChart({
    year: 1990, month: 1, day: 1,
    isTimeUnknown: true,
    latitude: 22.5726, longitude: 88.3639,
    timezone: 'Asia/Kolkata'
  });
  assert.equal(vedicUnknown.ascendant, null, 'Ascendant must be null when birth time is unknown');
  assert.equal(vedicUnknown.houses.length, 0, 'Houses must be omitted when birth time is unknown');
  assert.ok(vedicUnknown.warnings.some(w => w.includes('withheld')), 'Warning must state houses are withheld');
  assert.ok(vedicUnknown.unsupportedFeatures.includes('ASCENDANT'));

  // Western unknown time
  const westernUnknown = calculateWesternChart({
    year: 1990, month: 1, day: 1,
    isTimeUnknown: true,
    latitude: 40.7128, longitude: -74.0060,
    timezone: 'America/New_York'
  });
  assert.equal(westernUnknown.ascendant, null, 'Western ascendant must be null when birth time is unknown');
  assert.equal(westernUnknown.houses.length, 0, 'Western houses must be omitted when birth time is unknown');
  assert.ok(westernUnknown.warnings.some(w => w.includes('omitted')));

  // Western Porphyry house system
  const westernPorphyry = calculateWesternChart({
    year: 1990, month: 1, day: 1, hour: 12, minute: 0,
    latitude: 40.7128, longitude: -74.0060,
    timezone: 'America/New_York',
    houseSystem: 'PORPHYRY'
  });
  assert.equal(westernPorphyry.houseSystem, 'PORPHYRY');
  assert.equal(westernPorphyry.houses.length, 12);
});
