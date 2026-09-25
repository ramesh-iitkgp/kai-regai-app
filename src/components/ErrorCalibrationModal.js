/**
 * ErrorCalibrationModal Component — Scanner Recovery & Optical Calibration
 * Matches Stitch: design/stitch/kai_regai_scanner_error_calibration_recovery/
 */

export function renderErrorCalibrationModal({
  errorType = 'LOW_LIGHT', // LOW_LIGHT | DISTANCE | MOTION | MULTIPLE_HANDS
  onRetry = () => {},
  onSwitchToGuided = () => {},
  onClose = () => {}
} = {}) {
  const configs = {
    LOW_LIGHT: {
      icon: 'lightbulb',
      title: 'A Little More Light',
      desc: 'Natural or overhead ambient illumination helps the neural detector trace fine secondary crease lines clearly.',
      tip: 'Face a window or turn on your device flashlight.'
    },
    DISTANCE: {
      icon: 'pan_tool',
      title: 'Adjust Palm Distance',
      desc: 'Align your open palm inside the gold framing alignment brackets until the frame glows cyan.',
      tip: 'Hold the camera approximately 20–30 cm from your palm.'
    },
    MOTION: {
      icon: 'vibration',
      title: 'Hold Steady',
      desc: 'Rapid motion causes micro-blur along the delicate Mount of Mercury and Saturnine spires.',
      tip: 'Rest your elbow on a stable surface for 10 seconds.'
    },
    MULTIPLE_HANDS: {
      icon: 'front_hand',
      title: 'One Palm at a Time',
      desc: 'Multiple hands were detected in the optical sensor frame. Kai RegAI performs focused individual readings.',
      tip: 'Ensure only the active hand is visible in the reticle.'
    }
  };

  const activeConfig = configs[errorType] || configs.LOW_LIGHT;

  return `
    <div id="error-modal-backdrop" class="kai-modal-backdrop open">
      <div class="kai-modal-sheet">
        <div class="kai-sheet-handle"></div>

        <div style="text-align: center; margin-bottom: 20px;">
          <div style="width: 56px; height: 56px; border-radius: var(--radius-full); background: rgba(229, 185, 107, 0.15); border: 1px solid var(--color-warning); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-warning);">${activeConfig.icon}</span>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high);">
            ${activeConfig.title}
          </h3>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.5;">
            ${activeConfig.desc}
          </p>
        </div>

        <div class="kai-card" style="padding: 12px 16px; margin-bottom: 20px; background: var(--color-surface-container-high); border-left: 3px solid var(--color-secondary);">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-secondary);">tips_and_updates</span>
            <span style="font-size: 12px; color: var(--color-secondary); font-weight: 600;">Calibration Hint:</span>
          </div>
          <p style="font-size: 12px; color: var(--color-text-high); margin-top: 4px;">
            ${activeConfig.tip}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="error-retry-btn" class="kai-btn kai-btn-primary" type="button">
            <span class="material-symbols-outlined">refresh</span>
            <span>Recalibrate & Retry</span>
          </button>
          <button id="error-guided-btn" class="kai-btn kai-btn-secondary" type="button">
            <span class="material-symbols-outlined">psychology</span>
            <span>Switch to Guided Reading Mode</span>
          </button>
        </div>

      </div>
    </div>
  `;
}
