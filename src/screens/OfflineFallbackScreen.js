/**
 * OfflineFallbackScreen Component — Low Connectivity & Offline Resilience
 * Matches Stitch: design/stitch/kai_regai_offline_low_connectivity_fallback_mode/
 * Source of truth: docs/p2/ERROR_RECOVERY_ARCHITECTURE.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { i18n } from '../services/i18n.js';

export function renderOfflineFallbackScreen(container) {
  container.innerHTML = `
    <div style="padding: 24px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center;">
      
      <div style="width: 64px; height: 64px; border-radius: 9999px; background: rgba(71,214,255,0.12); border: 1px solid var(--color-tertiary); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span class="material-symbols-outlined" style="font-size: 32px; color: var(--color-tertiary);">cloud_off</span>
      </div>

      <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high);">
        ${i18n.t('offline_title')}
      </h2>
      <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 8px; max-width: 320px; line-height: 1.5;">
        ${i18n.t('offline_desc')}
      </p>

      <div class="kai-card" style="width: 100%; margin: 24px 0; padding: 16px; background: var(--color-surface-container); text-align: left;">
        <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
          ${i18n.t('offline_cache_title')} (${mockReadings.length} ${i18n.t('offline_readings_suffix')})
        </span>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
          ${mockReadings.map(r => {
            const locTitle = (r.title && (r.title.includes('Hastarekha') || r.title.includes('Dossier') || r.title.includes('Blueprint') || r.title.includes('Solar') || r.title.includes('Radiance')))
              ? (r.title.includes('Solar') || r.title.includes('Radiance') ? i18n.t('mock_title_0') : i18n.t('mock_title_1'))
              : r.title;
            return `
              <div style="padding: 8px 10px; border-radius: var(--radius-sm); background: var(--color-surface-container-high); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                   onclick="window.location.hash='#${ROUTES.QUICK_REPORT}?id=${r.id}'">
                <span style="font-size: 13px; color: var(--color-text-high);">${locTitle}</span>
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-secondary);">chevron_right</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <button id="offline-home-btn" class="kai-btn kai-btn-primary" type="button" style="width: 100%;">
        <span>${i18n.t('offline_return_home')}</span>
      </button>

    </div>
  `;

  document.getElementById('offline-home-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });
}
