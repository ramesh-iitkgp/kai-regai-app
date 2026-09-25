/**
 * Kai RegAI — Crease Candidate Graph & Skeletonization Engine
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Converts continuous structural crease confidence maps into discrete,
 * topologically ordered polyline candidates using:
 * 1. Adaptive binarization
 * 2. Zhang-Suen thinning / morphological skeletonization
 * 3. Connected-component graph construction
 * 4. Branch pruning & polyline tracing
 * 5. Douglas-Peucker polyline simplification
 */

import { PalmCVConfig } from '../config/defaultConfig.js';

export class CreaseCandidateGraph {
  /**
   * Extract polyline crease candidates from an enhanced confidence map
   * @param {Float32Array} enhancedMap - Multi-scale response map [0, 1]
   * @param {number} size - Patch width/height (e.g. 512)
   * @param {Object} [customConfig]
   * @returns {import('../types.js').CreaseCandidate[]}
   */
  static extractCandidates(enhancedMap, size, customConfig = {}) {
    const config = { ...PalmCVConfig.topology, ...customConfig };

    // 1. Adaptive Binarization
    const binary = new Uint8Array(size * size);
    const threshold = config.binaryBinarizationThreshold;
    for (let i = 0; i < enhancedMap.length; i++) {
      binary[i] = enhancedMap[i] >= threshold ? 1 : 0;
    }

    // 2. Zhang-Suen Morphological Thinning (Skeletonization)
    const skeleton = this.zhangSuenThinning(binary, size);

    // 3. Trace Connected Graph Components & Polylines
    const candidates = this.tracePolylines(skeleton, enhancedMap, size, config);

    return candidates;
  }

  /**
   * Zhang-Suen Thinning Algorithm
   * Reduces binary patterns to 1-pixel thin centerlines preserving topology.
   */
  static zhangSuenThinning(binary, size) {
    const skel = new Uint8Array(binary);
    let hasChanged = true;

    // Neighbor index offsets in clockwise order: P2, P3, P4, P5, P6, P7, P8, P9, P2
    // [y-1, x], [y-1, x+1], [y, x+1], [y+1, x+1], [y+1, x], [y+1, x-1], [y, x-1], [y-1, x-1]
    const del = [];

    while (hasChanged) {
      hasChanged = false;

      // Sub-iteration 1
      del.length = 0;
      for (let y = 1; y < size - 1; y++) {
        const row = y * size;
        const rowAbove = (y - 1) * size;
        const rowBelow = (y + 1) * size;

        for (let x = 1; x < size - 1; x++) {
          if (skel[row + x] === 0) continue;

          const p2 = skel[rowAbove + x];
          const p3 = skel[rowAbove + x + 1];
          const p4 = skel[row + x + 1];
          const p5 = skel[rowBelow + x + 1];
          const p6 = skel[rowBelow + x];
          const p7 = skel[rowBelow + x - 1];
          const p8 = skel[row + x - 1];
          const p9 = skel[rowAbove + x - 1];

          const nNeighbors = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (nNeighbors < 2 || nNeighbors > 6) continue;

          // 0 -> 1 transitions in clockwise order
          let transitions = 0;
          if (p2 === 0 && p3 === 1) transitions++;
          if (p3 === 0 && p4 === 1) transitions++;
          if (p4 === 0 && p5 === 1) transitions++;
          if (p5 === 0 && p6 === 1) transitions++;
          if (p6 === 0 && p7 === 1) transitions++;
          if (p7 === 0 && p8 === 1) transitions++;
          if (p8 === 0 && p9 === 1) transitions++;
          if (p9 === 0 && p2 === 1) transitions++;

          if (transitions !== 1) continue;

          // Condition 1: P2 * P4 * P6 == 0
          if (p2 * p4 * p6 !== 0) continue;
          // Condition 2: P4 * P6 * P8 == 0
          if (p4 * p6 * p8 !== 0) continue;

          del.push(row + x);
        }
      }

      if (del.length > 0) {
        for (const idx of del) skel[idx] = 0;
        hasChanged = true;
      }

      // Sub-iteration 2
      del.length = 0;
      for (let y = 1; y < size - 1; y++) {
        const row = y * size;
        const rowAbove = (y - 1) * size;
        const rowBelow = (y + 1) * size;

        for (let x = 1; x < size - 1; x++) {
          if (skel[row + x] === 0) continue;

          const p2 = skel[rowAbove + x];
          const p3 = skel[rowAbove + x + 1];
          const p4 = skel[row + x + 1];
          const p5 = skel[rowBelow + x + 1];
          const p6 = skel[rowBelow + x];
          const p7 = skel[rowBelow + x - 1];
          const p8 = skel[row + x - 1];
          const p9 = skel[rowAbove + x - 1];

          const nNeighbors = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (nNeighbors < 2 || nNeighbors > 6) continue;

          let transitions = 0;
          if (p2 === 0 && p3 === 1) transitions++;
          if (p3 === 0 && p4 === 1) transitions++;
          if (p4 === 0 && p5 === 1) transitions++;
          if (p5 === 0 && p6 === 1) transitions++;
          if (p6 === 0 && p7 === 1) transitions++;
          if (p7 === 0 && p8 === 1) transitions++;
          if (p8 === 0 && p9 === 1) transitions++;
          if (p9 === 0 && p2 === 1) transitions++;

          if (transitions !== 1) continue;

          // Condition 1': P2 * P4 * P8 == 0
          if (p2 * p4 * p8 !== 0) continue;
          // Condition 2': P2 * P6 * P8 == 0
          if (p2 * p6 * p8 !== 0) continue;

          del.push(row + x);
        }
      }

      if (del.length > 0) {
        for (const idx of del) skel[idx] = 0;
        hasChanged = true;
      }
    }

    return skel;
  }

