/**
 * Kai RegAI — Crease Enhancement Engine
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Multi-scale crease enhancement pipeline:
 * 1. Contrast Limited Adaptive Histogram Equalization (CLAHE)
 * 2. Gaussian Scale-Space filtering
 * 3. Hessian 2nd-derivative directional valley/ridge response
 * 4. Multi-scale fusion (Fine, Medium, Coarse scales)
 * 5. Normalized structural crease confidence map
 */

import { PalmCVConfig } from '../config/defaultConfig.js';

export class CreaseEnhancementEngine {
  /**
   * Enhance crease structures across multiple spatial scales
   * @param {Uint8Array} roiPatch - Rectified grayscale square palmar patch
   * @param {number} size - Patch dimension (e.g. 512)
   * @param {Uint8Array} [mask] - Binary circular palmar mask
   * @param {Object} [customConfig]
   * @returns {{ enhancedMap: Float32Array, scaleMaps: Record<string, Float32Array> }}
   */
  static enhance(roiPatch, size, mask = null, customConfig = {}) {
    const config = { ...PalmCVConfig.enhancement, ...customConfig };

    // 1. CLAHE Contrast Equalization
    const claheBuffer = this.applyCLAHE(roiPatch, size, config.claheTileGridSize, config.claheClipLimit);

    // 2. Multi-Scale Hessian Ridge / Valley Response
    const scaleMaps = {};
    const fusedMap = new Float32Array(size * size);

    for (const scale of config.scales) {
      const response = this.computeHessianValleyResponse(claheBuffer, size, scale.sigma);
      scaleMaps[scale.name] = response;

      // Fuse multi-scale responses with configured scale weights
      for (let i = 0; i < fusedMap.length; i++) {
        if (!mask || mask[i] > 0) {
          fusedMap[i] = Math.max(fusedMap[i], response[i] * scale.weight);
        }
      }
    }

    // Normalize fused map to [0, 1] range
    let maxVal = 0;
    for (let i = 0; i < fusedMap.length; i++) {
      if (fusedMap[i] > maxVal) maxVal = fusedMap[i];
    }
    if (maxVal > 0) {
      const invMax = 1.0 / maxVal;
      for (let i = 0; i < fusedMap.length; i++) {
        fusedMap[i] *= invMax;
      }
    }

    return {
      enhancedMap: fusedMap,
      scaleMaps
    };
  }

  /**
   * Contrast Limited Adaptive Histogram Equalization (CLAHE)
   */
  static applyCLAHE(src, size, gridSize = 8, clipLimit = 2.5) {
    const dst = new Uint8Array(size * size);
    const tileSize = Math.floor(size / gridSize);
    const numBins = 256;
    const clipVal = Math.round((clipLimit * tileSize * tileSize) / numBins);

    // Compute tile histograms with clip limiting
    const tileHistograms = new Array(gridSize * gridSize);
    for (let ty = 0; ty < gridSize; ty++) {
      for (let tx = 0; tx < gridSize; tx++) {
        const hist = new Int32Array(numBins);
        const startX = tx * tileSize;
        const startY = ty * tileSize;

        for (let y = 0; y < tileSize; y++) {
          const row = (startY + y) * size;
          for (let x = 0; x < tileSize; x++) {
            hist[src[row + startX + x]]++;
          }
        }

        // Clip and redistribute excess
        let excess = 0;
        for (let b = 0; b < numBins; b++) {
          if (hist[b] > clipVal) {
            excess += hist[b] - clipVal;
            hist[b] = clipVal;
          }
        }
        const bonus = Math.floor(excess / numBins);
        for (let b = 0; b < numBins; b++) {
          hist[b] += bonus;
        }

        // Cumulative distribution function (CDF)
        const cdf = new Float32Array(numBins);
        let sum = 0;
        const total = tileSize * tileSize;
        for (let b = 0; b < numBins; b++) {
          sum += hist[b];
          cdf[b] = (sum / total) * 255;
        }
        tileHistograms[ty * gridSize + tx] = cdf;
      }
    }

    // Bilinear interpolation between neighboring tile CDFs
    for (let y = 0; y < size; y++) {
      const tyF = (y / tileSize) - 0.5;
      const ty0 = Math.max(0, Math.min(gridSize - 1, Math.floor(tyF)));
      const ty1 = Math.max(0, Math.min(gridSize - 1, ty0 + 1));
      const wy = Math.max(0, Math.min(1, tyF - ty0));

      const row = y * size;
      for (let x = 0; x < size; x++) {
        const txF = (x / tileSize) - 0.5;
        const tx0 = Math.max(0, Math.min(gridSize - 1, Math.floor(txF)));
        const tx1 = Math.max(0, Math.min(gridSize - 1, tx0 + 1));
        const wx = Math.max(0, Math.min(1, txF - tx0));

        const val = src[row + x];
        const cdf00 = tileHistograms[ty0 * gridSize + tx0][val];
        const cdf10 = tileHistograms[ty0 * gridSize + tx1][val];
        const cdf01 = tileHistograms[ty1 * gridSize + tx0][val];
        const cdf11 = tileHistograms[ty1 * gridSize + tx1][val];

        const top = cdf00 * (1 - wx) + cdf10 * wx;
        const bot = cdf01 * (1 - wx) + cdf11 * wx;
        dst[row + x] = Math.round(top * (1 - wy) + bot * wy);
      }
    }

    return dst;
  }

