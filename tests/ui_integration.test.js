/**
 * Automated Test Suite — UI Architecture, Canonical Contracts & State Verification
 * Runner: Node.js native test runner (`node --test`)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { PalmFeatureModel } from '../src/models/PalmFeatureModel.js';
import { ReadingSession, SessionStatus, ReadingMode } from '../src/models/ReadingSession.js';
import { ROUTES, DEEP_LINKS } from '../src/navigation/routes.js';
import { mockReadings } from '../src/mock/mockReadings.js';
import { mockCodex } from '../src/mock/mockCodex.js';
import { mockUserProfile } from '../src/mock/mockUserProfile.js';
import { scannerTimelineSteps } from '../src/mock/mockScannerStates.js';
import { questionnaireModules } from '../src/components/QuestionnaireWidget.js';

describe('1. Canonical Data Models Verification', () => {
  test('PalmFeatureModel instantiates with mandatory major lines and approved semantic colors', () => {
    const model = new PalmFeatureModel();

    assert.equal(model.schema_version, '2.0.0');
    assert.ok(model.major_lines.life_line.detected);
    assert.equal(model.major_lines.life_line.semantic_color, '#A855F7', 'Life Line must be Violet (#A855F7)');
    assert.equal(model.major_lines.head_line.semantic_color, '#00D2FF', 'Head Line must be Blue (#00D2FF)');
    assert.equal(model.major_lines.heart_line.semantic_color, '#F43F5E', 'Heart Line must be Rose (#F43F5E)');
    assert.equal(model.major_lines.fate_line.semantic_color, '#FBBF24', 'Fate Line must be Gold (#FBBF24)');
    assert.equal(model.major_lines.sun_line.semantic_color, '#F59E0B', 'Sun Line must be Amber (#F59E0B)');
    assert.ok(model.quality_score >= 0.85);
  });

  test('ReadingSession lifecycle state transitions execute correctly', () => {
    const session = new ReadingSession({ mode: ReadingMode.MODE_1_SCANNER });
    assert.equal(session.status, SessionStatus.INITIALIZING);

    session.transitionTo(SessionStatus.VIEWFINDER_ACTIVE);
    assert.equal(session.status, SessionStatus.VIEWFINDER_ACTIVE);

    session.setQuality(0.96);
    assert.equal(session.quality_score, 0.96);
    assert.equal(session.palm_feature_model.quality_score, 0.96);

    session.transitionTo(SessionStatus.COMPLETED);
    assert.equal(session.status, SessionStatus.COMPLETED);
  });
});

describe('2. Navigation Architecture & Routes Verification', () => {
  test('All primary P2 routes exist and are defined', () => {
    assert.equal(ROUTES.HOME, 'home');
    assert.equal(ROUTES.SCANNER, 'scanner');
    assert.equal(ROUTES.QUICK_REPORT, 'quick-report');
    assert.equal(ROUTES.GUIDED_READING, 'guided-reading');
    assert.equal(ROUTES.QUESTIONNAIRE, 'questionnaire');
    assert.equal(ROUTES.DETAILED_REPORT, 'detailed-report');
    assert.equal(ROUTES.READINGS, 'readings');
    assert.equal(ROUTES.LEARN, 'learn');
    assert.equal(ROUTES.PROFILE, 'profile');
  });

  test('Deep links map to canonical internal routes', () => {
    assert.equal(DEEP_LINKS['kairegai://scanner'], ROUTES.SCANNER);
    assert.equal(DEEP_LINKS['kairegai://reading'], ROUTES.GUIDED_READING);
    assert.equal(DEEP_LINKS['kairegai://readings'], ROUTES.READINGS);
    assert.equal(DEEP_LINKS['kairegai://learn'], ROUTES.LEARN);
  });
});

describe('3. Epistemic Language & Report Quality Gates', () => {
  test('Mock reading dossiers enforce the 4 epistemic layers', () => {
    assert.ok(mockReadings.length >= 2, 'Must provide readings for both Mode 1 and Mode 2');

    const mode2 = mockReadings.find(r => r.mode === 'MODE_2_GUIDED');
    assert.ok(mode2, 'Mode 2 reading dossier must exist');

    mode2.major_lines.forEach(line => {
      assert.ok(line.observation, `${line.name} must have a physical observation`);
      assert.ok(line.traditional_interpretation, `${line.name} must have traditional attribution`);
      assert.ok(line.synthesis, `${line.name} must have Kai RegAI synthesis`);

      // Verify no fatalistic or medical diagnostic keywords exist
      const combined = `${line.observation} ${line.traditional_interpretation} ${line.synthesis}`.toLowerCase();
      assert.ok(!combined.includes('disease'), 'No medical claims permitted');
      assert.ok(!combined.includes('cancer'), 'No medical claims permitted');
      assert.ok(!combined.includes('exact death'), 'No fatalistic claims permitted');
    });
  });
});

describe('4. Scanner & Questionnaire Engine Specifications', () => {
  test('10-second scanner choreography contains 6 timed progressive milestones', () => {
    assert.equal(scannerTimelineSteps.length, 6);
    assert.equal(scannerTimelineSteps[0].progress, 15);
    assert.equal(scannerTimelineSteps[5].progress, 100);
  });

  test('Questionnaire contains all 5 approved tactile and visual modules', () => {
    assert.equal(questionnaireModules.length, 5);
    const moduleIds = questionnaireModules.map(m => m.id);
    assert.ok(moduleIds.includes('thumb_flexibility'));
    assert.ok(moduleIds.includes('palm_firmness'));
    assert.ok(moduleIds.includes('thumb_phalanx'));
    assert.ok(moduleIds.includes('finger_spacing'));
    assert.ok(moduleIds.includes('special_markings'));
  });
});

describe('5. Knowledge Codex Library & User Settings', () => {
  test('Hastarekha Codex articles contain literature citations', () => {
    assert.ok(mockCodex.articles.length >= 5);
    mockCodex.articles.forEach(art => {
      assert.ok(art.historical_note, `Article ${art.id} must retain citation provenance`);
      assert.ok(art.tradition, `Article ${art.id} must declare tradition lineage`);
    });
  });

  test('User Profile specifies RAM-only biometric privacy by default', () => {
    assert.equal(mockUserProfile.privacy_settings.store_palm_images, false, 'Default privacy policy must be zero persistent photo storage');
  });
});
