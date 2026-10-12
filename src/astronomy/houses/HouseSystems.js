/**
 * HouseSystems — Astrological House Calculations
 * 
 * Supports:
 * - Whole Sign (Standard Vedic & Hellenistic)
 * - Equal House (from Ascendant degree)
 * - Placidus (Semi-arc quadrant system, with explicit polar fallback)
 */

import { degToRad, radToDeg, normalizeDegrees } from '../coordinates/AngleMath.js';
import { getTrueObliquity } from '../coordinates/Obliquity.js';

/**
 * Calculates 12 House Cusps using the Whole Sign House System.
 * In Whole Sign, House 1 spans the entire 30° sign containing the Ascendant.
 * 
 * @param {number} ascendantDeg Longitude of Ascendant in degrees
 * @returns {Array<{ house: number, cuspLongitude: number }>} Array of 12 house cusps
 */
export function calculateWholeSignHouses(ascendantDeg) {
  const ascSignIndex = Math.floor(normalizeDegrees(ascendantDeg) / 30.0);
  const cusps = [];

  for (let i = 0; i < 12; i++) {
    const signIdx = (ascSignIndex + i) % 12;
    cusps.push({
      house: i + 1,
      cuspLongitude: signIdx * 30.0
    });
  }

  return cusps;
}

/**
 * Calculates 12 House Cusps using the Equal House System.
 * In Equal House, House 1 starts at the exact Ascendant degree, and each house spans 30°.
 * 
 * @param {number} ascendantDeg Longitude of Ascendant in degrees
 * @returns {Array<{ house: number, cuspLongitude: number }>} Array of 12 house cusps
 */
export function calculateEqualHouses(ascendantDeg) {
  const normAsc = normalizeDegrees(ascendantDeg);
  const cusps = [];

  for (let i = 0; i < 12; i++) {
    cusps.push({
      house: i + 1,
      cuspLongitude: normalizeDegrees(normAsc + i * 30.0)
    });
  }

  return cusps;
}

/**
 * Calculates 12 House Cusps using the Porphyry System.
 * Trisects the ecliptic arcs between the four cardinal angles (MC, Ascendant, IC, Descendant).
 * 
 * @param {number} ascendantDeg Longitude of Ascendant in degrees
 * @param {number} midheavenDeg Longitude of Midheaven in degrees
 * @returns {Array<{ house: number, cuspLongitude: number }>} Array of 12 house cusps
 */
export function calculatePorphyryHouses(ascendantDeg, midheavenDeg) {
  const asc = normalizeDegrees(ascendantDeg);
  const mc = normalizeDegrees(midheavenDeg);
  const ic = normalizeDegrees(mc + 180.0);
  const dsc = normalizeDegrees(asc + 180.0);

  let arc10_1 = asc - mc;
  if (arc10_1 < 0) arc10_1 += 360.0;
  const cusp11 = normalizeDegrees(mc + arc10_1 / 3.0);
  const cusp12 = normalizeDegrees(mc + (2.0 * arc10_1) / 3.0);

  let arc1_4 = ic - asc;
  if (arc1_4 < 0) arc1_4 += 360.0;
  const cusp2 = normalizeDegrees(asc + arc1_4 / 3.0);
  const cusp3 = normalizeDegrees(asc + (2.0 * arc1_4) / 3.0);

  const cusp5 = normalizeDegrees(cusp11 + 180.0);
  const cusp6 = normalizeDegrees(cusp12 + 180.0);
  const cusp8 = normalizeDegrees(cusp2 + 180.0);
  const cusp9 = normalizeDegrees(cusp3 + 180.0);

  return [
    { house: 1, cuspLongitude: asc },
    { house: 2, cuspLongitude: cusp2 },
    { house: 3, cuspLongitude: cusp3 },
    { house: 4, cuspLongitude: ic },
    { house: 5, cuspLongitude: cusp5 },
    { house: 6, cuspLongitude: cusp6 },
    { house: 7, cuspLongitude: dsc },
    { house: 8, cuspLongitude: cusp8 },
    { house: 9, cuspLongitude: cusp9 },
    { house: 10, cuspLongitude: mc },
    { house: 11, cuspLongitude: cusp11 },
    { house: 12, cuspLongitude: cusp12 }
  ];
}

