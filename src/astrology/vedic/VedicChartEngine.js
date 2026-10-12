/**
 * VedicChartEngine — Classical Vedic (Jyotish) Birth Chart Calculation Engine
 * 
 * Sources:
 * - Brihat Parashara Hora Shastra (BPHS)
 * - Lahiri / Chitrapaksha Sidereal Zodiac
 * - Parashara Whole-Sign Bhava System
 */

import { normalizeBirthTime } from '../../astronomy/time/TimezoneConverter.js';
import { calculateAllPlanetaryPositions } from '../../astronomy/planetaryPositions/PlanetaryCalculator.js';
import { calculateAscendantAndAngles } from '../../astronomy/ascendant/AscendantCalculator.js';
import { calculateWholeSignHouses, calculateEqualHouses, determineHouseForLongitude } from '../../astronomy/houses/HouseSystems.js';
import { calculateAyanamsa, tropicalToSidereal } from './Ayanamsa.js';
import { getSignPlacement } from '../common/ZodiacSigns.js';
import { getPlanetaryDignity } from '../common/Dignities.js';
import { calculateNakshatra } from '../nakshatra/NakshatraCalculator.js';
import { calculateVimshottariDasha } from './VimshottariDasha.js';

/**
 * Builds a complete Vedic birth chart from normalized birth coordinates.
 * 
 * @param {object} birthParams
 * @param {string|number} birthParams.year
 * @param {string|number} birthParams.month
 * @param {string|number} birthParams.day
 * @param {string|number} [birthParams.hour=12]
 * @param {string|number} [birthParams.minute=0]
 * @param {string|number} [birthParams.second=0]
 * @param {string|number} [birthParams.timezone='UTC']
 * @param {number} [birthParams.latitude=0]
 * @param {number} [birthParams.longitude=0]
 * @param {string} [birthParams.ayanamsa='LAHIRI_CHITRAPAKSHA']
 * @param {string} [birthParams.houseSystem='WHOLE_SIGN']
 * @param {boolean} [birthParams.isTimeUnknown=false]
 * @returns {object} Vedic Birth Chart object
 */
export function calculateVedicChart(birthParams) {
  // 1. Time & Epoch Normalization
  const timeInfo = normalizeBirthTime(birthParams);
  const { jdUT, jdTT } = timeInfo;
  const isTimeUnknown = Boolean(birthParams.isTimeUnknown || timeInfo.isTimeUnknown || timeInfo.rawInput?.isTimeUnknown);
  const latitude = parseFloat(birthParams.latitude || 0);
  const longitude = parseFloat(birthParams.longitude || 0);

  // 2. Ayanamsa Calculation
  const ayanamsaSystem = birthParams.ayanamsa || 'LAHIRI_CHITRAPAKSHA';
  const ayanamsaDeg = calculateAyanamsa(jdTT, ayanamsaSystem);

  // 3. Astronomical Tropical Planetary Positions
  const tropicalBodies = calculateAllPlanetaryPositions(jdTT, { nodeConvention: 'MEAN' });

  // 4. Sidereal Conversion & Placement for all Celestial Bodies
  const siderealPlanets = {};
  for (const [key, body] of Object.entries(tropicalBodies)) {
    const siderealLong = tropicalToSidereal(body.apparentLongitude, ayanamsaDeg);
    const signInfo = getSignPlacement(siderealLong, 'VEDIC');
    const nakshatraInfo = calculateNakshatra(siderealLong);
    const dignity = getPlanetaryDignity(key, signInfo.signIndex, signInfo.degreeInSign);

    siderealPlanets[key] = {
      ...body,
      tropicalLongitude: body.apparentLongitude,
      siderealLongitude: siderealLong,
      signIndex: signInfo.signIndex,
      signName: signInfo.signName,
      symbol: signInfo.symbol,
      degreeInSign: signInfo.degreeInSign,
      degreesFormatted: signInfo.formatted,
      nakshatra: nakshatraInfo,
      dignity,
      house: null // Will be populated once houses are calculated
    };
  }

  // 5. Ascendant (Lagna) & Houses (only if birth time is known)
  let ascendantData = null;
  let houses = [];
  const warnings = [];

  if (!isTimeUnknown && (latitude !== 0 || longitude !== 0)) {
    const angles = calculateAscendantAndAngles(jdUT, latitude, longitude);
    const siderealAsc = tropicalToSidereal(angles.ascendant, ayanamsaDeg);
    const siderealMC = tropicalToSidereal(angles.midheaven, ayanamsaDeg);

    const ascSign = getSignPlacement(siderealAsc, 'VEDIC');
    const ascNakshatra = calculateNakshatra(siderealAsc);

    ascendantData = {
      tropicalLongitude: angles.ascendant,
      siderealLongitude: siderealAsc,
      signIndex: ascSign.signIndex,
      signName: ascSign.signName,
      symbol: ascSign.symbol,
      degreeInSign: ascSign.degreeInSign,
      degreesFormatted: ascSign.formatted,
      nakshatra: ascNakshatra,
      midheavenSidereal: siderealMC,
      isCircumpolar: angles.isCircumpolar
    };

    if (angles.isCircumpolar) {
      warnings.push('Birth location is within polar circumpolar circle; ascendant calculation uses polar approximations.');
    }

    // Vedic House Calculation
    const selectedHouseSys = birthParams.houseSystem || 'WHOLE_SIGN';
    if (selectedHouseSys === 'EQUAL_HOUSE') {
      houses = calculateEqualHouses(siderealAsc);
    } else {
      houses = calculateWholeSignHouses(siderealAsc);
    }

    // Attach sign info to house cusps
    houses = houses.map(h => ({
      ...h,
      sign: getSignPlacement(h.cuspLongitude, 'VEDIC')
    }));

    // Allocate planets to houses
    for (const key of Object.keys(siderealPlanets)) {
      siderealPlanets[key].house = determineHouseForLongitude(siderealPlanets[key].siderealLongitude, houses);
    }
  } else {
    warnings.push('Birth time or coordinates missing/unknown. Ascendant and house cusps are withheld to preserve truth.');
  }

  // 6. Janma Nakshatra (Moon's Nakshatra) & Vimshottari Dasha
  const moonSidereal = siderealPlanets.moon.siderealLongitude;
  const birthDateStr = `${timeInfo.utcComponents.year}-${String(timeInfo.utcComponents.month).padStart(2, '0')}-${String(timeInfo.utcComponents.day).padStart(2, '0')}`;
  const dashaInfo = calculateVimshottariDasha(moonSidereal, birthDateStr);

  return {
    system: 'VEDIC',
    ayanamsa: {
      system: ayanamsaSystem,
      valueDeg: ayanamsaDeg,
      formatted: `${Math.floor(ayanamsaDeg)}° ${Math.round((ayanamsaDeg % 1) * 60)}'`
    },
    timeInfo,
    coordinates: { latitude, longitude },
    ascendant: ascendantData,
    houses,
    planets: siderealPlanets,
    dasha: dashaInfo,
    janmaRashi: siderealPlanets.moon.signName,
    janmaNakshatra: dashaInfo.birthMoonNakshatra,
    janmaPada: dashaInfo.birthMoonPada,
    warnings,
    unsupportedFeatures: isTimeUnknown ? ['ASCENDANT', 'HOUSES', 'BHAVA_CHALITA'] : []
  };
}

export const VedicChartEngine = {
  calculate: calculateVedicChart
};
