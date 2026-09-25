/**
 * Kai RegAI — Questionnaire Finite State Machine
 * Phase: P7 — Palm Reading Questionnaire Engine
 * 
 * Formal 7-state finite state machine orchestrating questionnaire lifecycle:
 * INITIALIZING -> INTRO -> IN_PROGRESS -> REVIEW -> SUBMITTING -> COMPLETE -> ERROR
 */

export const QUESTIONNAIRE_STATES = {
  INITIALIZING: 'INITIALIZING',
  INTRO: 'INTRO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  SUBMITTING: 'SUBMITTING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR'
};

export const VALID_TRANSITIONS = {
  [QUESTIONNAIRE_STATES.INITIALIZING]: [
    QUESTIONNAIRE_STATES.INTRO,
    QUESTIONNAIRE_STATES.IN_PROGRESS,
    QUESTIONNAIRE_STATES.ERROR
  ],
  [QUESTIONNAIRE_STATES.INTRO]: [
    QUESTIONNAIRE_STATES.IN_PROGRESS,
    QUESTIONNAIRE_STATES.ERROR
  ],
  [QUESTIONNAIRE_STATES.IN_PROGRESS]: [
    QUESTIONNAIRE_STATES.REVIEW,
    QUESTIONNAIRE_STATES.INTRO,
    QUESTIONNAIRE_STATES.SUBMITTING,
    QUESTIONNAIRE_STATES.ERROR
  ],
  [QUESTIONNAIRE_STATES.REVIEW]: [
    QUESTIONNAIRE_STATES.IN_PROGRESS,
    QUESTIONNAIRE_STATES.SUBMITTING,
    QUESTIONNAIRE_STATES.ERROR
  ],
  [QUESTIONNAIRE_STATES.SUBMITTING]: [
    QUESTIONNAIRE_STATES.COMPLETE,
    QUESTIONNAIRE_STATES.REVIEW,
    QUESTIONNAIRE_STATES.ERROR
  ],
  [QUESTIONNAIRE_STATES.COMPLETE]: [
    QUESTIONNAIRE_STATES.INITIALIZING,
    QUESTIONNAIRE_STATES.INTRO,
    QUESTIONNAIRE_STATES.IN_PROGRESS
  ],
  [QUESTIONNAIRE_STATES.ERROR]: [
    QUESTIONNAIRE_STATES.INITIALIZING,
    QUESTIONNAIRE_STATES.INTRO,
    QUESTIONNAIRE_STATES.IN_PROGRESS,
    QUESTIONNAIRE_STATES.REVIEW
  ]
};

export class QuestionnaireStateMachine {
  constructor(initialState = QUESTIONNAIRE_STATES.INITIALIZING, initialContext = {}) {
    this.currentState = initialState;
    this.context = {
      activeQuestionIndex: 0,
      totalActiveQuestions: 0,
      categoryProgress: {},
      isComplete: false,
      validationErrors: [],
      ...initialContext
    };
    this.history = [{ state: initialState, timestamp: Date.now() }];
    this.listeners = new Set();
  }

  getState() {
    return this.currentState;
  }

  getContext() {
    return { ...this.context };
  }

  canTransitionTo(targetState) {
    if (!QUESTIONNAIRE_STATES[targetState]) return false;
    const allowed = VALID_TRANSITIONS[this.currentState];
    return Boolean(allowed && allowed.includes(targetState));
  }

  /**
   * Deterministic state transition
   * @param {string} targetState 
   * @param {Object} [contextUpdates={}] 
   * @param {Object} [options={ strict: true }]
   * @returns {boolean}
   */
  transition(targetState, contextUpdates = {}, { strict = false } = {}) {
    if (!QUESTIONNAIRE_STATES[targetState]) {
      const msg = `[QuestionnaireStateMachine] Invalid target state: ${targetState}`;
      console.warn(msg);
      if (strict) throw new Error(msg);
      return false;
    }

    const allowed = VALID_TRANSITIONS[this.currentState];
    if (!allowed || !allowed.includes(targetState)) {
      const msg = `[QuestionnaireStateMachine] Invalid state transition from ${this.currentState} to ${targetState}`;
      console.warn(msg);
      if (strict) throw new Error(msg);
      return false;
    }

    const previousState = this.currentState;
    this.currentState = targetState;
    this.context = { ...this.context, ...contextUpdates };
    this.history.push({ state: targetState, timestamp: Date.now() });

    for (const listener of this.listeners) {
      try {
        listener(this.currentState, previousState, this.context);
      } catch (err) {
        console.error('[QuestionnaireStateMachine] Listener error:', err);
      }
    }

    return true;
  }

  updateContext(contextUpdates = {}) {
    this.context = { ...this.context, ...contextUpdates };
    for (const listener of this.listeners) {
      try {
        listener(this.currentState, this.currentState, this.context);
      } catch (err) {
        console.error('[QuestionnaireStateMachine] Listener error:', err);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(initialState = QUESTIONNAIRE_STATES.INITIALIZING, initialContext = {}) {
    this.currentState = initialState;
    this.context = {
      activeQuestionIndex: 0,
      totalActiveQuestions: 0,
      categoryProgress: {},
      isComplete: false,
      validationErrors: [],
      ...initialContext
    };
    this.history = [{ state: initialState, timestamp: Date.now() }];
    for (const listener of this.listeners) {
      listener(this.currentState, null, this.context);
    }
  }
}
