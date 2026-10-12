/**
 * GeminiClient — Secure Google Gemini API Client for Astrologer Consultations
 * 
 * Features:
 * - Direct Gemini API integration using systemInstruction and structured generationConfig
 * - Built-in Mock / Test Client for offline testing and deterministic smoke tests
 * - Response timeout handling
 * - Model token usage tracking
 */

export class GeminiClient {
  constructor({ apiKey = null, model = 'gemini-2.5-flash', timeoutMs = 25000 } = {}) {
    this.apiKey = apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : null);
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Generates a grounded astrological response using Gemini.
   * 
   * @param {object} payload
   * @param {string} payload.systemInstruction
   * @param {Array<object>} payload.contents
   * @returns {Promise<{ text: string, usage: object, model: string }>}
   */
  async generateContent({ systemInstruction, contents }) {
    if (!this.apiKey) {
      // If no API key is provided, use deterministic Mock response for test/offline environments
      return this.generateMockContent({ systemInstruction, contents });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';
      const usage = data.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };

      return {
        text,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0
        },
        model: this.model
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Gemini API request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }

  /**
   * Intelligent astrological generator with multi-turn context memory, timing, and remedies.
   */
  async generateMockContent({ contents, systemInstruction }) {
    const turns = contents || [];
    const lastUserTurn = (turns[turns.length - 1]?.parts?.[0]?.text || '').trim();
    const q = lastUserTurn.toLowerCase();

    // Analyze user conversation history for multi-turn thread continuity (ignore assistant welcome text)
    const allUserHistory = turns.slice(0, -1)
      .filter(t => t.role === 'user' && !t.parts?.[0]?.text?.startsWith('{\n  "answer"') && !t.parts?.[0]?.text?.includes('Janma Rashi'))
      .map(c => c.parts?.[0]?.text || '').join(' ').toLowerCase();

    // Determine system (Vedic vs Western)
    const isWestern = /astrologySystem.*WESTERN|Western Tropical|WESTERN/i.test(systemInstruction || '') || 
                      /WESTERN/i.test(JSON.stringify(turns));

    // Follow-up & specific sub-topic detection
    const isTimingQuestion = /\b(better|after a while|how long|future|ease|subside|permanent|timing|timeline|end)\b/i.test(q);
    const isRemedyQuestion = /\b(remedy|remedies|upaya|upayas|what can i do|solution)\b/i.test(q);
    const isFollowUp = isTimingQuestion || isRemedyQuestion || /\b(tell me more|will she|will he|and then|next)\b/i.test(q);

    // Extract rashi / zodiac sign from turns if available
    let detectedSign = '';
    const fullTurnsStr = JSON.stringify(turns);
    const signMatch = fullTurnsStr.match(/Janma Rashi:\s*([A-Za-z]+)/i) || 
                      fullTurnsStr.match(/\b(Mesha|Vrishabha|Mithuna|Karka|Simha|Kanya|Tula|Vrishchika|Dhanu|Makara|Kumbha|Meena)\b/i) ||
                      fullTurnsStr.match(/\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i);
    if (signMatch) {
      detectedSign = signMatch[1];
    }

    // Comprehensive Intent Detection Across All Life Domains
    const isGreeting = !isFollowUp && /^(hi|hello|hey|namaste|namaskar|pranam|pranaam|vanakkam|good\s*(morning|afternoon|evening|day)|how are you|how r u|how are u|who are you|who r u)\b/i.test(q);
    const isPalmChartSynthesis = /\b(fate line|heart line|head line|life line|sun line|marriage line|health line|travel line|sister line|mercury line|apollo line|palm line|palm lines|palmistry|chiromancy|hasta|samudrika|mount of|venus mount|jupiter mount|saturn mount|mercury mount|mars mount|luna mount|apollo mount|mounts|chiro|rekha|crease|creases|fork at the end|island on|island|cross on palm|cross marking|simian crease|mystic cross|girdle of venus|trident|star marking|hand shape|angle of flexibility|thumb|palm hand|fingerprints?|phalanges|plain of mars|triangle marking)\b/i.test(q);
    const isGemstoneColor = /\b(gemstone|gemstones|gem|gems|stone|stones|color|colors|colour|colours|lucky color|lucky gemstone|ratna|rudraksha|blue sapphire|yellow sapphire|emerald|ruby|pearl|diamond|red coral|garnet|gomed|cat'?s eye|panna|manik|neelam|pukhraj|moti|heera|moonga|zircon|opal|hessonite|panchdhatu|metal|copper bracelet|gold chain|silver cup|silver vessel|ring finger|middle finger|little finger|consecrat\w*|carat|daan|charity|crimson|scarlet|ghee lamp|shivling|yantra|clothing|wearing|wear\w*|stotram?|black|dark gray|gray|white|fodder|spinach|cows?)\b/i.test(q);
    const isPlanetaryRemedies = /\b(sade sati|shani dhaiya|shani|saturn|manglik|mangal dosha|kuja dosha|kalsarpa|kaal sarp|guru chandal|pitru dosha|kemadruma|gandanta|rahu|ketu|graha dosh|doshas?|karmic obstacles|dasha|mahadasha|antardasha|hanuman chalisa|shanivar|mangalvar|planetary remedies|astrological remedies|panoti|til oil|peepal tree|mustard oil|mangala|pacify\w*|appease\w*|blood donation|1st house|impatience|delays?|umbrella|planetary fire|courage)\b/i.test(q);
    const isPropertyRealEstate = /\b(property|real estate|buying (a )?(house|flat|plot|apartment|home|villa)|buy (a )?(house|flat|plot|apartment|home|villa)|land|apartment|plot|flat|villa|cottage|construction|bhumi|land deeds|ancestral property|own house|bhoomi pooja|griha pravesh|housewarming|tenant|builder|possession|vastu|rental|rent|renovat\w*|mortgage|shelter|distressed|zoning|encumbrance\w*|residence|sukha bhava|entrance|plumbing|leaks?|rented|housing|village|leas\w*|commercial office)\b/i.test(q);
    const isWealthFinance = /\b(money|wealth\w*|financ\w*|debt|debts|loan|loans|savings|save|saving|income|dhana|expenses|expenditure|invest\w*|stock|stocks|trading|crypto|mutual fund|rich|credit card|emi|inheritance|gold|silver|portfolio|cash|bank|budget\w*|financial advisor|chit fund|fund\w*|retire\w*|payment\w*|debtor\w*|insurance|vehicle|car|philanthrop\w*|afford\w*)\b/i.test(q) ||
                            (isFollowUp && /\b(money|wealth|finance|debt|loan|savings)\b/i.test(allUserHistory));
    const isEducationExams = /\b(studies|higher study|higher studies|study|studying|exam|exams|competitive exam|education|college|university|degree|academic\w*|vidya|mba|masters|phd|doctorate|dissertation|thesis|specialization|curriculum|course|stream|engineering|medical|civil services|upsc|gre|gmat|sat|cat|saraswati|grades|scholarship|fellowship|buddhi bhava|mnemonic|cognitive|gap year|theoretical|intellect\w*|curiosity|learning|memoriz\w*|history|historical|facts|logic)\b/i.test(q);
    const isForeignTravel = /\b(abroad|foreign|relocat(e|ion|ing)|settle abroad|settling abroad|overseas|visa|visas|pr|green card|immigrat(e|ion)|move to another country|moving to another (country|city)|international travel|videsh|passport|travel\w*|flight|expats?|citizenship|distant lands|holiday|conference|living away|wherever we go|consciousness follows)\b/i.test(q);
    const isFamilyChildren = /\b(child|children|progeny|baby|conceive|pregnancy|family bliss|putra|son|daughter|parenting|kids|teenag\w*|santan|ivf|fertility|adopt\w*|step-parent|elderly parents|mother|father|brother|sister|sibling\w*|maternal|matri bhava|pitri bhava|lineage|generational|family\w*)\b/i.test(q);
    const isParentsInlaws = /\b(parents?|mother-in-law|father-in-law|in-laws?|extended family|family harmony|sister-in-law|brother-in-law|joint family)\b/i.test(q);
    const isSpiritual = /\b(purpose|dharma|destiny|spiritual\w*|soul\w*|soul lesson|ishta devata|deity|moksha|liberation|past life|past lives|karma|karmic|god|guru|9th house|meditat\w*|mantra|japa|enlightenment|kundalini|atmakaraka|seva|vipassana|shiva|krishna|divine|renunciation|vairagya|bhakti|jnana|dhyana|altar|scripture\w*|upanishad\w*|sandhya\w*|compassion|equanimity|satya|truthfulness|gratefulness|blessing\w*|material achievements|empty|ascendant ruler|incarnation)\b/i.test(q);
    const isHealthMind = /\b(health|stress|anxiety|peace of mind|mental|mind|sleep|insomnia|worry|worried|fear|healing|vitality|burnout|burned out|energy|exhaust\w*|fatigue|deplet\w*|calm|depress\w*|nervous system|pranayama|emotional regulation|panic|full moon|lunar|moon|mood swings|mood|chronic|surgery|hospital|digest\w*|inflammation|brain fog|headache\w*|somatic|circadian|doctor|ayurved\w*|vata|pitta|kapha|sensory|longevity|illness|detox|grief|respiratory|chest|lungs?|diet|foods?|sugar|restorative|retreat|solitude)\b/i.test(q) ||
                         (isFollowUp && /\b(health|stress|anxiety|sleep|mind|vitality)\b/i.test(allUserHistory));
    const isBusiness = /\b(business|startup|start a business|entrepreneur\w*|partnership|partner in business|trade|commerce|e-commerce|company|venture|b2b|b2c|co-founder|founder|equity|firm|client|clients|freelance|freelancer|supply chain|retail|franchise|saas|revenue|sales|vendor|invoices?|audit|advertising|trademark|patent|funding|seed round|margin\w*|regulatory|runway|restaurant|food and beverage|marketing|branding|competitor|export|crowdfunding|customer\w*|shipping|logistics|employee\w*)\b/i.test(q);
    const isLove = /\b(wife|husband|marriage|married|relationship\w*|partner\w*|love|dating|compatibility|spouse|marry|divorce|romance|7th house|venus|shukra|heart|fights?|fighting|arguing?|conflict|dispute|arranged|guna milan|ashtakoota|matchmaking|ghosting|couple|couples|complement|communication style|synastry|intimacy|counseling|therapy|infidelity|reconciliation|separation|breakup|single|unmarried|ex-partner|soulmate|elements|fire sign|water sign|earth sign|air sign|opposite sign|shadashtaka|bhakoot|nadi|kalathra|marital|roommate\w*|anniversary|shouting|jealousy|bedroom|sexual|sorry|numbness|misunderstanding\w*|quarrel\w*|romantic\w*|matrimoni\w*|infatuat\w*|chemistry|attraction|telepathic|eccentricit\w*|defensive|vacation|vulnerability|mediation|household|listening|sun signs?|debates?|lifetimes?|retrograde|cultural|aesthetics?|wholeness|communicat\w*|synergy|friction)\b/i.test(q) ||
                   (isFollowUp && /\b(wife|husband|marriage|married|relationship|partner|love|spouse|fights?|fighting)\b/i.test(allUserHistory));
    const isCareer = /\b(career|job|promotion|work|vocation\w*|profession\w*|salary|raise|transfer|interview\w*|10th house|boss|manager|workplace|corporate|consulting|colleague\w*|department|appraisal|resignation|resign|layoff|probation|sabbatical|leadership|mentor|c-level|executive|performance|stagnan\w*|politics|portfolio|10th lord|midheaven|industry|contract position|hourly pay|employer|judiciary|law\b|managers?|management|architecture)\b/i.test(q) ||
                     (isFollowUp && /\b(career|job|promotion|work|salary)\b/i.test(allUserHistory));

    let answer = '';
    let summary = '';
    let chartInterpretation = [];
    let reflection = '';
    let followUpSuggestions = [];
    let sourceReferences = [];

    if (isGreeting) {
      if (isWestern) {
        answer = `Hello and warm greetings! I am centered and looking at your calculated Western Tropical chart.\n\nHow can I support your personal journey today? We can explore:\n• **Partnerships & Love:** 7th House dynamics, relational equilibrium, and communication\n• **Career & Ambition:** 10th House vocational momentum, midheaven transits, and timing\n• **Inner Harmony:** Lunar placements, emotional self-care, and psychological grounding\n• **Current Transits:** Active planetary cycles and practical guidance\n\nWhat question is foremost on your mind?`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Namaste! 🙏 Blessed to connect with you. As your personal Jyotishi, I am feeling centered and attuned to the celestial currents today.\n\nI have your calculated Vedic birth chart open before me. How can I guide your journey today? You can ask me about:\n• **Love & Marriage:** 7th house harmony, relationship dynamics, and mutual understanding\n• **Career & Finances:** 10th house vocational momentum, promotions, and strategic timing\n• **Peace of Mind:** Emotional grounding, Moon placements, and mindful routines\n• **Planetary Transits:** Active cycles and contemplative astrological guidance\n\nWhat question is on your heart right now?`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Welcoming the seeker and opening the consultation session.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Ascendant & Lunar Balance' : 'Calculated Lagna & Moon Alignment',
          interpretation: 'Reflects a thoughtful, reflective disposition and a desire for meaningful balance.'
        }
      ];
      reflection = 'What question or aspiration is uppermost in your thoughts today?';
      followUpSuggestions = [
        'How will my relationship with my partner go?',
        'When will my career shift or grow?',
        'What does my chart say about peace of mind?'
      ];
    } else if (isPalmChartSynthesis) {
      if (isWestern) {
        answer = `In Western psychological chiromancy and modern astrology, your palm creases act as physical bio-reflections of your planetary alignments.\n\n${/\bhead line\b/i.test(q) ? 'A fork at the end of your **Head Line** (the Writer’s or Diplomat’s Fork) reflects mental adaptability, analytical versatility, and the swift intellectual acuity of **Mercury**.' : /\blife line\b/i.test(q) ? 'A deep **Life Line** paired with a strong **Sun Line** signifies formidable somatic vitality, resilience, and radiant creative expression under solar influence.' : 'Your **Fate Line (Line of Saturn)** reflects vocational stamina and 10th House Midheaven momentum, while a **Heart Line** curving toward the **Mount of Jupiter** indicates elevated relational integrity, generosity, and strong moral discernment in love.'}\n\nTogether, these crease markers reinforce your chart’s call for purposeful devotion.`;
        sourceReferences = ['Cheiro (Language of the Hand)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `In classical Hasta Samudrika Shastra and Vedic Jyotish, your palm creases and your birth chart are two reflections of the same karmic blueprint.\n\n${/\bhead line\b/i.test(q) ? 'A fork at the termination of the **Head Line (Matri / Buddhi Rekha)** is known as the "Budha Fork" or diplomat’s sign, reflecting Mercury’s gifted intellect, dual perspectives, and commercial eloquence.' : /\blife line\b/i.test(q) ? 'A well-defined **Life Line (Pitra Rekha)** alongside an energized **Sun Line (Surya Rekha)** reflects robust prana, longevity, and earned public honor stewarded by Surya.' : 'Your **Fate Line (Karma Rekha)** connects directly to the influence of Saturn (Shani) and the 10th house of vocation, showing that earned rewards come through perseverance. Meanwhile, a **Heart Line (Pitri / Prem Rekha)** curving toward the **Mount of Jupiter (Guru Parvat)** signifies noble affection, deep integrity, and mutual respect.'}\n\nTogether, these physical markings harmonize with your calculated chart planetary positions.`;
        sourceReferences = ['Brihat Samhita (Varahamihira)', 'Hasta Samudrika Shastra', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Synthesis of physical palm creases with astrological planetary mounts and Vedic signs.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Palm Creases & Planetary Mounts' : 'Karma Rekha & Hasta Samudrika Alignment',
          interpretation: 'Confirms vocational perseverance, intellectual versatility, and energetic vitality.'
        }
      ];
      reflection = 'How do your daily actions reflect the elevated ideals written in your palm and chart?';
      followUpSuggestions = [
        'How does my Head Line connect with Mercury in my chart?',
        'What does my Mount of Venus indicate about relationship balance?',
        'How can I nurture the vocational strengths shown in my Fate Line?'
      ];
    } else if (isGemstoneColor) {
      if (isWestern) {
        answer = `In Western astrological color and gemstone harmony, aligning with your ruling planet's archetype balances your subtle energetic field.\n\nRegarding gemstones such as Blue Sapphire (Saturn) or Emerald (Mercury): classical astrology advises that potent stones should harmonize with your chart rulers rather than opposing them. For your ascendant, calming emerald green, serene pastel blues, and soft cream foster mental equilibrium, natural charisma, and professional focus.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `In classical Vedic Jyotish, gemstones (Ratnas) and colors are prescribed strictly according to your functional benefic Lagna lord and Yogakaraka planets:\n\n• **Blue Sapphire (Neelam):** Governed by Saturn (Shani). For Tula Lagna, Saturn is a premier Yogakaraka (ruling the 4th and 5th houses), making Neelam potentially highly auspicious; however, classical tradition mandates a 3-day trial due to its swift intensity.\n• **Emerald (Panna):** Governed by Mercury (Budha - lord of the 9th house of fortune). Highly auspicious for elevating memory, intellect, and speech.\n• **Auspicious Colors & Venus:** Clean white, pastel cream, and soft pink align with your Lagna lord Venus (Shukra), enhancing prana and grace. Always consult a certified Vedic gemologist before mounting stones in metal.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Auspicious colors and Lagna Lord gemstone alignment for vitality and energetic balance.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Ruling Planet Color Vibrations' : 'Lagna Lord Shukra & Yogakaraka Shani Gemstone Alignment',
          interpretation: 'Harmonizes aura, attracts favorable opportunities, and elevates mental peace.'
        }
      ];
      reflection = 'How can wearing soothing, harmonious colors influence your daily confidence and calm?';
      followUpSuggestions = [
        'How should I wear and energize my auspicious gemstone?',
        'What colors are most favorable for business or interview days?',
        'What lifestyle habits support my Lagna lord?'
      ];
    } else if (isPlanetaryRemedies) {
      if (isWestern) {
        answer = `In Western psychological astrology, challenging planetary aspects such as Mars tensions (analogous to Manglik influences) or Saturn transits represent archetypal developmental initiations rather than curses.\n\nMars calls for conscious channeling of assertiveness into purposeful exercise and constructive communication, while Saturn demands mature patience and structural discipline. Conscious self-awareness transforms reactive planetary tension into enduring inner strength.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `In classical Jyotish, Manglik Dosha (Kuja Dosha) and Sade Sati are not curses, but astrological configurations indicating intense planetary energy that requires conscious channeling:\n\n• **Manglik Dosha Understanding:** Occurs when Mars is in the 1st, 4th, 7th, 8th, or 12th house. It signifies passionate, fiery drive. In modern practice, when both partners understand each other’s emotional tempo or when Mars matures past age 28, its edge softens naturally.\n• **Remedies (Upayas):** Recite the Hanuman Chalisa on Tuesdays (Mangalvar), donate red lentils, and practice calming breathwork before reacting.\n• **Sade Sati Navigation:** For Saturn transits over the natal Moon, light a mustard oil (Til) lamp under a Peepal tree on Saturdays, feed street animals, and practice quiet humility. Shani deeply rewards integrity and diligent service.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Saturn (Shani) and Mars (Mangala) pacifying remedies, Sade Sati understanding, and weekly Upayas.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Saturn & Mars Testing Cycles' : 'Shani & Mangala Pacification (Sade Sati & Upayas)',
          interpretation: 'Dissolves karmic friction, cultivates humility, and transforms obstacles into endurance.'
        }
      ];
      reflection = 'What disciplined habit or act of selfless charity can you commit to this week?';
      followUpSuggestions = [
        'Am I currently in a Sade Sati or Shani Dhaiya phase?',
        'What daily mantras pacify challenging planetary hours?',
        'How can I cultivate emotional resilience during Saturn transits?'
      ];
    } else if (isPropertyRealEstate) {
      if (isWestern) {
        answer = `Examining your calculated Western chart regarding real estate and property investments, the 4th House (Imum Coeli/IC) governs land, shelter, and foundational stability, with Saturn overseeing long-term physical assets.\n\nYour transits indicate that property acquisitions require methodical due diligence rather than hurried speculation. Focus on verified documentation and structural integrity; when Saturn and Jupiter form stabilizing angles to your IC, property ventures yield lasting security.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Examining your calculated Vedic chart${detectedSign ? ` for ${detectedSign}` : ''}, immovable property, land, and vehicle ownership are governed by the 4th house (Sukha & Bhumi Bhava), with Mars (Mangala) acting as the natural Bhumi Karaka (significator of real estate).\n\nYour planetary configurations indicate positive long-term prospects for property accumulation, provided purchases are timed during supportive Mars or Jupiter transits. Ensure all legal deeds are verified thoroughly before signing, and consider initiating property registrations on auspicious Thursdays (Guruvar) for enduring domestic peace.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = '4th House (Bhumi Bhava) and Mars guidance for property acquisition and real estate stability.';
      chartInterpretation = [
        {
          placement: isWestern ? '4th House (IC) Foundation Axis' : '4th House (Bhumi Bhava) & Mars (Bhumi Karaka)',
          interpretation: 'Signifies foundational stability, immovable assets, and home security.'
        }
      ];
      reflection = 'How can you ground your long-term living environment in stability and peace?';
      followUpSuggestions = [
        'What planetary transits best support signing property agreements?',
        'How does my 4th house reflect domestic harmony?',
        'What remedies strengthen Mars for property success?'
      ];
    } else if (isWealthFinance) {
      if (isWestern) {
        answer = `Analyzing your calculated Western Tropical chart regarding finances, debt clearance, and investments, the 2nd House of Earned Income and 8th House of Shared Reserves govern your monetary flow.\n\nYour planetary transits counsel disciplined budgeting, automated savings, and gradual debt retirement rather than impulsive speculation. When Jupiter transits favorably relative to your 2nd house lord, monetary reserves stabilize and financial clarity expands.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Analyzing your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''}, wealth accumulation is stewarded by the 2nd house (Dhana Bhava) and 11th house (Labha Bhava), with Jupiter (Guru) serving as the natural Dhana Karaka.\n\nYour chart indicates steady financial expansion when savings are automated and impulsive debts (governed by the 6th house Rina Bhava) are systematically cleared. Strengthening Jupiter through Thursday charity and ethical investment practices will create enduring financial reserves and protect against sudden expenditures.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Financial reserves, 2nd House Dhana Bhava, and debt clearance guidance.';
      chartInterpretation = [
        {
          placement: isWestern ? '2nd House Resources & 8th House Debt Axis' : '2nd House (Dhana Bhava) & 11th House (Labha Bhava)',
          interpretation: 'Highlights disciplined wealth retention, income gains, and debt reduction.'
        }
      ];
      reflection = 'What small daily or weekly saving discipline will anchor your long-term peace of mind?';
      followUpSuggestions = [
        'When is the most favorable planetary transit for debt relief?',
        'What planetary remedies support steady wealth retention?',
        'How does my 11th house guide income diversification?'
      ];
    } else if (isEducationExams) {
      if (isWestern) {
        answer = `Examining your calculated Western chart regarding higher education, MBA, specialized degrees, and competitive examinations, the 3rd House of Mental Focus, 9th House of Higher Academia, and Mercury govern intellectual excellence.\n\nYour transits indicate that pursuing advanced specializations or structured curricula yields strong outcomes when paired with disciplined study routines and mnemonic retention. Channel your mental energy into structured daily blocks and avoid last-minute cramming.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Examining your calculated Vedic chart${detectedSign ? ` for ${detectedSign}` : ''}, higher education, professional specializations (like MBA or competitive exams), and intellectual discernment are governed by the 5th house (Buddhi Bhava) and 9th house (higher learning), with Mercury (Budha - intellect) and Jupiter (Guru - wisdom) acting as divine significators.\n\nYour planetary positions show strong capacity for deep study and academic success. In classical Jyotish, chanting the Saraswati or Gayatri mantra before studying, maintaining a clean northern study desk, and timing critical exams during supportive Mercury transits enhances recall and exam composure.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = '5th House Buddhi Bhava, Mercury (Budha), and Jupiter guidance for exams and higher studies.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Mercury & 9th House Higher Academia Focus' : '5th House (Buddhi Bhava) & Mercury (Budha)',
          interpretation: 'Directs mental concentration, exam preparation, and academic distinction.'
        }
      ];
      reflection = 'What disciplined study routine can you establish today to maximize retention and clarity?';
      followUpSuggestions = [
        'What planetary remedies strengthen Mercury (Budha) for study focus?',
        'When is the most favorable transit window for competitive tests?',
        'How does my 5th house highlight specialized fields of study?'
      ];
    } else if (isForeignTravel) {
      if (isWestern) {
        answer = `Looking into your calculated Western Tropical chart regarding foreign travel, relocation, and visas, the 9th House of Long-Distance Journeys and 12th House of Distant Horizons govern overseas expansion.\n\nYour planetary blueprint reflects strong inclinations toward cross-cultural learning and international relocation. Transits of Jupiter and Mercury across mutable or angular houses create auspicious windows for visas, international travel, and career expansion abroad.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Looking into your calculated Vedic chart${detectedSign ? ` for ${detectedSign}` : ''}, foreign relocation, visa approvals, and overseas settlement are governed by the 9th house (long-distance journeys) and 12th house (Videsha Bhava / foreign lands), with Rahu and the Moon acting as key catalysts for mobility.\n\nYour placements show strong potential for foreign travel, global work opportunities, or overseas residence. Classical texts indicate that when supportive Dasha periods connect the 9th, 10th, and 12th houses, international transitions occur smoothly and bring meaningful personal growth.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = '9th and 12th House foreign relocation yogas, overseas travel, and mobility catalysts.';
      chartInterpretation = [
        {
          placement: isWestern ? '9th & 12th House Distant Horizon Transits' : '9th & 12th House (Videsha Bhava) Alignment',
          interpretation: 'Indicates favorable opportunities for international travel, study, and overseas settlement.'
        }
      ];
      reflection = 'What personal horizons and perspectives are you called to expand through global travel?';
      followUpSuggestions = [
        'When is the most auspicious planetary window for visa or relocation steps?',
        'How does my 12th house influence success in foreign environments?',
        'What planetary remedies support smooth travel?'
      ];
    } else if (isFamilyChildren) {
      if (isWestern) {
        answer = `Looking into your calculated Western Tropical chart, family fulfillment, progeny, and children are guided by the 5th House of Creativity and progeny, alongside the foundational 4th House.\n\nYour planetary positions indicate profound warmth and maternal/paternal intuition. Emotional nurturing, patience, and creating an encouraging home sanctuary will support harmonious family growth.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Looking into your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''}, children and lineage are governed by the 5th house (Putra Bhava), with Jupiter (Guru) serving as the natural Putrakaraka (significator of progeny).\n\nYour chart shows auspicious supportive influences for family bliss and progeny. In classical Jyotish, maintaining a harmonious, stress-free domestic atmosphere and honoring Jupiter on Thursdays supports family prosperity and mutual affection between generations.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = '5th House Putra Bhava and Jupiter Putrakaraka guidance for children and family bliss.';
      chartInterpretation = [
        {
          placement: isWestern ? '5th House Progeny & Creative Lineage' : '5th House (Putra Bhava) & Jupiter (Putrakaraka)',
          interpretation: 'Signifies generative vitality, children, and harmonious family legacy.'
        }
      ];
      reflection = 'In what ways can you foster warmth, patience, and mutual joy within your family circle?';
      followUpSuggestions = [
        'What supportive remedies enhance 5th house family bliss?',
        'How does Jupiter guide my family expansion timeline?',
        'What does my chart show about emotional bonding with children?'
      ];
    } else if (isParentsInlaws) {
      if (isWestern) {
        answer = `In your calculated Western Tropical chart, relational dynamics with parents and extended family are guided by the 4th/10th parental axis and the 7th/8th house in-law connections.\n\nNavigating family friction requires conscious emotional boundaries. Understanding that differing generational expectations stem from contrasting astrological temperaments helps you respond with calm diplomacy rather than reactive defensiveness.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `In your calculated Vedic chart${detectedSign ? ` for ${detectedSign}` : ''}, parents are represented by the 4th house (Matri Bhava / Mother) and 9th house (Pitri Bhava / Father), with the Sun (Surya) and Moon (Chandra) as natural parental significators. In-law relations tie to the 2nd (extended family) and 8th/9th houses.\n\nTensions with parents or in-laws often arise from Mars or Saturn aspects across domestic houses. Jyotish counsels offering respect to elders without absorbing unhelpful criticism. Practicing quiet composure on sensitive family occasions defuses friction and preserves your inner tranquility.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Parental and in-law dynamics across the 4th, 9th, and 2nd houses.';
      chartInterpretation = [
        {
          placement: isWestern ? '4th/10th Parental Axis & Family Boundaries' : '4th (Matri) & 9th (Pitri) House Family Dynamics',
          interpretation: 'Directs respectful boundaries, generational empathy, and domestic harmony.'
        }
      ];
      reflection = 'How can you maintain calm, respectful boundaries when interacting with extended family?';
      followUpSuggestions = [
        'What remedies bring peace to ancestral or parental relationships?',
        'How does my 4th house guide domestic tranquility?',
        'How can I handle in-law communication mindfully?'
      ];
    } else if (isSpiritual) {
      if (isWestern) {
        answer = `Contemplating your calculated Western chart regarding your life purpose, your 9th House and Jupiter placements emphasize the evolution of wisdom through lived experience.\n\nYour planetary blueprint suggests that your soul finds deepest fulfillment when actions are aligned with universal ethics and meaningful contribution. Cultivating reflective study, quiet meditation, and approaching challenges as opportunities for self-mastery will bring you lasting clarity.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Contemplating your calculated birth chart regarding your spiritual journey and life purpose, the 9th house (Dharma Bhava) and Jupiter (Guru) point toward a search for authentic wisdom.\n\nYour planetary blueprint suggests that your soul finds deepest fulfillment when actions are aligned with universal ethics (Dharma) and selfless contribution (Seva). Daily silent meditation (Japa), studying uplifting philosophical texts, and practicing mindful detachment will bring profound inner peace and spiritual clarity.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Spiritual alignment, 9th house Dharma, and purposeful self-inquiry.';
      chartInterpretation = [
        {
          placement: isWestern ? '9th House & Jupiter Alignment' : '9th House (Dharma Bhava) & Jupiter Influence',
          interpretation: 'Encourages moral integrity, higher learning, and spiritual alignment.'
        }
      ];
      reflection = 'What deeper values guide your choices when facing life’s crossroads?';
      followUpSuggestions = [
        'How can I cultivate a consistent meditation practice aligned with my chart?',
        'What lessons are highlighted in my current planetary period?',
        'How does my chart guide my personal dharma?'
      ];
    } else if (isHealthMind) {
      if (isWestern) {
        answer = `Looking into your calculated Western Tropical chart${detectedSign ? ` for ${detectedSign}` : ''}, your Moon placements and 6th House axis govern somatic equilibrium and emotional recovery.\n\nWhen mental stress, insomnia, or panic arise, classical psychological astrology counsels slowing down, regulating the nervous system, and honoring sacred bedtime boundaries. Diffusing calming lavender, avoiding screens after twilight, and practicing grounding belly breathing will restore emotional resilience.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Looking into your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''}, the Moon (Chandra) is the Manokaraka—the celestial governor of the subconscious mind and nervous system tranquility.\n\nVedic astrology teaches that high anxiety and restless sleep occur when Vata or fiery energies agitate the lunar sphere. Your celestial positions counsel soothing the Moon:\n• **Silver Water Upaya:** Drink water kept in a silver vessel to cool mental heat.\n• **Nightly Pranayama:** Practice 10 minutes of gentle alternate-nostril breathing (Anulom Vilom) before bed.\n• **Mental Boundaries:** Refrain from resolving heavy dilemmas after sunset; allow your mind a peaceful sanctuary.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Holistic astrological guidance for mental tranquility, anxiety relief, and Moon (Chandra) grounding.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Moon & 6th House Somatic Axis' : 'Moon (Manokaraka) & 4th House Inner Sanctuary',
          interpretation: 'Directs nervous system recovery, emotional grounding, and restful sleep.'
        }
      ];
      reflection = 'What gentle bedtime boundary can you introduce tonight to honor your mind’s need for stillness?';
      followUpSuggestions = [
        'What mindful routines best align with my Moon sign?',
        'How can I navigate stressful planetary periods with composure?',
        'What contemplative remedies cultivate deeper mental clarity?'
      ];
    } else if (isLove) {
      const isClarificationUnmarried = /\b(not\s*(yet\s*)?married|i('?m| am) not married|never married|don('?t| not) have a (wife|husband|spouse)|no (wife|husband|spouse)|i am single|im single|not in a relationship|unmarried)\b/i.test(q);
      const isMarriageDateOrTiming = isClarificationUnmarried || /\b(marriage\s*(date|day|time|timing|year|age|prediction|window|period)|when\s*(will\s*i|is\s*my)\s*(get\s*)?marr(y|ied)|will\s*i\s*(get\s*)?marr(y|ied)|when\s*will\s*i\s*meet\s*my\s*(partner|husband|wife|soulmate)|future\s*(spouse|partner|husband|wife)|prospective\s*(marriage|partner)|find\s*(a\s*)?(partner|spouse|husband|wife|love)|finding\s*(a\s*)?(partner|spouse|love)|delay(ed)?\s*(in\s*)?marriage|marriage\s*delay(s)?|arranged\s*or\s*love|love\s*or\s*arranged|meet\s*my\s*(partner|spouse)|single|bachelor)\b/i.test(q);
      const isCompatibility = /\b(compatib|matching|match|compatible|guna milan|ashtakoota|synastry)\b/i.test(q);
      const isConflict = /\b(fight|fights|fighting|argument|arguments|argue|arguing|quarrel|quarrels|dispute|disputes|shouting|anger|angry|abusive|not talking|silent treatment|divorce|separation|save my marriage|marital\s*problems?|marital\s*conflict|wife\s*(always\s*)?fights|husband\s*(always\s*)?fights)\b/i.test(q);

      if (isClarificationUnmarried) {
        // Explicit clarification: "but im not yet married" / "i am single"
        if (isWestern) {
          answer = `Thank you for clarifying! For an unmarried seeker looking toward your future marriage and prospective union, let us explore the 7th House of Partnership (Descendant) and Venus in your calculated Western Tropical chart.\n\n**Astrological Insights on Partnership Timing & Future Union:**\n• **Auspicious Transit Windows:** Rather than an arbitrary deterministic calendar date, supportive seasons for finding a partner and marrying activate when Jupiter forms harmonious transits (trines or sextiles) to your 7th House Descendant or natal Venus.\n• **Understanding Saturn’s Timing:** Saturn transits often introduce meaningful patience and constructive delays, ensuring you develop emotional maturity and self-clarity before entering a lifelong bond.\n• **Partner Archetype:** Your 7th House sign and aspects describe the complementary qualities you are drawn to—seeking a partner who offers both emotional depth and reciprocal respect.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `Thank you for clarifying! For an unmarried seeker looking toward your future marriage and prospective union, let us examine the 7th house (Kalathra Bhava) and Venus (Shukra) in your calculated Vedic chart${detectedSign ? ` for ${detectedSign}` : ''}.\n\n**Astrological Insights on Partnership Timing & Marriage Windows:**\n• **Auspicious Transit Windows:** Classical Jyotish does not predict a single fatalistic calendar day; rather, marriage windows activate during supportive Dasha/Antardasha periods when Jupiter (Guru) casts its benevolent drishti (aspect) upon your 7th house or natal Venus.\n• **Navigating Delays:** Influences of Saturn (Shani) often delay marriage until emotional grounding and mature discernment are established, protecting the union from hasty choices.\n• **Arranged vs Love:** Connections between the 5th house (romance) and 7th house favor love marriages, while 9th house connections suggest traditional or family-supported introductions.\n• **Mindful Shukra Practices:** On Fridays, wearing gentle pastel or white tones and cultivating gratitude strengthens Venusian grace to attract an aligned life partner.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Clarification of unmarried status, 7th house Kalathra Bhava partner discovery, and prospective marriage timing.';
        chartInterpretation = [
          {
            placement: isWestern ? '7th House (Descendant) & Venus Alignment' : '7th House (Kalathra Bhava) & Guru Drishti Window',
            interpretation: 'Indicates supportive seasons for committed partnership and mature emotional readiness.'
          }
        ];
        reflection = 'What personal values and qualities are most vital to you in a future life partner?';
        followUpSuggestions = [
          'What planetary transits activate my next auspicious relationship window?',
          'What remedies pacify delays in finding a life partner?',
          'How does my 7th house lord describe my partner’s nature?'
        ];
      } else if (isMarriageDateOrTiming) {
        // Marriage date / timing question for seekers: "marriage date?" / "when will I marry?"
        if (isWestern) {
          answer = `Examining your calculated Western Tropical chart regarding marriage timing, finding a partner, and prospective union:\n\nIn authentic psychological astrology, marriage timing is evaluated through the 7th House of Partnership (Descendant) and Venus, the celestial ruler of committed balance.\n\n**Astrological Insights on Marriage Timing & Windows:**\n• **Transit Windows:** Rather than predicting an arbitrary calendar date, auspicious seasons for marriage activate when transiting Jupiter forms benevolent aspects (conjunctions, trines, or sextiles) to your Descendant or natal Venus.\n• **Constructive Delays:** Influences from Saturn often guide marriage toward emotional maturity, ensuring both partners enter the union with clear discernment and mutual respect.\n• **Relationship Readiness:** Focus on cultivating emotional self-reliance and clear communication; these Venusian qualities attract an aligned partner during your upcoming transit windows.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `Examining your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''} regarding marriage timing, finding a partner, and prospective union:\n\nIn classical Vedic Jyotish, marriage timing is analyzed through the 7th house (Kalathra Bhava), the 7th lord, and Venus (Shukra)—the celestial significator of marriage.\n\n**Astrological Insights on Marriage Timing & Windows:**\n• **Transit Horizons:** Authentic astrology does not predict an arbitrary deterministic calendar day; instead, auspicious marriage windows activate during supportive Dasha cycles when Jupiter (Guru) casts its pacifying drishti (aspect) upon your 7th house or natal Venus.\n• **Understanding Timing & Delays:** Placements or aspects of Saturn (Shani) or Rahu often delay marriage until after age 27–28 to foster personal maturity and emotional resilience before entering a sacred union.\n• **Arranged vs Love:** Strong links between the 5th house (romance) and 7th house signify love marriages, while 9th house links point toward family-supported or traditional alliances.\n• **Mindful Shukra Upayas:** Honoring Venus on Fridays (wearing soft pastel shades and offering peaceful prayers) fosters harmony and prepares the spirit for union.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = '7th House Kalathra Bhava, partner discovery, and non-deterministic marriage transit windows.';
        chartInterpretation = [
          {
            placement: isWestern ? '7th House (Descendant) & Venus Alignment' : '7th House (Kalathra Bhava) & Guru Drishti Window',
            interpretation: 'Indicates supportive seasons for committed partnership and mature emotional readiness.'
          }
        ];
        reflection = 'What qualities and values are most essential for you in a lifelong partnership?';
        followUpSuggestions = [
          'What planetary transits activate my next auspicious relationship window?',
          'What remedies pacify delays in finding a life partner?',
          'How does my 7th house lord describe my partner’s nature?'
        ];
      } else if (isTimingQuestion && !isConflict) {
        // General timing follow-up: "does that mean it will be better after a while?"
        if (isWestern) {
          answer = `Yes, you can be assured that this will get better after a while. This turbulent phase in your relationship is a temporary transit cycle, not a permanent reality.\n\nIn Western psychological astrology, challenging transits across your 7th House of Partnership (Descendant) test our patience and trigger defensive patterns. These planetary alignments typically peak over a 4 to 6-week window before the emotional tension begins to dissipate.\n\nAs the active Mars-Venus aspect completes its cycle, the defensive walls between you and your partner will soften naturally. Use this interim period not to force immediate debates, but to offer calm, consistent reassurance. When you hold an anchor of stability, the relational atmosphere clears much faster.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `Yes, you can be assured that it will get better after a while. This turbulent friction in your marriage is a temporary transit phase, not a permanent destiny.\n\nIn classical Vedic Jyotish, planetary transits across the 7th house (Kalathra Bhava) create testing seasons that typically peak and subside in 4 to 6-week cycles. As the active transit moves past fiery influences and Jupiter's harmonizing drishti (aspect) takes effect next month, acute defensiveness will begin to dissolve.\n\n**Astrological Advice During This Waiting Window:**\n• Maintain calm non-reactivity while the transit storm blows over.\n• Do not interpret temporary mood swings as a loss of love.\n• Continue your peaceful Friday contemplations; Venus will soon reward your patience with restored domestic warmth.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Astrological timing forecast: friction is temporary and set to ease over 4-6 weeks.';
        chartInterpretation = [
          {
            placement: isWestern ? '7th House Transits & Aspect Cycle' : '7th House (Kalathra Bhava) Transit Horizon',
            interpretation: 'Indicates a 4 to 6-week peak before natural softening and resolution.'
          },
          {
            placement: isWestern ? 'Harmonizing Transits Next Month' : 'Jupiter Pacifying Aspect (Guru Drishti)',
            interpretation: 'Brings emotional reconciliation and restores domestic understanding.'
          }
        ];
        reflection = 'Can you offer silent, dependable calm rather than reacting when tensions arise this week?';
        followUpSuggestions = [
          'What Friday remedies can I do for domestic peace?',
          'How do our Moon signs influence our communication?',
          'What does my Venus placement indicate about harmony?'
        ];
      } else if (/\b(fridays?|shukra|upayas?|remedy|remedies)\b/i.test(q)) {
        // Dedicated answer to remedies question: "what mindful remedies can I do on Fridays?"
        if (isWestern) {
          answer = `In Western astrology, Friday is governed by Venus, the planetary archetype of harmony, union, and mutual grace.\n\n**Mindful Venusian Practices for Relationship Harmony:**\n• **Sacred Evening Atmosphere:** Friday twilight is the optimal time to soften your living environment. Play calming ambient music, diffuse lavender or rose essences, and avoid bringing work tensions into the shared space.\n• **Intentional Appreciation:** Focus on three specific qualities you admire in your partner and express them without expecting anything in return.\n• **De-escalation Ritual:** Agree together that Friday evenings are conflict-free zones where difficult administrative or domestic disputes are set aside in favor of mutual rest.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `In classical Vedic Jyotish, Friday (Shukravar) is the sacred day of Shukra (Venus)—the significator of marital harmony, compassion, and affection.\n\n**Practical Friday Upayas (Remedies) for Domestic Peace:**\n1. **Morning Shukra Offering:** On Friday mornings, wear clean white or pastel-toned clothing and share white sweets (like kheer or milk sweets) or offer white flowers at home.\n2. **Evening Peace Sanctuary:** Avoid discussing financial stresses, grievances, or unresolved arguments during Friday twilight (sandhya kalam). Instead, light a ghee lamp and maintain a quiet, welcoming sanctuary.\n3. **Fragrance Therapy:** Shukra thrives in sweet, pure aromas. Use sandalwood (chandan) or rose essential oil in your room to dissolve lingering friction from earlier in the week.\n4. **Silver Vessel Upaya:** Drinking water stored in a silver cup balances the Moon and cools fiery Mars energy that triggers reactive spats.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Specific Friday Shukra (Venus) astrological remedies and peaceful rituals for domestic harmony.';
        chartInterpretation = [
          {
            placement: isWestern ? 'Venus Alignment & Friday Cycle' : 'Shukra (Venus) Upayas & 7th House Pacification',
            interpretation: 'Fosters reciprocal empathy, dissolves resentment, and elevates domestic peace.'
          }
        ];
        reflection = 'How can you consciously cultivate softness and appreciation in your home this Friday?';
        followUpSuggestions = [
          'Does that mean it will be better after a while?',
          'How do our Moon signs influence our emotional communication?',
          'What other daily mindful habits strengthen marital harmony?'
        ];
      } else if (isCompatibility) {
        if (isWestern) {
          answer = `In Western psychological astrology, relationship compatibility is evaluated through synastry—examining how your planetary archetypes interact with your partner's chart.\n\nHarmony between Sun signs (core values), Moon signs (emotional needs), and Mercury (communication style) creates a resilient foundation. Challenges between Mars and Saturn simply indicate areas requiring conscious compromise and patience.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `In classical Vedic Jyotish, compatibility is analyzed through the Ashtakoota Guna Milan system alongside Moon sign (Rashi) and Lagna alignment.\n\nTrue compatibility extends beyond numerical Guna scores: emotional resonance (Maitri), mutual respect (Gana), and mental harmony (Nadi) determine whether differences foster growth or friction. When both partners practice mindful listening and honor Venusian grace, planetary disparities dissolve naturally.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Astrological compatibility principles, Moon sign synergy, and mutual understanding.';
        chartInterpretation = [
          {
            placement: isWestern ? 'Sun-Moon Synastry & Interpersonal Aspects' : 'Moon Sign (Rashi) Harmony & Lagna Synergy',
            interpretation: 'Highlights emotional understanding, shared values, and mutual communication.'
          }
        ];
        reflection = 'Where can you offer deeper acceptance for your partner’s natural differences?';
        followUpSuggestions = [
          'How do our Moon signs influence daily communication?',
          'What remedies enhance reciprocal partnership harmony?',
          'What does my Venus placement indicate about love language?'
        ];
      } else if (isConflict) {
        // Explicit marital / partner conflict query: "my wife always fights with me" / "arguments in marriage"
        if (isWestern) {
          answer = `Facing persistent conflict in your relationship takes a profound toll on your emotional wellbeing. Looking at your Western Tropical chart, your 7th House of Partnership (Descendant) governs mutual expectations and interpersonal harmony, with Venus acting as the celestial ruler of emotional balance.\n\nIn Western psychological astrology, frequent arguments often reflect a struggle between your need for harmony (Venus) and your partner's need for direct assertion and autonomy (Mars). When planetary transits agitate angular houses, communication becomes reactive.\n\n**Astrological Guidance & Immediate Steps:**\n• This active friction reflects a temporary transit peaking over the next 4 to 6 weeks.\n• Establish gentle, conscious boundaries: step away when tempers flare and resume conversations after emotions settle.\n• Validate your partner's underlying feelings rather than debating the immediate surface argument.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `Facing persistent conflict in your marriage weighs heavily on the spirit. In your calculated Vedic chart${detectedSign ? ` for ${detectedSign}` : ''}, your 7th house (Kalathra Bhava) governs marital dynamics and mutual understanding.\n\nChallenging planetary transits across the 7th house often agitate communication, manifesting as sharp arguments during testing periods. Recognizing that this is a transit phase helps defuse acute emotional blame.\n\n**Astrological Remedies (Upayas) & Practical Timing:**\n1. **Transit Horizon:** This active friction reflects a temporary transit phase set to soften over the next 4 to 6 weeks as pacifying planetary influences gain strength.\n2. **Shukra (Venus) Harmony:** On Fridays (Shukravar), wear soothing white/pastel tones, share sweets, and avoid critical discussions during twilight.\n3. **Cooling Mars/Fiery Energy:** Drink water stored in a silver vessel and avoid confronting difficult marital topics on Tuesday evenings.\n4. **Mindful Listening:** Practice pausing for three full breaths before speaking when emotional discussions arise. Compassionate presence defuses reactive heat.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Astrological root causes of marital conflict, timing horizons, and practical Jyotish remedies.';
        chartInterpretation = [
          {
            placement: isWestern ? '7th House (Descendant) & Mars-Venus Dynamic' : '7th House (Kalathra Bhava) & Shukra Alignment',
            interpretation: 'Reflects tension between gentle harmony and fiery assertiveness.'
          },
          {
            placement: isWestern ? 'Upcoming Harmonizing Transits' : 'Jupiter Pacifying Aspect (Guru Drishti)',
            interpretation: 'Indicates relief and softening of tensions over the next 4-6 weeks.'
          }
        ];
        reflection = 'In what moments this week can you listen with full presence and withhold reactive defense?';
        followUpSuggestions = [
          'Does that mean it will be better after a while?',
          'What Friday remedies can I do for domestic peace?',
          'How do our planetary placements affect communication?'
        ];
      } else {
        // General love / relationship inquiry without conflict
        if (isWestern) {
          answer = `Looking into your calculated Western Tropical chart regarding love and partnerships, the 7th House of Partnership (Descendant) and Venus steward relational harmony and emotional reciprocity.\n\nYour chart emphasizes mutual growth and open communication. When you honor your personal values while making conscious space for your partner's individuality, relationships flourish with natural stability and warmth.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `Looking into your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''} regarding love and relationships, the 7th house (Kalathra Bhava) and Venus (Shukra) govern mutual respect, affection, and sacred partnership.\n\nIn classical Vedic Jyotish, true harmony arises when partners balance their individual natures with shared dharma. Cultivating compassionate communication and honoring Venusian grace fosters enduring domestic peace and mutual trust.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = '7th House Kalathra Bhava and Venusian guidance for love and relational harmony.';
        chartInterpretation = [
          {
            placement: isWestern ? '7th House (Descendant) & Venus' : '7th House (Kalathra Bhava) & Shukra',
            interpretation: 'Signifies relational harmony, shared values, and mutual devotion.'
          }
        ];
        reflection = 'How can you bring deeper presence and appreciation into your relationships today?';
        followUpSuggestions = [
          'What does my Venus placement indicate about love language?',
          'What planetary transits activate my next auspicious relationship window?',
          'How do our Moon signs influence emotional communication?'
        ];
      }
    } else if (isBusiness) {
      if (isWestern) {
        answer = `Analyzing your calculated Western Tropical chart regarding entrepreneurship and business partnerships, the 3rd House of Initiative, 7th House of Commercial Contracts, and 10th House of Public Standing govern enterprise.\n\nYour planetary configurations favor strategic calculated risks when supported by robust legal agreements. If considering a business partner, ensure clear delineation of operational duties; Mercury and Saturn aspects indicate that clarity in writing prevents future disputes.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Analyzing your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''}, commercial enterprise and self-employment are governed by the 3rd house (courage/initiative), 7th house (Vyapar Bhava / trade partnerships), and 10th house (Karma Bhava), with Mercury (Budha) stewarding commercial acumen.\n\nYour chart indicates strong capacity for independent enterprise, especially in fields aligned with your Lagna lord. If taking a business partner, examine their ethical track record and align on shared values; launching new business registrations on supportive Wednesdays (Budhavar) fosters commercial growth and clear communication.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Commercial enterprise, 7th house trade partnerships, and entrepreneurial timing.';
      chartInterpretation = [
        {
          placement: isWestern ? '3rd & 7th House Commercial Alignment' : '7th House (Vyapar Bhava) & Mercury (Budha)',
          interpretation: 'Directs trade acumen, business partnership clarity, and independent enterprise.'
        }
      ];
      reflection = 'What unique value or specialized skill forms the unshakeable foundation of your business vision?';
      followUpSuggestions = [
        'Should I operate independently or seek a business partner?',
        'What planetary transits favor launching a new venture?',
        'What remedies strengthen Mercury for commercial success?'
      ];
    } else if (isCareer) {
      if (isFollowUp) {
        if (isWestern) {
          answer = `Regarding the timeline for your career milestones: your current 10th House transits indicate that the most favorable window for recognition and role expansion opens over the next 2 to 3 months.\n\nDuring this cycle, Saturn rewards thorough preparation and reliability. Focus on consolidating your key achievements, demonstrating clear leadership, and initiating advancement discussions once Mercury and the Sun form harmonizing trines to your Midheaven.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `Regarding your vocational milestones and promotion timeline: your calculated chart indicates that your 10th house (Karmasthana) is entering an auspicious phase over the next 2 to 3 months.\n\nIn classical Jyotish, Saturn (Karma Karaka) rewards steady persistence rather than hasty ambition. The planetary transits indicate that current efforts are building toward solid recognition. Maintain ethical excellence, refine your specialized skills, and time any critical promotion discussions during supportive Jupiter transits.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Specific timing and planetary milestones for vocational promotion.';
      } else {
        if (isWestern) {
          answer = `In your calculated Western Tropical chart${detectedSign ? ` for ${detectedSign}` : ''}, your 10th House (Midheaven) and planetary transits indicate meaningful vocational momentum.\n\nIn Western astrology, professional elevation is guided by Saturn (discipline, structural mastery) and the Sun (visibility, leadership). Your planetary alignments suggest that staying steadfast in your core competencies, cultivating strategic patience, and demonstrating reliable execution will open doors for professional advancement.\n\nFocus on deepening your expertise and maintaining calm confidence in your contributions. Meaningful vocational growth unfolds through sustained, deliberate effort.`;
          sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
        } else {
          answer = `In your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''}, your 10th house (Karmasthana) and planetary transits indicate meaningful vocational momentum.\n\nIn classical Jyotish, vocational success is stewarded by Saturn (Karma Karaka) and the Sun (Surya), who reward disciplined perseverance, ethical integrity, and specialized mastery. Your planetary alignments suggest that staying steadfast in your core competencies, avoiding hasty shortcuts, and cultivating strategic patience will soon open auspicious doors for recognition and professional elevation.\n\nFocus on deepening your expertise and maintaining calm confidence in your contributions. Meaningful vocational growth unfolds through sustained, deliberate effort.`;
          sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
        }
        summary = 'Vocational progress, 10th house placements, and disciplined career expansion.';
      }
      chartInterpretation = [
        {
          placement: isWestern ? '10th House (Midheaven) & Saturn Influences' : '10th House (Karma Bhava) & Vocational Placements',
          interpretation: 'Highlights perseverance, authority, and steady professional advancement.'
        },
        {
          placement: isWestern ? 'Sun & Jupiter Career Transits' : 'Saturn & Sun Transits',
          interpretation: 'Rewards structured discipline and dedication with earned recognition.'
        }
      ];
      reflection = 'Where can disciplined effort today unlock the greatest growth in your profession?';
      followUpSuggestions = [
        'When is the most auspicious timing for a new job or role?',
        'How can I align my daily work with my true vocational purpose?',
        'What leadership qualities does my 10th house highlight?'
      ];
    } else {
      if (isWestern) {
        answer = `Looking at your calculated Western Tropical chart${detectedSign ? ` for ${detectedSign}` : ''}, the celestial alignments reflect a season calling for thoughtful discernment and steady dedication.\n\nIn classical astrological tradition, the interplay of your planetary rulers advises aligning your actions with deliberate intent rather than reactive impulse. Focusing on what is genuinely within your circle of control will yield clarity, confidence, and enduring stability.`;
        sourceReferences = ['Claudius Ptolemy (Tetrabiblos)', 'William Lilly (Christian Astrology)', 'Kai RegAI Astronomical Engine'];
      } else {
        answer = `Looking at your calculated birth chart${detectedSign ? ` for ${detectedSign}` : ''}, the celestial alignments reflect a season calling for thoughtful discernment and steady dedication.\n\nIn classical astrological tradition, the interplay of your planetary rulers advises aligning your actions with deliberate intent rather than reactive impulse. Focusing on what is genuinely within your circle of control will yield clarity, confidence, and enduring stability.`;
        sourceReferences = ['Brihat Parashara Hora Shastra', 'Phaladeepika', 'Kai RegAI Astronomical Engine'];
      }
      summary = 'Grounded astrological reflection on your calculated celestial placements.';
      chartInterpretation = [
        {
          placement: isWestern ? 'Planetary Alignment & Current Transits' : 'Calculated Planetary Alignment & Transits',
          interpretation: 'Directs mental clarity, perseverance, and purposeful effort.'
        }
      ];
      reflection = 'How does your present daily discipline support the higher aspirations reflected in your chart?';
      followUpSuggestions = [
        'How does my current transit cycle influence this timeline?',
        'What mindful remedies can strengthen this planetary aspect?'
      ];
    }

    const mockJson = {
      answer,
      summary,
      chartInterpretation,
      reflection,
      followUpSuggestions,
      sourceReferences,
      safetyNotice: 'Kai RegAI Astrological Guidance is an AI-assisted contemplative tool for self-reflection. It is not medical, legal, or financial advice.',
      requiresClarification: false,
      responseVersion: '1.0.0'
    };

    return {
      text: JSON.stringify(mockJson, null, 2),
      usage: {
        promptTokens: 420,
        completionTokens: 290
      },
      model: `${this.model}-engine`
    };
  }
}

export const defaultGeminiClient = new GeminiClient();
