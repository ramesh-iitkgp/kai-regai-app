/**
 * WesternChartEngine — Classical and Modern Western Tropical Birth Chart Engine
 * 
 * Supports:
 * - Tropical zodiac placements
 * - Placidus, Whole Sign, and Equal house systems
 * - Angles (ASC, MC, DSC, IC)
 * - Major angular aspects with orb evaluations and applying/separating dynamics
 * - Element and modality synthesis
 * - Chart ruler identification
 */

import { normalizeBirthTime } from '../../astronomy/time/TimezoneConverter.js';
import { calculateAllPlanetaryPositions } from '../../astronomy/planetaryPositions/PlanetaryCalculator.js';
import { calculateAscendantAndAngles } from '../../astronomy/ascendant/AscendantCalculator.js';
import {
  calculateWholeSignHouses,
  calculateEqualHouses,
  calculatePlacidusHouses,
  calculatePorphyryHouses,
  determineHouseForLongitude
} from '../../astronomy/houses/HouseSystems.js';
import { getSignPlacement, ZODIAC_SIGNS } from '../common/ZodiacSigns.js';
import { calculateAspects } from '../aspects/AspectCalculator.js';
import { normalizeDegrees } from '../../astronomy/coordinates/AngleMath.js';

const SIGN_RULERS = {
  Aries: 'mars',
  Taurus: 'venus',
  Gemini: 'mercury',
  Cancer: 'moon',
  Leo: 'sun',
  Virgo: 'mercury',
  Libra: 'venus',
  Scorpio: 'pluto', // modern; classical is mars
  Sagittarius: 'jupiter',
  Capricorn: 'saturn',
  Aquarius: 'uranus', // modern; classical is saturn
  Pisces: 'neptune'   // modern; classical is jupiter
};

/**
 * Calculates element and modality distribution.
 * 
 * @param {Array<object>} planets
 * @returns {object} Elements and modalities breakdown
 */
export function calculateBalances(planets) {
  const elements = { FIRE: 0, EARTH: 0, AIR: 0, WATER: 0 };
  const modalities = { CARDINAL: 0, FIXED: 0, MUTABLE: 0 };

  const majorKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  for (const planet of planets) {
    if (!majorKeys.includes(planet.key)) continue;
    const sign = ZODIAC_SIGNS[planet.signIndex];
    if (sign) {
      if (elements[sign.element] !== undefined) elements[sign.element]++;
      if (modalities[sign.modality] !== undefined) modalities[sign.modality]++;
    }
  }

  return { elements, modalities };
}

/**
 * Calculates a complete Western birth chart.
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
 * @param {string} [birthParams.houseSystem='PLACIDUS'] 'PLACIDUS' | 'WHOLE_SIGN' | 'EQUAL'
 * @param {boolean} [birthParams.isTimeUnknown=false]
 * @param {object} [birthParams.aspectOrbs]
 * @returns {object} Western Birth Chart object
 */
