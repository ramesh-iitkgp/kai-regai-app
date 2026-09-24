# Kai RegAI — Screen Inventory & Screen Count Control

## 1. Screen Count Control Principle

To prevent cognitive fragmentation, routing overhead, and maintenance complexity, Kai RegAI adheres to a strict **State Consolidation Principle**:

> **Rule**: Never create separate navigation routes or whole pages for temporary feedback or error conditions.
> * **One Camera Screen** handles hand positioning, distance warnings, quality gates, and scan sweeps via dynamic internal overlay states.
> * **One Questionnaire Screen** encapsulates all 5 interactive modules through an animated wizard container.
> * **One Report Screen** handles loading, chapter presentation, and export modals.

---

## 2. Master Screen Inventory Catalog

The complete Kai RegAI application consists of exactly **18 consolidated screens**:

| Screen ID | Screen Name | Route Stack | Presentation Type | Primary Role & States Consolidated |
|---|---|---|---|---|
| `SCR-ONB-001` | Splash & Genesis | `OnboardingStack` | Fullscreen | App cold-launch brand animation, asset hydration check. |
| `SCR-ONB-002` | Value Prop & Modes | `OnboardingStack` | Fullscreen | Core differentiation: Hand Scanner (~10s) vs Palm Reading. |
| `SCR-ONB-003` | Camera Permission Primer | `OnboardingStack` | Fullscreen Modal | Contextual rationale for camera access; privacy pledge. |
| `SCR-HOM-001` | Home Hub | `HomeStack` | Bottom Tab Root | Dual-mode launcher cards, daily contemplation, recent scan snippet. |
| `SCR-SCN-001` | Scanner Viewfinder & HUD | `HandScannerStack` | Fullscreen Modal | **Consolidates 15 camera states**: positioning, distance warnings, quality green-ring, 10s progressive line glow sweep. |
| `SCR-SCN-002` | Quick Report Card | `HandScannerStack` | Fullscreen Modal | 3D interactive palm card, 3 key traits, CTA to Deep Reading. |
| `SCR-PLM-001` | Hand Context Selector | `PalmReadingStack` | Fullscreen Modal | Dominant vs Passive hand selection and reading focus choice. |
| `SCR-PLM-002` | Baseline Capture Screen | `PalmReadingStack` | Fullscreen Modal | High-resolution anatomical capture; lighting/glare check. |
| `SCR-PLM-003` | Guided Questionnaire | `PalmReadingStack` | Fullscreen Modal | **Consolidates all 5 modules**: Tactile pad, Thumb arc, Phalanx gauge, Finger comparator, Sacred glyph carousel. |
| `SCR-PLM-004` | Synthesis Transition | `PalmReadingStack` | Fullscreen Modal | Choreographed rule-matching animation; chapter assembly HUD. |
| `SCR-PLM-005` | Detailed Palm Dossier | `PalmReadingStack` | Fullscreen Modal | Multi-chapter reading viewer, line maps, reflective advice. |
| `SCR-RDG-001` | Readings Archive List | `ReadingsStack` | Bottom Tab Root | Chronological timeline of scans; empty state; filter by hand. |
| `SCR-RDG-002` | Hand Comparator View | `ReadingsStack` | Child Stack | Bilateral comparison (Left Hand innate vs Right Hand active). |
| `SCR-LRN-001` | Learn Library Index | `LearnStack` | Bottom Tab Root | Categories: Major Lines, Minor Lines, Mounts, Traditions. |
| `SCR-LRN-002` | Learn Topic Detail | `LearnStack` | Child Stack | Rich educational article with annotated palm illustrations. |
| `SCR-PRF-001` | Profile & Preferences | `ProfileStack` | Bottom Tab Root | Account settings, dominant hand preference, notifications. |
| `SCR-PRF-002` | Privacy & Data Controls | `ProfileStack` | Child Stack | Biometric privacy disclosure; 1-tap palm data wipe. |
| `SCR-PRF-003` | Subscription & Upgrades | `ProfileStack` | Child Stack | Freemium vs Premium comparison; Restore Purchases. |
| `SCR-PRF-004` | Legal Terms & Ethics | `ProfileStack` | Child Stack | Disclaimer: Entertainment & self-reflection; zero medical claims. |

---

## 3. Dynamic State vs. Screen Count Summary

By consolidating transient states within unified screen containers, Kai RegAI reduces total application screen routes from an unwieldy 45+ to a clean **18 production screens**:

```
Traditional Naive Flow (45+ screens):
  [Camera] ──> [No Hand Screen] ──> [Too Dark Screen] ──> [Too Far Screen] ──> [Scan Screen] ...

Kai RegAI Consolidated Model (1 Screen, Dynamic States):
  [SCR-SCN-001 Viewfinder]
      ├── State: CAMERA_SEARCHING
      ├── State: WARNING_HAND_TOO_FAR
      ├── State: WARNING_LOW_LIGHT
      ├── State: QUALITY_SATISFIED_READY
      ├── State: SCANNING_BEAM_ACTIVE
      └── State: ANALYSIS_PROGRESSIVE_GLOWS
```
