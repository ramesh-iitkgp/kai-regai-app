/**
 * AppHeader Component — Sacred Brand Wordmark & Dynamic Status
 * Enforces rule: "AI" in "RegAI" must have distinct luminous styling.
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockUserProfile } from '../mock/mockUserProfile.js';

export function renderAppHeader(container) {
  container.innerHTML = `
    <header class="kai-header pt-safe">
      <div class="kai-header-inner">
        <!-- Brand Link -->
        <div class="kai-brand" id="brand-nav-btn" role="button" tabindex="0" aria-label="Kai RegAI Home">
          <div class="kai-emblem">
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" stroke="#e4c276" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.6"/>
              <circle cx="20" cy="20" r="11" stroke="#cabeff" stroke-width="1" opacity="0.4"/>
              <path d="M 20 8 L 20 32 M 8 20 L 32 20" stroke="#e4c276" stroke-width="0.8" opacity="0.3"/>
              <!-- Palm Crease Glyph -->
              <path d="M 14 18 Q 20 22 26 17" stroke="#47d6ff" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M 13 22 Q 19 25 24 28" stroke="#cabeff" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="20" cy="20" r="2.5" fill="#e4c276"/>
            </svg>
          </div>
          <div class="kai-wordmark">
            <div class="kai-title-row">
              <span class="kai-brand-reg">Kai Reg</span>
              <span class="kai-brand-ai">AI</span>
            </div>
            <span class="kai-descriptor">PALM READING</span>
          </div>
        </div>

        <!-- Right Side: System Status & User Avatar -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="kai-badge kai-badge-secondary" style="font-size: 10px; padding: 3px 8px;" title="Optical Sensor Status">
            <span class="material-symbols-outlined" style="font-size: 12px; color: var(--color-primary);">sensors</span>
            <span>Optical Sensor Ready</span>
          </div>
          <div id="profile-avatar-btn" role="button" tabindex="0" aria-label="Open Profile" style="cursor: pointer; position: relative;">
            <img src="${mockUserProfile.avatar_url}" alt="Maya Avatar" style="width: 32px; height: 32px; border-radius: 9999px; object-fit: cover; border: 1.5px solid var(--color-primary); box-shadow: 0 0 10px rgba(147,125,255,0.3);">
          </div>
        </div>
      </div>
    </header>
  `;

  document.getElementById('brand-nav-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });

  document.getElementById('profile-avatar-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
}