export function calculateWesternChart(birthParams) {
  // 1. Time Normalization
  const timeInfo = normalizeBirthTime(birthParams);
  const { jdUT, jdTT } = timeInfo;
  const isTimeUnknown = Boolean(birthParams.isTimeUnknown || timeInfo.isTimeUnknown || timeInfo.rawInput?.isTimeUnknown);
  const latitude = Number(birthParams.latitude) || 0;
  const longitude = Number(birthParams.longitude) || 0;
  const houseSystemKey = (birthParams.houseSystem || 'PLACIDUS').toUpperCase();

  const warnings = [];

  // 2. Planetary Positions (Tropical)
  const rawPlanets = calculateAllPlanetaryPositions(jdTT, { nodeConvention: 'MEAN' });

  // 3. Ascendant and Angles
  let ascendantData = null;
  let houses = [];

  if (!isTimeUnknown) {
    const angles = calculateAscendantAndAngles(jdUT, latitude, longitude);
    if (angles.isCircumpolar) {
      warnings.push('Location is at a high polar latitude; quadrant house cusps may be unreliable.');
    }

    const ascPlacement = getSignPlacement(angles.ascendant, 'TROPICAL');
    const mcPlacement = getSignPlacement(angles.midheaven, 'TROPICAL');

    ascendantData = {
      longitude: angles.ascendant,
      signIndex: ascPlacement.signIndex,
      signName: ascPlacement.signName,
      symbol: ascPlacement.symbol,
      degreeInSign: ascPlacement.degreeInSign,
      degreesFormatted: ascPlacement.formatted,
      midheaven: {
        longitude: angles.midheaven,
        signIndex: mcPlacement.signIndex,
        signName: mcPlacement.signName,
        symbol: mcPlacement.symbol,
        degreeInSign: mcPlacement.degreeInSign,
        degreesFormatted: mcPlacement.formatted
      },
      descendant: normalizeDegrees(angles.ascendant + 180),
      imumCoeli: normalizeDegrees(angles.midheaven + 180),
      isCircumpolar: angles.isCircumpolar
    };

    // 4. House Cusps
    if (houseSystemKey === 'PLACIDUS') {
      const placidusResult = calculatePlacidusHouses(angles.ascendant, angles.midheaven, latitude, jdUT);
      houses = placidusResult.cusps;
      if (placidusResult.fallbackUsed) {
        warnings.push('Placidus house system was undefined for this polar latitude; fell back to Equal House.');
      }
    } else if (houseSystemKey === 'PORPHYRY') {
      houses = calculatePorphyryHouses(angles.ascendant, angles.midheaven);
    } else if (houseSystemKey === 'EQUAL') {
      houses = calculateEqualHouses(angles.ascendant);
    } else {
      houses = calculateWholeSignHouses(angles.ascendant);
    }
  } else {
    warnings.push('Birth time is unknown; Ascendant and house cusps are omitted.');
  }

  // 5. Structure Tropical Placements
  const tropicalPlanets = {};
  const planetListForAspects = [];

  for (const [key, planet] of Object.entries(rawPlanets)) {
    const tropPlacement = getSignPlacement(planet.apparentLongitude, 'TROPICAL');
    const houseNum = houses.length > 0 ? determineHouseForLongitude(planet.apparentLongitude, houses) : null;

    const enriched = {
      ...planet,
      longitude: planet.apparentLongitude,
      signIndex: tropPlacement.signIndex,
      signName: tropPlacement.signName,
      symbol: tropPlacement.symbol,
      degreeInSign: tropPlacement.degreeInSign,
      degreesFormatted: tropPlacement.formatted,
      house: houseNum
    };

    tropicalPlanets[key] = enriched;
    planetListForAspects.push(enriched);
  }

  // 6. Include Ascendant and MC in aspects if available
  if (ascendantData) {
    planetListForAspects.push({
      key: 'ascendant',
      name: 'Ascendant',
      longitude: ascendantData.longitude,
      speedDegPerDay: 360
    });
    planetListForAspects.push({
      key: 'midheaven',
      name: 'Midheaven',
      longitude: ascendantData.midheaven.longitude,
      speedDegPerDay: 360
    });
  }

  // 7. Aspects
  const aspects = calculateAspects(planetListForAspects, birthParams.aspectOrbs);

  // 8. Element and Modality Balance
  const balances = calculateBalances(Object.values(tropicalPlanets));

  // 9. Chart Ruler
  const chartRuler = ascendantData ? SIGN_RULERS[ascendantData.signName] || 'mars' : null;

  return {
    system: 'WESTERN',
    zodiacType: 'TROPICAL',
    houseSystem: houseSystemKey,
    timeInfo,
    coordinates: { latitude, longitude },
    ascendant: ascendantData,
    chartRuler,
    houses,
    planets: tropicalPlanets,
    aspects,
    balances,
    sunSign: tropicalPlanets.sun ? tropicalPlanets.sun.signName : null,
    moonSign: tropicalPlanets.moon ? tropicalPlanets.moon.signName : null,
    warnings,
    unsupportedFeatures: isTimeUnknown ? ['ASCENDANT', 'MIDHEAVEN', 'HOUSES'] : []
  };
}

export const WesternChartEngine = {
  calculate: calculateWesternChart
};
