/**
 * Dignities — Classical Planetary Dignities (Vedic & Western)
 * 
 * Sources:
 * - Brihat Parashara Hora Shastra (BPHS), Ch. 3
 * - Ptolemy, "Tetrabiblos", Book I
 */

export const PLANETARY_DIGNITIES = {
  sun: {
    ownSigns: [4], // Leo / Simha
    exaltationSign: 0, // Aries / Mesha
    exaltationDegree: 10,
    debilitationSign: 6, // Libra / Tula
    debilitationDegree: 10
  },
  moon: {
    ownSigns: [3], // Cancer / Karka
    exaltationSign: 1, // Taurus / Vrishabha
    exaltationDegree: 3,
    debilitationSign: 7, // Scorpio / Vrishchika
    debilitationDegree: 3
  },
  mars: {
    ownSigns: [0, 7], // Aries / Mesha, Scorpio / Vrishchika
    exaltationSign: 9, // Capricorn / Makara
    exaltationDegree: 28,
    debilitationSign: 3, // Cancer / Karka
    debilitationDegree: 28
  },
  mercury: {
    ownSigns: [2, 5], // Gemini / Mithuna, Virgo / Kanya
    exaltationSign: 5, // Virgo / Kanya
    exaltationDegree: 15,
    debilitationSign: 11, // Pisces / Meena
    debilitationDegree: 15
  },
  jupiter: {
    ownSigns: [8, 11], // Sagittarius / Dhanu, Pisces / Meena
    exaltationSign: 3, // Cancer / Karka
    exaltationDegree: 5,
    debilitationSign: 9, // Capricorn / Makara
    debilitationDegree: 5
  },
  venus: {
    ownSigns: [1, 6], // Taurus / Vrishabha, Libra / Tula
    exaltationSign: 11, // Pisces / Meena
    exaltationDegree: 27,
    debilitationSign: 5, // Virgo / Kanya
    debilitationDegree: 27
  },
  saturn: {
    ownSigns: [9, 10], // Capricorn / Makara, Aquarius / Kumbha
    exaltationSign: 6, // Libra / Tula
    exaltationDegree: 20,
    debilitationSign: 0, // Aries / Mesha
    debilitationDegree: 20
  },
  rahu: {
    ownSigns: [10], // Aquarius (trad.)
    exaltationSign: 1, // Taurus
    exaltationDegree: 20,
    debilitationSign: 7, // Scorpio
    debilitationDegree: 20
  },
  ketu: {
    ownSigns: [7], // Scorpio (trad.)
    exaltationSign: 7, // Scorpio
    exaltationDegree: 20,
    debilitationSign: 1, // Taurus
    debilitationDegree: 20
  }
};

/**
 * Determines dignity status of a planet in a sign.
 * 
 * @param {string} planetKey 'sun'|'moon'|'mars'|'mercury'|'jupiter'|'venus'|'saturn'|'rahu'|'ketu'
 * @param {number} signIndex 0 to 11
 * @param {number} degreeInSign 0 to 30
 * @returns {'EXALTED'|'DEBILITATED'|'OWN_SIGN'|'NEUTRAL'} Dignity flag
 */
export function getPlanetaryDignity(planetKey, signIndex, degreeInSign = 15) {
  const d = PLANETARY_DIGNITIES[planetKey.toLowerCase()];
  if (!d) return 'NEUTRAL';

  if (signIndex === d.exaltationSign) {
    return 'EXALTED';
  }
  if (signIndex === d.debilitationSign) {
    return 'DEBILITATED';
  }
  if (d.ownSigns.includes(signIndex)) {
    return 'OWN_SIGN';
  }
  return 'NEUTRAL';
}
