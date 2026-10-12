/**
 * ScannerHUD Component — Dynamic Computer Vision Palm-Tracked Wireframe HUD
 * Matches exact reference screens & reference app video:
 * - WhatsApp Video 2:34 to 2:42 (Smooth live tracking, Scanning % counter, illuminated creases)
 * - Screenshot 2026-09-24 at 7.07.39 PM.png (Palm Map dynamically tracked on hand)
 * - Screenshot 2026-09-24 at 7.07.50 PM.png (Scanning 57% & Live Illuminated Creases)
 */

import { SCANNER_STATES } from '../scanner/ScannerStateMachine.js';

export const DEFAULT_MAP = {
  wrist: { x: 600, y: 1350 },
  thumbCmc: { x: 390, y: 1260 },
  thumbMcp: { x: 80, y: 1000 },
  thumbTip: { x: 40, y: 875 },
  indexMcp: { x: 440, y: 860 },
  indexTip: { x: 440, y: 480 },
  middleMcp: { x: 580, y: 850 },
  middleTip: { x: 595, y: 430 },
  ringMcp: { x: 690, y: 880 },
  ringTip: { x: 750, y: 475 },
  pinkyMcp: { x: 800, y: 945 },
  pinkyTip: { x: 915, y: 610 },
  heartStart: { x: 760, y: 970 },
  heartEnd: { x: 470, y: 890 }
};

