/**
 * PlanetaryMotion — Longitudinal Speed & Retrograde Calculation
 * 
 * Computes instantaneous longitudinal motion rates (degrees per day)
 * and determines Direct / Retrograde / Stationary status.
 */

import { normalizeDegrees } from '../coordinates/AngleMath.js';

/**
 * Calculates longitudinal motion rate and retrograde status using numerical differentiation.
 * 
 * @param {Function} positionFn Function (jdTT) => number (ecliptic longitude in degrees)
 * @param {number} jdTT 
 * @param {number} [stepDays=0.05] Numerical step size in days (1.2 hours)
 * @returns {{ speedDegPerDay: number, isRetrograde: boolean, motionStatus: 'DIRECT'|'RETROGRADE'|'STATIONARY' }}
 */
export function calculateLongitudinalMotion(positionFn, jdTT, stepDays = 0.05) {
  const l1 = positionFn(jdTT - stepDays);
  const l2 = positionFn(jdTT + stepDays);

  // Angular difference accounting for 360/0 wraparound
  let diff = l2 - l1;
  if (diff > 180.0) {
    diff -= 360.0;
  } else if (diff < -180.0) {
    diff += 360.0;
  }

  const speedDegPerDay = diff / (2.0 * stepDays);
  const isRetrograde = speedDegPerDay < 0.0;

  let motionStatus = 'DIRECT';
  if (Math.abs(speedDegPerDay) < 0.005) {
    motionStatus = 'STATIONARY';
  } else if (isRetrograde) {
    motionStatus = 'RETROGRADE';
  }

  return {
    speedDegPerDay,
    isRetrograde,
    motionStatus
  };
}
