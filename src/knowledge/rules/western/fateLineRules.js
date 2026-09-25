/**
 * Western Classical Rules — Fate Line & Sun Line
 * Authority: William G. Benham (1900), Cheiro (1916)
 * Epistemic Tier: 2 (Western Classical)
 */

export const westernFateLineRules = [
  {
    ruleId: 'WST_FATE_STRONG_CENTRAL_01',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'FATE_LINE',
    name: 'Prominent Vertical Line of Saturn',
    author: 'William G. Benham',
    citation: 'The Laws of Scientific Hand Reading, pp. 310-318',
    conditions: {
      all_of: [
        { feature: 'lines.fate_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.fate_line.continuity', operator: 'IN', value: ['STRONG_CENTRAL', 'UNBROKEN', 'CONTINUOUS'] }
      ]
    },
    interpretation: {
      title: 'Defined Vocational Trajectory',
      archetype: 'The Self-Directed Builder',
      summary: 'Western palmistry observes a defined vertical furrow as an index of internal purpose and vocational stamina.',
      detail: 'Benham describes a distinct central line ascending toward the middle finger as reflecting strong self-mastery and persistence in one\'s chosen craft.',
      synthesis: 'Your vocational momentum stems from disciplined follow-through and self-directed focus.'
    },
    confidence: 0.89
  },
  {
    ruleId: 'WST_FATE_FAINT_OR_ABSENT_02',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'FATE_LINE',
    name: 'Fate Line Faint or Evolving',
    author: 'Cheiro',
    citation: 'Palmistry for All, Chapter VII',
    conditions: {
      all_of: [
        { feature: 'lines.fate_line.detected', operator: 'EQUALS', value: false }
      ]
    },
    interpretation: {
      title: 'Freeform Agency & Self-Authoring Flow',
      archetype: 'The Open Navigator',
      summary: 'Absence or faintness of a central vertical crease traditionally signifies fluid self-definition unrestricted by rigid institutional templates.',
      detail: 'Cheiro emphasizes that an unetched palm center denotes flexibility to reinvent one\'s path at key junctures without predetermined constraints.',
      synthesis: 'You possess the autonomy to sculpt your own purpose dynamically rather than adhering to rigid conventions.'
    },
    confidence: 0.85
  }
];

export const westernSunLineRules = [
  {
    ruleId: 'WST_SUN_PROMINENT_01',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'SUN_LINE',
    name: 'Prominent Line of Apollo',
    author: 'Cheiro',
    citation: 'Language of the Hand, Part II',
    conditions: {
      all_of: [
        { feature: 'lines.sun_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.sun_line.strength', operator: 'IN', value: ['PROMINENT_UPPER', 'DEEP', 'CLEAR'] }
      ]
    },
    interpretation: {
      title: 'Aesthetic Discernment & Solar Charm',
      archetype: 'The Radiant Artisan',
      summary: 'Classical Western literature associates the Line of Apollo with creative expression, personal charisma, and cultural appreciation.',
      detail: 'Cheiro and Benham agree that a well-marked Apollo crease bestows a magnetic aesthetic lens and natural distinction in social communication.',
      synthesis: 'Your creative impulses and distinctive voice naturally resonate with others.'
    },
    confidence: 0.88
  }
];

export const westernThumbRules = [
  {
    ruleId: 'WST_THUMB_SUPPLE_01',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'THUMB',
    name: 'Supple Distal Phalanx Arc',
    author: 'Casimir Stanislas D\'Arpentigny',
    citation: 'La Chirognomie (1839)',
    conditions: {
      all_of: [
        { feature: 'thumb.flexibility_type', operator: 'IN', value: ['SUPPLE_BACKWARD', 'SUPPLE_ADAPTIVE', 'FLEXIBLE'] }
      ]
    },
    interpretation: {
      title: 'Adaptable Intellect & Generous Temperament',
      archetype: 'The Generous Diplomat',
      summary: 'D\'Arpentigny identified the supple backward-arching thumb as a hallmark of intellectual agility and tolerance.',
      detail: 'Individuals with supple thumbs absorb novel ideas swiftly, harmonize divergent viewpoints, and exhibit spontaneous generosity.',
      synthesis: 'Your mindset remains open to evolving perspectives while navigating change smoothly.'
    },
    confidence: 0.90
  },
  {
    ruleId: 'WST_THUMB_FIRM_02',
    sourceSystem: 'WESTERN_CLASSICAL',
    epistemicTier: 2,
    domain: 'THUMB',
    name: 'Resolute & Firm Thumb Joint',
    author: 'William G. Benham',
    citation: 'The Laws of Scientific Hand Reading, pp. 110-116',
    conditions: {
      all_of: [
        { feature: 'thumb.flexibility_type', operator: 'IN', value: ['STIFF_RESOLUTE', 'BALANCED_ARC', 'FIRM'] }
      ]
    },
    interpretation: {
      title: 'Steadfast Agency & Executive Resolve',
      archetype: 'The Resolute Guardian',
      summary: 'A firm, upright thumb reflects stability, unwavering will, and high personal accountability.',
      detail: 'Benham documents this formation as characteristic of individuals who persevere against obstacles and preserve ethical boundaries.',
      synthesis: 'Your decisions are rooted in steadfast clarity and grounded integrity.'
    },
    confidence: 0.89
  }
];
