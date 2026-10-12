/**
 * Kai RegAI — TarotCardView Component
 * 
 * Renders an authentic 3D flippable Tarot card:
 * - Real 1909 Rider–Waite–Smith historical illustrations displayed full-frame
 * - Ornate gold-foiled card back with symmetric celestial mandala and Kai RegAI branding
 * - Roman numeral & Upright/Reversed badges with glassmorphic backing
 * - Dark scrim gradient with elegant golden canonical title typography
 * - Realistic 3D rotation (`transform: rotateY(180deg)`) with golden aura glow
 * - Inverted artwork orientation when reversed (`transform: rotate(180deg)`)
 */

export function renderTarotCardView({
  card,
  isFlipped = false,
  isReversed = false,
  positionName = '',
  positionSubtitle = '',
  size = 'medium', // 'small' | 'medium' | 'large'
  interactive = true,
  cardIndex = 0
} = {}) {
  const cardId = card ? card.id : `card-slot-${cardIndex}`;
  
  // Dimensions matching standard Tarot proportion (approx 1 : 1.58)
  const dims = {
    small: { w: '96px', h: '152px', fontTitle: '9px', fontNum: '9.5px' },
    medium: { w: '136px', h: '214px', fontTitle: '11px', fontNum: '11px' },
    large: { w: '184px', h: '290px', fontTitle: '13.5px', fontNum: '13px' }
  }[size] || { w: '136px', h: '214px', fontTitle: '11px', fontNum: '11px' };

  const romanLabel = card ? (card.roman || card.card?.roman || getRankLabel(card)) : '—';
  const imageSrc = card?.image || card?.card?.image || (card?.id ? `/assets/tarot/cards/${card.id}.jpg` : (card?.card?.id ? `/assets/tarot/cards/${card.card.id}.jpg` : ''));
  const cardName = card?.name || card?.card?.name || 'Tarot Card';

  const rawKeywords = isReversed 
    ? (card?.keywordsReversed || card?.card?.keywordsReversed || card?.keywords || [])
    : (card?.keywordsUpright || card?.card?.keywordsUpright || card?.keywords || []);
  const keywordsList = Array.isArray(rawKeywords) ? rawKeywords : [];

  return `
    <div 
      class="tarot-card-wrapper ${isFlipped ? 'flipped' : ''} ${interactive ? 'interactive' : ''}" 
      data-card-id="${cardId}"
      data-card-index="${cardIndex}"
      style="width: ${dims.w}; height: ${dims.h}; perspective: 1200px; display: inline-block; user-select: none; margin: 4px; vertical-align: middle;"
    >
      <div 
        class="tarot-card-inner" 
        style="width: 100%; height: 100%; position: relative; -webkit-transform-style: preserve-3d; transform-style: preserve-3d; transition: transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: ${interactive ? 'pointer' : 'default'}; -webkit-transform: ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}; transform: ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};"
      >
        <!-- CARD BACK (Face Down - Celestial Sun & Moon Reference Design) -->
        <div 
          class="tarot-card-back" 
          style="position: absolute; inset: 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 14px; background: #070d2d; border: 1.5px solid rgba(214, 173, 104, 0.7); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(139, 92, 246, 0.25); overflow: hidden; display: flex; align-items: center; justify-content: center;"
        >
          <img 
            src="/assets/tarot/card_back.jpg" 
            alt="Tarot Card Back" 
            style="width: 100%; height: 100%; object-fit: fill; display: block; border-radius: 12px;"
          />
        </div>

        <!-- CARD FRONT (Face Up, Revealed Real Artwork) -->
        <div 
          class="tarot-card-front" 
          style="position: absolute; inset: 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; -webkit-transform: rotateY(180deg); transform: rotateY(180deg); border-radius: 14px; background: #070d2d; border: 1.5px solid rgba(214, 173, 104, 0.75); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 92, 246, 0.35); overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;"
        >
          <!-- Actual Authentic Rider-Waite Illustration Image -->
          <div style="position: absolute; inset: 0; overflow: hidden; border-radius: 12px; background: #0b0f2a;">
            <img 
              src="${imageSrc}" 
              alt="${cardName}"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: fill; display: block; transform: ${isReversed ? 'rotate(180deg)' : 'none'}; transition: transform 0.4s ease;"
              onerror="this.style.opacity='0.2';"
            />
          </div>

          <!-- Top Header Overlay Badges -->
          <div style="position: absolute; top: 5px; left: 5px; right: 5px; display: flex; justify-content: space-between; align-items: center; z-index: 5;">
            <span style="font-family: var(--font-display, 'Cinzel', serif); font-size: ${dims.fontNum}; font-weight: 800; color: #d6ad68; background: rgba(7, 13, 45, 0.88); padding: 1px 6px; border-radius: 6px; border: 1px solid rgba(214, 173, 104, 0.5); letter-spacing: 0.06em; backdrop-filter: blur(6px); box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
              ${romanLabel}
            </span>
            ${isReversed ? `
              <span style="font-size: 8px; font-weight: 700; color: #f43f5e; background: rgba(7, 13, 45, 0.88); border: 1px solid rgba(244, 63, 94, 0.6); padding: 1px 5px; border-radius: 6px; backdrop-filter: blur(6px); display: inline-flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                <span>⟲</span><span>REV</span>
              </span>
            ` : `
              <span style="font-size: 8px; font-weight: 700; color: #10b981; background: rgba(7, 13, 45, 0.88); border: 1px solid rgba(16, 185, 129, 0.5); padding: 1px 5px; border-radius: 6px; backdrop-filter: blur(6px); box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                UPRIGHT
              </span>
            `}
          </div>

          <!-- Bottom Title Overlay Scrim -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(7, 13, 45, 0.95) 0%, rgba(7, 13, 45, 0.75) 60%, transparent 100%); padding: ${size === 'small' ? '14px 4px 4px' : '20px 8px 6px'}; text-align: center; z-index: 5;">
            <div style="font-family: var(--font-display, 'Cinzel', serif); font-size: ${dims.fontTitle}; font-weight: 700; color: #f7f5ff; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 2px 4px rgba(0,0,0,0.95);">
              ${cardName}
            </div>
            ${size === 'large' && keywordsList.length > 0 ? `
              <div style="font-size: 8.5px; color: #d6ad68; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
                ${keywordsList.slice(0, 2).join(' • ')}
              </div>
            ` : ''}
          </div>
        </div>
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
