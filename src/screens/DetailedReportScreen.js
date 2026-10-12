/**
 * DetailedReportScreen Component — Mode 2 Comprehensive Multi-Chapter Palm Reading Report
 * Faithfully matches user reference designs:
 * 1. Overview View ("Your Palm Reading Report")
 *    - Scanned hand with labeled line pins (Heart, Head, Life, Sun, Fate, Mercury)
 *    - Parchment "Quick Summary" scroll card with 5 interactive trait items
 *    - "Explore Your Detailed Reading" 6 visual line cards
 *    - "Your Life Journey Insights" bottom teaser with "View Predictions >" button
 * 2. Detailed Line View ("Heart Line", "Head Line", "Life Line", etc.)
 *    - Highlighted hand with the active line glowing in radiant laser beam
 *    - Parchment in-depth analysis card with 4 Key Indications
 *    - "What Your [Line] Reveals" 4 trait boxes
 *    - "Your [Line] Variation" interactive variation carousel with gold checkmark
 *    - Persistent bottom line navigation tabs (Heart, Head, Life, Fate, Sun, Other)
 * 3. Life Journey Insights View ("Your Life Journey Insights")
 *    - Sunrise mountain temples hero landscape card
 *    - 5 Developmental life phases timeline (0-18, 19-32, 33-45, 46-60, 60+) with winding path
 *    - "Your Path Ahead" sacred Diya altar card with button to return to report
 * Source of truth: docs/p2/REPORT_ARCHITECTURE.md & user reference designs
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { 
  LINE_CONFIGS, 
  getReportQuickSummary, 
  getDetailedLineData, 
  getLifeJourneyTimeline 
} from '../services/DetailedReportKnowledge.js';
import { renderDetailedPalmArtwork } from '../components/DetailedPalmArtwork.js';

export function renderDetailedReportScreen(container, params = {}) {
  reportTelemetry.logEvent(TELEMETRY_EVENTS.DETAILED_REPORT_VIEW, { reportTier: 'DETAILED' });

  const rawReading = params.dossier || mockReadings.find(r => r.id === params.id) || mockReadings[1];
  const profile = rawReading.profile || {};
  const hand = (profile.hand || rawReading.hand_side || 'LEFT').toUpperCase();
  const isLeft = hand === 'LEFT';
  const handSideLabel = isLeft ? 'LEFT PALM' : 'RIGHT PALM';
  const handSpiritLabel = isLeft ? 'Your Inner Self' : 'Your Manifested Path';

  // Navigation State
  let activeView = router.preservedState.detailedReportView || 'OVERVIEW'; // 'OVERVIEW', 'LINES', 'JOURNEY'
  let activeLineKey = router.preservedState.detailedReportLine || 'HEART'; // 'HEART', 'HEAD', 'LIFE', 'FATE', 'SUN', 'OTHER'

  // Dynamic Content Generators
  const quickSummaryItems = getReportQuickSummary(profile);
  const journeyTimeline = getLifeJourneyTimeline(profile);

  function render() {
    let headerTitle = 'Your Palm Reading Report';
    let headerSubtitle = 'A blend of ancient Indian palmistry and modern AI analysis to reveal insights about your life, personality and future.';
    let viewContentHtml = '';

    if (activeView === 'OVERVIEW') {
      headerTitle = 'Your Palm Reading Report';
      headerSubtitle = 'A blend of ancient Indian palmistry and modern AI analysis to reveal insights about your life, personality and future.';
      viewContentHtml = renderOverviewView();
    } else if (activeView === 'LINES') {
      const lineData = getDetailedLineData(activeLineKey, profile);
      headerTitle = lineData.config.name;
      headerSubtitle = lineData.config.subtitle;
      viewContentHtml = renderDetailedLineView(lineData);
    } else if (activeView === 'JOURNEY') {
      headerTitle = 'Your Life Journey Insights';
      headerSubtitle = 'Key phases, opportunities and guidance based on your palm reading.';
      viewContentHtml = renderJourneyView();
    }

    container.innerHTML = `
      <div class="report-screen-root">
        <div class="report-watermark-bg"></div>

        <!-- Top Header Navigation with Center Title -->
        <header class="report-top-header">
          <button id="report-back-btn" class="report-back-btn" aria-label="Go Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="report-top-title-group">
            <h1 class="report-hero-title">${headerTitle}</h1>
            <p class="report-hero-subtitle">${headerSubtitle}</p>
          </div>

          <div class="report-badge-tradition-wrap">
            <img src="/assets/report/badge_wisdom_ai.png" alt="Traditional Wisdom Powered by AI" class="report-badge-tradition-img" />
          </div>
        </header>

        <!-- View Body -->
        ${viewContentHtml}

      </div>
    `;

    attachListeners();
  }

  // =========================================================================
  // VIEW 1: MAIN REPORT OVERVIEW
  // =========================================================================
  function renderOverviewView() {
    return `
      <!-- Hand Visual & Parchment Quick Summary Row -->
      <div class="report-overview-hero-row">
        
        <!-- Left: Hand with Labeled Line Pins -->
        <div class="report-hand-preview-card">
          <img src="/assets/report/palm_overview_lines.jpg" alt="Analyzed Palm Lines" class="report-hand-preview-img" />
          <div class="report-hand-footer-badge">
            ${handSideLabel} • ${handSpiritLabel}
          </div>
        </div>

        <!-- Right: Parchment Quick Summary Card -->
        <div class="report-parchment-card">
          <div class="report-parchment-header">
            <span class="report-parchment-lotus">❖</span>
            <h3 class="report-parchment-title">Quick Summary</h3>
          </div>

          <div class="report-summary-list">
            ${quickSummaryItems.map(item => `
              <div class="report-summary-item" data-open-line="${item.lineKey}" role="button" tabindex="0">
                <div class="report-summary-icon-box" style="background: ${item.bg}; color: ${item.color};">
                  ${getIconSvg(item.icon, 15)}
                </div>
                <div class="report-summary-item-body">
                  <h4 class="report-summary-item-title">${item.title}</h4>
                  <p class="report-summary-item-desc">${item.desc}</p>
                </div>
                <div class="report-summary-chevron">›</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Flourish Divider -->
      <div class="report-flourish-divider">
        <div class="report-flourish-line"></div>
        <span>❖ Explore Your Detailed Reading ❖</span>
        <div class="report-flourish-line"></div>
      </div>

      <!-- 6 Detailed Line Cards -->
      <div class="report-lines-grid">
        ${Object.values(LINE_CONFIGS).map(cfg => `
          <div class="report-line-card" 
               data-open-line="${cfg.key}" 
               style="--card-accent: ${cfg.color}; --card-glow: ${cfg.colorDark};" 
               role="button" 
               tabindex="0">
            <div class="report-line-card-icon-box">
              ${getIconSvg(cfg.icon, 18)}
            </div>
            <h4 class="report-line-card-title">${cfg.name}</h4>
            <p class="report-line-card-sub">${cfg.calloutText}</p>
            <div class="report-line-card-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Bottom Journey Banner -->
      <div class="report-journey-cta-banner">
        <div class="report-journey-banner-left">
          <span class="report-crescent-moon-icon">☽</span>
          <div>
            <h4 class="report-journey-banner-title">Your Life Journey Insights</h4>
            <p class="report-journey-banner-sub">Discover key phases, opportunities and guidance for a better future.</p>
          </div>
        </div>
        <button id="report-open-journey-btn" class="report-journey-view-btn" type="button">
          View Predictions ›
        </button>
      </div>
    `;
  }

  // =========================================================================
  // VIEW 2: DETAILED LINE VIEW
  // =========================================================================
  function renderDetailedLineView(passedLineData) {
    const lineData = passedLineData || getDetailedLineData(activeLineKey, profile);
    const cfg = lineData.config;

    return `
      <div class="report-line-detail-container" style="--line-accent-color: ${cfg.color}; --line-glow-color: ${cfg.colorDark};">
        
        <!-- Top Split: Hand on Left + Parchment Card on Right -->
        <div class="report-line-detail-hero">
          
          <div class="report-line-hand-box">
            ${renderDetailedPalmArtwork({
              hand,
              sectionId: lineData.sectionId,
              optionId: lineData.selectedOptionId,
              width: '100%',
              height: '100%'
            })}
            <div class="report-line-badge-topleft">
              <span>✋</span> ${lineData.handLabel} • ${lineData.selectedOptionName}
            </div>
            <div class="report-line-callout-pin">
              ${cfg.name}
            </div>
          </div>

          <div class="report-parchment-detail-card">
            <div class="report-parchment-header">
              <span class="report-parchment-lotus">❖</span>
              <h3 class="report-parchment-title">${lineData.headline}</h3>
            </div>

            <p class="report-parchment-detail-p">${lineData.paragraph}</p>

            <h4 class="report-indications-header">Key Indications</h4>
            <div class="report-indications-list">
              ${lineData.indications.map(ind => `
                <div class="report-indication-row">
                  <div class="report-indication-icon" style="background: ${ind.bg}; color: ${ind.color};">
                    ${getIconSvg(ind.icon, 11)}
                  </div>
                  <span class="report-indication-text">${ind.text}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Middle: What Your Line Reveals (4 Cards) -->
        <div class="report-reveals-section">
          <div class="report-reveals-header">
            <span>❖</span>
            <span>What Your ${cfg.name} Reveals</span>
          </div>

          <div class="report-reveals-grid">
            ${lineData.reveals.map(rev => `
              <div class="report-reveal-card">
                <div class="report-reveal-icon-circle">
                  ${getIconSvg(rev.icon, 14)}
                </div>
                <h5 class="report-reveal-title">${rev.title}</h5>
                <p class="report-reveal-desc">${rev.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bottom Persistent Line Navigation Tabs -->
        <nav class="report-bottom-line-tabs" aria-label="Palm Line Selector">
          ${Object.values(LINE_CONFIGS).map(c => `
            <button class="report-line-tab-btn ${c.key === activeLineKey ? 'active' : ''}" 
                    data-switch-line="${c.key}" 
                    style="--tab-accent: ${c.color};" 
                    type="button">
              <span class="report-line-tab-icon">${getIconSvg(c.icon, 16)}</span>
              <span>${c.name.replace(' Line', '')}</span>
            </button>
          `).join('')}
        </nav>

      </div>
    `;
  }

  // =========================================================================
  // VIEW 3: LIFE JOURNEY INSIGHTS / TIMELINE
  // =========================================================================
  function renderJourneyView() {
    return `
      <div class="report-journey-container">
        
        <!-- Hero Landscape Card with Quote Overlay -->
        <div class="report-journey-hero-landscape">
          <img src="/assets/report/journey_sunrise_path.jpg" alt="Mystic Sunrise Path" class="report-journey-hero-img" />
          <div class="report-journey-hero-overlay">
            ${journeyTimeline.quote}
          </div>
        </div>

        <!-- 5 Timeline Phases -->
        <div class="report-timeline-wrapper">
          <div class="report-timeline-winding-track"></div>

          ${journeyTimeline.phases.map(ph => `
            <div class="report-phase-card" style="--phase-color: ${ph.color}; --phase-dark: ${ph.colorDark};">
              <div class="report-phase-body">
                <div class="report-phase-title-row">
                  <h4 class="report-phase-title">${ph.title}</h4>
                  <span class="report-phase-years">${ph.years}</span>
                </div>
                <p class="report-phase-desc">${ph.summary}</p>
              </div>

              <div class="report-phase-pill">
                <p class="report-phase-pill-label">${ph.calloutLabel}</p>
                <p class="report-phase-pill-text">${ph.calloutText}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Bottom Path Ahead Banner with Diya Lamp -->
        <div class="report-path-ahead-card">
          <img src="/assets/report/diya_lotus_altar.png" alt="Sacred Diya Lamp" class="report-diya-altar-img" />
          <div class="report-path-ahead-body">
            <h4 class="report-path-ahead-title">${journeyTimeline.pathAhead.title}</h4>
            <p class="report-path-ahead-desc">${journeyTimeline.pathAhead.text}</p>
            <button id="report-journey-back-btn" class="report-path-ahead-btn" type="button">
              View Detailed Report ›
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // LISTENERS & EVENT ATTACHMENT
  // =========================================================================
  function attachListeners() {
    // Back Button
    container.querySelector('#report-back-btn')?.addEventListener('click', () => {
      if (activeView === 'LINES' || activeView === 'JOURNEY') {
        activeView = 'OVERVIEW';
        router.preservedState.detailedReportView = 'OVERVIEW';
        render();
      } else {
        router.navigate(ROUTES.GUIDED_READING);
      }
    });

    // Overview: Quick Summary items -> Open Line Detail
    container.querySelectorAll('[data-open-line]').forEach(el => {
      el.addEventListener('click', () => {
        const lineKey = el.getAttribute('data-open-line');
        if (lineKey) {
          activeLineKey = lineKey;
          activeView = 'LINES';
          router.preservedState.detailedReportView = 'LINES';
          router.preservedState.detailedReportLine = lineKey;
          render();
        }
      });
    });

    // Overview: "View Predictions >" Button -> Open Journey View
    container.querySelector('#report-open-journey-btn')?.addEventListener('click', () => {
      activeView = 'JOURNEY';
      router.preservedState.detailedReportView = 'JOURNEY';
      render();
    });

    // Detailed Line View: Persistent Line Tabs
    container.querySelectorAll('[data-switch-line]').forEach(el => {
      el.addEventListener('click', () => {
        const lineKey = el.getAttribute('data-switch-line');
        if (lineKey) {
          activeLineKey = lineKey;
          router.preservedState.detailedReportLine = lineKey;
          render();
        }
      });
    });

    // Journey View: "View Detailed Report >" -> Back to Overview
    container.querySelector('#report-journey-back-btn')?.addEventListener('click', () => {
      activeView = 'OVERVIEW';
      router.preservedState.detailedReportView = 'OVERVIEW';
      render();
    });
  }

  // =========================================================================
  // HELPER: Inline SVG Icons
  // =========================================================================
  function getIconSvg(name, size = 16) {
    switch (name) {
      case 'heart':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      case 'brain':
      case 'mind':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"></path></svg>`;
      case 'runner':
      case 'sprout':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 22h20M7 10v4a5 5 0 0 0 10 0v-4M12 2v8M12 2a5 5 0 0 1 5 5M12 2a5 5 0 0 0-5 5"></path></svg>`;
      case 'mountain':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>`;
      case 'lotus':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3c-2 4-2 8 0 11 2-3 2-7 0-11z"/><path d="M6 10c2 4 6 5 6 5s-1-4-3-6c-1-1-2-1-3 1z"/><path d="M18 10c-2 4-6 5-6 5s1-4 3-6c1-1 2-1 3 1z"/></svg>`;
      case 'sun':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
      case 'compass':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
      case 'user':
      case 'users':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`;
      case 'handshake':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4L16 11"/><path d="m18 11 1-1a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L12 9"/></svg>`;
      case 'sparkle':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`;
      case 'target':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
      case 'shield':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      case 'trophy':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v3h10v-3c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34M12 2a7 7 0 0 0-7 7c0 3.32 2.3 6.1 5.4 6.84L12 17l1.6-.16C16.7 16.1 19 13.32 19 9a7 7 0 0 0-7-7z"/></svg>`;
      case 'crown':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>`;
      case 'leaf':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
      case 'cap':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
      case 'stairs':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 3v4h-4v4h-4v4H7v4H3"/></svg>`;
      case 'group':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      case 'meditate':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="5" r="2"/><path d="m4 17 4-2 4 1 4-1 4 2M9 14l3-5 3 5M6 21l6-2 6 2"/></svg>`;
      default:
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  }

  // Initial Boot
  render();
}
