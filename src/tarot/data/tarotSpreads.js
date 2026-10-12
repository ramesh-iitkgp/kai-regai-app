/**
 * Kai RegAI — Master Tarot Spreads Codex
 * 
 * Compliant with Section 6 of Master Implementation Prompt:
 * - A. Daily Tarot (1 Card — Local date anchored, reflection & guidance)
 * - B. Love Tarot (2 Cards — You & Partner, relationship synthesis)
 * - C. Classic Tarot (3 Cards — Past, Present, Future)
 * - Extensible spread architecture (Career, Guidance Cross)
 */

export const TAROT_SPREADS = [
  {
    id: 'daily',
    aliasId: 'single_daily',
    name: 'Daily Tarot',
    category: 'DAILY',
    cardCount: 1,
    tag: 'Daily Reflection & Focus',
    badge: '1 Card',
    icon: 'wb_sunny',
    illustration: '/assets/tarot/art/daily_illustration.jpg',
    description: 'Get a quick insight for your day and align with the present moment.',
    instructions: 'Take a moment to focus on your day. Browse the deck and choose one card to explore the themes and possibilities that may be meaningful to you today.',
    selectionRules: {
      maxSelect: 1,
      allowDuplicateCards: false,
      dateAnchored: true
    },
    interpretationTemplate: 'single_card_daily',
    availability: 'FREE',
    premiumStatus: false,
    version: '1.0.0',
    positions: [
      {
        index: 0,
        id: 'daily_focus',
        name: 'Daily Theme & Mirror',
        subtitle: 'Theme of the Day',
        description: 'The dominant archetypal energy guiding your decisions, emotional tone, and spiritual focus today.',
        contextTag: 'TODAY'
      }
    ]
  },
  {
    id: 'love',
    aliasId: 'love_union',
    name: 'Love Tarot',
    category: 'LOVE',
    cardCount: 2,
    tag: 'Relationship Reflection',
    badge: '2 Cards',
    icon: 'favorite_border',
    illustration: '/assets/tarot/art/love_illustration.jpg',
    description: 'Understand your relationships, emotions and heart’s journey.',
    instructions: 'Choose two cards to explore your own perspective and the other person’s perspective in this relationship.',
    selectionRules: {
      maxSelect: 2,
      allowDuplicateCards: false,
      dateAnchored: false
    },
    interpretationTemplate: 'dual_relationship_synthesis',
    availability: 'FREE',
    premiumStatus: false,
    version: '1.0.0',
    positions: [
      {
        index: 0,
        id: 'slot_you',
        name: 'You',
        subtitle: 'Your Inner State & Needs',
        description: 'Your emotional atmosphere, expectations, and personal contribution to the partnership.',
        contextTag: 'YOU'
      },
      {
        index: 1,
        id: 'slot_partner',
        name: 'Partner',
        subtitle: 'Their Perspective & Reflection',
        description: 'The mirroring perspective, outward dynamic, and relational atmosphere being shared.',
        contextTag: 'PARTNER'
      }
    ]
  },
  {
    id: 'classic',
    aliasId: 'trinity_time',
    name: 'Classic Tarot',
    category: 'GENERAL',
    cardCount: 3,
    tag: 'Past • Present • Future',
    badge: '3 Cards',
    icon: 'auto_stories',
    illustration: '/assets/tarot/art/classic_illustration.jpg',
    description: 'See the bigger picture of your life’s journey.',
    instructions: 'Choose three cards to reflect on past influences, your present situation, and possible directions ahead.',
    selectionRules: {
      maxSelect: 3,
      allowDuplicateCards: false,
      dateAnchored: false
    },
    interpretationTemplate: 'past_present_future_synthesis',
    availability: 'FREE',
    premiumStatus: false,
    version: '1.0.0',
    positions: [
      {
        index: 0,
        id: 'slot_past',
        name: 'Past',
        subtitle: 'Karmic Foundation',
        description: 'The foundation, lessons, and experiences that brought you to this current crossroads.',
        contextTag: 'PAST'
      },
      {
        index: 1,
        id: 'slot_present',
        name: 'Present',
        subtitle: 'Active Currents & Tensions',
        description: 'Where your vital energy is currently focused, including active tensions and possibilities.',
        contextTag: 'PRESENT'
      },
      {
        index: 2,
        id: 'slot_future',
        name: 'Future',
        subtitle: 'Emerging Potential & Counsel',
        description: 'Themes, possibilities, and mindful counsel for the path unfolding before you.',
        contextTag: 'FUTURE'
      }
    ]
  },
  {
    id: 'career_calling',
    name: 'Career & Purpose',
    category: 'CAREER',
    cardCount: 3,
    tag: 'Vocation & Destiny',
    badge: '3 Cards',
    icon: 'business_center',
    illustration: '/assets/tarot/art/career_illustration.jpg',
    description: 'Find clarity in your work, ambitions and life purpose.',
    instructions: 'Select three cards to examine your current vocational skills, active work friction, and breakthrough path.',
    selectionRules: {
      maxSelect: 3,
      allowDuplicateCards: false,
      dateAnchored: false
    },
    interpretationTemplate: 'vocational_calling_synthesis',
    availability: 'FREE',
    premiumStatus: false,
    version: '1.0.0',
    positions: [
      {
        index: 0,
        id: 'talent',
        name: '1. Innate Talent & Calling',
        subtitle: 'Core Vocational Seed',
        description: 'The distinct strengths and skills your soul brings to current professional endeavors.',
        contextTag: 'TALENT'
      },
      {
        index: 1,
        id: 'friction',
        name: '2. Active Friction & Test',
        subtitle: 'Karmic Obstacle',
        description: 'The internal fear, external bureaucracy, or market pressure requiring strategic mastery.',
        contextTag: 'OBSTACLE'
      },
      {
        index: 2,
        id: 'breakthrough',
        name: '3. Breakthrough Horizon',
        subtitle: 'Strategic Mastery',
        description: 'The decisive breakthrough mindset that elevates your career trajectory.',
        contextTag: 'HORIZON'
      }
    ]
  },
  {
    id: 'guidance_cross',
    name: 'Cross of Guidance',
    category: 'DEEP_DIVE',
    cardCount: 5,
    tag: 'Comprehensive Insight',
    badge: '5 Cards',
    icon: 'explore',
    illustration: '/assets/tarot/art/cross_illustration.jpg',
    description: 'Explore deeper answers and guidance for your specific question.',
    instructions: 'Choose five cards for a multifaceted reading of your situation’s core, roots, conscious crown, and future trajectory.',
    selectionRules: {
      maxSelect: 5,
      allowDuplicateCards: false,
      dateAnchored: false
    },
    interpretationTemplate: 'five_fold_cross_synthesis',
    availability: 'PREMIUM',
    premiumStatus: true,
    version: '1.0.0',
    positions: [
      { index: 0, id: 'core', name: '1. Core Crucible', subtitle: 'Heart of the Inquiry', description: 'The fundamental lesson and essential nature of your situation.', contextTag: 'CORE' },
      { index: 1, id: 'cross', name: '2. Cross-Current', subtitle: 'Challenging Catalyst', description: 'What crosses you: unexpected catalysts, resistance, or hidden lessons.', contextTag: 'CROSS' },
      { index: 2, id: 'root', name: '3. Subconscious Root', subtitle: 'Unconscious Origin', description: 'Deep psychological or karmic patterns anchoring this cycle.', contextTag: 'ROOT' },
      { index: 3, id: 'crown', name: '4. Conscious Crown', subtitle: 'Highest Aspiration', description: 'What is entering conscious awareness; your elevated spiritual aim.', contextTag: 'CROWN' },
      { index: 4, id: 'horizon', name: '5. Emerging Horizon', subtitle: 'Dharmic Resolution', description: 'The synthesis and trajectory guiding your next evolutionary step.', contextTag: 'DESTINY' }
    ]
  }
];

// Hash map for both canonical IDs and legacy alias IDs
export const TAROT_SPREADS_MAP = {};
TAROT_SPREADS.forEach(s => {
  TAROT_SPREADS_MAP[s.id] = s;
  if (s.aliasId) {
    TAROT_SPREADS_MAP[s.aliasId] = s;
  }
});
// Legacy aliases mappings for test compatibility
TAROT_SPREADS_MAP['single_daily'] = TAROT_SPREADS.find(s => s.id === 'daily');
TAROT_SPREADS_MAP['love_union'] = TAROT_SPREADS.find(s => s.id === 'love');
TAROT_SPREADS_MAP['trinity_time'] = TAROT_SPREADS.find(s => s.id === 'classic');

export function getSpreadById(id) {
  return TAROT_SPREADS_MAP[id] || TAROT_SPREADS[0];
}
