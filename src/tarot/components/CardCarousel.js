/**
 * Kai RegAI — CardCarousel Component
 * 
 * Interactive continuous 3D Cover Flow deck carousel:
 * - Real sliding track with translateX transitions (all cards visibly glide and move)
 * - Distinct card identities with Roman numerals, suit emblems, and gold canonical titles
 * - 3D depth, scale, and perspective rotation
 * - In-place DOM updates with GPU-accelerated transitions
 * - Touch swipe gesture support & direct card clicks
 */

const CARD_WIDTH = 130;
const CARD_HEIGHT = 206;
const CARD_SPACING = 110;

function getSuitIcon(suit) {
  if (!suit) return 'stars';
  const s = String(suit).toLowerCase();
  if (s === 'cups') return 'local_bar';
  if (s === 'swords') return 'colorize';
  if (s === 'wands') return 'flare';
  if (s === 'pentacles') return 'monetization_on';
  return 'auto_awesome';
}

function getSuitLabel(suit) {
  if (!suit) return 'MAJOR ARCANA';
  return suit.toUpperCase();
}

function getCardBadge(card) {
  if (card.roman) return card.roman;
  if (card.rank) {
    const r = String(card.rank).toUpperCase();
    if (r === 'PAGE') return 'P';
    if (r === 'KNIGHT') return 'Kn';
    if (r === 'QUEEN') return 'Q';
    if (r === 'KING') return 'K';
    if (r === 'ACE') return 'A';
    return r;
  }
  return '—';
}

function getCardTransformStyles(delta) {
  const absDelta = Math.abs(delta);
  if (delta === 0) {
    return {
      transform: 'scale(1.15) translateZ(80px) rotateY(0deg)',
      zIndex: 35,
      opacity: '1',
      visibility: 'visible'
    };
  } else if (absDelta <= 2) {
    const rot = delta > 0 ? -24 : 24;
    const scale = Math.max(0.74, 0.9 - absDelta * 0.09);
    const zOffset = -absDelta * 28;
    const opacity = absDelta === 1 ? 0.8 : 0.35;
    return {
      transform: `scale(${scale}) translateZ(${zOffset}px) rotateY(${rot}deg)`,
      zIndex: 30 - absDelta,
      opacity: String(opacity),
      visibility: 'visible'
    };
  } else {
    return {
      transform: 'scale(0.6) translateZ(-150px) rotateY(45deg)',
      zIndex: 1,
      opacity: '0',
      visibility: 'hidden'
    };
  }
}

