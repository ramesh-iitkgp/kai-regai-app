/**
 * Kai RegAI — Major Palm Line Classifier
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Classifies candidate crease polylines into the 5 canonical major lines:
 * - Life Line (Ayur Rekha)
 * - Head Line (Matru Rekha)
 * - Heart Line (Pitri/Hridaya Rekha)
 * - Fate Line (Urdhva/Karma Rekha)
 * - Sun Line (Surya Rekha)
 * 
 * CRITICAL ENGINEERING PRINCIPLE:
 * Real evidence only. If evidence is insufficient, lines MUST be returned
 * as status: 'NOT_DETECTED' with an empty polyline, rather than hallucinating
 * or placing a pre-computed template line.
 */

import { PalmCVConfig } from '../config/defaultConfig.js';

export class MajorLineClassifier {
  /**
   * Classify candidates into canonical MajorPalmLines
   * @param {import('../types.js').CreaseCandidate[]} candidates
   * @param {number} size - Patch size (e.g. 512)
   * @param {import('../types.js').PalmROI} palmROI - Rectified palm ROI with landmarks
   * @param {Object} [customConfig]
   * @returns {Record<'life' | 'head' | 'heart' | 'fate' | 'sun', import('../types.js').MajorPalmLine>}
   */
  static classify(candidates, size, palmROI, customConfig = {}) {
    const config = { ...PalmCVConfig.classification, ...customConfig };
    const priors = config.searchPriors;

    const result = {
      life: this.createEmptyLine('LIFE'),
      head: this.createEmptyLine('HEAD'),
      heart: this.createEmptyLine('HEART'),
      fate: this.createEmptyLine('FATE'),
      sun: this.createEmptyLine('SUN')
    };

    if (!candidates || candidates.length === 0) {
      return result;
    }

    // Normalized candidates in [0, 1] coordinate frame
    const normCandidates = candidates.map(c => ({
      ...c,
      normPolyline: c.polyline.map(p => ({ x: p.x / size, y: p.y / size }))
    }));

    // Score candidates against each line prior
    result.life = this.matchBestCandidate('LIFE', normCandidates, priors.LIFE, config, palmROI);
    result.head = this.matchBestCandidate('HEAD', normCandidates, priors.HEAD, config, palmROI);
    result.heart = this.matchBestCandidate('HEART', normCandidates, priors.HEART, config, palmROI);
    result.fate = this.matchBestCandidate('FATE', normCandidates, priors.FATE, config, palmROI);
    result.sun = this.matchBestCandidate('SUN', normCandidates, priors.SUN, config, palmROI);

    return result;
  }

