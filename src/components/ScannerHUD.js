/**
 * ScannerHUD Component — Vedic Precision Camera Viewfinder
 * Matches Stitch: design/stitch/kai_regai_hand_scanner_hud/
 */

import { renderPalmLineOverlay } from './PalmLineOverlay.js';

export function renderScannerHUD({
  handSide = 'RIGHT',
  qualityState = 'GOOD',
  isTorchOn = false,
  onStartScan = () => {},
  onExit = () => {},
  onToggleTorch = () => {},
  onFlipCamera = () => {}
} = {}) {
  return `
    <div class="scanner-hud-container" style="position: relative; width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 16px 24px; background: var(--color-background); overflow: hidden;">
      
      <!-- Top Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; z-index: 20; padding-top: max(8px, env(safe-area-inset-top));">
        <button id="scanner-exit-btn" class="kai-btn-icon" aria-label="Exit scanner" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: var(--radius-full); background: rgba(27, 31, 45, 0.85); backdrop-filter: blur(12px); border: 1px solid var(--color-border-subtle);">
          <span style="width: 7px; height: 7px; border-radius: 9999px; background: var(--color-secondary); box-shadow: 0 0 8px rgba(228,194,118,0.8);" class="glow-pulsing"></span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            Align Palm • ${handSide} Hand
          </span>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="scanner-torch-btn" class="kai-btn-icon" aria-label="Toggle flashlight" type="button" style="${isTorchOn ? 'background: var(--color-secondary); color: #000;' : ''}">
            <span class="material-symbols-outlined">${isTorchOn ? 'flash_off' : 'flash_on'}</span>
          </button>
          <button id="scanner-flip-btn" class="kai-btn-icon" aria-label="Flip camera" type="button">
            <span class="material-symbols-outlined">flip_camera_ios</span>
          </button>
        </div>
      </div>

      <!-- Center Viewfinder with Reticle & Palm Vector Layer -->
      <div style="position: relative; width: 100%; aspect-ratio: 4/5; margin: 12px 0; border-radius: var(--radius-xl); overflow: hidden; background: var(--color-surface-container-lowest); box-shadow: var(--shadow-modal); display: flex; align-items: center; justify-content: center;">
        
        <!-- High-contrast atmospheric palm preview backdrop -->
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2oNLuCqgmkZOjy5WtDmuwiq-ek3dL4voCj9NN6mJcrwt6EuWSslznL-7exzbwCM0kU4wE6_oJkgm8JOy8WDIDH8NltNQPh86n00LU7CKYs4JxJOoQ8HyyPmvBFlXC-uUAG8imeknXpRjRjnzPHPj9dfvFAdGRZg5GgaXzoKosXhSBwL3K3S8UDU7QAYP7Op5zkhAAYmzbT0QU5JjEa5h_RgHlpXXOamJ_mklvSrHxMp-SbqQV9pGDjshN-o0t2izmtQ" 
             alt="Real-time palm optical capture stream" 
             style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.85; filter: contrast(1.1) brightness(0.95);">

        <!-- Scrim gradient -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, transparent 40%, rgba(10, 14, 26, 0.85) 100%); pointer-events: none;"></div>

        <!-- Sacred Vedic Reticle (SVG Quadrants & Rings) -->
        <svg viewBox="0 0 360 450" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;" fill="none">
          <circle cx="180" cy="225" r="95" fill="rgba(202, 190, 255, 0.08)"/>
          <circle cx="180" cy="225" r="130" stroke="#e4c276" stroke-dasharray="2 6" stroke-opacity="0.25" stroke-width="1"/>
          <circle cx="180" cy="225" r="70" stroke="#cabeff" stroke-dasharray="1 4" stroke-opacity="0.3" stroke-width="1"/>

          <!-- Framing Corner Brackets -->
          <path d="M 28 55 L 28 32 C 28 26 32 22 38 22 L 68 22" stroke="#e4c276" stroke-linecap="round" stroke-width="2.5"/>
          <path d="M 332 55 L 332 32 C 332 26 328 22 322 22 L 292 22" stroke="#e4c276" stroke-linecap="round" stroke-width="2.5"/>
          <path d="M 28 395 L 28 418 C 28 424 32 428 38 428 L 68 428" stroke="#e4c276" stroke-linecap="round" stroke-width="2.5"/>
          <path d="M 332 395 L 332 418 C 332 424 328 428 322 428 L 292 428" stroke="#e4c276" stroke-linecap="round" stroke-width="2.5"/>
        </svg>

        <!-- Dynamic Laser Sweep Bar -->
        <div class="laser-beam" style="position: absolute; top: 10%; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent 0%, #47d6ff 50%, transparent 100%); box-shadow: 0 0 12px #47d6ff; z-index: 18; pointer-events: none;"></div>

        <!-- Rendered Real-time Palm Line Overlay -->
        ${renderPalmLineOverlay()}

        <!-- Bottom Telemetry HUD Bar inside Viewfinder -->
        <div style="position: absolute; bottom: 12px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; z-index: 20; font-size: 11px; pointer-events: none;">
          <div style="display: flex; align-items: center; gap: 4px; color: var(--color-tertiary); font-weight: 700; text-shadow: 0 0 8px rgba(71,214,255,0.7);">
            <span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span>
            <span>Biometric Alignment: 98.4%</span>
          </div>
          <span style="font-family: monospace; font-size: 10px; color: var(--color-on-surface-variant); letter-spacing: 0.08em;">
            10s TELEMETRY
          </span>
        </div>
      </div>

      <!-- Real-time Quality Badges -->
      <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 12px;">
        <span class="kai-badge kai-badge-cyan" style="font-size: 10px;">
          <span class="material-symbols-outlined" style="font-size: 12px;">wb_sunny</span>
          <span>Lighting Optimal</span>
        </span>
        <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
          <span class="material-symbols-outlined" style="font-size: 12px;">straighten</span>
          <span>Distance Good</span>
        </span>
        <span class="kai-badge kai-badge-primary" style="font-size: 10px;">
          <span class="material-symbols-outlined" style="font-size: 12px;">pan_tool</span>
          <span>Steady</span>
        </span>
      </div>

      <!-- Primary Trigger Button -->
      <div style="z-index: 20;">
        <button id="scanner-start-btn" class="kai-btn kai-btn-primary" type="button">
          <span class="material-symbols-outlined">document_scanner</span>
          <span>Begin 10s Optical Scan</span>
        </button>
      </div>

    </div>
  `;
}
