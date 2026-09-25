/**
 * Kai RegAI — Central Product Catalog
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Versioned, configuration-driven product definitions:
 * - Decouples commercial offerings from UI components and pricing hardcoding
 * - Multi-currency support (INR, USD, EUR, GBP)
 * - Explicit billing types and feature entitlement mapping
 */

import { PRODUCT_TIERS, BILLING_TYPES, FEATURE_KEYS, CURRENCIES } from './types.js';

export const CATALOG_VERSION = '1.0.0';

export const PRODUCT_DEFINITIONS = [
  {
    productId: 'kai_free',
    tier: PRODUCT_TIERS.FREE,
    displayName: 'Free Palm Scan',
    description: 'Basic palm detection, optical quality feedback, and rapid Quick Report overview.',
    active: true,
    billingType: BILLING_TYPES.COMPLIMENTARY,
    prices: {
      [CURRENCIES.INR]: { amount: 0, display: '₹0' },
      [CURRENCIES.USD]: { amount: 0, display: '$0' },
      [CURRENCIES.EUR]: { amount: 0, display: '€0' },
      [CURRENCIES.GBP]: { amount: 0, display: '£0' }
    },
    entitlements: [
      FEATURE_KEYS.QUICK_REPORT,
      FEATURE_KEYS.BASIC_LINES
    ],
    metadata: {
      isDefault: true,
      maxReadings: 5
    }
  },
  {
    productId: 'kai_standard',
    tier: PRODUCT_TIERS.STANDARD,
    displayName: 'Standard Hastarekha Dossier',
    description: 'Complete 5-line analysis, Chapter I & II narrative synthesis, and PDF report export.',
    active: true,
    billingType: BILLING_TYPES.ONE_TIME_PURCHASE,
    prices: {
      [CURRENCIES.INR]: { amount: 499, display: '₹499' },
      [CURRENCIES.USD]: { amount: 5.99, display: '$5.99' },
      [CURRENCIES.EUR]: { amount: 5.49, display: '€5.49' },
      [CURRENCIES.GBP]: { amount: 4.99, display: '£4.99' }
    },
    entitlements: [
      FEATURE_KEYS.QUICK_REPORT,
      FEATURE_KEYS.BASIC_LINES,
      FEATURE_KEYS.ALL_MAJOR_LINES,
      FEATURE_KEYS.DETAILED_REPORT,
      FEATURE_KEYS.CHAPTER_VOCATION,
      FEATURE_KEYS.CHAPTER_RELATIONSHIPS,
      FEATURE_KEYS.PDF_EXPORT,
      FEATURE_KEYS.CELESTIAL_MOUNTS,
      FEATURE_KEYS.THUMB_BIOMECHANICS
    ],
    metadata: {
      recommended: false,
      badge: 'Popular'
    }
  },
  {
    productId: 'kai_premium',
    tier: PRODUCT_TIERS.PREMIUM,
    displayName: 'Master Premium Synthesis',
    description: 'All 3 Chapters, sacred markings, AI reflective counsel, high-res visualizer, and social export cards.',
    active: true,
    billingType: BILLING_TYPES.ONE_TIME_PURCHASE,
    prices: {
      [CURRENCIES.INR]: { amount: 999, display: '₹999' },
      [CURRENCIES.USD]: { amount: 11.99, display: '$11.99' },
      [CURRENCIES.EUR]: { amount: 10.99, display: '€10.99' },
      [CURRENCIES.GBP]: { amount: 9.99, display: '£9.99' }
    },
    entitlements: [
      FEATURE_KEYS.QUICK_REPORT,
      FEATURE_KEYS.BASIC_LINES,
      FEATURE_KEYS.ALL_MAJOR_LINES,
      FEATURE_KEYS.DETAILED_REPORT,
      FEATURE_KEYS.PREMIUM_REPORT,
      FEATURE_KEYS.ALL_CHAPTERS,
      FEATURE_KEYS.CHAPTER_VOCATION,
      FEATURE_KEYS.CHAPTER_RELATIONSHIPS,
      FEATURE_KEYS.CHAPTER_GUIDANCE,
      FEATURE_KEYS.PDF_EXPORT,
      FEATURE_KEYS.SOCIAL_CARD,
      FEATURE_KEYS.ADVANCED_NARRATION,
      FEATURE_KEYS.FULL_HISTORY,
      FEATURE_KEYS.CELESTIAL_MOUNTS,
      FEATURE_KEYS.THUMB_BIOMECHANICS,
      FEATURE_KEYS.SACRED_MARKINGS,
      FEATURE_KEYS.HIGH_RES_VISUALIZER
    ],
    metadata: {
      recommended: true,
      badge: 'Best Value'
    }
  },
  {
    productId: 'kai_annual_pass',
    tier: PRODUCT_TIERS.PREMIUM,
    displayName: 'Kai RegAI Annual Seeker Pass',
    description: 'Unlimited readings, continuous archival preservation, and all premium features for 1 full year.',
    active: true,
    billingType: BILLING_TYPES.SUBSCRIPTION,
    prices: {
      [CURRENCIES.INR]: { amount: 2999, display: '₹2,999/yr' },
      [CURRENCIES.USD]: { amount: 34.99, display: '$34.99/yr' },
      [CURRENCIES.EUR]: { amount: 31.99, display: '€31.99/yr' },
      [CURRENCIES.GBP]: { amount: 28.99, display: '£28.99/yr' }
    },
    entitlements: [
      FEATURE_KEYS.QUICK_REPORT,
      FEATURE_KEYS.BASIC_LINES,
      FEATURE_KEYS.ALL_MAJOR_LINES,
      FEATURE_KEYS.DETAILED_REPORT,
      FEATURE_KEYS.PREMIUM_REPORT,
      FEATURE_KEYS.ALL_CHAPTERS,
      FEATURE_KEYS.CHAPTER_VOCATION,
      FEATURE_KEYS.CHAPTER_RELATIONSHIPS,
      FEATURE_KEYS.CHAPTER_GUIDANCE,
      FEATURE_KEYS.PDF_EXPORT,
      FEATURE_KEYS.SOCIAL_CARD,
      FEATURE_KEYS.ADVANCED_NARRATION,
      FEATURE_KEYS.FULL_HISTORY,
      FEATURE_KEYS.CELESTIAL_MOUNTS,
      FEATURE_KEYS.THUMB_BIOMECHANICS,
      FEATURE_KEYS.SACRED_MARKINGS,
      FEATURE_KEYS.HIGH_RES_VISUALIZER
    ],
    metadata: {
      durationMonths: 12,
      isSubscription: true
    }
  }
];

