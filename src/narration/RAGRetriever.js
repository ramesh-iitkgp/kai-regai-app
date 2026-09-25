/**
 * Kai RegAI — Approved Knowledge RAG Retriever
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Strict Local Knowledge Retriever:
 * - Operates strictly over the immutable Kai RegAI Knowledge Codex (zero public web searching)
 * - Semantic domain chunking across major lines, mounts, marks, and constitutional archetypes
 * - Implements prompt-injection defense: retrieved knowledge is tagged strictly as reference data
 */

import { MASTER_RULE_REGISTRY } from '../knowledge/index.js';

export class RAGRetriever {
  constructor(rules = MASTER_RULE_REGISTRY) {
    this.corpus = this.buildApprovedCorpus(rules);
  }

  /**
   * Index approved knowledge units from the local codex
   */
  buildApprovedCorpus(rules) {
    return rules.map(rule => ({
      sourceId: rule.ruleId,
      domain: rule.domain,
      tradition: rule.sourceSystem,
      epistemicTier: rule.epistemicTier,
      citation: rule.citation || rule.sourceSystem,
      title: rule.interpretation?.title || '',
      summary: rule.interpretation?.summary || '',
      detail: rule.interpretation?.detail || '',
      tags: rule.tags || []
    }));
  }

  /**
   * Retrieve relevant approved reference excerpts based on active query context
   * @param {Object} query
   * @param {string[]} [query.domains]
   * @param {string[]} [query.traditions]
   * @param {number} [query.limit=4]
   * @returns {Object[]}
   */
  retrieve(query = {}) {
    const { domains = [], traditions = [], limit = 4 } = query;

    let matches = this.corpus;

    // Filter by domain
    if (domains.length > 0) {
      const normalizedDomains = domains.map(d => d.toUpperCase().replace(' ', '_'));
      matches = matches.filter(item => 
        normalizedDomains.some(d => item.domain.toUpperCase().includes(d) || d.includes(item.domain.toUpperCase()))
      );
    }

    // Filter by tradition if requested
    if (traditions.length > 0) {
      matches = matches.filter(item => traditions.includes(item.tradition));
    }

    // Sort by epistemic tier (prioritize Tier 3 Hasta Samudrika and Tier 2 Western)
    matches.sort((a, b) => b.epistemicTier - a.epistemicTier);

    // Return top-K approved knowledge excerpts with prompt-injection defense
    return matches.slice(0, limit).map(item => ({
      sourceId: item.sourceId,
      tradition: item.tradition,
      domain: item.domain,
      citation: item.citation,
      title: item.title,
      summary: this.sanitizeData(item.summary),
      detail: this.sanitizeData(item.detail)
    }));
  }

  /**
   * Prompt injection defense: sanitize text to treat it strictly as reference data
   */
  sanitizeData(text) {
    if (!text) return '';
    // Strip any directive patterns that could hijack LLM system prompts
    return text
      .replace(/ignore\s+(all\s+)?(previous\s+)?instructions/gi, '[filtered]')
      .replace(/system\s+prompt/gi, '[filtered]')
      .trim();
  }
}
