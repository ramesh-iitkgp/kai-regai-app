# Kai RegAI — Product Specification

## 1. Product Identity & Overview

| Attribute | Definition |
|---|---|
| **Product Name** | **Kai RegAI** |
| **Descriptor** | **PALM READING** |
| **Tagline** | *The Story Written in Your Hands.* |
| **Etymology** | Integrates the Tamil phrase **Kai Regai** (கை ரேகை — palm lines / palmistry) with **AI** (Artificial Intelligence). |
| **Brand Rule** | The trailing **"AI"** in "RegAI" must always have distinct visual treatment (e.g., stylized gradient accent, glowing highlight, or discrete weight/kerning) in the logo, splash screen, and UI headers. It must not appear identical to "Reg". |
| **Product Positioning**| **AI-Assisted Traditional Palmistry & Reflective Personal Interpretation**. Kai RegAI frames palm reading as a timeless tool for mindfulness, self-reflection, and cultural heritage, explicitly avoiding deterministic, pseudoscience-as-fact, or anxiety-inducing fortune-telling. |

---

## 2. Core Pillars & Philosophy

Kai RegAI synthesizes seven core pillars:
1. **Computer Vision (CV)**: Real-time hand landmark tracking, crease line tracing, mount geometry extraction, and hand orientation validation.
2. **Traditional Indian Palmistry (*Hasta Samudrika Shastra*)**: Mount significance, auspicious marks (*Shankha*, *Padma*, *Trishula*, *Matsya*), thumb logic, and elemental hand types.
3. **Historical Western Palmistry**: Modern classical systems (Cheiro, William Benham, St. Germain) focusing on character analysis, line qualities, and psychological inclinations.
4. **Structured Knowledge Base**: Explicitly curated, literature-backed rules where every interpretation retains its original source attribution.
5. **Deterministic Rule Engine**: Transparent rule-matching that evaluates combinations of lines, mounts, and user observations without black-box hallucination.
6. **AI Narration Layer**: Advanced LLM orchestration used strictly for empathetic, contextual storytelling and synthesis based solely on vetted rule outputs.
7. **Personalized Reports**: High-value, beautifully styled visual reports that users can save, revisit, compare over time, or export.

---

## 3. The Two Core Reading Experiences

### Mode 1: Hand Scanner (Fast 10-Second Scan)
Designed for immediate engagement, instant gratification, visual delight, and rapid insight.

* **Target Duration**: ~10 seconds total interaction.
* **Target User**: Casual users, first-time explorers, party/social sharing contexts.
* **End-to-End User Flow**:
  1. **Camera Activation**: Live viewfinder with intuitive palm outline guide.
  2. **Palm Detection**: Real-time bounding box and 21-point hand skeleton tracking.
  3. **Quality Validation**: Instant visual feedback on distance, lighting, tilt, and stability (e.g., "Hold steady", "Move closer", "Good lighting detected").
  4. **Scan Initiation**: User taps scan or scan auto-triggers once quality threshold is met.
  5. **Progressive Line Tracing & Visual Highlighting**:
     * A dynamic scanning beam passes across the hand.
     * Detected lines illuminate with distinct, standardized neon-glow colors:
       * **Life Line**: Violet (`#8A2BE2` / `#A855F7`)
       * **Head Line**: Blue (`#3B82F6` / `#00D2FF`)
       * **Heart Line**: Rose (`#F43F5E` / `#FB7185`)
       * **Fate Line**: Gold (`#F59E0B` / `#FBBF24`)
       * **Sun Line**: Amber (`#D97706` / `#F59E0B`)
  6. **Feature Extraction**: Crease lengths, depths, curvatures, and prominent intersections extracted in ~1.5 seconds.
  7. **Quick Synthesis**: Rule engine evaluates top 3 dominant traits.
  8. **Quick Report Delivery**: An elegant summary card displaying the scanned palm with illuminated lines, core personality traits, current focus, and invitation to explore Mode 2.

---

### Mode 2: Palm Reading (Guided Deep Experience)
Designed for in-depth personal exploration, cultural appreciation, and comprehensive self-reflection.