export function getWireframePoints(landmarks, project = null, handSide = 'RIGHT') {
  if (!landmarks || landmarks.length < 21) {
    if (handSide === 'LEFT') {
      const flipX = (pt) => ({ x: 1000 - pt.x, y: pt.y });
      const d = {
        wrist: flipX(DEFAULT_MAP.wrist),
        thumbCmc: flipX(DEFAULT_MAP.thumbCmc),
        thumbMcp: flipX(DEFAULT_MAP.thumbMcp),
        thumbTip: flipX(DEFAULT_MAP.thumbTip),
        indexMcp: flipX(DEFAULT_MAP.indexMcp),
        indexTip: flipX(DEFAULT_MAP.indexTip),
        middleMcp: flipX(DEFAULT_MAP.middleMcp),
        middleTip: flipX(DEFAULT_MAP.middleTip),
        ringMcp: flipX(DEFAULT_MAP.ringMcp),
        ringTip: flipX(DEFAULT_MAP.ringTip),
        pinkyMcp: flipX(DEFAULT_MAP.pinkyMcp),
        pinkyTip: flipX(DEFAULT_MAP.pinkyTip),
        heartStart: flipX(DEFAULT_MAP.heartStart),
        heartEnd: flipX(DEFAULT_MAP.heartEnd)
      };
      return {
        ...d,
        lifePath: `M ${1000 - 420} 940 Q ${1000 - 480} 1150 ${1000 - 490} 1330`,
        headPath: `M ${1000 - 420} 950 Q ${1000 - 560} 1020 ${1000 - 740} 1090`,
        heartPath: `M ${1000 - 760} 970 Q ${1000 - 640} 920 ${1000 - 470} 890`,
        fatePath: { x1: 1000 - 590, y1: 1340, x2: 1000 - 580, y2: 920 }
      };
    }
    const d = DEFAULT_MAP;
    return {
      ...d,
      lifePath: `M 420 940 Q 480 1150 490 1330`,
      headPath: `M 420 950 Q 560 1020 740 1090`,
      heartPath: `M 760 970 Q 640 920 470 890`,
      fatePath: { x1: 590, y1: 1340, x2: 580, y2: 920 }
    };
  }

  const getPt = (id) => {
    const lm = landmarks[id] || landmarks.find(l => l.id === id);
    if (!lm) return null;
    if (typeof project === 'function') {
      return project(lm.x, lm.y);
    }
    return {
      x: Math.round(lm.x * 1000),
      y: Math.round(lm.y * 2000)
    };
  };

  const wrist = getPt(0) || DEFAULT_MAP.wrist;
  const thumbCmc = getPt(1) || DEFAULT_MAP.thumbCmc;
  const thumbMcp = getPt(2) || DEFAULT_MAP.thumbMcp;
  const thumbTip = getPt(4) || DEFAULT_MAP.thumbTip;
  const indexMcp = getPt(5) || DEFAULT_MAP.indexMcp;
  const indexTip = getPt(8) || DEFAULT_MAP.indexTip;
  const middleMcp = getPt(9) || DEFAULT_MAP.middleMcp;
  const middleTip = getPt(12) || DEFAULT_MAP.middleTip;
  const ringMcp = getPt(13) || DEFAULT_MAP.ringMcp;
  const ringTip = getPt(16) || DEFAULT_MAP.ringTip;
  const pinkyMcp = getPt(17) || DEFAULT_MAP.pinkyMcp;
  const pinkyTip = getPt(20) || DEFAULT_MAP.pinkyTip;

  // Palm coordinate frame vectors
  const downVec = { x: wrist.x - middleMcp.x, y: wrist.y - middleMcp.y };
  const acrossVec = { x: pinkyMcp.x - indexMcp.x, y: pinkyMcp.y - indexMcp.y };

  // 1. Life Line (Ayur Rekha / Thenar Crease)
  // Curves gracefully around the thenar eminence (thumb pad) to the base of the palm
  const lifeStart = {
    x: Math.round(indexMcp.x + 0.35 * (thumbMcp.x - indexMcp.x) + 0.22 * downVec.x),
    y: Math.round(indexMcp.y + 0.35 * (thumbMcp.y - indexMcp.y) + 0.22 * downVec.y)
  };
  const lifeCtrl = {
    x: Math.round(thumbCmc.x + 0.42 * (middleMcp.x - thumbCmc.x) + 0.15 * downVec.x),
    y: Math.round(thumbCmc.y + 0.42 * (middleMcp.y - thumbCmc.y) + 0.15 * downVec.y)
  };
  const lifeEnd = {
    x: Math.round(wrist.x + 0.28 * (thumbCmc.x - wrist.x)),
    y: Math.round(wrist.y + 0.08 * (thumbCmc.y - wrist.y))
  };
  const lifePath = `M ${lifeStart.x} ${lifeStart.y} Q ${lifeCtrl.x} ${lifeCtrl.y} ${lifeEnd.x} ${lifeEnd.y}`;

  // 2. Head Line (Matru Rekha / Proximal Transverse Crease)
  // Originates between thumb and index, traverses mid-palm underneath middle & ring fingers
  const headStart = {
    x: Math.round(indexMcp.x + 0.25 * (thumbMcp.x - indexMcp.x) + 0.20 * downVec.x),
    y: Math.round(indexMcp.y + 0.25 * (thumbMcp.y - indexMcp.y) + 0.20 * downVec.y)
  };
  const headCtrl = {
    x: Math.round(middleMcp.x + 0.46 * downVec.x + 0.15 * acrossVec.x),
    y: Math.round(middleMcp.y + 0.46 * downVec.y + 0.15 * acrossVec.y)
  };
  const headEnd = {
    x: Math.round(pinkyMcp.x + 0.52 * (wrist.x - pinkyMcp.x)),
    y: Math.round(pinkyMcp.y + 0.52 * (wrist.y - pinkyMcp.y))
  };
  const headPath = `M ${headStart.x} ${headStart.y} Q ${headCtrl.x} ${headCtrl.y} ${headEnd.x} ${headEnd.y}`;

  // 3. Heart Line (Pitri Rekha / Distal Transverse Crease)
  // Originates under the pinky finger knuckle, sweeps horizontally across upper palm
  const heartStart = {
    x: Math.round(pinkyMcp.x + 0.24 * (wrist.x - pinkyMcp.x)),
    y: Math.round(pinkyMcp.y + 0.24 * (wrist.y - pinkyMcp.y))
  };
  const heartCtrl = {
    x: Math.round(ringMcp.x + 0.22 * downVec.x),
    y: Math.round(ringMcp.y + 0.22 * downVec.y)
  };
  const heartEnd = {
    x: Math.round(indexMcp.x + 0.35 * (middleMcp.x - indexMcp.x) + 0.16 * downVec.x),
    y: Math.round(indexMcp.y + 0.35 * (middleMcp.y - indexMcp.y) + 0.16 * downVec.y)
  };
  const heartPath = `M ${heartStart.x} ${heartStart.y} Q ${heartCtrl.x} ${heartCtrl.y} ${heartEnd.x} ${heartEnd.y}`;

  // 4. Fate Line (Karma Rekha / Vertical Line of Saturn)
  // Ascends vertically along Saturn axis toward middle finger
  const fatePath = {
    x1: Math.round(wrist.x - 0.05 * acrossVec.x),
    y1: Math.round(wrist.y - 0.05 * downVec.y),
    x2: Math.round(middleMcp.x + 0.18 * downVec.x),
    y2: Math.round(middleMcp.y + 0.18 * downVec.y)
  };

  return {
    wrist,
    thumbCmc,
    thumbMcp,
    thumbTip,
    indexMcp,
    indexTip,
    middleMcp,
    middleTip,
    ringMcp,
    ringTip,
    pinkyMcp,
    pinkyTip,
    lifePath,
    headPath,
    heartPath,
    fatePath,
    heartStart,
    heartEnd
  };
}

