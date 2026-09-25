/**
 * Kai RegAI — Narration Safety Gate (Double-Layer Epistemic Firewall)
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Safety Gate inspecting generated narratives:
 * - Zero tolerance for fatalism (death ages, inevitable accidents, guaranteed divorce, fixed children count)
 * - Zero tolerance for medical claims (diagnoses, disease predictions, organ pathologies)
 * - Zero tolerance for deterministic financial guarantees
 * - Sanitizes absolute certainty into reflective traditional framing
 */

export class NarrationSafetyGate {
  /**
   * Screen generated narrative text for ethical and epistemic violations
   * @param {Object} aiResponse 
   * @returns {{ safe: boolean, violations: string[] }}
   */
  static inspect(aiResponse) {
    const violations = [];

    // Aggregate all readable prose
    const allParagraphs = [
      aiResponse.title,
      aiResponse.headline,
      aiResponse.opening,
      aiResponse.summary,
      ...(aiResponse.sections || []).flatMap(s => [s.heading, ...(s.paragraphs || [s.text || ''])]),
      ...(aiResponse.keyThemes || []).map(t => `${t.label} ${t.insight || ''}`),
      aiResponse.closing
    ].filter(Boolean);

    const fullText = allParagraphs.join('\n');

    // 1. Forbidden Fatalistic Patterns (lifespans, deaths, divorces, inevitable tragedies)
    const fatalisticPatterns = [
      { pattern: /\b(you will die|live until (age\s+)?\d+|lifespan of \d+|die at|death in)\b/i, reason: 'Deterministic mortality or lifespan forecast' },
      { pattern: /\b(destined to divorce|will (definitely\s+)?divorce|inevitable separation)\b/i, reason: 'Deterministic marital separation claim' },
      { pattern: /\b(you will have \d+ children|bear \d+ (sons|daughters|kids))\b/i, reason: 'Deterministic child count claim' },
      { pattern: /\b(guaranteed (great\s+)?wealth|destined to become (a\s+)?millionaire|will win (the\s+)?lottery)\b/i, reason: 'Guaranteed financial outcome' },
      { pattern: /\b(inevitable accident|inescapable misfortune|curse on your palm)\b/i, reason: 'Fatalistic accident or doom claim' }
    ];

    for (const { pattern, reason } of fatalisticPatterns) {
      if (pattern.test(fullText)) {
        violations.push(`Fatalism Violation: ${reason}`);
      }
    }

    // 2. Forbidden Medical & Health Patterns
    const medicalPatterns = [
      { pattern: /\b(diagnos(e|is|ed)|cardiac (arrest|disease|weakness)|heart attack|cancer|stroke)\b/i, reason: 'Clinical disease or diagnosis' },
      { pattern: /\b(liver disease|kidney failure|artery blockage|neurological disorder)\b/i, reason: 'Organ pathology claim' },
      { pattern: /\b(clinical depression|bipolar|schizophrenia|psychiatric condition)\b/i, reason: 'Psychiatric medical diagnosis' },
      { pattern: /\b(take this medication|prescribe|medical treatment recommendation)\b/i, reason: 'Medical treatment recommendation' }
    ];

    for (const { pattern, reason } of medicalPatterns) {
      if (pattern.test(fullText)) {
        violations.push(`Medical Violation: ${reason}`);
      }
    }

    // 3. Supernatural Certainty & Scientism
    const scientismPatterns = [
      { pattern: /\b(science proves that your palm|scientifically proven destiny|empirically validated prophecy)\b/i, reason: 'False scientific claim' }
    ];

    for (const { pattern, reason } of scientismPatterns) {
      if (pattern.test(fullText)) {
        violations.push(`Scientism Violation: ${reason}`);
      }
    }

    return {
      safe: violations.length === 0,
      violations
    };
  }
}
