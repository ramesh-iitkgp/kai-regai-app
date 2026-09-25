/**
 * Kai RegAI — P8 Interpretation & Rule Engine Automated Tests
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CODEX_MANIFEST,
  CodexValidator,
  MASTER_RULE_REGISTRY
} from '../../src/knowledge/index.js';

import {
  FeatureNormalizer,
  RuleEngine,
  EvidenceCollector,
  ConfidenceEngine,
  CONFIDENCE_BANDS,
  ConflictResolver,
  EpistemicGate,
  InterpretationDossier,
  interpret
} from '../../src/interpretation/index.js';

import { PalmFeatureModel } from '../../src/models/PalmFeatureModel.js';
import { GOLDEN_INTERPRETATION_CASES } from './golden/goldenCases.js';

describe('P8.1 Knowledge Codex & Rule Schema Validation', () => {
  it('validates the entire master rule registry without structural defects', () => {
    const report = CodexValidator.validateRuleCollection(MASTER_RULE_REGISTRY);
    assert.equal(report.valid, true, `Validation errors: ${report.errors.join('; ')}`);
    assert.ok(report.ruleCount >= 15, `Expected at least 15 rules, found ${report.ruleCount}`);
  });

  it('rejects malformed rules or invalid operators', () => {
    const invalidRule = {
      ruleId: 'INVALID_01',
      sourceSystem: 'UNKNOWN_SYSTEM',
      epistemicTier: 99,
      domain: 'TEST',
      conditions: {
        all_of: [{ feature: 'test', operator: 'INVALID_OP', value: 1 }]
      },
      interpretation: {}
    };

    const res = CodexValidator.validateRule(invalidRule);
    assert.equal(res.valid, false);
    assert.ok(res.errors.length > 0);
  });

  it('detects duplicate rule IDs in a collection', () => {
    const dupes = [
      MASTER_RULE_REGISTRY[0],
      { ...MASTER_RULE_REGISTRY[0] }
    ];
    const report = CodexValidator.validateRuleCollection(dupes);
    assert.equal(report.valid, false);
    assert.ok(report.errors.some(e => e.includes('Duplicate ruleId')));
  });

  it('verifies Codex Manifest metadata', () => {
    assert.equal(CODEX_MANIFEST.id, 'KAI_REGAI_CODEX');
    assert.equal(CODEX_MANIFEST.version, '1.0.0');
    assert.ok(CODEX_MANIFEST.sources.length >= 3);
  });
});

describe('P8.2 Feature Normalization', () => {
  it('flattens PalmFeatureModel into dot-path lookup context', () => {
    const model = new PalmFeatureModel({
      session_id: 'test-session',
      hand: { side: 'LEFT', elemental_shape: 'EARTH', firmness: 'FIRM_SOLID' },
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', confidence: 0.95 },
        head_line: { detected: true, status: 'DETECTED', slope: 'GENTLE_SLOPE', confidence: 0.92 }
      },
      provenance: { mode: 'MODE_1_SCANNER', reading_method: 'CAMERA_SCAN' }
    });

    const context = FeatureNormalizer.normalize(model);

    assert.equal(context['hand.side'], 'LEFT');
    assert.equal(context['hand.elemental_shape'], 'EARTH');
    assert.equal(context['lines.life_line.detected'], true);
    assert.equal(context['lines.life_line.curvature'], 'WIDE_ARC');
    assert.equal(context['lines.life_line.confidence'], 0.95);
    assert.equal(context['provenance.mode'], 'MODE_1_SCANNER');
  });

  it('handles missing or unobserved features gracefully without null crashes', () => {
    const model = new PalmFeatureModel({});
    const context = FeatureNormalizer.normalize(model);

    assert.ok(context['lines.fate_line.status']);
    assert.ok(context['hand.elemental_shape']);
  });
});

describe('P8.3 Rule Engine Operator Evaluation & Determinism', () => {
  it('correctly evaluates all comparison operators', () => {
    const testContext = {
      'test.str': 'HELLO',
      'test.num': 42,
      'test.arr': ['A', 'B'],
      'test.missing': undefined
    };

    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.str', operator: 'EQUALS', value: 'HELLO' }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.str', operator: 'NOT_EQUALS', value: 'WORLD' }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.str', operator: 'IN', value: ['HELLO', 'WORLD'] }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.str', operator: 'NOT_IN', value: ['FOO', 'BAR'] }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.num', operator: 'GREATER_THAN', value: 40 }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.num', operator: 'LESS_THAN', value: 50 }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.num', operator: 'GTE', value: 42 }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.num', operator: 'LTE', value: 42 }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.str', operator: 'EXISTS', value: true }, testContext).satisfied, true);
    assert.equal(RuleEngine.evaluateCondition({ feature: 'test.missing', operator: 'NOT_EXISTS', value: true }, testContext).satisfied, true);
  });

  it('evaluates all_of, any_of, and none_of compound conditions', () => {
    const ruleAnd = {
      conditions: {
        all_of: [
          { feature: 'a', operator: 'EQUALS', value: 1 },
          { feature: 'b', operator: 'EQUALS', value: 2 }
        ]
      }
    };
    assert.equal(RuleEngine.evaluateRule(ruleAnd, { a: 1, b: 2 }).matched, true);
    assert.equal(RuleEngine.evaluateRule(ruleAnd, { a: 1, b: 3 }).matched, false);

    const ruleOr = {
      conditions: {
        any_of: [
          { feature: 'a', operator: 'EQUALS', value: 1 },
          { feature: 'b', operator: 'EQUALS', value: 2 }
        ]
      }
    };
    assert.equal(RuleEngine.evaluateRule(ruleOr, { a: 1, b: 99 }).matched, true);
    assert.equal(RuleEngine.evaluateRule(ruleOr, { a: 99, b: 99 }).matched, false);
  });

  it('guarantees deterministic rule matching ordering by ruleId', () => {
    const context = {
      'lines.life_line.detected': true,
      'lines.life_line.curvature': 'WIDE_ARC'
    };

    const res1 = RuleEngine.evaluateAll(MASTER_RULE_REGISTRY, context);
    const res2 = RuleEngine.evaluateAll(MASTER_RULE_REGISTRY, context);

    assert.equal(res1.length, res2.length);
    for (let i = 0; i < res1.length; i++) {
      assert.equal(res1[i].rule.ruleId, res2[i].rule.ruleId);
    }
  });
});

describe('P8.4 Evidence Collection & Confidence Propagation', () => {
  it('binds matched rules to input feature evidence', () => {
    const model = new PalmFeatureModel({
      major_lines: {
        life_line: { detected: true, status: 'DETECTED', curvature: 'WIDE_ARC', confidence: 0.95 }
      }
    });

    const context = FeatureNormalizer.normalize(model);
    const matched = RuleEngine.evaluateAll(MASTER_RULE_REGISTRY, context);
    const evidence = EvidenceCollector.collect(matched, context);

    assert.ok(evidence.length > 0);
    const item = evidence[0];
    assert.ok(item.ruleId);
    assert.ok(item.sourceSystem);
    assert.ok(item.explanationTrail.includes('Rule'));
    assert.ok(Array.isArray(item.features));
  });

  it('propagates confidence and computes epistemic confidence bands', () => {
    const highRecord = {
      ruleBaseConfidence: 0.95,
      features: [{ confidence: 0.95 }, { confidence: 0.92 }]
    };
    const highResult = ConfidenceEngine.calculate(highRecord);
    assert.equal(highResult.band, CONFIDENCE_BANDS.HIGH);
    assert.ok(highResult.score >= 0.88);

    const lowRecord = {
      ruleBaseConfidence: 0.70,
      features: [{ confidence: 0.55 }]
    };
    const lowResult = ConfidenceEngine.calculate(lowRecord);
    assert.equal(lowResult.band, CONFIDENCE_BANDS.LOW);
    assert.ok(lowResult.score < 0.70);
  });
});

describe('P8.5 Conflict Resolution & Epistemic Safety Gates', () => {
  it('identifies multi-source agreements between Western Classical and Hasta Samudrika', () => {
    const mockEvidence = [
      { domain: 'LIFE_LINE', sourceSystem: 'WESTERN_CLASSICAL', ruleId: 'R1' },
      { domain: 'LIFE_LINE', sourceSystem: 'HASTA_SAMUDRIKA', ruleId: 'R2' }
    ];

    const { multiSourceAgreements } = ConflictResolver.reconcile(mockEvidence);
    assert.equal(multiSourceAgreements.length, 1);
    assert.equal(multiSourceAgreements[0].domain, 'LIFE_LINE');
    assert.deepEqual(multiSourceAgreements[0].sources, ['Western Classical', 'Hasta Samudrika']);
  });

  it('rejects fatalistic and deterministic phrasing', () => {
    const badTexts = [
      'You will die at age 52.',
      'A short life line indicates early death at 40.',
      'A doomed fate line predicts inevitable divorce.',
      'You have guaranteed wealth that you cannot avoid.'
    ];

    for (const text of badTexts) {
      const res = EpistemicGate.auditText(text);
      assert.equal(res.safe, false, `Failed to flag forbidden fatalistic phrase in: "${text}"`);
    }
  });

  it('rejects medical diagnosis and pathology claims', () => {
    const medicalTexts = [
      'This line indicates cardiovascular heart attack risk.',
      'You have clinical diagnosis of neurological disease.',
      'This island marks tumor or organ failure.'
    ];

    for (const text of medicalTexts) {
      const res = EpistemicGate.auditText(text);
      assert.equal(res.safe, false, `Failed to flag medical diagnosis claim in: "${text}"`);
    }
  });

  it('passes properly qualified reflective interpretations', () => {
    const cleanText = 'Traditional palmistry associates this wide arc with constitutional vitality and steady physical endurance.';
    const res = EpistemicGate.auditText(cleanText);
    assert.equal(res.safe, true);
  });
});

describe('P8.6 Golden Interpretation Corpus (12 Deterministic Profiles)', () => {
  for (const goldenCase of GOLDEN_INTERPRETATION_CASES) {
    it(`evaluates ${goldenCase.id}: ${goldenCase.name}`, () => {
      const dossier = interpret(goldenCase.input);

      assert.ok(dossier instanceof InterpretationDossier);
      assert.equal(dossier.major_lines.length, 5);

      // Verify safety
      const serialized = JSON.stringify(dossier).toLowerCase();
      assert.ok(!serialized.includes('will die'));
      assert.ok(!serialized.includes('cancer'));
      assert.ok(!serialized.includes('divorce'));

      // Case-specific checks
      if (goldenCase.expected.lifeLineStatus) {
        const life = dossier.major_lines.find(l => l.name.includes('Life'));
        assert.equal(life.status, goldenCase.expected.lifeLineStatus);
      }

      if (goldenCase.expected.headLineStatus) {
        const head = dossier.major_lines.find(l => l.name.includes('Head'));
        assert.equal(head.status, goldenCase.expected.headLineStatus);
      }

      if (goldenCase.expected.confidenceBand) {
        assert.equal(dossier.confidence_band, goldenCase.expected.confidenceBand);
      }

      if (goldenCase.expected.mode) {
        assert.equal(dossier.mode, goldenCase.expected.mode);
      }

      if (goldenCase.expected.hasMultiSourceAgreement) {
        assert.ok(dossier.multi_source_agreements.length > 0);
      }

      // Explainability API check
      const explanation = dossier.getExplanation('LIFE_LINE');
      assert.ok(Array.isArray(explanation));
    });
  }

  it('guarantees complete determinism across repeated executions of identical inputs', () => {
    const input = GOLDEN_INTERPRETATION_CASES[0].input;

    const run1 = interpret(input).toJSON();
    const run2 = interpret(input).toJSON();

    // Mask dynamic timestamps and IDs
    delete run1.id;
    delete run1.timestamp;
    delete run2.id;
    delete run2.timestamp;

    assert.deepEqual(run1, run2);
  });
});
