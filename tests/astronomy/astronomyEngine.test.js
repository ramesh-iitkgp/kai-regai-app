/**
 * Automated Test Suite — Custom Astronomy Engine
 * 
 * Verifies:
 * - Julian Date & Calendar calculations
 * - Delta T models
 * - Nutation & Obliquity
 * - Sidereal Time (GMST, GAST, LST)
 * - Coordinate transformations
 * - Planetary positions against independent astronomical vectors
 * - Ascendant & Midheaven (with polar latitude tests)
 * - House systems (Whole Sign, Equal, Placidus fallback)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { gregorianToJulianDate, julianDateToGregorian, julianCenturiesSinceJ2000, J2000_EPOCH } from '../../src/astronomy/time/JulianDate.js';
import { calculateDeltaT } from '../../src/astronomy/time/DeltaT.js';
import { calculateNutationIAU1980 } from '../../src/astronomy/coordinates/Nutation.js';
import { getTrueObliquity, getMeanObliquity } from '../../src/astronomy/coordinates/Obliquity.js';
import { calculateGMST, calculateGAST, calculateLST } from '../../src/astronomy/time/SiderealTime.js';
import { normalizeDegrees, shortestAngularSeparation, angularDifference } from '../../src/astronomy/coordinates/AngleMath.js';
import { calculateSolarCoordinates } from '../../src/astronomy/ephemeris/SolarCoordinates.js';
import { calculateLunarCoordinates } from '../../src/astronomy/ephemeris/LunarCoordinates.js';
import { calculatePlutoCoordinates } from '../../src/astronomy/ephemeris/PlutoCoordinates.js';
import { calculateMeanLunarNodes, calculateTrueLunarNodes } from '../../src/astronomy/planetaryPositions/LunarNodes.js';
import { calculateAllPlanetaryPositions } from '../../src/astronomy/planetaryPositions/PlanetaryCalculator.js';
import { calculateAscendantAndAngles } from '../../src/astronomy/ascendant/AscendantCalculator.js';
import { calculateWholeSignHouses, calculateEqualHouses, calculatePlacidusHouses, determineHouseForLongitude } from '../../src/astronomy/houses/HouseSystems.js';
import { runNumericalValidationSuite } from '../../src/astronomy/validation/NumericalValidator.js';

test('Astronomical Engine — AngleMath & Normalization', () => {
  assert.equal(normalizeDegrees(0), 0);
  assert.equal(normalizeDegrees(360), 0);
  assert.equal(normalizeDegrees(725), 5);
  assert.equal(normalizeDegrees(-30), 330);
  assert.equal(normalizeDegrees(-720), 0);

  // Shortest angular separation
  assert.equal(shortestAngularSeparation(10, 350), 20);
  assert.equal(shortestAngularSeparation(10, 100), 90);
  assert.equal(shortestAngularSeparation(0, 180), 180);
});

test('Astronomical Engine — Julian Date Conversions', () => {
  // Epoch J2000.0: 2000 January 1.5 TT = JD 2451545.0
  const jdJ2000 = gregorianToJulianDate(2000, 1, 1, 12, 0, 0);
  assert.equal(jdJ2000, 2451545.0);

  const calJ2000 = julianDateToGregorian(2451545.0);
  assert.equal(calJ2000.year, 2000);
  assert.equal(calJ2000.month, 1);
  assert.equal(calJ2000.day, 1);
  assert.equal(calJ2000.hour, 12);

  // Meeus Example 7.a: 1957 October 4.81 = JD 2436116.31
  const jdSputnik = gregorianToJulianDate(1957, 10, 4, 19, 26, 24);
  assert.ok(Math.abs(jdSputnik - 2436116.31) < 0.0001);

  // Julian centuries
  assert.equal(julianCenturiesSinceJ2000(2451545.0), 0.0);
});

test('Astronomical Engine — Delta T & Obliquity', () => {
  // Year 2000 Delta T should be ~ 63.8 seconds
  const dt2000 = calculateDeltaT(2451545.0);
  assert.ok(dt2000 >= 60.0 && dt2000 <= 68.0);

  // Mean obliquity at J2000.0 is 23° 26' 21.448" = 23.43929111°
  const meanEps = getMeanObliquity(2451545.0);
  assert.ok(Math.abs(meanEps - 23.439291) < 0.0001);

  // True obliquity includes nutation
  const { trueObliquity, deltaEps } = getTrueObliquity(2451545.0);
  assert.ok(trueObliquity > 23.0 && trueObliquity < 24.0);
  assert.ok(Math.abs(deltaEps) < 0.01);
});

test('Astronomical Engine — Sidereal Time & Nutation', () => {
  // Greenwich Mean Sidereal Time at J2000.0 (JD 2451545.0) = 280.46061837°
  const gmst = calculateGMST(2451545.0);
  assert.ok(Math.abs(gmst - 280.4606) < 0.01);

  // Nutation in longitude (Delta Psi)
  const nutation = calculateNutationIAU1980(2451545.0);
  assert.ok(typeof nutation.deltaPsi === 'number');
  assert.ok(typeof nutation.deltaEps === 'number');

  // GAST = GMST + equation of the equinoxes
  const gast = calculateGAST(2451545.0);
  assert.ok(Math.abs(gast - gmst) < 0.02);

  // LST for Greenwich (lon = 0)
  const lst = calculateLST(2451545.0, 0);
  assert.equal(lst, gast);
});

test('Astronomical Engine — Independent Numerical Validation Suite (Meeus Vectors)', () => {
  const result = runNumericalValidationSuite();
  assert.equal(result.passed, true, `Validation suite had failures: ${JSON.stringify(result.results.filter(d => !d.passed))}`);
  assert.ok(result.passedChecks >= 10, 'Expected at least 10 passing astronomical test vectors');
  assert.ok(result.maxLongitudinalDiscrepancyDeg < 0.02, `Max observed longitude error ${result.maxLongitudinalDiscrepancyDeg}° exceeds 0.02° tolerance`);
});

test('Astronomical Engine — Solar and Lunar Ephemeris', () => {
  // Sun at J2000.0: ~280.14° geometric, distance ~0.983 AU
  const sun = calculateSolarCoordinates(2451545.0);
  assert.ok(sun.apparentLongitude > 279.0 && sun.apparentLongitude < 281.0);
  assert.ok(sun.distanceAU > 0.98 && sun.distanceAU < 0.99);

  // Moon at J2000.0 (12h TT): 223.31°, distance ~402,400 km
  const moon = calculateLunarCoordinates(2451545.0);
  assert.ok(moon.apparentLongitude > 221.0 && moon.apparentLongitude < 225.0);
  assert.ok(moon.distanceKm > 350000 && moon.distanceKm < 410000);
});

test('Astronomical Engine — Lunar Nodes (Mean and True)', () => {
  const meanNodes = calculateMeanLunarNodes(2451545.0);
  assert.ok(meanNodes.rahu >= 0 && meanNodes.rahu < 360);
  assert.ok(meanNodes.ketu >= 0 && meanNodes.ketu < 360);
  assert.equal(meanNodes.nodeType, 'MEAN');

  const trueNodes = calculateTrueLunarNodes(2451545.0);
  assert.ok(trueNodes.rahu >= 0 && trueNodes.rahu < 360);
  assert.ok(trueNodes.ketu >= 0 && trueNodes.ketu < 360);
  assert.equal(trueNodes.nodeType, 'TRUE');

  // Difference between true and mean nodes is bounded by ~1.75°
  const sep = shortestAngularSeparation(meanNodes.rahu, trueNodes.rahu);
  assert.ok(sep < 2.0, `Separation between true and mean Rahu was ${sep}°, expected < 2.0°`);
});

test('Astronomical Engine — Ascendant, MC and Polar Latitude Guard', () => {
  // Moderate latitude: Chennai (Lat 13.0827° N, Lon 80.2707° E) at J2000.0
  const chennaiAngles = calculateAscendantAndAngles(2451545.0, 13.0827, 80.2707);
  assert.equal(chennaiAngles.isCircumpolar, false);
  assert.ok(chennaiAngles.ascendant >= 0 && chennaiAngles.ascendant < 360);
  assert.ok(chennaiAngles.midheaven >= 0 && chennaiAngles.midheaven < 360);

  // High polar latitude: Tromsø, Norway (Lat 69.6492° N) - circumpolar
  const polarAngles = calculateAscendantAndAngles(2451545.0, 69.6492, 18.9553);
  assert.equal(polarAngles.isCircumpolar, true);
  assert.ok(typeof polarAngles.ascendant === 'number');
});

test('Astronomical Engine — House Systems & Cusps', () => {
  const asc = 15.0; // Aries 15°
  const mc = 285.0;

  // Whole Sign
  const wholeSign = calculateWholeSignHouses(asc);
  assert.equal(wholeSign.length, 12);
  assert.equal(wholeSign[0].cuspLongitude, 0.0); // Aries 0°
  assert.equal(wholeSign[1].cuspLongitude, 30.0); // Taurus 0°

  // Equal House
  const equal = calculateEqualHouses(asc);
  assert.equal(equal.length, 12);
  assert.equal(equal[0].cuspLongitude, 15.0);
  assert.equal(equal[1].cuspLongitude, 45.0);

  // Placidus
  const placidus = calculatePlacidusHouses(asc, mc, 40.7128, 2451545.0);
  assert.equal(placidus.cusps.length, 12);
  assert.equal(placidus.fallbackUsed, false);

  // Placidus fallback at polar latitude
  const polarPlacidus = calculatePlacidusHouses(asc, mc, 75.0, 2451545.0);
  assert.equal(polarPlacidus.fallbackUsed, true);
  assert.equal(polarPlacidus.system, 'PLACIDUS_FALLBACK_EQUAL');

  // House determination
  const h1 = determineHouseForLongitude(20.0, equal);
  assert.equal(h1, 1);
  const h2 = determineHouseForLongitude(50.0, equal);
  assert.equal(h2, 2);
});
