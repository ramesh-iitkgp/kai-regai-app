/**
 * Detailed Palm Reading Profile Schema — Visual Questionnaire Definitions
 * Implements the 10-step visual palm characteristics collection flow:
 * 1. Hand Selection (Left vs Right)
 * 2. Palm Form (Square, Rectangular, Oval/Long, Broad)
 * 3. Palm Flexibility (Not Flexible, Medium, Very Flexible)
 * 4. Life Line (6 visual alternatives)
 * 5. Heart Line (7 visual alternatives)
 * 6. Head Line (7 visual alternatives)
 * 7. Destiny Line (7 visual alternatives)
 * 8. Sun Line (6 visual alternatives)
 * 9. Special Markings (8 visual alternatives)
 * 10. Review Screen
 */

export const DETAILED_FLOW_SECTIONS = [
  {
    id: 'hand',
    phaseNumber: 1,
    phaseName: 'Hand',
    title: 'Which hand are you reading?',
    subtitle: 'Select the hand shown in your palm.',
    explanation: 'Your active dominant hand reflects conscious decisions and manifested karma, while your passive hand holds inherited potential.',
    type: 'DUAL_CARDS',
    options: [
      {
        id: 'LEFT',
        title: 'Left Hand',
        subtitle: 'Vama Kara • Innate potential & soul seeds',
        hand: 'LEFT'
      },
      {
        id: 'RIGHT',
        title: 'Right Hand',
        subtitle: 'Dakshina Kara • Manifested actions & conscious life',
        hand: 'RIGHT'
      }
    ]
  },
  {
    id: 'shape',
    phaseNumber: 2,
    phaseName: 'Shape',
    title: 'What is the overall shape of your palm?',
    subtitle: 'Choose the shape that most closely resembles your palm.',
    explanation: 'Palm geometry reveals your constitutional temperament and core elemental foundation.',
    type: 'GRID_2COL',
    options: [
      {
        id: 'SQUARE',
        title: 'SQUARE',
        subtitle: 'Even proportions, grounded and pragmatic',
        element: 'Earth (Prithvi)',
        geometry: 'Square outline with balanced width and length'
      },
      {
        id: 'RECTANGULAR',
        title: 'RECTANGULAR',
        subtitle: 'Elongated palm with strong linear focus',
        element: 'Fire (Agni)',
        geometry: 'Longer rectangular palm with dynamic vertical span'
      },
      {
        id: 'OVAL',
        title: 'OVAL / LONG',
        subtitle: 'Graceful elongated contours, intuitive and artistic',
        element: 'Water (Jala)',
        geometry: 'Curved oval contour with slender palm proportions'
      },
      {
        id: 'BROAD',
        title: 'BROAD',
        subtitle: 'Wide base and percussion, versatile and resilient',
        element: 'Air (Vayu)',
        geometry: 'Wider palm base with generous percussion width'
      }
    ]
  },
  {
    id: 'flexibility',
    phaseNumber: 3,
    phaseName: 'Flexibility',
    title: 'How flexible is your hand?',
    subtitle: 'Choose the angle between your thumb and other fingers.',
    explanation: 'The span between your thumb and fingers reflects your adaptability, openness, and willpower.',
    type: 'CAROUSEL_3',
    options: [
      {
        id: 'NOT_FLEXIBLE',
        title: 'RIGID / STIFF',
        subtitle: 'Narrow angle (~30°) between thumb & fingers',
        desc: 'Unyielding resolve, disciplined and steadfast reserve',
        angle: '30°'
      },
      {
        id: 'MEDIUM',
        title: 'BALANCED / NATURAL',
        subtitle: 'Natural angle (~60°) between thumb & fingers',
        desc: 'Balanced discernment, adaptable yet anchored',
        angle: '60°'
      },
      {
        id: 'VERY_FLEXIBLE',
        title: 'VERY FLEXIBLE',
        subtitle: 'Wide angle (90°+) between thumb & fingers',
        desc: 'Supple elasticity, highly versatile and generous',
        angle: '90°'
      }
    ]
  },
  {
    id: 'life_line',
    phaseNumber: 4,
    phaseName: 'Major Lines',
    subLineName: 'Life Line',
    title: 'Life Line',
    subtitle: 'How does your Life Line appear?',
    explanation: 'The Life Line (Jivita Rekha) shows vitality, stamina, constitutional reserve and grounding.',
    type: 'GRID_2COL',
    lineKey: 'LIFE',
    options: [
      {
        id: 'LONG_CLEAR',
        title: 'LONG & CLEAR',
        subtitle: 'Deep unbroken arc sweeping around the thumb',
        trait: 'Robust vitality and enduring physical stamina'
      },
      {
        id: 'SHORT',
        title: 'SHORT',
        subtitle: 'Ends before mid-palm, compact vitality reserve',
        trait: 'Conserved vital forces, thrives on deliberate pacing'
      },
      {
        id: 'DEEP',
        title: 'DEEP',
        subtitle: 'Prominently etched groove into the skin',
        trait: 'Intense physical presence and magnetic constitution'
      },
      {
        id: 'FAINT_FRAGMENTED',
        title: 'FAINT / FRAGMENTED',
        subtitle: 'Delicate or sectional path across the mount',
        trait: 'Sensitive constitution, benefits from mindful replenishment'
      },
      {
        id: 'WIDE_CURVE',
        title: 'WIDE CURVE',
        subtitle: 'Expansive arc embracing a broad Venus Mount',
        trait: 'Generous heart, love for travel and vibrant social warmth'
      },
      {
        id: 'CLOSE_TO_THUMB',
        title: 'CLOSE TO THUMB',
        subtitle: 'Compact contour hugging the thumb base',
        trait: 'Measured lifestyle, protective of domestic peace'
      }
    ]
  },
  {
    id: 'heart_line',
    phaseNumber: 4,
    phaseName: 'Major Lines',
    subLineName: 'Heart Line',
    title: 'Heart Line',
    subtitle: 'How does your Heart Line appear?',
    explanation: 'The Heart Line (Hridaya Rekha) traces emotional capacity, devotion, affection and relationships.',
    type: 'GRID_2COL',
    lineKey: 'HEART',
    options: [
      {
        id: 'LONG',
        title: 'LONG',
        subtitle: 'Extends smoothly past the index finger',
        trait: 'Generous emotional depth, unreserved devotion'
      },
      {
        id: 'SHORT',
        title: 'SHORT',
        subtitle: 'Ends beneath the middle finger',
        trait: 'Emotionally self-contained with clear boundaries'
      },
      {
        id: 'STRAIGHT',
        title: 'STRAIGHT',
        subtitle: 'Linear horizontal path across upper palm',
        trait: 'Pragmatic, logical approach to relationship matters'
      },
      {
        id: 'CURVED',
        title: 'CURVED',
        subtitle: 'Rises gently toward the fingers',
        trait: 'Warm, compassionate and naturally empathetic'
      },
      {
        id: 'DEEP',
        title: 'DEEP',
        subtitle: 'Vividly etched groove of rich color',
        trait: 'Intensely loyal and profoundly felt connections'
      },
      {
        id: 'FAINT',
        title: 'FAINT',
        subtitle: 'Delicate fine crease across the percussion',
        trait: 'Subtle emotional sensitivity, gentle quiet bonds'
      },
      {
        id: 'FORKED',
        title: 'FORKED',
        subtitle: 'Divides gracefully at the termination',
        trait: 'Harmonizes romantic idealism with sensible discretion'
      }
    ]
  },
  {
    id: 'head_line',
    phaseNumber: 4,
    phaseName: 'Major Lines',
    subLineName: 'Head Line',
    title: 'Head Line',
    subtitle: 'How does your Head Line appear?',
    explanation: 'The Head Line (Shiro Rekha) maps cognitive style, intellectual focus, judgment and perception.',
    type: 'GRID_2COL',
    lineKey: 'HEAD',
    options: [
      {
        id: 'LONG',
        title: 'LONG',
        subtitle: 'Reaches across the whole palm',
        trait: 'Broad intellectual horizons and multifaceted interests'
      },
      {
        id: 'SHORT',
        title: 'SHORT',
        subtitle: 'Direct and concise mental reach',
        trait: 'Hands-on practicality, cuts through conceptual noise'
      },
      {
        id: 'STRAIGHT',
        title: 'STRAIGHT',
        subtitle: 'Linear trajectory toward Upper Mars',
        trait: 'Methodical empirical logic and analytical precision'
      },
      {
        id: 'SLOPING',
        title: 'SLOPING',
        subtitle: 'Gently slopes toward the Mount of Moon',
        trait: 'Imaginative insight, creative vision and psychological depth'
      },
      {
        id: 'DEEP',
        title: 'DEEP',
        subtitle: 'Strong distinct channel without wavering',
        trait: 'Exceptional powers of sustained concentration and will'
      },
      {
        id: 'FAINT',
        title: 'FAINT',
        subtitle: 'Light trace across the mid-palm',
        trait: 'Fluid, agile intellect that effortlessly pivots'
      },
      {
        id: 'FORKED',
        title: 'FORKED',
        subtitle: 'Writer’s fork branching at the end',
        trait: 'Bridges logical analysis with intuitive imagination'
      }
    ]
  },
  {
    id: 'destiny_line',
    phaseNumber: 4,
    phaseName: 'Major Lines',
    subLineName: 'Destiny Line',
    title: 'Destiny Line',
    subtitle: 'How does your Destiny Line appear?',
    explanation: 'The Destiny / Fate Line (Bhagya Rekha) indicates vocation, career discipline, purpose and life landmarks.',
    type: 'GRID_2COL',
    lineKey: 'FATE',
    options: [
      {
        id: 'ABSENT',
        title: 'ABSENT',
        subtitle: 'No single distinct central vertical line',
        trait: 'Self-forged life path unrestrained by conventional molds'
      },
      {
        id: 'FAINT',
        title: 'FAINT',
        subtitle: 'Subtle trace ascending the center',
        trait: 'Flexible vocational trajectory guided by instinct'
      },
      {
        id: 'CLEAR',
        title: 'CLEAR',
        subtitle: 'Distinct etched path with steady presence',
        trait: 'Clear sense of vocational dharma and steady progress'
      },
      {
        id: 'CROSSES_PALM',
        title: 'CROSSES THE PALM',
        subtitle: 'Unbroken ascent from wrist to Saturn',
        trait: 'Early vocational clarity and unwavering persistence'
      },
      {
        id: 'DOUBLE_LINE',
        title: 'DOUBLE LINE',
        subtitle: 'Two parallel ascending lines',
        trait: 'Dual careers, simultaneous passions or twin callings'
      },
      {
        id: 'INTERRUPTED',
        title: 'INTERRUPTED',
        subtitle: 'Segmented line with distinct shifts',
        trait: 'Transformative chapter pivots and vocational rebirths'
      },
      {
        id: 'REACHES_FINGERS',
        title: 'REACHES THE FINGERS',
        subtitle: 'Extends high into the Saturn Mount',
        trait: 'Long-term influence, recognized authority and late mastery'
      }
    ]
  },
  {
    id: 'sun_line',
    phaseNumber: 4,
    phaseName: 'Major Lines',
    subLineName: 'Sun Line',
    title: 'Sun Line',
    subtitle: 'How does your Sun Line appear?',
    explanation: 'The Sun Line (Surya Rekha) reflects earned reputation, creative brilliance, social radiance and distinction.',
    type: 'GRID_2COL',
    lineKey: 'SUN',
    options: [
      {
        id: 'ABSENT',
        title: 'ABSENT',
        subtitle: 'No prominent vertical stroke beneath ring finger',
        trait: 'Quiet fulfillment without craving external validation'
      },
      {
        id: 'SHORT',
        title: 'SHORT',
        subtitle: 'Brief luminous ray high beneath the ring finger',
        trait: 'Ripe recognition and celebrated achievements in maturity'
      },
      {
        id: 'LONG',
        title: 'LONG',
        subtitle: 'Extends deep into the middle palm',
        trait: 'Sustained creative brilliance and magnetic personal charm'
      },
      {
        id: 'CLEAR',
        title: 'CLEAR',
        subtitle: 'Unbroken luminous stroke',
        trait: 'Earned distinction and widely respected creative authority'
      },
      {
        id: 'FAINT',
        title: 'FAINT',
        subtitle: 'Delicate ray beneath Apollo Mount',
        trait: 'Subtle aesthetic appreciation and refined private taste'
      },
      {
        id: 'MULTIPLE',
        title: 'MULTIPLE',
        subtitle: 'Multiple fine parallel rays',
        trait: 'Versatile talents celebrated across diverse pursuits'
      }
    ]
  },
  {
    id: 'marriage_line',
    phaseNumber: 5,
    phaseName: 'Special Lines',
    subLineName: 'Marriage Line',
    title: 'Marriage Line',
    subtitle: 'How does your Marriage Line appear on your hand?',
    instruction: 'Look at the side of your palm below the little finger and choose the image that matches.',
    explanation: 'The Marriage Line (Vivaha Rekha) is located on the side/percussion of the palm beneath the little pinky finger, indicating deep emotional commitments and partnerships.',
    type: 'GRID_2COL',
    lineKey: 'MARRIAGE',
    options: [
      {
        id: 'SINGLE_CLEAR',
        title: 'Single & Clear',
        subtitle: 'One distinct marriage line',
        trait: 'Deep lifelong bond with singular devotion and emotional clarity'
      },
      {
        id: 'MULTIPLE',
        title: 'Multiple Lines',
        subtitle: 'Two or more marriage lines',
        trait: 'Two or more meaningful relationship chapters or versatile social bonds'
      },
      {
        id: 'FAINT',
        title: 'Faint Line',
        subtitle: 'Light and less visible',
        trait: 'Gentle emotional nature, subtle inner bonds requiring nurturing'
      },
      {
        id: 'DEEP',
        title: 'Deep Line',
        subtitle: 'Deep and well-defined',
        trait: 'Passionate, enduring devotion with unwavering loyalty'
      },
      {
        id: 'UPWARD',
        title: 'Upward Slanting',
        subtitle: 'Slants upwards',
        trait: 'Inspiring romantic ambition, partner brings elevation and optimism'
      },
      {
        id: 'DOWNWARD',
        title: 'Downward Slanting',
        subtitle: 'Slants downwards',
        trait: 'Realistic emotional care, deep empathy through life’s trials'
      },
      {
        id: 'FORKED',
        title: 'Forked Line',
        subtitle: 'Splits at the end',
        trait: 'Independent perspectives within partnership, balancing autonomy'
      },
      {
        id: 'ISLAND',
        title: 'Island',
        subtitle: 'Has an island or break in the middle',
        trait: 'Temporary trials overcome through patience and mutual understanding'
      },
      {
        id: 'CHAINED',
        title: 'Chain-like',
        subtitle: 'Looks like a chain',
        trait: 'Complex emotional journey, evolving romantic sensitivity'
      },
      {
        id: 'CROSSED',
        title: 'Crossed/Interrupted',
        subtitle: 'Crossed or multiple breaks',
        trait: 'Dynamic relationships requiring intentional communication'
      },
      {
        id: 'NONE',
        title: 'No Line',
        subtitle: 'Smooth outer margin',
        trait: 'Self-sufficient emotional sovereignty, independent journey'
      }
    ]
  },
  {
    id: 'special_markings',
    phaseNumber: 5,
    phaseName: 'Special Lines',
    title: 'Special Markings',
    subtitle: 'Select any distinct markings present on your palm.',
    explanation: 'Sacred isolated symbols highlight karmic gifts, protection points, or intensive growth chapters.',
    type: 'GRID_2COL',
    lineKey: 'MARKINGS',
    options: [
      {
        id: 'STAR',
        title: 'STAR',
        subtitle: 'Sacred starlight intersection of rays',
        trait: 'Heightened intuition and sudden breakthrough moments'
      },
      {
        id: 'CROSS',
        title: 'CROSS',
        subtitle: 'Distinct intersection between major lines',
        trait: 'Mystic cross, deep spiritual discernment and protective intuition'
      },
      {
        id: 'TRIANGLE',
        title: 'TRIANGLE',
        subtitle: 'Clean three-sided geometric enclosure',
        trait: 'Trikona: sacred wisdom, mental acuity and spiritual shielding'
      },
      {
        id: 'SQUARE',
        title: 'SQUARE',
        subtitle: 'Four-sided bounding enclosure',
        trait: 'Ruksha: guardian symbol protecting against sudden adversity'
      },
      {
        id: 'ISLAND',
        title: 'ISLAND',
        subtitle: 'Delicate oval enclosure within a crease',
        trait: 'Period of deep inner introspection and mindful pacing'
      },
      {
        id: 'FORK',
        title: 'FORK',
        subtitle: 'Divergent branch at a line termination',
        trait: 'Versatile expression bridging two complementary gifts'
      },
      {
        id: 'CHAINED',
        title: 'CHAINED SECTION',
        subtitle: 'Interlocked oval links in a segment',
        trait: 'Heightened sensitivity fostering emotional resilience'
      },
      {
        id: 'NONE',
        title: 'NONE',
        subtitle: 'Clean, unblemished mounts without major symbols',
        trait: 'Direct, unhindered prana flow with minimal karmic friction'
      }
    ]
  }
];

