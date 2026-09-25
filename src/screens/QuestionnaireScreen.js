/**
 * QuestionnaireScreen Component — Mode 2 Guided Visual Questions & Synthesis
 * Matches Stitch: design/stitch/kai_regai_questionnaire_thumb_flexibility/
 * Source of truth: docs/p2/QUESTIONNAIRE_FLOW.md
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { renderQuestionnaireStep, questionnaireModules } from '../components/QuestionnaireWidget.js';

export function renderQuestionnaireScreen(container) {
  let currentStepIdx = 0;
  const userAnswers = {};
  let isSynthesizing = false;

  function render() {
    if (isSynthesizing) {
      renderSynthesisTransition();
      return;
    }

    const currentModule = questionnaireModules[currentStepIdx];
    const currentAnswer = userAnswers[currentModule.id] || null;

    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button id="quest-back-btn" class="kai-btn-icon" aria-label="Previous step">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            Guided Chiromancy
          </span>
          <button id="quest-close-btn" class="kai-btn-icon" aria-label="Cancel">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Render Current Module Widget -->
        <div id="quest-widget-container">
          ${renderQuestionnaireStep(currentStepIdx, currentAnswer)}
        </div>

        <!-- Navigation Buttons -->
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="quest-prev-btn" class="kai-btn kai-btn-secondary" style="flex: 1;" ${currentStepIdx === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
            <span>Back</span>
          </button>
          <button id="quest-next-btn" class="kai-btn kai-btn-primary" style="flex: 2;" ${!currentAnswer ? 'disabled style="opacity: 0.5;"' : ''}>
            <span>${currentStepIdx === questionnaireModules.length - 1 ? 'Synthesize Dossier' : 'Next Step'}</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

      </div>
    `;

    // Handle Option Selection
    container.querySelectorAll('[data-opt-id]').forEach(el => {
      el.addEventListener('click', () => {
        const optId = el.getAttribute('data-opt-id');
        userAnswers[currentModule.id] = optId;
        render();
      });
    });

    container.querySelector('#quest-back-btn')?.addEventListener('click', handleBack);
    container.querySelector('#quest-prev-btn')?.addEventListener('click', handleBack);

    container.querySelector('#quest-close-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    container.querySelector('#quest-next-btn')?.addEventListener('click', () => {
      if (currentStepIdx < questionnaireModules.length - 1) {
        currentStepIdx++;
        render();
      } else {
        isSynthesizing = true;
        render();
      }
    });
  }

  function handleBack() {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      render();
    } else {
      router.navigate(ROUTES.GUIDED_READING);
    }
  }

  function renderSynthesisTransition() {
    container.innerHTML = `
      <div style="position: relative; width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; background: var(--color-background); overflow: hidden;">
        
        <!-- Sacred Geometry Constellation (Rotating Mandala) -->
        <div style="position: relative; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; animation: spin 12s linear infinite;" fill="none">
            <circle cx="100" cy="100" r="90" stroke="#e4c276" stroke-width="1.5" stroke-dasharray="4 6"/>
            <circle cx="100" cy="100" r="70" stroke="#cabeff" stroke-width="1.2" stroke-dasharray="2 4"/>
            <circle cx="100" cy="100" r="50" stroke="#47d6ff" stroke-width="1"/>
            <polygon points="100,20 180,150 20,150" stroke="#e4c276" stroke-width="1" opacity="0.6"/>
            <polygon points="100,180 180,50 20,50" stroke="#cabeff" stroke-width="1" opacity="0.6"/>
          </svg>
          <div style="position: absolute; width: 80px; height: 80px; border-radius: 9999px; background: rgba(147,125,255,0.2); filter: blur(16px);" class="glow-pulsing"></div>
          <span class="material-symbols-outlined" style="position: absolute; font-size: 36px; color: var(--color-secondary);">auto_awesome</span>
        </div>

        <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high); margin-top: 32px;">
          Synthesizing Sacred Dossier
        </h2>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 8px; max-width: 300px;">
          Correlating optical biometric creases with classic Hasta Samudrika rules and modern chiromancy...
        </p>

        <div style="margin-top: 24px; display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: var(--radius-full); background: var(--color-surface-container); border: 1px solid var(--color-border-subtle);">
          <span style="width: 8px; height: 8px; border-radius: 9999px; background: var(--color-secondary);" class="glow-pulsing"></span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            Constructing 7 Chapters
          </span>
        </div>

      </div>
    `;

    // Simulate 2.5 second synthesis then transition to Detailed Report
    setTimeout(() => {
      router.navigate(ROUTES.DETAILED_REPORT, { id: 'RDG-2026-0922-002' });
    }, 2500);
  }

  render();
}
