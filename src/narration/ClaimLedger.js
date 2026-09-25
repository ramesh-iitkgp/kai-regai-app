/**
 * Kai RegAI — Claim Ledger & Claim Representation
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Formal ledger tracking every discrete claim made within narrative prose:
 * - Links claim text to evidence references and P8 rule interpretations
 * - Preserves epistemic tiers and confidence limits
 * - Enables strict post-generation verification
 */

export class Claim {
  constructor(data = {}) {
    this.claimId = data.claimId || `claim_${Math.random().toString(36).substring(2, 9)}`;
    this.text = data.text || '';
    this.type = data.type || 'INTERPRETIVE'; // 'OBSERVATIONAL' | 'TRADITIONAL' | 'SYNTHESIS' | 'REFLECTIVE'
    this.evidenceRefs = data.evidenceRefs || [];
    this.ruleRefs = data.ruleRefs || [];
    this.epistemicTier = data.epistemicTier ?? 4;
    this.confidence = data.confidence ?? 0.85;
    this.traditionalAttribution = data.traditionalAttribution || null;
  }
}

export class ClaimLedger {
  constructor() {
    this.claims = [];
  }

  addClaim(claimData) {
    const claim = claimData instanceof Claim ? claimData : new Claim(claimData);
    this.claims.push(claim);
    return claim;
  }

  getClaimsForEvidence(evidencePath) {
    return this.claims.filter(c => c.evidenceRefs.includes(evidencePath));
  }

  getClaimsForRule(ruleId) {
    return this.claims.filter(c => c.ruleRefs.includes(ruleId));
  }

  getAllClaims() {
    return [...this.claims];
  }

  clear() {
    this.claims = [];
  }
}
