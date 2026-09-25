/**
 * Western Classical Rules — Life Line
 * Authority: William G. Benham (1900), Cheiro (1916)
 * Epistemic Tier: 2 (Western Classical)
 */

export const westernLifeLineRules = [
  {
    ruleId: 'WST_LIFE_WIDE_SWEEP_01',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'LIFE_LINE',
    name: 'Wide Sweeping Life Arc',
    author: 'William G. Benham',
    citation: 'The Laws of Scientific Hand Reading, pp. 195-201',
    conditions: {
      all_of: [
        { feature: 'lines.life_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.life_line.curvature', operator: 'IN', value: ['WIDE_ARC', 'EXPANSIVE'] }
      ]
    },
    interpretation: {
      title: 'Expansive Physical Arc',
      archetype: 'The Resilient Host',
      summary: 'Classical Western tradition correlates a wide arc embracing the Mount of Venus with generous vitality and bodily stamina.',
      detail: 'Benham notes that when the crease sweeps broadly into the lower palm rather than hugging the thumb, the individual typically possesses strong recuperative faculties and an outgoing, hospitable nature.',
      synthesis: 'Your biological reserves thrive on expansive engagement and consistent physical movement.'
    },
    confidence: 0.90
  },
  {
    ruleId: 'WST_LIFE_CLOSE_THUMB_02',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'LIFE_LINE',
    name: 'Life Line Encircling Closely to Thumb',
    author: 'Cheiro',
    citation: 'Palmistry for All, Chapter IV',
    conditions: {
      all_of: [
        { feature: 'lines.life_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.life_line.curvature', operator: 'IN', value: ['CLOSE_TO_THUMB', 'NARROW_ARC', 'RESTRICTED'] }
      ]
    },
    interpretation: {
      title: 'Conserved Vital Cadence',
      archetype: 'The Prudent Conserver',
      summary: 'Western palmistry observes that an arc held tightly against the thenar eminence indicates energy conservation.',
      detail: 'Cheiro correlates narrower contours with cautious pacing, a need for deliberate solitude, and selective expenditure of personal vitality.',
      synthesis: 'You conserve energy prudently, avoiding unnecessary depletion by honoring personal boundaries.'
    },
    confidence: 0.85
  },
  {
    ruleId: 'WST_LIFE_PARTIAL_OR_UNOBSERVED_03',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'LIFE_LINE',
    name: 'Life Line Faint or Partially Observed',
    author: 'William G. Benham',
    citation: 'The Laws of Scientific Hand Reading, pp. 210-212',
    conditions: {
      all_of: [
        { feature: 'lines.life_line.status', operator: 'IN', value: ['PARTIAL', 'NOT_DETECTED', 'UNCERTAIN', 'OUT_OF_FRAME'] }
      ]
    },
    interpretation: {
      title: 'Subtle or Unobserved Crease Contour',
      archetype: 'The Adaptable Cadence',
      summary: 'Faint or unobserved furrow traces indicate delicate surface contrast under the present observation.',
      detail: 'Traditional literature emphasizes that line depth reflects current neurological and muscular skin tension rather than a fixed life prognosis.',
      synthesis: 'Your vitality responds dynamically to lifestyle rhythms, rest, and environmental nourishment.'
    },
    confidence: 0.70
  }
];
