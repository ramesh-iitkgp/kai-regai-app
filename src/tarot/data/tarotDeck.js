/**
 * Kai RegAI — Master 78-Card Tarot Deck Catalogue
 * 
 * Compliant with Rider–Waite–Smith Standard Deck Convention:
 * - 22 Major Arcana (0 The Fool through XXI The World, Strength at VIII, Justice at XI)
 * - 56 Minor Arcana (Wands, Cups, Swords, Pentacles; Ace through King, 14 per suit)
 * 
 * Every card contains typed schema:
 * - id, name, canonicalName, arcana, suit, rank, deckId, image, backImage
 * - keywordsUpright, keywordsReversed, meaningUpright, meaningReversed
 * - loveMeaning, careerMeaning, financeMeaning, personalGrowthMeaning
 * - reflectionPrompt, traditionalSymbolism, element, numerology, associatedArchetype
 * - astrologyRuler, palmistryCorrespondence, mountName, guidanceUpaya
 */

import { MAJOR_ARCANA } from './majorArcana.js';
import { MINOR_ARCANA } from './minorArcana.js';

export { MAJOR_ARCANA } from './majorArcana.js';
export { MINOR_ARCANA } from './minorArcana.js';

// The complete 78-card master deck
export const TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// Hash map indexed by card ID for O(1) retrieval
export const TAROT_DECK_MAP = Object.fromEntries(TAROT_DECK.map(card => [card.id, card]));

// Helper accessors
export function getCardById(id) {
  return TAROT_DECK_MAP[id] || null;
}

export function getMajorArcana() {
  return MAJOR_ARCANA;
}

export function getMinorArcana() {
  return MINOR_ARCANA;
}

export function getCardsBySuit(suit) {
  return TAROT_DECK.filter(c => c.suit === suit);
}

export function getCardsByElement(element) {
  return TAROT_DECK.filter(c => c.element && c.element.toLowerCase() === element.toLowerCase());
}
