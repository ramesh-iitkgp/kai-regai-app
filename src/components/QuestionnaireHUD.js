/**
 * Kai RegAI — Questionnaire HUD & Screen Components
 * Phase: P7 — Palm Reading Questionnaire Engine
 * 
 * Renders questionnaire steps, option cards, progress telemetry,
 * review summary, and dossier synthesis animations.
 */

import { QUESTION_TYPES } from '../questionnaire/QuestionnaireSchema.js';
import { i18n } from '../services/i18n.js';
import { getLocalizedCategoryName, getLocalizedQuestionData } from '../services/QuestionnaireLocalization.js';

export class QuestionnaireHUD {
  static getLocalizedCategory(catKey) {
    return getLocalizedCategoryName(catKey, i18n.getLanguage());
  }

  static getLocalizedQuestion(question) {
    return getLocalizedQuestionData(question, i18n.getLanguage());
  }

  /**
   * Render single active question step
   * @param {Object} rawQuestion - Question schema object
   * @param {*} currentAnswer - Currently recorded answer(s)
   * @param {Object} context - Engine state context
   * @returns {string} HTML markup
   */
  static renderQuestion(rawQuestion, currentAnswer, context) {
    const question = QuestionnaireHUD.getLocalizedQuestion(rawQuestion);
    const { activeQuestionIndex, totalActiveQuestions, progressPercentage } = context;
    const isMulti = question.type === QUESTION_TYPES.MULTI_SELECT;

    return `
      <div class="questionnaire-step-container" style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Step Progress Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
              ${i18n.t('quest_step')} ${String(activeQuestionIndex + 1).padStart(2, '0')} ${i18n.t('quest_of')} ${String(totalActiveQuestions).padStart(2, '0')}
            </span>
            <span style="font-family: monospace; font-size: 11px; color: var(--color-on-surface-variant);">
              ${progressPercentage}% ${i18n.t('quest_complete')}
            </span>
          </div>
          <div style="width: 100%; height: 4px; background: var(--color-surface-container-highest); border-radius: 9999px; overflow: hidden;">
            <div style="width: ${progressPercentage}%; height: 100%; background: var(--gradient-primary-btn); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Question Header -->
        <div>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            ${QuestionnaireHUD.getLocalizedCategory(rawQuestion.category)}
          </span>
          <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--color-text-high); margin-top: 4px; line-height: 1.3;">
            ${question.title}
          </h2>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.5;">
            ${question.subtitle}
          </p>
        </div>

        <!-- Educational Illustration Diagram Box -->
        <div style="width: 100%; height: 120px; border-radius: var(--radius-md); background: var(--color-surface-container-lowest); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
          <svg viewBox="0 0 240 100" style="width: 100%; height: 100%; opacity: 0.85;" fill="none">
            <circle cx="120" cy="50" r="38" fill="rgba(147, 125, 255, 0.08)"/>
            <path d="M 50 75 Q 120 25 190 75" stroke="#e4c276" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="120" cy="50" r="5" fill="#e4c276"/>
            <path d="M 80 50 L 160 50" stroke="#00D2FF" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="160" cy="50" r="3" fill="#00D2FF"/>
          </svg>
          <span style="position: absolute; bottom: 6px; font-size: 10px; color: var(--color-outline); letter-spacing: 0.05em; text-transform: uppercase;">
            ${i18n.t('quest_neutral_guide')}
          </span>
        </div>

        <!-- Option Choices -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${question.options.map(opt => {
            const isSelected = isMulti 
              ? (Array.isArray(currentAnswer) && currentAnswer.includes(opt.id))
              : (currentAnswer === opt.id);

            return `
              <div class="kai-card option-card ${isSelected ? 'kai-card-gold-rim' : ''}" 
                   data-option-id="${opt.id}"
                   role="${isMulti ? 'checkbox' : 'radio'}"
                   aria-checked="${isSelected}"
                   tabindex="0"
                   style="padding: 14px 16px; cursor: pointer; display: flex; align-items: flex-start; gap: 12px; background: ${isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)'}; transition: all 0.2s ease;">
                
                <!-- Radio / Checkbox Indicator -->
                <div style="width: 20px; height: 20px; border-radius: ${isMulti ? '4px' : '9999px'}; border: 1.5px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-outline)'}; display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0; background: ${isSelected ? 'rgba(228,194,118,0.15)' : 'transparent'};">
                  ${isSelected ? `<span class="material-symbols-outlined" style="font-size: 14px; color: var(--color-secondary);">${isMulti ? 'check' : 'circle'}</span>` : ''}
                </div>

                <div style="flex: 1;">
                  <h4 style="font-size: 14px; font-weight: 600; color: ${isSelected ? 'var(--color-secondary)' : 'var(--color-text-high)'};">
                    ${opt.label}
                  </h4>
                  ${opt.desc ? `
                    <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px; line-height: 1.4;">
                      ${opt.desc}
                    </p>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Action Navigation Bar -->
        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button id="quest-prev-btn" class="kai-btn kai-btn-secondary" style="flex: 1;">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>${i18n.t('quest_back')}</span>
          </button>
          
          <button id="quest-next-btn" class="kai-btn kai-btn-primary" style="flex: 2;" ${!currentAnswer ? 'disabled style="opacity: 0.5;"' : ''}>
            <span>${activeQuestionIndex === totalActiveQuestions - 1 ? i18n.t('quest_review_obs') : i18n.t('quest_continue')}</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

      </div>
    `;
  }

  /**
   * Render review and confirmation summary
   * @param {Object[]} summaryItems 
   * @returns {string}
   */
  static renderReview(summaryItems) {
    return `
      <div class="questionnaire-review-container" style="display: flex; flex-direction: column; gap: 20px;">
        
        <div>
          <span class="kai-badge kai-badge-tertiary" style="font-size: 10px;">
            ${i18n.t('quest_obs_verification')}
          </span>
          <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high); margin-top: 6px;">
            ${i18n.t('quest_review_title')}
          </h2>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.5;">
            ${i18n.t('quest_review_sub')}
          </p>
        </div>

        <!-- Grouped Observations -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${summaryItems.map(item => `
            <div class="kai-card" style="padding: 14px 16px; background: var(--color-surface-container); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div style="flex: 1;">
                <span style="font-size: 10px; font-weight: 700; color: var(--color-outline); text-transform: uppercase;">
                  ${item.categoryTitle}
                </span>
                <h4 style="font-size: 13px; font-weight: 600; color: var(--color-text-high); margin-top: 2px;">
                  ${item.title}
                </h4>
                <p style="font-size: 12px; color: var(--color-secondary); margin-top: 2px;">
                  ${item.displayValue}
                </p>
              </div>

              <button class="kai-btn-icon edit-question-btn" data-edit-id="${item.id}" aria-label="Edit ${item.title}">
                <span class="material-symbols-outlined" style="font-size: 18px; color: var(--color-secondary);">edit</span>
              </button>
            </div>
          `).join('')}
        </div>

        <!-- Final Action Bar -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
          <button id="quest-submit-btn" class="kai-btn kai-btn-gold" type="button">
            <span class="material-symbols-outlined">auto_awesome</span>
            <span>${i18n.t('quest_synthesize_btn')}</span>
          </button>
          
          <button id="quest-review-back-btn" class="kai-btn kai-btn-secondary" type="button">
            <span>${i18n.t('quest_return_btn')}</span>
          </button>
        </div>

      </div>
    `;
  }

  /**
   * Render synthesis animation screen
   * @returns {string}
   */
  static renderSynthesisScreen() {
    return `
      <div style="position: relative; width: 100%; min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; overflow: hidden;">
        
        <!-- Sacred Geometry Synthesis Animation -->
        <div style="position: relative; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; animation: spin 14s linear infinite;" fill="none">
            <circle cx="100" cy="100" r="90" stroke="#e4c276" stroke-width="1.5" stroke-dasharray="4 6"/>
            <circle cx="100" cy="100" r="70" stroke="#cabeff" stroke-width="1.2" stroke-dasharray="2 4"/>
            <circle cx="100" cy="100" r="50" stroke="#47d6ff" stroke-width="1"/>
            <polygon points="100,20 180,150 20,150" stroke="#e4c276" stroke-width="1" opacity="0.6"/>
            <polygon points="100,180 180,50 20,50" stroke="#cabeff" stroke-width="1" opacity="0.6"/>
          </svg>
          <div style="position: absolute; width: 90px; height: 90px; border-radius: 9999px; background: rgba(228,194,118,0.15); filter: blur(20px);" class="glow-pulsing"></div>
          <span class="material-symbols-outlined" style="position: absolute; font-size: 38px; color: var(--color-secondary);">auto_awesome</span>
        </div>

        <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--color-text-high); margin-top: 32px;">
          ${i18n.t('quest_synthesizing_title')}
        </h2>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 8px; max-width: 320px; line-height: 1.5;">
          ${i18n.t('quest_synthesizing_desc')}
        </p>

        <div style="margin-top: 24px; display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: var(--radius-full); background: var(--color-surface-container); border: 1px solid var(--color-border-subtle);">
          <span style="width: 8px; height: 8px; border-radius: 9999px; background: var(--color-secondary);" class="glow-pulsing"></span>
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">
            ${i18n.t('quest_eval_epistemic')}
          </span>
        </div>

      </div>
    `;
  }
}
