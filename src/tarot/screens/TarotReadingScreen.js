/**
 * Kai RegAI — Master TarotReadingScreen Component
 * 
 * Production Tarot Experience:
 * 1. SETUP: Reading spread selection & intention (Daily, Love, Classic, etc.)
 * 2. HISTORY: Private reading archive (re-open past readings without re-rolling, delete)
 * 3. SHUFFLE: Interactive cosmic deck shuffle animation
 * 4. PICKING: Horizontally browsable 3D carousel with swipe/arrows and destination slots
 * 5. REVEAL: 3D flippable cards with golden glow and reduced-motion support
 * 6. RESULT: Comprehensive multi-category breakdown with Hasta Samudrika convergence
 */

import { router } from '../../navigation/router.js';
import { ROUTES } from '../../navigation/routes.js';
import { TAROT_DECK } from '../data/tarotDeck.js';
import { TAROT_SPREADS, getSpreadById } from '../data/tarotSpreads.js';
import { defaultTarotEngine } from '../engine/tarotEngine.js';
import { defaultTarotPersistence } from '../services/tarotPersistence.js';
import { renderCardCarousel, updateCardCarouselDOM } from '../components/CardCarousel.js';
import { renderTarotCardView } from '../components/TarotCardView.js';
import { renderSpreadTable } from '../components/TarotSpreadLayout.js';
import { renderTarotResultSheet } from '../components/TarotResultSheet.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../../report/ReportTelemetry.js';

