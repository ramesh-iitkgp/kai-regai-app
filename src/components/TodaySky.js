/**
 * TodaySky — renders the astronomical part of the daily forecast:
 * Moon nakshatra, Jupiter's transit house counted from the user's Rashi, and Rahu Kalam.
 *
 * Pure presentation: every value comes from DailyForecastService.getForecastForToday().
 * Returns '' when the service could not compute the sky, so callers can embed it safely.
 * Styles live in src/styles/components.css (.sky-*).
 */

import { i18n } from '../services/i18n.js';

const LABELS = {
  title:       { en: "Today's Sky", ta: 'இன்றைய வானம்', hi: 'आज का आकाश', te: 'నేటి ఆకాశం', kn: 'ಇಂದಿನ ಆಕಾಶ', ml: 'ഇന്നത്തെ ആകാശം' },
  moon:        { en: 'Moon Nakshatra', ta: 'சந்திர நட்சத்திரம்', hi: 'चंद्र नक्षत्र', te: 'చంద్ర నక్షత్రం', kn: 'ಚಂದ್ರ ನಕ್ಷತ್ರ', ml: 'ചന്ദ്ര നക്ഷത്രം' },
  jupiter:     { en: 'Jupiter Transit', ta: 'குரு பெயர்ச்சி', hi: 'गुरु गोचर', te: 'గురు సంచారం', kn: 'ಗುರು ಸಂಚಾರ', ml: 'ഗുരു സഞ്ചാരം' },
  rahu:        { en: 'Rahu Kalam', ta: 'ராகு காலம்', hi: 'राहु काल', te: 'రాహు కాలం', kn: 'ರಾಹು ಕಾಲ', ml: 'രാഹു കാലം' },
  pada:        { en: 'Pada', ta: 'பாதம்', hi: 'चरण', te: 'పాదం', kn: 'ಪಾದ', ml: 'പാദം' },
  house:       { en: 'House', ta: 'பாவம்', hi: 'भाव', te: 'భావం', kn: 'ಭಾವ', ml: 'ഭാവം' },
  fromRashi:   { en: 'from your Rashi', ta: 'உங்கள் ராசியிலிருந்து', hi: 'आपकी राशि से', te: 'మీ రాశి నుండి', kn: 'ನಿಮ್ಮ ರಾಶಿಯಿಂದ', ml: 'നിങ്ങളുടെ രാശിയിൽ നിന്ന്' },
  caution:     { en: 'Avoid starting contracts or travel', ta: 'ஒப்பந்தம் அல்லது பயணம் தொடங்க வேண்டாம்', hi: 'अनुबंध या यात्रा आरंभ न करें', te: 'ఒప్పందాలు లేదా ప్రయాణం ప్రారంభించవద్దు', kn: 'ಒಪ್ಪಂದ ಅಥವಾ ಪ್ರಯಾಣ ಆರಂಭಿಸಬೇಡಿ', ml: 'കരാർ ഒപ്പിടുകയോ യാത്ര തുടങ്ങുകയോ ചെയ്യരുത്' },
  defaultPlace:{ en: 'default location', ta: 'இயல்புநிலை இடம்', hi: 'डिफ़ॉल्ट स्थान', te: 'డిఫాల్ట్ ప్రదేశం', kn: 'ಡೀಫಾಲ್ಟ್ ಸ್ಥಳ', ml: 'ഡിഫോൾട്ട് സ്ഥലം' },
  activeNow:   { en: 'Active now', ta: 'இப்போது நடப்பில்', hi: 'अभी सक्रिय', te: 'ఇప్పుడు కొనసాగుతోంది', kn: 'ಈಗ ಜಾರಿಯಲ್ಲಿದೆ', ml: 'ഇപ്പോൾ സജീവം' }
};

const t = (key, lang) => LABELS[key]?.[lang] || LABELS[key]?.en || key;
const capitalise = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');
const prettyWindow = (w) => String(w || '').replace(' - ', ' – ');

/** "Chennai" or "Chennai (default location)": which place the sunrise-based times are for. */
const placeLabel = (forecast, lang) => {
  const loc = forecast?.timesLocation;
  if (!loc || !loc.name) return '';
  return loc.source === 'default' ? `${loc.name} (${t('defaultPlace', lang)})` : loc.name;
};

/**
 * Full "Today's Sky" card (3 rows). Used in the forecast modal and Personal Forecast screen.
 */
export function renderTodaySkyCard(forecast, lang = i18n.getLanguage()) {
  const nak = forecast?.nakshatra;
  const jup = forecast?.planetaryTransit;
  const rahu = forecast?.rahuKalam;
  if (!nak && !jup && !rahu) return '';

  const moonRow = nak ? `
    <div class="sky-row">
      <span class="sky-icon" aria-hidden="true"><span class="material-symbols-outlined">nightlight</span></span>
      <div class="sky-text">
        <span class="sky-label">${t('moon', lang)}</span>
        <span class="sky-value">${nak.name}</span>
        <span class="sky-sub">${t('pada', lang)} ${nak.pada} · ${capitalise(nak.ruler)} · ${nak.deity}</span>
      </div>
    </div>` : '';

  const jupiterRow = jup ? `
    <div class="sky-row">
      <span class="sky-icon" aria-hidden="true"><span class="material-symbols-outlined">auto_awesome</span></span>
      <div class="sky-text">
        <span class="sky-label">${t('jupiter', lang)}</span>
        <span class="sky-value">${jup.sign} ${jup.degree}°</span>
        <span class="sky-sub">${t('house', lang)} ${jup.house} ${t('fromRashi', lang)} · ${jup.domain}</span>
      </div>
    </div>` : '';

  const rahuRow = rahu ? `
    <div class="sky-row">
      <span class="sky-icon sky-icon-caution" aria-hidden="true"><span class="material-symbols-outlined">schedule</span></span>
      <div class="sky-text">
        <span class="sky-label">${t('rahu', lang)}${forecast.rahuKalamActive ? ` <span class="sky-badge-now">${t('activeNow', lang)}</span>` : ''}</span>
        <span class="sky-value">${prettyWindow(rahu)}</span>
        <span class="sky-sub">${[placeLabel(forecast, lang), t('caution', lang)].filter(Boolean).join(' · ')}</span>
      </div>
    </div>` : '';

  return `
    <section class="sky-card" aria-label="${t('title', lang)}">
      <div class="sky-head"><span aria-hidden="true">✦</span><span>${t('title', lang)}</span></div>
      ${moonRow}${jupiterRow}${rahuRow}
    </section>`;
}

/**
 * One-line summary for the home Personal Forecast pill: "Swati · Rahu Kalam 07:28 – 08:57".
 */
export function renderTodaySkyLine(forecast, lang = i18n.getLanguage()) {
  const nak = forecast?.nakshatra;
  const rahu = forecast?.rahuKalam;
  if (!nak && !rahu) return '';
  const parts = [];
  if (nak) parts.push(`<span><span aria-hidden="true">☽</span> ${nak.name}</span>`);
  if (rahu) {
    const cls = forecast.rahuKalamActive ? 'home-sky-rahu active' : 'home-sky-rahu';
    const now = forecast.rahuKalamActive ? ` · ${t('activeNow', lang)}` : '';
    parts.push(`<span class="${cls}">${t('rahu', lang)} ${prettyWindow(rahu)}${now}</span>`);
  }
  return `<div class="home-sky-line">${parts.join('')}</div>`;
}
