/**
 * Kai RegAI — Golden Interpretation Corpus
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * 12 Deterministic Golden Profiles mandated by Prompt Section 38:
 * Each case defines canonical PalmFeatureModel input and expected interpretation outcomes.
 */

import { PalmFeatureModel } from '../../../src/models/PalmFeatureModel.js';

export const GOLDEN_INTERPRETATION_CASES = [
  {
    id: 'CASE-01',
    name: 'Strong Visible Life Line',
    description: 'Expansive, continuous Life Line with wide thenar curvature.',
    input: new PalmFeatureModel({
      session_id: 'golden-01',
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', continuity: 'CONTINUOUS', confidence: 0.96 }
      },
      hand: { elemental_shape: 'EARTH' }
    }),
    expected: {
      matchedRulesSubset: ['WST_LIFE_WIDE_SWEEP_01', 'HS_AYUR_GENEROUS_ARC_01'],
      lifeLineStatus: 'DETECTED',
      confidenceBand: 'HIGH',
      hasObservationKeyword: 'Expansive'
    }
  },
  {
    id: 'CASE-02',
    name: 'Partial Life Line',
    description: 'Life Line observed with fragmented or faint contrast.',
    input: new PalmFeatureModel({
      session_id: 'golden-02',
      quality_score: 0.70,
      major_lines: {
        life_line: { detected: true, status: 'PARTIAL', confidence: 0.65 }
      }
    }),
    expected: {
      matchedRulesSubset: ['WST_LIFE_PARTIAL_OR_UNOBSERVED_03'],
      lifeLineStatus: 'PARTIAL',
      confidenceBand: 'MODERATE'
    }
  },
  {
    id: 'CASE-03',
    name: 'Invisible Life Line',
    description: 'Life Line reported as not visible in available observations.',
    input: new PalmFeatureModel({
      session_id: 'golden-03',
      major_lines: {
        life_line: { detected: false, status: 'NOT_DETECTED', confidence: 0.30 }
      }
    }),
    expected: {
      lifeLineStatus: 'NOT_DETECTED',
      hasNoFatalism: true
    }
  },
  {
    id: 'CASE-04',
    name: 'Clear Sloping Head Line',
    description: 'Head Line with gentle slope toward Mount of Moon.',
    input: new PalmFeatureModel({
      session_id: 'golden-04',
      major_lines: {
        head_line: { detected: true, status: 'DETECTED', slope: 'GENTLE_SLOPE_TO_LUNA', clarity: 'UNBROKEN', confidence: 0.95 }
      }
    }),
    expected: {
      matchedRulesSubset: ['WST_HEAD_GENTLE_SLOPE_01', 'HS_MATRU_CHANDRA_SLOPE_01'],
      headLineStatus: 'DETECTED',
      confidenceBand: 'HIGH'
    }
  },
  {
    id: 'CASE-05',
    name: 'Clear Heart Line to Jupiter',
    description: 'Heart Line terminating gracefully on the Mount of Jupiter.',
    input: new PalmFeatureModel({
      session_id: 'golden-05',
      major_lines: {
        heart_line: { detected: true, status: 'DETECTED', curvature: 'CURVED_TO_JUPITER', confidence: 0.94 }
      }
    }),
    expected: {
      matchedRulesSubset: ['WST_HEART_JUPITER_CURVE_01', 'HS_HRIDAYA_GURU_TERMINATION_01'],
      heartLineStatus: 'DETECTED',
      confidenceBand: 'HIGH'
    }
  },
  {
    id: 'CASE-06',
    name: 'Clear Fate Line (Saturn)',
    description: 'Central vertical crease ascending longitudinally to Saturn.',
    input: new PalmFeatureModel({
      session_id: 'golden-06',
      major_lines: {
        fate_line: { detected: true, status: 'DETECTED', continuity: 'STRONG_CENTRAL', confidence: 0.90 }
      }
    }),
    expected: {
      matchedRulesSubset: ['WST_FATE_STRONG_CENTRAL_01', 'HS_KARMA_UNBROKEN_SHANI_01'],
      fateLineStatus: 'DETECTED'
    }
  },
  {
    id: 'CASE-07',
    name: 'Clear Sun Line (Apollo)',
    description: 'Prominent luminary crease beneath the ring finger.',
    input: new PalmFeatureModel({
      session_id: 'golden-07',
      major_lines: {
        sun_line: { detected: true, status: 'DETECTED', strength: 'PROMINENT_UPPER', confidence: 0.88 }
      }
    }),
    expected: {
      matchedRulesSubset: ['WST_SUN_PROMINENT_01', 'HS_SURYA_RADIANT_APOLLO_01'],
      sunLineStatus: 'DETECTED'
    }
  },
  {
    id: 'CASE-08',
    name: 'Multiple Uncertain Features',
    description: 'Hand with partial, faint, or ambiguous creases.',
    input: new PalmFeatureModel({
      session_id: 'golden-08',
      quality_score: 0.45,
      major_lines: {
        life_line: { detected: true, status: 'PARTIAL', confidence: 0.45 },
        head_line: { detected: false, status: 'NOT_DETECTED', confidence: 0.35 },
        heart_line: { detected: false, status: 'NOT_DETECTED', confidence: 0.30 },
        fate_line: { detected: false, status: 'NOT_DETECTED', confidence: 0.20 }
      }
    }),
    expected: {
      confidenceBand: 'LOW',
      hasNoFatalism: true
    }
  },
  {
    id: 'CASE-09',
    name: 'Questionnaire-Derived Features (Mode 2)',
    description: 'Pure Mode 2 guided questionnaire observations with tactile and thumb inputs.',
    input: new PalmFeatureModel({
      session_id: 'golden-09',
      hand: { side: 'RIGHT', elemental_shape: 'FIRE', firmness: 'ELASTIC_RESILIENT' },
      thumb: { flexibility_type: 'SUPPLE_BACKWARD', flexibility_angle: 50 },
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', confidence: 0.95 },
        head_line: { detected: true, status: 'DETECTED', slope: 'GENTLE_SLOPE', confidence: 0.95 },
        heart_line: { detected: true, status: 'DETECTED', curvature: 'CURVED_TO_JUPITER', confidence: 0.95 }
      },
      special_markings: [{ id: 'MARK-Q1', type: 'TRISHULA_TRIDENT', mount: 'JUPITER', tradition: 'HASTA_SAMUDRIKA' }],
      provenance: { mode: 'MODE_2_QUESTIONNAIRE', reading_method: 'GUIDED_QUESTIONNAIRE' }
    }),
    expected: {
      mode: 'MODE_2_GUIDED',
      readingMethod: 'GUIDED_QUESTIONNAIRE',
      readingMethodLabel: 'Guided Palm Reading',
      matchedRulesSubset: ['SYN_CONST_FIRE_01', 'WST_THUMB_SUPPLE_01', 'HS_MARK_TRISHULA_TRIDENT_01']
    }
  },
  {
    id: 'CASE-10',
    name: 'Vision-Derived Features (Mode 1)',
    description: 'Pure Mode 1 camera scan features extracted from optical frame.',
    input: new PalmFeatureModel({
      session_id: 'golden-10',
      hand: { side: 'LEFT', elemental_shape: 'EARTH' },
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', confidence: 0.96 },
        head_line: { detected: true, status: 'DETECTED', slope: 'STRAIGHT', confidence: 0.94 },
        heart_line: { detected: true, status: 'DETECTED', curvature: 'CURVED_TO_JUPITER', confidence: 0.92 }
      },
      provenance: { mode: 'MODE_1_SCANNER', reading_method: 'CAMERA_SCAN' }
    }),
    expected: {
      mode: 'MODE_1_SCANNER',
      readingMethod: 'CAMERA_SCAN',
      readingMethodLabel: 'Rapid Camera Scan',
      matchedRulesSubset: ['SYN_CONST_EARTH_02', 'WST_HEAD_STRAIGHT_TRANSVERSE_02']
    }
  },
  {
    id: 'CASE-11',
    name: 'Conflicting Sources Reconciled',
    description: 'Hand profile with multi-source traditional consensus and balanced features.',
    input: new PalmFeatureModel({
      session_id: 'golden-11',
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', confidence: 0.95 },
        head_line: { detected: true, status: 'DETECTED', slope: 'GENTLE_SLOPE_TO_LUNA', confidence: 0.95 }
      }
    }),
    expected: {
      hasMultiSourceAgreement: true,
      domainAgreements: ['LIFE_LINE', 'HEAD_LINE']
    }
  },
  {
    id: 'CASE-12',
    name: 'Missing Evidence / Out of Frame',
    description: 'Lines clipped or outside the capture boundary.',
    input: new PalmFeatureModel({
      session_id: 'golden-12',
      major_lines: {
        life_line: { detected: false, status: 'OUT_OF_FRAME', confidence: 0.20 },
        fate_line: { detected: false, status: 'OUT_OF_FRAME', confidence: 0.15 }
      }
    }),
    expected: {
      lifeLineStatus: 'OUT_OF_FRAME',
      hasObservationKeyword: 'outside the sensor frame boundary'
    }
  }
];
