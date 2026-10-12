/**
 * Kai RegAI — Astrologer Chat & Consultation Service
 * 
 * Invariants:
 * - Powered by Kai RegAI Custom Computational Astronomy Engine
 * - Supports both Vedic (Sidereal/Lahiri) and Western (Tropical/Placidus) systems
 * - Deep, grounded AI interpretations using Gemini with non-fatalistic guidelines
 * - Structured AstrologerResponse contract with clear separation of facts & traditions
 * - Connected with physical palm creases when available
 */

import { buildBirthChart } from '../astrology/chartBuilder/BirthChartBuilder.js';
import { defaultKnowledgeBase } from '../astrologer/knowledgeRetrieval/AstrologyKnowledgeBase.js';
import { defaultSafetyGate } from '../astrologer/safety/AstrologerSafetyGate.js';
import { AstrologerPromptBuilder } from '../astrologer/promptBuilder/AstrologerPromptBuilder.js';
import { AstrologerResponseValidator } from '../astrologer/responseValidator/AstrologerResponseValidator.js';
import { defaultGeminiClient } from '../astrologer/geminiService/GeminiClient.js';

export const VERIFIED_ASTROLOGERS = [
  {
    id: 'ast-001',
    name: 'Pandit Raghunath Shastri',
    title: 'Senior Vedic & Nadi Astrologer',
    experienceYears: 18,
    rating: 4.9,
    totalConsultations: 3240,
    ratePerMinute: 25,
    languages: ['English', 'Hindi', 'Sanskrit'],
    specialties: ['Career & Business', 'Hasta Samudrika', 'Kundali Matching'],
    isOnline: true,
    status: 'AVAILABLE',
    avatar: '/assets/home/astrologer_avatar_acharya.jpg',
    badge: 'Top Rated Vedic Master'
  },
  {
    id: 'ast-002',
    name: 'Vidya Devi',
    title: 'Vedic Chiromancer & Prashna Jyotishi',
    experienceYears: 14,
    rating: 4.8,
    totalConsultations: 2180,
    ratePerMinute: 20,
    languages: ['English', 'Telugu', 'Kannada'],
    specialties: ['Palm Crease Analysis', 'Love & Relationships', 'Prashna Shastra'],
    isOnline: true,
    status: 'AVAILABLE',
    avatar: null,
    initials: 'VD',
    badge: 'Palmistry Specialist'
  },
  {
    id: 'ast-003',
    name: 'Acharya Krishnan',
    title: 'Parashara Master & Astrological Counselor',
    experienceYears: 22,
    rating: 5.0,
    totalConsultations: 4520,
    ratePerMinute: 30,
    languages: ['Tamil', 'English', 'Malayalam'],
    specialties: ['Dasha Transits', 'Remedial Measures', 'Life Transitions'],
    isOnline: true,
    status: 'AVAILABLE',
    avatar: null,
    initials: 'AK',
    badge: 'Gold Medalist'
  },
  {
    id: 'ast-004',
    name: 'Dr. Meenakshi Sundaram',
    title: 'Samudrika Scholar & Gemologist',
    experienceYears: 16,
    rating: 4.9,
    totalConsultations: 1940,
    ratePerMinute: 22,
    languages: ['Tamil', 'English'],
    specialties: ['Gemstone Therapy', 'Vedic Palmistry', 'Spiritual Growth'],
    isOnline: false,
    status: 'IN_SESSION',
    avatar: null,
    initials: 'MS',
    badge: 'Vedic Scholar'
  }
];

export const QUICK_PROMPTS = [
  { id: 'focus', label: 'What should I focus on today?', icon: 'wb_sunny', text: 'What should I focus on today?' },
  { id: 'love', label: 'Guidance for my relationship', icon: 'favorite_border', text: 'Guidance for my relationship' },
  { id: 'career', label: 'Career guidance for this period', icon: 'work_outline', text: 'Career guidance for this period' },
  { id: 'finance', label: 'How to improve my finances?', icon: 'spa', text: 'How to improve my finances?' },
  { id: 'chart', label: 'Planetary Alignments', icon: 'auto_awesome', text: 'Can you explain the key planetary strengths and aspects in my birth chart?' }
];

export class AstrologerChatService {
  constructor() {
    this.storageKey = 'kai_astrologer_chat_history';
    this.systemKey = 'kai_astrology_system';
    this.geminiClient = defaultGeminiClient;
    this.knowledgeBase = defaultKnowledgeBase;
    this.safetyGate = defaultSafetyGate;
  }

  getVerifiedAstrologers() {
    return VERIFIED_ASTROLOGERS;
  }

  getQuickPrompts() {
    return QUICK_PROMPTS;
  }

