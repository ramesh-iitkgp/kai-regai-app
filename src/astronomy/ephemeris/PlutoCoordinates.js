/**
 * PlutoCoordinates — Heliocentric & Geocentric Position of Pluto
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 37
 * - E. Goffin, J. Meeus, and C. Steyaert (1986), "A simplified method for the computation of the position of Pluto"
 * - Valid for years 1885–2099
 */

import { degToRad, radToDeg, normalizeDegrees } from '../coordinates/AngleMath.js';
import { jdToJulianCenturies } from '../time/JulianDate.js';
import { calculateNutation } from '../coordinates/Nutation.js';
import { getHeliocentricCoordinates } from './PlanetarySeries.js';

// Table 37.A: Major perturbation arguments for Pluto
// J: Jupiter mean longitude, S: Saturn mean longitude, P: Pluto mean longitude
const PLUTO_LONGITUDE_TERMS = [
  // [J, S, P, sin_coef, cos_coef] in 10^-6 deg
  [0, 0, 1, -19799805, 19850055],
  [0, 0, 2, 897144, -4954829],
  [0, 0, 3, 611149, 1211027],
  [0, 0, 4, -341243, -189585],
  [0, 0, 5, 126262, -225],
  [0, 0, 6, -30806, 18606],
  [0, 1, -1, -5429, -12028],
  [0, 1, 0, 3474, 18534],
  [0, 1, 1, 799, -6065],
  [0, 2, -2, 175, 512],
  [1, 0, -1, 3683, -1455],
  [1, 0, 0, -1074, 1698],
  [1, 0, 1, 230, -1045]
];

const PLUTO_LATITUDE_TERMS = [
  // [J, S, P, sin_coef, cos_coef] in 10^-6 deg
  [0, 0, 1, -5452898, -14974950],
  [0, 0, 2, 3527812, 1672792],
  [0, 0, 3, -1050748, 327647],
  [0, 0, 4, 178690, -292153],
  [0, 0, 5, 18650, 100344],
  [0, 0, 6, -30600, -25824],
  [0, 1, -1, 3349, 1374],
  [0, 1, 0, -1197, -1999],
  [1, 0, -1, -1578, -1379]
];

const PLUTO_RADIUS_TERMS = [
  // [J, S, P, sin_coef, cos_coef] in 10^-7 AU
  [0, 0, 0, 0, 407247248],
  [0, 0, 1, -66810237, 69046]
];

/**
 * Calculates geocentric apparent position of Pluto.
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @returns {{
 *   apparentLongitude: number,
 *   geometricLongitude: number,
 *   latitude: number,
 *   distanceAU: number
 * }}
 */
export function calculatePlutoCoordinates(jdTT) {
  const T = jdToJulianCenturies(jdTT);

  // Mean longitudes (degrees)
  const J = normalizeDegrees(34.35 + 3034.9057 * T);
  const S = normalizeDegrees(50.08 + 1222.1138 * T);
  const P = normalizeDegrees(238.96 + 144.9600 * T);

  // Heliocentric longitude sum
  let sumL = 0.0;
  for (let i = 0; i < PLUTO_LONGITUDE_TERMS.length; i++) {
    const term = PLUTO_LONGITUDE_TERMS[i];
    const alpha = degToRad(term[0] * J + term[1] * S + term[2] * P);
    sumL += term[3] * Math.sin(alpha) + term[4] * Math.cos(alpha);
  }

  // Heliocentric latitude sum
  let sumB = 0.0;
  for (let i = 0; i < PLUTO_LATITUDE_TERMS.length; i++) {
    const term = PLUTO_LATITUDE_TERMS[i];
    const alpha = degToRad(term[0] * J + term[1] * S + term[2] * P);
    sumB += term[3] * Math.sin(alpha) + term[4] * Math.cos(alpha);
  }

  // Heliocentric radius sum
  let sumR = 0.0;
  for (let i = 0; i < PLUTO_RADIUS_TERMS.length; i++) {
    const term = PLUTO_RADIUS_TERMS[i];
    const alpha = degToRad(term[0] * J + term[1] * S + term[2] * P);
    sumR += term[3] * Math.sin(alpha) + term[4] * Math.cos(alpha);
  }

  // Heliocentric coordinates
  const helioLong = normalizeDegrees(238.956785 + 144.9600 * T + sumL * 1e-6);
  const helioLat = -3.908239 + sumB * 1e-6;
  const radiusAU = (sumR * 1e-7) || 39.5; // Baseline ~39.5 AU

  // Convert to rectangular heliocentric coordinates
  const lRad = degToRad(helioLong);
  const bRad = degToRad(helioLat);
  const xh = radiusAU * Math.cos(bRad) * Math.cos(lRad);
  const yh = radiusAU * Math.cos(bRad) * Math.sin(lRad);
  const zh = radiusAU * Math.sin(bRad);

  // Earth coordinates
  const earth = getHeliocentricCoordinates('earth', jdTT);

  // Geocentric vector
  const dx = xh - earth.xh;
  const dy = yh - earth.yh;
  const dz = zh - earth.zh;
  const distAU = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const geoLong = normalizeDegrees(radToDeg(Math.atan2(dy, dx)));
  const geoLat = radToDeg(Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)));

  // Nutation
  const nutation = calculateNutation(jdTT);
  const apparentLong = normalizeDegrees(geoLong + nutation.deltaPsi);

  return {
    apparentLongitude: apparentLong,
    geometricLongitude: geoLong,
    latitude: geoLat,
    distanceAU: distAU
  };
}
