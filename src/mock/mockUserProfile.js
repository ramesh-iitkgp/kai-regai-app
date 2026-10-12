/**
 * Mock Data Layer — User Profile & Preferences
 * Source of truth: docs/p2/PRIVACY_UX_SPEC.md & docs/p2/SCREEN_SPECIFICATIONS.md
 */

export const mockUserProfile = {
  user_id: 'USR-MAYA-2026',
  display_name: 'Maya',
  avatar_url: '/assets/brand/default_avatar.svg',
  tier: 'PREMIUM_SEEKER',
  dominant_hand: 'RIGHT',
  reading_preferences: {
    tradition_bias: 'DUAL_SYNTHESIS', // VEDIC_FIRST | WESTERN_FIRST | DUAL_SYNTHESIS
    epistemic_depth: 'PHILOSOPHICAL', // DIRECT | PHILOSOPHICAL | SCHOLARLY
    notifications_enabled: true,
    daily_reflection_prompt: true
  },
  privacy_settings: {
    store_palm_images: false, // Strict privacy policy: RAM-only processing
    biometric_consent_date: '2026-09-20T10:00:00Z',
    cloud_sync_feature_models: true
  },
  reading_stats: {
    total_scans: 6,
    guided_dossiers: 2,
    favorite_tradition: 'Hasta Samudrika'
  }
};