export function renderCardCarousel({
  deck,
  currentIndex = 0,
  selectedCardIds = [],
  spread,
  maxSelect = 1
} = {}) {
  const cards = deck || [];
  const total = cards.length;
  if (total === 0) return '';

  const activeCard = cards[currentIndex] || cards[0];
  const isAlreadySelected = selectedCardIds.includes(activeCard.id);
  const remaining = Math.max(0, maxSelect - selectedCardIds.length);

  return `
    <div class="tarot-carousel-root" style="width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; user-select: none;">
      
      <!-- Focused Card Title Badge Banner -->
      <div id="tarot-focused-card-banner" style="margin-bottom: 8px; text-align: center; height: 26px;">
        <span style="font-family: var(--font-display, 'Cinzel', serif); font-size: 11.5px; font-weight: 700; color: #fef08a; background: rgba(17, 22, 56, 0.85); border: 1.5px solid rgba(214, 173, 104, 0.5); border-radius: 9999px; padding: 5px 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.05em; text-transform: uppercase;">
          <span class="material-symbols-outlined" style="font-size: 15px; color: #d6ad68;">auto_awesome</span>
          <span>Draw with Intuition</span>
          <span class="material-symbols-outlined" style="font-size: 14px; color: #d6ad68;">expand_more</span>
        </span>
      </div>

      <!-- Carousel 3D Stage -->
      <div 
        id="tarot-carousel-viewport" 
        class="tarot-carousel-viewport"
        tabindex="0"
        aria-label="Tarot Deck Carousel. Use left and right arrow keys to browse."
        style="width: 100%; height: 270px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; perspective: 1200px; -webkit-perspective: 1200px; touch-action: pan-y;"
      >
        <!-- Nav Arrow Left -->
        <button 
          id="tarot-carousel-prev" 
          class="tarot-carousel-nav-btn left"
          type="button"
          aria-label="Previous Card"
          style="position: absolute; left: 10px; z-index: 50; width: 44px; height: 44px; border-radius: 9999px; background: rgba(17, 22, 56, 0.92); border: 1.5px solid rgba(214, 173, 104, 0.7); color: #d6ad68; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.7); backdrop-filter: blur(10px); transition: transform 0.15s, background 0.2s;"
        >
          <span class="material-symbols-outlined" style="font-size: 22px;">arrow_back_ios_new</span>
        </button>

        <!-- Continuous Sliding Track -->
        <div 
          id="tarot-carousel-track" 
          class="tarot-carousel-track" 
          style="position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1); transform: translateX(${-currentIndex * CARD_SPACING}px);"
        >
          ${cards.map((card, idx) => {
            const isSelected = selectedCardIds.includes(card.id);
            const delta = idx - currentIndex;
            const isCenter = delta === 0;
            const styles = getCardTransformStyles(delta);

            return `
              <div 
                class="tarot-carousel-card-item ${isCenter ? 'center-card' : ''} ${isSelected ? 'selected-card' : ''}" 
                data-index="${idx}"
                data-card-id="${card.id}"
                style="position: absolute; left: ${idx * CARD_SPACING - (CARD_WIDTH / 2)}px; top: ${-(CARD_HEIGHT / 2) - 10}px; width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px; border-radius: 14px; transform: ${styles.transform}; z-index: ${styles.zIndex}; opacity: ${styles.opacity}; visibility: ${styles.visibility}; transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease, filter 0.3s ease; cursor: pointer; transform-style: preserve-3d; -webkit-transform-style: preserve-3d;"
              >
                <!-- Pristine Celestial Card Back Frame (No Spoilers) -->
                <div style="width: 100%; height: 100%; border-radius: 14px; border: 1.5px solid ${isCenter ? '#d6ad68' : 'rgba(214, 173, 104, 0.45)'}; box-shadow: ${isCenter ? '0 14px 34px rgba(0, 0, 0, 0.9), 0 0 32px rgba(214, 173, 104, 0.7), 0 0 55px rgba(202, 160, 85, 0.35)' : '0 6px 18px rgba(0,0,0,0.6)'}; overflow: hidden; position: relative; background: #070b24;">
                  <img 
                    src="/assets/tarot/card_back.jpg" 
                    alt="Tarot Card Back" 
                    style="width: 100%; height: 100%; object-fit: fill; display: block; border-radius: 12px;"
                  />

                  <!-- Selected Badge Overlay (Dark and Golden) -->
                  ${isSelected ? `
                    <div class="selected-badge-overlay" style="position: absolute; inset: 0; background: rgba(7, 11, 32, 0.88); backdrop-filter: blur(3px); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 14px; border: 2px solid #d6ad68; box-shadow: 0 0 20px rgba(214, 173, 104, 0.6); z-index: 20;">
                      <span class="material-symbols-outlined" style="font-size: 28px; color: #fef08a;">check_circle</span>
                      <span style="font-size: 9.5px; font-weight: 800; color: #d6ad68; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Selected</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Radiant Concentric Light Pedestal Beneath Center Card (Pure CSS, No card artifacts) -->
        <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 260px; height: 50px; pointer-events: none; z-index: 10; display: flex; align-items: center; justify-content: center;">
          <div style="width: 220px; height: 26px; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.45) 0%, rgba(214, 173, 104, 0.2) 45%, rgba(7, 11, 34, 0) 75%); filter: blur(3px); box-shadow: 0 0 28px rgba(251, 191, 36, 0.35);"></div>
        </div>

        <!-- Nav Arrow Right -->
        <button 
          id="tarot-carousel-next" 
          class="tarot-carousel-nav-btn right"
          type="button"
          aria-label="Next Card"
          style="position: absolute; right: 10px; z-index: 50; width: 44px; height: 44px; border-radius: 9999px; background: rgba(17, 22, 56, 0.92); border: 1.5px solid rgba(214, 173, 104, 0.7); color: #d6ad68; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.7); backdrop-filter: blur(10px); transition: transform 0.15s, background 0.2s;"
        >
          <span class="material-symbols-outlined" style="font-size: 22px;">arrow_forward_ios</span>
        </button>
      </div>

      <!-- Card Index, Dot Pagination & Browse Controls matching Screenshot 2 -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 92%; margin-top: 8px;">
        <span id="tarot-carousel-counter" style="font-size: 11px; color: #c5c5db; font-family: monospace;">
          Card ${currentIndex + 1} of ${total}
        </span>
        
        <!-- 7 Dot Pagination Indicators with Gold Center Dot Indicator -->
        <div id="tarot-carousel-dots" style="display: flex; gap: 5px; align-items: center;">
          ${Array.from({ length: 7 }, (_, i) => {
            const activeDotIdx = Math.min(6, Math.floor((currentIndex / total) * 7));
            const isActive = i === activeDotIdx;
            return `
              <div 
                class="carousel-dot ${isActive ? 'active' : ''}" 
                style="width: ${isActive ? '8px' : '5px'}; height: ${isActive ? '8px' : '5px'}; border-radius: 9999px; background: ${isActive ? '#d6ad68' : 'rgba(214, 173, 104, 0.3)'}; box-shadow: ${isActive ? '0 0 8px rgba(214, 173, 104, 0.8)' : 'none'}; transition: all 0.2s;"
              ></div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; gap: 4px; align-items: center;">
          <span id="tarot-carousel-remaining-text" style="font-size: 10.5px; color: #d6ad68; font-weight: 700;">
            ${remaining > 0 ? `Select ${remaining} more card${remaining > 1 ? 's' : ''}` : '✦ All cards chosen'}
          </span>
        </div>
      </div>

      <!-- Radiant Golden Pill Select CTA matching Screenshot 2 -->
      <button 
        id="tarot-select-focused-card" 
        type="button" 
        data-card-id="${activeCard.id}"
        ${isAlreadySelected || remaining === 0 ? 'disabled' : ''}
        style="width: 92%; max-width: 380px; margin-top: 14px; padding: 13px 22px; border-radius: 9999px; border: 1.5px solid #fef08a; background: linear-gradient(135deg, #f7df94 0%, #d6ad68 50%, #caa055 100%); color: #070d2d; font-family: var(--font-display, 'Cinzel', serif); font-size: 13px; font-weight: 800; letter-spacing: 0.08em; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(214, 173, 104, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.6); cursor: ${isAlreadySelected || remaining === 0 ? 'not-allowed' : 'pointer'}; opacity: ${isAlreadySelected || remaining === 0 ? '0.45' : '1'}; transition: all 0.2s ease;"
      >
        <span class="material-symbols-outlined" style="font-size: 19px; font-weight: bold;">
          ${isAlreadySelected ? 'check_circle' : 'touch_app'}
        </span>
        <span id="tarot-select-btn-label">
          ${isAlreadySelected ? 'CARD ALREADY PICKED' : remaining === 0 ? 'SLOTS FULL' : 'SELECT THIS CARD'}
        </span>
        <span class="material-symbols-outlined" style="font-size: 16px; font-weight: bold;">arrow_forward</span>
      </button>
    </div>
  `;
}

/**
 * Updates existing carousel track in-place with continuous 3D sliding transitions
 */
export function updateCardCarouselDOM(trackContainer, deck, newIndex, selectedCardIds, maxSelect = 1) {
  if (!trackContainer) return;
  const cards = deck || [];
  const total = cards.length;
  if (total === 0) return;

  // 1. Physically slide the entire continuous track across screen
  trackContainer.style.transform = `translateX(${-newIndex * CARD_SPACING}px)`;

  // 2. Update transforms for all visible cards in the active window
  const minIdx = Math.max(0, newIndex - 5);
  const maxIdx = Math.min(total - 1, newIndex + 5);

  const cardElements = trackContainer.querySelectorAll('.tarot-carousel-card-item');
  cardElements.forEach(el => {
    const idx = parseInt(el.getAttribute('data-index'), 10);
    const card = cards[idx];
    if (!card) return;

    const delta = idx - newIndex;
    const styles = getCardTransformStyles(delta);
    const isSelected = selectedCardIds.includes(card.id);
    const isCenter = delta === 0;

    el.style.transform = styles.transform;
    el.style.zIndex = styles.zIndex;
    el.style.opacity = styles.opacity;
    el.style.visibility = styles.visibility;

    if (isCenter) {
      el.classList.add('center-card');
      const cardFrame = el.querySelector('div');
      if (cardFrame) {
        cardFrame.style.borderColor = '#d6ad68';
        cardFrame.style.boxShadow = '0 14px 34px rgba(0, 0, 0, 0.9), 0 0 32px rgba(214, 173, 104, 0.7), 0 0 55px rgba(202, 160, 85, 0.35)';
      }
    } else {
      el.classList.remove('center-card');
      const cardFrame = el.querySelector('div');
      if (cardFrame) {
        cardFrame.style.borderColor = 'rgba(214, 173, 104, 0.45)';
        cardFrame.style.boxShadow = '0 6px 18px rgba(0,0,0,0.6)';
      }
    }

    // Selected badge sync (Dark and Golden)
    if (isSelected) {
      el.classList.add('selected-card');
      if (!el.querySelector('.selected-badge-overlay')) {
        const badge = document.createElement('div');
        badge.className = 'selected-badge-overlay';
        badge.style.cssText = 'position: absolute; inset: 0; background: rgba(7, 11, 32, 0.88); backdrop-filter: blur(3px); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 14px; border: 2px solid #d6ad68; box-shadow: 0 0 20px rgba(214, 173, 104, 0.6); z-index: 20;';
        badge.innerHTML = '<span class="material-symbols-outlined" style="font-size: 28px; color: #fef08a;">check_circle</span><span style="font-size: 9.5px; font-weight: 800; color: #d6ad68; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Selected</span>';
        el.querySelector('div').appendChild(badge);
      }
    } else {
      el.classList.remove('selected-card');
      const badge = el.querySelector('.selected-badge-overlay');
      if (badge) badge.remove();
    }
  });

  // 3. Keep banner anonymous during card picking (Dark and Golden)
  const bannerEl = document.getElementById('tarot-focused-card-banner');
  if (bannerEl) {
    bannerEl.innerHTML = `
      <span style="font-family: var(--font-display, 'Cinzel', serif); font-size: 11.5px; font-weight: 700; color: #fef08a; background: rgba(17, 22, 56, 0.85); border: 1.5px solid rgba(214, 173, 104, 0.5); border-radius: 9999px; padding: 5px 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.05em; text-transform: uppercase;">
        <span class="material-symbols-outlined" style="font-size: 15px; color: #d6ad68;">auto_awesome</span>
        <span>Draw with Intuition</span>
        <span class="material-symbols-outlined" style="font-size: 14px; color: #d6ad68;">expand_more</span>
      </span>
    `;
  }

  // 4. Update counter, pagination dots, and remaining text
  const counterEl = document.getElementById('tarot-carousel-counter');
  if (counterEl) counterEl.textContent = `Card ${newIndex + 1} of ${total}`;

  const dotsContainer = document.getElementById('tarot-carousel-dots');
  if (dotsContainer) {
    const activeDotIdx = Math.min(6, Math.floor((newIndex / total) * 7));
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      const isActive = i === activeDotIdx;
      dot.className = `carousel-dot ${isActive ? 'active' : ''}`;
      dot.style.width = isActive ? '8px' : '5px';
      dot.style.height = isActive ? '8px' : '5px';
      dot.style.background = isActive ? '#d6ad68' : 'rgba(214, 173, 104, 0.3)';
      dot.style.boxShadow = isActive ? '0 0 8px rgba(214, 173, 104, 0.8)' : 'none';
    });
  }

  const remaining = Math.max(0, maxSelect - selectedCardIds.length);
  const remainingText = document.getElementById('tarot-carousel-remaining-text');
  if (remainingText) {
    remainingText.textContent = remaining > 0 ? `Select ${remaining} more card${remaining > 1 ? 's' : ''}` : '✦ All cards chosen';
  }

  // 5. Update select CTA button
  const activeCard = cards[newIndex] || cards[0];
  const isAlreadySelected = selectedCardIds.includes(activeCard.id);
  const selectBtn = document.getElementById('tarot-select-focused-card');
  const labelEl = document.getElementById('tarot-select-btn-label');

  if (selectBtn && labelEl) {
    selectBtn.setAttribute('data-card-id', activeCard.id);
    const iconEl = selectBtn.querySelector('.material-symbols-outlined');
    if (isAlreadySelected) {
      selectBtn.disabled = true;
      selectBtn.style.opacity = '0.45';
      selectBtn.style.cursor = 'not-allowed';
      selectBtn.style.pointerEvents = 'none';
      labelEl.textContent = 'CARD ALREADY PICKED';
      if (iconEl) iconEl.textContent = 'check_circle';
    } else if (remaining === 0) {
      selectBtn.disabled = true;
      selectBtn.style.opacity = '0.45';
      selectBtn.style.cursor = 'not-allowed';
      selectBtn.style.pointerEvents = 'none';
      labelEl.textContent = 'SLOTS FULL';
      if (iconEl) iconEl.textContent = 'lock';
    } else {
      selectBtn.disabled = false;
      selectBtn.style.opacity = '1';
      selectBtn.style.cursor = 'pointer';
      selectBtn.style.pointerEvents = 'auto';
      labelEl.textContent = 'SELECT THIS CARD';
      if (iconEl) iconEl.textContent = 'touch_app';
    }
  }
}

