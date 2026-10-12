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
import { i18n, SUPPORTED_LANGUAGES } from '../services/i18n.js';

export function renderProfileScreen(container) {
  let isReducedMotion = localStorage.getItem('kai_reduced_motion') === 'true';
  const displayName = localStorage.getItem('kai_user_name') || i18n.t('default_user_name');

  function render() {
    const currentLang = i18n.getLanguage();

    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- User Avatar & Profile Card -->
        <div class="kai-card kai-card-gold-rim" style="padding: 20px; display: flex; align-items: center; gap: 16px; background: var(--color-surface-container);">
          <img src="${mockUserProfile.avatar_url}" 
               alt="${displayName}"
               style="width: 64px; height: 64px; border-radius: 9999px; object-fit: cover; border: 2px solid var(--color-secondary); box-shadow: 0 0 16px rgba(228,194,118,0.4);">
          
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high);">
                ${displayName}
              </h2>
              <span class="kai-badge kai-badge-secondary" style="font-size: 9px;">${i18n.t('profile_premium')}</span>
            </div>
            <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
              ${i18n.t('profile_active_hand')}: <strong>${mockUserProfile.dominant_hand === 'RIGHT' ? i18n.t('dominant_right') : i18n.t('dominant_left')}</strong>
            </p>
            <span style="font-size: 11px; color: var(--color-tertiary); margin-top: 4px; display: block;">
              ${mockUserProfile.reading_stats.total_scans} ${i18n.t('profile_scans')} • ${mockUserProfile.reading_stats.guided_dossiers} ${i18n.t('profile_guided_dossiers')}
            </span>
          </div>
        </div>

        <!-- Section 1: Reading & Accessibility Preferences -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            ${i18n.t('profile_pref_title')}
          </span>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <!-- Language Selector -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('profile_lang_label')}</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">${i18n.t('profile_lang_sub')}</p>
              </div>
              <select id="profile-lang-selector" style="background: rgba(228, 194, 118, 0.12); color: var(--color-secondary); border: 1px solid rgba(228, 194, 118, 0.35); border-radius: var(--radius-sm); padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; outline: none;">
                ${SUPPORTED_LANGUAGES.map(l => `<option value="${l.code}" ${currentLang === l.code ? 'selected' : ''} style="background: #14121b; color: #fff;">${l.native}</option>`).join('')}
              </select>
            </div>

            <!-- Dominant Hand -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('profile_dominant_hand')}</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">${i18n.t('profile_dominant_sub')}</p>
              </div>
              <button id="toggle-dominant-hand" class="kai-badge kai-badge-primary" style="cursor: pointer; padding: 6px 12px; border: none;" aria-label="${i18n.t('profile_dominant_hand')}">
                ${mockUserProfile.dominant_hand === 'RIGHT' ? i18n.t('dominant_right') : i18n.t('dominant_left')}
              </button>
            </div>

            <!-- Tradition Alignment -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('profile_tradition_title')}</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">${i18n.t('profile_tradition_sub')}</p>
              </div>
              <span class="kai-badge" style="background: rgba(255,255,255,0.06); color: var(--color-secondary); font-size: 11px;">
                ${i18n.t('profile_tradition_val')}
              </span>
            </div>

            <!-- Reduced Motion -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('profile_reduced_motion')}</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">${i18n.t('profile_reduced_motion_sub')}</p>
              </div>
              <button id="toggle-reduced-motion" class="kai-badge ${isReducedMotion ? 'kai-badge-secondary' : 'kai-badge-primary'}" style="cursor: pointer; padding: 6px 12px; border: none;" aria-label="${i18n.t('profile_reduced_motion')}">
                ${isReducedMotion ? i18n.t('profile_on') : i18n.t('profile_off')}
              </button>
            </div>

            <!-- Cosmic Onboarding Replay -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('profile_replay_tour')}</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">${i18n.t('profile_replay_sub')}</p>
              </div>
              <button id="replay-onboarding-btn" class="kai-badge kai-badge-secondary" style="cursor: pointer; padding: 6px 12px; border: none;" aria-label="${i18n.t('profile_replay_tour')}">
                ${i18n.t('profile_replay_btn')}
              </button>
            </div>

            <!-- Brand Logo Emblem Style Selection -->
            <div style="padding-top: 14px; border-top: 1px solid var(--color-border-subtle);">
              <div style="margin-bottom: 10px;">
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Kai RegAI App Logo Emblem</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">Active luxury emblem shown during the 5-sec app loading splash</p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div class="logo-choice-card" data-logo="/assets/brand/logo.png" style="cursor: pointer; text-align: center; padding: 8px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 2px solid ${(!localStorage.getItem('kai_active_logo') || localStorage.getItem('kai_active_logo') === '/assets/brand/logo.png') ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)'}; transition: transform 0.2s;">
                  <img src="/assets/brand/logo.png" alt="Official Logo" style="width: 100%; aspect-ratio: 1; border-radius: 8px; object-fit: contain; background: #0b0914;" />
                  <span style="font-size: 11px; font-weight: 700; color: #fbbf24; margin-top: 6px; display: block;">★ Official (Active)</span>
                </div>
                <div class="logo-choice-card" data-logo="/assets/brand/logo_emblem.png" style="cursor: pointer; text-align: center; padding: 8px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 2px solid ${(localStorage.getItem('kai_active_logo') === '/assets/brand/logo_emblem.png') ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)'}; transition: transform 0.2s;">
                  <img src="/assets/brand/logo_emblem.png" alt="KR Medallion" style="width: 100%; aspect-ratio: 1; border-radius: 8px; object-fit: contain; background: #0b0914;" />
                  <span style="font-size: 11px; font-weight: 700; color: #e4c276; margin-top: 6px; display: block;">KR Medallion</span>
                </div>
                <div class="logo-choice-card" data-logo="/assets/brand/original_logo.jpg" style="cursor: pointer; text-align: center; padding: 8px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 2px solid ${(localStorage.getItem('kai_active_logo') || '').includes('original_logo') ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)'}; transition: transform 0.2s;">
                  <img src="/assets/brand/original_logo.jpg" alt="Classic Gold" style="width: 100%; aspect-ratio: 1; border-radius: 8px; object-fit: cover;" />
                  <span style="font-size: 11px; font-weight: 700; color: #e4c276; margin-top: 6px; display: block;">Classic Gold</span>
                </div>
                <div class="logo-choice-card" data-logo="/assets/brand/logo_option_1.jpg" style="cursor: pointer; text-align: center; padding: 8px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 2px solid ${(localStorage.getItem('kai_active_logo') || '').includes('logo_option_1') ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)'}; transition: transform 0.2s;">
                  <img src="/assets/brand/logo_option_1.jpg" alt="Option 1: Celestial" style="width: 100%; aspect-ratio: 1; border-radius: 8px; object-fit: cover;" />
                  <span style="font-size: 11px; font-weight: 700; color: #e4c276; margin-top: 6px; display: block;">1: Celestial</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Account & Purchases -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            ${i18n.t('profile_account_title')}
          </span>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('profile_session_identity')}</h4>
                <p style="font-size: 12px; color: var(--color-on-surface-variant);">${i18n.t('profile_guest_session')}</p>
              </div>
              <span class="kai-badge" style="background: rgba(71, 214, 255, 0.1); color: var(--color-tertiary); font-size: 10px;">
                ${i18n.t('profile_verified_ram')}
              </span>
            </div>

            <p style="font-size: 11px; color: var(--color-outline); line-height: 1.4;">
              ${i18n.t('profile_account_desc')}
            </p>

            <button id="profile-restore-purchases-btn" class="kai-btn kai-btn-secondary" style="height: 44px; font-size: 12px;" type="button">
              <span class="material-symbols-outlined" style="font-size: 18px;">restore</span>
              <span>${i18n.t('profile_restore_btn')}</span>
            </button>
            <div id="profile-restore-msg" style="display: none; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 12px;"></div>
          </div>
        </div>

        <!-- Section 3: Biometric Privacy & Data Controls -->
        <div class="kai-card" style="padding: 18px; background: var(--color-surface-container); border-left: 3px solid var(--color-success);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="material-symbols-outlined" style="color: var(--color-success); font-size: 20px;">shield_lock</span>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-success); letter-spacing: 0.08em; text-transform: uppercase;">
              ${i18n.t('profile_privacy_title')}
            </span>
          </div>
          <p style="font-size: 12px; color: var(--color-on-surface-variant); line-height: 1.5;">
            ${i18n.t('profile_privacy_desc')}
          </p>

          <button id="erase-data-btn" style="margin-top: 14px; width: 100%; min-height: 44px; padding: 12px; border-radius: var(--radius-sm); background: rgba(233, 121, 121, 0.12); border: 1px solid var(--color-error); color: var(--color-error); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer;">
            ${i18n.t('profile_erase_btn')}
          </button>
        </div>

        <!-- Section 4: Legal Disclaimers & Ethics -->
        <div class="kai-card" style="padding: 16px; background: var(--color-surface-container-high);">
          <span style="font-size: 10px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            ${i18n.t('profile_legal_title')}
          </span>
          <p style="font-size: 11px; color: var(--color-outline); margin-top: 6px; line-height: 1.5;">
            ${i18n.t('profile_legal_desc')}
          </p>
          <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: var(--color-secondary);">
            <span>${i18n.t('profile_version')}</span>
            <span>${i18n.t('profile_terms')}</span>
          </div>
        </div>

      </div>
    `;

    document.getElementById('profile-lang-selector')?.addEventListener('change', (e) => {
      const selected = e.target.value;
      i18n.setLanguage(selected);
      window.dispatchEvent(new CustomEvent('kai:language-changed', { detail: { language: selected } }));
      render();
    });

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

    document.getElementById('replay-onboarding-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem('kai_logo_splash_shown');
      localStorage.removeItem('kai_onboarding_completed');
      router.navigate(ROUTES.SPLASH);
    });

    container.querySelectorAll('.logo-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        const logoUrl = card.getAttribute('data-logo');
        if (logoUrl) {
          localStorage.setItem('kai_active_logo', logoUrl);
          render();
        }
      });
    });

    document.getElementById('profile-restore-purchases-btn')?.addEventListener('click', async () => {
      const msg = document.getElementById('profile-restore-msg');
      if (!msg) return;
      msg.style.display = 'block';
      msg.style.background = 'rgba(71, 214, 255, 0.15)';
      msg.style.color = 'var(--color-tertiary)';
      msg.textContent = i18n.t('profile_restore_contacting');

      try {
        const res = await defaultEntitlementService.restorePurchases();
        if (res.restoredCount > 0) {
          msg.style.background = 'rgba(74, 222, 128, 0.15)';
          msg.style.color = '#4ade80';
          msg.textContent = `${i18n.t('profile_restore_success')} (${res.restoredCount})`;
        } else {
          msg.style.background = 'rgba(228, 194, 118, 0.15)';
          msg.style.color = 'var(--color-secondary)';
          msg.textContent = i18n.t('profile_restore_none');
        }
      } catch (err) {
        msg.style.background = 'rgba(239, 68, 68, 0.15)';
        msg.style.color = '#ef4444';
        msg.textContent = `${i18n.t('profile_restore_error')} ${err.message}`;
      }
    });

    document.getElementById('erase-data-btn')?.addEventListener('click', async () => {
      if (confirm(i18n.t('profile_erase_confirm'))) {
        mockUserProfile.reading_stats.total_scans = 0;
        mockUserProfile.reading_stats.guided_dossiers = 0;
        try {
          await readingHistoryService.purgeAllData();
        } catch {}
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
        alert(i18n.t('profile_erase_alert'));
        render();
      }
    });
  }

  render();
}
