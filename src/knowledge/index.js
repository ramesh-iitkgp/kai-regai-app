/**
 * Kai RegAI — Knowledge Codex Barrel Export & Master Rule Registry
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 */

import { CODEX_MANIFEST } from './codex/CodexManifest.js';
import { CodexValidator } from './codex/CodexValidator.js';

import { westernLifeLineRules } from './rules/western/lifeLineRules.js';
import { westernHeadLineRules } from './rules/western/headLineRules.js';
import { westernHeartLineRules } from './rules/western/heartLineRules.js';
import { westernFateLineRules, westernSunLineRules, westernThumbRules } from './rules/western/fateLineRules.js';

import { samudrikaAyurRekhaRules } from './rules/hastaSamudrika/ayurRekhaRules.js';
import { samudrikaMatruRekhaRules, samudrikaPitriRekhaRules } from './rules/hastaSamudrika/matruRekhaRules.js';
import { samudrikaKarmaRekhaRules, samudrikaSuryaRekhaRules, samudrikaMarkingRules } from './rules/hastaSamudrika/karmaRekhaRules.js';

import { synthesisConstitutionalRules, synthesisVocationRules, synthesisCrossLineRules } from './rules/synthesis/constitutionalRules.js';

export { CODEX_MANIFEST } from './codex/CodexManifest.js';
export { CodexValidator } from './codex/CodexValidator.js';

/**
 * Master catalog of all registered declarative interpretation rules
 */
export const MASTER_RULE_REGISTRY = [
  ...westernLifeLineRules,
  ...westernHeadLineRules,
  ...westernHeartLineRules,
  ...westernFateLineRules,
  ...westernSunLineRules,
  ...westernThumbRules,

  ...samudrikaAyurRekhaRules,
  ...samudrikaMatruRekhaRules,
  ...samudrikaPitriRekhaRules,
  ...samudrikaKarmaRekhaRules,
  ...samudrikaSuryaRekhaRules,
  ...samudrikaMarkingRules,

  ...synthesisConstitutionalRules,
  ...synthesisVocationRules,
  ...synthesisCrossLineRules
];

/**
 * Validate entire codex on module ingestion
 */
const validation = CodexValidator.validateRuleCollection(MASTER_RULE_REGISTRY);
if (!validation.valid) {
  console.error('[KnowledgeCodex] Codex validation errors detected:', validation.errors);
}
