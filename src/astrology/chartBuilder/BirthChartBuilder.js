/**
 * BirthChartBuilder — Common Chart Contract and Builder
 * 
 * Provides a unified, immutable, versioned, typed contract for both
 * Vedic and Western birth charts. Ensures calculation snapshot reproducibility.
 */

import { calculateVedicChart } from '../vedic/VedicChartEngine.js';
import { calculateWesternChart } from '../western/WesternChartEngine.js';

export const CURRENT_CALCULATION_VERSION = '1.0.0';

/**
 * Pure JavaScript synchronous SHA-256 implementation (FIPS 180-2).
 * Works identically in Node.js and Browser runtimes with zero external dependencies.
 */
function sha256Hex(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii.length; i++) {
    const j = i >> 2;
    words[j] = (words[j] || 0) | ((ascii.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8));
  }

  const bitLenWord = asciiBitLength >> 5;
  words[bitLenWord] = (words[bitLenWord] || 0) | (0x80 << ((3 - ((ascii.length) % 4)) * 8));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    let [a, b, c, d, e, f, g, h] = hash;

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }

  return result;
}

function generateRandomUUID() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates a stable deterministic hash for a set of birth parameters and settings.
 * 
 * @param {object} inputSnapshot
 * @param {string} system 'VEDIC' | 'WESTERN'
 * @param {string} version
 * @returns {string} SHA-256 hash hex string
 */
export function generateInputHash(inputSnapshot, system, version = CURRENT_CALCULATION_VERSION) {
  const normalized = {
    system,
    version,
    year: inputSnapshot.year,
    month: inputSnapshot.month,
    day: inputSnapshot.day,
    hour: inputSnapshot.hour ?? 12,
    minute: inputSnapshot.minute ?? 0,
    second: inputSnapshot.second ?? 0,
    latitude: Number(inputSnapshot.latitude ?? 0).toFixed(6),
    longitude: Number(inputSnapshot.longitude ?? 0).toFixed(6),
    timezone: inputSnapshot.timezone || 'UTC',
    isTimeUnknown: Boolean(inputSnapshot.isTimeUnknown),
    ayanamsa: inputSnapshot.ayanamsa || 'LAHIRI_CHITRAPAKSHA',
    houseSystem: inputSnapshot.houseSystem || (system === 'VEDIC' ? 'WHOLE_SIGN' : 'PLACIDUS')
  };

  const payload = JSON.stringify(normalized, Object.keys(normalized).sort());
  return sha256Hex(payload);
}

/**
 * Builds a standardized BirthChart object.
 * 
 * @param {object} params
 * @param {'VEDIC'|'WESTERN'} params.system
 * @param {string} [params.profileId=null]
 * @param {object} params.birthParams
 * @returns {object} Canonical BirthChart
 */
export function buildBirthChart({ system = 'VEDIC', profileId = null, birthParams }) {
  const normSystem = system.toUpperCase();
  if (normSystem !== 'VEDIC' && normSystem !== 'WESTERN') {
    throw new Error(`Unsupported astrology system: ${system}. Must be 'VEDIC' or 'WESTERN'.`);
  }

  const inputHash = generateInputHash(birthParams, normSystem, CURRENT_CALCULATION_VERSION);
  const chartId = `chart_${generateRandomUUID()}`;

  let rawChart;
  let settings = {};

  if (normSystem === 'VEDIC') {
    rawChart = calculateVedicChart(birthParams);
    settings = {
      ayanamsa: rawChart.ayanamsa.system,
      ayanamsaDeg: rawChart.ayanamsa.valueDeg,
      ayanamsaFormatted: rawChart.ayanamsa.formatted,
      houseSystem: birthParams.houseSystem || 'WHOLE_SIGN',
      zodiacType: 'SIDEREAL'
    };
  } else {
    rawChart = calculateWesternChart(birthParams);
    settings = {
      houseSystem: rawChart.houseSystem,
      zodiacType: 'TROPICAL'
    };
  }

  // Common planetary list
  const planetList = Object.values(rawChart.planets);

  // Common chart contract
  const birthChart = {
    id: chartId,
    profileId,
    astrologySystem: normSystem,
    inputSnapshot: {
      year: birthParams.year,
      month: birthParams.month,
      day: birthParams.day,
      hour: birthParams.hour ?? 12,
      minute: birthParams.minute ?? 0,
      second: birthParams.second ?? 0,
      timezone: birthParams.timezone || 'UTC',
      latitude: birthParams.latitude ?? 0,
      longitude: birthParams.longitude ?? 0,
      birthPlace: birthParams.birthPlace || '',
      isTimeUnknown: Boolean(birthParams.isTimeUnknown)
    },
    inputHash,
    calculationVersion: CURRENT_CALCULATION_VERSION,
    accuracyEnvelope: {
      sunAndMoon: '±0.003° (sub-12 arcseconds)',
      venus: '±0.035° (sub-2 arcminutes)',
      mercuryAndMars: '±0.01° (J2000) to ±0.38° (historical 1850)',
      outerPlanets: '±0.08° to ±0.80° (J2000), up to ±3.1° (19th century)',
      referenceSource: 'NASA/JPL Horizons & Jean Meeus (2nd Ed)'
    },
    settings,
    timeInfo: rawChart.timeInfo,
    ascendant: rawChart.ascendant,
    houses: rawChart.houses,
    planetaryPositions: {
      map: rawChart.planets,
      list: planetList
    },
    aspects: rawChart.aspects || [],
    nakshatraData: normSystem === 'VEDIC' ? {
      janmaRashi: rawChart.janmaRashi,
      janmaNakshatra: rawChart.janmaNakshatra,
      janmaPada: rawChart.janmaPada,
      planetsNakshatra: planetList.map(p => ({
        planet: p.name,
        key: p.key,
        nakshatra: p.nakshatra
      }))
    } : null,
    dashaData: normSystem === 'VEDIC' ? rawChart.dasha : null,
    westernSynthesis: normSystem === 'WESTERN' ? {
      chartRuler: rawChart.chartRuler,
      sunSign: rawChart.sunSign,
      moonSign: rawChart.moonSign,
      balances: rawChart.balances
    } : null,
    warnings: rawChart.warnings || [],
    unsupportedFeatures: rawChart.unsupportedFeatures || [],
    calculatedAt: new Date().toISOString()
  };

  return birthChart;
}
