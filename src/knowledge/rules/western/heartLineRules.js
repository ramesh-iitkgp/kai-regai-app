/**
 * Western Classical Rules — Heart Line
 * Authority: William G. Benham (1900), Cheiro (1916)
 * Epistemic Tier: 2 (Western Classical)
 */

export const westernHeartLineRules = [
  {
    ruleId: 'WST_HEART_JUPITER_CURVE_01',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'HEART_LINE',
    name: 'Heart Line Curving into Mount of Jupiter',
    author: 'William G. Benham',
    citation: 'The Laws of Scientific Hand Reading, pp. 265-270',
    conditions: {
      all_of: [
        { feature: 'lines.heart_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.heart_line.curvature', operator: 'IN', value: ['CURVED_TO_JUPITER', 'UPWARD_TO_INDEX', 'BETWEEN_FINGERS'] }
      ]
    },
    interpretation: {
      title: 'Ethical Idealism in Relational Affinity',
      archetype: 'The Loyal Devotee',
      summary: 'Classical chiromancy associates curvature toward the index finger with relational honor and ethical loyalty.',
      detail: 'Benham documents this as the hallmark of an elevated emotional nature that values character, mutual respect, and reciprocal integrity above superficial connection.',
      synthesis: 'Your emotional orientation values substantive mutual elevation and steadfast trust.'
    },
    confidence: 0.91
  },
  {
    ruleId: 'WST_HEART_SATURN_TERMINATION_02',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'HEART_LINE',
    name: 'Heart Line Ending Beneath Mount of Saturn',
    author: 'Cheiro',
    citation: 'Palmistry for All, Chapter VI',
    conditions: {
      all_of: [
        { feature: 'lines.heart_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.heart_line.curvature', operator: 'IN', value: ['STRAIGHT_ACROSS', 'TERMINATING_ON_SATURN', 'RESTRICTED_CURVE'] }
      ]
    },
    interpretation: {
      title: 'Pragmatic Emotional Boundaries',
      archetype: 'The Constant Guardian',
      summary: 'Western treatises interpret a transverse line ending beneath the middle digit as pragmatic emotional reserve.',
      detail: 'Cheiro notes that such individuals prioritize reliability, quiet constancy, and demonstrated loyalty over theatrical sentiment.',
      synthesis: 'You express care through dependable actions and protect your inner circle with deliberate discernment.'
    },
    confidence: 0.88
  }
];
