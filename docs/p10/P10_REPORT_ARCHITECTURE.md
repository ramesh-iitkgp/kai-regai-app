# P10 Report Engine Architecture

## 1. Architectural Philosophy: P8 Decides, P9 Explains, P10 Presents

The Kai RegAI system enforces a strict unidirectional pipeline:
```text
Palm Scan / Questionnaire
           ↓
    PalmFeatureModel
           ↓
P8 InterpretationDossier   <-- P8 DECIDES (Deterministic rule matching & evidence trace)
           ↓
  P9 NarratedReading       <-- P9 EXPLAINS (Context-grounded, empathetic synthesis)
           ↓
   P10 Report Engine       <-- P10 PRESENTS (Composition, formatting, vector PDF, cards)
```

**Non-Negotiable Invariants:**
1. **Zero New Interpretations**: P10 cannot invent observations, modify confidence levels, or re-evaluate features.
2. **Single Canonical Representation**: Presentation logic derives exclusively from the versioned `ReportModel`. Web, Print, PDF, and Social sharing are simply format-specific projections of this single data structure.
3. **Decoupled Renderers**: The composer contains zero DOM or canvas logic. Renderers receive a validated, immutable `ReportModel`.

---

## 2. Component Pipeline

```text
┌─────────────────────────┐
│ P8 InterpretationDossier│
│ P9 NarratedReading      │
│ PalmFeatureModel        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  ReportContextBuilder   │  Assembles evidence, normalizes SVG line paths,
└────────────┬────────────┘  formats major line records, extracts citations.
             │
             ▼
┌─────────────────────────┐
│     ReportComposer      │  Applies tier filtering (QUICK, STANDARD, PREMIUM),
└────────────┬────────────┘  structures executive summary and 4 chapters.
             │
             ▼
┌─────────────────────────┐
│  ReportSchemaValidator  │  Integrity check: validates schema v1.0.0,
└────────────┬────────────┘  enforces zero fatalistic or medical claim drift.
             │
             ▼
┌─────────────────────────┐
│       ReportModel       │  Immutable, canonical report data object.
└────────────┬────────────┘
             │
   ┌─────────┼──────────────┐
   ▼         ▼              ▼
┌───────┐ ┌──────────────┐ ┌───────────────────────────┐
│  Web  │ │ A4 Vector    │ │ High-DPI Social Cards     │
│Report │ │ Print / PDF  │ │ (1:1, 4:5, 9:16)          │
└───────┘ └──────────────┘ └───────────────────────────┘
```

---

## 3. Modular File Inventory

| Module | Role |
| :--- | :--- |
| `src/report/ReportSchema.js` | Defines `ReportModel` contract and `REPORT_TIERS` enum (`QUICK`, `STANDARD`, `PREMIUM`). |
| `src/report/ReportSchemaValidator.js` | Pre-render integrity and epistemic safety gate preventing ungrounded or harmful claims. |
| `src/report/ReportContextBuilder.js` | Normalizes upstream P8/P9 models and converts polyline data to scalable SVG paths. |
| `src/report/ReportComposer.js` | Composes canonical `ReportModel` tailored to the requested tier. |
| `src/report/ReportTheme.js` | Centralized design tokens (colors, typography, spacing, semantic line colors). |
| `src/report/ReportSections.js` | Reusable section templates (Cover, Summary, Crease Map, Lines Table, Chapters, Sources). |
| `src/report/ReportRenderer.js` | Generates semantic HTML markup for web reading and `@media print` stylesheets. |
| `src/report/ReportExport.js` | Compiles standalone A4 printable HTML with `@page` sizing and page break management. |
| `src/report/ReportShare.js` | High-DPI canvas rasterizer and Web Share API dispatcher. |
| `src/report/ReportTelemetry.js` | Non-blocking, privacy-conscious interaction metric logger (zero biometric data). |
| `src/report/index.js` | Unified entry point and `createReport()` facade function. |

---

## 4. Report Tiers & Composition Logic

* **QUICK Tier (< 2 min consumption)**:
  * Executive summary with 3–5 key themes.
  * Scalable palmar crease SVG overlay.
  * Single primary constitutional narrative section.
  * Compact epistemic disclaimer.
* **STANDARD Tier (Digital Personal Reading)**:
  * Full executive summary and takeaway cards.
  * Interactive SVG visualization with line status indicators.
  * Complete 4-chapter narrative (Constitution, Vocation, Relationships, Guidance).
  * Major lines evaluation and ethical disclaimers.
* **PREMIUM Tier (Archival Dossier)**:
  * Dedicated ornamental report cover with subject metadata.
  * All 4 narrative chapters with deep literature citations (Western & Hasta Samudrika).
  * Detailed major lines architecture table with epistemic layer separation.
  * Explainability trails (`report.getExplanation()`).
  * High-resolution A4 vector PDF readiness and multi-format social cards.
