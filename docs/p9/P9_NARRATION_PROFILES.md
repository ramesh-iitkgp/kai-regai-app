# P9 Narration Profiles & Tone Directives Specification

## 1. Overview

Kai RegAI supports a controlled, finite set of narration profiles (`src/narration/NarrationProfiles.js`). Arbitrary, user-supplied system prompts are strictly disallowed to prevent jailbreaks and ensure consistent brand voice.

---

## 2. Supported Profiles

| Profile ID | Target Audience & Tone | Target Word Count | Traditional Attribution |
| :--- | :--- | :---: | :---: |
| **`WARM_REFLECTIVE`** (Default) | Grounded, empathetic, introspective, affirming. Encourages energetic boundaries and personal agency. | ~700 words | Yes (Dual-perspective) |
| **`CALM_INSIGHTFUL`** | Contemplative, philosophical, highlighting constitutional harmony and conscious life choices. | ~750 words | Yes (Vedic focus) |
| **`CONCISE`** | Crisp, structured, direct, highlighting executive takeaways and bullet points. (Optimized for Quick Report). | ~220 words | Condensed |
| **`DETAILED`** | Rich, expansive, culturally resonant exposition with deep dual-perspective traditional analysis. | ~1400 words | Comprehensive citations |

---

## 3. Strict Boundary Rules

* **Zero Identity Fabrication**: Profiles adjust sentence structure, emphasis, and vocabulary. They must never fabricate unobserved personal traits (e.g. guessing the user's religion, sexual orientation, or political beliefs).
* **Deterministic Grounding**: Different narration profiles applied to the same `InterpretationDossier` will produce different stylistic presentations of the *identical* underlying physical evidence and traditional interpretations.
