/**
 * Kai RegAI — P7 Palm Reading Questionnaire Engine Automated Tests
 * Phase: P7 — Palm Reading Questionnaire Engine (Mode 2)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  QUESTION_CATEGORIES,
  OBSERVATION_STATES,
  QUESTIONNAIRE_SCHEMA,
  QUESTION_TYPES
} from '../../src/questionnaire/QuestionnaireSchema.js';

import {
  QUESTIONNAIRE_STATES,
  QuestionnaireStateMachine
} from '../../src/questionnaire/QuestionnaireStateMachine.js';

import {
  QuestionnaireEngine
} from '../../src/questionnaire/QuestionnaireEngine.js';

import {
  QuestionnaireFeatureAdapter
} from '../../src/questionnaire/QuestionnaireFeatureAdapter.js';

import {
  PalmInterpretationEngine
} from '../../src/services/PalmInterpretationEngine.js';

import { PalmFeatureModel } from '../../src/models/PalmFeatureModel.js';

describe('P7.1 Questionnaire State Machine', () => {
  it('initializes in INITIALIZING state with empty context', () => {
    const sm = new QuestionnaireStateMachine();
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.INITIALIZING);
    assert.equal(sm.getContext().activeQuestionIndex, 0);
  });

  it('validates linear state progression: INITIALIZING -> INTRO -> IN_PROGRESS -> REVIEW -> SUBMITTING -> COMPLETE', () => {
    const sm = new QuestionnaireStateMachine();
    assert.equal(sm.transition(QUESTIONNAIRE_STATES.INTRO), true);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.INTRO);

    assert.equal(sm.transition(QUESTIONNAIRE_STATES.IN_PROGRESS), true);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.IN_PROGRESS);

    assert.equal(sm.transition(QUESTIONNAIRE_STATES.REVIEW), true);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.REVIEW);

    assert.equal(sm.transition(QUESTIONNAIRE_STATES.SUBMITTING), true);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.SUBMITTING);

    assert.equal(sm.transition(QUESTIONNAIRE_STATES.COMPLETE), true);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.COMPLETE);
  });

  it('allows backward jump from REVIEW to IN_PROGRESS for editing an observation', () => {
    const sm = new QuestionnaireStateMachine(QUESTIONNAIRE_STATES.REVIEW);
    assert.equal(sm.transition(QUESTIONNAIRE_STATES.IN_PROGRESS), true);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.IN_PROGRESS);
  });

  it('rejects invalid or out-of-order transitions', () => {
    const sm = new QuestionnaireStateMachine(QUESTIONNAIRE_STATES.INITIALIZING);
    assert.equal(sm.canTransitionTo(QUESTIONNAIRE_STATES.COMPLETE), false);
    assert.equal(sm.transition(QUESTIONNAIRE_STATES.COMPLETE), false);
    assert.equal(sm.getState(), QUESTIONNAIRE_STATES.INITIALIZING);
  });

  it('notifies subscribers on state changes', () => {
    const sm = new QuestionnaireStateMachine();
    let notifiedState = null;
    sm.subscribe((state) => {
      notifiedState = state;
    });

    sm.transition(QUESTIONNAIRE_STATES.INTRO);
    assert.equal(notifiedState, QUESTIONNAIRE_STATES.INTRO);
  });
});

describe('P7.2 Questionnaire Engine & Branching Logic', () => {
  it('starts at first question and advances progressively', () => {
    const engine = new QuestionnaireEngine();
    engine.start();

    assert.equal(engine.getState(), QUESTIONNAIRE_STATES.IN_PROGRESS);
    assert.equal(engine.currentActiveIndex, 0);

    const firstQ = engine.getCurrentQuestion();
    assert.ok(firstQ);
    assert.equal(firstQ.id, 'hand_side');

    // Trying to advance without answer fails for required question
    assert.equal(engine.next(), false);

    // Answering allows advancing
    engine.setAnswer(firstQ.id, 'RIGHT');
    assert.equal(engine.next(), true);
    assert.equal(engine.currentActiveIndex, 1);
    assert.equal(engine.getCurrentQuestion().id, 'palm_shape');
  });

  it('handles conditional branching: skips Fate Line morphology if Fate Line is NOT_VISIBLE', () => {
    const engine = new QuestionnaireEngine();
    engine.start();

    // Set Fate Line to NOT_VISIBLE
    engine.setAnswer('fate_line_visibility', 'NOT_VISIBLE');

    const activeQuestions = engine.getActiveQuestions();
    const activeIds = activeQuestions.map(q => q.id);

    // Verify detailed morphology question is omitted
    assert.ok(activeIds.includes('fate_line_visibility'));
    assert.ok(!activeIds.includes('fate_line_origin'));
  });

  it('includes Fate Line morphology questions when Fate Line is CLEAR or PARTIAL', () => {
    const engine = new QuestionnaireEngine();
    engine.start();

    engine.setAnswer('fate_line_visibility', 'CLEAR');
    let activeIds = engine.getActiveQuestions().map(q => q.id);
    assert.ok(activeIds.includes('fate_line_origin'));

    engine.setAnswer('fate_line_visibility', 'PARTIAL');
    activeIds = engine.getActiveQuestions().map(q => q.id);
    assert.ok(activeIds.includes('fate_line_origin'));
  });

  it('immediately prunes stale answers if parent visibility changes from CLEAR to NOT_VISIBLE', () => {
    const engine = new QuestionnaireEngine();
    engine.start();

    // User initially observed Life line and answered morphology
    engine.setAnswer('life_line_visibility', 'CLEAR');
    engine.setAnswer('life_line_continuity', 'CONTINUOUS');
    engine.setAnswer('life_line_curvature', 'WIDE_ARC');

    assert.equal(engine.getAnswer('life_line_continuity'), 'CONTINUOUS');
    assert.equal(engine.getAnswer('life_line_curvature'), 'WIDE_ARC');

    // User revises opinion to NOT_VISIBLE
    engine.setAnswer('life_line_visibility', 'NOT_VISIBLE');

    // Stale child answers MUST be purged immediately
    assert.equal(engine.getAnswer('life_line_continuity'), null);
    assert.equal(engine.getAnswer('life_line_curvature'), null);
  });

  it('supports direct jump to question via goToQuestion() from review', () => {
    const engine = new QuestionnaireEngine();
    engine.start();

    // Advance to review
    engine.stateMachine.transition(QUESTIONNAIRE_STATES.REVIEW);
    assert.equal(engine.getState(), QUESTIONNAIRE_STATES.REVIEW);

    // Jump to palm_firmness
    const success = engine.goToQuestion('palm_firmness');
    assert.equal(success, true);
    assert.equal(engine.getState(), QUESTIONNAIRE_STATES.IN_PROGRESS);
    assert.equal(engine.getCurrentQuestion().id, 'palm_firmness');
  });

  it('compiles clean review summary with display labels', () => {
    const engine = new QuestionnaireEngine({
      initialAnswers: {
        hand_side: 'RIGHT',
        palm_shape: 'EARTH',
        palm_firmness: 'FIRM_SOLID',
        life_line_visibility: 'CLEAR'
      }
    });

    const summary = engine.getReviewSummary();
    assert.ok(Array.isArray(summary));
    assert.ok(summary.length > 0);

    const palmShapeItem = summary.find(s => s.id === 'palm_shape');
    assert.ok(palmShapeItem);
    assert.equal(palmShapeItem.value, 'EARTH');
    assert.equal(palmShapeItem.displayValue, 'Square Palm with Balanced/Shorter Fingers');
    assert.equal(palmShapeItem.answered, true);
  });

  it('handles multi-select special markings toggle properly', () => {
    const engine = new QuestionnaireEngine();
    engine.start();

    // Toggle TRISHULA_TRIDENT
    engine.setAnswer('special_markings_confirmed', 'TRISHULA_TRIDENT');
    let marks = engine.getAnswer('special_markings_confirmed');
    assert.deepEqual(marks, ['TRISHULA_TRIDENT']);

    // Toggle FISH_YAV
    engine.setAnswer('special_markings_confirmed', 'FISH_YAV');
    marks = engine.getAnswer('special_markings_confirmed');
    assert.deepEqual(marks, ['TRISHULA_TRIDENT', 'FISH_YAV']);

    // Selecting NONE_OBSERVED replaces other markings
    engine.setAnswer('special_markings_confirmed', 'NONE_OBSERVED');
    marks = engine.getAnswer('special_markings_confirmed');
    assert.deepEqual(marks, ['NONE_OBSERVED']);
  });
});

describe('P7.3 Canonical Feature Adapter & Conflict Resolution', () => {
  it('converts questionnaire responses into valid PalmFeatureModel instance', () => {
    const answers = {
      hand_side: 'RIGHT',
      palm_shape: 'FIRE',
      palm_firmness: 'ELASTIC_RESILIENT',
      life_line_visibility: 'CLEAR',
      life_line_curvature: 'WIDE_ARC',
      head_line_visibility: 'CLEAR',
      head_line_direction: 'GENTLE_SLOPE',
      heart_line_visibility: 'PARTIAL',
      fate_line_visibility: 'NOT_VISIBLE',
      sun_line_visibility: 'CLEAR',
      sun_line_prominence: 'FAINT_TRACE',
      thumb_flexibility: 'SUPPLE_BACKWARD',
      thumb_phalanx_ratio: 'DOMINANT_WILL',
      special_markings_confirmed: ['TRISHULA_TRIDENT']
    };

    const model = QuestionnaireFeatureAdapter.toPalmFeatureModel(answers, 'test-session-123');

    assert.ok(model instanceof PalmFeatureModel);
    assert.equal(model.session_id, 'test-session-123');
    assert.equal(model.provenance.mode, 'MODE_2_QUESTIONNAIRE');
    assert.equal(model.provenance.reading_method, 'GUIDED_QUESTIONNAIRE');

    // Lines
    assert.equal(model.major_lines.life_line.detected, true);
    assert.equal(model.major_lines.life_line.status, 'DETECTED');
    assert.equal(model.major_lines.life_line.semantic_color, '#A855F7');

    assert.equal(model.major_lines.heart_line.detected, true);
    assert.equal(model.major_lines.heart_line.status, 'PARTIAL');

    assert.equal(model.major_lines.fate_line.detected, false);
    assert.equal(model.major_lines.fate_line.status, 'NOT_DETECTED');

    // Thumb & markings
    assert.equal(model.thumb.flexibility_angle, 50);
    assert.equal(model.special_markings.length, 1);
    assert.equal(model.special_markings[0].type, 'TRISHULA_TRIDENT');
  });

  it('reconciles CV baseline and questionnaire deterministically without silent overwrite', () => {
    // Mock CV baseline where fate line was missed
    const cvModel = new PalmFeatureModel({
      session_id: 'cv-test-1',
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', polyline: [[10, 10], [20, 20]], semantic_color: '#A855F7' },
        fate_line: { detected: false, status: 'NOT_DETECTED', polyline: [], semantic_color: '#FBBF24' }
      },
      hand: { firmness: 'SUPPLE' }
    });

    // User confirmed observing fate line via guided observation
    const questModel = new PalmFeatureModel({
      session_id: 'quest-test-1',
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', semantic_color: '#A855F7' },
        fate_line: { detected: true, status: 'DETECTED', continuity: 'STRONG_CENTRAL', semantic_color: '#FBBF24' }
      },
      hand: { firmness: 'FIRM_SOLID' },
      thumb: { flexibility_angle: 30 }
    });

    const reconciled = QuestionnaireFeatureAdapter.reconcile(cvModel, questModel);

    assert.equal(reconciled.provenance.mode, 'HYBRID_FUSION');
    assert.equal(reconciled.hand.firmness, 'FIRM_SOLID');
    assert.equal(reconciled.major_lines.life_line.polyline.length, 2); // Retained CV coordinates
    assert.equal(reconciled.major_lines.fate_line.detected, true); // Enriched by questionnaire
    assert.equal(reconciled.major_lines.fate_line.status, 'PARTIAL');
    assert.ok(reconciled.major_lines.fate_line.conflict_note.includes('Crease confirmed via guided tactile observation'));
  });
});

describe('P7.4 Unified Interpretation Engine & Epistemic Constraints', () => {
  it('synthesizes reading dossier across the 4 epistemic tiers for Mode 2', () => {
    const answers = {
      hand_side: 'RIGHT',
      palm_shape: 'EARTH',
      palm_firmness: 'FIRM_SOLID',
      life_line_visibility: 'CLEAR',
      life_line_curvature: 'WIDE_ARC',
      head_line_visibility: 'CLEAR',
      head_line_direction: 'GENTLE_SLOPE',
      heart_line_visibility: 'CLEAR',
      fate_line_visibility: 'CLEAR',
      sun_line_visibility: 'CLEAR',
      thumb_flexibility: 'BALANCED_ARC',
      special_markings_confirmed: ['SOLOMON_RING']
    };

    const model = QuestionnaireFeatureAdapter.toPalmFeatureModel(answers);
    const dossier = PalmInterpretationEngine.synthesize(model);

    assert.ok(dossier.id.startsWith('RDG-'));
    assert.equal(dossier.mode, 'MODE_2_GUIDED');
    assert.equal(dossier.reading_method, 'GUIDED_QUESTIONNAIRE');
    assert.equal(dossier.reading_method_label, 'Guided Palm Reading');

    // 5 Major Lines
    assert.equal(dossier.major_lines.length, 5);
    for (const line of dossier.major_lines) {
      assert.ok(line.name);
      assert.ok(line.color);
      assert.ok(line.status);
      assert.ok(line.observation);
      assert.ok(line.traditional_interpretation);
      assert.ok(line.synthesis);
    }

    // Synthesis chapters
    assert.ok(dossier.synthesis_chapters.constitution);
    assert.ok(dossier.synthesis_chapters.vocation);
    assert.ok(dossier.synthesis_chapters.guidance);

    // Features block for detailed report tabs
    assert.ok(dossier.features);
    assert.ok(Array.isArray(dossier.features.mounts));
    assert.ok(dossier.features.thumb);
    assert.ok(Array.isArray(dossier.features.markings));
  });

  it('strictly adheres to zero-fatalism and zero-medical-diagnosis laws', () => {
    const answers = {
      life_line_visibility: 'NOT_VISIBLE',
      head_line_visibility: 'PARTIAL',
      heart_line_visibility: 'NOT_VISIBLE',
      fate_line_visibility: 'NOT_VISIBLE',
      sun_line_visibility: 'NOT_VISIBLE'
    };

    const model = QuestionnaireFeatureAdapter.toPalmFeatureModel(answers);
    const dossier = PalmInterpretationEngine.synthesize(model);
    const serialized = JSON.stringify(dossier).toLowerCase();

    // Forbidden fatalistic phrases
    const forbiddenPhrases = [
      'will die',
      'death at',
      'short life',
      'fatal',
      'divorce',
      'cancer',
      'disease',
      'illness diagnosis',
      'predestined wealth',
      'unlucky'
    ];

    for (const phrase of forbiddenPhrases) {
      assert.ok(
        !serialized.includes(phrase),
        `Dossier contains prohibited fatalistic/medical phrase: "${phrase}"`
      );
    }
  });

  it('treats NOT_VISIBLE honestly as unobserved rather than biological absence', () => {
    const answers = {
      life_line_visibility: 'NOT_VISIBLE'
    };

    const model = QuestionnaireFeatureAdapter.toPalmFeatureModel(answers);
    const dossier = PalmInterpretationEngine.synthesize(model);
    const lifeLine = dossier.major_lines[0];

    assert.equal(lifeLine.status, 'NOT_DETECTED');
    assert.ok(lifeLine.observation.includes('No clear crease noted curving around the thumb base'));
    assert.ok(lifeLine.traditional_interpretation.includes('vitality rather than a deterministic lifespan clock'));
  });
});
