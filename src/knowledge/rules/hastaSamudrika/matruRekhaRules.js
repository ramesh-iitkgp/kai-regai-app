/**
 * Hasta Samudrika Rules — Matru Rekha & Pitri/Hridaya Rekha
 * Authority: Pāṇilekhā, Bhavishya Purana, Dr. Narayan Dutt Shrimali (1980)
 * Epistemic Tier: 3 (Hasta Samudrika)
 */

export const samudrikaMatruRekhaRules = [
  {
    ruleId: 'HS_MATRU_CHANDRA_SLOPE_01',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'HEAD_LINE',
    name: 'Matru Rekha Chandra Gamini',
    sanskritName: 'मातृ रेखा (चन्द्र मण्डल गामिनी)',
    author: 'Pāṇilekhā Buddhist Sanskrit Witnesses',
    citation: 'Section III: Manas & Rekha Pramana',
    conditions: {
      all_of: [
        { feature: 'lines.head_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.head_line.slope', operator: 'IN', value: ['GENTLE_SLOPE', 'GENTLE_SLOPE_TO_LUNA', 'SLIGHT_CURVE_TO_MOON', 'STEEP_DESCENT'] }
      ]
    },
    interpretation: {
      title: 'Kavya Buddhi & Imaginative Discernment',
      archetype: 'The Intuitive Sage',
      summary: 'Vedic treatises describe descent toward Chandra (Moon) as the mark of intuitive perception blending buddhi (intellect) with manas (feeling).',
      detail: 'Shrimali notes that an unbroken sloping Matru Rekha gives a fertile imagination, eloquence, and a deep appreciation for the philosophical arts.',
      synthesis: 'Your thought processes seamlessly harmonize deliberate reasoning with imaginative insight.'
    },
    confidence: 0.93
  },
  {
    ruleId: 'HS_MATRU_SARALA_TRAJECTORY_02',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'HEAD_LINE',
    name: 'Sarala Matru Rekha',
    sanskritName: 'सरल मातृ रेखा (मङ्गल मण्डल गामिनी)',
    author: 'Dr. N.D. Shrimali',
    citation: 'Practical Palmistry, Chapter 4',
    conditions: {
      all_of: [
        { feature: 'lines.head_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.head_line.slope', operator: 'IN', value: ['STRAIGHT', 'DIRECT_TRANSVERSE', 'HORIZONTAL'] }
      ]
    },
    interpretation: {
      title: 'Tarka & Pragmatic Discernment',
      archetype: 'The Logical Realist',
      summary: 'A direct horizontal Matru Rekha terminating toward Mars denotes sharp logical discernment (tarka) and practical realism.',
      detail: 'Traditional texts praise this formation for administrative efficacy, financial acuity, and an unsentimental grip on tangible realities.',
      synthesis: 'You cut through ambiguity with direct, structural common sense and grounded clarity.'
    },
    confidence: 0.91
  }
];

export const samudrikaPitriRekhaRules = [
  {
    ruleId: 'HS_HRIDAYA_GURU_TERMINATION_01',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'HEART_LINE',
    name: 'Hridaya Rekha Guru Mandala Gamini',
    sanskritName: 'हृदय रेखा (गुरु मण्डल गामिनी)',
    author: 'Bhavishya Purana',
    citation: 'Samudrika Khanda, Sloka 42-45',
    conditions: {
      all_of: [
        { feature: 'lines.heart_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.heart_line.curvature', operator: 'IN', value: ['CURVED_TO_JUPITER', 'UPWARD_TO_INDEX', 'BETWEEN_FINGERS'] }
      ]
    },
    interpretation: {
      title: 'Dharmic Devotion & Elevated Affect',
      archetype: 'The Dharmic Protector',
      summary: 'In Hasta Samudrika, ascent toward the Mount of Guru (Jupiter) is regarded as the highest auspicious trajectory for the emotional nature.',
      detail: 'Treatises correlate this with satya (truthfulness) in affection, high ethical standards, and unshakeable loyalty once trust is established.',
      synthesis: 'Your relationships flourish when founded on mutual honor, reciprocal reverence, and clear boundaries.'
    },
    confidence: 0.94
  },
  {
    ruleId: 'HS_HRIDAYA_SHANI_TERMINATION_02',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'HEART_LINE',
    name: 'Hridaya Rekha Shani Mandala Gamini',
    sanskritName: 'हृदय रेखा (शनि मण्डल गामिनी)',
    author: 'Dr. N.D. Shrimali',
    citation: 'Practical Palmistry, Chapter 5',
    conditions: {
      all_of: [
        { feature: 'lines.heart_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.heart_line.curvature', operator: 'IN', value: ['STRAIGHT_ACROSS', 'TERMINATING_ON_SATURN', 'RESTRICTED_CURVE'] }
      ]
    },
    interpretation: {
      title: 'Dhriti & Emotional Self-Containment',
      archetype: 'The Stoic Anchor',
      summary: 'Termination beneath Shani (Saturn) emphasizes emotional fortitude, self-sufficiency, and sober loyalty.',
      detail: 'Traditional commentaries suggest that affection is expressed through quiet constancy and practical support rather than demonstrative effusiveness.',
      synthesis: 'You communicate affection through dependable constancy, valuing depth over transient drama.'
    },
    confidence: 0.89
  }
];