/**
 * Solves for ecliptic longitude lambda whose hour angle matches the target diurnal semi-arc fraction.
 */
function solveDiurnalSemiArc(ramc, phi, eps, fraction, low, high) {
  const tanPhi = Math.tan(degToRad(phi));
  const cosEps = Math.cos(degToRad(eps));
  const sinEps = Math.sin(degToRad(eps));

  let l = low;
  let r = high;
  if (r < l) r += 360.0;

  for (let iter = 0; iter < 30; iter++) {
    const mid = (l + r) / 2.0;
    const lRad = degToRad(mid);
    const alpha = normalizeDegrees(radToDeg(Math.atan2(Math.sin(lRad) * cosEps, Math.cos(lRad))));
    const sinDelta = Math.sin(lRad) * sinEps;
    const delta = Math.asin(Math.max(-1.0, Math.min(1.0, sinDelta)));
    const tanDelta = Math.tan(delta);

    const val = -tanPhi * tanDelta;
    if (Math.abs(val) >= 1.0) return null; // circumpolar / undefined
    const dArc = radToDeg(Math.acos(val));
    const targetAlpha = normalizeDegrees(ramc + fraction * dArc);

    let diff = alpha - targetAlpha;
    if (diff > 180.0) diff -= 360.0;
    if (diff < -180.0) diff += 360.0;

    if (diff < 0) {
      l = mid;
    } else {
      r = mid;
    }
  }
  return normalizeDegrees((l + r) / 2.0);
}

/**
 * Solves for ecliptic longitude lambda whose hour angle matches the target nocturnal semi-arc fraction.
 */
function solveNocturnalSemiArc(ramc, phi, eps, fraction, low, high) {
  const tanPhi = Math.tan(degToRad(phi));
  const cosEps = Math.cos(degToRad(eps));
  const sinEps = Math.sin(degToRad(eps));
  const raIC = normalizeDegrees(ramc + 180.0);

  let l = low;
  let r = high;
  if (r < l) r += 360.0;

  for (let iter = 0; iter < 30; iter++) {
    const mid = (l + r) / 2.0;
    const lRad = degToRad(mid);
    const alpha = normalizeDegrees(radToDeg(Math.atan2(Math.sin(lRad) * cosEps, Math.cos(lRad))));
    const sinDelta = Math.sin(lRad) * sinEps;
    const delta = Math.asin(Math.max(-1.0, Math.min(1.0, sinDelta)));
    const tanDelta = Math.tan(delta);

    const val = tanPhi * tanDelta;
    if (Math.abs(val) >= 1.0) return null; // circumpolar / undefined
    const nArc = radToDeg(Math.acos(val));
    const targetAlpha = normalizeDegrees(raIC - fraction * nArc);

    let diff = alpha - targetAlpha;
    if (diff > 180.0) diff -= 360.0;
    if (diff < -180.0) diff += 360.0;

    if (diff < 0) {
      l = mid;
    } else {
      r = mid;
    }
  }
  return normalizeDegrees((l + r) / 2.0);
}

/**
 * Calculates 12 House Cusps using the Placidus System.
 * Solves intermediate cusps by trisecting diurnal and nocturnal semi-arcs along the celestial equator.
 * If latitude is beyond the polar circle (|latitude| >= 66.5°) or semi-arcs are undefined,
 * cleanly falls back to Equal House with an explicit warning flag.
 * 
 * @param {number} ascendantDeg 
 * @param {number} midheavenDeg 
 * @param {number} latitude Geographic latitude in decimal degrees
 * @param {number} jdUT 
 * @returns {{ cusps: Array<{ house: number, cuspLongitude: number }>, system: string, fallbackUsed: boolean, warning?: string }}
 */
