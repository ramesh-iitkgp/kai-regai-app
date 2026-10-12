# AGENTS.md — Master Operating Guide for Kai RegAI

Welcome to the **Kai RegAI** repository.

This document defines the mandatory operating guidelines, architectural boundaries, coding standards, and safety constraints for any AI agent or developer working on the **Kai RegAI** platform.

Every agent MUST read and adhere strictly to these instructions before making any modifications to this repository.

---

## 1. Product Identity & Purpose

* **Product Name**: Kai RegAI
* **Descriptor**: PALM READING
* **Tagline**: *The Story Written in Your Hands.*
* **Etymology & Branding**: Combines "Kai Regai" / கை ரேகை (Tamil for palm lines / palmistry) and "AI" (Artificial Intelligence). In all UI and branding materials, the final "AI" in "RegAI" must receive distinct visual treatment (e.g., stylized accent, glowing gradient, or typographic distinction) and must never appear visually identical to the preceding letters.
* **Positioning**: AI-assisted traditional palmistry and reflective personal interpretation. It is **NOT** scientific prediction, medical diagnosis, financial advice, or deterministic fortune-telling.

---

## 2. Core Non-Negotiable Rules

1. **Phase Discipline**: Only work within the currently authorized phase as designated in [docs/MASTER_ROADMAP.md](docs/MASTER_ROADMAP.md). Never automatically begin or jump into future phases.
2. **Never Build the "Raw Image -> LLM" Anti-Pattern**:
   * **STRICTLY FORBIDDEN**: Feeding a raw hand image directly to a vision LLM to produce a reading.
   * **MANDATED PIPELINE**:
     $$\text{Palm Image} \longrightarrow \text{CV Engine} \longrightarrow \text{Structured Features} \longrightarrow \text{Knowledge Base + Rules} \longrightarrow \text{Interpretation Context} \longrightarrow \text{AI Narration} \longrightarrow \text{Report}$$
   * The LLM is strictly a language synthesis, narrative formatting, and personalization layer. It is NOT the uncontrolled source of palmistry rules.
3. **Knowledge Integrity**:
   * **NEVER invent palmistry rules.**
   * **NEVER hallucinate or falsify citations, texts, or traditions.**
   * Every rule in the knowledge base must retain verified source attribution, tradition tags (e.g., Hasta Samudrika, Western Classical, Modern), and confidence metadata.
   * Do NOT blindly merge contradictory traditions; preserve their distinct perspectives.
4. **Preserve Decoupled Architecture**: Maintain strict separation between:
   * Mobile UI / Client
   * Backend / API Gateway
   * Palm Computer Vision (CV) Engine
   * Canonical Palm Feature Model
   * Palmistry Knowledge Base
   * Interpretation / Rule Engine
   * AI / RAG Narration Layer
   * Report Engine
   * User & Authentication Service
   * Payments & In-App Purchases
   * Analytics & Telemetry
   * Testing & Verification Suite
5. **No Visual or Brand Plagiarism**:
   * Reference application screenshots (`/screens`) are for functional, structural, and interaction inspiration only.
   * Never copy proprietary branding, logos, exact copy, icons, or proprietary artwork. Kai RegAI must possess its own unique, elevated design system.
6. **Privacy & Biometric Sensitivity**:
   * Biometric and palm imagery are highly sensitive user data.
   * Palm images must be processed locally on-device whenever feasible or encrypted in transit with zero persistent storage without explicit user consent.
   * Strictly adhere to Google Play Store and Apple App Store privacy policies and biometric guidelines.

---

## 3. Source-of-Truth Hierarchy

When resolving conflicts, follow this strict hierarchy:

