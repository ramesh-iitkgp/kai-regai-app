/**
 * Ayanamsa — Sidereal Zodiac Offset Calculations
 * 
 * Sources:
 * - Indian Astronomical Ephemeris (Positional Astronomy Centre, Kolkata)
 * - Lahiri / Chitrapaksha Committee recommendations
 * - N. C. Lahiri, "Tables of Ascendants"
 */

import { jdToJulianCenturies } from '../../astronomy/time/JulianDate.js';
import { calculateNutation } from '../../astronomy/coordinates/Nutation.js';
import { normalizeDegrees } from '../../astronomy/coordinates/AngleMath.js';

export const AYANAMSA_MODELS = {
  LAHIRI: 'LAHIRI_CHITRAPAKSHA',
  RAMAN: 'RAMAN',
  KP: 'KRISHNAMURTI_PADHDHATI',
  TROPICAL: 'TROPICAL_ZERO'
};

/**
 * Computes the selected Ayanamsa offset in decimal degrees for a given Julian Date.
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @param {string} [system='LAHIRI_CHITRAPAKSHA']
 * @param {boolean} [includeNutation=false] If true, includes nutation in longitude (true vs mean ayanamsa)
 * @returns {number} Ayanamsa in decimal degrees
 */
export function calculateAyanamsa(jdTT, system = 'LAHIRI_CHITRAPAKSHA', includeNutation = false) {
  const T = jdToJulianCenturies(jdTT);
  const sys = (system || '').toUpperCase();

  let meanAyanamsa = 0.0;

  switch (sys) {
    case 'LAHIRI':
    case 'LAHIRI_CHITRAPAKSHA':
    case 'CHITRAPAKSHA':
      // Lahiri value at J2000.0 is 23° 51' 25.53" = 23.857092°
      // Annual precession rate = 50.290966" per year = 1.396971° per Julian century
      meanAyanamsa = 23.857092 + 1.396971 * T;
      break;

    case 'RAMAN':
      // B. V. Raman ayanamsa: ~22° 27' at J2000.0
      meanAyanamsa = 22.4602 + 1.396971 * T;
      break;

    case 'KP':
    case 'KRISHNAMURTI_PADHDHATI':
      // Krishnamurti Padhdhati: ~23° 49' at J2000.0
      meanAyanamsa = 23.8188 + 1.396971 * T;
      break;

    case 'TROPICAL':
    case 'TROPICAL_ZERO':
    case 'NONE':
      return 0.0;

    default:
      // Default to Lahiri / Chitrapaksha
      meanAyanamsa = 23.857092 + 1.396971 * T;
      break;
  }

  if (includeNutation) {
    const nutation = calculateNutation(jdTT);
    return meanAyanamsa + nutation.deltaPsi;
  }

  return meanAyanamsa;
}

/**
 * Converts a Tropical ecliptic longitude to Sidereal longitude using the configured Ayanamsa.
 * 
 * @param {number} tropicalLongitude Tropical longitude in degrees [0, 360)
 * @param {number} ayanamsaDeg Ayanamsa offset in degrees
 * @returns {number} Sidereal longitude in degrees [0, 360)
 */
export function tropicalToSidereal(tropicalLongitude, ayanamsaDeg) {
  return normalizeDegrees(tropicalLongitude - ayanamsaDeg);
}

/**
 * Converts a Sidereal ecliptic longitude back to Tropical longitude.
 * 
 * @param {number} siderealLongitude 
 * @param {number} ayanamsaDeg 
 * @returns {number} Tropical longitude in degrees [0, 360)
 */
export function siderealToTropical(siderealLongitude, ayanamsaDeg) {
  return normalizeDegrees(siderealLongitude + ayanamsaDeg);
}
