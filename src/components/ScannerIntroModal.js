/**
 * ScannerIntroModal Component — Calm Onboarding to Hand Scanner
 * Phase: P6 — Hand Scanner Experience
 * Source of truth: docs/p6/P6_SCANNER_UX_SPEC.md
 */

export function renderScannerIntroModal({ onStart = () => {}, onDismiss = () => {} }) {
  return `
    <div id="scanner-intro-overlay" style="position: fixed; inset: 0; z-index: 100; background: rgba(5, 8, 17, 0.94); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div class="kai-card kai-card-gold-rim" style="width: 100%; max-width: 380px; padding: 28px 24px; text-align: center; background: var(--color-surface-container); border-radius: var(--radius-xl); box-shadow: 0 16px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Mystic Hand Icon Hero -->
        <div style="width: 64px; height: 64px; border-radius: 9999px; background: rgba(228, 194, 118, 0.12); border: 1px solid var(--color-secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 0 20px rgba(228, 194, 118, 0.25);">
          <span class="material-symbols-outlined" style="font-size: 32px; color: var(--color-secondary);">
            front_hand
          </span>
        </div>

        <div>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.12em; text-transform: uppercase;">
            Kai RegAI • Optical Guidance
          </span>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high); margin-top: 6px;">
            Scan Your Palm
          </h2>
        </div>

        <!-- 3 Simple Guidance Points -->
        <div style="display: flex; flex-direction: column; gap: 14px; text-align: left; background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: var(--color-tertiary); margin-top: 2px;">center_focus_strong</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">Place palm inside guide</h4>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px;">Align your open hand within the reticle.</p>
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: var(--color-secondary); margin-top: 2px;">wb_sunny</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">Use even lighting</h4>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px;">Avoid direct glare and harsh dark shadows.</p>
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: #10B981; margin-top: 2px;">pan_tool</span>
            <div>
              <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high);">Hold steady for auto-capture</h4>
              <p style="font-size: 11px; color: var(--color-on-surface-variant); margin-top: 2px;">The scanner locks and triggers once stable.</p>
            </div>
          </div>
        </div>

        <!-- Epistemic & Privacy Statement -->
        <p style="font-size: 11px; color: var(--color-outline); line-height: 1.4;">
          Your palm image is processed ephemerally on-device in RAM to detect genuine crease patterns. No photos are retained.
        </p>

        <!-- CTA Buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="intro-start-btn" class="kai-btn kai-btn-gold" type="button">
            <span class="material-symbols-outlined">camera_alt</span>
            <span>Start Scan</span>
          </button>
          <button id="intro-cancel-btn" class="kai-btn kai-btn-ghost" type="button" style="font-size: 12px;">
            Cancel
          </button>
        </div>

      </div>
    </div>
  `;
}