1. **Product Requirements & Roadmap**: [docs/MASTER_ROADMAP.md](docs/MASTER_ROADMAP.md)
2. **Product & UX Architecture (P2)**: [docs/p2/P2_PRODUCT_UX_ARCHITECTURE.md](docs/p2/P2_PRODUCT_UX_ARCHITECTURE.md) and related specifications under `docs/p2/`
3. **UX & Product Flow**: [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)
4. **Visual Design & Aesthetics**: Approved Stitch/Figma Designs + [docs/UI_SPEC.md](docs/UI_SPEC.md) + [docs/p2/STITCH_HANDOFF_SPEC.md](docs/p2/STITCH_HANDOFF_SPEC.md)
5. **Technical Architecture & Module Boundaries**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
6. **Palmistry Knowledge**: [docs/KNOWLEDGE_ARCHITECTURE.md](docs/KNOWLEDGE_ARCHITECTURE.md) + Knowledge Base Source Records ([docs/p1/](docs/p1/))
7. **Computer Vision Specifications**: [docs/CV_SPEC.md](docs/CV_SPEC.md)
8. **AI & Narration Behavior**: [docs/AI_SPEC.md](docs/AI_SPEC.md)
9. **Deployment & Release**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

Never silently overwrite these specifications without explicit user authorization.

---

## 4. The Two Core Reading Experiences

Every agent working on user flows or feature sets must understand the two distinct modes:

### Mode 1: Hand Scanner (Fast Quick Reading)
* **Duration**: ~10 seconds.
* **Flow**: Camera $\rightarrow$ Palm Detection $\rightarrow$ Quality Validation (lighting, focus, angle) $\rightarrow$ Fast Scan Animation $\rightarrow$ Line-by-line Detection with visual highlights $\rightarrow$ Feature Extraction $\rightarrow$ Quick Interpretation $\rightarrow$ Immediate Quick Report.
* **Approved Line Colors**:
  * **Life Line**: Violet
  * **Head Line**: Blue
  * **Heart Line**: Rose
  * **Fate Line**: Gold
  * **Sun Line**: Amber
* **Goal**: Immediate visual delight, engagement, and accessible reflection.

### Mode 2: Palm Reading (Guided Deep Experience)
* **Duration**: Multi-minute interactive session.
* **Flow**: Multi-step interactive visual questionnaire for features hard to capture automatically (palm shape, thumb flexibility, finger stiffness/spacing, mount texture, special marks) combined with Computer Vision baseline data.
* **Goal**: In-depth, nuanced, holistic traditional synthesis combining Indian (Hasta Samudrika) and Western palmistry frameworks into a rich personalized report.

---

## 5. Development & Coding Standards

* **Language & Quality**: Clean, modular, strongly-typed code (TypeScript for frontend/node backend, Python/C++ for CV/AI pipelines as defined in architecture).
* **Testing**: Every module must have automated unit tests. Do not commit untested core logic.
* **Configuration-Driven**: Keep rules, thresholds, prompts, and UI copy externalized in structured configuration files (JSON/YAML) rather than hardcoded in application logic.
* **Cross-Platform Compatibility**: Ensure seamless compatibility for both iOS and Android platforms.
* **Security & Privacy**: Zero unauthenticated exposure of personal palm data; adhere to encryption standards at rest and in transit.

---

## 6. Execution Lifecycle Checklist for Agents

Before completing any assigned task, verify:
- [ ] Did I stay strictly within the authorized phase?
- [ ] Did I preserve existing functionality and test suites?
- [ ] Did I maintain module decoupling?
- [ ] Are all newly introduced files and code symbols linked and documented?
- [ ] Did I avoid fabricating palmistry knowledge or ungrounded claims?
- [ ] Is documentation updated to reflect any approved architectural changes?

---

## 7. Phase P2 Governance & Operating Rules

Any agent operating in or building upon Phase P2 must strictly adhere to the following 10 operating rules:

