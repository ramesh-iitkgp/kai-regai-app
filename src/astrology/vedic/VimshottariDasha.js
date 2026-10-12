/**
 * VimshottariDasha — 120-Year Planetary Period Calculation
 * 
 * Sources:
 * - Brihat Parashara Hora Shastra (BPHS), Chapters 46–48
 * - Standard Vimshottari 120-year sequence based on birth Moon Nakshatra
 */

import { calculateNakshatra } from '../nakshatra/NakshatraCalculator.js';
import { NAKSHATRA_SPAN_DEG } from '../nakshatra/NakshatraData.js';

export const DASHA_ORDER = [
  { ruler: 'ketu', years: 7, name: 'Ketu Mahadasha' },
  { ruler: 'venus', years: 20, name: 'Shukra (Venus) Mahadasha' },
  { ruler: 'sun', years: 6, name: 'Surya (Sun) Mahadasha' },
  { ruler: 'moon', years: 10, name: 'Chandra (Moon) Mahadasha' },
  { ruler: 'mars', years: 7, name: 'Mangala (Mars) Mahadasha' },
  { ruler: 'rahu', years: 18, name: 'Rahu Mahadasha' },
  { ruler: 'jupiter', years: 16, name: 'Guru (Jupiter) Mahadasha' },
  { ruler: 'saturn', years: 19, name: 'Shani (Saturn) Mahadasha' },
  { ruler: 'mercury', years: 17, name: 'Budha (Mercury) Mahadasha' }
];

export const TOTAL_VIMSHOTTARI_YEARS = 120;

/**
 * Calculates Vimshottari Mahadasha balance at birth and dasha timeline.
 * 
 * @param {number} siderealMoonLong Sidereal longitude of the Moon in degrees [0, 360)
 * @param {string|Date} birthDate ISO date or Date object
 * @returns {object} Dasha balance and timeline
 */
export function calculateVimshottariDasha(siderealMoonLong, birthDate) {
  const nak = calculateNakshatra(siderealMoonLong);
  const birthRuler = nak.ruler;

  const bDate = new Date(birthDate);
  const birthYear = bDate.getUTCFullYear();
  const birthMonth = bDate.getUTCMonth();
  const birthDay = bDate.getUTCDate();

  // Find index in 9-dasha sequence
  const startIdx = DASHA_ORDER.findIndex(d => d.ruler === birthRuler);
  const initialDasha = DASHA_ORDER[startIdx] || DASHA_ORDER[0];

  // Fraction of nakshatra remaining to be traversed by Moon
  const elapsedDeg = nak.degreeInNakshatra;
  const remainingDeg = NAKSHATRA_SPAN_DEG - elapsedDeg;
  const balanceFraction = remainingDeg / NAKSHATRA_SPAN_DEG;

  // Balance of initial Mahadasha in years, months, days
  const balanceTotalYears = initialDasha.years * balanceFraction;
  const balanceYears = Math.floor(balanceTotalYears);
  const remMonthsTotal = (balanceTotalYears - balanceYears) * 12.0;
  const balanceMonths = Math.floor(remMonthsTotal);
  const balanceDays = Math.floor((remMonthsTotal - balanceMonths) * 30.0);

  // Generate timeline of major Mahadashas covering 120 years
  const periods = [];
  let currentStart = new Date(Date.UTC(birthYear, birthMonth, birthDay));

  for (let i = 0; i < 9; i++) {
    const dashaIdx = (startIdx + i) % 9;
    const dashaInfo = DASHA_ORDER[dashaIdx];

    const durationYears = i === 0 ? balanceTotalYears : dashaInfo.years;
    const durationDays = Math.round(durationYears * 365.25);

    const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

    periods.push({
      order: i + 1,
      ruler: dashaInfo.ruler,
      name: dashaInfo.name,
      totalYears: dashaInfo.years,
      durationYears: Math.round(durationYears * 100) / 100,
      startDate: currentStart.toISOString().split('T')[0],
      endDate: currentEnd.toISOString().split('T')[0]
    });

    currentStart = currentEnd;
  }

  return {
    birthMoonNakshatra: nak.nakshatraName,
    birthMoonPada: nak.pada,
    birthMoonRuler: birthRuler,
    balanceAtBirth: {
      ruler: birthRuler,
      totalYears: balanceYears,
      months: balanceMonths,
      days: balanceDays,
      formatted: `${initialDasha.name}: ${balanceYears}y ${balanceMonths}m ${balanceDays}d remaining`
    },
    periods
  };
}
