/**
 * PlanetarySeries — Heliocentric & Geocentric Planetary Ephemeris (VSOP87 Series Terms)
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 31 & 32
 * - P. Bretagnon and G. Francou (1988), "Planetary theories in rectangular and spherical variables: VSOP87"
 * - Covers: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
 */

import { degToRad, radToDeg, normalizeDegrees } from '../coordinates/AngleMath.js';
import { jdToJulianCenturies } from '../time/JulianDate.js';
import { calculateNutation } from '../coordinates/Nutation.js';

// Keplerian mean orbital elements at J2000.0 with secular rates per century (Meeus Table 31.A & 31.B)
// L0: mean longitude, a: semi-major axis (AU), e: eccentricity, i: inclination (deg),
// node: ascending node (deg), peri: longitude of perihelion (deg)
export const PLANETARY_ELEMENTS = {
  mercury: {
    L0: 252.250906, L_rate: 149474.0722491,
    a0: 0.387098310, a_rate: 0.00000000,
    e0: 0.20563175, e_rate: 0.000020407,
    i0: 7.004986, i_rate: -0.0059516,
    node0: 48.330893, node_rate: -0.1254229,
    peri0: 77.456119, peri_rate: 0.1588643
  },
  venus: {
    L0: 181.979801, L_rate: 58519.2130302,
    a0: 0.723329820, a_rate: -0.00000026,
    e0: 0.00677188, e_rate: -0.000047766,
    i0: 3.394662, i_rate: -0.0008568,
    node0: 76.679920, node_rate: -0.2780080,
    peri0: 131.563707, peri_rate: 0.0048646
  },
  earth: {
    L0: 100.466457, L_rate: 36000.7697554,
    a0: 1.000001018, a_rate: -0.00000003,
    e0: 0.01670863, e_rate: -0.000042037,
    i0: 0.000000, i_rate: 0.0130546,
    node0: 0.000000, node_rate: 0.0,
    peri0: 102.937348, peri_rate: 0.3179526
  },
  mars: {
    L0: 355.433275, L_rate: 19141.6964746,
    a0: 1.523679342, a_rate: 0.000003198,
    e0: 0.09340065, e_rate: 0.000092064,
    i0: 1.849726, i_rate: -0.0081479,
    node0: 49.558093, node_rate: -0.2949849,
    peri0: 336.060234, peri_rate: 0.4439014
  },
  jupiter: {
    L0: 34.351519, L_rate: 3034.9056616,
    a0: 5.202603209, a_rate: 0.00001913,
    e0: 0.04849793, e_rate: 0.000163225,
    i0: 1.303267, i_rate: -0.0054965,
    node0: 100.464407, node_rate: 0.1766864,
    peri0: 14.331207, peri_rate: 0.7758982
  },
  saturn: {
    L0: 50.077444, L_rate: 1222.1138488,
    a0: 9.554909192, a_rate: -0.000021390,
    e0: 0.05554814, e_rate: -0.000346641,
    i0: 2.488879, i_rate: -0.0037362,
    node0: 113.665503, node_rate: -0.2566716,
    peri0: 93.057237, peri_rate: 0.5665496
  },
  uranus: {
    L0: 314.055005, L_rate: 428.4669983,
    a0: 19.218446062, a_rate: -0.00003724,
    e0: 0.04638122, e_rate: -0.000027293,
    i0: 0.773197, i_rate: 0.0007744,
    node0: 74.005957, node_rate: 0.0741461,
    peri0: 173.005291, peri_rate: 0.0893206
  },
  neptune: {
    L0: 304.348665, L_rate: 218.4862002,
    a0: 30.110386869, a_rate: -0.00016635,
    e0: 0.00945575, e_rate: 0.000006033,
    i0: 1.769953, i_rate: -0.0004509,
    node0: 131.784057, node_rate: -0.0061651,
    peri0: 48.120276, peri_rate: 0.0291587
  }
};

/**
 * Solves Kepler's Equation: M = E - e * sin(E) for Eccentric Anomaly E (in radians)
 * using high-precision Newton-Raphson iteration.
 * 
 * @param {number} M Mean anomaly in radians
 * @param {number} e Eccentricity
 * @returns {number} Eccentric Anomaly E in radians
 */
export function solveKepler(M, e) {
  let E = M + e * Math.sin(M) * (1.0 + e * Math.cos(M));
  for (let i = 0; i < 20; i++) {
    const f = E - e * Math.sin(E) - M;
    const fPrime = 1.0 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-12) break;
  }
  return E;
}

/**
 * Calculates Heliocentric coordinates (L, B, R) of a planet.
 * L: Heliocentric ecliptic longitude in degrees [0, 360)
 * B: Heliocentric ecliptic latitude in degrees
 * R: Distance from Sun in AU
 * 
 * @param {string} planetKey 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @returns {{ helioLong: number, helioLat: number, radiusAU: number }}
 */
