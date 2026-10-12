/**
 * SiderealTime — Greenwich & Local Sidereal Time Computations
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 12
 * - IAU 1982 / 2000 definition of Sidereal Time
 */

import { degToRad, normalizeDegrees } from '../coordinates/AngleMath.js';
import { jdToJulianCenturies, J2000_EPOCH } from './JulianDate.js';
import { calculateNutation } from '../coordinates/Nutation.js';
import { getTrueObliquity } from '../coordinates/Obliquity.js';

/**
 * Calculates Greenwich Mean Sidereal Time (GMST) in decimal degrees [0, 360)
 * for a given Julian Date in Universal Time (UT).
 * 
 * @param {number} jdUT Julian Date in Universal Time (UT1/UTC)
 * @returns {number} GMST in decimal degrees [0, 360)
 */
export function getGMST(jdUT) {
  const T = jdToJulianCenturies(jdUT);
  const d = jdUT - J2000_EPOCH;

  // IAU 1982 formula across continuous JD
  // Theta = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T^2 - T^3 / 38710000
  const gmst = 280.46061837 + 
               360.98564736629 * d + 
               0.000387933 * T * T - 
               (T * T * T) / 38710000.0;

  return normalizeDegrees(gmst);
}

/**
 * Calculates Greenwich Apparent Sidereal Time (GAST) in decimal degrees [0, 360)
 * GAST = GMST + (DeltaPsi * cos(trueObliquity))
 * 
 * @param {number} jdUT Julian Date in Universal Time
 * @returns {number} GAST in decimal degrees [0, 360)
 */
export function getGAST(jdUT) {
  const gmst = getGMST(jdUT);
  const nutation = calculateNutation(jdUT);
  const { trueObliquity } = getTrueObliquity(jdUT);

  // Equation of the Equinoxes in degrees
  const eqEquinox = nutation.deltaPsi * Math.cos(degToRad(trueObliquity));
  return normalizeDegrees(gmst + eqEquinox);
}

/**
 * Calculates Local Apparent Sidereal Time (LST) in decimal degrees [0, 360)
 * LST = GAST + geographicLongitude
 * (East positive, West negative)
 * 
 * @param {number} jdUT Julian Date in Universal Time
 * @param {number} longitude Geographic longitude in decimal degrees (East positive)
 * @returns {number} Local Sidereal Time in decimal degrees [0, 360)
 */
export function getLST(jdUT, longitude) {
  const gast = getGAST(jdUT);
  return normalizeDegrees(gast + longitude);
}

/**
 * Converts degrees of sidereal time to sidereal hours [0, 24)
 * @param {number} deg
 * @returns {number}
 */
export function siderealDegToHours(deg) {
  return normalizeDegrees(deg) / 15.0;
}

export const calculateGMST = getGMST;
export const calculateGAST = getGAST;
export const calculateLST = getLST;
