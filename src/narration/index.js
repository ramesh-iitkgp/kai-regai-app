/**
 * Kai RegAI — Master Narration Pipeline
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Orchestrates the complete P9 Narration flow:
 * P8 Dossier -> Context Builder -> Approved RAG -> Prompt Compiler -> LLM Provider
 * -> Schema Validator -> Evidence Checker -> Safety Gate -> NarratedReading
 * 
 * Guarantees zero failure: falls back deterministically to DeterministicNarrator
 * whenever the AI provider is offline, unconfigured, or fails any verification gate.
 */

import { NarratedReading } from './NarratedReading.js';
import { NARRATION_PROFILES, NARRATION_TONES } from './NarrationProfiles.js';
import { NarrationContextBuilder } from './NarrationContextBuilder.js';
import { ThemeAggregator } from './ThemeAggregator.js';
import { RAGRetriever } from './RAGRetriever.js';
import { PromptCompiler } from './PromptCompiler.js';
import { NarrationSchemaValidator } from './NarrationSchemaValidator.js';
import { EvidenceConsistencyChecker } from './EvidenceConsistencyChecker.js';
import { NarrationSafetyGate } from './NarrationSafetyGate.js';
import { DeterministicNarrator } from './DeterministicNarrator.js';
import { MockLLMProvider } from './MockLLMProvider.js';

export { NarratedReading } from './NarratedReading.js';
export { NARRATION_PROFILES, NARRATION_TONES } from './NarrationProfiles.js';
export { NarrationContextBuilder } from './NarrationContextBuilder.js';
export { ThemeAggregator } from './ThemeAggregator.js';
export { RAGRetriever } from './RAGRetriever.js';
export { PromptCompiler } from './PromptCompiler.js';
export { NarrationSchemaValidator } from './NarrationSchemaValidator.js';
export { EvidenceConsistencyChecker } from './EvidenceConsistencyChecker.js';
export { NarrationSafetyGate } from './NarrationSafetyGate.js';
export { DeterministicNarrator } from './DeterministicNarrator.js';
export { LLMProvider } from './LLMProvider.js';
export { MockLLMProvider } from './MockLLMProvider.js';
export { Claim, ClaimLedger } from './ClaimLedger.js';

// Default singleton instance of local approved knowledge retriever
const defaultRetriever = new RAGRetriever();

/**
 * Master narration function converting P8 InterpretationDossier into NarratedReading
 * @param {import('../interpretation/InterpretationDossier.js').InterpretationDossier} dossier 
 * @param {Object} [options={}]
 * @param {string} [options.profile='WARM_REFLECTIVE']
 * @param {import('./LLMProvider.js').LLMProvider} [options.provider]
 * @param {Object} [options.userContext]
 * @param {boolean} [options.forceDeterministic=false]
 * @returns {Promise<NarratedReading>}
 */
