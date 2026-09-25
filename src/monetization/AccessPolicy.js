/**
 * Kai RegAI — Access Policy Decision Engine
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Central authoritative access evaluation:
 * - Eliminates scattered ad-hoc `if (isPremium)` checks
 * - Evaluates owner identity, reading scope, active entitlements, and expiration
 * - Emits clear non-boolean decisions: ALLOW, DENY, PENDING, REQUIRES_PURCHASE, REQUIRES_VERIFICATION
 * - Generates clean commercial preview models from canonical P10 reports without mutating them
 */

import { ACCESS_DECISION, FEATURE_KEYS, PRODUCT_TIERS, TIER_RANKS, ENTITLEMENT_STATUS } from './types.js';
import { defaultProductCatalog } from './ProductCatalog.js';

export const FEATURE_TIER_REQUIREMENTS = {
  [FEATURE_KEYS.QUICK_REPORT]: PRODUCT_TIERS.FREE,
  [FEATURE_KEYS.BASIC_LINES]: PRODUCT_TIERS.FREE,
  [FEATURE_KEYS.ALL_MAJOR_LINES]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.DETAILED_REPORT]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.CHAPTER_VOCATION]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.CHAPTER_RELATIONSHIPS]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.CHAPTER_GUIDANCE]: PRODUCT_TIERS.PREMIUM,
  [FEATURE_KEYS.ALL_CHAPTERS]: PRODUCT_TIERS.PREMIUM,
  [FEATURE_KEYS.PDF_EXPORT]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.SOCIAL_CARD]: PRODUCT_TIERS.PREMIUM,
  [FEATURE_KEYS.ADVANCED_NARRATION]: PRODUCT_TIERS.PREMIUM,
  [FEATURE_KEYS.FULL_HISTORY]: PRODUCT_TIERS.PREMIUM,
  [FEATURE_KEYS.CELESTIAL_MOUNTS]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.THUMB_BIOMECHANICS]: PRODUCT_TIERS.STANDARD,
  [FEATURE_KEYS.SACRED_MARKINGS]: PRODUCT_TIERS.PREMIUM,
  [FEATURE_KEYS.HIGH_RES_VISUALIZER]: PRODUCT_TIERS.PREMIUM
};

export class AccessPolicy {
  constructor(catalog = defaultProductCatalog) {
    this.catalog = catalog;
  }

  /**
   * Authoritatively evaluate whether an actor can access a specific feature
   * @param {Object} context
   * @param {string} context.featureKey - One of FEATURE_KEYS
   * @param {string} [context.ownerId] - User or Guest ID
   * @param {string} [context.readingId] - Targeted reading ID
   * @param {import('./EntitlementSchema.js').Entitlement[]} [context.entitlements=[]]
   * @param {Date|string} [context.asOfTime] - Evaluation timestamp
   * @returns {{ decision: string, reason: string, requiredTier: string, entitlement: import('./EntitlementSchema.js').Entitlement|null }}
   */
  evaluate({ featureKey, ownerId, readingId, entitlements = [], asOfTime = new Date() }) {
    const requiredTier = FEATURE_TIER_REQUIREMENTS[featureKey] || PRODUCT_TIERS.PREMIUM;

    // Free features are accessible by default to everyone
    if (requiredTier === PRODUCT_TIERS.FREE) {
      return {
        decision: ACCESS_DECISION.ALLOW,
        reason: 'Feature is available in the Free tier',
        requiredTier,
        entitlement: null
      };
    }

    // Filter entitlements matching owner and reading scope
    const candidateEntitlements = entitlements.filter(e => {
      // Must belong to the same owner
      if (ownerId && e.ownerId !== ownerId) return false;

      // Reading scope: either account-wide (readingId === null) or specifically matched to this reading
      if (readingId && e.readingId !== null && e.readingId !== readingId) {
        return false;
      }

      return true;
    });

    // Check if any matching entitlement is pending
    const hasPending = candidateEntitlements.some(e => e.status === ENTITLEMENT_STATUS.PENDING);

    // Find active valid entitlements granting this feature or tier
    const activeMatch = candidateEntitlements.find(e => {
      if (!e.isActive(asOfTime)) return false;

      // Check direct feature grant
      if (Array.isArray(e.features) && e.features.includes(featureKey)) {
        return true;
      }

      // Check tier hierarchy grant
      const eRank = TIER_RANKS[e.tier] ?? 0;
      const reqRank = TIER_RANKS[requiredTier] ?? 99;
      return eRank >= reqRank;
    });

    if (activeMatch) {
      return {
        decision: ACCESS_DECISION.ALLOW,
        reason: `Access granted via active ${activeMatch.tier} entitlement (${activeMatch.entitlementId})`,
        requiredTier,
        entitlement: activeMatch
      };
    }

    if (hasPending) {
      return {
        decision: ACCESS_DECISION.PENDING,
        reason: 'Purchase is pending verification',
        requiredTier,
        entitlement: null
      };
    }

    // Check if any candidate was expired
    const hasExpired = candidateEntitlements.some(e => e.isExpired(asOfTime));
    if (hasExpired) {
      return {
        decision: ACCESS_DECISION.REQUIRES_PURCHASE,
        reason: 'Previous entitlement has expired. Please renew or purchase access.',
        requiredTier,
        entitlement: null
      };
    }

    return {
      decision: ACCESS_DECISION.REQUIRES_PURCHASE,
      reason: `Feature '${featureKey}' requires ${requiredTier} access`,
      requiredTier,
      entitlement: null
    };
  }