export function renderScannerHUD({
  handSide = 'RIGHT',
  state = SCANNER_STATES.SEARCHING_FOR_HAND,
  scanProgressPercent = 0,
  feedbackMessage = 'Place palm in view to scan',
  landmarks = null,
  isTorchOn = false,
  isMuted = false,
  isMockActive = false,
  isMirrored = false,
  viewBox = '0 0 1000 2000'
} = {}) {
  const isCapturing = state === SCANNER_STATES.CAPTURING;
  const isScanning = state === SCANNER_STATES.PROCESSING || 
                     state === SCANNER_STATES.VALIDATING || 
                     scanProgressPercent > 0;

  // Clamped percentage
  const pct = Math.min(100, Math.max(0, Math.round(scanProgressPercent)));

  // Dynamic Wireframe Points anchored to tracked hand
  const pts = getWireframePoints(landmarks, null, handSide);

  // Crease line illumination opacities based on progress percent
  const heartOpacity = pct >= 48 ? 1 : 0;
  const lifeOpacity = pct >= 8 ? 1 : 0;
  const headOpacity = pct >= 24 ? 1 : 0;
  const fateOpacity = pct >= 74 ? 1 : 0;

  return `
    <div class="scanner-fullscreen-root" id="scanner-viewfinder-root">
      
      <!-- 1. Live Video Stream Feed -->
      <video id="scanner-video-feed" 
             class="scanner-video-feed" 
             playsinline 
             autoplay 
             muted 
             style="transform: ${isMirrored ? 'scaleX(-1)' : 'none'}; opacity: ${isMockActive ? 0.35 : 1};">
      </video>

      <!-- 2. High-Fidelity Atmospheric Fallback Image (visible when camera initializing or in demo) -->
      <img id="scanner-fallback-img" 
           src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2oNLuCqgmkZOjy5WtDmuwiq-ek3dL4voCj9NN6mJcrwt6EuWSslznL-7exzbwCM0kU4wE6_oJkgm8JOy8WDIDH8NltNQPh86n00LU7CKYs4JxJOoQ8HyyPmvBFlXC-uUAG8imeknXpRjRjnzPHPj9dfvFAdGRZg5GgaXzoKosXhSBwL3K3S8UDU7QAYP7Op5zkhAAYmzbT0QU5JjEa5h_RgHlpXXOamJ_mklvSrHxMp-SbqQV9pGDjshN-o0t2izmtQ" 
           alt="Palm background" 
           style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: ${isMockActive ? 0.75 : 0.15}; pointer-events: none; z-index: ${isMockActive ? 2 : 0}; transform: ${isMirrored ? 'scaleX(-1)' : 'none'};">

      <!-- 3. Top-Right Clean Exit 'X' Button (Matches Screenshot 1 & 2) -->
      <button id="scanner-exit-btn" class="scanner-close-btn" type="button" aria-label="Close scanner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Top-Left Subtle Controls (Hand Toggle & Sound) -->
      <div class="scanner-top-left-controls">
        <button id="scanner-flip-btn" class="scanner-icon-btn" type="button" title="Switch Hand (${handSide})">
          <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.05em; font-family: var(--font-display, inherit); color: #E4C276;">${handSide === 'RIGHT' ? 'R' : 'L'}</span>
        </button>
        <button id="scanner-sound-btn" class="scanner-icon-btn" type="button" title="Toggle Sound">
          <span id="scanner-sound-icon-wrap" style="display: flex; align-items: center; justify-content: center;">
            ${isMuted ? `
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ` : `
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            `}
          </span>
        </button>
      </div>

      <!-- 4. CV-Tracked Palm Map Overlay SVG (Matches Screenshot 1 & 2) -->
      <svg id="scanner-map-svg"
           viewBox="${viewBox}" 
           preserveAspectRatio="none" 
           class="scanner-map-overlay">
        <defs>
          <!-- Red Crease Glow Filter (Matches Screenshot 2) -->
          <filter id="crease-glow-red" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Violet Crease Glow Filter -->
          <filter id="crease-glow-violet" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Blue Crease Glow Filter -->
          <filter id="crease-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Subtle Wireframe Shadow for high contrast -->
          <filter id="wireframe-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
        </defs>

        <g id="scanner-wireframe-group" filter="url(#wireframe-shadow)" style="transition: opacity 0.25s ease;">
          <!-- Main Palm Polygon Plate (Tracked Live on Palm) -->
          <polygon id="scanner-palm-polygon"
                   points="${pts.thumbCmc.x},${pts.thumbCmc.y} ${pts.indexMcp.x},${pts.indexMcp.y} ${pts.middleMcp.x},${pts.middleMcp.y} ${pts.ringMcp.x},${pts.ringMcp.y} ${pts.pinkyMcp.x},${pts.pinkyMcp.y} ${pts.wrist.x},${pts.wrist.y}"
                   fill="none"
                   stroke="#FFFFFF"
                   stroke-width="5"
                   stroke-linecap="round"
                   stroke-linejoin="round"
                   opacity="0.95" />

          <!-- Thumb Ray (Knuckle + Tip, Tracked Live) -->
          <polyline id="scanner-thumb-ray"
                    points="${pts.thumbCmc.x},${pts.thumbCmc.y} ${pts.thumbMcp.x},${pts.thumbMcp.y} ${pts.thumbTip.x},${pts.thumbTip.y}"
                    fill="none"
                    stroke="#FFFFFF"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="0.95" />

          <!-- Index Finger Ray -->
          <line id="scanner-index-ray"
                x1="${pts.indexMcp.x}" y1="${pts.indexMcp.y}" x2="${pts.indexTip.x}" y2="${pts.indexTip.y}"
                stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.95" />

          <!-- Middle Finger Ray -->
          <line id="scanner-middle-ray"
                x1="${pts.middleMcp.x}" y1="${pts.middleMcp.y}" x2="${pts.middleTip.x}" y2="${pts.middleTip.y}"
                stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.95" />

          <!-- Ring Finger Ray -->
          <line id="scanner-ring-ray"
                x1="${pts.ringMcp.x}" y1="${pts.ringMcp.y}" x2="${pts.ringTip.x}" y2="${pts.ringTip.y}"
                stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.95" />

          <!-- Little Finger (Pinky) Ray -->
          <line id="scanner-pinky-ray"
                x1="${pts.pinkyMcp.x}" y1="${pts.pinkyMcp.y}" x2="${pts.pinkyTip.x}" y2="${pts.pinkyTip.y}"
                stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.95" />
        </g>

        <!-- 5. Dynamic Anatomical Crease Lines (During Scan) -->
        <!-- Heart Line — Red/Rose (Matches Screenshot 2, dynamically anchored across palm) -->
        <g id="scanner-heart-group" opacity="${heartOpacity}" style="transition: opacity 0.3s ease;">
          <path id="scanner-heart-path"
                d="${pts.heartPath}" 
                fill="none" 
                stroke="#EF4444" 
                stroke-width="7" 
                stroke-linecap="round" 
                filter="url(#crease-glow-red)" />
        </g>

        <!-- Head Line — Electric Blue -->
        <g id="scanner-head-group" opacity="${headOpacity}" style="transition: opacity 0.3s ease;">
          <path id="scanner-head-path"
                d="${pts.headPath}" 
                fill="none" 
                stroke="#00D2FF" 
                stroke-width="6" 
                stroke-linecap="round" 
                filter="url(#crease-glow-blue)" />
        </g>

        <!-- Life Line — Emerald Glow -->
        <g id="scanner-life-group" opacity="${lifeOpacity}" style="transition: opacity 0.3s ease;">
          <path id="scanner-life-path"
                d="${pts.lifePath}" 
                fill="none" 
                stroke="#10B981" 
                stroke-width="6" 
                stroke-linecap="round" 
                filter="url(#crease-glow-violet)" />
        </g>

        <!-- Fate Line — Warm Gold -->
        <g id="scanner-fate-group" opacity="${fateOpacity}" style="transition: opacity 0.3s ease;">
          <line id="scanner-fate-path"
                x1="${pts.fatePath.x1}" y1="${pts.fatePath.y1}" x2="${pts.fatePath.x2}" y2="${pts.fatePath.y2}" 
                stroke="#FBBF24" 
                stroke-width="5" 
                stroke-linecap="round" />
        </g>
      </svg>

      <!-- 6. Bottom Scanning Progress & Status (Matches Screenshot 2: "Scanning 57%") -->
      <div class="scanner-progress-footer">
        <!-- Live Graceful Guidance Message Pill -->
        <div id="scanner-guidance-pill" class="scanner-align-hint-pill" style="margin-bottom: 10px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 7px; padding: 7px 16px; border-radius: 9999px; background: rgba(15, 19, 32, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.18); color: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.5); transition: all 0.25s ease;">
          <span id="scanner-guidance-icon" style="display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 11V6a1.5 1.5 0 0 0-3 0v4M15 10V4.5a1.5 1.5 0 0 0-3 0V10M12 9.5V3a1.5 1.5 0 0 0-3 0v8M9 10.5V6a1.5 1.5 0 0 0-3 0v8c0 4.418 3.582 8 8 8h1a7 7 0 0 0 7-7v-3a1.5 1.5 0 0 0-3 0v2"/>
            </svg>
          </span>
          <span id="scanner-guidance-text">${feedbackMessage || 'Place palm in view to scan'}</span>
        </div>

        <div id="scanner-progress-track-wrapper" style="display: ${isScanning ? 'flex' : 'none'}; flex-direction: column; align-items: center; width: 100%;">
          <div class="scanner-progress-text" id="scanner-progress-text">Scanning ${pct}%</div>
          <div class="scanner-progress-track">
            <div class="scanner-progress-bar" id="scanner-progress-bar" style="width: ${pct}%;"></div>
          </div>
        </div>
        <div id="scanner-tap-trigger" class="scanner-align-hint-pill" role="button" tabindex="0" style="display: ${isScanning ? 'none' : 'inline-flex'}; cursor: pointer;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
          </svg>
          <span id="scanner-tap-label">Tap to scan</span>
        </div>
      </div>

      <!-- 7. Camera Shutter Flash Layer (Full-screen white flash upon 100% completion) -->
      <div id="shutter-flash" class="scanner-flash-layer" style="opacity: ${isCapturing ? 0.9 : 0};"></div>

    </div>
  `;
}

