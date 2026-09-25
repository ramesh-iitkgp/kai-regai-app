/**
 * LearnCodexScreen Component — Hastarekha Codex Knowledge Library
 * Matches Stitch: design/stitch/kai_regai_learn_hastarekha_codex/
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-LRN-001)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockCodex } from '../mock/mockCodex.js';

export function renderLearnCodexScreen(container, params = {}) {
  let activeCategory = router.preservedState.learnCategory || 'lines';
  let activeArticleId = params.article || 'art-life-line';

  function render() {
    const activeArticle = mockCodex.articles.find(a => a.id === activeArticleId) || mockCodex.articles[0];

    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Header -->
        <div>
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            Hastarekha Shastra Codex
          </span>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">
            Ancient Palmistry Wisdom
          </h1>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 2px;">
            Grounded scholarly & traditional lineages of Indian and Western chiromancy.
          </p>
        </div>

        <!-- Category Horizontal Pills -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
          ${mockCodex.categories.map(cat => `
            <button class="kai-badge ${activeCategory === cat.id ? 'kai-badge-primary' : ''}" 
                    data-cat-id="${cat.id}"
                    style="cursor: pointer; padding: 6px 12px; border-radius: var(--radius-full); white-space: nowrap;">
              <span class="material-symbols-outlined" style="font-size: 14px; margin-right: 4px;">${cat.icon}</span>
              <span>${cat.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Featured Article Reader -->
        <div class="kai-card kai-card-gold-rim" style="padding: 20px; background: var(--color-surface-container);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span style="font-size: 10px; font-weight: 700; color: ${activeArticle.color}; letter-spacing: 0.08em; text-transform: uppercase;">
                ${activeArticle.subtitle}
              </span>
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">
                ${activeArticle.title}
              </h2>
            </div>
            <span class="kai-badge" style="font-size: 9px; color: var(--color-secondary); border-color: var(--color-secondary);">
              ${activeArticle.tradition}
            </span>
          </div>

          <p style="font-size: 13px; color: var(--color-text-high); line-height: 1.6; margin-bottom: 16px;">
            ${activeArticle.overview}
          </p>

          <!-- Key Aspects Sub-Cards -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
            ${activeArticle.key_aspects.map(asp => `
              <div style="padding: 10px 12px; border-radius: var(--radius-sm); background: var(--color-surface-container-high); border-left: 2px solid ${activeArticle.color};">
                <h4 style="font-size: 12px; font-weight: 700; color: var(--color-text-high);">${asp.label}</h4>
                <p style="font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px;">${asp.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- Citation / Provenance -->
          <div style="padding-top: 10px; border-top: 1px solid var(--color-border-subtle); display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-outlined" style="font-size: 14px; color: var(--color-outline);">menu_book</span>
            <span style="font-size: 10px; color: var(--color-outline); font-style: italic;">
              ${activeArticle.historical_note}
            </span>
          </div>
        </div>

        <!-- Article Quick Switcher Grid -->
        <div>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
            Major Crease Articles
          </span>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            ${mockCodex.articles.map(art => `
              <div class="kai-card" 
                   data-art-id="${art.id}"
                   role="button" tabindex="0"
                   style="padding: 12px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: ${activeArticleId === art.id ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)'};">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${art.color};"></span>
                  <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">${art.title}</h4>
                </div>
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-outline);">arrow_forward_ios</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Category click listeners
    container.querySelectorAll('[data-cat-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat-id');
        router.preservedState.learnCategory = activeCategory;
        render();
      });
    });

    // Article click listeners
    container.querySelectorAll('[data-art-id]').forEach(card => {
      card.addEventListener('click', () => {
        activeArticleId = card.getAttribute('data-art-id');
        render();
      });
    });
  }

  render();
}
