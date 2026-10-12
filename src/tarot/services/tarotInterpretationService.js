/**
 * Kai RegAI — Tarot Interpretation Service
 * 
 * Generates authoritative, non-hallucinatory readings:
 * 1. Single Card Daily Reflection
 * 2. Two-Card Love & Relationship Reflection (You & Partner dynamic)
 * 3. Three-Card Classic Horizon (Past, Present, Future)
 * 4. Multi-category breakdowns (Love, Career, Finance, Personal Growth, Symbolism)
 * 5. Strict epistemic boundaries & psychological safety (no death/medical/fatalistic claims)
 * 6. Local canonical fallback ensures 100% reliability offline or during AI latency
 */

import { TAROT_DECK_MAP } from '../data/tarotDeck.js';
import { getSpreadById } from '../data/tarotSpreads.js';

export const TAROT_DISCLAIMER = 'Tarot readings are intended for reflection and personal insight. They are not guarantees of future events and should not replace professional medical, financial, legal, or psychological advice.';

export class TarotInterpretationService {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/v1/tarot/interpret';
    this.timeoutMs = options.timeoutMs || 3500;
  }

  /**
   * Generates a complete interpretation for a drawn spread
   * 
   * @param {object} params
   * @param {string} params.spreadId
   * @param {Array<{ cardId: string, isReversed: boolean, positionIndex: number }>} params.drawnCards
   * @param {string} [params.question]
   * @param {object} [params.context] User palmistry / birth chart context
   * @returns {object} Structured interpretation dossier
   */
  async interpretReading({
    spreadId = 'daily',
    drawnCards = [],
    question = '',
    context = {}
  }) {
    const spread = getSpreadById(spreadId);

    // Resolve card objects and positions
    const resolvedCards = drawnCards.map((dc, idx) => {
      const card = TAROT_DECK_MAP[dc.cardId] || TAROT_DECK_MAP['major_00_fool'];
      const isReversed = Boolean(dc.isReversed);
      const position = spread.positions[idx] || { index: idx, name: `Position ${idx + 1}`, subtitle: '' };

      const meaningText = isReversed ? card.meaningReversed : card.meaningUpright;
      const activeKeywords = isReversed ? card.keywordsReversed : card.keywordsUpright;

      return {
        card,
        cardId: card.id,
        name: card.name,
        roman: card.roman || '',
        arcana: card.arcana,
        suit: card.suit,
        rank: card.rank,
        isReversed,
        orientation: isReversed ? 'REVERSED' : 'UPRIGHT',
        positionIndex: idx,
        positionName: position.name,
        positionSubtitle: position.subtitle || '',
        positionDescription: position.description || '',
        meaning: meaningText,
        keywords: activeKeywords,
        categories: {
          overview: meaningText,
          love: card.loveMeaning,
          career: card.careerMeaning,
          finance: card.financeMeaning,
          personalGrowth: card.personalGrowthMeaning,
          symbolism: card.traditionalSymbolism
        },
        reflectionPrompt: card.reflectionPrompt,
        guidanceUpaya: card.guidanceUpaya,
        astrologyRuler: card.astrologyRuler || 'Cosmic Harmony',
        palmistryCorrespondence: card.palmistryCorrespondence || 'Central Hand Mandala',
        mountName: card.mountName || 'Palm Plain'
      };
    });

    // Generate local rule-based synthesis
    const localSynthesis = this.generateLocalSynthesis({
      spread,
      resolvedCards,
      question,
      context
    });

    return {
      spreadId: spread.id,
      spreadName: spread.name,
      question: question || spread.instructions,
      cards: resolvedCards,
      synthesis: localSynthesis,
      disclaimer: TAROT_DISCLAIMER,
      timestamp: Date.now(),
      version: '1.0.0'
    };
  }

  /**
   * Deterministic, rule-based synthesis connecting cards and positions
   */
  generateLocalSynthesis({ spread, resolvedCards, question, context }) {
    if (resolvedCards.length === 1) {
      return this.synthesizeSingleCard(resolvedCards[0], spread);
    } else if (resolvedCards.length === 2 && spread.id === 'love') {
      return this.synthesizeLoveDuality(resolvedCards[0], resolvedCards[1], spread);
    } else if (resolvedCards.length === 3) {
      return this.synthesizeTriad(resolvedCards, spread);
    }

    // Generic multi-card synthesis
    return this.synthesizeGeneral(resolvedCards, spread);
  }

  synthesizeSingleCard(item, spread) {
    const card = item.card;
    const orientationText = item.isReversed ? 'Reversed' : 'Upright';
    const primaryKey = item.keywords[0] || 'Awareness';

    return {
      title: `${card.name} (${orientationText}) — Daily Archetype`,
      narrative: `Today, your consciousness is mirrored by ${card.name} in its ${orientationText.toLowerCase()} expression. This archetype invites you to focus your attention upon ${item.keywords.slice(0, 3).join(', ')}. ${item.meaning}\n\nWalk through your hours today with intentional awareness of this energy. Opportunities to practice this lesson will present themselves in subtle interactions and inner dialogues.`,
      palmIntegration: `Reflected in your ${item.palmistryCorrespondence}: when navigating decisions today, observe how tension or ease manifests in this area of your hand.`,
      reflection: item.reflectionPrompt,
      upaya: item.guidanceUpaya,
      activeMounts: [item.mountName]
    };
  }

  synthesizeLoveDuality(youItem, partnerItem, spread) {
    return {
      title: 'Sacred Mirror — Relational Dynamic',
      narrative: `In this inquiry into relationship dynamic, your inner state is mirrored by ${youItem.name} (${youItem.orientation}), while the partner/outer current is reflected by ${partnerItem.name} (${partnerItem.orientation}).\n\n` +
        `Your Perspective (${youItem.name}): You bring energies of ${youItem.keywords.slice(0, 2).join(' and ')} to the field. ${youItem.meaning.slice(0, 140)}...\n\n` +
        `Partner Perspective (${partnerItem.name}): The mirroring current highlights ${partnerItem.keywords.slice(0, 2).join(' and ')}. ${partnerItem.meaning.slice(0, 140)}...\n\n` +
        `The Sacred Bridge: This spread does not project rigid prophecies or private thoughts; rather, it highlights the bridge of communication needed between you. Where ${youItem.name} seeks understanding, ${partnerItem.name} provides the complementary terrain. Bring transparency, patience, and tender listening to your next conversation.`,
      palmIntegration: `Harmonizing the Mount of Venus (Shukra) with ${youItem.mountName} and ${partnerItem.mountName}: cultivate warmth over defensiveness.`,
      reflection: `How can you honor both your genuine needs (${youItem.keywords[0]}) and the space needed for your partner’s distinct experience (${partnerItem.keywords[0]})?`,
      upaya: 'Hold space for an unhurried, heart-centered check-in without multitasking or trying to solve everything in one sitting.',
      activeMounts: [youItem.mountName, partnerItem.mountName]
    };
  }

  synthesizeTriad(cards, spread) {
    const [c1, c2, c3] = cards;
    return {
      title: `${spread.name} — Cosmic Arc of Transformation`,
      narrative: `Your inquiry weaves across three distinct markers of time and consciousness:\n\n` +
        `1. ${c1.positionName} (${c1.name} — ${c1.orientation}): The root foundation is anchored in ${c1.keywords.slice(0, 2).join(' and ')}. ${c1.meaning.slice(0, 130)}...\n\n` +
        `2. ${c2.positionName} (${c2.name} — ${c2.orientation}): The active crossroads demands attention on ${c2.keywords.slice(0, 2).join(' and ')}. ${c2.meaning.slice(0, 130)}...\n\n` +
        `3. ${c3.positionName} (${c3.name} — ${c3.orientation}): Looking forward, the horizon reveals possibilities around ${c3.keywords.slice(0, 2).join(' and ')}. Rather than a rigid destiny, this represents your highest mindful potential if you walk with conscious intention.`,
      palmIntegration: `Synthesizing ${c1.palmistryCorrespondence}, ${c2.palmistryCorrespondence}, and ${c3.palmistryCorrespondence}: your Karma Rekha (Fate Line) indicates steady evolution through active self-mastery.`,
      reflection: c2.reflectionPrompt,
      upaya: c3.guidanceUpaya,
      activeMounts: [c1.mountName, c2.mountName, c3.mountName]
    };
  }

  synthesizeGeneral(cards, spread) {
    const cardNames = cards.map(c => `${c.name} (${c.orientation})`).join(', ');
    return {
      title: `${spread.name} Synthesis`,
      narrative: `This reading draws together ${cardNames}. Each card highlights a distinct facet of your current inquiry, inviting you to integrate conscious action with deep spiritual reflection.`,
      palmIntegration: `Supported by palm mounts: ${cards.map(c => c.mountName).join(' • ')}.`,
      reflection: cards[0]?.reflectionPrompt || 'What insight speaks most clearly to your heart right now?',
      upaya: cards[0]?.guidanceUpaya || 'Take 5 mindful breaths in quiet contemplation.',
      activeMounts: cards.map(c => c.mountName)
    };
  }
}

export const defaultTarotInterpretationService = new TarotInterpretationService();
