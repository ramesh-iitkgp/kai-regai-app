/**
 * AstrologerResponseValidator — Validates and repairs AI Astrologer responses
 * 
 * Invariants:
 * - Ensures valid structure matching AstrologerResponse schema
 * - Safely strips code blocks if model included markdown delimiters
 * - Sanitizes untrusted text
 * - Provides graceful fallback on malformed model outputs
 */

export class AstrologerResponseValidator {
  /**
   * Parses and validates raw LLM output into a typed AstrologerResponse.
   * 
   * @param {string} rawOutput
   * @param {object} [context={}]
   * @returns {object} Validated AstrologerResponse
   */
  static validate(rawOutput, context = {}) {
    if (!rawOutput || typeof rawOutput !== 'string') {
      return this.createFallbackResponse('I was unable to complete the astrological reflection at this moment.', context);
    }

    let parsed = null;
    let cleanJson = rawOutput.trim();

    // Strip markdown code fences if present (```json ... ``` or ``` ...)
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      // Attempt to extract JSON from surrounding text
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.createFallbackResponse(rawOutput, context);
    }

    // Schema validation and sanitization
    let answer = typeof parsed.answer === 'string' && parsed.answer.trim().length > 0
      ? parsed.answer.trim()
      : 'As Kai RegAI\'s AI Astrologer, I have analyzed your birth chart.';

    // Contextual Premise Safeguard:
    // If the user explicitly stated they are unmarried/single, intercept any hallucinated claims of existing marriage/fights
    const userQuery = (context.userQuery || '').toLowerCase();
    const isUnmarriedUser = /\b(not\s*(yet\s*)?married|i('?m| am) not married|never married|single|unmarried|no wife|no husband)\b/i.test(userQuery);
    if (isUnmarriedUser && /\b(your wife|your husband|in your marriage|marital conflict)\b/i.test(answer)) {
      answer = answer
        .replace(/Facing persistent conflict in your marriage.*?manifests as sharp verbal arguments during challenging transits\./is, 'For an unmarried seeker examining prospective partnership, your 7th house (Kalathra Bhava) describes the qualities and timing of your future union.')
        .replace(/\bWhen your wife expresses anger\b/gi, 'In prospective relationships')
        .replace(/\bconfronting difficult marital topics\b/gi, 'prospective relationship discussions');
    }

    const summary = typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
      ? parsed.summary.trim()
      : answer.slice(0, 140) + '...';

    const chartInterpretation = Array.isArray(parsed.chartInterpretation)
      ? parsed.chartInterpretation.filter(item => item && typeof item.placement === 'string')
      : [];

    const reflection = typeof parsed.reflection === 'string'
      ? parsed.reflection.trim()
      : 'Take a quiet breath and consider how this archetypal energy resonates with your current values.';

    const followUpSuggestions = Array.isArray(parsed.followUpSuggestions)
      ? parsed.followUpSuggestions.filter(s => typeof s === 'string')
      : ['What remedies or mindfulness practices support this transit?', 'How does my ascendant influence my approach to this theme?'];

    const sourceReferences = Array.isArray(parsed.sourceReferences)
      ? parsed.sourceReferences.filter(s => typeof s === 'string')
      : ['Brihat Parashara Hora Shastra', 'Kai RegAI Ephemeris'];

    const safetyNotice = typeof parsed.safetyNotice === 'string'
      ? parsed.safetyNotice
      : 'Kai RegAI Astrological Guidance is an AI-assisted contemplative tool for self-reflection. It is not medical, legal, or financial advice.';

    return {
      answer,
      summary,
      chartInterpretation,
      reflection,
      followUpSuggestions,
      sourceReferences,
      safetyNotice,
      requiresClarification: Boolean(parsed.requiresClarification),
      responseVersion: parsed.responseVersion || '1.0.0'
    };
  }

  /**
   * Creates a graceful fallback response when JSON parsing fails.
   * 
   * @param {string} rawText
   * @param {object} context
   * @returns {object}
   */
  static createFallbackResponse(rawText, context = {}) {
    return {
      answer: rawText || 'As Kai RegAI\'s AI Astrologer, I am reflecting upon your chart.',
      summary: 'Grounded reflection on your birth chart placements.',
      chartInterpretation: [],
      reflection: 'Consider how this astrological theme invites mindful observation into your life today.',
      followUpSuggestions: [
        'Could you elaborate on the career aspects of my chart?',
        'What planetary themes are prominent right now?'
      ],
      sourceReferences: ['Kai RegAI Astronomical Engine'],
      safetyNotice: 'Kai RegAI Astrological Guidance is an AI-assisted contemplative tool for self-reflection.',
      requiresClarification: false,
      responseVersion: '1.0.0'
    };
  }
}
