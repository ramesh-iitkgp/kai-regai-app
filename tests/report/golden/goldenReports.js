/**
 * Kai RegAI — P10 Golden Report Test Corpus
 * Phase: P10 — Report Engine
 * 
 * 15 Authoritative Golden Test Cases covering:
 * - Quick, Standard, and Premium report tiers
 * - Mode 1 Camera vs Mode 2 Guided Questionnaire
 * - Complete, partial, and unobserved crease sets
 * - Web rendering, high-resolution PDF export, and multi-format social cards
 * - Zero biometric leakage and strict epistemic integrity
 */

import { interpret } from '../../../src/interpretation/index.js';
import { narrate, DeterministicNarrator } from '../../../src/narration/index.js';
import { GOLDEN_INTERPRETATION_CASES } from '../../interpretation/golden/goldenCases.js';
import { createReport, REPORT_TIERS } from '../../../src/report/index.js';

const getCase = (id) => {
  const found = GOLDEN_INTERPRETATION_CASES.find(c => c.id === id);
  if (!found) throw new Error(`Golden interpretation case '${id}' not found`);
  return found.input;
};

export const GOLDEN_REPORT_CASES = [
  {
    id: 'GOLDEN_RPT_01_COMPLETE_STRONG',
    name: 'Case 01 — Complete Strong Palm (Premium Tier)',
    setup: () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      tier: 'PREMIUM',
      sectionsCount: 4,
      hasCover: true,
      hasKeyThemes: true,
      linesCount: 5
    }
  },
  {
    id: 'GOLDEN_RPT_02_PARTIAL_PALM',
    name: 'Case 02 — Partial / Faint Crease Palm',
    setup: () => {
      const dossier = interpret(getCase('CASE-02'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.STANDARD });
    },
    expected: {
      tier: 'STANDARD',
      hasUncertainty: true
    }
  },
  {
    id: 'GOLDEN_RPT_03_MISSING_FATE_LINE',
    name: 'Case 03 — Out-of-Frame Fate Line',
    setup: () => {
      const dossier = interpret(getCase('CASE-12'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      fateStatus: 'OUT_OF_FRAME',
      forbidsDestinyClaim: true
    }
  },
  {
    id: 'GOLDEN_RPT_04_MISSING_SUN_LINE',
    name: 'Case 04 — Undetected Sun Line',
    setup: () => {
      const dossier = interpret(getCase('CASE-03'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.STANDARD });
    },
    expected: {
      sunStatus: 'NOT_DETECTED'
    }
  },
  {
    id: 'GOLDEN_RPT_05_LOW_CONFIDENCE',
    name: 'Case 05 — Low Confidence Capture',
    setup: () => {
      const dossier = interpret(getCase('CASE-08'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.STANDARD });
    },
    expected: {
      confidenceBand: 'LOW',
      isConstrained: true
    }
  },
  {
    id: 'GOLDEN_RPT_06_MODE_1_CAMERA',
    name: 'Case 06 — Mode 1 Camera Scan (Quick Tier)',
    setup: () => {
      const dossier = interpret(getCase('CASE-10'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.QUICK });
    },
    expected: {
      tier: 'QUICK',
      method: 'MODE_1_CAMERA'
    }
  },
  {
    id: 'GOLDEN_RPT_07_MODE_2_QUESTIONNAIRE',
    name: 'Case 07 — Mode 2 Guided Questionnaire (Premium Tier)',
    setup: () => {
      const dossier = interpret(getCase('CASE-09'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      tier: 'PREMIUM',
      method: 'MODE_2_QUESTIONNAIRE'
    }
  },
  {
    id: 'GOLDEN_RPT_08_CONFLICTING_TRADITIONS',
    name: 'Case 08 — Conflicting Traditions Dual-Perspective',
    setup: () => {
      const dossier = interpret(getCase('CASE-11'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      preservesDualPerspectives: true
    }
  },
  {
    id: 'GOLDEN_RPT_09_MULTIPLE_THEMES',
    name: 'Case 09 — Thematic Diversity & Key Takeaways',
    setup: () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      minThemes: 3
    }
  },
  {
    id: 'GOLDEN_RPT_10_AI_NARRATION',
    name: 'Case 10 — AI Narrated Reading Integration',
    setup: async () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = await narrate(dossier, { profile: 'WARM_REFLECTIVE' });
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      generationMode: 'AI_ORCHESTRATED'
    }
  },
  {
    id: 'GOLDEN_RPT_11_DETERMINISTIC_FALLBACK',
    name: 'Case 11 — Deterministic Fallback Mode Integration',
    setup: () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = DeterministicNarrator.render(dossier, { fallbackTriggered: true, fallbackReason: 'Offline' });
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      generationMode: 'DETERMINISTIC_FALLBACK'
    }
  },
  {
    id: 'GOLDEN_RPT_12_LONG_DETAILED_REPORT',
    name: 'Case 12 — Comprehensive Archival Report Structure',
    setup: () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      hasSources: true,
      hasDisclaimers: true
    }
  },
  {
    id: 'GOLDEN_RPT_13_MINIMAL_EVIDENCE',
    name: 'Case 13 — Minimal / Fragmented Feature Model',
    setup: () => {
      const dossier = interpret(getCase('CASE-08'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.QUICK });
    },
    expected: {
      tier: 'QUICK'
    }
  },
  {
    id: 'GOLDEN_RPT_14_SOCIAL_CARD',
    name: 'Case 14 — Privacy-Safe Social Card Export',
    setup: () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      socialCardsAvailable: true
    }
  },
  {
    id: 'GOLDEN_RPT_15_PDF_EXPORT',
    name: 'Case 15 — Print-Ready A4 Document Compilation',
    setup: () => {
      const dossier = interpret(getCase('CASE-01'));
      const narrated = DeterministicNarrator.render(dossier);
      return createReport({ dossier, narratedReading: narrated, tier: REPORT_TIERS.PREMIUM });
    },
    expected: {
      pdfReady: true
    }
  }
];
