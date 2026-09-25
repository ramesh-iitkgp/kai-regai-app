/**
 * Kai RegAI — Questionnaire Engine
 * Phase: P7 — Palm Reading Questionnaire Engine
 * 
 * Central controller and headless execution engine:
 * - Dynamic question filtering based on conditional dependencies
 * - Immediate stale answer pruning upon ancestor value change
 * - Progressive disclosure and active question index tracking
 * - Review and submission validation
 */

import { QUESTIONNAIRE_QUESTIONS, QUESTION_CATEGORIES, QUESTION_TYPES } from './QuestionnaireSchema.js';
import { QuestionnaireStateMachine, QUESTIONNAIRE_STATES } from './QuestionnaireStateMachine.js';

export class QuestionnaireEngine {
  constructor(options = {}) {
    this.questions = options.questions || QUESTIONNAIRE_QUESTIONS;
    this.categories = options.categories || QUESTION_CATEGORIES;
    this.stateMachine = options.stateMachine || new QuestionnaireStateMachine();

    this.answers = { ...options.initialAnswers };
    this.currentActiveIndex = 0;
    this.listeners = new Set();

    // Prune and initialize context
    this.pruneStaleAnswers();
    this.syncContext();
  }

  getState() {
    return this.stateMachine.getState();
  }

  getContext() {
    return this.stateMachine.getContext();
  }

  subscribe(listener) {
    return this.stateMachine.subscribe(listener);
  }

  /**
   * Check if a specific question satisfies its conditional dependencies
   * @param {Object} question 
   * @returns {boolean}
   */
  isQuestionActive(question) {
    if (!question.showWhen) return true;

    const { questionId, in: inList, equals } = question.showWhen;
    const parentAnswer = this.answers[questionId];

    if (inList) {
      return inList.includes(parentAnswer);
    }
    if (equals !== undefined) {
      return parentAnswer === equals;
    }
    return true;
  }

  /**
   * Returns list of currently active questions under active dependency path
   * @returns {Object[]}
   */
  getActiveQuestions() {
    return this.questions.filter(q => this.isQuestionActive(q));
  }

  /**
   * Get the current active question object
   * @returns {Object|null}
   */
  getCurrentQuestion() {
    const activeQuestions = this.getActiveQuestions();
    if (this.currentActiveIndex < 0 || this.currentActiveIndex >= activeQuestions.length) {
      return null;
    }
    return activeQuestions[this.currentActiveIndex];
  }

  /**
   * Get total number of active questions
   * @returns {number}
   */
  getTotalActiveCount() {
    return this.getActiveQuestions().length;
  }

  /**
   * Prune stale answers if parent questions changed
   */
  pruneStaleAnswers() {
    let pruned = false;
    for (const q of this.questions) {
      if (!this.isQuestionActive(q) && this.answers[q.id] !== undefined) {
        delete this.answers[q.id];
        pruned = true;
      }
    }
    return pruned;
  }

