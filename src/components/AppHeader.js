/**
 * AppHeader Component — Sacred Brand Wordmark & Dynamic Status
 * Enforces rule: "AI" in "RegAI" must have distinct luminous styling.
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockUserProfile } from '../mock/mockUserProfile.js';
import { i18n } from '../services/i18n.js';

export function renderAppHeader(container) {
  const activeLogo = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_active_logo')) || '/assets/brand/logo_emblem.png';
  container.innerHTML = `
    <header class="kai-header pt-safe">
      <div class="kai-header-inner">
        <!-- Brand Link -->
        <div class="kai-brand" id="brand-nav-btn" role="button" tabindex="0" aria-label="Kai RegAI Home">
          <div class="kai-emblem">
            <img src="${activeLogo}" alt="Kai RegAI Emblem" class="kai-emblem-img" />
          </div>
          <div class="kai-wordmark">
            <div class="kai-title-row">
              <span class="kai-brand-reg">KAI REG</span>
              <span class="kai-brand-ai">AI</span>
            </div>
            <div class="kai-descriptor-row">
              <span class="kai-descriptor-rule"></span>
              <span class="kai-descriptor">${i18n.t('brand_descriptor', 'PALM READING')}</span>
              <span class="kai-descriptor-rule right"></span>
            </div>
            <span class="kai-tagline">"${i18n.t('slide1_subtitle', 'The Story Written in Your Hands.')}"</span>
          </div>
        </div>

        <!-- Right Side: Home Button & User Avatar -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="header-home-btn" class="kai-icon-btn" type="button" aria-label="Home" title="Home" style="background: rgba(228, 194, 118, 0.1); border: 1.2px solid rgba(228, 194, 118, 0.4); border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: #E4C276; cursor: pointer; transition: all 0.2s ease;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>

          <div id="profile-avatar-btn" role="button" tabindex="0" aria-label="Open Profile" style="cursor: pointer; position: relative;">
            <img src="${mockUserProfile.avatar_url}" alt="User Profile Avatar" style="width: 32px; height: 32px; border-radius: 9999px; object-fit: cover; border: 1.5px solid var(--color-primary); box-shadow: 0 0 10px rgba(147,125,255,0.3);">
          </div>
        </div>
      </div>
    </header>
  `;

  document.getElementById('header-home-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });

  document.getElementById('brand-nav-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });

  document.getElementById('profile-avatar-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
}
