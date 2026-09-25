# P10 Responsive Web Rendering Specification

## 1. Web Architecture

The Kai RegAI web report is implemented via `src/report/ReportRenderer.js` and rendered inside `src/screens/DetailedReportScreen.js` and standalone containers.

---

## 2. Responsive Breakpoint Strategy

1. **Mobile (< 640px)**:
   * Single-column vertical scroll flow.
   * Full-width cards with 16px margins.
   * Touch-friendly tab segments and accordion disclosure for detailed citations.
   * Palm visualization centered at 320x380 px.
2. **Tablet (640px – 1024px)**:
   * 2-column key takeaways grid.
   * Scaled palm visualization at 360x420 px.
   * Side-by-side tradition cards (Western vs Hasta Samudrika).
3. **Desktop (> 1024px)**:
   * Maximum container width of 960px centered.
   * Persistent sticky table of contents navigation.
   * High-definition SVG crease visualization.

---

## 3. Accessibility & Multi-Modal Compliance

* **Semantic HTML**: Proper `<h1>`, `<h2>`, `<h3>`, `<article>`, and `<section>` hierarchy.
* **Non-Color Identity**:
  * Semantic colors are always reinforced with text labels ("Life Line") and geometric glyphs ("■", "◆", "▲", "★", "☀").
* **Screen Reader Accessibility**:
  * SVG lines include `<title>` and `<desc>` elements detailing line visibility, length, and trajectory.
* **Reduced Motion**:
  * Animations automatically respect `@media (prefers-reduced-motion: reduce)`.
