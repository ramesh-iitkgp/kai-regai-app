/**
 * Kai RegAI — Prompt Compiler
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Deterministic prompt assembly engine:
 * - Compiles system directives, structured context, task instructions, output schema, and safety firewalls
 * - Enforces zero-hallucination boundaries
 * - Strictly demands structured JSON matching the Canonical Narration Schema
 */

import { NARRATION_PROFILES } from './NarrationProfiles.js';

export class PromptCompiler {
  /**
   * Compile a complete, deterministic prompt payload
   * @param {Object} narrationContext 
   * @param {Object} [options={}]
   * @param {string} [options.profile='WARM_REFLECTIVE']
   * @param {Object[]} [options.retrievedKnowledge=[]]
   * @returns {Object} Structured prompt payload
   */
  static compile(narrationContext, options = {}) {
    const profileKey = options.profile || 'WARM_REFLECTIVE';
    const profile = NARRATION_PROFILES[profileKey] || NARRATION_PROFILES.WARM_REFLECTIVE;
    const retrievedKnowledge = options.retrievedKnowledge || [];

    // 1. System Directives
    const systemInstructions = `You are the Kai RegAI narration layer ("The Story Written in Your Hands").
The supplied InterpretationDossier is the SINGLE SOURCE OF INTERPRETATION TRUTH.

STRICT OPERATING AXIOMS:
1. P8 DECIDES. YOU EXPLAIN.
2. DO NOT invent palm features, lines, mounts, or markings not present in the verified context.
3. DO NOT invent new palmistry rules or conclusions.
4. DO NOT override or inflate supplied confidence scores or certainty.
5. ZERO MEDICAL CLAIMS: Strictly forbid any diagnosis, disease prediction, organ health, or physical pathology.
6. ZERO FATALISM: Strictly forbid death age predictions, divorce predictions, guaranteed wealth, or inevitable accidents.
7. EPISTEMIC DISTINCTION: Never present traditional palmistry as scientifically validated fact. Use respectful traditional framing ("In traditional Hasta Samudrika...", "Western classical chiromancy interprets...").
8. PRESERVE UNCERTAINTY: If a feature is OUT_OF_FRAME or NOT_DETECTED, do NOT state it is absent; treat it as unobserved potential.
9. TONE DIRECTIVE: Follow the profile tone: "${profile.toneDescription}". Keep target length around ${profile.wordCountTarget} words.
10. RESPOND STRICTLY IN VALID JSON matching the provided schema. Zero markdown wrappers around JSON.`;

    // 2. Structured Task Description
    const task = `Transform the provided palmistry context into a personalized, cohesive, and deeply reflective Kai RegAI reading.
Format the output into 4 core chapters:
1. Constitution & Vitality Flow
2. Vocation & Strategic Clarity
3. Interpersonal & Emotional Landscape
4. Reflective Guidance

Highlight 3-5 key non-repetitive themes and include explicit uncertainty notes for any faint or out-of-frame features.`;

    // 3. Required Output JSON Schema
    const outputSchema = {
      title: "string (e.g. 'Solar Vitality & Reflective Purpose')",
      headline: "string (a single evocative summary sentence)",
      opening: "string (warm welcome establishing reading method and epistemic framing)",
      summary: "string (concise executive overview)",
      sections: [
        {
          id: "string (e.g. 'section_constitution')",
          heading: "string",
          paragraphs: ["string"],
          evidenceRefs: ["string (featurePath or ruleId)"],
          sourceRefs: ["string (sourceId)"]
        }
      ],
      keyThemes: [
        {
          id: "string",
          label: "string",
          insight: "string",
          confidenceBand: "HIGH | MODERATE | LOW | INSUFFICIENT_EVIDENCE"
        }
      ],
      uncertaintyNotes: [
        {
          feature: "string",
          observationNote: "string"
        }
      ],
      closing: "string (grounding, empowering closing reflection)"
    };

    // 4. Compact Context Object
    const contextPayload = {
      subject: narrationContext.subjectProfile,
      observations: narrationContext.observations,
      interpretations: narrationContext.interpretations,
      synthesisThemes: narrationContext.synthesisThemes,
      uncertainty: narrationContext.uncertainty,
      retrievedReferenceKnowledge: retrievedKnowledge,
      userInquiry: narrationContext.userFocus || null
    };

    return {
      promptVersion: '1.0.0',
      systemInstructions,
      task,
      context: contextPayload,
      outputSchema,
      profile: profile.id
    };
  }
}