export async function narrate(dossier, options = {}) {
  const startTime = Date.now();

  if (!dossier) {
    throw new Error('narrate() requires an InterpretationDossier');
  }

  // If deterministic mode explicitly requested or in offline/no-LLM configuration
  if (options.forceDeterministic) {
    return DeterministicNarrator.render(dossier, {
      fallbackTriggered: false
    });
  }

  const profile = options.profile || 'WARM_REFLECTIVE';
  const provider = options.provider || new MockLLMProvider();

  try {
    // 1. Context Construction
    const narrationContext = NarrationContextBuilder.build(dossier, options.userContext);

    // 2. Approved Local RAG Retrieval (strictly within Knowledge Codex)
    const activeDomains = (dossier.major_lines || []).map(l => l.key || l.name);
    const retrievedKnowledge = defaultRetriever.retrieve({
      domains: activeDomains,
      limit: 4
    });

    // 3. Thematic Clustering
    const thematicClusters = ThemeAggregator.aggregate(narrationContext);

    // 4. Deterministic Prompt Compilation
    const promptPayload = PromptCompiler.compile(narrationContext, {
      profile,
      retrievedKnowledge
    });

    // 5. AI Generation
    const rawAiResponse = await provider.generateStructuredNarration(promptPayload, options);

    // 6. Verification Gate A: Schema Validation
    const schemaResult = NarrationSchemaValidator.validate(rawAiResponse);
    if (!schemaResult.valid) {
      return DeterministicNarrator.render(dossier, {
        fallbackTriggered: true,
        fallbackReason: `Schema Validation Failed: ${schemaResult.errors.join('; ')}`
      });
    }

    // 7. Verification Gate B: Epistemic & Ethical Safety Gate (Fatalism & Medical Claims)
    const safetyResult = NarrationSafetyGate.inspect(rawAiResponse);
    if (!safetyResult.safe) {
      return DeterministicNarrator.render(dossier, {
        fallbackTriggered: true,
        fallbackReason: `Safety Violation: ${safetyResult.violations.join('; ')}`
      });
    }

    // 8. Verification Gate C: Evidence Consistency (Anti-Hallucination & Confidence Inflation)
    const evidenceResult = EvidenceConsistencyChecker.check(rawAiResponse, dossier);
    if (!evidenceResult.consistent) {
      return DeterministicNarrator.render(dossier, {
        fallbackTriggered: true,
        fallbackReason: `Evidence Inconsistency: ${evidenceResult.violations.join('; ')}`
      });
    }

    const elapsedMs = Date.now() - startTime;

    // 9. Assemble Approved NarratedReading
    return new NarratedReading({
      schemaVersion: '1.0.0',
      narrationVersion: '1.0.0',
      sourceDossierId: dossier.id,
      sourceDossierVersion: dossier.provenance?.interpretation_engine_version || '3.0.0',
      codexVersion: dossier.provenance?.codex_version || '1.0.0',
      title: rawAiResponse.title || dossier.title,
      headline: rawAiResponse.headline || dossier.summary,
      opening: rawAiResponse.opening,
      summary: rawAiResponse.summary,
      readingMethod: dossier.reading_method,
      readingMethodLabel: dossier.reading_method_label,
      handSide: dossier.hand_side,
      handDominance: dossier.hand_dominance,
      confidence: dossier.confidence,
      confidenceBand: dossier.confidence_band,
      qualityScore: dossier.quality_score,
      sections: rawAiResponse.sections,
      keyThemes: rawAiResponse.keyThemes || [],
      uncertaintyNotes: rawAiResponse.uncertaintyNotes || [],
      majorLines: dossier.major_lines,
      features: dossier.features,
      evidenceReferences: dossier.evidence,
      sourceReferences: [
        { sourceId: 'SRC_WESTERN', name: 'Classical Western Palmistry (Cheiro, Benham)', tradition: 'Western Classical' },
        { sourceId: 'SRC_HASTA', name: 'Hasta Samudrika (Samudrika Shastra, Narada Samhita)', tradition: 'Hasta Samudrika' },
        { sourceId: 'SRC_KAI_SYN', name: 'Kai RegAI Archetypal Synthesis', tradition: 'Kai RegAI' }
      ],
      conflictsReconciled: dossier.conflicts || [],
      tags: dossier.tags,
      generation: {
        mode: 'AI_ORCHESTRATED',
        provider: provider.name,
        model: provider.model,
        promptVersion: promptPayload.promptVersion,
        generatedAt: new Date().toISOString(),
        latencyMs: elapsedMs,
        safetyVerified: true,
        evidenceVerified: true,
        fallbackTriggered: false,
        fallbackReason: null
      }
    });

  } catch (error) {
    // Graceful fallback to deterministic engine on network error, provider crash, or unexpected exception
    return DeterministicNarrator.render(dossier, {
      fallbackTriggered: true,
      fallbackReason: `Provider Exception: ${error.message}`
    });
  }
}
