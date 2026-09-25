/**
 * Kai RegAI — LLM Provider Base Interface
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Abstract interface for AI providers:
 * - Decouples application and reports from specific model vendors
 * - Ensures all providers implement structured JSON generation
 */

export class LLMProvider {
  /**
   * @param {Object} [config={}]
   */
  constructor(config = {}) {
    this.name = config.name || 'BASE_LLM_PROVIDER';
    this.model = config.model || 'base-model';
  }

  /**
   * Generate structured narration from compiled prompt payload
   * @param {Object} promptPayload - Output of PromptCompiler.compile()
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Raw structured JSON object
   */
  async generateStructuredNarration(promptPayload, options = {}) {
    throw new Error('generateStructuredNarration must be implemented by concrete LLMProvider');
  }
}