/**
 * Generate a comprehensive reading dossier from the user's detailed profile
 * @param {Object} profile - User selections keyed by section id
 * @returns {Object} Full dossier for detailed reporting and archiving
 */
export function buildDossierFromDetailedProfile(profile = {}) {
  const hand = profile.hand || 'RIGHT';
  const isRight = hand.toUpperCase() === 'RIGHT';

  return {
    id: `DLR-${Date.now().toString(36).toUpperCase()}`,
    reading_method: 'GUIDED_QUESTIONNAIRE',
    mode: 'MODE_2_QUESTIONNAIRE',
    hand_side: isRight ? 'Right' : 'Left',
    capture_timestamp: new Date().toISOString(),
    profile,
    title: isRight ? 'Purushartha Blueprint (Active Right Palm)' : 'Prarabdha Blueprint (Innate Left Palm)',
    summary: 'A comprehensive visual synthesis combining your palm geometry, elasticity, line trajectories, and sacred markings under Hasta Samudrika Shastra.',
    archetype: profile.shape || 'SQUARE',
    flexibility: profile.flexibility || 'MEDIUM',
    major_lines: {
      life: profile.life_line || 'LONG_CLEAR',
      heart: profile.heart_line || 'CURVED',
      head: profile.head_line || 'SLOPING',
      fate: profile.destiny_line || 'CLEAR',
      sun: profile.sun_line || 'CLEAR'
    },
    marriage_line: profile.marriage_line || 'SINGLE_CLEAR',
    special_markings: profile.special_markings || 'NONE'
  };
}
