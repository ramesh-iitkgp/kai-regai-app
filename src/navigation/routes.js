/**
 * Kai RegAI — Route Constants & Deep Link URI Mappings
 * Source of truth: docs/p2/NAVIGATION_ARCHITECTURE.md
 */

export const ROUTES = {
  SPLASH: 'splash',
  HOME: 'home',
  SCANNER: 'scanner',
  QUICK_REPORT: 'quick-report',
  GUIDED_READING: 'guided-reading',
  QUESTIONNAIRE: 'questionnaire',
  DETAILED_REPORT: 'detailed-report',
  READINGS: 'readings',
  LEARN: 'learn',
  PROFILE: 'profile',
  OFFLINE: 'offline'
};

export const DEEP_LINKS = {
  'kairegai://scanner': ROUTES.SCANNER,
  'kairegai://reading': ROUTES.GUIDED_READING,
  'kairegai://readings': ROUTES.READINGS,
  'kairegai://learn': ROUTES.LEARN
};
