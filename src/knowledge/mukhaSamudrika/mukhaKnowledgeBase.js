/**
 * Mukha Samudrika Shastra Knowledge Base — Vedic Face Reading & Physiognomy
 * Source of truth: Brihat Samhita (Varahamihira, Ch. 68-70), Garuda Purana (Samudrika Prakarana), Bhavishya Purana
 * Epistemic boundaries: Observational character synthesis; strictly non-deterministic and non-fatalistic.
 */

export const MUKHA_FEATURE_DEFINITIONS = {
  EYEBROWS: {
    id: 'eyebrows',
    label: 'Eyebrows',
    sanskrit: 'भ्रू लक्षण (Bhru Lakshana)',
    zone: 'Upper Face / Ajna Mandala',
    source: 'Brihat Samhita Ch. 68, Sloka 61-68',
    citation: 'Varahamihira Brihat Samhita — Bhru Lakshanam',
    description: 'Governs willpower, mental determination, intellectual focus, and resilience under pressure.',
    defaultScore: 60,
    interpretation: 'High, well-formed brows signify strategic thinking, unyielding resolve, and an innate capacity to direct thoughts purposefully.'
  },
  EYES: {
    id: 'eyes',
    label: 'Eyes',
    sanskrit: 'नेत्र लक्षण (Netra Lakshana)',
    zone: 'Mid-Upper Face / Chakshu Mandala',
    source: 'Garuda Purana, Samudrika Prakarana Ch. 65',
    citation: 'Garuda Purana — Chakshu Netra Lakshana',
    description: 'Reflects Sattva (mental clarity), perceptive depth, emotional truth, and receptive intelligence.',
    defaultScore: 65,
    interpretation: 'Luminous and balanced eyes indicate deep perceptiveness, clarity of intentions, and high social intuition.'
  },
  EYELIDS: {
    id: 'eyelids',
    label: 'Eyelids',
    sanskrit: 'नेत्र पुट (Netra Puta)',
    zone: 'Eye Enclosure / Upachhaya',
    source: 'Brihat Samhita Ch. 68, Sloka 72',
    citation: 'Varahamihira — Netra Puta Vichara',
    description: 'Relates to introspective depth, emotional reserve, discretion, and spiritual contemplation.',
    defaultScore: 63,
    interpretation: 'Balanced eyelid folds denote thoughtful contemplation, selective vulnerability, and steady self-containment.'
  },
  NOSE: {
    id: 'nose',
    label: 'Nose',
    sanskrit: 'नासा लक्षण (Nasa Lakshana)',
    zone: 'Mid Face / Prana Vayu Mandala',
    source: 'Brihat Samhita Ch. 68, Sloka 80-84',
    citation: 'Varahamihira — Nasa Lakshanam',
    description: 'Represents Prana energy, worldly ambition, independent initiative, and material drive.',
    defaultScore: 46,
    interpretation: 'A symmetrical, grounded nasal bridge reflects measured ambition, financial prudence, and self-reliant momentum.'
  },
  LIPS: {
    id: 'lips',
    label: 'Lips',
    sanskrit: 'ओष्ठ लक्षण (Oshtha Lakshana)',
    zone: 'Lower Face / Vach Mandala',
    source: 'Bhavishya Purana & Brihat Samhita Ch. 68, Sloka 88',
    citation: 'Bhavishya Purana — Oshtha Adhara Lakshana',
    description: 'Reveals kindness, warmth, expressive eloquence, relational generosity, and emotional empathy.',
    defaultScore: 84,
    interpretation: 'Generous and gently defined lips suggest exceptional kindness, warm interpersonal expression, and genuine empathy.'
  },
  CHIN: {
    id: 'chin',
    label: 'Chin',
    sanskrit: 'हनु लक्षण (Hanu Lakshana)',
    zone: 'Lower Anchor / Prithvi Mandala',
    source: 'Garuda Purana Ch. 66 & Brihat Samhita Ch. 68, Sloka 91',
    citation: 'Garuda Purana — Hanu Chibuka Lakshana',
    description: 'Signifies stamina, tenacity, independent moral backbone, and enduring tenacity.',
    defaultScore: 48,
    interpretation: 'A firm, contoured chin indicates steady self-reliance, endurance during setbacks, and steady fortitude.'
  }
};

export const MUKHA_FEELINGS_METRICS = {
  INTUITION: {
    id: 'intuition',
    label: 'Intuition',
    sanskrit: 'प्रज्ञा (Prajna)',
    color: '#F43F5E', // Coral / Rose arc
    defaultScore: 51,
    description: 'Instinctive awareness and perceptive inner guidance without explicit logical deliberation.'
  },
  KINDNESS: {
    id: 'kindness',
    label: 'Kindness',
    sanskrit: 'करुणा (Karuna)',
    color: '#00D2FF', // Cyan / Sky Blue arc
    defaultScore: 85,
    description: 'Benevolent warmth, relational empathy, and a strong disposition to assist others.'
  },
  PERCEPTION: {
    id: 'perception',
    label: 'Perception',
    sanskrit: 'प्रत्यक्ष (Pratyaksha)',
    color: '#10B981', // Emerald / Green arc
    defaultScore: 61,
    description: 'Sharp environmental discernment, reading unspoken emotions, and rapid cognitive clarity.'
  }
};

