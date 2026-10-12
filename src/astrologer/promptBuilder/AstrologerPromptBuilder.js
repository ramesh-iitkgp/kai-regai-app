/**
 * AstrologerPromptBuilder — Grounded System Prompts & Structured AI Astrologer Instructions
 * 
 * Rules:
 * - Disclose AI identity clearly
 * - Strictly ground interpretations in validated chart facts
 * - Never fabricate missing chart positions or unsupported features
 * - Output structured JSON matching AstrologerResponse schema
 */

export class AstrologerPromptBuilder {
  /**
   * Constructs the system prompt for the AI Astrologer.
   * 
   * @param {object} chart Canonical BirthChart object
   * @param {Array<object>} retrievedKnowledge Passages from KnowledgeBase
   * @returns {string} System instruction
   */
  static buildSystemInstruction(chart, retrievedKnowledge = []) {
    const isVedic = chart.astrologySystem === 'VEDIC';

    const knowledgeSummary = retrievedKnowledge.map(k => `[${k.source}] (${k.topic}): ${k.rule}`).join('\n\n');

    return `
You are Kai RegAI's AI Astrologer, a contemplative, respectful guide rooted in ${isVedic ? 'classical Vedic Jyotish and Hasta Samudrika' : 'classical and modern Western psychological astrology'}.

CRITICAL IDENTITY & ETHICAL DIRECTIVES:
1. Always disclose that you are Kai RegAI's AI Astrologer, not a human guru, medical doctor, or financial advisor.
2. Ground every insight strictly in the VALIDATED CHART FACTS provided below. NEVER invent planetary positions, house placements, nakshatras, dashas, or aspects not listed in the facts.
3. ZERO PREMISE PRESUMPTION: NEVER assume the seeker's current personal circumstances (e.g., that they are married, single, have a wife/husband, have children, or are currently employed) unless they have explicitly stated so. For ambiguous or open queries (e.g. "marriage date?", "career?"), address the chart placements neutrally from the perspective of potential, timing horizons, and archetypes.
4. IMMEDIATE CORRECTION ADOPTION: If the user corrects an assumption or clarifies their situation (e.g., "but I am not yet married", "I don't have a job"), IMMEDIATELY acknowledge and adopt their correction, apologize gracefully, and address their true situation. NEVER repeat or persist in an invalidated assumption.
5. If an astrological feature is noted as missing (e.g. unknown birth time or unsupported polar house), explicitly explain what cannot be determined instead of guessing.
6. Maintain a non-fatalistic, empowering tone. Astrology in Kai RegAI is a tool for self-reflection, mindfulness, and personal insight—never fear, curses, or deterministic predictions of death or illness.
7. In your answer, clearly distinguish between:
   - Physical/Astronomical Observations (exact degree, sign, house, nakshatra)
   - Classical Tradition Attributes (cited from traditional literature)
   - Contemplative Synthesis (practical life reflection)
8. Cite the provided knowledge passages when relevant without hallucinating additional ancient texts.

GROUNDING KNOWLEDGE BASE PASSAGES:
${knowledgeSummary || 'Apply classical principles with intellectual humility.'}

RESPONSE FORMAT:
You MUST respond with valid JSON ONLY (no markdown code fences outside JSON, no prefix or suffix text) matching this schema:
{
  "answer": "Detailed, thoughtful, conversational astrological answer addressing the seeker's query.",
  "summary": "1-2 sentence core insight.",
  "chartInterpretation": [
    {
      "placement": "Specific chart fact (e.g. Moon in Swati Pada 4 or Sun trine Jupiter)",
      "interpretation": "How this placement informs the topic."
    }
  ],
  "reflection": "A contemplative self-inquiry question or mindfulness prompt for the seeker.",
  "followUpSuggestions": [
    "Suggested follow-up question 1",
    "Suggested follow-up question 2"
  ],
  "sourceReferences": [
    "Attributed source title(s)"
  ],
  "safetyNotice": "Standard disclaimer: AI astrological reflection for contemplative purposes only.",
  "requiresClarification": false,
  "responseVersion": "1.0.0"
}
`.trim();
  }

