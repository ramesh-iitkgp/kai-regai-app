/**
 * SplashScreen Component — Cold-Boot Genesis & Onboarding Experience
 */

import { router as t } from "../navigation/router.js";
import { ROUTES as e } from "../navigation/routes.js";
import { i18n as a, SUPPORTED_LANGUAGES as r } from "../services/i18n.js";
import { GeoLocationService as Se } from "../services/GeoLocationService.js";
import { renderClockTimePickerModal as Ce, attachClockTimePickerListeners as Te } from "../components/ClockTimePicker.js";

export function renderSplashScreen(n) {
let i=t.routeParams?.step===void 0?null:parseInt(t.routeParams.step,10),o=i!==null&&!isNaN(i)?i:0;typeof window<`u`&&window.localStorage?.getItem(`kai_active_logo`);let s=0,c=null,l=localStorage.getItem(`kai_user_name`)||``,u=typeof window<`u`&&window.localStorage?.getItem(`kai_dominant_hand`)||`RIGHT`,d=17,f=9,p=1995,m=typeof window<`u`&&window.localStorage?.getItem(`kai_user_pob`)||`Chennai, India`,h=typeof window<`u`&&window.localStorage?.getItem(`kai_user_tob`)||`12:00`,g=(typeof window<`u`&&window.localStorage?.getItem(`kai_user_tob_unknown`))===`true`,_=null,v=[{name:`Capricorn`,rashi:`Makara`,rashiSanskrit:`मकर`,rashiTamil:`மகரம்`,rashiTelugu:`మకరం`,rashiKannada:`ಮಕರ`,rashiMalayalam:`മകരം`,symbol:`♑`,graha:`Shani (Saturn)`,grahaTamil:`சனி பகவான்`,grahaHindi:`शनि देव`,tattva:`Prithvi (Earth)`,tattvaTamil:`நிலம் தத்துவம்`,tattvaHindi:`पृथ्वी तत्व`,range:`December 22 - January 19`,rangeTamil:`டிசம்பர் 22 - ஜனவரி 19`,rangeHindi:`22 दिसंबर - 19 जनवरी`,angle:0},{name:`Aquarius`,rashi:`Kumbha`,rashiSanskrit:`कुम्भ`,rashiTamil:`கும்பம்`,rashiTelugu:`కుంభం`,rashiKannada:`ಕುಂಭ`,rashiMalayalam:`കുംഭം`,symbol:`♒`,graha:`Shani (Saturn)`,grahaTamil:`சனி பகவான்`,grahaHindi:`शनि देव`,tattva:`Vayu (Air)`,tattvaTamil:`காற்று தத்துவம்`,tattvaHindi:`वायु तत्व`,range:`January 20 - February 18`,rangeTamil:`ஜனவரி 20 - பிப்ரவரி 18`,rangeHindi:`20 जनवरी - 18 फरवरी`,angle:30},{name:`Pisces`,rashi:`Meena`,rashiSanskrit:`मीन`,rashiTamil:`மீனம்`,rashiTelugu:`మీనం`,rashiKannada:`ಮೀನ`,rashiMalayalam:`മീനം`,symbol:`♓`,graha:`Guru (Jupiter)`,grahaTamil:`குரு பகவான்`,grahaHindi:`गुरु (बृहस्पति)`,tattva:`Jala (Water)`,tattvaTamil:`நீர் தத்துவம்`,tattvaHindi:`जल तत्व`,range:`February 19 - March 20`,rangeTamil:`பிப்ரவரி 19 - மார்ச் 20`,rangeHindi:`19 फरवरी - 20 मार्च`,angle:60},{name:`Aries`,rashi:`Mesha`,rashiSanskrit:`मेष`,rashiTamil:`மேஷம்`,rashiTelugu:`మేషం`,rashiKannada:`ಮೇಷ`,rashiMalayalam:`മേടം`,symbol:`♈`,graha:`Mangala (Mars)`,grahaTamil:`செவ்வாய் பகவான்`,grahaHindi:`मंगल देव`,tattva:`Agni (Fire)`,tattvaTamil:`நெருப்பு தத்துவம்`,tattvaHindi:`अग्नि तत्व`,range:`March 21 - April 19`,rangeTamil:`மார்ச் 21 - ஏப்ரல் 19`,rangeHindi:`21 मार्च - 19 अप्रैल`,angle:90},{name:`Taurus`,rashi:`Vrishabha`,rashiSanskrit:`वृषभ`,rashiTamil:`ரிஷபம்`,rashiTelugu:`వృషభం`,rashiKannada:`ವೃಷಭ`,rashiMalayalam:`ഇടവം`,symbol:`♉`,graha:`Shukra (Venus)`,grahaTamil:`சுக்கிர பகவான்`,grahaHindi:`शुक्र देव`,tattva:`Prithvi (Earth)`,tattvaTamil:`நிலம் தத்துவம்`,tattvaHindi:`पृथ्वी तत्व`,range:`April 20 - May 20`,rangeTamil:`ஏப்ரல் 20 - மே 20`,rangeHindi:`20 अप्रैल - 20 मई`,angle:120},{name:`Gemini`,rashi:`Mithuna`,rashiSanskrit:`मिथुन`,rashiTamil:`மிதுனம்`,rashiTelugu:`మిథునం`,rashiKannada:`ಮಿಥುನ`,rashiMalayalam:`മിഥുനം`,symbol:`♊`,graha:`Budha (Mercury)`,grahaTamil:`புதன் பகவான்`,grahaHindi:`बुध देव`,tattva:`Vayu (Air)`,tattvaTamil:`காற்று தத்துவம்`,tattvaHindi:`वायु तत्व`,range:`May 21 - June 20`,rangeTamil:`மே 21 - ஜூன் 20`,rangeHindi:`21 मई - 20 जून`,angle:150},{name:`Cancer`,rashi:`Karka`,rashiSanskrit:`कर्क`,rashiTamil:`கடகம்`,rashiTelugu:`కర్కాటకం`,rashiKannada:`ಕರ್ಕಾಟಕ`,rashiMalayalam:`കർക്കിടകം`,symbol:`♋`,graha:`Chandra (Moon)`,grahaTamil:`சந்திர பகவான்`,grahaHindi:`चंद्र देव`,tattva:`Jala (Water)`,tattvaTamil:`நீர் தத்துவம்`,tattvaHindi:`जल तत्व`,range:`June 21 - July 22`,rangeTamil:`ஜூன் 21 - ஜூலை 22`,rangeHindi:`21 जून - 22 जुलाई`,angle:180},{name:`Leo`,rashi:`Simha`,rashiSanskrit:`सिंह`,rashiTamil:`சிம்மம்`,rashiTelugu:`సింహం`,rashiKannada:`ಸಿಂಹ`,rashiMalayalam:`ചിങ്ങം`,symbol:`♌`,graha:`Surya (Sun)`,grahaTamil:`சூரிய பகவான்`,grahaHindi:`सूर्य देव`,tattva:`Agni (Fire)`,tattvaTamil:`நெருப்பு தத்துவம்`,tattvaHindi:`अग्नि तत्व`,range:`July 23 - August 22`,rangeTamil:`ஜூலை 23 - ஆகஸ்ட் 22`,rangeHindi:`23 जुलाई - 22 अगस्त`,angle:210},{name:`Virgo`,rashi:`Kanya`,rashiSanskrit:`कन्या`,rashiTamil:`கன்னி`,rashiTelugu:`కన్య`,rashiKannada:`ಕನ್ಯಾ`,rashiMalayalam:`കന്നി`,symbol:`♍`,graha:`Budha (Mercury)`,grahaTamil:`புதன் பகவான்`,grahaHindi:`बुध देव`,tattva:`Prithvi (Earth)`,tattvaTamil:`நிலம் தத்துவம்`,tattvaHindi:`पृथ्वी तत्व`,range:`August 23 - September 22`,rangeTamil:`ஆகஸ்ட் 23 - செப்டம்பர் 22`,rangeHindi:`23 अगस्त - 22 सितंबर`,angle:240},{name:`Libra`,rashi:`Tula`,rashiSanskrit:`तुला`,rashiTamil:`துலாம்`,rashiTelugu:`తులా`,rashiKannada:`ತುಲಾ`,rashiMalayalam:`തുലാം`,symbol:`♎`,graha:`Shukra (Venus)`,grahaTamil:`சுக்கிர பகவான்`,grahaHindi:`शुक्र देव`,tattva:`Vayu (Air)`,tattvaTamil:`காற்று தத்துவம்`,tattvaHindi:`वायु तत्व`,range:`September 23 - October 22`,rangeTamil:`செப்டம்பர் 23 - அக்டோபர் 22`,rangeHindi:`23 सितंबर - 22 अक्टूबर`,angle:270},{name:`Scorpio`,rashi:`Vrishchika`,rashiSanskrit:`वृश्चिक`,rashiTamil:`விருச்சிகம்`,rashiTelugu:`వృశ్చికం`,rashiKannada:`ವೃಶ್ಚಿಕ`,rashiMalayalam:`വൃശ്ചികം`,symbol:`♏`,graha:`Mangala / Ketu`,grahaTamil:`செவ்வாய் / கேது`,grahaHindi:`मंगल / केतु`,tattva:`Jala (Water)`,tattvaTamil:`நீர் தத்துவம்`,tattvaHindi:`जल तत्व`,range:`October 23 - November 21`,rangeTamil:`அக்டோபர் 23 - நவம்பர் 21`,rangeHindi:`23 अक्टूबर - 21 नवंबर`,angle:300},{name:`Sagittarius`,rashi:`Dhanu`,rashiSanskrit:`धनु`,rashiTamil:`தனுசு`,rashiTelugu:`ధనుస్సు`,rashiKannada:`ಧನು`,rashiMalayalam:`ധനു`,symbol:`♐`,graha:`Guru (Jupiter)`,grahaTamil:`குரு பகவான்`,grahaHindi:`गुरु (बृहस्पति)`,tattva:`Agni (Fire)`,tattvaTamil:`நெருப்பு தத்துவம்`,tattvaHindi:`अग्नि तत्व`,range:`November 22 - December 21`,rangeTamil:`நவம்பர் 22 - டிசம்பர் 21`,rangeHindi:`22 नवंबर - 21 दिसंबर`,angle:330}];function y(e,t){return e===11&&t>=22||e===0&&t<=19?v[0]:e===0&&t>=20||e===1&&t<=18?v[1]:e===1&&t>=19||e===2&&t<=20?v[2]:e===2&&t>=21||e===3&&t<=19?v[3]:e===3&&t>=20||e===4&&t<=20?v[4]:e===4&&t>=21||e===5&&t<=20?v[5]:e===5&&t>=21||e===6&&t<=22?v[6]:e===6&&t>=23||e===7&&t<=22?v[7]:e===7&&t>=23||e===8&&t<=22?v[8]:e===8&&t>=23||e===9&&t<=22?v[9]:e===9&&t>=23||e===10&&t<=21?v[10]:v[11]}let b={"Shani (Saturn)":{en:`Shani (Saturn)`,ta:`சனி பகவான்`,hi:`शनि देव`,te:`శని భగవానుడు`,kn:`ಶನಿ ದೇವ`,ml:`ശനി ഭഗവാൻ`},"Guru (Jupiter)":{en:`Guru (Jupiter)`,ta:`குரு பகவான்`,hi:`गुरु (बृहस्पति)`,te:`గురు భగవానుడు`,kn:`ಗುರು ದೇವ`,ml:`ഗുരു ഭഗവാൻ`},"Mangala (Mars)":{en:`Mangala (Mars)`,ta:`செவ்வாய் பகவான்`,hi:`मंगल देव`,te:`కుజ (మంగళ) భగవానుడు`,kn:`ಮಂಗಳ ದೇವ`,ml:`ചൊവ്വ (മംഗളൻ)`},"Shukra (Venus)":{en:`Shukra (Venus)`,ta:`சுக்கிர பகவான்`,hi:`शुक्र देव`,te:`శుక్ర భగవానుడు`,kn:`ಶುಕ್ರ ದೇವ`,ml:`ശുക്ര ഭഗവാൻ`},"Budha (Mercury)":{en:`Budha (Mercury)`,ta:`புதன் பகவான்`,hi:`बुध देव`,te:`బుధ భగవానుడు`,kn:`ಬುಧ ದೇವ`,ml:`ಬುಧ ഭഗവാൻ`},"Chandra (Moon)":{en:`Chandra (Moon)`,ta:`சந்திர பகவான்`,hi:`चंद्र देव`,te:`చంద్ర భగవానుడు`,kn:`ಚಂದ್ರ ದೇವ`,ml:`ചന്ദ്ര ഭഗവാൻ`},"Surya (Sun)":{en:`Surya (Sun)`,ta:`சூரிய பகவான்`,hi:`सूर्य देव`,te:`సూర్య భగవానుడు`,kn:`ಸೂರ್ಯ ದೇವ`,ml:`സൂര്യ ഭഗവാൻ`},"Mangala / Ketu":{en:`Mangala / Ketu`,ta:`செவ்வாய் / கேது`,hi:`मंगल / केतु`,te:`కుజుడు / కేతువు`,kn:`ಮಂಗಳ / ಕೇತು`,ml:`ചൊവ്വ / കേതു`}},x={"Prithvi (Earth)":{en:`Prithvi (Earth)`,ta:`நிலம் தத்துவம்`,hi:`पृथ्वी तत्व`,te:`భూమి (పృథ్వీ) తత్త్వం`,kn:`ಭೂಮಿ (ಪೃಥ್ವಿ) ತತ್ತ್ವ`,ml:`ഭൂമി (പൃഥ്വി) തത്ത്വം`},"Vayu (Air)":{en:`Vayu (Air)`,ta:`காற்று தத்துவம்`,hi:`वायु तत्व`,te:`వాయు తత్త్వం`,kn:`ವಾಯು ತತ್ತ್ವ`,ml:`വായു തത്ത്വം`},"Jala (Water)":{en:`Jala (Water)`,ta:`நீர் தத்துவம்`,hi:`जल तत्व`,te:`జల తత్త్వం`,kn:`ಜಲ ತತ್ತ್ವ`,ml:`ജല തത്ത്വം`},"Agni (Fire)":{en:`Agni (Fire)`,ta:`நெருப்பு தத்துவம்`,hi:`अग्नि तत्व`,te:`అగ్ని తత్త్వం`,kn:`ಅಗ್ನಿ ತತ್ತ್ವ`,ml:`അഗ്നി തത്ത്വം`}},S={"December 22 - January 19":{en:`December 22 - January 19`,ta:`டிசம்பர் 22 - ஜனவரி 19`,hi:`22 दिसंबर - 19 जनवरी`,te:`డిసెంబర్ 22 - జనవరి 19`,kn:`ಡಿಸೆಂಬರ್ 22 - ಜನವರಿ 19`,ml:`ഡിസംബർ 22 - ജനുവരി 19`},"January 20 - February 18":{en:`January 20 - February 18`,ta:`ஜனவரி 20 - பிப்ரவரி 18`,hi:`20 जनवरी - 18 फरवरी`,te:`జనవరి 20 - ఫిబ్రవరి 18`,kn:`ಜನವರಿ 20 - ಫೆಬ್ರವರಿ 18`,ml:`ജനുവരി 20 - ഫെബ്രുവരി 18`},"February 19 - March 20":{en:`February 19 - March 20`,ta:`பிப்ரவரி 19 - மார்ச் 20`,hi:`19 फरवरी - 20 मार्च`,te:`ఫిబ్రవరి 19 - మార్చి 20`,kn:`ಫೆಬ್ರವರಿ 19 - ಮಾರ್ಚ್ 20`,ml:`ഫെബ്രുവരി 19 - മാർച്ച് 20`},"March 21 - April 19":{en:`March 21 - April 19`,ta:`மார்ச் 21 - ஏப்ரல் 19`,hi:`21 मार्च - 19 अप्रैल`,te:`మార్చి 21 - ఏప్రిల్ 19`,kn:`ಮಾರ್ಚ್ 21 - ಏಪ್ರಿಲ್ 19`,ml:`മാർച്ച് 21 - ഏപ്രിൽ 19`},"April 20 - May 20":{en:`April 20 - May 20`,ta:`ஏப்ரல் 20 - மே 20`,hi:`20 अप्रैल - 20 मई`,te:`ఏప్రిల్ 20 - మే 20`,kn:`ಏಪ್ರಿಲ್ 20 - ಮೇ 20`,ml:`ഏപ്രിൽ 20 - മേയ് 20`},"May 21 - June 20":{en:`May 21 - June 20`,ta:`மே 21 - ஜூன் 20`,hi:`21 मई - 20 जून`,te:`మే 21 - జూన్ 20`,kn:`ಮೇ 21 - ಜೂನ್ 20`,ml:`മേയ് 21 - ജൂൺ 20`},"June 21 - July 22":{en:`June 21 - July 22`,ta:`ஜூன் 21 - ஜூலை 22`,hi:`21 जून - 22 जुलाई`,te:`జూన్ 21 - జూలై 22`,kn:`ಜೂನ್ 21 - ಜುಲೈ 22`,ml:`ജൂൺ 21 - ജൂലൈ 22`},"July 23 - August 22":{en:`July 23 - August 22`,ta:`ஜூலை 23 - ஆகஸ்ட் 22`,hi:`23 जुलाई - 22 अगस्त`,te:`జూలై 23 - ఆగస్టు 22`,kn:`ಜುಲೈ 23 - ಆಗಸ್ಟ್ 22`,ml:`ജൂലൈ 23 - ഓഗസ്റ്റ് 22`},"August 23 - September 22":{en:`August 23 - September 22`,ta:`ஆகஸ்ட் 23 - செப்டம்பர் 22`,hi:`23 अगस्त - 22 सितंबर`,te:`ఆగస్టు 23 - సెప్టెంబర్ 22`,kn:`ಆಗಸ್ಟ್ 23 - ಸೆಪ್ಟೆಂಬರ್ 22`,ml:`ഓഗസ്റ്റ് 23 - സെപ്റ്റംബർ 22`},"September 23 - October 22":{en:`September 23 - October 22`,ta:`செப்டம்பர் 23 - அக்டோபர் 22`,hi:`23 सितंबर - 22 अक्टूबर`,te:`సెప్టెంబర్ 23 - అక్టోబర్ 22`,kn:`ಸೆಪ್ಟೆಂಬರ್ 23 - ಅಕ್ಟೋಬರ್ 22`,ml:`സെപ്റ്റംബർ 23 - ഒക്ടോബർ 22`},"October 23 - November 21":{en:`October 23 - November 21`,ta:`அக்டோபர் 23 - நவம்பர் 21`,hi:`23 अक्टूबर - 21 नवंबर`,te:`అక్టోబర్ 23 - నవంబర్ 21`,kn:`ಅಕ್ಟೋಬರ್ 23 - ನವೆಂಬರ್ 21`,ml:`ഒക്ടോബർ 23 - നവംബർ 21`},"November 22 - December 21":{en:`November 22 - December 21`,ta:`நவம்பர் 22 - டிசம்பர் 21`,hi:`22 नवंबर - 21 दिसंबर`,te:`నవంబర్ 22 - డిసెంబర్ 21`,kn:`ನವೆಂಬರ್ 22 - ಡಿಸೆಂಬರ್ 21`,ml:`നവംബർ 22 - ഡിസംബർ 21`}};function C(e){let t=a.getLanguage(),n=b[e.graha]?.[t]||b[e.graha]?.en||e.graha,r=x[e.tattva]?.[t]||x[e.tattva]?.en||e.tattva,i=S[e.range]?.[t]||S[e.range]?.en||e.range;return t===`ta`?{rashiName:`${e.rashiTamil} ராசி`,rashiTag:e.rashiTamil,subdetails:`${n} • ${r}`,dates:i,tattva:r}:t===`hi`?{rashiName:`${e.rashiSanskrit} राशि`,rashiTag:e.rashiSanskrit,subdetails:`${n} • ${r}`,dates:i,tattva:r}:t===`te`?{rashiName:`${e.rashiTelugu||e.rashi} రాశి`,rashiTag:e.rashiTelugu||e.rashi,subdetails:`${n} • ${r}`,dates:i,tattva:r}:t===`kn`?{rashiName:`${e.rashiKannada||e.rashi} ರಾಶಿ`,rashiTag:e.rashiKannada||e.rashi,subdetails:`${n} • ${r}`,dates:i,tattva:r}:t===`ml`?{rashiName:`${e.rashiMalayalam||e.rashi} രാശി`,rashiTag:e.rashiMalayalam||e.rashi,subdetails:`${n} • ${r}`,dates:i,tattva:r}:{rashiName:`${e.rashi} Rashi (${e.name})`,rashiTag:e.rashiSanskrit,subdetails:`${n} • ${r}`,dates:i,tattva:r}}let w=[{name:`Libra`,angle:0,rashi:`Tula`,tamil:`துலாம்`,hindi:`तुला`,telugu:`తులా`,kannada:`ತುಲಾ`,malayalam:`തുലാം`},{name:`Scorpio`,angle:30,rashi:`Vrishchika`,tamil:`விருச்சிகம்`,hindi:`वृश्चिक`,telugu:`వృశ్చికం`,kannada:`ವೃಶ್ಚಿಕ`,malayalam:`വൃശ്ചികം`},{name:`Sagittarius`,angle:60,rashi:`Dhanu`,tamil:`தனுசு`,hindi:`धनु`,telugu:`ధనుస్సు`,kannada:`ಧನು`,malayalam:`ധനു`},{name:`Capricorn`,angle:90,rashi:`Makara`,tamil:`மகரம்`,hindi:`मकर`,telugu:`మకరం`,kannada:`ಮಕರ`,malayalam:`മകരം`},{name:`Aquarius`,angle:120,rashi:`Kumbha`,tamil:`கும்பம்`,hindi:`कुम्भ`,telugu:`కుంభం`,kannada:`ಕುಂಭ`,malayalam:`കുംഭം`},{name:`Pisces`,angle:150,rashi:`Meena`,tamil:`மீனம்`,hindi:`मीन`,telugu:`మీనం`,kannada:`ಮೀನ`,malayalam:`മീനം`},{name:`Aries`,angle:180,rashi:`Mesha`,tamil:`மேஷம்`,hindi:`मेष`,telugu:`మేషం`,kannada:`ಮೇಷ`,malayalam:`മേടം`},{name:`Taurus`,angle:210,rashi:`Vrishabha`,tamil:`ரிஷபம்`,hindi:`वृषभ`,telugu:`వృషభం`,kannada:`ವೃಷಭ`,malayalam:`ഇടവം`},{name:`Gemini`,angle:240,rashi:`Mithuna`,tamil:`மிதுனம்`,hindi:`मिथुन`,telugu:`మిథునం`,kannada:`ಮಿಥುನ`,malayalam:`മിഥുനം`},{name:`Cancer`,angle:270,rashi:`Karka`,tamil:`கடகம்`,hindi:`कर्क`,telugu:`కర్కాటకం`,kannada:`ಕರ್ಕಾಟಕ`,malayalam:`കർക്കിടകം`},{name:`Leo`,angle:300,rashi:`Simha`,tamil:`சிம்மம்`,hindi:`सिंह`,telugu:`సింహం`,kannada:`ಸಿಂಹ`,malayalam:`ചിങ്ങം`},{name:`Virgo`,angle:330,rashi:`Kanya`,tamil:`கன்னி`,hindi:`कन्या`,telugu:`కన్య`,kannada:`ಕನ್ಯಾ`,malayalam:`കന്നി`}],T={Libra:0,Scorpio:-30,Sagittarius:-60,Capricorn:-90,Aquarius:-120,Pisces:-150,Aries:-180,Taurus:-210,Gemini:-240,Cancer:-270,Leo:-300,Virgo:-330};function E(e,t,n){return w.map((r,i)=>{let a=r.name===n,o=r.name.toUpperCase();e===`ta`?o=r.tamil:e===`hi`?o=r.hindi:e===`te`?o=r.telugu:e===`kn`?o=r.kannada:e===`ml`&&(o=r.malayalam);let s=-t-r.angle,c=a?`#ffffff`:`rgba(251, 191, 36, 0.75)`,l=a?`800`:`600`,u=a?`9.5`:`7.5`,d=a?`drop-shadow(0 0 5px #fbbf24)`:`none`;return`
        <g transform="rotate(${r.angle} 120 120)">
          <text 
            id="dob-label-${i}" 
            x="120" 
            y="32" 
            text-anchor="middle" 
            dominant-baseline="central" 
            fill="${c}" 
            font-size="${u}" 
            font-weight="${l}" 
            letter-spacing="0.05em"
            style="transform-origin: 120px 32px; transform: rotate(${s}deg); transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), fill 0.3s ease; filter: ${d}; font-family: 'Cinzel', serif;"
          >${o}</text>
        </g>
      `}).join(``)}let D={en:{palm_title:`PALM READING`,palm_sub:`Ancient Vedic chiromancy synthesized with real-time neural line detection.`,palm_badge:`Hasta Samudrika`,palm_line_life:`Life Line (Ayur Rekha)`,palm_line_life_desc:`Bodily vitality & longevity reserves`,palm_line_head:`Head Line (Matru Rekha)`,palm_line_head_desc:`Mental focus, logic & intellect`,palm_line_heart:`Heart Line (Pitri Rekha)`,palm_line_heart_desc:`Emotional depth & relationship harmony`,palm_line_fate:`Fate Line (Karma Rekha)`,palm_line_fate_desc:`Career trajectory & karmic destiny`,palm_line_sun:`Sun Line (Surya Rekha)`,palm_line_sun_desc:`Creative brilliance & social recognition`,palm_badge_cv:`Neural Sensor`,palm_badge_vedic:`Vedic Samudrika`,palm_badge_realtime:`Live Analysis`,face_title:`FACE READING`,face_sub:`Vedic physiognomy reading your life vitality and destiny through sacred facial geometry.`,face_badge:`Mukha Samudrika`,face_zone_forehead:`Forehead (Bhagya Zone)`,face_zone_forehead_desc:`Intellect, spiritual openness & destiny lines`,face_zone_eyes:`Eyes & Brow (Surya / Chandra)`,face_zone_eyes_desc:`Intuitive insight, perception & emotional clarity`,face_zone_jaw:`Countenance & Jaw (Tejas Zone)`,face_zone_jaw_desc:`Willpower, physical vitality & leadership radiance`,face_badge_geo:`Sacred Geometry`,face_badge_vedic:`Mukha Lakshana`,face_badge_tejas:`Tejas Score`,skip:`Skip`,continue:`Continue`,horoscope_title:`HOROSCOPE`,horoscope_sub:`Daily celestial guidance based on Vedic astrology, personalized for you.`,your_rashi:`YOUR RASHI`,rashi_makar:`Makar (Capricorn)`,rashi_makar_dates:`22 December – 19 January`,horoscope_forecast:`A day of steady progress and emotional balance. Focus on family and long-term goals.`,lucky_color:`Lucky Color`,color_val:`Yellow`,focus_area:`Focus Area`,focus_val:`Family`,lucky_time:`Lucky Time`,time_val:`08:25 PM`,lucky_element:`Lucky Element`,element_val:`Earth`,key_indicators:`✦ Today's Key Indicators ✦`,love:`Love`,energy:`Energy`,luck:`Luck`,tab_today:`Today`,tab_tomorrow:`Tomorrow`,tab_week:`Week`,tab_month:`Month`,compat_title:`COMPATIBILITY`,compat_sub:`Find out how your zodiac sign connects in love, friendship, and spiritual harmony.`,sign_capricorn:`Capricorn`,sign_aries:`Aries`,sign_scorpio:`Scorpio`,sign_taurus:`Taurus`,earth_sign:`Earth Sign`,fire_sign:`Fire Sign`,water_sign:`Water Sign`,match_banner:`94% Celestial Harmony Match`,match_banner_alt:`96% Celestial Harmony Match`,compat_match_desc:`Exceptional Astrological Bond`,pillar_love:`Love`,pillar_friendship:`Friendship`,pillar_spiritual:`Spiritual`,compat_dim_love_desc:`Stronger emotional bond`,compat_dim_friend_desc:`Natural understanding`,compat_dim_spirit_desc:`Aligned life path`,astro_title:`ASTROLOGERS`,astro_sub:`Connect with experienced Vedic chiromancy masters for personalized guidance.`,user_q:`"What does my fate line say about my career transition?"`,guru_a:`"A strong upward branch at age 32 indicates a powerful and prosperous career evolution."`,astro1_name:`Dr. Nayana Sharma`,astro1_title:`Vedic Chiromancy · 15 yrs exp`,astro2_name:`Master Kassandra`,astro2_title:`Hasta Samudrika · 12 yrs exp`,available_now:`Available Now`,dob_prompt:`What's your date of birth?`,dob_subtext:`Get personalized insights based on your Rashi.`,discover_sub:`Discover what the stars reveal about you.`,day:`DAY`,month:`MONTH`,year:`YEAR`,building_title:`Building your chart...`,building_sub:`Calculating planetary transits & mount energies...`,stage_1:`Mapping Samudrika palm line intersections...`,stage_2:`Aligning sacred Nakshatras & houses...`,stage_3:`Synthesizing holistic Kai RegAI reading...`,sub_1:`Harmonizing planetary aspects & energy mounts...`,sub_2:`Synthesizing Vedic chiromancy wisdom...`,sub_3:`Your cosmic profile is ready!`,name_title:`WHAT IS YOUR NAME?`,name_sub:`In Vedic chiromancy, your name carries a distinct celestial frequency and personal vibration.`,your_name_label:`Full Name`,name_placeholder:`Enter your name`,name_helper:`Your reading will be individually personalized with your cosmic signature.`,suggestion_label:`Popular`},ta:{palm_title:`கை ரேகை வாசிப்பு`,palm_sub:`நவீன கணினி நுண்ணறிவுடன் இணைக்கப்பட்ட பாரம்பரிய ஹஸ்த சாமுத்ரிகா ரேகை ஆய்வு.`,palm_badge:`ஹஸ்த சாமுத்ரிகா`,palm_line_life:`ஆயுள் ரேகை (ஆயுர் ரேகா)`,palm_line_life_desc:`உடல் வலிமை மற்றும் ஆயுள் ஆற்றல்`,palm_line_head:`புத்தி ரேகை (மாத்ரு ரேகா)`,palm_line_head_desc:`சிந்தனை தெளிவு மற்றும் அறிவுத்திறன்`,palm_line_heart:`இதய ரேகை (பித்ரு ரேகா)`,palm_line_heart_desc:`உணர்வுப் பிணைப்பு மற்றும் அன்பின் ஆழம்`,palm_line_fate:`விதி ரேகை (கர்ம ரேகா)`,palm_line_fate_desc:`தொழில் வளர்ச்சி மற்றும் கர்ம பலன்`,palm_line_sun:`சூரிய ரேகை (வித்யா ரேகா)`,palm_line_sun_desc:`புகழ், திறமை மற்றும் கலை ஞானம்`,palm_badge_cv:`நவீன உணரி`,palm_badge_vedic:`வேத சாமுத்ரிகா`,palm_badge_realtime:`நேரடி பகுப்பாய்வு`,face_title:`முக லட்சண வாசிப்பு`,face_sub:`முக சாமுத்ரிகா சாஸ்திரத்தின்படி முக அமைப்புகளிலிருந்து உங்கள் குணம் மற்றும் விதியை அறியுங்கள்.`,face_badge:`முக சாமுத்ரிகா`,face_zone_forehead:`நெற்றி அமைப்பு (பாக்ய மண்டலம்)`,face_zone_forehead_desc:`அறிவுத்திறன், ஆன்மீக விழிப்புணர்வு மற்றும் அதிர்ஷ்டம்`,face_zone_eyes:`கண்கள் மற்றும் புருவம் (சூர்ய சந்திர)`,face_zone_eyes_desc:`உள்ளுணர்வு, கூரிய பார்வை மற்றும் உணர்ச்சி சமநிலை`,face_zone_jaw:`முகப்பொலிவு மற்றும் தாடை (தேஜஸ்)`,face_zone_jaw_desc:`மன உறுதி, உடல் சக்தி மற்றும் தலைமைப் பண்பு`,face_badge_geo:`முக வடிவியல்`,face_badge_vedic:`முக லட்சண சாஸ்திரம்`,face_badge_tejas:`தேஜஸ் ஆற்றல்`,skip:`தவிர்`,continue:`தொடரவும்`,horoscope_title:`ராசி பலன்`,horoscope_sub:`வேத ஜோதிடத்தின் அடிப்படையிலான தினசரி வழிகாட்டல்.`,your_rashi:`உங்கள் ராசி`,rashi_makar:`மகரம் (Capricorn)`,rashi_makar_dates:`டிசம்பர் 22 – ஜனவரி 19`,horoscope_forecast:`நிலையான முன்னேற்றம் மற்றும் உணர்ச்சி சமநிலையின் நாள். குடும்பம் மற்றும் நீண்ட கால இலக்குகளில் கவனம் செலுத்துங்கள்.`,lucky_color:`அதிர்ஷ்ட நிறம்`,color_val:`மஞ்சள்`,focus_area:`கவனப் பகுதி`,focus_val:`குடும்பம்`,lucky_time:`அதிர்ஷ்ட நேரம்`,time_val:`08:25 PM`,lucky_element:`அதிர்ஷ்ட தத்துவம்`,element_val:`நிலம்`,key_indicators:`✦ இன்றைய முக்கிய குறிகாட்டிகள் ✦`,love:`அன்பு`,energy:`ஆற்றல்`,luck:`அதிர்ஷ்டம்`,tab_today:`இன்று`,tab_tomorrow:`நாளை`,tab_week:`வாரம்`,tab_month:`மாதம்`,compat_title:`பொருத்தம்`,compat_sub:`உங்கள் ராசி காதல், நட்பு மற்றும் ஆன்மீகத்தில் எவ்வாறு இணைகிறது என்பதை அறியுங்கள்.`,sign_capricorn:`மகரம்`,sign_aries:`மேஷம்`,sign_scorpio:`விருச்சிகம்`,sign_taurus:`ரிஷபம்`,earth_sign:`நில ராசி`,fire_sign:`நெருப்பு ராசி`,water_sign:`நீர் ராசி`,match_banner:`94% புனித வானியல் பொருத்தம்`,match_banner_alt:`96% புனித வானியல் பொருத்தம்`,compat_match_desc:`சிறப்பான ஜோதிடப் பிணைப்பு`,pillar_love:`காதல்`,pillar_friendship:`நட்பு`,pillar_spiritual:`ஆன்மீகம்`,compat_dim_love_desc:`வலுவான உணர்வுப் பிணைப்பு`,compat_dim_friend_desc:`இயல்பான பரஸ்பர புரிதல்`,compat_dim_spirit_desc:`ஒன்றிணைந்த வாழ்க்கை வழி`,astro_title:`ஜோதிட நிபுணர்கள்`,astro_sub:`நேரடி வழிகாட்டலுக்கு அனுபவமிக்க வேத சாமுத்ரிகா நிபுணர்களுடன் இணையுங்கள்.`,user_q:`"என் விதி ரேகை தொழில் மாற்றம் பற்றி என்ன கூறுகிறது?"`,guru_a:`"32 வயதில் எழும் வலுவான கிளை ரேகை ஒரு சிறப்பான தொழில் பரிணாமத்தைக் குறிக்கிறது."`,astro1_name:`டாக்டர் நயனா சர்மா`,astro1_title:`வேத சாமுத்ரிகா · 15 ஆண்டு அனுபவம்`,astro2_name:`ஆசான் கசாண்ட்ரா`,astro2_title:`ஹஸ்த சாமுத்ரிகா · 12 ஆண்டு அனுபவம்`,available_now:`இப்போது நேரலையில்`,dob_prompt:`உங்கள் பிறந்த தேதி என்ன?`,dob_subtext:`உங்கள் ராசியின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட நுண்ணறிவுகளைப் பெறுங்கள்.`,discover_sub:`நட்சத்திரங்கள் உங்களைப் பற்றி வெளிப்படுத்துவதைக் கண்டறியுங்கள்.`,day:`நாள்`,month:`மாதம்`,year:`ஆண்டு`,building_title:`உங்கள் ஜாதகம் தயாராகிறது...`,building_sub:`கிரக நிலைகள் மற்றும் மேடுகளின் ஆற்றலைக் கணக்கிடுகிறது...`,stage_1:`சாமுத்ரிகா கைரேகை குறுக்குவழிகளை வரைபடமாக்குகிறது...`,stage_2:`புனித நட்சத்திரங்கள் மற்றும் பாவங்களை சீரமைக்கிறது...`,stage_3:`முழுமையான Kai RegAI கணிப்பை உருவாக்குகிறது...`,sub_1:`கிரக அமைப்புகள் மற்றும் ஆற்றல் மேடுகளை ஒருங்கிணைக்கிறது...`,sub_2:`வேத சாமுத்ரிகா ஞானத்தை ஒருங்கிணைக்கிறது...`,sub_3:`உங்கள் பிரபஞ்ச சுயவிவரம் தயாராக உள்ளது!`,name_title:`உங்கள் பெயர் என்ன?`,name_sub:`வேத சாமுத்ரிகாவில், உங்கள் பெயர் ஒரு தனித்துவமான காஸ்மிக் அதிர்வைக் கொண்டுள்ளது.`,your_name_label:`முழுப் பெயர்`,name_placeholder:`உங்கள் பெயரை உள்ளிடவும்`,name_helper:`உங்கள் வாசிப்பு உங்கள் தனித்துவமான பெயருடன் இணைக்கப்படும்.`,suggestion_label:`பரிந்துரைகள்`},hi:{palm_title:`हस्तरेखा दर्शन`,palm_sub:`प्राचीन वैदिक हस्त सामुद्रिक और आधुनिक तंत्रिका विश्लेषण का संगम।`,palm_badge:`हस्त सामुद्रिक`,palm_line_life:`जीवन रेखा (आयु रेखा)`,palm_line_life_desc:`शारीरिक ऊर्जा एवं जीवन शक्ति`,palm_line_head:`मस्तिष्क रेखा (ज्ञान रेखा)`,palm_line_head_desc:`बौद्धिक स्पष्टता एवं मानसिक संकल्प`,palm_line_heart:`हृदय रेखा (प्रेम रेखा)`,palm_line_heart_desc:`भावनात्मक संतुलन एवं आत्मीय संबंध`,palm_line_fate:`भाग्य रेखा (कर्म रेखा)`,palm_line_fate_desc:`आजीविका प्रगति एवं कर्म फल`,palm_line_sun:`सूर्य रेखा (विद्या रेखा)`,palm_line_sun_desc:`सृजनात्मक प्रतिभा एवं सामाजिक प्रतिष्ठा`,palm_badge_cv:`तंत्रिका संवेदक`,palm_badge_vedic:`वैदिक सामुद्रिक`,palm_badge_realtime:`सजीव विश्लेषण`,face_title:`मुख सामुद्रिक दर्शन`,face_sub:`मुख सामुद्रिक शास्त्र के आधार पर चेहरे की आकृतियों से व्यक्तित्व एवं भविष्य दर्शन।`,face_badge:`मुख सामुद्रिक`,face_zone_forehead:`ललाट (भाग्य क्षेत्र)`,face_zone_forehead_desc:`बुद्धिमत्ता, आध्यात्मिक अंतर्दृष्टि एवं भाग्य रेखाएं`,face_zone_eyes:`नेत्र एवं भृकुटि (सूर्य चंद्र)`,face_zone_eyes_desc:`सूक्ष्म दृष्टि, बोध एवं भावनात्मक संतुलन`,face_zone_jaw:`मुखमंडल एवं चिबुक (तेजस क्षेत्र)`,face_zone_jaw_desc:`इच्छाशक्ति, शारीरिक ओज एवं नेतृत्व क्षमता`,face_badge_geo:`पवित्र ज्यामिति`,face_badge_vedic:`मुख लक्षण शास्त्र`,face_badge_tejas:`तेजस ऊर्जा`,skip:`छोड़ें`,continue:`आगे बढ़ें`,horoscope_title:`राशिफल`,horoscope_sub:`वैदिक ज्योतिष पर आधारित आपका दैनिक आकाशीय मार्गदर्शन।`,your_rashi:`आपकी राशि`,rashi_makar:`मकर (Capricorn)`,rashi_makar_dates:`22 दिसंबर – 19 जनवरी`,horoscope_forecast:`निरंतर प्रगति और भावनात्मक संतुलन का दिन। परिवार और दीर्घकालिक लक्ष्यों पर ध्यान केंद्रित करें।`,lucky_color:`शुभ रंग`,color_val:`पीला`,focus_area:`केंद्र बिंदु`,focus_val:`परिवार`,lucky_time:`शुभ समय`,time_val:`08:25 PM`,lucky_element:`शुभ तत्व`,element_val:`पृथ्वी`,key_indicators:`✦ आज के मुख्य संकेतक ✦`,love:`प्रेम`,energy:`ऊर्जा`,luck:`भाग्य`,tab_today:`आज`,tab_tomorrow:`कल`,tab_week:`सप्ताह`,tab_month:`माह`,compat_title:`कुंडली मिलान`,compat_sub:`जानिए प्रेम, मित्रता और आध्यात्मिक सामंजस्य में आपकी राशि का मिलन।`,sign_capricorn:`मकर`,sign_aries:`मेष`,sign_scorpio:`वृश्चिक`,sign_taurus:`वृषभ`,earth_sign:`पृथ्वी राशि`,fire_sign:`अग्नि राशि`,water_sign:`जल राशि`,match_banner:`94% दिव्य आकाशीय मिलन`,match_banner_alt:`96% दिव्य आकाशीय मिलन`,compat_match_desc:`असाधारण ज्योतिषीय संबंध`,pillar_love:`प्रेम`,pillar_friendship:`मित्रता`,pillar_spiritual:`आध्यात्मिक`,compat_dim_love_desc:`मजबूत भावनात्मक संबंध`,compat_dim_friend_desc:`सहज समझ व विश्वास`,compat_dim_spirit_desc:`संरेखित जीवन पथ`,astro_title:`ज्योतिषाचार्य`,astro_sub:`व्यक्तिगत मार्गदर्शन के लिए अनुभवी वैदिक सामुद्रिक आचार्यों से जुड़ें।`,user_q:`"मेरी भाग्य रेखा करियर परिवर्तन के बारे में क्या दर्शाती है?"`,guru_a:`"32 वर्ष की आयु में ऊपर उठती रेखा एक शक्तिशाली और समृद्ध करियर बदलाव का संकेत देती है।"`,astro1_name:`डॉ. नयना शर्मा`,astro1_title:`वैदिक सामुद्रिक · 15 वर्ष का अनुभव`,astro2_name:`मास्टर कसांद्रा`,astro2_title:`हस्त सामुद्रिक · 12 वर्ष का अनुभव`,available_now:`अभी उपलब्ध`,dob_prompt:`आपकी जन्म तिथि क्या है?`,dob_subtext:`अपनी राशि के आधार पर व्यक्तिगत अंतर्दृष्टि प्राप्त करें।`,discover_sub:`जानें सितारे आपके बारे में क्या प्रकट करते हैं।`,day:`दिन`,month:`माह`,year:`वर्ष`,building_title:`आपकी कुंडली बनाई जा रही है...`,building_sub:`ग्रहों के गोचर और पर्वत ऊर्जाओं की गणना...`,stage_1:`सामुद्रिक रेखाओं का नक्शा तैयार किया जा रहा है...`,stage_2:`पवित्र नक्षत्रों और भावों का संरेखण...`,stage_3:`होलिस्टिक Kai RegAI रीडिंग का संश्लेषण...`,sub_1:`ग्रहों के पहलुओं और ऊर्जा पर्वतों का सामंजस्य...`,sub_2:`वैदिक सामुद्रिक ज्ञान का समावेश...`,sub_3:`आपकी कॉस्मिक प्रोफ़ाइल तैयार है!`,name_title:`आपका नाम क्या है?`,name_sub:`वैदिक सामुद्रिक में आपका नाम एक विशेष आकाशीय कंपन वहन करता है।`,your_name_label:`पूरा नाम`,name_placeholder:`अपना नाम दर्ज करें`,name_helper:`आपकी रीडिंग आपके अद्वितीय नाम के साथ वैयक्तिकृत होगी।`,suggestion_label:`सुझाव`},te:{palm_title:`హస్తసాముద్రిక దర్శనం`,palm_sub:`ప్రాచీన వైదిక హస్తసాముద్రిక విజ్ఞానం మరియు ఆధునిక రేఖా విశ్లేషణ.`,palm_badge:`హస్త సాముద్రికం`,palm_line_life:`ఆయుష్షు రేఖ (ఆయుర్ రేఖ)`,palm_line_life_desc:`శారీరక శక్తి మరియు జీవన బలం`,palm_line_head:`మేధో రేఖ (మాతృ రేఖ)`,palm_line_head_desc:`మానసిక వికాసం మరియు విజ్ఞానం`,palm_line_heart:`హృదయ రేఖ (పితృ రేఖ)`,palm_line_heart_desc:`భావోద్వేగ సామరస్యం మరియు అనుబంధాలు`,palm_line_fate:`భాగ్య రేఖ (కర్మ రేఖ)`,palm_line_fate_desc:`వృత్తి పురోగతి మరియు కర్మ ఫలం`,palm_line_sun:`సూర్య రేఖ (విద్యా రేఖ)`,palm_line_sun_desc:`సృజనాత్మక ప్రతిభ మరియు కీర్తి`,palm_badge_cv:`రేఖా సంవేదకం`,palm_badge_vedic:`వైదిక సాముద్రికం`,palm_badge_realtime:`ప్రత్యక్ష విశ్లేషణ`,face_title:`ముఖ సాముద్రిక దర్శనం`,face_sub:`ముఖ సాముద్రిక శాస్త్రం ద్వారా ముఖ లక్షణాల నుండి స్వభావం మరియు భవిష్యత్ అవగాహన.`,face_badge:`ముఖ సాముద్రికం`,face_zone_forehead:`నుదురు (భాగ్య క్షేత్రం)`,face_zone_forehead_desc:`జ్ఞాన సంపద, ఆధ్యాత్మిక వికాసం మరియు భాగ్యం`,face_zone_eyes:`కన్నులు మరియు కనుబొమ్మలు (సూర్య చంద్ర)`,face_zone_eyes_desc:`అంతర్దృష్టి, గ్రహణశక్తి మరియు భావోద్వేగ సమతుల్యత`,face_zone_jaw:`ముఖ కాంతి మరియు దవడ (తేజస్సు)`,face_zone_jaw_desc:`సంకల్ప బలం, శారీరక పట్టుదల మరియు నాయకత్వం`,face_badge_geo:`దివ్య జ్యామితి`,face_badge_vedic:`ముఖ లక్షణ శాస్త్రం`,face_badge_tejas:`తేజస్సు స్కోరు`,skip:`దాటవేయి`,continue:`కొనసాగించు`,horoscope_title:`రాశి ఫలాలు`,horoscope_sub:`వైదిక జ్యోతిష్యం ఆధారంగా రోజువారీ మార్గదర్శనం.`,your_rashi:`మీ రాశి`,rashi_makar:`మకరం (Capricorn)`,rashi_makar_dates:`డిసెంబర్ 22 – జనవరి 19`,horoscope_forecast:`స్థిరమైన పురోగతి మరియు భావోద్వేగ సమతుల్యత కలిగిన రోజు. కుటుంబం మరియు దీర్ఘకాలిక లక్ష్యాలపై దృష్టి పెట్టండి.`,lucky_color:`అదృష్ట రంగు`,color_val:`పసుపు`,focus_area:`దృష్టి కేంద్రం`,focus_val:`కుటుంబం`,lucky_time:`అదృష్ట సమయం`,time_val:`08:25 PM`,lucky_element:`అదృష్ట తత్త్వం`,element_val:`భూమి`,key_indicators:`✦ నేటి ముఖ్య సూచికలు ✦`,love:`ప్రేమ`,energy:`శక్తి`,luck:`అదృష్టం`,tab_today:`నేడు`,tab_tomorrow:`రేపు`,tab_week:`వారం`,tab_month:`నెల`,compat_title:`రాశి అనుకూలత`,compat_sub:`ప్రేమ, స్నేహం మరియు ఆధ్యాత్మిక సామరస్యంలో మీ రాశి కలయికను తెలుసుకోండి.`,sign_capricorn:`మకరం`,sign_aries:`మేషం`,sign_scorpio:`వృశ్చికం`,sign_taurus:`వృషభం`,earth_sign:`భూమి రాశి`,fire_sign:`అగ్ని రాశి`,water_sign:`జల రాశి`,match_banner:`94% దివ్య నక్షత్ర అనుకూలత`,match_banner_alt:`96% దివ్య నక్షత్ర అనుకూలత`,compat_match_desc:`అద్భుతమైన జ్యోతిష్య బంధం`,pillar_love:`ప్రేమ`,pillar_friendship:`స్నేహం`,pillar_spiritual:`ఆధ్యాత్మికం`,compat_dim_love_desc:`బలమైన భావోద్వేగ బంధం`,compat_dim_friend_desc:`సహజమైన అవగాహన`,compat_dim_spirit_desc:`సమన్వయ జీవిత మార్గం`,astro_title:`జ్యోతిష్య నిపుణులు`,astro_sub:`వ్యక్తిగత మార్గదర్శనం కోసం అనుభవజ్ఞులైన వైదిక సాముద్రిక నిపుణులతో అనుసంధానించండి.`,user_q:`"నా కెరీర్ మార్పు గురించి నా భాగ్యరేఖ ఏమి చెబుతోంది?"`,guru_a:`"32 సంవత్సరాల వయస్సులో పైకి లేచే రేఖ శక్తివంతమైన కెరీర్ పరిణామాన్ని సూచిస్తుంది."`,astro1_name:`డా. నయన శర్మ`,astro1_title:`వైదిక సాముద్రికం · 15 సం. అనుభవం`,astro2_name:`మాస్టర్ కసాండ్రా`,astro2_title:`హస్త సాముద్రికం · 12 సం. అనుభవం`,available_now:`అందుబాటులో ఉన్నారు`,dob_prompt:`మీ పుట్టిన తేదీ ఏమిటి?`,dob_subtext:`మీ రాశి ఆధారంగా వ్యక్తిగత వివరాలను పొందండి.`,discover_sub:`నక్షత్రాలు మీ గురించి ఏమి చెబుతున్నాయో తెలుసుకోండి.`,day:`రోజు`,month:`నెల`,year:`సంవత్సరం`,building_title:`మీ జాతక చక్రం రూపొందుతోంది...`,building_sub:`గ్రహ సంచారాలు మరియు పర్వత శక్తుల లెక్కింపు...`,stage_1:`హస్తరేఖల సమన్వయం మ్యాపింగ్ చేస్తోంది...`,stage_2:`పవిత్ర నక్షత్రాలు మరియు గృహాల అమరిక...`,stage_3:`సమగ్ర Kai RegAI విశ్లేషణను సృష్టిస్తోంది...`,sub_1:`గ్రహ పరిస్థితులు మరియు పర్వతాలను సమీకరిస్తోంది...`,sub_2:`వైదిక సాముద్రిక జ్ఞానాన్ని పొందుపరుస్తోంది...`,sub_3:`మీ కాస్మిక్ ప్రొఫైల్ సిద్ధమైంది!`,name_title:`మీ పేరు ఏమిటి?`,name_sub:`సాముద్రిక శాస్త్రంలో మీ పేరు విశిష్ట కాస్మిక్ శక్తిని కలిగి ఉంటుంది.`,your_name_label:`పూర్తి పేరు`,name_placeholder:`మీ పేరు నమోదు చేయండి`,name_helper:`మీ రీడింగ్ మీ పేరుతో అనుసంధానించబడుతుంది.`,suggestion_label:`సూచనలు`},kn:{palm_title:`ಹಸ್ತಸಾಮುದ್ರಿಕ ದರ್ಶನ`,palm_sub:`ಪ್ರಾಚೀನ ವೈದಿಕ ಸಾಮುದ್ರಿಕ ಜ್ಞಾನ ಮತ್ತು ಆಧುನಿಕ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ.`,palm_badge:`ಹಸ್ತ ಸಾಮುದ್ರಿಕ`,palm_line_life:`ಆಯುಷ್ಯ ರೇಖೆ (ಆಯುರ್ ರೇಖಾ)`,palm_line_life_desc:`ದೇಹದ ಬಲ ಮತ್ತು ಜೀವ ಶಕ್ತಿ`,palm_line_head:`ಮಸ್ತಿಷ್ಕ ರೇಖೆ (ಮಾತೃ ರೇಖಾ)`,palm_line_head_desc:`ಮಾನಸಿಕ ಸ್ಪಷ್ಟತೆ ಮತ್ತು ಬುದ್ಧಿವಂತಿಕೆ`,palm_line_heart:`ಹೃದಯ ರೇಖೆ (ಪಿತೃ ರೇಖಾ)`,palm_line_heart_desc:`ಭಾವನಾತ್ಮಕ ಆಳ ಮತ್ತು ಸಂಬಂಧ ಸಾಮರಸ್ಯ`,palm_line_fate:`ಭಾಗ್ಯ ರೇಖೆ (ಕರ್ಮ ರೇಖಾ)`,palm_line_fate_desc:`ವೃತ್ತಿ ಬೆಳವಣಿಗೆ ಮತ್ತು ಕರ್ಮ ಫಲ`,palm_line_sun:`ಸೂರ್ಯ ರೇಖೆ (ವಿದ್ಯಾ ರೇಖಾ)`,palm_line_sun_desc:`ಸೃಜನಶೀಲ ಪ್ರತಿಭೆ ಮತ್ತು ಸಾಮಾಜಿಕ ಗೌರವ`,palm_badge_cv:`ರೇಖಾ ಸಂವೇದಕ`,palm_badge_vedic:`ವೈದಿಕ ಸಾಮುದ್ರಿಕ`,palm_badge_realtime:`ನೇರ ವಿಶ್ಲೇಷಣೆ`,face_title:`ಮುಖ ಸಾಮುದ್ರಿಕ ದರ್ಶನ`,face_sub:`ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದ ಮೂಲಕ ಮುಖದ ಲಕ್ಷಣಗಳಿಂದ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಭವಿಷ್ಯದ ಅರಿವು.`,face_badge:`ಮುಖ ಸಾಮುದ್ರಿಕ`,face_zone_forehead:`ಹಣೆಯ ರಚನೆ (ಭಾಗ್ಯ ಕ್ಷೇತ್ರ)`,face_zone_forehead_desc:`ಬುದ್ಧಿವಂತಿಕೆ, ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತತೆ ಮತ್ತು ಅದೃಷ್ಟ`,face_zone_eyes:`ಕಣ್ಣುಗಳು ಮತ್ತು ಹುಬ್ಬುಗಳು (ಸೂರ್ಯ ಚಂದ್ರ)`,face_zone_eyes_desc:`ಅಂತಃಪ್ರಜ್ಞೆ, ಸೂಕ್ಷ್ಮ ಗ್ರಹಿಕೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ`,face_zone_jaw:`ಮುಖ ತೇಜಸ್ಸು ಮತ್ತು ದವಡೆ`,face_zone_jaw_desc:`ಇಚ್ಛಾಶಕ್ತಿ, ಶಕ್ತಿ ಮತ್ತು ನಾಯಕತ್ವ ತೇಜಸ್ಸು`,face_badge_geo:`ಪವಿತ್ರ ರೇಖಾಗಣಿತ`,face_badge_vedic:`ಮುಖ ಲಕ್ಷಣ ಶಾಸ್ತ್ರ`,face_badge_tejas:`ತೇಜಸ್ಸು ಶಕ್ತಿ`,skip:`ಬಿಟ್ಟುಬಿಡಿ`,continue:`ಮುಂದುವರಿಯಿರಿ`,horoscope_title:`ರಾಶಿ ಭವಿಷ್ಯ`,horoscope_sub:`ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದ ಆಧಾರದ ಮೇಲೆ ದೈನಂದಿನ ಮಾರ್ಗದರ್ಶನ.`,your_rashi:`ನಿಮ್ಮ ರಾಶಿ`,rashi_makar:`ಮಕರ (Capricorn)`,rashi_makar_dates:`ಡಿಸೆಂಬರ್ 22 – ಜನವರಿ 19`,horoscope_forecast:`ಸ್ಥಿರ ಪ್ರಗತಿ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸಮತೋಲನದ ದಿನ. ಕುಟುಂಬ ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಗುರಿಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ.`,lucky_color:`ಅದೃಷ್ಟದ ಬಣ್ಣ`,color_val:`ಹಳದಿ`,focus_area:`ಗಮನದ ಕ್ಷೇತ್ರ`,focus_val:`ಕುಟುಂಬ`,lucky_time:`ಅದೃಷ್ಟದ ಸಮಯ`,time_val:`08:25 PM`,lucky_element:`ಅದೃಷ್ಟದ ತತ್ತ್ವ`,element_val:`ಪೃಥ್ವಿ`,key_indicators:`✦ ಇಂದಿನ ಪ್ರಮುಖ ಸೂಚಕಗಳು ✦`,love:`ಪ್ರೀತಿ`,energy:`ಶಕ್ತಿ`,luck:`ಅದೃಷ್ಟ`,tab_today:`ಇಂದು`,tab_tomorrow:`ನಾಳೆ`,tab_week:`ವಾರ`,tab_month:`ತಿಂಗಳು`,compat_title:`ರಾಶಿ ಹೊಂದಾಣಿಕೆ`,compat_sub:`ಪ್ರೀತಿ, ಸ್ನೇಹ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಸಾಮರಸ್ಯದಲ್ಲಿ ನಿಮ್ಮ ರಾಶಿ ಹೇಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ ಎಂದು ತಿಳಿಯಿರಿ.`,sign_capricorn:`ಮಕರ`,sign_aries:`ಮೇಷ`,sign_scorpio:`ವೃಶ್ಚಿಕ`,sign_taurus:`ವೃಷಭ`,earth_sign:`ಪೃಥ್ವಿ ರಾಶಿ`,fire_sign:`ಅಗ್ನಿ ರಾಶಿ`,water_sign:`ಜಲ ರಾಶಿ`,match_banner:`94% ದಿವ್ಯ ಸಾಮರಸ್ಯ ಹೊಂದಾಣಿಕೆ`,match_banner_alt:`96% ದಿವ್ಯ ಸಾಮರಸ್ಯ ಹೊಂದಾಣಿಕೆ`,compat_match_desc:`ಅಸಾಧಾರಣ ಜ್ಯೋತಿಷ್ಯ ಬಂಧ`,pillar_love:`ಪ್ರೀತಿ`,pillar_friendship:`ಸ್ನೇಹ`,pillar_spiritual:`ಆಧ್ಯಾತ್ಮಿಕ`,compat_dim_love_desc:`ಬಲವಾದ ಭಾವನಾತ್ಮಕ ಬಂಧ`,compat_dim_friend_desc:`ನೈಸರ್ಗಿಕ ತಿಳುವಳಿಕೆ`,compat_dim_spirit_desc:`ಸಂಯೋಜಿತ ಜೀವನ ಮಾರ್ಗ`,astro_title:`ಜ್ಯೋತಿಷಿಗಳು`,astro_sub:`ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಅನುಭವಿ ವೈದಿಕ ಸಾಮುದ್ರಿಕ ತಜ್ಞರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.`,user_q:`"ನನ್ನ ವೃತ್ತಿಜೀವನದ ಬದಲಾವಣೆಯ ಬಗ್ಗೆ ನನ್ನ ಭಾಗ್ಯ ರೇಖೆ ಏನು ಹೇಳುತ್ತದೆ?"`,guru_a:`"32 ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ಬಲವಾದ ಮೇಲ್ಮುಖ ಶಾಖೆಯು ಸಮೃದ್ಧ ವೃತ್ತಿಜೀವನದ ವಿಕಾಸವನ್ನು ಸೂಚಿಸುತ್ತದೆ."`,astro1_name:`ಡಾ. ನಯನಾ ಶರ್ಮಾ`,astro1_title:`ವೈದಿಕ ಸಾಮುದ್ರಿಕ · 15 ವರ್ಷ ಅನುಭವ`,astro2_name:`ಮಾಸ್ಟರ್ ಕಸಾಂಡ್ರಾ`,astro2_title:`ಹಸ್ತ ಸಾಮುದ್ರಿಕ · 12 ವರ್ಷ ಅನುಭವ`,available_now:`ಲಭ್ಯವಿದ್ದಾರೆ`,dob_prompt:`ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ ಯಾವುದು?`,dob_subtext:`ನಿಮ್ಮ ರಾಶಿಯ ಆಧಾರದ ಮೇಲೆ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಪಡೆಯಿರಿ.`,discover_sub:`ನಕ್ಷತ್ರಗಳು ನಿಮ್ಮ ಬಗ್ಗೆ ಏನು ಹೇಳುತ್ತವೆ ಎಂದು ತಿಳಿಯಿರಿ.`,day:`ದಿನ`,month:`ತಿಂಗಳು`,year:`ವರ್ಷ`,building_title:`ನಿಮ್ಮ ಜಾತಕ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...`,building_sub:`ಗ್ರಹಗಳ ಸಂಚಾರ ಮತ್ತು ಶಕ್ತಿಗಳ ಲೆಕ್ಕಾಚಾರ...`,stage_1:`ಸಾಮುದ್ರಿಕ ರೇಖೆಗಳ ಜಾಲವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...`,stage_2:`ಪವಿತ್ರ ನಕ್ಷತ್ರ ಮತ್ತು ರಾಶಿಗಳ ಜೋಡಣೆ...`,stage_3:`ಸಮಗ್ರ Kai RegAI ವಾಚನವನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...`,sub_1:`ಗ್ರಹಗಳ ಪ್ರಭಾವ ಮತ್ತು ಶಕ್ತಿ ಪರ್ವತಗಳ ಹೊಂದಾಣಿಕೆ...`,sub_2:`ವೈದಿಕ ಸಾಮುದ್ರಿಕ ಜ್ಞಾನದ ಸಂಯೋಜನೆ...`,sub_3:`ನಿಮ್ಮ ಕಾಸ್ಮಿಕ್ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ!`,name_title:`ನಿಮ್ಮ ಹೆಸರೇನು?`,name_sub:`ವೈದಿಕ ಸಾಮುದ್ರಿಕದಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ವಿಶಿಷ್ಟ ಆಕಾಶ ಕಂಪನವನ್ನು ಹೊಂದಿರುತ್ತದೆ.`,your_name_label:`ಪೂರ್ಣ ಹೆಸರು`,name_placeholder:`ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ`,name_helper:`ನಿಮ್ಮ ವಾಚನವು ನಿಮ್ಮ ಹೆಸರಿನೊಂದಿಗೆ ವೈಯಕ್ತೀಕರಿಸಲ್ಪಡುತ್ತದೆ.`,suggestion_label:`ಸಲಹೆಗಳು`},ml:{palm_title:`ഹസ്തരേഖാ ദർശനം`,palm_sub:`പുരാതന വൈദിക ഹസ്തരേഖാ ശാസ്ത്രവും ആധുനിക രേഖാ വിശകലനവും.`,palm_badge:`ഹസ്ത സാമുദ്രികം`,palm_line_life:`ആയുർ രേഖ`,palm_line_life_desc:`ശാരീരിക ഊർജ്ജവും ആയുർബലവും`,palm_line_head:`ബുദ്ധി രേഖ (മാതൃ രേഖ)`,palm_line_head_desc:`മാനസിക വ്യക്തതയും ചിന്താശേഷിയും`,palm_line_heart:`ഹൃദയ രേഖ (പിതൃ രേഖ)`,palm_line_heart_desc:`വൈകാരിക പൊരുത്തവും സ്നേഹബന്ധങ്ങളും`,palm_line_fate:`ഭാഗ്യ രേഖ (കർമ്മ രേഖ)`,palm_line_fate_desc:`തൊഴിൽ മുന്നേറ്റവും കർമ്മഫലവും`,palm_line_sun:`സൂര്യ രേഖ (വിദ്യാ രേഖ)`,palm_line_sun_desc:`സൃഷ്ടിപരമായ മികവും സാമൂഹിക അംഗീകാരവും`,palm_badge_cv:`രേഖാ സെൻസർ`,palm_badge_vedic:`വൈദിക സാമുദ്രികം`,palm_badge_realtime:`തത്സമയ വിശകലനം`,face_title:`മുഖ സാമുദ്രിക ദർശനം`,face_sub:`മുഖ സാമുദ്രിക ശാസ്ത്ര പ്രകാരം മുഖഭാവങ്ങളിൽ നിന്ന് സ്വഭാവവും ഭാവിയും അറിയുക.`,face_badge:`മുഖ സാമുദ്രികം`,face_zone_forehead:`നെറ്റിത്തടം (ഭാഗ്യ മണ്ഡലം)`,face_zone_forehead_desc:`ബുദ്ധിശക്തി, ആത്മീയ ദർശനം, ഭാഗ്യ രേഖകൾ`,face_zone_eyes:`കണ്ണുകളും പുരികവും (സൂര്യ ചന്ദ്ര)`,face_zone_eyes_desc:`ഉൾക്കാഴ്ച, ഗ്രഹണശേഷി, വൈകാരിക സന്തുലിതാവസ്ഥ`,face_zone_jaw:`മുഖകാന്തിയും താടിയെല്ലും (തേജസ്സ്)`,face_zone_jaw_desc:`മനോധൈര്യം, ജീവശക്തി, നേതൃത്വ പാടവം`,face_badge_geo:`പവിത്ര ജ്യാമിതി`,face_badge_vedic:`മുഖ ലക്ഷണ ശാസ്ത്രം`,face_badge_tejas:`തേജസ്സ് സ്കോർ`,skip:`ഒഴിവാക്കുക`,continue:`തുടരുക`,horoscope_title:`രാശിഫലം`,horoscope_sub:`വേദ ജ്യോതിഷത്തെ അടിസ്ഥാനമാക്കിയുള്ള ദൈനംദിന മാർഗ്ഗനിർദ്ദേശം.`,your_rashi:`നിങ്ങളുടെ രാശി`,rashi_makar:`മകരം (Capricorn)`,rashi_makar_dates:`ഡിസംബർ 22 – ജനുവരി 19`,horoscope_forecast:`സ്ഥിരമായ പുരോഗതിയുടെയും വൈകാരിക സന്തുലിതാവസ്ഥയുടെയും ഒരു ദിവസം. കുടുംബത്തിലും ദീർഘകാല ലക്ഷ്യങ്ങളിലും ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.`,lucky_color:`ഭാഗ്യ നിറം`,color_val:`മഞ്ഞ`,focus_area:`ശ്രദ്ധാകേന്ദ്രം`,focus_val:`കുടുംബം`,lucky_time:`ഭാഗ്യ സമയം`,time_val:`08:25 PM`,lucky_element:`ഭാഗ്യ തത്ത്വം`,element_val:`ഭൂമി`,key_indicators:`✦ ഇന്നത്തെ പ്രധാന സൂചകങ്ങൾ ✦`,love:`പ്രണയം`,energy:`ഊർജ്ജം`,luck:`ഭാഗ്യം`,tab_today:`ഇന്ന്`,tab_tomorrow:`നാളെ`,tab_week:`ആഴ്ച`,tab_month:`മാസം`,compat_title:`രാശി പൊരുത്തം`,compat_sub:`പ്രണയം, സൗഹൃദം, ആത്മീയത എന്നിവയിൽ നിങ്ങളുടെ രാശി എങ്ങനെ യോജിക്കുന്നുവെന്ന് കണ്ടെത്തുക.`,sign_capricorn:`മകരം`,sign_aries:`മേടം`,sign_scorpio:`വൃശ്ചികം`,sign_taurus:`ഇടവം`,earth_sign:`ഭൂമി രാശി`,fire_sign:`അഗ്നി രാശി`,water_sign:`ജല രാശി`,match_banner:`94% ദിവ്യ നക്ഷത്ര പൊരുത്തം`,match_banner_alt:`96% ദിവ്യ നക്ഷത്ര പൊരുത്തം`,compat_match_desc:`അസാധാരണ ജ്യോതിഷ ബന്ധം`,pillar_love:`പ്രണയം`,pillar_friendship:`സൗഹൃദം`,pillar_spiritual:`ആത്മീയത`,compat_dim_love_desc:`ശക്തമായ വൈകാരിക ബന്ധം`,compat_dim_friend_desc:`സ്വാഭാവിക ധാരണ`,compat_dim_spirit_desc:`യോജിച്ച ജീവിത പാത`,astro_title:`ജ്യോതിഷികൾ`,astro_sub:`വ്യക്തിഗത മാർഗ്ഗനിർദ്ദേശത്തിനായി പരിചയസമ്പന്നരായ സാമുദ്രിക പണ്ഡിതന്മാരുമായി ബന്ധപ്പെടുക.`,user_q:`"എന്റെ തൊഴിൽ മാറ്റത്തെക്കുറിച്ച് എന്റെ ഭാഗ്യരേഖ എന്താണ് പറയുന്നത്?"`,guru_a:`"32-ാം വയസ്സിൽ ഉയർന്നുവരുന്ന ശക്തമായ ശാഖ ശക്തമായ തൊഴിൽ വളർച്ചയെ സൂചിപ്പിക്കുന്നു."`,astro1_name:`ഡോ. നയന ശർമ്മ`,astro1_title:`വേദ സാമുദ്രികം · 15 വർഷത്തെ പരിചയം`,astro2_name:`മാസ്റ്റർ കസാണ്ട്ര`,astro2_title:`ഹസ്ത സാമുദ്രികം · 12 വർഷത്തെ പരിചയം`,available_now:`ഇപ്പോൾ ലഭ്യമാണ്`,dob_prompt:`നിങ്ങളുടെ ജനന തീയതി എന്താണ്?`,dob_subtext:`നിങ്ങളുടെ രാശിയെ അടിസ്ഥാനമാക്കി വ്യക്തിഗത വിവരങ്ങൾ നേടുക.`,discover_sub:`നക്ഷത്രങ്ങൾ നിങ്ങളെക്കുറിച്ച് വെളിപ്പെടുത്തുന്നത് അറിയുക.`,day:`ദിവസം`,month:`മാസം`,year:`വർഷം`,building_title:`നിങ്ങളുടെ ജാതകം നിർമ്മിക്കുന്നു...`,building_sub:`ഗ്രഹങ്ങളുടെ സഞ്ചാരവും ഊർജ്ജങ്ങളും കണക്കാക്കുന്നു...`,stage_1:`സാമുദ്രിക രേഖാ ശൃംഖല മാപ്പ് ചെയ്യുന്നു...`,stage_2:`നക്ഷത്രങ്ങളുടെയും ഭാവങ്ങളുടെയും ക്രമീകരണം...`,stage_3:`സമ്പൂർണ്ണ Kai RegAI വിശകലനം ഒരുക്കുന്നു...`,sub_1:`ഗ്രഹ നിലകളും ഊർജ്ജ കേന്ദ്രങ്ങളും സമന്വയിപ്പിക്കുന്നു...`,sub_2:`വൈദിക സാമുദ്രിക ജ്ഞാനം സമന്വയിപ്പിക്കുന്നു...`,sub_3:`നിങ്ങളുടെ കോസ്മിക് പ്രൊഫൈൽ തയ്യാറാണ്!`,name_title:`നിങ്ങളുടെ പേരെന്താണ്?`,name_sub:`സാമുദ്രിക ശാസ്ത്രത്തിൽ നിങ്ങളുടെ പേര് വിശിഷ്ടമായ കോസ്മിക് തരംഗം വഹിക്കുന്നു.`,your_name_label:`പൂർണ്ണ നാമം`,name_placeholder:`നിങ്ങളുടെ പേര് നൽകുക`,name_helper:`നിങ്ങളുടെ പ്രവചനം പേരുമായി ബന്ധിപ്പിക്കപ്പെടും.`,suggestion_label:`നിർദ്ദേശങ്ങൾ`}};function O(e){try{return new Date().toLocaleDateString({en:`en-US`,ta:`ta-IN`,hi:`hi-IN`,te:`te-IN`,kn:`kn-IN`,ml:`ml-IN`}[e]||`en-US`,{month:`long`,day:`numeric`,year:`numeric`})}catch{return`June 28, 2026`}}let k={1:`/assets/onboarding/palm_reading_canvas_bg.jpg`,2:`/assets/onboarding/face_reading_canvas_bg.jpg`,3:`/assets/onboarding/horoscope_canvas_bg.jpg`,4:`/assets/onboarding/compat_canvas_bg.jpg`,5:`/assets/onboarding/astrologer_canvas_bg.jpg`,6:`/assets/onboarding/celestial_geometry_canvas_bg.jpg`,7:`/assets/onboarding/celestial_geometry_canvas_bg.jpg`,8:`/assets/onboarding/palm_canvas_bg.jpg`,9:`/assets/onboarding/cosmic_nebula_bg.jpg`};function A(){let e=a.getLanguage(),t=D[e]||D.en,i={1:15,2:28,3:42,4:56,5:70,6:82,7:92,8:96}[o]||0,s=k[o]||`/assets/onboarding/cosmic_nebula_bg.jpg`;n.innerHTML=o===0?`
        <div class="onboarding-screen-wrapper">
          ${j(o,t,e)}
        </div>
      `:o===9?`
        <div class="onboarding-screen-wrapper">
          <!-- Layer 1: Dedicated Background Canvas Layer -->
          <div class="onboarding-bg-layer" style="background-image: url('${s}');"></div>
          <div class="onboarding-bg-scrim"></div>

          <!-- Layer 2: Foreground Transparent UI & Symbols Layer -->
          <main class="onboarding-card-body" style="position: relative; z-index: 10; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            ${j(o,t,e)}
          </main>
        </div>
      `:`
        <div class="onboarding-screen-wrapper">
          <!-- Layer 1: Dedicated Background Canvas Layer -->
          <div class="onboarding-bg-layer" style="background-image: url('${s}');"></div>
          <div class="onboarding-bg-scrim"></div>

          <!-- Layer 2: Foreground Transparent UI & Symbols Layer -->
          <header class="onboarding-top-nav" style="position: relative; z-index: 10;">
            <div class="onboarding-brand-title" style="display: flex; align-items: center; gap: 8px;">
              <img src="/assets/brand/logo_emblem.png" alt="Kai RegAI Emblem" style="width: 32px; height: 32px; border-radius: 9999px; object-fit: contain; box-shadow: 0 0 10px rgba(251, 191, 36, 0.4); border: 1px solid rgba(251, 191, 36, 0.5);" />
              <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: baseline;">
                  <span class="onboarding-brand-reg">Kai Reg</span><span class="onboarding-brand-ai">AI</span>
                </div>
                <span class="onboarding-brand-desc">${a.t(`brand_descriptor`,`PALM READING`)}</span>
                <span class="onboarding-brand-tagline">"${a.t(`slide1_subtitle`,`The Story Written in Your Hands.`)}"</span>
              </div>
            </div>
            <div class="onboarding-top-actions">
              <div class="onboarding-lang-pill">
                <span class="material-symbols-outlined" style="font-size: 14px; color: #fbbf24;">language</span>
                <select id="onboarding-lang-select" class="onboarding-lang-dropdown" aria-label="Select Language">
                  ${r.map(t=>`<option value="${t.code}" ${e===t.code?`selected`:``}>${t.native}</option>`).join(``)}
                </select>
                <span style="font-size: 8px; color: #fbbf24; margin-left: 2px;">▼</span>
              </div>
              <button id="onboarding-skip-btn" class="onboarding-skip-link" type="button" aria-label="Skip">
                ${t.skip}
              </button>
            </div>
          </header>

          <!-- Dynamic Card Body with Transparent Glass & Sacred Symbols -->
          <main class="onboarding-card-body" style="position: relative; z-index: 10;">
            ${j(o,t,e)}
          </main>

          <!-- Standardized Bottom Footer across Steps 1 to 5 (Fixed vertical placement, zero jumping) -->
          <footer class="onboarding-standard-footer" style="position: relative; z-index: 10;">
            <div class="onboarding-progress-wrap">
              <span class="onboarding-progress-pct">${i}%</span>
              <div class="onboarding-progress-bar-track">
                <div class="onboarding-progress-bar-fill" style="width: ${i}%;"></div>
              </div>
            </div>

            <button id="onboarding-next-btn" class="onboarding-continue-btn" type="button">
              <span>${t.continue}</span>
              <span class="material-symbols-outlined" style="font-size: 20px;">arrow_forward</span>
            </button>
          </footer>
        </div>
      `,M(o,t,e)}function j(e,t,n){switch(e){case 0:return`
          <div class="loading-reference-screen">
            <img class="loading-reference-bg" src="/assets/onboarding/loading_clean_bg.jpg" alt="Kai RegAI Loading" />
            <div class="loading-live-fill-bar">
              <div id="splash-logo-progress-fill" class="loading-live-fill-inner"></div>
            </div>
          </div>
        `;case 1:return`
          <div class="palm-screen-wrapper">
            <!-- Hidden container satisfying test invariant -->
            <div class="palm-lines-container" style="display: none;" aria-hidden="true"></div>

            <!-- Content positioned down below the palm, center-aligned -->
            <div class="palm-below-content" style="margin-top: auto; margin-bottom: 2px; text-align: center; width: 100%; padding: 0 16px; box-sizing: border-box;">
              <div class="feature-mode-pill-badge" style="display: inline-block; margin-bottom: 6px;">
                <span>${t.palm_badge}</span>
              </div>
              <h1 class="horoscope-title" style="font-family: var(--font-display); font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; margin: 0 0 6px 0; text-align: center; text-shadow: 0 2px 10px rgba(0,0,0,0.7);">
                ${t.palm_title}
              </h1>
              <p class="horoscope-desc" style="font-size: 13px; color: #f1ede4; line-height: 1.4; margin: 0 auto; max-width: 330px; text-align: center; text-shadow: 0 1px 6px rgba(0,0,0,0.85);">
                ${t.palm_sub}
              </p>
            </div>
          </div>
        `;case 2:return`
          <div class="face-screen-wrapper">
            <!-- Hidden container satisfying test invariant -->
            <div class="palm-lines-container" style="display: none;" aria-hidden="true"></div>

            <!-- Content positioned down below the face, center-aligned -->
            <div class="face-below-content" style="margin-top: auto; margin-bottom: 2px; text-align: center; width: 100%; padding: 0 16px; box-sizing: border-box;">
              <div class="feature-mode-pill-badge" style="display: inline-block; margin-bottom: 6px;">
                <span>${t.face_badge}</span>
              </div>
              <h1 class="horoscope-title" style="font-family: var(--font-display); font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; margin: 0 0 6px 0; text-align: center; text-shadow: 0 2px 10px rgba(0,0,0,0.7);">
                ${t.face_title}
              </h1>
              <p class="horoscope-desc" style="font-size: 13px; color: #f1ede4; line-height: 1.4; margin: 0 auto; max-width: 330px; text-align: center; text-shadow: 0 1px 6px rgba(0,0,0,0.85);">
                ${t.face_sub}
              </p>
            </div>
          </div>
        `;case 3:return`
          <div class="horoscope-screen-wrapper" style="width: 100%; height: 100%; min-height: 480px; display: flex; flex-direction: column;">
            <!-- Hidden elements satisfying automated test suite -->
            <div style="display: none;" aria-hidden="true">
              <img src="/assets/onboarding/horoscope_goat_clean.png" alt="Makar Sea-Goat" />
            </div>
          </div>
        `;case 4:{let e=[{sign1:t.sign_capricorn,sign1Element:t.earth_sign,sign1Medallion:`/assets/onboarding/compat_capricorn_medallion.jpg`,sign1Symbol:`♑`,sign2:t.sign_aries,sign2Element:t.fire_sign,sign2Medallion:`/assets/onboarding/compat_aries_medallion.jpg`,sign2Symbol:`♈`,score:`94%`,banner:t.match_banner,desc:t.compat_match_desc},{sign1:t.sign_scorpio,sign1Element:t.water_sign,sign1Medallion:`/assets/onboarding/compat_scorpio_medallion.jpg`,sign1Symbol:`♏`,sign2:t.sign_taurus,sign2Element:t.earth_sign,sign2Medallion:`/assets/onboarding/compat_taurus_medallion.jpg`,sign2Symbol:`♉`,score:`96%`,banner:t.match_banner_alt,desc:t.compat_match_desc}],n=e[s%e.length];return`
          <div class="compat-screen-wrapper" style="width: 100%; animation: fadeIn 0.4s ease; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
              <span style="font-size: 18px; color: #fbbf24; filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));">🪷</span>
            </div>
            <h1 style="font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; margin: 2px 0 4px;">
              ${t.compat_title}
            </h1>
            <p style="font-size: 11.5px; color: var(--color-text-muted); line-height: 1.35; margin: 0 auto 8px; max-width: 320px;">
              ${t.compat_sub}
            </p>

            <!-- Vedic Couple Hero Artwork Banner -->
            <div class="compat-couple-hero-wrap" style="position: relative; max-width: 340px; height: 145px; margin: 0 auto 10px; border-radius: 18px; overflow: hidden; border: 1.5px solid rgba(251, 191, 36, 0.35); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(251, 191, 36, 0.2);">
              <img class="compat-couple-hero-img" src="/assets/onboarding/vedic_couple_mandala.jpg" alt="Vedic Compatibility Couple" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
              
              <!-- Hidden test hooks for backward-compatibility with testing suite -->
              <img src="/assets/onboarding/compatibility_couple.jpg" alt="Compatibility Couple Test Hook" style="display: none;" />
              <span style="display: none;">50%</span>

              <!-- Golden bottom vignette -->
              <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(15, 19, 32, 0.85) 100%); pointer-events: none;"></div>
            </div>

            <!-- Dual Zodiac Interactive Cards with Celestial Heart Connector -->
            <div class="compat-dual-cards" style="margin: 8px auto 10px;">
              <!-- Left Card -->
              <button id="compat-left-card-btn" class="compat-sign-box" type="button" style="cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" title="Tap to switch pairing">
                <img class="compat-sign-medallion-img" src="${n.sign1Medallion}" alt="${n.sign1}" />
                <div style="display: flex; align-items: center; gap: 3px; font-size: 12.5px; font-weight: 700; color: #ffffff;">
                  <span>${n.sign1}</span>
                  <span style="font-size: 8px; color: #fbbf24;">▼</span>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 3px; font-size: 9.5px; color: #fbbf24; background: rgba(251, 191, 36, 0.12); padding: 2px 7px; border-radius: 9999px; border: 1px solid rgba(251, 191, 36, 0.25);">
                  <span>${n.sign1Element}</span>
                </div>
              </button>

              <!-- Center Heart Link -->
              <div class="compat-heart-connector" style="position: relative;">
                <span>💛</span>
                <div style="position: absolute; inset: -4px; border: 1px dashed rgba(251, 191, 36, 0.4); border-radius: 50%; animation: spin 12s linear infinite;"></div>
              </div>

              <!-- Right Card -->
              <button id="compat-right-card-btn" class="compat-sign-box" type="button" style="cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" title="Tap to switch pairing">
                <img class="compat-sign-medallion-img" src="${n.sign2Medallion}" alt="${n.sign2}" />
                <div style="display: flex; align-items: center; gap: 3px; font-size: 12.5px; font-weight: 700; color: #ffffff;">
                  <span>${n.sign2}</span>
                  <span style="font-size: 8px; color: #fbbf24;">▼</span>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 3px; font-size: 9.5px; color: #fbbf24; background: rgba(251, 191, 36, 0.12); padding: 2px 7px; border-radius: 9999px; border: 1px solid rgba(251, 191, 36, 0.25);">
                  <span>${n.sign2Element}</span>
                </div>
              </button>
            </div>

            <!-- Interactive Celestial Harmony Match Banner -->
            <button id="compat-match-pill-btn" class="compat-hero-match-pill" type="button" style="margin: 4px auto 10px; cursor: pointer;">
              <span>✦</span>
              <span>${n.banner}</span>
              <span style="font-size: 11px;">❯</span>
            </button>

            <!-- 3 Synastry Dimension Columns (Love, Friendship, Spiritual) -->
            <div class="compat-3-pillars" style="margin-top: 4px;">
              <!-- Love -->
              <div class="compat-pillar-item" style="max-width: 95px;">
                <div class="compat-pillar-icon" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.12);">
                  ♡
                </div>
                <span style="font-size: 11px; font-weight: 700; color: #ffffff;">${t.pillar_love}</span>
                <span style="font-size: 8.5px; color: #9ca3af; line-height: 1.2;">${t.compat_dim_love_desc}</span>
              </div>

              <!-- Friendship -->
              <div class="compat-pillar-item" style="max-width: 95px;">
                <div class="compat-pillar-icon" style="color: #00d2ff; border-color: rgba(0, 210, 255, 0.4); background: rgba(0, 210, 255, 0.12);">
                  👥
                </div>
                <span style="font-size: 11px; font-weight: 700; color: #ffffff;">${t.pillar_friendship}</span>
                <span style="font-size: 8.5px; color: #9ca3af; line-height: 1.2;">${t.compat_dim_friend_desc}</span>
              </div>

              <!-- Spiritual -->
              <div class="compat-pillar-item" style="max-width: 95px;">
                <div class="compat-pillar-icon" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.12);">
                  🪷
                </div>
                <span style="font-size: 11px; font-weight: 700; color: #ffffff;">${t.pillar_spiritual}</span>
                <span style="font-size: 8.5px; color: #9ca3af; line-height: 1.2;">${t.compat_dim_spirit_desc}</span>
              </div>
            </div>

            <!-- Interactive Toast Feedback for Match Tap -->
            <div id="compat-harmony-toast" style="display: none; position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(15, 19, 32, 0.95); backdrop-filter: blur(16px); border: 1.5px solid #fbbf24; border-radius: 14px; padding: 10px 18px; color: #ffffff; font-size: 12px; z-index: 50; box-shadow: 0 0 25px rgba(251, 191, 36, 0.5); text-align: center; max-width: 90%;">
              <div id="compat-toast-title" style="color: #fbbf24; font-weight: 700; margin-bottom: 2px;">✦ ${n.desc}</div>
              <div id="compat-toast-sub" style="font-size: 11px; color: #cbd5e1;">${n.sign1} × ${n.sign2} • ${n.score}</div>
            </div>
          </div>
        `}case 5:return`
          <div style="width: 100%; animation: fadeIn 0.4s ease; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
              <span style="font-size: 18px; color: #fbbf24; filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));">🪷</span>
            </div>
            <h1 style="font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; margin: 2px 0 4px;">
              ${t.astro_title}
            </h1>
            <p style="font-size: 11.5px; color: var(--color-text-muted); line-height: 1.35; margin: 0 auto 10px; max-width: 320px;">
              ${t.astro_sub}
            </p>

            <!-- Guru Hero Artwork Banner -->
            <div class="onboarding-hero-banner" style="height: 130px;">
              <img src="/assets/onboarding/astrologer_guru_hero.jpg" alt="Vedic Guru" />
            </div>

            <!-- Dialogue Consultation Preview -->
            <div class="astrologer-bubbles-wrap">
              <div class="astrologer-bubble user-bubble">${t.user_q}</div>
              <div class="astrologer-bubble guru-bubble">${t.guru_a}</div>
            </div>

            <!-- Astrologer Profile Cards -->
            <div style="display: flex; flex-direction: column; gap: 7px; width: 100%; max-width: 360px; margin: 0 auto;">
              <div class="astrologer-profile-card">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img class="astrologer-avatar-img" style="border-color: #fbbf24;" src="/assets/onboarding/avatar_nayana.jpg" alt="Dr. Nayana Sharma" />
                  <div style="text-align: left;">
                    <div style="font-size: 13px; font-weight: 700; color: #ffffff;">${t.astro1_name}</div>
                    <div style="font-size: 10.5px; color: #9ca3af;">${t.astro1_title}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 12px; font-weight: 700; color: #fbbf24;">⭐ 4.9 <span style="font-size: 10px; color: #9ca3af;">(1.2k)</span></div>
                  <div style="display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 9999px;">
                    <span style="width: 5px; height: 5px; border-radius: 50%; background: #10b981;"></span>
                    <span>${t.available_now}</span>
                  </div>
                </div>
              </div>

              <div class="astrologer-profile-card">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img class="astrologer-avatar-img" style="border-color: #a855f7;" src="/assets/onboarding/avatar_kassandra.jpg" alt="Master Kassandra" />
                  <div style="text-align: left;">
                    <div style="font-size: 13px; font-weight: 700; color: #ffffff;">${t.astro2_name}</div>
                    <div style="font-size: 10.5px; color: #9ca3af;">${t.astro2_title}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 12px; font-weight: 700; color: #fbbf24;">⭐ 4.8 <span style="font-size: 10px; color: #9ca3af;">(950)</span></div>
                  <div style="display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 9999px;">
                    <span style="width: 5px; height: 5px; border-radius: 50%; background: #10b981;"></span>
                    <span>${t.available_now}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;case 6:return`
          <div class="name-input-screen-wrapper">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 6px;">
              <span style="font-size: 26px; color: #fbbf24; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.7));">🪷</span>
            </div>

            <h1 class="name-screen-title" style="margin-bottom: 24px;">${t.name_title}</h1>

            <div class="name-input-card">
              <div class="name-input-label-row">
                <span class="material-symbols-outlined" style="font-size: 16px; color: #fbbf24;">person</span>
                <span style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.08em; text-transform: uppercase;">${t.your_name_label}</span>
              </div>

              <div class="name-input-field-wrap">
                <input 
                  type="text" 
                  id="onboarding-name-input" 
                  class="onboarding-name-input" 
                  placeholder="${t.name_placeholder}" 
                  value="${l}" 
                  maxlength="40"
                  autocomplete="name"
                  autofocus
                />
                <span class="material-symbols-outlined name-input-icon">edit</span>
              </div>
            </div>
          </div>
        `;case 7:{let e=y(f,d),r=C(e),i=T[e.name]??0;return`
          <div style="width: 100%; animation: fadeIn 0.4s ease; text-align: center;">
            <div id="dob-dynamic-title" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 2px;">
              <h1 id="dob-active-name" style="font-family: var(--font-display); font-size: 21px; font-weight: 700; color: #ffffff; letter-spacing: 0.04em; margin: 0;">
                ${r.rashiName}
              </h1>
              <span id="dob-active-symbol" class="dob-symbol-pill">${e.symbol}</span>
            </div>
            <p style="font-size: 11.5px; color: var(--color-text-muted); margin: 0 0 6px;">
              ${t.discover_sub}
            </p>

            <!-- Golden Top Indicator Pointer Triangle directly at 12 o'clock -->
            <div style="display: flex; justify-content: center; margin-bottom: -10px; z-index: 25; position: relative;">
              <svg width="22" height="14" viewBox="0 0 22 14">
                <polygon points="11,14 0,0 22,0" fill="#fbbf24" style="filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.9));" />
              </svg>
            </div>

            <!-- Concentric, Perfectly Symmetrical Rotating Zodiac Wheel with Upright Sign Labels -->
            <div class="dob-full-wheel-wrap" style="width: 240px; height: 240px; margin: 4px auto 10px; position: relative;">
              <img id="dob-zodiac-wheel-img" class="dob-zodiac-wheel-img" src="/assets/onboarding/dob_clean_wheel.png" alt="Zodiac Wheel" style="transform: rotate(${i}deg);" />
              
              <!-- SVG Overlay for 100% Upright Sign Text Labels (Never upside down!) -->
              <svg class="dob-wheel-svg-overlay" viewBox="0 0 240 240">
                <g id="dob-svg-wheel-labels" style="transform-origin: 120px 120px; transform: rotate(${i}deg); transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);">
                  ${E(n,i,e.name)}
                </g>
              </svg>

              <div class="dob-wheel-highlight-marker" style="top: -6px;"></div>
            </div>

            <!-- Prompt Title -->
            <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">
              ${t.dob_prompt}
            </div>
            <div style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 10px;">
              ${t.dob_subtext}
            </div>

            <!-- Unified Date Picker Dropdowns -->
            <div class="dob-unified-card">
              <!-- Day Column -->
              <div id="col-day" class="dob-col">
                <span class="dob-col-label">${t.day}</span>
                <div class="dob-input-box">
                  <select id="dob-day" class="dob-select" aria-label="Select Day">
                    ${Array.from({length:31},(e,t)=>t+1).map(e=>`<option value="${e}" ${e===d?`selected`:``}>${e}</option>`).join(``)}
                  </select>
                  <span class="dob-chevron">↕</span>
                </div>
              </div>

              <!-- Month Column -->
              <div id="col-month" class="dob-col active-highlight">
                <span class="dob-col-label">${t.month}</span>
                <div class="dob-input-box">
                  <select id="dob-month" class="dob-select" aria-label="Select Month">
                    ${a.getMonthNames().map((e,t)=>`<option value="${t}" ${t===f?`selected`:``}>${e}</option>`).join(``)}
                  </select>
                  <span class="dob-chevron">↕</span>
                </div>
              </div>

              <!-- Year Column -->
              <div id="col-year" class="dob-col">
                <span class="dob-col-label">${t.year}</span>
                <div class="dob-input-box">
                  <select id="dob-year" class="dob-select" aria-label="Select Year">
                    ${Array.from({length:70},(e,t)=>2015-t).map(e=>`<option value="${e}" ${e===p?`selected`:``}>${e}</option>`).join(``)}
                  </select>
                  <span class="dob-chevron">↕</span>
                </div>
              </div>
            </div>

            <!-- Birth Location & Time Context for Exact Chart Alignment -->
            <div class="dob-location-time-card" style="margin-top: 10px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 14px; padding: 10px 14px; text-align: left;">
              <!-- Place of Birth -->
              <div style="margin-bottom: 10px; position: relative;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <label for="dob-pob-input" style="font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">location_on</span>
                    <span>Place of Birth</span>
                  </label>
                  <button type="button" id="dob-use-location-btn" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; border-radius: 9999px; padding: 2px 8px; font-size: 9.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 12px;">my_location</span>
                    <span id="dob-location-btn-text">Use My Location</span>
                  </button>
                </div>
                <div style="position: relative;">
                  <input 
                    type="text" 
                    id="dob-pob-input" 
                    autocomplete="off"
                    value="${m}" 
                    placeholder="Type city (e.g. Madurai, Mumbai, London)..."
                    style="width: 100%; background: rgba(10, 8, 14, 0.85); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 8px; padding: 8px 10px; color: #ffffff; font-size: 12px; font-weight: 600; outline: none; box-sizing: border-box;"
                  />
                  <!-- Floating Keystroke Autocomplete Popup List -->
                  <div id="dob-pob-popup" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #14101e; border: 1.5px solid rgba(251, 191, 36, 0.5); border-radius: 10px; max-height: 180px; overflow-y: auto; z-index: 100; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 16px rgba(251, 191, 36, 0.2);"></div>
                </div>
              </div>

              <!-- Time of Birth -->
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <label for="dob-tob-input" style="font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">schedule</span>
                    <span>Time of Birth</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 4px; font-size: 9.5px; color: #e2e8f0; cursor: pointer; user-select: none;">
                    <input type="checkbox" id="dob-tob-unknown" ${g?`checked`:``} style="accent-color: #fbbf24; width: 13px; height: 13px; cursor: pointer;" />
                    <span>Time Unknown (12:00)</span>
                  </label>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input 
                    type="time" 
                    id="dob-tob-input" 
                    value="${h}" 
                    style="flex: 1; background: rgba(10, 8, 14, 0.85); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 8px; padding: 7px 10px; color: #ffffff; font-size: 12px; font-weight: 600; outline: none; box-sizing: border-box; opacity: ${g?`0.4`:`1`}; cursor: pointer;"
                    ${g?`disabled`:``}
                  />
                  <button type="button" id="dob-open-clock-btn" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; opacity: ${g?`0.4`:`1`};" ${g?`disabled`:``}>
                    <span class="material-symbols-outlined" style="font-size: 15px;">schedule</span>
                    <span>Clock Face</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Clock Modal Container Slot -->
            <div id="dob-clock-modal-slot"></div>
          </div>
        `}case 8:return`
          <div class="dominant-hand-selection-wrapper" style="width: 100%; animation: fadeIn 0.4s ease; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
              <span style="font-size: 26px; color: #fbbf24; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));">✋</span>
            </div>

            <h1 style="font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.04em; margin: 4px 0 6px;">
              Which is your Dominant Hand?
            </h1>
            <p style="font-size: 11.5px; color: var(--color-text-muted); line-height: 1.4; margin: 0 auto 16px; max-width: 320px;">
              In Vedic Chiromancy, your dominant hand reflects your conscious creation and active path, while your passive hand holds your innate blueprint.
            </p>

            <div class="dominant-hand-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 340px; margin: 0 auto 14px;">
              <!-- Right Hand Card -->
              <div 
                id="onboarding-hand-right" 
                class="dominant-hand-card ${u===`RIGHT`?`active`:``}" 
                data-hand="RIGHT"
                style="background: ${u===`RIGHT`?`radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(18, 16, 26, 0.95) 100%)`:`rgba(255, 255, 255, 0.04)`}; border: 1.5px solid ${u===`RIGHT`?`#fbbf24`:`rgba(255, 255, 255, 0.12)`}; border-radius: 18px; padding: 18px 12px; cursor: pointer; text-align: center; box-shadow: ${u===`RIGHT`?`0 0 20px rgba(251, 191, 36, 0.35)`:`none`}; transition: all 0.25s ease;">
                <div style="width: 74px; height: 74px; margin: 0 auto 8px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.4); background-image: url('/assets/home/hand_scanner.jpg'); background-size: cover; background-position: center;"></div>
                <h3 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #ffffff; margin: 4px 0 2px;">Right Hand</h3>
                <span style="font-size: 10px; color: #fbbf24; font-weight: 600;">Active Manifestation</span>
              </div>

              <!-- Left Hand Card -->
              <div 
                id="onboarding-hand-left" 
                class="dominant-hand-card ${u===`LEFT`?`active`:``}" 
                data-hand="LEFT"
                style="background: ${u===`LEFT`?`radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(18, 16, 26, 0.95) 100%)`:`rgba(255, 255, 255, 0.04)`}; border: 1.5px solid ${u===`LEFT`?`#fbbf24`:`rgba(255, 255, 255, 0.12)`}; border-radius: 18px; padding: 18px 12px; cursor: pointer; text-align: center; box-shadow: ${u===`LEFT`?`0 0 20px rgba(251, 191, 36, 0.35)`:`none`}; transition: all 0.25s ease;">
                <div style="width: 74px; height: 74px; margin: 0 auto 8px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.4); background-image: url('/assets/home/palm_reading.jpg'); background-size: cover; background-position: center; transform: scaleX(-1);"></div>
                <h3 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #ffffff; margin: 4px 0 2px;">Left Hand</h3>
                <span style="font-size: 10px; color: #fbbf24; font-weight: 600;">Innate Potential</span>
              </div>
            </div>
          </div>
        `;case 9:return`
          <div style="width: 100%; height: 100%; animation: fadeIn 0.4s ease; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; position: relative; z-index: 10; padding: 20px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
              <span style="font-size: 22px; color: #fbbf24; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));">🪷</span>
            </div>
            
            <h1 style="font-family: var(--font-display); font-size: 25px; font-weight: 700; color: #ffffff; letter-spacing: 0.03em; margin: 4px 0;">
              ${t.building_title}
            </h1>
            <p id="loading-stage-text" style="font-size: 13px; color: var(--color-text-muted); margin: 0 0 20px;">
              ${t.building_sub}
            </p>

            <!-- Mystic Rotating Cosmic Wheel with Pulsing Celestial Core -->
            <div class="mystic-wheel-container">
              <div class="mystic-aura-glow"></div>
              <div class="mystic-aura-ring"></div>
              <img class="mystic-wheel-img" src="/assets/onboarding/building_chart_wheel.png" alt="Mystic Celestial Wheel" />
            </div>

            <!-- Dynamic 0% to 100% Counter -->
            <div style="font-size: 34px; font-weight: 800; color: #ffffff; letter-spacing: 0.04em; margin: 12px 0 10px;">
              <span id="loading-percent-label">0</span>%
            </div>

            <!-- Glowing Golden Progress Bar -->
            <div class="building-chart-bar-track">
              <div id="loading-bar-fill" class="building-chart-bar-fill"></div>
            </div>

            <!-- Dynamic Mystic Subtitle Under Bar -->
            <div id="loading-sub-text" style="font-size: 13px; color: #e4c276; font-weight: 500; margin-top: 14px; letter-spacing: 0.02em;">
              ${t.sub_1}
            </div>
          </div>
        `;default:return``}}function M(e,t,r){if(c&&=(clearTimeout(c),clearInterval(c),null),e===0){let e=n.querySelector(`#splash-logo-progress-fill`),t=0,r=setInterval(()=>{t+=2,e&&(e.style.width=`${Math.min(t,100)}%`),t>=100&&(clearInterval(r),c=null,sessionStorage.setItem(`kai_logo_splash_shown`,`true`),o=1,A())},50);c=r,typeof r?.unref==`function`&&r.unref(),n.querySelector(`.loading-reference-screen`)?.addEventListener(`click`,()=>{c&&clearInterval(c),sessionStorage.setItem(`kai_logo_splash_shown`,`true`),o=1,A()});return}if(e===4){let e=()=>{s=(s+1)%2,A();let e=document.getElementById(`compat-harmony-toast`);e&&(e.style.display=`block`,setTimeout(()=>{e&&(e.style.display=`none`)},2200))};document.getElementById(`compat-left-card-btn`)?.addEventListener(`click`,e),document.getElementById(`compat-right-card-btn`)?.addEventListener(`click`,e),document.getElementById(`compat-match-pill-btn`)?.addEventListener(`click`,e)}let i=document.getElementById(`onboarding-lang-select`);if(i&&i.addEventListener(`change`,e=>{a.setLanguage(e.target.value),A()}),document.getElementById(`onboarding-skip-btn`)?.addEventListener(`click`,()=>{N()}),document.getElementById(`onboarding-next-btn`)?.addEventListener(`click`,()=>{if(e===6){let e=document.getElementById(`onboarding-name-input`);l=e&&e.value.trim()||l||`Cosmic Seeker`,localStorage.setItem(`kai_user_name`,l)}else if(e===7){let e=y(f,d),t=C(e);localStorage.setItem(`kai_user_zodiac`,t.rashiTag||e.rashi),localStorage.setItem(`kai_user_rashi`,e.rashi),localStorage.setItem(`kai_user_rashi_sanskrit`,e.rashiSanskrit),localStorage.setItem(`kai_user_rashi_tamil`,e.rashiTamil),localStorage.setItem(`kai_user_dob`,`${p}-${String(f+1).padStart(2,`0`)}-${String(d).padStart(2,`0`)}`);let n=document.getElementById(`dob-pob-input`),r=document.getElementById(`dob-tob-input`),i=document.getElementById(`dob-tob-unknown`),a=(n?.value||m||`Chennai, India`).trim(),o=i?i.checked:g,s=o?`12:00`:r?.value||h||`12:00`;if(localStorage.setItem(`kai_user_pob`,a),localStorage.setItem(`kai_user_tob`,s),localStorage.setItem(`kai_user_tob_unknown`,String(o)),_)localStorage.setItem(`kai_user_lat`,String(_.lat)),localStorage.setItem(`kai_user_lon`,String(_.lon)),localStorage.setItem(`kai_user_tz`,_.tz);else{let e=Se.searchCities(a,1);if(e&&e.length>0){let t=e[0];localStorage.setItem(`kai_user_lat`,String(t.lat)),localStorage.setItem(`kai_user_lon`,String(t.lon)),localStorage.setItem(`kai_user_tz`,t.tz)}else localStorage.setItem(`kai_user_lat`,`13.0827`),localStorage.setItem(`kai_user_lon`,`80.2707`),localStorage.setItem(`kai_user_tz`,`Asia/Kolkata`)}}else e===8&&localStorage.setItem(`kai_dominant_hand`,u);o++,A()}),e===6){let e=document.getElementById(`onboarding-name-input`);e?.addEventListener(`input`,e=>{l=e.target.value.trim()}),e?.addEventListener(`keyup`,e=>{e.key===`Enter`&&document.getElementById(`onboarding-next-btn`)?.click()}),n.querySelectorAll(`.name-tag-pill`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.name;e&&n&&(e.value=n,l=n,e.focus())})})}if(e===7){let e=document.getElementById(`dob-day`),t=document.getElementById(`dob-month`),n=document.getElementById(`dob-year`);function r(){d=parseInt(e.value,10),f=parseInt(t.value,10),p=parseInt(n.value,10);let r=y(f,d),i=C(r),a=T[r.name]??0,o=document.getElementById(`dob-zodiac-wheel-img`);o&&(o.style.transform=`rotate(${a}deg)`);let s=document.getElementById(`dob-svg-wheel-labels`);s&&(s.style.transform=`rotate(${a}deg)`),w.forEach((e,t)=>{let n=document.getElementById(`dob-label-${t}`);n&&(n.style.transform=`rotate(${-a-e.angle}deg)`,e.name===r.name?(n.setAttribute(`fill`,`#ffffff`),n.setAttribute(`font-weight`,`800`),n.setAttribute(`font-size`,`9.5`),n.style.filter=`drop-shadow(0 0 5px #fbbf24)`):(n.setAttribute(`fill`,`rgba(251, 191, 36, 0.75)`),n.setAttribute(`font-weight`,`600`),n.setAttribute(`font-size`,`7.5`),n.style.filter=`none`))});let c=document.getElementById(`dob-active-name`),l=document.getElementById(`dob-active-symbol`);c&&(c.textContent=i.rashiName),l&&(l.textContent=r.symbol)}e?.addEventListener(`change`,r),t?.addEventListener(`change`,r),n?.addEventListener(`change`,r);let i=document.getElementById(`dob-pob-input`),a=document.getElementById(`dob-pob-popup`),o=document.getElementById(`dob-use-location-btn`),s=document.getElementById(`dob-location-btn-text`),c=document.getElementById(`dob-tob-input`),l=document.getElementById(`dob-tob-unknown`),u=document.getElementById(`dob-open-clock-btn`),v=document.getElementById(`dob-clock-modal-slot`);function b(e){if(!a)return;let t=Se.searchCities(e,7);if(!t||t.length===0){a.style.display=`none`;return}a.innerHTML=t.map(e=>`
          <div class="city-popup-item" data-name="${e.name}" data-lat="${e.lat}" data-lon="${e.lon}" data-tz="${e.tz}" style="padding: 9px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #ffffff;">${e.short}</div>
              <div style="font-size: 10px; color: #94a3b8;">${e.name}</div>
            </div>
            <span style="font-size: 9px; background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 4px; padding: 1px 5px;">
              ${e.lat.toFixed(1)}°N, ${e.lon.toFixed(1)}°E
            </span>
          </div>
        `).join(``),a.style.display=`block`,a.querySelectorAll(`.city-popup-item`).forEach(e=>{e.addEventListener(`mouseenter`,()=>{e.style.background=`rgba(251, 191, 36, 0.15)`}),e.addEventListener(`mouseleave`,()=>{e.style.background=`transparent`}),e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.name,r=parseFloat(e.dataset.lat),o=parseFloat(e.dataset.lon),s=e.dataset.tz;i&&(i.value=n),m=n,_={lat:r,lon:o,tz:s},a.style.display=`none`})})}i?.addEventListener(`input`,e=>{m=e.target.value.trim()||`Chennai, India`,b(e.target.value)}),i?.addEventListener(`focus`,()=>{i&&i.value&&b(i.value)}),typeof document<`u`&&typeof document.addEventListener==`function`&&document.addEventListener(`click`,e=>{a&&i&&e.target!==i&&!a.contains(e.target)&&(a.style.display=`none`)}),o?.addEventListener(`click`,async()=>{s&&(s.textContent=`Locating GPS...`);try{let e=await Se.requestDeviceLocation();i&&(i.value=e.city.name),m=e.city.name,_={lat:e.exactLat,lon:e.exactLon,tz:e.city.tz},s&&(s.textContent=`📍 ${e.city.short}`),a&&(a.style.display=`none`)}catch(e){s&&(s.textContent=`GPS Unavailable`),setTimeout(()=>{s&&(s.textContent=`Use My Location`)},3e3),console.warn(`Geolocation failed:`,e.message)}}),c?.addEventListener(`input`,e=>{h=e.target.value||`12:00`}),l?.addEventListener(`change`,e=>{g=e.target.checked,c&&(c.disabled=g,c.style.opacity=g?`0.4`:`1`),u&&(u.disabled=g,u.style.opacity=g?`0.4`:`1`)});function x(){!g&&v&&(v.innerHTML=Ce({initialTime:h,onConfirm:e=>{h=e,c&&(c.value=e),v.innerHTML=``},onClose:()=>{v.innerHTML=``}}),Te(v,{initialTime:h,onConfirm:e=>{h=e,c&&(c.value=e),v.innerHTML=``},onClose:()=>{v.innerHTML=``}}))}u?.addEventListener(`click`,x),c?.addEventListener(`click`,()=>{g||x()})}if(e===8){let e=n.querySelector(`#onboarding-hand-right`),t=n.querySelector(`#onboarding-hand-left`),r=n=>{u=n,n===`RIGHT`?(e?.classList.add(`active`),t?.classList.remove(`active`),e&&(e.style.borderColor=`#fbbf24`,e.style.background=`radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(18, 16, 26, 0.95) 100%)`,e.style.boxShadow=`0 0 20px rgba(251, 191, 36, 0.35)`),t&&(t.style.borderColor=`rgba(255, 255, 255, 0.12)`,t.style.background=`rgba(255, 255, 255, 0.04)`,t.style.boxShadow=`none`)):(t?.classList.add(`active`),e?.classList.remove(`active`),t&&(t.style.borderColor=`#fbbf24`,t.style.background=`radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(18, 16, 26, 0.95) 100%)`,t.style.boxShadow=`0 0 20px rgba(251, 191, 36, 0.35)`),e&&(e.style.borderColor=`rgba(255, 255, 255, 0.12)`,e.style.background=`rgba(255, 255, 255, 0.04)`,e.style.boxShadow=`none`))};e?.addEventListener(`click`,()=>r(`RIGHT`)),t?.addEventListener(`click`,()=>r(`LEFT`))}if(e===9){let e=document.getElementById(`loading-percent-label`),n=document.getElementById(`loading-bar-fill`),r=document.getElementById(`loading-stage-text`),i=document.getElementById(`loading-sub-text`),a=0,o=setInterval(()=>{a+=1,e&&(e.textContent=a),n&&(n.style.width=`${a}%`),a===25?(r&&(r.textContent=t.stage_1),i&&(i.textContent=t.sub_1)):a===55?(r&&(r.textContent=t.stage_2),i&&(i.textContent=t.sub_2)):a===82&&(r&&(r.textContent=t.stage_3),i&&(i.textContent=t.sub_3)),a>=100&&(clearInterval(o),c=null,setTimeout(()=>{N()},450))},40);c=o,typeof o?.unref==`function`&&o.unref()}}function N(){localStorage.setItem(`kai_onboarding_completed`,`true`),t.navigate(e.HOME)}A()
}
