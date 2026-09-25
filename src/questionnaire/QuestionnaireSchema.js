/**
 * Kai RegAI — Questionnaire Schema & Question Specifications
 * Phase: P7 — Palm Reading Questionnaire Engine
 * 
 * Defines all observable questions, neutral observation options, category groups,
 * and deterministic conditional branching rules.
 * 
 * Strictly observes the non-conflation law:
 * - Questions capture physical observations, NEVER interpretive conclusions.
 * - Options distinguish: OBSERVED, NOT_OBSERVED, NOT_SURE, NOT_VISIBLE, NOT_APPLICABLE.
 */

export const QUESTION_TYPES = {
  SINGLE_SELECT: 'SINGLE_SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
  SCALE: 'SCALE',
  IMAGE_CHOICE: 'IMAGE_CHOICE',
  INFO: 'INFO'
};

export const OBSERVATION_STATES = {
  OBSERVED: 'OBSERVED',
  NOT_OBSERVED: 'NOT_OBSERVED',
  NOT_SURE: 'NOT_SURE',
  NOT_VISIBLE: 'NOT_VISIBLE',
  NOT_APPLICABLE: 'NOT_APPLICABLE'
};

export const QUESTION_CATEGORIES = {
  HAND_MORPHOLOGY: {
    id: 'HAND_MORPHOLOGY',
    title: 'Hand & Morphology',
    description: 'Observe the overall proportions, skin texture, and dominant alignment of your hand.'
  },
  LIFE_LINE: {
    id: 'LIFE_LINE',
    title: 'Life Line (Ayur Rekha)',
    description: 'Inspect the line curving around the fleshy base of your thumb (Mount of Venus).'
  },
  HEAD_LINE: {
    id: 'HEAD_LINE',
    title: 'Head Line (Matru Rekha)',
    description: 'Inspect the line running horizontally or diagonally across the center of your palm.'
  },
  HEART_LINE: {
    id: 'HEART_LINE',
    title: 'Heart Line (Pitri Rekha)',
    description: 'Inspect the upper crease running below the base of your fingers.'
  },
  FATE_LINE: {
    id: 'FATE_LINE',
    title: 'Fate Line (Karma Rekha)',
    description: 'Inspect any vertical crease ascending longitudinally toward your middle finger.'
  },
  SUN_LINE: {
    id: 'SUN_LINE',
    title: 'Sun Line (Surya Rekha)',
    description: 'Inspect any vertical crease ascending beneath your ring finger (Mount of Apollo).'
  },
  THUMB: {
    id: 'THUMB',
    title: 'Thumb Biomechanics',
    description: 'Examine the flexibility and phalanx proportions of your thumb.'
  },
  SPECIAL_MARKINGS: {
    id: 'SPECIAL_MARKINGS',
    title: 'Sacred Markings & Glyphs',
    description: 'Check for traditional auspicious symbols on mounts and major planes.'
  }
};

