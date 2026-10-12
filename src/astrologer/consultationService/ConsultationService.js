/**
 * ConsultationService — Multi-turn Astrologer Consultations & Chart Grounding
 * 
 * Coordinates:
 * - Common BirthChart computation & snapshot persistence
 * - Topic-based knowledge passage retrieval
 * - Astrologer safety & compliance validation
 * - Multi-turn conversation persistence in SQLite
 * - Grounded Gemini API generation with structured output validation
 */

import { buildBirthChart, generateInputHash, CURRENT_CALCULATION_VERSION } from '../../astrology/chartBuilder/BirthChartBuilder.js';
import { defaultKnowledgeBase } from '../knowledgeRetrieval/AstrologyKnowledgeBase.js';
import { defaultSafetyGate } from '../safety/AstrologerSafetyGate.js';
import { AstrologerPromptBuilder } from '../promptBuilder/AstrologerPromptBuilder.js';
import { AstrologerResponseValidator } from '../responseValidator/AstrologerResponseValidator.js';
import { defaultGeminiClient } from '../geminiService/GeminiClient.js';

export class ConsultationService {
  constructor({ repository, geminiClient = defaultGeminiClient, knowledgeBase = defaultKnowledgeBase, safetyGate = defaultSafetyGate } = {}) {
    this.repository = repository;
    this.geminiClient = geminiClient;
    this.knowledgeBase = knowledgeBase;
    this.safetyGate = safetyGate;
  }

  /**
   * Calculates a BirthChart and optionally persists it if an ownerId is present.
   * 
   * @param {object} params
   * @param {'VEDIC'|'WESTERN'} params.system
   * @param {string} [params.ownerId]
   * @param {string} [params.profileId]
   * @param {object} params.birthParams
   * @returns {object} Canonical BirthChart
   */
  async getOrCalculateChart({ system = 'VEDIC', ownerId = null, profileId = null, birthParams }) {
    const inputHash = generateInputHash(birthParams, system, CURRENT_CALCULATION_VERSION);

    // Check if chart snapshot is already cached in database for this owner
    if (this.repository && ownerId) {
      const cached = this.repository.findChartByHash(inputHash, ownerId);
      if (cached) {
        return cached.chart_data;
      }
    }

    // Compute fresh chart
    const chart = buildBirthChart({ system, profileId, birthParams });

    // Persist chart snapshot
    if (this.repository && ownerId) {
      this.repository.saveChart({
        chartId: chart.id,
        profileId,
        ownerId,
        astrologySystem: system,
        inputHash,
        calculationVersion: CURRENT_CALCULATION_VERSION,
        chartData: chart
      });
    }

    return chart;
  }

  /**
   * Starts a new consultation session tied to a chart.
   * 
   * @param {object} params
   * @param {string} params.ownerId
   * @param {string} params.chartId
   * @param {'VEDIC'|'WESTERN'} params.system
   * @param {string} [params.topic='GENERAL']
   * @returns {object} Consultation record
   */
  async startConsultation({ ownerId, chartId, system = 'VEDIC', topic = 'GENERAL' }) {
    if (!this.repository) throw new Error('Repository is required for consultations');

    const chartRow = this.repository.getChartById(chartId, ownerId);
    if (!chartRow) {
      throw new Error(`Chart ${chartId} not found or unauthorized`);
    }

    const consultation = this.repository.createConsultation({
      ownerId,
      chartId,
      astrologySystem: system,
      topic
    });

    return consultation;
  }