  /**
   * Record answer for a question
   * @param {string} questionId 
   * @param {string|string[]} value 
   */
  setAnswer(questionId, value) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      console.warn(`[QuestionnaireEngine] Unknown question ID: ${questionId}`);
      return false;
    }

    // Handle multi-select toggle vs single-select assignment
    if (question.type === QUESTION_TYPES.MULTI_SELECT) {
      if (Array.isArray(value)) {
        this.answers[questionId] = value;
      } else {
        const current = Array.isArray(this.answers[questionId]) ? [...this.answers[questionId]] : [];
        if (value === 'NONE_OBSERVED') {
          this.answers[questionId] = ['NONE_OBSERVED'];
        } else {
          const filtered = current.filter(v => v !== 'NONE_OBSERVED');
          const idx = filtered.indexOf(value);
          if (idx >= 0) {
            filtered.splice(idx, 1);
          } else {
            filtered.push(value);
          }
          this.answers[questionId] = filtered.length > 0 ? filtered : ['NONE_OBSERVED'];
        }
      }
    } else {
      this.answers[questionId] = value;
    }

    // Prune any downstream answers whose showWhen criteria are no longer satisfied
    this.pruneStaleAnswers();

    // Adjust active index if out of bounds
    const activeCount = this.getTotalActiveCount();
    if (this.currentActiveIndex >= activeCount) {
      this.currentActiveIndex = Math.max(0, activeCount - 1);
    }

    this.syncContext();
    return true;
  }

  /**
   * Get answer for a question
   * @param {string} questionId 
   * @returns {*}
   */
  getAnswer(questionId) {
    return this.answers[questionId] ?? null;
  }

  /**
   * Check if current question is validly answered
   * @returns {boolean}
   */
  isCurrentQuestionValid() {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return false;
    if (!currentQ.required) return true;

    const ans = this.answers[currentQ.id];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  }

  /**
   * Check if all required active questions have been answered
   * @returns {boolean}
   */
  areAllRequiredAnswered() {
    const activeQuestions = this.getActiveQuestions();
    for (const q of activeQuestions) {
      if (q.required) {
        const ans = this.answers[q.id];
        if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Advance to the next active question or review screen
   */
  next() {
    if (!this.isCurrentQuestionValid()) {
      return false;
    }

    const activeCount = this.getTotalActiveCount();
    if (this.currentActiveIndex < activeCount - 1) {
      this.currentActiveIndex++;
      this.syncContext();
      return true;
    } else {
      // Reached the end -> transition to review
      if (this.stateMachine.canTransitionTo(QUESTIONNAIRE_STATES.REVIEW)) {
        this.stateMachine.transition(QUESTIONNAIRE_STATES.REVIEW, {
          isComplete: true
        });
      }
      return true;
    }
  }

  /**
   * Go back to previous active question or intro
   */
  prev() {
    if (this.stateMachine.getState() === QUESTIONNAIRE_STATES.REVIEW) {
      this.stateMachine.transition(QUESTIONNAIRE_STATES.IN_PROGRESS);
      return true;
    }

    if (this.currentActiveIndex > 0) {
      this.currentActiveIndex--;
      this.syncContext();
      return true;
    } else {
      if (this.stateMachine.canTransitionTo(QUESTIONNAIRE_STATES.INTRO)) {
        this.stateMachine.transition(QUESTIONNAIRE_STATES.INTRO);
        return true;
      }
      return false;
    }
  }

  /**
   * Jump directly to a question by ID (e.g. from review screen)
   * @param {string} questionId 
   */
  goToQuestion(questionId) {
    const active = this.getActiveQuestions();
    const idx = active.findIndex(q => q.id === questionId);
    if (idx >= 0) {
      this.currentActiveIndex = idx;
      if (this.stateMachine.getState() !== QUESTIONNAIRE_STATES.IN_PROGRESS) {
        this.stateMachine.transition(QUESTIONNAIRE_STATES.IN_PROGRESS);
      }
      this.syncContext();
      return true;
    }
    return false;
  }

  /**
   * Begin the questionnaire from intro
   */
  start() {
    if (this.stateMachine.canTransitionTo(QUESTIONNAIRE_STATES.INTRO)) {
      this.stateMachine.transition(QUESTIONNAIRE_STATES.INTRO);
    }
    this.stateMachine.transition(QUESTIONNAIRE_STATES.IN_PROGRESS);
    this.currentActiveIndex = 0;
    this.syncContext();
  }

  /**
   * Synchronize state machine context with engine progress
   */
  syncContext() {
    const activeQuestions = this.getActiveQuestions();
    const total = activeQuestions.length;
    const currentQ = this.getCurrentQuestion();
    const progressPct = total > 0 ? Math.round(((this.currentActiveIndex + 1) / total) * 100) : 0;

    this.stateMachine.updateContext({
      activeQuestionIndex: this.currentActiveIndex,
      totalActiveQuestions: total,
      progressPercentage: progressPct,
      currentQuestionId: currentQ?.id || null,
      currentCategoryId: currentQ?.category || null,
      answers: { ...this.answers }
    });
  }

  /**
   * Compile structured observations for the review screen
   * @returns {Object[]}
   */
  getReviewSummary() {
    const activeQuestions = this.getActiveQuestions();
    const summary = [];

    for (const q of activeQuestions) {
      const val = this.answers[q.id];
      let displayValue = 'Not answered';

      if (val !== undefined && val !== null) {
        if (q.type === QUESTION_TYPES.MULTI_SELECT && Array.isArray(val)) {
          displayValue = val.map(optId => {
            const opt = q.options.find(o => o.id === optId);
            return opt ? opt.label : optId;
          }).join(', ');
        } else {
          const opt = q.options?.find(o => o.id === val);
          displayValue = opt ? opt.label : String(val);
        }
      }

      summary.push({
        id: q.id,
        category: q.category,
        categoryTitle: this.categories[q.category]?.title || q.category,
        title: q.title,
        value: val,
        displayValue,
        answered: val !== undefined && val !== null
      });
    }

    return summary;
  }
}
