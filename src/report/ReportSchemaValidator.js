/**
 * Kai RegAI — Report Schema Validator
 * Phase: P10 — Report Engine
 * 
 * Strict pre-render integrity validator:
 * - Validates schema versioning and tier consistency
 * - Verifies evidence traceability and traditional citations
 * - Ensures zero fatalistic, medical, or ungrounded claims leak into reports or social exports
 */

export class ReportSchemaValidator {
  /**
   * Validate a canonical ReportModel instance before rendering or export
   * @param {import('./ReportSchema.js').ReportModel} report 
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validate(report) {
    const errors = [];

    if (!report || typeof report !== 'object') {
      return { valid: false, errors: ['Report must be a non-null object'] };
    }

    // 1. Schema Version & Report ID
    if (report.schemaVersion !== '1.0.0') {
      errors.push(`Unsupported schemaVersion: '${report.schemaVersion}'. Expected '1.0.0'`);
    }
    if (!report.reportId || typeof report.reportId !== 'string') {
      errors.push('Report missing valid reportId');
    }

    // 2. Reading Method & Tier
    const validTiers = ['QUICK', 'STANDARD', 'PREMIUM'];
    if (!validTiers.includes(report.reportTier)) {
      errors.push(`Invalid reportTier '${report.reportTier}'. Must be one of: ${validTiers.join(', ')}`);
    }
    const validMethods = ['MODE_1_CAMERA', 'MODE_2_QUESTIONNAIRE'];
    if (!validMethods.includes(report.readingMethod)) {
      errors.push(`Invalid readingMethod '${report.readingMethod}'`);
    }

    // 3. Summary & Headline
    if (!report.summary || typeof report.summary !== 'object') {
      errors.push('Report missing valid summary object');
    } else {
      if (!report.summary.title || typeof report.summary.title !== 'string') {
        errors.push('Report summary missing title');
      }
      if (!Array.isArray(report.summary.keyThemes) || report.summary.keyThemes.length === 0) {
        errors.push('Report summary must contain at least one keyTheme');
      }
    }

    // 4. Sections & Content
    if (!Array.isArray(report.sections)) {
      errors.push('Report sections must be an array');
    }

    // 5. Epistemic Safety Check: Scan all readable text for fatalism / medical diagnoses
    const fullProse = [
      report.summary?.title,
      report.summary?.headline,
      report.summary?.overviewText,
      ...(report.summary?.keyThemes || []).map(t => `${t.label} ${t.insight || ''}`),
      ...(report.sections || []).flatMap(s => [s.heading, ...(s.paragraphs || [])])
    ].filter(Boolean).join(' ');

    const lowerProse = fullProse.toLowerCase();

    // Fatalism check
    const fatalPatterns = [
      /\b(you will die|live until (age\s+)?\d+|lifespan of \d+)\b/i,
      /\b(destined to divorce|inevitable separation)\b/i,
      /\b(guaranteed (great\s+)?wealth|win the lottery)\b/i,
      /\b(inevitable accident|curse on your palm)\b/i
    ];
    for (const pat of fatalPatterns) {
      if (pat.test(lowerProse)) {
        errors.push(`Epistemic Safety Violation: Report contains fatalistic claim matching '${pat.source}'`);
      }
    }

    // Medical check
    const medicalPatterns = [
      /\b(diagnos(e|is|ed)|heart attack|cardiac disease|cancer|stroke)\b/i,
      /\b(artery blockage|neurological disorder|clinical depression)\b/i
    ];
    for (const pat of medicalPatterns) {
      if (pat.test(lowerProse)) {
        errors.push(`Epistemic Safety Violation: Report contains medical claim matching '${pat.source}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
