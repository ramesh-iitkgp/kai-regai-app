/**
 * SolarCoordinates — High-Precision Geocentric Solar Position
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 25
 * - Expected accuracy: ±0.01° (sub-arcminute) relative to JPL Horizons (1800–2100)
 */

import { degToRad, radToDeg, normalizeDegrees } from '../coordinates/AngleMath.js';
import { jdToJulianCenturies } from '../time/JulianDate.js';
import { calculateNutation } from '../coordinates/Nutation.js';

/**
 * Calculates geocentric apparent and geometric solar coordinates.
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time (TT)
 * @returns {{
 *   apparentLongitude: number,
 *   geometricLongitude: number,
 *   latitude: number,
 *   distanceAU: number,
 *   trueAnomaly: number,
 *   meanAnomaly: number
 * }}
 */
export function calculateSolarCoordinates(jdTT) {
  const T = jdToJulianCenturies(jdTT);

  // Geometric mean longitude of the Sun (L0)
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Mean anomaly of the Sun (M)
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const mRad = degToRad(M);

  // Eccentricity of Earth's orbit (e)
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  // Sun's Equation of the Center (C)
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(mRad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * mRad) +
            0.000289 * Math.sin(3 * mRad);

  // Sun's True Longitude (sunTrue)
  const sunTrue = normalizeDegrees(L0 + C);

  // Sun's True Anomaly (v)
  const v = normalizeDegrees(M + C);

  // Radius vector (distance in AU)
  const R = (1.000001018 * (1.0 - e * e)) / (1.0 + e * Math.cos(degToRad(v)));

  // Nutation and aberration corrections for apparent position
  const nutation = calculateNutation(jdTT);
  
  // Aberration correction in degrees: -20.4898" / R
  const aberration = - (20.4898 / 3600.0) / R;

  // Apparent solar longitude (lambda)
  const apparentLongitude = normalizeDegrees(sunTrue + nutation.deltaPsi + aberration);

  return {
    apparentLongitude,
    geometricLongitude: sunTrue,
    latitude: 0.0, // Ecliptic latitude of Sun is zero by definition
    distanceAU: R,
    trueAnomaly: v,
    meanAnomaly: M
  };
}
