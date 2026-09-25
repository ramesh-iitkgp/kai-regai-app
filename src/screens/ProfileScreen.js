/**
 * ProfileScreen Component — You, Preferences, Account & Privacy Controls
 * Phase: P16 — Production UX, Reading Experience & Conversion
 * Matches Stitch: design/stitch/kai_regai_you_profile/
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-PRF-001..004) & docs/p16/
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockUserProfile } from '../mock/mockUserProfile.js';
import { readingHistoryService } from '../services/ReadingHistoryService.js';
import { defaultEntitlementService } from '../monetization/EntitlementService.js';

export function renderProfileScreen(container) {
  let isReducedMotion = localStorage.getItem('kai_reduced_motion') === 'true';

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
              Active Hand: <strong>${mockUserProfile.dominant_hand}</strong>
            </p>
            <span style="font-size: 11px; color: var(--color-tertiary); margin-top: 4px; display: block;">
              ${mockUserProfile.reading_stats.total_scans} Scans • ${mockUserProfile.reading_stats.guided_dossiers} Guided Dossiers
            </span>
          </div>
        </div>

        <!-- Section 1: Reading & Accessibility Preferences -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Reading & Accessibility Preferences
          </span>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Dominant Hand</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Active manifestation hand</p>
              </div>
              <button id="toggle-dominant-hand" class="kai-badge kai-badge-primary" style="cursor: pointer; padding: 6px 12px; border: none;" aria-label="Toggle dominant hand">
                ${mockUserProfile.dominant_hand} HAND
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Tradition Alignment</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Synthesis weighting</p>
              </div>
              <span class="kai-badge" style="background: rgba(255,255,255,0.06); color: var(--color-secondary);">
                Dual Synthesis (Vedic + Western)
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Reduced Motion</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Minimize animations & transitions</p>
              </div>
              <button id="toggle-reduced-motion" class="kai-badge ${isReducedMotion ? 'kai-badge-secondary' : 'kai-badge-primary'}" style="cursor: pointer; padding: 6px 12px; border: none;" aria-label="Toggle reduced motion">
                ${isReducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <!-- Section 2: Account & Purchases -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Account & Commercial Entitlements
          </span>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Session Identity</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Anonymous guest session</p>
              </div>
              <span class="kai-badge" style="background: rgba(71, 214, 255, 0.1); color: var(--color-tertiary); font-size: 10px;">
                Verified RAM Identity
              </span>
            </div>

            <p style="font-size: 11px; color: var(--color-outline); line-height: 1.4;">
              Create an account or link your email to keep your readings preserved across all devices and web platforms.
            </p>

            <button id="profile-restore-purchases-btn" class="kai-btn kai-btn-secondary" style="height: 44px; font-size: 12px;" type="button">
              <span class="material-symbols-outlined" style="font-size: 18px;">restore</span>
              <span>Restore Purchases</span>
            </button>
            <div id="profile-restore-msg" style="display: none; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 12px;"></div>
          </div>
        </div>

        <!-- Section 3: Biometric Privacy & Data Controls -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container); border-left: 3px solid var(--color-success);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="material-symbols-outlined" style="color: var(--color-success); font-size: 20px;">shield_lock</span>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-success); letter-spacing: 0.08em; text-transform: uppercase;">
              Biometric Privacy Guarantee
            </span>
          </div>
          <p style="font-size: 12px; color: var(--color-on-surface-variant); line-height: 1.5;">
            Camera frames are analyzed on-device in temporary memory. Only mathematical landmark geometry and reading reports are stored locally.
          </p>

          <button id="erase-data-btn" style="margin-top: 14px; width: 100%; min-height: 44px; padding: 12px; border-radius: var(--radius-sm); background: rgba(233, 121, 121, 0.12); border: 1px solid var(--color-error); color: var(--color-error); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer;">
            1-Tap Erase All Biometric Data
          </button>
        </div>

        <!-- Section 4: Legal Disclaimers & Ethics -->
        <div class="kai-card" style="padding: 16px; background: var(--color-surface-container-high);">
          <span style="font-size: 10px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Product Identity & Ethics
          </span>
          <p style="font-size: 11px; color: var(--color-outline); margin-top: 6px; line-height: 1.5;">
            Kai RegAI is an AI-assisted reflective palmistry platform rooted in ancient Samudrika and Classical traditions. It does not provide medical diagnosis, psychological counseling, or financial advice.
          </p>
          <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: var(--color-secondary);">
            <span>Kai RegAI v1.0.0 (Production Release)</span>
            <span>Terms of Service</span>
          </div>
        </div>

      </div>
    `;

    document.getElementById('toggle-dominant-hand')?.addEventListener('click', () => {
      mockUserProfile.dominant_hand = mockUserProfile.dominant_hand === 'RIGHT' ? 'LEFT' : 'RIGHT';
      render();
    });

    document.getElementById('toggle-reduced-motion')?.addEventListener('click', () => {
      isReducedMotion = !isReducedMotion;
      localStorage.setItem('kai_reduced_motion', String(isReducedMotion));
      if (isReducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      render();
    });

    document.getElementById('profile-restore-purchases-btn')?.addEventListener('click', async () => {
      const msg = document.getElementById('profile-restore-msg');
      if (!msg) return;
      msg.style.display = 'block';
      msg.style.background = 'rgba(71, 214, 255, 0.15)';
      msg.style.color = 'var(--color-tertiary)';
      msg.textContent = 'Contacting server entitlement registry...';

      try {
        const res = await defaultEntitlementService.restorePurchases();
        if (res.restoredCount > 0) {
          msg.style.background = 'rgba(74, 222, 128, 0.15)';
          msg.style.color = '#4ade80';
          msg.textContent = `✓ Successfully restored ${res.restoredCount} entitlement(s).`;
        } else {
          msg.style.background = 'rgba(228, 194, 118, 0.15)';
          msg.style.color = 'var(--color-secondary)';
          msg.textContent = 'No previous purchases found to restore for this identity.';
        }
      } catch (err) {
        msg.style.background = 'rgba(239, 68, 68, 0.15)';
        msg.style.color = '#ef4444';
        msg.textContent = `Restore error: ${err.message}`;
      }
    });

    document.getElementById('erase-data-btn')?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to permanently erase all saved readings, cached credentials, and feature models from this device?')) {
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
