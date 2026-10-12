/**
 * Transformations — Coordinate System Transformations
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), Chapter 13
 * - Smart, "Textbook on Spherical Astronomy"
 */

import { degToRad, radToDeg, normalizeDegrees } from './AngleMath.js';

/**
 * Converts Geocentric Ecliptic coordinates (lambda, beta) to Equatorial coordinates (alpha, delta).
 * 
 * @param {number} lambda Ecliptic longitude in degrees
 * @param {number} beta   Ecliptic latitude in degrees
 * @param {number} eps    Obliquity of the ecliptic in degrees
 * @returns {{ rightAscension: number, declination: number }} RA (alpha) in degrees [0, 360), Dec (delta) in degrees [-90, 90]
 */
export function eclipticToEquatorial(lambda, beta, eps) {
  const l = degToRad(lambda);
  const b = degToRad(beta);
  const e = degToRad(eps);

  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  const sinL = Math.sin(l);
  const cosL = Math.cos(l);
  const sinE = Math.sin(e);
  const cosE = Math.cos(e);

  // Right Ascension (alpha)
  const y = sinL * cosE - Math.tan(b) * sinE;
  const x = cosL;
  const alpha = normalizeDegrees(radToDeg(Math.atan2(y, x)));

  // Declination (delta)
  const sinDelta = sinB * cosE + cosB * sinE * sinL;
  const delta = radToDeg(Math.asin(Math.max(-1.0, Math.min(1.0, sinDelta))));

  return {
    rightAscension: alpha,
    declination: delta
  };
}

/**
 * Converts Equatorial coordinates (alpha, delta) to Geocentric Ecliptic coordinates (lambda, beta).
 * 
 * @param {number} alpha Right Ascension in degrees
 * @param {number} delta Declination in degrees
 * @param {number} eps   Obliquity of the ecliptic in degrees
 * @returns {{ longitude: number, latitude: number }} lambda in degrees [0, 360), beta in degrees [-90, 90]
 */
export function equatorialToEcliptic(alpha, delta, eps) {
  const a = degToRad(alpha);
  const d = degToRad(delta);
  const e = degToRad(eps);

  const sinD = Math.sin(d);
  const cosD = Math.cos(d);
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const sinE = Math.sin(e);
  const cosE = Math.cos(e);

  // Ecliptic Longitude (lambda)
  const y = sinA * cosE + Math.tan(d) * sinE;
  const x = cosA;
  const lambda = normalizeDegrees(radToDeg(Math.atan2(y, x)));

  // Ecliptic Latitude (beta)
  const sinBeta = sinD * cosE - cosD * sinE * sinA;
  const beta = radToDeg(Math.asin(Math.max(-1.0, Math.min(1.0, sinBeta))));

  return {
    longitude: lambda,
    latitude: beta
  };
}

/**
 * Converts Equatorial coordinates (alpha, delta) to Horizontal coordinates (altitude, azimuth).
 * 
 * @param {number} alpha     Right Ascension in degrees
 * @param {number} delta     Declination in degrees
 * @param {number} latitude  Geographic latitude in degrees (North positive)
 * @param {number} lst       Local Sidereal Time in degrees
 * @returns {{ altitude: number, azimuth: number }} Altitude in degrees, Azimuth in degrees [0, 360) from North
 */
export function equatorialToHorizontal(alpha, delta, latitude, lst) {
  const a = degToRad(alpha);
  const d = degToRad(delta);
  const phi = degToRad(latitude);
  // Local Hour Angle: H = LST - alpha
  const H = degToRad(normalizeDegrees(lst - alpha));

  const sinD = Math.sin(d);
  const cosD = Math.cos(d);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const cosH = Math.cos(H);
  const sinH = Math.sin(H);

  // Altitude (h)
  const sinH_alt = sinPhi * sinD + cosPhi * cosD * cosH;
  const altitude = radToDeg(Math.asin(Math.max(-1.0, Math.min(1.0, sinH_alt))));

  // Azimuth (A) measured from South eastward or standard from North
  // Using standard astronomical azimuth from North towards East
  const y = sinH;
  const x = cosH * sinPhi - Math.tan(d) * cosPhi;
  const azimuth = normalizeDegrees(radToDeg(Math.atan2(y, x)) + 180.0);

  return {
    altitude,
    azimuth
  };
}
