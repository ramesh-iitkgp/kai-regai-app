/**
 * AstrologerSafetyGate — Foolproof Multi-Layer Ethical, Medical & Non-Fatalistic Compliance Gate
 * 
 * Defense-in-Depth Architecture:
 * 1. Pre-Normalization: Unicode NFKD normalization, leetspeak decoding, repetitive character collapsing,
 *    and punctuation/whitespace stripping to defeat obfuscation jailbreaks (e.g., "su1c1de", "d.e.a.t.h", "k-i-l-l").
 * 2. Deterministic Prohibited Categories:
 *    - Crisis & Self-Harm (Emergency 988 Lifeline referral)
 *    - Death, Mortality & Lifespan Predictions (Strict refusal)
 *    - Deterministic Future Calendar Dates (Refusal of fatalistic timing)
 *    - Medical Diagnoses & Prescription Advice (Healthcare professional referral)
 *    - Gambling, Lottery & Fraudulent Windfalls (Refusal of gambling picks)
 *    - High-Stakes Speculative Investment (Licensed financial advisor referral)
 *    - Malicious Harm, Curses & Illicit Schemes (Strict refusal)
 *    - Adversarial Prompt Jailbreaks & Filter Bypass Attempts (Strict refusal)
 * 3. Output Compliance Inspection: Post-generation scan to intercept any fatalistic leakages.
 */

// Core Regex Classifiers
const CRISIS_PATTERNS = [
  /\b(suicide|suicidal|kill myself|end(ing)? my life|end it all|want to die|self-harm\w*|harm myself|take my own life|better off dead|no reason to live|hang myself|overdose myself|cut my wrists|swallow pills to die|jump off a bridge|aatmahatya|mar jaana)\b/i,
  /\b(feeling suicidal|suicidal thoughts|plan(ning)? to kill myself|ways to die)\b/i
];

const COMPACT_CRISIS_PATTERNS = [
  /suicide|suicidal|killmyself|kilmyself|endmylife|enditall|wanttodie|selfharm|harmmyself|takemyownlife|betteroffdead|noreasontolive|aatmahatya/i
];

const DEATH_LIFESPAN_PATTERNS = [
  /\b(when (will|do) i die|how (will|do) i die|at what age (will|do) i die|will i die|date of death|death date|day of (my )?death|when is my death|cause of death|how do i die|how am i going to die|lifespan prediction|longevity prediction|predict (my )?death|death prediction|how long will i live|how many (years|days|months) do i have left to live|when is my expiration date|am i going to die soon|when will (my|our) (father|mother|spouse|partner|husband|wife|child|baby|parents|son|daughter) die|will (my|our) (father|mother|husband|wife|child) die this year|time of death|mortality date)\b/i
];

const COMPACT_DEATH_PATTERNS = [
  /whenwillidie|howwillidie|dateofdeath|deathdate|dayofdeath|causeofdeath|howlongwillilive|lifespanprediction|deathprediction|predictdeath|predictmydeath|atwhatagewillidie/i
];

const MEDICAL_PATTERNS = [
  /\b(cure|cancer|tumor|disease|diagnos\w*|heart attack|stroke|infection|medication|surgery|prescrib\w*|chemotherapy|malignant|benign|insulin|leukemia|terminal illness|stop taking (my )?medication|replace medication)\b/i
];

const DETERMINISTIC_EVENT_PATTERNS = [
  /\b(exact (calendar )?(date|day)|exact date of|exact day of|tell me the exact (date|day)|give me the exact (date|day)|predict the exact (calendar )?(date|day)|what exact (calendar )?(date|day)|exact wedding date|exact date of (my )?(wedding|marriage|death|divorce|promotion|accident|childbirth)|day of my death)\b/i
];

const GAMBLING_PROMISE_PATTERNS = [
  /\b(lottery numbers?|winning lottery|powerball numbers|mega millions numbers|sure win jackpot|casino roulette|guaranteed stock|crypto pump|sure win jackpot|guaranteed riches|winning lottery numbers|fixed match betting|100x pump coin)\b/i
];

