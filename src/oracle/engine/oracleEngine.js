/**
 * Oracle Engine Master Service
 * Coordinates validation, safety gating, classification, seeded generation, and session memory.
 */

import { validateQuestion, classifyQuestionCategory } from './questionClassifier.js';
import { evaluateSafety } from './safetyClassifier.js';
import { generateOracleSeed, hashString } from './seedGenerator.js';
import { selectOracleResponse } from './responseSelector.js';
import { ORACLE_CATEGORIES, OUTCOME_WEIGHTS } from '../types/oracleTypes.js';

export class OracleEngine {
  constructor() {
    this.sessionRecentResponseIds = []; // max 5
    this.sessionRecentQuestionHashes = []; // max 5
  }

  /**
   * Clears short-term session history (for reset / testing)
   */
  resetSession() {
    this.sessionRecentResponseIds = [];
    this.sessionRecentQuestionHashes = [];
  }

  /**
   * Consult the Oracle with a user question
   * @param {string} rawQuestion Question entered by user
   * @param {object} [context={}] Optional future-ready context (dominantHand, birthData, palmInsights)
   * @returns {{ success: boolean, error?: string, response?: object, category?: string, isSafetyNotice?: boolean }}
   */
  consult(rawQuestion, context = {}) {
    // 1. Validation
    const validation = validateQuestion(rawQuestion);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const question = validation.sanitizedText;
    const qHash = hashString(question);

    // 2. Safety Gating
    const safetyCheck = evaluateSafety(question);
    if (!safetyCheck.isSafe && safetyCheck.response) {
      // Record safety response in history to track interaction
      this._recordHistory(safetyCheck.response.id, qHash);

      return {
        success: true,
        isSafetyNotice: true,
        category: safetyCheck.safetyCategory,
        response: {
          ...safetyCheck.response,
          question
        }
      };
    }

    // 3. Category Detection
    const category = context.category || classifyQuestionCategory(question);

    // 4. Repeated Question Handling:
    // If exact same question was asked recently in this session, increment a salt to vary response organically
    const repeatCount = this.sessionRecentQuestionHashes.filter(h => h === qHash).length;
    const seed = generateOracleSeed(question, 1800000, repeatCount);

    // 5. Response Selection
    const selected = selectOracleResponse({
      category,
      seed,
      recentResponseIds: this.sessionRecentResponseIds,
      weights: OUTCOME_WEIGHTS
    });

    // 6. Record session history
    this._recordHistory(selected.id, qHash);

    return {
      success: true,
      isSafetyNotice: false,
      category,
      response: {
        ...selected,
        question,
        context: {
          ...context,
          dominantHand: context.dominantHand || null
        }
      }
    };
  }

  _recordHistory(responseId, questionHash) {
    this.sessionRecentResponseIds.unshift(responseId);
    if (this.sessionRecentResponseIds.length > 5) {
      this.sessionRecentResponseIds.pop();
    }

    this.sessionRecentQuestionHashes.unshift(questionHash);
    if (this.sessionRecentQuestionHashes.length > 5) {
      this.sessionRecentQuestionHashes.pop();
    }
  }
}

// Global singleton instance
export const oracleEngine = new OracleEngine();