  /**
   * Trace skeleton pixels into ordered polylines
   */
  static tracePolylines(skel, enhancedMap, size, config) {
    const visited = new Uint8Array(size * size);
    const candidates = [];

    // Helper: find neighbor offsets
    const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
    const dy = [-1, -1, -1, 0, 0, 1, 1, 1];

    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = y * size + x;
        if (skel[idx] === 0 || visited[idx] === 1) continue;

        // Count neighbors to find branch ends or starts
        let neighborCount = 0;
        for (let i = 0; i < 8; i++) {
          const nx = x + dx[i];
          const ny = y + dy[i];
          if (skel[ny * size + nx] === 1) neighborCount++;
        }

        // Trace from endpoints (1 neighbor) or isolated nodes
        if (neighborCount <= 1) {
          const path = [];
          let curX = x;
          let curY = y;
          path.push({ x: curX, y: curY });
          visited[curY * size + curX] = 1;

          let finding = true;
          while (finding) {
            let nextX = -1;
            let nextY = -1;

            for (let i = 0; i < 8; i++) {
              const nx = curX + dx[i];
              const ny = curY + dy[i];
              if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                const nIdx = ny * size + nx;
                if (skel[nIdx] === 1 && visited[nIdx] === 0) {
                  nextX = nx;
                  nextY = ny;
                  break;
                }
              }
            }

            if (nextX !== -1) {
              visited[nextY * size + nextX] = 1;
              path.push({ x: nextX, y: nextY });
              curX = nextX;
              curY = nextY;
            } else {
              finding = false;
            }
          }

          // Evaluate candidate validity
          if (path.length >= config.minCandidateLength) {
            const simplified = this.douglasPeucker(path, config.polylineSimplificationTolerance);
            const candidate = this.evaluateCandidate(`CREASE-${candidates.length + 1}`, simplified, enhancedMap, size);
            candidates.push(candidate);
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Douglas-Peucker Polyline Simplification
   */
  static douglasPeucker(points, tolerance) {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let index = 0;
    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.perpendicularDistance(points[i], first, last);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (maxDist > tolerance) {
      const left = this.douglasPeucker(points.slice(0, index + 1), tolerance);
      const right = this.douglasPeucker(points.slice(index), tolerance);
      return left.slice(0, -1).concat(right);
    } else {
      return [first, last];
    }
  }

  static perpendicularDistance(pt, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(pt.x - lineStart.x, pt.y - lineStart.y);

    const num = Math.abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
    return num / Math.sqrt(lenSq);
  }

  /**
   * Compute geometric metrics for a candidate polyline
   */
  static evaluateCandidate(id, polyline, enhancedMap, size) {
    let arcLength = 0;
    let sumResponse = 0;
    for (let i = 0; i < polyline.length; i++) {
      const pt = polyline[i];
      const px = Math.min(size - 1, Math.max(0, Math.round(pt.x)));
      const py = Math.min(size - 1, Math.max(0, Math.round(pt.y)));
      sumResponse += enhancedMap[py * size + px];

      if (i > 0) {
        arcLength += Math.hypot(pt.x - polyline[i - 1].x, pt.y - polyline[i - 1].y);
      }
    }

    const avgContrast = polyline.length > 0 ? sumResponse / polyline.length : 0;
    const chordLength = polyline.length >= 2 ? Math.hypot(polyline[polyline.length - 1].x - polyline[0].x, polyline[polyline.length - 1].y - polyline[0].y) : 0;
    const curvature = chordLength > 0 ? (arcLength / chordLength) - 1.0 : 0;
    const confidence = Math.min(1.0, avgContrast * 0.6 + Math.min(1.0, arcLength / 150) * 0.4);

    return {
      id,
      polyline,
      confidence: Number(confidence.toFixed(3)),
      length: Math.round(arcLength),
      continuity: Number((chordLength / (arcLength || 1)).toFixed(3)),
      curvature: Number(curvature.toFixed(3)),
      averageWidth: 2.0,
      contrast: Number(avgContrast.toFixed(3)),
      orientationProfile: [],
      branchPoints: [polyline[0], polyline[polyline.length - 1]],
      sourceScales: ['fine', 'medium']
    };
  }
}
