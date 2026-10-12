/**
 * LunarCoordinates — Geocentric Lunar Position (Chapront ELP-2000/82 Truncated Series)
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 47
 * - M. Chapront-Touzé and J. Chapront (1988), "ELP 2000-85: a semi-analytical lunar ephemeris"
 * - Expected accuracy: ±0.02° to ±0.03° relative to JPL Horizons (1800–2100)
 */

import { degToRad, radToDeg, normalizeDegrees } from '../coordinates/AngleMath.js';
import { jdToJulianCenturies } from '../time/JulianDate.js';
import { calculateNutation } from '../coordinates/Nutation.js';

// Table 47.A: Major periodic terms for lunar longitude (Coefficients in millionths of a degree, 10^-6 deg)
// Each term: [D, M, M', F, coefSin]
const LUNAR_LONGITUDE_TERMS = [
  [0, 0, 1, 0, 6288774],
  [2, 0, -1, 0, 1274027],
  [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116],
  [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793],
  [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758],
  [0, 1, -1, 0, -40923],
  [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383],
  [2, 0, 0, -2, 15327],
  [0, 0, 1, 2, -12528],
  [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675],
  [0, 0, 3, 0, 10034],
  [4, 0, -2, 0, 8548],
  [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766],
  [1, 0, -1, 0, -5163],
  [1, 1, 0, 0, 4987],
  [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994],
  [4, 0, 0, 0, 3861],
  [2, 0, -3, 0, 3665],
  [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602],
  [2, -1, -2, 0, 2390],
  [1, 0, 1, 0, -2348],
  [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120],
  [0, 2, 0, 0, -2069],
  [2, -2, -1, 0, 2048],
  [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595],
  [4, -1, -1, 0, 1215],
  [0, 0, 2, 2, -1110],
  [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810],
  [4, -1, -2, 0, 759],
  [0, 2, -1, 0, -713],
  [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691],
  [2, -1, 0, -2, 596],
  [4, 0, 1, 0, 549],
  [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520],
  [1, 0, -2, 0, -487],
  [2, 1, 0, -2, -399],
  [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351],
  [3, 0, -2, 0, -340],
  [4, 0, -3, 0, 330],
  [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323],
  [1, 1, -1, 0, 299],
  [2, 0, 3, 0, 294]
];

// Table 47.B: Major periodic terms for lunar latitude (Coefficients in millionths of a degree, 10^-6 deg)
// Each term: [D, M, M', F, coefSin]
const LUNAR_LATITUDE_TERMS = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565],
  [1, 0, 0, 1, -1491],
  [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410],
  [0, 1, 0, -1, -1344],
  [1, 0, 0, -1, -1335],
  [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021],
  [4, 0, -1, 1, 833],
  [0, 0, 1, -3, 777],
  [4, 0, -2, 1, 671],
  [2, 0, 0, -3, 607],
  [2, 0, 2, -1, 596],
  [2, -1, 1, -1, 491],
  [2, 0, -2, 1, -451],
  [0, 0, 3, -1, 439],
  [2, 0, 2, 1, 422],
  [2, 0, -3, -1, 421],
  [2, 1, -1, 1, -366],
  [2, 1, 0, 1, -351],
  [4, 0, -2, -1, 331],
  [2, -1, 1, 1, 315],
  [2, -2, 0, -1, 302],
  [0, 0, 1, 3, -283],
  [2, 1, 1, -1, -229]
];

// Major distance terms (in kilometers)
const LUNAR_DISTANCE_TERMS = [
  [0, 0, 1, 0, -20905355],
  [2, 0, -1, 0, -3699111],
  [2, 0, 0, 0, -2955968],
  [0, 0, 2, 0, -569925],
  [0, 1, 0, 0, 48888],
  [0, 0, 0, 2, -3149],
  [2, 0, -2, 0, 246158],
  [2, -1, -1, 0, -152138],
  [2, 0, 1, 0, -170733],
  [2, -1, 0, 0, -204586],
  [0, 1, -1, 0, -129620],
  [1, 0, 0, 0, 108743],
  [0, 1, 1, 0, 104755],
  [2, 0, 0, -2, 10321],
  [0, 0, 1, 2, 79661],
  [0, 0, 1, -2, -34782],
  [4, 0, -1, 0, -23210],
  [0, 0, 3, 0, -21636],
  [4, 0, -2, 0, 24208],
  [2, 1, -1, 0, 30824],
  [2, 1, 0, 0, -8379]
];

