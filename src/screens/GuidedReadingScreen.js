/**
 * GuidedReadingScreen Component — Mode 2 Entry & Baseline Capture
 * Matches Stitch: design/stitch/kai_regai_guided_palm_reading/
 * Source of truth: docs/p2/PALM_READING_FLOW.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';

export function renderGuidedReadingScreen(container) {
  let selectedHand = 'RIGHT';

  function render() {
    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button id="guided-back-btn" class="kai-btn-icon" aria-label="Back">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            Reading Pathway Selection
          </span>
          <div style="width: 40px;"></div>
        </div>

        <div>
          <h1 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high);">
            How Would You Like to Read Your Palm?
          </h1>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.5;">
            Choose between rapid optical camera capture or an interactive, self-guided observation questionnaire.
          </p>
        </div>

        <!-- Pathway 1: Camera Scanner -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container); border: 1px solid var(--color-border-subtle);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(147, 125, 255, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 24px;">photo_camera</span>
            </div>
            <div style="flex: 1;">
              <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-high);">
                Scan My Palm
              </h3>
              <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                Use your device camera for a rapid 10-second optical scan and crease extraction.
              </p>
            </div>
          </div>
          <button id="guided-launch-scanner-btn" class="kai-btn kai-btn-secondary" style="width: 100%; margin-top: 14px;" type="button">
            <span>Use Camera Scanner</span>
          </button>
        </div>

        <!-- Pathway 2: Guided Palm Reading (Mode 2) -->
        <div class="kai-card kai-card-gold-rim" style="padding: 18px; background: var(--color-surface-container-high);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(228, 194, 118, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 24px;">psychology</span>
            </div>
            <div style="flex: 1;">
              <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-high);">
                Guided Palm Reading (Mode 2)
              </h3>
              <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                No camera needed. Answer intuitive guided visual questions about your palm creases, mounts, and thumb.
              </p>
            </div>
          </div>

          <!-- Hand Selection for Guided Reading -->
          <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--color-border-subtle);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
              Select Hand to Observe:
            </span>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <div id="select-hand-right" class="kai-card ${selectedHand === 'RIGHT' ? 'kai-card-gold-rim' : ''}" 
                   style="flex: 1; padding: 12px; cursor: pointer; text-align: center; background: ${selectedHand === 'RIGHT' ? 'var(--color-surface-container-highest)' : 'var(--color-surface-container-lowest)'};">
                <span class="material-symbols-outlined" style="color: ${selectedHand === 'RIGHT' ? 'var(--color-secondary)' : 'var(--color-outline)'}; font-size: 24px;">front_hand</span>
                <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 2px;">Right Hand</h4>
                <p style="font-size: 10px; color: var(--color-on-surface-variant);">Active & Karma</p>
              </div>

              <div id="select-hand-left" class="kai-card ${selectedHand === 'LEFT' ? 'kai-card-gold-rim' : ''}" 
                   style="flex: 1; padding: 12px; cursor: pointer; text-align: center; background: ${selectedHand === 'LEFT' ? 'var(--color-surface-container-highest)' : 'var(--color-surface-container-lowest)'};">
                <span class="material-symbols-outlined" style="color: ${selectedHand === 'LEFT' ? 'var(--color-secondary)' : 'var(--color-outline)'}; font-size: 24px;">back_hand</span>
                <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 2px;">Left Hand</h4>
                <p style="font-size: 10px; color: var(--color-on-surface-variant);">Innate Potential</p>
              </div>
            </div>
          </div>

          <button id="guided-proceed-btn" class="kai-btn kai-btn-gold" style="width: 100%; margin-top: 14px;" type="button">
            <span>Begin Guided Reading</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

      </div>
    `;

    document.getElementById('guided-back-btn')?.addEventListener('click', () => router.navigate(ROUTES.HOME));

    document.getElementById('guided-launch-scanner-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.SCANNER);
    });

    document.getElementById('select-hand-right')?.addEventListener('click', () => {
      selectedHand = 'RIGHT';
      render();
    });

    document.getElementById('select-hand-left')?.addEventListener('click', () => {
      selectedHand = 'LEFT';
      render();
    });

    document.getElementById('guided-proceed-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.QUESTIONNAIRE, { hand: selectedHand });
    });
  }

  render();
}
