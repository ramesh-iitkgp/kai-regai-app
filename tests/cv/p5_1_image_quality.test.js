import test from 'node:test';
import assert from 'node:assert/strict';
import { ImageIngestion } from '../../src/cv/image/ImageIngestion.js';
import { ImageQualityAnalyzer } from '../../src/cv/image/ImageQualityAnalyzer.js';
import { PalmCVConfig } from '../../src/cv/config/defaultConfig.js';

/**
 * Synthetic Image Generator for deterministic CV tests
 */
function createSyntheticImage(width, height, fillFn) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = fillFn(x, y, width, height);
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a ?? 255;
    }
  }
  return { width, height, data };
}

test('P5.1 Image Ingestion — validates input dimensions and buffer sizes', () => {
  assert.throws(() => {
    ImageIngestion.normalize({ width: 100, height: 100, data: new Uint8ClampedArray(10) });
  }, /Invalid buffer length/);

  assert.throws(() => {
    ImageIngestion.normalize(null);
  }, /Invalid image input/);
});

test('P5.1 Image Ingestion — clamps resolution above maxDimension without distorting buffer', () => {
  const largeImg = createSyntheticImage(1600, 1200, (x, y) => [128, 128, 128, 255]);
  const normalized = ImageIngestion.normalize(largeImg, { maxDimension: 800 });

  assert.equal(normalized.width, 800);
  assert.equal(normalized.height, 600);
  assert.equal(normalized.data.length, 800 * 600 * 4);
  assert.equal(normalized.metadata.originalWidth, 1600);
  assert.equal(normalized.metadata.originalHeight, 1200);
});

test('P5.1 Image Quality Analyzer — passes clear, sharp, well-illuminated synthetic palm', () => {
  // Generates sharp high-contrast synthetic palm centered with margins
  const sharpImg = createSyntheticImage(320, 320, (x, y) => {
    // 20px dark background margin around borders
    if (x < 20 || x > 300 || y < 20 || y > 300) {
      return [10, 10, 10, 255];
    }
    const isCrease = (x % 30 < 2) || (y % 40 < 2);
    const lum = isCrease ? 40 : 160;
    return [lum, lum, lum, 255];
  });

  const normalized = ImageIngestion.normalize(sharpImg);
  const quality = ImageQualityAnalyzer.analyze(normalized);

  assert.equal(quality.passed, true);
  assert.ok(quality.score >= 0.70, `Expected score >= 0.70, got ${quality.score}`);
  assert.ok(quality.sharpness > 0.60, `Expected high sharpness, got ${quality.sharpness}`);
  assert.equal(quality.reasons.length, 0);
});

test('P5.1 Image Quality Analyzer — detects motion blur and soft focus', () => {
  // Uniform flat image with zero edges (Laplacian variance = 0)
  const flatImg = createSyntheticImage(320, 320, () => [140, 140, 140, 255]);
  const normalized = ImageIngestion.normalize(flatImg);
  const quality = ImageQualityAnalyzer.analyze(normalized);

  assert.equal(quality.passed, false);
  assert.ok(quality.reasons.includes('MOTION_BLUR_OR_SOFT_FOCUS'));
  assert.ok(quality.sharpness < 0.2);
});

test('P5.1 Image Quality Analyzer — detects underexposure', () => {
  // Very dark image (< 20 mean luminance)
  const darkImg = createSyntheticImage(320, 320, () => [15, 15, 15, 255]);
  const normalized = ImageIngestion.normalize(darkImg);
  const quality = ImageQualityAnalyzer.analyze(normalized);

  assert.equal(quality.passed, false);
  assert.ok(quality.reasons.includes('UNDEREXPOSED'));
  assert.ok(quality.recommendations.some(r => r.includes('torch') || r.includes('lit')));
});

test('P5.1 Image Quality Analyzer — detects overexposure and specular glare', () => {
  // Highly saturated image with > 250 brightness across 20% of surface
  const glareImg = createSyntheticImage(320, 320, (x, y) => {
    if (x < 150 && y < 150) return [255, 255, 255, 255]; // Glare spot
    return [150, 150, 150, 255];
  });
  const normalized = ImageIngestion.normalize(glareImg);
  const quality = ImageQualityAnalyzer.analyze(normalized);

  assert.equal(quality.passed, false);
  assert.ok(quality.reasons.includes('SPECULAR_GLARE'));
});

test('P5.1 Image Quality Analyzer — rejects images below minimum acceptable resolution', () => {
  const tinyImg = createSyntheticImage(120, 120, () => [130, 130, 130, 255]);
  const normalized = ImageIngestion.normalize(tinyImg);
  const quality = ImageQualityAnalyzer.analyze(normalized);

  assert.equal(quality.passed, false);
  assert.ok(quality.reasons.includes('LOW_RESOLUTION'));
});
