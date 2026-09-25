/**
 * CameraPermissionModal Component — Permission Handling & Recovery Dialog
 * Phase: P6 — Hand Scanner Experience
 * Source of truth: docs/p6/P6_CAMERA_CAPTURE_SPEC.md
 */

import { PERMISSION_STATES } from '../scanner/CameraCaptureService.js';

export function renderCameraPermissionModal({
  permissionState = PERMISSION_STATES.DENIED,
  onRequestPermission = () => {},
  onCancel = () => {},
  onUseFallback = () => {}
}) {
  const isDenied = permissionState === PERMISSION_STATES.DENIED;
  const isPermanentlyDenied = permissionState === PERMISSION_STATES.PERMANENTLY_DENIED;
  const isUnavailable = permissionState === PERMISSION_STATES.UNAVAILABLE;

  let title = 'Camera Access Needed';
  let message = 'Kai RegAI requires camera access to detect your palm creases in real-time.';
  let icon = 'videocam';
  let primaryBtnText = 'Allow Camera';

  if (isPermanentlyDenied) {
    title = 'Camera Access Disabled';
    message = 'Camera permissions are disabled for this site. Please enable camera access in your device or browser settings to continue.';
    icon = 'videocam_off';
    primaryBtnText = 'Open Settings / Retry';
  } else if (isUnavailable) {
    title = 'Camera Hardware Unavailable';
    message = 'No video capture devices were detected on this device. You can test with a sample palm or upload an image.';
    icon = 'no_photography';
    primaryBtnText = 'Retry Camera';
  }

  return `
    <div id="camera-permission-modal" style="position: fixed; inset: 0; z-index: 100; background: rgba(5, 8, 17, 0.94); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div class="kai-card kai-card-gold-rim" style="width: 100%; max-width: 360px; padding: 28px 24px; text-align: center; background: var(--color-surface-container); border-radius: var(--radius-xl); box-shadow: 0 16px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 18px;">
        
        <div style="width: 56px; height: 56px; border-radius: 9999px; background: rgba(244, 63, 94, 0.12); border: 1px solid var(--color-error); display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 0 16px rgba(244, 63, 94, 0.25);">
          <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-error);">
            ${icon}
          </span>
        </div>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--color-text-high);">
            ${title}
          </h2>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 8px; line-height: 1.5;">
            ${message}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
          <button id="perm-allow-btn" class="kai-btn kai-btn-primary" type="button">
            <span class="material-symbols-outlined">check_circle</span>
            <span>${primaryBtnText}</span>
          </button>
          
          <button id="perm-sample-btn" class="kai-btn kai-btn-secondary" type="button" style="font-size: 12px;">
            <span class="material-symbols-outlined">image</span>
            <span>Use Sample Palm Photo</span>
          </button>

          <button id="perm-cancel-btn" class="kai-btn kai-btn-ghost" type="button" style="font-size: 12px;">
            Back to Home
          </button>
        </div>

      </div>
    </div>
  `;
}
