/**
 * Safety Classifier for Ask the Oracle
 * Ensures deterministic protection on high-stakes, medical, legal, financial, and self-harm queries.
 * Conforms strictly to Kai RegAI Ethics & Biometric Guidelines.
 */

import { SAFETY_CATEGORIES, ORACLE_OUTCOMES } from '../types/oracleTypes.js';

const MEDICAL_KEYWORDS = [
  'doctor', 'hospital', 'disease', 'cure', 'medicine', 'medication', 'surgery',
  'sick', 'illness', 'diagnose', 'diagnosis', 'symptom', 'symptoms', 'pregnant',
  'pregnancy', 'cancer', 'tumor', 'therapy', 'prescription', 'infection', 'physician'
];

const LEGAL_KEYWORDS = [
  'lawyer', 'attorney', 'court', 'lawsuit', 'judge', 'sue', 'suing', 'arrest',
  'arrested', 'jail', 'prison', 'crime', 'felony', 'custody battle', 'divorce trial'
];

const FINANCIAL_HIGH_STAKES_KEYWORDS = [
  'invest all', 'all my savings', 'all in', 'borrow money to invest', 'crypto life savings',
  'mortgage house to', 'bet my savings', 'bankrupt', 'bankruptcy'
];

const GAMBLING_KEYWORDS = [
  'casino', 'roulette', 'lottery', 'jackpot', 'gamble', 'gambling', 'slots',
  'poker bet', 'bet on', 'wagering', 'lotto ticket'
];

const SELF_HARM_KEYWORDS = [
  'kill myself', 'suicide', 'end my life', 'hurt myself', 'die today', 'self-harm',
  'cut myself', 'overdose', 'poison myself'
];

const DANGEROUS_ACTIVITY_KEYWORDS = [
  'drive drunk', 'shoot someone', 'run away and hide', 'take weapon', 'commit crime'
];

/**
 * Evaluates whether a question touches sensitive, high-stakes domains
 * @param {string} text Question string
 * @returns {{ isSafe: boolean, safetyCategory: string|null, response: object|null }}
 */
export function evaluateSafety(text = '') {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, safetyCategory: null, response: null };
  }

  const normalized = text.toLowerCase().trim();

  // 1. Self-Harm (Highest Priority)
  if (SELF_HARM_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      isSafe: false,
      safetyCategory: SAFETY_CATEGORIES.SELF_HARM,
      response: {
        id: 'safety_self_harm',
        category: 'SAFETY',
        outcome: ORACLE_OUTCOMES.PAUSE_AND_REFLECT,
        title: 'Your well-being is sacred',
        message: 'Your life and presence hold deep value. If you are experiencing distress or overwhelming thoughts, please reach out to loved ones or a qualified support counselor immediately.',
        reflection: 'You do not have to carry heavy burdens in solitude. Compassionate help is always available.',
        isHighStakesNotice: true
      }
    };
  }

  // 2. Dangerous Activities
  if (DANGEROUS_ACTIVITY_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      isSafe: false,
      safetyCategory: SAFETY_CATEGORIES.DANGEROUS_ACTIVITY,
      response: {
        id: 'safety_dangerous_activity',
        category: 'SAFETY',
        outcome: ORACLE_OUTCOMES.PAUSE_AND_REFLECT,
        title: 'Choose safety and restraint',
        message: 'The Oracle cannot endorse actions that risk physical safety or harm. Step back, take a breath, and choose a peaceful and prudent path.',
        reflection: 'True wisdom consistently guards life, health, and ethical conduct.',
        isHighStakesNotice: true
      }
    };
  }

  // 3. Medical / Healthcare
  if (MEDICAL_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      isSafe: false,
      safetyCategory: SAFETY_CATEGORIES.MEDICAL,
      response: {
        id: 'safety_medical',
        category: 'SAFETY',
        outcome: ORACLE_OUTCOMES.PAUSE_AND_REFLECT,
        title: 'Seek qualified medical guidance',
        message: 'The Oracle is an intuitive and philosophical contemplation tool, not a medical guide. Please consult a licensed healthcare professional for health and diagnosis decisions.',
        reflection: 'Respecting the physical vessel requires the care and training of qualified physicians.',
        isHighStakesNotice: true
      }
    };
  }

  // 4. Legal Decisions
  if (LEGAL_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      isSafe: false,
      safetyCategory: SAFETY_CATEGORIES.LEGAL,
      response: {
        id: 'safety_legal',
        category: 'SAFETY',
        outcome: ORACLE_OUTCOMES.PAUSE_AND_REFLECT,
        title: 'Rely on professional legal advice',
        message: 'For legal decisions, rights, and courtroom matters, rely on qualified legal counsel rather than an Oracle reading.',
        reflection: 'Clear statutory rules and professional counsel are essential when navigating legal affairs.',
        isHighStakesNotice: true
      }
    };
  }

  // 5. High-Stakes Financial
  if (FINANCIAL_HIGH_STAKES_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      isSafe: false,
      safetyCategory: SAFETY_CATEGORIES.FINANCIAL_HIGH_STAKES,
      response: {
        id: 'safety_financial_high_stakes',
        category: 'SAFETY',
        outcome: ORACLE_OUTCOMES.PAUSE_AND_REFLECT,
        title: 'Protect your material foundation',
        message: 'The Oracle cannot decide critical financial matters for you. Pause, gather reliable independent information, and consider your circumstances before committing resources.',
        reflection: 'Enduring material security is built through careful analysis rather than speculative gambles.',
        isHighStakesNotice: true
      }
    };
  }

  // 6. Gambling
  if (GAMBLING_KEYWORDS.some(kw => normalized.includes(kw))) {
    return {
      isSafe: false,
      safetyCategory: SAFETY_CATEGORIES.GAMBLING,
      response: {
        id: 'safety_gambling',
        category: 'SAFETY',
        outcome: ORACLE_OUTCOMES.PAUSE_AND_REFLECT,
        title: 'The Oracle does not predict chance',
        message: 'The Oracle does not provide numbers, bets, or gambling predictions. True personal fortune is cultivated through purposeful action and inner alignment.',
        reflection: 'Relying upon games of chance drains the vital spirit that could build authentic prosperity.',
        isHighStakesNotice: true
      }
    };
  }

  return { isSafe: true, safetyCategory: null, response: null };
}
