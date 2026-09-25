# P10 Design System & Aesthetics Specification

## 1. Brand Aesthetics & Philosophy

The Kai RegAI visual language evokes quiet luxury, intellectual rigor, and cultural authenticity:
* **Descriptor**: PALM READING
* **Tagline**: *The Story Written in Your Hands.*
* **Tone**: Restrained, elegant, calm, trustworthy, reflective.
* **Avoidance**: Cheap neon fortune-teller tropes, cartoonish crystal balls, dense medical telemetry dashboards, or unreadable gothic fonts.

---

## 2. Design Tokens (`ReportTheme.js`)

### 2.1 Color Palette
* **Deep Obsidian Canvas**:
  * Root background: `#050811`
  * Card surface: `#0A0E1A`
  * Secondary surface: `#121829`
* **Noble Gold Accents**:
  * Primary gold: `#FBBF24`
  * Gold border: `rgba(251, 191, 36, 0.28)`
  * Gold glow: `rgba(251, 191, 36, 0.08)`
* **Typography Contrast**:
  * High contrast text: `#F8FAFC`
  * Muted body text: `#94A3B8`
  * Dim helper text: `#64748B`

### 2.2 Semantic Line Identity
Major crease lines are assigned fixed semantic colors paired with geometric glyphs and dash styles:
* **Life Line (Ayur)**: Violet `#A855F7` | Square glyph (■) | Solid stroke
* **Head Line (Matru)**: Blue `#00D2FF` | Diamond glyph (◆) | Long dash `8 4`
* **Heart Line (Pitri)**: Rose `#F43F5E` | Triangle glyph (▲) | Short dash `4 4`
* **Fate Line (Karma)**: Gold `#FBBF24` | Star glyph (★) | Dash-dot `6 3 2 3`
* **Sun Line (Surya)**: Amber `#F59E0B` | Sun glyph (☀) | Dotted `2 3`

### 2.3 Typography Hierarchy
* **Display / Brand**: `Cinzel`, `Georgia`, serif
* **Body / UI**: `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Inter`, sans-serif
* **Code / Provenance**: `SFMono-Regular`, `Consolas`, monospace

---

## 3. Component Design System

1. **`ReportCover`**:
   * Centered brand insignia, tier chip with gold border, report title, date, reading method, and subject hand metadata.
2. **`KeyTakeawayCard`**:
   * Card with 3px solid gold left border, theme title, confidence pill, and reflective takeaway text.
3. **`PalmVisualization`**:
   * Dark gradient card with subtle hand watermark, scalable vector overlay, and 5-item accessible semantic legend.
4. **`MajorLinesTable`**:
   * Deconstructed crease cards with 4 distinct epistemic layers:
     * *Layer 1 (Physical Observation)*
     * *Layer 2 (Western Classical Attribution)*
     * *Layer 3 (Hasta Samudrika Attribution)*
     * *Layer 4 (Kai RegAI Synthesis)*
5. **`ChapterSection`**:
   * Four distinct narrative chapters (Constitution, Vocation, Relationships, Guidance) rendered in high-readability serif/sans combination.
6. **`SourcesAndDisclaimers`**:
   * Scholarly source concordance and legal/reflective disclaimers.