  /**
   * Evaluate candidates against anatomical prior boundaries
   */
  static matchBestCandidate(lineType, candidates, prior, config, palmROI = null) {
    let bestCandidate = null;
    let bestScore = -1;
    let bestEvidence = null;

    for (const cand of candidates) {
      const pts = cand.normPolyline;
      if (pts.length < 2) continue;

      const start = pts[0];
      const end = pts[pts.length - 1];

      // Test both orientations of the polyline
      const forwardScore = this.scoreAlignment(start, end, pts, prior);
      const reverseScore = this.scoreAlignment(end, start, pts, prior);

      const alignmentScore = Math.max(forwardScore, reverseScore);
      const isReversed = reverseScore > forwardScore;

      // Evidence breakdown
      const contrastScore = Math.min(1.0, cand.contrast);
      const structuralScore = Math.min(1.0, cand.length / prior.minExpectedLength);
      const geometricPriorScore = alignmentScore;
      const landmarkRelationScore = Math.min(1.0, alignmentScore * 1.1);

      // Weighted combined score
      const totalScore = (
        geometricPriorScore * config.weights.anatomicPrior +
        structuralScore * config.weights.structuralCoherence +
        contrastScore * config.weights.contrast +
        cand.continuity * config.weights.continuity
      );

      if (totalScore > bestScore && geometricPriorScore > 0.35) {
        if (!this.isTrueFurrow(cand, palmROI)) {
          continue;
        }
        bestScore = totalScore;
        bestCandidate = {
          ...cand,
          orderedPolyline: isReversed ? [...cand.normPolyline].reverse() : cand.normPolyline
        };
        const detectionConfidence = Math.min(1.0, (contrastScore * 0.4 + structuralScore * 0.3 + cand.continuity * 0.3));
        const qualityScore = palmROI?.qualityScore ?? 0.90;

        bestEvidence = {
          contrast: Number(contrastScore.toFixed(3)),
          structuralScore: Number(structuralScore.toFixed(3)),
          geometricPriorScore: Number(geometricPriorScore.toFixed(3)),
          landmarkRelationScore: Number(landmarkRelationScore.toFixed(3)),
          // P5.2 Decomposed confidence facets
          detection: Number(detectionConfidence.toFixed(3)),
          geometry: Number(geometricPriorScore.toFixed(3)),
          continuity: Number(cand.continuity.toFixed(3)),
          imageQuality: Number(qualityScore.toFixed(3)),
          localization: Number(landmarkRelationScore.toFixed(3)),
          overall: Number(totalScore.toFixed(3)),
          fieldVisibility: 'WITHIN_FRAME'
        };
      }
    }

    // Determine honest status based on evidence
    if (!bestCandidate || bestScore < config.weakConfidenceThreshold) {
      const isVisible = palmROI?.usability?.details?.visibleRegions
        ? palmROI.usability.details.visibleRegions[lineType] !== false
        : true;
      const fieldVisibility = isVisible ? 'WITHIN_FRAME_ABSENT' : 'OUT_OF_FRAME';
      return this.createEmptyLine(lineType, fieldVisibility);
    }

    let status = 'DETECTED';
    if (bestScore < config.detectionConfidenceThreshold) {
      status = 'WEAK';
    } else if (bestCandidate.length < prior.minExpectedLength * 0.75) {
      status = 'PARTIAL';
    }

    return {
      type: lineType,
      status,
      polyline: bestCandidate.orderedPolyline,
      confidence: Number(bestScore.toFixed(3)),
      continuity: bestCandidate.continuity,
      visibility: Number(bestCandidate.contrast.toFixed(3)),
      evidence: bestEvidence
    };
  }

  /**
   * Spatial scoring between start/end points and prior bounding sectors
   */
  static scoreAlignment(start, end, pts, prior) {
    // Trajectory orientation & minimum span verification
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    if (prior.trajectoryArc === 'VERTICAL_APOLLO') {
      if (dy < 0.22 || dy < dx * 0.90) {
        // Line is too short vertically or predominantly transverse; cannot be vertical Sun line!
        return 0;
      }
      // Sun line must remain in the Apollo corridor under ring finger (x between 0.50 and 0.76)
      for (const p of pts) {
        if (p.x > 0.76 || p.x < 0.50) return 0;
      }
      // Must reach upper palm under Apollo mount
      if (Math.min(start.y, end.y) > 0.48) return 0;
    } else if (prior.trajectoryArc === 'VERTICAL_ASCENDING') {
      if (dy < 0.25 || dy < dx * 0.90) {
        // Line is too short vertically or predominantly transverse; cannot be vertical Fate line!
        return 0;
      }
      // Fate line must remain in the central Saturn corridor (x between 0.25 and 0.75)
      for (const p of pts) {
        if (p.x > 0.75 || p.x < 0.25) return 0;
      }
      // Must span between lower palm and upper palm
      if (Math.max(start.y, end.y) < 0.55 || Math.min(start.y, end.y) > 0.48) return 0;
    } else if (prior.trajectoryArc === 'TRANSVERSE_DESCENDING' || prior.trajectoryArc === 'TRANSVERSE_ASCENDING') {
      if (dx < 0.18 || dx < dy * 0.70) {
        // Line is too short horizontally or predominantly vertical; cannot be transverse Head/Heart line!
        return 0;
      }
    }

    const inStartZone = this.isInZone(start, prior.startZone);
    const inEndZone = this.isInZone(end, prior.endZone);

    let score = 0;
    if (inStartZone) {
      if (inEndZone) {
        score += 1.0;
      } else {
        const distEnd = this.distanceToZone(end, prior.endZone);
        if (distEnd > 0.20) return 0;
        score += 0.50 + Math.max(0, 0.40 - distEnd * 1.5);
      }
    } else if (inEndZone) {
      const distStart = this.distanceToZone(start, prior.startZone);
      if (distStart > 0.20) return 0;
      score += 0.50 + Math.max(0, 0.40 - distStart * 1.5);
    } else {
      const distStart = this.distanceToZone(start, prior.startZone);
      const distEnd = this.distanceToZone(end, prior.endZone);
      if (distStart > 0.15 || distEnd > 0.15) return 0;
      score = Math.max(0, 0.35 - (distStart + distEnd) * 0.8);
    }

    return score;
  }