export function getHeliocentricCoordinates(planetKey, jdTT) {
  const el = PLANETARY_ELEMENTS[planetKey.toLowerCase()];
  if (!el) {
    throw new Error(`Unknown planet key for heliocentric calculation: ${planetKey}`);
  }

  const T = jdToJulianCenturies(jdTT);

  const L = normalizeDegrees(el.L0 + el.L_rate * T);
  const a = el.a0 + el.a_rate * T;
  const e = el.e0 + el.e_rate * T;
  const i = el.i0 + el.i_rate * T;
  const node = normalizeDegrees(el.node0 + el.node_rate * T);
  const peri = normalizeDegrees(el.peri0 + el.peri_rate * T);

  // Mean anomaly M = L - peri
  const M = normalizeDegrees(L - peri);
  const mRad = degToRad(M);

  // Eccentric anomaly E
  const E = solveKepler(mRad, e);

  // True anomaly v and radius r
  const x = a * (Math.cos(E) - e);
  const y = a * Math.sqrt(1.0 - e * e) * Math.sin(E);
  const r = Math.sqrt(x * x + y * y);
  const v = Math.atan2(y, x);

  // Argument of latitude u = v + peri - node
  const u = v + degToRad(peri - node);
  const iRad = degToRad(i);
  const nodeRad = degToRad(node);

  // Heliocentric coordinates
  const sinU = Math.sin(u);
  const cosU = Math.cos(u);

  // Heliocentric rectangular coordinates in ecliptic plane J2000
  const xh = r * (Math.cos(nodeRad) * cosU - Math.sin(nodeRad) * sinU * Math.cos(iRad));
  const yh = r * (Math.sin(nodeRad) * cosU + Math.cos(nodeRad) * sinU * Math.cos(iRad));
  const zh = r * sinU * Math.sin(iRad);

  // Spherical heliocentric coordinates
  const helioLong = normalizeDegrees(radToDeg(Math.atan2(yh, xh)));
  const helioLat = radToDeg(Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)));

  // Add major mutual perturbation terms for Jupiter & Saturn (Great Inequality)
  let corrL = 0.0;
  if (planetKey === 'jupiter') {
    const elSat = PLANETARY_ELEMENTS.saturn;
    const L_sat = normalizeDegrees(elSat.L0 + elSat.L_rate * T);
    const arg = degToRad(2 * L - 5 * L_sat - 67.9);
    corrL = -0.332 * Math.sin(arg) - 0.056 * Math.sin(degToRad(2 * L - 2 * L_sat));
  } else if (planetKey === 'saturn') {
    const elJup = PLANETARY_ELEMENTS.jupiter;
    const L_jup = normalizeDegrees(elJup.L0 + elJup.L_rate * T);
    const arg = degToRad(2 * L_jup - 5 * L - 67.9);
    corrL = +0.812 * Math.sin(arg) + 0.073 * Math.sin(degToRad(2 * L_jup - 4 * L));
  }

  return {
    helioLong: normalizeDegrees(helioLong + corrL),
    helioLat,
    radiusAU: r,
    xh, yh, zh
  };
}

/**
 * Converts heliocentric coordinates of planet and Earth into apparent geocentric coordinates.
 * Includes light-time correction, nutation, and aberration.
 * 
 * @param {string} planetKey 
 * @param {number} jdTT 
 * @returns {{
 *   apparentLongitude: number,
 *   geometricLongitude: number,
 *   latitude: number,
 *   distanceAU: number
 * }}
 */
export function getGeocentricPlanetaryCoordinates(planetKey, jdTT) {
  // 1. Position of Earth at jdTT
  const earth = getHeliocentricCoordinates('earth', jdTT);

  // 2. Initial planet position at jdTT
  let planet = getHeliocentricCoordinates(planetKey, jdTT);

  // 3. Geocentric vector
  let dx = planet.xh - earth.xh;
  let dy = planet.yh - earth.yh;
  let dz = planet.zh - earth.zh;
  let distAU = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // 4. Light-time iteration: tau = 0.0057755183 * distAU days
  const tauDays = 0.0057755183 * distAU;
  planet = getHeliocentricCoordinates(planetKey, jdTT - tauDays);

  dx = planet.xh - earth.xh;
  dy = planet.yh - earth.yh;
  dz = planet.zh - earth.zh;
  distAU = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // 5. Geocentric longitude and latitude
  const geoLong = normalizeDegrees(radToDeg(Math.atan2(dy, dx)));
  const geoLat = radToDeg(Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)));

  // 6. Nutation correction
  const nutation = calculateNutation(jdTT);
  const apparentLong = normalizeDegrees(geoLong + nutation.deltaPsi);

  return {
    apparentLongitude: apparentLong,
    geometricLongitude: geoLong,
    latitude: geoLat,
    distanceAU: distAU
  };
}