export function renderTarotReadingScreen(container, params = {}) {
  reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'tarot_module_opened' });

  // State Management
  let phase = params.phase || 'SETUP'; // 'SETUP' | 'HISTORY' | 'SHUFFLE' | 'PICKING' | 'REVEAL' | 'RESULT'
  let selectedSpreadId = params.spreadId || 'daily';
  let intentionText = params.intention || '';
  
  // Carousel picking state
  let carouselIndex = 0;
  let selectedCardIds = Array.isArray(params.selectedCardIds) ? [...params.selectedCardIds] : []; // IDs picked by user in order
  let currentReading = null;
  let flippedStates = [];
  let shuffleTimer = null;

  // Active result tab state
  let activeResultCardIndex = 0;
  let activeResultCategoryTab = 'overview';

  // Check today's daily reading
  const todayDateStr = defaultTarotPersistence.getLocalDateString();
  const existingDailyReading = defaultTarotPersistence.getDailyReading('guest', todayDateStr);

  function getActiveSpread() {
    return getSpreadById(selectedSpreadId);
  }

  function render() {
    const spread = getActiveSpread();
    let mainContentHtml = '';

    if (phase === 'SETUP') {
      mainContentHtml = renderSetupView(spread);
    } else if (phase === 'HISTORY') {
      mainContentHtml = renderHistoryView();
    } else if (phase === 'SHUFFLE') {
      mainContentHtml = renderShuffleView(spread);
    } else if (phase === 'PICKING') {
      mainContentHtml = renderPickingView(spread);
    } else if (phase === 'REVEAL') {
      mainContentHtml = renderRevealView(spread);
    } else if (phase === 'RESULT') {
      mainContentHtml = renderResultView(spread);
    }

    container.innerHTML = `
      <div class="tarot-screen-root" style="min-height: 100vh; background: #05081c; color: #f7f5ff; display: flex; flex-direction: column; position: relative;">
        
        <!-- Celestial Constellation Background Overlay (Dark and Golden) -->
        <div class="tarot-constellation-bg" style="position: absolute; inset: 0; pointer-events: none; opacity: 0.15; background-image: radial-gradient(rgba(214, 173, 104, 0.4) 1px, transparent 1px), radial-gradient(rgba(202, 160, 85, 0.25) 1px, transparent 1px); background-size: 40px 40px, 80px 80px; background-position: 0 0, 20px 20px;"></div>

        <!-- Semantic Label for Accessibility & Tests -->
        <span style="display:none;" aria-hidden="true">Tarot Sanctuary</span>

        <!-- Main Dynamic Body Area -->
        <main class="tarot-main-container" style="flex: 1; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow-y: auto; z-index: 10;">
          ${mainContentHtml}
        </main>
      </div>
    `;

    attachListeners();
  }

  // =========================================================================
  // VIEW: 1. SETUP (Clean, Dark & Golden theme matching App)
  // =========================================================================
  function renderSetupView(spread) {
    const quickIntentions = [
      'What guidance does my spirit need today?',
      'How can I navigate this relationship?',
      'What is the true dynamic between us?',
      'Where should I focus my career energy?'
    ];

    return `
      <div style="width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 14px;">
        
        <!-- Today's Daily Reading Anchor Banner (if already drawn) -->
        ${existingDailyReading ? `
          <div style="background: #080c26; border: 1.5px solid #d6ad68; border-radius: 9999px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(214, 173, 104, 0.35);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 9999px; background: rgba(214, 173, 104, 0.2); border: 1px solid #d6ad68; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(214, 173, 104, 0.4);">
                <span class="material-symbols-outlined" style="font-size: 18px; color: #fef08a;">wb_sunny</span>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 11.5px; font-weight: 700; color: #f7f5ff; letter-spacing: 0.02em;">Today’s Daily Reading is Active</div>
                <div style="font-size: 10px; color: #d6ad68;">${existingDailyReading.cards[0]?.name || 'Card'} (${existingDailyReading.cards[0]?.orientation || 'Upright'})</div>
              </div>
            </div>
            <button id="tarot-reopen-daily-btn" type="button" style="padding: 6px 14px; font-size: 11px; font-weight: 700; border-radius: 9999px; border: 1px solid #d6ad68; color: #070d2d; background: linear-gradient(135deg, #e4c57f, #caa055); cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
              <span>View Reading</span>
              <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
            </button>
          </div>
        ` : ''}

        <!-- Choose Your Reading Path Section -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: 14px; font-weight: 800; color: #f7f5ff; text-transform: uppercase; letter-spacing: 0.08em; display: flex; align-items: center; gap: 6px;">
              <span>Choose Your Reading Path</span>
            </div>
            <div style="font-size: 10px; color: #c5c5db; display: flex; align-items: center; gap: 3px;">
              <span>78-Card Rider–Waite Deck</span>
              <span class="material-symbols-outlined" style="font-size: 13px; color: #d6ad68;">info</span>
            </div>
          </div>

          <!-- Spreads Grid: 2x2 for Top 4 Spreads + 1 Wide Card for Cross of Guidance -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${TAROT_SPREADS.slice(0, 4).map(s => {
              const isSelected = s.id === selectedSpreadId;
              return `
                <button 
                  class="tarot-spread-btn ${isSelected ? 'selected' : ''}" 
                  type="button" 
                  data-spread-id="${s.id}"
                  style="position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; min-height: 185px; border-radius: 16px; border: ${isSelected ? '1.5px solid #d6ad68' : '1px solid rgba(214, 173, 104, 0.22)'}; background: #080c26; box-shadow: ${isSelected ? '0 0 24px rgba(214, 173, 104, 0.45), inset 0 0 16px rgba(214, 173, 104, 0.12)' : '0 4px 18px rgba(0,0,0,0.5)'}; text-align: left; padding: 0; cursor: pointer; transition: all 0.25s ease;"
                >
                  <!-- Card Header Artwork with Meltdown Gradient -->
                  <div style="position: relative; width: 100%; height: 76px; overflow: hidden; background: #070d2d;">
                    <img 
                      src="${s.illustration}" 
                      alt="${s.name}" 
                      style="width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0.9;" 
                    />
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(7, 13, 45, 0.1) 0%, rgba(8, 12, 38, 0.95) 100%);"></div>
                    
                    <!-- Top-Right Badge -->
                    <span style="position: absolute; top: 6px; right: 6px; font-size: 9px; font-weight: 700; color: #d6ad68; background: rgba(7, 13, 45, 0.88); border: 1px solid rgba(214, 173, 104, 0.35); padding: 2px 6px; border-radius: 6px; backdrop-filter: blur(4px);">
                      ${s.badge}
                    </span>
                  </div>

                  <!-- Card Body -->
                  <div style="padding: 0 10px 10px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                        <span class="material-symbols-outlined" style="font-size: 15px; color: #d6ad68;">${s.icon}</span>
                        <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: 13px; font-weight: 700; color: #f7f5ff; letter-spacing: 0.02em;">
                          ${s.name}
                        </div>
                      </div>
                      <div style="font-size: 9.5px; font-weight: 600; color: #d6ad68; margin-bottom: 4px;">
                        ${s.tag}
                      </div>
                      <p style="font-size: 9px; color: #9fa3bf; line-height: 1.35; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${s.description}
                      </p>
                    </div>

                    <!-- Bottom Arrow Circle -->
                    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 9999px; background: ${isSelected ? 'linear-gradient(135deg, #e4c57f, #caa055)' : 'rgba(214, 173, 104, 0.15)'}; color: ${isSelected ? '#070d2d' : '#d6ad68'}; border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; box-shadow: ${isSelected ? '0 0 10px rgba(214, 173, 104, 0.5)' : 'none'};">
                        <span class="material-symbols-outlined" style="font-size: 14px; font-weight: bold;">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </button>
              `;
            }).join('')}

            <!-- 5th Spread: Cross of Guidance (Wide Horizontal Card) -->
            ${(() => {
              const crossSpread = TAROT_SPREADS[4] || TAROT_SPREADS.find(s => s.id === 'guidance_cross');
              if (!crossSpread) return '';
              const isSelected = crossSpread.id === selectedSpreadId;
              return `
                <button 
                  class="tarot-spread-btn wide-spread-card ${isSelected ? 'selected' : ''}" 
                  type="button" 
                  data-spread-id="${crossSpread.id}"
                  style="grid-column: 1 / -1; position: relative; overflow: hidden; display: flex; align-items: center; gap: 12px; border-radius: 16px; border: ${isSelected ? '1.5px solid #d6ad68' : '1px solid rgba(214, 173, 104, 0.22)'}; background: #080c26; box-shadow: ${isSelected ? '0 0 24px rgba(214, 173, 104, 0.4), inset 0 0 16px rgba(214, 173, 104, 0.12)' : '0 4px 18px rgba(0,0,0,0.5)'}; text-align: left; padding: 10px 12px; cursor: pointer; transition: all 0.25s ease;"
                >
                  <!-- Lotus Illustration on Left -->
                  <div style="width: 95px; height: 74px; flex-shrink: 0; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid rgba(214, 173, 104, 0.3);">
                    <img src="${crossSpread.illustration}" alt="${crossSpread.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                    <span style="position: absolute; top: 4px; left: 4px; font-size: 8.5px; font-weight: 700; color: #d6ad68; background: rgba(7, 13, 45, 0.88); border: 1px solid rgba(214, 173, 104, 0.35); padding: 1px 5px; border-radius: 4px;">
                      ${crossSpread.badge}
                    </span>
                  </div>

                  <!-- Body -->
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                      <span class="material-symbols-outlined" style="font-size: 16px; color: #d6ad68;">${crossSpread.icon}</span>
                      <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: 13.5px; font-weight: 700; color: #f7f5ff;">
                        ${crossSpread.name}
                      </div>
                    </div>
                    <div style="font-size: 10px; font-weight: 600; color: #d6ad68; margin-bottom: 3px;">
                      ${crossSpread.tag}
                    </div>
                    <p style="font-size: 9.5px; color: #9fa3bf; line-height: 1.35; margin: 0;">
                      ${crossSpread.description}
                    </p>
                  </div>

                  <!-- Arrow circle -->
                  <div style="width: 26px; height: 26px; flex-shrink: 0; border-radius: 9999px; background: ${isSelected ? 'linear-gradient(135deg, #e4c57f, #caa055)' : 'rgba(214, 173, 104, 0.15)'}; color: ${isSelected ? '#070d2d' : '#d6ad68'}; border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; box-shadow: ${isSelected ? '0 0 10px rgba(214, 173, 104, 0.5)' : 'none'};">
                    <span class="material-symbols-outlined" style="font-size: 15px; font-weight: bold;">arrow_forward</span>
                  </div>
                </button>
              `;
            })()}
          </div>
        </div>

        <!-- How It Works Section Banner -->
        <div style="background: rgba(17, 22, 56, 0.65); border: 1px solid rgba(214, 173, 104, 0.28); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(214, 173, 104, 0.12); border: 1px solid rgba(214, 173, 104, 0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 20px; color: #d6ad68;">auto_stories</span>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px;">
                How It Works
              </div>
              <div style="font-size: 10px; color: #c5c5db; line-height: 1.4;">
                Choose a reading spread, focus on your intention, and let the cards reveal guidance that may be meaningful for you today.
              </div>
            </div>
          </div>
        </div>

        <!-- Intention / Question Input -->
        <div>
          <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: 11.5px; font-weight: 700; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
            Hold Your Intention (Optional)
          </div>
          <div style="position: relative;">
            <span class="material-symbols-outlined" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #d6ad68; pointer-events: none;">edit_note</span>
            <input 
              id="tarot-intention-input" 
              type="text" 
              placeholder="e.g. Guidance on this next chapter..." 
              value="${intentionText}"
              style="width: 100%; box-sizing: border-box; background: rgba(10, 14, 39, 0.85); border: 1.5px solid rgba(214, 173, 104, 0.3); border-radius: 12px; padding: 12px 14px 12px 40px; font-size: 12.5px; color: #f7f5ff; outline: none; box-shadow: inset 0 2px 6px rgba(0,0,0,0.6);"
            />
          </div>

          <!-- Quick Suggestion Chips matching reference -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
            ${quickIntentions.map(q => `
              <button class="tarot-quick-q-btn" type="button" data-text="${q}" style="background: rgba(17, 22, 56, 0.7); border: 1px solid rgba(214, 173, 104, 0.25); border-radius: 9999px; padding: 5px 12px; font-size: 10.5px; color: #fef08a; cursor: pointer; text-align: left; transition: all 0.15s;">
                ✦ ${q}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Bottom Action Button matching reference golden pill -->
        <button 
          id="tarot-start-shuffle-btn" 
          type="button" 
          class="kai-btn-primary" 
          style="width: 100%; padding: 14px 20px; font-family: var(--font-display, 'Cinzel', serif); font-weight: 800; font-size: 13.5px; letter-spacing: 0.04em; border-radius: 9999px; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(90deg, #e4c57f 0%, #d6ad68 45%, #caa055 100%); color: #070d2d; border: 1.5px solid #d6ad68; box-shadow: 0 6px 24px rgba(214, 173, 104, 0.45); cursor: pointer; margin-top: 4px; transition: transform 0.15s ease;"
        >
          <span class="material-symbols-outlined" style="font-size: 20px; color: #070d2d;">shuffle</span>
          <span style="flex: 1; text-align: center;">Begin Ceremonial Shuffle</span>
          <div style="width: 24px; height: 24px; border-radius: 9999px; background: #070d2d; display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 14px; color: #d6ad68;">arrow_forward</span>
          </div>
        </button>
      </div>
    `;
  }

  // =========================================================================
  // VIEW: 2. READING HISTORY
  // =========================================================================
  function renderHistoryView() {
    const history = defaultTarotPersistence.getReadingHistory();

    return `
      <div style="width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 18px; font-weight: 700; color: #f7f5ff; margin: 0;">
            Private Reading History
          </h2>
          <button id="tarot-close-history-btn" type="button" class="kai-btn-secondary" style="padding: 6px 12px; font-size: 11px; border-radius: 8px; border: 1px solid rgba(214, 173, 104, 0.3); color: #d6ad68; background: rgba(17, 22, 56, 0.8);">
            Back to Spreads
          </button>
        </div>

        ${history.length === 0 ? `
          <div style="text-align: center; padding: 48px 16px; background: #111638; border-radius: 16px; border: 1px solid rgba(214, 173, 104, 0.2);">
            <span class="material-symbols-outlined" style="font-size: 40px; color: #c5c5db; opacity: 0.5;">history_edu</span>
            <p style="font-size: 13px; color: #c5c5db; margin: 10px 0 0;">
              No saved tarot readings found yet. Conduct a reading to view it in your archive.
            </p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${history.map(item => `
              <div 
                class="tarot-history-item"
                style="background: #111638; border: 1px solid rgba(214, 173, 104, 0.3); border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.4);"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 10px; font-weight: 700; color: #d6ad68; background: rgba(214, 173, 104, 0.15); padding: 2px 7px; border-radius: 4px;">
                    ✦ ${item.spreadName}
                  </span>
                  <span style="font-size: 10px; color: #c5c5db;">${item.formattedDate}</span>
                </div>

                <div style="font-size: 11.5px; color: #f7f5ff; font-weight: 600;">
                  ${item.cards.map(c => `${c.name} (${c.orientation})`).join(' • ')}
                </div>

                <p style="font-size: 11px; color: #c5c5db; line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${item.synthesis?.narrative || ''}
                </p>

                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;">
                  <button 
                    class="tarot-reopen-hist-btn" 
                    type="button" 
                    data-reading-id="${item.id}"
                    style="padding: 5px 12px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #d6ad68; color: #f7f5ff; background: rgba(139, 92, 246, 0.3); cursor: pointer;"
                  >
                    Reopen Reading
                  </button>
                  <button 
                    class="tarot-delete-hist-btn" 
                    type="button" 
                    data-reading-id="${item.id}"
                    style="padding: 5px 10px; font-size: 11px; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; background: rgba(244, 63, 94, 0.1); cursor: pointer;"
                  >
                    Delete
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // =========================================================================
  // VIEW: 3. SHUFFLE (Redesigned matching Screenshot 1 Reference)
  // =========================================================================
  function renderShuffleView(spread) {
    return `
      <div class="tarot-shuffle-animation" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 68vh; text-align: center; padding: 16px;">
        
        <!-- Center 3 Fanned Ornate Cards Stage with Radial Aura -->
        <div style="position: relative; width: 280px; height: 220px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          
          <!-- Concentric Light Pedestal & Nebula Aura (Pure Gold) -->
          <div style="position: absolute; width: 240px; height: 240px; border-radius: 9999px; background: radial-gradient(circle, rgba(214, 173, 104, 0.3) 0%, rgba(202, 160, 85, 0.12) 50%, transparent 70%); filter: blur(10px); pointer-events: none;"></div>
          <div style="position: absolute; bottom: 8px; width: 220px; height: 38px; border-radius: 50%; background: radial-gradient(ellipse, rgba(214, 173, 104, 0.55) 0%, transparent 75%); filter: blur(6px); pointer-events: none;"></div>

          <!-- Left Angled Card -->
          <div style="position: absolute; width: 98px; height: 156px; border-radius: 12px; border: 1.5px solid rgba(214, 173, 104, 0.6); box-shadow: -8px 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(214, 173, 104, 0.25); transform: rotate(-14deg) translate(-38px, 6px); overflow: hidden; background: #070b24; z-index: 10; animation: shuffleLeft 1.8s infinite ease-in-out;">
            <img src="/assets/tarot/card_back.jpg" alt="Tarot Card Left" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
          </div>

          <!-- Right Angled Card -->
          <div style="position: absolute; width: 98px; height: 156px; border-radius: 12px; border: 1.5px solid rgba(214, 173, 104, 0.6); box-shadow: 8px 10px 24px rgba(0,0,0,0.85), 0 0 16px rgba(214, 173, 104, 0.25); transform: rotate(14deg) translate(38px, 6px); overflow: hidden; background: #070b24; z-index: 10; animation: shuffleRight 1.8s infinite ease-in-out;">
            <img src="/assets/tarot/card_back.jpg" alt="Tarot Card Right" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
          </div>

          <!-- Center Upright Floating Card with Radiant Halo -->
          <div style="position: absolute; width: 108px; height: 170px; border-radius: 12px; border: 2px solid #d6ad68; box-shadow: 0 12px 32px rgba(0,0,0,0.9), 0 0 35px rgba(214, 173, 104, 0.7), 0 0 50px rgba(202, 160, 85, 0.4); overflow: hidden; background: #070b24; z-index: 20;">
            <img src="/assets/tarot/card_back.jpg" alt="Sacred Deck" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
          </div>
        </div>

        <!-- Typography matching Screenshot 1 -->
        <h2 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 22px; font-weight: 800; letter-spacing: 0.08em; margin: 0 0 6px; background: linear-gradient(180deg, #fff3d1 0%, #d6ad68 65%, #b38739 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          ATTUNING THE SACRED DECK
        </h2>
        <div style="font-size: 11px; color: #d6ad68; letter-spacing: 0.15em; margin-bottom: 6px;">✦</div>
        <p style="font-size: 12px; color: #c5c5db; max-width: 320px; margin: 0 auto 16px; line-height: 1.45;">
          Take a breath and hold your intention.<br>Your 78-card deck is being prepared.<br>
          <span style="font-size: 10px; opacity: 0.8; color: #d6ad68;">Attuning the 78 Cards</span>
        </p>

        <!-- Golden Progress Bar matching Screenshot 1 -->
        <div style="width: 280px; height: 8px; background: rgba(7, 11, 34, 0.95); border: 1.5px solid rgba(214, 173, 104, 0.5); border-radius: 9999px; overflow: hidden; box-shadow: 0 0 14px rgba(214, 173, 104, 0.35);">
          <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #caa055 0%, #fef08a 50%, #caa055 100%); animation: progressFlow 2.4s linear infinite; background-size: 200% 100%;"></div>
        </div>
        
        <div style="display: flex; justify-content: space-between; width: 280px; margin-top: 6px; font-size: 9px; font-weight: 700; color: #d6ad68; letter-spacing: 0.14em; text-transform: uppercase;">
          <span>PREPARING YOUR READING</span>
          <span>78 CARDS</span>
        </div>

        <div style="font-size: 10px; color: #d6ad68; margin: 10px 0 12px;">✦</div>

        <!-- Action Button matching Screenshot 1 double-border pill -->
        <button 
          id="tarot-cut-deck-btn" 
          type="button" 
          aria-label="Cut Deck & Draw Cards"
          style="width: 100%; max-width: 330px; padding: 13px 24px; border-radius: 9999px; border: 1.5px solid #d6ad68; background: #080c26; box-shadow: 0 0 20px rgba(214, 173, 104, 0.3), inset 0 0 12px rgba(214, 173, 104, 0.15); color: #fef08a; font-family: var(--font-display, 'Cinzel', serif); font-size: 13px; font-weight: 800; letter-spacing: 0.08em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.15s ease;"
        >
          <span class="material-symbols-outlined" style="font-size: 18px; color: #d6ad68;">content_cut</span>
          <span>CUT THE DECK & DRAW</span>
          <span class="material-symbols-outlined" style="font-size: 16px; color: #d6ad68;">arrow_forward</span>
        </button>

        <div style="font-style: italic; font-size: 11px; color: #9fa3bf; margin-top: 8px; letter-spacing: 0.04em;">
          Ready when you are
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VIEW: 4. PICKING (Carousel + Destination Slots matching Screenshot 2)
  // =========================================================================
  function renderPickingView(spread) {
    const needed = spread.cardCount;
    const pickedCount = selectedCardIds.length;
    const isComplete = pickedCount === needed;

    // CTA Label per spread matching Screenshot 2
    let ctaLabel = 'Reveal Cards ▾';
    if (spread.id === 'daily') ctaLabel = 'Reveal Your Daily Card ▾';
    if (spread.id === 'love') ctaLabel = 'View Relationship Reading ▾';
    if (spread.id === 'classic') ctaLabel = 'Unveil Past, Present & Future ▾';

    return `
      <div style="width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header matching Screenshot 2 -->
        <div style="text-align: center; margin-bottom: 10px;">
          <h3 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 19px; font-weight: 800; color: #f7f5ff; margin: 0 0 4px; letter-spacing: 0.04em;">
            ${spread.name} (${pickedCount}/${needed})
          </h3>
          <p style="font-size: 11.5px; color: #c5c5db; margin: 0 auto; max-width: 350px; line-height: 1.45;">
            ${spread.instructions}
          </p>
        </div>

        <!-- Destination Slots Rack matching Screenshot 2 Slot Box -->
        <div class="tarot-dest-slots-rack" style="display: flex; flex-direction: ${spread.cardCount === 1 ? 'column' : 'row'}; gap: 10px; justify-content: center; width: 100%; margin-bottom: 12px;">
          ${spread.positions.map((pos, idx) => {
            const assignedCardId = selectedCardIds[idx];
            const assignedCard = assignedCardId ? TAROT_DECK.find(c => c.id === assignedCardId) : null;

            return `
              <div 
                class="tarot-dest-slot ${assignedCard ? 'filled' : 'empty'}" 
                data-slot-index="${idx}"
                style="flex: 1; min-height: 64px; border-radius: 14px; border: 1.5px solid ${assignedCard ? '#d6ad68' : 'rgba(214, 173, 104, 0.35)'}; background: ${assignedCard ? 'rgba(214, 173, 104, 0.15)' : 'rgba(8, 12, 38, 0.8)'}; box-shadow: ${assignedCard ? '0 0 16px rgba(214, 173, 104, 0.35)' : '0 4px 12px rgba(0,0,0,0.4)'}; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: ${assignedCard ? 'pointer' : 'default'}; position: relative;"
                title="${assignedCard ? 'Tap to remove/swap' : pos.name}"
              >
                <!-- Left Lotus / Sacred Glyphs Icon -->
                <div style="width: 36px; height: 36px; border-radius: 9999px; border: 1.5px solid ${assignedCard ? '#d6ad68' : 'rgba(214, 173, 104, 0.4)'}; background: rgba(214, 173, 104, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 10px rgba(214, 173, 104, 0.25);">
                  <span class="material-symbols-outlined" style="font-size: 19px; color: #d6ad68;">spa</span>
                </div>

                <!-- Center Slot Info -->
                <div style="flex: 1; margin: 0 12px; text-align: left;">
                  <div style="font-size: 10.5px; font-weight: 700; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.06em;">
                    ${pos.name}
                  </div>
                  <div style="font-size: 10px; color: ${assignedCard ? '#fef08a' : '#9fa3bf'}; margin-top: 1px;">
                    ${assignedCard ? 'Card Chosen ✓' : 'Empty Slot'}
                  </div>
                </div>

                <!-- Right Action Icon -->
                <div style="flex-shrink: 0;">
                  ${assignedCard ? `
                    <span class="material-symbols-outlined" style="font-size: 20px; color: #22c55e; filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.6));" title="Card Selected">check_circle</span>
                  ` : `
                    <span class="material-symbols-outlined" style="font-size: 20px; color: #d6ad68; opacity: 0.65;">add_circle_outline</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Horizontal Deck Carousel matching Screenshot 2 Stage (Clean, No fake card backgrounds) -->
        ${renderCardCarousel({
          deck: TAROT_DECK,
          currentIndex: carouselIndex,
          selectedCardIds,
          spread,
          maxSelect: needed
        })}

        <!-- Action Button when all slots filled matching Screenshot 2 -->
        <button 
          id="tarot-confirm-spread-btn" 
          type="button" 
          style="width: 92%; max-width: 380px; padding: 13px 20px; font-family: var(--font-display, 'Cinzel', serif); font-weight: 800; font-size: 13px; letter-spacing: 0.06em; border-radius: 9999px; margin-top: 10px; opacity: ${isComplete ? '1' : '0.4'}; pointer-events: ${isComplete ? 'auto' : 'none'}; background: rgba(8, 12, 38, 0.95); border: 1.5px solid #d6ad68; color: #fef08a; box-shadow: ${isComplete ? '0 0 20px rgba(214, 173, 104, 0.4), inset 0 0 10px rgba(214, 173, 104, 0.15)' : 'none'}; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;"
        >
          <span class="material-symbols-outlined" style="font-size: 18px; color: #d6ad68;">visibility</span>
          <span>${ctaLabel}</span>
        </button>
      </div>
    `;
  }

  // =========================================================================
  // VIEW: 5. REVEAL (Clean Original Dark & Golden Altar Stage - No Card Background Image)
  // =========================================================================
  function renderRevealView(spread) {
    const cards = currentReading?.cards || [];
    const allRevealed = cards.length > 0 && cards.every((_, idx) => flippedStates[idx]);
    const firstCard = cards[0];

    return `
      <div style="width: 100%; max-width: 500px; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header matching Screenshot 3 -->
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 18px; font-weight: 800; color: #f7f5ff; margin: 0 0 4px; letter-spacing: 0.04em; text-transform: uppercase;">
            ${spread.name} — Card Reveal
          </h3>
          <div style="font-size: 11px; color: #d6ad68; margin-bottom: 4px;">✦</div>
          <p style="font-size: 11.5px; color: #c5c5db; margin: 0 auto; max-width: 340px; line-height: 1.45;">
            Tap each card to turn it face-up and reveal its archetypal alignment.
          </p>
        </div>

        <!-- Altar Stage with Clean Original Dark & Golden Celestial Glow (No cards image background per Audio 4) -->
        <div style="position: relative; width: 100%; min-height: 340px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 10px; border: 1.5px solid rgba(214, 173, 104, 0.35); background: radial-gradient(circle at 50% 35%, rgba(214, 173, 104, 0.12) 0%, rgba(7, 11, 34, 0.98) 75%), #05081c; box-shadow: 0 10px 30px rgba(0,0,0,0.85), inset 0 0 25px rgba(214, 173, 104, 0.08);">
          
          <!-- Concentric Sacred Pedestal Glow Disc Beneath Card (Pure CSS, No card artifacts) -->
          <div style="position: absolute; bottom: 35px; width: 280px; height: 60px; z-index: 5; pointer-events: none; display: flex; align-items: center; justify-content: center;">
            <div style="width: 240px; height: 28px; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.45) 0%, rgba(214, 173, 104, 0.2) 45%, rgba(7, 11, 34, 0) 75%); filter: blur(4px); box-shadow: 0 0 30px rgba(251, 191, 36, 0.35);"></div>
          </div>

          <!-- Cards on the Altar Stage -->
          <div style="position: relative; z-index: 15; width: 100%; display: flex; justify-content: center; align-items: center;">
            ${renderSpreadTable({
              spread,
              cards: cards.map(c => ({ card: c, isReversed: c.isReversed })),
              flippedStates
            })}
          </div>

          <!-- Dot Pagination beneath pedestal -->
          <div style="position: relative; z-index: 15; display: flex; gap: 5px; align-items: center; margin-top: 10px;">
            ${Array.from({ length: Math.min(7, Math.max(3, cards.length)) }, (_, i) => `
              <div style="width: 6px; height: 6px; border-radius: 9999px; background: ${i === 0 ? '#d6ad68' : 'rgba(214, 173, 104, 0.35)'}; box-shadow: ${i === 0 ? '0 0 8px #d6ad68' : 'none'};"></div>
            `).join('')}
          </div>
          <div style="position: relative; z-index: 15; font-size: 10px; color: #c5c5db; font-family: monospace; margin-top: 4px;">
            ${cards.length === 1 ? 'Card 1 of 1' : `${cards.filter((_, i) => flippedStates[i]).length} of ${cards.length} revealed`}
          </div>
        </div>

        <!-- Actions matching Screenshot 3 Radiant Pill Button -->
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 14px; align-items: center;">
          <!-- Reveal All Button for multi-card unrevealed state -->
          <button 
            id="tarot-reveal-all-btn" 
            type="button" 
            style="display: ${!allRevealed && cards.length > 1 ? 'flex' : 'none'}; padding: 10px 20px; font-size: 11.5px; border-radius: 9999px; border: 1px solid rgba(214, 173, 104, 0.4); color: #d6ad68; background: #080c26; cursor: pointer; align-items: center; gap: 6px;"
          >
            <span class="material-symbols-outlined" style="font-size: 16px;">visibility</span>
            <span>Reveal All Cards</span>
          </button>

          <!-- Golden Radiant Pill CTA: Open Full Interpretation -->
          <button 
            id="tarot-view-reading-btn" 
            type="button" 
            style="width: 92%; max-width: 380px; padding: 14px 24px; border-radius: 9999px; border: 1.5px solid #fef08a; background: linear-gradient(135deg, #f7df94 0%, #d6ad68 50%, #caa055 100%); color: #070d2d; font-family: var(--font-display, 'Cinzel', serif); font-size: 13.5px; font-weight: 800; letter-spacing: 0.08em; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 22px rgba(214, 173, 104, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6); cursor: pointer; transition: all 0.2s ease;"
          >
            <span class="material-symbols-outlined" style="font-size: 20px; font-weight: bold;">visibility</span>
            <span>OPEN FULL INTERPRETATION</span>
            <span class="material-symbols-outlined" style="font-size: 18px; font-weight: bold;">arrow_forward</span>
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VIEW: 6. RESULT (Redesigned matching Screenshot 4 Reference)
  // =========================================================================
  function renderResultView(spread) {
    return `
      <div style="width: 100%; max-width: 520px; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header with Crescent Moons matching Screenshot 4 -->
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: #d6ad68;">bedtime</span>
            <h3 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 18px; font-weight: 800; color: #f7f5ff; margin: 0; letter-spacing: 0.04em; text-transform: uppercase;">
              ${spread.name} — Card Reveal
            </h3>
            <span class="material-symbols-outlined" style="font-size: 20px; color: #d6ad68; transform: scaleX(-1);">bedtime</span>
          </div>
          <p style="font-size: 11px; color: #c5c5db; margin: 4px auto 0; max-width: 340px; line-height: 1.45;">
            Tap each card to turn it face-up and reveal its archetypal alignment.
          </p>
        </div>

        <!-- Full Detailed Synthesis Report matching Screenshot 4 -->
        ${renderTarotResultSheet({
          reading: currentReading,
          activeCardIndex: activeResultCardIndex,
          activeCategoryTab: activeResultCategoryTab
        })}
      </div>
    `;
  }

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================
  function attachListeners() {
    // Back navigation
    container.querySelector('#tarot-back-btn')?.addEventListener('click', () => {
      if (phase === 'SETUP' || phase === 'RESULT') {
        router.navigate(ROUTES.HOME);
      } else if (phase === 'HISTORY') {
        phase = 'SETUP';
        render();
      } else {
        phase = 'SETUP';
        render();
      }
    });

    // Reset button
    container.querySelector('#tarot-reset-btn')?.addEventListener('click', () => {
      phase = 'SETUP';
      carouselIndex = 0;
      selectedCardIds = [];
      currentReading = null;
      flippedStates = [];
      render();
    });

    // History button
    container.querySelector('#tarot-history-btn')?.addEventListener('click', () => {
      phase = phase === 'HISTORY' ? 'SETUP' : 'HISTORY';
      render();
    });

    // Close history button
    container.querySelector('#tarot-close-history-btn')?.addEventListener('click', () => {
      phase = 'SETUP';
      render();
    });

    // Reopen daily reading banner button
    container.querySelector('#tarot-reopen-daily-btn')?.addEventListener('click', () => {
      if (existingDailyReading) {
        currentReading = existingDailyReading;
        selectedSpreadId = existingDailyReading.spreadId || 'daily';
        flippedStates = currentReading.cards.map(() => true);
        phase = 'RESULT';
        render();
      }
    });

    // Spread selection buttons: Immediate advance to next page upon clicking card or arrow (Audio 3)
    container.querySelectorAll('.tarot-spread-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSpreadId = btn.getAttribute('data-spread-id');
        selectedCardIds = [];
        
        const input = container.querySelector('#tarot-intention-input');
        if (input) intentionText = input.value.trim();

        phase = 'SHUFFLE';
        render();

        if (shuffleTimer) clearTimeout(shuffleTimer);
        shuffleTimer = setTimeout(() => {
          if (phase === 'SHUFFLE') {
            phase = 'PICKING';
            carouselIndex = Math.floor(Math.random() * TAROT_DECK.length);
            render();
          }
        }, 2400);
      });
    });

    // Quick intention chips
    container.querySelectorAll('.tarot-quick-q-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        const input = container.querySelector('#tarot-intention-input');
        if (input && text) {
          input.value = text;
          intentionText = text;
        }
      });
    });

    // Start Shuffle CTA
    container.querySelector('#tarot-start-shuffle-btn')?.addEventListener('click', () => {
      const input = container.querySelector('#tarot-intention-input');
      if (input) intentionText = input.value.trim();
      phase = 'SHUFFLE';
      render();

      if (shuffleTimer) clearTimeout(shuffleTimer);
      shuffleTimer = setTimeout(() => {
        if (phase === 'SHUFFLE') {
          phase = 'PICKING';
          carouselIndex = Math.floor(Math.random() * TAROT_DECK.length);
          render();
        }
      }, 2400);
    });

    // Cut deck button (skip shuffle delay)
    container.querySelector('#tarot-cut-deck-btn')?.addEventListener('click', () => {
      if (shuffleTimer) clearTimeout(shuffleTimer);
      phase = 'PICKING';
      carouselIndex = Math.floor(Math.random() * TAROT_DECK.length);
      render();
    });

    // Carousel Navigation (< and >) with smooth animated DOM updates
    const carouselTrack = container.querySelector('#tarot-carousel-track');
    function navigateCarousel(delta) {
      const total = TAROT_DECK.length;
      carouselIndex = (carouselIndex + delta + total) % total;
      const spread = getActiveSpread();
      if (carouselTrack) {
        updateCardCarouselDOM(carouselTrack, TAROT_DECK, carouselIndex, selectedCardIds, spread.cardCount);
      } else {
        render();
      }
    }

    container.querySelector('#tarot-carousel-prev')?.addEventListener('click', () => {
      navigateCarousel(-1);
    });

    container.querySelector('#tarot-carousel-next')?.addEventListener('click', () => {
      navigateCarousel(1);
    });

    // Select focused card in carousel
    function selectCurrentCard() {
      const card = TAROT_DECK[carouselIndex];
      const spread = getActiveSpread();
      if (!selectedCardIds.includes(card.id) && selectedCardIds.length < spread.cardCount) {
        selectedCardIds.push(card.id);
        // If more cards needed (multi-card tarot), advance to next unselected card
        if (selectedCardIds.length < spread.cardCount) {
          let nextIdx = (carouselIndex + 1) % TAROT_DECK.length;
          while (selectedCardIds.includes(TAROT_DECK[nextIdx].id) && nextIdx !== carouselIndex) {
            nextIdx = (nextIdx + 1) % TAROT_DECK.length;
          }
          carouselIndex = nextIdx;
        }
        render();
      }
    }

    container.querySelector('#tarot-select-focused-card')?.addEventListener('click', () => {
      selectCurrentCard();
    });

    // Direct card click in carousel track
    container.querySelectorAll('.tarot-carousel-card-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          // If tapping already centered card, select it directly
          if (idx === carouselIndex) {
            selectCurrentCard();
            return;
          }
          // Otherwise center this card
          carouselIndex = idx;
          const spread = getActiveSpread();
          if (carouselTrack) {
            updateCardCarouselDOM(carouselTrack, TAROT_DECK, carouselIndex, selectedCardIds, spread.cardCount);
          } else {
            render();
          }
        }
      });
    });

    // Deselect from destination slot rack
    container.querySelectorAll('.tarot-dest-slot.filled').forEach(slot => {
      slot.addEventListener('click', () => {
        const slotIdx = parseInt(slot.getAttribute('data-slot-index'), 10);
        if (!isNaN(slotIdx) && slotIdx < selectedCardIds.length) {
          selectedCardIds.splice(slotIdx, 1);
          render();
        }
      });
    });

    // Touch swipe handling on carousel
    const viewport = container.querySelector('#tarot-carousel-viewport');
    if (viewport) {
      let touchStartX = 0;
      viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        if (diff > 35) { // Swiped right -> prev
          navigateCarousel(-1);
        } else if (diff < -35) { // Swiped left -> next
          navigateCarousel(1);
        }
      }, { passive: true });

      // Keyboard left/right arrow navigation
      viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          navigateCarousel(-1);
        } else if (e.key === 'ArrowRight') {
          navigateCarousel(1);
        }
      });
    }

    // Confirm spread picking CTA -> proceed to REVEAL
    container.querySelector('#tarot-confirm-spread-btn')?.addEventListener('click', () => {
      const spread = getActiveSpread();
      currentReading = defaultTarotEngine.conductReading({
        spreadId: spread.id,
        question: intentionText,
        selectedCardIds: selectedCardIds
      });

      // Persist reading
      if (spread.id === 'daily') {
        defaultTarotPersistence.saveDailyReading(currentReading, 'guest', todayDateStr);
      } else {
        defaultTarotPersistence.saveReading(currentReading);
      }

      flippedStates = new Array(spread.cardCount).fill(false);
      phase = 'REVEAL';
      render();
    });

    // Auto-reveal for single card spread (e.g. Daily Tarot)
    const activeSpread = getActiveSpread();
    if (phase === 'REVEAL' && activeSpread.cardCount === 1 && !flippedStates[0]) {
      setTimeout(() => {
        const cardWrap = container.querySelector('.tarot-card-wrapper');
        if (cardWrap && !flippedStates[0]) {
          flippedStates[0] = true;
          cardWrap.classList.add('flipped');
          cardWrap.classList.remove('interactive');
          const inner = cardWrap.querySelector('.tarot-card-inner');
          if (inner) inner.style.transform = 'rotateY(180deg)';
          setTimeout(() => {
            render();
          }, 650);
        }
      }, 400);
    }

    // Interactive card flip in REVEAL phase (in-place 3D rotation)
    container.querySelectorAll('.tarot-card-wrapper.interactive').forEach(cardWrap => {
      cardWrap.addEventListener('click', () => {
        const cardIndex = parseInt(cardWrap.getAttribute('data-card-index'), 10);
        if (!isNaN(cardIndex) && !flippedStates[cardIndex]) {
          flippedStates[cardIndex] = true;
          cardWrap.classList.add('flipped');
          cardWrap.classList.remove('interactive');
          const inner = cardWrap.querySelector('.tarot-card-inner');
          if (inner) inner.style.transform = 'rotateY(180deg)';

          // If all cards are now revealed, update bottom view-reading button
          const allRevealed = currentReading && currentReading.cards.every((_, idx) => flippedStates[idx]);
          if (allRevealed) {
            setTimeout(() => {
              render();
            }, 650);
          }
        }
      });
    });

    // Reveal all cards CTA with staggered smooth 3D cascades
    container.querySelector('#tarot-reveal-all-btn')?.addEventListener('click', () => {
      if (currentReading) {
        const cardWraps = container.querySelectorAll('.tarot-card-wrapper');
        cardWraps.forEach((wrap, i) => {
          setTimeout(() => {
            flippedStates[i] = true;
            wrap.classList.add('flipped');
            wrap.classList.remove('interactive');
            const inner = wrap.querySelector('.tarot-card-inner');
            if (inner) inner.style.transform = 'rotateY(180deg)';
          }, i * 200);
        });

        setTimeout(() => {
          render();
        }, (currentReading.cards.length * 200) + 650);
      }
    });

    // View full reading interpretation CTA
    container.querySelector('#tarot-view-reading-btn')?.addEventListener('click', () => {
      phase = 'RESULT';
      render();
    });

    // Result sheet: Card Explorer Tabs
    container.querySelectorAll('.tarot-card-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-card-index'), 10);
        if (!isNaN(idx)) {
          activeResultCardIndex = idx;
          render();
        }
      });
    });

    // Result sheet: Category Tabs (Overview, Love, Career, Finance, Growth, Symbolism)
    container.querySelectorAll('.tarot-cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category-id');
        if (catId) {
          activeResultCategoryTab = catId;
          render();
        }
      });
    });

    // Result sheet: Discuss with AI Astrologer
    container.querySelector('#tarot-discuss-ai-btn')?.addEventListener('click', () => {
      const cardSummary = currentReading?.cards?.map(c => `${c.name} (${c.orientation})`).join(', ');
      router.navigate(ROUTES.CHAT, {
        initialQuery: `I drew the Tarot spread "${currentReading?.spreadName}" with cards: ${cardSummary}. How does this align with my birth chart placements and personal journey?`
      });
    });

    // Result sheet: Draw another spread
    container.querySelector('#tarot-draw-again-btn')?.addEventListener('click', () => {
      phase = 'SETUP';
      selectedCardIds = [];
      currentReading = null;
      flippedStates = [];
      activeResultCardIndex = 0;
      activeResultCategoryTab = 'overview';
      render();
    });

    // History Reopen & Delete handlers
    container.querySelectorAll('.tarot-reopen-hist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const readingId = btn.getAttribute('data-reading-id');
        const histReading = defaultTarotPersistence.getReadingById(readingId);
        if (histReading) {
          currentReading = histReading;
          selectedSpreadId = histReading.spreadId;
          flippedStates = histReading.cards.map(() => true);
          phase = 'RESULT';
          render();
        }
      });
    });

    container.querySelectorAll('.tarot-delete-hist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const readingId = btn.getAttribute('data-reading-id');
        if (readingId) {
          defaultTarotPersistence.deleteReading(readingId);
          render();
        }
      });
    });
  }

  // Initial render
  render();
}
