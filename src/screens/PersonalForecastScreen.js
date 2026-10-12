/**
 * PersonalForecastScreen Component — Master Personal Forecast & Palm Correlation Gateway
 * Matches Reference: Current Phase 'TRANSFORMATION', 2x2 Life Domain Grid, 12-Month Timeline,
 * Dynamic Content for all 8 Tabs (Overview, Career, Finance, Love, Family, Travel, Growth, Timeline),
 * Context Editing, and ₹99 Palm Connection Card
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { dailyForecastService } from '../services/DailyForecastService.js';
import { defaultProductCatalog } from '../monetization/ProductCatalog.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { i18n } from '../services/i18n.js';
import { renderTodaySkyCard } from '../components/TodaySky.js';

export function renderPersonalForecastScreen(container) {
  reportTelemetry.logEvent(TELEMETRY_EVENTS.LANDING_VIEW, { screen: 'personal_forecast' });

  const storedName = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_name')) || 'Seeker';
  const storedRashi = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_rashi')) || 'Makara';
  const storedDob = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_dob')) || '1998-05-15';
  const storedTob = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_tob')) || '12:00';
  const storedTobUnknown = typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_tob_unknown') === 'true';
  const storedPob = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_pob')) || 'Chennai, India';
  const storedDominant = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_dominant_hand')) || 'RIGHT';

  const currentLang = i18n.getLanguage();
  const forecast = dailyForecastService.getForecastForToday(storedRashi, new Date(), currentLang);

  let activeTab = 'overview';

  function renderTabBody(tab) {
    switch (tab) {
      case 'career':
        return `
          <div class="forecast-tab-content-fade">
            <!-- Career Hero Card -->
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>CAREER & CALLING</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">EXPANSION & AUTHORITY</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                Surya (Sun) & Guru (Jupiter) transits illuminate your 10th house of leadership and public impact.
              </p>
            </div>

            <!-- 3 Dimension Cards -->
            <div class="forecast-dimension-stack">
              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🚀 OPPORTUNITY</span>
                  <h4 class="forecast-detail-title">Executive Elevation</h4>
                </div>
                <p class="forecast-detail-body">
                  A cycle of high professional visibility where strategic decisions and bold initiatives receive strong backing from senior mentors.
                </p>
              </div>

              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🎯 VOCATION</span>
                  <h4 class="forecast-detail-title">Strategic Pivot</h4>
                </div>
                <p class="forecast-detail-body">
                  Ideal timing to transition from routine execution into directional leadership and autonomous project ownership.
                </p>
              </div>

              <div class="forecast-detail-card palm-highlight-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge gold">✋ PALM CORRELATION</span>
                  <h4 class="forecast-detail-title gold">Mount of Jupiter & Head Line</h4>
                </div>
                <p class="forecast-detail-body gold-sub">
                  An elevated <strong>Mount of Jupiter</strong> beneath the index finger signals your natural command. A clear independent start on your <strong>Head Line</strong> confirms your entrepreneurial drive.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'finance':
        return `
          <div class="forecast-tab-content-fade">
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>WEALTH & ASSETS</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">BUILDING & CAPITAL RETENTION</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                Budha (Mercury) & Shukra (Venus) trine creates disciplined compound wealth growth.
              </p>
            </div>

            <div class="forecast-dimension-stack">
              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🪙 CAPITAL</span>
                  <h4 class="forecast-detail-title">Structured Compounding</h4>
                </div>
                <p class="forecast-detail-body">
                  Stable accumulation outpaces speculative risks. Focus on strengthening liquidity buffers and long-term asset fundamentals.
                </p>
              </div>

              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">💼 COMMERCIAL</span>
                  <h4 class="forecast-detail-title">Secondary Revenue</h4>
                </div>
                <p class="forecast-detail-body">
                  Analytical advisory, consultancy, or technology-driven monetization channels open up new cash inflows this cycle.
                </p>
              </div>

              <div class="forecast-detail-card palm-highlight-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge gold">✋ PALM CORRELATION</span>
                  <h4 class="forecast-detail-title gold">The Money Triangle (Dhana Trika)</h4>
                </div>
                <p class="forecast-detail-body gold-sub">
                  The enclosed triangle formed by your <strong>Head Line</strong>, <strong>Fate Line</strong>, and <strong>Mercury Line</strong> determines wealth retention capacity and commercial acumen.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'love':
        return `
          <div class="forecast-tab-content-fade">
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>RELATIONSHIPS & HEART</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">DEVELOPING & DEEPENING</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                Shukra (Venus) & Chandra (Moon) harmonize emotional authenticity and kindred connections.
              </p>
            </div>

            <div class="forecast-dimension-stack">
              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🤍 RESONANCE</span>
                  <h4 class="forecast-detail-title">Emotional Transparency</h4>
                </div>
                <p class="forecast-detail-body">
                  Superficial pretenses give way to heartfelt discussions. Shared vulnerability strengthens mutual trust and loyalty.
                </p>
              </div>

              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">💍 COMMITMENT</span>
                  <h4 class="forecast-detail-title">Soul Connection Alignment</h4>
                </div>
                <p class="forecast-detail-body">
                  Singles attract partners who mirror their deeper values; committed partnerships progress toward clear long-term milestones.
                </p>
              </div>

              <div class="forecast-detail-card palm-highlight-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge gold">✋ PALM CORRELATION</span>
                  <h4 class="forecast-detail-title gold">Heart Line & Mount of Venus</h4>
                </div>
                <p class="forecast-detail-body gold-sub">
                  A gently curved <strong>Heart Line</strong> reaching toward Jupiter reflects devotion and idealism, supported by the supple warmth of your <strong>Mount of Venus</strong>.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'family':
        return `
          <div class="forecast-tab-content-fade">
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>FAMILY & HOME</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">DOMESTIC SANCTUARY & ANCHOR</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                Chandra (Moon) in the 4th house brings domestic grounding, healing, and generational support.
              </p>
            </div>

            <div class="forecast-dimension-stack">
              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🏡 SANCTUARY</span>
                  <h4 class="forecast-detail-title">Home Revitalization</h4>
                </div>
                <p class="forecast-detail-body">
                  Focus on establishing physical tranquility in your living environment. Decluttering and harmonious spatial energy restore peace.
                </p>
              </div>

              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🌳 KINSHIP</span>
                  <h4 class="forecast-detail-title">Generational Healing</h4>
                </div>
                <p class="forecast-detail-body">
                  An auspicious window to resolve historical family misunderstandings through calm patience and unconditional presence.
                </p>
              </div>

              <div class="forecast-detail-card palm-highlight-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge gold">✋ PALM CORRELATION</span>
                  <h4 class="forecast-detail-title gold">Family Ring (Phala Rekha)</h4>
                </div>
                <p class="forecast-detail-body gold-sub">
                  The sacred grain chain at the base joint of your thumb denotes maternal and ancestral protection and domestic resilience.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'travel':
        return `
          <div class="forecast-tab-content-fade">
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>HORIZONS & VOYAGES</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">ACTIVE EXPLORATION & RETREATS</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                Vayu Tattva activates your 9th house of pilgrimage, cross-cultural journeys, and geographical movement.
              </p>
            </div>

            <div class="forecast-dimension-stack">
              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">✈️ EXPANSION</span>
                  <h4 class="forecast-detail-title">Cross-Border Movement</h4>
                </div>
                <p class="forecast-detail-body">
                  Favorable periods for travel across waters, overseas educational immersion, and expanding your professional network globally.
                </p>
              </div>

              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🌊 PILGRIMAGE</span>
                  <h4 class="forecast-detail-title">Restorative Retreats</h4>
                </div>
                <p class="forecast-detail-body">
                  Journeys near natural waterways and sacred shrines serve as essential nervous system recalibrations this season.
                </p>
              </div>

              <div class="forecast-detail-card palm-highlight-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge gold">✋ PALM CORRELATION</span>
                  <h4 class="forecast-detail-title gold">Mount of Moon & Travel Lines</h4>
                </div>
                <p class="forecast-detail-body gold-sub">
                  Clear horizontal travel lines (<em>Yatra Rekha</em>) sweeping across the <strong>Mount of Moon</strong> verify transformative geographical journeys.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'growth':
        return `
          <div class="forecast-tab-content-fade">
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>SPIRITUAL ALCHEMY</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">INNER INTUITION & MASTERY</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                Ketu & Guru alignment accelerates self-realization, philosophical depth, and subconscious insight.
              </p>
            </div>

            <div class="forecast-dimension-stack">
              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">👁️ INTUITION</span>
                  <h4 class="forecast-detail-title">Heightened Receptivity</h4>
                </div>
                <p class="forecast-detail-body">
                  Spiritual synchronicities, vivid dream comprehension, and meditation depth are extraordinarily magnified under current celestial alignments.
                </p>
              </div>

              <div class="forecast-detail-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge">🪷 SHEDDING</span>
                  <h4 class="forecast-detail-title">Karmic Recalibration</h4>
                </div>
                <p class="forecast-detail-body">
                  Dissolving outgrown emotional baggage and subconscious limitations to step into authentic self-sovereignty.
                </p>
              </div>

              <div class="forecast-detail-card palm-highlight-card">
                <div class="forecast-detail-header">
                  <span class="forecast-detail-badge gold">✋ PALM CORRELATION</span>
                  <h4 class="forecast-detail-title gold">The Mystic Cross & Solomon Ring</h4>
                </div>
                <p class="forecast-detail-body gold-sub">
                  The presence of a <strong>Mystic Cross</strong> in your palm's central quadrangle indicates profound psychic acumen and philosophical wisdom.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'timeline':
        return `
          <div class="forecast-tab-content-fade">
            <div class="forecast-subtab-hero">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>ANNUAL HORIZON</span>
              </div>
              <h2 class="forecast-phase-title" style="font-size: 24px;">12-MONTH CELESTIAL ROADMAP</h2>
              <div class="forecast-hero-divider"><span>✦</span></div>
              <p class="forecast-phase-subtitle">
                A chronological progression of your major astrological transits and palm crease activations.
              </p>
            </div>

            <!-- Deep Chronological Stepper -->
            <div class="forecast-deep-timeline">
              
              <!-- Quarter 1 -->
              <div class="forecast-timeline-step-item">
                <div class="forecast-timeline-step-left">
                  <div class="forecast-step-circle active">1</div>
                  <div class="forecast-step-vertical-line"></div>
                </div>
                <div class="forecast-timeline-step-right">
                  <div class="forecast-step-badge">NOW • MONTHS 1–3</div>
                  <h4 class="forecast-step-title">The Foundation & Recalibration</h4>
                  <p class="forecast-step-desc">
                    Inner alignment, clarifying your core ambition, and releasing unproductive commitments. The <strong>Head Line</strong> indicates heightened concentration.
                  </p>
                </div>
              </div>

              <!-- Quarter 2 -->
              <div class="forecast-timeline-step-item">
                <div class="forecast-timeline-step-left">
                  <div class="forecast-step-circle">2</div>
                  <div class="forecast-step-vertical-line"></div>
                </div>
                <div class="forecast-timeline-step-right">
                  <div class="forecast-step-badge">MONTHS 3–6</div>
                  <h4 class="forecast-step-title">The Karmic Shift</h4>
                  <p class="forecast-step-desc">
                    A pivotal crossroads in professional alliances and creative ventures. High activation on the <strong>Mount of Jupiter</strong>.
                  </p>
                </div>
              </div>

              <!-- Quarter 3 -->
              <div class="forecast-timeline-step-item">
                <div class="forecast-timeline-step-left">
                  <div class="forecast-step-circle">3</div>
                  <div class="forecast-step-vertical-line"></div>
                </div>
                <div class="forecast-timeline-step-right">
                  <div class="forecast-step-badge">MONTHS 6–12</div>
                  <h4 class="forecast-step-title">Expansive Manifestation</h4>
                  <p class="forecast-step-desc">
                    Financial and vocational harvest. Upward branches on the <strong>Fate Line</strong> materialize as tangible public recognition.
                  </p>
                </div>
              </div>

              <!-- Quarter 4 -->
              <div class="forecast-timeline-step-item">
                <div class="forecast-timeline-step-left">
                  <div class="forecast-step-circle">4</div>
                </div>
                <div class="forecast-timeline-step-right">
                  <div class="forecast-step-badge">12+ MONTHS</div>
                  <h4 class="forecast-step-title">Long-Term Stability</h4>
                  <p class="forecast-step-desc">
                    Consolidation of mastery, emotional serenity, and mentoring others. Sustained balance across your <strong>Life & Heart lines</strong>.
                  </p>
                </div>
              </div>

            </div>
          </div>
        `;

      case 'overview':
      default:
        return `
          <!-- Hero Section: Current Phase with Celestial Arc Background -->
          <section class="forecast-hero-card" style="background-image: url('/assets/home/celestial_phase_hero.jpg');">
            <div class="forecast-hero-overlay">
              <div class="forecast-phase-tag">
                <span class="forecast-star">✦</span>
                <span>YOUR CURRENT PHASE</span>
              </div>
              
              <h2 class="forecast-phase-title">TRANSFORMATION</h2>
              
              <div class="forecast-hero-divider">
                <span>✦</span>
              </div>

              <p class="forecast-phase-subtitle">
                A period of change, personal growth and new direction.
              </p>
            </div>
          </section>

          <!-- Today's Celestial Sky & Transits -->
          ${renderTodaySkyCard(forecast, { title: "Today's Sky & Transits" })}

          <!-- 2x2 Core Domains Grid -->
          <section class="forecast-2x2-grid">
            
            <!-- Career Card -->
            <div class="forecast-domain-card" role="button" tabindex="0" data-nav-tab="career">
              <div class="forecast-domain-header">
                <div class="forecast-domain-icon-circle">
                  <span class="material-symbols-outlined" style="font-size: 19px; color: #fbbf24;">trending_up</span>
                </div>
                <div class="forecast-domain-titles">
                  <span class="forecast-domain-cat">CAREER</span>
                  <h3 class="forecast-domain-state">EXPANSION</h3>
                </div>
                <span class="material-symbols-outlined forecast-domain-arrow">chevron_right</span>
              </div>
              <p class="forecast-domain-desc">
                New opportunities and greater responsibilities are highlighted.
              </p>
            </div>

            <!-- Finance Card -->
            <div class="forecast-domain-card" role="button" tabindex="0" data-nav-tab="finance">
              <div class="forecast-domain-header">
                <div class="forecast-domain-icon-circle">
                  <span class="material-symbols-outlined" style="font-size: 19px; color: #fbbf24;">payments</span>
                </div>
                <div class="forecast-domain-titles">
                  <span class="forecast-domain-cat">FINANCE</span>
                  <h3 class="forecast-domain-state">BUILDING</h3>
                </div>
                <span class="material-symbols-outlined forecast-domain-arrow">chevron_right</span>
              </div>
              <p class="forecast-domain-desc">
                A period of financial growth and stronger stability.
              </p>
            </div>

            <!-- Love Card -->
            <div class="forecast-domain-card" role="button" tabindex="0" data-nav-tab="love">
              <div class="forecast-domain-header">
                <div class="forecast-domain-icon-circle">
                  <span class="material-symbols-outlined" style="font-size: 19px; color: #fbbf24;">favorite_border</span>
                </div>
                <div class="forecast-domain-titles">
                  <span class="forecast-domain-cat">LOVE</span>
                  <h3 class="forecast-domain-state">DEVELOPING</h3>
                </div>
                <span class="material-symbols-outlined forecast-domain-arrow">chevron_right</span>
              </div>
              <p class="forecast-domain-desc">
                Relationships take a more meaningful and nurturing direction.
              </p>
            </div>

            <!-- Travel Card -->
            <div class="forecast-domain-card" role="button" tabindex="0" data-nav-tab="travel">
              <div class="forecast-domain-header">
                <div class="forecast-domain-icon-circle">
                  <span class="material-symbols-outlined" style="font-size: 19px; color: #fbbf24;">flight</span>
                </div>
                <div class="forecast-domain-titles">
                  <span class="forecast-domain-cat">TRAVEL</span>
                  <h3 class="forecast-domain-state">ACTIVE</h3>
                </div>
                <span class="material-symbols-outlined forecast-domain-arrow">chevron_right</span>
              </div>
              <p class="forecast-domain-desc">
                Travel, new experiences and broader horizons are indicated.
              </p>
            </div>

          </section>

          <!-- Timeline Section: Next 12 Months -->
          <section class="forecast-timeline-section">
            <div class="forecast-timeline-heading">
              <span class="forecast-heading-line"></span>
              <h3 class="forecast-heading-title">YOUR NEXT 12 MONTHS</h3>
              <span class="forecast-heading-line"></span>
            </div>

            <!-- Timeline Track Stepper -->
            <div class="forecast-stepper-track">
              
              <!-- Step 1 (Active / Now) -->
              <div class="forecast-stepper-node active">
                <span class="forecast-node-time">NOW</span>
                <div class="forecast-node-beacon">
                  <div class="forecast-node-beacon-ring"></div>
                  <div class="forecast-node-beacon-core"></div>
                </div>
                <span class="forecast-node-phase">CURRENT PHASE</span>
              </div>

              <div class="forecast-stepper-bar"></div>

              <!-- Step 2 (3-6 Months) -->
              <div class="forecast-stepper-node">
                <span class="forecast-node-time">3–6<br>MONTHS</span>
                <div class="forecast-node-dot"></div>
                <span class="forecast-node-phase">SHIFT</span>
              </div>

              <div class="forecast-stepper-bar"></div>

              <!-- Step 3 (6-12 Months) -->
              <div class="forecast-stepper-node">
                <span class="forecast-node-time">6–12<br>MONTHS</span>
                <div class="forecast-node-dot"></div>
                <span class="forecast-node-phase">EXPANSION</span>
              </div>

              <div class="forecast-stepper-bar"></div>

              <!-- Step 4 (12+ Months) -->
              <div class="forecast-stepper-node">
                <span class="forecast-node-time">12+<br>MONTHS</span>
                <div class="forecast-node-dot"></div>
                <span class="forecast-node-phase">STABILITY</span>
              </div>

            </div>

            <!-- Highlight Theme Card -->
            <div id="forecast-upcoming-theme-card" class="forecast-theme-card" role="button" tabindex="0">
              <div class="forecast-theme-icon-badge">
                <span class="material-symbols-outlined" style="font-size: 20px; color: #fbbf24;">trending_up</span>
              </div>
              <div class="forecast-theme-content">
                <span class="forecast-theme-label">Strongest upcoming theme</span>
                <h4 class="forecast-theme-title">Professional Growth</h4>
              </div>
              <span class="material-symbols-outlined forecast-theme-chevron">chevron_right</span>
            </div>
          </section>
        `;
    }
  }

  container.innerHTML = `
    <div class="forecast-screen-wrapper">
      
      <!-- Top Navigation Bar with Back & Edit Context Controls -->
      <header class="forecast-header">
        <button id="forecast-back-btn" class="forecast-icon-btn" aria-label="Back">
          <span class="material-symbols-outlined" style="font-size: 20px;">arrow_back_ios_new</span>
        </button>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <h1 class="forecast-top-title">PERSONAL FORECAST</h1>
          <button id="forecast-edit-context-btn" style="background: none; border: none; padding: 2px 6px; font-size: 10px; color: #fbbf24; cursor: pointer; display: flex; align-items: center; gap: 4px; opacity: 0.9;">
            <span>${forecast.localizedName} • ${storedPob} • ${storedDominant === 'RIGHT' ? 'Right Palm' : 'Left Palm'}</span>
            <span class="material-symbols-outlined" style="font-size: 11px;">edit</span>
          </button>
        </div>
        <button id="forecast-info-btn" class="forecast-icon-btn" aria-label="Info">
          <span class="material-symbols-outlined" style="font-size: 20px;">info</span>
        </button>
      </header>

      <!-- Horizontal Category Filter Tabs -->
      <nav class="forecast-nav-tabs" style="padding: 10px 16px 4px; background: rgba(8, 10, 18, 0.95); position: sticky; top: 58px; z-index: 40; border-bottom: 1px solid rgba(251,191,36,0.12);">
        <button class="forecast-tab-pill active" data-tab="overview">Overview</button>
        <button class="forecast-tab-pill" data-tab="career">Career</button>
        <button class="forecast-tab-pill" data-tab="finance">Finance</button>
        <button class="forecast-tab-pill" data-tab="love">Love</button>
        <button class="forecast-tab-pill" data-tab="family">Family</button>
        <button class="forecast-tab-pill" data-tab="travel">Travel</button>
        <button class="forecast-tab-pill" data-tab="growth">Growth</button>
        <button class="forecast-tab-pill" data-tab="timeline">Timeline</button>
      </nav>

      <!-- Main Scrollable Content Container -->
      <main class="forecast-scroll-body">
        
        <div id="forecast-dynamic-tab-container">
          ${renderTabBody('overview')}
        </div>

        <!-- Complete Your Story (₹99 Conversion Gateway) - Persistent Across All Tabs -->
        <section id="forecast-connect-palm-card" class="forecast-connect-card" style="margin-top: 10px;">
          <div class="forecast-connect-left">
            <div class="forecast-hand-thumbnail" style="background-image: url('/assets/home/celestial_palm_gold.jpg');"></div>
            <div class="forecast-connect-text">
              <div class="forecast-connect-title-row">
                <span class="forecast-star-gold">✦</span>
                <h4 class="forecast-connect-title">COMPLETE YOUR STORY</h4>
              </div>
              <p class="forecast-connect-desc">
                Your forecast shows the bigger picture. Your palm can add another personal layer.
              </p>
            </div>
          </div>

          <div class="forecast-connect-right">
            <span class="forecast-price-tag">₹99</span>
            <button id="forecast-connect-palm-btn" class="forecast-cta-pill" type="button">
              <span>CONNECT MY PALM</span>
              <span class="material-symbols-outlined" style="font-size: 15px;">chevron_right</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  `;

  // Handlers
  container.querySelector('#forecast-back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });

  // Edit Context Coordinates (Reopens Input Modal)
  container.querySelector('#forecast-edit-context-btn')?.addEventListener('click', () => {
    router.openModal('forecast_context_input');
  });

  container.querySelector('#forecast-info-btn')?.addEventListener('click', () => {
    router.openModal('personal_forecast', { rashi: storedRashi });
  });

  // Tab Switching Logic with Live Content Re-rendering
  const tabContainer = container.querySelector('#forecast-dynamic-tab-container');

  function switchTab(targetTab) {
    activeTab = targetTab;
    container.querySelectorAll('.forecast-tab-pill').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetTab);
    });

    if (tabContainer) {
      tabContainer.innerHTML = renderTabBody(targetTab);
      attachDynamicTabListeners();
    }
  }

  function attachDynamicTabListeners() {
    // Domain card clicks on overview tab switch to respective tab
    container.querySelectorAll('.forecast-domain-card').forEach(card => {
      card.addEventListener('click', () => {
        const navTab = card.getAttribute('data-nav-tab');
        if (navTab) switchTab(navTab);
      });
    });

    container.querySelector('#forecast-upcoming-theme-card')?.addEventListener('click', () => {
      switchTab('career');
    });
  }

  container.querySelectorAll('.forecast-tab-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  attachDynamicTabListeners();

  // Tap ₹99 Connect Palm CTA
  const handleConnectPalm = () => {
    reportTelemetry.logEvent(TELEMETRY_EVENTS.PAYWALL_VIEW, { 
      productId: 'kai_daily_correlate', 
      price: 99, 
      currency: 'INR',
      source: 'personal_forecast_screen'
    });
    // Open paywall modal configured for ₹99 micro unlock
    router.openModal('paywall', {
      featureKey: 'kai_daily_correlate',
      productId: 'kai_daily_correlate',
      onSuccess: () => {
        router.closeModal();
        router.navigate(ROUTES.SCANNER);
      }
    });
  };

  container.querySelector('#forecast-connect-palm-btn')?.addEventListener('click', handleConnectPalm);
  container.querySelector('#forecast-connect-palm-card')?.addEventListener('click', (e) => {
    if (e.target.id !== 'forecast-connect-palm-btn' && !e.target.closest('#forecast-connect-palm-btn')) {
      handleConnectPalm();
    }
  });
}
