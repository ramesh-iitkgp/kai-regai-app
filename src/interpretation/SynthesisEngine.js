/**
 * Kai RegAI — Synthesis Engine
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Aggregates multi-source evidence and matched rules across the 4 Epistemic Tiers:
 * 1. Physical Observation
 * 2. Western Classical
 * 3. Hasta Samudrika
 * 4. Kai RegAI Synthesis
 */

export class SynthesisEngine {
  /**
   * Synthesize line-by-line interpretation block
   * @param {string} lineKey - 'life_line' | 'head_line' | 'heart_line' | 'fate_line' | 'sun_line'
   * @param {Object} context - Output from FeatureNormalizer
   * @param {Object[]} matchedEvidence - Matched rules bound to evidence
   * @returns {Object} Structured line item for dossier and reports
   */
  static synthesizeLine(lineKey, context, matchedEvidence) {
    const metaMap = {
      life_line: { name: 'Life Line (Ayur Rekha)', color: '#A855F7', glyph: 'vitality', domain: 'LIFE_LINE' },
      head_line: { name: 'Head Line (Matru Rekha)', color: '#00D2FF', glyph: 'intellect', domain: 'HEAD_LINE' },
      heart_line: { name: 'Heart Line (Pitri Rekha)', color: '#F43F5E', glyph: 'emotion', domain: 'HEART_LINE' },
      fate_line: { name: 'Fate Line (Karma Rekha)', color: '#FBBF24', glyph: 'destiny', domain: 'FATE_LINE' },
      sun_line: { name: 'Sun Line (Surya Rekha)', color: '#F59E0B', glyph: 'radiance', domain: 'SUN_LINE' }
    };

    const meta = metaMap[lineKey] || { name: lineKey, color: '#A855F7', glyph: 'crease', domain: 'LINE' };
    const isDetected = context[`lines.${lineKey}.detected`];
    const status = context[`lines.${lineKey}.status`];

    // Filter evidence for this domain
    const domainEvidence = matchedEvidence.filter(e => e.domain === meta.domain);
    const western = domainEvidence.find(e => e.sourceSystem === 'WESTERN_CLASSICAL');
    const samudrika = domainEvidence.find(e => e.sourceSystem === 'HASTA_SAMUDRIKA');

    const isQuestionnaire = context['provenance.reading_method'] === 'GUIDED_QUESTIONNAIRE' || context['provenance.mode'] === 'MODE_2_QUESTIONNAIRE';

    // 1. Tier 1 Physical Observation
    let observation = '';
    if (status === 'OUT_OF_FRAME') {
      observation = 'Crease trajectory lies near or outside the sensor frame boundary. Not biologically absent.';
    } else if (!isDetected || status === 'NOT_DETECTED') {
      if (lineKey === 'life_line') {
        observation = isQuestionnaire
          ? 'No clear crease noted curving around the thumb base in your observations.'
          : 'Crease not discernible in current optical scan.';
      } else {
        observation = `No distinct continuous furrow discerned in this reading. Trajectory remains unobserved under current lighting/angle.`;
      }
    } else if (status === 'PARTIAL') {
      observation = `Faint or fragmented crease traces observed (${Math.round((context[`lines.${lineKey}.confidence`] || 0.6) * 100)}% detection confidence).`;
    } else {
      if (lineKey === 'life_line') {
        const isWide = context['lines.life_line.curvature'] === 'WIDE_ARC';
        observation = isWide
          ? 'Expansive, continuous curvature enclosing the thenar eminence (Mount of Venus).'
          : 'Conserved curvature closely tracing the contour of the thumb pad.';
      } else if (lineKey === 'head_line') {
        const slope = context['lines.head_line.slope'];
        const isSloping = slope === 'GENTLE_SLOPE' || slope === 'GENTLE_SLOPE_TO_LUNA';
        observation = isSloping
          ? 'Linear furrow dipping gently toward the lunar/imaginative mid-palm quadrant.'
          : 'Direct transverse trajectory running straight across the mid-palmar plane.';
      } else if (lineKey === 'heart_line') {
        const isJupiter = context['lines.heart_line.curvature'] === 'CURVED_TO_JUPITER';
        observation = isJupiter
          ? 'Curvilinear transverse trajectory ascending toward the index finger base (Mount of Jupiter).'
          : 'Transverse crease running straight beneath the middle digit plane.';
      } else if (lineKey === 'fate_line') {
        observation = 'Crisp vertical furrow ascending along the longitudinal palm axis toward Saturn.';
      } else if (lineKey === 'sun_line') {
        observation = 'Secondary luminary crease rising longitudinally below the Apollo finger.';
      }
    }

    // 2. Tier 2/3 Traditional Interpretation
    let traditionalInterpretation = '';
    if (!isDetected || status === 'NOT_DETECTED' || status === 'OUT_OF_FRAME') {
      traditionalInterpretation = lineKey === 'life_line'
        ? 'Hasta Samudrika commentary treats Ayur Rekha as constitutional vitality rather than a deterministic lifespan clock.'
        : 'Traditional literature (Hasta Samudrika & Western) treats absent or unobserved lines as fluid potential rather than negative destiny.';
    } else if (samudrika) {
      traditionalInterpretation = `${samudrika.author || 'Hasta Samudrika treatises'}: ${samudrika.interpretation.summary}`;
    } else if (western) {
      traditionalInterpretation = `${western.author || 'Classical Western palmistry'}: ${western.interpretation.summary}`;
    } else {
      traditionalInterpretation = 'Classical treatises correlate this crease formation with steady self-regulation and grounded equilibrium.';
    }

    // 3. Tier 4 Kai RegAI Synthesis
    let synthesis = '';
    if (!isDetected || status === 'NOT_DETECTED' || status === 'OUT_OF_FRAME') {
      synthesis = 'Your inner clarity is self-defined rather than constrained by predetermined conventional channels.';
    } else if (domainEvidence.length > 0 && domainEvidence[0].interpretation.synthesis) {
      synthesis = domainEvidence[0].interpretation.synthesis;
    } else {
      synthesis = 'Your natural disposition flourishes through balanced awareness and steady, intentional pacing.';
    }

    return {
      name: meta.name,
      color: meta.color,
      glyph: meta.glyph,
      status: status || (isDetected ? 'DETECTED' : 'NOT_DETECTED'),
      observation,
      traditional_interpretation: traditionalInterpretation,
      synthesis,
      matchedRuleIds: domainEvidence.map(e => e.ruleId)
    };
  }

