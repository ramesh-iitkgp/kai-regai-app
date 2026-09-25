/**
 * Kai RegAI — Confidence Propagation Engine
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Computes deterministic evidentiary support confidence:
 * Combines feature detection confidence, rule authority score, and observation completeness.
 * 
 * CRITICAL EPISTEMIC LAW:
 * Evidentiary confidence represents support by the observed hand features,
 * NEVER empirical scientific factuality of traditional palmistry.
 */

export const CONFIDENCE_BANDS = {
  HIGH: 'HIGH',
  MODERATE: 'MODERATE',
  LOW: 'LOW',
  INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE'
};

export class ConfidenceEngine {
  /**
   * Calculate propagated confidence for an evidence record
   * @param {Object} evidenceRecord 
   * @returns {{ score: number, band: string, explanation: string }}
   */
  static calculate(evidenceRecord) {
    const { ruleBaseConfidence = 0.85, features = [] } = evidenceRecord;

    if (features.length === 0) {
      return {
        score: 0.40,
        band: CONFIDENCE_BANDS.INSUFFICIENT_EVIDENCE,
        explanation: 'No direct feature evidence bound to this interpretation.'
      };
    }

    // Average confidence across bound features
    const avgFeatureConfidence = features.reduce((sum, f) => sum + (f.confidence ?? 0.85), 0) / features.length;

    // Mathematical formula: geometric-weighted mean of ruleBaseConfidence and featureConfidence
    const score = Number((ruleBaseConfidence * 0.4 + avgFeatureConfidence * 0.6).toFixed(3));

    let band = CONFIDENCE_BANDS.MODERATE;
    if (score >= 0.88) {
      band = CONFIDENCE_BANDS.HIGH;
    } else if (score >= 0.70) {
      band = CONFIDENCE_BANDS.MODERATE;
    } else if (score >= 0.50) {
      band = CONFIDENCE_BANDS.LOW;
    } else {
      band = CONFIDENCE_BANDS.INSUFFICIENT_EVIDENCE;
    }

    return {
      score,
      band,
      explanation: `Evidentiary confidence based on feature observation confidence (${Math.round(avgFeatureConfidence * 100)}%) and rule authority score (${Math.round(ruleBaseConfidence * 100)}%).`
    };
  }

  /**
   * Compute overall reading confidence
   * @param {Object[]} evidenceList 
   * @param {Object} [context={}]
   * @returns {{ score: number, band: string }}
   */
  static calculateAggregate(evidenceList, context = {}) {
    if (!evidenceList || evidenceList.length === 0) {
      return { score: 0.40, band: CONFIDENCE_BANDS.INSUFFICIENT_EVIDENCE };
    }

    const scores = evidenceList.map(e => this.calculate(e).score);
    let avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (context['provenance.quality_score'] !== undefined) {
      avg = (avg * 0.4 + context['provenance.quality_score'] * 0.6);
    }

    const finalScore = Number(avg.toFixed(3));

    let band = CONFIDENCE_BANDS.MODERATE;
    if (finalScore >= 0.85) band = CONFIDENCE_BANDS.HIGH;
    else if (finalScore >= 0.65) band = CONFIDENCE_BANDS.MODERATE;
    else if (finalScore >= 0.45) band = CONFIDENCE_BANDS.LOW;
    else band = CONFIDENCE_BANDS.INSUFFICIENT_EVIDENCE;

    return { score: finalScore, band };
  }
}
