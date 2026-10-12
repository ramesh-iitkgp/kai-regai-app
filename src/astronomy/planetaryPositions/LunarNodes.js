/**
 * LunarNodes — Astronomical Calculations for Rahu & Ketu
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 47
 * - Both Mean Node and True Node conventions supported and explicitly labeled.
 */

import { degToRad, normalizeDegrees } from '../coordinates/AngleMath.js';
import { jdToJulianCenturies } from '../time/JulianDate.js';
import { calculateNutation } from '../coordinates/Nutation.js';

/**
 * Calculates the Mean Ascending Node of the Moon (Mean Rahu) and Descending Node (Mean Ketu).
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @returns {{ rahu: number, ketu: number, nodeType: 'MEAN' }}
 */
export function calculateMeanLunarNodes(jdTT) {
  const T = jdToJulianCenturies(jdTT);

  // Mean longitude of the ascending node (Omega)
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  const nutation = calculateNutation(jdTT);

  const rahu = normalizeDegrees(omega + nutation.deltaPsi);
  const ketu = normalizeDegrees(rahu + 180.0);

  return {
    rahu,
    ketu,
    nodeType: 'MEAN'
  };
}

/**
 * Calculates the True (Osculating) Ascending Node of the Moon (True Rahu) and Descending Node (True Ketu).
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @returns {{ rahu: number, ketu: number, nodeType: 'TRUE' }}
 */
export function calculateTrueLunarNodes(jdTT) {
  const T = jdToJulianCenturies(jdTT);

  // Fundamental lunar arguments
  const D = degToRad(normalizeDegrees(297.85019 + 445267.11140 * T));
  const M = degToRad(normalizeDegrees(357.52911 + 35999.05029 * T));
  const Mprime = degToRad(normalizeDegrees(134.96340 + 477198.86751 * T));
  const F = degToRad(normalizeDegrees(93.27210 + 483202.01752 * T));

  // Mean node
  const meanOmega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;

  // Major periodic perturbation terms (degrees)
  const deltaTrue = 
    - 1.4979 * Math.sin(2 * (D - F))
    - 0.2060 * Math.sin(2 * (D - M))
    - 0.1436 * Math.sin(2 * (D - Mprime))
    + 0.0890 * Math.sin(2 * F)
    + 0.0450 * Math.sin(2 * D)
    - 0.0240 * Math.sin(2 * (F - Mprime));

  const nutation = calculateNutation(jdTT);
  const rahu = normalizeDegrees(meanOmega + deltaTrue + nutation.deltaPsi);
  const ketu = normalizeDegrees(rahu + 180.0);

  return {
    rahu,
    ketu,
    nodeType: 'TRUE'
  };
}

/**
 * Calculates Lunar Nodes with requested convention (defaulting to MEAN node, standard in Vedic astrology).
 * 
 * @param {number} jdTT 
 * @param {'MEAN'|'TRUE'} [convention='MEAN']
 * @returns {{ rahu: number, ketu: number, nodeType: 'MEAN'|'TRUE' }}
 */
export function calculateLunarNodes(jdTT, convention = 'MEAN') {
  if (convention === 'TRUE') {
    return calculateTrueLunarNodes(jdTT);
  }
  return calculateMeanLunarNodes(jdTT);
}
