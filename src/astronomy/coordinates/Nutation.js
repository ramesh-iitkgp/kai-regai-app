/**
 * Nutation — Astronomical Nutation in Longitude & Obliquity
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 22
 * - IAU 1980 Theory of Nutation
 */

import { degToRad, normalizeDegrees } from './AngleMath.js';
import { jdToJulianCenturies } from '../time/JulianDate.js';

/**
 * Calculates Nutation in longitude (Δψ) and Nutation in obliquity (Δε)
 * using the standard dominant terms of the IAU 1980 series.
 * 
 * @param {number} jd Julian Date
 * @returns {{ deltaPsi: number, deltaEps: number, deltaPsiArcsec: number, deltaEpsArcsec: number }}
 * deltaPsi and deltaEps in decimal degrees; deltaPsiArcsec and deltaEpsArcsec in arcseconds
 */
export function calculateNutation(jd) {
  const T = jdToJulianCenturies(jd);

  // Mean elongation of the Moon from the Sun: D
  const D = degToRad(normalizeDegrees(297.85036 + 445267.111480 * T - 0.0019142 * T * T + T * T * T / 189474.0));
  
  // Mean anomaly of the Sun: M
  const M = degToRad(normalizeDegrees(357.52772 + 35999.050340 * T - 0.0001603 * T * T - T * T * T / 300000.0));
  
  // Mean anomaly of the Moon: M'
  const Mprime = degToRad(normalizeDegrees(134.96298 + 477198.867398 * T + 0.0086972 * T * T + T * T * T / 56250.0));
  
  // Moon's argument of latitude: F
  const F = degToRad(normalizeDegrees(93.27191 + 483202.017538 * T - 0.0036825 * T * T + T * T * T / 327270.0));
  
  // Longitude of the ascending node of the Moon's mean orbit: Omega
  const Omega = degToRad(normalizeDegrees(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0));

  // Sun mean longitude L = M + Omega_sun
  const L = degToRad(normalizeDegrees(280.4665 + 36000.7698 * T));
  // Moon mean longitude L'
  const Lprime = degToRad(normalizeDegrees(218.3165 + 481267.8813 * T));

  // Dominant periodic terms (arcseconds)
  const dPsiArcsec = 
    -17.1996 * Math.sin(Omega) 
    - 1.3187 * Math.sin(2 * L) 
    - 0.2274 * Math.sin(2 * Lprime) 
    + 0.2062 * Math.sin(2 * Omega) 
    + 0.1426 * Math.sin(M)
    - 0.0517 * Math.sin(2 * L + M)
    + 0.0217 * Math.sin(2 * L - M);

  const dEpsArcsec = 
    + 9.2025 * Math.cos(Omega) 
    + 0.5736 * Math.cos(2 * L) 
    + 0.0977 * Math.cos(2 * Lprime) 
    - 0.0895 * Math.cos(2 * Omega) 
    + 0.0054 * Math.cos(M)
    + 0.0224 * Math.cos(2 * L + M);

  return {
    deltaPsiArcsec: dPsiArcsec,
    deltaEpsArcsec: dEpsArcsec,
    deltaPsi: dPsiArcsec / 3600.0,
    deltaEps: dEpsArcsec / 3600.0
  };
}

export const calculateNutationIAU1980 = calculateNutation;
