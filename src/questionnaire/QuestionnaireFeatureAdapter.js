/**
 * Kai RegAI — Questionnaire Feature Adapter
 * Phase: P7 — Palm Reading Questionnaire Engine
 * 
 * Bridges raw questionnaire responses to:
 * 1. Canonical PalmFeatureModel instance (schema v2.0.0)
 * 2. Deterministic conflict resolution with CV baseline data
 */

import { PalmFeatureModel } from '../models/PalmFeatureModel.js';

export class QuestionnaireFeatureAdapter {
  /**
   * Convert questionnaire responses into a canonical PalmFeatureModel
   * @param {Object} answers - Map of question ID to response value(s)
   * @param {string} [sessionId='']
   * @returns {PalmFeatureModel}
   */
  static toPalmFeatureModel(answers = {}, sessionId = '') {
    const isLifeVisible = answers.life_line_visibility && answers.life_line_visibility !== 'NOT_VISIBLE';
    const isHeadVisible = answers.head_line_visibility && answers.head_line_visibility !== 'NOT_VISIBLE';
    const isHeartVisible = answers.heart_line_visibility && answers.heart_line_visibility !== 'NOT_VISIBLE';
    const isFateVisible = answers.fate_line_visibility && answers.fate_line_visibility !== 'NOT_VISIBLE';
    const isSunVisible = answers.sun_line_visibility && answers.sun_line_visibility !== 'NOT_VISIBLE';

    const specialMarks = (answers.special_markings_confirmed || [])
      .filter(m => m !== 'NONE_OBSERVED')
      .map((markId, idx) => ({
        id: `MARK-QUEST-${idx + 1}`,
        type: markId,
        mount: markId === 'SOLOMON_RING' || markId === 'TRISHULA_TRIDENT' ? 'JUPITER' : 'PALM_CENTER',
        tradition: markId === 'FISH_YAV' || markId === 'TRISHULA_TRIDENT' ? 'HASTA_SAMUDRIKA' : 'WESTERN_CLASSICAL',
        source: 'QUESTIONNAIRE'
      }));

    return new PalmFeatureModel({
      session_id: sessionId || `session-mode2-${Date.now()}`,
      schema_version: '2.0.0',
      hand: {
        side: answers.hand_side || 'RIGHT',
        dominance: 'DOMINANT',
        elemental_shape: answers.palm_shape && answers.palm_shape !== 'NOT_SURE' ? answers.palm_shape : 'FIRE',
        firmness: answers.palm_firmness || 'ELASTIC_RESILIENT',
        ratios: {
          palm_ratio: answers.palm_shape === 'EARTH' || answers.palm_shape === 'AIR' ? 1.0 : 1.12,
          finger_to_palm_ratio: answers.palm_shape === 'AIR' || answers.palm_shape === 'WATER' ? 0.94 : 0.80
        }
      },
      major_lines: {
        life_line: {
          detected: Boolean(isLifeVisible),
          status: answers.life_line_visibility === 'CLEAR' 
            ? 'DETECTED' 
            : (answers.life_line_visibility === 'PARTIAL' ? 'PARTIAL' : (answers.life_line_visibility === 'NOT_VISIBLE' ? 'NOT_DETECTED' : 'UNCERTAIN')),
          length: 'LONG_SWEEPING',
          curvature: answers.life_line_curvature || 'WIDE_ARC',
          depth: 'DEEP_CLEAR',
          confidence: answers.life_line_visibility === 'CLEAR' ? 0.95 : (answers.life_line_visibility === 'PARTIAL' ? 0.70 : 0.40),
          semantic_color: '#A855F7',
          glyph: 'vitality',
          polyline: [],
          source: 'QUESTIONNAIRE'
        },
        head_line: {
          detected: Boolean(isHeadVisible),
          status: answers.head_line_visibility === 'CLEAR' 
            ? 'DETECTED' 
            : (answers.head_line_visibility === 'PARTIAL' ? 'PARTIAL' : (answers.head_line_visibility === 'NOT_VISIBLE' ? 'NOT_DETECTED' : 'UNCERTAIN')),
          length: 'LONG',
          slope: answers.head_line_direction || 'GENTLE_SLOPE',
          clarity: answers.head_line_clarity || 'UNBROKEN',
          confidence: answers.head_line_visibility === 'CLEAR' ? 0.95 : (answers.head_line_visibility === 'PARTIAL' ? 0.70 : 0.40),
          semantic_color: '#00D2FF',
          glyph: 'intellect',
          polyline: [],
          source: 'QUESTIONNAIRE'
        },
        heart_line: {
          detected: Boolean(isHeartVisible),
          status: answers.heart_line_visibility === 'CLEAR' 
            ? 'DETECTED' 
            : (answers.heart_line_visibility === 'PARTIAL' ? 'PARTIAL' : (answers.heart_line_visibility === 'NOT_VISIBLE' ? 'NOT_DETECTED' : 'UNCERTAIN')),
          curvature: answers.heart_line_curvature || 'CURVED_TO_JUPITER',
          forking: answers.heart_line_termination || 'TRIDENT_TERMINATION',
          confidence: answers.heart_line_visibility === 'CLEAR' ? 0.95 : (answers.heart_line_visibility === 'PARTIAL' ? 0.70 : 0.40),
          semantic_color: '#F43F5E',
          glyph: 'emotion',
          polyline: [],
          source: 'QUESTIONNAIRE'
        },
        fate_line: {
          detected: Boolean(isFateVisible),
          status: answers.fate_line_visibility === 'CLEAR' 
            ? 'DETECTED' 
            : (answers.fate_line_visibility === 'PARTIAL' ? 'PARTIAL' : (answers.fate_line_visibility === 'NOT_VISIBLE' ? 'NOT_DETECTED' : 'UNCERTAIN')),
          origin: answers.fate_line_origin || 'BASE_OF_PALM',
          destination: 'MOUNT_OF_SATURN',
          continuity: answers.fate_line_continuity || 'STRONG_CENTRAL',
          confidence: answers.fate_line_visibility === 'CLEAR' ? 0.90 : (answers.fate_line_visibility === 'PARTIAL' ? 0.65 : 0.35),
          semantic_color: '#FBBF24',
          glyph: 'destiny',
          polyline: [],
          source: 'QUESTIONNAIRE'
        },
        sun_line: {
          detected: Boolean(isSunVisible),
          status: answers.sun_line_visibility === 'CLEAR' 
            ? 'DETECTED' 
            : (answers.sun_line_visibility === 'PARTIAL' ? 'PARTIAL' : (answers.sun_line_visibility === 'NOT_VISIBLE' ? 'NOT_DETECTED' : 'UNCERTAIN')),
          strength: answers.sun_line_prominence || (answers.sun_line_visibility === 'CLEAR' ? 'PROMINENT_UPPER' : 'FAINT_TRACE'),
          destination: 'MOUNT_OF_APOLLO',
          confidence: answers.sun_line_visibility === 'CLEAR' ? 0.88 : (answers.sun_line_visibility === 'PARTIAL' ? 0.60 : 0.30),
          semantic_color: '#F59E0B',
          glyph: 'radiance',
          polyline: [],
          source: 'QUESTIONNAIRE'
        }
      },
      thumb: {
        flexibility_angle: answers.thumb_flexibility === 'SUPPLE_BACKWARD' ? 50 : (answers.thumb_flexibility === 'STIFF_RESOLUTE' ? 10 : 30),
        flexibility_type: answers.thumb_flexibility || 'BALANCED_ARC',
        first_phalanx_will: answers.thumb_phalanx_ratio === 'DOMINANT_WILL' ? 'STRONG' : 'BALANCED',
        second_phalanx_logic: answers.thumb_phalanx_ratio === 'DOMINANT_LOGIC' ? 'STRONG' : 'BALANCED',
        source: 'QUESTIONNAIRE'
      },
      special_markings: specialMarks,
      quality_score: 0.98,
      provenance: {
        mode: 'MODE_2_QUESTIONNAIRE',
        reading_method: 'GUIDED_QUESTIONNAIRE',
        source: 'QUESTIONNAIRE',
        knowledge_version: '1.1.0'
      }
    });
  }

