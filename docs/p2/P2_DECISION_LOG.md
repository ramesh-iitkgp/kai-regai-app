# Kai RegAI — Phase P2 Architecture Decision Log

This decision log records all settled product and UX architectural decisions made during Phase P2. Future agents and engineers are bound by these records and must not re-litigate settled choices without explicit user authorization.

---

### `DEC-P2-001`: Top-Level Navigation Paradigm
* **Date**: 2026-09-24
* **Decision**: Adopt a **4-Tab Bottom Navigation Bar** (`Home`, `Readings`, `Learn`, `You`) combined with **Full-Screen Modal Stacks** for the two reading flows.
* **Alternatives Considered**:
  1. *5-Tab Bar with Center Camera Button*: Rejected because a single camera icon creates ambiguity between the 10-second Hand Scanner and the 5-minute Guided Palm Reading.
  2. *Drawer / Hamburger Navigation*: Rejected due to poor discoverability of the archive and educational content.
* **Chosen Approach**: 4-Tab bar with both reading modes presented as prominent, distinct hero cards on the `Home` tab.
* **Reason**: Maximizes mode clarity, eliminates sub-picker modals, and provides immersive focus during scanning and questionnaire completion.
* **Impact**: Simplifies navigation hierarchy and provides direct thumb reachability.
* **Dependencies**: [docs/p2/NAVIGATION_ARCHITECTURE.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/NAVIGATION_ARCHITECTURE.md).

---

### `DEC-P2-002`: Screen Count Consolidation
* **Date**: 2026-09-24
* **Decision**: Enforce a strict **18-screen consolidated inventory** using dynamic in-screen state management instead of single-state page explosion.
* **Alternatives Considered**: Creating separate discrete routes for every camera state (e.g. `TooFarScreen`, `TooDarkScreen`, `ScanScreen`).
* **Chosen Approach**: A single `SCR-SCN-001` Viewfinder screen encapsulating 20 reactive states via HUD overlay components.
* **Reason**: Prevents cognitive fragmentation, reduces routing transitions, eliminates camera re-initialization latency, and reduces development complexity.
* **Impact**: Total screen count locked at 18 consolidated screens.
* **Dependencies**: [docs/p2/SCREEN_INVENTORY.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/SCREEN_INVENTORY.md), [docs/p2/STATE_MACHINE.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/STATE_MACHINE.md).

---

### `DEC-P2-003`: Unified Canonical Feature Model Contract
* **Date**: 2026-09-24
* **Decision**: Both Mode 1 (Hand Scanner) and Mode 2 (Palm Reading) must generate the exact same canonical `PalmFeatureModel` JSON contract.
* **Alternatives Considered**: Separate lightweight schema for Scanner and heavy schema for Guided Reading.
* **Chosen Approach**: Single unified schema where Mode 1 leaves `user_observations` as `null`, while Mode 2 hydrates both CV and questionnaire fields.
* **Reason**: Allows seamless upgrading from a Quick Scan to a Deep Reading without re-scanning the hand, and ensures the Rule Engine uses a single data interface.
* **Impact**: Rule Engine logic is 100% reusable across both modes.
* **Dependencies**: [docs/p2/DATA_FLOW.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/DATA_FLOW.md).

---

### `DEC-P2-004`: Non-Color-Only Accessibility Mandate
* **Date**: 2026-09-24
* **Decision**: All 5 major line illuminations must be accompanied by non-color identifiers (SVG glyphs, stroke dash patterns, semantic screen reader labels).
* **Alternatives Considered**: Relying solely on the standardized line colors (Violet, Blue, Rose, Gold, Amber).
* **Chosen Approach**: Tri-fold identification (Color + Dash Pattern + Anchor Icon + VoiceOver Label).
* **Reason**: Adheres strictly to WCAG 2.1 Level AA and ensures full usability for colorblind users.
* **Impact**: UI and graphic assets in P3 must include dash and glyph treatments.
* **Dependencies**: [docs/p2/ACCESSIBILITY_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/ACCESSIBILITY_SPEC.md).

---

