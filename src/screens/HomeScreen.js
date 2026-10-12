/**
 * HomeScreen Component — Home Hub & Landing Experience
 * Phase: P16 — Production UX, Reading Experience & Conversion
 * Matches Stitch: design/stitch/kai_regai_home_dashboard/
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-HOM-001) & docs/p16/
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { mockUserProfile } from '../mock/mockUserProfile.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { readingHistoryService } from '../services/ReadingHistoryService.js';
import { dailyForecastService } from '../services/DailyForecastService.js';
import { i18n } from '../services/i18n.js';
import { renderTodaySkyHomeLine } from '../components/TodaySky.js';

export function renderHomeScreen(container) {
  // Emit funnel landing event
  reportTelemetry.logEvent(TELEMETRY_EVENTS.LANDING_VIEW, { screen: 'home' });

  const storedName = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_name')) || i18n.t('default_user_name');
  const storedRashi = typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_rashi');
  const storedZodiacRaw = typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_zodiac');

  const RASHI_LOCALIZATION = {
    'Makara': { en: 'Makara', ta: 'மகரம்', hi: 'मकर', te: 'మకరం', kn: 'ಮಕರ', ml: 'മകരം' },
    'Kumbha': { en: 'Kumbha', ta: 'கும்பம்', hi: 'कुम्भ', te: 'కుంభం', kn: 'ಕುಂಭ', ml: 'കുംഭം' },
    'Meena': { en: 'Meena', ta: 'மீனம்', hi: 'मीन', te: 'మీనం', kn: 'ಮೀನ', ml: 'മീനം' },
    'Mesha': { en: 'Mesha', ta: 'மேஷம்', hi: 'मेष', te: 'మేషం', kn: 'ಮೇಷ', ml: 'മേടം' },
    'Vrishabha': { en: 'Vrishabha', ta: 'ரிஷபம்', hi: 'वृषभ', te: 'వృషభం', kn: 'ವೃಷಭ', ml: 'ഇടവം' },
    'Mithuna': { en: 'Mithuna', ta: 'மிதுனம்', hi: 'मिथुन', te: 'మిథునం', kn: 'ಮಿಥುನ', ml: 'മിഥುനം' },
    'Karka': { en: 'Karka', ta: 'கடகம்', hi: 'कर्क', te: 'కర్కాటకం', kn: 'ಕರ್ಕಾಟಕ', ml: 'കർക്കിടകം' },
    'Simha': { en: 'Simha', ta: 'சிம்மம்', hi: 'सिंह', te: 'సింహం', kn: 'ಸಿಂಹ', ml: 'ചിങ്ങം' },
    'Kanya': { en: 'Kanya', ta: 'கன்னி', hi: 'कन्या', te: 'కన్య', kn: 'ಕನ್ಯಾ', ml: 'കന്നി' },
    'Tula': { en: 'Tula', ta: 'துலாம்', hi: 'तुला', te: 'తులా', kn: 'ತುಲಾ', ml: 'തുലാം' },
    'Vrishchika': { en: 'Vrishchika', ta: 'விருச்சிகம்', hi: 'वृश्चिक', te: 'వృశ్చికం', kn: 'ವೃಶ್ಚಿಕ', ml: 'വൃശ്ചികം' },
    'Dhanu': { en: 'Dhanu', ta: 'தனுசு', hi: 'धनु', te: 'ధనుస్సు', kn: 'ಧನು', ml: 'ധനു' }
  };

  const currentLang = i18n.getLanguage();
  const storedZodiac = (storedRashi && RASHI_LOCALIZATION[storedRashi]?.[currentLang]) || storedZodiacRaw;
  const activeRashi = storedRashi || 'Makara';
  const todayForecast = dailyForecastService.getForecastForToday(activeRashi, new Date(), currentLang);

  let latestReading = {
    id: mockReadings[0].id,
    title: i18n.t('mock_title_0'),
    summary: i18n.t('mock_summary_0'),
    timestamp: mockReadings[0].timestamp,
    mode: 'MODE_1_SCANNER'
  };

  // Check if a real persisted reading exists in history
  readingHistoryService.listHistory().then(({ records }) => {
    if (records && records.length > 0) {
      const top = records[0];
      latestReading = {
        id: top.readingId,
        title: top.metadata.displayTitle,
        summary: top.metadata.summary,
        timestamp: top.createdAt,
        mode: top.readingMethod === 'MODE_2_QUESTIONNAIRE' ? 'MODE_2_GUIDED' : 'MODE_1_SCANNER',
        isPersisted: true,
        persistedRecord: top
      };
      const recentTitleEl = container.querySelector('#home-recent-title');
      const recentSummaryEl = container.querySelector('#home-recent-summary');
      if (recentTitleEl && recentSummaryEl) {
        recentTitleEl.textContent = latestReading.title;
        recentSummaryEl.textContent = latestReading.summary;
      }
    }
  }).catch(() => {});

  container.innerHTML = `
    <div class="home-visual-stack">
      
      <!-- Greeting Header -->
      <section style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 7px; height: 7px; border-radius: 9999px; background: var(--color-secondary); box-shadow: 0 0 8px rgba(228,194,118,0.7);" class="glow-pulsing"></span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.12em; text-transform: uppercase;">
            ${i18n.t('welcome')}, ${storedName}
          </span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          ${storedZodiac ? `
            <div class="kai-badge" style="font-size: 10px; padding: 2px 8px; background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.4); box-shadow: 0 0 10px rgba(251,191,36,0.2);">
              <span>✦ ${storedZodiac}</span>
            </div>
          ` : ''}
          <div class="kai-badge" style="font-size: 10px; padding: 2px 8px; background: rgba(251,191,36,0.1); color: #e4c276; border: 1px solid rgba(251,191,36,0.3);">
            <span class="material-symbols-outlined" style="font-size: 12px; color: #fbbf24;">back_hand</span>
            <span>${i18n.t('dominant')}: ${mockUserProfile.dominant_hand === 'RIGHT' ? i18n.t('dominant_right') : i18n.t('dominant_left')}</span>
          </div>
        </div>
      </section>

      <!-- Card 0: Initial Onboarding & Birth Setup Shortcut -->
      <section id="home-onboarding-restart-card" class="kai-card" style="margin-bottom: 8px; padding: 10px 14px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(20, 16, 10, 0.95) 100%); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: transform 0.15s ease;" role="button" tabindex="0" aria-label="Initial Onboarding">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(251, 191, 36, 0.2); border: 1px solid rgba(251, 191, 36, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 10px rgba(251, 191, 36, 0.25);">
            <span class="material-symbols-outlined" style="font-size: 18px; color: #fbbf24;">auto_awesome</span>
          </div>
          <div>
            <h4 style="font-size: 12.5px; font-weight: 700; color: #fbbf24; margin: 0;">Initial Onboarding & Birth Setup</h4>
            <p style="font-size: 10.5px; color: #e4c276; margin: 2px 0 0 0;">Test Place of Birth autocomplete, GPS location & Clock picker</p>
          </div>
        </div>
        <span class="kai-badge kai-badge-primary" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; flex-shrink: 0;">
          Launch ➔
        </span>
      </section>

      <!-- Card 1: Chat with Astrologer (Hero Banner) -->
      <section id="home-chat-astrologer-card" class="home-banner-card" style="background-image: url('/assets/home/astrologer_banner.jpg');" role="button" tabindex="0" aria-label="${i18n.t('chat_astrologer_title')}">
        <div class="home-banner-card-overlay">
          <div class="home-banner-badge">
            <span class="home-banner-badge-dot"></span>
            <span>${i18n.t('online')}</span>
          </div>
          <div class="home-banner-bottom">
            <div>
              <h2 class="home-banner-title">${i18n.t('chat_astrologer_title')}</h2>
              <p class="home-banner-subtitle">${i18n.t('chat_astrologer_sub')}</p>
            </div>
            <div class="home-circle-arrow-btn">
              <span class="material-symbols-outlined" style="font-size: 20px;">chevron_right</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Card 2: Personal Forecast Pill -->
      <section id="home-personal-forecast-card" class="home-forecast-pill" role="button" tabindex="0" aria-label="${i18n.t('personal_forecast_title')}">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 9999px; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); font-size: 11px; font-weight: 700; color: #fbbf24;">
              <span>🔥</span>
              <span>${i18n.t('popular')}</span>
            </div>
            <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">
              ${i18n.t('personal_forecast_title')}
            </h3>
          </div>
          <span class="material-symbols-outlined" style="color: var(--color-outline); font-size: 20px;">chevron_right</span>
        </div>
        <div style="display: flex; gap: 14px; margin-top: 10px; font-size: 12px; color: #e4c276;">
          <span><strong style="color: #fbbf24;">✦</strong> ${i18n.t('metric_love')}: ${todayForecast.metrics.love}%</span>
          <span><strong style="color: #fbbf24;">✦</strong> ${i18n.t('metric_energy')}: ${todayForecast.metrics.energy}%</span>
          <span><strong style="color: #fbbf24;">✦</strong> ${i18n.t('metric_luck')}: ${todayForecast.metrics.luck}%</span>
        </div>
        ${renderTodaySkyHomeLine(todayForecast)}
      </section>

      <!-- Card 3 & 4: Hand Scanner + Face Scanner (2-Column Grid with Golden Light) -->
      <section class="home-2col-grid">
        <div id="home-launch-scanner-btn" class="home-square-card" style="background-image: url('/assets/home/hand_scanner.jpg');" role="button" tabindex="0" aria-label="${i18n.t('hand_scanner_title')}">
          <div class="home-square-card-overlay">
            <h3 class="home-square-card-title">${i18n.t('hand_scanner_title').replace('\n', '<br>')}</h3>
            <span class="home-gold-tag">${i18n.t('hand_scanner_sub')}</span>
          </div>
        </div>

        <div id="home-launch-face-btn" class="home-square-card" style="background-image: url('/assets/home/face_scanner.jpg');" role="button" tabindex="0" aria-label="${i18n.t('face_scanner_title')}">
          <div class="home-square-card-overlay">
            <h3 class="home-square-card-title">${i18n.t('face_scanner_title').replace('\n', '<br>')}</h3>
            <span class="home-gold-tag">${i18n.t('face_scanner_sub')}</span>
          </div>
        </div>
      </section>

      <!-- Bottom Split: Palm Reading & Magic Ball + Tarot Card (Dark Gold Theme) -->
      <section class="home-bottom-split">
        <div class="home-bottom-left-stack">
          <div id="home-launch-guided-btn" class="home-compact-tile" role="button" tabindex="0" aria-label="${i18n.t('palm_reading_title')}">
            <div class="home-gold-icon-badge">
              <span style="font-size: 19px; color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.95);">★</span>
            </div>
            <div>
              <h4 style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);">${i18n.t('palm_reading_title')}</h4>
              <p style="font-size: 11px; color: #e4c276; margin: 2px 0 0 0;">${i18n.t('palm_reading_sub')}</p>
            </div>
          </div>

          <div id="home-launch-oracle-btn" class="home-compact-tile" role="button" tabindex="0" aria-label="${i18n.t('oracle_title')}">
            <div class="home-gold-icon-badge">
              <span style="font-size: 19px; color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.95);">✧</span>
            </div>
            <div>
              <h4 style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);">${i18n.t('oracle_title')}</h4>
              <p style="font-size: 11px; color: #e4c276; margin: 2px 0 0 0;">${i18n.t('oracle_sub')}</p>
            </div>
          </div>
        </div>

        <div id="home-open-codex-btn" class="home-tall-card" style="background-image: url('/assets/home/tarot_cards.jpg');" role="button" tabindex="0" aria-label="${i18n.t('tarot_title')}">
          <div class="home-square-card-overlay">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: auto;">
              <span class="home-card-pill-tag">✦ 78 CARDS</span>
              <div class="home-card-mini-arrow">
                <span class="material-symbols-outlined" style="font-size: 15px;">arrow_forward</span>
              </div>
            </div>
            <h3 class="home-square-card-title">${i18n.t('tarot_title')}</h3>
            <span class="home-gold-tag">${i18n.t('tarot_sub')}</span>
          </div>
        </div>
      </section>

      <!-- Recent Reading Card (Dark Gold Theme) -->
      <section style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.08em; text-transform: uppercase;">
            ${i18n.t('latest_reading_title')}
          </span>
          <button id="home-view-all-readings" style="background: none; border: none; font-size: 11px; font-weight: 600; color: #e4c276; cursor: pointer; padding: 4px 8px;">
            ${i18n.t('view_archive')}
          </button>
        </div>

        <div id="home-recent-card" class="kai-card" style="padding: 14px; cursor: pointer; display: flex; gap: 12px; align-items: center; border: 1px solid rgba(251, 191, 36, 0.25); background: radial-gradient(circle at top left, rgba(251, 191, 36, 0.1) 0%, rgba(18, 16, 26, 0.96) 100%), #12101a; box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 14px rgba(251, 191, 36, 0.1);" role="button" tabindex="0" aria-label="Open latest reading">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(20, 16, 10, 0.9) 100%); border: 1px solid rgba(251, 191, 36, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 12px rgba(251, 191, 36, 0.3);">
            <span class="material-symbols-outlined" style="color: #fbbf24; font-size: 22px; filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.7));">fingerprint</span>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 id="home-recent-title" style="font-size: 13px; font-weight: 600; color: #ffffff; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                ${latestReading.title}
              </h4>
              <span style="font-size: 10px; color: #fbbf24; font-weight: 700;">${i18n.t('recent')}</span>
            </div>
            <p id="home-recent-summary" style="font-size: 11px; color: #e4c276; margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
              ${latestReading.summary}
            </p>
          </div>
        </div>
      </section>

      <!-- Trust, How Kai RegAI Works & Ethical Disclosures -->
      <section style="margin-top: 12px; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(251, 191, 36, 0.2);">
        <div style="text-align: center; margin-bottom: 10px;">
          <h4 style="font-family: var(--font-display); font-size: 13px; font-weight: 700; color: #fbbf24; margin: 0;">How Kai RegAI Works</h4>
          <p style="font-size: 11px; color: #e4c276; margin: 2px 0 0 0;">The Story Written in Your Hands</p>
        </div>
        <div style="font-size: 11px; color: #d1d5db; line-height: 1.5; display: flex; flex-direction: column; gap: 6px;">
          <div>Choose your preferred path: instant optical <strong>Hand Scanner</strong> or in-depth <strong>Guided Palm Reading</strong>.</div>
          <div><strong>1. Observe:</strong> On-device visual crease analysis without uploading raw biometrics.</div>
          <div><strong>2. Interpret:</strong> Classical Samudrika Shastra rules grounded in traditional knowledge.</div>
          <div><strong>3. Explain:</strong> Rigorous epistemic tier separation between observations and interpretations.</div>
          <div><strong>4. Privacy Guaranteed:</strong> Ephemeral RAM-only analysis with zero persistent photo retention.</div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <span style="font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase;">Ethical Palmistry Notice</span>
          <p style="font-size: 10px; color: var(--color-outline); line-height: 1.4; margin: 4px 0 0 0;">
            ${i18n.t('disclaimer')}
          </p>
        </div>
      </section>

    </div>
  `;

  document.getElementById('home-onboarding-restart-card')?.addEventListener('click', () => {
    sessionStorage.removeItem('kai_logo_splash_shown');
    localStorage.removeItem('kai_onboarding_completed');
    router.navigate(ROUTES.SPLASH);
  });

  document.getElementById('home-chat-astrologer-card')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'chat_astrologer_opened' });
    router.navigate(ROUTES.CHAT);
  });

  document.getElementById('home-personal-forecast-card')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'personal_forecast_requested' });
    router.openModal('forecast_context_input');
  });

  document.getElementById('home-launch-scanner-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'MODE_1_SCANNER' });
    router.navigate(ROUTES.SCANNER);
  });

  document.getElementById('home-launch-face-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'FACE_SCANNER' });
    router.navigate(ROUTES.FACE_SCANNER);
  });

  document.getElementById('home-launch-guided-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'MODE_2_QUESTIONNAIRE' });
    router.navigate(ROUTES.GUIDED_READING);
  });

  document.getElementById('home-launch-oracle-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'ask_the_oracle' });
    router.navigate(ROUTES.ORACLE);
  });

  document.getElementById('home-recent-card')?.addEventListener('click', () => {
    if (latestReading.isPersisted && latestReading.persistedRecord) {
      const dossier = latestReading.persistedRecord.interpretationSnapshot;
      if (latestReading.mode === 'MODE_2_GUIDED') {
        router.navigate(ROUTES.DETAILED_REPORT, { dossier, id: latestReading.id });
      } else {
        router.navigate(ROUTES.QUICK_REPORT, { dossier, id: latestReading.id });
      }
    } else {
      router.navigate(ROUTES.QUICK_REPORT, { id: latestReading.id });
    }
  });

  document.getElementById('home-view-all-readings')?.addEventListener('click', () => {
    router.navigate(ROUTES.READINGS);
  });

  document.getElementById('home-open-codex-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'tarot_tile_clicked' });
    router.navigate(ROUTES.TAROT);
  });
}