1. **Mandatory Documentation Review**: Read [AGENTS.md](AGENTS.md), [docs/MASTER_ROADMAP.md](docs/MASTER_ROADMAP.md), and all relevant documents under `docs/p2/` prior to proposing code or design changes.
2. **Phase Boundary Discipline**: Never jump ahead to Phase P3 (visual asset generation/Stitch UI) or Phase P4+ (app code implementation) without explicit authorization.
3. **P1 Knowledge Lock**: Never modify P1 knowledge structures, sources, or rules silently. Any discovered gap or dependency must be recorded in `docs/p2/P1_DEPENDENCY_NOTES.md`.
4. **No Hallucinated Product Behavior**: All user-facing behavior, navigation paths, and report layouts must strictly conform to [SCREEN_INVENTORY.md](docs/p2/SCREEN_INVENTORY.md) and [SCREEN_SPECIFICATIONS.md](docs/p2/SCREEN_SPECIFICATIONS.md).
5. **Canonical Data Invariance**: Never introduce separate, conflicting feature models for Mode 1 and Mode 2. Both modes must map exclusively into the canonical `PalmFeatureModel` defined in [docs/p2/DATA_FLOW.md](docs/p2/DATA_FLOW.md).
6. **Central Architectural Invariant**: Maintain the strict unidirectional pipeline:
   $$\text{User Experience} \longrightarrow \text{Reading Session} \longrightarrow \text{PalmFeatureModel} \longrightarrow \text{Knowledge + Rules} \longrightarrow \text{Interpretation} \longrightarrow \text{AI Narration} \longrightarrow \text{Report}$$
   The UI, CV engine, or LLM must never become independent sources of palmistry truth.
7. **Consolidated Screen Policy**: Do not create fragmented standalone screens for transient camera warnings or questionnaire steps. Use the 18 consolidated screens with dynamic state overlays specified in [SCREEN_INVENTORY.md](docs/p2/SCREEN_INVENTORY.md).
8. **Accessibility & Multi-modal Feedback**: Color must never be the sole differentiator for major palm lines. Always pair line colors (Violet, Blue, Rose, Gold, Amber) with dedicated glyphs, stroke dash patterns, and textual labels per [ACCESSIBILITY_SPEC.md](docs/p2/ACCESSIBILITY_SPEC.md).
9. **Decision Logging**: Every non-trivial product, architectural, or technical decision must be logged with alternatives and rationale in [docs/p2/P2_DECISION_LOG.md](docs/p2/P2_DECISION_LOG.md).
10. **Pre-Completion Validation**: Run full validation against [docs/p2/P2_AUDIT_REPORT.md](docs/p2/P2_AUDIT_REPORT.md) quality gates before marking any phase-related task complete.

---

## 8. Phase P4 UI Integration Governance

Any agent maintaining or extending the Kai RegAI mobile UI must adhere to:

1. **Stitch Reference Immutability**: Treat `design/stitch/` as an immutable design reference. Never overwrite Stitch source files.
2. **Central Design Tokens**: Never hardcode colors, spacing, or typography. All presentation styles must consume `src/styles/tokens.css` and `src/styles/components.css`.
3. **No Business Logic in UI**: Never embed computer vision crease extraction algorithms, palmistry rule evaluations, or raw LLM prompts inside UI components. The UI strictly renders canonical view models provided by the state machine and data layers.
4. **Accessible Line Identity**: Major crease lines must always feature semantic colors (Violet `#A855F7`, Blue `#00D2FF`, Rose `#F43F5E`, Gold `#FBBF24`, Amber `#F59E0B`), unique SVG stroke dash patterns, distinct anatomical glyphs, and text labels.
5. **State-Preserving Navigation**: Sub-selectors (e.g. Line filters in the Detailed Report, Reading Archive categories) must preserve their active state during tab navigation.
6. **Epistemic Layer Distinction**: Reports must visibly separate Physical Observations, Traditional Attributions, and Kai RegAI Synthesis. Fatalistic expiration dates or medical diagnostic predictions are strictly forbidden.
7. **Biometric Privacy Safeguard**: Default to ephemeral, RAM-only palm processing with zero persistent photo retention and 1-tap data purge controls.

