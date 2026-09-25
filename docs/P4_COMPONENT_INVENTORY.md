# Kai RegAI — P4 Component Inventory

**Source**: `src/components/` & `src/styles/components.css`  
**Phase**: P4 — UI Integration  
**Status**: COMPLETE

---

## 1. Global Shell & Navigation Components

### `AppHeader` (`src/components/AppHeader.js`)
* **Role**: Primary application top bar with brand identity and quick status.
* **Features**:
  * Luminous brand wordmark ("Kai Reg" in Playfair Display + stylized glowing "AI" badge).
  * Circular sacred geometry emblem.
  * Real-time lunar transit badge ("Waxing Gibbous").
  * User profile avatar with navigation trigger.
* **Accessibility**: Unique `aria-label` tags, focus states, interactive keyboard accessibility.

### `BottomNavigation` (`src/components/BottomNavigation.js`)
* **Role**: 4-tab mobile anchor navigation bar.
* **Tabs**: `HOME`, `READINGS`, `LEARN`, `YOU`.
* **Features**:
  * Safe-area inset bottom padding (`pb-safe`).
  * Active icon drop-shadow gold glow and subtle translate animation.
  * Automatically unmounts on immersive full-screen flows (Scanner HUD, Cold Splash).

---

## 2. Specialized Chiromancy & Biometric Components

### `PalmLineOverlay` (`src/components/PalmLineOverlay.js`)
* **Role**: SVG coordinate overlay capable of dynamic line isolation and real-time animation.
* **Semantic Lines**:
  * **Life Line** (`#A855F7`, Violet, Solid line, Square keypoint glyph)
  * **Head Line** (`#00D2FF`, Blue/Cyan, Dashed `8 2`, Diamond keypoint glyph)
  * **Heart Line** (`#F43F5E`, Rose, Dashed `12 3`, Circle keypoint glyph)
  * **Fate Line** (`#FBBF24`, Gold, Dotted `4 2`, Triangle keypoint glyph)
  * **Sun Line** (`#F59E0B`, Amber, Long-short `6 3`, Sunburst disc glyph)
* **Accessibility**: Non-color-only identification strictly implemented via stroke pattern and landmark geometry.

### `ScannerHUD` (`src/components/ScannerHUD.js`)
* **Role**: Real-time camera viewfinder interface.
* **Features**:
  * Sacred Vedic Chiromancy reticle with astronomical quadrant corner brackets.
  * Quality verification chips (Lighting Optimal, Distance Good, Steady).
  * Action controls: Flashlight torch toggle, camera flip, and cancel/exit.
  * Primary trigger button: *"Begin 10s Optical Scan"*.

### `AnalysisAnimationOverlay` (`src/components/AnalysisAnimationOverlay.js`)
* **Role**: Progressive 10-second scan choreography controller.
* **Features**:
  * Sweeping horizontal laser beam (`.laser-beam`).
  * Timed progress bar advancing from 0% to 100%.
  * Synchronized line illumination: highlights specific lines at defined second intervals.
  * Completion callback transitioning cleanly to the Quick Report screen.

### `QuestionnaireWidget` (`src/components/QuestionnaireWidget.js`)
* **Role**: Reusable interactive visual modules for Mode 2 guided chiromancy.
* **Modules**:
  1. Thumb Flexibility Arc (Firm, Balanced, Supple)
  2. Palm Tissue Firmness (Soft, Elastic, Dense)
  3. Phalanx Equilibrium (Harmonious, Will Dominant, Logic Dominant)
  4. Finger Spacing (Wide, Moderate, Close)
  5. Sacred Markings Confirmation (Trident, Fish, Solomon Ring, Clean Field)

---

## 3. Modals & Dialog Components

### `PdfExportModal` (`src/components/PdfExportModal.js`)
* **Role**: Bottom-sheet preview for downloading the Illuminated Sacred Palm Book (PDF).
* **Actions**: Download High-Res PDF (300 DPI simulated print), Share Encrypted Link, Dismiss.

### `ErrorCalibrationModal` (`src/components/ErrorCalibrationModal.js`)
* **Role**: Graceful optical recovery dialog for camera edge-cases.
* **Variants**: `LOW_LIGHT`, `DISTANCE`, `MOTION`, `MULTIPLE_HANDS`.
* **Actions**: "Recalibrate & Retry", "Switch to Guided Mode Instead".
