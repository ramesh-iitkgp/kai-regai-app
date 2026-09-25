/**
 * QuestionnaireScreen Component — Mode 2 Guided Visual Questions & Synthesis
 * Phase: P7 — Palm Reading Questionnaire Engine
 * Source of truth: docs/p2/QUESTIONNAIRE_FLOW.md & docs/p7/
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { QuestionnaireEngine } from '../questionnaire/QuestionnaireEngine.js';
import { QUESTIONNAIRE_STATES } from '../questionnaire/QuestionnaireStateMachine.js';
import { QuestionnaireFeatureAdapter } from '../questionnaire/QuestionnaireFeatureAdapter.js';
import { PalmInterpretationEngine } from '../services/PalmInterpretationEngine.js';
import { QuestionnaireHUD } from '../components/QuestionnaireHUD.js';
import { QUESTION_TYPES } from '../questionnaire/QuestionnaireSchema.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';

export function renderQuestionnaireScreen(container, params = {}) {
  const initialAnswers = {
    hand_side: params?.hand || 'RIGHT'
  };

  reportTelemetry.logEvent(TELEMETRY_EVENTS.QUESTIONNAIRE_STARTED, { handSide: initialAnswers.hand_side });
  const engine = new QuestionnaireEngine({ initialAnswers });
  engine.start();

  function render() {
    const currentState = engine.getState();

    // 1. Dossier Synthesis State
    if (currentState === QUESTIONNAIRE_STATES.SUBMITTING) {
      container.innerHTML = QuestionnaireHUD.renderSynthesisScreen();
      return;
    }

    // 2. Review & Verification State
    if (currentState === QUESTIONNAIRE_STATES.REVIEW) {
      container.innerHTML = `
        <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
          <!-- Top Action Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button id="quest-review-top-back-btn" class="kai-btn-icon" aria-label="Return to questions">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
              Guided Chiromancy • Review
            </span>
            <button id="quest-close-btn" class="kai-btn-icon" aria-label="Cancel">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Review Summary Content -->
          ${QuestionnaireHUD.renderReview(engine.getReviewSummary())}
        </div>
      `;

      // Wire Review Screen Event Listeners
      container.querySelectorAll('.edit-question-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const editId = btn.getAttribute('data-edit-id');
          if (editId) {
            engine.goToQuestion(editId);
            render();
          }
        });
      });

      container.querySelector('#quest-review-top-back-btn')?.addEventListener('click', () => {
        engine.prev();
        render();
      });

      container.querySelector('#quest-review-back-btn')?.addEventListener('click', () => {
        engine.prev();
        render();
      });

      container.querySelector('#quest-close-btn')?.addEventListener('click', () => {
        router.navigate(ROUTES.HOME);
      });

      container.querySelector('#quest-submit-btn')?.addEventListener('click', handleSubmit);
      return;
    }

    // 3. Active In-Progress Question State
    const currentQ = engine.getCurrentQuestion();
    if (!currentQ) {
      engine.prev();
      render();
      return;
    }

    const currentAns = engine.getAnswer(currentQ.id);
    const context = engine.getContext();

    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top Action Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button id="quest-back-btn" class="kai-btn-icon" aria-label="Previous step">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            Guided Chiromancy • Mode 2
          </span>
          <button id="quest-close-btn" class="kai-btn-icon" aria-label="Cancel">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Render Current Question via HUD -->
        <div id="quest-hud-viewport">
          ${QuestionnaireHUD.renderQuestion(currentQ, currentAns, context)}
        </div>

      </div>
    `;

    // Wire Option Selection
    container.querySelectorAll('[data-option-id]').forEach(el => {
      el.addEventListener('click', () => {
        const optId = el.getAttribute('data-option-id');
        engine.setAnswer(currentQ.id, optId);
        render();
      });

      // Keyboard Accessibility
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const optId = el.getAttribute('data-option-id');
          engine.setAnswer(currentQ.id, optId);
          render();
        }
      });
    });

    // Navigation Buttons
    container.querySelector('#quest-back-btn')?.addEventListener('click', handleBack);
    container.querySelector('#quest-prev-btn')?.addEventListener('click', handleBack);

    container.querySelector('#quest-close-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#quest-next-btn')?.addEventListener('click', () => {
      if (engine.isCurrentQuestionValid()) {
        engine.next();
        render();
      }
    });
  }

  function handleBack() {
    if (contextHasHistory()) {
      engine.prev();
      render();
    } else {
      router.navigate(ROUTES.GUIDED_READING);
    }
  }

  function contextHasHistory() {
    return engine.currentActiveIndex > 0;
  }

  function handleSubmit() {
    // Transition to submitting state
    engine.stateMachine.transition(QUESTIONNAIRE_STATES.SUBMITTING);
    render();

    // Convert questionnaire answers to canonical PalmFeatureModel
    const featureModel = QuestionnaireFeatureAdapter.toPalmFeatureModel(engine.answers);

    // Synthesize structured reading dossier across 4 epistemic tiers
    const dossier = PalmInterpretationEngine.synthesize(featureModel);

    // Transition smoothly to Quick Report after brief synthesis celebration
    setTimeout(() => {
      reportTelemetry.logEvent(TELEMETRY_EVENTS.QUESTIONNAIRE_COMPLETED, { readingMethod: 'GUIDED_QUESTIONNAIRE' });
      engine.stateMachine.transition(QUESTIONNAIRE_STATES.COMPLETE);
      router.navigate(ROUTES.QUICK_REPORT, {
        featureModel,
        dossier,
        readingMethod: 'GUIDED_QUESTIONNAIRE'
      });
    }, 1800);
  }

  render();
}
