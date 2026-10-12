/**
 * JulianDate — Astronomical Julian Date & Epoch Computations
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 7
 * - H. F. Fliegel and T. C. van Flandern, "A Machine Algorithm for Processing Calendar Dates" (1968)
 * - Standard Epoch J2000.0 = JD 2451545.0 (2000 January 1, 12h TT)
 */

export const J2000_EPOCH = 2451545.0;

/**
 * Converts a calendar date and time (Gregorian or Julian) into a Julian Date (JD).
 * Handles the historical Gregorian calendar reform boundary (1582-10-15).
 * 
 * @param {number} year   Full year (e.g. 2000, 1984, -500 for 501 BC)
 * @param {number} month  1 to 12
 * @param {number} day    1 to 31
 * @param {number} hour   0 to 23
 * @param {number} minute 0 to 59
 * @param {number} second 0 to 59.999...
 * @returns {number} Julian Date in decimal days
 */
export function gregorianToJD(year, month, day, hour = 0, minute = 0, second = 0) {
  let Y = year;
  let M = month;

  // In astronomical algorithms, if month is Jan or Feb, it is considered as month 13 or 14 of the preceding year
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  // Fractional day
  const D = day + (hour + minute / 60.0 + second / 3600.0) / 24.0;

  // Gregorian calendar reform check: 1582 October 15 (JD 2299160.5)
  // For dates on or after 1582 October 15, Gregorian calendar applies
  const isGregorian = (year > 1582) || 
    (year === 1582 && month > 10) || 
    (year === 1582 && month === 10 && day >= 15);

  let A = 0;
  let B = 0;
  if (isGregorian) {
    A = Math.floor(Y / 100);
    B = 2 - A + Math.floor(A / 4);
  }

  const jd = Math.floor(365.25 * (Y + 4716)) + 
             Math.floor(30.6001 * (M + 1)) + 
             D + B - 1524.5;

  return jd;
}

/**
 * Converts a Julian Date (JD) back to Gregorian calendar components.
 * @param {number} jd 
 * @returns {{ year: number, month: number, day: number, hour: number, minute: number, second: number }}
 */
export function jdToGregorian(jd) {
  const zPlusHalf = jd + 0.5;
  const Z = Math.floor(zPlusHalf);
  const F = zPlusHalf - Z;

  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const dayFraction = B - D - Math.floor(30.6001 * E) + F;
  const day = Math.floor(dayFraction);

  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  // Extract hours, minutes, seconds from remaining fraction
  const dayRemainder = dayFraction - day;
  const totalSeconds = dayRemainder * 86400.0;
  const hour = Math.floor(totalSeconds / 3600.0);
  const remSec = totalSeconds % 3600.0;
  const minute = Math.floor(remSec / 60.0);
  const second = Math.round((remSec % 60.0) * 1000) / 1000;

  return { year, month, day, hour, minute, second };
}

/**
 * Computes Julian Centuries since J2000.0 (T)
 * T = (JD - 2451545.0) / 36525.0
 * @param {number} jd
 * @returns {number}
 */
export function jdToJulianCenturies(jd) {
  return (jd - J2000_EPOCH) / 36525.0;
}

/**
 * Computes Julian Millennia since J2000.0 (tau)
 * tau = (JD - 2451545.0) / 365250.0
 * @param {number} jd
 * @returns {number}
 */
export function jdToJulianMillennia(jd) {
  return (jd - J2000_EPOCH) / 365250.0;
}

export const gregorianToJulianDate = gregorianToJD;
export const julianDateToGregorian = jdToGregorian;
export const julianCenturiesSinceJ2000 = jdToJulianCenturies;
