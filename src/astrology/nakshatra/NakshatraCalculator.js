/**
 * NakshatraCalculator — Nakshatra and Pada Derivation
 * 
 * Derives exact Nakshatra index (0–26), Pada (1–4), degrees within Nakshatra,
 * and boundary conditions from sidereal longitude.
 */

import { normalizeDegrees, degToDms } from '../../astronomy/coordinates/AngleMath.js';
import { NAKSHATRAS, NAKSHATRA_SPAN_DEG, PADA_SPAN_DEG } from './NakshatraData.js';

/**
 * Calculates Nakshatra and Pada for a given sidereal longitude.
 * 
 * @param {number} siderealLongitude Sidereal longitude in degrees [0, 360)
 * @returns {object} Nakshatra placement details
 */
export function calculateNakshatra(siderealLongitude) {
  const norm = normalizeDegrees(siderealLongitude);

  // Exact division by 13° 20' (13.3333333°)
  const rawIdx = Math.floor(norm / NAKSHATRA_SPAN_DEG);
  const nakshatraIndex = Math.min(26, Math.max(0, rawIdx));
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Degrees elapsed within this nakshatra [0, 13.3333°)
  const degreeInNakshatra = norm - (nakshatraIndex * NAKSHATRA_SPAN_DEG);

  // Pada (1, 2, 3, or 4) spanning 3° 20' each
  const rawPada = Math.floor(degreeInNakshatra / PADA_SPAN_DEG) + 1;
  const pada = Math.min(4, Math.max(1, rawPada));

  // Degrees elapsed within the current pada [0, 3.3333°)
  const degreeInPada = degreeInNakshatra - ((pada - 1) * PADA_SPAN_DEG);

  const dmsNak = degToDms(degreeInNakshatra);

  return {
    nakshatraIndex,
    nakshatraName: nakshatra.name,
    pada,
    ruler: nakshatra.ruler,
    deity: nakshatra.deity,
    symbol: nakshatra.symbol,
    yoni: nakshatra.yoni,
    degreeInNakshatra,
    degreeInPada,
    degreesFormatted: `${dmsNak.degrees}° ${String(dmsNak.minutes).padStart(2, '0')}' ${dmsNak.seconds.toFixed(1)}"`,
    formatted: `${nakshatra.name} Pada ${pada} (${dmsNak.degrees}° ${String(dmsNak.minutes).padStart(2, '0')}')`
  };
}
