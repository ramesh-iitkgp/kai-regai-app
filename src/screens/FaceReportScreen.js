/**
 * FaceReportScreen Component — Mukha Samudrika Face Scan Reading Report
 * Designed exactly to match the approved reference design:
 * 1. Top Bar: Circular gold back & close buttons, Kai RegAI emblem, "Face Reading Results"
 * 2. Top Grid:
 *    - Left: User photo in gold-bordered card with 4 corner reticles & constellation overlay
 *    - Right: "FEATURE ANALYSIS" card with 6 rows (Eyebrows, Eyes, Eyelids, Nose, Lips, Chin)
 * 3. "YOUR PERSONAL INSIGHTS": 3 Cards (Intuition, Emotional Nature, Social Nature) with icons, badges & bars
 * 4. "KEY TAKEAWAYS": 5 colored pills (Intuitive, Kind & Considerate, Observant, Practical, Adaptable)
 * 5. Footer: "Scan Again" ghost button & luxury gold gradient "Back to Main Menu >" button
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { generateFaceReportData } from '../knowledge/mukhaSamudrika/mukhaKnowledgeBase.js';

export function renderFaceReportScreen(container, incomingData = null) {
  // Retrieve report data from state, window cache, or storage
  let reportData = (incomingData && incomingData.features) ? incomingData : null;
  if (!reportData && typeof window !== 'undefined') {
    if (window.kaiCurrentFaceReport && window.kaiCurrentFaceReport.features) {
      reportData = window.kaiCurrentFaceReport;
    }
    if (!reportData) {
      try {
        const stored = window.sessionStorage?.getItem('kai_last_face_report');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.features) reportData = parsed;
        }
      } catch (e) {
        console.warn('Could not parse stored face report:', e);
      }
    }
  }

  // Fallback to default canonical data if none provided or incomplete
  if (!reportData || !reportData.features) {
    reportData = generateFaceReportData(incomingData || {});
  }

  const photoSrc = reportData.photoSrc || '/assets/home/face_scanner.jpg';

  // Feature definitions mapping directly to the reference design
  const featureList = [
    {
      id: 'eyebrows',
      name: 'Eyebrows',
      value: 'Defined',
      valueColor: '#C084FC', // Violet
      desc: 'Shows focus and determination',
      iconSvg: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round">
          <path d="M4 14c2.5-4 5.5-5 8-3 2.5-2 5.5-1 8 3" />
        </svg>
      `
    },
    {
      id: 'eyes',
      name: 'Eyes',
      value: 'Expressive',
      valueColor: '#38BDF8', // Electric Blue
      desc: 'Reflects warmth and awareness',
      iconSvg: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.8" stroke-linecap="round">
          <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="3" fill="#FBBF24" />
        </svg>
      `
    },
    {
      id: 'eyelids',
      name: 'Eyelids',
      value: 'Balanced',
      valueColor: '#2DD4BF', // Cyan / Teal
      desc: 'Indicates calm and stability',
      iconSvg: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.8" stroke-linecap="round">
          <path d="M3 10c3-3 6-4 9-4s6 1 9 4" />
          <path d="M4 14s3.6 4 8 4 8-4 8-4" />
          <line x1="12" y1="6" x2="12" y2="10" />
        </svg>
      `
    },
    {
      id: 'nose',
      name: 'Nose',
      value: 'Well-proportioned',
      valueColor: '#FBBF24', // Amber Gold
      desc: 'Associated with practicality',
      iconSvg: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.8" stroke-linecap="round">
          <path d="M12 4v11c-1.5 0-3 1-3 2.5s1.5 2.5 3 2.5 3-1 3-2.5-1.5-2.5-3-2.5" />
        </svg>
      `
    },
    {
      id: 'lips',
      name: 'Lips',
      value: 'Full',
      valueColor: '#F43F5E', // Rose Pink
      desc: 'Shows emotional depth',
      iconSvg: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.8" stroke-linecap="round">
          <path d="M4 12c3-2 5-1 8-3 3 2 5 1 8 3-3 4-5 6-8 6s-5-2-8-6z" />
          <path d="M4 12c4 1 5 1 8 2 3-1 4-1 8-2" />
        </svg>
      `
    },
    {
      id: 'chin',
      name: 'Chin',
      value: 'Rounded',
      valueColor: '#34D399', // Emerald Green
      desc: 'Reflects adaptability',
      iconSvg: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.8" stroke-linecap="round">
          <path d="M6 6v7c0 4 2.5 7 6 7s6-3 6-7V6" />
          <circle cx="12" cy="15" r="1.5" fill="#FBBF24" />
        </svg>
      `
    }
  ];

  container.innerHTML = `
    <div class="face-results-screen-root">

      <!-- Top Navigation & Brand Header -->
      <div class="face-results-header">
        
        <!-- Left: Back Button -->
        <button id="face-report-back-btn" class="face-result-circle-btn" type="button" aria-label="Go Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E4C276" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <!-- Center: Brand Emblem -->
        <div class="face-results-brand-center">
          <div class="face-results-brand-emblem">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <!-- Sacred Gold Lotus Emblem -->
              <path d="M18 2L21 11H29L22 17L25 26L18 21L11 26L14 17L7 11H15L18 2Z" fill="url(#brandGoldGrad)" opacity="0.9" />
              <circle cx="18" cy="18" r="4" fill="#FFFFFF" opacity="0.95" />
              <defs>
                <linearGradient id="brandGoldGrad" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stop-color="#FDE68A" />
                  <stop offset="50%" stop-color="#F59E0B" />
                  <stop offset="100%" stop-color="#B45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="face-results-brand-text">
            <span class="face-brand-name">Kai Reg<span class="brand-ai-accent">AI</span></span>
            <span class="face-brand-descriptor">PALM READING</span>
          </div>
        </div>

        <!-- Right: Close Button -->
        <button id="face-report-close-btn" class="face-result-circle-btn" type="button" aria-label="Close Report">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E4C276" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

      </div>

      <!-- Main Title Block -->
      <div class="face-results-title-block">
        <h1 class="face-results-heading">
          Face Reading <span class="gold-gradient-title">Results</span>
        </h1>
        <p class="face-results-subheading">INSIGHTS FROM YOUR FEATURES</p>
        <div class="sacred-filigree-divider">
          <span class="filigree-line"></span>
          <span class="filigree-diamond">◇</span>
          <span class="filigree-line"></span>
        </div>
      </div>

      <!-- Upper Grid: Left (Photo with Reticles & Mesh) + Right (Feature Analysis Card) -->
      <div class="face-results-top-grid">
        
        <!-- Left Column: User Photo with Reticles -->
        <div class="face-results-photo-card">
          <div class="face-results-photo-bg" style="background-image: url('${photoSrc}');"></div>
          
          <!-- Subtle Constellation Mesh Overlay on Captured Photo -->
          <svg class="face-photo-mesh-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- Constellation Node Filaments -->
            <path d="M 50 35 L 50 41 M 50 41 L 45 44.5 M 50 41 L 55 44.5 M 45 44.5 L 38.5 43 L 32 44.5 M 55 44.5 L 61.5 43 L 68 44.5 M 50 41 L 50 49 L 50 56 M 45 50.5 L 50 49 L 55 50.5 M 50 56 L 50 64 M 41 63.5 L 50 64 L 59 63.5 M 50 64 L 50 72 M 33 68 L 50 72 L 67 68" stroke="rgba(251, 191, 36, 0.45)" stroke-width="0.8" stroke-linecap="round" fill="none" />
            <!-- Glowing Nodes -->
            <circle cx="50" cy="35" r="1.5" fill="#FFFFFF" />
            <circle cx="50" cy="41" r="1.8" fill="#FDE68A" />
            <circle cx="45" cy="44.5" r="1.3" fill="#FFFFFF" />
            <circle cx="55" cy="44.5" r="1.3" fill="#FFFFFF" />
            <circle cx="32" cy="44.5" r="1.2" fill="#FDE68A" />
            <circle cx="68" cy="44.5" r="1.2" fill="#FDE68A" />
            <circle cx="45" cy="50.5" r="1.2" fill="#FFFFFF" />
            <circle cx="55" cy="50.5" r="1.2" fill="#FFFFFF" />
            <circle cx="50" cy="56" r="1.5" fill="#FDE68A" />
            <circle cx="41" cy="63.5" r="1.3" fill="#FFFFFF" />
            <circle cx="59" cy="63.5" r="1.3" fill="#FFFFFF" />
            <circle cx="50" cy="72" r="1.6" fill="#FDE68A" />
          </svg>

          <!-- 4 High-Tech Golden Corner Reticle Brackets -->
          <div class="result-reticle-corner tl"></div>
          <div class="result-reticle-corner tr"></div>
          <div class="result-reticle-corner bl"></div>
          <div class="result-reticle-corner br"></div>
        </div>

        <!-- Right Column: FEATURE ANALYSIS Card -->
        <div class="face-results-feature-card">
          <h2 class="feature-analysis-header">FEATURE ANALYSIS</h2>
          
          <div class="feature-analysis-rows">
            ${featureList.map(item => `
              <div class="feature-analysis-row" data-feature-id="${item.id}">
                
                <!-- Circular Icon with Gold Outline -->
                <div class="feature-icon-circle">
                  ${item.iconSvg}
                </div>

                <!-- Feature Text Info -->
                <div class="feature-info-col">
                  <div class="feature-name-val-line">
                    <span class="feature-name-label">${item.name}</span>
                    <strong class="feature-value-badge" style="color: ${item.valueColor};">${item.value}</strong>
                  </div>
                  <span class="feature-desc-text">${item.desc}</span>
                </div>

                <!-- Right Chevron -->
                <div class="feature-chevron-col">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E4C276" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>

              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Section Divider: YOUR PERSONAL INSIGHTS -->
      <div class="sacred-section-divider">
        <span class="section-divider-line"></span>
        <span class="section-divider-diamond">◇</span>
        <span class="section-divider-title">YOUR PERSONAL INSIGHTS</span>
        <span class="section-divider-diamond">◇</span>
        <span class="section-divider-line"></span>
      </div>

      <!-- 3-Column Personal Insights Cards Grid -->
      <div class="face-insights-3col-grid">
        
        <!-- 1. INTUITION Card (Purple) -->
        <div class="face-insight-3col-card purple-glow">
          <div class="insight-card-icon-wrap purple">
            <!-- Glowing Brain SVG -->
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C084FC" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
            </svg>
          </div>
          
          <h3 class="insight-card-title">INTUITION</h3>
          
          <div class="insight-badge-pill purple">
            <span>Strong</span>
          </div>

          <p class="insight-card-body">
            You often rely on your inner instincts and tend to sense things early.
          </p>

          <div class="insight-progress-bar-track">
            <div class="insight-progress-bar-fill purple" style="width: 85%;"></div>
          </div>
        </div>

        <!-- 2. EMOTIONAL NATURE Card (Electric Blue) -->
        <div class="face-insight-3col-card blue-glow">
          <div class="insight-card-icon-wrap blue">
            <!-- Glowing Heart SVG -->
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          
          <h3 class="insight-card-title">EMOTIONAL NATURE</h3>
          
          <div class="insight-badge-pill blue">
            <span>Deep</span>
          </div>

          <p class="insight-card-body">
            You experience emotions intensely and value meaningful connections.
          </p>

          <div class="insight-progress-bar-track">
            <div class="insight-progress-bar-fill blue" style="width: 75%;"></div>
          </div>
        </div>

        <!-- 3. SOCIAL NATURE Card (Emerald Green) -->
        <div class="face-insight-3col-card green-glow">
          <div class="insight-card-icon-wrap green">
            <!-- Glowing People SVG -->
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          
          <h3 class="insight-card-title">SOCIAL NATURE</h3>
          
          <div class="insight-badge-pill green">
            <span>Warm</span>
          </div>

          <p class="insight-card-body">
            You are approachable and tend to build genuine and lasting relationships.
          </p>

          <div class="insight-progress-bar-track">
            <div class="insight-progress-bar-fill green" style="width: 88%;"></div>
          </div>
        </div>

      </div>

      <!-- KEY TAKEAWAYS Section -->
      <div class="face-takeaways-section">
        <h2 class="takeaways-header-title">KEY TAKEAWAYS</h2>

        <div class="takeaways-pills-wrap">
          <!-- Row 1 -->
          <div class="takeaways-pills-row">
            <div class="takeaway-pill purple">
              <!-- Compass SVG -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.3" />
              </svg>
              <span>Intuitive</span>
            </div>

            <div class="takeaway-pill rose">
              <!-- Heart SVG -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>Kind &amp; Considerate</span>
            </div>

            <div class="takeaway-pill blue">
              <!-- Eye SVG -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Observant</span>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="takeaways-pills-row">
            <div class="takeaway-pill gold">
              <!-- Gear SVG -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Practical</span>
            </div>

            <div class="takeaway-pill green">
              <!-- Leaf SVG -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              <span>Adaptable</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action Buttons Matching Reference -->
      <div class="face-results-footer-actions">
        
        <!-- Left: Scan Again -->
        <button id="face-rescan-btn" class="face-result-scan-again-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Scan Again</span>
        </button>

        <!-- Right: Back to Main Menu (Gold Gradient Pill) -->
        <button id="face-back-main-menu-btn" class="face-result-main-menu-btn" type="button">
          <span>Back to Main Menu</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

      </div>

    </div>
  `;

  // Attach Navigation Listeners
  container.querySelector('#face-report-back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });
  container.querySelector('#face-report-close-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });
  container.querySelector('#face-back-main-menu-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });
  container.querySelector('#face-rescan-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.FACE_SCANNER);
  });
}

