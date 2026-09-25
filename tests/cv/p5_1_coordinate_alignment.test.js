import test from 'node:test';
import assert from 'node:assert/strict';
import { CoordinateTransform } from '../../src/cv/geometry/CoordinateTransform.js';

test('P5.1 Coordinate Alignment Regression — lossless round-trip transformation', () => {
  // Mock realistic palm ROI
  const palmROI = {
    boundingBox: { x: 100, y: 120, width: 400, height: 420 },
    orientation: 0.28, // ~16 degrees tilt
    scale: 0.85,
    roiSize: 512
  };

  const imageMeta = { clampScale: 0.5 }; // e.g. 2000x2000 downscaled to 1000x1000

  // Test set of diverse coordinates across the palm
  const testPoints = [
    { x: 250, y: 350 }, // Central palm
    { x: 180, y: 220 }, // Thenar / Life line region
    { x: 380, y: 210 }, // Percussion / Heart line region
    { x: 300, y: 480 }, // Wrist base / Fate line origin
    { x: 320, y: 160 }  // Sub-digital / Sun line region
  ];

  for (const originalPt of testPoints) {
    // 1. Original -> ROI
    const roiPt = CoordinateTransform.imageToPalmROI(originalPt, palmROI, imageMeta);
    assert.ok(typeof roiPt.x === 'number' && typeof roiPt.y === 'number');

    // 2. ROI -> Normalized
    const normPt = CoordinateTransform.palmROIToNormalized(roiPt, palmROI.roiSize);
    assert.ok(normPt.x >= -0.5 && normPt.x <= 1.5);
    assert.ok(normPt.y >= -0.5 && normPt.y <= 1.5);

    // 3. Normalized -> Overlay
    const overlayPt = CoordinateTransform.normalizedToOverlay(normPt, 360, 450);
    assert.ok(typeof overlayPt.x === 'number' && typeof overlayPt.y === 'number');

    // 4. Overlay -> Original (Full inverse chain)
    const recoveredPt = CoordinateTransform.overlayToOriginal(overlayPt, palmROI, imageMeta, 360, 450);

    // Verify displacement error is effectively zero (< 1e-5 pixels)
    const displacement = Math.hypot(originalPt.x - recoveredPt.x, originalPt.y - recoveredPt.y);
    assert.ok(
      displacement < 1e-4,
      `Expected negligible displacement, got ${displacement} px for pt (${originalPt.x}, ${originalPt.y})`
    );
  }
});

test('P5.1 Coordinate Alignment — polyline batch transformation consistency', () => {
  const palmROI = {
    boundingBox: { x: 50, y: 60, width: 250, height: 260 },
    orientation: -0.15,
    scale: 0.65,
    roiSize: 512
  };

  const polylineOriginal = [
    { x: 120, y: 150 },
    { x: 140, y: 190 },
    { x: 165, y: 240 },
    { x: 190, y: 280 }
  ];

  const polylineOverlay = CoordinateTransform.transformPolyline(polylineOriginal, pt =>
    CoordinateTransform.originalToOverlay(pt, palmROI)
  );

  const polylineRestored = CoordinateTransform.transformPolyline(polylineOverlay, pt =>
    CoordinateTransform.overlayToOriginal(pt, palmROI)
  );

  for (let i = 0; i < polylineOriginal.length; i++) {
    const error = Math.hypot(polylineOriginal[i].x - polylineRestored[i].x, polylineOriginal[i].y - polylineRestored[i].y);
    assert.ok(error < 1e-4, `Polyline vertex ${i} error exceeds threshold: ${error}`);
  }
});
