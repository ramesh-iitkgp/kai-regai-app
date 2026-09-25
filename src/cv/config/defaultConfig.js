/**
 * Kai RegAI — Palm Computer Vision Engine Default Configuration
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Central externalized configuration for CV stages.
 * Thresholds are calibrated for mobile camera captures under typical domestic lighting.
 */

export const PalmCVConfig = {
  version: 'p5.2.0',
  debugMode: false,

  // Processing resolution constraints
  resolution: {
    maxDimension: 1024,      // Maximum dimension for full-frame analysis (preserves fine creases without memory bloat)
    canonicalRoiSize: 512,  // Standard rectified palmar square patch (512x512)
    minAcceptableWidth: 240, // Minimum acceptable hand width in pixels
    minAcceptableHeight: 240
  },

  // Palm Usability & Positioning Constraints (P5.2 Hardening)
  usability: {
    minPalmAreaFraction: 0.10,    // Palm must occupy at least 10% of frame
    maxPalmAreaFraction: 0.88,    // Palm must not exceed 88% of frame
    maxAcceptableTiltDeg: 45.0,   // Tilt beyond 45 deg triggers user correction
    warningTiltDeg: 25.0,         // Tilt between 25-45 deg raises advisory warning
    multiHandClusterThreshold: 0.25, // Secondary cluster area ratio to trigger multi-hand detection
    minUsabilityScore: 0.65       // Composite usability threshold
  },

  // Optical Quality Assessment Thresholds
  quality: {
    minOverallScore: 0.70,       // Composite score required to pass gate
    recommendedScore: 0.85,      // Score targeting optimal crease clarity
    
    // Sharpness (Laplacian Variance over grayscale)
    minLaplacianVariance: 45.0,  // Values below indicate motion or focus blur
    optimalLaplacianVariance: 120.0,
    
    // Illumination (0-255 scale)
    minMeanLuminance: 40,        // Underexposed below this
    maxMeanLuminance: 215,       // Overexposed above this
    minContrastStdDev: 25.0,     // Dynamic range spread
    
    // Specular Glare
    glareSaturationThreshold: 250, // Pixel luminance considered saturated
    maxGlarePixelFraction: 0.04,   // Fail if >4% of palm surface is saturated glare
    
    // Framing & Margin
    minMarginFraction: 0.02,     // Distance from frame edges to prevent clipping
    palmAreaFractionMin: 0.10,   // Palm must occupy at least 10% of frame
    palmAreaFractionMax: 0.88    // Palm must not exceed 88% of frame (too close)
  },

  // Crease Enhancement Parameters
  enhancement: {
    claheTileGridSize: 8,        // CLAHE local context grid (8x8)
    claheClipLimit: 2.5,         // Contrast limiting threshold
    gaussianBlurKernelSize: 3,   // Pre-filtering noise suppression
    gaussianBlurSigma: 0.8,
    
    // Multi-scale ridge filter scales (sigma values for Gaussian 2nd derivative / Hessian)
    scales: [
      { name: 'fine', sigma: 1.0, weight: 0.25 },   // Secondary creases & branches
      { name: 'medium', sigma: 2.0, weight: 0.50 }, // Primary major lines
      { name: 'coarse', sigma: 3.5, weight: 0.25 }  // Broad structural folds
    ],
    ridgeThreshold: 0.15          // Minimum normalized eigenvalue response
  },

  // Skeletonization & Graph Topology
  topology: {
    binaryBinarizationThreshold: 0.18, // Normalized threshold for skeletonization
    minCandidateLength: 20,            // Discard isolated spur paths shorter than 20px
    branchPruningThreshold: 12,        // Prune dangling branch spurs < 12px
    polylineSimplificationTolerance: 1.5 // Douglas-Peucker epsilon in pixels
  },

  // Major Line Identification & Geometric Search Priors
  classification: {
    // Confidence cutoff for positive line status
    detectionConfidenceThreshold: 0.55,
    weakConfidenceThreshold: 0.35,

    // Relative weights for candidate scoring
    weights: {
      anatomicPrior: 0.40,
      structuralCoherence: 0.30,
      contrast: 0.15,
      continuity: 0.15
    },

    // Prior search sectors normalized to rectified 512x512 palm space
    searchPriors: {
      LIFE: {
        startZone: { x: [0.02, 0.48], y: [0.12, 0.60] }, // Near thumb-index crotch
        trajectoryArc: 'THENAR_SWEEP',                    // Sweeps around base of thumb
        endZone: { x: [0.05, 0.70], y: [0.45, 0.98] },   // Towards wrist crease
        minExpectedLength: 50
      },
      HEAD: {
        startZone: { x: [0.05, 0.48], y: [0.12, 0.58] }, // Near life line origin
        trajectoryArc: 'TRANSVERSE_DESCENDING',            // Crosses mid-palm towards percussion/Luna
        endZone: { x: [0.40, 0.95], y: [0.20, 0.80] },
        minExpectedLength: 45
      },
      HEART: {
        startZone: { x: [0.50, 0.95], y: [0.12, 0.55] }, // Originates at percussion side under Mercury
        trajectoryArc: 'TRANSVERSE_ASCENDING',             // Arcs across upper palm under fingers
        endZone: { x: [0.10, 0.60], y: [0.12, 0.50] },   // Towards Jupiter/Saturn
        minExpectedLength: 45
      },
      FATE: {
        startZone: { x: [0.30, 0.70], y: [0.55, 0.98] }, // Lower palm/wrist area
        trajectoryArc: 'VERTICAL_ASCENDING',              // Runs vertically up palm center
        endZone: { x: [0.30, 0.70], y: [0.12, 0.50] },   // Towards Saturn mount
        minExpectedLength: 35
      },
      SUN: {
        startZone: { x: [0.50, 0.85], y: [0.45, 0.95] }, // Lower/mid palm towards Apollo side
        trajectoryArc: 'VERTICAL_APOLLO',                 // Runs vertically toward ring finger
        endZone: { x: [0.50, 0.85], y: [0.12, 0.50] },   // Under Apollo mount
        minExpectedLength: 30
      }
    }
  }
};
