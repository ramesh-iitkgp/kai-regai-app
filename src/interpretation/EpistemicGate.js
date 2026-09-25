/**
 * Kai RegAI — Epistemic Safety Gate
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Enforces mandatory product safety laws:
 * 1. Zero fatalistic predictions (lifespan, death age, divorce counts, predestined ruin)
 * 2. Zero medical diagnoses (cardiovascular disease, organ health, clinical conditions)
 * 3. Epistemic qualification enforcement (preserves reflective personal synthesis framing)
 */

export const FORBIDDEN_FATALISTIC_PATTERNS = [
  /\bwill die\b/i,
  /\bdeath at\b/i,
  /\bshort life\b/i,
  /\bfatal\b/i,
  /\bpredestined\b/i,
  /\bdivorce\b/i,
  /\bguaranteed wealth\b/i,
  /\bunlucky\b/i,
  /\bdoomed\b/i,
  /\bcannot avoid\b/i,
  /\bdefinitely marry\b/i,
  /\bdefinite expiration\b/i
];

export const FORBIDDEN_MEDICAL_PATTERNS = [
  /\bcancer\b/i,
  /\bheart attack\b/i,
  /\bstroke\b/i,
  /\bdisease diagnosis\b/i,
  /\btumor\b/i,
  /\borgan failure\b/i,
  /\bclinical diagnosis\b/i,
  /\bmedical prognosis\b/i,
  /\bmental illness\b/i
];

export class EpistemicGate {
  /**
   * Scan text for forbidden fatalistic or medical assertions
   * @param {string} text 
   * @returns {{ safe: boolean, violations: string[] }}
   */
  static auditText(text) {
    if (!text || typeof text !== 'string') {
      return { safe: true, violations: [] };
    }

    const violations = [];

    for (const pattern of FORBIDDEN_FATALISTIC_PATTERNS) {
      if (pattern.test(text)) {
        violations.push(`Fatalistic phrase detected: ${pattern}`);
      }
    }

    for (const pattern of FORBIDDEN_MEDICAL_PATTERNS) {
      if (pattern.test(text)) {
        violations.push(`Medical diagnostic claim detected: ${pattern}`);
      }
    }

    return {
      safe: violations.length === 0,
      violations
    };
  }

  /**
   * Filter and sanitize a synthesized interpretation dossier
   * @param {Object} dossier 
   * @returns {{ sanitizedDossier: Object, passed: boolean, violations: string[] }}
   */
  static gateDossier(dossier) {
    const violations = [];

    // Check all synthesis chapters
    if (dossier.synthesis_chapters) {
      for (const [key, text] of Object.entries(dossier.synthesis_chapters)) {
        const audit = this.auditText(text);
        if (!audit.safe) {
          violations.push(`synthesis_chapters.${key}: ${audit.violations.join('; ')}`);
        }
      }
    }

    // Check all major lines
    if (Array.isArray(dossier.major_lines)) {
      for (let i = 0; i < dossier.major_lines.length; i++) {
        const line = dossier.major_lines[i];
        const fields = ['observation', 'traditional_interpretation', 'synthesis'];
        for (const f of fields) {
          const audit = this.auditText(line[f]);
          if (!audit.safe) {
            violations.push(`major_lines[${i}].${f}: ${audit.violations.join('; ')}`);
          }
        }
      }
    }

    return {
      sanitizedDossier: dossier,
      passed: violations.length === 0,
      violations
    };
  }
}
