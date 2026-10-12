import test from 'node:test';
import assert from 'node:assert/strict';

import { LandmarkSmoother } from '../../src/scanner/LandmarkSmoother.js';
import { BrowserHandTracker } from '../../src/scanner/BrowserHandTracker.js';

test('SMOOTHER-1: LandmarkSmoother dampens stationary sensor jitter', () => {
  const smoother = new LandmarkSmoother({
    stillAlpha: 0.15,
    jitterThreshold: 0.02
  });

  const basePoints = Array.from({ length: 21 }, (_, i) => ({
    id: i,
    x: 0.50,
    y: 0.50,
    visibility: 0.95
  }));

  // Seed smoother
  const seeded = smoother.update(basePoints);
  assert.equal(seeded[0].x, 0.50);

  // Apply microscopic noise (+/- 0.005)
  const noisyPoints = basePoints.map((pt, i) => ({
    ...pt,
    x: pt.x + (i % 2 === 0 ? 0.005 : -0.005),
    y: pt.y + (i % 2 === 0 ? -0.004 : 0.004)
  }));

  const smoothed = smoother.update(noisyPoints);

  // Movement should be heavily dampened by stillAlpha (0.15)
  const deltaX = Math.abs(smoothed[0].x - 0.50);
  assert.ok(deltaX < 0.001, `Jitter should be heavily dampened: expected < 0.001, got ${deltaX}`);
});

test('SMOOTHER-2: LandmarkSmoother responds quickly to fast hand displacement', () => {
  const smoother = new LandmarkSmoother({
    motionAlpha: 0.70,
    motionThreshold: 0.05
  });

  const p1 = Array.from({ length: 21 }, (_, i) => ({ id: i, x: 0.20, y: 0.30 }));
  smoother.update(p1);

  // Large movement: hand shifted from 0.20 to 0.40 (delta 0.20 > motionThreshold 0.05)
  const p2 = Array.from({ length: 21 }, (_, i) => ({ id: i, x: 0.40, y: 0.30 }));
  const res = smoother.update(p2);

  // Should track at >= motionAlpha (0.70)
  assert.ok(res[0].x >= 0.339, `Should respond quickly to fast motion: expected >= 0.339, got ${res[0].x}`);
});

test('SMOOTHER-3: LandmarkSmoother retains graceful persistence on momentary frame drop', () => {
  const smoother = new LandmarkSmoother({ maxMissingFrames: 3 });

  const points = Array.from({ length: 21 }, (_, i) => ({ id: i, x: 0.5, y: 0.5 }));
  smoother.update(points);

  // Missing frame 1 & 2
  assert.notEqual(smoother.update(null), null, 'Frame 1 drop should retain persistent pose');
  assert.notEqual(smoother.update(null), null, 'Frame 2 drop should retain persistent pose');

  // Missing frame 4 (exceeds maxMissingFrames 3)
  smoother.update(null);
  const dropped = smoother.update(null);
  assert.equal(dropped, null, 'Should fade/drop pose after grace period');
});

test('PROJECTION-1: computeCoverProjection eliminates aspect ratio distortion across screen sizes', () => {
  // Screen: 1920x1080 (16:9), Video stream: 1280x720 (16:9)
  const proj1 = BrowserHandTracker.computeCoverProjection(1920, 1080, 1280, 720, false);
  const center1 = proj1(0.5, 0.5);
  assert.equal(center1.x, 960);
  assert.equal(center1.y, 540);

  // Mobile Screen: 390x844 (tall portrait), Video stream: 640x480 (4:3)
  const proj2 = BrowserHandTracker.computeCoverProjection(390, 844, 640, 480, false);
  const center2 = proj2(0.5, 0.5);
  // Center in normalized space must land precisely at container center
  assert.equal(center2.x, 195);
  assert.equal(center2.y, 422);

  // Mirrored projection
  const projMirrored = BrowserHandTracker.computeCoverProjection(1000, 1000, 1000, 1000, true);
  const leftPoint = projMirrored(0.2, 0.5);
  assert.equal(leftPoint.x, 800, 'X coordinate must be mirrored');
});
