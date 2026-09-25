/**
 * ReadingsArchiveScreen Component — Readings Timeline & Hand Comparator
 * Matches Stitch: design/stitch/kai_regai_readings_archive/
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-RDG-001)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { readingHistoryService } from '../services/ReadingHistoryService.js';

export function renderReadingsArchiveScreen(container) {
  let activeFilter = router.preservedState.readingsFilter || 'ALL';
  let persistedItems = [];

  // Async fetch from local storage
  readingHistoryService.listHistory().then(({ records }) => {
    if (records && records.length > 0) {
      persistedItems = records.map(r => ({
        id: r.readingId,
        title: r.metadata.displayTitle,
        hand_side: r.metadata.handSide,
        mode: r.readingMethod === 'MODE_2_QUESTIONNAIRE' ? 'MODE_2_GUIDED' : 'MODE_1_SCANNER',
        timestamp: r.createdAt,
        summary: r.metadata.summary,
        tags: r.metadata.tags,
        isPersisted: true,
        persistedRecord: r
      }));
      render();
    }
  }).catch(() => {});

  function render() {
    const allList = [...persistedItems, ...mockReadings];
    const filtered = allList.filter(r => {
      if (activeFilter === 'QUICK') return r.mode === 'MODE_1_SCANNER';
      if (activeFilter === 'GUIDED') return r.mode === 'MODE_2_GUIDED';
      return true;
    });

    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--color-text-high);">
              Readings Archive
            </h1>
            <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 2px;">
              Your saved palm consultations & biometric timelines.
            </p>
          </div>
          <button id="archive-compare-btn" class="kai-btn-icon" aria-label="Compare Hands" title="Compare Hands">
            <span class="material-symbols-outlined">compare_arrows</span>
          </button>
        </div>

        <!-- Filter Selector Pills -->
        <div style="display: flex; gap: 8px;">
          <button class="kai-badge ${activeFilter === 'ALL' ? 'kai-badge-secondary' : ''}" data-filter="ALL" style="cursor: pointer; padding: 6px 14px; border-radius: var(--radius-full); background: ${activeFilter === 'ALL' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}; color: ${activeFilter === 'ALL' ? '#000' : 'var(--color-on-surface)'}; border: none;">
            All (${allList.length})
          </button>
          <button class="kai-badge ${activeFilter === 'QUICK' ? 'kai-badge-secondary' : ''}" data-filter="QUICK" style="cursor: pointer; padding: 6px 14px; border-radius: var(--radius-full); background: ${activeFilter === 'QUICK' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}; color: ${activeFilter === 'QUICK' ? '#000' : 'var(--color-on-surface)'}; border: none;">
            Quick Scans
          </button>
          <button class="kai-badge ${activeFilter === 'GUIDED' ? 'kai-badge-secondary' : ''}" data-filter="GUIDED" style="cursor: pointer; padding: 6px 14px; border-radius: var(--radius-full); background: ${activeFilter === 'GUIDED' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}; color: ${activeFilter === 'GUIDED' ? '#000' : 'var(--color-on-surface)'}; border: none;">
            Guided Dossiers
          </button>
        </div>

        <!-- Readings Cards List -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${filtered.length === 0 ? `
            <div class="kai-card" style="padding: 32px 16px; text-align: center;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-outline);">inventory_2</span>
              <p style="font-size: 14px; color: var(--color-on-surface-variant); margin-top: 8px;">No readings found in this category.</p>
            </div>
          ` : filtered.map(item => `
            <div class="kai-card ${item.mode === 'MODE_2_GUIDED' ? 'kai-card-gold-rim' : ''}" 
                 data-reading-id="${item.id}"
                 role="button" tabindex="0"
                 style="padding: 16px; cursor: pointer; background: var(--color-surface-container);">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="material-symbols-outlined" style="color: ${item.mode === 'MODE_2_GUIDED' ? 'var(--color-secondary)' : 'var(--color-primary)'}; font-size: 20px;">
                    ${item.mode === 'MODE_2_GUIDED' ? 'menu_book' : 'document_scanner'}
                  </span>
                  <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.04em;">
                    ${item.hand_side} HAND • ${item.mode === 'MODE_2_GUIDED' ? 'GUIDED' : 'SCANNER'}
                  </span>
                </div>
                <span style="font-size: 11px; color: var(--color-outline); font-family: monospace;">
                  ${new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>

              <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-high);">
                ${item.title}
              </h3>
              <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.4;">
                ${item.summary}
              </p>

              <!-- Tags -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                ${(item.tags || []).map(t => `
                  <span class="kai-badge" style="font-size: 9px; background: rgba(255,255,255,0.05); color: var(--color-on-surface-variant);">
                    ${t}
                  </span>
                `).join('')}
              </div>

            </div>
          `).join('')}
        </div>

      </div>
    `;

    // Filter selector listeners
    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        router.preservedState.readingsFilter = activeFilter;
        render();
      });
    });

    // Card click listener
    container.querySelectorAll('[data-reading-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-reading-id');
        const found = allList.find(x => x.id === id);
        if (found?.isPersisted) {
          const dossier = found.persistedRecord.interpretationSnapshot;
          if (found.mode === 'MODE_2_GUIDED') {
            router.navigate(ROUTES.DETAILED_REPORT, { dossier, id });
          } else {
            router.navigate(ROUTES.QUICK_REPORT, { dossier, id });
          }
        } else {
          const r = mockReadings.find(x => x.id === id);
          if (r?.mode === 'MODE_2_GUIDED') {
            router.navigate(ROUTES.DETAILED_REPORT, { id });
          } else {
            router.navigate(ROUTES.QUICK_REPORT, { id });
          }
        }
      });
    });

    // Compare Hands button listener
    container.querySelector('#archive-compare-btn')?.addEventListener('click', () => {
      alert('Bilateral Hand Comparison Mode: Left Hand (Innate Potential) vs Right Hand (Active Manifestation).');
    });
  }

  render();
}