export class ProductCatalog {
  constructor(customProducts = null) {
    this.version = CATALOG_VERSION;
    this.products = new Map();
    const list = customProducts || PRODUCT_DEFINITIONS;
    for (const prod of list) {
      this.products.set(prod.productId, { ...prod });
    }
  }

  getProduct(productId) {
    return this.products.get(productId) || null;
  }

  hasProduct(productId) {
    return this.products.has(productId);
  }

  listProducts(filter = {}) {
    let prods = Array.from(this.products.values());
    if (typeof filter.active === 'boolean') {
      prods = prods.filter(p => p.active === filter.active);
    }
    if (filter.tier) {
      prods = prods.filter(p => p.tier === filter.tier);
    }
    if (filter.billingType) {
      prods = prods.filter(p => p.billingType === filter.billingType);
    }
    return prods;
  }

  getPrice(productId, currency = CURRENCIES.INR) {
    const prod = this.getProduct(productId);
    if (!prod) return null;
    return prod.prices[currency] || prod.prices[CURRENCIES.INR];
  }

  formatPrice(productId, currency = CURRENCIES.INR) {
    const price = this.getPrice(productId, currency);
    return price ? price.display : '—';
  }

  getFeaturesForProduct(productId) {
    const prod = this.getProduct(productId);
    return prod ? [...prod.entitlements] : [];
  }
}

export const defaultProductCatalog = new ProductCatalog();
