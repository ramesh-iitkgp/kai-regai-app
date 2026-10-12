/**
 * BottomNavigation Component — 4 Primary Mobile Tabs
 * HOME | READINGS | LEARN | YOU
 * Source of truth: docs/p2/NAVIGATION_ARCHITECTURE.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { i18n } from '../services/i18n.js';

export function renderBottomNav(container, activeRoute) {
  // Hide on fullscreen immersion screens like Scanner, Onboarding, Chat, Quick Report, Detailed Dossier, or Palm Reading
  if (
    activeRoute === ROUTES.SCANNER || 
    activeRoute === ROUTES.SPLASH || 
    activeRoute === ROUTES.CHAT ||
    activeRoute === ROUTES.QUICK_REPORT ||
    activeRoute === ROUTES.DETAILED_REPORT ||
    activeRoute === ROUTES.FACE_SCANNER ||
    activeRoute === ROUTES.FACE_REPORT ||
    activeRoute === ROUTES.GUIDED_READING ||
    activeRoute === ROUTES.QUESTIONNAIRE ||
    activeRoute === ROUTES.CALIBRATOR ||
    activeRoute === ROUTES.ORACLE ||
    activeRoute === ROUTES.TAROT
  ) {
    container.innerHTML = '';
    return;
  }

  const isHome = activeRoute === ROUTES.HOME;
  const isReadings = activeRoute === ROUTES.READINGS;
  const isLearn = activeRoute === ROUTES.LEARN || activeRoute === ROUTES.TAROT;
  const isYou = activeRoute === ROUTES.PROFILE;

  container.innerHTML = `
    <nav class="kai-bottom-nav pb-safe" aria-label="Main Navigation">
      <div class="kai-bottom-nav-inner">
        <button class="kai-nav-item ${isHome ? 'active' : ''}" id="nav-home-btn" aria-label="${i18n.t('nav_home')}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>${i18n.t('nav_home')}</span>
        </button>

        <button class="kai-nav-item ${isReadings ? 'active' : ''}" id="nav-readings-btn" aria-label="${i18n.t('nav_archive')}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>${i18n.t('nav_archive')}</span>
        </button>

        <button class="kai-nav-item ${isLearn ? 'active' : ''}" id="nav-learn-btn" aria-label="${i18n.t('tarot_title')}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>${i18n.t('tarot_title')}</span>
        </button>

        <button class="kai-nav-item ${isYou ? 'active' : ''}" id="nav-you-btn" aria-label="${i18n.t('nav_profile')}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>${i18n.t('nav_profile')}</span>
        </button>
      </div>
    </nav>
  `;

  document.getElementById('nav-home-btn')?.addEventListener('click', () => router.navigate(ROUTES.HOME));
  document.getElementById('nav-readings-btn')?.addEventListener('click', () => router.navigate(ROUTES.READINGS));
  document.getElementById('nav-learn-btn')?.addEventListener('click', () => router.navigate(ROUTES.TAROT));
  document.getElementById('nav-you-btn')?.addEventListener('click', () => router.navigate(ROUTES.PROFILE));
}
