# P7 — Questionnaire User Experience & Interaction Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P7 — Palm Reading Questionnaire Engine  

---

## 1. UX Principles & Tone of Voice

- **Calm, Reflective & Premium**: Avoid game-like countdown timers or aggressive surveys.
- **Observational Empowerment**: Instruct users gently on where to look without intimidating medical jargon.
- **Reversibility**: Users can easily go back, change answers, and review their observations before generating their reading.
- **Clear Progress Tracking**: Telemetry bar shows step numbers (e.g. `Step 04 of 14`) and percentage (`42% COMPLETE`).

---

## 2. Screen & Interaction States

### 2.1 Mode Entry (`GuidedReadingScreen.js`)
Users choose their reading pathway:
- **Card 1: 📷 Scan My Palm (Mode 1)**: Rapid camera capture with real-time HUD and stability gating.
- **Card 2: ✋ Guided Palm Reading (Mode 2)**: Guided observational questions without camera requirements.
- **Hand Selector**: Choose Left or Right hand before commencing.

### 2.2 Question HUD (`QuestionnaireHUD.js`)
Each question contains:
1. Category badge (e.g., `LIFE LINE`).
2. Main question title (e.g., `How clearly can you see your Life Line?`).
3. Neutral observational guidance subtitle.
4. Instructional illustration showing line trajectory.
5. Large, accessible touch cards with custom radio/checkbox indicators.
6. Bottom navigation: Secondary `Back` button and Primary `Continue` button.

### 2.3 Review & Verification (`QuestionnaireHUD.renderReview()`)
- Displays all recorded observations organized by category.
- Shows question title, value, and friendly label.
- Dedicated `edit` button per item that jumps straight into that question.
- Primary CTA: `Synthesize Guided Reading`.

### 2.4 Synthesis Transition (`QuestionnaireHUD.renderSynthesisScreen()`)
- Renders glowing sacred geometry rotation.
- Shows status: "Evaluating Epistemic Layers".
- Smoothly advances to Quick Report after 1.8 seconds.
