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
    result.life = this.matchBestCandidate('LIFE', normCandidates, priors.LIFE, config);
    result.head = this.matchBestCandidate('HEAD', normCandidates, priors.HEAD, config);
    result.heart = this.matchBestCandidate('HEART', normCandidates, priors.HEART, config);
    result.fate = this.matchBestCandidate('FATE', normCandidates, priors.FATE, config);
    result.sun = this.matchBestCandidate('SUN', normCandidates, priors.SUN, config);

    return result;
  }

  /**
   * Evaluate candidates against anatomical prior boundaries
   */
  static matchBestCandidate(lineType, candidates, prior, config) {
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
        bestScore = totalScore;
        bestCandidate = {
          ...cand,
          orderedPolyline: isReversed ? [...cand.normPolyline].reverse() : cand.normPolyline
        };
        bestEvidence = {
          contrast: Number(contrastScore.toFixed(3)),
          structuralScore: Number(structuralScore.toFixed(3)),
          geometricPriorScore: Number(geometricPriorScore.toFixed(3)),
          landmarkRelationScore: Number(landmarkRelationScore.toFixed(3))
        };
      }
    }

    // Determine honest status based on evidence
    if (!bestCandidate || bestScore < config.weakConfidenceThreshold) {
      return this.createEmptyLine(lineType);
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
    if (prior.trajectoryArc === 'VERTICAL_ASCENDING' || prior.trajectoryArc === 'VERTICAL_APOLLO') {
      if (dy < 0.18 || dy < dx * 0.85) {
        // Line is too short vertically or predominantly transverse; cannot be vertical Fate/Sun line!
        return 0;
      }
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
      score += 0.50;
      if (inEndZone) {
        score += 0.50;
      } else {
        const distEnd = this.distanceToZone(end, prior.endZone);
        score += Math.max(0, 0.40 - distEnd * 0.8);
      }
    } else if (inEndZone) {
      score += 0.50;
      const distStart = this.distanceToZone(start, prior.startZone);
      score += Math.max(0, 0.40 - distStart * 0.8);
    } else {
      const distStart = this.distanceToZone(start, prior.startZone);
      const distEnd = this.distanceToZone(end, prior.endZone);
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

  static createEmptyLine(type) {
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
        landmarkRelationScore: 0
      }
    };
  }
}
