/**
 * PlanetaryCalculator — Unified Geocentric Planetary Calculation Engine
 * 
 * Computes apparent and geometric coordinates, equatorial positions,
 * distances, longitudinal velocities, and retrograde status for all 10 major bodies + Lunar Nodes.
 */

import { calculateSolarCoordinates } from '../ephemeris/SolarCoordinates.js';
import { calculateLunarCoordinates } from '../ephemeris/LunarCoordinates.js';
import { getGeocentricPlanetaryCoordinates } from '../ephemeris/PlanetarySeries.js';
import { calculatePlutoCoordinates } from '../ephemeris/PlutoCoordinates.js';
import { calculateLunarNodes } from './LunarNodes.js';
import { calculateLongitudinalMotion } from './PlanetaryMotion.js';
import { eclipticToEquatorial } from '../coordinates/Transformations.js';
import { getTrueObliquity } from '../coordinates/Obliquity.js';

export const SUPPORTED_BODIES = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
  'saturn', 'uranus', 'neptune', 'pluto', 'rahu', 'ketu'
];

/**
 * Calculates geocentric position and motion for a specific celestial body.
 * 
 * @param {string} bodyKey 'sun'|'moon'|'mercury'|'venus'|'mars'|'jupiter'|'saturn'|'uranus'|'neptune'|'pluto'|'rahu'|'ketu'
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @param {object} [options={}]
 * @param {'MEAN'|'TRUE'} [options.nodeConvention='MEAN']
 * @returns {object} Standardized planetary position record
 */
export function calculateBodyPosition(bodyKey, jdTT, options = {}) {
  const key = bodyKey.toLowerCase();
  const { trueObliquity } = getTrueObliquity(jdTT);
  const nodeConvention = options.nodeConvention || 'MEAN';

  let raw = null;
  let getLongFn = null;

  switch (key) {
    case 'sun':
      raw = calculateSolarCoordinates(jdTT);
      getLongFn = (t) => calculateSolarCoordinates(t).apparentLongitude;
      break;

    case 'moon':
      raw = calculateLunarCoordinates(jdTT);
      getLongFn = (t) => calculateLunarCoordinates(t).apparentLongitude;
      break;

    case 'mercury':
    case 'venus':
    case 'mars':
    case 'jupiter':
    case 'saturn':
    case 'uranus':
    case 'neptune':
      raw = getGeocentricPlanetaryCoordinates(key, jdTT);
      getLongFn = (t) => getGeocentricPlanetaryCoordinates(key, t).apparentLongitude;
      break;

    case 'pluto':
      raw = calculatePlutoCoordinates(jdTT);
      getLongFn = (t) => calculatePlutoCoordinates(t).apparentLongitude;
      break;

    case 'rahu': {
      const nodes = calculateLunarNodes(jdTT, nodeConvention);
      raw = {
        apparentLongitude: nodes.rahu,
        geometricLongitude: nodes.rahu,
        latitude: 0.0,
        distanceAU: null
      };
      getLongFn = (t) => calculateLunarNodes(t, nodeConvention).rahu;
      break;
    }

    case 'ketu': {
      const nodes = calculateLunarNodes(jdTT, nodeConvention);
      raw = {
        apparentLongitude: nodes.ketu,
        geometricLongitude: nodes.ketu,
        latitude: 0.0,
        distanceAU: null
      };
      getLongFn = (t) => calculateLunarNodes(t, nodeConvention).ketu;
      break;
    }

    default:
      throw new Error(`Unsupported celestial body: ${bodyKey}`);
  }

  // Calculate longitudinal motion and retrograde status
  const motion = calculateLongitudinalMotion(getLongFn, jdTT);

  // For mean lunar nodes, retrograde is inherent; standard convention marks them RETROGRADE
  if (key === 'rahu' || key === 'ketu') {
    motion.isRetrograde = true;
    motion.motionStatus = 'RETROGRADE';
  } else if (key === 'sun' || key === 'moon') {
    // Luminaries are always direct
    motion.isRetrograde = false;
    motion.motionStatus = 'DIRECT';
  }

  // Convert to equatorial coordinates
  const eq = eclipticToEquatorial(raw.apparentLongitude, raw.latitude, trueObliquity);

  return {
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    apparentLongitude: raw.apparentLongitude,
    geometricLongitude: raw.geometricLongitude,
    latitude: raw.latitude,
    distanceAU: raw.distanceAU,
    distanceKm: raw.distanceKm || (raw.distanceAU ? raw.distanceAU * 149597870.7 : null),
    rightAscension: eq.rightAscension,
    declination: eq.declination,
    speedDegPerDay: motion.speedDegPerDay,
    isRetrograde: motion.isRetrograde,
    motionStatus: motion.motionStatus,
    quality: 'CALCULATED_VSOP87_MEEUS'
  };
}

/**
 * Calculates complete planetary positions for all supported bodies.
 * 
 * @param {number} jdTT Julian Date in Terrestrial Time
 * @param {object} [options={}]
 * @returns {Record<string, object>} Map of bodyKey -> position record
 */
export function calculateAllPlanetaryPositions(jdTT, options = {}) {
  const result = {};
  for (const body of SUPPORTED_BODIES) {
    result[body] = calculateBodyPosition(body, jdTT, options);
  }
  return result;
}
