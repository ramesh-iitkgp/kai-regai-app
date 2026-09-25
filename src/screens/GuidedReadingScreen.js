/**
 * GuidedReadingScreen Component — Mode 2 Entry & Baseline Capture
 * Matches Stitch: design/stitch/kai_regai_guided_palm_reading/
 * Source of truth: docs/p2/PALM_READING_FLOW.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';

export function renderGuidedReadingScreen(container) {
  let selectedHand = 'RIGHT';
  let selectedFocus = 'VOCATION';

  function render() {
    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button id="guided-back-btn" class="kai-btn-icon" aria-label="Back">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            Guided Consultation • Mode 2
          </span>
          <div style="width: 40px;"></div>
        </div>

        <div>
          <h1 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high);">
            Vedic Palm Consultation
          </h1>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.5;">
            Combining high-precision baseline computer vision with traditional chiromantic observation.
          </p>
        </div>

        <!-- Hand Dominance Selector -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            Step 1: Select Active Hand
          </span>

          <div style="display: flex; gap: 10px; margin-top: 12px;">
            <div id="select-hand-right" class="kai-card ${selectedHand === 'RIGHT' ? 'kai-card-gold-rim' : ''}" 
                 style="flex: 1; padding: 12px; cursor: pointer; text-align: center; background: ${selectedHand === 'RIGHT' ? 'var(--color-surface-container-high)' : 'var(--color-surface-container-lowest)'};">
              <span class="material-symbols-outlined" style="color: ${selectedHand === 'RIGHT' ? 'var(--color-secondary)' : 'var(--color-outline)'}; font-size: 28px;">front_hand</span>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">Right Hand</h4>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px;">Active Vocation & Karma</p>
            </div>

            <div id="select-hand-left" class="kai-card ${selectedHand === 'LEFT' ? 'kai-card-gold-rim' : ''}" 
                 style="flex: 1; padding: 12px; cursor: pointer; text-align: center; background: ${selectedHand === 'LEFT' ? 'var(--color-surface-container-high)' : 'var(--color-surface-container-lowest)'};">
              <span class="material-symbols-outlined" style="color: ${selectedHand === 'LEFT' ? 'var(--color-secondary)' : 'var(--color-outline)'}; font-size: 28px;">back_hand</span>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">Left Hand</h4>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px;">Innate Potential & Dharma</p>
            </div>
          </div>
        </div>

        <!-- Baseline Optical Capture Box -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-tertiary); letter-spacing: 0.08em; text-transform: uppercase;">
            Step 2: Optical Baseline Alignment
          </span>

          <div style="position: relative; width: 100%; height: 180px; border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface-container-lowest); margin-top: 12px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--color-border-subtle);">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPH52puV1GapnfmvKBwXyAYdXh9B_GfqmOX2g9D-N3HkU7pOGrvTD7ZK8Gty0A1ytEtJGj4udfEMBoVJ8WENL9wNzr0Bd6PKHkZGZxkP6La8NB74RHPb4hxf3c_8FscpS1Urkgw5i6oj2iqd_KWVP0twOkkdmE9A2oW8Jy2nQmYxt69BUkKsGCPBdBTjst7eJyyQM8dvpLo375TWFW6pPk_dKv8DXljfBSliVtbkwsBsAJaUXFe5EYKtlb7oh9Qh_mKQ" 
                 alt="Baseline capture preview"
                 style="width: 100%; height: 100%; object-fit: cover; opacity: 0.75;">

            <!-- Reticle Alignment Box -->
            <div style="position: absolute; inset: 16px; border: 1.5px solid var(--color-tertiary); border-radius: var(--radius-sm); pointer-events: none; display: flex; align-items: flex-end; justify-content: center; padding: 8px;">
              <span style="font-size: 10px; font-weight: 700; color: var(--color-tertiary); background: rgba(10,14,26,0.85); padding: 2px 8px; border-radius: 9999px;">
                ANATOMICAL RETICLE LOCKED
              </span>
            </div>
          </div>
        </div>

        <!-- Next Action -->
        <button id="guided-proceed-btn" class="kai-btn kai-btn-primary" type="button">
          <span>Proceed to Guided Questions</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>

      </div>
    `;

    document.getElementById('guided-back-btn')?.addEventListener('click', () => router.navigate(ROUTES.HOME));

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
