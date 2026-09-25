/**
 * Kai RegAI — Evidence Collector & Explanation Tracer
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Binds matched rules to specific observable features and builds
 * transparent evidence chains for explainability.
 */

export class EvidenceCollector {
  /**
   * Bind matched rules with feature context into an auditable evidence record
   * @param {Object[]} matchedResults - Output from RuleEngine.evaluateAll
   * @param {Object} context - Output from FeatureNormalizer.normalize
   * @returns {Object[]} Bound evidence items
   */
  static collect(matchedResults, context) {
    return matchedResults.map(({ rule, evidence }) => {
      const boundFeatures = evidence.map(e => ({
        feature: e.feature,
        observedValue: e.actualValue,
        expectedValue: e.expectedValue,
        source: context[`${e.feature}.source`] || context['provenance.reading_method'] || 'UNKNOWN',
        confidence: context[`${e.feature}.confidence`] ?? context['provenance.quality_score'] ?? 0.90
      }));

      return {
        ruleId: rule.ruleId,
        sourceSystem: rule.sourceSystem,
        epistemicTier: rule.epistemicTier,
        domain: rule.domain,
        author: rule.author || 'Traditional Treatise',
        citation: rule.citation || '',
        interpretation: rule.interpretation,
        ruleBaseConfidence: rule.confidence ?? 0.85,
        features: boundFeatures,
        explanationTrail: this.buildExplanationTrail(rule, boundFeatures)
      };
    });
  }

  /**
   * Construct human-readable explanation path
   * @param {Object} rule 
   * @param {Object[]} boundFeatures 
   * @returns {string}
   */
  static buildExplanationTrail(rule, boundFeatures) {
    const featureSummary = boundFeatures
      .map(f => `${f.feature} = ${JSON.stringify(f.observedValue)}`)
      .join(', ');

    return `Rule ${rule.ruleId} [${rule.sourceSystem}] matched because [${featureSummary}]. Attributed to ${rule.author || 'Traditional Literature'}.`;
  }
}