### `DEC-P2-005`: Four-Tier Epistemic Report Language
* **Date**: 2026-09-24
* **Decision**: AI Narration must enforce strict separation between physical observations, Western classical analysis, Vedic *Hasta Samudrika* lore, and Kai RegAI synthesis.
* **Alternatives Considered**: Generating flat un-attributed narrative summaries.
* **Chosen Approach**: Clear tier-based language templates with explicit source acknowledgments and zero fatalistic/medical claims.
* **Reason**: Prevents pseudoscience lawsuits, complies with Apple/Google entertainment guidelines, and honors historical textual integrity.
* **Impact**: Embedded directly into AI narration prompt templates.
* **Dependencies**: [docs/p2/REPORT_ARCHITECTURE.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/REPORT_ARCHITECTURE.md).

---

### `DEC-P2-006`: Sovereign Biometrics & Ephemeral Raw Image Storage
* **Date**: 2026-09-24
* **Decision**: Raw palm camera frames are held in volatile device RAM only during landmark extraction, and purged immediately afterward.
* **Alternatives Considered**: Uploading raw photographs to cloud storage by default.
* **Chosen Approach**: Zero persistent raw image storage. Only extracted coordinates and narrative reports are saved in the user's reading archive. Prominent 1-tap data deletion control in settings.
* **Reason**: Eliminates biometric liability, complies with GDPR/CCPA and Indian DPDP Act, and establishes high user trust.
* **Impact**: High privacy compliance; minimizes cloud storage costs.
* **Dependencies**: [docs/p2/PRIVACY_UX_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/PRIVACY_UX_SPEC.md).

---

### `DEC-P2-007`: Pre-Scan Quality Halo Gate
* **Date**: 2026-09-24
* **Decision**: The 10-second scan animation cannot begin until a composite quality score $Q \ge 0.85$ is sustained continuously for $\ge 500\text{ ms}$.
* **Alternatives Considered**: Allowing the user to tap "Scan" at any time regardless of lighting or blur.
* **Chosen Approach**: Automated initiation once green halo threshold clears (with manual fallback button after 8 seconds).
* **Reason**: Guarantees high feature extraction accuracy and prevents user disappointment from failed scans.
* **Impact**: Requires real-time 30 fps quality evaluation in CV pipeline.
* **Dependencies**: [docs/p2/HAND_SCANNER_FLOW.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/HAND_SCANNER_FLOW.md).

---

### `DEC-P2-008`: Active vs. Passive Hand Philosophy
* **Date**: 2026-09-24
* **Decision**: Modern dominant hand model (*Kriyamana* active karma vs *Sanchita* innate blueprint) is universally adopted, replacing archaic gender-based historical rules.
* **Alternatives Considered**: Hardcoding left hand for female users and right hand for male users based on ancient verses.
* **Chosen Approach**: Dominant hand selection by user preference, with educational explanation.
* **Reason**: Aligns with modern 20th-century Indian palmistry consensus (Shrimali, Ojha) and contemporary ethical standards.
* **Impact**: Eliminates gender bias in core algorithms.
* **Dependencies**: [docs/p2/PALM_READING_FLOW.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/PALM_READING_FLOW.md).

---

### `DEC-P2-009`: Zero Technical Stack Trace Policy
* **Date**: 2026-09-24
* **Decision**: Centralized 11-tier error architecture with graceful user-facing recovery screens; technical logs routed exclusively to internal telemetry.
* **Alternatives Considered**: Defaulting to framework red-screens or generic alerts.
* **Chosen Approach**: All errors render warm, calm obsidian-gold recovery dialogs with actionable recovery buttons.
* **Reason**: Maintains high aesthetic polish and user reassurance during network or camera dropouts.
* **Impact**: Requires top-level React/Flutter ErrorBoundary wrappers.
* **Dependencies**: [docs/p2/ERROR_RECOVERY_ARCHITECTURE.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/ERROR_RECOVERY_ARCHITECTURE.md).

---

### `DEC-P2-010`: Freemium Tier Boundary Placement
* **Date**: 2026-09-24
* **Decision**: Mode 1 (Hand Scanner) is completely free and unlimited; Mode 2 (Guided Palm Reading) and high-resolution PDF exports are gated to Kai RegAI Premium.
* **Alternatives Considered**: Charging per scan or locking the entire app behind an upfront paywall.
* **Chosen Approach**: Generous top-of-funnel free discovery tier, converting users when they seek comprehensive multi-chapter personal dossiers.
* **Reason**: Drives viral organic sharing of Quick Report cards while monetizing high-intent users seeking deep personal guidance.
* **Impact**: Maximizes organic top-of-funnel conversion.
* **Dependencies**: [docs/p2/MONETIZATION_UX_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/p2/MONETIZATION_UX_SPEC.md).
