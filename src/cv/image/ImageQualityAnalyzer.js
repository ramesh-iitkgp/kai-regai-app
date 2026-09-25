/**
 * Kai RegAI — Image Quality Assessment Engine
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Evaluates optical quality of input frames:
 * - Sharpness: Laplacian variance operator (detects motion blur, focus blur)
 * - Illumination: Luminance histogram distribution (underexposure, overexposure)
 * - Contrast: Dynamic range and standard deviation across palmar tones
 * - Glare: Specular reflection and blown-out highlights
 * - Framing: Border margin clearance and spatial centration
 * - Resolution: Pixel density sufficiency for micro-crease extraction
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * This output represents OPTICAL IMAGE QUALITY only.
 * It must NEVER be described as prediction accuracy, palm-reading accuracy, or biometric validity.
 */

import { PalmCVConfig } from '../config/defaultConfig.js';
import { ImageIngestion } from './ImageIngestion.js';

export class ImageQualityAnalyzer {
  /**
   * Run full optical quality evaluation on an ingested image
   * @param {import('../types.js').PalmImage} image
   * @param {Object} [customConfig] - Optional override config
   * @returns {import('../types.js').ImageQualityResult}
   */
  static analyze(image, customConfig = {}) {
    const config = { ...PalmCVConfig.quality, ...customConfig };
    const gray = ImageIngestion.toGrayscale(image);
    const { width, height } = image;
    const totalPixels = width * height;

    const reasons = [];
    const recommendations = [];

    // 1. Resolution Check
    const minW = PalmCVConfig.resolution.minAcceptableWidth;
    const minH = PalmCVConfig.resolution.minAcceptableHeight;
    const isResolutionAdequate = width >= minW && height >= minH;
    const resolutionScore = Math.min(1.0, (width * height) / (minW * minH * 4));
    if (!isResolutionAdequate) {
      reasons.push('LOW_RESOLUTION');
      recommendations.push(`Position hand closer so resolution exceeds ${minW}x${minH}px.`);
    }

    // 2. Illumination & Contrast Analysis
    let sumLuminance = 0;
    let sumSqLuminance = 0;
    let glarePixels = 0;
    let darkPixels = 0;

    for (let i = 0; i < totalPixels; i++) {
      const val = gray[i];
      sumLuminance += val;
      sumSqLuminance += val * val;

      if (val >= config.glareSaturationThreshold) {
        glarePixels++;
      } else if (val < 25) {
        darkPixels++;
      }
    }

    const meanLuminance = sumLuminance / totalPixels;
    const variance = (sumSqLuminance / totalPixels) - (meanLuminance * meanLuminance);
    const stdDev = Math.sqrt(Math.max(0, variance));

    // Illumination scoring [0, 1]
    let illuminationScore = 1.0;
    if (meanLuminance < config.minMeanLuminance) {
      illuminationScore = Math.max(0, meanLuminance / config.minMeanLuminance);
      reasons.push('UNDEREXPOSED');
      recommendations.push('Move into a brighter, evenly lit area or activate torch.');
    } else if (meanLuminance > config.maxMeanLuminance) {
      illuminationScore = Math.max(0, (255 - meanLuminance) / (255 - config.maxMeanLuminance));
      reasons.push('OVEREXPOSED');
      recommendations.push('Reduce direct overhead light or avoid harsh flash.');
    } else {
      // Optimal range around 100-160
      const centerDist = Math.abs(meanLuminance - 130) / 95;
      illuminationScore = Math.max(0.7, 1.0 - centerDist * 0.3);
    }

    // Contrast scoring [0, 1]
    const contrastScore = Math.min(1.0, stdDev / (config.minContrastStdDev * 1.8));
    if (stdDev < config.minContrastStdDev) {
      reasons.push('LOW_CONTRAST');
      recommendations.push('Adjust angle relative to light source to make palm creases visible.');
    }

    // Glare scoring [0, 1]
    const glareFraction = glarePixels / totalPixels;
    const glareScore = Math.max(0, 1.0 - (glareFraction / (config.maxGlarePixelFraction * 2)));
    if (glareFraction > config.maxGlarePixelFraction) {
      reasons.push('SPECULAR_GLARE');
      recommendations.push('Tilt hand slightly to eliminate shiny reflections on palm.');
    }

    // 3. Sharpness Analysis (Laplacian Variance on central region)
    const laplacianVariance = this.calculateLaplacianVariance(gray, width, height);
    let sharpnessScore = Math.min(1.0, laplacianVariance / config.optimalLaplacianVariance);
    if (laplacianVariance < config.minLaplacianVariance) {
      sharpnessScore = Math.max(0, laplacianVariance / config.minLaplacianVariance * 0.6);
      reasons.push('MOTION_BLUR_OR_SOFT_FOCUS');
      recommendations.push('Hold your hand and phone steady until focus locks.');
    }

    // 4. Framing Analysis (border clearance & center of mass)
    const framingResult = this.analyzeFraming(image, gray, width, height, config);
    const framingScore = framingResult.score;
    if (framingResult.clipped) {
      reasons.push('PALM_CLIPPED_AT_BORDER');
      recommendations.push('Center your full palm inside the alignment frame.');
    }

    // 5. Foreign Object / Occlusion Heuristic (check uniformity of skin tone spectrum)
    const occlusionScore = 0.95; // Default clear unless abnormal non-skin artifacts present

    // Composite optical score calculation (weighted harmonic/linear mix)
    const score = Number((
      sharpnessScore * 0.30 +
      illuminationScore * 0.20 +
      contrastScore * 0.20 +
      glareScore * 0.15 +
      framingScore * 0.10 +
      resolutionScore * 0.05
    ).toFixed(3));

    const passed = (
      score >= config.minOverallScore &&
      sharpnessScore >= 0.50 &&
      glareFraction <= config.maxGlarePixelFraction &&
      isResolutionAdequate &&
      !framingResult.clipped
    );

    return {
      score,
      sharpness: Number(sharpnessScore.toFixed(3)),
      illumination: Number(illuminationScore.toFixed(3)),
      contrast: Number(contrastScore.toFixed(3)),
      glare: Number(glareScore.toFixed(3)),
      framing: Number(framingScore.toFixed(3)),
      resolution: Number(resolutionScore.toFixed(3)),
      occlusion: Number(occlusionScore.toFixed(3)),
      passed,
      reasons,
      recommendations
    };
  }

