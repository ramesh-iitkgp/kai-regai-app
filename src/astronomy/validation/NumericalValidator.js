/**
 * NumericalValidator — Automated Numerical Validation & Accuracy Checker
 * 
 * Executes reference benchmark vectors against the custom astronomy engine
 * and compiles max/mean discrepancy statistics.
 */

import { gregorianToJD } from '../time/JulianDate.js';
import { getGMST } from '../time/SiderealTime.js';
import { getMeanObliquity } from '../coordinates/Obliquity.js';
import { calculateNutation } from '../coordinates/Nutation.js';
import { calculateSolarCoordinates } from '../ephemeris/SolarCoordinates.js';
import { calculateLunarCoordinates } from '../ephemeris/LunarCoordinates.js';
import { calculateBodyPosition } from '../planetaryPositions/PlanetaryCalculator.js';
import { REFERENCE_TEST_VECTORS } from './AstronomicalTestVectors.js';
import { angularDifference } from '../coordinates/AngleMath.js';

/**
 * Runs the full numerical validation suite against the reference vectors.
 * @returns {{ passed: boolean, results: Array<object>, maxError: object }}
 */
export function validateAstronomyEngine() {
  const results = [];
  let allPassed = true;
  let maxLongDiscrepancy = 0;

  // 1. Julian Date validation
  for (const tc of REFERENCE_TEST_VECTORS.julianDate) {
    const calculatedJD = gregorianToJD(
      tc.input.year,
      tc.input.month,
      tc.input.day,
      tc.input.hour,
      tc.input.minute,
      tc.input.second
    );
    const diff = Math.abs(calculatedJD - tc.expectedJD);
    const pass = diff <= tc.toleranceDays;
    if (!pass) allPassed = false;

    results.push({
      category: 'Julian Date',
      name: tc.name,
      expected: tc.expectedJD,
      calculated: calculatedJD,
      discrepancy: diff,
      tolerance: tc.toleranceDays,
      passed: pass
    });
  }

  // 2. Sidereal Time validation
  for (const tc of REFERENCE_TEST_VECTORS.siderealTime) {
    const calcGMST = getGMST(tc.inputJD);
    const diff = angularDifference(calcGMST, tc.expectedGMSTDeg);
    const pass = diff <= tc.toleranceDeg;
    if (!pass) allPassed = false;
    if (diff > maxLongDiscrepancy) maxLongDiscrepancy = diff;

    results.push({
      category: 'Sidereal Time',
      name: tc.name,
      expected: tc.expectedGMSTDeg,
      calculated: calcGMST,
      discrepancyDeg: diff,
      tolerance: tc.toleranceDeg,
      passed: pass
    });
  }

  // 3. Obliquity & Nutation validation
  for (const tc of REFERENCE_TEST_VECTORS.obliquityAndNutation) {
    const meanEps = getMeanObliquity(tc.inputJD);
    const nut = calculateNutation(tc.inputJD);

    const diffEps = Math.abs(meanEps - tc.expectedMeanObliquityDeg);
    const diffPsiArcsec = Math.abs(nut.deltaPsiArcsec - tc.expectedDeltaPsiArcsec);
    const diffEpsArcsec = Math.abs(nut.deltaEpsArcsec - tc.expectedDeltaEpsArcsec);

    const pass = diffEps <= tc.toleranceDeg &&
                 diffPsiArcsec <= tc.toleranceArcsec &&
                 diffEpsArcsec <= tc.toleranceArcsec;
    if (!pass) allPassed = false;

    results.push({
      category: 'Obliquity & Nutation',
      name: tc.name,
      diffEpsDeg: diffEps,
      diffPsiArcsec,
      diffEpsArcsec,
      passed: pass
    });
  }

  // 4. Solar position validation
  for (const tc of REFERENCE_TEST_VECTORS.sun) {
    const sun = calculateSolarCoordinates(tc.inputJD);
    const diffLong = angularDifference(sun.apparentLongitude, tc.expectedApparentLongDeg);
    const diffDist = Math.abs(sun.distanceAU - tc.expectedDistanceAU);

    const pass = diffLong <= tc.toleranceDeg && diffDist <= tc.toleranceAU;
    if (!pass) allPassed = false;
    if (diffLong > maxLongDiscrepancy) maxLongDiscrepancy = diffLong;

    results.push({
      category: 'Sun',
      name: tc.name,
      expectedLong: tc.expectedApparentLongDeg,
      calcLong: sun.apparentLongitude,
      diffLongDeg: diffLong,
      diffDistAU: diffDist,
      passed: pass
    });
  }

  // 5. Lunar position validation
  for (const tc of REFERENCE_TEST_VECTORS.moon) {
    const moon = calculateLunarCoordinates(tc.inputJD);
    const diffLong = angularDifference(moon.apparentLongitude, tc.expectedApparentLongDeg);
    const diffLat = Math.abs(moon.latitude - tc.expectedLatitudeDeg);

    const pass = diffLong <= tc.toleranceDeg;
    if (!pass) allPassed = false;
    if (diffLong > maxLongDiscrepancy) maxLongDiscrepancy = diffLong;

    results.push({
      category: 'Moon',
      name: tc.name,
      expectedLong: tc.expectedApparentLongDeg,
      calcLong: moon.apparentLongitude,
      diffLongDeg: diffLong,
      diffLatDeg: diffLat,
      passed: pass
    });
  }

  // 6. JPL Planetary Benchmarks
  for (const benchmark of REFERENCE_TEST_VECTORS.planetsJPL) {
    for (const [bodyKey, target] of Object.entries(benchmark.targets)) {
      const pos = calculateBodyPosition(bodyKey, benchmark.inputJD);
      const diff = angularDifference(pos.apparentLongitude, target.longitude);
      const pass = diff <= target.tolerance;
      if (!pass) allPassed = false;
      if (diff > maxLongDiscrepancy) maxLongDiscrepancy = diff;

      results.push({
        category: 'Planetary Benchmark (JPL)',
        body: bodyKey,
        expectedLong: target.longitude,
        calcLong: pos.apparentLongitude,
        diffLongDeg: diff,
        tolerance: target.tolerance,
        passed: pass
      });
    }
  }

  return {
    passed: allPassed,
    totalChecks: results.length,
    passedChecks: results.filter(r => r.passed).length,
    maxLongitudinalDiscrepancyDeg: maxLongDiscrepancy,
    results
  };
}

export const runNumericalValidationSuite = validateAstronomyEngine;
