/**
 * Kai RegAI — TarotSpreadLayout Component
 * 
 * Handles:
 * - Fanned interactive deck for intuitive card picking
 * - Spread table rendering with position markers
 * - Card reveal tracking and flip coordination
 */

import { renderTarotCardView } from './TarotCardView.js';

export function renderFannedDeck({ totalCards = 14, selectedIndices = [], maxSelect = 3 } = {}) {
  const selectedSet = new Set(selectedIndices);
  const remaining = maxSelect - selectedIndices.length;

  const cardElements = Array.from({ length: totalCards }, (_, i) => {
    const isSelected = selectedSet.has(i);
    // Arc calculation: angles from -24deg to +24deg
    const angle = ((i - (totalCards - 1) / 2) / ((totalCards - 1) / 2)) * 26;
    const yOffset = Math.abs(angle) * 1.8;

    return `
      <div 
        class="fanned-card-item ${isSelected ? 'selected' : ''}" 
        data-fanned-index="${i}"
        style="position: absolute; left: 50%; bottom: 10px; width: 68px; height: 110px; margin-left: -34px; transform-origin: bottom center; transform: rotate(${angle}deg) translateY(${isSelected ? '-36px' : `${yOffset}px`}) scale(${isSelected ? 1.08 : 1}); z-index: ${isSelected ? 50 : i}; cursor: pointer; transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;"
      >
        <div style="width: 100%; height: 100%; border-radius: 10px; border: 1.5px solid ${isSelected ? '#d6ad68' : 'rgba(214, 173, 104, 0.45)'}; box-shadow: ${isSelected ? '0 0 20px rgba(214, 173, 104, 0.8), 0 0 30px rgba(139, 92, 246, 0.4)' : '0 4px 14px rgba(0, 0, 0, 0.6)'}; overflow: hidden; position: relative; background: #070d2d;">
          <img src="/assets/tarot/card_back.jpg" alt="Tarot Card Back" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
          ${isSelected ? `
            <div style="position: absolute; inset: 0; background: rgba(139, 92, 246, 0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
              <span class="material-symbols-outlined" style="font-size: 20px; color: #ffffff;">check_circle</span>
              <span style="font-size: 8px; color: #ffffff; font-weight: 700; margin-top: 2px;">PICKED</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="fanned-deck-container" style="position: relative; width: 100%; height: 210px; overflow: hidden; margin: 10px 0; touch-action: pan-y;">
      <div style="position: absolute; top: 0; left: 0; right: 0; text-align: center; z-index: 60;">
        <span class="kai-badge" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; font-size: 11px; padding: 4px 12px; border-radius: 9999px;">
          ${remaining > 0 ? `✦ Tap ${remaining} more card${remaining > 1 ? 's' : ''} from the deck` : '✦ All cards chosen! Tap below to reveal'}
        </span>
      </div>
      <div style="position: relative; width: 100%; height: 100%;">
        ${cardElements}
      </div>
    </div>
  `;
}

export function renderSpreadTable({ spread, cards = [], flippedStates = [] } = {}) {
  const isSingle = spread.cardCount === 1;

  return `
    <div class="tarot-spread-table" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; margin: 12px 0;">
      <!-- Spread Header Tag -->
      <div style="text-align: center; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.1em; text-transform: uppercase;">
          ${spread.name}
        </span>
        <p style="font-size: 12px; color: #94a3b8; margin: 2px 0 0 0;">
          ${spread.description}
        </p>
      </div>

      <!-- Spread Cards Grid / Row -->
      <div 
        class="spread-cards-row" 
        style="display: flex; gap: ${isSingle ? '0' : '10px'}; justify-content: center; align-items: flex-start; flex-wrap: wrap; width: 100%; max-width: 500px;"
      >
        ${cards.map((item, idx) => {
          const isFlipped = Boolean(flippedStates[idx]);
          const pos = spread.positions[idx] || { name: `Card ${idx + 1}`, subtitle: '' };

          return `
            <div class="spread-card-slot" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 12px;">
              <!-- Position Subtitle Badge -->
              <div style="margin-bottom: 6px; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; color: #fbbf24; letter-spacing: 0.05em; text-transform: uppercase; display: block;">
                  ${pos.name}
                </span>
                <span style="font-size: 9px; color: #94a3b8; display: block;">
                  ${pos.subtitle}
                </span>
              </div>

              <!-- 3D Card -->
              ${renderTarotCardView({
                card: item.card,
                isFlipped,
                isReversed: item.isReversed,
                size: isSingle ? 'large' : 'medium',
                interactive: !isFlipped,
                cardIndex: idx
              })}

              <!-- Tap to Flip hint -->
              ${!isFlipped ? `
                <span style="font-size: 9.5px; color: rgba(251, 191, 36, 0.8); margin-top: 4px; animation: pulse 1.5s infinite;">
                  Tap to Reveal ▾
                </span>
              ` : `
                <span style="font-size: 9.5px; font-weight: 700; color: #cbd5e1; margin-top: 4px;">
                  ${item.card.name} ${item.isReversed ? '(Reversed)' : ''}
                </span>
              `}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
