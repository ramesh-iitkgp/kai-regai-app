/**
 * Western Classical Rules — Head Line
 * Authority: William G. Benham (1900), Cheiro (1916)
 * Epistemic Tier: 2 (Western Classical)
 */

export const westernHeadLineRules = [
  {
    ruleId: 'WST_HEAD_GENTLE_SLOPE_01',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'HEAD_LINE',
    name: 'Gentle Sloping Head Line to Mount of Moon',
    author: 'William G. Benham',
    citation: 'The Laws of Scientific Hand Reading, pp. 230-234',
    conditions: {
      all_of: [
        { feature: 'lines.head_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.head_line.slope', operator: 'IN', value: ['GENTLE_SLOPE', 'GENTLE_SLOPE_TO_LUNA', 'SLIGHT_CURVE_TO_MOON', 'STEEP_DESCENT'] }
      ]
    },
    interpretation: {
      title: 'Imaginative & Pragmatic Synthesis',
      archetype: 'The Creative Strategist',
      summary: 'Classical Western treatises associate a gentle slope toward the Lunar quadrant with creative intellect harmonizing logic and intuition.',
      detail: 'Benham notes that this descent prevents intellectual rigidity, enabling lateral ideation, artistic sensitivity, and adaptable problem-solving.',
      synthesis: 'You excel at bridging structured reasoning with conceptual, lateral vision.'
    },
    confidence: 0.92
  },
  {
    ruleId: 'WST_HEAD_STRAIGHT_TRANSVERSE_02',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'HEAD_LINE',
    name: 'Straight Transverse Head Line',
    author: 'Cheiro',
    citation: 'Palmistry for All, Chapter V',
    conditions: {
      all_of: [
        { feature: 'lines.head_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.head_line.slope', operator: 'IN', value: ['STRAIGHT', 'DIRECT_TRANSVERSE', 'HORIZONTAL'] }
      ]
    },
    interpretation: {
      title: 'Analytical & Linear Scrutiny',
      archetype: 'The Empirical Analyst',
      summary: 'A direct transverse trajectory running across the mid-palmar plane indicates empirical focus and pragmatic scrutiny.',
      detail: 'Cheiro associates this formation with practical common sense, adherence to verifiable facts, and resistance to wishful thinking.',
      synthesis: 'You bring disciplined focus and empirical clarity to complex, ambiguous challenges.'
    },
    confidence: 0.90
  }
];
