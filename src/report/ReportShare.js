/**
 * Kai RegAI — Social Share Card Generator & Sharing Engine
 * Phase: P10 — Report Engine
 * 
 * Generates beautiful, privacy-safe social media cards:
 * - Formats: 1:1 (Square), 4:5 (Portrait / Instagram), 9:16 (Stories / Reels)
 * - Canvas-based rendering with High-DPI (2x scale) support
 * - Zero PII or private questionnaire leakage
 * - Web Share API (navigator.share()) integration with download fallback
 */

import { REPORT_THEME } from './ReportTheme.js';

export const SOCIAL_CARD_FORMATS = {
  SQUARE: '1:1',
  PORTRAIT: '4:5',
  STORY: '9:16'
};

export class ReportShare {
  /**
   * Get pixel dimensions for selected aspect ratio
   */
  static getDimensions(format = SOCIAL_CARD_FORMATS.SQUARE, scale = 2) {
    switch (format) {
      case SOCIAL_CARD_FORMATS.PORTRAIT: // 4:5 (1080 x 1350)
        return { width: 540 * scale, height: 675 * scale, scale };
      case SOCIAL_CARD_FORMATS.STORY:    // 9:16 (1080 x 1920)
        return { width: 540 * scale, height: 960 * scale, scale };
      case SOCIAL_CARD_FORMATS.SQUARE:   // 1:1 (1080 x 1080)
      default:
        return { width: 540 * scale, height: 540 * scale, scale };
    }
  }

  /**
   * Render card metadata into an offscreen HTML5 canvas and return Data URL
   * @param {Object} params
   * @param {import('./ReportSchema.js').ReportModel} params.report
   * @param {string} [params.format='1:1']
   * @param {number} [params.themeIndex=0]
   * @returns {string} Image Data URL (image/png)
   */
  static generateCardDataUrl({ report, format = '1:1', themeIndex = 0 }) {
    if (typeof document === 'undefined') {
      // In headless Node test environment, return synthetic data URL
      return `data:image/png;base64,mockSocialCard_${format.replace(':', 'x')}`;
    }

    const { width, height, scale } = this.getDimensions(format, 2);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. Luxury Dark Gradient Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0a0e1a');
    grad.addColorStop(0.5, '#121829');
    grad.addColorStop(1, '#050811');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Radial Gold Glow in Center
    const glow = ctx.createRadialGradient(width / 2, height / 2, 50 * scale, width / 2, height / 2, 240 * scale);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Outer Border
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(20 * scale, 20 * scale, width - 40 * scale, height - 40 * scale);

    // 4. Header: Brand & Descriptor
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FBBF24';
    ctx.font = `bold ${10 * scale}px -apple-system, sans-serif`;
    ctx.fillText('KAI REGAI • PALM READING', width / 2, 54 * scale);

    // 5. Card Theme Title & Insight
    const theme = report.summary?.keyThemes?.[themeIndex] || {
      label: 'Constitutional Vitality',
      insight: 'A story of grounded physical resilience and steady endurance.'
    };

    ctx.fillStyle = '#94A3B8';
    ctx.font = `${11 * scale}px -apple-system, sans-serif`;
    ctx.fillText('A STORY OF', width / 2, 110 * scale);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = `600 ${22 * scale}px 'Georgia', serif`;
    ctx.fillText(theme.label.toUpperCase(), width / 2, 145 * scale);

    // Insight Paragraph wrapped cleanly
    ctx.fillStyle = '#CBD5E1';
    ctx.font = `${13 * scale}px -apple-system, sans-serif`;
    this.wrapText(ctx, `"${theme.insight}"`, width / 2, 195 * scale, width - 100 * scale, 22 * scale);

    // 6. Minimal Palmar Crease Glyphs
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = `${9 * scale}px monospace`;
    ctx.fillText('● LIFE   ◆ HEAD   ▲ HEART   ★ FATE   ☀ SUN', width / 2, height - 70 * scale);

    // 7. Footer Tagline
    ctx.fillStyle = '#FBBF24';
    ctx.font = `italic ${10 * scale}px 'Georgia', serif`;
    ctx.fillText('"The Story Written in Your Hands."', width / 2, height - 44 * scale);

    return canvas.toDataURL('image/png');
  }

  /**
   * Helper to wrap canvas text
   */
  static wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  /**
   * Share card via Native Web Share API or download fallback
   * @param {Object} params
   * @param {import('./ReportSchema.js').ReportModel} params.report
   * @param {string} [params.format='1:1']
   * @returns {Promise<{ shared: boolean, method: string }>}
   */
  static async shareCard({ report, format = '1:1' }) {
    const dataUrl = this.generateCardDataUrl({ report, format });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Kai RegAI — ${report.summary?.title}`,
          text: `"${report.summary?.keyThemes?.[0]?.insight || report.summary?.headline}" • The Story Written in Your Hands.`
        });
        return { shared: true, method: 'WEB_SHARE_API' };
      } catch (err) {
        if (err.name === 'AbortError') return { shared: false, method: 'USER_CANCELLED' };
      }
    }

    // Fallback: trigger download of PNG card image
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Kai_RegAI_Story_${report.reportId}_${format.replace(':', '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { shared: true, method: 'IMAGE_DOWNLOAD' };
    }

    return { shared: true, method: 'HEADLESS_MOCK' };
  }
}
