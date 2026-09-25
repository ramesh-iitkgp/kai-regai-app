/**
 * ScannerScreen Component — Mode 1 Hand Scanner Viewfinder & State Machine Controller
 * Matches Stitch: design/stitch/kai_regai_hand_scanner_hud/
 * Source of truth: docs/p2/HAND_SCANNER_FLOW.md & docs/p6/P6_SCANNER_ARCHITECTURE.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { renderScannerHUD } from '../components/ScannerHUD.js';
import { renderScannerIntroModal } from '../components/ScannerIntroModal.js';
import { renderCameraPermissionModal } from '../components/CameraPermissionModal.js';
import { renderErrorCalibrationModal } from '../components/ErrorCalibrationModal.js';
import { PalmScannerController, SCANNER_STATES } from '../scanner/index.js';
import { PERMISSION_STATES } from '../scanner/CameraCaptureService.js';

export function renderScannerScreen(container) {
  let controller = null;
  let showDiagnostics = false;
  let hasShownIntro = sessionStorage.getItem('kai_scanner_intro_seen') === 'true';

  // Sample palm fallback provider for environments without camera
  function createSamplePalmFrame() {
    const width = 640;
    const height = 480;
    const data = new Uint8ClampedArray(width * height * 4);
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = 140;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx * 1.3, dy * 0.85);

        if (dist <= baseRadius) {
          data[idx] = 195;
          data[idx + 1] = 145;
          data[idx + 2] = 115;
          data[idx + 3] = 255;

          // Synthetic Life Line
          const distLife = Math.abs(Math.hypot(dx - (-baseRadius * 0.35), dy - (baseRadius * 0.15)) - (baseRadius * 0.55));
          if (distLife < 3 && dy > -baseRadius * 0.2 && dy < baseRadius * 0.65 && dx < baseRadius * 0.15) {
            data[idx] = 50; data[idx + 1] = 40; data[idx + 2] = 30;
          }
          // Synthetic Head Line
          const headY = -baseRadius * 0.1 + (dx - (-baseRadius * 0.45)) * 0.35;
          if (Math.abs(dy - headY) < 3 && dx > -baseRadius * 0.40 && dx < baseRadius * 0.40) {
            data[idx] = 50; data[idx + 1] = 40; data[idx + 2] = 30;
          }
          // Synthetic Heart Line
          const heartY = -baseRadius * 0.42 - (dx - (-baseRadius * 0.50)) * 0.15;
          if (Math.abs(dy - heartY) < 3 && dx > -baseRadius * 0.38 && dx < baseRadius * 0.38) {
            data[idx] = 50; data[idx + 1] = 40; data[idx + 2] = 30;
          }
        } else {
          data[idx] = 15;
          data[idx + 1] = 18;
          data[idx + 2] = 25;
          data[idx + 3] = 255;
        }
      }
    }
    return { width, height, data };
  }

  function initScanner() {
    controller = new PalmScannerController({
      handSide: 'RIGHT',
      stabilityTarget: 3,
      autoCapture: true
    });

    renderMainView();
    attachVideoFeed();

    // Subscribe to state machine transitions
    controller.subscribe((newState, oldState, context) => {
      handleStateChange(newState, oldState, context);
    });

    // Start scanner flow
    controller.start().catch(err => {
      console.warn('[ScannerScreen] Controller start caught:', err);
    });
  }

  function renderMainView() {
    const context = controller ? controller.getContext() : {};
    const state = controller ? controller.getState() : SCANNER_STATES.INITIALIZING;

    container.innerHTML = `
      <div id="scanner-view-root" style="width: 100%; height: 100%;">
        ${renderScannerHUD({
          handSide: context.handSide || 'RIGHT',
          state,
          feedbackMessage: context.feedbackMessage || 'Align your palm with the guide',
          guidanceDetail: context.guidanceDetail || [],
          diagnosticCode: context.diagnosticCode,
          stabilityCount: context.stabilityCount || 0,
          stabilityTarget: context.stabilityTarget || 3,
          countdown: context.countdown || 3,
          isTorchOn: controller?.cameraService?.isTorchOn || false,
          showDiagnostics
        })}
      </div>
      <div id="scanner-modal-slot"></div>
    `;

    wireViewEvents();
  }

  function attachVideoFeed() {
    const video = container.querySelector('#scanner-video-feed');
    if (video && controller?.cameraService) {
      controller.cameraService.attachVideoElement(video);
    }
  }

  function wireViewEvents() {
    container.querySelector('#scanner-exit-btn')?.addEventListener('click', () => {
      cleanup();
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#scanner-torch-btn')?.addEventListener('click', async () => {
      if (controller) {
        await controller.toggleTorch();
        updateHUDOnly();
      }
    });

    container.querySelector('#scanner-flip-btn')?.addEventListener('click', () => {
      if (controller) {
        const curHand = controller.getContext().handSide;
        const newHand = curHand === 'RIGHT' ? 'LEFT' : 'RIGHT';
        controller.setHandSide(newHand);
        updateHUDOnly();
      }
    });

    container.querySelector('#toggle-diagnostics-btn')?.addEventListener('click', () => {
      showDiagnostics = !showDiagnostics;
      updateHUDOnly();
    });

    container.querySelector('#scanner-capture-btn')?.addEventListener('click', () => {
      if (controller) {
        controller.executeCapture();
      }
    });

    container.querySelector('#scanner-manual-trigger-btn')?.addEventListener('click', () => {
      if (controller) {
        controller.executeCapture();
      }
    });

    container.querySelector('#scanner-retry-btn')?.addEventListener('click', () => {
      dismissModal();
      if (controller) {
        controller.retryScan();
      }
    });
  }

  function updateHUDOnly() {
    const root = container.querySelector('#scanner-view-root');
    if (!root || !controller) return;

    const context = controller.getContext();
    const state = controller.getState();

    // Preserve playing video stream
    const video = container.querySelector('#scanner-video-feed');

    root.innerHTML = renderScannerHUD({
      handSide: context.handSide || 'RIGHT',
      state,
      feedbackMessage: context.feedbackMessage || 'Align your palm with the guide',
      guidanceDetail: context.guidanceDetail || [],
      diagnosticCode: context.diagnosticCode,
      stabilityCount: context.stabilityCount || 0,
      stabilityTarget: context.stabilityTarget || 3,
      countdown: context.countdown || 3,
      isTorchOn: controller.cameraService?.isTorchOn || false,
      showDiagnostics
    });

    // Reattach video element to media stream
    attachVideoFeed();
    wireViewEvents();
  }

  function handleStateChange(newState, oldState, context) {
    // 1. Permission Prompt State
    if (newState === SCANNER_STATES.CAMERA_PERMISSION_REQUIRED) {
      // Stream request in flight; update HUD pill
      updateHUDOnly();
      return;
    }

    // 2. Camera Error / Denied
    if (newState === SCANNER_STATES.ERROR) {
      showPermissionModal(controller?.cameraService?.getPermissionState() || PERMISSION_STATES.DENIED);
      return;
    }

    // 3. Capturing Flash Effect
    if (newState === SCANNER_STATES.CAPTURING) {
      updateHUDOnly();
      const flash = container.querySelector('#shutter-flash');
      if (flash) {
        flash.style.opacity = '1';
        setTimeout(() => {
          if (flash) flash.style.opacity = '0';
        }, 200);
      }
      return;
    }

    // 4. Retake State -> Show Actionable Retake Guidance
    if (newState === SCANNER_STATES.RETAKE) {
      showRetakeModal(context);
      return;
    }

    // 5. Success -> Navigate to Quick Report with real result
    if (newState === SCANNER_STATES.SUCCESS) {
      cleanup();
      router.navigate(ROUTES.QUICK_REPORT, {
        visionResult: context.visionResult,
        featureModel: context.featureModel,
        capturedImage: context.capturedImage,
        hand: context.handSide || 'RIGHT'
      });
      return;
    }

    // Standard in-viewfinder transitions (SEARCHING, ALIGNING, STABILIZING, READY, COUNTDOWN)
    updateHUDOnly();
  }

  function showPermissionModal(permState) {
    const slot = container.querySelector('#scanner-modal-slot');
    if (!slot) return;

    slot.innerHTML = renderCameraPermissionModal({
      permissionState: permState,
      onRequestPermission: async () => {
        dismissModal();
        if (controller) await controller.start();
      },
      onUseFallback: () => {
        dismissModal();
        if (controller) {
          controller.cameraService.enableMockMode(createSamplePalmFrame);
          controller.start();
        }
      },
      onCancel: () => {
        cleanup();
        router.navigate(ROUTES.HOME);
      }
    });

    slot.querySelector('#perm-allow-btn')?.addEventListener('click', async () => {
      dismissModal();
      if (controller) await controller.start();
    });

    slot.querySelector('#perm-sample-btn')?.addEventListener('click', () => {
      dismissModal();
      if (controller) {
        controller.cameraService.enableMockMode(createSamplePalmFrame);
        controller.start();
      }
    });

    slot.querySelector('#perm-cancel-btn')?.addEventListener('click', () => {
      cleanup();
      router.navigate(ROUTES.HOME);
    });
  }

  function showRetakeModal(context) {
    const slot = container.querySelector('#scanner-modal-slot');
    if (!slot) return;

    const guidance = context.feedbackMessage || 'Please recapture under even lighting.';
    const detail = context.guidanceDetail && context.guidanceDetail.length > 0 
      ? context.guidanceDetail[0]
      : 'Position your hand flat and keep the entire palm inside the frame.';

    slot.innerHTML = `
      <div id="retake-guidance-overlay" style="position: fixed; inset: 0; z-index: 100; background: rgba(5, 8, 17, 0.92); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="kai-card kai-card-gold-rim" style="width: 100%; max-width: 360px; padding: 24px; text-align: center; background: var(--color-surface-container); border-radius: var(--radius-xl); box-shadow: 0 16px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 16px;">
          
          <div style="width: 52px; height: 52px; border-radius: 9999px; background: rgba(228, 194, 118, 0.12); border: 1px solid var(--color-secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span class="material-symbols-outlined" style="font-size: 26px; color: var(--color-secondary);">
              info
            </span>
          </div>

          <div>
            <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high);">
              Capture Needs Adjustment
            </h3>
            <p style="font-size: 14px; font-weight: 600; color: var(--color-secondary); margin-top: 6px;">
              ${guidance}
            </p>
            <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.4;">
              ${detail}
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
            <button id="modal-retake-btn" class="kai-btn kai-btn-primary" type="button">
              <span class="material-symbols-outlined">refresh</span>
              <span>Recapture Palm</span>
            </button>
            <button id="modal-retake-home-btn" class="kai-btn kai-btn-ghost" type="button" style="font-size: 12px;">
              Cancel
            </button>
          </div>

        </div>
      </div>
    `;

    slot.querySelector('#modal-retake-btn')?.addEventListener('click', () => {
      dismissModal();
      if (controller) controller.retryScan();
    });

    slot.querySelector('#modal-retake-home-btn')?.addEventListener('click', () => {
      cleanup();
      router.navigate(ROUTES.HOME);
    });
  }

  function dismissModal() {
    const slot = container.querySelector('#scanner-modal-slot');
    if (slot) slot.innerHTML = '';
  }

  function cleanup() {
    if (controller) {
      controller.stop();
      controller = null;
    }
  }

  // --- Initial Entry Point ---
  if (!hasShownIntro) {
    container.innerHTML = renderScannerIntroModal({
      onStart: () => {
        sessionStorage.setItem('kai_scanner_intro_seen', 'true');
        initScanner();
      },
      onDismiss: () => {
        router.navigate(ROUTES.HOME);
      }
    });

    container.querySelector('#intro-start-btn')?.addEventListener('click', () => {
      sessionStorage.setItem('kai_scanner_intro_seen', 'true');
      initScanner();
    });

    container.querySelector('#intro-cancel-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });
  } else {
    initScanner();
  }
}
