/**
 * Calibrated Palm Creases — Anatomical Crease Coordinates & Calibration Store
 * Confirmed and calibrated against the 3D studio photograph base.
 * Enforces strictly 4 control points (P0 to P3) for every line and variation:
 * - P0: Start / Origin
 * - P1: Handle 1 (Curvature control from origin)
 * - P2: Handle 2 (Curvature control to terminus)
 * - P3: Terminus / End
 */

export const STORAGE_KEY_CREASES = 'kai_calibrated_palm_creases';

/**
 * Standard cubic Bezier with exactly 4 points
 */
function make4PointLine(p0, p1, p2, p3, extras = {}) {
  return {
    type: 'cubic',
    points: [p0, p1, p2, p3],
    path: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`,
    ...extras
  };
}

/**
 * User-confirmed calibrated control points (ViewBox: 0 0 200 240)
 */
export const DEFAULT_CALIBRATED_CREASES = {
  // Base non-evaluated creases (faint grey on real hand photo)
  faintLines: {
    life: "M 56 146 C 88 157 99 191 96 226",
    head: "M 56 144 C 93 159 117 170 136 195",
    heart: "M 169 164 C 143 156 121 152 84 130",
    destiny: "M 107 228 C 111 202 112 182 107 148",
    sun: "M 122 228 C 123 209 126 194 125 168"
  },

  // 1. Life Line (Jivita Rekha) Variations — User-calibrated 4 points
  life_line: {
    LONG_CLEAR: make4PointLine(
      { x: 55, y: 145 }, { x: 93, y: 159 }, { x: 93, y: 192 }, { x: 90, y: 228 }
    ),
    SHORT: make4PointLine(
      { x: 54, y: 142 }, { x: 78, y: 151 }, { x: 84, y: 173 }, { x: 85, y: 198 }
    ),
    DEEP: make4PointLine(
      { x: 56, y: 142 }, { x: 86, y: 164 }, { x: 93, y: 193 }, { x: 94, y: 235 },
      { strokeWidth: 4.6 }
    ),
    FAINT_FRAGMENTED: make4PointLine(
      { x: 56, y: 126 }, { x: 76, y: 152 }, { x: 88, y: 196 }, { x: 94, y: 226 },
      { strokeWidth: 2.2 }
    ),
    WIDE_CURVE: make4PointLine(
      { x: 58, y: 142 }, { x: 101, y: 155 }, { x: 115, y: 193 }, { x: 100, y: 224 }
    ),
    CLOSE_TO_THUMB: make4PointLine(
      { x: 54, y: 143 }, { x: 76, y: 157 }, { x: 73, y: 191 }, { x: 69, y: 221 }
    )
  },

  // 2. Heart Line (Hridaya Rekha) Variations — User-calibrated 4 points
  heart_line: {
    LONG: make4PointLine(
      { x: 177, y: 170 }, { x: 146, y: 165 }, { x: 110, y: 149 }, { x: 81, y: 123 }
    ),
    SHORT: make4PointLine(
      { x: 173, y: 170 }, { x: 149, y: 164 }, { x: 129, y: 158 }, { x: 109, y: 148 }
    ),
    STRAIGHT: make4PointLine(
      { x: 173, y: 150 }, { x: 143, y: 147 }, { x: 118, y: 144 }, { x: 87, y: 141 }
    ),
    CURVED: make4PointLine(
      { x: 170, y: 165 }, { x: 139, y: 168 }, { x: 107, y: 146 }, { x: 83, y: 120 }
    ),
    DEEP: make4PointLine(
      { x: 176, y: 165 }, { x: 138, y: 156 }, { x: 103, y: 142 }, { x: 58, y: 127 },
      { strokeWidth: 4.6 }
    ),
    FAINT: make4PointLine(
      { x: 169, y: 160 }, { x: 148, y: 154 }, { x: 129, y: 148 }, { x: 110, y: 144 },
      { strokeWidth: 2.0 }
    ),
    FORKED: make4PointLine(
      { x: 172, y: 165 }, { x: 142, y: 156 }, { x: 116, y: 144 }, { x: 96, y: 130 },
      {
        branch1: "M 96 130 C 88 122 80 114 74 105",
        branch2: "M 96 130 C 88 134 82 140 76 146"
      }
    )
  },

  // 3. Head Line (Shiro Rekha) Variations — User-calibrated 4 points
  head_line: {
    LONG: make4PointLine(
      { x: 55, y: 142 }, { x: 92, y: 151 }, { x: 128, y: 171 }, { x: 162, y: 191 }
    ),
    SHORT: make4PointLine(
      { x: 53, y: 142 }, { x: 74, y: 147 }, { x: 91, y: 154 }, { x: 104, y: 165 }
    ),
    STRAIGHT: make4PointLine(
      { x: 55, y: 152 }, { x: 88, y: 152 }, { x: 119, y: 155 }, { x: 153, y: 159 }
    ),
    SLOPING: make4PointLine(
      { x: 57, y: 141 }, { x: 86, y: 147 }, { x: 116, y: 166 }, { x: 137, y: 210 }
    ),
    DEEP: make4PointLine(
      { x: 57, y: 147 }, { x: 96, y: 155 }, { x: 123, y: 172 }, { x: 166, y: 199 },
      { strokeWidth: 4.6 }
    ),
    FAINT: make4PointLine(
      { x: 53, y: 145 }, { x: 77, y: 147 }, { x: 99, y: 157 }, { x: 114, y: 168 },
      { strokeWidth: 2.0 }
    ),
    FORKED: make4PointLine(
      { x: 56, y: 144 }, { x: 88, y: 152 }, { x: 114, y: 164 }, { x: 136, y: 178 },
      {
        branch1: "M 136 178 C 146 174 156 170 166 168",
        branch2: "M 136 178 C 144 186 150 196 154 208"
      }
    )
  },

  // 4. Destiny / Fate Line (Bhagya Rekha) Variations — User-calibrated 4 points
  destiny_line: {
    ABSENT: make4PointLine(
      { x: 94, y: 220 }, { x: 95, y: 176 }, { x: 96, y: 132 }, { x: 96, y: 90 },
      { guidePath: "M 94 220 C 95 176 96 132 96 90" }
    ),
    FAINT: make4PointLine(
      { x: 99, y: 223 }, { x: 99, y: 202 }, { x: 99, y: 189 }, { x: 100, y: 177 },
      { strokeWidth: 2.0 }
    ),
    CLEAR: make4PointLine(
      { x: 99, y: 229 }, { x: 102, y: 193 }, { x: 104, y: 173 }, { x: 104, y: 152 },
      { strokeWidth: 3.4 }
    ),
    CROSSES_PALM: make4PointLine(
      { x: 94, y: 226 }, { x: 97, y: 188 }, { x: 102, y: 155 }, { x: 102, y: 124 },
      { strokeWidth: 3.4 }
    ),
    DOUBLE_LINE: make4PointLine(
      { x: 92, y: 222 }, { x: 93, y: 178 }, { x: 94, y: 135 }, { x: 94, y: 96 },
      { line2: "M 102 216 L 104 150 L 104 98" }
    ),
    INTERRUPTED: make4PointLine(
      { x: 94, y: 224 }, { x: 95, y: 180 }, { x: 96, y: 135 }, { x: 96, y: 94 }
    ),
    REACHES_FINGERS: make4PointLine(
      { x: 101, y: 227 }, { x: 102, y: 183 }, { x: 105, y: 148 }, { x: 104, y: 107 }
    )
  },

  // 5. Sun Line (Surya Rekha) Variations — User-calibrated 4 points
  sun_line: {
    ABSENT: make4PointLine(
      { x: 124, y: 150 }, { x: 124, y: 132 }, { x: 124, y: 114 }, { x: 124, y: 94 },
      { guidePath: "M 124 150 C 124 132 124 114 124 94" }
    ),
    SHORT: make4PointLine(
      { x: 118, y: 215 }, { x: 126, y: 188 }, { x: 122, y: 202 }, { x: 128, y: 175 }
    ),
    LONG: make4PointLine(
      { x: 119, y: 227 }, { x: 121, y: 202 }, { x: 124, y: 164 }, { x: 130, y: 123 }
    ),
    CLEAR: make4PointLine(
      { x: 115, y: 227 }, { x: 121, y: 195 }, { x: 127, y: 171 }, { x: 131, y: 141 }
    ),
    FAINT: make4PointLine(
      { x: 118, y: 225 }, { x: 122, y: 207 }, { x: 124, y: 192 }, { x: 128, y: 177 },
      { strokeWidth: 1.8 }
    ),
    MULTIPLE: make4PointLine(
      { x: 124, y: 150 }, { x: 124, y: 132 }, { x: 124, y: 114 }, { x: 124, y: 94 },
      {
        line1: "M 118 140 L 118 96",
        line2: "M 130 142 L 130 94"
      }
    )
  },

  // 6. Special Markings Mount Positions — Calibrated positions
  special_markings: {
    STAR: { cx: 74, cy: 105, mount: "Jupiter" },
    CROSS: { cx: 105, cy: 132, mount: "Quadrangle" },
    TRIANGLE: { cx: 96, cy: 96, mount: "Saturn" },
    SQUARE: { cx: 74, cy: 172, mount: "Venus" },
    ISLAND: { cx: 108, cy: 136, mount: "Head Line" },
    FORK: { cx: 72, cy: 92, mount: "Heart Terminus" },
    CHAINED: { cx: 66, cy: 148, mount: "Life Origin" }
  },

  // 7. Marriage / Relationship Line (Vivaha Rekha) Variations — Side Percussion Under Pinky
  marriage_line: {
    NONE: {
      guidePath: "M 194 116 L 168 116"
    },
    SINGLE: {
      points: [{ x: 194, y: 116 }, { x: 185, y: 116 }, { x: 176, y: 116 }, { x: 168, y: 116 }],
      path: "M 194 116 L 168 116",
      lines: ["M 194 116 L 168 116"]
    },
    DOUBLE: {
      points: [{ x: 194, y: 115 }, { x: 185, y: 115 }, { x: 176, y: 115 }, { x: 168, y: 115 }],
      path: "M 194 115 L 168 115",
      lines: [
        "M 194 111 L 168 111",
        "M 194 121 L 168 121"
      ]
    },
    TRIPLE: {
      points: [{ x: 194, y: 115 }, { x: 185, y: 115 }, { x: 176, y: 115 }, { x: 168, y: 115 }],
      path: "M 194 115 L 168 115",
      lines: [
        "M 194 107 L 168 107",
        "M 194 115 L 168 115",
        "M 194 123 L 168 123"
      ]
    }
  }
};

/**
 * Normalizes any array of points to exactly 4 points [P0, P1, P2, P3]
 * @param {Array<{x: number, y: number}>} pts
 * @returns {Array<{x: number, y: number}>}
 */
export function normalizeTo4Points(pts) {
  if (!pts || pts.length === 0) {
    return [{ x: 55, y: 145 }, { x: 80, y: 155 }, { x: 90, y: 185 }, { x: 90, y: 228 }];
  }
  if (pts.length === 4) {
    return pts.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));
  }
  if (pts.length === 2) {
    const p0 = pts[0];
    const p3 = pts[1];
    const p1 = { x: Math.round(p0.x + (p3.x - p0.x) * 0.33), y: Math.round(p0.y + (p3.y - p0.y) * 0.33) };
    const p2 = { x: Math.round(p0.x + (p3.x - p0.x) * 0.67), y: Math.round(p0.y + (p3.y - p0.y) * 0.67) };
    return [p0, p1, p2, p3];
  }
  if (pts.length === 3) {
    const p0 = pts[0];
    const mid = pts[1];
    const p3 = pts[2];
    const p1 = { x: Math.round((p0.x + mid.x) / 2), y: Math.round((p0.y + mid.y) / 2) };
    const p2 = { x: Math.round((mid.x + p3.x) / 2), y: Math.round((mid.y + p3.y) / 2) };
    return [p0, p1, p2, p3];
  }
  // Subsample > 4 points down to strictly 4 points
  const p0 = pts[0];
  const p1 = pts[Math.floor(pts.length * 0.33)];
  const p2 = pts[Math.floor(pts.length * 0.67)];
  const p3 = pts[pts.length - 1];
  return [
    { x: Math.round(p0.x), y: Math.round(p0.y) },
    { x: Math.round(p1.x), y: Math.round(p1.y) },
    { x: Math.round(p2.x), y: Math.round(p2.y) },
    { x: Math.round(p3.x), y: Math.round(p3.y) }
  ];
}

/**
 * Get active calibrated creases (localStorage priority with fallback to default)
 * @returns {typeof DEFAULT_CALIBRATED_CREASES}
 */
export function getActiveCalibratedCreases() {
  if (typeof window === 'undefined') {
    return DEFAULT_CALIBRATED_CREASES;
  }

  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY_CREASES);
    if (!raw) return DEFAULT_CALIBRATED_CREASES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CALIBRATED_CREASES,
      ...parsed,
      faintLines: { ...DEFAULT_CALIBRATED_CREASES.faintLines, ...(parsed.faintLines || {}) },
      life_line: { ...DEFAULT_CALIBRATED_CREASES.life_line, ...(parsed.life_line || {}) },
      heart_line: { ...DEFAULT_CALIBRATED_CREASES.heart_line, ...(parsed.heart_line || {}) },
      head_line: { ...DEFAULT_CALIBRATED_CREASES.head_line, ...(parsed.head_line || {}) },
      destiny_line: { ...DEFAULT_CALIBRATED_CREASES.destiny_line, ...(parsed.destiny_line || {}) },
      sun_line: { ...DEFAULT_CALIBRATED_CREASES.sun_line, ...(parsed.sun_line || {}) },
      special_markings: { ...DEFAULT_CALIBRATED_CREASES.special_markings, ...(parsed.special_markings || {}) },
      marriage_line: { ...DEFAULT_CALIBRATED_CREASES.marriage_line, ...(parsed.marriage_line || {}) }
    };
  } catch (err) {
    console.warn('[calibratedPalmCreases] Error reading saved calibration, using defaults:', err);
    return DEFAULT_CALIBRATED_CREASES;
  }
}

/**
 * Save calibrated creases to localStorage and broadcast change event
 * @param {Object} updatedCreases
 */
export function saveCalibratedCreases(updatedCreases) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage?.setItem(STORAGE_KEY_CREASES, JSON.stringify(updatedCreases));
    window.dispatchEvent(new CustomEvent('kai:creases-updated', { detail: updatedCreases }));
    return true;
  } catch (err) {
    console.error('[calibratedPalmCreases] Failed to save calibration:', err);
    return false;
  }
}

/**
 * Reset calibrated creases to factory defaults
 */
export function resetCalibratedCreases() {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage?.removeItem(STORAGE_KEY_CREASES);
    window.dispatchEvent(new CustomEvent('kai:creases-updated', { detail: DEFAULT_CALIBRATED_CREASES }));
    return true;
  } catch (err) {
    console.error('[calibratedPalmCreases] Failed to reset calibration:', err);
    return false;
  }
}

/**
 * Convert 4 points into standard SVG cubic Bezier path
 * @param {Array<{x: number, y: number}>} points
 * @returns {string}
 */
export function pointsToSvgPath(points) {
  const pts = normalizeTo4Points(points);
  return `M ${pts[0].x} ${pts[0].y} C ${pts[1].x} ${pts[1].y} ${pts[2].x} ${pts[2].y} ${pts[3].x} ${pts[3].y}`;
}
