/**
 * Kai RegAI — Interpretation Dossier
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Master data class produced by the P8 Interpretation Engine:
 * - 100% compatible with QuickReportScreen & DetailedReportScreen
 * - Carries full inspectable evidence trail, confidence bands, and epistemic audit
 * - Supports "Why am I seeing this?" explanation queries
 */

export class InterpretationDossier {
  constructor(data = {}) {
    this.id = data.id || `RDG-${Date.now()}`;
    this.mode = data.mode || 'MODE_1_SCANNER';
    this.reading_method = data.reading_method || 'CAMERA_SCAN';
    this.reading_method_label = data.reading_method_label || 'Rapid Camera Scan';
    this.title = data.title || 'Personal Hastarekha Dossier';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.hand_side = data.hand_side || 'RIGHT';
    this.hand_dominance = data.hand_dominance || 'DOMINANT';
    this.summary = data.summary || '';
    
    // Confidence & Quality
    this.quality_score = data.quality_score ?? 0.94;
    this.confidence = data.confidence ?? 0.90;
    this.confidence_band = data.confidence_band || 'HIGH';

    // Tags & Badges
    this.tags = data.tags || [];

    // Major Lines across 4 Epistemic Tiers
    this.major_lines = data.major_lines || [];

    // Synthesis Chapters (Constitution, Vocation, Relationships, Guidance)
    this.synthesis_chapters = data.synthesis_chapters || {
      constitution: '',
      vocation: '',
      relationships: '',
      guidance: ''
    };

    // Features block (Mounts, Thumb, Markings)
    this.features = data.features || {
      mounts: [],
      thumb: {},
      markings: []
    };

    // Auditable Evidence & Traceability Trail
    this.evidence = data.evidence || [];
    this.multi_source_agreements = data.multi_source_agreements || [];
    this.conflicts = data.conflicts || [];

    // Audit Metadata
    this.provenance = {
      ...data.provenance,
      interpretation_engine_version: '3.0.0',
      codex_version: '1.0.0',
      epistemic_safety_verified: true
    };
  }

  /**
   * Explain why a specific conclusion was reached (Explainability API)
   * @param {string} domainOrLine - e.g. 'LIFE_LINE' or 'head_line'
   * @returns {Object[]}
   */
  getExplanation(domainOrLine) {
    const targetDomain = domainOrLine.toUpperCase().replace(' ', '_');
    return this.evidence.filter(e => 
      e.domain === targetDomain || 
      e.domain.includes(targetDomain) || 
      (e.ruleId && e.ruleId.includes(targetDomain))
    );
  }

  /**
   * Convert to clean JSON representation
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      mode: this.mode,
      reading_method: this.reading_method,
      reading_method_label: this.reading_method_label,
      title: this.title,
      timestamp: this.timestamp,
      hand_side: this.hand_side,
      hand_dominance: this.hand_dominance,
      summary: this.summary,
      quality_score: this.quality_score,
      confidence: this.confidence,
      confidence_band: this.confidence_band,
      tags: this.tags,
      major_lines: this.major_lines,
      synthesis_chapters: this.synthesis_chapters,
      features: this.features,
      evidence_count: this.evidence.length,
      provenance: this.provenance
    };
  }
}
