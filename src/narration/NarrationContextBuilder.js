/**
 * Kai RegAI — Narration Context Builder & Context Firewall
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Bounded Context Builder:
 * - Transforms the raw P8 InterpretationDossier into a clean, compact payload
 * - Acts as a Context Firewall preventing prompt dumping or token blowup
 * - Separates observations, interpretations, evidence, uncertainty, and traditional sources
 */

export class NarrationContextBuilder {
  /**
   * Build bounded narration context from P8 InterpretationDossier
   * @param {import('../interpretation/InterpretationDossier.js').InterpretationDossier} dossier 
   * @param {Object} [userContext={}]
   * @returns {Object} Clean, structured context payload
   */
  static build(dossier, userContext = {}) {
    if (!dossier) {
      throw new Error('NarrationContextBuilder requires a valid InterpretationDossier');
    }

    // 1. Reading Method & Subject Profile
    const isQuestionnaire = dossier.mode === 'MODE_2_QUESTIONNAIRE' ||
                            dossier.reading_method === 'GUIDED_QUESTIONNAIRE';

    const subjectProfile = {
      readingMethod: isQuestionnaire ? 'MODE_2_QUESTIONNAIRE' : 'MODE_1_CAMERA',
      methodLabel: isQuestionnaire ? 'Guided Palm Reading' : 'Rapid Camera Scan',
      handSide: dossier.hand_side || 'RIGHT',
      handDominance: dossier.hand_dominance || 'DOMINANT',
      overallConfidence: dossier.confidence ?? 0.85,
      confidenceBand: dossier.confidence_band || 'MODERATE',
      qualityScore: dossier.quality_score ?? 0.90
    };

    // 2. Physical Observations (Tier 1)
    const observations = [];
    const uncertainty = [];

    for (const line of (dossier.major_lines || [])) {
      const lineKey = line.key || line.name;
      const status = line.status || 'DETECTED';

      observations.push({
        lineKey,
        name: line.name,
        status,
        description: line.tier1_observation || '',
        confidence: line.confidence ?? 0.85
      });

      if (status === 'OUT_OF_FRAME') {
        uncertainty.push({
          feature: line.name,
          issue: 'OUT_OF_FRAME',
          note: `${line.name} trajectory extends near or outside the optical boundary. It cannot be reliably interpreted.`
        });
      } else if (status === 'NOT_DETECTED') {
        uncertainty.push({
          feature: line.name,
          issue: 'NOT_DETECTED',
          note: `${line.name} was not clearly discerned under current lighting and angle.`
        });
      } else if (status === 'PARTIAL' || status === 'WEAK') {
        uncertainty.push({
          feature: line.name,
          issue: 'PARTIAL_OR_FAINT',
          note: `${line.name} was faintly or fragmentarily observed (${Math.round((line.confidence || 0.5) * 100)}% clarity).`
        });
      }
    }

    // 3. Matched Interpretations (Tiers 2 & 3)
    const interpretations = [];
    for (const line of (dossier.major_lines || [])) {
      if (line.status === 'NOT_DETECTED' || line.status === 'OUT_OF_FRAME') {
        continue; // Do not emit interpretations for unobserved features
      }

      if (line.tier2_western) {
        interpretations.push({
          domain: line.key || line.name,
          tradition: 'WESTERN_CLASSICAL',
          epistemicTier: 2,
          summary: line.tier2_western,
          attribution: 'Western Classical Chiromancy'
        });
      }

      if (line.tier3_hasta_samudrika) {
        interpretations.push({
          domain: line.key || line.name,
          tradition: 'HASTA_SAMUDRIKA',
          epistemicTier: 3,
          summary: line.tier3_hasta_samudrika,
          attribution: 'Hasta Samudrika (Vedic Tradition)'
        });
      }
    }

    // 4. Kai RegAI Synthesis Themes (Tier 4)
    const synthesisThemes = [];
    if (dossier.synthesis_chapters) {
      if (dossier.synthesis_chapters.constitution) {
        synthesisThemes.push({
          theme: 'CONSTITUTION',
          label: 'Constitutional Vitality',
          content: dossier.synthesis_chapters.constitution
        });
      }
      if (dossier.synthesis_chapters.vocation) {
        synthesisThemes.push({
          theme: 'VOCATION',
          label: 'Vocation & Action Orientation',
          content: dossier.synthesis_chapters.vocation
        });
      }
      if (dossier.synthesis_chapters.relationships) {
        synthesisThemes.push({
          theme: 'RELATIONSHIPS',
          label: 'Interpersonal & Emotional Landscape',
          content: dossier.synthesis_chapters.relationships
        });
      }
      if (dossier.synthesis_chapters.guidance) {
        synthesisThemes.push({
          theme: 'GUIDANCE',
          label: 'Reflective Guidance',
          content: dossier.synthesis_chapters.guidance
        });
      }
    }

    // 5. Evidence Records
    const evidence = (dossier.evidence || []).map(e => ({
      featurePath: e.featurePath,
      value: e.value,
      source: e.source,
      confidence: e.confidence,
      ruleId: e.ruleId
    }));

    // 6. Traditional Source Attributions
    const sources = [
      { id: 'SRC_WESTERN', name: 'Classical Western Chiromancy', tradition: 'Western Classical' },
      { id: 'SRC_HASTA', name: 'Samudrika Shastra & Narada Samhita', tradition: 'Hasta Samudrika' },
      { id: 'SRC_KAI_SYN', name: 'Kai RegAI Archetypal Synthesis', tradition: 'Kai RegAI' }
    ];

    // 7. Sanitized User Inquiries (if provided)
    const userFocus = userContext.focusArea ? String(userContext.focusArea).slice(0, 80) : null;

    // 8. Strict Constraints for Prompt
    const constraints = [
      'P8_INTERPRETATION_IS_AUTHORITATIVE',
      'NO_MEDICAL_DIAGNOSES',
      'NO_FATALISTIC_PREDICTIONS',
      'NO_GUARANTEED_FINANCIAL_OR_RELATIONSHIP_OUTCOMES',
      'DO_NOT_INVENT_PALM_FEATURES',
      'PRESERVE_UNOBSERVED_LINES_AS_UNCERTAIN_POTENTIAL',
      'PRESERVE_TRADITIONAL_SOURCE_ATTRIBUTIONS'
    ];

    return {
      subjectProfile,
      observations,
      interpretations,
      synthesisThemes,
      uncertainty,
      evidence,
      sources,
      features: dossier.features || {},
      userFocus,
      constraints
    };
  }
}
