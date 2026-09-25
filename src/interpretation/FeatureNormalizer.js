/**
 * Kai RegAI — Feature Normalizer
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Flattens and normalizes a canonical PalmFeatureModel into an immutable
 * dot-path evaluation context with provenance and confidence metadata.
 */

export class FeatureNormalizer {
  /**
   * Normalize PalmFeatureModel into dot-path feature map
   * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} featureModel 
   * @returns {Object} Normalized evaluation context
   */
  static normalize(featureModel) {
    if (!featureModel) {
      throw new Error('[FeatureNormalizer] featureModel is required');
    }

    const hand = featureModel.hand || {};
    const lines = featureModel.major_lines || {};
    const thumb = featureModel.thumb || {};
    const markings = featureModel.special_markings || [];
    const mounts = featureModel.mounts || {};
    const provenance = featureModel.provenance || {};

    const markingTypes = markings.map(m => m.type);

    const context = {
      // Hand Morphology
      'hand.side': hand.side || 'RIGHT',
      'hand.dominance': hand.dominance || 'DOMINANT',
      'hand.elemental_shape': hand.elemental_shape || 'FIRE',
      'hand.firmness': hand.firmness || 'ELASTIC_RESILIENT',
      'hand.ratios.palm_ratio': hand.ratios?.palm_ratio ?? 1.0,
      'hand.ratios.finger_to_palm_ratio': hand.ratios?.finger_to_palm_ratio ?? 0.82,

      // Life Line
      'lines.life_line.detected': Boolean(lines.life_line?.detected),
      'lines.life_line.status': lines.life_line?.status || (lines.life_line?.detected ? 'DETECTED' : 'NOT_DETECTED'),
      'lines.life_line.curvature': lines.life_line?.curvature || 'WIDE_ARC',
      'lines.life_line.length': lines.life_line?.length || 'LONG_SWEEPING',
      'lines.life_line.confidence': lines.life_line?.confidence ?? 0.94,
      'lines.life_line.source': lines.life_line?.source || provenance.source || 'SCANNER',

      // Head Line
      'lines.head_line.detected': Boolean(lines.head_line?.detected),
      'lines.head_line.status': lines.head_line?.status || (lines.head_line?.detected ? 'DETECTED' : 'NOT_DETECTED'),
      'lines.head_line.slope': lines.head_line?.slope || 'GENTLE_SLOPE_TO_LUNA',
      'lines.head_line.clarity': lines.head_line?.clarity || 'UNBROKEN',
      'lines.head_line.confidence': lines.head_line?.confidence ?? 0.96,
      'lines.head_line.source': lines.head_line?.source || provenance.source || 'SCANNER',

      // Heart Line
      'lines.heart_line.detected': Boolean(lines.heart_line?.detected),
      'lines.heart_line.status': lines.heart_line?.status || (lines.heart_line?.detected ? 'DETECTED' : 'NOT_DETECTED'),
      'lines.heart_line.curvature': lines.heart_line?.curvature || 'CURVED_TO_JUPITER',
      'lines.heart_line.forking': lines.heart_line?.forking || 'TRIDENT_TERMINATION',
      'lines.heart_line.confidence': lines.heart_line?.confidence ?? 0.92,
      'lines.heart_line.source': lines.heart_line?.source || provenance.source || 'SCANNER',

      // Fate Line
      'lines.fate_line.detected': Boolean(lines.fate_line?.detected && lines.fate_line?.status !== 'NOT_DETECTED'),
      'lines.fate_line.status': lines.fate_line?.status || (lines.fate_line?.detected ? 'DETECTED' : 'NOT_DETECTED'),
      'lines.fate_line.origin': lines.fate_line?.origin || 'BASE_OF_PALM',
      'lines.fate_line.continuity': lines.fate_line?.continuity || 'STRONG_CENTRAL',
      'lines.fate_line.confidence': lines.fate_line?.confidence ?? 0.88,
      'lines.fate_line.source': lines.fate_line?.source || provenance.source || 'SCANNER',

      // Sun Line
      'lines.sun_line.detected': Boolean(lines.sun_line?.detected && lines.sun_line?.status !== 'NOT_DETECTED'),
      'lines.sun_line.status': lines.sun_line?.status || (lines.sun_line?.detected ? 'DETECTED' : 'NOT_DETECTED'),
      'lines.sun_line.strength': lines.sun_line?.strength || 'PROMINENT_UPPER',
      'lines.sun_line.confidence': lines.sun_line?.confidence ?? 0.85,
      'lines.sun_line.source': lines.sun_line?.source || provenance.source || 'SCANNER',

      // Thumb
      'thumb.flexibility_angle': thumb.flexibility_angle ?? 45,
      'thumb.flexibility_type': thumb.flexibility_type || 'BALANCED_ARC',
      'thumb.first_phalanx_will': thumb.first_phalanx_will || 'BALANCED',
      'thumb.second_phalanx_logic': thumb.second_phalanx_logic || 'BALANCED',

      // Special Markings
      'special_markings.count': markings.length,
      'special_markings.types': markingTypes,

      // Mounts
      'mounts.jupiter.development': mounts.jupiter?.development || 'BALANCED',
      'mounts.saturn.development': mounts.saturn?.development || 'BALANCED',
      'mounts.apollo.development': mounts.apollo_sun?.development || 'BALANCED',
      'mounts.venus.development': mounts.venus?.development || 'BALANCED',
      'mounts.moon.development': mounts.moon_luna?.development || 'BALANCED',

      // Provenance
      'provenance.mode': provenance.mode || 'MODE_1_SCANNER',
      'provenance.reading_method': provenance.reading_method || (provenance.mode === 'MODE_2_QUESTIONNAIRE' ? 'GUIDED_QUESTIONNAIRE' : 'CAMERA_SCAN'),
      'provenance.quality_score': featureModel.quality_score ?? 0.94
    };

    return Object.freeze(context);
  }
}
