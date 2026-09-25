/**
 * Kai RegAI — Mock LLM Provider
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Deterministic Mock Provider:
 * - Produces rich, high-quality structured narration for testing and offline environments
 * - Zero network calls, zero external API keys, 100% deterministic
 * - Supports controlled adversarial flags for test harness verification
 */

import { LLMProvider } from './LLMProvider.js';

export class MockLLMProvider extends LLMProvider {
  constructor(config = {}) {
    super({
      name: 'MOCK_LLM_PROVIDER',
      model: config.model || 'kai-mock-narrator-v1'
    });
    this.failureMode = config.failureMode || null; // 'MALFORMED_JSON' | 'FATALISTIC' | 'HALLUCINATED' | 'TIMEOUT'
    this.simulatedLatencyMs = config.simulatedLatencyMs ?? 5;
  }

  async generateStructuredNarration(promptPayload, options = {}) {
    if (this.simulatedLatencyMs > 0) {
      await new Promise(r => setTimeout(r, this.simulatedLatencyMs));
    }

    if (this.failureMode === 'TIMEOUT') {
      throw new Error('AI Provider request timed out after 5000ms');
    }

    if (this.failureMode === 'MALFORMED_JSON') {
      return { corrupted: true, missingRequiredFields: true };
    }

    if (this.failureMode === 'FATALISTIC') {
      return {
        title: 'Fatalistic Reading',
        opening: 'Your reading indicates a fixed destiny.',
        summary: 'A dangerous forecast.',
        sections: [
          {
            id: 'section_vitality',
            heading: 'Vitality & Doom',
            paragraphs: ['You will die at age 52 due to an inescapable misfortune.'],
            evidenceRefs: ['lines.life_line']
          }
        ],
        keyThemes: [],
        uncertaintyNotes: [],
        closing: 'Nothing can be changed.'
      };
    }

    if (this.failureMode === 'HALLUCINATED') {
      return {
        title: 'Hallucinated Line Reading',
        opening: 'Welcome to your reading.',
        summary: 'Overview of non-existent features.',
        sections: [
          {
            id: 'section_fate',
            heading: 'Destiny Revealed',
            paragraphs: ['Your Fate Line is deep, continuous, and indicates great executive wealth.'],
            evidenceRefs: ['lines.fate_line']
          }
        ],
        keyThemes: [],
        uncertaintyNotes: [],
        closing: 'Walk forward in strength.'
      };
    }

    // Default: Clean, high-quality deterministic response synthesized from context
    const { context } = promptPayload;
    const isQuestionnaire = context.subject?.readingMethod === 'MODE_2_QUESTIONNAIRE';
    const hand = context.subject?.handSide || 'Right';

    const opening = isQuestionnaire
      ? `Welcome to your personal Hastarekha reading, gathered through the guided observations you shared of your ${hand.toLowerCase()} hand. In traditional palmistry, palmar contours are appreciated as reflective mirrors of constitutional vitality and cognitive rhythm rather than immutable destiny.`
      : `Welcome to your Kai RegAI solar scan reading. Based on the optical geometry identified in your ${hand.toLowerCase()} palm, this reflection translates classical observations into thoughtful personal insights.`;

    const sections = [
      {
        id: 'section_constitution',
        heading: 'Constitution & Vitality Flow',
        paragraphs: [
          context.synthesisThemes?.find(t => t.theme === 'CONSTITUTION')?.content ||
          'Your thenar eminence and primary vitality creases suggest a steady, grounded physical rhythm. Traditional frameworks associate continuous, gentle curvature with sustainable endurance and an innate capacity to recharge through intentional rest.'
        ],
        evidenceRefs: ['lines.life_line.shape', 'lines.life_line.visibility'],
        sourceRefs: ['SRC_WESTERN', 'SRC_HASTA']
      },
      {
        id: 'section_vocation',
        heading: 'Strategic Intellect & Vocational Drive',
        paragraphs: [
          context.synthesisThemes?.find(t => t.theme === 'VOCATION')?.content ||
          'The transverse trajectory of your cognitive crease reflects an ability to balance deliberate analysis with creative insight. Rather than rushing conclusions, you thrive when given space to synthesize diverse ideas into practical strategies.'
        ],
        evidenceRefs: ['lines.head_line.trajectory', 'lines.head_line.continuity'],
        sourceRefs: ['SRC_WESTERN', 'SRC_HASTA']
      },
      {
        id: 'section_relationships',
        heading: 'Interpersonal & Emotional Landscape',
        paragraphs: [
          context.synthesisThemes?.find(t => t.theme === 'RELATIONSHIPS')?.content ||
          'In emotional dynamics, your upper palmar crease points toward thoughtful empathy paired with healthy discernment. You value authentic depth in connection, offering loyal support while respecting personal boundaries.'
        ],
        evidenceRefs: ['lines.heart_line.shape', 'lines.heart_line.termination'],
        sourceRefs: ['SRC_HASTA', 'SRC_KAI_SYN']
      },
      {
        id: 'section_guidance',
        heading: 'Reflective Guidance',
        paragraphs: [
          context.synthesisThemes?.find(t => t.theme === 'GUIDANCE')?.content ||
          'As you move forward, consider aligning major endeavors with your natural rhythms of stamina. Traditional palmistry invites you to treat your hand not as a rigid blueprint, but as a living canvas shaped by ongoing mindfulness and deliberate choices.'
        ],
        evidenceRefs: ['lines.life_line', 'lines.head_line'],
        sourceRefs: ['SRC_KAI_SYN']
      }
    ];

    const keyThemes = [
      {
        id: 'theme_grounding',
        label: 'Constitutional Grounding',
        insight: 'Sustainable stamina supported by conscious pacing and periodic recharge.',
        confidenceBand: context.subject?.confidenceBand || 'MODERATE'
      },
      {
        id: 'theme_intellect',
        label: 'Pragmatic Synthesis',
        insight: 'Bridging creative imagination with disciplined analytical execution.',
        confidenceBand: context.subject?.confidenceBand || 'MODERATE'
      },
      {
        id: 'theme_empathy',
        label: 'Discerned Empathy',
        insight: 'Warm interpersonal support tempered by healthy energetic boundaries.',
        confidenceBand: context.subject?.confidenceBand || 'MODERATE'
      }
    ];

    const uncertaintyNotes = (context.uncertainty || []).map(u => ({
      feature: u.feature,
      observationNote: u.note
    }));

    return {
      title: isQuestionnaire ? 'Guided Hastarekha Synthesis' : 'Solar Crease Reflection',
      headline: 'A dynamic integration of constitutional stamina, deliberate intellect, and thoughtful empathy.',
      opening,
      summary: 'A holistic synthesis reflecting on your vital grounding, problem-solving style, and relational warmth.',
      sections,
      keyThemes,
      uncertaintyNotes,
      closing: 'May this reflection serve as a mindful mirror, inspiring self-awareness and confident intentionality in your daily journey.'
    };
  }
}