  /**
   * Hessian 2nd-Derivative Directional Valley / Ridge Filter
   * For dark valleys (creases) on lighter skin, the second derivative across the crease is positive.
   * Eigenvalues of H = [Ixx, Ixy; Ixy, Iyy]:
   * lambda = (Ixx + Iyy +- sqrt((Ixx - Iyy)^2 + 4*Ixy^2)) / 2
   */
  static computeHessianValleyResponse(src, size, sigma) {
    const smoothed = this.gaussianBlur(src, size, sigma);
    const response = new Float32Array(size * size);

    // Compute discrete 2nd derivatives using centered differences
    for (let y = 2; y < size - 2; y++) {
      const row = y * size;
      const rowAbove = (y - 1) * size;
      const rowBelow = (y + 1) * size;

      for (let x = 2; x < size - 2; x++) {
        const center = smoothed[row + x];
        const left = smoothed[row + x - 1];
        const right = smoothed[row + x + 1];
        const up = smoothed[rowAbove + x];
        const down = smoothed[rowBelow + x];

        // Diagonal neighbors for Ixy
        const upRight = smoothed[rowAbove + x + 1];
        const downLeft = smoothed[rowBelow + x - 1];
        const upLeft = smoothed[rowAbove + x - 1];
        const downRight = smoothed[rowBelow + x + 1];

        // 2nd derivatives
        const Ixx = right + left - 2 * center;
        const Iyy = down + up - 2 * center;
        const Ixy = (downRight - downLeft - upRight + upLeft) / 4.0;

        // Trace and determinant
        const trace = Ixx + Iyy;
        const diff = Ixx - Iyy;
        const discriminant = Math.sqrt(Math.max(0, diff * diff + 4 * Ixy * Ixy));

        // Maximum eigenvalue (valley curvature)
        const lambda2 = (trace + discriminant) / 2.0;

        // Crease valley condition: lambda2 > 0 (concave upward intensity valley)
        if (lambda2 > 0) {
          // Normalize by scale (scale invariance: sigma^2)
          response[row + x] = lambda2 * (sigma * sigma);
        }
      }
    }

    return response;
  }

  /**
   * Fast Separable 1D Gaussian Blur
   */
  static gaussianBlur(src, size, sigma) {
    const radius = Math.max(1, Math.ceil(sigma * 2.5));
    const kernelSize = radius * 2 + 1;
    const kernel = new Float32Array(kernelSize);

    let kSum = 0;
    for (let i = -radius; i <= radius; i++) {
      const w = Math.exp(-(i * i) / (2 * sigma * sigma));
      kernel[i + radius] = w;
      kSum += w;
    }
    for (let i = 0; i < kernelSize; i++) kernel[i] /= kSum;

    // Horizontal pass
    const temp = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      const row = y * size;
      for (let x = 0; x < size; x++) {
        let acc = 0;
        for (let k = -radius; k <= radius; k++) {
          const sampleX = Math.max(0, Math.min(size - 1, x + k));
          acc += src[row + sampleX] * kernel[k + radius];
        }
        temp[row + x] = acc;
      }
    }

    // Vertical pass
    const dst = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let acc = 0;
        for (let k = -radius; k <= radius; k++) {
          const sampleY = Math.max(0, Math.min(size - 1, y + k));
          acc += temp[sampleY * size + x] * kernel[k + radius];
        }
        dst[y * size + x] = acc;
      }
    }

    return dst;
  }
}
