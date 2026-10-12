/**
 * AspectCalculator — Western Major Angular Aspects Calculator
 * 
 * Supports:
 * - Conjunction (0°)
 * - Sextile (60°)
 * - Square (90°)
 * - Trine (120°)
 * - Opposition (180°)
 * 
 * Includes:
 * - Shortest angular distance
 * - Configurable orb thresholds per aspect and luminary status
 * - Applying vs Separating status derived from relative speeds
 */

import { angularDifference, normalizeDegrees } from '../../astronomy/coordinates/AngleMath.js';

export const MAJOR_ASPECTS = [
  { key: 'CONJUNCTION', name: 'Conjunction', angle: 0, defaultOrb: 8, luminaryOrb: 10, nature: 'HARMONIOUS_NEUTRAL' },
  { key: 'SEXTILE', name: 'Sextile', angle: 60, defaultOrb: 6, luminaryOrb: 7, nature: 'HARMONIOUS' },
  { key: 'SQUARE', name: 'Square', angle: 90, defaultOrb: 7, luminaryOrb: 8, nature: 'DYNAMIC' },
  { key: 'TRINE', name: 'Trine', angle: 120, defaultOrb: 8, luminaryOrb: 9, nature: 'HARMONIOUS' },
  { key: 'OPPOSITION', name: 'Opposition', angle: 180, defaultOrb: 8, luminaryOrb: 9, nature: 'POLARIZING' }
];

/**
 * Calculates the shortest angular distance between two ecliptic longitudes on a circle.
 * 
 * @param {number} lon1 Degrees [0, 360)
 * @param {number} lon2 Degrees [0, 360)
 * @returns {number} Shortest distance [0, 180]
 */
export function getAngularSeparation(lon1, lon2) {
  const diff = Math.abs(normalizeDegrees(lon1) - normalizeDegrees(lon2));
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Determines whether an aspect is applying (closing in) or separating (moving apart).
 * 
 * @param {number} lon1 Longitude of body 1
 * @param {number} speed1 Speed in deg/day of body 1
 * @param {number} lon2 Longitude of body 2
 * @param {number} speed2 Speed in deg/day of body 2
 * @param {number} targetAngle Target aspect angle in degrees
 * @returns {'APPLYING'|'SEPARATING'|'EXACT'}
 */
export function determineAspectDirection(lon1, speed1, lon2, speed2, targetAngle) {
  const currentSep = getAngularSeparation(lon1, lon2);
  const currentDeviation = Math.abs(currentSep - targetAngle);

  if (currentDeviation < 0.001) {
    return 'EXACT';
  }

  // Project separation by a fraction of a day (+0.1 day)
  const dt = 0.1;
  const futureLon1 = lon1 + speed1 * dt;
  const futureLon2 = lon2 + speed2 * dt;
  const futureSep = getAngularSeparation(futureLon1, futureLon2);
  const futureDeviation = Math.abs(futureSep - targetAngle);

  return futureDeviation < currentDeviation ? 'APPLYING' : 'SEPARATING';
}

/**
 * Finds all major aspects between an array of celestial bodies.
 * 
 * @param {Array<{key: string, name: string, longitude: number, speedDegPerDay?: number}>} bodies
 * @param {object} [customOrbs] Optional map of aspect key to custom orb limit
 * @returns {Array<object>} List of detected aspects
 */
export function calculateAspects(bodies, customOrbs = {}) {
  const aspectsFound = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];

      // Skip nodes or non-physical points in aspects if desired
      if (!b1 || !b2 || typeof b1.longitude !== 'number' || typeof b2.longitude !== 'number') {
        continue;
      }

      const isLuminary = b1.key === 'sun' || b1.key === 'moon' || b2.key === 'sun' || b2.key === 'moon';
      const actualSeparation = getAngularSeparation(b1.longitude, b2.longitude);

      for (const aspectDef of MAJOR_ASPECTS) {
        const maxOrb = customOrbs[aspectDef.key] ?? (isLuminary ? aspectDef.luminaryOrb : aspectDef.defaultOrb);
        const orbDeviation = Math.abs(actualSeparation - aspectDef.angle);

        if (orbDeviation <= maxOrb) {
          const speed1 = b1.speedDegPerDay ?? 1;
          const speed2 = b2.speedDegPerDay ?? 0;
          const direction = determineAspectDirection(b1.longitude, speed1, b2.longitude, speed2, aspectDef.angle);

          aspectsFound.push({
            body1: b1.key,
            body1Name: b1.name,
            body2: b2.key,
            body2Name: b2.name,
            aspect: aspectDef.key,
            aspectName: aspectDef.name,
            targetAngle: aspectDef.angle,
            actualSeparation: Number(actualSeparation.toFixed(4)),
            orbDeviation: Number(orbDeviation.toFixed(4)),
            maxOrb,
            direction,
            nature: aspectDef.nature,
            formatted: `${b1.name} ${aspectDef.name} ${b2.name} (orb ${orbDeviation.toFixed(2)}°, ${direction.toLowerCase()})`
          });
          break; // A pair can only form one major aspect at a time
        }
      }
    }
  }

  // Sort by tightness of orb
  return aspectsFound.sort((a, b) => a.orbDeviation - b.orbDeviation);
}
