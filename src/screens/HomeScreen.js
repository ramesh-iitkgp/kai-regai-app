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

export function renderHomeScreen(container) {
  // Emit funnel landing event
  reportTelemetry.logEvent(TELEMETRY_EVENTS.LANDING_VIEW, { screen: 'home' });

  let latestReading = mockReadings[0];

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
    <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Brand & Greeting Header -->
      <section style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 9999px; background: var(--color-secondary); box-shadow: 0 0 8px rgba(228,194,118,0.7);" class="glow-pulsing"></span>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.12em; text-transform: uppercase;">
              Good evening, ${mockUserProfile.display_name}
            </span>
          </div>
          <div class="kai-badge kai-badge-secondary" style="font-size: 10px; padding: 2px 8px;">
            <span class="material-symbols-outlined" style="font-size: 12px; color: var(--color-primary);">back_hand</span>
            <span>Dominant: ${mockUserProfile.dominant_hand}</span>
          </div>
        </div>

        <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--color-text-high); margin-top: 4px; line-height: 1.25;">
          The Story Written in Your Hands
        </h1>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); line-height: 1.4;">
          AI-assisted traditional palmistry and reflective personal interpretation. Discover your palm’s unique patterns, lines, and constitutional markers.
        </p>
      </section>

      <!-- Pathway 1: Hand Scanner (~10s Instant Camera Scan) -->
      <section class="kai-card kai-card-gold-rim" style="padding: 20px; overflow: hidden; background: var(--color-surface-container);">
        <!-- Radial atmospheric aurora glow -->
        <div style="position: absolute; -right: 40px; -top: 40px; width: 180px; height: 180px; border-radius: 9999px; background: rgba(147, 125, 255, 0.18); filter: blur(40px); pointer-events: none;"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 2; position: relative;">
          <span class="kai-badge kai-badge-primary">
            <span class="material-symbols-outlined" style="font-size: 13px;">neurology</span>
            <span>Rapid Optical Scan • ~10s</span>
          </span>
          <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--color-surface-container-high); display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border-subtle); box-shadow: 0 0 16px rgba(147,125,255,0.2);">
            <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 24px;">document_scanner</span>
          </div>
        </div>

        <!-- Biometric Palm Preview Graphic -->
        <div style="position: relative; height: 130px; margin: 16px 0; border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface-container-lowest); display: flex; align-items: center; justify-content: center;">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPH52puV1GapnfmvKBwXyAYdXh9B_GfqmOX2g9D-N3HkU7pOGrvTD7ZK8Gty0A1ytEtJGj4udfEMBoVJ8WENL9wNzr0Bd6PKHkZGZxkP6La8NB74RHPb4hxf3c_8FscpS1Urkgw5i6oj2iqd_KWVP0twOkkdmE9A2oW8Jy2nQmYxt69BUkKsGCPBdBTjst7eJyyQM8dvpLo375TWFW6pPk_dKv8DXljfBSliVtbkwsBsAJaUXFe5EYKtlb7oh9Qh_mKQ" 
               alt="Palm scan telemetry graphic"
               style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; mix-blend-mode: screen;">
          
          <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(10,14,26,0.9) 100%);"></div>

          <div style="position: absolute; bottom: 10px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-tertiary); display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="font-size: 13px;">check_circle</span>
              CV Engine: 84.4% Recall Certified
            </span>
            <span style="font-family: monospace; font-size: 10px; color: var(--color-on-surface-variant);">
              RAM-ONLY SECURE
            </span>
          </div>
        </div>

        <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high);">
          Hand Scanner
        </h2>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px;">
          Instant 10-second camera scan with real-time palm tracking, crease extraction, and immediate interpretation.
        </p>

        <button id="home-launch-scanner-btn" class="kai-btn kai-btn-primary" style="margin-top: 16px;" type="button">
          <span class="material-symbols-outlined">photo_camera</span>
          <span>Start Instant Scan</span>
        </button>
      </section>

      <!-- Pathway 2: Palm Reading (Guided Deep Consultation) -->
      <section class="kai-card" style="padding: 20px; border-left: 3px solid var(--color-secondary); background: var(--color-surface-container);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span class="kai-badge kai-badge-secondary">
            <span class="material-symbols-outlined" style="font-size: 13px;">psychology</span>
            <span>Vedic Deep Consultation</span>
          </span>
          <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(228, 194, 118, 0.12); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(228, 194, 118, 0.3);">
            <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 24px;">menu_book</span>
          </div>
        </div>

        <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high); margin-top: 14px;">
          Guided Palm Reading
        </h2>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px;">
          Interactive multi-step exploration for features difficult to capture optically: thumb flexibility, palmar mount firmness, and auspicious marks.
        </p>

        <button id="home-launch-guided-btn" class="kai-btn kai-btn-gold" style="margin-top: 16px;" type="button">
          <span class="material-symbols-outlined">explore</span>
          <span>Explore Guided Reading</span>
        </button>
      </section>

      <!-- Trust & How It Works Banner -->
      <section class="kai-card" style="padding: 18px; background: var(--color-surface-container-low); border: 1px solid var(--color-border-subtle);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 20px;">verified</span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            How Kai RegAI Works
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <span class="material-symbols-outlined" style="color: var(--color-tertiary); font-size: 18px; margin-top: 2px;">visibility</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">1. Observe</h4>
              <p style="font-size: 12px; color: var(--color-on-surface-variant);">Computer vision analyzes visible crease polylines, depth, and curvature on-device.</p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 18px; margin-top: 2px;">auto_stories</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">2. Interpret</h4>
              <p style="font-size: 12px; color: var(--color-on-surface-variant);">Traditional Hasta Samudrika and Classical chiromancy codices structure each observation.</p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 18px; margin-top: 2px;">psychology</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">3. Explain</h4>
              <p style="font-size: 12px; color: var(--color-on-surface-variant);">Clear epistemic separation distinguishes physical observations from traditional symbolism.</p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <span class="material-symbols-outlined" style="color: var(--color-success); font-size: 18px; margin-top: 2px;">shield_lock</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">4. Privacy Guaranteed</h4>
              <p style="font-size: 12px; color: var(--color-on-surface-variant);">RAM-only ephemeral processing. Zero camera photos are ever stored, uploaded, or sold.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Reading Card -->
      <section style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Latest Reading
          </span>
          <button id="home-view-all-readings" style="background: none; border: none; font-size: 11px; font-weight: 600; color: var(--color-secondary); cursor: pointer; padding: 4px 8px;">
            View Archive →
          </button>
        </div>

        <div id="home-recent-card" class="kai-card" style="padding: 16px; cursor: pointer; display: flex; gap: 14px; align-items: center;" role="button" tabindex="0" aria-label="Open latest reading">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-sm); background: var(--color-surface-container-highest); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 24px;">fingerprint</span>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 id="home-recent-title" style="font-size: 14px; font-weight: 600; color: var(--color-text-high); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                ${latestReading.title}
              </h4>
              <span style="font-size: 11px; color: var(--color-outline);">Recent</span>
            </div>
            <p id="home-recent-summary" style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
              ${latestReading.summary}
            </p>
          </div>
        </div>
      </section>

      <!-- Hastarekha Codex Spotlight -->
      <section class="kai-card" style="padding: 16px; background: linear-gradient(135deg, rgba(38,41,55,0.7) 0%, rgba(20,24,38,0.9) 100%);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="color: var(--color-tertiary); font-size: 24px;">auto_awesome</span>
          <div>
            <span style="font-size: 10px; font-weight: 700; color: var(--color-tertiary); text-transform: uppercase;">Codex Spotlight</span>
            <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Ayur Rekha — The Life Line</h4>
          </div>
        </div>
        <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 8px; line-height: 1.4;">
          Ancient Vedic texts revere the life line as an energetic indicator of constitutional vitality, not a fatalistic lifespan clock.
        </p>
        <button id="home-open-codex-btn" style="background: none; border: none; font-size: 12px; font-weight: 600; color: var(--color-secondary); margin-top: 10px; cursor: pointer; padding: 0;">
          Read Codex Chapter →
        </button>
      </section>

      <!-- Ethics & Legal Disclaimer Card -->
      <section style="padding: 12px 14px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.03); border: 1px solid var(--color-border-subtle); text-align: center;">
        <p style="font-size: 11px; color: var(--color-outline); line-height: 1.5;">
          <strong>Ethical Palmistry Notice:</strong> Kai RegAI is an introspective and reflective platform. It does not provide medical diagnosis, lifespan predictions, psychological counseling, or financial guarantees.
        </p>
      </section>

    </div>
  `;

  document.getElementById('home-launch-scanner-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'MODE_1_SCANNER' });
    router.navigate(ROUTES.SCANNER);
  });

  document.getElementById('home-launch-guided-btn')?.addEventListener('click', () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'MODE_2_QUESTIONNAIRE' });
    router.navigate(ROUTES.GUIDED_READING);
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
    router.navigate(ROUTES.LEARN, { article: 'art-life-line' });
  });
}
