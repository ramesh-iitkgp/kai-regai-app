/**
 * GuidedReadingScreen Component — Interactive Detailed Palm Reading Input Flow
 * Conforms strictly to Kai RegAI Dark + Gold Premium Visual Direction:
 * - Brand: Kai RegAI • PALM READING • "The Story Written in Your Hands."
 * - Dark-black / midnight background with subtle warm gold accents
 * - Every observation selected visually from illustrated palm/hand cards (no typing)
 * - 6-Phase Flow: Hand -> Shape -> Flexibility -> Major Lines -> Special Lines -> Review
 * - Progressive disclosure: one characteristic per screen
 * - No horizontal scrolling except the swipeable Flexibility carousel
 * - Mobile-first layout optimized for 390-430px wide screens
 * - Premium gold buttons (no purple reference gradient buttons)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { DETAILED_FLOW_SECTIONS, buildDossierFromDetailedProfile } from '../knowledge/detailedPalmProfileSchema.js';
import { renderDetailedPalmArtwork } from '../components/DetailedPalmArtwork.js';
import { renderOpenPalmArtwork } from '../components/PalmArtwork.js';
import { i18n } from '../services/i18n.js';

export function renderGuidedReadingScreen(container, params = {}) {
  // Screen Stages: 'INTRO' | 'QUESTION' | 'REVIEW' | 'SYNTHESIZING' | 'RESULTS'
  let screenStage = 'INTRO';
  let currentSectionIndex = 0; // 0 to 9 (10 question sections)

  // User selections initialized with sensible, authentic defaults
  const userProfile = {
    hand: (params?.hand || 'RIGHT').toUpperCase(),
    shape: 'RECTANGULAR',
    flexibility: 'MEDIUM',
    life_line: 'LONG_CLEAR',
    heart_line: 'CURVED',
    head_line: 'SLOPING',
    destiny_line: 'CLEAR',
    sun_line: 'CLEAR',
    marriage_line: 'SINGLE',
    special_markings: 'CROSS'
  };

  // State to hold synthetic dossier after reveal
  let generatedDossier = null;

  function render() {
    if (screenStage === 'INTRO') {
      renderIntroScreen();
    } else if (screenStage === 'QUESTION') {
      renderQuestionScreen();
    } else if (screenStage === 'REVIEW') {
      renderReviewScreen();
    } else if (screenStage === 'SYNTHESIZING') {
      renderSynthesizingScreen();
    } else if (screenStage === 'RESULTS') {
      renderResultsReveal();
    }
  }

  // =========================================================================
  // 1. INTRODUCTION SCREEN
  // =========================================================================
  function renderIntroScreen() {
    container.innerHTML = `
      <div class="detailed-flow-root">
        <div class="detailed-flow-bg-watermark"></div>

        <div class="detailed-intro-wrap">
          
          <!-- Top Bar: Brand Descriptor + Close Icon -->
          <div class="detailed-intro-top-bar">
            <span class="detailed-brand-descriptor">KAI REG<span style="color: #FBBF24;">AI</span> • PALM READING</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a href="#calibrator" class="detailed-header-calibrator-btn" title="Adjust Crease Lines">
                <span>⚙️ Calibrate Lines</span>
              </a>
              <button id="detailed-intro-close-btn" class="detailed-close-icon-btn" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Hero Titles -->
          <div class="detailed-intro-hero">
            <h1 class="detailed-intro-hero-title">Detailed Palm Reading</h1>
            <p class="detailed-intro-hero-sub">Help us understand the unique features of your hand.</p>
            <p class="detailed-intro-hero-desc">
              Choose the image that most closely matches your palm. Your selections will be used to create a more detailed reading.
            </p>
          </div>

          <!-- Vertical 6-Phase Progress Indicator -->
          <div class="detailed-stepper-box">
            
            <div class="detailed-stepper-item">
              <div class="detailed-stepper-num">1</div>
              <span class="detailed-stepper-label">Hand</span>
              <span class="detailed-stepper-tag">Dominance &amp; Polarity</span>
            </div>

            <div class="detailed-stepper-item">
              <div class="detailed-stepper-num">2</div>
              <span class="detailed-stepper-label">Shape</span>
              <span class="detailed-stepper-tag">Elemental Archetype</span>
            </div>

            <div class="detailed-stepper-item">
              <div class="detailed-stepper-num">3</div>
              <span class="detailed-stepper-label">Flexibility</span>
              <span class="detailed-stepper-tag">Elasticity &amp; Resilience</span>
            </div>

            <div class="detailed-stepper-item">
              <div class="detailed-stepper-num">4</div>
              <span class="detailed-stepper-label">Major Lines</span>
              <span class="detailed-stepper-tag">Life, Heart, Head, Destiny, Sun</span>
            </div>

            <div class="detailed-stepper-item">
              <div class="detailed-stepper-num">5</div>
              <span class="detailed-stepper-label">Special &amp; Marriage Lines</span>
              <span class="detailed-stepper-tag">Marriage Line, Sacred Geometry Marks</span>
            </div>

            <div class="detailed-stepper-item">
              <div class="detailed-stepper-num">6</div>
              <span class="detailed-stepper-label">Review</span>
              <span class="detailed-stepper-tag">Synthesized Profile</span>
            </div>

          </div>

          <!-- Primary CTA Button (Gold Theme — No Purple!) -->
          <div>
            <button id="detailed-intro-begin-btn" class="kai-btn-gold-primary" type="button">
              <span>Begin Reading</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

        </div>
      </div>
    `;

    container.querySelector('#detailed-intro-close-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#detailed-intro-begin-btn')?.addEventListener('click', () => {
      reportTelemetry.logEvent(TELEMETRY_EVENTS.START_READING, { mode: 'DETAILED_PALM_FLOW' });
      screenStage = 'QUESTION';
      currentSectionIndex = 0;
      render();
    });
  }

  // =========================================================================
  // 2. QUESTION SCREENS (Progressive Disclosure: One Characteristic Per Screen)
  // =========================================================================
  function renderQuestionScreen() {
    const totalSections = DETAILED_FLOW_SECTIONS.length;
    const section = DETAILED_FLOW_SECTIONS[currentSectionIndex];
    const currentSelectedId = userProfile[section.id];
    const progressPercent = Math.round(((currentSectionIndex + 1) / totalSections) * 100);

    const isLastSection = currentSectionIndex === totalSections - 1;
    const buttonText = isLastSection ? 'Review Profile' : 'Continue';

    // Build options markup based on section type
    let optionsHtml = '';

    // A. Hand Selection (Two large cards side-by-side)
    if (section.type === 'DUAL_CARDS') {
      optionsHtml = `
        <div class="detailed-hand-cards-grid">
          ${section.options.map(opt => {
            const isSelected = opt.id === currentSelectedId;
            const artworkSvg = renderDetailedPalmArtwork({
              hand: opt.hand,
              sectionId: 'hand',
              optionId: opt.id,
              width: '100%',
              height: '100%'
            });

            return `
              <div class="detailed-palm-card detailed-hand-large-card ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}" role="button" tabindex="0">
                ${isSelected ? `
                  <div class="detailed-card-check-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                ` : ''}
                
                <div class="detailed-card-art-box">
                  ${artworkSvg}
                </div>

                <h3 class="detailed-card-title">${opt.title}</h3>
                <p class="detailed-card-sub">${opt.subtitle}</p>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // B. Flexibility Carousel (Swipeable carousel with active center card & counter)
    else if (section.type === 'CAROUSEL_3') {
      const activeIdx = section.options.findIndex(o => o.id === currentSelectedId);
      const currentStepNum = activeIdx >= 0 ? activeIdx + 1 : 2;

      optionsHtml = `
        <div class="detailed-flex-counter-row">
          <span class="detailed-flex-counter-pill">${currentStepNum} / ${section.options.length}</span>
        </div>

        <div class="detailed-flex-carousel-viewport">
          <div class="detailed-flex-carousel-track" id="detailed-flex-track">
            ${section.options.map((opt, idx) => {
              const isSelected = opt.id === currentSelectedId;
              const artworkSvg = renderDetailedPalmArtwork({
                hand: userProfile.hand,
                sectionId: 'flexibility',
                optionId: opt.id,
                width: '100%',
                height: '100%'
              });

              return `
                <div class="detailed-flex-card-wrap">
                  <div class="detailed-palm-card ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}" data-index="${idx}" role="button" tabindex="0">
                    ${isSelected ? `
                      <div class="detailed-card-check-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    ` : ''}

                    <div class="detailed-card-art-box">
                      ${artworkSvg}
                    </div>

                    <h3 class="detailed-card-title">${opt.title}</h3>
                    <p class="detailed-card-sub">${opt.subtitle}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // C. 2-Column Visual Cards Grid (Shape, Lines, Special Markings)
    else {
      optionsHtml = `
        <div class="detailed-cards-grid-2col">
          ${section.options.map(opt => {
            const isSelected = opt.id === currentSelectedId;
            const artworkSvg = renderDetailedPalmArtwork({
              hand: userProfile.hand,
              sectionId: section.id,
              optionId: opt.id,
              width: '100%',
              height: '100%'
            });

            return `
              <div class="detailed-palm-card ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}" role="button" tabindex="0">
                ${isSelected ? `
                  <div class="detailed-card-check-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                ` : ''}

                <div class="detailed-card-art-box">
                  ${artworkSvg}
                </div>

                <h3 class="detailed-card-title">${opt.title}</h3>
                <p class="detailed-card-sub">${opt.subtitle}</p>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    const isMarriageSec = section.id === 'marriage_line';
    const chosenHand = (userProfile.hand || 'LEFT').toLowerCase() === 'left' ? 'left' : 'right';

    const headerCalibrateBtn = isMarriageSec ? '' : `
      <a href="#calibrator" class="detailed-header-calibrator-btn" title="Adjust Crease Lines">
        <span>⚙️ Calibrate</span>
      </a>
    `;

    const titleGroupHtml = isMarriageSec ? `
      <!-- Marriage Line Guide Banner matching Reference Image -->
      <div class="detailed-marriage-guide-hero">
        <div class="detailed-marriage-guide-thumb-wrap">
          <img src="/assets/lines/marriage_guide_thumb.jpg" alt="Marriage Lines Guide" class="detailed-marriage-guide-thumb-img" />
        </div>
        <div class="detailed-marriage-guide-text">
          <h1 class="detailed-q-title">Marriage Line</h1>
          <p class="detailed-marriage-prompt">How does your Marriage Line appear on your ${chosenHand} hand?</p>
          <p class="detailed-q-sub">Look at the side of your ${chosenHand} palm below the little finger and choose the image that matches.</p>
        </div>
      </div>
    ` : `
      <!-- Title & Subtitle -->
      <div class="detailed-q-title-group">
        <h1 class="detailed-q-title">${section.title}</h1>
        <p class="detailed-q-sub">${section.subtitle}</p>
      </div>
    `;

    container.innerHTML = `
      <div class="detailed-flow-root">
        <div class="detailed-flow-bg-watermark"></div>

        <!-- Sticky Header with Progress Bar -->
        <header class="detailed-q-header">
          <div class="detailed-q-top-row">
            <button id="detailed-q-back-btn" class="detailed-q-back-btn" aria-label="Go Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="detailed-step-counter-pill">
                ${currentSectionIndex + 1}/${totalSections}
              </span>
              ${headerCalibrateBtn}
            </div>

            <button id="detailed-q-close-btn" class="detailed-close-icon-btn" aria-label="Exit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Title & Subtitle or Marriage Guide Banner -->
          ${titleGroupHtml}

          <!-- Golden Progress Bar -->
          <div class="detailed-progress-track">
            <div class="detailed-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </header>

        <!-- Question Body Area -->
        <main class="detailed-q-content-body">
          ${optionsHtml}
        </main>

        <!-- Floating Bottom Action Bar with Gold Button -->
        <footer class="detailed-bottom-cta-bar">
          <button id="detailed-q-continue-btn" class="kai-btn-gold-primary" type="button">
            <span>${buttonText}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </footer>

      </div>
    `;

    // Wire Navigation & Interaction Listeners
    container.querySelector('#detailed-q-back-btn')?.addEventListener('click', () => {
      if (currentSectionIndex > 0) {
        currentSectionIndex -= 1;
        render();
      } else {
        screenStage = 'INTRO';
        render();
      }
    });

    container.querySelector('#detailed-q-close-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    // Card Selection
    container.querySelectorAll('.detailed-palm-card').forEach(card => {
      card.addEventListener('click', () => {
        const optionId = card.getAttribute('data-option-id');
        if (optionId) {
          userProfile[section.id] = optionId;
          // Re-render to update checkmark, soft glow and state
          render();
        }
      });
    });

    // Continue Button
    container.querySelector('#detailed-q-continue-btn')?.addEventListener('click', () => {
      if (currentSectionIndex < totalSections - 1) {
        currentSectionIndex += 1;
        render();
      } else {
        screenStage = 'REVIEW';
        render();
      }
    });
  }

  // =========================================================================
  // 3. REVIEW SCREEN ("Your Palm Profile")
  // =========================================================================
  function renderReviewScreen() {
    // List of selected characteristics for review
    const reviewItems = [
      {
        sectionId: 'hand',
        sectionIdx: 0,
        label: 'Hand',
        optionId: userProfile.hand,
        title: userProfile.hand === 'RIGHT' ? 'Right Hand (Dakshina)' : 'Left Hand (Vama)',
        sub: userProfile.hand === 'RIGHT' ? 'Active Karma & Conscious Action' : 'Innate Soul Potential & Prarabdha'
      },
      {
        sectionId: 'shape',
        sectionIdx: 1,
        label: 'Palm Form',
        optionId: userProfile.shape,
        title: getOptionTitle('shape', userProfile.shape),
        sub: getOptionSubtitle('shape', userProfile.shape)
      },
      {
        sectionId: 'flexibility',
        sectionIdx: 2,
        label: 'Flexibility',
        optionId: userProfile.flexibility,
        title: getOptionTitle('flexibility', userProfile.flexibility),
        sub: getOptionSubtitle('flexibility', userProfile.flexibility)
      },
      {
        sectionId: 'life_line',
        sectionIdx: 3,
        label: 'Life Line',
        optionId: userProfile.life_line,
        title: getOptionTitle('life_line', userProfile.life_line),
        sub: getOptionSubtitle('life_line', userProfile.life_line)
      },
      {
        sectionId: 'heart_line',
        sectionIdx: 4,
        label: 'Heart Line',
        optionId: userProfile.heart_line,
        title: getOptionTitle('heart_line', userProfile.heart_line),
        sub: getOptionSubtitle('heart_line', userProfile.heart_line)
      },
      {
        sectionId: 'head_line',
        sectionIdx: 5,
        label: 'Head Line',
        optionId: userProfile.head_line,
        title: getOptionTitle('head_line', userProfile.head_line),
        sub: getOptionSubtitle('head_line', userProfile.head_line)
      },
      {
        sectionId: 'destiny_line',
        sectionIdx: 6,
        label: 'Destiny Line',
        optionId: userProfile.destiny_line,
        title: getOptionTitle('destiny_line', userProfile.destiny_line),
        sub: getOptionSubtitle('destiny_line', userProfile.destiny_line)
      },
      {
        sectionId: 'sun_line',
        sectionIdx: 7,
        label: 'Sun Line',
        optionId: userProfile.sun_line,
        title: getOptionTitle('sun_line', userProfile.sun_line),
        sub: getOptionSubtitle('sun_line', userProfile.sun_line)
      },
      {
        sectionId: 'marriage_line',
        sectionIdx: 8,
        label: 'Marriage Line',
        optionId: userProfile.marriage_line,
        title: getOptionTitle('marriage_line', userProfile.marriage_line),
        sub: getOptionSubtitle('marriage_line', userProfile.marriage_line)
      },
      {
        sectionId: 'special_markings',
        sectionIdx: 9,
        label: 'Special Markings',
        optionId: userProfile.special_markings,
        title: getOptionTitle('special_markings', userProfile.special_markings),
        sub: getOptionSubtitle('special_markings', userProfile.special_markings)
      }
    ];

    container.innerHTML = `
      <div class="detailed-flow-root">
        <div class="detailed-flow-bg-watermark"></div>

        <!-- Sticky Header -->
        <header class="detailed-q-header">
          <div class="detailed-q-top-row">
            <button id="detailed-rev-back-btn" class="detailed-q-back-btn" aria-label="Go Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <span class="detailed-step-counter-pill">
              Phase 6 • Review
            </span>

            <button id="detailed-rev-close-btn" class="detailed-close-icon-btn" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="detailed-review-header-group">
            <h1 class="detailed-review-title">Your Palm Profile</h1>
            <p class="detailed-review-sub">Review your visual selections before revealing your reading.</p>
          </div>
        </header>

        <!-- Compact Review Cards Grid -->
        <main class="detailed-q-content-body" style="padding-bottom: 120px;">
          <div class="detailed-review-grid">
            ${reviewItems.map(item => {
              const thumbSvg = renderDetailedPalmArtwork({
                hand: userProfile.hand,
                sectionId: item.sectionId,
                optionId: item.optionId,
                width: 38,
                height: 46
              });

              return `
                <div class="detailed-review-item-card" data-jump-idx="${item.sectionIdx}" role="button" tabindex="0">
                  
                  <div class="detailed-review-thumb-box">
                    ${thumbSvg}
                  </div>

                  <div class="detailed-review-text-col">
                    <span class="detailed-review-item-label">${item.label}</span>
                    <h4 class="detailed-review-item-val">${item.title}</h4>
                    <p class="detailed-review-item-sub">${item.sub}</p>
                  </div>

                  <button class="detailed-review-edit-btn" type="button" aria-label="Edit ${item.label}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                </div>
              `;
            }).join('')}
          </div>

          <div class="detailed-review-footer-prompt">
            <span class="detailed-review-prompt-text">Everything looks right?</span>
          </div>
        </main>

        <!-- Action CTAs -->
        <footer class="detailed-bottom-cta-bar">
          <button id="detailed-reveal-btn" class="kai-btn-gold-primary" type="button">
            <span>Reveal My Reading</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <button id="detailed-edit-all-btn" class="kai-btn-gold-secondary" type="button">
            <span>Edit Selections</span>
          </button>
        </footer>

      </div>
    `;

    // Click on any card jumps directly back to that question
    container.querySelectorAll('.detailed-review-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const jumpIdx = parseInt(card.getAttribute('data-jump-idx'), 10) || 0;
        currentSectionIndex = jumpIdx;
        screenStage = 'QUESTION';
        render();
      });
    });

    container.querySelector('#detailed-rev-back-btn')?.addEventListener('click', () => {
      currentSectionIndex = DETAILED_FLOW_SECTIONS.length - 1;
      screenStage = 'QUESTION';
      render();
    });

    container.querySelector('#detailed-rev-close-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#detailed-edit-all-btn')?.addEventListener('click', () => {
      currentSectionIndex = 0;
      screenStage = 'QUESTION';
      render();
    });

    container.querySelector('#detailed-reveal-btn')?.addEventListener('click', () => {
      screenStage = 'SYNTHESIZING';
      render();
    });
  }

  // =========================================================================
  // 4. SYNTHESIZING TRANSITION (Sacred Gold Mandala Synthesis)
  // =========================================================================
  function renderSynthesizingScreen() {
    container.innerHTML = `
      <div class="detailed-flow-root" style="justify-content: center; align-items: center; text-align: center; padding: 24px;">
        <div class="detailed-flow-bg-watermark"></div>

        <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;">
          
          <!-- Golden Sacred Rotating Mandala -->
          <div style="width: 110px; height: 110px; position: relative; margin-bottom: 24px;">
            <svg viewBox="0 0 100 100" width="100%" height="100%" style="animation: spinMandala 8s linear infinite;">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(251, 191, 36, 0.3)" stroke-width="1.5" stroke-dasharray="4 3" />
              <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="#FBBF24" stroke-width="1.8" />
              <polygon points="50,14 86,50 50,86 14,50" fill="none" stroke="rgba(251, 191, 36, 0.6)" stroke-width="1.2" transform="rotate(45 50 50)" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#FFF7D6" stroke-width="1.5" />
              <circle cx="50" cy="50" r="4" fill="#FBBF24" />
            </svg>
          </div>

          <h2 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 10px 0; letter-spacing: 0.05em; text-shadow: 0 0 14px rgba(251, 191, 36, 0.4);">
            Synthesizing Your Reading
          </h2>

          <p id="detailed-synth-milestone" style="font-size: 13px; color: #E4C276; margin: 0; max-width: 290px; line-height: 1.45;">
            Aligning palm geometry and line trajectories with Hasta Samudrika Shastra...
          </p>

        </div>
      </div>
    `;

    // Dynamic progressive milestones
    const milestones = [
      'Mapping elemental resonance & palm flexibility...',
      'Synthesizing Life, Head & Heart line vectors...',
      'Evaluating karmic markings & destiny milestones...',
      'Compiling your comprehensive personal dossier...'
    ];
    let mIdx = 0;
    const interval = setInterval(() => {
      mIdx += 1;
      const el = container.querySelector('#detailed-synth-milestone');
      if (el && milestones[mIdx]) {
        el.textContent = milestones[mIdx];
      }
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      generatedDossier = buildDossierFromDetailedProfile(userProfile);
      screenStage = 'RESULTS';
      render();
    }, 2400);
  }

  // =========================================================================
  // 5. RESULTS REVEAL (Comprehensive Palmistry Synthesis)
  // =========================================================================
  function renderResultsReveal() {
    const isRight = userProfile.hand === 'RIGHT';
    const handLabel = isRight ? 'Right Hand • Active Karma' : 'Left Hand • Innate Potential';

    container.innerHTML = `
      <div class="detailed-flow-root">
        <div class="detailed-flow-bg-watermark"></div>

        <!-- Sticky Header -->
        <header class="detailed-q-header">
          <div class="detailed-q-top-row">
            <button id="res-back-to-home-btn" class="detailed-q-back-btn" aria-label="Home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>

            <span class="detailed-step-counter-pill" style="border-color: #FBBF24; color: #FFFFFF;">
              Kai Reg<span style="color: #FBBF24;">AI</span> Synthesis
            </span>

            <button id="res-close-btn" class="detailed-close-icon-btn" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="detailed-review-header-group" style="margin-bottom: 8px;">
            <h1 class="detailed-review-title">Detailed Palm Reading</h1>
            <p class="detailed-review-sub">${handLabel}</p>
          </div>
        </header>

        <!-- Main Content -->
        <main class="detailed-q-content-body" style="padding-bottom: 120px;">
          
          <!-- Hero Illuminated Hand View -->
          <div style="display: flex; justify-content: center; margin: 10px 0 22px;">
            <div style="width: 170px; height: 215px; border-radius: 20px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.4); box-shadow: 0 0 24px rgba(251, 191, 36, 0.35); background: #0E0B16;">
              ${renderOpenPalmArtwork({
                hand: userProfile.hand,
                highlightLine: 'ALL',
                width: '100%',
                height: '100%'
              })}
            </div>
          </div>

          <!-- Summary Synthesis Card -->
          <div style="background: rgba(18, 14, 28, 0.85); backdrop-filter: blur(14px); border: 1.2px solid rgba(228, 194, 118, 0.3); border-radius: 18px; padding: 16px 18px; margin-bottom: 16px; box-shadow: 0 6px 22px rgba(0,0,0,0.6);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="color: #FBBF24; font-size: 16px;">✦</span>
              <h3 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 14px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: 0.05em;">
                HASTAREKHA SYNTHESIS
              </h3>
            </div>
            <p style="font-size: 12.5px; color: #E4C276; line-height: 1.55; margin: 0;">
              Your palm reveals a grounded <strong>${userProfile.shape}</strong> foundation paired with <strong>${userProfile.flexibility}</strong> elasticity. 
              With a <strong>${userProfile.life_line}</strong> Life Line and a <strong>${userProfile.heart_line}</strong> Heart Line, your conscious manifestation aligns pragmatic discipline with creative vision.
            </p>
          </div>

          <!-- Epistemic 3-Layer Cards -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            
            <!-- Layer 1: Physical Observation -->
            <div style="background: rgba(16, 12, 24, 0.75); border: 1px solid rgba(228, 194, 118, 0.2); border-radius: 14px; padding: 14px;">
              <span style="font-size: 10px; color: #E4C276; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase;">1. Physical Observation</span>
              <p style="font-size: 12px; color: #FFFFFF; line-height: 1.45; margin: 6px 0 0 0;">
                Clear, unbroken line paths observed across the major mounts, with distinct definition on the ${isRight ? 'active right' : 'passive left'} palm.
              </p>
            </div>

            <!-- Layer 2: Traditional Attribution -->
            <div style="background: rgba(16, 12, 24, 0.75); border: 1px solid rgba(228, 194, 118, 0.2); border-radius: 14px; padding: 14px;">
              <span style="font-size: 10px; color: #FBBF24; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase;">2. Traditional Attribution (Bhavishya Purana)</span>
              <p style="font-size: 12px; color: #FFFFFF; line-height: 1.45; margin: 6px 0 0 0;">
                Samudrika Shastra recognizes this alignment as a marker of Purushartha — self-directed willpower steering turning points with resilience.
              </p>
            </div>

            <!-- Layer 3: Reflective Synthesis -->
            <div style="background: rgba(16, 12, 24, 0.75); border: 1px solid rgba(228, 194, 118, 0.2); border-radius: 14px; padding: 14px;">
              <span style="font-size: 10px; color: #34D399; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase;">3. Kai RegAI Synthesis</span>
              <p style="font-size: 12px; color: #FFFFFF; line-height: 1.45; margin: 6px 0 0 0;">
                Your greatest strengths emerge when you balance long-term goals with intuitive flexibility, grounding visionary ideas in daily practice.
              </p>
            </div>

          </div>

        </main>

        <!-- Floating Bottom Actions -->
        <footer class="detailed-bottom-cta-bar">
          <button id="res-open-detailed-dossier-btn" class="kai-btn-gold-primary" type="button">
            <span>View Your Palm Reading Report</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <button id="res-reread-flow-btn" class="kai-btn-gold-secondary" type="button">
            <span>Edit or Read Other Hand</span>
          </button>
        </footer>

      </div>
    `;

    container.querySelector('#res-back-to-home-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#res-close-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#res-reread-flow-btn')?.addEventListener('click', () => {
      screenStage = 'INTRO';
      render();
    });

    container.querySelector('#res-open-detailed-dossier-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.DETAILED_REPORT, { dossier: generatedDossier });
    });
  }

  // --- Helper Functions to Resolve Titles and Subtitles from Schema ---
  function getOptionTitle(sectionId, optId) {
    const sec = DETAILED_FLOW_SECTIONS.find(s => s.id === sectionId);
    const opt = sec?.options.find(o => o.id === optId);
    return opt?.title || optId;
  }

  function getOptionSubtitle(sectionId, optId) {
    const sec = DETAILED_FLOW_SECTIONS.find(s => s.id === sectionId);
    const opt = sec?.options.find(o => o.id === optId);
    return opt?.subtitle || '';
  }

  // Initial Boot
  render();
}
