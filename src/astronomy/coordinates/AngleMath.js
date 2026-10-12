/**
 * AngleMath — Core Angular Normalization & Trigonometric Helpers
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Ch. 1 & 3
 * - IAU Standards of Fundamental Astronomy (SOFA)
 */

export const DEG_TO_RAD = Math.PI / 180.0;
export const RAD_TO_DEG = 180.0 / Math.PI;

/**
 * Normalizes an angle in degrees to the range [0, 360)
 * @param {number} deg
 * @returns {number}
 */
export function normalizeDegrees(deg) {
  let res = deg % 360.0;
  if (res < 0.0) {
    res += 360.0;
  }
  // Prevent -0.0
  return res === 0.0 ? 0.0 : res;
}

/**
 * Normalizes an angle in degrees to the range [-180, 180)
 * @param {number} deg
 * @returns {number}
 */
export function normalizeDegreesSigned(deg) {
  const norm = normalizeDegrees(deg);
  return norm >= 180.0 ? norm - 360.0 : norm;
}

/**
 * Convert degrees to radians
 * @param {number} deg 
 * @returns {number}
 */
export function degToRad(deg) {
  return deg * DEG_TO_RAD;
}

/**
 * Convert radians to degrees
 * @param {number} rad 
 * @returns {number}
 */
export function radToDeg(rad) {
  return rad * RAD_TO_DEG;
}

/**
 * Computes shortest angular separation between two angles in degrees [0, 180]
 * @param {number} deg1 
 * @param {number} deg2 
 * @returns {number}
 */
export function angularDifference(deg1, deg2) {
  const diff = Math.abs(normalizeDegrees(deg1) - normalizeDegrees(deg2));
  return diff > 180.0 ? 360.0 - diff : diff;
}

/**
 * Convert Degrees, Minutes, Seconds to decimal degrees
 * @param {number} d 
 * @param {number} m 
 * @param {number} s 
 * @returns {number}
 */
export function dmsToDeg(d, m = 0, s = 0) {
  const sign = d < 0 ? -1 : 1;
  return sign * (Math.abs(d) + m / 60.0 + s / 3600.0);
}

/**
 * Convert decimal degrees to Degrees, Minutes, Seconds object
 * @param {number} deg 
 * @returns {{ degrees: number, minutes: number, seconds: number, formatted: string }}
 */
export function degToDms(deg) {
  const sign = deg < 0 ? -1 : 1;
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const remMin = (abs - d) * 60.0;
  const m = Math.floor(remMin);
  const s = (remMin - m) * 60.0;

  const pad = (n) => String(n).padStart(2, '0');
  const formatted = `${sign < 0 ? '-' : ''}${d}° ${pad(m)}' ${s.toFixed(2)}"`;

  return {
    degrees: sign * d,
    minutes: m,
    seconds: Math.round(s * 100) / 100,
    formatted
  };
}

export const shortestAngularSeparation = angularDifference;
