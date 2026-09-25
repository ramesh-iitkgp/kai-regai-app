import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import jpeg from 'jpeg-js';
import { PalmVisionEngine } from '../../src/cv/index.js';
import { Evaluator } from '../../src/cv/dataset/Evaluator.js';

test('P5.1 Temporal Stability — measures line jitter and confidence variance across frames', async () => {
  const engine = new PalmVisionEngine();
  const testImgPath = path.resolve('cv/real-validation/raw/real_palm_01.jpg');
  const rawBuf = fs.readFileSync(testImgPath);
  const baseImg = jpeg.decode(rawBuf, { useTArray: true });

  // Generate 5 sequential frames with micro-jitter (simulating handheld micro-movements +- 2px)
  const sequenceFrames = [];
  const numFrames = 5;

  for (let f = 0; f < numFrames; f++) {
    const jitterX = Math.round((Math.sin(f) * 2));
    const jitterY = Math.round((Math.cos(f) * 2));

    const frameData = new Uint8ClampedArray(baseImg.data.length);
    const w = baseImg.width;
    const h = baseImg.height;

    for (let y = 0; y < h; y++) {
      const srcY = Math.max(0, Math.min(h - 1, y + jitterY));
      for (let x = 0; x < w; x++) {
        const srcX = Math.max(0, Math.min(w - 1, x + jitterX));
        const dstIdx = (y * w + x) * 4;
        const srcIdx = (srcY * w + srcX) * 4;
        frameData[dstIdx] = baseImg.data[srcIdx];
        frameData[dstIdx + 1] = baseImg.data[srcIdx + 1];
        frameData[dstIdx + 2] = baseImg.data[srcIdx + 2];
        frameData[dstIdx + 3] = baseImg.data[srcIdx + 3];
      }
    }
    sequenceFrames.push({ width: w, height: h, data: frameData });
  }

  // Analyze sequential frames
  const frameResults = [];
  const latencies = [];

  for (const frame of sequenceFrames) {
    const t0 = performance.now();
    const res = await engine.analyze(frame, { handednessHint: 'RIGHT' });
    latencies.push(performance.now() - t0);
    frameResults.push(res);
  }

  // 1. Cadence & Latency Verification
  const meanLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  assert.ok(meanLatency < 200, `Mean frame processing latency too high: ${meanLatency}ms`);

  // 2. Presence/Absence Stability (Must be identical across all frames)
  for (let i = 1; i < frameResults.length; i++) {
    const prev = frameResults[i - 1].lines;
    const curr = frameResults[i].lines;

    assert.equal(curr.life.status, prev.life.status, 'Life line status unstable between frames');
    assert.equal(curr.head.status, prev.head.status, 'Head line status unstable between frames');
    assert.equal(curr.fate.status, prev.fate.status, 'Fate line status unstable between frames');
    assert.equal(curr.sun.status, prev.sun.status, 'Sun line status unstable between frames');
  }

  // 3. Polyline Displacement Jitter
  const lifeDisplacements = [];
  const headDisplacements = [];

  for (let i = 1; i < frameResults.length; i++) {
    const prevLife = frameResults[i - 1].lines.life;
    const currLife = frameResults[i].lines.life;

    if (prevLife.polyline.length > 0 && currLife.polyline.length > 0) {
      const geom = Evaluator.evaluateLineGeometry(currLife, prevLife.polyline);
      lifeDisplacements.push(geom.meanPointToCurveDist);
    }
  }

  const meanLifeJitter = lifeDisplacements.reduce((a, b) => a + b, 0) / (lifeDisplacements.length || 1);
  assert.ok(meanLifeJitter < 0.05, `Life line inter-frame jitter exceeds tolerance: ${meanLifeJitter}`);

  // 4. Confidence Variance
  const confidences = frameResults.map(r => r.lines.life.confidence);
  const meanConf = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const varianceConf = confidences.reduce((acc, c) => acc + Math.pow(c - meanConf, 2), 0) / confidences.length;
  const stdConf = Math.sqrt(varianceConf);

  assert.ok(stdConf < 0.05, `Confidence variation across frames exceeds tolerance: ${stdConf}`);
});
