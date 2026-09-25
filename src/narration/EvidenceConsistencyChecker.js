/**
 * Kai RegAI — Evidence Consistency Checker
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Master consistency verifier between AI prose and P8 InterpretationDossier:
 * - Ensures every discussed feature is physically grounded in P8 evidence
 * - Flags and rejects hallucinated lines (e.g. praising a long Fate line when P8 marked it OUT_OF_FRAME)
 * - Guards against confidence inflation and epistemic tier collapse
 */

export class EvidenceConsistencyChecker {
  /**
   * Check consistency of a generated reading against the authoritative P8 dossier
   * @param {Object} aiResponse - Validated AI payload
   * @param {import('../interpretation/InterpretationDossier.js').InterpretationDossier} dossier - Authoritative P8 dossier
   * @returns {{ consistent: boolean, violations: string[] }}
   */
  static check(aiResponse, dossier) {
    const violations = [];

    if (!aiResponse || !dossier) {
      return { consistent: false, violations: ['Missing AI response or authoritative dossier'] };
    }

    // Collect all text from AI response for semantic inspection
    const fullText = [
      aiResponse.title,
      aiResponse.headline,
      aiResponse.opening,
      aiResponse.summary,
      ...(aiResponse.sections || []).flatMap(s => [s.heading, ...(s.paragraphs || [s.text || ''])]),
      ...(aiResponse.keyThemes || []).map(t => `${t.label} ${t.insight || ''}`),
      aiResponse.closing
    ].filter(Boolean).join(' ');

    const lowerText = fullText.toLowerCase();

    // 1. Check for hallucinated observations on unobserved lines
    for (const line of (dossier.major_lines || [])) {
      const lineName = (line.name || line.key || '').toLowerCase();
      const status = line.status;

      if (status === 'OUT_OF_FRAME' || status === 'NOT_DETECTED') {
        const lineTerms = [];
        if (lineName.includes('fate')) {
          lineTerms.push('fate line', 'karma line', 'line of destiny');
        } else if (lineName.includes('sun')) {
          lineTerms.push('sun line', 'apollo line', 'surya line', 'surya rekha');
        } else if (lineName.includes('heart')) {
          lineTerms.push('heart line', 'pitri line', 'pitri rekha');
        } else if (lineName.includes('head')) {
          lineTerms.push('head line', 'matru line', 'matru rekha');
        } else if (lineName.includes('life')) {
          lineTerms.push('life line', 'ayur line', 'ayur rekha');
        } else {
          lineTerms.push(lineName);
        }

        for (const term of lineTerms) {
          if (lowerText.includes(term)) {
            // Check if the reference claims presence, strength, or depth rather than acknowledging unobserved status
            const claimsPresence = new RegExp(
              `${term}[^.]*\\b(is strong|is deep|is clear|is continuous|indicates great|reveals your|shows strong)\\b`,
              'i'
            ).test(fullText);

            if (claimsPresence) {
              violations.push(
                `Hallucination: AI claimed '${term}' is present/strong, but P8 marked it as ${status}.`
              );
            }
          }
        }
      }
    }

    // 2. Check for confidence inflation
    // If dossier confidence is LOW or INSUFFICIENT_EVIDENCE, narrative cannot use absolute certainty words
    if (dossier.confidence_band === 'LOW' || dossier.confidence_band === 'INSUFFICIENT_EVIDENCE') {
      const certaintyWords = [
        'undeniably',
        'unquestionably',
        'completely clear',
        'proves beyond doubt',
        'guarantees'
      ];
      for (const word of certaintyWords) {
        if (lowerText.includes(word)) {
          violations.push(
            `Confidence Inflation: Narrative uses certainty word '${word}' while P8 confidence band is ${dossier.confidence_band}.`
          );
        }
      }
    }

    // 3. Verify section evidence references exist if specified
    const knownEvidencePaths = new Set();
    const knownRuleIds = new Set();

    for (const item of (dossier.evidence || [])) {
      if (item.ruleId) knownRuleIds.add(item.ruleId);
      if (item.domain) knownEvidencePaths.add(item.domain.toLowerCase());
      if (Array.isArray(item.features)) {
        for (const f of item.features) {
          if (f.feature) {
            knownEvidencePaths.add(f.feature);
            const parts = f.feature.split('.');
            if (parts.length > 2) {
              knownEvidencePaths.add(parts.slice(0, 2).join('.'));
            }
          }
        }
      }
    }

    for (const line of (dossier.major_lines || [])) {
      if (line.key) {
        knownEvidencePaths.add(line.key);
        knownEvidencePaths.add(`lines.${line.key}`);
        knownEvidencePaths.add(`lines.${line.key}.shape`);
        knownEvidencePaths.add(`lines.${line.key}.visibility`);
        knownEvidencePaths.add(`lines.${line.key}.trajectory`);
        knownEvidencePaths.add(`lines.${line.key}.continuity`);
        knownEvidencePaths.add(`lines.${line.key}.origin`);
        knownEvidencePaths.add(`lines.${line.key}.termination`);
      }
      if (line.name) knownEvidencePaths.add(line.name.toLowerCase());
    }

    // Canonical feature domains
    knownEvidencePaths.add('lines.life_line');
    knownEvidencePaths.add('lines.head_line');
    knownEvidencePaths.add('lines.heart_line');
    knownEvidencePaths.add('lines.fate_line');
    knownEvidencePaths.add('lines.sun_line');
    knownEvidencePaths.add('thumb');
    knownEvidencePaths.add('mounts');
    knownEvidencePaths.add('markings');

    for (const section of (aiResponse.sections || [])) {
      if (Array.isArray(section.evidenceRefs)) {
        for (const ref of section.evidenceRefs) {
          const matches = knownEvidencePaths.has(ref) ||
                          knownRuleIds.has(ref) ||
                          [...knownEvidencePaths].some(p => ref.startsWith(p) || p.startsWith(ref));
          if (!matches) {
            violations.push(`Unverifiable Evidence Reference: '${ref}' in section '${section.id}' does not exist in P8 dossier.`);
          }
        }
      }
    }

    return {
      consistent: violations.length === 0,
      violations
    };
  }
}