export const QUESTIONNAIRE_QUESTIONS = [
  // ==========================================
  // Category 1: Hand Morphology & Active Side
  // ==========================================
  {
    id: 'hand_side',
    category: 'HAND_MORPHOLOGY',
    title: 'Select Active Hand',
    subtitle: 'Which hand do you use most actively for writing, eating, and decisive action?',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'RIGHT',
        label: 'Right Hand',
        desc: 'Traditional active hand reflecting deliberate karma, career, and conscious development.',
        icon: 'front_hand'
      },
      {
        id: 'LEFT',
        label: 'Left Hand',
        desc: 'Traditional receptive hand reflecting innate constitution, inherited potentials, and inner compass.',
        icon: 'back_hand'
      }
    ]
  },
  {
    id: 'palm_shape',
    category: 'HAND_MORPHOLOGY',
    title: 'Palm & Finger Proportions',
    subtitle: 'Compare the shape of your palm (square vs rectangular) with finger length.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'EARTH',
        label: 'Square Palm with Balanced/Shorter Fingers',
        desc: 'Sturdy, grounded palm geometry with deep skin creases.'
      },
      {
        id: 'AIR',
        label: 'Square Palm with Longer Fingers',
        desc: 'Graceful square palm paired with extended, slender phalanges.'
      },
      {
        id: 'FIRE',
        label: 'Oblong/Rectangular Palm with Shorter Fingers',
        desc: 'Elongated palm frame with dynamic, agile fingers.'
      },
      {
        id: 'WATER',
        label: 'Oblong/Rectangular Palm with Long Fingers',
        desc: 'Elongated, flexible palm with fine, tapering fingers.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Proportions appear evenly balanced or difficult to distinguish.'
      }
    ]
  },
  {
    id: 'palm_firmness',
    category: 'HAND_MORPHOLOGY',
    title: 'Palmar Pad Resilience',
    subtitle: 'Gently press into the fleshy pad at the base of your thumb with the opposite thumb.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'ELASTIC_SPRINGY',
        label: 'Springy & Resilient',
        desc: 'Tissue depresses comfortably and rebounds instantly.'
      },
      {
        id: 'FIRM_RESILIENT',
        label: 'Dense & Muscular',
        desc: 'Solid, muscular firmness with high physical resistance.'
      },
      {
        id: 'SOFT_FLACCID',
        label: 'Soft & Receptive',
        desc: 'Yields gently under pressure with a delicate, soft touch.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Tissue resistance falls evenly between soft and firm.'
      }
    ]
  },

  // ==========================================
  // Category 2: Life Line (Ayur Rekha)
  // ==========================================
  {
    id: 'life_line_visibility',
    category: 'LIFE_LINE',
    title: 'Life Line Visibility',
    subtitle: 'Look for the curved furrow originating between thumb and index finger, encircling the thumb base.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'CLEAR',
        label: 'Clearly Visible',
        desc: 'The line is easily identified and prominent across the palm.'
      },
      {
        id: 'PARTIAL',
        label: 'Partially Visible',
        desc: 'The line is visible in some sections but faint or broken in others.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Several overlapping lines make it difficult to isolate.'
      },
      {
        id: 'NOT_VISIBLE',
        label: 'I cannot see it',
        desc: 'No continuous crease is discernible around the thumb base.'
      }
    ]
  },
  {
    id: 'life_line_continuity',
    category: 'LIFE_LINE',
    title: 'Life Line Continuity',
    subtitle: 'Observe whether the line runs in a continuous sweep or displays interruptions.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    showWhen: {
      questionId: 'life_line_visibility',
      in: ['CLEAR', 'PARTIAL']
    },
    options: [
      {
        id: 'CONTINUOUS',
        label: 'Continuous Unbroken Arc',
        desc: 'Forms a single smooth trajectory without major interruptions.'
      },
      {
        id: 'OVERLAPPING_BREAKS',
        label: 'Overlapping Segments',
        desc: 'Breaks slightly but parallel overlapping lines maintain the path.'
      },
      {
        id: 'CHAINED',
        label: 'Chained or Feathered',
        desc: 'Appears link-like or surrounded by tiny lateral cross-creases.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Cannot clearly determine the continuity.'
      }
    ]
  },
  {
    id: 'life_line_curvature',
    category: 'LIFE_LINE',
    title: 'Life Line Curvature Profile',
    subtitle: 'Does the arc extend wide into the center of the palm or stay tight around the thumb?',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    showWhen: {
      questionId: 'life_line_visibility',
      in: ['CLEAR', 'PARTIAL']
    },
    options: [
      {
        id: 'WIDE_ARC',
        label: 'Wide Sweeping Arc',
        desc: 'Sweeps out toward the center of the palm, enclosing a broad thumb mount.'
      },
      {
        id: 'MODERATE_ARC',
        label: 'Moderate Balanced Curve',
        desc: 'Follows a natural equidistant curve around the thenar eminence.'
      },
      {
        id: 'CLOSE_TO_THUMB',
        label: 'Close to Thumb Base',
        desc: 'Runs close to the root of the thumb, enclosing a narrower area.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Curvature does not clearly match one specific type.'
      }
    ]
  },

  // ==========================================
  // Category 3: Head Line (Matru Rekha)
  // ==========================================
  {
    id: 'head_line_visibility',
    category: 'HEAD_LINE',
    title: 'Head Line Visibility',
    subtitle: 'Look for the middle crease running horizontally or diagonally across the mid-palm.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'CLEAR',
        label: 'Clearly Visible',
        desc: 'Distinct linear crease traversing across the mid-palm.'
      },
      {
        id: 'PARTIAL',
        label: 'Partially Visible',
        desc: 'Faint or interrupted along parts of its trajectory.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Blends into other palm creases.'
      },
      {
        id: 'NOT_VISIBLE',
        label: 'I cannot see it',
        desc: 'No clear horizontal transversal crease is visible.'
      }
    ]
  },
  {
    id: 'head_line_direction',
    category: 'HEAD_LINE',
    title: 'Head Line Trajectory',
    subtitle: 'How does the line travel across your palm toward the percussion edge?',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    showWhen: {
      questionId: 'head_line_visibility',
      in: ['CLEAR', 'PARTIAL']
    },
    options: [
      {
        id: 'STRAIGHT_TRANSVERSE',
        label: 'Straight Across',
        desc: 'Traverses relatively straight toward the outer edge of the palm.'
      },
      {
        id: 'GENTLE_SLOPE',
        label: 'Gentle Downward Slope',
        desc: 'Curves gently downward toward the lower outer palm (Mount of Moon).'
      },
      {
        id: 'STEEP_DESCENT',
        label: 'Steep Downward Curve',
        desc: 'Dips sharply toward the lower corner of the palm.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Slope is ambiguous or varies along its path.'
      }
    ]
  },
  {
    id: 'head_line_clarity',
    category: 'HEAD_LINE',
    title: 'Head Line Termination & Ending',
    subtitle: 'Examine the end of the line on the outer half of your hand.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    showWhen: {
      questionId: 'head_line_visibility',
      in: ['CLEAR', 'PARTIAL']
    },
    options: [
      {
        id: 'SINGLE_CLEAN',
        label: 'Clean Single Ending',
        desc: 'Terminates in a single defined point without splitting.'
      },
      {
        id: 'FORKED_END',
        label: 'Forked Termination ("Writer\'s Fork")',
        desc: 'Splits into two distinct branches near its end.'
      },
      {
        id: 'FADED_OUT',
        label: 'Gradually Fades Out',
        desc: 'Dissolves softly into fine surface lines.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Termination point is difficult to distinguish.'
      }
    ]
  },

  // ==========================================
  // Category 4: Heart Line (Pitri Rekha)
  // ==========================================
  {
    id: 'heart_line_visibility',
    category: 'HEART_LINE',
    title: 'Heart Line Visibility',
    subtitle: 'Look for the upper major line running directly beneath the base of your fingers.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'CLEAR',
        label: 'Clearly Visible',
        desc: 'A distinct continuous crease running beneath the fingers.'
      },
      {
        id: 'PARTIAL',
        label: 'Partially Visible',
        desc: 'Visible in segments or fainter on one side.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Multiple parallel lines make it hard to identify.'
      },
      {
        id: 'NOT_VISIBLE',
        label: 'I cannot see it',
        desc: 'No distinct upper horizontal crease is discernible.'
      }
    ]
  },
  {
    id: 'heart_line_curvature',
    category: 'HEART_LINE',
    title: 'Heart Line Termination Region',
    subtitle: 'Where does the line terminate on the thumb-side of your upper palm?',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    showWhen: {
      questionId: 'heart_line_visibility',
      in: ['CLEAR', 'PARTIAL']
    },
    options: [
      {
        id: 'CURVED_TO_JUPITER',
        label: 'Curves Up Under Index Finger (Jupiter)',
        desc: 'Sweeps upward to end directly beneath the index finger.'
      },
      {
        id: 'BETWEEN_FINGERS',
        label: 'Terminates Between Index & Middle Fingers',
        desc: 'Curves upward into the cleft between index and middle finger.'
      },
      {
        id: 'STRAIGHT_TO_SATURN',
        label: 'Straight Across Under Middle Finger (Saturn)',
        desc: 'Runs flatter and ends beneath the middle finger.'
      },
      {
        id: 'TRIDENT_TERMINATION',
        label: 'Triple Fork / Trishula Formation',
        desc: 'Splits into three distinct branches beneath the index/middle zone.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Ending point is faint or ambiguous.'
      }
    ]
  },

  // ==========================================
  // Category 5: Fate Line (Karma Rekha)
  // ==========================================
  {
    id: 'fate_line_visibility',
    category: 'FATE_LINE',
    title: 'Fate / Saturn Line Visibility',
    subtitle: 'Look for a vertical crease running from the base/center of the palm toward the middle finger.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'CLEAR',
        label: 'Clearly Visible',
        desc: 'A distinct vertical line running upward through the palm center.'
      },
      {
        id: 'PARTIAL',
        label: 'Partially Visible / Fragmented',
        desc: 'Seen only in the lower or upper half of the palm.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Uncertain whether vertical traces constitute a unified crease.'
      },
      {
        id: 'NOT_VISIBLE',
        label: 'I cannot see it',
        desc: 'No vertical central crease is discernible (common and natural).'
      }
    ]
  },
  {
    id: 'fate_line_origin',
    category: 'FATE_LINE',
    title: 'Fate Line Starting Region',
    subtitle: 'Where does the line begin on your lower palm?',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    showWhen: {
      questionId: 'fate_line_visibility',
      in: ['CLEAR', 'PARTIAL']
    },
    options: [
      {
        id: 'BASE_OF_PALM',
        label: 'Base of Palm / Near Wrist',
        desc: 'Rises from the very lower center of the palm near the wrist crease.'
      },
      {
        id: 'MID_PALM',
        label: 'Mid-Palm (Plain of Mars)',
        desc: 'Begins in the center of the palm, above the lower wrist zone.'
      },
      {
        id: 'LUNA_MOUNT',
        label: 'Fleshy Outer Base (Mount of Moon)',
        desc: 'Curves upward from the lower outer edge toward the center.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Origin point is obscured by other creases.'
      }
    ]
  },

  // ==========================================
  // Category 6: Sun Line (Surya Rekha)
  // ==========================================
  {
    id: 'sun_line_visibility',
    category: 'SUN_LINE',
    title: 'Sun / Apollo Line Visibility',
    subtitle: 'Look for a vertical crease ascending beneath the ring finger toward the upper palm.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'CLEAR',
        label: 'Clearly Visible',
        desc: 'A distinct line running vertically below the ring finger.'
      },
      {
        id: 'PARTIAL',
        label: 'Faint or Short Line',
        desc: 'A short vertical mark located just beneath the ring finger base.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Fine lines make it uncertain.'
      },
      {
        id: 'NOT_VISIBLE',
        label: 'I cannot see it',
        desc: 'No vertical crease below the ring finger (common and natural).'
      }
    ]
  },

  // ==========================================
  // Category 7: Thumb Biomechanics
  // ==========================================
  {
    id: 'thumb_flexibility',
    category: 'THUMB',
    title: 'Thumb Flexibility Arc',
    subtitle: 'Gently push the top joint of your thumb backward. Observe how far it flexes.',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'SUPPLE_BACKWARD',
        label: 'Supple & Flexible (≥ 45° bend)',
        desc: 'Bends easily backward into a supple, curved arc.'
      },
      {
        id: 'BALANCED_ARC',
        label: 'Moderate Arc (~20° – 40° bend)',
        desc: 'Yields with gentle flexibility while retaining firm structure.'
      },
      {
        id: 'STIFF_RESOLUTE',
        label: 'Firm & Resolute (≤ 15° bend)',
        desc: 'Resists backward bending; stays straight and upright.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Flexibility is difficult to judge.'
      }
    ]
  },
  {
    id: 'thumb_phalanx_ratio',
    category: 'THUMB',
    title: 'Thumb Segment Balance',
    subtitle: 'Compare the length of your thumb’s top nail segment (Will) to the lower middle segment (Logic).',
    type: QUESTION_TYPES.SINGLE_SELECT,
    required: true,
    options: [
      {
        id: 'EQUAL_BALANCE',
        label: 'Roughly Equal Length',
        desc: 'Both segments appear harmonious and balanced in proportion.'
      },
      {
        id: 'DOMINANT_WILL',
        label: 'Top (Nail) Segment is Longer',
        desc: 'The upper nail segment is visibly longer than the middle section.'
      },
      {
        id: 'DOMINANT_LOGIC',
        label: 'Lower (Middle) Segment is Longer',
        desc: 'The middle segment between joints is visibly longer.'
      },
      {
        id: 'NOT_SURE',
        label: 'I am not sure',
        desc: 'Segments are hard to measure by eye.'
      }
    ]
  },

  // ==========================================
  // Category 8: Sacred Markings & Glyphs
  // ==========================================
  {
    id: 'special_markings_confirmed',
    category: 'SPECIAL_MARKINGS',
    title: 'Traditional Palm Markings',
    subtitle: 'Do you observe any of these distinct traditional markings on your palm? (Select all that apply)',
    type: QUESTION_TYPES.MULTI_SELECT,
    required: false,
    options: [
      {
        id: 'TRISHULA_TRIDENT',
        label: 'Trident / Trishula',
        desc: 'A three-pronged terminal fork rising on the upper Mount of Jupiter or Saturn.'
      },
      {
        id: 'SOLOMON_RING',
        label: 'Solomon Ring',
        desc: 'A gentle semi-circular crease curling around the base of the index finger.'
      },
      {
        id: 'FISH_YAV',
        label: 'Yava / Barley Sign',
        desc: 'An enclosed eye-shaped or barley-grain crease on the thumb joint.'
      },
      {
        id: 'MYSTIC_CROSS',
        label: 'Mystic Cross (La Croix Mystique)',
        desc: 'An independent cross standing between the Head and Heart lines in the mid-palm.'
      },
      {
        id: 'NONE_OBSERVED',
        label: 'None Observed',
        desc: 'Palm fields appear clean without these specific markings.'
      }
    ]
  }
];

export const QUESTIONNAIRE_SCHEMA = {
  version: '2.0.0',
  categories: QUESTION_CATEGORIES,
  questions: QUESTIONNAIRE_QUESTIONS
};
