/**
 * Kai RegAI — Reusable Report Sections & Components
 * Phase: P10 — Report Engine
 * 
 * Modular component renderers shared across Web, Print/PDF, and Previews.
 */

import { REPORT_THEME } from './ReportTheme.js';
import { renderPalmLineOverlay } from '../components/PalmLineOverlay.js';

export class ReportSections {
  /**
   * Premium dedicated report cover
   */
  static renderCover(report) {
    const hand = report.subject?.handSide || 'Right';
    return `
      <section class="kai-report-cover" style="text-align: center; padding: 48px 24px; border-bottom: 1px solid ${REPORT_THEME.colors.goldBorder};">
        <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; border: 1px solid ${REPORT_THEME.colors.goldBorder}; background: ${REPORT_THEME.colors.goldGlow}; color: ${REPORT_THEME.colors.gold}; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 24px;">
          ${report.reportTier} ARCHIVAL DOSSIER
        </div>
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <img src="/assets/brand/logo_emblem.png" alt="Kai RegAI" style="width: 68px; height: 68px; border-radius: 9999px; box-shadow: 0 0 20px rgba(251, 191, 36, 0.35); border: 1.5px solid rgba(251, 191, 36, 0.5); object-fit: contain;">
        </div>

        <h1 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 34px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; letter-spacing: 0.05em; line-height: 1.2; margin: 0 0 12px;">
          ${REPORT_THEME.brand.name}
        </h1>
        <p style="font-size: 13px; font-weight: 700; color: ${REPORT_THEME.colors.gold}; letter-spacing: 0.25em; text-transform: uppercase; margin: 0 0 8px;">
          ${REPORT_THEME.brand.descriptor}
        </p>
        <p style="font-size: 14px; font-style: italic; color: ${REPORT_THEME.colors.textMuted}; margin: 0 0 36px;">
          "${REPORT_THEME.brand.tagline}"
        </p>

        <div style="background: ${REPORT_THEME.colors.bgCard}; border: 1px solid ${REPORT_THEME.colors.borderSubtle}; border-radius: ${REPORT_THEME.radii.lg}; padding: 24px; max-width: 440px; margin: 0 auto; text-align: left;">
          <div style="font-size: 11px; color: ${REPORT_THEME.colors.textDim}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Subject Reading</div>
          <div style="font-size: 18px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin-bottom: 16px;">
            ${report.subject?.displayName ? `${report.subject.displayName}'s Palm Reading` : report.summary?.title}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; border-top: 1px solid ${REPORT_THEME.colors.borderSubtle}; padding-top: 14px;">
            <div>
              <span style="color: ${REPORT_THEME.colors.textDim}; display: block;">Method</span>
              <strong style="color: ${REPORT_THEME.colors.textHigh};">${report.readingMethodLabel}</strong>
            </div>
            <div>
              <span style="color: ${REPORT_THEME.colors.textDim}; display: block;">Subject Hand</span>
              <strong style="color: ${REPORT_THEME.colors.textHigh};">${hand} Hand</strong>
            </div>
            <div>
              <span style="color: ${REPORT_THEME.colors.textDim}; display: block;">Date</span>
              <strong style="color: ${REPORT_THEME.colors.textHigh};">${new Date(report.generatedAt).toLocaleDateString()}</strong>
            </div>
            <div>
              <span style="color: ${REPORT_THEME.colors.textDim}; display: block;">Capture Confidence</span>
              <strong style="color: ${REPORT_THEME.colors.gold};">${report.confidence?.band} (${Math.round((report.confidence?.qualityScore || 0.9) * 100)}%)</strong>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Executive summary & key takeaways
   */
  static renderExecutiveSummary(report) {
    const themes = report.summary?.keyThemes || [];
    return `
      <section class="kai-report-section" style="padding: 32px 24px; border-bottom: 1px solid ${REPORT_THEME.colors.borderSubtle};">
        <span style="font-size: 11px; font-weight: 700; color: ${REPORT_THEME.colors.gold}; letter-spacing: 0.15em; text-transform: uppercase;">
          Reading Overview
        </span>
        <h2 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 24px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin: 8px 0 16px;">
          ${report.summary?.headline || 'Your Reading at a Glance'}
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: ${REPORT_THEME.colors.textMuted}; margin-bottom: 24px;">
          ${report.summary?.opening}
        </p>

        <!-- Key Takeaways Cards -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${themes.map((theme, i) => `
            <div class="kai-takeaway-card" style="background: ${REPORT_THEME.colors.bgCard}; border-left: 3px solid ${REPORT_THEME.colors.gold}; border-radius: 0 ${REPORT_THEME.radii.md} ${REPORT_THEME.radii.md} 0; padding: 14px 18px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 13px; font-weight: 700; color: ${REPORT_THEME.colors.textHigh};">
                  0${i + 1} — ${theme.label}
                </span>
                <span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: rgba(255,255,255,0.06); color: ${REPORT_THEME.colors.textDim};">
                  ${theme.confidenceBand || 'MODERATE'}
                </span>
              </div>
              <p style="font-size: 13px; color: ${REPORT_THEME.colors.textMuted}; line-height: 1.5; margin: 0;">
                ${theme.insight}
              </p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Evidence-backed Palm Visualization SVG
   */
  static renderPalmVisualization(report, activeLine = null) {
    const lines = report.palmVisualization?.lines || {};
    return `
      <section class="kai-report-section" style="padding: 32px 24px; border-bottom: 1px solid ${REPORT_THEME.colors.borderSubtle};">
        <span style="font-size: 11px; font-weight: 700; color: ${REPORT_THEME.colors.gold}; letter-spacing: 0.15em; text-transform: uppercase;">
          Biometric Geometry
        </span>
        <h2 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 24px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin: 8px 0 20px;">
          Palmar Crease Mapping
        </h2>

        <div style="position: relative; width: 100%; max-width: 360px; height: 420px; margin: 0 auto; background: linear-gradient(180deg, #090e1d 0%, #04060c 100%); border-radius: ${REPORT_THEME.radii.lg}; border: 1px solid ${REPORT_THEME.colors.borderSubtle}; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
          <!-- Palm Background Watermark -->
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.12; pointer-events: none;">
            <span class="material-symbols-outlined" style="font-size: 260px; color: #fff;">front_hand</span>
          </div>

          <!-- Scalable SVG Line Overlay with Accessible Glyphs -->
          ${renderPalmLineOverlay({
            lines,
            highlightedLine: activeLine,
            showLabels: true,
            animateGlow: false
          })}
        </div>

        <!-- Accessible Semantic Legend -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 20px; font-size: 11px;">
          <span style="display: flex; align-items: center; gap: 6px; color: ${REPORT_THEME.colors.textMuted};">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${REPORT_THEME.colors.lines.life};"></span>
            Life (Ayur) ■
          </span>
          <span style="display: flex; align-items: center; gap: 6px; color: ${REPORT_THEME.colors.textMuted};">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${REPORT_THEME.colors.lines.head};"></span>
            Head (Matru) ◆
          </span>
          <span style="display: flex; align-items: center; gap: 6px; color: ${REPORT_THEME.colors.textMuted};">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${REPORT_THEME.colors.lines.heart};"></span>
            Heart (Pitri) ▲
          </span>
          <span style="display: flex; align-items: center; gap: 6px; color: ${REPORT_THEME.colors.textMuted};">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${REPORT_THEME.colors.lines.fate};"></span>
            Fate (Karma) ★
          </span>
          <span style="display: flex; align-items: center; gap: 6px; color: ${REPORT_THEME.colors.textMuted};">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${REPORT_THEME.colors.lines.sun};"></span>
            Sun (Surya) ☀
          </span>
        </div>
      </section>
    `;
  }

  /**
   * Major Lines Table & Evidence Evaluation
   */
  static renderMajorLines(report) {
    const lines = report.majorLines || [];
    return `
      <section class="kai-report-section" style="padding: 32px 24px; border-bottom: 1px solid ${REPORT_THEME.colors.borderSubtle};">
        <span style="font-size: 11px; font-weight: 700; color: ${REPORT_THEME.colors.gold}; letter-spacing: 0.15em; text-transform: uppercase;">
          Evidence Analysis
        </span>
        <h2 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 24px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin: 8px 0 20px;">
          Primary Crease Architecture
        </h2>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${lines.map(line => `
            <div class="kai-card" style="padding: 18px; background: ${REPORT_THEME.colors.bgCard}; border: 1px solid ${REPORT_THEME.colors.borderSubtle}; border-radius: ${REPORT_THEME.radii.md};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 12px; height: 12px; border-radius: 3px; background: ${line.color};"></span>
                  <h3 style="font-size: 15px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin: 0;">${line.name}</h3>
                </div>
                <span class="kai-badge" style="font-size: 10px; text-transform: uppercase;">
                  ${line.status}
                </span>
              </div>
              <p style="font-size: 13px; color: ${REPORT_THEME.colors.textHigh}; line-height: 1.5; margin-bottom: 10px;">
                <strong>Physical Observation:</strong> ${line.tier1_observation}
              </p>
              ${line.tier2_western ? `
                <div style="font-size: 12px; color: ${REPORT_THEME.colors.textMuted}; line-height: 1.4; margin-bottom: 6px; padding-left: 10px; border-left: 2px solid rgba(255,255,255,0.15);">
                  <strong>Western Tradition:</strong> ${line.tier2_western}
                </div>
              ` : ''}
              ${line.tier3_hasta_samudrika ? `
                <div style="font-size: 12px; color: ${REPORT_THEME.colors.textMuted}; line-height: 1.4; margin-bottom: 6px; padding-left: 10px; border-left: 2px solid ${REPORT_THEME.colors.gold};">
                  <strong>Hasta Samudrika:</strong> ${line.tier3_hasta_samudrika}
                </div>
              ` : ''}
              ${line.tier4_synthesis ? `
                <div style="font-size: 12px; font-style: italic; color: ${REPORT_THEME.colors.gold}; line-height: 1.4; margin-top: 8px;">
                  <strong>Synthesis:</strong> ${line.tier4_synthesis}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Narrative Chapters (Constitution, Vocation, Relationships, Guidance)
   */
  static renderChapters(report) {
    const sections = report.sections || [];
    return `
      <section class="kai-report-section" style="padding: 32px 24px; border-bottom: 1px solid ${REPORT_THEME.colors.borderSubtle};">
        <span style="font-size: 11px; font-weight: 700; color: ${REPORT_THEME.colors.gold}; letter-spacing: 0.15em; text-transform: uppercase;">
          Narrative Synthesis
        </span>
        <h2 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 24px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin: 8px 0 20px;">
          The Story of Your Hands
        </h2>

        <div style="display: flex; flex-direction: column; gap: 24px;">
          ${sections.map(section => `
            <article class="kai-chapter" style="background: ${REPORT_THEME.colors.bgCard}; border: 1px solid ${REPORT_THEME.colors.borderSubtle}; border-radius: ${REPORT_THEME.radii.lg}; padding: 22px;">
              <h3 style="font-family: ${REPORT_THEME.typography.fontDisplay}; font-size: 18px; font-weight: 600; color: ${REPORT_THEME.colors.gold}; margin: 0 0 12px;">
                ${section.heading}
              </h3>
              ${(section.paragraphs || [section.text || '']).map(p => `
                <p style="font-size: 14px; line-height: 1.7; color: ${REPORT_THEME.colors.textHigh}; margin-bottom: 12px;">
                  ${p}
                </p>
              `).join('')}
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Traditional Source Literature & Ethical Disclaimers
   */
  static renderSourcesAndDisclaimers(report) {
    const sources = report.sources || [];
    return `
      <section class="kai-report-section" style="padding: 32px 24px; background: rgba(0,0,0,0.2);">
        <span style="font-size: 11px; font-weight: 700; color: ${REPORT_THEME.colors.textDim}; letter-spacing: 0.15em; text-transform: uppercase;">
          Scholarly Citations & Epistemic Framing
        </span>
        <h3 style="font-size: 16px; font-weight: 600; color: ${REPORT_THEME.colors.textHigh}; margin: 8px 0 14px;">
          Traditional Source Concordance
        </h3>
        
        <ul style="padding-left: 18px; margin: 0 0 24px; font-size: 12px; color: ${REPORT_THEME.colors.textMuted}; line-height: 1.6;">
          ${sources.map(s => `
            <li><strong>${s.tradition}:</strong> ${s.name}</li>
          `).join('')}
        </ul>

        <div style="border-top: 1px solid ${REPORT_THEME.colors.borderSubtle}; padding-top: 16px; font-size: 11px; color: ${REPORT_THEME.colors.textDim}; line-height: 1.5;">
          <p style="margin: 0 0 8px;">
            <strong>Ethical & Reflective Disclaimer:</strong> ${report.export?.disclaimer}
          </p>
          <p style="margin: 0;">
            ${REPORT_THEME.brand.copyright}
          </p>
        </div>
      </section>
    `;
  }
}
