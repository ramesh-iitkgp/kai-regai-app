/**
 * Kai RegAI — Report Theme & Design Tokens
 * Phase: P10 — Report Engine
 * 
 * Centralized theme specification ensuring brand consistency across
 * Web, Print/PDF, and Social Share Cards.
 */

export const REPORT_THEME = {
  brand: {
    name: 'Kai RegAI',
    descriptor: 'PALM READING',
    tagline: 'The Story Written in Your Hands.',
    copyright: '© Kai RegAI. All rights reserved.'
  },

  colors: {
    // Backgrounds
    bgDark: '#050811',
    bgSurface: '#0A0E1A',
    bgCard: '#121829',
    bgCardHigh: '#182038',
    bgPrint: '#FFFFFF',

    // Text & Accents
    textHigh: '#F8FAFC',
    textMuted: '#94A3B8',
    textDim: '#64748B',
    textPrint: '#0F172A',
    textPrintMuted: '#475569',

    // Accents & Borders
    gold: '#FBBF24',
    goldGlow: 'rgba(251, 191, 36, 0.25)',
    goldBorder: 'rgba(251, 191, 36, 0.35)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderPrint: '#E2E8F0',

    // Major Lines (Non-negotiable semantic colors)
    lines: {
      life: '#A855F7',   // Violet
      head: '#00D2FF',   // Cyan / Blue
      heart: '#F43F5E',  // Rose
      fate: '#FBBF24',   // Gold
      sun: '#F59E0B'     // Amber
    }
  },

  typography: {
    fontDisplay: "'Cinzel', 'Playfair Display', Georgia, serif",
    fontBody: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'SF Mono', Consolas, Monaco, monospace"
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },

  radii: {
    sm: '6px',
    md: '12px',
    lg: '18px',
    xl: '24px',
    pill: '9999px'
  }
};
