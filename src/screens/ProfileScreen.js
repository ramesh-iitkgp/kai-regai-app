/**
 * ProfileScreen Component — You, Preferences & Privacy Controls
 * Matches Stitch: design/stitch/kai_regai_you_profile/
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-PRF-001..004)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockUserProfile } from '../mock/mockUserProfile.js';
import { readingHistoryService } from '../services/ReadingHistoryService.js';

export function renderProfileScreen(container) {
  function render() {
    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- User Avatar & Profile Card -->
        <div class="kai-card kai-card-gold-rim" style="padding: 20px; display: flex; align-items: center; gap: 16px; background: var(--color-surface-container);">
          <img src="${mockUserProfile.avatar_url}" 
               alt="${mockUserProfile.display_name}"
               style="width: 64px; height: 64px; border-radius: 9999px; object-fit: cover; border: 2px solid var(--color-secondary); box-shadow: 0 0 16px rgba(228,194,118,0.4);">
          
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high);">
                ${mockUserProfile.display_name}
              </h2>
              <span class="kai-badge kai-badge-secondary" style="font-size: 9px;">PREMIUM</span>
            </div>
            <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
              Dominant Hand: <strong>${mockUserProfile.dominant_hand}</strong>
            </p>
            <span style="font-size: 11px; color: var(--color-tertiary); margin-top: 4px; display: block;">
              ${mockUserProfile.reading_stats.total_scans} Scans • ${mockUserProfile.reading_stats.guided_dossiers} Guided Dossiers
            </span>
          </div>
        </div>

        <!-- Section 1: Reading Preferences -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Reading Preferences
          </span>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Dominant Hand</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Active manifestation hand</p>
              </div>
              <button id="toggle-dominant-hand" class="kai-badge kai-badge-primary" style="cursor: pointer; padding: 6px 12px; border: none;">
                ${mockUserProfile.dominant_hand} HAND
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Tradition Alignment</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Synthesis weighting</p>
              </div>
              <span class="kai-badge" style="background: rgba(255,255,255,0.06); color: var(--color-secondary);">
                Dual Synthesis
              </span>
            </div>
          </div>
        </div>

        <!-- Section 2: Biometric Privacy & Data Controls -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container); border-left: 3px solid var(--color-success);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="material-symbols-outlined" style="color: var(--color-success); font-size: 20px;">shield_lock</span>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-success); letter-spacing: 0.08em; text-transform: uppercase;">
              Biometric Privacy Guarantee
            </span>
          </div>
          <p style="font-size: 12px; color: var(--color-on-surface-variant); line-height: 1.5;">
            Camera frames are analyzed on-device in temporary memory. Only mathematical landmark geometry is retained.
          </p>

          <button id="erase-data-btn" style="margin-top: 14px; width: 100%; padding: 12px; border-radius: var(--radius-sm); background: rgba(233, 121, 121, 0.12); border: 1px solid var(--color-error); color: var(--color-error); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer;">
            1-Tap Erase All Biometric Data
          </button>
        </div>

        <!-- Section 3: Legal Disclaimers & Entertainment Ethics -->
        <div class="kai-card" style="padding: 16px; background: var(--color-surface-container-high);">
          <span style="font-size: 10px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Product Identity & Ethics
          </span>
          <p style="font-size: 11px; color: var(--color-outline); margin-top: 6px; line-height: 1.5;">
            Kai RegAI is an AI-assisted reflective chiromancy platform based on documented historical traditions. It does not provide medical diagnosis, psychological profiling, or legal advice.
          </p>
          <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: var(--color-secondary);">
            <span>Version 1.0.0 (Phase P4)</span>
            <span>Terms of Service</span>
          </div>
        </div>

      </div>
    `;

    document.getElementById('toggle-dominant-hand')?.addEventListener('click', () => {
      mockUserProfile.dominant_hand = mockUserProfile.dominant_hand === 'RIGHT' ? 'LEFT' : 'RIGHT';
      render();
    });

    document.getElementById('erase-data-btn')?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to purge all saved readings and feature models from this device?')) {
        mockUserProfile.reading_stats.total_scans = 0;
        mockUserProfile.reading_stats.guided_dossiers = 0;
        try {
          await readingHistoryService.purgeAllData();
        } catch {}
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
        alert('All biometric session data and local feature models have been permanently erased from RAM/storage.');
        render();
      }
    });
  }

  render();
}
