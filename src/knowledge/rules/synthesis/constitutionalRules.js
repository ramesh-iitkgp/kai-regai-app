/**
 * Kai RegAI Synthesis Rules — Constitutional Archetypes & Cross-Line Patterns
 * Epistemic Tier: 4 (Kai RegAI Synthesis)
 */

export const synthesisConstitutionalRules = [
  {
    ruleId: 'SYN_CONST_FIRE_01',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'CONSTITUTION',
    name: 'Fire Element Morphological Synthesis',
    conditions: {
      all_of: [
        { feature: 'hand.elemental_shape', operator: 'EQUALS', value: 'FIRE' }
      ]
    },
    interpretation: {
      title: 'Dynamic Fire Archetype',
      chapter: 'constitution',
      synthesis: 'Your hand architecture embodies the Fire archetype: elongated palm foundations supporting lively, expressive fingers. This configuration produces high enthusiasm, intuitive momentum, and natural leadership in pioneering new initiatives.',
      detail: 'Sustained vitality requires balancing high-intensity output with deliberate rest cycles to prevent adrenal burnout.'
    },
    confidence: 0.92
  },
  {
    ruleId: 'SYN_CONST_EARTH_02',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'CONSTITUTION',
    name: 'Earth Element Morphological Synthesis',
    conditions: {
      all_of: [
        { feature: 'hand.elemental_shape', operator: 'EQUALS', value: 'EARTH' }
      ]
    },
    interpretation: {
      title: 'Grounded Earth Archetype',
      chapter: 'constitution',
      synthesis: 'Your hand architecture embodies the Earth archetype: square palmar pads paired with sturdy, balanced fingers. This provides dependable physical stamina, grounded pragmatic wisdom, and a preference for tangible reality over speculative theory.',
      detail: 'Your constitution operates with remarkable resilience when connected with natural environments and rhythmic daily routines.'
    },
    confidence: 0.92
  },
  {
    ruleId: 'SYN_CONST_AIR_03',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'CONSTITUTION',
    name: 'Air Element Morphological Synthesis',
    conditions: {
      all_of: [
        { feature: 'hand.elemental_shape', operator: 'EQUALS', value: 'AIR' }
      ]
    },
    interpretation: {
      title: 'Intellectual Air Archetype',
      chapter: 'constitution',
      synthesis: 'Your hand architecture embodies the Air archetype: square palm foundations paired with elongated, articulate fingers. This reflects mental agility, curiosity, linguistic versatility, and high communicative faculty.',
      detail: 'Cultivate grounded physical grounding exercises to harmonize your swift mental processing.'
    },
    confidence: 0.90
  },
  {
    ruleId: 'SYN_CONST_WATER_04',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'CONSTITUTION',
    name: 'Receptive Water Archetype',
    conditions: {
      all_of: [
        { feature: 'hand.elemental_shape', operator: 'EQUALS', value: 'WATER' }
      ]
    },
    interpretation: {
      title: 'Receptive Water Archetype',
      chapter: 'constitution',
      synthesis: 'Your hand architecture embodies the Water archetype: elongated rectangular palms paired with slender, sensitive phalanges. This confers acute emotional perception, aesthetic depth, and empathic awareness.',
      detail: 'Protect your energy with mindful relational boundaries, prioritizing serene environments.'
    },
    confidence: 0.90
  }
];

export const synthesisVocationRules = [
  {
    ruleId: 'SYN_VOC_PURPOSE_SOLAR_01',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'VOCATION',
    name: 'Dual Saturn & Solar Alignment',
    conditions: {
      all_of: [
        { feature: 'lines.fate_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.sun_line.detected', operator: 'EQUALS', value: true }
      ]
    },
    interpretation: {
      title: 'Harmonious Vocation & Radiant Expression',
      chapter: 'vocation',
      synthesis: 'The simultaneous presence of deliberate Saturnine direction and solar creative vitality suggests that your vocation flourishes when structural mastery is infused with personal creative authenticity. You thrive in roles bridging executive responsibility with creative stewardship.',
      detail: 'Multi-disciplinary synthesis brings greater fulfillment than mechanical routine.'
    },
    confidence: 0.93
  },
  {
    ruleId: 'SYN_VOC_AUTONOMOUS_CRAFT_02',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'VOCATION',
    name: 'Autonomous Craft & Self-Directed Dharma',
    conditions: {
      all_of: [
        { feature: 'lines.fate_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.sun_line.detected', operator: 'EQUALS', value: false }
      ]
    },
    interpretation: {
      title: 'Deep Craft & Intrinsic Focus',
      chapter: 'vocation',
      synthesis: 'Your vocational momentum is grounded in deliberate craft and substantive dedication. External validation is secondary to the quiet satisfaction of technical mastery, reliable duty, and internal autonomy.',
      detail: 'Patience and steady compounding yield lasting professional authority.'
    },
    confidence: 0.88
  },
  {
    ruleId: 'SYN_VOC_OPEN_FIELD_03',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'VOCATION',
    name: 'Self-Authoring Freeform Calling',
    conditions: {
      all_of: [
        { feature: 'lines.fate_line.detected', operator: 'EQUALS', value: false }
      ]
    },
    interpretation: {
      title: 'Self-Authoring Path',
      chapter: 'vocation',
      synthesis: 'Your vocational path is fluid and responsive rather than locked into conventional corporate hierarchies. You hold the creative freedom to pivot, synthesize disparate domains, and define success on your own reflective terms.',
      detail: 'Trust your organic timing and cultivate versatile skills that bridge multiple interests.'
    },
    confidence: 0.85
  }
];

export const synthesisCrossLineRules = [
  {
    ruleId: 'SYN_CROSS_HEAD_HEART_COHERENCE_01',
    sourceSystem: 'KAI_REGAI_SYNTHESIS',
    epistemicTier: 4,
    domain: 'CROSS_LINE',
    name: 'Head & Heart Coherence',
    conditions: {
      all_of: [
        { feature: 'lines.head_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.heart_line.detected', operator: 'EQUALS', value: true }
      ]
    },
    interpretation: {
      title: 'Mind-Heart Equilibrium',
      chapter: 'guidance',
      synthesis: 'A balanced relationship between intellectual clarity and emotional devotion enables you to make decisions that honor both logical discernment and ethical empathy.',
      detail: 'Periodic contemplation ensures that neither analytical scrutiny nor emotional intensity overpowers the other.'
    },
    confidence: 0.91
  }
];
