import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { renderPalmLineOverlay } from '../components/PalmLineOverlay.js';
import { PalmFeatureModelAdapter } from '../cv/adapters/PalmFeatureModelAdapter.js';

/**
 * Format line status display badge and honest epistemic observation
 */
function getLinePresentation(lineKey, lineData) {
  const lineLabels = {
    life: { name: 'Life Line (Ayur Rekha)', color: '#A855F7', symbol: 'vitality' },
    head: { name: 'Head Line (Matru Rekha)', color: '#00D2FF', symbol: 'intellect' },
    heart: { name: 'Heart Line (Pitri Rekha)', color: '#F43F5E', symbol: 'emotion' },
    fate: { name: 'Fate Line (Karma Rekha)', color: '#FBBF24', symbol: 'destiny' },
    sun: { name: 'Sun Line (Surya Rekha)', color: '#F59E0B', symbol: 'radiance' }
  };

  const meta = lineLabels[lineKey] || { name: lineKey, color: '#A855F7', symbol: 'crease' };
  const status = lineData?.status || (lineData?.detected ? 'DETECTED' : 'NOT_DETECTED');

  let badgeText = 'Observed';
  let badgeClass = 'kai-badge-secondary';
  let observation = '';

  switch (status) {
    case 'DETECTED':
      badgeText = 'Detected';
      badgeClass = 'kai-badge-tertiary';
      if (lineKey === 'life') observation = 'Continuous curvature observed wrapping the thenar eminence with clear furrow contrast.';
      else if (lineKey === 'head') observation = 'Distinct transverse trajectory running across the mid-palm with stable orientation.';
      else if (lineKey === 'heart') observation = 'Upper curvilinear crease terminating near the index/middle digit base.';
      else if (lineKey === 'fate') observation = 'Central vertical furrow ascending along the longitudinal palm axis.';
      else if (lineKey === 'sun') observation = 'Vertical crease observed below the solar mount region.';
      break;

    case 'PARTIAL':
    case 'WEAK':
      badgeText = status === 'PARTIAL' ? 'Partial' : 'Faint';
      badgeClass = 'kai-badge-secondary';
      observation = `Faint or fragmented crease traces observed (${Math.round((lineData?.confidence || 0.5) * 100)}% detection confidence).`;
      break;

    case 'OUT_OF_FRAME':
      badgeText = 'Out of Frame';
      badgeClass = 'kai-badge-primary';
      observation = 'Crease trajectory lies near or outside the captured optical sensor boundary. Not biologically absent.';
      break;

    case 'NOT_DETECTED':
    default:
      badgeText = 'Not Clearly Visible';
      badgeClass = 'kai-badge-primary';
      observation = 'Not clearly discerned in this scan under current illumination and crease angle.';
      break;
  }

  return {
    ...meta,
    status,
    badgeText,
    badgeClass,
    observation
  };
}

