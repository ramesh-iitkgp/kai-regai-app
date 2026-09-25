/**
 * QuickReportScreen Component — Mode 1 Rapid Reading Results
 * Matches Stitch: design/stitch/kai_regai_quick_report/
 * Source of truth: docs/p2/REPORT_ARCHITECTURE.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { renderPalmLineOverlay } from '../components/PalmLineOverlay.js';

export function renderQuickReportScreen(container) {
  const reading = mockReadings[0];

  container.innerHTML = `
    <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Top Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="quick-back-btn" class="kai-btn-icon" aria-label="Back to Home">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
          Rapid Scan • Mode 1
        </span>
        <button id="quick-share-btn" class="kai-btn-icon" aria-label="Share Reading">
          <span class="material-symbols-outlined">share</span>
        </button>
      </div>

      <!-- Hero Palm Telemetry Card (Interactive Hologram Card) -->
      <div class="kai-card kai-card-gold-rim" style="padding: 20px; text-align: center; background: var(--color-surface-container);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 9999px; background: var(--color-tertiary);" class="glow-pulsing"></span>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-tertiary); letter-spacing: 0.08em; text-transform: uppercase;">
              Right Hand • Dominant
            </span>
          </div>
          <span style="font-family: monospace; font-size: 11px; color: var(--color-secondary);" title="Optical image quality (illumination, sharpness, framing)">
            IMAGE QUALITY: 94%
          </span>
        </div>

        <!-- Palm Visualization Device Viewport -->
        <div style="position: relative; width: 100%; height: 200px; border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface-container-lowest); margin-bottom: 16px;">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPH52puV1GapnfmvKBwXyAYdXh9B_GfqmOX2g9D-N3HkU7pOGrvTD7ZK8Gty0A1ytEtJGj4udfEMBoVJ8WENL9wNzr0Bd6PKHkZGZxkP6La8NB74RHPb4hxf3c_8FscpS1Urkgw5i6oj2iqd_KWVP0twOkkdmE9A2oW8Jy2nQmYxt69BUkKsGCPBdBTjst7eJyyQM8dvpLo375TWFW6pPk_dKv8DXljfBSliVtbkwsBsAJaUXFe5EYKtlb7oh9Qh_mKQ" 
               alt="Scanned palm visualization" 
               style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85; mix-blend-mode: screen;">
          
          <div style="position: absolute; inset: 0; background: radial-gradient(circle, transparent 40%, rgba(10,14,26,0.9) 100%);"></div>
          ${renderPalmLineOverlay()}
        </div>

        <h1 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high);">
          ${reading.title}
        </h1>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.5;">
          ${reading.summary}
        </p>
      </div>

      <!-- Major Line Observations Grid -->
      <section style="display: flex; flex-direction: column; gap: 10px;">
        <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
          Detected Crease Geometry
        </span>

        ${reading.major_lines.map(line => `
          <div class="kai-card" style="padding: 14px 16px; border-left: 3px solid ${line.color}; background: var(--color-surface-container);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${line.color}; box-shadow: 0 0 8px ${line.color};"></span>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${line.name}</h4>
              </div>
              <span class="kai-badge" style="font-size: 9px; background: rgba(255,255,255,0.05); color: var(--color-outline);">Observed</span>
            </div>
            <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.4;">
              ${line.observation}
            </p>
          </div>
        `).join('')}
      </section>

      <!-- Kai RegAI Synthesis Card -->
      <div class="kai-card" style="padding: 18px; background: linear-gradient(135deg, rgba(38,41,55,0.7) 0%, rgba(20,24,38,0.9) 100%); border: 1px solid rgba(228,194,118,0.25);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 20px;">auto_awesome</span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            Kai RegAI Synthesis
          </span>
        </div>
        <p style="font-size: 13px; color: var(--color-text-high); line-height: 1.6; font-style: italic;">
          "${reading.synthesis_chapters.constitution}"
        </p>
      </div>

      <!-- Primary Next Action: Explore Full Detailed Reading -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button id="quick-explore-full-btn" class="kai-btn kai-btn-gold" type="button">
          <span class="material-symbols-outlined">menu_book</span>
          <span>Explore Full Palm Reading</span>
        </button>
        <button id="quick-done-btn" class="kai-btn kai-btn-secondary" type="button">
          <span>Save & Return to Home</span>
        </button>
      </div>

    </div>
  `;

  document.getElementById('quick-back-btn')?.addEventListener('click', () => router.navigate(ROUTES.HOME));
  document.getElementById('quick-done-btn')?.addEventListener('click', () => router.navigate(ROUTES.HOME));
  document.getElementById('quick-explore-full-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.DETAILED_REPORT, { id: reading.id });
  });
  document.getElementById('quick-share-btn')?.addEventListener('click', () => {
    router.openModal('pdf_export', { title: reading.title });
  });
}
