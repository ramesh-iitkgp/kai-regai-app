/**
 * DeltaT — Terrestrial Time (TT) minus Universal Time (UT) Estimation
 * 
 * Sources:
 * - Fred Espenak and Jean Meeus, NASA TP-2004-214141: "Five Millennium Canon of Solar Eclipses"
 * - Morrison & Stephenson (1984, 2004) historical Earth rotation measurements
 * 
 * Delta T = TT - UT (in seconds)
 */

/**
 * Calculates estimated Delta T in seconds for a given decimal year.
 * Polynomials cover 1600 to 2100 with historical and future extrapolations.
 * 
 * @param {number} year Decimal year (e.g. 2000.0, 1985.5)
 * @returns {number} Delta T in seconds
 */
export function estimateDeltaT(yearOrJD) {
  let y = yearOrJD;
  if (y > 100000) {
    y = 2000.0 + (y - 2451545.0) / 365.25;
  }

  // Years 2005 to 2050
  if (y >= 2005 && y <= 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }

  // Years 1986 to 2005
  if (y >= 1986 && y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * Math.pow(t, 3) + 
           0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5);
  }

  // Years 1961 to 1986
  if (y >= 1961 && y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - t * t / 260 - Math.pow(t, 3) / 718;
  }

  // Years 1941 to 1961
  if (y >= 1941 && y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - Math.pow(t, 2) / 233 + Math.pow(t, 3) / 2547;
  }

  // Years 1920 to 1941
  if (y >= 1920 && y < 1941) {
    const t = y - 1920;
    return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * Math.pow(t, 3);
  }

  // Years 1900 to 1920
  if (y >= 1900 && y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * Math.pow(t, 3) - 0.000197 * Math.pow(t, 4);
  }

  // Years 1800 to 1900
  if (y >= 1800 && y < 1900) {
    const t = y - 1800;
    return 13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * Math.pow(t, 3) - 
           0.00037436 * Math.pow(t, 4) + 0.0000121272 * Math.pow(t, 5) - 0.0000001699 * Math.pow(t, 6);
  }

  // Outside 1800-2050 (General Espenak-Meeus formula)
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

/**
 * Converts Julian Date in Universal Time (UT/UTC) to Terrestrial Time (TT)
 * TT = UT + Delta T
 * @param {number} jdUT 
 * @param {number} [year] Optional decimal year
 * @returns {number} jdTT
 */
export function utToTT(jdUT, year = null) {
  const y = year !== null ? year : 2000.0 + (jdUT - 2451545.0) / 365.25;
  const deltaTSeconds = estimateDeltaT(y);
  return jdUT + deltaTSeconds / 86400.0;
}

export const calculateDeltaT = estimateDeltaT;
