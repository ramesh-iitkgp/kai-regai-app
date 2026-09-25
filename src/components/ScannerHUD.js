/**
 * ScannerHUD Component — Vedic Precision Camera Viewfinder & Real-Time Quality HUD
 * Phase: P6 — Hand Scanner Experience
 * Matches Stitch: design/stitch/kai_regai_hand_scanner_hud/
 * Source of truth: docs/p2/HAND_SCANNER_FLOW.md & docs/p6/P6_SCANNER_UX_SPEC.md
 */

import { renderPalmLineOverlay } from './PalmLineOverlay.js';
import { SCANNER_STATES } from '../scanner/ScannerStateMachine.js';

export function renderScannerHUD({
  handSide = 'RIGHT',
  state = SCANNER_STATES.SEARCHING_FOR_HAND,
  feedbackMessage = 'Align your palm with the guide',
  guidanceDetail = [],
  diagnosticCode = null,
  stabilityCount = 0,
  stabilityTarget = 3,
  countdown = 3,
  isTorchOn = false,
  showDiagnostics = false,
  diagnosticsData = null,
  showIntro = false,
  hasVideo = true
} = {}) {
  const isSearching = state === SCANNER_STATES.SEARCHING_FOR_HAND || state === SCANNER_STATES.INITIALIZING;
  const isAligning = state === SCANNER_STATES.PALM_ALIGNING || state === SCANNER_STATES.HAND_DETECTED;
  const isStabilizing = state === SCANNER_STATES.STABILIZING;
  const isReady = state === SCANNER_STATES.READY;
  const isCountdown = state === SCANNER_STATES.COUNTDOWN;
  const isCapturing = state === SCANNER_STATES.CAPTURING;
  const isProcessing = state === SCANNER_STATES.PROCESSING || state === SCANNER_STATES.VALIDATING;
  const isRetake = state === SCANNER_STATES.RETAKE;
  const isError = state === SCANNER_STATES.ERROR;

  // Reticle accent color based on state
  let reticleColor = 'var(--color-secondary)'; // Gold
  let reticleGlow = 'rgba(228, 194, 118, 0.4)';
  if (isSearching) {
    reticleColor = 'var(--color-outline)';
    reticleGlow = 'none';
  } else if (isStabilizing) {
    reticleColor = 'var(--color-tertiary)'; // Cyan
    reticleGlow = 'rgba(71, 214, 255, 0.7)';
  } else if (isReady || isCountdown) {
    reticleColor = '#10B981'; // Emerald Green
    reticleGlow = 'rgba(16, 185, 129, 0.8)';
  } else if (isRetake || isError) {
    reticleColor = 'var(--color-error)';
    reticleGlow = 'rgba(244, 63, 94, 0.6)';
  }

  // Stability progress bar percentage
  const stabilityPercent = Math.min(100, Math.round((stabilityCount / (stabilityTarget || 1)) * 100));

  return `
    <div class="scanner-hud-container" style="position: relative; width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 16px 24px; background: var(--color-background); overflow: hidden; user-select: none;">
      
      <!-- Top Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; z-index: 25; padding-top: max(8px, env(safe-area-inset-top));">
        <button id="scanner-exit-btn" class="kai-btn-icon" aria-label="Exit scanner" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: var(--radius-full); background: rgba(27, 31, 45, 0.85); backdrop-filter: blur(12px); border: 1px solid var(--color-border-subtle);">
          <span style="width: 7px; height: 7px; border-radius: 9999px; background: ${reticleColor}; box-shadow: 0 0 8px ${reticleGlow};" class="${isStabilizing || isCountdown ? 'glow-pulsing' : ''}"></span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-text-high); letter-spacing: 0.08em; text-transform: uppercase;">
            ${handSide} Hand • Mode 1
          </span>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="scanner-torch-btn" class="kai-btn-icon" aria-label="Toggle flashlight" type="button" style="${isTorchOn ? 'background: var(--color-secondary); color: #000;' : ''}">
            <span class="material-symbols-outlined">${isTorchOn ? 'flash_off' : 'flash_on'}</span>
          </button>
          <button id="scanner-flip-btn" class="kai-btn-icon" aria-label="Switch hand" type="button" title="Switch Hand">
            <span class="material-symbols-outlined">front_hand</span>
          </button>
        </div>
      </div>

      <!-- Center Viewfinder with Real Video Stream & Palm Reticle -->
      <div id="viewfinder-box" style="position: relative; width: 100%; aspect-ratio: 4/5; margin: 8px 0; border-radius: var(--radius-xl); overflow: hidden; background: #050811; box-shadow: var(--shadow-modal); display: flex; align-items: center; justify-content: center;">
        
        <!-- Live Video Element attached to MediaStream -->
        <video id="scanner-video-feed" playsinline autoplay muted style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; transform: ${handSide === 'LEFT' ? 'scaleX(-1)' : 'none'};"></video>

        <!-- High-contrast atmospheric fallback image (visible when stream loading) -->
        <img id="scanner-fallback-img" 
             src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2oNLuCqgmkZOjy5WtDmuwiq-ek3dL4voCj9NN6mJcrwt6EuWSslznL-7exzbwCM0kU4wE6_oJkgm8JOy8WDIDH8NltNQPh86n00LU7CKYs4JxJOoQ8HyyPmvBFlXC-uUAG8imeknXpRjRjnzPHPj9dfvFAdGRZg5GgaXzoKosXhSBwL3K3S8UDU7QAYP7Op5zkhAAYmzbT0QU5JjEa5h_RgHlpXXOamJ_mklvSrHxMp-SbqQV9pGDjshN-o0t2izmtQ" 
             alt="Palm viewfinder preview" 
             style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.15; filter: contrast(1.1) brightness(0.95); z-index: 0; pointer-events: none;">

        <!-- Scrim Vignette Gradient -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, transparent 45%, rgba(10, 14, 26, 0.88) 100%); pointer-events: none; z-index: 5;"></div>

        <!-- Palm Alignment Reticle (Stylized Anatomical Guide) -->
        <svg viewBox="0 0 360 450" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; transition: stroke 0.3s ease;" fill="none">
          <!-- Mount Reticle Rings -->
          <circle cx="180" cy="225" r="95" fill="rgba(202, 190, 255, 0.04)"/>
          <circle cx="180" cy="225" r="130" stroke="${reticleColor}" stroke-dasharray="3 6" stroke-opacity="0.3" stroke-width="1.2"/>
          <circle cx="180" cy="225" r="70" stroke="${reticleColor}" stroke-dasharray="2 4" stroke-opacity="0.35" stroke-width="1"/>

          <!-- Framing Corner Brackets -->
          <path d="M 28 55 L 28 32 C 28 26 32 22 38 22 L 68 22" stroke="${reticleColor}" stroke-linecap="round" stroke-width="2.5"/>
          <path d="M 332 55 L 332 32 C 332 26 328 22 322 22 L 292 22" stroke="${reticleColor}" stroke-linecap="round" stroke-width="2.5"/>
          <path d="M 28 395 L 28 418 C 28 424 32 428 38 428 L 68 428" stroke="${reticleColor}" stroke-linecap="round" stroke-width="2.5"/>
          <path d="M 332 395 L 332 418 C 332 424 328 428 322 428 L 292 428" stroke="${reticleColor}" stroke-linecap="round" stroke-width="2.5"/>

          <!-- Palm Silhouette Contour Guide -->
          <path d="M 180 395 C 130 390 95 330 92 260 C 90 200 105 160 115 110 C 120 85 138 85 142 110 C 145 75 165 70 170 100 C 175 65 195 65 200 95 C 205 75 225 80 228 115 C 235 155 268 210 268 270 C 268 335 230 390 180 395 Z" 
                stroke="${reticleColor}" 
                stroke-opacity="${isReady ? '0.7' : '0.25'}" 
                stroke-width="1.5" 
                stroke-dasharray="${isReady ? 'none' : '4 6'}" 
                fill="${isReady ? 'rgba(16, 185, 129, 0.05)' : 'none'}"/>
        </svg>

        <!-- Dynamic Laser Sweep Bar (Active during Alignment / Processing) -->
        <div class="laser-beam" style="position: absolute; top: 10%; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent 0%, ${reticleColor} 50%, transparent 100%); box-shadow: 0 0 12px ${reticleGlow}; z-index: 18; pointer-events: none; opacity: ${isSearching || isProcessing ? 1 : 0.4};"></div>

        <!-- Big Countdown Overlay (3, 2, 1) -->
        ${isCountdown ? `
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 30; background: rgba(10, 14, 26, 0.45); backdrop-filter: blur(4px);">
            <span style="font-family: var(--font-display); font-size: 80px; font-weight: 700; color: #10B981; text-shadow: 0 0 25px rgba(16, 185, 129, 0.9);" class="glow-pulsing">
              ${countdown}
            </span>
            <span style="font-size: 13px; font-weight: 600; color: #fff; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 8px;">
              Hold Steady
            </span>
          </div>
        ` : ''}

        <!-- Camera Shutter Flash Effect (CAPTURING) -->
        <div id="shutter-flash" style="position: absolute; inset: 0; background: #fff; opacity: ${isCapturing ? '0.9' : '0'}; pointer-events: none; z-index: 40; transition: opacity 0.25s ease;"></div>

        <!-- In-Viewfinder Real-Time Guidance Pill -->
        <div style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; justify-content: center; z-index: 20; pointer-events: none;">
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--radius-full); background: rgba(15, 20, 32, 0.85); backdrop-filter: blur(12px); border: 1px solid ${isRetake ? 'var(--color-error)' : 'var(--color-border-subtle)'}; box-shadow: 0 4px 16px rgba(0,0,0,0.5); max-width: 90%;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: ${reticleColor};">
              ${isReady || isCountdown ? 'check_circle' : (isRetake ? 'warning' : 'pan_tool')}
            </span>
            <span style="font-size: 12px; font-weight: 600; color: var(--color-text-high); text-align: center;">
              ${feedbackMessage}
            </span>
          </div>
        </div>

        <!-- Stability Meter Bar (Bottom of Viewfinder) -->
        <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; z-index: 20; pointer-events: auto;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; margin-bottom: 4px;">
            <span style="color: var(--color-on-surface-variant); font-weight: 600;">
              ${isStabilizing ? 'Stabilizing…' : (isReady ? '✓ Frame Locked' : 'Alignment Meter')}
            </span>
            <button id="toggle-diagnostics-btn" type="button" style="background: none; border: none; font-family: monospace; font-size: 10px; color: var(--color-secondary); cursor: pointer; padding: 2px 4px;">
              ${showDiagnostics ? 'DIAGNOSTICS ▲' : 'DIAGNOSTICS ▼'}
            </button>
          </div>
          <div style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 9999px; overflow: hidden;">
            <div style="width: ${stabilityPercent}%; height: 100%; background: ${isReady ? '#10B981' : 'var(--color-secondary)'}; transition: width 0.2s ease, background 0.2s ease;"></div>
          </div>
        </div>

        <!-- Developer Diagnostics Overlay (Hidden unless toggled) -->
        ${showDiagnostics ? `
          <div style="position: absolute; top: 60px; left: 12px; right: 12px; padding: 12px; border-radius: var(--radius-md); background: rgba(5, 8, 17, 0.92); border: 1px solid var(--color-secondary); color: #fff; font-family: monospace; font-size: 11px; z-index: 35; backdrop-filter: blur(8px);">
            <div style="font-weight: 700; color: var(--color-secondary); margin-bottom: 6px; border-bottom: 1px solid rgba(228,194,118,0.3); padding-bottom: 2px;">
              P5.2 TELEMETRY & DIAGNOSTICS
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div>STATE: <span style="color: var(--color-tertiary);">${state}</span></div>
              <div>STABILITY: ${stabilityCount}/${stabilityTarget}</div>
              <div>HAND: ${handSide}</div>
              <div>CODE: ${diagnosticCode || 'NONE'}</div>
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Human-Readable Guidance & Quality Badges -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin: 4px 0 12px;">
        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
          <span class="kai-badge ${isSearching ? 'kai-badge-neutral' : 'kai-badge-cyan'}" style="font-size: 10px;">
            <span class="material-symbols-outlined" style="font-size: 12px;">wb_sunny</span>
            <span>${isSearching ? 'Checking Light…' : 'Good Lighting'}</span>
          </span>
          <span class="kai-badge ${isAligning || isSearching ? 'kai-badge-neutral' : 'kai-badge-secondary'}" style="font-size: 10px;">
            <span class="material-symbols-outlined" style="font-size: 12px;">straighten</span>
            <span>${isSearching ? 'Distance…' : 'Position Good'}</span>
          </span>
          <span class="kai-badge ${isStabilizing || isReady ? 'kai-badge-primary' : 'kai-badge-neutral'}" style="font-size: 10px;">
            <span class="material-symbols-outlined" style="font-size: 12px;">pan_tool</span>
            <span>${isReady ? 'Ready' : (isStabilizing ? 'Holding Steady' : 'Steady Hand')}</span>
          </span>
        </div>
      </div>

      <!-- Bottom Primary Action Controller -->
      <div style="z-index: 25; display: flex; flex-direction: column; gap: 10px;">
        ${isReady || isCountdown ? `
          <button id="scanner-capture-btn" class="kai-btn kai-btn-gold" type="button" style="box-shadow: 0 0 20px rgba(228, 194, 118, 0.4);">
            <span class="material-symbols-outlined">photo_camera</span>
            <span>Capture Now</span>
          </button>
        ` : (isProcessing ? `
          <button class="kai-btn kai-btn-secondary" type="button" disabled style="opacity: 0.85;">
            <span class="material-symbols-outlined glow-pulsing">sync</span>
            <span>Analyzing Crease Geometry…</span>
          </button>
        ` : (isRetake ? `
          <button id="scanner-retry-btn" class="kai-btn kai-btn-primary" type="button">
            <span class="material-symbols-outlined">refresh</span>
            <span>Recapture Palm</span>
          </button>
        ` : `
          <button id="scanner-manual-trigger-btn" class="kai-btn kai-btn-primary" type="button">
            <span class="material-symbols-outlined">document_scanner</span>
            <span>${isStabilizing ? 'Hold Steady to Auto-Capture' : 'Align Palm to Scan'}</span>
          </button>
        `))}
      </div>

    </div>
  `;
}
