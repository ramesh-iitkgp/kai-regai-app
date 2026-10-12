/**
 * PersonalForecastModal Component — Sacred Vedic Daily Cosmic Transit & Palm Mount Alignment
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-HOM-001) & Hasta Samudrika Knowledge
 */

import { dailyForecastService, VEDIC_RASHIS } from '../services/DailyForecastService.js';
import { i18n } from '../services/i18n.js';
import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';

export function renderPersonalForecastModal({
  rashi = null,
  onClose = () => router.closeModal(),
  onScanCorrelate = () => {
    router.closeModal();
    router.navigate(ROUTES.SCANNER);
  }
} = {}) {
  const currentLang = i18n.getLanguage();
  const activeRashiKey = rashi || (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_rashi')) || 'Makara';
  const forecast = dailyForecastService.getForecastForToday(activeRashiKey, new Date(), currentLang);

  const localizedTitles = {
    modal_title: { en: 'Daily Cosmic Forecast', ta: 'தினசரி பிரபஞ்ச கணிப்பு', hi: 'दैनिक कॉस्मिक भविष्यफल', te: 'రోజువారీ జ్యోతిష్య ఫలితం', kn: 'ದೈನಂದಿನ ಕಾಸ್ಮಿಕ್ ಭವಿಷ್ಯ', ml: 'ദിവസേനയുള്ള കോസ്മിക് പ്രവചനം' },
    transit_title: { en: 'Celestial Transit Reflection', ta: 'இன்றைய கிரக சஞ்சார உரை', hi: 'ग्रह गोचर चिंतन', te: 'గ్రహ సంచార వివరణ', kn: 'ಗ್ರಹ ಸಂಚಾರ ವಿವರಣೆ', ml: 'ഗ്രഹസഞ്ചാര വിവരണം' },
    palm_title: { en: 'Palm Mount & Line Alignment', ta: 'கை மேடு மற்றும் ரேகை தொடர்பு', hi: 'हस्त पर्वत व रेखा सामंजस्य', te: 'హస్త పర్వత & రేఖా అనుసంధానం', kn: 'ಹಸ್ತ ಪರ್ವತ & ರೇಖಾ ಸಮನ್ವಯ', ml: 'ഹസ്ത പർവ്വത രേഖാ ബന്ധം' },
    auspicious_title: { en: 'Cosmic Harmonies', ta: 'சுப நிகழ்வுகள்', hi: 'शुभ योग व मुहूर्त', te: 'శుభ ముహూర్తం & రంగు', kn: 'ಶುಭ ಮುಹೂರ್ತ', ml: 'ശുഭ മുഹൂർത്തം' },
    color_label: { en: 'Auspicious Color', ta: 'சுப நிறம்', hi: 'शुभ रंग', te: 'శుభ రంగు', kn: 'ಶುಭ ಬಣ್ಣ', ml: 'ശുഭ നിറം' },
    muhurta_label: { en: 'Optimal Window', ta: 'உகந்த நேரம்', hi: 'अनुकूल समय', te: 'అనుకూల సమయం', kn: 'ಅನುಕೂಲ ಸಮಯ', ml: 'അനുകൂല സമയം' },
    scan_cta: { en: 'Scan Palm to Correlate (~10s)', ta: 'கையை ஸ்கேன் செய்க (~10 வி)', hi: 'हथेली स्कैन कर मिलान करें (~10 से)', te: 'అరచేతిని స్కాన్ చేయండి (~10 సె)', kn: 'ಹಸ್ತ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (~10 ಸೆ)', ml: 'കൈ സ്കാൻ ചെയ്യുക (~10 സെ)' },
    rashi_select_label: { en: 'Zodiac / Rashi', ta: 'ராசி தேர்வு', hi: 'राशि चुनें', te: 'రాశి ఎంచుకోండి', kn: 'ರಾಶಿ ಆಯ್ಕೆ', ml: 'രാശി തിരഞ്ഞെടുക്കുക' },
    metric_mind_lbl: { en: 'Mind', ta: 'மனம்', hi: 'मन', te: 'మనస్సు', kn: 'ಮನಸ್ಸು', ml: 'മനസ്സ്' }
  };

  const t = (k) => localizedTitles[k]?.[currentLang] || localizedTitles[k]?.en || k;

  return `
    <div id="forecast-modal-backdrop" class="kai-modal-backdrop open" style="display: flex; align-items: flex-end; justify-content: center; z-index: 9999;">
      <div class="kai-modal-sheet" style="max-height: 88vh; overflow-y: auto; padding: 20px 18px 28px; background: radial-gradient(circle at top, rgba(251, 191, 36, 0.12) 0%, rgba(14, 12, 20, 0.98) 100%), #0e0c14; border-top: 1px solid rgba(251, 191, 36, 0.4); box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(251, 191, 36, 0.2);">
        
        <!-- Sheet Top Bar -->
        <div style="display: flex; justify-content: center; margin-bottom: 12px;">
          <div style="width: 44px; height: 4px; border-radius: 9999px; background: rgba(251, 191, 36, 0.4);"></div>
        </div>

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div>
            <div class="kai-badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.35); font-size: 10px; margin-bottom: 6px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
              <span>✦</span>
              <span>${t('modal_title')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));">${forecast.symbol}</span>
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #ffffff; margin: 0; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);">
                ${forecast.localizedName}
              </h2>
            </div>
            <p style="font-size: 11px; color: #fbbf24; margin: 4px 0 0 0; font-weight: 600;">
              ${forecast.dateFormatted} • ${forecast.graha} • ${forecast.tattva}
            </p>
          </div>

          <button id="forecast-modal-close-btn" class="kai-btn-icon" aria-label="${i18n.t('cancel')}" style="background: rgba(255, 255, 255, 0.08); border-radius: 9999px; width: 34px; height: 34px; border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
          </button>
        </div>

        <!-- Rashi Switcher Bar -->
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #e4c276; text-transform: uppercase; letter-spacing: 0.08em;">
              ${t('rashi_select_label')}
            </span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none;">
            ${VEDIC_RASHIS.map(r => `
              <button 
                class="rashi-switch-pill ${r.key === forecast.rashiKey ? 'active' : ''}" 
                data-rashi="${r.key}"
                style="flex-shrink: 0; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; border: 1px solid ${r.key === forecast.rashiKey ? 'rgba(251, 191, 36, 0.9)' : 'rgba(255, 255, 255, 0.1)'}; background: ${r.key === forecast.rashiKey ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.04)'}; color: ${r.key === forecast.rashiKey ? '#fbbf24' : '#e4c276'}; transition: all 0.2s ease;">
                <span>${r.symbol}</span>
                <span>${r.names[currentLang] || r.names.en}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 4 Cosmic Metrics Bars -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <!-- Metric: Love -->
          <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 14px; padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #fda4af;">❤️ ${i18n.t('metric_love')}</span>
              <span style="font-size: 13px; font-weight: 700; color: #ffffff;">${forecast.metrics.love}%</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${forecast.metrics.love}%; height: 100%; background: linear-gradient(90deg, #f43f5e, #fb7185); border-radius: 9999px; box-shadow: 0 0 8px rgba(244,63,94,0.6);"></div>
            </div>
          </div>

          <!-- Metric: Energy -->
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #fde68a;">⚡ ${i18n.t('metric_energy')}</span>
              <span style="font-size: 13px; font-weight: 700; color: #ffffff;">${forecast.metrics.energy}%</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${forecast.metrics.energy}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 9999px; box-shadow: 0 0 8px rgba(245,158,11,0.6);"></div>
            </div>
          </div>

          <!-- Metric: Luck -->
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #6ee7b7;">✦ ${i18n.t('metric_luck')}</span>
              <span style="font-size: 13px; font-weight: 700; color: #ffffff;">${forecast.metrics.luck}%</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${forecast.metrics.luck}%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 9999px; box-shadow: 0 0 8px rgba(16,185,129,0.6);"></div>
            </div>
          </div>

          <!-- Metric: Mind -->
          <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #d8b4fe;">👁️ ${t('metric_mind_lbl')}</span>
              <span style="font-size: 13px; font-weight: 700; color: #ffffff;">${forecast.metrics.mind}%</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${forecast.metrics.mind}%; height: 100%; background: linear-gradient(90deg, #a855f7, #c084fc); border-radius: 9999px; box-shadow: 0 0 8px rgba(168,85,247,0.6);"></div>
            </div>
          </div>
        </div>

        <!-- Celestial Reflection Card -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.22); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="color: #fbbf24; font-size: 14px;">✦</span>
            <span style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.06em;">
              ${t('transit_title')}
            </span>
          </div>
          <p style="font-size: 12px; color: #e2e8f0; line-height: 1.5; margin: 0;">
            ${forecast.reflection}
          </p>
        </div>

        <!-- Palm Mount & Line Alignment (The Unique USP of Kai RegAI) -->
        <div style="background: radial-gradient(circle at top left, rgba(251, 191, 36, 0.14) 0%, rgba(20, 18, 28, 0.9) 100%), #14121c; border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 14px; padding: 14px; margin-bottom: 14px; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="material-symbols-outlined" style="color: #fbbf24; font-size: 18px;">back_hand</span>
            <span style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.06em;">
              ${t('palm_title')}
            </span>
          </div>
          <p style="font-size: 12px; color: #fef08a; line-height: 1.5; margin: 0 0 8px 0;">
            ${forecast.palmCorrelate}
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="kai-badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); font-size: 10px; padding: 2px 8px;">
              ${forecast.palmMount}
            </span>
            <span class="kai-badge" style="background: rgba(0, 210, 255, 0.12); color: #38bdf8; border: 1px solid rgba(0, 210, 255, 0.35); font-size: 10px; padding: 2px 8px;">
              ${forecast.palmLineFocus}
            </span>
          </div>
        </div>

        <!-- Auspicious Elements -->
        <div style="display: flex; gap: 10px; margin-bottom: 18px;">
          <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px; text-align: center;">
            <span style="font-size: 10px; color: #94a3b8; display: block; text-transform: uppercase;">${t('color_label')}</span>
            <span style="font-size: 12px; font-weight: 700; color: #fbbf24; margin-top: 3px; display: block;">${forecast.auspiciousColor}</span>
          </div>
          <div style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px; text-align: center;">
            <span style="font-size: 10px; color: #94a3b8; display: block; text-transform: uppercase;">${t('muhurta_label')}</span>
            <span style="font-size: 11px; font-weight: 600; color: #e2e8f0; margin-top: 3px; display: block;">${forecast.auspiciousMuhurta}</span>
          </div>
        </div>

        <!-- Primary Action Button -->
        <button id="forecast-scan-correlate-btn" class="kai-btn kai-btn-gold" style="width: 100%; padding: 14px; font-size: 14px; font-weight: 700; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.35); cursor: pointer;">
          <span class="material-symbols-outlined" style="font-size: 20px;">camera</span>
          <span>${t('scan_cta')}</span>
        </button>

      </div>
    </div>
  `;
}

/**
 * Attaches interactive handlers to the Personal Forecast modal
 */
export function attachPersonalForecastListeners(modalContainer, { onClose, onScanCorrelate, onRashiChange }) {
  modalContainer.querySelector('#forecast-modal-close-btn')?.addEventListener('click', () => {
    if (onClose) onClose();
    else router.closeModal();
  });

  modalContainer.querySelector('#forecast-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'forecast-modal-backdrop') {
      if (onClose) onClose();
      else router.closeModal();
    }
  });

  modalContainer.querySelector('#forecast-scan-correlate-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'MODE_1_SCANNER', source: 'personal_forecast_modal' });
    if (onScanCorrelate) onScanCorrelate();
    else {
      router.closeModal();
      router.navigate(ROUTES.SCANNER);
    }
  });

  // Handle switching Rashi
  modalContainer.querySelectorAll('.rashi-switch-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetRashi = btn.getAttribute('data-rashi');
      if (targetRashi) {
        dailyForecastService.saveUserRashi(targetRashi);
        if (onRashiChange) {
          onRashiChange(targetRashi);
        } else {
          router.openModal('personal_forecast', { rashi: targetRashi });
        }
      }
    });
  });
}
