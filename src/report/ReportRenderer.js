/**
 * Kai RegAI — Responsive Report Renderer
 * Phase: P10 — Report Engine
 * 
 * Renders canonical ReportModel instances into responsive HTML:
 * - Mobile / Tablet / Desktop responsive breakpoints
 * - Seamless progressive navigation & segmented tabs
 * - Native @media print styling with clean page breaks
 */

import { REPORT_THEME } from './ReportTheme.js';
import { ReportSections } from './ReportSections.js';
import { REPORT_TIERS } from './ReportSchema.js';

export class ReportRenderer {
  /**
   * Render complete web report markup
   * @param {import('./ReportSchema.js').ReportModel} report 
   * @param {Object} [options={}]
   * @returns {string} HTML string
   */
  static renderHTML(report, options = {}) {
    const isQuick = report.reportTier === REPORT_TIERS.QUICK;
    const isPremium = report.reportTier === REPORT_TIERS.PREMIUM;

    return `
      <div class="kai-report-container" style="max-width: 960px; margin: 0 auto; color: ${REPORT_THEME.colors.textHigh}; font-family: ${REPORT_THEME.typography.fontBody};">
        
        <!-- Print-only Header -->
        <div class="kai-print-only" style="display: none;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid ${REPORT_THEME.colors.textPrint}; padding-bottom: 12px; margin-bottom: 24px;">
            <div>
              <h2 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 20px; margin: 0; color: ${REPORT_THEME.colors.textPrint};">
                ${REPORT_THEME.brand.name}
              </h2>
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${REPORT_THEME.colors.textPrintMuted};">
                ${REPORT_THEME.brand.descriptor}
              </span>
            </div>
            <div style="text-align: right; font-size: 11px; color: ${REPORT_THEME.colors.textPrintMuted};">
              <span>Report ID: ${report.reportId}</span><br>
              <span>${new Date(report.generatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <!-- 1. Report Cover (Premium Only) -->
        ${isPremium ? ReportSections.renderCover(report) : ''}

        <!-- 2. Executive Summary & Key Takeaways -->
        ${ReportSections.renderExecutiveSummary(report)}

        <!-- 3. Palm Visualization (SVG) -->
        ${ReportSections.renderPalmVisualization(report)}

        <!-- 4. Major Line Architecture Table -->
        ${ReportSections.renderMajorLines(report)}

        <!-- 5. Chapters (Standard & Premium) -->
        ${!isQuick ? ReportSections.renderChapters(report) : ''}

        <!-- 6. Traditional Sources & Disclaimers -->
        ${ReportSections.renderSourcesAndDisclaimers(report)}

      </div>
    `;
  }

  /**
   * Inject print-specific stylesheets into the document
   */
  static getPrintStyles() {
    return `
      @media print {
        body {
          background: #FFFFFF !important;
          color: #0F172A !important;
          font-size: 12pt;
        }
        .kai-report-container {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .kai-btn, .kai-btn-icon, .kai-tabs-bar, #app-bottom-nav, #detail-back-btn, #detail-export-btn, .kai-modal-backdrop {
          display: none !important;
        }
        .kai-print-only {
          display: block !important;
        }
        .kai-report-section, .kai-report-cover {
          page-break-inside: avoid;
          border-bottom: 1px solid #E2E8F0 !important;
          padding: 20pt 0 !important;
        }
        .kai-chapter {
          page-break-inside: avoid;
          background: transparent !important;
          border: 1px solid #E2E8F0 !important;
        }
        .kai-takeaway-card {
          background: #F8FAFC !important;
          border: 1px solid #E2E8F0 !important;
          page-break-inside: avoid;
        }
        svg.palm-lines-svg {
          filter: none !important;
        }
      }
    `;
  }
}
