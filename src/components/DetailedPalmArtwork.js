/**
 * DetailedPalmArtwork Component — Photorealistic 3D Studio Palm Canvas with Calibrated Creases (Option 1)
 * Conforms strictly to Kai RegAI Dark + Gold Visual Direction & Anatomical Samudrika Standards:
 * - Real 3D studio photograph base (/assets/lines/realistic_3d_palm_base.jpg)
 * - Calibrated anatomical crease polylines matching authentic human hand morphology
 * - Consumes active calibration from getActiveCalibratedCreases() (localStorage or defaults)
 * - Non-selected creases remain subtle and faint grey (rgba(255,255,255,0.18))
 * - ONLY the evaluated line or feature is illuminated in radiant luminous gold (#FBBF24 / #FFE58F / #FFFBEB)
 * - 3-layer laser glow: Atmospheric outer halo, vibrant chromatic laser, and ultra-bright white core spine
 * - Full anatomical mirroring for Left Hand (Vama Kara) and Right Hand (Dakshina Kara) via translate(200, 0) scale(-1, 1)
 */

import { getActiveCalibratedCreases } from '../knowledge/calibratedPalmCreases.js';

let detailedArtworkCounter = 0;

const MARRIAGE_CARD_IMAGES = {
  SINGLE_CLEAR: '/assets/lines/card_marriage_single.jpg',
  SINGLE: '/assets/lines/card_marriage_single.jpg',
  MULTIPLE: '/assets/lines/card_marriage_multiple.jpg',
  DOUBLE: '/assets/lines/card_marriage_multiple.jpg',
  TRIPLE: '/assets/lines/card_marriage_multiple.jpg',
  FAINT: '/assets/lines/card_marriage_faint.jpg',
  DEEP: '/assets/lines/card_marriage_deep.jpg',
  UPWARD: '/assets/lines/card_marriage_upward.jpg',
  DOWNWARD: '/assets/lines/card_marriage_downward.jpg',
  FORKED: '/assets/lines/card_marriage_forked.jpg',
  ISLAND: '/assets/lines/card_marriage_island.jpg',
  CHAINED: '/assets/lines/card_marriage_chained.jpg',
  CROSSED: '/assets/lines/card_marriage_crossed.jpg',
  NONE: '/assets/lines/card_marriage_none.jpg'
};

/**
 * Render a photorealistic marked palm card according to the flow section and option
 * @param {Object} options
 * @param {'RIGHT'|'LEFT'} [options.hand='RIGHT']
 * @param {string} options.sectionId - 'hand', 'shape', 'flexibility', 'life_line', 'heart_line', 'head_line', 'destiny_line', 'sun_line', 'special_markings', 'marriage_line'
 * @param {string} options.optionId - Option key from schema
 * @param {number|string} [options.width='100%']
 * @param {number|string} [options.height='100%']
 * @param {string} [options.customClass='']
 * @returns {string} SVG HTML with embedded photorealistic 3D hand and calibrated glowing lines
 */
