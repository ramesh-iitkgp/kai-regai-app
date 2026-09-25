# P16 UX Architecture & Experience Hierarchy

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P16 — Production UX, Reading Experience & Conversion  

---

## 1. Information Architecture & Navigation

The Kai RegAI experience is organized around a consolidated mobile-first navigation model preserving the 18 canonical screens specified in Phase P2.

```
                           ┌────────────────────────┐
                           │      Home Screen       │
                           │  (Primary Discovery)   │
                           └───────────┬────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌───────────────────────┐                    ┌───────────────────────┐
     │  Mode 1: Hand Scanner │                    │ Mode 2: Palm Reading  │
     │ (~10s Camera Scan)    │                    │ (Interactive Deep Dive)│
     └──────────┬────────────┘                    └───────────┬───────────┘
                │                                             │
                │ Real-time CV Extraction                     │ 5 Multi-Modal Modules
                │ Progressive Reveal (10s)                    │ + CV Baseline Synthesis
                ▼                                             ▼
     ┌───────────────────────┐                    ┌───────────────────────┐
     │  Quick Report Screen  │                    │ Detailed Report Screen│
     │  (Immediate Insights) │                    │ (Comprehensive Dossier│
     └──────────┬────────────┘                    └───────────┬───────────┘
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │     Reading Archive     │
                          │   (Saved Dossiers &     │
                          │   Historical Replay)    │
                          └─────────────────────────┘
```

---

## 2. The Two Core Reading Experiences

### Mode 1: Hand Scanner (~10 seconds)
* **Target Audience**: New users, quick reflection seekers, social sharing.
* **Onboarding & Framing**: Real-time camera viewfinder with hand contour guide, real-time lighting/focus quality gate warnings.
* **Scan Choreography**:
  * 0–2s: Palm Alignment & Landmark Lock
  * 2–4s: Preprocessing & Contrast Enhancement
  * 4–6s: Crease Segmentation & Multi-line Tracing (Violet, Blue, Rose, Gold, Amber highlights)
  * 6–8s: Feature Extraction & Samudrika Classification
  * 8–10s: Epistemic Synthesis & Report Compilation
* **Output**: Instant Quick Report with immediate top takeaways, 5 key line badges, and an invitation to unlock the deep synthesis.

### Mode 2: Guided Palm Reading (In-Depth Interactive Synthesis)
* **Target Audience**: Serious seekers of palmistry insight, return users desiring holistic synthesis.
* **Tactile & Visual Questionnaire Modules**:
  1. Hand Shape & Element (Earth, Air, Fire, Water)
  2. Thumb Flexibility & Angle (Willpower & Logic)
  3. Finger Spacing & Balance (Individualism & Independence)
  4. Mount Prominence (Venus, Moon, Jupiter, Mercury, Sun)
  5. Special Mark Identification (Stars, Islands, Crosses, Grilles)
* **Output**: Detailed Report Dossier with 4 Epistemic Layers, deep line-by-line interactive inspection, cross-traditional comparisons (Hasta Samudrika vs. Western Classical), and PDF/Social Card export.

---

## 3. Epistemic Transparency Layers

Every report visibly enforces the four epistemic boundaries defined in the Kai RegAI master architecture:

1. **Layer 1: Physical Observation**: Objective geometric facts extracted by CV (e.g., "Deep curved crease traversing 68% of the palmar width from the radial index boundary").
2. **Layer 2: Traditional Attribution**: Verified literature attributions clearly tagged with tradition (e.g., "[Hasta Samudrika] Indicative of steady physical endurance and grounding").
3. **Layer 3: Synthesized Counsel**: Reflective, non-deterministic life guidance framing strengths and growth opportunities.
4. **Layer 4: Scope & Confidence**: Algorithmic certainty score, optical quality notes, and explicit disclaimer that readings are reflective tools rather than predictive fate.
