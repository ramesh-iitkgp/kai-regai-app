/**
 * Automated Verification for Crease Line Calibrator Tool & Calibrated Registry
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CALIBRATED_CREASES,
  getActiveCalibratedCreases,
  saveCalibratedCreases,
  resetCalibratedCreases,
  pointsToSvgPath
} from '../src/knowledge/calibratedPalmCreases.js';
import { ROUTES } from '../src/navigation/routes.js';

describe('Crease Line Calibrator Tool Verification', () => {

  test('ROUTES contains CALIBRATOR route definition', () => {
    assert.equal(ROUTES.CALIBRATOR, 'calibrator');
  });

  test('DEFAULT_CALIBRATED_CREASES defines base lines and all major line variations', () => {
    assert.ok(DEFAULT_CALIBRATED_CREASES.faintLines.life);
    assert.ok(DEFAULT_CALIBRATED_CREASES.faintLines.head);
    assert.ok(DEFAULT_CALIBRATED_CREASES.faintLines.heart);
    assert.ok(DEFAULT_CALIBRATED_CREASES.faintLines.destiny);
    assert.ok(DEFAULT_CALIBRATED_CREASES.faintLines.sun);

    // Life line variations
    assert.ok(DEFAULT_CALIBRATED_CREASES.life_line.LONG_CLEAR.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.life_line.SHORT.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.life_line.WIDE_CURVE.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.life_line.CLOSE_TO_THUMB.path);

    // Heart line variations
    assert.ok(DEFAULT_CALIBRATED_CREASES.heart_line.LONG.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.heart_line.CURVED.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.heart_line.FORKED.branch1);

    // Head line variations
    assert.ok(DEFAULT_CALIBRATED_CREASES.head_line.LONG.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.head_line.SLOPING.path);

    // Destiny & Sun
    assert.ok(DEFAULT_CALIBRATED_CREASES.destiny_line.CLEAR.path);
    assert.ok(DEFAULT_CALIBRATED_CREASES.sun_line.CLEAR.path);

    // Marriage line variations
    assert.ok(DEFAULT_CALIBRATED_CREASES.marriage_line.NONE.guidePath);
    assert.ok(DEFAULT_CALIBRATED_CREASES.marriage_line.SINGLE.lines[0]);
    assert.ok(DEFAULT_CALIBRATED_CREASES.marriage_line.DOUBLE.lines[1]);
    assert.ok(DEFAULT_CALIBRATED_CREASES.marriage_line.TRIPLE.lines[2]);

    // Special Markings mounts
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.STAR.cx);
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.CROSS.cx);
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.TRIANGLE.cx);
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.SQUARE.cx);
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.ISLAND.cx);
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.FORK.cx);
    assert.ok(DEFAULT_CALIBRATED_CREASES.special_markings.CHAINED.cx);

    // Forked branches on heart & head
    assert.ok(DEFAULT_CALIBRATED_CREASES.heart_line.FORKED.branch1);
    assert.ok(DEFAULT_CALIBRATED_CREASES.heart_line.FORKED.branch2);
    assert.ok(DEFAULT_CALIBRATED_CREASES.head_line.FORKED.branch1);
    assert.ok(DEFAULT_CALIBRATED_CREASES.head_line.FORKED.branch2);
  });

  test('getActiveCalibratedCreases returns default registry when no saved data', () => {
    const active = getActiveCalibratedCreases();
    assert.ok(active.life_line.LONG_CLEAR);
    assert.equal(active.life_line.LONG_CLEAR.path, DEFAULT_CALIBRATED_CREASES.life_line.LONG_CLEAR.path);
  });

  test('pointsToSvgPath generates valid 4-point cubic SVG path strings', () => {
    const fourPts = [{ x: 10, y: 20 }, { x: 25, y: 40 }, { x: 60, y: 70 }, { x: 90, y: 110 }];
    assert.equal(pointsToSvgPath(fourPts), 'M 10 20 C 25 40 60 70 90 110');

    // Normalizing from 2 points interpolates to exactly 4 points
    const twoPts = [{ x: 10, y: 20 }, { x: 100, y: 200 }];
    const pathFrom2 = pointsToSvgPath(twoPts);
    assert.ok(pathFrom2.startsWith('M 10 20 C '));
    assert.ok(pathFrom2.endsWith(' 100 200'));
  });

});