export function renderDetailedPalmArtwork({
  hand = 'RIGHT',
  sectionId = 'shape',
  optionId = 'SQUARE',
  width = '100%',
  height = '100%',
  customClass = ''
} = {}) {
  detailedArtworkCounter += 1;
  const uid = `dtl_${detailedArtworkCounter}`;
  
  const isMarriage = sectionId === 'marriage_line';
  const effectiveBaseImg = isMarriage
    ? (MARRIAGE_CARD_IMAGES[optionId] || '/assets/lines/card_marriage_single.jpg')
    : '/assets/lines/realistic_3d_palm_base.jpg';

  // Base palm photo is RIGHT hand, so LEFT is mirrored.
  // Reference marriage side-angle photo is LEFT hand, so RIGHT is mirrored.
  let transformAttr = '';
  if (isMarriage) {
    transformAttr = (hand.toUpperCase() === 'RIGHT') ? 'transform="translate(200, 0) scale(-1, 1)"' : '';
  } else if (sectionId === 'hand') {
    transformAttr = (optionId === 'LEFT') ? 'transform="translate(200, 0) scale(-1, 1)"' : '';
  } else {
    transformAttr = (hand.toUpperCase() === 'LEFT') ? 'transform="translate(200, 0) scale(-1, 1)"' : '';
  }

  // Studio photograph base image
  const baseImgSrc = effectiveBaseImg;

  // Read active calibrated crease registry (supports live overrides from #calibrator tool)
  const calibrated = getActiveCalibratedCreases();

  // Calibrated Base Creases on Realistic Hand (ViewBox: 0 0 200 240)
  // Non-evaluated lines remain subtle faint grey (rgba(255,255,255,0.18))
  const faintLifeLine = calibrated.faintLines.life;
  const faintHeadLine = calibrated.faintLines.head;
  const faintHeartLine = calibrated.faintLines.heart;
  const faintFateLine = calibrated.faintLines.destiny;
  const faintSunLine = calibrated.faintLines.sun;

  // Section Specific SVG Overlays
  let evaluatedArtworkSvg = '';
  let geometricOutlineSvg = '';
  let overlayTextSvg = '';

  // 1. HAND SELECTION
  if (sectionId === 'hand') {
    // Both Left and Right hands display all major lines in radiant gold
    evaluatedArtworkSvg = `
      <!-- Life Line Glow -->
      <path d="${faintLifeLine}" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" opacity="0.35" />
      <path d="${faintLifeLine}" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${faintLifeLine}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />

      <!-- Head Line Glow -->
      <path d="${faintHeadLine}" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" opacity="0.35" />
      <path d="${faintHeadLine}" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${faintHeadLine}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />

      <!-- Heart Line Glow -->
      <path d="${faintHeartLine}" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" opacity="0.35" />
      <path d="${faintHeartLine}" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${faintHeartLine}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />

      <!-- Fate Line Glow -->
      <path d="${faintFateLine}" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" opacity="0.3" />
      <path d="${faintFateLine}" stroke="#FBBF24" stroke-width="2.2" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${faintFateLine}" stroke="#FFFBEB" stroke-width="0.9" stroke-linecap="round" />

      <!-- Luminous Origin & Mount Terminus Nodes -->
      <circle cx="56" cy="126" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
      <circle cx="94" cy="226" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
      <circle cx="172" cy="122" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
      <circle cx="82" cy="96" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
    `;
  }

  // 2. PALM FORM (SHAPE)
  else if (sectionId === 'shape') {
    if (optionId === 'SQUARE') {
      geometricOutlineSvg = `
        <!-- Golden 1:1 Square Caliper Box -->
        <rect x="48" y="108" width="104" height="104" rx="8" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5 3" fill="rgba(251, 191, 36, 0.08)" filter="url(#goldGlow_${uid})" />
        
        <!-- Precision Corner Brackets -->
        <path d="M 44 118 L 44 104 L 58 104" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        <path d="M 156 118 L 156 104 L 142 104" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        <path d="M 44 202 L 44 216 L 58 216" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        <path d="M 156 202 L 156 216 L 142 216" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        
        <text x="100" y="156" fill="#FBBF24" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">1 : 1</text>
        <text x="100" y="169" fill="#E4C276" font-size="7.5" font-weight="600" text-anchor="middle" opacity="0.9">EQUAL PROPORTIONS</text>
      `;
    } else if (optionId === 'RECTANGULAR') {
      geometricOutlineSvg = `
        <!-- Golden 1:1.3 Elongated Rectangle Caliper Box -->
        <rect x="54" y="96" width="92" height="120" rx="8" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5 3" fill="rgba(251, 191, 36, 0.08)" filter="url(#goldGlow_${uid})" />
        
        <path d="M 50 106 L 50 92 L 64 92" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        <path d="M 150 106 L 150 92 L 136 92" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        <path d="M 50 206 L 50 220 L 64 220" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        <path d="M 150 206 L 150 220 L 136 220" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" />
        
        <text x="100" y="152" fill="#FBBF24" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">1 : 1.3</text>
        <text x="100" y="165" fill="#E4C276" font-size="7.5" font-weight="600" text-anchor="middle" opacity="0.9">ELONGATED PALM</text>
      `;
    } else if (optionId === 'OVAL') {
      geometricOutlineSvg = `
        <!-- Golden Sacred Elliptical Disc Contour -->
        <ellipse cx="100" cy="156" rx="48" ry="60" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5 3" fill="rgba(251, 191, 36, 0.08)" filter="url(#goldGlow_${uid})" />
        <path d="M 64 156 L 136 156" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1" stroke-dasharray="2 2" />
        
        <text x="100" y="152" fill="#FBBF24" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">ELLIPTICAL</text>
        <text x="100" y="165" fill="#E4C276" font-size="7.5" font-weight="600" text-anchor="middle" opacity="0.9">ROUNDED CONTOURS</text>
      `;
    } else if (optionId === 'BROAD') {
      geometricOutlineSvg = `
        <!-- Golden Wide Trapezoid Base Caliper -->
        <polygon points="52,118 148,112 162,212 40,216" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="5 3" fill="rgba(251, 191, 36, 0.08)" filter="url(#goldGlow_${uid})" />
        <path d="M 40 216 L 162 212" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
        
        <text x="100" y="156" fill="#FBBF24" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">EXPANSIVE</text>
        <text x="100" y="169" fill="#E4C276" font-size="7.5" font-weight="600" text-anchor="middle" opacity="0.9">WIDE HEEL BASE</text>
      `;
    }

    evaluatedArtworkSvg = `
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" stroke-linecap="round" />
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" stroke-linecap="round" />
      <path d="${faintFateLine}" stroke="rgba(255,255,255,0.14)" stroke-width="1.4" stroke-linecap="round" />
      ${geometricOutlineSvg}
    `;
  }

  // 3. PALM FLEXIBILITY (Angle Between Thumb and Other Fingers)
  else if (sectionId === 'flexibility') {
    let flexFingerPath = '';
    let angleText = '30° RIGID';

    // Index finger axis (fixed baseline from web space (56, 145) to index fingertip (66, 48))
    const indexAxisSvg = `
      <line x1="56" y1="145" x2="66" y2="48" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.8" stroke-dasharray="3 3" />
      <circle cx="66" cy="48" r="3" fill="#FFFBEB" style="filter: drop-shadow(0 0 5px #FBBF24);" />
      <text x="66" y="38" fill="#E4C276" font-size="6.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">FINGERS</text>
    `;

    if (optionId === 'NOT_FLEXIBLE') {
      // ~30° Narrow / Stiff thumb held close to index finger
      flexFingerPath = `
        ${indexAxisSvg}
        <!-- Thumb Ray (30° span from web space) -->
        <line x1="56" y1="145" x2="42" y2="98" stroke="#FBBF24" stroke-width="3.4" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <line x1="56" y1="145" x2="42" y2="98" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
        <circle cx="42" cy="98" r="3.5" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
        
        <!-- 30° Angle Arc -->
        <path d="M 59 116 A 30 30 0 0 0 49 121" stroke="#FBBF24" stroke-width="1.6" stroke-dasharray="2 2" fill="none" />
        <text x="62" y="125" fill="#FBBF24" font-size="7.5" font-weight="700">30°</text>
      `;
      angleText = '30° STIFF SPAN';
    } else if (optionId === 'MEDIUM') {
      // ~60° Natural / Balanced thumb span
      flexFingerPath = `
        ${indexAxisSvg}
        <!-- Thumb Ray (60° span from web space) -->
        <line x1="56" y1="145" x2="26" y2="116" stroke="#FBBF24" stroke-width="3.4" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <line x1="56" y1="145" x2="26" y2="116" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
        <circle cx="26" cy="116" r="3.5" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
        
        <!-- 60° Angle Arc -->
        <path d="M 60 110 A 38 38 0 0 0 38 126" stroke="#FBBF24" stroke-width="1.8" stroke-dasharray="2 2" fill="none" />
        <text x="56" y="118" fill="#FBBF24" font-size="7.5" font-weight="700">60°</text>
      `;
      angleText = '60° NATURAL SPAN';
    } else if (optionId === 'VERY_FLEXIBLE') {
      // 90°+ Supple / Wide thumb span at right angle
      flexFingerPath = `
        ${indexAxisSvg}
        <!-- Thumb Ray (90° right-angle span from web space) -->
        <line x1="56" y1="145" x2="12" y2="145" stroke="#FBBF24" stroke-width="3.6" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <line x1="56" y1="145" x2="12" y2="145" stroke="#FFFBEB" stroke-width="1.3" stroke-linecap="round" />
        <circle cx="12" cy="145" r="3.8" fill="#FFFBEB" style="filter: drop-shadow(0 0 8px #FBBF24);" />
        
        <!-- 90° Square Angle Symbol -->
        <path d="M 56 128 L 39 128 L 39 145" stroke="#FBBF24" stroke-width="1.8" fill="rgba(251, 191, 36, 0.15)" />
        <text x="48" y="122" fill="#FBBF24" font-size="7.5" font-weight="700">90°</text>
      `;
      angleText = '90° SUPPLE SPAN';
    }

    evaluatedArtworkSvg = `
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" stroke-linecap="round" />
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" stroke-linecap="round" />
      
      <!-- Luminous Web Space Pivot Node (Thumb Origin) -->
      <circle cx="56" cy="145" r="4.2" fill="#FFFBEB" stroke="#FBBF24" stroke-width="1.8" style="filter: drop-shadow(0 0 6px #FBBF24);" />
      
      ${flexFingerPath}
      
      <!-- Bottom Angle Badge -->
      <rect x="52" y="196" width="96" height="20" rx="10" fill="rgba(14, 11, 22, 0.92)" stroke="rgba(251, 191, 36, 0.65)" stroke-width="1.2" />
      <text x="100" y="210" fill="#FBBF24" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="0.5">${angleText}</text>
    `;
  }

  // 4. LIFE LINE CHARACTERISTICS (Jivita Rekha Highlight)
  else if (sectionId === 'life_line') {
    const lifeConf = calibrated.life_line[optionId] || calibrated.life_line.LONG_CLEAR;
    const lifePathD = lifeConf.path || faintLifeLine;
    let lifeDecorations = '';

    if (optionId === 'DEEP') {
      lifeDecorations = `
        <path d="${lifePathD}" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" opacity="0.45" />
      `;
    }

    evaluatedArtworkSvg = `
      <!-- Faint Non-selected Creases -->
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintFateLine}" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" stroke-linecap="round" />

      <!-- Highlighted Life Line in Radiant Gold -->
      ${lifeDecorations}
      <path d="${lifePathD}" stroke="#FBBF24" stroke-width="${lifeConf.strokeWidth || (optionId === 'FAINT_FRAGMENTED' ? 2.2 : 3.2)}" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${lifePathD}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
      <circle cx="56" cy="126" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
    `;
  }

  // 5. HEART LINE CHARACTERISTICS (Hridaya Rekha Highlight)
  else if (sectionId === 'heart_line') {
    const heartConf = calibrated.heart_line[optionId] || calibrated.heart_line.LONG;
    const heartPathD = heartConf.path || faintHeartLine;
    let heartDecorations = '';

    if (optionId === 'DEEP') {
      heartDecorations = `<path d="${heartPathD}" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" opacity="0.45" />`;
    } else if (optionId === 'FORKED' && heartConf.branch1 && heartConf.branch2) {
      heartDecorations = `
        <path d="${heartConf.branch1}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${heartConf.branch2}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${heartConf.branch1}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />
        <path d="${heartConf.branch2}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />
      `;
    }

    evaluatedArtworkSvg = `
      <!-- Faint Non-selected Creases -->
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintFateLine}" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" stroke-linecap="round" />

      <!-- Highlighted Heart Line in Radiant Gold -->
      ${heartDecorations}
      <path d="${heartPathD}" stroke="#FBBF24" stroke-width="${heartConf.strokeWidth || 3.2}" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${heartPathD}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
      <circle cx="172" cy="122" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
    `;
  }

  // 6. HEAD LINE CHARACTERISTICS (Shiro Rekha Highlight)
  else if (sectionId === 'head_line') {
    const headConf = calibrated.head_line[optionId] || calibrated.head_line.LONG;
    const headPathD = headConf.path || faintHeadLine;
    let headDecorations = '';

    if (optionId === 'DEEP') {
      headDecorations = `<path d="${headPathD}" stroke="#FBBF24" stroke-width="6" stroke-linecap="round" opacity="0.45" />`;
    } else if (optionId === 'FORKED' && headConf.branch1 && headConf.branch2) {
      headDecorations = `
        <path d="${headConf.branch1}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${headConf.branch2}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${headConf.branch1}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />
        <path d="${headConf.branch2}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />
      `;
    }

    evaluatedArtworkSvg = `
      <!-- Faint Non-selected Creases -->
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintFateLine}" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" stroke-linecap="round" />

      <!-- Highlighted Head Line in Radiant Gold -->
      ${headDecorations}
      <path d="${headPathD}" stroke="#FBBF24" stroke-width="${headConf.strokeWidth || 3.2}" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      <path d="${headPathD}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
      <circle cx="56" cy="126" r="3.2" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
    `;
  }

  // 7. DESTINY LINE CHARACTERISTICS (Bhagya Rekha Highlight)
  else if (sectionId === 'destiny_line') {
    const destinyConf = calibrated.destiny_line[optionId] || calibrated.destiny_line.CLEAR;
    const destinyPathD = destinyConf.path;
    let destinyDecorations = '';

    if (optionId === 'ABSENT') {
      destinyDecorations = `
        <path d="${destinyConf.guidePath || 'M 94 220 L 96 150 L 96 90'}" stroke="rgba(251, 191, 36, 0.25)" stroke-width="1.2" stroke-dasharray="3 3" />
      `;
    } else if (optionId === 'DOUBLE_LINE' && destinyConf.line2) {
      destinyDecorations = `
        <path d="${destinyConf.line2}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${destinyConf.line2}" stroke="#FFFBEB" stroke-width="1.0" stroke-linecap="round" />
      `;
    } else if (optionId === 'REACHES_FINGERS') {
      destinyDecorations = `<circle cx="96" cy="74" r="3.5" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />`;
    }

    evaluatedArtworkSvg = `
      <!-- Faint Non-selected Creases -->
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />

      <!-- Highlighted Destiny Line in Radiant Gold -->
      ${destinyDecorations}
      ${destinyPathD ? `
        <path d="${destinyPathD}" stroke="#FBBF24" stroke-width="${destinyConf.strokeWidth || 3.4}" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${destinyPathD}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
      ` : ''}
    `;
  }

  // 8. SUN LINE CHARACTERISTICS (Surya Rekha Highlight)
  else if (sectionId === 'sun_line') {
    const sunConf = calibrated.sun_line[optionId] || calibrated.sun_line.CLEAR;
    const sunPathD = sunConf.path;
    let sunDecorations = '';

    if (optionId === 'ABSENT') {
      sunDecorations = `
        <path d="${sunConf.guidePath || 'M 124 150 L 124 94'}" stroke="rgba(251, 191, 36, 0.25)" stroke-width="1.2" stroke-dasharray="3 3" />
      `;
    } else if (optionId === 'MULTIPLE' && sunConf.line1 && sunConf.line2) {
      sunDecorations = `
        <path d="${sunConf.line1}" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${sunConf.line2}" stroke="#FBBF24" stroke-width="2.4" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
      `;
    }

    evaluatedArtworkSvg = `
      <!-- Faint Non-selected Creases -->
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintFateLine}" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" stroke-linecap="round" />

      <!-- Highlighted Sun Line in Radiant Gold -->
      ${sunDecorations}
      ${sunPathD ? `
        <path d="${sunPathD}" stroke="#FBBF24" stroke-width="${sunConf.strokeWidth || 3.2}" stroke-linecap="round" filter="url(#goldGlow_${uid})" />
        <path d="${sunPathD}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
        <circle cx="124" cy="94" r="3" fill="#FFFBEB" style="filter: drop-shadow(0 0 6px #FBBF24);" />
      ` : ''}
    `;
  }

  // 9. MARRIAGE LINE (Vivaha Rekha on Outer Percussion Under Pinky — Side Angle Studio Photo)
  else if (sectionId === 'marriage_line') {
    const MARRIAGE_TITLES = {
      SINGLE_CLEAR: 'SINGLE & CLEAR',
      SINGLE: 'SINGLE LINE',
      MULTIPLE: 'MULTIPLE LINES',
      DOUBLE: 'DOUBLE LINE',
      TRIPLE: 'TRIPLE LINE',
      FAINT: 'FAINT LINE',
      DEEP: 'DEEP LINE',
      UPWARD: 'UPWARD SLANTING',
      DOWNWARD: 'DOWNWARD SLANTING',
      FORKED: 'FORKED LINE',
      ISLAND: 'ISLAND',
      CHAINED: 'CHAIN-LIKE',
      CROSSED: 'CROSSED / INTERRUPTED',
      NONE: 'NO LINE'
    };
    const badgeText = MARRIAGE_TITLES[optionId] || 'SINGLE & CLEAR';

    // Marriage line displays authentic side angle photograph containing the line
    evaluatedArtworkSvg = '';

    // Unmirrored header indicator and bottom badge
    overlayTextSvg = `
      <!-- Percussion Zone Focus Indicator under Pinky -->
      <g class="marriage-focus-indicator">
        <text x="100" y="20" fill="#FBBF24" font-size="7" font-weight="700" text-anchor="middle" letter-spacing="1">UNDER PINKY</text>
      </g>
      <rect x="36" y="204" width="128" height="20" rx="10" fill="rgba(14, 11, 22, 0.88)" stroke="rgba(251, 191, 36, 0.6)" stroke-width="1.1" />
      <text x="100" y="217" fill="#FBBF24" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${badgeText}</text>
    `;
  }

  // 10. SPECIAL MARKINGS (Authentic Mount Overlays on Real Palm)
  else if (sectionId === 'special_markings') {
    let markSvg = '';
    const marksConf = calibrated.special_markings;

    if (optionId === 'STAR') {
      const { cx, cy } = marksConf.STAR || { cx: 74, cy: 105 };
      markSvg = `
        <g transform="translate(${cx}, ${cy})" filter="url(#goldGlow_${uid})">
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" />
          <line x1="-7" y1="-7" x2="7" y2="7" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" />
          <line x1="-7" y1="7" x2="7" y2="-7" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="0" cy="0" r="2.8" fill="#FFFBEB" />
        </g>
      `;
    } else if (optionId === 'CROSS') {
      const { cx, cy } = marksConf.CROSS || { cx: 105, cy: 132 };
      markSvg = `
        <g transform="translate(${cx}, ${cy})" filter="url(#goldGlow_${uid})">
          <line x1="-9" y1="-9" x2="9" y2="9" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" />
          <line x1="-9" y1="9" x2="9" y2="-9" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" />
          <line x1="-9" y1="-9" x2="9" y2="9" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
          <line x1="-9" y1="9" x2="9" y2="-9" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
        </g>
      `;
    } else if (optionId === 'TRIANGLE') {
      const { cx, cy } = marksConf.TRIANGLE || { cx: 96, cy: 96 };
      markSvg = `
        <polygon points="${cx},${cy - 10} ${cx - 10},${cy + 10} ${cx + 10},${cy + 10}" stroke="#FBBF24" stroke-width="2.6" fill="rgba(251, 191, 36, 0.25)" stroke-linejoin="round" filter="url(#goldGlow_${uid})" />
        <circle cx="${cx}" cy="${cy}" r="2" fill="#FFFBEB" />
      `;
    } else if (optionId === 'SQUARE') {
      const { cx, cy } = marksConf.SQUARE || { cx: 74, cy: 172 };
      markSvg = `
        <rect x="${cx - 9}" y="${cy - 9}" width="18" height="18" rx="2" stroke="#FBBF24" stroke-width="2.6" fill="rgba(251, 191, 36, 0.2)" filter="url(#goldGlow_${uid})" />
        <rect x="${cx - 9}" y="${cy - 9}" width="18" height="18" rx="2" stroke="#FFFBEB" stroke-width="1" fill="none" />
      `;
    } else if (optionId === 'ISLAND') {
      const { cx, cy } = marksConf.ISLAND || { cx: 108, cy: 136 };
      markSvg = `
        <ellipse cx="${cx}" cy="${cy}" rx="10" ry="5.5" stroke="#FBBF24" stroke-width="2.6" fill="rgba(20, 16, 28, 0.85)" filter="url(#goldGlow_${uid})" />
        <ellipse cx="${cx}" cy="${cy}" rx="10" ry="5.5" stroke="#FFFBEB" stroke-width="1" fill="none" />
      `;
    } else if (optionId === 'FORK') {
      const { cx, cy } = marksConf.FORK || { cx: 72, cy: 92 };
      markSvg = `
        <g transform="translate(${cx}, ${cy})" filter="url(#goldGlow_${uid})">
          <path d="M 12 0 L 0 0 M 0 0 L -10 -9 M 0 0 L -10 9" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" />
          <path d="M 12 0 L 0 0 M 0 0 L -10 -9 M 0 0 L -10 9" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
        </g>
      `;
    } else if (optionId === 'CHAINED') {
      const { cx, cy } = marksConf.CHAINED || { cx: 66, cy: 148 };
      markSvg = `
        <g transform="translate(${cx}, ${cy})" filter="url(#goldGlow_${uid})">
          <ellipse cx="0" cy="0" rx="6" ry="3.5" stroke="#FBBF24" stroke-width="2" fill="none" />
          <ellipse cx="8" cy="4" rx="6" ry="3.5" stroke="#FBBF24" stroke-width="2" fill="none" />
          <ellipse cx="16" cy="9" rx="6" ry="3.5" stroke="#FBBF24" stroke-width="2" fill="none" />
          <circle cx="0" cy="0" r="1.5" fill="#FFFBEB" />
          <circle cx="8" cy="4" r="1.5" fill="#FFFBEB" />
          <circle cx="16" cy="9" r="1.5" fill="#FFFBEB" />
        </g>
      `;
    }

    evaluatedArtworkSvg = `
      <path d="${faintLifeLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeadLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintHeartLine}" stroke="rgba(255,255,255,0.18)" stroke-width="1.6" stroke-linecap="round" />
      <path d="${faintFateLine}" stroke="rgba(255,255,255,0.14)" stroke-width="1.2" stroke-linecap="round" />
      ${markSvg}
    `;
  }

  return `
    <svg class="detailed-palm-svg ${customClass}" viewBox="0 0 200 240" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- Luminous Laser Gold Glow Filter -->
        <filter id="goldGlow_${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.2" result="blur1" />
          <feGaussianBlur stdDeviation="1.6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Rounded Card Viewport Clip for Photograph -->
        <clipPath id="cardClip_${uid}">
          <rect x="0" y="0" width="200" height="240" rx="14" />
        </clipPath>

        <!-- Seamless Edge Dark Vignette Overlay -->
        <radialGradient id="palmVignette_${uid}" cx="50%" cy="52%" r="58%">
          <stop offset="55%" stop-color="transparent" />
          <stop offset="90%" stop-color="rgba(7, 7, 12, 0.65)" />
          <stop offset="100%" stop-color="rgba(7, 7, 12, 0.95)" />
        </radialGradient>

        <!-- Warm Center Sacred Aura Glow -->
        <radialGradient id="sacredCenterGlow_${uid}" cx="50%" cy="58%" r="48%">
          <stop offset="0%" stop-color="rgba(251, 191, 36, 0.16)" />
          <stop offset="60%" stop-color="rgba(228, 194, 118, 0.05)" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
      </defs>

      <!-- Base Dark Background Plate (prevents any layout shift) -->
      <rect x="0" y="0" width="200" height="240" rx="14" fill="#0C0A14" />

      <!-- Hand Container with Clean Anatomical Left/Right Mirroring -->
      <g ${transformAttr}>
        
        <!-- 1. Photorealistic 3D Studio Palm Photo Base -->
        <g clip-path="url(#cardClip_${uid})">
          <image href="${baseImgSrc}" xlink:href="${baseImgSrc}" x="0" y="0" width="200" height="240" preserveAspectRatio="${isMarriage ? 'xMidYMid slice' : 'none'}" style="filter: contrast(1.05) brightness(1.02);" />
          
          <!-- Subtle Dark Vignette Border -->
          <rect x="0" y="0" width="200" height="240" fill="url(#palmVignette_${uid})" />
          <rect x="0" y="0" width="200" height="240" fill="none" stroke="rgba(228, 194, 118, 0.28)" stroke-width="1.2" rx="14" />
        </g>

        <!-- Center Sacred Ambient Aura (only for open palm) -->
        ${isMarriage ? '' : `<circle cx="100" cy="145" r="50" fill="url(#sacredCenterGlow_${uid})" />`}

        <!-- 2. Evaluated Lines & Features Calibrated Over Realistic Hand -->
        ${evaluatedArtworkSvg}

      </g>

      <!-- 3. Unmirrored Labels & Overlays -->
      ${overlayTextSvg}
    </svg>
  `;
}