export function calculatePlacidusHouses(ascendantDeg, midheavenDeg, latitude, jdUT) {
  // Check polar condition
  const { trueObliquity } = getTrueObliquity(jdUT);
  const maxLat = 90.0 - trueObliquity;

  if (Math.abs(latitude) >= maxLat) {
    const fallbackCusps = calculateEqualHouses(ascendantDeg);
    return {
      cusps: fallbackCusps,
      system: 'PLACIDUS_FALLBACK_EQUAL',
      fallbackUsed: true,
      warning: `Placidus is mathematically undefined at latitude ${latitude.toFixed(2)}° (polar circumpolar circle); fell back to Equal House.`
    };
  }

  const asc = normalizeDegrees(ascendantDeg);
  const mc = normalizeDegrees(midheavenDeg);
  const ic = normalizeDegrees(mc + 180.0);
  const dsc = normalizeDegrees(asc + 180.0);

  // RAMC = Right Ascension of Midheaven
  const eps = trueObliquity;
  const ramc = normalizeDegrees(radToDeg(Math.atan2(Math.sin(degToRad(mc)) * Math.cos(degToRad(eps)), Math.cos(degToRad(mc)))));

  // Solve diurnal cusps 11 and 12
  const cusp11 = solveDiurnalSemiArc(ramc, latitude, eps, 1.0 / 3.0, mc, asc);
  const cusp12 = solveDiurnalSemiArc(ramc, latitude, eps, 2.0 / 3.0, mc, asc);

  // Solve nocturnal cusps 2 and 3
  const cusp2 = solveNocturnalSemiArc(ramc, latitude, eps, 2.0 / 3.0, asc, ic);
  const cusp3 = solveNocturnalSemiArc(ramc, latitude, eps, 1.0 / 3.0, asc, ic);

  if (cusp11 === null || cusp12 === null || cusp2 === null || cusp3 === null) {
    const fallbackCusps = calculateEqualHouses(ascendantDeg);
    return {
      cusps: fallbackCusps,
      system: 'PLACIDUS_FALLBACK_EQUAL',
      fallbackUsed: true,
      warning: `Placidus semi-arc solver could not converge at latitude ${latitude.toFixed(2)}°; fell back to Equal House.`
    };
  }

  // Opposite cusps (180° away)
  const cusp5 = normalizeDegrees(cusp11 + 180.0);
  const cusp6 = normalizeDegrees(cusp12 + 180.0);
  const cusp8 = normalizeDegrees(cusp2 + 180.0);
  const cusp9 = normalizeDegrees(cusp3 + 180.0);

  const cusps = [
    { house: 1, cuspLongitude: asc },
    { house: 2, cuspLongitude: cusp2 },
    { house: 3, cuspLongitude: cusp3 },
    { house: 4, cuspLongitude: ic },
    { house: 5, cuspLongitude: cusp5 },
    { house: 6, cuspLongitude: cusp6 },
    { house: 7, cuspLongitude: dsc },
    { house: 8, cuspLongitude: cusp8 },
    { house: 9, cuspLongitude: cusp9 },
    { house: 10, cuspLongitude: mc },
    { house: 11, cuspLongitude: cusp11 },
    { house: 12, cuspLongitude: cusp12 }
  ];

  return {
    cusps,
    system: 'PLACIDUS',
    fallbackUsed: false
  };
}

/**
 * Determines which house (1 to 12) a given ecliptic longitude falls into,
 * based on the provided array of 12 cusps.
 * 
 * @param {number} planetLong Ecliptic longitude in degrees [0, 360)
 * @param {Array<{ house: number, cuspLongitude: number }>} cusps 
 * @returns {number} House number (1 to 12)
 */
export function determineHouseForLongitude(planetLong, cusps) {
  const normPlanet = normalizeDegrees(planetLong);

  for (let i = 0; i < 12; i++) {
    const currentHouse = cusps[i];
    const nextHouse = cusps[(i + 1) % 12];

    const start = normalizeDegrees(currentHouse.cuspLongitude);
    const end = normalizeDegrees(nextHouse.cuspLongitude);

    if (start < end) {
      if (normPlanet >= start && normPlanet < end) {
        return currentHouse.house;
      }
    } else {
      // Wraps around 0° / 360°
      if (normPlanet >= start || normPlanet < end) {
        return currentHouse.house;
      }
    }
  }

  return 1; // Fallback
}
