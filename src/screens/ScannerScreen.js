/**
 * ScannerScreen Component — Mode 1 Hand Scanner Viewfinder & State Machine
 * Matches Stitch: design/stitch/kai_regai_hand_scanner_hud/
 * Source of truth: docs/p2/HAND_SCANNER_FLOW.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { renderScannerHUD } from '../components/ScannerHUD.js';
import { ScannerAnimationController } from '../components/AnalysisAnimationOverlay.js';
import { renderErrorCalibrationModal } from '../components/ErrorCalibrationModal.js';

export function renderScannerScreen(container) {
  let isTorchOn = false;
  let currentHand = 'RIGHT';
  let isScanning = false;
  let animationController = null;

  function mountViewfinder() {
    container.innerHTML = renderScannerHUD({
      handSide: currentHand,
      isTorchOn,
      onStartScan: startProgressiveScan,
      onExit: () => router.navigate(ROUTES.HOME),
      onToggleTorch: () => {
        isTorchOn = !isTorchOn;
        mountViewfinder();
      },
      onFlipCamera: () => {
        currentHand = currentHand === 'RIGHT' ? 'LEFT' : 'RIGHT';
        mountViewfinder();
      }
    });

    // Wire HUD Action Listeners
    container.querySelector('#scanner-exit-btn')?.addEventListener('click', () => {
      if (animationController) animationController.stop();
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#scanner-torch-btn')?.addEventListener('click', () => {
      isTorchOn = !isTorchOn;
      mountViewfinder();
    });

    container.querySelector('#scanner-flip-btn')?.addEventListener('click', () => {
      currentHand = currentHand === 'RIGHT' ? 'LEFT' : 'RIGHT';
      mountViewfinder();
    });

    container.querySelector('#scanner-start-btn')?.addEventListener('click', () => {
      startProgressiveScan();
    });
  }

  function startProgressiveScan() {
    isScanning = true;
    animationController = new ScannerAnimationController(container, () => {
      // Completed 10s scan -> navigate to Quick Report
      router.navigate(ROUTES.QUICK_REPORT, { hand: currentHand });
    });
    animationController.start();
  }

  mountViewfinder();
}
