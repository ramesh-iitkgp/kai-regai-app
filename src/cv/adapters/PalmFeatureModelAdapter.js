/**
 * Kai RegAI — PalmFeatureModel & SVG Overlay Adapter
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Translates low-level PalmVisionResult into:
 * 1. Canonical PalmFeatureModel instance
 * 2. Formatted SVG polylines and path data for PalmLineOverlay (360x450 coordinate frame)
 */

import { PalmFeatureModel } from '../../models/PalmFeatureModel.js';

export class PalmFeatureModelAdapter {
  /**
   * Convert PalmVisionResult into a canonical PalmFeatureModel
   * @param {import('../types.js').PalmVisionResult} visionResult
   * @param {string} [sessionId='']
   * @returns {PalmFeatureModel}
   */
  static toPalmFeatureModel(visionResult, sessionId = '') {
    const { hand, lines, imageQuality, processing } = visionResult;

    return new PalmFeatureModel({
      session_id: sessionId,
      schema_version: '2.0.0',
      hand: {
        side: hand.handedness === 'LEFT' ? 'LEFT' : 'RIGHT',
        dominance: 'DOMINANT',
        elemental_shape: 'FIRE',
        firmness: 'ELASTIC_RESILIENT',
        ratios: {
          palm_ratio: 1.05,
          finger_to_palm_ratio: 0.82
        }
      },
      major_lines: {
        life_line: {
          detected: lines.life.status !== 'NOT_DETECTED',
          length: lines.life.evidence.structuralScore > 0.8 ? 'LONG_SWEEPING' : 'MODERATE_ARC',
          curvature: 'WIDE_ARC',
          depth: lines.life.evidence.contrast > 0.4 ? 'DEEP_CLEAR' : 'MODERATE',
          confidence: lines.life.confidence,
          semantic_color: '#A855F7',
          glyph: 'vitality',
          polyline: lines.life.polyline,
          status: lines.life.status
        },
        head_line: {
          detected: lines.head.status !== 'NOT_DETECTED',
          length: lines.head.evidence.structuralScore > 0.7 ? 'LONG' : 'MEDIUM',
          slope: 'GENTLE_SLOPE_TO_LUNA',
          clarity: lines.head.continuity > 0.8 ? 'UNBROKEN' : 'SLIGHTLY_INTERRUPTED',
          confidence: lines.head.confidence,
          semantic_color: '#00D2FF',
          glyph: 'intellect',
          polyline: lines.head.polyline,
          status: lines.head.status
        },
        heart_line: {
          detected: lines.heart.status !== 'NOT_DETECTED',
          curvature: 'CURVED_TO_JUPITER',
          forking: 'CLASSIC_TERMINATION',
          confidence: lines.heart.confidence,
          semantic_color: '#F43F5E',
          glyph: 'emotion',
          polyline: lines.heart.polyline,
          status: lines.heart.status
        },
        fate_line: {
          detected: lines.fate.status !== 'NOT_DETECTED',
          origin: 'BASE_OF_PALM',
          destination: 'MOUNT_OF_SATURN',
          continuity: lines.fate.status === 'DETECTED' ? 'STRONG_CENTRAL' : 'FAINT_PARTIAL',
          confidence: lines.fate.confidence,
          semantic_color: '#FBBF24',
          glyph: 'destiny',
          polyline: lines.fate.polyline,
          status: lines.fate.status
        },
        sun_line: {
          detected: lines.sun.status !== 'NOT_DETECTED',
          strength: lines.sun.status === 'DETECTED' ? 'PROMINENT_UPPER' : 'NOT_OBSERVED',
          destination: 'MOUNT_OF_APOLLO',
          confidence: lines.sun.confidence,
          semantic_color: '#F59E0B',
          glyph: 'radiance',
          polyline: lines.sun.polyline,
          status: lines.sun.status
        }
      },
      quality_score: imageQuality.score,
      provenance: {
        mode: 'MODE_1_SCANNER',
        cv_version: processing.engineVersion,
        knowledge_version: '1.1.0'
      }
    });
  }

  /**
   * Convert normalized [0, 1] polyline coordinates to SVG path string in target viewBox
   * @param {import('../types.js').Point[]} polyline - Points in normalized [0, 1] coordinates
   * @param {number} [targetWidth=360]
   * @param {number} [targetHeight=450]
   * @returns {string} SVG "d" attribute path string
   */
  static polylineToSvgPath(polyline, targetWidth = 360, targetHeight = 450) {
    if (!polyline || polyline.length === 0) return '';
    if (polyline.length === 1) {
      const px = Math.round(polyline[0].x * targetWidth);
      const py = Math.round(polyline[0].y * targetHeight);
      return `M ${px} ${py} L ${px} ${py}`;
    }

    const pts = polyline.map(p => ({
      x: Math.round(p.x * targetWidth),
      y: Math.round(p.y * targetHeight)
    }));

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      path += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return path;
  }
}
