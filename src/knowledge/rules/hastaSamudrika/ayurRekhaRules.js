/**
 * Hasta Samudrika Rules — Ayur Rekha (Life Line)
 * Authority: Bhavishya Purana, Dr. Narayan Dutt Shrimali (1980)
 * Epistemic Tier: 3 (Hasta Samudrika)
 */

export const samudrikaAyurRekhaRules = [
  {
    ruleId: 'HS_AYUR_GENEROUS_ARC_01',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'LIFE_LINE',
    name: 'Shukra Valaya Samyukta Ayur Rekha',
    sanskritName: 'आयुर् रेखा (शुक्र मण्डल परिधि)',
    author: 'Dr. N.D. Shrimali',
    citation: 'Practical Palmistry, Chapter 3: Ayur Rekha',
    conditions: {
      all_of: [
        { feature: 'lines.life_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.life_line.curvature', operator: 'IN', value: ['WIDE_ARC', 'EXPANSIVE'] }
      ]
    },
    interpretation: {
      title: 'Prana Shakti & Grounded Vital Reserve',
      archetype: 'Dharani Vahana (Earth-Supported Vitality)',
      summary: 'Hasta Samudrika treatises view Ayur Rekha as constitutional vitality rather than a deterministic lifespan clock.',
      detail: 'Shrimali notes that an expansive arc unencumbered by transverse cuts denotes robust Agni (digestive fire), deep resilience, and steady physical stamina.',
      synthesis: 'Your biological vessel sustains best through steady, rhythmic continuity rather than abrupt bursts.'
    },
    confidence: 0.94
  },
  {
    ruleId: 'HS_AYUR_NARROW_THENAR_02',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'LIFE_LINE',
    name: 'Sankshipta Ayur Rekha',
    sanskritName: 'संक्षिप्त आयुर् रेखा',
    author: 'Bhavishya Purana',
    citation: 'Brahma Parva, Samudrika Khanda',
    conditions: {
      all_of: [
        { feature: 'lines.life_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.life_line.curvature', operator: 'IN', value: ['CLOSE_TO_THUMB', 'NARROW_ARC', 'RESTRICTED'] }
      ]
    },
    interpretation: {
      title: 'Mitahara & Conserved Prana',
      archetype: 'Mitaprana (Prudent Vitality)',
      summary: 'A narrower contour circling close to the thumb base signifies mindful conservation of bodily reserves.',
      detail: 'Classical Sanskrit texts advise individuals with this contour to maintain balanced diet (mitahara), rhythmic rest, and deliberate pacing.',
      synthesis: 'Mindful physical pacing and deliberate daily quietude recharge your energetic baseline.'
    },
    confidence: 0.88
  }
];
