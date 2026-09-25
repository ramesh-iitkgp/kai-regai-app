/**
 * Kai RegAI — Narration Profiles & Tone Directives
 * Phase: P9 — AI / RAG Narration Engine
 */

export const NARRATION_TONES = {
  WARM_REFLECTIVE: 'WARM_REFLECTIVE',
  CALM_INSIGHTFUL: 'CALM_INSIGHTFUL',
  CONCISE: 'CONCISE',
  DETAILED: 'DETAILED'
};

export const NARRATION_PROFILES = {
  WARM_REFLECTIVE: {
    id: 'WARM_REFLECTIVE',
    name: 'Warm & Reflective',
    toneDescription: 'Grounded, empathetic, introspective, affirming, encouraging energetic boundaries and personal agency.',
    verbosity: 'STANDARD',
    wordCountTarget: 700,
    traditionalAttribution: true,
    uncertaintyStyle: 'HONEST_EXPLICIT',
    personalization: 'BALANCED'
  },
  CALM_INSIGHTFUL: {
    id: 'CALM_INSIGHTFUL',
    name: 'Calm & Insightful',
    toneDescription: 'Poised, contemplative, philosophical, highlighting constitutional harmony and deliberate choices.',
    verbosity: 'STANDARD',
    wordCountTarget: 750,
    traditionalAttribution: true,
    uncertaintyStyle: 'HONEST_EXPLICIT',
    personalization: 'BALANCED'
  },
  CONCISE: {
    id: 'CONCISE',
    name: 'Concise & Structured',
    toneDescription: 'Crisp, structured, direct, highlighting key takeaways with clear bullet points and immediate clarity.',
    verbosity: 'COMPACT',
    wordCountTarget: 220,
    traditionalAttribution: false,
    uncertaintyStyle: 'BRIEF',
    personalization: 'FOCUSED'
  },
  DETAILED: {
    id: 'DETAILED',
    name: 'Detailed Hastarekha Exposition',
    toneDescription: 'Rich, comprehensive, culturally resonant, providing dual-perspective analysis and deep symbolic synthesis.',
    verbosity: 'EXPANSIVE',
    wordCountTarget: 1400,
    traditionalAttribution: true,
    uncertaintyStyle: 'NUANCED',
    personalization: 'DEEP'
  }
};
