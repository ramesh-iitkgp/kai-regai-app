# Kai RegAI — Stitch / App Alchemy UI Design Handoff Specification

## 1. Handoff Purpose & Designer Contract

This document forms the binding specification for **Phase P3 (Stitch UI Design)**. Visual designers and Stitch generation prompts must adhere strictly to these screen boundaries, design tokens, and functional states.

```
+─────────────────────────────────────────────────────────────────────────────+
|                         STITCH DESIGN MANDATE (P3)                          |
|                                                                             |
|  1. Brand Wordmark: "Kai RegAI" ── The final "AI" in "RegAI" must receive  |
|     a distinct luminous cyan/violet gradient or typographic treatment.      |
|                                                                             |
|  2. Line Illumination Tokens:                                               |
|     • Life Line  ──> Violet (#A855F7)                                       |
|     • Head Line  ──> Blue (#00D2FF)                                         |
|     • Heart Line ──> Rose (#F43F5E)                                         |
|     • Fate Line  ──> Gold (#FBBF24)                                         |
|     • Sun Line   ──> Amber (#F59E0B)                                        |
|                                                                             |
|  3. Visual Mood: Ethereal obsidian-black void, deep indigo-tinted cards,    |
|     refined antique gold typography, warm ivory body text, glassmorphism.   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Design System Tokens for Stitch

```css
:root {
  /* Surfaces & Backgrounds */
  --color-bg-void: #0A0A12;
  --color-bg-surface-elevated: #141424;
  --color-bg-surface-glass: rgba(26, 26, 46, 0.72);
  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-highlight: rgba(168, 85, 247, 0.35);

  /* Brand Accents */
  --color-accent-gold: #F59E0B;
  --color-accent-ai-cyan: #00D2FF;
  --color-accent-ai-gradient: linear-gradient(135deg, #00D2FF 0%, #A855F7 100%);

  /* Typography */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --font-display: 'Cinzel Decorative', 'Outfit', serif;
  --font-body: 'Plus Jakarta Sans', 'Inter', sans-serif;

  /* Standardized Palm Lines */
  --color-line-life: #A855F7;
  --color-line-head: #00D2FF;
  --color-line-heart: #F43F5E;
  --color-line-fate: #FBBF24;
  --color-line-sun: #F59E0B;
}
```

---

## 3. Screen Handoff Matrix (All 18 Screens)

| Screen ID | Screen Name | Key UI Elements for P3 Mockup | Critical Interaction States to Design |
|---|---|---|---|
| `SCR-ONB-001` | Splash & Genesis | Glowing brand wordmark with distinct "AI" badge; ethereal background particle field. | Cold boot crossfade animation. |
| `SCR-ONB-002` | Value Prop & Modes | Side-by-side mode cards: Fast Scanner vs Guided Reading. | Card tap active state; smooth slide transition. |
| `SCR-ONB-003` | Camera Permission Primer | Frosted glass illustration card; privacy pledge icon; primary CTA. | Pressed button state. |
| `SCR-HOM-001` | Home Hub Screen | Header with user greeting; Hand Scanner hero card; Palm Reading hero card; Recent reading card; Daily reflection card; Bottom navigation bar. | Default state; empty state (first time). |
| `SCR-SCN-001` | Scanner Viewfinder & HUD | Fullscreen camera feed; holographic hand outline; quality halo ring; laser sweep overlay; 5 colored line traces; bottom controls. | Searching state; Distance alert; Quality Green state; 10s Progressive Sweep state. |
| `SCR-SCN-002` | Quick Report Card | 3D interactive card with illuminated palm scan; 3 trait badges; daily reflective prompt; primary CTA *"Explore Full Reading"*; share icon. | Card reveal flip; tilt perspective state; share sheet. |
| `SCR-PLM-001` | Hand Context Selector | Twin hand silhouettes (Dominant vs Passive); inquiry focus selector pills. | Selected hand toggle state. |
| `SCR-PLM-002` | Baseline Capture Viewfinder | Anatomical alignment brackets; capture shutter button; lighting meter. | Ready state; frame capture flash. |
| `SCR-PLM-003` | Guided Questionnaire | Top progress bar; 5 interactive widgets: (1) 3D silicone pad, (2) Radial thumb arc, (3) Balance scale, (4) Split-screen finger slider, (5) Glyphs carousel. | Active touch manipulation states for all 5 widgets. |
| `SCR-PLM-004` | Synthesis Transition | Sacred geometric mandala / particle constellation; dynamic status text pill. | Continuous rotating particle loop. |
| `SCR-PLM-005` | Detailed Palm Dossier | Cover chapter; sticky chapter pills tab bar; rich editorial narrative body; line highlight maps; tradition notes accordion; export PDF button. | Default reading state; expanded tradition note modal. |
| `SCR-RDG-001` | Readings Archive List | Chronological reading timeline cards with hand indicator badges; filter toggle; *"Compare Hands"* button. | Default list state; empty state illustration. |
| `SCR-RDG-002` | Hand Comparator View | Side-by-side split comparison of Left (Innate) vs Right (Active) palm models; divergence callout cards. | Interactive slider reveal between hands. |
| `SCR-LRN-001` | Learn Library Index | Category cards: Major Lines, Minor Lines, Mounts, Vedic vs Western traditions. | Grid layout; search bar. |
| `SCR-LRN-002` | Learn Topic Detail | Rich illustrated article with interactive SVG palm diagram; historical citations. | Tap line to highlight text. |
| `SCR-PRF-001` | Profile & Preferences | User avatar; dominant hand preference switch; reading preferences. | Form toggle states. |
| `SCR-PRF-002` | Privacy & Data Controls | Biometric disclosures; 1-tap *"Erase All Palm Data"* red alert button. | Confirmation warning modal. |
| `SCR-PRF-003` | Subscription & Upgrades | Premium feature comparison list; pricing cards; Restore Purchases link. | Active subscription tier indicator. |
| `SCR-PRF-004` | Legal Terms & Ethics | Clean typography scroll view of terms, ethics guidelines, and entertainment disclaimers. | Text scroll. |
