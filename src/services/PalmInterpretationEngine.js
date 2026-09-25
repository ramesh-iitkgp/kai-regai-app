/**
 * Kai RegAI — Unified Palm Interpretation Engine Gateway
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Bridges requests to the modular P8 Interpretation Pipeline & Knowledge Codex,
 * preserving 100% backward compatibility for P7 report callers.
 */

import { interpret } from '../interpretation/index.js';
import { narrate } from '../narration/index.js';

export class PalmInterpretationEngine {
  /**
   * Synthesize a reading dossier from a canonical PalmFeatureModel (P8)
   * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} featureModel 
   * @param {Object} [options={}]
   * @returns {import('../interpretation/InterpretationDossier.js').InterpretationDossier}
   */
  static synthesize(featureModel, options = {}) {
    return interpret(featureModel, options);
  }

  /**
   * Generate an empathetic, evidence-consistent narrated reading from a dossier (P9)
   * @param {import('../interpretation/InterpretationDossier.js').InterpretationDossier} dossier
   * @param {Object} [options={}]
   * @returns {Promise<import('../narration/NarratedReading.js').NarratedReading>}
   */
  static async narrate(dossier, options = {}) {
    return narrate(dossier, options);
  }
}
