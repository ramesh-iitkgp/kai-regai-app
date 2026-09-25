/**
 * PdfExportModal Component — Illuminated Sacred Palm Book Export
 * Matches Stitch: design/stitch/kai_regai_pdf_illuminated_book_export_modal/
 */

import { router } from '../navigation/router.js';

export function renderPdfExportModal({
  readingTitle = 'Illuminated Hastarekha Dossier',
  onClose = () => {},
  onDownload = () => {}
} = {}) {
  return `
    <div id="pdf-modal-backdrop" class="kai-modal-backdrop open">
      <div class="kai-modal-sheet">
        <div class="kai-sheet-handle"></div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">Archival Export</span>
            <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">
              Illuminated Palm Codex
            </h3>
          </div>
          <button id="modal-close-x-btn" class="kai-btn-icon" aria-label="Close export modal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Book Preview Card Mockup -->
        <div style="background: var(--color-surface-container-lowest); border-radius: var(--radius-lg); padding: 18px; border: 1px solid var(--color-border-subtle); margin-bottom: 20px; display: flex; gap: 16px; align-items: center;">
          <div style="width: 72px; height: 96px; border-radius: 4px; background: linear-gradient(135deg, #1b1f2d 0%, #0a0e1a 100%); border: 1px solid var(--color-secondary); box-shadow: 0 4px 16px rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px; text-align: center;">
            <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 24px;">auto_stories</span>
            <span style="font-size: 8px; font-weight: 700; color: var(--color-secondary); margin-top: 4px; line-height: 1;">KAI REGAI</span>
          </div>
          <div style="flex: 1;">
            <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">
              ${readingTitle}
            </h4>
            <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px;">
              12-page high-resolution illuminated art monograph with gold-gilded diagrams & Sanskrit citations.
            </p>
            <span style="font-size: 11px; font-family: monospace; color: var(--color-tertiary); display: block; margin-top: 6px;">
              PDF • VECTOR PRINT QUALITY (300 DPI)
            </span>
          </div>
        </div>

        <!-- Export CTAs -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="modal-download-pdf-btn" class="kai-btn kai-btn-gold" type="button">
            <span class="material-symbols-outlined">download</span>
            <span>Download High-Res PDF</span>
          </button>
          <button id="modal-share-pdf-btn" class="kai-btn kai-btn-secondary" type="button">
            <span class="material-symbols-outlined">share</span>
            <span>Share Encrypted Link</span>
          </button>
        </div>

      </div>
    </div>
  `;
}