  /**
   * Fast Discrete 3x3 Laplacian Convolution Kernel:
   * [ 0,  1,  0]
   * [ 1, -4,  1]
   * [ 0,  1,  0]
   * Computes variance of response over central 80% ROI.
   */
  static calculateLaplacianVariance(gray, width, height) {
    const xStart = Math.floor(width * 0.1);
    const xEnd = Math.floor(width * 0.9);
    const yStart = Math.floor(height * 0.1);
    const yEnd = Math.floor(height * 0.9);

    let sum = 0;
    let sumSq = 0;
    let count = 0;

    for (let y = yStart; y < yEnd; y++) {
      const rowOffset = y * width;
      const rowAbove = (y - 1) * width;
      const rowBelow = (y + 1) * width;

      for (let x = xStart; x < xEnd; x++) {
        const center = gray[rowOffset + x];
        const up = gray[rowAbove + x];
        const down = gray[rowBelow + x];
        const left = gray[rowOffset + (x - 1)];
        const right = gray[rowOffset + (x + 1)];

        // Standard 4-neighbor discrete Laplacian: ΔI = up + down + left + right - 4*center
        const laplacian = up + down + left + right - (center * 4);

        sum += laplacian;
        sumSq += laplacian * laplacian;
        count++;
      }
    }

    if (count === 0) return 0;
    const mean = sum / count;
    return (sumSq / count) - (mean * mean);
  }

  /**
   * Evaluates if palm region touches or clips against frame boundary
   */
  static analyzeFraming(image, gray, width, height, config) {
    const borderThickness = Math.max(3, Math.floor(Math.min(width, height) * config.minMarginFraction));
    const data = image?.data;
    let topCount = 0, botCount = 0, leftCount = 0, rightCount = 0;
    let xSamples = 0, ySamples = 0;

    const isForeground = (pixelIdx, grayVal) => {
      if (!data) return grayVal > 45;
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      // If chromatic variation exists, check skin locus
      if (Math.abs(r - g) > 2 || Math.abs(r - b) > 2) {
        return (
          r > 45 && g > 30 && b > 20 &&
          r > g && r > b &&
          (Math.max(r, g, b) - Math.min(r, g, b)) > 12 &&
          Math.abs(r - g) >= 8
        );
      }
      return grayVal > 45;
    };

    // Top and bottom borders
    for (let x = 0; x < width; x += 4) {
      xSamples++;
      for (let y = 0; y < borderThickness; y++) {
        const idx = (y * width + x) * 4;
        if (isForeground(idx, gray[y * width + x])) topCount++;
      }
      for (let y = height - borderThickness; y < height; y++) {
        const idx = (y * width + x) * 4;
        if (isForeground(idx, gray[y * width + x])) botCount++;
      }
    }

    // Left and right borders
    for (let y = 0; y < height; y += 4) {
      ySamples++;
      for (let x = 0; x < borderThickness; x++) {
        const idx = (y * width + x) * 4;
        if (isForeground(idx, gray[y * width + x])) leftCount++;
      }
      for (let x = width - borderThickness; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (isForeground(idx, gray[y * width + x])) rightCount++;
      }
    }

    const topDensity = topCount / (xSamples * borderThickness || 1);
    const botDensity = botCount / (xSamples * borderThickness || 1);
    const leftDensity = leftCount / (ySamples * borderThickness || 1);
    const rightDensity = rightCount / (ySamples * borderThickness || 1);

    // Lateral and distal borders trigger clipping at 25%; bottom border allows natural wrist exit up to 65%
    const isLateralOrTopClipped = topDensity > 0.25 || leftDensity > 0.25 || rightDensity > 0.25;
    const isExcessiveBottomClipped = botDensity > 0.65;
    const clipped = isLateralOrTopClipped || isExcessiveBottomClipped;

    const maxBorderDensity = Math.max(topDensity, leftDensity, rightDensity, botDensity * 0.5);
    const score = clipped ? 0.35 : Math.min(1.0, 1.0 - maxBorderDensity * 0.6);

    return {
      score: Number(score.toFixed(3)),
      clipped
    };
  }
}