  /**
   * Fast boolean helper
   */
  canAccess(context) {
    const res = this.evaluate(context);
    return res.decision === ACCESS_DECISION.ALLOW;
  }

  /**
   * Generate an access-filtered presentation view model of a canonical ReportModel
   * Does NOT alter the underlying report model.
   * @param {import('../report/ReportSchema.js').ReportModel} report
   * @param {Object} context
   * @returns {Object} Gated report presentation view model
   */
  filterReport(report, context = {}) {
    const { ownerId, entitlements = [], asOfTime = new Date() } = context;
    const readingId = report.reportId;

    const hasDetailed = this.canAccess({
      featureKey: FEATURE_KEYS.DETAILED_REPORT,
      ownerId,
      readingId,
      entitlements,
      asOfTime
    });

    const hasPremium = this.canAccess({
      featureKey: FEATURE_KEYS.PREMIUM_REPORT,
      ownerId,
      readingId,
      entitlements,
      asOfTime
    });

    const hasPdf = this.canAccess({
      featureKey: FEATURE_KEYS.PDF_EXPORT,
      ownerId,
      readingId,
      entitlements,
      asOfTime
    });

    const hasSocial = this.canAccess({
      featureKey: FEATURE_KEYS.SOCIAL_CARD,
      ownerId,
      readingId,
      entitlements,
      asOfTime
    });

    const hasAllChapters = this.canAccess({
      featureKey: FEATURE_KEYS.ALL_CHAPTERS,
      ownerId,
      readingId,
      entitlements,
      asOfTime
    });

    // Determine highest unlocked tier
    let currentTier = PRODUCT_TIERS.FREE;
    if (hasPremium) {
      currentTier = PRODUCT_TIERS.PREMIUM;
    } else if (hasDetailed) {
      currentTier = PRODUCT_TIERS.STANDARD;
    }

    // Build gated sections view
    const sections = (report.sections || []).map((sec, index) => {
      // First section (Overview / Constitution) is always accessible
      if (index === 0) {
        return { ...sec, isLocked: false };
      }

      // Middle section (Chapter I Vocation) requires Standard or Premium
      if (index === 1 && (hasDetailed || hasPremium || hasAllChapters)) {
        return { ...sec, isLocked: false };
      }

      // Final / Deepest sections (Relationships, Guidance, Reflection) require Premium
      if (index >= 2 && (hasPremium || hasAllChapters)) {
        return { ...sec, isLocked: false };
      }

      // Locked preview representation
      return {
        id: sec.id,
        title: sec.title,
        isLocked: true,
        previewTeaser: sec.narrative ? sec.narrative.substring(0, 120) + '...' : 'Locked chapter synthesis...',
        requiredTier: index === 1 ? PRODUCT_TIERS.STANDARD : PRODUCT_TIERS.PREMIUM,
        unlockPrompt: `Unlock ${sec.title} with ${index === 1 ? 'Standard' : 'Premium'} access.`
      };
    });

    return {
      reportId: report.reportId,
      tier: currentTier,
      isFullyUnlocked: hasPremium,
      summary: report.summary,
      palmVisualization: report.palmVisualization,
      sections,
      capabilities: {
        canExportPdf: hasPdf,
        canExportSocial: hasSocial,
        canViewAllLines: hasDetailed || hasPremium,
        canViewSacredMarkings: hasPremium
      },
      upsellBanner: currentTier !== PRODUCT_TIERS.PREMIUM ? {
        title: currentTier === PRODUCT_TIERS.FREE ? 'Unlock Complete Hastarekha Dossier' : 'Upgrade to Master Premium Synthesis',
        recommendedProductId: currentTier === PRODUCT_TIERS.FREE ? 'kai_premium' : 'kai_premium',
        badge: 'Recommended'
      } : null
    };
  }
}

export const defaultAccessPolicy = new AccessPolicy();
