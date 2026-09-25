/**
 * Kai RegAI — Unified Palm Interpretation Engine Gateway
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Bridges requests to the modular P8 Interpretation Pipeline & Knowledge Codex,
 * preserving 100% backward compatibility for P7 report callers.
 */

import { interpret } from '../interpretation/index.js';

export class PalmInterpretationEngine {
  /**
   * Synthesize a reading dossier from a canonical PalmFeatureModel
   * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} featureModel 
   * @param {Object} [options={}]
   * @returns {import('../interpretation/InterpretationDossier.js').InterpretationDossier}
   */
  static synthesize(featureModel, options = {}) {
    return interpret(featureModel, options);
  }
}
