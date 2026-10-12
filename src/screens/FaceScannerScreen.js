/**
 * FaceScannerScreen Component — Real-time Facial Capture & Mukha Samudrika Analysis
 * Reference: WhatsApp Video 4:09 to 4:28
 * Features:
 * 1. Live camera viewfinder with front-facing camera & dotted oval face reticle
 * 2. Instant shutter snapshot capture with precise aspect-ratio viewport crop
 * 3. Computer Vision Face Presence & Feature Validation:
 *    - Rejects photos with no face / obstructed frame with clear user guidance
 * 4. Computer Vision Feature Tracking via MediaPipe FaceMesh (468 landmarks):
 *    - Calculates exact coordinates of Eyebrows, Eyes, Nose, Lips, and Chin
 *    - Dynamic SVG illumination paths perfectly aligned with the user's real facial features
 * 5. Frozen Photo Confirmation with Retake and Continue controls (matching video 4:18)
 * 6. Sequential feature illumination animation:
 *    - Step 1: Eyebrows glow -> "✓ Analyzing your face"
 *    - Step 2: Eyes / under-eye glow -> "✓ Analyzing results"
 *    - Step 3: Nose & lips glow -> "✓ Making prediction"
 * 7. Generates personalized Mukha Samudrika report directly from detected facial geometry
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { generateFaceReportData } from '../knowledge/mukhaSamudrika/mukhaKnowledgeBase.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { detectFaceAndLandmarks, detectFaceFromImageUrl, getMediaPipeFaceMesh } from '../cv/face/FaceDetectorEngine.js';

export function renderFaceScannerScreen(container) {
  let mediaStream = null;
  let capturedImageDataUrl = null;
  let activeAnimationTimer = null;

  // Pre-warm MediaPipe FaceMesh in background so it's ready when shutter is clicked
  if (typeof window !== 'undefined') {
    getMediaPipeFaceMesh().catch(() => {});
  }

  // Cleanup existing streams when unmounting or leaving
  function stopCameraStream() {
    if (mediaStream) {
      try {
        mediaStream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('Error stopping video stream:', err);
      }
      mediaStream = null;
    }
  }

  function renderViewfinder() {
    if (activeAnimationTimer) {
      clearTimeout(activeAnimationTimer);
      activeAnimationTimer = null;
    }

    container.innerHTML = `
      <div class="face-scanner-viewport">
        
        <!-- Live Video Element & Hidden Capture Canvas -->
        <video id="face-video-elem" class="face-video-feed" playsinline autoplay muted></video>
        <canvas id="face-capture-canvas" style="display: none;"></canvas>

        <!-- Simulated Photo Fallback for environments without live webcam -->
        <div id="face-fallback-view" class="face-fallback-view" style="display: none; background-image: url('/assets/home/face_scanner.jpg');"></div>

        <!-- Camera Header Controls -->
        <div class="face-scanner-header">
          <button id="face-scanner-back-btn" class="quick-close-square-btn" type="button" aria-label="Back to Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="face-scanner-chip">
            <span class="face-chip-dot"></span>
            <span>MUKHA SAMUDRIKA</span>
          </div>

          <button id="face-camera-switch-btn" class="quick-close-square-btn" type="button" aria-label="Switch Camera">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.956.702 3.748 1.871 5.143L4 18h5v-5l-1.636 1.636C6.545 13.565 6 12.348 6 11c0-3.314 2.686-6 6-6s6 2.686 6 6c0 1.348-.545 2.565-1.364 3.636L18 16.273C19.298 14.878 20 12.044 20 10z"/>
            </svg>
          </button>
        </div>

        <!-- Viewfinder Overlay & Dotted Oval Guide (Matching Video 4:12) -->
        <div class="face-scanner-guide-area">
          <h2 class="face-scanner-prompt-text">Take a photo of your face</h2>

          <div class="face-oval-reticle-wrap">
            <div class="face-oval-dotted-border"></div>
            <!-- Corner Reticle Ticks for High-Tech Vedic CHI HUD -->
            <div class="camera-reticle-corner tl"></div>
            <div class="camera-reticle-corner tr"></div>
            <div class="camera-reticle-corner bl"></div>
            <div class="camera-reticle-corner br"></div>
          </div>

          <p class="face-scanner-hint">Center your face inside the oval and hold steady</p>
        </div>

        <!-- Shutter Capture Button (Matching Video 4:14) -->
        <div class="face-scanner-footer">
          <button id="face-shutter-btn" class="face-shutter-btn" type="button" aria-label="Capture Photo">
            <div class="face-shutter-core"></div>
          </button>
        </div>

      </div>
    `;

    // Initialize Camera Stream
    const videoEl = container.querySelector('#face-video-elem');
    const fallbackEl = container.querySelector('#face-fallback-view');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false
      }).then(stream => {
        mediaStream = stream;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.style.display = 'block';
        }
      }).catch(err => {
        console.warn('Camera access unavailable or denied, activating photo fallback:', err);
        if (fallbackEl) fallbackEl.style.display = 'block';
        if (videoEl) videoEl.style.display = 'none';
      });
    } else {
      if (fallbackEl) fallbackEl.style.display = 'block';
      if (videoEl) videoEl.style.display = 'none';
    }

    // Event Handlers
    container.querySelector('#face-scanner-back-btn')?.addEventListener('click', () => {
      stopCameraStream();
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#face-camera-switch-btn')?.addEventListener('click', () => {
      stopCameraStream();
      renderViewfinder();
    });

    container.querySelector('#face-shutter-btn')?.addEventListener('click', () => {
      captureSnapshot();
    });
  }

  // Snap photo with exact viewport cropping and run CV detection
  async function captureSnapshot() {
    const videoEl = container.querySelector('#face-video-elem');
    const viewportEl = container.querySelector('.face-scanner-viewport');
    const canvas = container.querySelector('#face-capture-canvas');
    const shutterBtn = container.querySelector('#face-shutter-btn');

    if (shutterBtn) {
      shutterBtn.style.opacity = '0.5';
      shutterBtn.style.pointerEvents = 'none';
    }

    let photoSrc = '';
    let detection = null;

    if (videoEl && videoEl.videoWidth > 0 && canvas) {
      // 1. Precise Viewport Aspect Ratio Crop Calculation:
      // Extracts the EXACT center slice of the webcam video that was displayed on screen
      const vw = viewportEl ? viewportEl.clientWidth : 440;
      const vh = viewportEl ? viewportEl.clientHeight : 800;
      const viewportAspect = vw / (vh || 1);

      const vidW = videoEl.videoWidth;
      const vidH = videoEl.videoHeight;
      const videoAspect = vidW / (vidH || 1);

      let srcX = 0, srcY = 0, srcW = vidW, srcH = vidH;

      if (videoAspect > viewportAspect) {
        // Video is wider than viewport (standard landscape webcam on laptop)
        srcW = vidH * viewportAspect;
        srcX = (vidW - srcW) / 2;
      } else {
        // Video is taller than viewport
        srcH = vidW / viewportAspect;
        srcY = (vidH - srcH) / 2;
      }

      // High-res canvas matching exact viewport aspect ratio
      canvas.width = Math.round(srcW);
      canvas.height = Math.round(srcH);

      const ctx = canvas.getContext('2d');
      // Mirror image horizontally for natural selfie perspective
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoEl, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      photoSrc = canvas.toDataURL('image/jpeg', 0.94);

      // Execute Computer Vision Face Landmark Detection on the cropped canvas
      detection = await detectFaceAndLandmarks(canvas);
    } else {
      photoSrc = '/assets/home/face_scanner.jpg';
      detection = await detectFaceFromImageUrl(photoSrc);
    }

    // Validation Gate: If no face is detected, reject and guide user
    if (!detection || !detection.detected) {
      if (shutterBtn) {
        shutterBtn.style.opacity = '1';
        shutterBtn.style.pointerEvents = 'auto';
      }
      showNoFaceDetectedWarning();
      return;
    }

    stopCameraStream();
    showCapturedPreview(photoSrc, detection);
  }

  // Warning Overlay when camera capture does not detect a human face
  function showNoFaceDetectedWarning() {
    const existing = container.querySelector('.face-no-detection-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'face-no-detection-overlay';
    overlay.innerHTML = `
      <div class="face-no-detection-card">
        <div class="face-no-detection-icon-wrap">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>

        <h3 class="face-no-detection-title">No Face Detected</h3>
        
        <p class="face-no-detection-desc">
          We couldn't clearly identify facial features in this photo. Please center your face inside the oval guide, ensure good ambient lighting, and retake your photo.
        </p>

        <button id="face-retake-btn" class="face-retake-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Retake Photo</span>
        </button>
      </div>
    `;

    container.querySelector('.face-scanner-viewport')?.appendChild(overlay);

    overlay.querySelector('#face-retake-btn')?.addEventListener('click', () => {
      overlay.remove();
      renderViewfinder();
    });
  }

  // Freeze Frame Confirmation Screen with Retake & Continue Buttons (Matching Video 4:18)
  function showCapturedPreview(photoSrc, detection) {
    container.innerHTML = `
      <div class="face-scanner-viewport face-analysis-mode">
        
        <!-- Freeze Frame Captured Photo (Full Viewport Coverage) -->
        <div class="face-analysis-bg" style="background-image: url('${photoSrc}');"></div>

        <!-- Preview Actions: Retake or Continue (Matching Video 4:18) -->
        <div class="face-preview-actions-row">
          <button id="face-preview-retake-btn" class="face-btn-retake" type="button">
            <span>Retake</span>
          </button>
          <button id="face-preview-continue-btn" class="face-btn-continue" type="button">
            <span>Continue</span>
          </button>
        </div>

      </div>
    `;

    container.querySelector('#face-preview-retake-btn')?.addEventListener('click', () => {
      renderViewfinder();
    });

    container.querySelector('#face-preview-continue-btn')?.addEventListener('click', () => {
      startScanningAnimation(photoSrc, detection);
    });
  }

  // Sequential Scanning Animation with Sacred Constellation Mesh
  function startScanningAnimation(photoSrc, detection) {
    const { constellation, metrics } = detection;
    const nodes = (constellation && constellation.nodes) ? constellation.nodes : [];
    const filamentsPath = (constellation && constellation.filamentsPath) ? constellation.filamentsPath : '';

    const starNodesSvg = nodes.map(n => `
      <g id="star-${n.id}" class="constellation-star-node tier-${n.tier}" style="opacity: 0; transform-origin: ${n.x}% ${n.y}%; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s ease;">
        <!-- Starlight Diamond Twinkle Flare -->
        <polygon points="${n.x},${(n.y - 3.2).toFixed(2)} ${(n.x + 0.9).toFixed(2)},${n.y} ${n.x},${(n.y + 3.2).toFixed(2)} ${(n.x - 0.9).toFixed(2)},${n.y}" fill="#FBBF24" opacity="0.85" filter="url(#starGlowFilter)" />
        <polygon points="${(n.x - 3.2).toFixed(2)},${n.y} ${n.x},${(n.y + 0.9).toFixed(2)} ${(n.x + 3.2).toFixed(2)},${n.y} ${n.x},${(n.y - 0.9).toFixed(2)}" fill="#C084FC" opacity="0.85" filter="url(#starGlowFilter)" />
        <!-- Luminous Center Point -->
        <circle cx="${n.x}" cy="${n.y}" r="1.4" fill="#FFFFFF" />
        <circle cx="${n.x}" cy="${n.y}" r="0.7" fill="#FDE68A" />
      </g>
    `).join('');

    container.innerHTML = `
      <div class="face-scanner-viewport face-analysis-mode">
        
        <!-- Freeze Frame Captured Photo -->
        <div class="face-analysis-bg" style="background-image: url('${photoSrc}');"></div>
        <div class="face-analysis-dim-overlay"></div>

        <!-- SVG Feature Illumination Overlay — Sacred Constellation Mesh -->
        <svg class="face-feature-illumination-svg face-constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="starGlowFilter" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="celestialFilamentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FBBF24" stop-opacity="0.9" />
              <stop offset="45%" stop-color="#C084FC" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#60A5FA" stop-opacity="0.85" />
            </linearGradient>

            <linearGradient id="scanlineBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(251, 191, 36, 0)" />
              <stop offset="25%" stop-color="rgba(251, 191, 36, 0.7)" />
              <stop offset="50%" stop-color="rgba(255, 255, 255, 0.95)" />
              <stop offset="75%" stop-color="rgba(192, 132, 252, 0.7)" />
              <stop offset="100%" stop-color="rgba(192, 132, 252, 0)" />
            </linearGradient>
          </defs>
          
          <!-- 1. Constellation Filaments Group (Weaves across face in Step 2) -->
          <g id="constellation-filaments" class="constellation-filaments" style="opacity: 0; transition: opacity 0.6s ease;">
            <path class="filament-lines-glow" d="${filamentsPath}" stroke="url(#celestialFilamentGrad)" stroke-width="1.8" stroke-linecap="round" fill="none" filter="url(#starGlowFilter)" />
            <path class="filament-lines-core" d="${filamentsPath}" stroke="#FFFFFF" stroke-width="0.75" stroke-linecap="round" fill="none" opacity="0.95" />
          </g>

          <!-- 2. Celestial Star Nodes (Twinkle into view in Step 1) -->
          <g id="constellation-stars" class="constellation-stars">
            ${starNodesSvg}
          </g>

          <!-- 3. Cosmic Scan Beam (Sweeps down in Step 3) -->
          <rect id="constellation-scan-beam" class="constellation-scan-beam" x="0" y="25" width="100" height="2.2" fill="url(#scanlineBeamGrad)" style="opacity: 0; filter: drop-shadow(0 0 8px rgba(255,255,255,0.85)) drop-shadow(0 0 16px rgba(192,132,252,0.6));" />
        </svg>

        <!-- Floating Step Labels (Refined for Celestial Jyotish & Mukha Samudrika) -->
        <div class="face-analysis-floating-steps">
          <div id="check-step-1" class="face-floating-step active">
            <span class="face-step-check">✓</span>
            <span class="face-step-text">Identifying Celestial Nodes</span>
          </div>
          <div id="check-step-2" class="face-floating-step">
            <span class="face-step-check">✓</span>
            <span class="face-step-text">Weaving Sacred Constellation</span>
          </div>
          <div id="check-step-3" class="face-floating-step">
            <span class="face-step-check">✓</span>
            <span class="face-step-text">Synthesizing Mukha Samudrika</span>
          </div>
        </div>

      </div>
    `;

    const filamentsEl = container.querySelector('#constellation-filaments');
    const scanBeamEl = container.querySelector('#constellation-scan-beam');
    const tier1Stars = container.querySelectorAll('.constellation-star-node.tier-1');
    const tier2Stars = container.querySelectorAll('.constellation-star-node.tier-2');
    const tier3Stars = container.querySelectorAll('.constellation-star-node.tier-3');

    const step1El = container.querySelector('#check-step-1');
    const step2El = container.querySelector('#check-step-2');
    const step3El = container.querySelector('#check-step-3');

    // Milestone 1 (0ms - 1300ms): Starlight nodes twinkle in progressively
    if (step1El) step1El.classList.add('active');
    tier1Stars.forEach(s => { s.style.opacity = '1'; s.style.transform = 'scale(1.1)'; });
    setTimeout(() => {
      tier2Stars.forEach(s => { s.style.opacity = '1'; s.style.transform = 'scale(1.05)'; });
    }, 400);
    setTimeout(() => {
      tier3Stars.forEach(s => { s.style.opacity = '1'; s.style.transform = 'scale(1)'; });
    }, 800);

    // Milestone 2 (1400ms - 2600ms): Filaments weave across the face
    setTimeout(() => {
      if (filamentsEl) filamentsEl.style.opacity = '1';
      if (step2El) step2El.classList.add('active');
    }, 1400);

    // Milestone 3 (2600ms - 3900ms): Scan wave sweeps down the constellation
    setTimeout(() => {
      if (step3El) step3El.classList.add('active');
      if (scanBeamEl) {
        scanBeamEl.style.opacity = '1';
        scanBeamEl.style.transition = 'y 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
        scanBeamEl.setAttribute('y', '76');
      }
    }, 2600);

    // Milestone 4 (4100ms): Navigate to Face Report Screen
    activeAnimationTimer = setTimeout(() => {
      const reportPayload = generateFaceReportData({
        photoSrc,
        eyebrows: metrics.eyebrows,
        eyes: metrics.eyes,
        eyelids: metrics.eyelids,
        nose: metrics.nose,
        lips: metrics.lips,
        chin: metrics.chin,
        intuition: metrics.intuition,
        kindness: metrics.kindness,
        perception: metrics.perception
      });

      try {
        if (typeof window !== 'undefined') {
          window.kaiCurrentFaceReport = reportPayload;
          window.sessionStorage?.setItem('kai_last_face_report', JSON.stringify(reportPayload));
        }
      } catch (err) {
        console.warn('Storage error on face report save:', err);
      }
      reportTelemetry.logEvent(TELEMETRY_EVENTS.READING_COMPLETE, { mode: 'FACE_SCANNER' });
      router.navigate(ROUTES.FACE_REPORT, reportPayload);
    }, 4100);
  }

  // Initial mount
  renderViewfinder();
}
