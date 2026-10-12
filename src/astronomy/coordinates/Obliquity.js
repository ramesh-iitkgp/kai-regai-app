/**
 * Obliquity — Mean and True Obliquity of the Ecliptic
 * 
 * Sources:
 * - J. Laskar (1986), "Secular terms of classical planetary theories", Astronomy & Astrophysics
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 22
 * - IAU 2000 / 2006 expressions
 */

import { jdToJulianCenturies } from '../time/JulianDate.js';
import { calculateNutation } from './Nutation.js';

/**
 * Calculates the mean obliquity of the ecliptic (eps0) in decimal degrees
 * using Laskar's 3rd-order polynomial (valid for -10000 to +10000 years).
 * 
 * @param {number} jd Julian Date
 * @returns {number} Mean obliquity in decimal degrees
 */
export function getMeanObliquity(jd) {
  const T = jdToJulianCenturies(jd);

  // eps0 = 23° 26' 21.448" - 46.8150" T - 0.00059" T^2 + 0.001813" T^3
  // in arcseconds: 84381.448 - 46.8150 * T - 0.00059 * T^2 + 0.001813 * T^3
  const eps0Arcsec = 84381.448 - 46.8150 * T - 0.00059 * T * T + 0.001813 * Math.pow(T, 3);
  return eps0Arcsec / 3600.0;
}

/**
 * Calculates the true (apparent) obliquity of the ecliptic (eps) in decimal degrees
 * including nutation in obliquity (eps = eps0 + deltaEps).
 * 
 * @param {number} jd Julian Date
 * @returns {{ meanObliquity: number, trueObliquity: number, deltaEps: number }}
 */
export function getTrueObliquity(jd) {
  const meanObliquity = getMeanObliquity(jd);
  const nutation = calculateNutation(jd);
  const trueObliquity = meanObliquity + nutation.deltaEps;

  return {
    meanObliquity,
    trueObliquity,
    deltaEps: nutation.deltaEps
  };
}
