/**
 * ScannerScreen Component — Mode 1 Reference Wireframe Hand Scanner Viewfinder
 * Matches exact reference screens & reference app video:
 * - WhatsApp Video 2:34 to 2:42 (Smooth live tracking, Scanning % counter, illuminated creases)
 * - Screenshot 2026-09-24 at 7.07.39 PM.png (Palm Map dynamically tracked on hand)
 * - Screenshot 2026-09-24 at 7.07.50 PM.png (Scanning 57% Progress Bar & Creases)
 * Source of truth: docs/p2/HAND_SCANNER_FLOW.md & docs/p6/P6_SCANNER_ARCHITECTURE.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { renderScannerHUD, updateHUDLiveTracking, getWireframePoints } from '../components/ScannerHUD.js';
import { renderCameraPermissionModal } from '../components/CameraPermissionModal.js';
import { PalmScannerController, SCANNER_STATES } from '../scanner/index.js';
import { PERMISSION_STATES } from '../scanner/CameraCaptureService.js';
import { BrowserHandTracker } from '../scanner/BrowserHandTracker.js';
import { HandPoseValidator, POSE_STATUS } from '../cv/quality/HandPoseValidator.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { soundService } from '../services/SoundService.js';
import { readingHistoryService } from '../services/ReadingHistoryService.js';
import { createReport } from '../report/index.js';

export function renderScannerScreen(container) {
  reportTelemetry.logEvent(TELEMETRY_EVENTS.SCANNER_OPEN, {});
  
  let controller = null;
  let handTracker = null;
  let scanProgress = 0;
  let isScanning = false;
  let stableOpenFrames = 0;
  let missingHandFrames = 0;
  let invalidPoseFrames = 0;
  let currentHandSide = 'RIGHT';
  let lastPlayedMilestone = 0;
  let isNavigating = false;
  let lastPoseStatus = POSE_STATUS.NO_HAND;

  // High-fidelity sample palm frame provider for environments without camera or demo simulation
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

          const distLife = Math.abs(Math.hypot(dx - (-baseRadius * 0.35), dy - (baseRadius * 0.15)) - (baseRadius * 0.55));
          if (distLife < 3 && dy > -baseRadius * 0.2 && dy < baseRadius * 0.65 && dx < baseRadius * 0.15) {
            data[idx] = 45; data[idx + 1] = 35; data[idx + 2] = 28;
          }
          const headY = -baseRadius * 0.1 + (dx - (-baseRadius * 0.45)) * 0.35;
          if (Math.abs(dy - headY) < 3 && dx > -baseRadius * 0.40 && dx < baseRadius * 0.40) {
            data[idx] = 45; data[idx + 1] = 35; data[idx + 2] = 28;
          }
          const heartY = -baseRadius * 0.42 - (dx - (-baseRadius * 0.50)) * 0.15;
          if (Math.abs(dy - heartY) < 3 && dx > -baseRadius * 0.38 && dx < baseRadius * 0.38) {
            data[idx] = 45; data[idx + 1] = 35; data[idx + 2] = 28;
          }
          if (Math.abs(dx - 5) < 3 && dy > -baseRadius * 0.45 && dy < baseRadius * 0.55) {
            data[idx] = 45; data[idx + 1] = 35; data[idx + 2] = 28;
          }
          if (Math.abs(dx - 45) < 3 && dy > -baseRadius * 0.48 && dy < -baseRadius * 0.05) {
            data[idx] = 45; data[idx + 1] = 35; data[idx + 2] = 28;
          }
        } else {
          data[idx] = 12;
          data[idx + 1] = 15;
          data[idx + 2] = 22;
          data[idx + 3] = 255;
        }
      }
    }
    return { width, height, data };
  }

  function initScanner() {
    controller = new PalmScannerController({
      handSide: currentHandSide,
      stabilityTarget: 2,
      autoCapture: false,
      autoStartLoop: false
    });

    handTracker = new BrowserHandTracker({
      expectedHandedness: currentHandSide
    });

    // Render DOM ONCE
    renderInitialDOM();
    wireStaticEvents();

    // Start hardware stream and browser hand tracking
    startCameraAndTracker();
  }

  function renderInitialDOM() {
    container.innerHTML = `
      <div id="scanner-view-root" style="width: 100vw; height: 100vh;">
        ${renderScannerHUD({
          handSide: currentHandSide,
          state: SCANNER_STATES.SEARCHING_FOR_HAND,
          scanProgressPercent: 0,
          feedbackMessage: 'Place palm in view to scan',
          landmarks: null,
          isTorchOn: false,
          isMuted: soundService.isMuted(),
          isMockActive: false
        })}
      </div>
      <div id="scanner-modal-slot"></div>
    `;
  }

  async function startCameraAndTracker() {
    const video = container.querySelector('#scanner-video-feed');
    if (!video || !controller) return;

    controller.cameraService.attachVideoElement(video);

    const streamResult = await controller.cameraService.startStream();
    if (!streamResult.success) {
      if (streamResult.reason === 'PERMISSION_DENIED') {
        showPermissionModal(PERMISSION_STATES.DENIED);
      } else {
        showPermissionModal(PERMISSION_STATES.UNAVAILABLE);
      }
      return;
    }

    const isCameraMirrored = controller.cameraService.isMirrored;
    handTracker.setHandedness(currentHandSide, isCameraMirrored);

    if (video) {
      video.style.transform = isCameraMirrored ? 'scaleX(-1)' : 'none';
    }
    const fallback = container.querySelector('#scanner-fallback-img');
    if (fallback) {
      fallback.style.transform = isCameraMirrored ? 'scaleX(-1)' : 'none';
    }

    // Initialize MediaPipe Hands in the background
    await handTracker.initialize();

    // Start real-time 60fps tracking loop
    handTracker.start(video, (frameResult) => {
      handleHandTrackingFrame(frameResult);
    });
  }

  /**
   * High-frequency live frame handler (called at 30-60 FPS)
   * Actively guards against fists, curled fingers, and sudden hand removal.
   */
  function handleHandTrackingFrame({ detected, landmarks, handedness }) {
    if (isNavigating) return;

    const root = container.querySelector('#scanner-view-root');
    if (!root) return;

    const video = container.querySelector('#scanner-video-feed');
    const boxW = root.clientWidth || window.innerWidth || 1000;
    const boxH = root.clientHeight || window.innerHeight || 1000;
    const vidW = video?.videoWidth || 1280;
    const vidH = video?.videoHeight || 720;

    // CASE 1: No hand detected or hand removed from camera view
    if (!detected || !landmarks || landmarks.length < 21) {
      stableOpenFrames = 0;

      if (isScanning) {
        missingHandFrames++;
        // Hand removed mid-scan: Pause progression & alert user
        updateHUDLiveTracking(root, {
          pts: null,
          pct: Math.round(scanProgress),
          isScanning: true,
          handDetected: false,
          status: POSE_STATUS.NO_HAND,
          feedbackMessage: 'Hand moved away — please place your open palm in view',
          viewBox: `0 0 ${boxW} ${boxH}`
        });

        // If hand remains missing for > 1.2 seconds, abort and reset
        if (missingHandFrames > 35) {
          isScanning = false;
          scanProgress = 0;
          lastPlayedMilestone = 0;
          missingHandFrames = 0;
          updateHUDLiveTracking(root, {
            pts: null,
            pct: 0,
            isScanning: false,
            handDetected: false,
            status: POSE_STATUS.NO_HAND,
            feedbackMessage: 'Scan cancelled. Place your open palm in view to restart',
            viewBox: `0 0 ${boxW} ${boxH}`
          });
        }
      } else {
        updateHUDLiveTracking(root, {
          pts: null,
          pct: 0,
          isScanning: false,
          handDetected: false,
          status: POSE_STATUS.NO_HAND,
          feedbackMessage: 'Place palm in view to scan',
          viewBox: `0 0 ${boxW} ${boxH}`
        });
      }
      return;
    }

    // CASE 2: Hand is detected — Auto-adapt hand side (R / L) to match presented palm
    if (!isScanning && (handedness === 'LEFT' || handedness === 'RIGHT') && handedness !== currentHandSide) {
      currentHandSide = handedness;
      if (controller) controller.setHandSide(currentHandSide);
      const isCameraMirrored = controller?.cameraService?.isMirrored ?? true;
      if (handTracker) handTracker.setHandedness(currentHandSide, isCameraMirrored);

      const flipBtnLabel = container.querySelector('#scanner-flip-btn span');
      if (flipBtnLabel) {
        flipBtnLabel.textContent = currentHandSide === 'RIGHT' ? 'R' : 'L';
      }
    }

    // Validate pose (Open Palm vs Fist / Curled / Back-of-hand)
    // Landmarks emitted by BrowserHandTracker are already in normalized screen space
    const validation = HandPoseValidator.validate(landmarks, {
      expectedHandedness: currentHandSide,
      detectedHandedness: handedness,
      isMirrored: false
    });

    const project = BrowserHandTracker.computeCoverProjection(boxW, boxH, vidW, vidH, false);
    const pts = getWireframePoints(landmarks, project, currentHandSide);

    lastPoseStatus = validation.status;

    if (!validation.valid) {
      // Invalid hand pose (e.g. FIST_DETECTED, PALM_TOO_FAR, BACK_OF_HAND, etc.)
      stableOpenFrames = 0;

      // On BACK_OF_HAND (dorsal side shown), IMMEDIATELY abort any active scan and clear lines!
      if (validation.status === POSE_STATUS.BACK_OF_HAND) {
        isScanning = false;
        scanProgress = 0;
        lastPlayedMilestone = 0;
        invalidPoseFrames = 0;
        updateHUDLiveTracking(root, {
          pts,
          pct: 0,
          isScanning: false,
          handDetected: true,
          status: POSE_STATUS.BACK_OF_HAND,
          feedbackMessage: validation.message,
          viewBox: `0 0 ${boxW} ${boxH}`
        });
        return;
      }

      if (isScanning) {
        invalidPoseFrames++;
        // PAUSE scan progress — do not advance percentage on a fist or folded hand!
        updateHUDLiveTracking(root, {
          pts,
          pct: Math.round(scanProgress),
          isScanning: true,
          handDetected: true,
          status: validation.status,
          feedbackMessage: validation.message,
          viewBox: `0 0 ${boxW} ${boxH}`
        });

        // If user holds an invalid pose for > 1.2 seconds, abort scan
        if (invalidPoseFrames > 35) {
          isScanning = false;
          scanProgress = 0;
          lastPlayedMilestone = 0;
          invalidPoseFrames = 0;
          updateHUDLiveTracking(root, {
            pts,
            pct: 0,
            isScanning: false,
            handDetected: true,
            status: validation.status,
            feedbackMessage: 'Scan paused. Open your palm flat with fingers extended',
            viewBox: `0 0 ${boxW} ${boxH}`
          });
        }
      } else {
        updateHUDLiveTracking(root, {
          pts,
          pct: 0,
          isScanning: false,
          handDetected: true,
          status: validation.status,
          feedbackMessage: validation.message,
          viewBox: `0 0 ${boxW} ${boxH}`
        });
      }
      return;
    }

    // CASE 3: Authentic, Valid Open Palm Surface Confirmed
    missingHandFrames = 0;
    invalidPoseFrames = 0;

    if (!isScanning) {
      stableOpenFrames++;
      updateHUDLiveTracking(root, {
        pts,
        pct: 0,
        isScanning: false,
        handDetected: true,
        status: POSE_STATUS.PALM_READY,
        feedbackMessage: stableOpenFrames < 6 ? 'Hold steady…' : 'Palm aligned! Starting scan…',
        viewBox: `0 0 ${boxW} ${boxH}`
      });

      // Require ~200ms (6 valid open-palm frames) before triggering scan
      if (stableOpenFrames >= 6) {
        isScanning = true;
        scanProgress = 0;
        lastPlayedMilestone = 0;
        soundService.playAlignmentChime();
      }
    } else {
      // Actively advance scan percentage ONLY while open palm is held
      // ~6.8 seconds total duration at ~40 FPS = +0.40% per frame
      scanProgress = Math.min(100, scanProgress + 0.40);
      const currentPct = Math.round(scanProgress);

      // Trigger harmonic resonance tones across palm creases
      if (currentPct >= 12 && lastPlayedMilestone < 12) {
        lastPlayedMilestone = 12;
        soundService.playLineTone('life');
      } else if (currentPct >= 30 && lastPlayedMilestone < 30) {
        lastPlayedMilestone = 30;
        soundService.playLineTone('head');
      } else if (currentPct >= 55 && lastPlayedMilestone < 55) {
        lastPlayedMilestone = 55;
        soundService.playLineTone('heart');
      } else if (currentPct >= 78 && lastPlayedMilestone < 78) {
        lastPlayedMilestone = 78;
        soundService.playLineTone('fate');
      } else if (currentPct >= 92 && lastPlayedMilestone < 92) {
        lastPlayedMilestone = 92;
        soundService.playLineTone('sun');
      }

      updateHUDLiveTracking(root, {
        pts,
        pct: currentPct,
        isScanning: true,
        handDetected: true,
        status: POSE_STATUS.PALM_READY,
        feedbackMessage: 'Reading palm creases…',
        viewBox: `0 0 ${boxW} ${boxH}`
      });

      if (currentPct >= 100) {
        isScanning = false;
        completeScanAndNavigate();
      }
    }
  }

  /**
   * Final capture & seamless transition to Quick Report
   */
  async function completeScanAndNavigate() {
    if (isNavigating) return;
    isNavigating = true;

    // 1. Shutter chime & flash
    soundService.playShutterSound();
    const flash = container.querySelector('#shutter-flash');
    if (flash) {
      flash.style.opacity = '1';
      setTimeout(() => {
        if (flash) flash.style.opacity = '0';
      }, 220);
    }

    // 2. Capture snapshot from stream or sample
    let captured = null;
    let capturedDataUrl = null;
    if (controller?.cameraService) {
      captured = controller.cameraService.captureFrame();
      capturedDataUrl = controller.cameraService.captureDataUrl?.();
    }
    if (!captured) {
      captured = createSamplePalmFrame();
    }

    // 3. Synthesize canonical reading feature model
    const featureModel = {
      hand_side: currentHandSide,
      capture_timestamp: new Date().toISOString(),
      quality_score: 0.96,
      palm_geometry: {
        proportions: { palm_width_mm: 84, palm_length_mm: 98, ratio: 0.86 },
        archetype: 'WATER'
      },
      lines: {
        life: { detected: true, clarity: 0.92, length_ratio: 0.88, depth: 'DEEP', curvature: 0.72 },
        head: { detected: true, clarity: 0.89, length_ratio: 0.84, depth: 'MEDIUM', curvature: 0.45 },
        heart: { detected: true, clarity: 0.94, length_ratio: 0.91, depth: 'DEEP', curvature: 0.62 },
        fate: { detected: true, clarity: 0.78, length_ratio: 0.71, depth: 'FINE', curvature: 0.15 }
      }
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('kai_has_scanned_palm', 'true');
      window.localStorage.setItem('kai_last_scanned_features', JSON.stringify(featureModel));
    }

    // 4. Save reading to local IndexedDB history
    try {
      const report = createReport({
        dossier: {
          id: `reading-${Date.now()}`,
          summary: { title: 'Mode 1 Rapid Palm Scan' },
          reading_method: 'MODE_1_SCANNER',
          hand_side: currentHandSide,
          quality_score: 0.96
        },
        tier: 'QUICK'
      });

      await readingHistoryService.recordCompletedReading({
        report,
        featureModel
      });
    } catch (err) {
      console.warn('[ScannerScreen] History save non-blocking catch:', err);
    }

    reportTelemetry.logEvent(TELEMETRY_EVENTS.CAPTURE_SUCCESS, { handSide: currentHandSide });

    // Transition smoothly after flash
    setTimeout(() => {
      cleanup();
      router.navigate(ROUTES.QUICK_REPORT, {
        featureModel,
        capturedImage: capturedDataUrl || captured,
        hand: currentHandSide
      });
    }, 280);
  }

  function wireStaticEvents() {
    container.querySelector('#scanner-exit-btn')?.addEventListener('click', () => {
      cleanup();
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#scanner-sound-btn')?.addEventListener('click', () => {
      soundService.toggleMute();
      const soundBtn = container.querySelector('#scanner-sound-btn span');
      if (soundBtn) {
        soundBtn.textContent = soundService.isMuted() ? 'volume_off' : 'volume_up';
        soundBtn.style.color = soundService.isMuted() ? 'rgba(255,255,255,0.4)' : '#fff';
      }
    });

    container.querySelector('#scanner-flip-btn')?.addEventListener('click', () => {
      currentHandSide = currentHandSide === 'RIGHT' ? 'LEFT' : 'RIGHT';
      const isCameraMirrored = controller?.cameraService?.isMirrored ?? true;
      if (controller) controller.setHandSide(currentHandSide);
      if (handTracker) handTracker.setHandedness(currentHandSide, isCameraMirrored);

      const flipBtnLabel = container.querySelector('#scanner-flip-btn span');
      if (flipBtnLabel) {
        flipBtnLabel.textContent = currentHandSide === 'RIGHT' ? 'R' : 'L';
      }

      const video = container.querySelector('#scanner-video-feed');
      if (video) {
        video.style.transform = isCameraMirrored ? 'scaleX(-1)' : 'none';
      }

      const fallback = container.querySelector('#scanner-fallback-img');
      if (fallback) {
        fallback.style.transform = isCameraMirrored ? 'scaleX(-1)' : 'none';
      }
    });

    // Tap to manually trigger / force demo scan
    const triggerScan = () => {
      if (lastPoseStatus === POSE_STATUS.BACK_OF_HAND) {
        // Prevent manual scan on back of hand
        const pill = container.querySelector('#scanner-guidance-pill');
        if (pill) {
          pill.style.transform = 'scale(1.06)';
          setTimeout(() => { if (pill) pill.style.transform = 'none'; }, 220);
        }
        return;
      }
      if (!isScanning) {
        if (controller && !controller.cameraService.isActive) {
          controller.cameraService.enableMockMode(createSamplePalmFrame);
        }
        isScanning = true;
        scanProgress = 0;
        soundService.playAlignmentChime();
      }
    };

    container.querySelector('#scanner-tap-trigger')?.addEventListener('click', triggerScan);
  }

  function showPermissionModal(permState) {
    const slot = container.querySelector('#scanner-modal-slot');
    if (!slot) return;

    slot.innerHTML = renderCameraPermissionModal({
      permissionState: permState,
      onRequestPermission: async () => {
        dismissModal();
        await startCameraAndTracker();
      },
      onUseFallback: () => {
        dismissModal();
        if (controller) {
          controller.cameraService.enableMockMode(createSamplePalmFrame);
        }
        const fallbackImg = container.querySelector('#scanner-fallback-img');
        if (fallbackImg) fallbackImg.style.opacity = '0.75';
        isScanning = true;
        scanProgress = 0;
        soundService.playAlignmentChime();
      },
      onCancel: () => {
        cleanup();
        router.navigate(ROUTES.HOME);
      }
    });

    slot.querySelector('#perm-allow-btn')?.addEventListener('click', async () => {
      dismissModal();
      await startCameraAndTracker();
    });

    slot.querySelector('#perm-sample-btn')?.addEventListener('click', () => {
      dismissModal();
      if (controller) {
        controller.cameraService.enableMockMode(createSamplePalmFrame);
      }
      const fallbackImg = container.querySelector('#scanner-fallback-img');
      if (fallbackImg) fallbackImg.style.opacity = '0.75';
      isScanning = true;
      scanProgress = 0;
      soundService.playAlignmentChime();
    });

    slot.querySelector('#perm-cancel-btn')?.addEventListener('click', () => {
      cleanup();
      router.navigate(ROUTES.HOME);
    });
  }

  function dismissModal() {
    const slot = container.querySelector('#scanner-modal-slot');
    if (slot) slot.innerHTML = '';
  }

  function cleanup() {
    isScanning = false;
    if (handTracker) {
      handTracker.stop();
      handTracker = null;
    }
    if (controller) {
      controller.stop();
      controller = null;
    }
  }

  // Initialize immediately
  initScanner();
}
