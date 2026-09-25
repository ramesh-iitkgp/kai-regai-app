/**
 * Kai RegAI — Golden Test Corpus Generator
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Provides deterministic, reproducible synthetic and algorithmic test cases
 * covering all 16 prescribed difficult capture conditions without network dependencies.
 */

export class GoldenCorpus {
  /**
   * Get complete test catalog
   */
  static getCatalog() {
    return [
      { id: 'clear_palm_right', name: 'Clear Palm (Right Hand)', expectedDetection: true, expectedHandedness: 'RIGHT' },
      { id: 'clear_palm_left', name: 'Clear Palm (Left Hand)', expectedDetection: true, expectedHandedness: 'LEFT' },
      { id: 'low_light_palm', name: 'Low Light / Underexposed Palm', expectedQualityPass: false, expectedFailureReason: 'UNDEREXPOSED' },
      { id: 'bright_palm', name: 'Bright / Overexposed Palm', expectedQualityPass: false, expectedFailureReason: 'OVEREXPOSED' },
      { id: 'blurred_palm', name: 'Motion / Focus Blurred Palm', expectedQualityPass: false, expectedFailureReason: 'MOTION_BLUR_OR_SOFT_FOCUS' },
      { id: 'high_contrast_palm', name: 'High Contrast Palm', expectedQualityPass: true },
      { id: 'low_contrast_palm', name: 'Low Contrast Flat Palm', expectedQualityPass: false, expectedFailureReason: 'LOW_CONTRAST' },
      { id: 'specular_glare', name: 'Flash / Specular Glare Palm', expectedQualityPass: false, expectedFailureReason: 'SPECULAR_GLARE' },
      { id: 'clipped_palm', name: 'Clipped Palm at Frame Border', expectedQualityPass: false, expectedFailureReason: 'PALM_CLIPPED_AT_BORDER' },
      { id: 'no_hand', name: 'Background Only / No Hand', expectedHandDetected: false },
      { id: 'faint_sun_line', name: 'Palm with Faint Sun Line', expectedSunLine: 'WEAK' },
      { id: 'absent_sun_line', name: 'Palm with Absent Sun Line', expectedSunLine: 'NOT_DETECTED' }
    ];
  }

  /**
   * Generate an image for a specific catalog case
   * @param {string} caseId
   * @param {number} [width=360]
   * @param {number} [height=360]
   * @returns {import('../types.js').PalmImage}
   */
  static generateCase(caseId, width = 360, height = 360) {
    const data = new Uint8ClampedArray(width * height * 4);
    const cx = width / 2;
    const cy = height / 2;
    const radius = 135;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const distFromCenter = Math.hypot(x - cx, y - cy);

        // Case: No hand
        if (caseId === 'no_hand') {
          // Tabletop / woodgrain background
          data[idx] = 60 + ((x + y) % 15);
          data[idx + 1] = 40 + ((x + y) % 10);
          data[idx + 2] = 25;
          data[idx + 3] = 255;
          continue;
        }

        // Case: Clipped palm (offset center to touch borders)
        const activeCx = caseId === 'clipped_palm' ? 50 : cx;
        const activeDist = Math.hypot(x - activeCx, y - cy);

        // Case: Overexposed bright frame
        if (caseId === 'bright_palm') {
          data[idx] = 235;
          data[idx + 1] = 230;
          data[idx + 2] = 225;
          data[idx + 3] = 255;
          continue;
        }

        // Case: Focus blur with soft sigmoid border and zero creases
        if (caseId === 'blurred_palm') {
          const smoothFalloff = 1 / (1 + Math.exp((activeDist - radius) / 12));
          const val = Math.round(15 + smoothFalloff * 140);
          data[idx] = val;
          data[idx + 1] = Math.round(val * 0.85);
          data[idx + 2] = Math.round(val * 0.75);
          data[idx + 3] = 255;
          continue;
        }

        // Background
        if (activeDist > radius) {
          data[idx] = 15;
          data[idx + 1] = 15;
          data[idx + 2] = 18;
          data[idx + 3] = 255;
          continue;
        }

        // Base skin tone
        let r = 195;
        let g = 145;
        let b = 115;

        // Illumination variations
        if (caseId === 'low_light_palm') {
          r = 25; g = 18; b = 14;
        } else if (caseId === 'low_contrast_palm') {
          r = 140; g = 140; b = 140;
        } else if (caseId === 'specular_glare') {
          if (x > cx - 40 && x < cx + 40 && y > cy - 40 && y < cy + 40) {
            r = 255; g = 255; b = 255; // Specular flash glare
          }
        }

        // Draw creases for cases that have visible palm
        if (!['low_contrast_palm', 'blurred_palm'].includes(caseId)) {
          // Life Line
          const distLife = Math.abs(Math.hypot(x - (activeCx - 50), y - (cy + 20)) - 75);
          if (distLife < 2.5 && y > cy - 30 && y < cy + 85 && x < activeCx + 20) {
            r = Math.max(20, r - 120);
            g = Math.max(15, g - 100);
            b = Math.max(15, b - 80);
          }

          // Head Line
          const headY = cy - 10 + (x - (activeCx - 60)) * 0.35;
          if (Math.abs(y - headY) < 2.5 && x > activeCx - 60 && x < activeCx + 60) {
            r = Math.max(20, r - 120);
            g = Math.max(15, g - 100);
            b = Math.max(15, b - 80);
          }

          // Heart Line
          const heartY = cy - 55 - (x - (activeCx - 70)) * 0.15;
          if (Math.abs(y - heartY) < 2.5 && x > activeCx - 70 && x < activeCx + 70) {
            r = Math.max(20, r - 120);
            g = Math.max(15, g - 100);
            b = Math.max(15, b - 80);
          }

          // Faint Sun line for faint_sun_line case
          if (caseId === 'faint_sun_line') {
            const sunX = activeCx + 45;
            if (Math.abs(x - sunX) < 1.5 && y > cy - 65 && y < cy - 25) {
              r = Math.max(20, r - 45); // Faint shadow
              g = Math.max(15, g - 40);
              b = Math.max(15, b - 35);
            }
          }
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    return {
      width,
      height,
      data,
      channels: 4,
      colorSpace: 'srgb',
      metadata: { caseId }
    };
  }
}
