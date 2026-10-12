/**
 * DailyForecastService — Deterministic Vedic Daily Forecast & Cosmic Transit Engine
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-HOM-001) & Hasta Samudrika Knowledge
 */

import { i18n } from './i18n.js';
import { gregorianToJulianDate } from '../astronomy/time/JulianDate.js';
import { calculateAllPlanetaryPositions } from '../astronomy/planetaryPositions/PlanetaryCalculator.js';
import { calculateAyanamsa, tropicalToSidereal } from '../astrology/vedic/Ayanamsa.js';
import { calculateNakshatra } from '../astrology/nakshatra/NakshatraCalculator.js';
import { getSignPlacement } from '../astrology/common/ZodiacSigns.js';

export const VEDIC_RASHIS = [
  {
    key: 'Mesha',
    western: 'Aries',
    symbol: '♈',
    names: { en: 'Mesha (Aries)', ta: 'மேஷம்', hi: 'मेष', te: 'మేషం', kn: 'ಮೇಷ', ml: 'മേടം' },
    graha: { en: 'Mangala (Mars)', ta: 'செவ்வாய் பகவான்', hi: 'मंगल देव', te: 'కుజ భగవానుడు', kn: 'ಮಂಗಳ ದೇವ', ml: 'ചൊവ്വ' },
    tattva: { en: 'Agni (Fire)', ta: 'நெருப்பு தத்துவம்', hi: 'अग्नि तत्व', te: 'అగ్ని తత్త్వం', kn: 'ಅಗ್ನಿ ತತ್ತ್ವ', ml: 'അഗ്നി തത്ത്വം' },
    mount: { en: 'Lower Mount of Mars', ta: 'கீழ் செவ்வாய் மேடு', hi: 'निम्न मंगल पर्वत', te: 'దిగువ కుజ పర్వతం', kn: 'ಕೆಳ ಮಂಗಳ ಪರ್ವತ', ml: 'താഴത്തെ ചൊവ്വ പർവ്വതം' },
    lineFocus: { en: 'Life & Head Line Origin', ta: 'ஆயுள் & புத்தி ரேகை தொடக்கம்', hi: 'जीवन व मस्तिष्क रेखा मूल', te: 'జీవిత & బుద్ధి రేఖ ప్రారంభం', kn: 'ಜೀವನ ಮತ್ತು ಮಸ್ತಿಷ್ಕ ರೇಖೆಯ ಮೂಲ', ml: 'ആയുസ്സ് & ബുദ്ധി രേഖയുടെ തുടക്കം' },
    baseMetrics: { love: 82, energy: 95, luck: 84, mind: 88 }
  },
  {
    key: 'Vrishabha',
    western: 'Taurus',
    symbol: '♉',
    names: { en: 'Vrishabha (Taurus)', ta: 'ரிஷபம்', hi: 'वृषभ', te: 'వృషభం', kn: 'ವೃಷಭ', ml: 'ഇടവം' },
    graha: { en: 'Shukra (Venus)', ta: 'சுக்கிர பகவான்', hi: 'शुक्र देव', te: 'శుక్ర భగవానుడు', kn: 'ಶುಕ್ರ ದೇವ', ml: 'ശുക്രൻ' },
    tattva: { en: 'Prithvi (Earth)', ta: 'நிலம் தத்துவம்', hi: 'पृथ्वी तत्व', te: 'భూమి తత్త్వం', kn: 'ಭೂಮಿ ತತ್ತ್ವ', ml: 'ഭൂമി തത്ത്വം' },
    mount: { en: 'Mount of Venus', ta: 'சுக்கிர மேடு', hi: 'शुक्र पर्वत', te: 'శుక్ర పర్వతం', kn: 'ಶುಕ್ರ ಪರ್ವತ', ml: 'ശുക്ര പർവ്വതം' },
    lineFocus: { en: 'Heart Line & Girdle of Venus', ta: 'இருதய ரேகை மற்றும் சுக்கிர வளையம்', hi: 'हृदय रेखा व शुक्र मेखला', te: 'హృదయ రేఖ & శుక్ర వలయం', kn: 'ಹೃದಯ ರೇಖೆ ಮತ್ತು ಶುಕ್ರ ವಲಯ', ml: 'ഹൃദയ രേഖ' },
    baseMetrics: { love: 96, energy: 84, luck: 89, mind: 86 }
  },
  {
    key: 'Mithuna',
    western: 'Gemini',
    symbol: '♊',
    names: { en: 'Mithuna (Gemini)', ta: 'மிதுனம்', hi: 'मिथुन', te: 'మిథునం', kn: 'ಮಿಥುನ', ml: 'മിഥുനം' },
    graha: { en: 'Budha (Mercury)', ta: 'புதன் பகவான்', hi: 'बुध देव', te: 'బుధ భగవానుడు', kn: 'ಬುಧ ದೇವ', ml: 'ബുധൻ' },
    tattva: { en: 'Vayu (Air)', ta: 'காற்று தத்துவம்', hi: 'वायु तत्व', te: 'వాయు తత్త్వం', kn: 'ವಾಯು ತತ್ತ್ವ', ml: 'വായു തത്ത്വം' },
    mount: { en: 'Mount of Mercury', ta: 'புதன் மேடு', hi: 'बुध पर्वत', te: 'బుధ పర్వతం', kn: 'ಬುಧ ಪರ್ವತ', ml: 'ബുധ പർവ്വതം' },
    lineFocus: { en: 'Head Line & Health Line', ta: 'புத்தி ரேகை மற்றும் புதன் ரேகை', hi: 'मस्तिष्क रेखा व स्वास्थ्य रेखा', te: 'బుద్ధి రేఖ & ఆరోగ్య రేఖ', kn: 'ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'ബുദ്ധി രേഖ' },
    baseMetrics: { love: 86, energy: 90, luck: 85, mind: 96 }
  },
  {
    key: 'Karka',
    western: 'Cancer',
    symbol: '♋',
    names: { en: 'Karka (Cancer)', ta: 'கடகம்', hi: 'कर्क', te: 'కర్కాటకం', kn: 'ಕರ್ಕಾಟಕ', ml: 'കർക്കിടകം' },
    graha: { en: 'Chandra (Moon)', ta: 'சந்திர பகவான்', hi: 'चंद्र देव', te: 'చంద్ర భగవానుడు', kn: 'ಚಂದ್ರ ದೇವ', ml: 'ചന്ദ്രൻ' },
    tattva: { en: 'Jala (Water)', ta: 'நீர் தத்துவம்', hi: 'जल तत्व', te: 'జల తత్త్వం', kn: 'ಜಲ ತತ್ತ್ವ', ml: 'ജല തത്ത്വം' },
    mount: { en: 'Mount of Moon', ta: 'சந்திர மேடு', hi: 'चंद्र पर्वत', te: 'చంద్ర పర్వతం', kn: 'ಚಂದ್ರ ಪರ್ವತ', ml: 'ചന്ദ്ര പർവ്വതം' },
    lineFocus: { en: 'Intuition Line & Head Line Curve', ta: 'உள்ளுணர்வு ரேகை மற்றும் சாய்வு புத்தி ரேகை', hi: 'सहजज्ञान रेखा व वक्र मस्तिष्क रेखा', te: 'అంతర్ దృష్టి రేఖ', kn: 'ಅಂತಃಪ್ರಜ್ಞೆ ರೇಖೆ', ml: 'അന്തർജ്ഞാന രേഖ' },
    baseMetrics: { love: 92, energy: 81, luck: 88, mind: 94 }
  },
  {
    key: 'Simha',
    western: 'Leo',
    symbol: '♌',
    names: { en: 'Simha (Leo)', ta: 'சிம்மம்', hi: 'सिंह', te: 'సింహం', kn: 'ಸಿಂಹ', ml: 'ചിങ്ങം' },
    graha: { en: 'Surya (Sun)', ta: 'சூரிய பகவான்', hi: 'सूर्य देव', te: 'సూర్య భగవానుడు', kn: 'ಸೂರ್ಯ ದೇವ', ml: 'സൂര്യൻ' },
    tattva: { en: 'Agni (Fire)', ta: 'நெருப்பு தத்துவம்', hi: 'अग्नि तत्व', te: 'అగ్ని తత్త్వం', kn: 'ಅಗ್ನಿ ತತ್ತ್ವ', ml: 'അഗ്നി തത്ത്വം' },
    mount: { en: 'Mount of Sun (Apollo)', ta: 'சூரிய மேடு', hi: 'सूर्य पर्वत', te: 'సూర్య పర్వతం', kn: 'ಸೂರ್ಯ ಪರ್ವತ', ml: 'സൂര്യ പർവ്വതം' },
    lineFocus: { en: 'Sun Line (Apollo Line)', ta: 'சூரிய ரேகை (கீர்த்தி ரேகை)', hi: 'सूर्य रेखा', te: 'సూర్య రేఖ', kn: 'ಸೂರ್ಯ ರೇಖೆ', ml: 'സൂര്യ രേഖ' },
    baseMetrics: { love: 89, energy: 97, luck: 93, mind: 90 }
  },
  {
    key: 'Kanya',
    western: 'Virgo',
    symbol: '♍',
    names: { en: 'Kanya (Virgo)', ta: 'கன்னி', hi: 'कन्या', te: 'కన్య', kn: 'ಕನ್ಯಾ', ml: 'കന്നി' },
    graha: { en: 'Budha (Mercury)', ta: 'புதன் பகவான்', hi: 'बुध देव', te: 'బుధ భగవానుడు', kn: 'ಬುಧ ದೇವ', ml: 'ബുധൻ' },
    tattva: { en: 'Prithvi (Earth)', ta: 'நிலம் தத்துவம்', hi: 'पृथ्वी तत्व', te: 'భూమి తత్త్వం', kn: 'ಭೂಮಿ ತತ್ತ್ವ', ml: 'ഭൂമി തത്ത്വം' },
    mount: { en: 'Mount of Mercury & Upper Mars', ta: 'புதன் & மேல் செவ்வாய் மேடு', hi: 'बुध व उच्च मंगल पर्वत', te: 'బుధ & ఎగువ కుజ పర్వతం', kn: 'ಬುಧ ಮತ್ತು ಮಂಗಳ ಪರ್ವತ', ml: 'ബുധ പർവ്വതം' },
    lineFocus: { en: 'Straight Head Line & Fine Mercury Lines', ta: 'நேரான புத்தி ரேகை', hi: 'सरल मस्तिष्क रेखा', te: 'సరళ బుద్ధి రేఖ', kn: 'ನೇರ ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'നേരായ ബുദ്ധി രേഖ' },
    baseMetrics: { love: 84, energy: 88, luck: 86, mind: 95 }
  },
  {
    key: 'Tula',
    western: 'Libra',
    symbol: '♎',
    names: { en: 'Tula (Libra)', ta: 'துலாம்', hi: 'तुला', te: 'తులా', kn: 'ತುಲಾ', ml: 'തുലാം' },
    graha: { en: 'Shukra (Venus)', ta: 'சுக்கிர பகவான்', hi: 'शुक्र देव', te: 'శుక్ర భగవానుడు', kn: 'ಶುಕ್ರ ದೇವ', ml: 'ശുക്രൻ' },
    tattva: { en: 'Vayu (Air)', ta: 'காற்று தத்துவம்', hi: 'वायु तत्व', te: 'వాయు తత్త్వం', kn: 'ವಾಯು ತತ್ತ್ವ', ml: 'വായു തത്ത്വം' },
    mount: { en: 'Mount of Venus & Sun', ta: 'சுக்கிர மற்றும் சூரிய மேடு', hi: 'शुक्र व सूर्य पर्वत', te: 'శుక్ర & సూర్య పర్వతం', kn: 'ಶುಕ್ರ ಮತ್ತು ಸೂರ್ಯ ಪರ್ವತ', ml: 'ശുക്ര & സൂര്യ പർവ്വതം' },
    lineFocus: { en: 'Heart Line & Sun Branch', ta: 'இருதய ரேகை மற்றும் சூரிய கிளை', hi: 'हृदय रेखा व सूर्य शाखा', te: 'హృదయ రేఖ & సూర్య శాఖ', kn: 'ಹೃದಯ ರೇಖೆ', ml: 'ഹൃദയ രേഖ' },
    baseMetrics: { love: 95, energy: 85, luck: 91, mind: 90 }
  },
  {
    key: 'Vrishchika',
    western: 'Scorpio',
    symbol: '♏',
    names: { en: 'Vrishchika (Scorpio)', ta: 'விருச்சிகம்', hi: 'वृश्चिक', te: 'వృశ్చికం', kn: 'ವೃಶ್ಚಿಕ', ml: 'വൃശ്ചികം' },
    graha: { en: 'Mangala / Ketu', ta: 'செவ்வாய் / கேது', hi: 'मंगल / केतु', te: 'కుజుడు / కేతువు', kn: 'ಮಂಗಳ / ಕೇತು', ml: 'ചൊവ്വ / കേതു' },
    tattva: { en: 'Jala (Water)', ta: 'நீர் தத்துவம்', hi: 'जल तत्व', te: 'జల తత్త్వం', kn: 'ಜಲ ತತ್ತ್ವ', ml: 'ജല തത്ത്വം' },
    mount: { en: 'Upper Mount of Mars & Moon', ta: 'மேல் செவ்வாய் மற்றும் சந்திர மேடு', hi: 'उच्च मंगल व चंद्र पर्वत', te: 'ఎగువ కుజ & చంద్ర పర్వతం', kn: 'ಮೇಲಿನ ಮಂಗಳ ಮತ್ತು ಚಂದ್ರ ಪರ್ವತ', ml: 'മേൽ ചൊവ്വ പർവ്വതം' },
    lineFocus: { en: 'Deep Head Line & Resilience Marks', ta: 'ஆழமான புத்தி ரேகை', hi: 'गहरी मस्तिष्क रेखा', te: 'గాఢ బుద్ధి రేఖ', kn: 'ಗಾಢ ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'ആഴമേറിയ ബുദ്ധി രേഖ' },
    baseMetrics: { love: 91, energy: 94, luck: 87, mind: 93 }
  },
  {
    key: 'Dhanu',
    western: 'Sagittarius',
    symbol: '♐',
    names: { en: 'Dhanu (Sagittarius)', ta: 'தனுசு', hi: 'धनु', te: 'ధనుస్సు', kn: 'ಧನು', ml: 'ധനു' },
    graha: { en: 'Guru (Jupiter)', ta: 'குரு பகவான்', hi: 'गुरु (बृहस्पति)', te: 'గురు భగవానుడు', kn: 'ಗುರು ದೇವ', ml: 'ഗുരു' },
    tattva: { en: 'Agni (Fire)', ta: 'நெருப்பு தத்துவம்', hi: 'अग्नि तत्व', te: 'అగ్ని తత్త్వం', kn: 'ಅಗ್ನಿ ತತ್ತ್ವ', ml: 'അഗ്നി തത്ത്വം' },
    mount: { en: 'Mount of Jupiter', ta: 'குரு மேடு', hi: 'गुरु पर्वत', te: 'గురు పర్వతం', kn: 'ಗುರು ಪರ್ವತ', ml: 'ഗുരു പർവ്വതം' },
    lineFocus: { en: 'Upward Branches into Jupiter Mount', ta: 'குரு மேட்டை நோக்கிய மேல்நோக்கு கிளைகள்', hi: 'गुरु पर्वत की ओर उर्ध्वगामी शाखाएं', te: 'గురు పర్వతం వైపు శాఖలు', kn: 'ಗುರು ಪರ್ವತದ ಮೇಲ್ಮುಖ ಶಾಖೆಗಳು', ml: 'ഗുരു പർവ്വത ശാഖകൾ' },
    baseMetrics: { love: 88, energy: 93, luck: 96, mind: 91 }
  },
  {
    key: 'Makara',
    western: 'Capricorn',
    symbol: '♑',
    names: { en: 'Makara (Capricorn)', ta: 'மகரம்', hi: 'मकर', te: 'మకరం', kn: 'ಮಕರ', ml: 'മകരം' },
    graha: { en: 'Shani (Saturn)', ta: 'சனி பகவான்', hi: 'शनि देव', te: 'శని భగవానుడు', kn: 'ಶನಿ ದೇವ', ml: 'ശനി' },
    tattva: { en: 'Prithvi (Earth)', ta: 'நிலம் தத்துவம்', hi: 'पृथ्वी तत्व', te: 'భూమి తత్త్వం', kn: 'ಭೂಮಿ ತತ್ತ್ವ', ml: 'ഭൂമി തത്ത്വം' },
    mount: { en: 'Mount of Saturn', ta: 'சனி மேடு', hi: 'शनि पर्वत', te: 'శని పర్వతం', kn: 'ಶನಿ ಪರ್ವತ', ml: 'ശനി പർവ്വതം' },
    lineFocus: { en: 'Fate Line (Saturn Line)', ta: 'விதி ரேகை (சனி ரேகை)', hi: 'भाग्य रेखा (शनि रेखा)', te: 'భాగ్య రేఖ (శని రేఖ)', kn: 'ಭಾಗ್ಯ ರೇಖೆ (ಶನಿ ರೇಖೆ)', ml: 'ഭാഗ്യ രേഖ (ശനി രേഖ)' },
    baseMetrics: { love: 85, energy: 91, luck: 89, mind: 94 }
  },
  {
    key: 'Kumbha',
    western: 'Aquarius',
    symbol: '♒',
    names: { en: 'Kumbha (Aquarius)', ta: 'கும்பம்', hi: 'कुम्भ', te: 'కుంభం', kn: 'ಕುಂಭ', ml: 'കുംഭം' },
    graha: { en: 'Shani / Rahu', ta: 'சனி / ராகு', hi: 'शनि / राहु', te: 'శని / రాహువు', kn: 'ಶನಿ / ರಾಹು', ml: 'ശനി / രാഹു' },
    tattva: { en: 'Vayu (Air)', ta: 'காற்று தத்துவம்', hi: 'वायु तत्व', te: 'వాయు తత్త్వం', kn: 'ವಾಯು ತತ್ತ್ವ', ml: 'വായു തത്ത്വം' },
    mount: { en: 'Mount of Saturn & Mercury', ta: 'சனி மற்றும் புதன் மேடு', hi: 'शनि व बुध पर्वत', te: 'శని & బుధ పర్వతం', kn: 'ಶನಿ ಮತ್ತು ಬುಧ ಪರ್ವತ', ml: 'ശനി & ബുധ പർവ്വതം' },
    lineFocus: { en: 'Long Head Line & Intuitive Fork', ta: 'நீண்ட புத்தி ரேகை மற்றும் உள்ளுணர்வு கிளை', hi: 'लंबी मस्तिष्क रेखा', te: 'పొడవైన బుద్ధి రేఖ', kn: 'ಉದ್ದವಾದ ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'ദീർഘ ബുദ്ധി രേഖ' },
    baseMetrics: { love: 87, energy: 92, luck: 91, mind: 97 }
  },
  {
    key: 'Meena',
    western: 'Pisces',
    symbol: '♓',
    names: { en: 'Meena (Pisces)', ta: 'மீனம்', hi: 'मीन', te: 'మీనం', kn: 'ಮೀನ', ml: 'മീനം' },
    graha: { en: 'Guru (Jupiter)', ta: 'குரு பகவான்', hi: 'गुरु (बृहस्पति)', te: 'గురు భగవానుడు', kn: 'ಗುರು ದೇವ', ml: 'ഗുരു' },
    tattva: { en: 'Jala (Water)', ta: 'நீர் தத்துவம்', hi: 'जल तत्व', te: 'జల తత్త్వం', kn: 'ಜಲ ತತ್ತ್ವ', ml: 'ജല തത്ത്വം' },
    mount: { en: 'Mount of Jupiter & Moon', ta: 'குரு மற்றும் சந்திர மேடு', hi: 'गुरु व चंद्र पर्वत', te: 'గురు & చంద్ర పర్వతం', kn: 'ಗುರು ಮತ್ತು ಚಂದ್ರ ಪರ್ವತ', ml: 'ഗുരു & ചന്ദ്ര പർവ്വതം' },
    lineFocus: { en: 'Solomon Ring & Gentle Curved Heart Line', ta: 'சாலமன் வளையம் மற்றும் வளைந்த இருதய ரேகை', hi: 'सुलेमान वलय व वक्र हृदय रेखा', te: 'సాల్మన్ వలయం', kn: 'ಸಾಲಮನ್ ವಲಯ', ml: 'സോളമൻ വളയം' },
    baseMetrics: { love: 94, energy: 83, luck: 92, mind: 95 }
  }
];

export class DailyForecastService {
  /**
   * Deterministic day seed so calculations remain consistent throughout any 24h cycle
   */
  _getDaySeed(date = new Date()) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return (y * 10000) + (m * 100) + d;
  }

  /**
   * Simple deterministic pseudo-random offset within a range
   */
  _seededOffset(seed, salt, min = -5, max = 5) {
    const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
    const rnd = x - Math.floor(x);
    return Math.floor(min + rnd * (max - min + 1));
  }

  /**
   * Find Rashi definition by key or western name
   */
  getRashi(rashiKeyOrWestern) {
    if (!rashiKeyOrWestern) return VEDIC_RASHIS[9]; // default Makara (Capricorn)
    const normalized = String(rashiKeyOrWestern).trim().toLowerCase();
    return VEDIC_RASHIS.find(r => 
      r.key.toLowerCase() === normalized || 
      r.western.toLowerCase() === normalized
    ) || VEDIC_RASHIS[9];
  }

  /**
   * Computes standard Vedic Rahu Kalam window for any given date
   */
  getRahuKalam(date = new Date()) {
    const day = date.getDay(); // 0 = Sun, 1 = Mon ...
    const rahuWindows = [
      '16:30 - 18:00', // Sun
      '07:30 - 09:00', // Mon
      '15:00 - 16:30', // Tue
      '12:00 - 13:30', // Wed
      '13:30 - 15:00', // Thu
      '10:30 - 12:00', // Fri
      '09:00 - 10:30'  // Sat
    ];
    return rahuWindows[day] || '12:00 - 13:30';
  }

  /**
   * Computes the complete daily forecast for a given Rashi and date
   */
  getForecastForToday(rashiKeyOrWestern, date = new Date(), lang = i18n.getLanguage()) {
    const rashi = this.getRashi(rashiKeyOrWestern);
    const daySeed = this._getDaySeed(date);

    // Compute deterministic daily metrics bounded between 70% and 99%
    const loveOffset = this._seededOffset(daySeed, 101, -4, 4);
    const energyOffset = this._seededOffset(daySeed, 202, -5, 4);
    const luckOffset = this._seededOffset(daySeed, 303, -4, 5);
    const mindOffset = this._seededOffset(daySeed, 404, -3, 4);

    const clamp = (val) => Math.max(70, Math.min(99, val));
    const metrics = {
      love: clamp(rashi.baseMetrics.love + loveOffset),
      energy: clamp(rashi.baseMetrics.energy + energyOffset),
      luck: clamp(rashi.baseMetrics.luck + luckOffset),
      mind: clamp(rashi.baseMetrics.mind + mindOffset)
    };

    // Formatted date string
    const dateFormatted = date.toLocaleDateString(lang === 'en' ? 'en-US' : `${lang}-IN`, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Real Astronomical Ephemeris Calculation for Today
    let nakshatraData = null;
    let planetaryTransit = null;
    try {
      const jd = gregorianToJulianDate(date.getFullYear(), date.getMonth() + 1, date.getDate(), 12, 0, 0);
      const ayanamsa = calculateAyanamsa(jd, 'LAHIRI_CHITRAPAKSHA');
      const bodies = calculateAllPlanetaryPositions(jd);
      
      // Real Moon Nakshatra
      if (bodies.moon) {
        const moonSid = tropicalToSidereal(bodies.moon.apparentLongitude, ayanamsa);
        const nakCalc = calculateNakshatra(moonSid);
        nakshatraData = {
          name: nakCalc.nakshatraName,
          pada: nakCalc.pada,
          ruler: nakCalc.ruler,
          deity: nakCalc.deity
        };
      }

      // Real Jupiter Transit House relative to user sign
      if (bodies.jupiter) {
        const jupSid = tropicalToSidereal(bodies.jupiter.apparentLongitude, ayanamsa);
        const jupSign = getSignPlacement(jupSid, 'VEDIC');
        const userSignIndex = VEDIC_RASHIS.findIndex(r => r.key.toLowerCase() === rashi.key.toLowerCase());
        const houseIndex = ((jupSign.signIndex - userSignIndex + 12) % 12) + 1;
        const houseDomains = [
          'Vitality & Self', 'Wealth & Family', 'Courage & Initiative', 'Inner Peace & Foundation',
          'Creativity & Intellect', 'Resilience & Service', 'Partnerships & Alliances', 'Deep Transformation',
          'Fortune & Dharma', 'Career & Karma', 'Gains & Networks', 'Higher Reflection'
        ];
        planetaryTransit = {
          planet: 'Guru (Jupiter)',
          house: houseIndex,
          domain: houseDomains[houseIndex - 1],
          sign: jupSign.signName,
          degree: Number(jupSign.degreeInSign.toFixed(1))
        };
      }
    } catch {
      // Graceful fallback if astronomy engine is unavailable
    }

    // Auspicious highlights
    const colors = [
      { en: 'Sacred Gold', ta: 'தங்க மஞ்சள்', hi: 'स्वर्ण पीत', te: 'స్వర్ణ పసుపు', kn: 'ಚಿನ್ನದ ಹಳದಿ', ml: 'സ്വർണ്ണ മഞ്ഞ' },
      { en: 'Deep Saffron', ta: 'காவி நிறம்', hi: 'गहरा भगवा', te: 'కాషాయం', kn: 'ಕೇಸರಿ', ml: 'കാവി' },
      { en: 'Pearl White', ta: 'முத்து வெள்ளை', hi: 'मोती श्वेत', te: 'ముత్యపు తెలుపు', kn: 'ಮುತ್ತಿನ ಬಿಳಿ', ml: 'മുത്ത് വെള്ള' },
      { en: 'Royal Indigo', ta: 'நீல வண்ணம்', hi: 'शाही गहरा नीला', te: 'నీలి రంగు', kn: 'ರಾಯಲ್ ನೀಲಿ', ml: 'ഇൻഡിഗോ' }
    ];
    const colorIndex = Math.abs(this._seededOffset(daySeed, 505, 0, colors.length - 1));
    const auspiciousColor = colors[colorIndex][lang] || colors[colorIndex].en;

    const muhurtas = [
      { en: 'Brahma Muhurta (04:48 - 05:36 AM)', ta: 'பிரம்ம முகூர்த்தம் (காலை 04:48 - 05:36)', hi: 'ब्रह्म मुहूर्त (04:48 - 05:36 प्रात:)', te: 'బ్రాహ్మీ ముహూర్తం (ఉదయం 04:48 - 05:36)', kn: 'ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ (04:48 - 05:36)', ml: 'ബ്രഹ്മമുഹൂർത്തം (04:48 - 05:36)' },
      { en: 'Abhijit Muhurta (11:45 - 12:35 PM)', ta: 'அபிஜித் முகூர்த்தம் (நண்பகல் 11:45 - 12:35)', hi: 'अभिजित मुहूर्त (11:45 - 12:35 दोपहर)', te: 'అభిజిత్ ముహూర్తం (11:45 - 12:35)', kn: 'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ (11:45 - 12:35)', ml: 'അഭിജിത്ത് മുഹൂർത്തം (11:45 - 12:35)' },
      { en: 'Godhuli Sandhya (06:15 - 06:45 PM)', ta: 'கோதூளி சந்தியா (மாலை 06:15 - 06:45)', hi: 'गोधूलि संध्या (06:15 - 06:45 सायं)', te: 'గోధూళి సంధ్య (సాయంత్రం 06:15 - 06:45)', kn: 'ಗೋಧೂಳಿ ಸಂಜೆ (06:15 - 06:45)', ml: 'സന്ധ്യാ സമയം (06:15 - 06:45)' }
    ];
    const muhurtaIndex = Math.abs(this._seededOffset(daySeed, 606, 0, muhurtas.length - 1));
    const auspiciousMuhurta = muhurtas[muhurtaIndex][lang] || muhurtas[muhurtaIndex].en;
    const rahuKalam = this.getRahuKalam(date);

    // Multilingual Daily Reflection & Palm Mount Interpretation
    const reflections = this._buildReflection(rashi, metrics, lang, planetaryTransit);

    return {
      rashiKey: rashi.key,
      symbol: rashi.symbol,
      westernName: rashi.western,
      localizedName: rashi.names[lang] || rashi.names.en,
      graha: rashi.graha[lang] || rashi.graha.en,
      tattva: rashi.tattva[lang] || rashi.tattva.en,
      palmMount: rashi.mount[lang] || rashi.mount.en,
      palmLineFocus: rashi.lineFocus[lang] || rashi.lineFocus.en,
      dateFormatted,
      metrics,
      auspiciousColor,
      auspiciousMuhurta,
      rahuKalam,
      nakshatra: nakshatraData,
      planetaryTransit,
      reflection: reflections.cosmic,
      palmCorrelate: reflections.palmCorrelate
    };
  }

  _buildReflection(rashi, metrics, lang) {
    if (lang === 'ta') {
      return {
        cosmic: `${rashi.graha.ta} ஆதிக்கத்தால் இன்று உங்கள் மன உறுதியும் செயல் திறனும் உயர்ந்து காணப்படுகிறது. ${rashi.tattva.ta} வழிநடத்தும் தன்னம்பிக்கை புதிய வாய்ப்புகளை ஈர்க்கும்.`,
        palmCorrelate: `இன்றைய கிரக சஞ்சாரம் உங்கள் ${rashi.mount.ta} பகுதியில் ஆற்றலைத் தூண்டுகிறது. உங்கள் ${rashi.lineFocus.ta} தெளிவாக அமைந்திருப்பதை கவனித்து நோக்கங்களை சீரமைக்கவும்.`
      };
    }
    if (lang === 'hi') {
      return {
        cosmic: `${rashi.graha.hi} के प्रभाव से आज आपका संकल्प और एकाग्रता उच्च स्तर पर है। ${rashi.tattva.hi} आपको सकारात्मक परिणाम और शांति प्रदान करेगा।`,
        palmCorrelate: `आज का गोचर आपकी हथेली में ${rashi.mount.hi} को सक्रिय कर रहा है। अपनी ${rashi.lineFocus.hi} का निरीक्षण कर अपनी ऊर्जा को सही दिशा दें।`
      };
    }
    if (lang === 'te') {
      return {
        cosmic: `${rashi.graha.te} అనుగ్రహంతో నేడు మీ ఆలోచనలు, సంకల్పం దృఢంగా ఉంటాయి. ${rashi.tattva.te} కొత్త అవకాశాలను సృష్టిస్తుంది.`,
        palmCorrelate: `నేటి గ్రహ ప్రభావం మీ అరచేతిలోని ${rashi.mount.te}ను ఉత్తేజపరుస్తోంది. మీ ${rashi.lineFocus.te}ను గమనించండి.`
      };
    }
    if (lang === 'kn') {
      return {
        cosmic: `${rashi.graha.kn} ಕೃಪೆಯಿಂದ ಇಂದು ನಿಮ್ಮ ಚಿಂತನೆ ಮತ್ತು ಶಕ್ತಿ ಹೆಚ್ಚಾಗಿದೆ. ${rashi.tattva.kn} ನಿಮಗೆ ಶಾಂತಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ನೀಡುತ್ತದೆ.`,
        palmCorrelate: `ಇಂದಿನ ಗ್ರಹ ಸಂಚಾರ ನಿಮ್ಮ ಹಸ್ತದ ${rashi.mount.kn} ಅನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿದೆ. ನಿಮ್ಮ ${rashi.lineFocus.kn} ಗಮನಿಸಿ.`
      };
    }
    if (lang === 'ml') {
      return {
        cosmic: `${rashi.graha.ml} സ്വാധീനത്താൽ ഇന്ന് നിങ്ങളുടെ ആത്മവിശ്വാസവും ഏകാഗ്രതയും ഉയർന്നു നിൽക്കുന്നു. ${rashi.tattva.ml} സമാധാനവും വളർച്ചയും നൽകും.`,
        palmCorrelate: `ഇന്നത്തെ ഗ്രഹനില നിങ്ങളുടെ കൈയിലെ ${rashi.mount.ml} ഭാഗത്തെ ഉണർത്തുന്നു. ${rashi.lineFocus.ml} ശ്രദ്ധിക്കുക.`
      };
    }

    // Default English
    return {
      cosmic: `Under the guidance of ${rashi.graha.en}, today presents exceptional clarity for purposeful action. The ${rashi.tattva.en} element grounds your decisions and aligns serendipitous encounters.`,
      palmCorrelate: `Today's celestial transit activates the ${rashi.mount.en} on your palm. Inspect your ${rashi.lineFocus.en} to harmonize today's expansive cosmic currents with your personal trajectory.`
    };
  }

  /**
   * Persist user's selected Rashi
   */
  saveUserRashi(rashiKey) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rashi = this.getRashi(rashiKey);
      window.localStorage.setItem('kai_user_rashi', rashi.key);
      window.localStorage.setItem('kai_user_zodiac', rashi.western);
    }
  }
}

export const dailyForecastService = new DailyForecastService();