/**
 * Direct DOM element updater for zero-flicker, 60fps live tracking
 */
export function updateHUDLiveTracking(container, {
  pts,
  pct = 0,
  isScanning = false,
  handDetected = true,
  viewBox = null,
  feedbackMessage = null,
  status = 'PALM_READY'
} = {}) {
  if (!container) return;

  const svg = container.querySelector('#scanner-map-svg');
  if (svg && viewBox) {
    svg.setAttribute('viewBox', viewBox);
  }

  const wireframeGroup = container.querySelector('#scanner-wireframe-group');
  if (wireframeGroup) {
    if (status === 'BACK_OF_HAND') {
      wireframeGroup.style.opacity = '0.30';
    } else {
      wireframeGroup.style.opacity = handDetected ? '0.95' : '0.25';
    }
  }

  const poly = container.querySelector('#scanner-palm-polygon');
  const thumb = container.querySelector('#scanner-thumb-ray');
  const index = container.querySelector('#scanner-index-ray');
  const middle = container.querySelector('#scanner-middle-ray');
  const ring = container.querySelector('#scanner-ring-ray');
  const pinky = container.querySelector('#scanner-pinky-ray');

  const heartGroup = container.querySelector('#scanner-heart-group');
  const headGroup = container.querySelector('#scanner-head-group');
  const lifeGroup = container.querySelector('#scanner-life-group');
  const fateGroup = container.querySelector('#scanner-fate-group');

  const heartPath = container.querySelector('#scanner-heart-path');
  const headPath = container.querySelector('#scanner-head-path');
  const lifePath = container.querySelector('#scanner-life-path');
  const fatePath = container.querySelector('#scanner-fate-path');

  if (pts && poly) {
    poly.setAttribute('points', `${pts.thumbCmc.x},${pts.thumbCmc.y} ${pts.indexMcp.x},${pts.indexMcp.y} ${pts.middleMcp.x},${pts.middleMcp.y} ${pts.ringMcp.x},${pts.ringMcp.y} ${pts.pinkyMcp.x},${pts.pinkyMcp.y} ${pts.wrist.x},${pts.wrist.y}`);
    thumb?.setAttribute('points', `${pts.thumbCmc.x},${pts.thumbCmc.y} ${pts.thumbMcp.x},${pts.thumbMcp.y} ${pts.thumbTip.x},${pts.thumbTip.y}`);
    
    index?.setAttribute('x1', pts.indexMcp.x);
    index?.setAttribute('y1', pts.indexMcp.y);
    index?.setAttribute('x2', pts.indexTip.x);
    index?.setAttribute('y2', pts.indexTip.y);

    middle?.setAttribute('x1', pts.middleMcp.x);
    middle?.setAttribute('y1', pts.middleMcp.y);
    middle?.setAttribute('x2', pts.middleTip.x);
    middle?.setAttribute('y2', pts.middleTip.y);

    ring?.setAttribute('x1', pts.ringMcp.x);
    ring?.setAttribute('y1', pts.ringMcp.y);
    ring?.setAttribute('x2', pts.ringTip.x);
    ring?.setAttribute('y2', pts.ringTip.y);

    pinky?.setAttribute('x1', pts.pinkyMcp.x);
    pinky?.setAttribute('y1', pts.pinkyMcp.y);
    pinky?.setAttribute('x2', pts.pinkyTip.x);
    pinky?.setAttribute('y2', pts.pinkyTip.y);

    if (heartPath && pts.heartPath) heartPath.setAttribute('d', pts.heartPath);
    if (headPath && pts.headPath) headPath.setAttribute('d', pts.headPath);
    if (lifePath && pts.lifePath) lifePath.setAttribute('d', pts.lifePath);
    if (fatePath && pts.fatePath) {
      fatePath.setAttribute('x1', pts.fatePath.x1);
      fatePath.setAttribute('y1', pts.fatePath.y1);
      fatePath.setAttribute('x2', pts.fatePath.x2);
      fatePath.setAttribute('y2', pts.fatePath.y2);
    }
  }

  // Update crease line opacities smoothly — completely suppress on invalid poses (e.g. BACK_OF_HAND, FIST)
  const isInvalidPose = status === 'BACK_OF_HAND' || status === 'FIST_DETECTED' || status === 'NO_HAND';
  const heartOpacity = (!isInvalidPose && pct >= 48) ? 1 : 0;
  const lifeOpacity = (!isInvalidPose && pct >= 8) ? 1 : 0;
  const headOpacity = (!isInvalidPose && pct >= 24) ? 1 : 0;
  const fateOpacity = (!isInvalidPose && pct >= 74) ? 1 : 0;

  if (heartGroup) heartGroup.style.opacity = `${heartOpacity}`;
  if (headGroup) headGroup.style.opacity = `${headOpacity}`;
  if (lifeGroup) lifeGroup.style.opacity = `${lifeOpacity}`;
  if (fateGroup) fateGroup.style.opacity = `${fateOpacity}`;

  // Update progress bar & label
  const progressText = container.querySelector('#scanner-progress-text');
  const progressBar = container.querySelector('#scanner-progress-bar');
  const trackWrapper = container.querySelector('#scanner-progress-track-wrapper');
  const tapTrigger = container.querySelector('#scanner-tap-trigger');

  if (progressText) progressText.textContent = `Scanning ${pct}%`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (trackWrapper && tapTrigger) {
    if (isScanning) {
      trackWrapper.style.display = 'flex';
      tapTrigger.style.display = 'none';
    } else {
      trackWrapper.style.display = 'none';
      tapTrigger.style.display = 'inline-flex';
    }
  }

  // Update Guidance Pill message & icon
  const guidancePill = container.querySelector('#scanner-guidance-pill');
  const guidanceText = container.querySelector('#scanner-guidance-text');
  const guidanceIcon = container.querySelector('#scanner-guidance-icon');

  if (guidanceText && feedbackMessage) {
    guidanceText.textContent = feedbackMessage;
  }
  if (guidanceIcon && status) {
    if (status === 'FIST_DETECTED') {
      guidanceIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
      if (guidancePill) guidancePill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else if (status === 'BACK_OF_HAND') {
      guidanceIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
      `;
      if (guidancePill) guidancePill.style.borderColor = 'rgba(56, 189, 248, 0.45)';
    } else if (status === 'WRONG_HAND') {
      guidanceIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4C276" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 11V6a1.5 1.5 0 0 0-3 0v4M15 10V4.5a1.5 1.5 0 0 0-3 0V10M12 9.5V3a1.5 1.5 0 0 0-3 0v8M9 10.5V6a1.5 1.5 0 0 0-3 0v8c0 4.418 3.582 8 8 8h1a7 7 0 0 0 7-7v-3a1.5 1.5 0 0 0-3 0v2"/>
        </svg>
      `;
      if (guidancePill) guidancePill.style.borderColor = 'rgba(228, 194, 118, 0.45)';
    } else if (status === 'PALM_TOO_FAR' || status === 'PALM_TOO_CLOSE' || status === 'EXCESSIVE_TILT') {
      guidanceIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
      if (guidancePill) guidancePill.style.borderColor = 'rgba(56, 189, 248, 0.4)';
    } else if (status === 'NO_HAND') {
      guidanceIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 11V6a1.5 1.5 0 0 0-3 0v4M15 10V4.5a1.5 1.5 0 0 0-3 0V10M12 9.5V3a1.5 1.5 0 0 0-3 0v8M9 10.5V6a1.5 1.5 0 0 0-3 0v8c0 4.418 3.582 8 8 8h1a7 7 0 0 0 7-7v-3a1.5 1.5 0 0 0-3 0v2"/>
        </svg>
      `;
      if (guidancePill) guidancePill.style.borderColor = 'rgba(168, 85, 247, 0.3)';
    } else {
      guidanceIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
      if (guidancePill) guidancePill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
  }
}
