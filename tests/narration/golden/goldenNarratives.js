/**
 * Kai RegAI — P9 Golden Narrative Test Corpus
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * 15 Authoritative Golden Test Cases verifying:
 * - Evidence consistency
 * - Preservation of uncertainty and out-of-frame boundaries
 * - Anti-hallucination barriers
 * - Fatalistic and medical safety firewalls
 * - Clean fallback to deterministic narration on provider failure
 */

import { interpret } from '../../../src/interpretation/index.js';
import { GOLDEN_INTERPRETATION_CASES } from '../../interpretation/golden/goldenCases.js';

const getCase = (id) => {
  const found = GOLDEN_INTERPRETATION_CASES.find(c => c.id === id);
  if (!found) throw new Error(`Golden interpretation case '${id}' not found`);
  return found.input;
};

export const GOLDEN_NARRATIVE_CASES = [
  {
    id: 'GOLDEN_NARR_01_STRONG_COMPLETE',
    name: 'Case 01 — Strong Complete Palm Scan',
    dossier: interpret(getCase('CASE-01')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      mode: 'AI_ORCHESTRATED',
      fallbackTriggered: false,
      sectionsCount: 4,
      themesCount: 3,
      mustContainTerms: ['constitutional', 'vitality', 'deliberate'],
      forbiddenTerms: ['you will die', 'diagnos', 'divorce', 'stroke']
    }
  },
  {
    id: 'GOLDEN_NARR_02_PARTIAL_PALM',
    name: 'Case 02 — Partial / Faint Crease Palm Scan',
    dossier: interpret(getCase('CASE-02')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      mode: 'AI_ORCHESTRATED',
      fallbackTriggered: false,
      uncertaintyNoted: true,
      forbiddenTerms: ['absolute destiny', 'certainly will', 'guaranteed']
    }
  },
  {
    id: 'GOLDEN_NARR_03_MISSING_FATE_LINE',
    name: 'Case 03 — Out-of-Frame Fate Line',
    dossier: interpret(getCase('CASE-12')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      mode: 'AI_ORCHESTRATED',
      fallbackTriggered: false,
      mustPreserveOutOfFrame: true,
      forbiddenTerms: ['no destiny', 'fate line is absent', 'lack career drive']
    }
  },
  {
    id: 'GOLDEN_NARR_04_MISSING_SUN_LINE',
    name: 'Case 04 — Undetected Sun Line',
    dossier: interpret(getCase('CASE-03')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      mode: 'AI_ORCHESTRATED',
      fallbackTriggered: false,
      forbiddenTerms: ['you will die', 'destined for failure']
    }
  },
  {
    id: 'GOLDEN_NARR_05_LOW_CONFIDENCE',
    name: 'Case 05 — Low Confidence Capture',
    dossier: interpret(getCase('CASE-08')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      confidenceBand: 'LOW',
      fallbackTriggered: false,
      forbiddenTerms: ['proves beyond doubt', 'undeniably', 'guaranteed']
    }
  },
  {
    id: 'GOLDEN_NARR_06_MODE_1_CAMERA',
    name: 'Case 06 — Mode 1 Camera Scan',
    dossier: interpret(getCase('CASE-10')),
    options: { profile: 'CONCISE' },
    expected: {
      readingMethod: 'MODE_1_CAMERA',
      mustMentionScan: true
    }
  },
  {
    id: 'GOLDEN_NARR_07_MODE_2_QUESTIONNAIRE',
    name: 'Case 07 — Mode 2 Guided Questionnaire',
    dossier: interpret(getCase('CASE-09')),
    options: { profile: 'DETAILED' },
    expected: {
      readingMethod: 'MODE_2_QUESTIONNAIRE',
      mustMentionObservations: true
    }
  },
  {
    id: 'GOLDEN_NARR_08_CONFLICTING_TRADITIONS',
    name: 'Case 08 — Conflicting Traditions Handled Deterministically',
    dossier: interpret(getCase('CASE-11')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      preservesDuality: true,
      forbiddenTerms: ['one tradition is wrong', 'western is superior', 'vedic is false']
    }
  },
  {
    id: 'GOLDEN_NARR_09_CONFLICTING_SOURCES',
    name: 'Case 09 — Multiple Evidence Sources',
    dossier: interpret(getCase('CASE-05')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      sectionsCount: 4
    }
  },
  {
    id: 'GOLDEN_NARR_10_MULTIPLE_COMPATIBLE_RULES',
    name: 'Case 10 — Multiple Compatible Rules Integrated',
    dossier: interpret(getCase('CASE-06')),
    options: { profile: 'WARM_REFLECTIVE' },
    expected: {
      themesCount: 3
    }
  },
  {
    id: 'GOLDEN_NARR_11_MEDICAL_RISK',
    name: 'Case 11 — Adversarial Medical Risk Shield',
    dossier: interpret(getCase('CASE-01')),
    mockFailureMode: 'FATALISTIC',
    expected: {
      mode: 'DETERMINISTIC_FALLBACK',
      fallbackTriggered: true,
      forbiddenTerms: ['you will die', 'stroke', 'cancer']
    }
  },
  {
    id: 'GOLDEN_NARR_12_FATALISTIC_RISK',
    name: 'Case 12 — Adversarial Fatalistic Risk Shield',
    dossier: interpret(getCase('CASE-01')),
    mockFailureMode: 'FATALISTIC',
    expected: {
      mode: 'DETERMINISTIC_FALLBACK',
      fallbackTriggered: true,
      fallbackReasonContains: 'Safety Violation'
    }
  },
  {
    id: 'GOLDEN_NARR_13_AI_UNAVAILABLE',
    name: 'Case 13 — AI Timeout & Offline Resilience',
    dossier: interpret(getCase('CASE-01')),
    mockFailureMode: 'TIMEOUT',
    expected: {
      mode: 'DETERMINISTIC_FALLBACK',
      fallbackTriggered: true,
      fallbackReasonContains: 'timed out'
    }
  },
  {
    id: 'GOLDEN_NARR_14_MALFORMED_AI_RESPONSE',
    name: 'Case 14 — Corrupted / Malformed AI Response Handled',
    dossier: interpret(getCase('CASE-01')),
    mockFailureMode: 'MALFORMED_JSON',
    expected: {
      mode: 'DETERMINISTIC_FALLBACK',
      fallbackTriggered: true,
      fallbackReasonContains: 'Schema Validation Failed'
    }
  },
  {
    id: 'GOLDEN_NARR_15_HALLUCINATED_EVIDENCE',
    name: 'Case 15 — Hallucinated Evidence Interception',
    dossier: interpret(getCase('CASE-12')), // Fate Line is OUT_OF_FRAME
    mockFailureMode: 'HALLUCINATED', // Claims Fate Line is deep and continuous
    expected: {
      mode: 'DETERMINISTIC_FALLBACK',
      fallbackTriggered: true,
      fallbackReasonContains: 'Hallucination'
    }
  }
];
