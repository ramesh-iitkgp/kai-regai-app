/**
 * ZodiacSigns — Common Sign Definitions & Degree Placements
 * 
 * Maps normalized ecliptic longitude [0, 360) into 12 signs of 30° each.
 */

import { normalizeDegrees, degToDms } from '../../astronomy/coordinates/AngleMath.js';

export const ZODIAC_SIGNS = [
  { index: 0, western: 'Aries', vedic: 'Mesha', symbol: '♈', element: 'FIRE', modality: 'CARDINAL', ruler: 'mars' },
  { index: 1, western: 'Taurus', vedic: 'Vrishabha', symbol: '♉', element: 'EARTH', modality: 'FIXED', ruler: 'venus' },
  { index: 2, western: 'Gemini', vedic: 'Mithuna', symbol: '♊', element: 'AIR', modality: 'MUTABLE', ruler: 'mercury' },
  { index: 3, western: 'Cancer', vedic: 'Karka', symbol: '♋', element: 'WATER', modality: 'CARDINAL', ruler: 'moon' },
  { index: 4, western: 'Leo', vedic: 'Simha', symbol: '♌', element: 'FIRE', modality: 'FIXED', ruler: 'sun' },
  { index: 5, western: 'Virgo', vedic: 'Kanya', symbol: '♍', element: 'EARTH', modality: 'MUTABLE', ruler: 'mercury' },
  { index: 6, western: 'Libra', vedic: 'Tula', symbol: '♎', element: 'AIR', modality: 'CARDINAL', ruler: 'venus' },
  { index: 7, western: 'Scorpio', vedic: 'Vrishchika', symbol: '♏', element: 'WATER', modality: 'FIXED', ruler: 'mars' },
  { index: 8, western: 'Sagittarius', vedic: 'Dhanu', symbol: '♐', element: 'FIRE', modality: 'MUTABLE', ruler: 'jupiter' },
  { index: 9, western: 'Capricorn', vedic: 'Makara', symbol: '♑', element: 'EARTH', modality: 'CARDINAL', ruler: 'saturn' },
  { index: 10, western: 'Aquarius', vedic: 'Kumbha', symbol: '♒', element: 'AIR', modality: 'FIXED', ruler: 'saturn' },
  { index: 11, western: 'Pisces', vedic: 'Meena', symbol: '♓', element: 'WATER', modality: 'MUTABLE', ruler: 'jupiter' }
];

/**
 * Derives sign placement, degree within sign, minutes, and seconds from longitude.
 * 
 * @param {number} longitude Ecliptic longitude in degrees [0, 360)
 * @param {'VEDIC'|'WESTERN'} [system='VEDIC']
 * @returns {object} Sign placement details
 */
export function getSignPlacement(longitude, system = 'VEDIC') {
  const norm = normalizeDegrees(longitude);
  const signIndex = Math.floor(norm / 30.0);
  const sign = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];

  const degreeInSign = norm % 30.0;
  const dms = degToDms(degreeInSign);
  const signName = system === 'VEDIC' ? sign.vedic : sign.western;

  return {
    signIndex,
    signName,
    westernName: sign.western,
    vedicName: sign.vedic,
    symbol: sign.symbol,
    element: sign.element,
    modality: sign.modality,
    ruler: sign.ruler,
    degreeInSign,
    degrees: dms.degrees,
    minutes: dms.minutes,
    seconds: dms.seconds,
    formatted: `${dms.degrees}° ${String(dms.minutes).padStart(2, '0')}' ${signName}`
  };
}
