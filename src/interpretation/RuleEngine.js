/**
 * Kai RegAI — Rule Matching Engine
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Deterministically evaluates normalized feature contexts against declarative rules.
 * Zero random selection, zero LLM guesswork, zero dependence on object iteration order.
 */

export class RuleEngine {
  /**
   * Evaluate a single condition against the normalized feature context
   * @param {Object} condition 
   * @param {Object} context 
   * @returns {{ satisfied: boolean, actualValue: *, expectedValue: * }}
   */
  static evaluateCondition(condition, context) {
    const { feature, operator, value } = condition;
    const actualValue = context[feature];

    let satisfied = false;

    switch (operator) {
      case 'EQUALS':
        satisfied = actualValue === value;
        break;

      case 'NOT_EQUALS':
        satisfied = actualValue !== value;
        break;

      case 'IN':
        if (Array.isArray(value)) {
          if (Array.isArray(actualValue)) {
            // Check if any element of actualValue is in expected value list
            satisfied = actualValue.some(v => value.includes(v));
          } else {
            satisfied = value.includes(actualValue);
          }
        }
        break;

      case 'NOT_IN':
        if (Array.isArray(value)) {
          if (Array.isArray(actualValue)) {
            satisfied = !actualValue.some(v => value.includes(v));
          } else {
            satisfied = !value.includes(actualValue);
          }
        }
        break;

      case 'EXISTS':
        satisfied = actualValue !== undefined && actualValue !== null;
        break;

      case 'NOT_EXISTS':
        satisfied = actualValue === undefined || actualValue === null;
        break;

      case 'GREATER_THAN':
        satisfied = typeof actualValue === 'number' && actualValue > value;
        break;

      case 'LESS_THAN':
        satisfied = typeof actualValue === 'number' && actualValue < value;
        break;

      case 'GTE':
        satisfied = typeof actualValue === 'number' && actualValue >= value;
        break;

      case 'LTE':
        satisfied = typeof actualValue === 'number' && actualValue <= value;
        break;

      default:
        console.warn(`[RuleEngine] Unsupported operator: ${operator}`);
        satisfied = false;
        break;
    }

    return {
      satisfied,
      feature,
      operator,
      actualValue,
      expectedValue: value
    };
  }

  /**
   * Evaluate a rule against the context
   * @param {Object} rule 
   * @param {Object} context 
   * @returns {{ matched: boolean, rule: Object, evidence: Object[] }}
   */
  static evaluateRule(rule, context) {
    const { conditions } = rule;
    const evidence = [];

    // 1. Evaluate all_of (AND)
    if (conditions.all_of && Array.isArray(conditions.all_of)) {
      for (const cond of conditions.all_of) {
        const result = this.evaluateCondition(cond, context);
        evidence.push(result);
        if (!result.satisfied) {
          return { matched: false, rule, evidence };
        }
      }
    }

    // 2. Evaluate any_of (OR)
    if (conditions.any_of && Array.isArray(conditions.any_of)) {
      let anySatisfied = false;
      const anyEvidence = [];
      for (const cond of conditions.any_of) {
        const result = this.evaluateCondition(cond, context);
        anyEvidence.push(result);
        if (result.satisfied) {
          anySatisfied = true;
        }
      }
      evidence.push(...anyEvidence);
      if (!anySatisfied) {
        return { matched: false, rule, evidence };
      }
    }

    // 3. Evaluate none_of (NOR)
    if (conditions.none_of && Array.isArray(conditions.none_of)) {
      for (const cond of conditions.none_of) {
        const result = this.evaluateCondition(cond, context);
        evidence.push(result);
        if (result.satisfied) {
          return { matched: false, rule, evidence };
        }
      }
    }

    return {
      matched: true,
      rule,
      evidence: evidence.filter(e => e.satisfied)
    };
  }

  /**
   * Evaluate a full catalog of rules deterministically
   * @param {Object[]} rules 
   * @param {Object} context 
   * @returns {Object[]} List of matched rule results sorted by ruleId
   */
  static evaluateAll(rules, context) {
    const matched = [];

    for (const rule of rules) {
      const evaluation = this.evaluateRule(rule, context);
      if (evaluation.matched) {
        matched.push(evaluation);
      }
    }

    // Sort deterministically by ruleId to ensure consistent output ordering
    matched.sort((a, b) => a.rule.ruleId.localeCompare(b.rule.ruleId));

    return matched;
  }
}
