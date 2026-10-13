/**
 * GocharaRules — configuration for the daily transit (Gochara) indicator.
 *
 * Gochara = how the planets moving through the sky *today* sit relative to the
 * user's Janma Rashi (natal Moon sign). Each planet is traditionally considered
 * favourable when it transits certain houses counted from the Moon sign.
 *
 * Two layers, kept apart on purpose so nobody mistakes one for the other:
 *
 *  1. FAVOURABLE_HOUSES_FROM_MOON — a TRADITIONAL table (Brihat Parashara Hora
 *     Shastra / Phaladeepika gochara chapters, as commonly published).
 *     STATUS: needs verification against the project's P1 source registry
 *     before launch. Do not edit silently (AGENTS.md rule 3).
 *
 *  2. SCORE_MODEL — a PRODUCT heuristic written for Kai RegAI. It is NOT
 *     classical doctrine: it maps the traditional planetary significations
 *     (Venus = relationships, Mars = drive, Jupiter = fortune, Mercury =
 *     intellect, Sun = vitality, Moon = mind) onto four daily gauges and
 *     weights them. It is a coarse "how supportive is today's sky" indicator,
 *     not a prediction.
 *
 * See docs/FORECAST_METHOD.md for the full method and its limits.
 */

export const GOCHARA_SOURCE = Object.freeze({
  tradition: 'Vedic (Parashari) Gochara',
  basis: 'Houses counted from natal Moon sign (Janma Rashi), whole-sign, sidereal Lahiri',
  status: 'NEEDS_VERIFICATION_AGAINST_P1_SOURCE_REGISTRY'
});

/** House numbers (1-12, counted from the Janma Rashi) in which each planet is traditionally favourable. */
export const FAVOURABLE_HOUSES_FROM_MOON = Object.freeze({
  sun: Object.freeze([3, 6, 10, 11]),
  moon: Object.freeze([1, 3, 6, 7, 10, 11]),
  mars: Object.freeze([3, 6, 11]),
  mercury: Object.freeze([2, 4, 6, 8, 10, 11]),
  jupiter: Object.freeze([2, 5, 7, 9, 11]),
  venus: Object.freeze([1, 2, 3, 4, 5, 8, 9, 11, 12]),
  saturn: Object.freeze([3, 6, 11])
});

/** Planets whose transit position is computed for the forecast. */
export const GOCHARA_PLANETS = Object.freeze(Object.keys(FAVOURABLE_HOUSES_FROM_MOON));

/**
 * Product heuristic: which planets feed each gauge, and how strongly.
 * Weights in each gauge sum to 1. The Moon appears in every gauge because it
 * is the only fast mover, so it is what makes the scores change from day to day.
 */
export const SCORE_MODEL = Object.freeze({
  floor: 40,   // gauge value when no contributing planet is favourable
  ceiling: 95, // gauge value when every contributing planet is favourable
  gauges: Object.freeze({
    love:   Object.freeze({ venus: 0.5, moon: 0.5 }),
    energy: Object.freeze({ mars: 0.4, sun: 0.3, moon: 0.3 }),
    luck:   Object.freeze({ jupiter: 0.6, moon: 0.4 }),
    mind:   Object.freeze({ mercury: 0.6, moon: 0.4 })
  }),
  bands: Object.freeze({ supportive: 75, balanced: 55 }) // >= supportive, >= balanced, else gentle
});

/**
 * Score one gauge from planet -> house placements.
 *
 * @param {Record<string, number>} housesByPlanet e.g. { moon: 7, venus: 4 }
 * @param {string} gauge 'love' | 'energy' | 'luck' | 'mind'
 * @returns {{ value: number, band: 'supportive'|'balanced'|'gentle', drivers: Array<{planet:string, house:number, favourable:boolean, weight:number}> }}
 */
export function scoreGauge(housesByPlanet, gauge) {
  const weights = SCORE_MODEL.gauges[gauge];
  if (!weights) throw new Error(`Unknown gauge: ${gauge}`);

  let weighted = 0;
  const drivers = [];
  for (const [planet, weight] of Object.entries(weights)) {
    const house = housesByPlanet[planet];
    const favourable = FAVOURABLE_HOUSES_FROM_MOON[planet].includes(house);
    if (favourable) weighted += weight;
    drivers.push({ planet, house, favourable, weight });
  }

  const value = Math.round(SCORE_MODEL.floor + (SCORE_MODEL.ceiling - SCORE_MODEL.floor) * weighted);
  const band = value >= SCORE_MODEL.bands.supportive ? 'supportive'
    : value >= SCORE_MODEL.bands.balanced ? 'balanced'
    : 'gentle';
  return { value, band, drivers };
}
