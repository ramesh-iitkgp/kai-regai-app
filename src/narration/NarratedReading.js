/**
 * Kai RegAI — Canonical Narrated Reading Model
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Formal data contract produced by the P9 Narration Layer:
 * - Versioned schema and narration metadata
 * - Structured chapters, themes, and executive takeaways
 * - Traceable evidence and source citations
 * - 100% backward & forward compatible with QuickReportScreen & DetailedReportScreen
 */

export class NarratedReading {
  constructor(data = {}) {
    this.schemaVersion = data.schemaVersion || '1.0.0';
    this.narrationVersion = data.narrationVersion || '1.0.0';
    this.sourceDossierId = data.sourceDossierId || '';
    this.sourceDossierVersion = data.sourceDossierVersion || '3.0.0';
    this.codexVersion = data.codexVersion || '1.0.0';

    this.title = data.title || 'Personal Hastarekha Reading';
    this.headline = data.headline || '';
    this.opening = data.opening || '';
    this.summary = data.summary || '';

    this.readingMethod = data.readingMethod || 'CAMERA_SCAN';
    this.readingMethodLabel = data.readingMethodLabel || 'Rapid Camera Scan';
    this.handSide = data.handSide || 'RIGHT';
    this.handDominance = data.handDominance || 'DOMINANT';

    // Confidence & Epistemic Band (propagated from P8)
    this.confidence = data.confidence ?? 0.85;
    this.confidenceBand = data.confidenceBand || 'MODERATE';
    this.qualityScore = data.qualityScore ?? 0.90;

    // Narrative Chapters (Constitution, Vocation, Relationships, Guidance)
    this.sections = data.sections || [];

    // Structured Key Themes (non-repetitive synthesized concepts)
    this.keyThemes = data.keyThemes || [];

    // Explicit Observation Uncertainty Notes
    this.uncertaintyNotes = data.uncertaintyNotes || [];

    // Line Presentation (aligned with P8 major lines)
    this.majorLines = data.majorLines || [];

    // Features block (Mounts, Thumb, Sacred Markings)
    this.features = data.features || {
      mounts: [],
      thumb: {},
      markings: []
    };

    // Auditable Evidence & Traditional Source Citations
    this.evidenceReferences = data.evidenceReferences || [];
    this.sourceReferences = data.sourceReferences || [];
    this.conflictsReconciled = data.conflictsReconciled || [];

    // Generation Metadata
    this.generation = {
      mode: data.generation?.mode || 'DETERMINISTIC_FALLBACK', // 'AI_ORCHESTRATED' | 'DETERMINISTIC_FALLBACK'
      provider: data.generation?.provider || 'LOCAL_ENGINE',
      model: data.generation?.model || 'deterministic-v1',
      promptVersion: data.generation?.promptVersion || '1.0.0',
      generatedAt: data.generation?.generatedAt || new Date().toISOString(),
      latencyMs: data.generation?.latencyMs ?? 0,
      safetyVerified: data.generation?.safetyVerified ?? true,
      evidenceVerified: data.generation?.evidenceVerified ?? true,
      fallbackTriggered: data.generation?.fallbackTriggered ?? false,
      fallbackReason: data.generation?.fallbackReason || null
    };

    // Legacy/Screen Compatibility layer: ensure properties expected by existing screens exist
    this.id = this.sourceDossierId || `NRD-${Date.now()}`;
    this.hand_side = this.handSide;
    this.reading_method = this.readingMethod;
    this.reading_method_label = this.readingMethodLabel;
    this.quality_score = this.qualityScore;
    this.confidence_band = this.confidenceBand;
    this.major_lines = this.majorLines;
    this.synthesis_chapters = this.buildLegacySynthesisChapters();
    this.tags = data.tags || [
      this.readingMethodLabel,
      `${this.handSide === 'RIGHT' ? 'Right' : 'Left'} Hand`,
      this.confidenceBand
    ];
  }

  /**
   * Helper to format legacy synthesis chapters for screen compatibility
   */
  buildLegacySynthesisChapters() {
    const chapters = {
      constitution: '',
      vocation: '',
      relationships: '',
      guidance: ''
    };

    for (const section of this.sections) {
      const id = (section.id || '').toLowerCase();
      if (id.includes('constitution') || id.includes('vitality')) {
        chapters.constitution = section.text || section.paragraphs?.join('\n\n') || '';
      } else if (id.includes('vocation') || id.includes('clarity') || id.includes('career')) {
        chapters.vocation = section.text || section.paragraphs?.join('\n\n') || '';
      } else if (id.includes('relationship') || id.includes('emotion')) {
        chapters.relationships = section.text || section.paragraphs?.join('\n\n') || '';
      } else if (id.includes('guidance') || id.includes('reflection')) {
        chapters.guidance = section.text || section.paragraphs?.join('\n\n') || '';
      }
    }
    return chapters;
  }

  /**
   * Query evidence and sources supporting a specific chapter or theme
   * @param {string} sectionId 
   * @returns {Object}
   */
  getSectionEvidence(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return { evidence: [], sources: [] };

    const evidence = this.evidenceReferences.filter(e => 
      section.evidenceRefs?.includes(e.featurePath) || section.evidenceRefs?.includes(e.ruleId)
    );
    const sources = this.sourceReferences.filter(s => 
      section.sourceRefs?.includes(s.sourceId)
    );

    return { evidence, sources };
  }

  toJSON() {
    return {
      schemaVersion: this.schemaVersion,
      narrationVersion: this.narrationVersion,
      sourceDossierId: this.sourceDossierId,
      title: this.title,
      headline: this.headline,
      opening: this.opening,
      summary: this.summary,
      readingMethod: this.readingMethod,
      confidenceBand: this.confidenceBand,
      sections: this.sections,
      keyThemes: this.keyThemes,
      uncertaintyNotes: this.uncertaintyNotes,
      generation: this.generation
    };
  }
}