  static isInZone(pt, zone) {
    return (
      pt.x >= zone.x[0] && pt.x <= zone.x[1] &&
      pt.y >= zone.y[0] && pt.y <= zone.y[1]
    );
  }

  static distanceToZone(pt, zone) {
    const dx = Math.max(0, zone.x[0] - pt.x, pt.x - zone.x[1]);
    const dy = Math.max(0, zone.y[0] - pt.y, pt.y - zone.y[1]);
    return Math.hypot(dx, dy);
  }

  /**
   * Cross-sectional furrow verification: true anatomical creases are concave grooves
   * with tissue rising on both sides. Shadows and silhouette borders are monotonic step edges.
   */
  static isTrueFurrow(cand, palm) {
    if (!palm || !palm.roiPatch) return true;
    const patch = palm.roiPatch;
    const size = palm.roiSize || 512;
    const pts = cand.normPolyline;
    if (pts.length < 3) return true;

    let valleyCount = 0;
    let validSampleCount = 0;
    const offsetDist = Math.max(3, Math.round(size * 0.008)); // ~4px across crease

    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1];
      const next = pts[i + 1];
      const cur = pts[i];

      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const tLen = Math.hypot(tx, ty);
      if (tLen === 0) continue;

      const nx = (-ty / tLen) * offsetDist;
      const ny = (tx / tLen) * offsetDist;

      const cx = Math.round(cur.x * size);
      const cy = Math.round(cur.y * size);
      const lx = Math.round(cx + nx);
      const ly = Math.round(cy + ny);
      const rx = Math.round(cx - nx);
      const ry = Math.round(cy - ny);

      if (lx >= 0 && lx < size && ly >= 0 && ly < size &&
          rx >= 0 && rx < size && ry >= 0 && ry < size &&
          cx >= 0 && cx < size && cy >= 0 && cy < size) {
        validSampleCount++;
        const valC = patch[cy * size + cx];
        const valL = patch[ly * size + lx];
        const valR = patch[ry * size + rx];

        // Crease furrow condition: center is darker than both flanking skin pixels
        if (valL >= valC && valR >= valC && (valL - valC + valR - valC) >= 4) {
          valleyCount++;
        }
      }
    }

    if (validSampleCount < 3) return true;
    return (valleyCount / validSampleCount) >= 0.35;
  }

  static createEmptyLine(type, fieldVisibility = 'WITHIN_FRAME_ABSENT') {
    return {
      type,
      status: 'NOT_DETECTED',
      polyline: [],
      confidence: 0,
      continuity: 0,
      visibility: 0,
      evidence: {
        contrast: 0,
        structuralScore: 0,
        geometricPriorScore: 0,
        landmarkRelationScore: 0,
        detection: 0,
        geometry: 0,
        continuity: 0,
        imageQuality: 0,
        localization: 0,
        overall: 0,
        fieldVisibility
      }
    };
  }
}
