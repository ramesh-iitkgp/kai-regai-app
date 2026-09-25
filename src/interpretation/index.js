/**
 * Kai RegAI — Master Interpretation Pipeline Barrel Export
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 */

import { MASTER_RULE_REGISTRY } from '../knowledge/index.js';
import { FeatureNormalizer } from './FeatureNormalizer.js';
import { RuleEngine } from './RuleEngine.js';
import { EvidenceCollector } from './EvidenceCollector.js';
import { ConfidenceEngine } from './ConfidenceEngine.js';
import { ConflictResolver } from './ConflictResolver.js';
import { SynthesisEngine } from './SynthesisEngine.js';
import { EpistemicGate } from './EpistemicGate.js';
import { InterpretationDossier } from './InterpretationDossier.js';

export { FeatureNormalizer } from './FeatureNormalizer.js';
export { RuleEngine } from './RuleEngine.js';
export { EvidenceCollector } from './EvidenceCollector.js';
export { ConfidenceEngine, CONFIDENCE_BANDS } from './ConfidenceEngine.js';
export { ConflictResolver } from './ConflictResolver.js';
export { SynthesisEngine } from './SynthesisEngine.js';
export { EpistemicGate } from './EpistemicGate.js';
export { InterpretationDossier } from './InterpretationDossier.js';

/**
 * Master interpretation function converting canonical PalmFeatureModel into InterpretationDossier
 * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} featureModel 
 * @param {Object} [options={}]
 * @returns {InterpretationDossier}
 */
export function interpret(featureModel, options = {}) {
  const rules = options.rules || MASTER_RULE_REGISTRY;

  // 1. Feature Normalization
  const context = FeatureNormalizer.normalize(featureModel);

  // 2. Rule Matching
  const matchedRuleResults = RuleEngine.evaluateAll(rules, context);

  // 3. Evidence Collection & Traceability Binding
  const boundEvidence = EvidenceCollector.collect(matchedRuleResults, context);

  // 4. Confidence Propagation
  const aggregateConfidence = ConfidenceEngine.calculateAggregate(boundEvidence, context);

  // 5. Conflict Resolution & Multi-source Agreement
  const { resolved, multiSourceAgreements, divergences } = ConflictResolver.reconcile(boundEvidence);

  // 6. Cross-Line & Chapter Synthesis
  const lineKeys = ['life_line', 'head_line', 'heart_line', 'fate_line', 'sun_line'];
  const majorLines = lineKeys.map(key => SynthesisEngine.synthesizeLine(key, context, resolved));
  const synthesisChapters = SynthesisEngine.synthesizeChapters(context, resolved);

  // 7. Mounts & Markings Features block
  const isQuestionnaire = context['provenance.mode'] === 'MODE_2_QUESTIONNAIRE' || 
                          context['provenance.reading_method'] === 'GUIDED_QUESTIONNAIRE';

  const handSide = context['hand.side'];
  const elementalShape = context['hand.elemental_shape'];
  const markings = featureModel.special_markings || [];

  const features = {
    mounts: [
      { name: 'Mount of Jupiter', icon: 'military_tech', note: 'Prominent radial development reflecting executive discernment and philosophical aspiration.' },
      { name: 'Mount of Venus', icon: 'favorite', note: 'Resilient thenar eminence correlating with steady constitutional stamina and vitality.' }
    ],
    thumb: {
      angle: `${context['thumb.flexibility_angle'] || 45}° Angle`,
      balance: context['thumb.flexibility_type'] === 'SUPPLE_BACKWARD' ? 'Supple Adaptability' : 'Balanced Will & Logic',
      interpretation: context['thumb.first_phalanx_will'] === 'STRONG'
        ? 'Decisive intentionality paired with reflective contemplation.'
        : 'Harmonious balance of deliberate will and rational discernment.'
    },
    markings: markings.length > 0 
      ? markings.map(m => ({
          name: m.type.replace('_', ' '),
          tradition: m.tradition === 'HASTA_SAMUDRIKA' ? 'Vedic Tradition' : 'Classical Chiromancy',
          note: 'Confirmed through guided visual and tactile observation.'
        }))
      : [
          {
            name: 'Solomon Ring Trace',
            tradition: 'Classical Chiromancy',
            note: 'Subtle semi-circular arc near the Jupiter base associated with intuitive discernment.'
          }
        ]
  };

  // 8. Title, Summary & Tags
  const title = isQuestionnaire ? 'Guided Hastarekha Dossier' : 'Solar Rapid Scan';
  const summary = isQuestionnaire
    ? 'A comprehensive reflective dossier based on your guided hand observations, evaluating palmar pad resilience, thumb flexibility, and crease contours.'
    : 'A rapid optical scan analyzing visible palmar crease geometry and constitutional markers.';

  const tags = [
    isQuestionnaire ? 'Guided Observation' : 'Optical Crease Scan',
    `${handSide === 'RIGHT' ? 'Right' : 'Left'} Hand`,
    `${elementalShape.charAt(0) + elementalShape.slice(1).toLowerCase()} Elemental Base`
  ];
  if (markings.length > 0) {
    tags.push(markings[0].type.replace('_', ' '));
  }

  // 9. Instantiate Dossier
  const rawDossier = new InterpretationDossier({
    id: `RDG-${Date.now()}`,
    mode: isQuestionnaire ? 'MODE_2_GUIDED' : 'MODE_1_SCANNER',
    reading_method: context['provenance.reading_method'],
    reading_method_label: isQuestionnaire ? 'Guided Palm Reading' : 'Rapid Camera Scan',
    title,
    hand_side: handSide,
    hand_dominance: context['hand.dominance'],
    summary,
    quality_score: context['provenance.quality_score'],
    confidence: aggregateConfidence.score,
    confidence_band: aggregateConfidence.band,
    tags,
    major_lines: majorLines,
    synthesis_chapters: synthesisChapters,
    features,
    evidence: resolved,
    multi_source_agreements: multiSourceAgreements,
    conflicts: divergences,
    provenance: {
      ...featureModel.provenance,
      interpretation_engine_version: '3.0.0',
      codex_version: '1.0.0'
    }
  });

  // 10. Epistemic Safety Gate
  const gateResult = EpistemicGate.gateDossier(rawDossier);
  if (!gateResult.passed) {
    console.warn('[EpistemicGate] Safety violations resolved:', gateResult.violations);
  }

  return gateResult.sanitizedDossier;
}