export function renderQuickReportScreen(container, params = {}) {
  const { visionResult, featureModel, capturedImage } = params;
  const reading = mockReadings[0];

  // Derive display values from real feature model if available
  const hasRealScan = Boolean(featureModel || visionResult);
  const handSide = featureModel?.hand?.side || visionResult?.hand?.handedness || 'RIGHT';
  const qualityScorePct = Math.round(
    (featureModel?.quality_score ?? visionResult?.imageQuality?.score ?? 0.94) * 100
  );

  // Build SVG paths for detected lines
  let dynamicLines = null;
  let lineItems = [];

  if (featureModel?.major_lines) {
    const ml = featureModel.major_lines;
    dynamicLines = {
      life: {
        path: PalmFeatureModelAdapter.polylineToSvgPath(ml.life_line?.polyline, 360, 450),
        status: ml.life_line?.status,
        detected: ml.life_line?.detected
      },
      head: {
        path: PalmFeatureModelAdapter.polylineToSvgPath(ml.head_line?.polyline, 360, 450),
        status: ml.head_line?.status,
        detected: ml.head_line?.detected
      },
      heart: {
        path: PalmFeatureModelAdapter.polylineToSvgPath(ml.heart_line?.polyline, 360, 450),
        status: ml.heart_line?.status,
        detected: ml.heart_line?.detected
      },
      fate: {
        path: PalmFeatureModelAdapter.polylineToSvgPath(ml.fate_line?.polyline, 360, 450),
        status: ml.fate_line?.status,
        detected: ml.fate_line?.detected
      },
      sun: {
        path: PalmFeatureModelAdapter.polylineToSvgPath(ml.sun_line?.polyline, 360, 450),
        status: ml.sun_line?.status,
        detected: ml.sun_line?.detected
      }
    };

    lineItems = [
      getLinePresentation('life', ml.life_line),
      getLinePresentation('head', ml.head_line),
      getLinePresentation('heart', ml.heart_line),
      getLinePresentation('fate', ml.fate_line),
      getLinePresentation('sun', ml.sun_line)
    ];
  } else {
    // Fallback to mock reading presentation
    lineItems = reading.major_lines.map(l => ({
      name: l.name,
      color: l.color,
      status: 'DETECTED',
      badgeText: 'Observed',
      badgeClass: 'kai-badge-secondary',
      observation: l.observation
    }));
  }

  // Visualization image source (captured frame or placeholder)
  const palmImgSrc = capturedImage || 
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDPH52puV1GapnfmvKBwXyAYdXh9B_GfqmOX2g9D-N3HkU7pOGrvTD7ZK8Gty0A1ytEtJGj4udfEMBoVJ8WENL9wNzr0Bd6PKHkZGZxkP6La8NB74RHPb4hxf3c_8FscpS1Urkgw5i6oj2iqd_KWVP0twOkkdmE9A2oW8Jy2nQmYxt69BUkKsGCPBdBTjst7eJyyQM8dvpLo375TWFW6pPk_dKv8DXljfBSliVtbkwsBsAJaUXFe5EYKtlb7oh9Qh_mKQ';

  container.innerHTML = `
    <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Top Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="quick-back-btn" class="kai-btn-icon" aria-label="Back to Scanner">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
          ${hasRealScan ? 'Live Biometric Scan • Mode 1' : 'Rapid Scan • Mode 1'}
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
              ${handSide} Hand • Dominant
            </span>
          </div>
          <span style="font-family: monospace; font-size: 11px; color: var(--color-secondary);" title="Optical image quality (illumination, sharpness, framing)">
            IMAGE QUALITY: ${qualityScorePct}%
          </span>
        </div>

        <!-- Palm Visualization Device Viewport -->
        <div style="position: relative; width: 100%; height: 220px; border-radius: var(--radius-md); overflow: hidden; background: var(--color-surface-container-lowest); margin-bottom: 16px;">
          <img src="${palmImgSrc}" 
               alt="Scanned palm visualization" 
               style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85; mix-blend-mode: screen;">
          
          <div style="position: absolute; inset: 0; background: radial-gradient(circle, transparent 40%, rgba(10,14,26,0.9) 100%);"></div>
          ${renderPalmLineOverlay({ lines: dynamicLines })}
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

        ${lineItems.map(line => `
          <div class="kai-card" style="padding: 14px 16px; border-left: 3px solid ${line.color}; background: var(--color-surface-container);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${line.color}; box-shadow: 0 0 8px ${line.color};"></span>
                <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${line.name}</h4>
              </div>
              <span class="kai-badge ${line.badgeClass}" style="font-size: 9px;">${line.badgeText}</span>
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

  document.getElementById('quick-back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.SCANNER);
  });
  document.getElementById('quick-done-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.HOME);
  });
  document.getElementById('quick-explore-full-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.DETAILED_REPORT, { 
      id: reading.id,
      featureModel,
      visionResult
    });
  });
  document.getElementById('quick-share-btn')?.addEventListener('click', () => {
    router.openModal('pdf_export', { title: reading.title });
  });
}

