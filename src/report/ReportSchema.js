/**
 * Kai RegAI — Canonical Report Schema & Model
 * Phase: P10 — Report Engine
 * 
 * Formal data contract produced by ReportComposer:
 * - Versioned schema (schemaVersion: "1.0.0")
 * - Supports 3 Tiers: QUICK, STANDARD, PREMIUM
 * - Completely decoupled from rendering (Web, Print, PDF, Social)
 * - Zero PII required; zero raw biometric image leakage
 */

export const REPORT_TIERS = {
  QUICK: 'QUICK',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM'
};

export class ReportModel {
  constructor(data = {}) {
    this.schemaVersion = data.schemaVersion || '1.0.0';
    this.reportId = data.reportId || `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.generatedAt = data.generatedAt || new Date().toISOString();
    this.readingMethod = data.readingMethod || 'MODE_1_CAMERA';
    this.readingMethodLabel = data.readingMethodLabel || 'Rapid Camera Scan';
    this.reportTier = data.reportTier || REPORT_TIERS.PREMIUM;

    // Subject display info (zero mandatory PII)
    this.subject = {
      displayName: data.subject?.displayName || null,
      handSide: data.subject?.handSide || 'RIGHT',
      handDominance: data.subject?.handDominance || 'DOMINANT'
    };

    // Executive Overview & Key Takeaways
    this.summary = {
      title: data.summary?.title || 'Personal Hastarekha Reading',
      headline: data.summary?.headline || '',
      opening: data.summary?.opening || '',
      overviewText: data.summary?.overviewText || '',
      keyThemes: data.summary?.keyThemes || [] // 3-5 KeyTakeawayCards
    };

    // Narrative Chapters (Constitution, Vocation, Relationships, Guidance)
    this.sections = data.sections || [];

    // Palm Visualization Model (Evidence-backed SVG lines & markers)
    this.palmVisualization = data.palmVisualization || {
      viewBox: '0 0 360 450',
      lines: {},
      markers: []
    };

    // Palm Line Evidence Table
    this.majorLines = data.majorLines || [];

    // Mounts & Marks block
    this.features = data.features || {
      mounts: [],
      thumb: {},
      markings: []
    };

    // Auditable Evidence & Traceability
    this.evidence = data.evidence || [];
    this.confidence = {
      score: data.confidence?.score ?? 0.85,
      band: data.confidence?.band || 'MODERATE',
      qualityScore: data.confidence?.qualityScore ?? 0.90,
      isConstrained: data.confidence?.isConstrained ?? false
    };

    // Literature & Traditional Sources
    this.sources = data.sources || [];

    // Explicit Uncertainty Notes
    this.uncertaintyNotes = data.uncertaintyNotes || [];

    // Metadata & Generation Audit
    this.metadata = {
      codexVersion: data.metadata?.codexVersion || '1.0.0',
      narrationVersion: data.metadata?.narrationVersion || '1.0.0',
      promptVersion: data.metadata?.promptVersion || '1.0.0',
      generationMode: data.metadata?.generationMode || 'AI_ORCHESTRATED',
      fallbackTriggered: data.metadata?.fallbackTriggered || false
    };

    // Export & Sharing configuration
    this.export = {
      pdfReady: true,
      socialCardsAvailable: ['1:1', '4:5', '9:16'],
      disclaimer: 'Kai RegAI presents traditional palm-reading interpretations for reflection and personal exploration. These interpretations are not scientific predictions, medical diagnoses, or financial guarantees.'
    };
  }

  /**
   * Explain why a specific observation or interpretation appears (Explainability API)
   * @param {string} domainOrLine 
   * @returns {Object[]}
   */
  getExplanation(domainOrLine) {
    const target = domainOrLine.toUpperCase().replace(' ', '_');
    return this.evidence.filter(e => 
      (e.domain && e.domain.includes(target)) ||
      (e.featurePath && e.featurePath.toUpperCase().includes(target)) ||
      (e.ruleId && e.ruleId.includes(target))
    );
  }

  toJSON() {
    return {
      schemaVersion: this.schemaVersion,
      reportId: this.reportId,
      generatedAt: this.generatedAt,
      readingMethod: this.readingMethod,
      reportTier: this.reportTier,
      subject: this.subject,
      summary: this.summary,
      sections: this.sections,
      palmVisualization: this.palmVisualization,
      majorLines: this.majorLines,
      confidence: this.confidence,
      sources: this.sources,
      metadata: this.metadata,
      export: this.export
    };
  }
}