  /**
   * Serializes the chart facts into a compact, structured summary for the AI context.
   * 
   * @param {object} chart Canonical BirthChart object
   * @returns {string}
   */
  static formatChartContext(chart) {
    const isVedic = chart.astrologySystem === 'VEDIC';
    const planets = chart.planetaryPositions?.list || [];

    const planetSummary = planets.map(p => {
      let detail = `${p.name}: ${p.degreesFormatted} (House ${p.house || 'N/A'})`;
      if (isVedic && p.nakshatra) {
        detail += ` [Nakshatra: ${p.nakshatra.nakshatraName} Pada ${p.nakshatra.pada}, Dignity: ${p.dignity}]`;
      }
      if (!isVedic && p.isRetrograde) {
        detail += ` [Retrograde]`;
      }
      return detail;
    }).join('\n');

    let extraDetails = '';
    if (isVedic) {
      extraDetails = `
Ayanamsa: ${chart.settings.ayanamsa || 'Lahiri'} (${chart.settings.ayanamsaFormatted || ''})
Lagna (Ascendant): ${chart.ascendant ? chart.ascendant.degreesFormatted : 'Unknown'}
Janma Rashi: ${chart.nakshatraData?.janmaRashi || 'N/A'}
Janma Nakshatra: ${chart.nakshatraData?.janmaNakshatra || 'N/A'} (Pada ${chart.nakshatraData?.janmaPada || 'N/A'})
Current Mahadasha: ${chart.dashaData?.periods?.[0]?.name || 'N/A'} (${chart.dashaData?.periods?.[0]?.startDate || ''} to ${chart.dashaData?.periods?.[0]?.endDate || ''})
`.trim();
    } else {
      const topAspects = (chart.aspects || []).slice(0, 8).map(a => a.formatted).join('\n');
      extraDetails = `
Zodiac: Tropical
Ascendant: ${chart.ascendant ? chart.ascendant.degreesFormatted : 'Unknown'}
Chart Ruler: ${chart.westernSynthesis?.chartRuler || 'N/A'}
Sun Sign: ${chart.westernSynthesis?.sunSign || 'N/A'}
Moon Sign: ${chart.westernSynthesis?.moonSign || 'N/A'}
Major Aspects:
${topAspects || 'None'}
`.trim();
    }

    return `
=== VERIFIED BIRTH CHART FACTS (${chart.astrologySystem}) ===
Calculation Engine: Kai RegAI Astronomy Engine v${chart.calculationVersion}
Birth Place: ${chart.inputSnapshot.birthPlace || 'Coordinates provided'}
Date & Time UTC: ${chart.timeInfo.utcIsoString}
Coordinates: Lat ${chart.inputSnapshot.latitude}, Lon ${chart.inputSnapshot.longitude}
${chart.warnings?.length ? `Warnings: ${chart.warnings.join(', ')}` : ''}

${extraDetails}

PLANETARY POSITIONS:
${planetSummary}
======================================================
`.trim();
  }

  /**
   * Prepares the full prompt payload for the AI model.
   * 
   * @param {object} params
   * @param {object} params.chart
   * @param {Array<object>} params.knowledge
   * @param {string} params.userQuery
   * @param {Array<object>} [params.conversationHistory=[]]
   * @returns {object} { systemInstruction, contents }
   */
  static buildPromptPayload({ chart, knowledge = [], userQuery, conversationHistory = [] }) {
    const systemInstruction = this.buildSystemInstruction(chart, knowledge);
    const chartContext = this.formatChartContext(chart);

    const contents = [];

    // First turn provides the verified chart context
    contents.push({
      role: 'user',
      parts: [{ text: `${chartContext}\n\nPlease keep these verified chart facts in mind for all your answers.` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: `I have received and validated your verified ${chart.astrologySystem} birth chart facts. I will ground all my astrological reflections solely on these positions.` }]
    });

    // Append prior turns
    for (const msg of conversationHistory) {
      if (msg.sender_role === 'USER') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.sender_role === 'ASTROLOGER') {
        const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.structured_payload || msg.content);
        contents.push({ role: 'model', parts: [{ text }] });
      }
    }

    // Append current user question
    contents.push({
      role: 'user',
      parts: [{ text: userQuery }]
    });

    return {
      systemInstruction,
      contents
    };
  }
}