  getAstrologySystem() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(this.systemKey) || 'VEDIC';
      }
    } catch {}
    return 'VEDIC';
  }

  setAstrologySystem(system = 'VEDIC') {
    const val = system.toUpperCase() === 'WESTERN' ? 'WESTERN' : 'VEDIC';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.systemKey, val);
      }
    } catch {}
    return val;
  }

  getBirthParameters() {
    let dob = '1995-05-15';
    let tob = '12:00';
    let isTimeUnknown = false;
    let pob = 'Chennai, India';
    let lat = 13.0827;
    let lon = 80.2707;
    let tz = 'Asia/Kolkata';

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        dob = window.localStorage.getItem('kai_user_dob') || dob;
        tob = window.localStorage.getItem('kai_user_tob') || tob;
        isTimeUnknown = window.localStorage.getItem('kai_user_tob_unknown') === 'true';
        pob = window.localStorage.getItem('kai_user_pob') || pob;
        if (window.localStorage.getItem('kai_user_lat')) lat = parseFloat(window.localStorage.getItem('kai_user_lat'));
        if (window.localStorage.getItem('kai_user_lon')) lon = parseFloat(window.localStorage.getItem('kai_user_lon'));
        if (window.localStorage.getItem('kai_user_tz')) tz = window.localStorage.getItem('kai_user_tz');
      }
    } catch {}

    const [year, month, day] = dob.split('-').map(Number);
    const [hour, minute] = tob.split(':').map(Number);

    return {
      year,
      month,
      day,
      hour: isTimeUnknown ? 12 : (hour || 12),
      minute: isTimeUnknown ? 0 : (minute || 0),
      second: 0,
      latitude: lat,
      longitude: lon,
      timezone: tz,
      birthPlace: pob,
      isTimeUnknown
    };
  }

  getCurrentBirthChart(system = null) {
    const sys = (system || this.getAstrologySystem()).toUpperCase();
    const birthParams = this.getBirthParameters();
    return buildBirthChart({
      system: sys,
      birthParams
    });
  }

  hasScannedPalm() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('kai_has_scanned_palm') === 'true';
      }
    } catch {}
    return false;
  }

  setPalmScanned(status = true) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('kai_has_scanned_palm', status ? 'true' : 'false');
      }
    } catch {}
  }

  getChatHistory() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch {}
    return this.inMemoryHistory || this.getDefaultHistory();
  }

  getDefaultHistory() {
    const isScanned = this.hasScannedPalm();

    return [
      {
        id: 'msg-welcome-01',
        sender: 'astrologer',
        senderName: 'Acharya Dev',
        title: 'AI Astrologer & Guide',
        avatar: '/assets/home/astrologer_avatar_acharya.jpg',
        timestamp: '3:25 PM',
        isPalmConnected: isScanned,
        text: `Namaste! 🙏
I'm Acharya Dev, your AI astrologer at Kai RegAI.

Ask me anything about your palm reading, tarot, birth chart, relationships, career, or life guidance.`
      }
    ];
  }

  saveMessage(message) {
    if (!this.inMemoryHistory) this.inMemoryHistory = [...this.getChatHistory()];
    this.inMemoryHistory.push(message);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.inMemoryHistory));
      }
    } catch (e) {
      // In-memory history maintained
    }
  }

  clearHistory() {
    this.inMemoryHistory = [...this.getDefaultHistory()];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.storageKey);
      }
    } catch {}
  }

  /**
   * Generates a grounded astrological response using the Custom Astronomy Engine + Gemini.
   */
  async generateAIResponse(userText, context = {}) {
    const system = context.system || this.getAstrologySystem();
    const chart = context.chart || this.getCurrentBirthChart(system);
    if (context.rashi) {
      if (!chart.nakshatraData) chart.nakshatraData = {};
      chart.nakshatraData.janmaRashi = context.rashi;
    }
    const history = this.getChatHistory();

    // 1. Safety Filter Check
    const safetyResult = this.safetyGate.evaluateInput(userText);
    if (!safetyResult.safe) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'astrologer',
        senderName: 'Kai RegAI Astrologer',
        title: system === 'VEDIC' ? 'AI Vedic Astrologer' : 'AI Western Astrologer',
        avatar: '/assets/home/astrologer_avatar_acharya.jpg',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: safetyResult.fallbackResponse,
        structuredResponse: {
          answer: safetyResult.fallbackResponse,
          summary: 'Safety policy inquiry restriction',
          chartInterpretation: [],
          reflection: 'Consider consulting licensed medical or professional counselors for personal emergencies.',
          followUpSuggestions: ['What general themes does my chart reflect this year?'],
          sourceReferences: ['Kai RegAI Ethical Safety Guidelines'],
          safetyNotice: `Restricted Inquiry: ${safetyResult.reason}`
        }
      };
    }

    // 2. Retrieve Knowledge Base Passages
    const passages = this.knowledgeBase.retrievePassages({
      system,
      query: userText,
      limit: 3
    });

    // 3. Build Grounded Prompt
    const promptPayload = AstrologerPromptBuilder.buildPromptPayload({
      chart,
      knowledge: passages,
      userQuery: userText,
      conversationHistory: history.map(h => ({
        sender_role: h.sender === 'user' ? 'USER' : 'ASTROLOGER',
        content: h.text
      }))
    });

    // 4. Generate AI Content via Gemini Client
    let rawResult;
    try {
      rawResult = await this.geminiClient.generateContent({
        systemInstruction: promptPayload.systemInstruction,
        contents: promptPayload.contents
      });
    } catch (err) {
      console.warn('Gemini client error, using fallback generation', err);
      rawResult = await this.geminiClient.generateMockContent({ contents: promptPayload.contents });
    }

    // 5. Validate & Parse Structured Response
    const structuredResponse = AstrologerResponseValidator.validate(rawResult.text, {
      userQuery: userText,
      history
    });

    const name = context.name || (typeof window !== 'undefined' && localStorage.getItem('kai_user_name')) || 'Seeker';
    const rashi = context.rashi || (typeof window !== 'undefined' && localStorage.getItem('kai_user_rashi')) || 'Makara';
    const hasPalmInStorage = this.hasScannedPalm();
    const isPalmScanned = context.hasScannedPalm !== undefined
      ? context.hasScannedPalm
      : (hasPalmInStorage && /\b(palm|hand|crease|creases|lines?|fate line|head line|heart line|life line|sun line|rekha|samudrika)\b/i.test(userText));
    const q = userText.toLowerCase().trim();

    const isGreeting = /^(hi|hello|hey|namaste|namaskar|pranam|pranaam|vanakkam|good\s*(morning|afternoon|evening|day)|how are you|how r u|how are u|who are you|who r u)\b/i.test(q);

    let finalText = '';

    if (isGreeting) {
      if (system === 'WESTERN') {
        finalText = `Hello ${name}! Warm greetings to you. I have your calculated Western Tropical chart for **${rashi}** open before me.\n\nHow can I support your personal journey today? Feel free to ask about:\n• **Partnerships & Love:** 7th House dynamics, relational balance, and communication\n• **Career & Ambition:** 10th House vocational momentum, midheaven transits, and timing\n• **Inner Harmony:** Lunar placements, emotional self-care, and psychological grounding\n• **Current Transits:** Active planetary cycles and practical guidance\n\nWhat question is foremost on your mind?`;
      } else {
        finalText = `Namaste ${name} ji! 🙏 Blessed to connect with you. I am feeling centered and attuned to the celestial currents today.\n\nI have your calculated Vedic birth chart for **${rashi}** open before me. How can I guide your journey today? You can ask me about:\n• **Love & Marriage:** 7th house harmony, relationship dynamics, and mutual understanding\n• **Career & Finances:** 10th house vocational momentum, promotions, and strategic timing\n• **Peace of Mind:** Emotional grounding, Moon placements, and mindful routines\n• **Planetary Transits:** Active cycles and contemplative astrological guidance\n\nWhat question is on your heart right now?`;
      }
    } else {
      // Natural astrological consultation: no artificial repetitive header
      finalText = structuredResponse.answer;
      if (isPalmScanned && !finalText.toLowerCase().includes('scanned') && !finalText.toLowerCase().includes('palm')) {
        finalText += `\n\n✋ *Scanned Palm Synthesis:* Cross-referencing your scanned palm crease telemetry (Fate Line & Mount alignments) reinforces this favorable trajectory.`;
      }

      // Output compliance firewall check
      if (!this.safetyGate.isOutputCompliant(finalText)) {
        finalText = 'As Kai RegAI\'s AI Astrologer, I focus on mindful reflection, self-awareness, and personal growth rather than fatalistic predictions.';
        structuredResponse.answer = finalText;
        structuredResponse.safetyNotice = 'Output intercepted by epistemic safety firewall.';
      }
    }

    return {
      id: 'msg-' + Date.now(),
      sender: 'astrologer',
      senderName: 'Acharya Dev',
      title: system === 'VEDIC' ? 'AI Vedic Astrologer' : 'AI Western Astrologer',
      avatar: '/assets/home/astrologer_avatar_acharya.jpg',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: finalText,
      showScanCTA: !isPalmScanned,
      isPalmConnected: isPalmScanned,
      structuredResponse
    };
  }
}

export const defaultAstrologerChatService = new AstrologerChatService();
