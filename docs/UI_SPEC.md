# Kai RegAI — UI & Design System Specification

## 1. Brand Identity & Visual Language

### Brand Etymology & Typographic Rule
* **Product Name**: **Kai RegAI**
* **Descriptor**: **PALM READING**
* **Tagline**: *The Story Written in Your Hands.*
* **Brand Root**: "Kai Regai" / கை ரேகை (Tamil for palm lines / palmistry) + "AI" (Artificial Intelligence).
* **The "AI" Distinction Rule**:
  * In every logo mark, navigation header, splash screen, and promotional surface, the final **"AI"** in **"RegAI"** must receive a distinct visual treatment.
  * *Permitted treatments*: Vibrant cyan-to-violet gradient text, glowing neon micro-border, raised typographic weight with celestial sparkle glyph, or distinct accent color (`#00F2FE` to `#4FACFE`).
  * *Prohibited treatment*: It must **never** appear in the same flat monochrome color and weight as "Kai Reg".

### Color Palette & Design Tokens
```css
:root {
  /* Brand Foundations */
  --bg-primary: #0A0A12;          /* Deep void black/indigo */
  --bg-surface: #141424;          /* Elevated card surface */
  --bg-surface-glass: rgba(26, 26, 46, 0.72);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(168, 85, 247, 0.35);

  /* Typography Colors */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --accent-gold: #F59E0B;
  --accent-ai: #00D2FF;

  /* Standardized Palm Line Illumination Colors */
  --line-life: #A855F7;          /* Violet / Orchid Glow */
  --line-head: #00D2FF;          /* Electric Blue Glow */
  --line-heart: #F43F5E;         /* Rose / Coral Glow */
  --line-fate: #FBBF24;          /* Warm Gold Glow */
  --line-sun: #F59E0B;           /* Deep Amber Glow */
}
```

### Typography
* **Primary Display / Headers**: *Cinzel Decorative* or *Outfit* (SemiBold/Bold) for refined, elevated mystical elegance.
* **Interface & Body Text**: *Plus Jakarta Sans* or *Inter* for maximum legibility across camera overlays and questionnaire cards.
* **Traditional / Sanskrit Accents**: Stylized italic serif with subtle letter spacing.

---

## 2. Standardized Line Visualization Scheme

Once detected during scanning or viewed in reports, palm lines must strictly utilize these colors across all screens:

| Line Name | Sanskrit Term | Approved Hex | Approved CSS / Glow Filter | Significance |
|---|---|---|---|---|
| **Life Line** | *Pitri Rekha* | `#A855F7` (Violet) | `drop-shadow(0 0 8px #A855F7)` | Vitality, life rhythm, physical reserves |
| **Head Line** | *Matri Rekha* | `#00D2FF` (Blue) | `drop-shadow(0 0 8px #00D2FF)` | Mentality, reasoning, learning style |
| **Heart Line** | *Ayush/Hridaya* | `#F43F5E` (Rose) | `drop-shadow(0 0 8px #F43F5E)` | Emotional depth, relationships, empathy |
| **Fate Line** | *Urdhwa Rekha* | `#FBBF24` (Gold) | `drop-shadow(0 0 8px #FBBF24)` | Destiny, career focus, inner calling |
| **Sun Line** | *Surya Rekha* | `#F59E0B` (Amber) | `drop-shadow(0 0 8px #F59E0B)` | Creative radiance, public recognition |

---

## 3. Screen Flows & Interaction Design

### Mode 1: Hand Scanner (~10-Second Experience)

```
[Camera Launch] ──> [Hand Silhouette Guide] ──> [Quality Indicator: Green]
       │
       ▼
[Scanning Beam Sweeps Hand] ──> [Progressive Line Glows (Violet, Blue, Rose, Gold, Amber)]
       │
       ▼
[Instant Analysis Feedback] ──> [Quick Report Card Delivery]
```

#### Detailed Screen States:
1. **Camera Viewfinder**:
   * Fullscreen dark camera feed with frosted glass bottom controls.
   * Translucent holographic hand outline in center showing target palm placement.
   * Real-time guidance badges:
     * *“Center your dominant hand”* (Info)
     * *“Too dark — seek gentle lighting”* (Warning)
     * *“Hold steady...”* (Action)
2. **Quality HUD**:
   * Circular progress ring turning from subtle gold to glowing green when focus, lighting, and distance metrics pass.
3. **The 10-Second Choreography**:
   * **Second 0–2**: Camera locks focus, bounding box snaps to palm perimeter.
   * **Second 2–4**: A luminous horizontal laser sweep moves vertically down the palm.
   * **Second 4–8**: Individual lines ignite one by one with particle sparkle and audio-haptic feedback:
     * *Life Line* flares in **Violet**.
     * *Head Line* flares in **Blue**.
     * *Heart Line* flares in **Rose**.
     * *Fate Line* flares in **Gold**.
     * *Sun Line* flares in **Amber**.
   * **Second 8–10**: Pulse animation consolidates features; haptic tick signifies completion.
4. **Quick Report Card**:
   * Interactive 3D tilt card presenting the illuminated palm scan.
   * 3 core trait chips (e.g., *"Strategic Visionary"*, *"Deep Empath"*, *"Expansive Vitality"*).
   * Brief 2-sentence reflective synthesis.
   * Primary CTA: *"Explore Full Guided Reading"* (Mode 2) + Secondary CTA: *"Share Quick Snapshot"*.

---

### Mode 2: Palm Reading Questionnaire

Designed for contemplative, high-delight multi-minute engagement.

#### Questionnaire Component Modules:
1. **Palm Shape & Element Selector**:
   * 4 interactive visual cards displaying stylized hand illustrations:
     * **Earth** (Square palm, sturdy fingers)
     * **Air** (Square palm, elongated fingers)
     * **Fire** (Rectangular palm, energetic short fingers)
     * **Water** (Rectangular palm, graceful long fingers)
2. **Thumb Flexibility Arc Meter**:
   * Interactive slider demonstrating thumb bend angle from $0^\circ$ (unyielding/stiff) to $45^\circ+$ (supple/flexible).
   * Real-time illustrative vector that bends dynamically as the user drags the slider.
3. **Finger Ratio Gauge**:
   * Visual comparison selector showing Index (Jupiter) vs Ring (Apollo) finger tip alignment with reference guidelines.
4. **Mount Firmness & Texture Picker**:
   * Tactile prompt asking the user to press the fleshy base of their thumb (Venus Mount):
     * *Full & Springy* / *Firm & Resilient* / *Soft & Receptive*.
5. **Special Marking Confirmation**:
   * Micro-cards showing verified traditional signs (*Trident / Trishula*, *Fish / Matsya*, *Star*, *Square of Protection*) with toggle to confirm or skip.

---

## 4. Reference App & Plagiarism Prevention Policy

* **Reference Screen Ingestion**: The 153 screenshots located in `/screens` and video captures in `extracted_frames/` are cataloged exclusively for **UX pattern discovery** (e.g., onboarding step sequences, camera permission rationale cards, report share mechanics).
* **Strict Prohibitions**:
  1. No duplication of competitor iconography, illustrations, or vector artwork.
  2. No reproduction of competitor brand color schemes (e.g., harsh pinks or saturated greens). Kai RegAI utilizes deep space obsidian, ethereal violet, cyan, and gold.
  3. No copy-pasting of text, marketing hooks, or fortune-telling copy.
  4. Every component must be crafted using original SVG assets and Kai RegAI design system tokens.
