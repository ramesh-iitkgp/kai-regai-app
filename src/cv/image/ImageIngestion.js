/**
 * Kai RegAI — Image Ingestion & Input Normalization Layer
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Handles:
 * - Image input validation (buffer length, dimension checks)
 * - Dimension clamping to maximum processing resolution (preserving spatial aspect ratio)
 * - High-speed grayscale luminance extraction (ITU-R BT.601 standard)
 * - Orientation / Mirroring metadata normalization
 */

import { PalmCVConfig } from '../config/defaultConfig.js';

export class ImageIngestion {
  /**
   * Normalize an incoming image buffer or object into a standardized PalmImage
   * @param {Object} input - Input raw image object
   * @param {number} input.width - Image width in pixels
   * @param {number} input.height - Image height in pixels
   * @param {Uint8ClampedArray | Uint8Array} input.data - RGBA pixel buffer
   * @param {Object} [options]
   * @param {number} [options.maxDimension] - Max dimension to clamp to
   * @param {boolean} [options.isMirrored=false] - Whether camera input was mirrored
   * @returns {import('../types.js').PalmImage}
   */
  static normalize(input, options = {}) {
    if (!input || typeof input.width !== 'number' || typeof input.height !== 'number') {
      throw new Error('Invalid image input: width and height must be numeric.');
    }
    if (!input.data || !(input.data instanceof Uint8ClampedArray || input.data instanceof Uint8Array)) {
      throw new Error('Invalid image input: data must be a Uint8ClampedArray or Uint8Array.');
    }
    const expectedLength = input.width * input.height * 4;
    if (input.data.length !== expectedLength) {
      throw new Error(`Invalid buffer length: expected ${expectedLength} bytes for ${input.width}x${input.height} RGBA, got ${input.data.length}`);
    }

    const maxDim = options.maxDimension || PalmCVConfig.resolution.maxDimension;
    let width = input.width;
    let height = input.height;
    let data = input.data;

    // Scale down if image exceeds max processing resolution
    if (Math.max(width, height) > maxDim) {
      const scale = maxDim / Math.max(width, height);
      const targetW = Math.round(width * scale);
      const targetH = Math.round(height * scale);
      data = this.resampleBilinear(data, width, height, targetW, targetH);
      width = targetW;
      height = targetH;
    }

    return {
      width,
      height,
      data: data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data),
      channels: 4,
      colorSpace: 'srgb',
      metadata: {
        originalWidth: input.width,
        originalHeight: input.height,
        isMirrored: options.isMirrored ?? false,
        ingestionTimestamp: Date.now()
      }
    };
  }

  /**
   * Fast bilinear resampling for RGBA pixel buffers
   */
  static resampleBilinear(srcData, srcW, srcH, dstW, dstH) {
    const dstData = new Uint8ClampedArray(dstW * dstH * 4);
    const xRatio = (srcW - 1) / (dstW - 1 || 1);
    const yRatio = (srcH - 1) / (dstH - 1 || 1);

    for (let y = 0; y < dstH; y++) {
      const srcY = y * yRatio;
      const yFloor = Math.floor(srcY);
      const yCeil = Math.min(yFloor + 1, srcH - 1);
      const yWeight = srcY - yFloor;

      for (let x = 0; x < dstW; x++) {
        const srcX = x * xRatio;
        const xFloor = Math.floor(srcX);
        const xCeil = Math.min(xFloor + 1, srcW - 1);
        const xWeight = srcX - xFloor;

        const idxTL = (yFloor * srcW + xFloor) * 4;
        const idxTR = (yFloor * srcW + xCeil) * 4;
        const idxBL = (yCeil * srcW + xFloor) * 4;
        const idxBR = (yCeil * srcW + xCeil) * 4;
        const dstIdx = (y * dstW + x) * 4;

        for (let c = 0; c < 4; c++) {
          const top = srcData[idxTL + c] * (1 - xWeight) + srcData[idxTR + c] * xWeight;
          const bot = srcData[idxBL + c] * (1 - xWeight) + srcData[idxBR + c] * xWeight;
          dstData[dstIdx + c] = Math.round(top * (1 - yWeight) + bot * yWeight);
        }
      }
    }
    return dstData;
  }

  /**
   * Convert RGBA buffer to single-channel 8-bit grayscale luminance array
   * Y = 0.299*R + 0.587*G + 0.114*B
   * @param {import('../types.js').PalmImage} image
   * @returns {Uint8Array} Single-channel array of length width * height
   */
  static toGrayscale(image) {
    const { width, height, data } = image;
    const gray = new Uint8Array(width * height);
    let p = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Fast integer fixed-point approximation of luminance: (77*R + 150*G + 29*B) >> 8
      gray[p++] = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
    }
    return gray;
  }
}