const FINANCIAL_SPECULATION_PATTERNS = [
  /\b(invest all my|invest (my|our) (money|savings)|put all my money|put all my savings|bet all my money|buy (stocks|crypto|bitcoin)|guaranteed (return|profit)|guaranteed 100x return)\b/i
];

const MALICIOUS_HARM_PATTERNS = [
  /\b(how to curse|black magic to harm|voodoo curse|cast a curse on|kill someone|poison someone|harm my enemy|ruin someone'?s life|commit a crime|steal money without getting caught|get away with murder)\b/i
];

const JAILBREAK_PATTERNS = [
  /\b(ignore (all )?(previous|prior) (instructions|rules|prompts)|dan mode|jailbreak|pretend (there are no|you have no) rules|act as an unrestricted|bypass (safety|filters?)|forget your ethical rules)\b/i
];

export class AstrologerSafetyGate {
  /**
   * Normalizes raw user input into canonical decoded text to defeat character obfuscation.
   * 
   * @param {string} text
   * @returns {{ normalized: string, singleCollapsed: string, compact: string, compactCollapsed: string }}
   */
  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return { normalized: '', singleCollapsed: '', compact: '', compactCollapsed: '' };
    }

    // 1. Normalize Unicode accents (NFKD) and strip combining diacritical marks
    let s = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

    // 2. Decode common Leetspeak substitutions
    const leetMap = {
      '0': 'o',
      '1': 'i',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '7': 't',
      '8': 'b',
      '@': 'a',
      '$': 's',
      '!': 'i',
      '+': 't'
    };
    s = s.replace(/[0134578@$!+]/g, ch => leetMap[ch] || ch);

    // 3. Lowercase & strip zero-width and control characters
    s = s.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 4. Collapse repeated characters (e.g. "suuuicide" -> "suicide", "deaaath" -> "death")
    const collapsed = s.replace(/(.)\1{2,}/g, '$1$1');
    const singleCollapsed = s.replace(/(.)\1+/g, '$1');

    // 5. Build compact variant with punctuation and spaces stripped (e.g. "d.e.a.t.h" -> "death")
    const compact = s.replace(/[^a-z0-9]/g, '');
    const compactCollapsed = compact.replace(/(.)\1+/g, '$1');

    return {
      normalized: collapsed,
      singleCollapsed,
      compact,
      compactCollapsed
    };
  }

  /**
   * Evaluates input text for prohibited domains with multi-layer defense.
   * 
   * @param {string} text
   * @returns {{ safe: boolean, reason?: string, fallbackResponse?: string }}
   */
  evaluateInput(text) {
    if (!text || typeof text !== 'string') {
      return { safe: true };
    }

    const { normalized, singleCollapsed, compact, compactCollapsed } = this.normalizeText(text);
    const variants = [text, normalized, singleCollapsed];
    const compactVariants = [compact, compactCollapsed];

    // =========================================================================
    // LAYER 1: Crisis, Self-Harm & Suicide Prevention
    // =========================================================================
    for (const v of variants) {
      for (const pat of CRISIS_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'CRISIS_SUPPORT_TRIGGERED',
            fallbackResponse: 'If you are experiencing distress, please reach out for compassionate support. You can call or text the Suicide & Crisis Lifeline at 988 (US/Canada) or contact your local emergency support services immediately. Astrological reflection is not a substitute for professional mental health support.'
          };
        }
      }
    }
    for (const cv of compactVariants) {
      for (const pat of COMPACT_CRISIS_PATTERNS) {
        if (pat.test(cv)) {
          return {
            safe: false,
            reason: 'CRISIS_SUPPORT_TRIGGERED',
            fallbackResponse: 'If you are experiencing distress, please reach out for compassionate support. You can call or text the Suicide & Crisis Lifeline at 988 (US/Canada) or contact your local emergency support services immediately. Astrological reflection is not a substitute for professional mental health support.'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 2: Adversarial Jailbreak & Safety Override Attempts
    // =========================================================================
    for (const v of variants) {
      for (const pat of JAILBREAK_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'JAILBREAK_ATTEMPT_RESTRICTION',
            fallbackResponse: 'Kai RegAI operates with strict ethical and non-fatalistic guidelines. I cannot bypass safety boundaries or adopt unrestricted roleplay personas. How can I assist you with reflective astrological inquiry?'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 3: Malicious Intent, Harm, Curses & Illegal Acts
    // =========================================================================
    for (const v of variants) {
      for (const pat of MALICIOUS_HARM_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'MALICIOUS_AND_HARM_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not support casting curses, causing harm to others, or facilitating illegal activities. Astrological traditions emphasize personal virtue, compassion, and dharma.'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 4: Death, Lifespan & Fatalistic Mortality Predictions
    // =========================================================================
    for (const v of variants) {
      for (const pat of DEATH_LIFESPAN_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'MEDICAL_AND_LIFESPAN_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not provide medical diagnoses, treatment advice, or predictions regarding lifespan and death. Astrology is a contemplative lens for self-reflection and character study. Please consult a qualified healthcare professional for medical concerns.'
          };
        }
      }
    }
    for (const cv of compactVariants) {
      for (const pat of COMPACT_DEATH_PATTERNS) {
        if (pat.test(cv)) {
          return {
            safe: false,
            reason: 'MEDICAL_AND_LIFESPAN_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not provide medical diagnoses, treatment advice, or predictions regarding lifespan and death. Astrology is a contemplative lens for self-reflection and character study. Please consult a qualified healthcare professional for medical concerns.'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 5: Medical Diagnoses, Illnesses & Prescriptions
    // =========================================================================
    for (const v of variants) {
      for (const pat of MEDICAL_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'MEDICAL_AND_LIFESPAN_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not provide medical diagnoses, treatment advice, or predictions regarding lifespan and death. Astrology is a contemplative lens for self-reflection and character study. Please consult a qualified healthcare professional for medical concerns.'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 6: Deterministic Future Calendar Dates
    // =========================================================================
    for (const v of variants) {
      for (const pat of DETERMINISTIC_EVENT_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'DETERMINISTIC_FUTURE_EVENT_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not provide deterministic predictions of exact future dates (such as wedding dates or lifespan events). Astrological principles offer archetypal themes for mindfulness and personal timing, not fatalistic fortune-telling. Life unfolds through your own mindful choices and discernment.'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 7: Gambling, Lottery & Get-Rich-Quick Claims
    // =========================================================================
    for (const v of variants) {
      for (const pat of GAMBLING_PROMISE_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'GAMBLING_PROMISE_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not provide deterministic financial gambling predictions or lottery picks. Astrological transits reflect general archetypal themes of focus and prudence, not guaranteed monetary windfalls.'
          };
        }
      }
    }

    // =========================================================================
    // LAYER 8: High-Stakes Financial Speculation
    // =========================================================================
    for (const v of variants) {
      for (const pat of FINANCIAL_SPECULATION_PATTERNS) {
        if (pat.test(v)) {
          return {
            safe: false,
            reason: 'FINANCIAL_SPECULATION_RESTRICTION',
            fallbackResponse: 'Kai RegAI does not provide financial investment instructions or speculative monetary advice. Astrological insights describe seasons of prudence and dedication, not portfolio management. Please consult a licensed financial advisor for investment decisions.'
          };
        }
      }
    }

    return { safe: true };
  }

  /**
   * Validates AI output against fatalistic fear-mongering and policy violations.
   * 
   * @param {string} text
   * @returns {boolean}
   */
  isOutputCompliant(text) {
    if (!text || typeof text !== 'string') return true;
    const lower = text.toLowerCase();
    const forbidden = [
      'you will die on',
      'exact date of your death',
      'fatal curse',
      'incurable doom',
      'guaranteed lottery win',
      'winning lottery numbers are',
      'will cure your cancer',
      'stop taking your prescribed medicine',
      'lifespan will end at age',
      'death scheduled for'
    ];
    return !forbidden.some(f => lower.includes(f));
  }
}

export const defaultSafetyGate = new AstrologerSafetyGate();
