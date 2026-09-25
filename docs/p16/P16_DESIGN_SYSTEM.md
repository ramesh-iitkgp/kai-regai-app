# P16 Design System & Production Visual Specifications

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P16 — Production UX, Reading Experience & Conversion  

---

## 1. Design Philosophy & Aesthetic Foundation

Kai RegAI delivers an elevated, mysterious, yet grounded personal reflection experience. It rejects the cartoonish, neon, or fatalistic tropes of typical fortune-telling apps in favor of contemplative reverence, scholarly tradition, and mathematical precision.

### Key Brand Characteristics
* **Celestial Mysticism Meets Scientific Precision**: Deep obsidian and cosmic indigo canvas punctuated by starlight gold, deep violet, and vibrant cyan accents.
* **Typographic Hierarchy**:
  * Brand & Display: Serif elegance (`Cinzel`, `Playfair Display`, `Spectral`) for headings and reading titles.
  * Structural & Interface: High-legibility geometric sans-serif (`Inter`, system sans) with tabular numbers for confidence metrics and measurements.
* **Epistemic Distinctiveness**: The "AI" in "Kai RegAI" always features distinct visual styling (subtle gradient, glowing accent, or uppercase contrast) to emphasize its role as a synthesis tool rather than an omniscient oracle.

---

## 2. Design Tokens

All styling in Kai RegAI is bound to central CSS variables declared in `src/styles/tokens.css` and extended in `src/styles/components.css`:

### Color Palette

| Token | Hex / HSL | Purpose |
| :--- | :--- | :--- |
| `--color-bg` | `#08090E` | App background, deep cosmic void |
| `--color-surface` | `#12131C` | Cards, modals, sheet containers |
| `--color-surface-hover` | `#1B1D2A` | Interactive hover/pressed state |
| `--color-border` | `rgba(255, 255, 255, 0.08)` | Subdued border lines |
| `--color-primary` | `#FBBF24` | Primary brand gold / fate line |
| `--color-secondary` | `#A855F7` | Mystical violet / life line |
| `--color-cyan` | `#00D2FF` | Analytical blue / head line |
| `--color-rose` | `#F43F5E` | Warm emotional rose / heart line |
| `--color-amber` | `#F59E0B` | Radiant amber / sun line |
| `--color-text` | `#F1F5F9` | High contrast primary reading text |
| `--color-text-muted` | `#94A3B8` | Secondary labels, citations, metadata |

### Semantic Major Crease Color Map & Multimodal Encoding

To satisfy WCAG 2.1 AA accessibility and ensure colorblind users can readily distinguish all major crease lines:

| Line Name | Semantic Color | Hex Code | SVG Dash Pattern | Anatomical Glyph | Meaning / Domain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Life Line** | Violet | `#A855F7` | Solid | ✦ (Chalice) | Vitality, stamina, rhythm of life |
| **Head Line** | Blue | `#00D2FF` | `8,4` | ◆ (Diamond) | Intellectual clarity, cognitive style |
| **Heart Line** | Rose | `#F43F5E` | `4,4` | ♥ (Heart) | Emotional depth, empathy, resonance |
| **Fate Line** | Gold | `#FBBF24` | `12,4,2,4` | ▲ (Pillar) | Vocation, destiny, focus, accountability |
| **Sun Line** | Amber | `#F59E0B` | `2,4` | ☀ (Sun) | Creative spark, recognition, fulfillment |

---

## 3. Component Architecture & Interactive States

### Interactive Surface Standards
* **Touch Target**: Every tappable control implements a minimum bounding box of $44 \times 44\,\text{px}$.
* **Focus States**: High-contrast outline `outline: 2px solid var(--color-secondary); outline-offset: 2px;` for full keyboard and screen-reader accessibility.
* **Glassmorphism**: Backdrop blur (`backdrop-filter: blur(16px)`) with subdued border highlight (`rgba(255, 255, 255, 0.1)`) on modals and floating bottom sheets.
* **Reduced Motion**: Full compatibility with `@media (prefers-reduced-motion: reduce)` which switches all scanner animations, pulsing glyphs, and transitions to instantaneous state changes.