* **Target Duration**: 3 to 7 minutes.
* **Target User**: Users seeking deep personal reflection, relationship insights, career contemplation, or authentic traditional Indian and Western palmistry wisdom.
* **End-to-End User Flow**:
  1. **Dual Hand Context**: Selection of Dominant Hand (active life path / choices) vs Passive Hand (innate potential / inherited traits).
  2. **Baseline Hand Capture**: CV capture of both hands providing foundational line maps and mount coordinates.
  3. **Guided Visual Questionnaire**:
     * Users answer targeted questions on tactile, flexible, or subtle traits that camera sensors cannot reliably discern:
       * **Palm Shape & Skin Texture**: Earth, Air, Fire, Water hands; smooth vs coarse skin texture.
       * **Thumb Mechanics**: Angle of thumb opening, flexibility of the distal joint (supple vs firm thumb), phalange length ratio (willpower vs logic).
       * **Finger Proportions**: Length of index (Jupiter) vs ring (Sun) finger, finger spacing, straightness of little finger (Mercury).
       * **Mount Prominence**: Fullness or flatness of Mount of Venus, Moon, Jupiter, and Mars.
       * **Line Nuance & Special Markings**: Islands, chains, tridents, stars, fish signs, or crosses detected by user confirmation.
     * Responses are captured via interactive visual pickers, slider gauges, and illustrative comparison cards.
  4. **Multi-Source Rule Evaluation**:
     * System combines CV observations + Questionnaire inputs + Knowledge Base rules.
     * Resolves tradition differences (e.g., classical Vedic view vs modern Western psychological view).
  5. **Rich Context Narration**:
     * AI narration layer synthesizes the combined findings into a cohesive, compassionate multi-chapter reading.
  6. **Comprehensive Palm Dossier**:
     * Full interactive report covering: Core Essence, Emotional Landscape (Heart), Intellectual Drive (Head), Vitality & Life Rhythm (Life), Destiny & Purpose (Fate), Creative & Social Radiance (Sun).
     * Option to download PDF or export social highlight cards.

---

## 4. Feature Matrix Comparison

| Feature Dimension | Mode 1: Hand Scanner | Mode 2: Palm Reading |
|---|---|---|
| **Session Time** | ~10 seconds | 3–7 minutes |
| **Input Modality** | Camera only | Camera + Interactive Questionnaire |
| **Data Depth** | Major lines geometry | Full hand anatomy, mounts, lines, markings, flexibility |
| **Tradition Scope** | Concise universal interpretation | Classical Indian (*Hasta Samudrika*) + Historical Western |
| **Output Format** | Single-screen Quick Report card | Multi-chapter interactive dossier + exportable PDF |
| **Monetization Fit** | Free top-of-funnel discovery | Freemium / Premium tier or tokenized deep reading |

---

## 5. Visual Inspiration & Reference Handling Policy

* **Reference Materials**: Screenshots and gameplay recordings in `/screens` and `extracted_frames/` represent interaction benchmarks from leading applications in the mobile category.
* **Strict Originality Policy**:
  * **Zero Direct Asset Copying**: Do not copy icons, vector graphics, typography, or exact layouts.
  * **Zero Text Plagiarism**: All UI copy, onboarding text, interpretation wording, and prompts must be 100% original to Kai RegAI.
  * **Branding Differentiation**: Kai RegAI embraces an elevated, premium, mystical yet clean aesthetic distinct from brightly saturated or cartoonish competitor apps.

---

## 6. Ethical, Safety & Legal Requirements

1. **Non-Deterministic Disclaimer**:
   * Prominently displayed: *"Kai RegAI provides reflective insights based on traditional palmistry lore and AI interpretation. Readings are intended for personal reflection, entertainment, and cultural exploration, not as predictive fact, medical advice, legal guidance, or financial forecasting."*
2. **Prohibited Interpretation Domains**:
   * No prediction of death, lifespan, or mortality dates.
   * No medical diagnoses, pregnancy guarantees, or health prognoses.
   * No lottery, gambling, or guaranteed financial predictions.
3. **Biometric Data Ethics**:
   * Hand images are classified as sensitive personal representations.
   * Zero sale of hand imagery or derived biometric vectors.
   * Immediate user option to delete all stored palm scans and associated reports.