  /**
   * Deterministic conflict resolution policy between CV baseline and user questionnaire
   * @param {PalmFeatureModel} cvModel 
   * @param {PalmFeatureModel} questModel 
   * @returns {PalmFeatureModel} Merged model retaining source metadata
   */
  static reconcile(cvModel, questModel) {
    if (!cvModel) return questModel;
    if (!questModel) return cvModel;

    // Clone CV model as baseline
    const merged = new PalmFeatureModel(JSON.parse(JSON.stringify(cvModel)));

    // 1. Tactile & Morphological features: Questionnaire takes precedence
    merged.hand.firmness = questModel.hand.firmness;
    merged.thumb = { ...questModel.thumb };

    // 2. Special markings: Merge unique confirmed markings
    const markTypes = new Set(merged.special_markings.map(m => m.type));
    for (const qMark of questModel.special_markings) {
      if (!markTypes.has(qMark.type)) {
        merged.special_markings.push(qMark);
        markTypes.add(qMark.type);
      }
    }

    // 3. Crease Line Reconciliation:
    // Retain physical CV polyline coordinates for SVG rendering,
    // but enrich morphology attributes (slope, origin, branches) with questionnaire confirmation.
    for (const [lineKey, qLine] of Object.entries(questModel.major_lines)) {
      if (merged.major_lines[lineKey]) {
        const cvLine = merged.major_lines[lineKey];

        // If CV didn't detect line but user observed it clearly:
        if (!cvLine.detected && qLine.detected) {
          cvLine.detected = true;
          cvLine.status = 'PARTIAL';
          cvLine.confidence = 0.60;
          cvLine.conflict_note = 'Crease confirmed via guided tactile observation; faint under optical sensor.';
        }

        // If user provided specific morphology (slope, origin, curvature), annotate
        if (qLine.slope) cvLine.slope = qLine.slope;
        if (qLine.origin) cvLine.origin = qLine.origin;
        if (qLine.curvature) cvLine.curvature = qLine.curvature;
      }
    }

    merged.provenance = {
      mode: 'HYBRID_FUSION',
      reading_method: 'FUSED_SCAN_AND_QUESTIONNAIRE',
      source: 'FUSED',
      knowledge_version: '1.1.0'
    };

    return merged;
  }
}
