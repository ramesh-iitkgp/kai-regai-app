/**
 * Oracle Response Selector & Outcome Weighted Distribution Engine
 * Enforces controlled probabilities, duplicate prevention, and seeded selection.
 */

import { ORACLE_CATEGORIES, ORACLE_OUTCOMES, OUTCOME_WEIGHTS } from '../types/oracleTypes.js';
import { createMulberryPRNG } from './seedGenerator.js';
import { LOVE_RESPONSES } from '../data/loveResponses.js';
import { CAREER_RESPONSES } from '../data/careerResponses.js';
import { MONEY_RESPONSES } from '../data/moneyResponses.js';
import { RELATIONSHIP_RESPONSES } from '../data/relationshipResponses.js';
import { PERSONAL_RESPONSES } from '../data/personalResponses.js';
import { GENERAL_RESPONSES } from '../data/generalResponses.js';

export const ALL_RESPONSES_BY_CATEGORY = {
  [ORACLE_CATEGORIES.LOVE]: LOVE_RESPONSES,
  [ORACLE_CATEGORIES.CAREER]: CAREER_RESPONSES,
  [ORACLE_CATEGORIES.MONEY]: MONEY_RESPONSES,
  [ORACLE_CATEGORIES.RELATIONSHIP]: RELATIONSHIP_RESPONSES,
  [ORACLE_CATEGORIES.PERSONAL]: PERSONAL_RESPONSES,
  [ORACLE_CATEGORIES.GENERAL]: GENERAL_RESPONSES
};

/**
 * Maps a float in [0, 1) to an outcome according to weighted distribution
 * @param {number} roll Float between 0 and 1
 * @param {object} [customWeights=OUTCOME_WEIGHTS]
 * @returns {string} One of ORACLE_OUTCOMES
 */
export function rollOutcome(roll, customWeights = OUTCOME_WEIGHTS) {
  let cumulative = 0;
  const outcomes = [
    ORACLE_OUTCOMES.YES,
    ORACLE_OUTCOMES.LEANING_YES,
    ORACLE_OUTCOMES.UNCERTAIN,
    ORACLE_OUTCOMES.LEANING_NO,
    ORACLE_OUTCOMES.NO,
    ORACLE_OUTCOMES.PAUSE_AND_REFLECT
  ];

  for (const outcome of outcomes) {
    cumulative += customWeights[outcome] || 0;
    if (roll < cumulative) {
      return outcome;
    }
  }

  return ORACLE_OUTCOMES.PAUSE_AND_REFLECT;
}

/**
 * Selects an Oracle response using seeded PRNG and avoiding recent response IDs
 * @param {object} options
 * @param {string} options.category Category key
 * @param {number} options.seed Seed for PRNG
 * @param {string[]} [options.recentResponseIds=[]] List of recently delivered response IDs
 * @param {object} [options.weights=OUTCOME_WEIGHTS] Custom weights if desired
 * @returns {object} Selected response record
 */
export function selectOracleResponse({
  category = ORACLE_CATEGORIES.GENERAL,
  seed,
  recentResponseIds = [],
  weights = OUTCOME_WEIGHTS
}) {
  const prng = createMulberryPRNG(seed);
  const outcomeRoll = prng();
  const targetOutcome = rollOutcome(outcomeRoll, weights);

  // 1. Get pool of responses for category
  const categoryPool = ALL_RESPONSES_BY_CATEGORY[category] || GENERAL_RESPONSES;

  // 2. Filter by targeted outcome
  let candidates = categoryPool.filter(r => r.outcome === targetOutcome);

  // If category has no exact match for this outcome, fallback to general pool with this outcome
  if (candidates.length === 0) {
    candidates = GENERAL_RESPONSES.filter(r => r.outcome === targetOutcome);
  }

  // If still empty (edge case), use whole category pool
  if (candidates.length === 0) {
    candidates = categoryPool;
  }

  // 3. Avoid recently delivered response IDs to prevent duplicate fatigue
  const freshCandidates = candidates.filter(r => !recentResponseIds.includes(r.id));
  const finalPool = freshCandidates.length > 0 ? freshCandidates : candidates;

  // 4. Deterministic pick from candidate pool
  const pickIndex = Math.floor(prng() * finalPool.length);
  return finalPool[pickIndex];
}
