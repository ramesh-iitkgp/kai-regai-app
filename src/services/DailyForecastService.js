/**
 * DailyForecastService — Deterministic Vedic Daily Forecast & Cosmic Transit Engine
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-HOM-001) & Hasta Samudrika Knowledge
 */

import { i18n } from './i18n.js';
import { gregorianToJD } from '../astronomy/time/JulianDate.js';
import { calculateBodyPosition } from '../astronomy/planetaryPositions/PlanetaryCalculator.js';
import { calculateAyanamsa, tropicalToSidereal } from '../astrology/vedic/Ayanamsa.js';
import { calculateVedicChart } from '../astrology/vedic/VedicChartEngine.js';
import { calculateNakshatra } from '../astrology/nakshatra/NakshatraCalculator.js';
import { getSignPlacement } from '../astrology/common/ZodiacSigns.js';
import { dayParts, localDateParts, formatClock } from '../astronomy/time/SunTimes.js';
import { GOCHARA_PLANETS, scoreGauge } from '../astrology/gochara/GocharaRules.js';

/** Used when the user has not saved a birth place yet. Callers can tell via `location.source === 'default'`. */
export const DEFAULT_LOCATION = Object.freeze({
  name: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata', source: 'default'
});

export const VEDIC_RASHIS = [
  {
    key: 'Mesha',
    western: 'Aries',
    symbol: '♈',
    names: { en: 'Mesha (Aries)', ta: 'மேஷம்', hi: 'मेष', te: 'మేషం', kn: 'ಮೇಷ', ml: 'മേടം' },
    graha: { en: 'Mangala (Mars)', ta: 'செவ்வாய் பகவான்', hi: 'मंगल देव', te: 'కుజ భగవానుడు', kn: 'ಮಂಗಳ ದೇವ', ml: 'ചൊവ്വ' },
    tattva: { en: 'Agni (Fire)', ta: 'நெருப்பு தத்துவம்', hi: 'अग्नि तत्व', te: 'అగ్ని తత్త్వం', kn: 'ಅಗ್ನಿ ತತ್ತ್ವ', ml: 'അഗ്നി തത്ത്വം' },
    mount: { en: 'Lower Mount of Mars', ta: 'கீழ் செவ்வாய் மேடு', hi: 'निम्न मंगल पर्वत', te: 'దిగువ కుజ పర్వతం', kn: 'ಕೆಳ ಮಂಗಳ ಪರ್ವತ', ml: 'താഴത്തെ ചൊവ്വ പർവ്വതം' },
    lineFocus: { en: 'Life & Head Line Origin', ta: 'ஆயுள் & புத்தி ரேகை தொடக்கம்', hi: 'जीवन व मस्तिष्क रेखा मूल', te: 'జీవిత & బుద్ధి రేఖ ప్రారంభం', kn: 'ಜೀವನ ಮತ್ತು ಮಸ್ತಿಷ್ಕ ರೇಖೆಯ ಮೂಲ', ml: 'ആയുസ്സ് & ബുദ്ധി രേഖയുടെ തുടക്കം' }
  },
  {
    key: 'Vrishabha',
    western: 'Taurus',
    symbol: '♉',
    names: { en: 'Vrishabha (Taurus)', ta: 'ரிஷபம்', hi: 'वृषभ', te: 'వృషభం', kn: 'ವೃಷಭ', ml: 'ഇടവം' },
    graha: { en: 'Shukra (Venus)', ta: 'சுக்கிர பகவான்', hi: 'शुक्र देव', te: 'శుక్ర భగవానుడు', kn: 'ಶುಕ್ರ ದೇವ', ml: 'ശുക്രൻ' },
    tattva: { en: 'Prithvi (Earth)', ta: 'நிலம் தத்துவம்', hi: 'पृथ्वी तत्व', te: 'భూమి తత్త్వం', kn: 'ಭೂಮಿ ತತ್ತ್ವ', ml: 'ഭൂമി തത്ത്വം' },
    mount: { en: 'Mount of Venus', ta: 'சுக்கிர மேடு', hi: 'शुक्र पर्वत', te: 'శుక్ర పర్వతం', kn: 'ಶುಕ್ರ ಪರ್ವತ', ml: 'ശുക്ര പർവ്വതം' },
    lineFocus: { en: 'Heart Line & Girdle of Venus', ta: 'இருதய ரேகை மற்றும் சுக்கிர வளையம்', hi: 'हृदय रेखा व शुक्र मेखला', te: 'హృదయ రేఖ & శుక్ర వలయం', kn: 'ಹೃದಯ ರೇಖೆ ಮತ್ತು ಶುಕ್ರ ವಲಯ', ml: 'ഹൃദയ രേഖ' }
  },
  {
    key: 'Mithuna',
    western: 'Gemini',
    symbol: '♊',
    names: { en: 'Mithuna (Gemini)', ta: 'மிதுனம்', hi: 'मिथुन', te: 'మిథునం', kn: 'ಮಿಥುನ', ml: 'മിഥുനം' },
    graha: { en: 'Budha (Mercury)', ta: 'புதன் பகவான்', hi: 'बुध देव', te: 'బుధ భగవానుడు', kn: 'ಬುಧ ದೇವ', ml: 'ബുധൻ' },
    tattva: { en: 'Vayu (Air)', ta: 'காற்று தத்துவம்', hi: 'वायु तत्व', te: 'వాయు తత్త్వం', kn: 'ವಾಯು ತತ್ತ್ವ', ml: 'വായു തത്ത്വം' },
    mount: { en: 'Mount of Mercury', ta: 'புதன் மேடு', hi: 'बुध पर्वत', te: 'బుధ పర్వతం', kn: 'ಬುಧ ಪರ್ವತ', ml: 'ബുധ പർവ്വതം' },
    lineFocus: { en: 'Head Line & Health Line', ta: 'புத்தி ரேகை மற்றும் புதன் ரேகை', hi: 'मस्तिष्क रेखा व स्वास्थ्य रेखा', te: 'బుద్ధి రేఖ & ఆరోగ్య రేఖ', kn: 'ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'ബുദ്ധി രേഖ' }
  },
  {
    key: 'Karka',
    western: 'Cancer',
    symbol: '♋',
    names: { en: 'Karka (Cancer)', ta: 'கடகம்', hi: 'कर्क', te: 'కర్కాటకం', kn: 'ಕರ್ಕಾಟಕ', ml: 'കർക്കിടകം' },
    graha: { en: 'Chandra (Moon)', ta: 'சந்திர பகவான்', hi: 'चंद्र देव', te: 'చంద్ర భగవానుడు', kn: 'ಚಂದ್ರ ದೇವ', ml: 'ചന്ദ്രൻ' },
    tattva: { en: 'Jala (Water)', ta: 'நீர் தத்துவம்', hi: 'जल तत्व', te: 'జల తత్త్వం', kn: 'ಜಲ ತತ್ತ್ವ', ml: 'ജല തത്ത്വം' },
    mount: { en: 'Mount of Moon', ta: 'சந்திர மேடு', hi: 'चंद्र पर्वत', te: 'చంద్ర పర్వతం', kn: 'ಚಂದ್ರ ಪರ್ವತ', ml: 'ചന്ദ്ര പർവ്വതം' },
    lineFocus: { en: 'Intuition Line & Head Line Curve', ta: 'உள்ளுணர்வு ரேகை மற்றும் சாய்வு புத்தி ரேகை', hi: 'सहजज्ञान रेखा व वक्र मस्तिष्क रेखा', te: 'అంతర్ దృష్టి రేఖ', kn: 'ಅಂತಃಪ್ರಜ್ಞೆ ರೇಖೆ', ml: 'അന്തർജ്ഞാന രേഖ' }
  },
  {
    key: 'Simha',
    western: 'Leo',
    symbol: '♌',
    names: { en: 'Simha (Leo)', ta: 'சிம்மம்', hi: 'सिंह', te: 'సింహం', kn: 'ಸಿಂಹ', ml: 'ചിങ്ങം' },
    graha: { en: 'Surya (Sun)', ta: 'சூரிய பகவான்', hi: 'सूर्य देव', te: 'సూర్య భగవానుడు', kn: 'ಸೂರ್ಯ ದೇವ', ml: 'സൂര്യൻ' },
    tattva: { en: 'Agni (Fire)', ta: 'நெருப்பு தத்துவம்', hi: 'अग्नि तत्व', te: 'అగ్ని తత్త్వం', kn: 'ಅಗ್ನಿ ತತ್ತ್ವ', ml: 'അഗ്നി തത്ത്വം' },
    mount: { en: 'Mount of Sun (Apollo)', ta: 'சூரிய மேடு', hi: 'सूर्य पर्वत', te: 'సూర్య పర్వతం', kn: 'ಸೂರ್ಯ ಪರ್ವತ', ml: 'സൂര്യ പർവ്വതം' },
    lineFocus: { en: 'Sun Line (Apollo Line)', ta: 'சூரிய ரேகை (கீர்த்தி ரேகை)', hi: 'सूर्य रेखा', te: 'సూర్య రేఖ', kn: 'ಸೂರ್ಯ ರೇಖೆ', ml: 'സൂര്യ രേഖ' }
  },
  {
    key: 'Kanya',
    western: 'Virgo',
    symbol: '♍',
    names: { en: 'Kanya (Virgo)', ta: 'கன்னி', hi: 'कन्या', te: 'కన్య', kn: 'ಕನ್ಯಾ', ml: 'കന്നി' },
    graha: { en: 'Budha (Mercury)', ta: 'புதன் பகவான்', hi: 'बुध देव', te: 'బుధ భగవానుడు', kn: 'ಬುಧ ದೇವ', ml: 'ബുധൻ' },
    tattva: { en: 'Prithvi (Earth)', ta: 'நிலம் தத்துவம்', hi: 'पृथ्वी तत्व', te: 'భూమి తత్త్వం', kn: 'ಭೂಮಿ ತತ್ತ್ವ', ml: 'ഭൂമി തത്ത്വം' },
    mount: { en: 'Mount of Mercury & Upper Mars', ta: 'புதன் & மேல் செவ்வாய் மேடு', hi: 'बुध व उच्च मंगल पर्वत', te: 'బుధ & ఎగువ కుజ పర్వతం', kn: 'ಬುಧ ಮತ್ತು ಮಂಗಳ ಪರ್ವತ', ml: 'ബുധ പർവ്വതം' },
    lineFocus: { en: 'Straight Head Line & Fine Mercury Lines', ta: 'நேரான புத்தி ரேகை', hi: 'सरल मस्तिष्क रेखा', te: 'సరళ బుద్ధి రేఖ', kn: 'ನೇರ ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'നേരായ ബുദ്ധി രേഖ' }
  },
  {
    key: 'Tula',
    western: 'Libra',
    symbol: '♎',
    names: { en: 'Tula (Libra)', ta: 'துலாம்', hi: 'तुला', te: 'తులా', kn: 'ತುಲಾ', ml: 'തുലാം' },
    graha: { en: 'Shukra (Venus)', ta: 'சுக்கிர பகவான்', hi: 'शुक्र देव', te: 'శుక్ర భగవానుడు', kn: 'ಶುಕ್ರ ದೇವ', ml: 'ശുക്രൻ' },
    tattva: { en: 'Vayu (Air)', ta: 'காற்று தத்துவம்', hi: 'वायु तत्व', te: 'వాయు తత్త్వం', kn: 'ವಾಯು ತತ್ತ್ವ', ml: 'വായു തത്ത്വം' },
    mount: { en: 'Mount of Venus & Sun', ta: 'சுக்கிர மற்றும் சூரிய மேடு', hi: 'शुक्र व सूर्य पर्वत', te: 'శుక్ర & సూర్య పర్వతం', kn: 'ಶುಕ್ರ ಮತ್ತು ಸೂರ್ಯ ಪರ್ವತ', ml: 'ശുക്ര & സൂര്യ പർവ്വതം' },
    lineFocus: { en: 'Heart Line & Sun Branch', ta: 'இருதய ரேகை மற்றும் சூரிய கிளை', hi: 'हृदय रेखा व सूर्य शाखा', te: 'హృదయ రేఖ & సూర్య శాఖ', kn: 'ಹೃದಯ ರೇಖೆ', ml: 'ഹൃദയ രേഖ' }
  },
  {
    key: 'Vrishchika',
    western: 'Scorpio',
    symbol: '♏',
    names: { en: 'Vrishchika (Scorpio)', ta: 'விருச்சிகம்', hi: 'वृश्चिक', te: 'వృశ్చికం', kn: 'ವೃಶ್ಚಿಕ', ml: 'വൃശ്ചികം' },
    graha: { en: 'Mangala / Ketu', ta: 'செவ்வாய் / கேது', hi: 'मंगल / केतु', te: 'కుజుడు / కేతువు', kn: 'ಮಂಗಳ / ಕೇತು', ml: 'ചൊവ്വ / കേതു' },
    tattva: { en: 'Jala (Water)', ta: 'நீர் தத்துவம்', hi: 'जल तत्व', te: 'జల తత్త్వం', kn: 'ಜಲ ತತ್ತ್ವ', ml: 'ജല തത്ത്വം' },
    mount: { en: 'Upper Mount of Mars & Moon', ta: 'மேல் செவ்வாய் மற்றும் சந்திர மேடு', hi: 'उच्च मंगल व चंद्र पर्वत', te: 'ఎగువ కుజ & చంద్ర పర్వతం', kn: 'ಮೇಲಿನ ಮಂಗಳ ಮತ್ತು ಚಂದ್ರ ಪರ್ವತ', ml: 'മേൽ ചൊവ്വ പർവ്വതം' },
    lineFocus: { en: 'Deep Head Line & Resilience Marks', ta: 'ஆழமான புத்தி ரேகை', hi: 'गहरी मस्तिष्क रेखा', te: 'గాఢ బుద్ధి రేఖ', kn: 'ಗಾಢ ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'ആഴമേറിയ ബുദ്ധി രേഖ' }
  },
  {
    key: 'Dhanu',
    western: 'Sagittarius',
    symbol: '♐',
    names: { en: 'Dhanu (Sagittarius)', ta: 'தனுசு', hi: 'धनु', te: 'ధనుస్సు', kn: 'ಧನು', ml: 'ധനു' },
    graha: { en: 'Guru (Jupiter)', ta: 'குரு பகவான்', hi: 'गुरु (बृहस्पति)', te: 'గురు భగవానుడు', kn: 'ಗುರು ದೇವ', ml: 'ഗുരു' },
    tattva: { en: 'Agni (Fire)', ta: 'நெருப்பு தத்துவம்', hi: 'अग्नि तत्व', te: 'అగ్ని తత్త్వం', kn: 'ಅಗ್ನಿ ತತ್ತ್ವ', ml: 'അഗ്നി തത്ത്വം' },
    mount: { en: 'Mount of Jupiter', ta: 'குரு மேடு', hi: 'गुरु पर्वत', te: 'గురు పర్వతం', kn: 'ಗುರು ಪರ್ವತ', ml: 'ഗുരു പർവ്വതം' },
    lineFocus: { en: 'Upward Branches into Jupiter Mount', ta: 'குரு மேட்டை நோக்கிய மேல்நோக்கு கிளைகள்', hi: 'गुरु पर्वत की ओर उर्ध्वगामी शाखाएं', te: 'గురు పర్వతం వైపు శాఖలు', kn: 'ಗುರು ಪರ್ವತದ ಮೇಲ್ಮುಖ ಶಾಖೆಗಳು', ml: 'ഗുരു പർവ്വത ശാഖകൾ' }
  },
  {
    key: 'Makara',
    western: 'Capricorn',
    symbol: '♑',
    names: { en: 'Makara (Capricorn)', ta: 'மகரம்', hi: 'मकर', te: 'మకరం', kn: 'ಮಕರ', ml: 'മകരം' },
    graha: { en: 'Shani (Saturn)', ta: 'சனி பகவான்', hi: 'शनि देव', te: 'శని భగవానుడు', kn: 'ಶನಿ ದೇವ', ml: 'ശനി' },
    tattva: { en: 'Prithvi (Earth)', ta: 'நிலம் தத்துவம்', hi: 'पृथ्वी तत्व', te: 'భూమి తత్త్వం', kn: 'ಭೂಮಿ ತತ್ತ್ವ', ml: 'ഭൂമി തത്ത്വം' },
    mount: { en: 'Mount of Saturn', ta: 'சனி மேடு', hi: 'शनि पर्वत', te: 'శని పర్వతం', kn: 'ಶನಿ ಪರ್ವತ', ml: 'ശനി പർവ്വതം' },
    lineFocus: { en: 'Fate Line (Saturn Line)', ta: 'விதி ரேகை (சனி ரேகை)', hi: 'भाग्य रेखा (शनि रेखा)', te: 'భాగ్య రేఖ (శని రేఖ)', kn: 'ಭಾಗ್ಯ ರೇಖೆ (ಶನಿ ರೇಖೆ)', ml: 'ഭാഗ്യ രേഖ (ശനി രേഖ)' }
  },
  {
    key: 'Kumbha',
    western: 'Aquarius',
    symbol: '♒',
    names: { en: 'Kumbha (Aquarius)', ta: 'கும்பம்', hi: 'कुम्भ', te: 'కుంభం', kn: 'ಕುಂಭ', ml: 'കുംഭം' },
    graha: { en: 'Shani / Rahu', ta: 'சனி / ராகு', hi: 'शनि / राहु', te: 'శని / రాహువు', kn: 'ಶನಿ / ರಾಹು', ml: 'ശനി / രാഹു' },
    tattva: { en: 'Vayu (Air)', ta: 'காற்று தத்துவம்', hi: 'वायु तत्व', te: 'వాయు తత్త్వం', kn: 'ವಾಯು ತತ್ತ್ವ', ml: 'വായു തത്ത്വം' },
    mount: { en: 'Mount of Saturn & Mercury', ta: 'சனி மற்றும் புதன் மேடு', hi: 'शनि व बुध पर्वत', te: 'శని & బుధ పర్వతం', kn: 'ಶನಿ ಮತ್ತು ಬುಧ ಪರ್ವತ', ml: 'ശനി & ബുധ പർവ്വതം' },
    lineFocus: { en: 'Long Head Line & Intuitive Fork', ta: 'நீண்ட புத்தி ரேகை மற்றும் உள்ளுணர்வு கிளை', hi: 'लंबी मस्तिष्क रेखा', te: 'పొడవైన బుద్ధి రేఖ', kn: 'ಉದ್ದವಾದ ಮಸ್ತಿಷ್ಕ ರೇಖೆ', ml: 'ദീർഘ ബുദ്ധി രേഖ' }
  },
  {
    key: 'Meena',
    western: 'Pisces',
    symbol: '♓',
    names: { en: 'Meena (Pisces)', ta: 'மீனம்', hi: 'मीन', te: 'మీనం', kn: 'ಮೀನ', ml: 'മീനം' },
    graha: { en: 'Guru (Jupiter)', ta: 'குரு பகவான்', hi: 'गुरु (बृहस्पति)', te: 'గురు భగవానుడు', kn: 'ಗುರು ದೇವ', ml: 'ഗുരു' },
    tattva: { en: 'Jala (Water)', ta: 'நீர் தத்துவம்', hi: 'जल तत्व', te: 'జల తత్త్వం', kn: 'ಜಲ ತತ್ತ್ವ', ml: 'ജല തത്ത്വം' },
    mount: { en: 'Mount of Jupiter & Moon', ta: 'குரு மற்றும் சந்திர மேடு', hi: 'गुरु व चंद्र पर्वत', te: 'గురు & చంద్ర పర్వతం', kn: 'ಗುರು ಮತ್ತು ಚಂದ್ರ ಪರ್ವತ', ml: 'ഗുരു & ചന്ദ്ര പർവ്വതം' },
    lineFocus: { en: 'Solomon Ring & Gentle Curved Heart Line', ta: 'சாலமன் வளையம் மற்றும் வளைந்த இருதய ரேகை', hi: 'सुलेमान वलय व वक्र हृदय रेखा', te: 'సాల్మన్ వలయం', kn: 'ಸಾಲಮನ್ ವಲಯ', ml: 'സോളമൻ വളയം' }
  }
];

const HOUSE_DOMAINS = [
  'Vitality & Self', 'Wealth & Family', 'Courage & Initiative', 'Inner Peace & Foundation',
  'Creativity & Intellect', 'Resilience & Service', 'Partnerships & Alliances', 'Deep Transformation',
  'Fortune & Dharma', 'Career & Karma', 'Gains & Networks', 'Higher Reflection'
];

const AUSPICIOUS_COLORS = [
  { en: 'Sacred Gold', ta: 'தங்க மஞ்சள்', hi: 'स्वर्ण पीत', te: 'స్వర్ణ పసుపు', kn: 'ಚಿನ್ನದ ಹಳದಿ', ml: 'സ്വർണ്ണ മഞ്ഞ' },
  { en: 'Deep Saffron', ta: 'காவி நிறம்', hi: 'गहरा भगवा', te: 'కాషాయం', kn: 'ಕೇಸರಿ', ml: 'കാവി' },
  { en: 'Pearl White', ta: 'முத்து வெள்ளை', hi: 'मोती श्वेत', te: 'ముత్యపు తెలుపు', kn: 'ಮುತ್ತಿನ ಬಿಳಿ', ml: 'മുത്ത് വെള്ള' },
  { en: 'Royal Indigo', ta: 'நீல வண்ணம்', hi: 'शाही गहरा नीला', te: 'నీలి రంగు', kn: 'ರಾಯಲ್ ನೀಲಿ', ml: 'ഇൻഡിഗോ' },
  { en: 'Coral Red', ta: 'சிவப்பு', hi: 'लाल', te: 'ఎరుపు', kn: 'ಕೆಂಪು', ml: 'ചുവപ്പ്' },
  { en: 'Emerald Green', ta: 'பச்சை', hi: 'हरा', te: 'ఆకుపచ్చ', kn: 'ಹಸಿರು', ml: 'പച്ച' }
];

/**
 * Traditional weekday (vara) colours: Sun saffron, Mon white, Tue red,
 * Wed green, Thu yellow/gold, Fri white, Sat dark blue. Index into AUSPICIOUS_COLORS.
 */
const COLOR_BY_WEEKDAY = [1, 2, 4, 5, 0, 2, 3];

const ABHIJIT_NAME = {
  en: 'Abhijit Muhurta', ta: 'அபிஜித் முகூர்த்தம்', hi: 'अभिजित मुहूर्त',
  te: 'అభిజిత్ ముహూర్తం', kn: 'ಅಭಿಜಿತ್ ಮುಹೂರ್ತ', ml: 'അഭിജിത്ത് മുഹൂർത്തം'
};

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const GAUGE_PHRASE_EN = { love: 'relationships', energy: 'energy', luck: 'fortune', mind: 'mental clarity' };

const readStored = (key) => {
  try {
    return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

export class DailyForecastService {
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
   * The place used for sunrise-based timings: the place saved at onboarding
   * (note: that is the birth place, not necessarily where the user is today),
   * or DEFAULT_LOCATION when nothing valid is saved.
   * @returns {{ name: string, lat: number, lon: number, tz: string, source: 'saved'|'default' }}
   */
  getStoredLocation() {
    const lat = parseFloat(readStored('kai_user_lat'));
    const lon = parseFloat(readStored('kai_user_lon'));
    const tz = readStored('kai_user_tz');
    let tzValid = false;
    try {
      tzValid = !!tz && !!new Intl.DateTimeFormat('en-US', { timeZone: tz });
    } catch {
      tzValid = false;
    }
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && tzValid) {
      const name = (readStored('kai_user_pob') || '').split(',')[0].trim();
      return { name: name || DEFAULT_LOCATION.name, lat, lon, tz, source: 'saved' };
    }
    return { ...DEFAULT_LOCATION };
  }

  /**
   * The user's Janma Rashi (Vedic Moon sign), worked out from the saved birth
   * date, time and place with the chart engine. Onboarding's own "rashi" is
   * picked from calendar date ranges (the Sun sign), which is a different thing.
   *
   * @returns {{ key: string, source: 'birth-chart'|'saved-selection'|'default', birthTimeUnknown: boolean }}
   */
  resolveUserRashi() {
    const dob = readStored('kai_user_dob');
    const hasPlace = Number.isFinite(parseFloat(readStored('kai_user_lat'))) && Number.isFinite(parseFloat(readStored('kai_user_lon')));
    const birthTimeUnknown = readStored('kai_user_tob_unknown') === 'true';

    if (dob && hasPlace) {
      try {
        const [year, month, day] = dob.split('-').map(Number);
        const [hour, minute] = birthTimeUnknown ? [12, 0] : (readStored('kai_user_tob') || '12:00').split(':').map(Number);
        const chart = calculateVedicChart({
          year, month, day, hour: hour || 0, minute: minute || 0, second: 0,
          latitude: parseFloat(readStored('kai_user_lat')),
          longitude: parseFloat(readStored('kai_user_lon')),
          timezone: readStored('kai_user_tz') || DEFAULT_LOCATION.tz
        });
        if (chart.janmaRashi && VEDIC_RASHIS.some(r => r.key === chart.janmaRashi)) {
          return { key: chart.janmaRashi, source: 'birth-chart', birthTimeUnknown };
        }
      } catch {
        // fall through to the saved selection
      }
    }

    const saved = readStored('kai_user_rashi');
    if (saved) return { key: this.getRashi(saved).key, source: 'saved-selection', birthTimeUnknown };
    return { key: VEDIC_RASHIS[9].key, source: 'default', birthTimeUnknown };
  }

  /** Civil date, weekday and sunrise-based day parts at a place. */
  _dayContext(date, location) {
    const civil = localDateParts(date, location.tz);
    const parts = dayParts({ ...civil, lat: location.lat, lon: location.lon });
    return { civil, parts };
  }

  /**
   * Rahu Kalam for the day, from real sunrise and sunset ("HH:MM - HH:MM", local time).
   */
  getRahuKalam(date = new Date(), location = this.getStoredLocation()) {
    const { parts } = this._dayContext(date, location);
    return `${formatClock(parts.rahuKalam.start, location.tz)} - ${formatClock(parts.rahuKalam.end, location.tz)}`;
  }

  /**
   * True while `date` falls inside that day's Rahu Kalam.
   */
  isRahuKalamActive(date = new Date(), location = this.getStoredLocation()) {
    const { parts } = this._dayContext(date, location);
    const t = date.getTime();
    return t >= parts.rahuKalam.start.getTime() && t < parts.rahuKalam.end.getTime();
  }

  /**
   * Planet positions at local sunrise (the Panchang convention), as houses
   * counted from the user's Rashi, plus the Moon's nakshatra.
   * @returns {{ houses: Record<string, number>, nakshatra: object, jupiter: object }}
   */
  _computeSky(rashi, sunrise) {
    const jd = gregorianToJD(
      sunrise.getUTCFullYear(), sunrise.getUTCMonth() + 1, sunrise.getUTCDate(),
      sunrise.getUTCHours(), sunrise.getUTCMinutes(), sunrise.getUTCSeconds()
    );
    const ayanamsa = calculateAyanamsa(jd, 'LAHIRI_CHITRAPAKSHA');
    const userSignIndex = VEDIC_RASHIS.findIndex(r => r.key === rashi.key);

    const placements = {};
    const houses = {};
    for (const planet of GOCHARA_PLANETS) {
      const body = calculateBodyPosition(planet, jd);
      const sidereal = tropicalToSidereal(body.apparentLongitude, ayanamsa);
      const sign = getSignPlacement(sidereal, 'VEDIC');
      placements[planet] = { sidereal, sign };
      houses[planet] = ((sign.signIndex - userSignIndex + 12) % 12) + 1;
    }

    const nak = calculateNakshatra(placements.moon.sidereal);
    const jupSign = placements.jupiter.sign;
    return {
      houses,
      nakshatra: { name: nak.nakshatraName, pada: nak.pada, ruler: nak.ruler, deity: nak.deity },
      jupiter: {
        planet: 'Guru (Jupiter)',
        house: houses.jupiter,
        domain: HOUSE_DOMAINS[houses.jupiter - 1],
        sign: jupSign.signName,
        degree: Number(jupSign.degreeInSign.toFixed(1))
      }
    };
  }

  /**
   * Computes the complete daily forecast for a given Rashi and date.
   *
   * Everything here is calculated, not drawn from a template:
   *  - gauges: Gochara (see src/astrology/gochara/GocharaRules.js) from planet positions at local sunrise
   *  - nakshatra / Jupiter transit: same sunrise snapshot
   *  - Rahu Kalam, Abhijit, Brahma Muhurta: from real sunrise and sunset at `location`
   *  - colour: the traditional colour of the weekday
   *
   * @param {string} rashiKeyOrWestern The user's Janma Rashi (see resolveUserRashi())
   * @param {Date} [date]
   * @param {string} [lang]
   * @param {{ location?: { lat: number, lon: number, tz: string, name?: string, source?: string } }} [options]
   */
  getForecastForToday(rashiKeyOrWestern, date = new Date(), lang = i18n.getLanguage(), options = {}) {
    const rashi = this.getRashi(rashiKeyOrWestern);
    const location = options.location
      ? { name: options.location.name || '', source: 'custom', ...options.location }
      : this.getStoredLocation();

    const { civil, parts } = this._dayContext(date, location);
    const fmt = (instant) => formatClock(instant, location.tz);

    // Planetary snapshot at sunrise and the gauges derived from it
    let sky = null;
    try {
      sky = this._computeSky(rashi, parts.sunrise);
    } catch {
      // Astronomy engine unavailable: show neutral gauges and say so via metricsSource
    }

    let metrics = { love: 50, energy: 50, luck: 50, mind: 50 };
    let metricDetails = null;
    let metricsSource = 'fallback';
    if (sky) {
      metricDetails = {};
      for (const gauge of Object.keys(metrics)) {
        metricDetails[gauge] = scoreGauge(sky.houses, gauge);
        metrics[gauge] = metricDetails[gauge].value;
      }
      metricsSource = 'gochara';
    }

    // Formatted date string
    const dateFormatted = date.toLocaleDateString(lang === 'en' ? 'en-US' : `${lang}-IN`, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: location.tz
    });

    const colorEntry = AUSPICIOUS_COLORS[COLOR_BY_WEEKDAY[civil.weekday]];
    const auspiciousColor = colorEntry[lang] || colorEntry.en;

    const abhijitWindow = `${fmt(parts.abhijit.start)} – ${fmt(parts.abhijit.end)}`;
    const auspiciousMuhurta = `${ABHIJIT_NAME[lang] || ABHIJIT_NAME.en} (${abhijitWindow})`;
    const rahuKalam = `${fmt(parts.rahuKalam.start)} - ${fmt(parts.rahuKalam.end)}`;
    const nowMs = date.getTime();

    // Multilingual Daily Reflection & Palm Mount Interpretation
    const reflections = this._buildReflection(rashi, metrics, lang, sky?.jupiter || null, metricDetails, sky?.houses || null);

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
      metricDetails,
      metricsSource,
      auspiciousColor,
      auspiciousMuhurta,
      rahuKalam,
      rahuKalamActive: nowMs >= parts.rahuKalam.start.getTime() && nowMs < parts.rahuKalam.end.getTime(),
      timings: {
        sunrise: fmt(parts.sunrise),
        sunset: fmt(parts.sunset),
        brahma: `${fmt(parts.brahma.start)} – ${fmt(parts.brahma.end)}`,
        abhijit: abhijitWindow,
        rahuKalam,
        approximate: parts.approximate
      },
      timesLocation: { name: location.name, source: location.source },
      nakshatra: sky?.nakshatra || null,
      planetaryTransit: sky?.jupiter || null,
      reflection: reflections.cosmic,
      palmCorrelate: reflections.palmCorrelate
    };
  }

  /**
   * Daily reflection text.
   *
   * English is written from the day's real gauges and Moon house. The other
   * five languages still use the older fixed templates (translations of
   * data-driven wording are pending), so their text does not vary with the sky.
   */
  _buildReflection(rashi, metrics, lang, planetaryTransit = null, metricDetails = null, houses = null) {
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

    // English: built from today's real gauges
    const palmCorrelate = `Your sign is ruled by ${rashi.graha.en}, which is linked with the ${rashi.mount.en} on your palm. Look at your ${rashi.lineFocus.en} to reflect on how today's mood fits your own pattern.`;
    if (!metricDetails || !houses) {
      return {
        cosmic: `Under the guidance of ${rashi.graha.en}, take today at a steady pace. Today's sky could not be calculated just now, so no daily scores are shown.`,
        palmCorrelate
      };
    }

    const ranked = Object.entries(metrics).sort((a, b) => b[1] - a[1]);
    const strongest = GAUGE_PHRASE_EN[ranked[0][0]];
    const mostSensitive = GAUGE_PHRASE_EN[ranked[ranked.length - 1][0]];
    const average = ranked.reduce((sum, [, v]) => sum + v, 0) / ranked.length;
    const moonHouse = ORDINALS[houses.moon - 1];

    let cosmic;
    if (average >= 75) {
      cosmic = `Today's sky is broadly supportive for you. The Moon moves through your ${moonHouse} house, and ${strongest} carries the strongest signal. A good day for purposeful action.`;
    } else if (average >= 55) {
      cosmic = `Today's sky is mixed for you. The Moon moves through your ${moonHouse} house; ${strongest} looks steadier than ${mostSensitive}. Pace yourself and choose one priority.`;
    } else {
      cosmic = `Today's sky asks for a gentler pace. The Moon moves through your ${moonHouse} house, and ${mostSensitive} is the most sensitive area. Keep plans simple and return to bigger decisions another day.`;
    }
    return { cosmic, palmCorrelate };
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
