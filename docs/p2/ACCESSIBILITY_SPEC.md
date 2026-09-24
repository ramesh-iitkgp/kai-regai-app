# Kai RegAI — Accessibility (a11y) Specification

## 1. Core Accessibility Principles

Kai RegAI is built on the premise that ancient reflective wisdom should be accessible to all users, regardless of visual, motor, or auditory capabilities.

* **Target Compliance**: **WCAG 2.1 Level AA** standards across all iOS and Android screens.
* **Non-Negotiable Rule**: **Color must NEVER be the sole conveyor of information.**

---

## 2. Multi-Modal Line Identification (Non-Color-Only Rule)

While Kai RegAI uses standardized line illumination colors (Life: Violet, Head: Blue, Heart: Rose, Fate: Gold, Sun: Amber), users with protanopia, deuteranopia, tritanopia, or total color blindness must be able to identify every feature unambiguously.

Every highlighted line is accompanied by **three independent non-color identifiers**:

| Line | Approved Color Token | SVG Glyph / Icon Anchor | Visual Dash Pattern | Screen Reader Semantic Label |
|---|---|---|---|---|
| **Life Line** | Violet (`#A855F7`) | Sprout / Vitality Leaf Glyph | Solid Continuous Contour | *"Life Line: Curving around thumb pad; denotes constitutional stamina and vitality."* |
| **Head Line** | Blue (`#00D2FF`) | Compass / Thought Spark Glyph | Dotted Line Dash (`stroke-dasharray="4,4"`) | *"Head Line: Transverse crease across middle palm; denotes cognitive focus and reasoning."* |
| **Heart Line** | Rose (`#F43F5E`) | Lotus / Heart Glyph | Long-Dash Dash (`stroke-dasharray="8,4"`) | *"Heart Line: Upper crease beneath fingers; denotes emotional landscape and empathy."* |
| **Fate Line** | Gold (`#FBBF24`) | Ascending Pillar Glyph | Dash-Dot Dash (`stroke-dasharray="8,2,2,2"`) | *"Fate Line: Vertical crease rising toward middle finger; denotes vocational drive."* |
| **Sun Line** | Amber (`#F59E0B`) | Radiance / Sunburst Glyph | Double-Dot Dash (`stroke-dasharray="2,4"`) | *"Sun Line: Longitudinal crease beneath ring finger; denotes creative expression."* |

---

## 3. Typography & Contrast Ratios

1. **Contrast Compliance**:
   * Text Primary (`#F8FAFC`) on Background Void (`#0A0A12`): Contrast Ratio **18.2:1** (far exceeds WCAG AA 4.5:1 requirement).
   * Text Secondary (`#94A3B8`) on Surface Card (`#141424`): Contrast Ratio **7.4:1** (exceeds WCAG AA).
   * Active Interactive Accents (`#F59E0B` Gold, `#00D2FF` Cyan): Contrast Ratio $> 4.8:1$ against surface cards.
2. **Dynamic Type & Font Scaling**:
   * All typography scales seamlessly with OS system text settings (`UIContentSizeCategory` on iOS / `sp` units on Android).
   * UI containers use flexible layout boxes (`flexGrow`, `minHeight`) to prevent clipping or text truncation when text is scaled up to 200%.

---

## 4. Touch Ergonomics & One-Handed Reachability

* **Minimum Hit Targets**: All buttons, cards, slider thumbs, and tab icons maintain a minimum interactive hit area of **$48 \times 48\text{ pt}$** (including invisible hit slop padding).
* **Thumb Zone Ergonomics**: Primary action buttons (e.g. *"Start Scan"*, *"Next Question"*, *"Explore Full Reading"*) are anchored within the bottom 35% of the viewport (the natural thumb sweep area on modern large mobile displays).

---

## 5. Reduced Motion & Haptic Semantics

* **`prefers-reduced-motion` Compliance**:
  * When reduced motion is enabled in system settings, the high-speed laser scan sweep and 3D card tilt gyroscope animations are replaced with gentle, instantaneous opacity crossfades.
* **Semantic Haptic Feedback**:
  * `Selection Tick` (Light Impact): Slider increments, questionnaire radio selections.
  * `Success Confirmation` (Medium Double Pulse): Scan quality halo turns green; reading generation completes.
  * `Warning Alert` (Triple Tap): Hand too far or poor lighting detected during camera alignment.
