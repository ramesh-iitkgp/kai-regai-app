/**
 * Kai RegAI — Knowledge Codex Validator
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Statically validates rule structures, condition operators, epistemic tier assignments,
 * confidence boundaries, and ensures rule collections contain no duplicate IDs.
 */

export const VALID_OPERATORS = new Set([
  'EQUALS',
  'NOT_EQUALS',
  'IN',
  'NOT_IN',
  'EXISTS',
  'NOT_EXISTS',
  'GREATER_THAN',
  'LESS_THAN',
  'GTE',
  'LTE'
]);

export const VALID_TIERS = new Set([2, 3, 4]);

export const VALID_SOURCE_SYSTEMS = new Set([
  'WESTERN_CLASSICAL',
  'HASTA_SAMUDRIKA',
  'KAI_REGAI_SYNTHESIS'
]);

export class CodexValidator {
  /**
   * Validate a single interpretation rule
   * @param {Object} rule 
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validateRule(rule) {
    const errors = [];

    if (!rule || typeof rule !== 'object') {
      return { valid: false, errors: ['Rule must be a non-null object'] };
    }

    if (!rule.ruleId || typeof rule.ruleId !== 'string') {
      errors.push('Rule must have a non-empty string "ruleId"');
    }

    if (!VALID_TIERS.has(rule.epistemicTier)) {
      errors.push(`Rule ${rule.ruleId || 'unknown'}: Invalid epistemicTier (${rule.epistemicTier}). Must be 2, 3, or 4`);
    }

    if (!VALID_SOURCE_SYSTEMS.has(rule.sourceSystem)) {
      errors.push(`Rule ${rule.ruleId || 'unknown'}: Invalid sourceSystem (${rule.sourceSystem})`);
    }

    if (!rule.domain || typeof rule.domain !== 'string') {
      errors.push(`Rule ${rule.ruleId || 'unknown'}: Missing domain`);
    }

    // Validate conditions
    if (!rule.conditions || typeof rule.conditions !== 'object') {
      errors.push(`Rule ${rule.ruleId || 'unknown'}: Must have a "conditions" object`);
    } else {
      const conditionTypes = ['all_of', 'any_of', 'none_of'];
      let hasAnyGroup = false;

      for (const ct of conditionTypes) {
        if (rule.conditions[ct]) {
          hasAnyGroup = true;
          if (!Array.isArray(rule.conditions[ct])) {
            errors.push(`Rule ${rule.ruleId}: conditions.${ct} must be an array`);
          } else {
            for (let i = 0; i < rule.conditions[ct].length; i++) {
              const cond = rule.conditions[ct][i];
              if (!cond.feature || typeof cond.feature !== 'string') {
                errors.push(`Rule ${rule.ruleId}: conditions.${ct}[${i}] missing string "feature"`);
              }
              if (!cond.operator || !VALID_OPERATORS.has(cond.operator)) {
                errors.push(`Rule ${rule.ruleId}: conditions.${ct}[${i}] invalid operator "${cond.operator}"`);
              }
            }
          }
        }
      }

      if (!hasAnyGroup) {
        errors.push(`Rule ${rule.ruleId}: conditions must contain at least one of [all_of, any_of, none_of]`);
      }
    }

    // Validate interpretation payload
    if (!rule.interpretation || typeof rule.interpretation !== 'object') {
      errors.push(`Rule ${rule.ruleId || 'unknown'}: Must contain an "interpretation" object`);
    } else {
      if (!rule.interpretation.title) {
        errors.push(`Rule ${rule.ruleId}: interpretation missing "title"`);
      }
      if (!rule.interpretation.synthesis && !rule.interpretation.detail) {
        errors.push(`Rule ${rule.ruleId}: interpretation missing "synthesis" or "detail" text`);
      }
    }

    // Validate confidence
    if (rule.confidence !== undefined) {
      if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 1) {
        errors.push(`Rule ${rule.ruleId}: confidence must be a number between 0 and 1`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a collection of rules for consistency and uniqueness
   * @param {Object[]} rules 
   * @returns {{ valid: boolean, errors: string[], ruleCount: number }}
   */
  static validateRuleCollection(rules) {
    const errors = [];
    const seenIds = new Set();

    if (!Array.isArray(rules)) {
      return { valid: false, errors: ['Rules must be provided as an array'], ruleCount: 0 };
    }

    for (const rule of rules) {
      const res = this.validateRule(rule);
      if (!res.valid) {
        errors.push(...res.errors);
      }

      if (rule && rule.ruleId) {
        if (seenIds.has(rule.ruleId)) {
          errors.push(`Duplicate ruleId detected: "${rule.ruleId}"`);
        }
        seenIds.add(rule.ruleId);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      ruleCount: rules.length
    };
  }
}
