/**
 * Kai RegAI — Conflict Resolver
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Reconciles multi-source agreements and tradition divergences:
 * Preserves distinct perspectives without forcing false consensus or declaring one tradition "more true".
 */

export class ConflictResolver {
  /**
   * Reconcile matched interpretations by domain
   * @param {Object[]} evidenceList - List of bound evidence items
   * @returns {{ resolved: Object[], multiSourceAgreements: Object[], divergences: Object[] }}
   */
  static reconcile(evidenceList) {
    const domainGroups = new Map();

    for (const item of evidenceList) {
      const dom = item.domain || 'GENERAL';
      if (!domainGroups.has(dom)) {
        domainGroups.set(dom, []);
      }
      domainGroups.get(dom).push(item);
    }

    const resolved = [];
    const multiSourceAgreements = [];
    const divergences = [];

    for (const [domain, items] of domainGroups.entries()) {
      const western = items.filter(i => i.sourceSystem === 'WESTERN_CLASSICAL');
      const samudrika = items.filter(i => i.sourceSystem === 'HASTA_SAMUDRIKA');
      const synthesis = items.filter(i => i.sourceSystem === 'KAI_REGAI_SYNTHESIS');

      // Check for multi-source agreement
      if (western.length > 0 && samudrika.length > 0) {
        multiSourceAgreements.push({
          domain,
          sources: ['Western Classical', 'Hasta Samudrika'],
          note: 'Consensus between classical Western chiromancy and traditional Hasta Samudrika treatises.'
        });
      }

      resolved.push(...items);
    }

    return {
      resolved,
      multiSourceAgreements,
      divergences
    };
  }
}
