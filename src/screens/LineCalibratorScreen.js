/**
 * LineCalibratorScreen Component — Interactive Crease Alignment & Calibration Tool
 * Uses exactly 4 control points (P0, P1, P2, P3) for cubic Bezier crease trajectories:
 * - P0: Start / Origin (Green)
 * - P1: Handle 1 Curvature Control (Cyan)
 * - P2: Handle 2 Curvature Control (Purple)
 * - P3: Terminus / End (Amber)
 * Supports:
 * - Forked Line options (Heart & Head Lines) with real-time branching attached to P3
 * - Special Markings calibration (Star, Cross, Triangle, Square, Island, Fork, Chained) with draggable mount positions
 * - Marriage Line side view calibration under the pinky finger (Single, Double, Triple, None)
 * - Native SVG matrix transformation and Pointer Capture for smooth dragging with 0 jump.
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import {
  getActiveCalibratedCreases,
  saveCalibratedCreases,
  resetCalibratedCreases,
  DEFAULT_CALIBRATED_CREASES,
  normalizeTo4Points,
  pointsToSvgPath
} from '../knowledge/calibratedPalmCreases.js';

// Pre-scaled ground-truth reference points from PALM-0001 real dataset capture (subsampled to 4 points)
const DATASET_REF_LINES = {
  life: [
    { x: 39, y: 152 }, { x: 56, y: 153 }, { x: 74, y: 195 }, { x: 92, y: 226 }
  ],
  head: [
    { x: 42, y: 150 }, { x: 80, y: 146 }, { x: 125, y: 152 }, { x: 162, y: 168 }
  ],
  heart: [
    { x: 175, y: 124 }, { x: 135, y: 114 }, { x: 105, y: 104 }, { x: 78, y: 94 }
  ],
  destiny: [
    { x: 92, y: 226 }, { x: 94, y: 180 }, { x: 96, y: 135 }, { x: 96, y: 92 }
  ]
};

export function renderLineCalibratorScreen(container) {
  let activeData = JSON.parse(JSON.stringify(getActiveCalibratedCreases()));
  let activeSection = 'life_line'; // 'life_line', 'heart_line', 'head_line', 'destiny_line', 'sun_line', 'marriage_line', 'special_markings', 'faint'
  let activeVariation = 'LONG_CLEAR';
  let activeHand = 'RIGHT'; // 'RIGHT' or 'LEFT'
  let showDatasetRef = false;
  let showFaintCreases = true;
  let activeHandleIndex = 0;
  let isDragging = false;
  let draggedIndex = -1;

  // Compute dynamic fork branches from terminus P3
  function computeForkBranches(sec, p3) {
    if (sec === 'heart_line') {
      return {
        branch1: `M ${p3.x} ${p3.y} C ${p3.x - 8} ${p3.y - 8} ${p3.x - 16} ${p3.y - 16} ${p3.x - 22} ${p3.y - 25}`,
        branch2: `M ${p3.x} ${p3.y} C ${p3.x - 8} ${p3.y + 4} ${p3.x - 14} ${p3.y + 10} ${p3.x - 20} ${p3.y + 16}`
      };
    }
    // Head line writer's fork
    return {
      branch1: `M ${p3.x} ${p3.y} Q ${p3.x + 10} ${p3.y - 4} ${p3.x + 22} ${p3.y - 8}`,
      branch2: `M ${p3.x} ${p3.y} Q ${p3.x + 10} ${p3.y + 10} ${p3.x + 18} ${p3.y + 24}`
    };
  }

  // Extract strictly 4 points [P0, P1, P2, P3] for current active line or position
  function getCurrent4Points() {
    if (activeSection === 'special_markings') {
      const sm = activeData.special_markings?.[activeVariation] || DEFAULT_CALIBRATED_CREASES.special_markings[activeVariation] || { cx: 100, cy: 120 };
      return [{ x: sm.cx, y: sm.cy }, { x: sm.cx, y: sm.cy }, { x: sm.cx, y: sm.cy }, { x: sm.cx, y: sm.cy }];
    }
    if (activeSection === 'marriage_line') {
      const ml = activeData.marriage_line?.[activeVariation] || DEFAULT_CALIBRATED_CREASES.marriage_line[activeVariation] || {};
      if (ml.points && ml.points.length > 0) return normalizeTo4Points(ml.points);
      if (ml.path) return normalizeTo4Points(parsePathToPoints(ml.path));
      if (ml.lines && ml.lines[0]) return normalizeTo4Points(parsePathToPoints(ml.lines[0]));
      return [{ x: 194, y: 116 }, { x: 185, y: 116 }, { x: 176, y: 116 }, { x: 168, y: 116 }];
    }
    if (activeSection === 'faint') {
      const pathStr = activeData.faintLines[activeVariation] || '';
      return normalizeTo4Points(parsePathToPoints(pathStr));
    }
    const secObj = activeData[activeSection] || {};
    const varObj = secObj[activeVariation] || {};
    if (varObj.points && varObj.points.length > 0) {
      return normalizeTo4Points(varObj.points);
    }
    return normalizeTo4Points(parsePathToPoints(varObj.path || ''));
  }

  function parsePathToPoints(pathStr) {
    if (!pathStr) return [{ x: 56, y: 126 }, { x: 76, y: 152 }, { x: 88, y: 196 }, { x: 94, y: 226 }];
    const nums = pathStr.match(/-?[\d.]+/g)?.map(Number) || [];
    const pts = [];
    for (let i = 0; i < nums.length; i += 2) {
      if (nums[i] !== undefined && nums[i + 1] !== undefined) {
        pts.push({ x: Math.round(nums[i]), y: Math.round(nums[i + 1]) });
      }
    }
    return pts.length >= 2 ? pts : [{ x: 56, y: 126 }, { x: 76, y: 152 }, { x: 88, y: 196 }, { x: 94, y: 226 }];
  }

  // Persist updated coordinates to active memory
  function savePointsToActiveData(pts) {
    if (activeSection === 'special_markings') {
      if (!activeData.special_markings) activeData.special_markings = {};
      const defMount = DEFAULT_CALIBRATED_CREASES.special_markings[activeVariation]?.mount || 'Palm Center';
      activeData.special_markings[activeVariation] = {
        cx: pts[0].x,
        cy: pts[0].y,
        mount: activeData.special_markings[activeVariation]?.mount || defMount
      };
      return;
    }

    const valid4 = normalizeTo4Points(pts);
    const pathStr = pointsToSvgPath(valid4);

    if (activeSection === 'faint') {
      activeData.faintLines[activeVariation] = pathStr;
    } else if (activeSection === 'marriage_line') {
      if (!activeData.marriage_line) activeData.marriage_line = {};
      if (!activeData.marriage_line[activeVariation]) activeData.marriage_line[activeVariation] = {};
      activeData.marriage_line[activeVariation].points = valid4;
      activeData.marriage_line[activeVariation].path = pathStr;
      if (activeVariation === 'SINGLE') {
        activeData.marriage_line[activeVariation].lines = [`M ${valid4[0].x} ${valid4[0].y} L ${valid4[3].x} ${valid4[3].y}`];
      } else if (activeVariation === 'DOUBLE') {
        activeData.marriage_line[activeVariation].lines = [
          `M ${valid4[0].x} ${valid4[0].y - 5} L ${valid4[3].x} ${valid4[3].y - 5}`,
          `M ${valid4[0].x} ${valid4[0].y + 5} L ${valid4[3].x} ${valid4[3].y + 5}`
        ];
      } else if (activeVariation === 'TRIPLE') {
        activeData.marriage_line[activeVariation].lines = [
          `M ${valid4[0].x} ${valid4[0].y - 8} L ${valid4[3].x} ${valid4[3].y - 8}`,
          `M ${valid4[0].x} ${valid4[0].y} L ${valid4[3].x} ${valid4[3].y}`,
          `M ${valid4[0].x} ${valid4[0].y + 8} L ${valid4[3].x} ${valid4[3].y + 8}`
        ];
      }
    } else {
      if (!activeData[activeSection]) activeData[activeSection] = {};
      if (!activeData[activeSection][activeVariation]) activeData[activeSection][activeVariation] = {};
      activeData[activeSection][activeVariation].points = valid4;
      activeData[activeSection][activeVariation].path = pathStr;

      // When calibrating a forked line, automatically link the branches to P3
      if (activeVariation === 'FORKED') {
        const branches = computeForkBranches(activeSection, valid4[3]);
        activeData[activeSection][activeVariation].branch1 = branches.branch1;
        activeData[activeSection][activeVariation].branch2 = branches.branch2;
      }
    }
  }

  function render() {
    const pts = getCurrent4Points(); // Strictly 4 points: P0, P1, P2, P3
    const currentPath = pointsToSvgPath(pts);
    const isLeft = activeHand === 'LEFT';
    const mirrorTransform = isLeft ? 'transform="translate(200, 0) scale(-1, 1)"' : '';

    const variationsMap = {
      life_line: ['LONG_CLEAR', 'SHORT', 'DEEP', 'WIDE_CURVE', 'CLOSE_TO_THUMB'],
      heart_line: ['LONG', 'SHORT', 'STRAIGHT', 'CURVED', 'DEEP', 'FAINT', 'FORKED'],
      head_line: ['LONG', 'SHORT', 'STRAIGHT', 'SLOPING', 'DEEP', 'FAINT', 'FORKED'],
      destiny_line: ['CLEAR', 'FAINT', 'CROSSES_PALM', 'REACHES_FINGERS'],
      sun_line: ['SHORT', 'LONG', 'CLEAR', 'FAINT'],
      marriage_line: ['SINGLE', 'DOUBLE', 'TRIPLE', 'NONE'],
      special_markings: ['STAR', 'CROSS', 'TRIANGLE', 'SQUARE', 'ISLAND', 'FORK', 'CHAINED'],
      faint: ['life', 'head', 'heart', 'destiny', 'sun']
    };
    const currentVariations = variationsMap[activeSection] || [];

    if (activeHandleIndex >= 4) {
      activeHandleIndex = 0;
    }

    const isMarking = activeSection === 'special_markings';
    const isForked = activeVariation === 'FORKED';
    const isMarriage = activeSection === 'marriage_line';

    // Fork branches if applicable
    const forkBranches = isForked ? computeForkBranches(activeSection, pts[3]) : null;

    const pointLabels = isMarking ? [
      { id: 0, name: `${activeVariation} Mount Center`, color: '#FBBF24' }
    ] : [
      { id: 0, name: 'P0 (Start)', color: '#10B981' },
      { id: 1, name: 'P1 (Curve 1)', color: '#00D2FF' },
      { id: 2, name: 'P2 (Curve 2)', color: '#A855F7' },
      { id: 3, name: 'P3 (End)', color: '#F59E0B' }
    ];

    // Special Marking Glyph rendering
    function getMarkingGlyphSvg(type, cx, cy) {
      if (type === 'STAR') {
        return `
          <g filter="url(#calibGlow)">
            <line id="calib-sm-1" x1="${cx - 11}" y1="${cy}" x2="${cx + 11}" y2="${cy}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" />
            <line id="calib-sm-2" x1="${cx}" y1="${cy - 11}" x2="${cx}" y2="${cy + 11}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" />
            <line id="calib-sm-3" x1="${cx - 8}" y1="${cy - 8}" x2="${cx + 8}" y2="${cy + 8}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" />
            <line id="calib-sm-4" x1="${cx - 8}" y1="${cy + 8}" x2="${cx + 8}" y2="${cy - 8}" stroke="#FBBF24" stroke-width="2.8" stroke-linecap="round" />
            <circle id="calib-sm-dot" cx="${cx}" cy="${cy}" r="3.2" fill="#FFFBEB" />
          </g>
        `;
      }
      if (type === 'CROSS') {
        return `
          <g filter="url(#calibGlow)">
            <line id="calib-sm-1" x1="${cx - 10}" y1="${cy - 10}" x2="${cx + 10}" y2="${cy + 10}" stroke="#FBBF24" stroke-width="3.2" stroke-linecap="round" />
            <line id="calib-sm-2" x1="${cx - 10}" y1="${cy + 10}" x2="${cx + 10}" y2="${cy - 10}" stroke="#FBBF24" stroke-width="3.2" stroke-linecap="round" />
            <line id="calib-sm-3" x1="${cx - 10}" y1="${cy - 10}" x2="${cx + 10}" y2="${cy + 10}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
            <line id="calib-sm-4" x1="${cx - 10}" y1="${cy + 10}" x2="${cx + 10}" y2="${cy - 10}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
          </g>
        `;
      }
      if (type === 'TRIANGLE') {
        return `
          <g filter="url(#calibGlow)">
            <polygon id="calib-sm-poly" points="${cx},${cy - 12} ${cx - 12},${cy + 10} ${cx + 12},${cy + 10}" stroke="#FBBF24" stroke-width="2.8" fill="rgba(251, 191, 36, 0.25)" stroke-linejoin="round" />
            <circle id="calib-sm-dot" cx="${cx}" cy="${cy}" r="2.5" fill="#FFFBEB" />
          </g>
        `;
      }
      if (type === 'SQUARE') {
        return `
          <g filter="url(#calibGlow)">
            <rect id="calib-sm-rect1" x="${cx - 10}" y="${cy - 10}" width="20" height="20" rx="2" stroke="#FBBF24" stroke-width="2.8" fill="rgba(251, 191, 36, 0.2)" />
            <rect id="calib-sm-rect2" x="${cx - 10}" y="${cy - 10}" width="20" height="20" rx="2" stroke="#FFFBEB" stroke-width="1" fill="none" />
          </g>
        `;
      }
      if (type === 'ISLAND') {
        return `
          <g filter="url(#calibGlow)">
            <ellipse id="calib-sm-el1" cx="${cx}" cy="${cy}" rx="12" ry="6.5" stroke="#FBBF24" stroke-width="2.8" fill="rgba(20, 16, 28, 0.85)" />
            <ellipse id="calib-sm-el2" cx="${cx}" cy="${cy}" rx="12" ry="6.5" stroke="#FFFBEB" stroke-width="1" fill="none" />
          </g>
        `;
      }
      if (type === 'FORK') {
        return `
          <g filter="url(#calibGlow)">
            <path id="calib-sm-path1" d="M ${cx + 14} ${cy} L ${cx} ${cy} M ${cx} ${cy} L ${cx - 12} ${cy - 10} M ${cx} ${cy} L ${cx - 12} ${cy + 10}" stroke="#FBBF24" stroke-width="3.2" stroke-linecap="round" />
            <path id="calib-sm-path2" d="M ${cx + 14} ${cy} L ${cx} ${cy} M ${cx} ${cy} L ${cx - 12} ${cy - 10} M ${cx} ${cy} L ${cx - 12} ${cy + 10}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />
          </g>
        `;
      }
      // CHAINED
      return `
        <g filter="url(#calibGlow)">
          <ellipse id="calib-sm-ch1" cx="${cx - 8}" cy="${cy - 4}" rx="6" ry="3.5" stroke="#FBBF24" stroke-width="2.2" fill="none" />
          <ellipse id="calib-sm-ch2" cx="${cx}" cy="${cy}" rx="6" ry="3.5" stroke="#FBBF24" stroke-width="2.2" fill="none" />
          <ellipse id="calib-sm-ch3" cx="${cx + 8}" cy="${cy + 4}" rx="6" ry="3.5" stroke="#FBBF24" stroke-width="2.2" fill="none" />
        </g>
      `;
    }

    container.innerHTML = `
      <div class="calibrator-root">
        <!-- Sticky Header -->
        <header class="calibrator-header">
          <div class="calibrator-nav-row">
            <button class="calibrator-back-btn" id="calib-back-btn" aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div class="calibrator-title-col">
              <h1 class="calibrator-title">Crease Calibrator</h1>
              <span class="calibrator-subtitle">${isMarking ? 'Drag sacred marking over the mounts' : (isForked ? 'Calibrate stem & fork branches' : 'Drag P0, P1, P2, P3 over the creases')}</span>
            </div>
            <button class="calibrator-test-btn" id="calib-test-btn">
              <span>View Cards</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Section Tabs -->
          <div class="calibrator-pills-row">
            <button class="calib-pill ${activeSection === 'life_line' ? 'active' : ''}" data-sec="life_line">Life Line</button>
            <button class="calib-pill ${activeSection === 'heart_line' ? 'active' : ''}" data-sec="heart_line">Heart Line</button>
            <button class="calib-pill ${activeSection === 'head_line' ? 'active' : ''}" data-sec="head_line">Head Line</button>
            <button class="calib-pill ${activeSection === 'destiny_line' ? 'active' : ''}" data-sec="destiny_line">Destiny Line</button>
            <button class="calib-pill ${activeSection === 'sun_line' ? 'active' : ''}" data-sec="sun_line">Sun Line</button>
            <button class="calib-pill ${activeSection === 'special_markings' ? 'active' : ''}" data-sec="special_markings">Special Markings</button>
            <button class="calib-pill ${activeSection === 'faint' ? 'active' : ''}" data-sec="faint">Base Faint</button>
          </div>

          <!-- Variation Subpills -->
          <div class="calibrator-subpills-row">
            ${currentVariations.map(v => `
              <button class="calib-subpill ${activeVariation === v ? 'active' : ''}" data-var="${v}">
                ${v.replace(/_/g, ' ')}
              </button>
            `).join('')}
          </div>
        </header>

        <!-- Main Workspace -->
        <main class="calibrator-workspace">
          <!-- Canvas Card -->
          <div class="calibrator-canvas-card">
            
            <!-- Quick View Controls Bar -->
            <div class="calibrator-quick-bar">
              <div class="calib-toggle-group">
                <button class="calib-btn-mini ${activeHand === 'RIGHT' ? 'active' : ''}" id="toggle-hand-r">Right Palm</button>
                <button class="calib-btn-mini ${activeHand === 'LEFT' ? 'active' : ''}" id="toggle-hand-l">Left Palm</button>
              </div>

              <div class="calib-toggle-group">
                <button class="calib-btn-mini ${showDatasetRef ? 'active' : ''}" id="toggle-dataset-ref">
                  ${showDatasetRef ? 'Hide Dataset' : 'Dataset Ref'}
                </button>
                <button class="calib-btn-mini ${showFaintCreases ? 'active' : ''}" id="toggle-faint-creases">
                  ${showFaintCreases ? 'All Creases' : 'Single Line'}
                </button>
              </div>
            </div>

            <!-- SVG Interactive Editor Area -->
            <div class="calibrator-svg-wrap" id="calibrator-viewport">
              <svg id="calibrator-svg" viewBox="0 0 200 240" class="calibrator-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="calibGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4.2" result="b1" />
                    <feGaussianBlur stdDeviation="1.6" result="b2" />
                    <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <clipPath id="calibClip">
                    <rect x="0" y="0" width="200" height="240" rx="14" />
                  </clipPath>
                </defs>

                <!-- Base Dark Canvas -->
                <rect x="0" y="0" width="200" height="240" rx="14" fill="#0C0A14" />

                <!-- Mirrored Hand Container -->
                <g ${mirrorTransform} id="calib-hand-group">
                  
                  <!-- Real Palm Photo Base -->
                  <g clip-path="url(#calibClip)">
                    <image href="/assets/lines/realistic_3d_palm_base.jpg" x="0" y="0" width="200" height="240" preserveAspectRatio="none" style="filter: contrast(1.05) brightness(1.02);" />
                    <!-- Subtle Dark Vignette -->
                    <rect x="0" y="0" width="200" height="240" fill="rgba(7, 7, 12, 0.28)" />
                  </g>

                  <!-- Non-selected Faint Creases -->
                  ${showFaintCreases ? `
                    <g id="calib-faint-group">
                      <path d="${activeData.faintLines.life}" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" />
                      <path d="${activeData.faintLines.head}" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" />
                      <path d="${activeData.faintLines.heart}" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" />
                      <path d="${activeData.faintLines.destiny}" stroke="rgba(255,255,255,0.18)" stroke-width="1.4" stroke-linecap="round" />
                    </g>
                  ` : ''}

                  <!-- Optional Dataset Ground Truth Reference -->
                  ${showDatasetRef ? `
                    <g opacity="0.65" id="calib-dataset-group">
                      <path d="${pointsToSvgPath(DATASET_REF_LINES.life)}" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3 3" />
                      <path d="${pointsToSvgPath(DATASET_REF_LINES.head)}" stroke="#00D2FF" stroke-width="1.5" stroke-dasharray="3 3" />
                      <path d="${pointsToSvgPath(DATASET_REF_LINES.heart)}" stroke="#F43F5E" stroke-width="1.5" stroke-dasharray="3 3" />
                      <path d="${pointsToSvgPath(DATASET_REF_LINES.destiny)}" stroke="#FBBF24" stroke-width="1.5" stroke-dasharray="3 3" />
                    </g>
                  ` : ''}

                  <!-- Marriage Focus Bracket under Pinky -->
                  ${isMarriage ? `
                    <g id="calib-marriage-bracket">
                      <rect x="160" y="100" width="36" height="30" rx="4" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1.2" stroke-dasharray="3 2" fill="rgba(251, 191, 36, 0.05)" />
                      <text x="178" y="94" fill="#FBBF24" font-size="6.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">UNDER PINKY</text>
                    </g>
                  ` : ''}

                  <!-- SPECIAL MARKING GLYPH (if active) -->
                  ${isMarking ? `
                    <g id="calib-special-marking-glyph">
                      ${getMarkingGlyphSvg(activeVariation, pts[0].x, pts[0].y)}
                    </g>
                  ` : `
                    <!-- Standard Line Geometry -->
                    <!-- Evaluated Line (Outer Glow Tube) -->
                    <path id="calib-path-glow" d="${currentPath}" stroke="#FBBF24" stroke-width="8" stroke-linecap="round" opacity="0.4" />
                    <!-- Primary Radiant Neon Laser -->
                    <path id="calib-path-laser" d="${currentPath}" stroke="#FBBF24" stroke-width="3.5" stroke-linecap="round" filter="url(#calibGlow)" />
                    <!-- Ultra-Bright Laser Core Spine -->
                    <path id="calib-path-spine" d="${currentPath}" stroke="#FFFBEB" stroke-width="1.2" stroke-linecap="round" />

                    <!-- Forked Line Branches Attached to P3 (if active) -->
                    ${isForked && forkBranches ? `
                      <g id="calib-fork-branches-group">
                        <path id="calib-fork-b1" d="${forkBranches.branch1}" stroke="#FBBF24" stroke-width="3.2" stroke-linecap="round" filter="url(#calibGlow)" />
                        <path id="calib-fork-b2" d="${forkBranches.branch2}" stroke="#FBBF24" stroke-width="3.2" stroke-linecap="round" filter="url(#calibGlow)" />
                        <path id="calib-fork-b1-core" d="${forkBranches.branch1}" stroke="#FFFBEB" stroke-width="1.1" stroke-linecap="round" />
                        <path id="calib-fork-b2-core" d="${forkBranches.branch2}" stroke="#FFFBEB" stroke-width="1.1" stroke-linecap="round" />
                      </g>
                    ` : ''}

                    <!-- Tangent Lines: P0 -> P1 and P2 -> P3 -->
                    <g id="calib-tangents-group">
                      <line id="calib-tangent-0" x1="${pts[0].x}" y1="${pts[0].y}" x2="${pts[1].x}" y2="${pts[1].y}" stroke="#00D2FF" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.75" />
                      <line id="calib-tangent-2" x1="${pts[2].x}" y1="${pts[2].y}" x2="${pts[3].x}" y2="${pts[3].y}" stroke="#A855F7" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.75" />
                    </g>
                  `}

                  <!-- Draggable Handle Nodes -->
                  <g id="calib-handles-group">
                    ${(isMarking ? [pts[0]] : pts).map((p, idx) => {
                      const isSelected = idx === activeHandleIndex;
                      const ringColor = isMarking ? '#FBBF24' : (idx === 0 ? '#10B981' : (idx === 1 ? '#00D2FF' : (idx === 2 ? '#A855F7' : '#F59E0B')));
                      const labelText = isMarking ? activeVariation : `P${idx}`;
                      return `
                        <g class="calib-handle-group" id="calib-handle-${idx}" data-idx="${idx}" style="cursor: grab; touch-action: none;">
                          <!-- Wide Touch Area Target (22px radius) -->
                          <circle id="calib-touch-${idx}" cx="${p.x}" cy="${p.y}" r="22" fill="transparent" />
                          <!-- Pulsing Visible Ring -->
                          <circle id="calib-ring-${idx}" cx="${p.x}" cy="${p.y}" r="${isSelected ? 9.5 : 7}" fill="rgba(12, 10, 20, 0.9)" stroke="${ringColor}" stroke-width="${isSelected ? 3.2 : 2}" />
                          <!-- White Center Dot -->
                          <circle id="calib-dot-${idx}" cx="${p.x}" cy="${p.y}" r="3.2" fill="#FFFBEB" />
                          <!-- Label Badge -->
                          <text id="calib-txt-${idx}" x="${p.x + 9}" y="${p.y - 7}" fill="${ringColor}" font-size="8" font-weight="700">${labelText}</text>
                        </g>
                      `;
                    }).join('')}
                  </g>

                </g>
              </svg>
            </div>

            <!-- Quick Point Selection Pills -->
            <div style="display: flex; gap: 6px; width: 100%; margin-top: 10px; justify-content: center;">
              ${pointLabels.map(pl => `
                <button class="calib-pt-selector-btn ${activeHandleIndex === pl.id ? 'active' : ''}" data-ptid="${pl.id}" style="border-color: ${pl.color}; ${activeHandleIndex === pl.id ? `background: ${pl.color}26; color: ${pl.color};` : ''}">
                  ${pl.name}
                </button>
              `).join('')}
            </div>

            <!-- Coordinate Info Drawer -->
            <div class="calibrator-coord-drawer">
              <div class="calib-coord-header">
                <span class="calib-point-name" id="calib-active-coord">
                  Active: <strong style="color: ${pointLabels[activeHandleIndex]?.color || '#FBBF24'};">${pointLabels[activeHandleIndex]?.name || `P${activeHandleIndex}`}</strong> (${pts[activeHandleIndex]?.x || 0}, ${pts[activeHandleIndex]?.y || 0})
                </span>
                <span class="calib-point-hint">Drag handle directly on palm, or tap arrows</span>
              </div>

              <!-- Nudge Arrow Buttons (1px step) -->
              <div class="calib-nudge-pad">
                <button class="calib-nudge-btn" id="nudge-up" title="Nudge Up">▲</button>
                <div class="calib-nudge-row">
                  <button class="calib-nudge-btn" id="nudge-left" title="Nudge Left">◀</button>
                  <button class="calib-nudge-btn" id="nudge-down" title="Nudge Down">▼</button>
                  <button class="calib-nudge-btn" id="nudge-right" title="Nudge Right">▶</button>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Action Deck -->
          <div class="calibrator-action-deck">
            <button class="calib-btn-primary" id="calib-save-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Confirm & Apply to Cards</span>
            </button>

            <div class="calib-btn-secondary-row">
              <button class="calib-btn-secondary" id="calib-copy-json">Copy JSON</button>
              <button class="calib-btn-secondary" id="calib-reset-btn">Reset Defaults</button>
            </div>
          </div>

          <div id="calib-toast" class="calib-toast" style="display: none;"></div>
        </main>
      </div>
    `;

    attachEvents(pts, pointLabels, isMarking, isForked);
  }

  function showToast(msg, duration = 2400) {
    const toast = container.querySelector('#calib-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => { toast.style.display = 'none'; }, 250);
    }, duration);
  }

  function attachEvents(pts, pointLabels, isMarking, isForked) {
    const svgEl = container.querySelector('#calibrator-svg');
    const handGroup = container.querySelector('#calib-hand-group');

    // Navigation
    container.querySelector('#calib-back-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.GUIDED_READING);
    });
    container.querySelector('#calib-test-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.GUIDED_READING);
    });

    // Section Pill Clicks
    container.querySelectorAll('.calib-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = btn.dataset.sec;
        if (activeSection === 'life_line') activeVariation = 'LONG_CLEAR';
        else if (activeSection === 'heart_line') activeVariation = 'LONG';
        else if (activeSection === 'head_line') activeVariation = 'LONG';
        else if (activeSection === 'destiny_line') activeVariation = 'CLEAR';
        else if (activeSection === 'sun_line') activeVariation = 'SHORT';
        else if (activeSection === 'marriage_line') activeVariation = 'SINGLE';
        else if (activeSection === 'special_markings') activeVariation = 'STAR';
        else if (activeSection === 'faint') activeVariation = 'life';
        activeHandleIndex = 0;
        render();
      });
    });

    // Variation Pill Clicks
    container.querySelectorAll('.calib-subpill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeVariation = btn.dataset.var;
        activeHandleIndex = 0;
        render();
      });
    });

    // Point Selector Buttons
    container.querySelectorAll('.calib-pt-selector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeHandleIndex = parseInt(btn.dataset.ptid, 10);
        updateActiveHandleUI();
      });
    });

    // Hand Toggles
    container.querySelector('#toggle-hand-r')?.addEventListener('click', () => {
      activeHand = 'RIGHT';
      render();
    });
    container.querySelector('#toggle-hand-l')?.addEventListener('click', () => {
      activeHand = 'LEFT';
      render();
    });

    // Reference Toggles
    container.querySelector('#toggle-dataset-ref')?.addEventListener('click', () => {
      showDatasetRef = !showDatasetRef;
      render();
    });
    container.querySelector('#toggle-faint-creases')?.addEventListener('click', () => {
      showFaintCreases = !showFaintCreases;
      render();
    });

    function updateActiveHandleUI() {
      // Highlight selector buttons
      container.querySelectorAll('.calib-pt-selector-btn').forEach(b => {
        const pId = parseInt(b.dataset.ptid, 10);
        const color = pointLabels[pId]?.color || '#FBBF24';
        if (pId === activeHandleIndex) {
          b.classList.add('active');
          b.style.background = `${color}26`;
          b.style.color = color;
        } else {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#FFFFFF';
        }
      });

      // Highlight SVG rings
      svgEl?.querySelectorAll('.calib-handle-group circle[id^="calib-ring"]').forEach((ring, rIdx) => {
        ring.setAttribute('r', rIdx === activeHandleIndex ? '9.5' : '7');
        ring.setAttribute('stroke-width', rIdx === activeHandleIndex ? '3.2' : '2');
      });

      // Update text readout
      const coordEl = container.querySelector('#calib-active-coord');
      if (coordEl && pts[activeHandleIndex]) {
        const pl = pointLabels[activeHandleIndex];
        const mountNote = isMarking ? ` • Mount: ${DEFAULT_CALIBRATED_CREASES.special_markings[activeVariation]?.mount || 'Center'}` : '';
        coordEl.innerHTML = `Active: <strong style="color: ${pl?.color || '#FBBF24'};">${pl?.name || `P${activeHandleIndex}`}</strong> (${pts[activeHandleIndex].x}, ${pts[activeHandleIndex].y})${mountNote}`;
      }
    }

    // Fast in-place DOM updater (Zero innerHTML wipes)
    function updateDomInPlace() {
      if (isMarking) {
        // Update marking glyph coordinates
        const cx = pts[0].x;
        const cy = pts[0].y;
        const glyphG = svgEl.querySelector('#calib-special-marking-glyph');
        if (glyphG) {
          // Re-render marking inner elements
          const sm1 = svgEl.querySelector('#calib-sm-1');
          const sm2 = svgEl.querySelector('#calib-sm-2');
          const sm3 = svgEl.querySelector('#calib-sm-3');
          const sm4 = svgEl.querySelector('#calib-sm-4');
          const smDot = svgEl.querySelector('#calib-sm-dot');
          const smPoly = svgEl.querySelector('#calib-sm-poly');
          const smRect1 = svgEl.querySelector('#calib-sm-rect1');
          const smRect2 = svgEl.querySelector('#calib-sm-rect2');
          const smEl1 = svgEl.querySelector('#calib-sm-el1');
          const smEl2 = svgEl.querySelector('#calib-sm-el2');
          const smP1 = svgEl.querySelector('#calib-sm-path1');
          const smP2 = svgEl.querySelector('#calib-sm-path2');
          const smCh1 = svgEl.querySelector('#calib-sm-ch1');
          const smCh2 = svgEl.querySelector('#calib-sm-ch2');
          const smCh3 = svgEl.querySelector('#calib-sm-ch3');

          if (activeVariation === 'STAR') {
            if (sm1) { sm1.setAttribute('x1', cx - 11); sm1.setAttribute('y1', cy); sm1.setAttribute('x2', cx + 11); sm1.setAttribute('y2', cy); }
            if (sm2) { sm2.setAttribute('x1', cx); sm2.setAttribute('y1', cy - 11); sm2.setAttribute('x2', cx); sm2.setAttribute('y2', cy + 11); }
            if (sm3) { sm3.setAttribute('x1', cx - 8); sm3.setAttribute('y1', cy - 8); sm3.setAttribute('x2', cx + 8); sm3.setAttribute('y2', cy + 8); }
            if (sm4) { sm4.setAttribute('x1', cx - 8); sm4.setAttribute('y1', cy + 8); sm4.setAttribute('x2', cx + 8); sm4.setAttribute('y2', cy - 8); }
            if (smDot) { smDot.setAttribute('cx', cx); smDot.setAttribute('cy', cy); }
          } else if (activeVariation === 'CROSS') {
            if (sm1) { sm1.setAttribute('x1', cx - 10); sm1.setAttribute('y1', cy - 10); sm1.setAttribute('x2', cx + 10); sm1.setAttribute('y2', cy + 10); }
            if (sm2) { sm2.setAttribute('x1', cx - 10); sm2.setAttribute('y1', cy + 10); sm2.setAttribute('x2', cx + 10); sm2.setAttribute('y2', cy - 10); }
            if (sm3) { sm3.setAttribute('x1', cx - 10); sm3.setAttribute('y1', cy - 10); sm3.setAttribute('x2', cx + 10); sm3.setAttribute('y2', cy + 10); }
            if (sm4) { sm4.setAttribute('x1', cx - 10); sm4.setAttribute('y1', cy + 10); sm4.setAttribute('x2', cx + 10); sm4.setAttribute('y2', cy - 10); }
          } else if (activeVariation === 'TRIANGLE') {
            if (smPoly) smPoly.setAttribute('points', `${cx},${cy - 12} ${cx - 12},${cy + 10} ${cx + 12},${cy + 10}`);
            if (smDot) { smDot.setAttribute('cx', cx); smDot.setAttribute('cy', cy); }
          } else if (activeVariation === 'SQUARE') {
            if (smRect1) { smRect1.setAttribute('x', cx - 10); smRect1.setAttribute('y', cy - 10); }
            if (smRect2) { smRect2.setAttribute('x', cx - 10); smRect2.setAttribute('y', cy - 10); }
          } else if (activeVariation === 'ISLAND') {
            if (smEl1) { smEl1.setAttribute('cx', cx); smEl1.setAttribute('cy', cy); }
            if (smEl2) { smEl2.setAttribute('cx', cx); smEl2.setAttribute('cy', cy); }
          } else if (activeVariation === 'FORK') {
            const pStr = `M ${cx + 14} ${cy} L ${cx} ${cy} M ${cx} ${cy} L ${cx - 12} ${cy - 10} M ${cx} ${cy} L ${cx - 12} ${cy + 10}`;
            if (smP1) smP1.setAttribute('d', pStr);
            if (smP2) smP2.setAttribute('d', pStr);
          } else if (activeVariation === 'CHAINED') {
            if (smCh1) { smCh1.setAttribute('cx', cx - 8); smCh1.setAttribute('cy', cy - 4); }
            if (smCh2) { smCh2.setAttribute('cx', cx); smCh2.setAttribute('cy', cy); }
            if (smCh3) { smCh3.setAttribute('cx', cx + 8); smCh3.setAttribute('cy', cy + 4); }
          }
        }
      } else {
        const currentPath = pointsToSvgPath(pts);
        const glow = svgEl.querySelector('#calib-path-glow');
        const laser = svgEl.querySelector('#calib-path-laser');
        const spine = svgEl.querySelector('#calib-path-spine');
        if (glow) glow.setAttribute('d', currentPath);
        if (laser) laser.setAttribute('d', currentPath);
        if (spine) spine.setAttribute('d', currentPath);

        // Update fork branches if active
        if (isForked) {
          const branches = computeForkBranches(activeSection, pts[3]);
          const fb1 = svgEl.querySelector('#calib-fork-b1');
          const fb2 = svgEl.querySelector('#calib-fork-b2');
          const fb1c = svgEl.querySelector('#calib-fork-b1-core');
          const fb2c = svgEl.querySelector('#calib-fork-b2-core');
          if (fb1) fb1.setAttribute('d', branches.branch1);
          if (fb2) fb2.setAttribute('d', branches.branch2);
          if (fb1c) fb1c.setAttribute('d', branches.branch1);
          if (fb2c) fb2c.setAttribute('d', branches.branch2);
        }

        // Update tangent lines: P0 -> P1 and P2 -> P3
        const t0 = svgEl.querySelector('#calib-tangent-0');
        if (t0) {
          t0.setAttribute('x1', pts[0].x); t0.setAttribute('y1', pts[0].y);
          t0.setAttribute('x2', pts[1].x); t0.setAttribute('y2', pts[1].y);
        }
        const t2 = svgEl.querySelector('#calib-tangent-2');
        if (t2) {
          t2.setAttribute('x1', pts[2].x); t2.setAttribute('y1', pts[2].y);
          t2.setAttribute('x2', pts[3].x); t2.setAttribute('y2', pts[3].y);
        }
      }

      // Update active handle position
      const p = pts[activeHandleIndex];
      if (p) {
        const touch = svgEl.querySelector(`#calib-touch-${activeHandleIndex}`);
        const ring = svgEl.querySelector(`#calib-ring-${activeHandleIndex}`);
        const dot = svgEl.querySelector(`#calib-dot-${activeHandleIndex}`);
        const txt = svgEl.querySelector(`#calib-txt-${activeHandleIndex}`);
        if (touch) { touch.setAttribute('cx', p.x); touch.setAttribute('cy', p.y); }
        if (ring) { ring.setAttribute('cx', p.x); ring.setAttribute('cy', p.y); }
        if (dot) { dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); }
        if (txt) { txt.setAttribute('x', p.x + 9); txt.setAttribute('y', p.y - 7); }
      }

      updateActiveHandleUI();
    }

    // Native SVG matrix transform (accounts for scaling, responsive CSS, and Left/Right mirror)
    function getLocalCoordinates(clientX, clientY) {
      if (!svgEl || !handGroup) return null;
      try {
        const pt = svgEl.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const groupCTM = handGroup.getScreenCTM();
        if (!groupCTM) return null;
        const localPt = pt.matrixTransform(groupCTM.inverse());
        return {
          x: Math.round(Math.max(5, Math.min(195, localPt.x))),
          y: Math.round(Math.max(5, Math.min(235, localPt.y)))
        };
      } catch (err) {
        return null;
      }
    }

    // Attach PointerEvent listeners to handles
    svgEl.querySelectorAll('.calib-handle-group').forEach(handleG => {
      const idx = parseInt(handleG.dataset.idx, 10);

      const onPointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        draggedIndex = idx;
        activeHandleIndex = idx;
        isDragging = true;

        try {
          handleG.setPointerCapture(e.pointerId);
        } catch (_) {}

        handleG.style.cursor = 'grabbing';
        updateActiveHandleUI();
      };

      const onPointerMove = (e) => {
        if (!isDragging || draggedIndex !== idx) return;
        e.preventDefault();
        e.stopPropagation();

        const coords = getLocalCoordinates(e.clientX, e.clientY);
        if (coords && pts[idx]) {
          pts[idx].x = coords.x;
          pts[idx].y = coords.y;
          updateDomInPlace();
        }
      };

      const onPointerUp = (e) => {
        if (draggedIndex === idx) {
          isDragging = false;
          draggedIndex = -1;
          handleG.style.cursor = 'grab';
          try {
            handleG.releasePointerCapture(e.pointerId);
          } catch (_) {}
          savePointsToActiveData(pts);
        }
      };

      handleG.addEventListener('pointerdown', onPointerDown);
      handleG.addEventListener('pointermove', onPointerMove);
      handleG.addEventListener('pointerup', onPointerUp);
      handleG.addEventListener('pointercancel', onPointerUp);
    });

    // Canvas click: moves the active handle directly to tapped spot
    svgEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.calib-handle-group')) return;
      e.preventDefault();
      const coords = getLocalCoordinates(e.clientX, e.clientY);
      if (coords && pts[activeHandleIndex]) {
        pts[activeHandleIndex].x = coords.x;
        pts[activeHandleIndex].y = coords.y;
        updateDomInPlace();
        savePointsToActiveData(pts);
      }
    });

    // Precision Nudge Controls (1px step adjustments)
    const nudge = (dx, dy) => {
      if (pts[activeHandleIndex]) {
        pts[activeHandleIndex].x = Math.max(5, Math.min(195, pts[activeHandleIndex].x + dx));
        pts[activeHandleIndex].y = Math.max(5, Math.min(235, pts[activeHandleIndex].y + dy));
        updateDomInPlace();
        savePointsToActiveData(pts);
      }
    };
    container.querySelector('#nudge-up')?.addEventListener('click', (e) => { e.preventDefault(); nudge(0, -1); });
    container.querySelector('#nudge-down')?.addEventListener('click', (e) => { e.preventDefault(); nudge(0, 1); });
    container.querySelector('#nudge-left')?.addEventListener('click', (e) => { e.preventDefault(); nudge(-1, 0); });
    container.querySelector('#nudge-right')?.addEventListener('click', (e) => { e.preventDefault(); nudge(1, 0); });

    // Save & Confirm Button
    container.querySelector('#calib-save-btn')?.addEventListener('click', () => {
      savePointsToActiveData(pts);
      saveCalibratedCreases(activeData);
      showToast('✓ Saved & applied! All user input cards updated.');
    });

    // Copy JSON Button
    container.querySelector('#calib-copy-json')?.addEventListener('click', () => {
      savePointsToActiveData(pts);
      const jsonStr = JSON.stringify(activeData, null, 2);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          showToast('✓ Calibration JSON copied to clipboard!');
        });
      } else {
        showToast('JSON ready in console.');
        console.log(jsonStr);
      }
    });

    // Reset Defaults Button
    container.querySelector('#calib-reset-btn')?.addEventListener('click', () => {
      if (confirm('Reset all crease lines to factory defaults?')) {
        resetCalibratedCreases();
        activeData = JSON.parse(JSON.stringify(DEFAULT_CALIBRATED_CREASES));
        render();
        showToast('Reset to defaults.');
      }
    });
  }

  // Initial render
  render();
}