  /**
   * Processes a user question in an ongoing consultation.
   * 
   * @param {object} params
   * @param {string} params.ownerId
   * @param {string} params.consultationId
   * @param {string} params.content
   * @param {string} [params.idempotencyKey]
   * @returns {Promise<object>} { message, astrologerResponse }
   */
  async sendMessage({ ownerId, consultationId, content, idempotencyKey = null }) {
    if (!this.repository) throw new Error('Repository is required for consultations');

    const consultation = this.repository.getConsultationById(consultationId, ownerId);
    if (!consultation) {
      throw new Error(`Consultation ${consultationId} not found or unauthorized`);
    }

    const chartRow = this.repository.getChartById(consultation.chart_id, ownerId);
    if (!chartRow) {
      throw new Error('Chart associated with consultation not found');
    }
    const chart = chartRow.chart_data;

    // 1. Safety Gate Evaluation on User Input
    const safetyCheck = this.safetyGate.evaluateInput(content);
    if (!safetyCheck.safe) {
      // Store user message
      this.repository.addMessage({
        consultationId,
        senderRole: 'USER',
        content,
        idempotencyKey: idempotencyKey ? `${idempotencyKey}_user` : null
      });

      // Construct safe refusal
      const fallbackResponse = AstrologerResponseValidator.createFallbackResponse(safetyCheck.fallbackResponse);
      fallbackResponse.safetyNotice = `Restricted inquiry: ${safetyCheck.reason}`;

      const aiMsg = this.repository.addMessage({
        consultationId,
        senderRole: 'ASTROLOGER',
        content: fallbackResponse.answer,
        structuredPayload: fallbackResponse
      });

      return {
        userMessage: content,
        response: fallbackResponse,
        messageRecord: aiMsg
      };
    }

    // 2. Persist User Message
    const userMsgRecord = this.repository.addMessage({
      consultationId,
      senderRole: 'USER',
      content,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}_user` : null
    });

    // 3. Retrieve Historical Conversation Turns
    const history = this.repository.getMessagesForConsultation(consultationId);

    // 4. Retrieve Grounding Knowledge Base Passages
    const passages = this.knowledgeBase.retrievePassages({
      system: consultation.astrology_system,
      topic: consultation.topic,
      query: content,
      limit: 3
    });

    // 5. Construct Grounded Prompt Payload
    const promptPayload = AstrologerPromptBuilder.buildPromptPayload({
      chart,
      knowledge: passages,
      userQuery: content,
      conversationHistory: history.slice(0, -1) // Exclude the just-added user message
    });

    // 6. Invoke Gemini / LLM
    let rawResult;
    try {
      rawResult = await this.geminiClient.generateContent({
        systemInstruction: promptPayload.systemInstruction,
        contents: promptPayload.contents
      });
    } catch (llmErr) {
      console.warn('Gemini API invocation error, using bounded recovery', llmErr);
      rawResult = await this.geminiClient.generateMockContent({ contents: promptPayload.contents });
    }

    // 7. Validate and Parse Structured Output
    const structuredResponse = AstrologerResponseValidator.validate(rawResult.text);

    // 8. Output Compliance Check
    if (!this.safetyGate.isOutputCompliant(structuredResponse.answer)) {
      structuredResponse.answer = 'As Kai RegAI\'s AI Astrologer, I focus on mindful reflection and personal growth rather than fatalistic predictions.';
    }

    // 9. Persist AI Astrologer Message
    const aiMsgRecord = this.repository.addMessage({
      consultationId,
      senderRole: 'ASTROLOGER',
      content: structuredResponse.answer,
      structuredPayload: structuredResponse,
      promptTokens: rawResult.usage?.promptTokens,
      completionTokens: rawResult.usage?.completionTokens,
      modelId: rawResult.model,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}_ai` : null
    });

    return {
      userMessageRecord: userMsgRecord,
      response: structuredResponse,
      messageRecord: aiMsgRecord
    };
  }

  /**
   * Retrieves full consultation history.
   * 
   * @param {string} consultationId
   * @param {string} ownerId
   * @returns {object} { consultation, chart, messages }
   */
  async getConsultationDetails(consultationId, ownerId) {
    if (!this.repository) throw new Error('Repository is required');

    const consultation = this.repository.getConsultationById(consultationId, ownerId);
    if (!consultation) return null;

    const chartRow = this.repository.getChartById(consultation.chart_id, ownerId);
    const messages = this.repository.getMessagesForConsultation(consultationId);

    return {
      consultation,
      chart: chartRow ? chartRow.chart_data : null,
      messages
    };
  }
}
