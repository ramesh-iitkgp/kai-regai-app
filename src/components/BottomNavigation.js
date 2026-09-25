/**
 * BottomNavigation Component — 4 Primary Mobile Tabs
 * HOME | READINGS | LEARN | YOU
 * Source of truth: docs/p2/NAVIGATION_ARCHITECTURE.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';

export function renderBottomNav(container, activeRoute) {
  // Hide on fullscreen immersion screens like Scanner or Onboarding
  if (activeRoute === ROUTES.SCANNER || activeRoute === ROUTES.SPLASH) {
    container.innerHTML = '';
    return;
  }

  const isHome = activeRoute === ROUTES.HOME;
  const isReadings = activeRoute === ROUTES.READINGS;
  const isLearn = activeRoute === ROUTES.LEARN;
  const isYou = activeRoute === ROUTES.PROFILE;

  container.innerHTML = `
    <nav class="kai-bottom-nav pb-safe" aria-label="Main Navigation">
      <div class="kai-bottom-nav-inner">
        <button class="kai-nav-item ${isHome ? 'active' : ''}" id="nav-home-btn" aria-label="Home">
          <span class="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>

        <button class="kai-nav-item ${isReadings ? 'active' : ''}" id="nav-readings-btn" aria-label="Readings Archive">
          <span class="material-symbols-outlined">history_edu</span>
          <span>Readings</span>
        </button>

        <button class="kai-nav-item ${isLearn ? 'active' : ''}" id="nav-learn-btn" aria-label="Learn Hastarekha Codex">
          <span class="material-symbols-outlined">menu_book</span>
          <span>Learn</span>
        </button>

        <button class="kai-nav-item ${isYou ? 'active' : ''}" id="nav-you-btn" aria-label="You and Settings">
          <span class="material-symbols-outlined">person</span>
          <span>You</span>
        </button>
      </div>
    </nav>
  `;

  document.getElementById('nav-home-btn')?.addEventListener('click', () => router.navigate(ROUTES.HOME));
  document.getElementById('nav-readings-btn')?.addEventListener('click', () => router.navigate(ROUTES.READINGS));
  document.getElementById('nav-learn-btn')?.addEventListener('click', () => router.navigate(ROUTES.LEARN));
  document.getElementById('nav-you-btn')?.addEventListener('click', () => router.navigate(ROUTES.PROFILE));
}
