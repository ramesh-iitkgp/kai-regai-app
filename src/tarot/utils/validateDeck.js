/**
 * Kai RegAI — Tarot Deck Validator
 * 
 * Automated validation suite enforcing deck integrity:
 * - Exactly 78 unique card IDs
 * - Exactly 22 Major Arcana cards
 * - Exactly 56 Minor Arcana cards
 * - All four suits have all 14 ranks (ace through king)
 * - Valid canonical names, images, upright and reversed meanings
 * - Valid category interpretations (love, career, finance, personal growth)
 */

import { TAROT_DECK, MAJOR_ARCANA, MINOR_ARCANA } from '../data/tarotDeck.js';

const EXPECTED_RANKS = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king'];
const EXPECTED_SUITS = ['wands', 'cups', 'swords', 'pentacles'];

export function validateTarotDeck(deck = TAROT_DECK) {
  const errors = [];
  const warnings = [];

  // 1. Total Card Count Check
  if (deck.length !== 78) {
    errors.push(`Expected 78 cards in master deck, found ${deck.length}`);
  }

  // 2. Arcana Division Counts
  const majors = deck.filter(c => c.arcana === 'major');
  const minors = deck.filter(c => c.arcana === 'minor');

  if (majors.length !== 22) {
    errors.push(`Expected exactly 22 Major Arcana cards, found ${majors.length}`);
  }
  if (minors.length !== 56) {
    errors.push(`Expected exactly 56 Minor Arcana cards, found ${minors.length}`);
  }

  // 3. ID Uniqueness Check
  const idSet = new Set();
  deck.forEach(c => {
    if (!c.id) {
      errors.push(`Card with name "${c.name}" is missing an id`);
    } else if (idSet.has(c.id)) {
      errors.push(`Duplicate card id detected: "${c.id}"`);
    } else {
      idSet.add(c.id);
    }
  });

  // 4. Suit and Rank Coverage for Minor Arcana
  EXPECTED_SUITS.forEach(suit => {
    const suitCards = minors.filter(c => c.suit === suit);
    if (suitCards.length !== 14) {
      errors.push(`Suit "${suit}" has ${suitCards.length} cards, expected 14`);
    }

    EXPECTED_RANKS.forEach(rank => {
      const found = suitCards.find(c => c.rank === rank);
      if (!found) {
        errors.push(`Suit "${suit}" is missing rank "${rank}"`);
      }
    });
  });

  // 5. Schema Completeness per Card
  deck.forEach(card => {
    const cid = card.id || 'unknown';

    if (!card.name || typeof card.name !== 'string') {
      errors.push(`Card ${cid} is missing a valid name`);
    }
    if (!card.image || typeof card.image !== 'string') {
      errors.push(`Card ${cid} is missing image reference`);
    }
    if (!card.keywordsUpright || card.keywordsUpright.length < 2) {
      errors.push(`Card ${cid} requires at least 2 upright keywords`);
    }
    if (!card.keywordsReversed || card.keywordsReversed.length < 2) {
      errors.push(`Card ${cid} requires at least 2 reversed keywords`);
    }
    if (!card.meaningUpright || card.meaningUpright.length < 30) {
      errors.push(`Card ${cid} is missing or has truncated meaningUpright`);
    }
    if (!card.meaningReversed || card.meaningReversed.length < 30) {
      errors.push(`Card ${cid} is missing or has truncated meaningReversed`);
    }
    if (!card.loveMeaning || card.loveMeaning.length < 15) {
      errors.push(`Card ${cid} is missing loveMeaning`);
    }
    if (!card.careerMeaning || card.careerMeaning.length < 15) {
      errors.push(`Card ${cid} is missing careerMeaning`);
    }
    if (!card.financeMeaning || card.financeMeaning.length < 15) {
      errors.push(`Card ${cid} is missing financeMeaning`);
    }
    if (!card.personalGrowthMeaning || card.personalGrowthMeaning.length < 15) {
      errors.push(`Card ${cid} is missing personalGrowthMeaning`);
    }
    if (!card.reflectionPrompt || card.reflectionPrompt.length < 10) {
      errors.push(`Card ${cid} is missing reflectionPrompt`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalCards: deck.length,
    majorCount: majors.length,
    minorCount: minors.length,
    errors,
    warnings
  };
}
