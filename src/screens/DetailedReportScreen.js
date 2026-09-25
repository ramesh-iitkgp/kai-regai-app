/**
 * DetailedReportScreen Component — Mode 2 Comprehensive Multi-Chapter Dossier
 * Matches Stitch: design/stitch/kai_regai_detailed_report_hastarekha_synthesis/
 * Source of truth: docs/p2/REPORT_ARCHITECTURE.md (SCR-PLM-005)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { renderPalmLineOverlay } from '../components/PalmLineOverlay.js';

export function renderDetailedReportScreen(container, params = {}) {
  const reading = params.dossier || mockReadings.find(r => r.id === params.id) || mockReadings[1];
  const isQuestionnaire = reading.reading_method === 'GUIDED_QUESTIONNAIRE' ||
                          params.featureModel?.provenance?.reading_method === 'GUIDED_QUESTIONNAIRE' ||
                          params.featureModel?.provenance?.mode === 'MODE_2_QUESTIONNAIRE';
  const handSide = params.featureModel?.hand?.side || reading.hand_side || 'Right';
  const methodLabel = reading.reading_method_label || (isQuestionnaire ? 'Guided Palm Reading' : 'Vedic Synthesis');

  let activeTab = router.preservedState.detailedReportTab || 'OVERVIEW';
  let activeLine = router.preservedState.detailedReportLine || 'LIFE';
  let activeFeature = router.preservedState.detailedReportFeature || 'MOUNTS';

  function render() {
    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Top Action Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button id="detail-back-btn" class="kai-btn-icon" aria-label="Back">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            ${isQuestionnaire ? 'Guided Dossier • Mode 2' : 'Hastarekha Dossier'}
          </span>
          <button id="detail-export-btn" class="kai-btn-icon" aria-label="Export PDF">
            <span class="material-symbols-outlined">picture_as_pdf</span>
          </button>
        </div>

        <!-- Dossier Header & Title -->
        <div style="border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.1em; text-transform: uppercase;">
              ${methodLabel} • ${handSide} Hand
            </span>
          </div>
          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--color-text-high);">
            ${reading.title}
          </h1>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.4;">
            ${reading.summary}
          </p>
        </div>

        <!-- Primary Dossier Tabs: OVERVIEW | LINES | FEATURES | SYNTHESIS -->
        <div class="kai-tabs-bar" role="tablist">
          <button class="kai-tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}" data-tab="OVERVIEW">Overview</button>
          <button class="kai-tab-btn ${activeTab === 'LINES' ? 'active' : ''}" data-tab="LINES">Major Lines</button>
          <button class="kai-tab-btn ${activeTab === 'FEATURES' ? 'active' : ''}" data-tab="FEATURES">Mounts & Marks</button>
          <button class="kai-tab-btn ${activeTab === 'SYNTHESIS' ? 'active' : ''}" data-tab="SYNTHESIS">Synthesis</button>
        </div>

        <!-- Tab Content Viewport -->
        <div id="tab-content-area">
          ${renderTabContent()}
        </div>

      </div>
    `;

    // Tab Bar Listeners
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        router.preservedState.detailedReportTab = activeTab;
        render();
      });
    });

    // Secondary Selectors inside Lines tab
    container.querySelectorAll('[data-line-sel]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLine = btn.getAttribute('data-line-sel');
        router.preservedState.detailedReportLine = activeLine;
        render();
      });
    });

    // Action Listeners
    container.querySelector('#detail-back-btn')?.addEventListener('click', () => {
      if (params.dossier || params.featureModel) {
        router.navigate(ROUTES.QUICK_REPORT, params);
      } else {
        router.navigate(ROUTES.READINGS);
      }
    });

    container.querySelector('#detail-export-btn')?.addEventListener('click', () => {
      router.openModal('pdf_export', { title: reading.title });
    });
  }

  function renderTabContent() {
    if (activeTab === 'OVERVIEW') {
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Palm Visualization Viewport with Interactive Overlays -->
          <div style="position: relative; width: 100%; height: 220px; border-radius: var(--radius-lg); overflow: hidden; background: var(--color-surface-container-lowest); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: center;">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPH52puV1GapnfmvKBwXyAYdXh9B_GfqmOX2g9D-N3HkU7pOGrvTD7ZK8Gty0A1ytEtJGj4udfEMBoVJ8WENL9wNzr0Bd6PKHkZGZxkP6La8NB74RHPb4hxf3c_8FscpS1Urkgw5i6oj2iqd_KWVP0twOkkdmE9A2oW8Jy2nQmYxt69BUkKsGCPBdBTjst7eJyyQM8dvpLo375TWFW6pPk_dKv8DXljfBSliVtbkwsBsAJaUXFe5EYKtlb7oh9Qh_mKQ" 
                 alt="Detailed palm scan" 
                 style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
            <div style="position: absolute; inset: 0; background: radial-gradient(circle, transparent 40%, rgba(10,14,26,0.9) 100%);"></div>
            ${renderPalmLineOverlay()}
          </div>

          <!-- Constitutional Matrix -->
          <div class="kai-card kai-card-gold-rim" style="padding: 16px; background: var(--color-surface-container);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
                Constitutional Archetype
              </span>
              <span class="kai-badge kai-badge-primary">Fire-Earth Hybrid</span>
            </div>
            <p style="font-size: 13px; color: var(--color-text-high); line-height: 1.5;">
              ${reading.synthesis_chapters.constitution}
            </p>
          </div>

          <!-- Highlights Chips -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="kai-card" style="padding: 12px; background: var(--color-surface-container-high);">
              <span style="font-size: 10px; font-weight: 700; color: var(--color-tertiary); text-transform: uppercase;">Primary Gift</span>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">Creative Pragmatism</h4>
            </div>
            <div class="kai-card" style="padding: 12px; background: var(--color-surface-container-high);">
              <span style="font-size: 10px; font-weight: 700; color: var(--color-secondary); text-transform: uppercase;">Auspicious Mark</span>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">Jupiter Trident</h4>
            </div>
          </div>
        </div>
      `;
    }

    if (activeTab === 'LINES') {
      const lineMap = {
        LIFE: reading.major_lines[0],
        HEAD: reading.major_lines[1],
        HEART: reading.major_lines[2],
        FATE: reading.major_lines[3],
        SUN: reading.major_lines[4]
      };
      const curLine = lineMap[activeLine] || reading.major_lines[0];

      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Secondary Line Selector Pills -->
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
            <button class="kai-badge ${activeLine === 'LIFE' ? 'kai-badge-primary' : ''}" data-line-sel="LIFE" style="cursor: pointer; padding: 6px 12px; border-radius: var(--radius-full);">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background: #A855F7; margin-right: 4px;"></span> Life Line
            </button>
            <button class="kai-badge ${activeLine === 'HEAD' ? 'kai-badge-primary' : ''}" data-line-sel="HEAD" style="cursor: pointer; padding: 6px 12px; border-radius: var(--radius-full);">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background: #00D2FF; margin-right: 4px;"></span> Head Line
            </button>
            <button class="kai-badge ${activeLine === 'HEART' ? 'kai-badge-primary' : ''}" data-line-sel="HEART" style="cursor: pointer; padding: 6px 12px; border-radius: var(--radius-full);">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background: #F43F5E; margin-right: 4px;"></span> Heart Line
            </button>
            <button class="kai-badge ${activeLine === 'FATE' ? 'kai-badge-primary' : ''}" data-line-sel="FATE" style="cursor: pointer; padding: 6px 12px; border-radius: var(--radius-full);">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background: #FBBF24; margin-right: 4px;"></span> Fate Line
            </button>
            <button class="kai-badge ${activeLine === 'SUN' ? 'kai-badge-primary' : ''}" data-line-sel="SUN" style="cursor: pointer; padding: 6px 12px; border-radius: var(--radius-full);">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background: #F59E0B; margin-right: 4px;"></span> Sun Line
            </button>
          </div>

          <!-- Active Isolated Line Telemetry Plate -->
          <div class="kai-card" style="padding: 18px; border-left: 4px solid ${curLine.color}; background: var(--color-surface-container);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--color-text-high);">
                ${curLine.name}
              </h3>
              <span class="kai-badge" style="font-size: 10px; color: ${curLine.color}; border-color: ${curLine.color};">
                Active Isolation
              </span>
            </div>

            <!-- Epistemic Layer 1: Physical Observation -->
            <div style="margin-bottom: 14px;">
              <span style="font-size: 10px; font-weight: 700; color: var(--color-tertiary); letter-spacing: 0.08em; text-transform: uppercase;">
                1. Biometric Observation
              </span>
              <p style="font-size: 13px; color: var(--color-text-high); margin-top: 4px; line-height: 1.5;">
                ${curLine.observation}
              </p>
            </div>

            <!-- Epistemic Layer 2: Traditional Interpretation -->
            <div style="margin-bottom: 14px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
              <span style="font-size: 10px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
                2. Traditional Literature Interpretation
              </span>
              <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.5;">
                ${curLine.traditional_interpretation}
              </p>
            </div>

            <!-- Epistemic Layer 3: Kai RegAI Synthesis -->
            <div style="padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
              <span style="font-size: 10px; font-weight: 700; color: var(--color-primary); letter-spacing: 0.08em; text-transform: uppercase;">
                3. Kai RegAI Synthesis
              </span>
              <p style="font-size: 13px; color: var(--color-text-high); margin-top: 4px; line-height: 1.5; font-style: italic;">
                "${curLine.synthesis}"
              </p>
            </div>
          </div>
        </div>
      `;
    }

    if (activeTab === 'FEATURES') {
      const feat = reading.features || { mounts: [], thumb: {}, markings: [] };
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Mounts Grid -->
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
              Celestial Mounts
            </span>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              ${(feat.mounts || []).map(m => `
                <div class="kai-card" style="padding: 12px 14px; background: var(--color-surface-container);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 18px;">${m.icon}</span>
                    <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">${m.name}</h4>
                  </div>
                  <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px;">${m.note}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Thumb Biomechanics -->
          <div class="kai-card" style="padding: 16px; background: var(--color-surface-container-high);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-tertiary); text-transform: uppercase;">
              Thumb Biomechanics & Angle
            </span>
            <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high); margin-top: 4px;">
              ${feat.thumb?.angle || '58° Supple Arc'} • ${feat.thumb?.balance || 'Balanced Will & Logic'}
            </h4>
            <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 6px;">
              ${feat.thumb?.interpretation || 'Adaptable intellect with stable ethical boundaries.'}
            </p>
          </div>

          <!-- Sacred Markings -->
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.08em; text-transform: uppercase;">
              Auspicious Vedic Markings
            </span>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              ${(feat.markings || []).map(mk => `
                <div class="kai-card kai-card-gold-rim" style="padding: 12px 14px; background: var(--color-surface-container);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="font-size: 13px; font-weight: 600; color: var(--color-secondary);">${mk.name}</h4>
                    <span class="kai-badge" style="font-size: 9px; background: rgba(228,194,118,0.15); color: var(--color-secondary);">${mk.tradition}</span>
                  </div>
                  <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px;">${mk.note}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (activeTab === 'SYNTHESIS') {
      const syn = reading.synthesis_chapters;
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Chapter 1: Vocation -->
          <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
              Chapter I: Karmic Vocation & Purpose
            </span>
            <p style="font-size: 13px; color: var(--color-text-high); margin-top: 8px; line-height: 1.6;">
              ${syn.vocation}
            </p>
          </div>

          <!-- Chapter 2: Relationships -->
          <div class="kai-card" style="padding: 18px; background: var(--color-surface-container);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-line-heart); letter-spacing: 0.08em; text-transform: uppercase;">
              Chapter II: Relational Affinity & Boundaries
            </span>
            <p style="font-size: 13px; color: var(--color-text-high); margin-top: 8px; line-height: 1.6;">
              ${syn.relationships || 'Your heart orientation prioritizes substantive depth over superficial connections.'}
            </p>
          </div>

          <!-- Chapter 3: Contemplative Guidance -->
          <div class="kai-card kai-card-gold-rim" style="padding: 18px; background: var(--color-surface-container-high);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-tertiary); letter-spacing: 0.08em; text-transform: uppercase;">
              Chapter III: Contemplative Counsel
            </span>
            <p style="font-size: 13px; color: var(--color-text-high); margin-top: 8px; line-height: 1.6; font-style: italic;">
              ${syn.guidance}
            </p>
          </div>
        </div>
      `;
    }

    return '';
  }

  render();
}