/**
 * Calculates high-accuracy geocentric lunar coordinates (apparent longitude, latitude, distance).
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time (TT)
 * @returns {{
 *   apparentLongitude: number,
 *   geometricLongitude: number,
 *   latitude: number,
 *   distanceKm: number,
 *   distanceAU: number
 * }}
 */
export function calculateLunarCoordinates(jdTT) {
  const T = jdToJulianCenturies(jdTT);

  // Fundamental arguments (degrees)
  // Moon mean longitude (L')
  const Lprime = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0 - (T * T * T * T) / 65194000.0);
  
  // Mean elongation of the Moon (D)
  const D = normalizeDegrees(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0 - (T * T * T * T) / 113065000.0);
  
  // Sun mean anomaly (M)
  const M = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0);
  
  // Moon mean anomaly (M')
  const Mprime = normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699.0 - (T * T * T * T) / 14712000.0);
  
  // Moon argument of latitude (F)
  const F = normalizeDegrees(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0 + (T * T * T * T) / 863310000.0);

  // Sum periodic terms for Longitude
  let sigmaL = 0.0;
  for (let i = 0; i < LUNAR_LONGITUDE_TERMS.length; i++) {
    const term = LUNAR_LONGITUDE_TERMS[i];
    const arg = degToRad(term[0] * D + term[1] * M + term[2] * Mprime + term[3] * F);
    sigmaL += term[4] * Math.sin(arg);
  }

  // Planetary additions (Venus & Jupiter action)
  const A1 = degToRad(normalizeDegrees(119.75 + 131.849 * T));
  const A2 = degToRad(normalizeDegrees(53.09 + 479264.290 * T));
  sigmaL += 3958 * Math.sin(A1) + 1962 * Math.sin(degToRad(Lprime - F)) + 318 * Math.sin(A2);

  // Sum periodic terms for Latitude
  let sigmaB = 0.0;
  for (let i = 0; i < LUNAR_LATITUDE_TERMS.length; i++) {
    const term = LUNAR_LATITUDE_TERMS[i];
    const arg = degToRad(term[0] * D + term[1] * M + term[2] * Mprime + term[3] * F);
    sigmaB += term[4] * Math.sin(arg);
  }
  sigmaB += -2235 * Math.sin(degToRad(Lprime)) + 382 * Math.sin(A1) + 175 * Math.sin(A1 - degToRad(F));

  // Sum periodic terms for Distance
  let sigmaR = 0.0;
  for (let i = 0; i < LUNAR_DISTANCE_TERMS.length; i++) {
    const term = LUNAR_DISTANCE_TERMS[i];
    const arg = degToRad(term[0] * D + term[1] * M + term[2] * Mprime + term[3] * F);
    sigmaR += term[4] * Math.cos(arg);
  }

  // Convert millionths of a degree to degrees
  const deltaLongDeg = sigmaL * 1e-6;
  const deltaLatDeg = sigmaB * 1e-6;
  const distanceKm = 385000.56 + (sigmaR * 1e-3); // distance in km

  const geometricLongitude = normalizeDegrees(Lprime + deltaLongDeg);
  const latitude = deltaLatDeg;

  // Add nutation in longitude to get apparent longitude
  const nutation = calculateNutation(jdTT);
  const apparentLongitude = normalizeDegrees(geometricLongitude + nutation.deltaPsi);

  return {
    apparentLongitude,
    geometricLongitude,
    latitude,
    distanceKm,
    distanceAU: distanceKm / 149597870.7
  };
}