  /**
   * Synthesize full report chapters (Constitution, Vocation, Relationships, Guidance)
   * @param {Object} context 
   * @param {Object[]} matchedEvidence 
   * @returns {Object} synthesis_chapters
   */
  static synthesizeChapters(context, matchedEvidence) {
    const constRule = matchedEvidence.find(e => e.domain === 'CONSTITUTION');
    const vocRule = matchedEvidence.find(e => e.domain === 'VOCATION');
    const crossRule = matchedEvidence.find(e => e.domain === 'CROSS_LINE');

    const constitution = constRule
      ? constRule.interpretation.synthesis
      : `Your hand architecture presents a balanced elemental synthesis, combining responsive palmar resilience with versatile finger articulation.`;

    const vocation = vocRule
      ? vocRule.interpretation.synthesis
      : `Your vocational drive flourishes through multi-disciplinary mastery, combining reliable execution with intrinsic personal calling.`;

    const guidance = crossRule
      ? crossRule.interpretation.synthesis
      : `Harmonize deliberate analytical scrutiny with intuitive emotional resonance through periodic quiet contemplation.`;

    const relationships = 'Your emotional compass prioritizes substantive depth, mutual honor, and clear ethical boundaries.';

    return {
      constitution,
      vocation,
      relationships,
      guidance
    };
  }
}
