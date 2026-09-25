/**
 * Kai RegAI — Theme Aggregator
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Aggregates and clusters compatible P8 interpretations into cohesive themes:
 * - Eliminates repetitive line-by-line recitation
 * - Groups related cross-line findings into higher-order archetypal themes
 * - Prioritizes high-confidence observations over faint or uncertain ones
 */

export class ThemeAggregator {
  /**
   * Aggregate interpretation items and major lines into non-repetitive thematic clusters
   * @param {Object} narrationContext 
   * @returns {Object[]} Clustered themes
   */
  static aggregate(narrationContext) {
    const { observations, interpretations, evidence, features } = narrationContext;

    const clusters = [
      {
        id: 'THEME_CONSTITUTION',
        title: 'Constitutional Vitality & Grounding',
        domains: ['life_line', 'AYUR_REKHA', 'thumb', 'Mount of Venus'],
        priority: 1,
        observations: [],
        traditionalInterpretations: [],
        evidenceRefs: [],
        confidence: 0.85
      },
      {
        id: 'THEME_COGNITION_VOCATION',
        title: 'Strategic Intellect & Vocational Drive',
        domains: ['head_line', 'MATRU_REKHA', 'fate_line', 'KARMA_REKHA', 'sun_line', 'SURYA_REKHA', 'Mount of Jupiter'],
        priority: 2,
        observations: [],
        traditionalInterpretations: [],
        evidenceRefs: [],
        confidence: 0.85
      },
      {
        id: 'THEME_RELATIONAL_EMPATHY',
        title: 'Emotional Landscape & Interpersonal Depth',
        domains: ['heart_line', 'PITRI_REKHA', 'markings'],
        priority: 3,
        observations: [],
        traditionalInterpretations: [],
        evidenceRefs: [],
        confidence: 0.85
      },
      {
        id: 'THEME_INTEGRATION_GUIDANCE',
        title: 'Holistic Balance & Conscious Action',
        domains: ['CONSTITUTION', 'VOCATION', 'RELATIONSHIPS', 'GUIDANCE'],
        priority: 4,
        observations: [],
        traditionalInterpretations: [],
        evidenceRefs: [],
        confidence: 0.85
      }
    ];

    // Distribute observations into clusters
    for (const obs of (observations || [])) {
      const match = clusters.find(c => c.domains.some(d => obs.lineKey.toLowerCase().includes(d.toLowerCase())));
      if (match) {
        match.observations.push(obs);
      }
    }

    // Distribute interpretations into clusters
    for (const interp of (interpretations || [])) {
      const match = clusters.find(c => c.domains.some(d => interp.domain.toLowerCase().includes(d.toLowerCase())));
      if (match) {
        match.traditionalInterpretations.push(interp);
      }
    }

    // Distribute evidence references
    for (const ev of (evidence || [])) {
      const match = clusters.find(c => c.domains.some(d => (ev.featurePath || '').toLowerCase().includes(d.toLowerCase())));
      if (match) {
        match.evidenceRefs.push(ev.featurePath);
      }
    }

    // Include special markings if present
    if (features?.markings && features.markings.length > 0) {
      clusters[2].observations.push({
        lineKey: 'sacred_markings',
        name: 'Sacred Markings',
        status: 'CONFIRMED',
        description: features.markings.map(m => m.name).join(', '),
        confidence: 0.90
      });
    }

    return clusters;
  }
}
