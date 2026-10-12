/**
 * AscendantCalculator — Ascendant (Lagna), Midheaven (MC), and Angles
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 14
 * - W. M. Smart, "Textbook on Spherical Astronomy"
 * - High-latitude polar edge handling
 */

import { degToRad, radToDeg, normalizeDegrees } from '../coordinates/AngleMath.js';
import { getLST } from '../time/SiderealTime.js';
import { getTrueObliquity } from '../coordinates/Obliquity.js';

/**
 * Calculates the Ascendant (Lagna) and Midheaven (MC) in ecliptic longitude.
 * 
 * @param {number} jdUT Julian Date in Universal Time (UT)
 * @param {number} latitude Geographic latitude in decimal degrees (North positive, South negative)
 * @param {number} longitude Geographic longitude in decimal degrees (East positive, West negative)
 * @returns {{
 *   ascendant: number,
 *   midheaven: number,
 *   descendant: number,
 *   imumCoeli: number,
 *   localSiderealTimeDeg: number,
 *   isCircumpolar: boolean,
 *   quality: string
 * }}
 */
export function calculateAscendantAndAngles(jdUT, latitude, longitude) {
  // 1. Local Apparent Sidereal Time (LST) in degrees
  const lstDeg = getLST(jdUT, longitude);
  const theta = degToRad(lstDeg);

  // 2. True Obliquity of the Ecliptic
  const { trueObliquity } = getTrueObliquity(jdUT);
  const eps = degToRad(trueObliquity);

  const phi = degToRad(latitude);

  // 3. Midheaven (Medium Coeli - MC)
  // tan(MC) = tan(theta) / cos(eps)
  // Using atan2 to guarantee proper quadrant
  const mcY = Math.sin(theta);
  const mcX = Math.cos(theta) * Math.cos(eps);
  const midheaven = normalizeDegrees(radToDeg(Math.atan2(mcY, mcX)));
  const imumCoeli = normalizeDegrees(midheaven + 180.0);

  // 4. Check for polar circumpolar conditions (|latitude| >= 90° - obliquity ≈ 66.56°)
  const maxLat = 90.0 - trueObliquity;
  const isCircumpolar = Math.abs(latitude) >= maxLat;

  // 5. Ascendant (Lagna)
  // Intersection of eastern horizon with the ecliptic:
  // tan(Asc) = cos(theta) / (- sin(theta) * cos(eps) - tan(phi) * sin(eps))
  const ascY = Math.cos(theta);
  const ascX = - Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);

  let ascendant = normalizeDegrees(radToDeg(Math.atan2(ascY, ascX)));
  const descendant = normalizeDegrees(ascendant + 180.0);

  return {
    ascendant,
    midheaven,
    descendant,
    imumCoeli,
    localSiderealTimeDeg: lstDeg,
    isCircumpolar,
    quality: isCircumpolar ? 'CIRCUMPOLAR_POLAR_LATITUDE' : 'EXACT_RIGOROUS'
  };
}
