/**
 * Question Classifier & Validator for Ask the Oracle
 * Categorizes user questions into LOVE, CAREER, MONEY, RELATIONSHIP, PERSONAL, or GENERAL.
 * Validates syntax, length, and inquiry clarity.
 */

import { ORACLE_CATEGORIES } from '../types/oracleTypes.js';

const CATEGORY_KEYWORDS = {
  [ORACLE_CATEGORIES.LOVE]: [
    'love', 'romance', 'relationship', 'partner', 'crush', 'marriage', 'dating',
    'soulmate', 'feelings', 'attracted', 'marry', 'boyfriend', 'girlfriend', 'ex',
    'heart', 'fall in love', 'lovers', 'romantic', 'wedding'
  ],
  [ORACLE_CATEGORIES.CAREER]: [
    'job', 'work', 'career', 'business', 'promotion', 'project', 'opportunity',
    'interview', 'boss', 'client', 'study', 'exam', 'hired', 'company', 'startup',
    'position', 'profession', 'colleague', 'coworker', 'vocation', 'contract'
  ],
  [ORACLE_CATEGORIES.MONEY]: [
    'money', 'investment', 'finance', 'savings', 'income', 'purchase', 'buy',
    'wealth', 'debt', 'loan', 'cost', 'pay', 'raise', 'property', 'real estate',
    'finances', 'afford', 'cash'
  ],
  [ORACLE_CATEGORIES.RELATIONSHIP]: [
    'friend', 'family', 'person', 'reconnect', 'trust', 'forgive', 'friendship',
    'mother', 'father', 'brother', 'sister', 'parents', 'sibling', 'conflict',
    'resolve', 'apologize', 'talk to them', 'bond'
  ],
  [ORACLE_CATEGORIES.PERSONAL]: [
    'change', 'decision', 'journey', 'growth', 'confidence', 'intuition', 'path',
    'self', 'myself', 'instinct', 'purpose', 'habit', 'heal', 'peace', 'spiritual',
    'direction', 'move', 'relocate', 'travel', 'restart', 'begin'
  ]
};

/**
 * Validates a user query against input criteria
 * @param {string} text Raw question input
 * @returns {{ isValid: boolean, error?: string, sanitizedText: string }}
 */
export function validateQuestion(text = '') {
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Please enter a question to consult the Oracle.', sanitizedText: '' };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'What would you like to ask the Oracle?', sanitizedText: '' };
  }

  if (trimmed.length > 120) {
    return { isValid: false, error: 'Keep your question short and focused (maximum 120 characters).', sanitizedText: trimmed };
  }

  // Reject excessively brief input like "hi", "?", "a"
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Try asking one clear question to invite meaningful reflection.', sanitizedText: trimmed };
  }

  return { isValid: true, sanitizedText: trimmed };
}

/**
 * Classifies a validated question into one of the 6 canonical Oracle categories
 * @param {string} text Validated question
 * @returns {string} One of ORACLE_CATEGORIES
 */
export function classifyQuestionCategory(text = '') {
  const normalized = text.toLowerCase().trim();

  // Score each category by matching keyword occurrences
  let bestCategory = ORACLE_CATEGORIES.GENERAL;
  let highestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        score += kw.length > 5 ? 2 : 1; // Give slight extra weight to specific compound terms
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}
