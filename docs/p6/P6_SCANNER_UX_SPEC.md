# Kai RegAI — P6 Scanner UX Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P6 — Hand Scanner Experience  
**Status:** COMPLETE & FROZEN  

---

## 1. Scanner Aesthetic & Principles

The Kai RegAI scanner experience is designed to feel:
- **Calm & Premium**: Sacred Vedic geometry combined with sleek, high-precision telemetry.
- **Epistemically Honest**: No fake certainty, no pseudo-scientific claims, and no bio-hallucinations.
- **Mobile-First**: High touch-target sizes (>= 48px), safe-area padding for notches and gesture bars, single-handed operation.
- **Accessible**: Non-color-only state indicators (glyphs, dash patterns, text labels).

---

## 2. Dynamic Viewfinder Guidance & Reticle States

The reticle frame provides visual feedback based on the scanner state machine:

| Scanner State | Reticle Color | Pill Badge | Visual Behavior |
|---|---|---|---|
| `SEARCHING_FOR_HAND` | Gold (`rgba(228,194,118,0.4)`) | "Align your palm with the guide" | Gentle pulsing reticle corners |
| `HAND_DETECTED` | Cyan (`rgba(0,210,255,0.7)`) | "Hand detected. Aligning palm…" | Glow intensifies on alignment corners |
| `PALM_ALIGNING` | Gold / Amber | Dynamic action guidance | Highlights necessary adjustment |
| `STABILIZING` | Cyan / Green | "Hold steady…" | 3-step stability progress bar fills |
| `READY` | Emerald (`rgba(16,185,129,0.9)`) | "Palm aligned. Ready to capture!" | Full solid emerald glow lock |
| `COUNTDOWN` | Emerald Glow | Shutter countdown number (2.. 1..) | Large central countdown numeral |
| `CAPTURING` | Pure White | Shutter flash | Full-screen white flash opacity transition |
| `PROCESSING` | Cosmic Violet | "Analyzing visible palm creases…" | Progress spinner with contextual copy |
| `RETAKE` | Rose (`rgba(244,63,94,0.8)`) | Actionable correction | Modal sheet explaining single issue |

---

## 3. Epistemic Line Presentation in Quick Report

When displaying detected crease geometry, Kai RegAI adheres to strict epistemic honesty:

| Crease State | User-Facing Badge | Observational Copy |
|---|---|---|
| `DETECTED` | **Detected** (Tertiary) | Evidence-backed physical observation of the furrow curvature and continuity. |
| `PARTIAL` | **Partial** (Secondary) | Faint or fragmented crease traces observed with explicit detection confidence. |
| `OUT_OF_FRAME` | **Out of Frame** (Primary) | "Crease trajectory lies near or outside the captured optical sensor boundary. Not biologically absent." |
| `NOT_DETECTED` | **Not Clearly Visible** (Primary) | "Not clearly discerned in this scan under current illumination and crease angle." |

Never does the system tell a user "You do not have a Fate Line" when the line lies outside the captured sensor frame.