export const MUKHA_INSIGHT_CARDS = [
  {
    id: 'obstacles',
    title: 'There are no obstacles for you, you rely on yourself',
    body: 'You are confident in your ability to overcome any obstacles. Your independence and determination help you to keep up the fight with difficulties, transforming adversity into personal strength.',
    sanskritRef: 'स्वावलम्बन (Swavalambana — Self-Reliance)',
    source: 'Brihat Samhita Ch. 68'
  },
  {
    id: 'goal_oriented',
    title: 'You are a very goal-oriented person',
    body: 'You know how to set clear goals before you and go toward their achievement, ignoring distracting noise. Your focused brow line anchors an indomitable work ethic.',
    sanskritRef: 'लक्ष्यनिष्ठ (Lakshya Nishtha — Goal Steadfastness)',
    source: 'Garuda Purana Ch. 65'
  },
  {
    id: 'emotional_intuition',
    title: 'Deep emotional empathy and intuitive warmth',
    body: 'Your expressive lip contours reflect an open, giving heart. You perceive shifts in tone and sentiment before words are spoken, establishing immediate rapport.',
    sanskritRef: 'हृदय संवेदन (Hridaya Samvedana — Heart Sensitivity)',
    source: 'Bhavishya Purana'
  },
  {
    id: 'resilient_tenacity',
    title: 'Grounded perseverance and moral resilience',
    body: 'Your balanced chin alignment reveals quiet tenacity. Rather than rushing impulsively, you build endurance, knowing that time and steadfast effort yield enduring victories.',
    sanskritRef: 'धैर्य एवं स्थिति (Dhairya — Courage & Steadfastness)',
    source: 'Samudrika Tilaka'
  },
  {
    id: 'need_support',
    title: 'Selective vulnerability with trusted allies',
    body: 'While highly self-reliant, your introspective eyelid curvature shows that sharing burdens with a tight circle of trusted companions unlocks your highest creative potential.',
    sanskritRef: 'सत्संग (Satsanga — Supportive Association)',
    source: 'Brihat Samhita Ch. 70'
  }
];

/**
 * Deterministically generates face scan report data based on image metadata or custom seed
 */
export function generateFaceReportData(overrides = {}) {
  const features = [
    { ...MUKHA_FEATURE_DEFINITIONS.EYEBROWS, score: overrides.eyebrows ?? 60 },
    { ...MUKHA_FEATURE_DEFINITIONS.EYES, score: overrides.eyes ?? 65 },
    { ...MUKHA_FEATURE_DEFINITIONS.EYELIDS, score: overrides.eyelids ?? 63 },
    { ...MUKHA_FEATURE_DEFINITIONS.NOSE, score: overrides.nose ?? 46 },
    { ...MUKHA_FEATURE_DEFINITIONS.LIPS, score: overrides.lips ?? 84 },
    { ...MUKHA_FEATURE_DEFINITIONS.CHIN, score: overrides.chin ?? 48 }
  ];

  const feelings = [
    { ...MUKHA_FEELINGS_METRICS.INTUITION, score: overrides.intuition ?? 51 },
    { ...MUKHA_FEELINGS_METRICS.KINDNESS, score: overrides.kindness ?? 85 },
    { ...MUKHA_FEELINGS_METRICS.PERCEPTION, score: overrides.perception ?? 61 }
  ];

  // Sort insight cards so the user's highest-scoring trait appears as the primary card
  let sortedCards = [...MUKHA_INSIGHT_CARDS];
  const maxScore = Math.max(overrides.eyebrows || 60, overrides.lips || 84, overrides.eyes || 65, overrides.chin || 48);
  if ((overrides.eyebrows || 60) === maxScore) {
    sortedCards = [MUKHA_INSIGHT_CARDS[0], MUKHA_INSIGHT_CARDS[1], MUKHA_INSIGHT_CARDS[2], MUKHA_INSIGHT_CARDS[3], MUKHA_INSIGHT_CARDS[4]];
  } else if ((overrides.lips || 84) === maxScore) {
    sortedCards = [MUKHA_INSIGHT_CARDS[2], MUKHA_INSIGHT_CARDS[0], MUKHA_INSIGHT_CARDS[1], MUKHA_INSIGHT_CARDS[3], MUKHA_INSIGHT_CARDS[4]];
  } else if ((overrides.eyes || 65) === maxScore) {
    sortedCards = [MUKHA_INSIGHT_CARDS[1], MUKHA_INSIGHT_CARDS[2], MUKHA_INSIGHT_CARDS[0], MUKHA_INSIGHT_CARDS[3], MUKHA_INSIGHT_CARDS[4]];
  }

  const lipScore = overrides.lips ?? 84;
  const browScore = overrides.eyebrows ?? 60;
  const eyeScore = overrides.eyes ?? 65;

  return {
    scanTimestamp: new Date().toISOString(),
    photoSrc: overrides.photoSrc || '/assets/home/face_scanner.jpg',
    features,
    feelings,
    insightCards: sortedCards,
    vedicSummary: overrides.vedicSummary || `Your Mukha Samudrika synthesis reflects a harmonious balance of compassionate emotional warmth (${lipScore}% Lips), strategic mental focus (${browScore}% Eyebrows), and perceptive clarity (${eyeScore}% Eyes).`
  };
}
