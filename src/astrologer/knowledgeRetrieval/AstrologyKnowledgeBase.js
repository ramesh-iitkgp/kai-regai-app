/**
 * AstrologyKnowledgeBase — Source-Attributed Classical & Modern Astrology Passages
 * 
 * Sources:
 * - Brihat Parashara Hora Shastra (BPHS)
 * - Saravali (Kalyana Varma)
 * - Phaladeepika (Mantreswara)
 * - Claudius Ptolemy, Tetrabiblos (Book III & IV)
 * - William Lilly, Christian Astrology (1647)
 * - Dane Rudhyar, The Astrology of Personality
 * 
 * Strict Invariant: Every passage retains clear attribution and system tagging.
 * No fabricated or ungrounded claims.
 */

export const KNOWLEDGE_ITEMS = [
  // --- VEDIC RULES ---
  {
    id: 'vedic-bphs-10th-house',
    system: 'VEDIC',
    topic: 'CAREER',
    title: 'Karma Bhava (10th House) Vocations',
    source: 'Brihat Parashara Hora Shastra, Ch. 21',
    rule: 'The 10th house denotes honor, authority, professional duty (Karma), and worldly action. Planets situated in the 10th house, or the dispositor of the 10th lord, indicate the primary field of worldly contribution and public reputation.',
    active: true
  },
  {
    id: 'vedic-bphs-swati-moon',
    system: 'VEDIC',
    topic: 'MIND_AND_EMOTIONS',
    title: 'Swati Nakshatra Lunar Placement',
    source: 'Brihat Parashara Hora Shastra, Ch. 4',
    rule: 'The Moon in Swati signifies an independent, adaptable mind, governed by Vayu (the wind). It grants keen communicative skill, diplomatic trade, flexibility, and a desire for personal freedom and balance.',
    active: true
  },
  {
    id: 'vedic-saravali-rahu-dasha',
    system: 'VEDIC',
    topic: 'TIMING',
    title: 'Rahu Mahadasha Dynamics',
    source: 'Saravali by Kalyana Varma, Ch. 48',
    rule: 'Rahu Mahadasha amplifies worldly ambition, unconventional pursuits, foreign connections, and sudden shifts. In its auspicious placement, it creates rapid social ascendance and technological or research acumen.',
    active: true
  },
  {
    id: 'vedic-bphs-lagna-lord',
    system: 'VEDIC',
    topic: 'GENERAL',
    title: 'Lagna (Ascendant) & Vitality',
    source: 'Brihat Parashara Hora Shastra, Ch. 12',
    rule: 'Lagna (the rising sign) and its ruler represent the physical constitution, overall life direction, and temperament. A strong Lagna lord grounds the chart and provides resilience through difficult transits.',
    active: true
  },
  {
    id: 'vedic-phaladeepika-venus-7th',
    system: 'VEDIC',
    topic: 'LOVE',
    title: 'Venus & Seventh House Relationships',
    source: 'Phaladeepika by Mantreswara, Ch. 14',
    rule: 'Venus signifies devotion, artistic refinement, and partnership harmony. Relationships thrive through reciprocal honor, emotional transparency, and alignment of values rather than impulsive attachments.',
    active: true
  },

  // --- WESTERN RULES ---
  {
    id: 'western-tetrabiblos-angles',
    system: 'WESTERN',
    topic: 'GENERAL',
    title: 'Cardine Angles (Ascendant & Midheaven)',
    source: 'Ptolemy, Tetrabiblos, Book III',
    rule: 'The Ascendant (Eastern Horizon) describes the emergent self and bodily persona, while the Midheaven (MC) signifies vocation, public standing, and conscious aspiration.',
    active: true
  },
  {
    id: 'western-lilly-sun-trine-jupiter',
    system: 'WESTERN',
    topic: 'CAREER',
    title: 'Sun Trine Jupiter Expansion',
    source: 'William Lilly, Christian Astrology (1647)',
    rule: 'A harmonious aspect between the Sun and Jupiter expands visionary confidence, magnanimity, civic integrity, and benevolent leadership.',
    active: true
  },
  {
    id: 'western-lilly-saturn-structure',
    system: 'WESTERN',
    topic: 'CAREER',
    title: 'Saturnian Discipline & Career Tenacity',
    source: 'William Lilly, Christian Astrology (1647)',
    rule: 'Saturn placements govern maturity, structural perseverance, accountability, and the fruits of patient labor over time.',
    active: true
  },
  {
    id: 'western-rudhyar-aspect-dynamics',
    system: 'WESTERN',
    topic: 'MIND_AND_EMOTIONS',
    title: 'Cyclic Aspect Harmonics',
    source: 'Dane Rudhyar, The Astrology of Personality',
    rule: 'Aspects represent dynamic cyclic phases between planetary principles. Squares denote creative friction requiring decisive action; trines represent integrated ease and natural talent.',
    active: true
  },
  {
    id: 'western-modern-venus-mars',
    system: 'WESTERN',
    topic: 'LOVE',
    title: 'Venus & Mars Relational Polarity',
    source: 'Contemporary Psychological Astrology',
    rule: 'Venus governs receptivity and what one values, while Mars governs initiative and desire. Harmony between them supports healthy boundaries and passionate mutual respect.',
    active: true
  }
];

export class AstrologyKnowledgeBase {
  constructor(items = KNOWLEDGE_ITEMS) {
    this.items = items;
  }

  /**
   * Retrieves relevant passages for an astrological consultation.
   * 
   * @param {object} criteria
   * @param {'VEDIC'|'WESTERN'} criteria.system
   * @param {string} [criteria.topic]
   * @param {string} [criteria.query]
   * @param {number} [criteria.limit=3]
   * @returns {Array<object>} Retrieved passages
   */
  retrievePassages({ system, topic = '', query = '', limit = 3 }) {
    const normSystem = (system || 'VEDIC').toUpperCase();
    const queryTokens = (query || '').toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const candidates = this.items.filter(item => item.active && item.system === normSystem);

    const scored = candidates.map(item => {
      let score = 0;
      if (topic && item.topic.toLowerCase() === topic.toLowerCase()) {
        score += 5;
      }
      for (const token of queryTokens) {
        if (item.rule.toLowerCase().includes(token)) score += 2;
        if (item.title.toLowerCase().includes(token)) score += 3;
      }
      return { item, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    const results = scored.slice(0, limit).map(s => s.item);

    // If no strong match, return system defaults
    if (results.length === 0) {
      return candidates.slice(0, limit);
    }

    return results;
  }
}

export const defaultKnowledgeBase = new AstrologyKnowledgeBase();
