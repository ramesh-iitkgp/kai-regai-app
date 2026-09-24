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

1. **Phase Discipline**: Only work within the currently authorized phase as designated in [docs/MASTER_ROADMAP.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/MASTER_ROADMAP.md). Never automatically begin or jump into future phases.
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

1. **Product Requirements & Roadmap**: [docs/MASTER_ROADMAP.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/MASTER_ROADMAP.md)
2. **UX & Product Flow**: [docs/PRODUCT_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/PRODUCT_SPEC.md)
3. **Visual Design & Aesthetics**: Approved Stitch/Figma Designs + [docs/UI_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/UI_SPEC.md)
4. **Technical Architecture & Module Boundaries**: [docs/ARCHITECTURE.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/ARCHITECTURE.md)
5. **Palmistry Knowledge**: [docs/KNOWLEDGE_ARCHITECTURE.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/KNOWLEDGE_ARCHITECTURE.md) + Knowledge Base Source Records
6. **Computer Vision Specifications**: [docs/CV_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/CV_SPEC.md)
7. **AI & Narration Behavior**: [docs/AI_SPEC.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/AI_SPEC.md)
8. **Deployment & Release**: [docs/DEPLOYMENT.md](file:///Users/Hp/Documents/Kai%20RegAI%20%28clone%29/docs/DEPLOYMENT.md)

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
