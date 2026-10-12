/**
 * Kai RegAI — TarotResultSheet Component
 * 
 * Deep post-reveal reading interpretation redesigned to match Reference 4 (media_1791539893865.jpg):
 * - Two-column hero: Standing upright glowing card on left, 3 glass badges (Astrological Link, Cosmic Context & Hasta Samudrika Convergence, Core Theme) on right
 * - Interactive card selector tabs for multi-card spreads
 * - Horizontal luxury category tabs (Overview, Love, Career, Finances, Personal Growth)
 * - Detailed Interpretation card with sacred star medallion
 * - "What This Means For You Today" card with lightbulb medallion
 * - 2-Column Key Insights & Mindful Action grid
 * - Ethical reflection disclaimer
 * - Radiant golden pill CTA: "Draw Another Spread"
 */

export function renderTarotResultSheet({
  reading,
  activeCardIndex = 0,
  activeCategoryTab = 'overview'
} = {}) {
  if (!reading || !reading.cards || reading.cards.length === 0) return '';

  const { spreadName, formattedDate, cards, synthesis, disclaimer } = reading;
  const isMultiCard = cards.length > 1;
  const selectedCard = cards[activeCardIndex] || cards[0];
  const cardData = selectedCard.card || selectedCard;

  // Roman numeral / rank label
  const romanLabel = cardData.roman || getRankLabel(cardData);
  const imageSrc = cardData.image || `/assets/tarot/cards/${cardData.id}.jpg`;
  const isReversed = selectedCard.isReversed;

  // Key theme and subtitle
  const rawKeywords = isReversed 
    ? (cardData.keywordsReversed || cardData.keywords || [])
    : (cardData.keywordsUpright || cardData.keywords || []);
  const keywordsList = Array.isArray(rawKeywords) ? rawKeywords : [];
  const coreThemeStr = keywordsList.slice(0, 2).join(' • ') || 'Sacred Guidance & Inner Mirror';
  const subThemeStr = keywordsList[2] || (isReversed ? 'Inverted Perspective' : 'Upright Archetype');

  // Interpretive Category Content
  const categories = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: 'visibility', 
      text: selectedCard.meaning || 'A powerful archetype aligning with your current energetic cycle, urging contemplative clarity and intentional steps forward.'
    },
    { 
      id: 'love', 
      label: 'Love', 
      icon: 'favorite', 
      text: cardData.loveMeaning || 'Nurture mutual understanding, honesty, and emotional safety in all relationship dynamics without expecting perfection.'
    },
    { 
      id: 'career', 
      label: 'Career', 
      icon: 'work', 
      text: cardData.careerMeaning || 'Focus on strategic craftsmanship, ethical diligence, and grounded vocational purpose rather than fleeting acclaim.'
    },
    { 
      id: 'finances', 
      label: 'Finances', 
      icon: 'account_balance_wallet', 
      text: cardData.financeMeaning || 'Practice disciplined stewardship, avoid impulsive expenditures, and build lasting peace through measured reserves.'
    },
    { 
      id: 'growth', 
      label: 'Personal Growth', 
      icon: 'psychology', 
      text: cardData.personalGrowthMeaning || 'Embrace conscious self-awareness; release outworn fears to welcome deeper spiritual and cognitive alignment.'
    }
  ];

  const activeCategory = categories.find(c => c.id === activeCategoryTab) || categories[0];

  // Dynamic Key Insights
  const insightsList = [
    keywordsList[0] ? `A period to acknowledge ${keywordsList[0].toLowerCase()}` : 'Honor your current emotional climate',
    keywordsList[1] ? `Cultivate awareness around ${keywordsList[1].toLowerCase()}` : 'Do not isolate yourself during moments of trial',
    'Support and inner resources remain fully available',
    'Resilience and wisdom continue to deepen through mindful action'
  ];

  return `
    <div class="tarot-result-sheet" style="display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 500px; margin: 0 auto; padding-bottom: 24px;">
      
      <!-- Multi-Card Selector Tabs (if multi-card spread) -->
      ${isMultiCard ? `
        <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10.5px; font-weight: 700; color: #d6ad68; letter-spacing: 0.08em; text-transform: uppercase;">
              Cards in Spread (${cards.length})
            </span>
            <span style="font-size: 9.5px; color: #c5c5db;">Tap to inspect card</span>
          </div>

          <div class="tarot-card-tabs" style="display: flex; gap: 8px; overflow-x: auto; padding: 2px 0;">
            ${cards.map((c, i) => {
              const isSelected = i === activeCardIndex;
              return `
                <button 
                  class="tarot-card-tab-btn ${isSelected ? 'active' : ''}" 
                  type="button" 
                  data-card-index="${i}"
                  style="flex: 1; min-width: 85px; padding: 7px 10px; border-radius: 12px; cursor: pointer; text-align: left; background: ${isSelected ? 'rgba(214, 173, 104, 0.2)' : 'rgba(8, 12, 38, 0.75)'}; border: 1.5px solid ${isSelected ? '#d6ad68' : 'rgba(214, 173, 104, 0.25)'}; color: #f7f5ff; transition: all 0.2s;"
                >
                  <div style="font-size: 8.5px; color: ${isSelected ? '#d6ad68' : '#c5c5db'}; font-weight: 700; text-transform: uppercase;">
                    ${c.positionName || `Card ${i + 1}`}
                  </div>
                  <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: 10.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                    ${c.name}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Two-Column Hero Row matching Screenshot 4 Reference -->
      <div style="display: flex; gap: 14px; width: 100%; align-items: flex-start; margin-top: 4px;">
        
        <!-- Left Column: Upright Glowing Card Frame (Dark & Golden) -->
        <div style="flex-shrink: 0; width: 140px; height: 226px; border-radius: 14px; border: 1.5px solid #d6ad68; box-shadow: 0 10px 30px rgba(0,0,0,0.9), 0 0 28px rgba(214, 173, 104, 0.7), 0 0 45px rgba(202, 160, 85, 0.35); overflow: hidden; position: relative; background: #070b24;">
          <!-- Card Image -->
          <img 
            src="${imageSrc}" 
            alt="${selectedCard.name}" 
            style="width: 100%; height: 100%; object-fit: fill; display: block; transform: ${isReversed ? 'rotate(180deg)' : 'none'};" 
            onerror="this.style.opacity='0.25';"
          />

          <!-- Top-Left Roman Numeral Badge Box -->
          <div style="position: absolute; top: 6px; left: 6px; z-index: 10;">
            <span style="font-family: var(--font-display, 'Cinzel', serif); font-size: 11px; font-weight: 800; color: #d6ad68; background: rgba(7, 11, 32, 0.9); border: 1px solid rgba(214, 173, 104, 0.5); padding: 2px 7px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
              ${romanLabel}
            </span>
          </div>

          <!-- Bottom Title & Keywords Scrim Overlay -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(7, 13, 45, 0.98) 0%, rgba(7, 13, 45, 0.75) 60%, transparent 100%); padding: 18px 6px 6px; text-align: center; z-index: 10;">
            <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: 10px; font-weight: 800; color: #f7f5ff; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 2px 4px rgba(0,0,0,0.95);">
              ${selectedCard.name}
            </div>
            <div style="font-size: 7.5px; color: #d6ad68; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${coreThemeStr}
            </div>
          </div>
        </div>

        <!-- Right Column: Title, Orientation, and 3 Glass Badges -->
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;">
          
          <!-- Top Row: Spread Pill & Date -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 9.5px; font-weight: 700; color: #d6ad68; background: rgba(214, 173, 104, 0.15); border: 1px solid rgba(214, 173, 104, 0.4); padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="font-size: 13px;">wb_sunny</span>
              <span>${spreadName}</span>
            </span>
            <span style="font-size: 9px; color: #c5c5db;">${formattedDate || 'Today'}</span>
          </div>

          <!-- Card Name & Orientation Pill -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 2px;">
            <h4 style="font-family: var(--font-display, 'Cinzel', serif); font-size: 14.5px; font-weight: 800; color: #f7f5ff; margin: 0; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${selectedCard.name}
            </h4>
            <span style="font-size: 8.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; padding: 2px 7px; border-radius: 9999px; background: ${isReversed ? 'rgba(244, 63, 94, 0.18)' : 'rgba(16, 185, 129, 0.18)'}; border: 1px solid ${isReversed ? '#f43f5e' : '#10b981'}; color: ${isReversed ? '#f43f5e' : '#34d399'}; box-shadow: 0 0 10px ${isReversed ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}; flex-shrink: 0;">
              ${selectedCard.orientation}
            </span>
          </div>

          <!-- Subtitle Divider -->
          <div style="font-size: 9.5px; color: #d6ad68; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <span>Daily Archetype</span>
            <span style="opacity: 0.5;">✦ ——— ✦</span>
          </div>

          <!-- 3 Rounded Glass Badges matching Screenshot 4 -->
          
          <!-- 1. Astrological Link -->
          <div style="background: rgba(17, 22, 56, 0.75); border: 1px solid rgba(214, 173, 104, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; border-radius: 9999px; background: rgba(214, 173, 104, 0.12); border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 15px; color: #d6ad68;">public</span>
            </div>
            <div style="text-align: left; min-width: 0;">
              <div style="font-size: 9px; font-weight: 700; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.04em;">
                Astrological Link
              </div>
              <div style="font-size: 9.5px; color: #f7f5ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${selectedCard.astrologyRuler || cardData.astrology || 'Mercury in Taurus'}
              </div>
            </div>
          </div>

          <!-- 2. Cosmic Context & Hasta Samudrika Convergence -->
          <div style="background: rgba(17, 22, 56, 0.75); border: 1px solid rgba(214, 173, 104, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; border-radius: 9999px; background: rgba(214, 173, 104, 0.12); border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 15px; color: #d6ad68;">change_history</span>
            </div>
            <div style="text-align: left; min-width: 0;">
              <div style="font-size: 9px; font-weight: 700; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.04em;">
                Cosmic Context • Hasta Samudrika Convergence
              </div>
              <div style="font-size: 9.5px; color: #f7f5ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${selectedCard.palmistryCorrespondence || 'Plain of Mars & Mount of Saturn'}
              </div>
              <div style="font-size: 8px; color: #c5c5db; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${cardData.palmistrySynthesis || 'Temporary Poverty Island & Cold Trial'}
              </div>
            </div>
          </div>

          <!-- 3. Core Theme -->
          <div style="background: rgba(17, 22, 56, 0.75); border: 1px solid rgba(214, 173, 104, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; border-radius: 9999px; background: rgba(214, 173, 104, 0.12); border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 15px; color: #d6ad68;">spa</span>
            </div>
            <div style="text-align: left; min-width: 0;">
              <div style="font-size: 9px; font-weight: 700; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.04em;">
                Core Theme
              </div>
              <div style="font-size: 9.5px; color: #f7f5ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${coreThemeStr}
              </div>
              <div style="font-size: 8px; color: #c5c5db; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${subThemeStr}
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Category Filter Tabs matching Screenshot 4 -->
      <div class="tarot-category-tabs" style="display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; margin-top: 6px; -webkit-overflow-scrolling: touch;">
        ${categories.map(cat => {
          const isTabActive = cat.id === activeCategoryTab;
          return `
            <button 
              class="tarot-cat-tab-btn ${isTabActive ? 'active' : ''}" 
              type="button" 
              data-category-id="${cat.id}"
              style="padding: 7px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; border: ${isTabActive ? '1px solid #d6ad68' : '1px solid rgba(214, 173, 104, 0.3)'}; background: ${isTabActive ? 'linear-gradient(135deg, #f7df94 0%, #caa055 100%)' : 'rgba(17, 22, 56, 0.75)'}; color: ${isTabActive ? '#070d2d' : '#f7f5ff'}; box-shadow: ${isTabActive ? '0 2px 10px rgba(214, 173, 104, 0.4)' : 'none'}; transition: all 0.2s;"
            >
              <span class="material-symbols-outlined" style="font-size: 15px; color: ${isTabActive ? '#070d2d' : '#d6ad68'};">${cat.icon}</span>
              <span>${cat.label}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Detailed Interpretation Card matching Screenshot 4 -->
      <div style="background: rgba(17, 22, 56, 0.85); border: 1.5px solid rgba(214, 173, 104, 0.4); border-radius: 16px; padding: 14px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 9999px; background: rgba(214, 173, 104, 0.15); border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 17px; color: #fef08a;">auto_awesome</span>
          </div>
          <span style="font-family: var(--font-display, 'Cinzel', serif); font-size: 12px; font-weight: 800; color: #f7f5ff; letter-spacing: 0.06em; text-transform: uppercase;">
            Detailed Interpretation ✦
          </span>
        </div>
        <p style="font-size: 11.5px; color: #c5c5db; line-height: 1.55; margin: 0;">
          ${activeCategory.text || selectedCard.meaning}
        </p>
      </div>

      <!-- What This Means For You Today Card matching Screenshot 4 -->
      <div style="background: rgba(17, 22, 56, 0.85); border: 1.5px solid rgba(214, 173, 104, 0.4); border-radius: 16px; padding: 14px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 9999px; background: rgba(214, 173, 104, 0.15); border: 1px solid rgba(214, 173, 104, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 17px; color: #fef08a;">lightbulb</span>
          </div>
          <span style="font-family: var(--font-display, 'Cinzel', serif); font-size: 12px; font-weight: 800; color: #f7f5ff; letter-spacing: 0.06em; text-transform: uppercase;">
            What This Means For You Today
          </span>
        </div>
        <p style="font-size: 11.5px; color: #c5c5db; line-height: 1.55; margin: 0;">
          ${synthesis?.narrative || 'Take time to pause and reflect before taking decisive action. Acknowledge your innate resilience, seek wise counsel when appropriate, and trust the evolutionary rhythm of your path.'}
        </p>
      </div>

      <!-- 2-Column Grid: Key Insights & Mindful Action matching Screenshot 4 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <!-- Left: Key Insights -->
        <div style="background: rgba(17, 22, 56, 0.85); border: 1px solid rgba(214, 173, 104, 0.35); border-radius: 14px; padding: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: #d6ad68;">key</span>
            <span style="font-size: 10px; font-weight: 800; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.05em;">
              Key Insights
            </span>
          </div>
          <ul style="margin: 0; padding-left: 14px; font-size: 10px; color: #c5c5db; line-height: 1.45;">
            ${insightsList.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
          </ul>
        </div>

        <!-- Right: Mindful Action -->
        <div style="background: rgba(17, 22, 56, 0.85); border: 1px solid rgba(214, 173, 104, 0.35); border-radius: 14px; padding: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: #10b981;">nature</span>
            <span style="font-size: 10px; font-weight: 800; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.05em;">
              Mindful Action
            </span>
          </div>
          <p style="font-size: 10px; color: #c5c5db; line-height: 1.45; margin: 0;">
            ${cardData.guidanceUpaya || 'Reach out to a trusted mentor, counselor, or friend and speak candidly about your current challenge without shame or self-judgment.'}
          </p>
        </div>
      </div>

      <!-- Ethical Guidance & Disclaimer -->
      <div style="padding: 10px 14px; background: rgba(7, 13, 45, 0.65); border-radius: 12px; border: 1px solid rgba(214, 173, 104, 0.25); display: flex; align-items: center; gap: 10px;">
        <span class="material-symbols-outlined" style="font-size: 18px; color: #94a3b8; flex-shrink: 0;">shield</span>
        <p style="font-size: 9.5px; color: #94a3b8; line-height: 1.4; margin: 0;">
          ${disclaimer || 'Tarot readings are intended for reflection and personal insight. They are not guarantees of future events and should not replace professional medical, financial, legal, or psychological advice.'}
        </p>
      </div>

      <!-- Bottom Action CTA: Draw Another Spread matching Screenshot 4 -->
      <div style="width: 100%; display: flex; justify-content: center; margin-top: 6px;">
        <button 
          id="tarot-draw-again-btn" 
          type="button" 
          style="width: 100%; max-width: 380px; padding: 14px 24px; border-radius: 9999px; border: 1.5px solid #fef08a; background: linear-gradient(135deg, #f7df94 0%, #d6ad68 50%, #caa055 100%); color: #070d2d; font-family: var(--font-display, 'Cinzel', serif); font-size: 13.5px; font-weight: 800; letter-spacing: 0.08em; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 22px rgba(214, 173, 104, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6); cursor: pointer; transition: all 0.2s ease;"
        >
          <span class="material-symbols-outlined" style="font-size: 20px; font-weight: bold;">auto_stories</span>
          <span>DRAW ANOTHER SPREAD</span>
          <span class="material-symbols-outlined" style="font-size: 18px; font-weight: bold;">arrow_forward</span>
        </button>
      </div>

    </div>
  `;
}

function getRankLabel(card) {
  if (!card) return '—';
  if (card.roman) return card.roman;
  const rank = String(card.rank || '').toLowerCase();
  const map = {
    ace: 'A',
    page: 'P',
    knight: 'Kn',
    queen: 'Q',
    king: 'K'
  };
  return map[rank] || card.rank || '—';
}
