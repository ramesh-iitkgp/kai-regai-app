/**
 * Kai RegAI — Report Context Builder
 * Phase: P10 — Report Engine
 * 
 * Prepares presentation-ready report context by combining:
 * - P8 InterpretationDossier (physical observations & evidence trace)
 * - P9 NarratedReading (cohesive, empathetic prose)
 * - PalmFeatureModel (evidence-backed SVG crease paths)
 */

import { PalmFeatureModelAdapter } from '../cv/adapters/PalmFeatureModelAdapter.js';

export class ReportContextBuilder {
  /**
   * Build unified report context
   * @param {Object} params
   * @param {import('../interpretation/InterpretationDossier.js').InterpretationDossier} params.dossier
   * @param {import('../narration/NarratedReading.js').NarratedReading} [params.narratedReading]
   * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} [params.featureModel]
   * @param {string} [params.tier='PREMIUM']
   * @param {string} [params.displayName]
   * @returns {Object}
   */
  static build({ dossier, narratedReading, featureModel, tier = 'PREMIUM', displayName = null }) {
    if (!dossier) {
      throw new Error('ReportContextBuilder requires a valid InterpretationDossier');
    }

    const isQuestionnaire = dossier.mode === 'MODE_2_QUESTIONNAIRE' ||
                            dossier.reading_method === 'GUIDED_QUESTIONNAIRE';

    // 1. Build Palm Visualization SVG Model
    let palmSvgLines = {};
    if (featureModel?.major_lines) {
      const ml = featureModel.major_lines;
      palmSvgLines = {
        life: {
          path: PalmFeatureModelAdapter.polylineToSvgPath(ml.life_line?.polyline, 360, 450),
          status: ml.life_line?.status || (ml.life_line?.detected ? 'DETECTED' : 'NOT_DETECTED')
        },
        head: {
          path: PalmFeatureModelAdapter.polylineToSvgPath(ml.head_line?.polyline, 360, 450),
          status: ml.head_line?.status || (ml.head_line?.detected ? 'DETECTED' : 'NOT_DETECTED')
        },
        heart: {
          path: PalmFeatureModelAdapter.polylineToSvgPath(ml.heart_line?.polyline, 360, 450),
          status: ml.heart_line?.status || (ml.heart_line?.detected ? 'DETECTED' : 'NOT_DETECTED')
        },
        fate: {
          path: PalmFeatureModelAdapter.polylineToSvgPath(ml.fate_line?.polyline, 360, 450),
          status: ml.fate_line?.status || (ml.fate_line?.detected ? 'DETECTED' : 'NOT_DETECTED')
        },
        sun: {
          path: PalmFeatureModelAdapter.polylineToSvgPath(ml.sun_line?.polyline, 360, 450),
          status: ml.sun_line?.status || (ml.sun_line?.detected ? 'DETECTED' : 'NOT_DETECTED')
        }
      };
    } else {
      // Canonical fallback overlay paths for questionnaire or mock readings
      palmSvgLines = {
        life: { path: 'M 128 178 Q 146 220 148 290 Q 148 340 185 372', status: 'DETECTED' },
        head: { path: 'M 128 180 Q 185 190 236 215 Q 260 228 274 250', status: 'DETECTED' },
        heart: { path: 'M 285 158 Q 230 148 185 142 Q 160 138 145 118', status: 'DETECTED' },
        fate: { path: 'M 190 380 L 188 235 L 185 132', status: 'PARTIAL' },
        sun: { path: 'M 224 235 L 222 135', status: 'DETECTED' }
      };
    }

    // 2. Format Major Lines Presentation with Status & Epistemic Layers
    const majorLines = (dossier.major_lines || []).map(line => ({
      key: line.key || line.name?.toLowerCase().replace(/[^a-z]/g, '_') || 'line',
      name: line.name,
      status: line.status || 'DETECTED',
      color: line.color || '#A855F7',
      glyph: line.glyph || 'crease',
      tier1_observation: line.tier1_observation || line.observation || '',
      tier2_western: line.tier2_western || '',
      tier3_hasta_samudrika: line.tier3_hasta_samudrika || '',
      tier4_synthesis: line.tier4_synthesis || line.synthesis || '',
      confidence: line.confidence ?? 0.85
    }));

    // 3. Extract Literature Sources
    const sources = (dossier.provenance?.sources || [
      { sourceId: 'SRC_WESTERN', name: 'Classical Western Palmistry (Cheiro, Benham)', tradition: 'Western Classical' },
      { sourceId: 'SRC_HASTA', name: 'Hasta Samudrika (Samudrika Shastra, Narada Samhita)', tradition: 'Hasta Samudrika' },
      { sourceId: 'SRC_KAI_SYN', name: 'Kai RegAI Archetypal Synthesis', tradition: 'Kai RegAI' }
    ]);

    // 4. Uncertainty Notes
    const uncertaintyNotes = narratedReading?.uncertaintyNotes || [];

    return {
      dossier,
      narratedReading,
      tier,
      displayName,
      readingMethod: isQuestionnaire ? 'MODE_2_QUESTIONNAIRE' : 'MODE_1_CAMERA',
      readingMethodLabel: isQuestionnaire ? 'Guided Palm Reading' : 'Rapid Camera Scan',
      palmSvgLines,
      majorLines,
      sources,
      uncertaintyNotes
    };
  }
}
