/**
 * Kai RegAI — Report Composer
 * Phase: P10 — Report Engine
 * 
 * Composes canonical ReportModel instances from ReportContext across 3 tiers:
 * - QUICK: Concise scan report (< 220 words, 3 key themes, SVG line summary)
 * - STANDARD: Digital 4-chapter report with line analysis and reflective guidance
 * - PREMIUM: Archival dossier with dedicated cover, deep traditional citations,
 *            mounts/marks analysis, explainability trails, and vector PDF readiness.
 */

import { ReportModel, REPORT_TIERS } from './ReportSchema.js';

export class ReportComposer {
  /**
   * Compose canonical ReportModel
   * @param {Object} reportContext - Output from ReportContextBuilder.build()
   * @returns {ReportModel}
   */
  static compose(reportContext) {
    const {
      dossier,
      narratedReading,
      tier = REPORT_TIERS.PREMIUM,
      displayName,
      readingMethod,
      readingMethodLabel,
      palmSvgLines,
      majorLines,
      sources,
      uncertaintyNotes
    } = reportContext;

    // Executive summary data
    const title = narratedReading?.title || dossier.title || 'Personal Hastarekha Reading';
    const headline = narratedReading?.headline || dossier.summary || 'A dynamic reflection of constitutional vitality and purpose.';
    const opening = narratedReading?.opening || 'Welcome to your Kai RegAI personal palm reading.';
    const overviewText = narratedReading?.summary || dossier.summary || '';

    // Key Themes (ensure 3-5 themes)
    const keyThemes = (narratedReading?.keyThemes && narratedReading.keyThemes.length > 0)
      ? narratedReading.keyThemes
      : [
          { id: 'theme_vitality', label: 'Constitutional Vitality', insight: 'Steady physical stamina supported by mindful pacing.', confidenceBand: dossier.confidence_band || 'MODERATE' },
          { id: 'theme_cognition', label: 'Deliberate Intellect', insight: 'Balancing structured analysis with intuitive pragmatism.', confidenceBand: dossier.confidence_band || 'MODERATE' },
          { id: 'theme_empathy', label: 'Thoughtful Discernment', insight: 'Authentic interpersonal warmth tempered by healthy boundaries.', confidenceBand: dossier.confidence_band || 'MODERATE' }
        ];

    // Select sections based on tier
    let allSections = [];
    if (narratedReading?.sections && narratedReading.sections.length > 0) {
      allSections = narratedReading.sections;
    } else {
      // Fallback from dossier synthesis chapters
      const syn = dossier.synthesis_chapters || {};
      allSections = [
        {
          id: 'section_constitution',
          heading: 'Chapter I: Constitution & Vitality Flow',
          paragraphs: [syn.constitution || 'Your vitality crease highlights grounded constitutional resilience.'],
          evidenceRefs: ['lines.life_line']
        },
        {
          id: 'section_vocation',
          heading: 'Chapter II: Strategic Intellect & Vocational Drive',
          paragraphs: [syn.vocation || 'Transverse cognitive crease points toward pragmatic problem solving.'],
          evidenceRefs: ['lines.head_line']
        },
        {
          id: 'section_relationships',
          heading: 'Chapter III: Interpersonal & Emotional Landscape',
          paragraphs: [syn.relationships || 'Emotional orientation reflects thoughtful empathy and mutual respect.'],
          evidenceRefs: ['lines.heart_line']
        },
        {
          id: 'section_guidance',
          heading: 'Chapter IV: Reflective Guidance',
          paragraphs: [syn.guidance || 'Mindful living supports the ongoing evolution of your personal path.'],
          evidenceRefs: ['lines.life_line', 'lines.head_line']
        }
      ];
    }

    const sections = (tier === REPORT_TIERS.QUICK) ? allSections.slice(0, 1) : allSections;

    // Assemble Palm Visualization object
    const palmVisualization = {
      viewBox: '0 0 360 450',
      lines: palmSvgLines,
      dominantColor: dossier.hand_side === 'RIGHT' ? '#00D2FF' : '#A855F7',
      elementalBase: (dossier.tags || []).find(t => t.includes('Elemental')) || 'Earth Elemental Base'
    };

    return new ReportModel({
      schemaVersion: '1.0.0',
      reportId: `RPT-${dossier.id || Date.now()}`,
      generatedAt: new Date().toISOString(),
      readingMethod,
      readingMethodLabel,
      reportTier: tier,
      subject: {
        displayName,
        handSide: dossier.hand_side || 'RIGHT',
        handDominance: dossier.hand_dominance || 'DOMINANT'
      },
      summary: {
        title,
        headline,
        opening,
        overviewText,
        keyThemes
      },
      sections,
      palmVisualization,
      majorLines,
      features: dossier.features || {},
      evidence: dossier.evidence || [],
      confidence: {
        score: dossier.confidence ?? 0.85,
        band: dossier.confidence_band || 'MODERATE',
        qualityScore: dossier.quality_score ?? 0.90,
        isConstrained: (dossier.confidence ?? 0.85) < 0.65
      },
      sources,
      uncertaintyNotes,
      metadata: {
        codexVersion: dossier.provenance?.codex_version || '1.0.0',
        narrationVersion: narratedReading?.narrationVersion || '1.0.0',
        promptVersion: narratedReading?.generation?.promptVersion || '1.0.0',
        generationMode: narratedReading?.generation?.mode || 'AI_ORCHESTRATED',
        fallbackTriggered: narratedReading?.generation?.fallbackTriggered || false
      }
    });
  }
}
