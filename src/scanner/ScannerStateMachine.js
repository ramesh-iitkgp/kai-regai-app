/**
 * Kai RegAI — Scanner Finite State Machine
 * Phase: P6 — Hand Scanner Experience
 * 
 * Formal 16-state finite state machine orchestrating camera permissions,
 * live viewfinder tracking, quality evaluation, stabilization, countdown,
 * capture, CV inference, and result presentation.
 */

export const SCANNER_STATES = {
  INITIALIZING: 'INITIALIZING',
  CAMERA_PERMISSION_REQUIRED: 'CAMERA_PERMISSION_REQUIRED',
  CAMERA_READY: 'CAMERA_READY',
  SEARCHING_FOR_HAND: 'SEARCHING_FOR_HAND',
  HAND_DETECTED: 'HAND_DETECTED',
  PALM_ALIGNING: 'PALM_ALIGNING',
  QUALITY_CHECK: 'QUALITY_CHECK',
  STABILIZING: 'STABILIZING',
  READY: 'READY',
  COUNTDOWN: 'COUNTDOWN',
  CAPTURING: 'CAPTURING',
  PROCESSING: 'PROCESSING',
  VALIDATING: 'VALIDATING',
  SUCCESS: 'SUCCESS',
  RETAKE: 'RETAKE',
  ERROR: 'ERROR'
};

/**
 * Valid state transition graph
 */
export const VALID_TRANSITIONS = {
  [SCANNER_STATES.INITIALIZING]: [
    SCANNER_STATES.CAMERA_PERMISSION_REQUIRED,
    SCANNER_STATES.CAMERA_READY,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.CAMERA_PERMISSION_REQUIRED]: [
    SCANNER_STATES.CAMERA_READY,
    SCANNER_STATES.INITIALIZING,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.CAMERA_READY]: [
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.INITIALIZING,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.SEARCHING_FOR_HAND]: [
    SCANNER_STATES.HAND_DETECTED,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.INITIALIZING,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.HAND_DETECTED]: [
    SCANNER_STATES.PALM_ALIGNING,
    SCANNER_STATES.QUALITY_CHECK,
    SCANNER_STATES.STABILIZING,
    SCANNER_STATES.READY,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.PALM_ALIGNING]: [
    SCANNER_STATES.QUALITY_CHECK,
    SCANNER_STATES.STABILIZING,
    SCANNER_STATES.READY,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.HAND_DETECTED,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.QUALITY_CHECK]: [
    SCANNER_STATES.STABILIZING,
    SCANNER_STATES.READY,
    SCANNER_STATES.PALM_ALIGNING,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.RETAKE,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.STABILIZING]: [
    SCANNER_STATES.READY,
    SCANNER_STATES.STABILIZING,
    SCANNER_STATES.QUALITY_CHECK,
    SCANNER_STATES.PALM_ALIGNING,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.RETAKE,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.READY]: [
    SCANNER_STATES.COUNTDOWN,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.STABILIZING,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.COUNTDOWN]: [
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.STABILIZING,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.CAPTURING]: [
    SCANNER_STATES.PROCESSING,
    SCANNER_STATES.RETAKE,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.PROCESSING]: [
    SCANNER_STATES.VALIDATING,
    SCANNER_STATES.SUCCESS,
    SCANNER_STATES.RETAKE,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.VALIDATING]: [
    SCANNER_STATES.SUCCESS,
    SCANNER_STATES.RETAKE,
    SCANNER_STATES.ERROR
  ],
  [SCANNER_STATES.SUCCESS]: [
    SCANNER_STATES.INITIALIZING,
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.CAMERA_READY
  ],
  [SCANNER_STATES.RETAKE]: [
    SCANNER_STATES.SEARCHING_FOR_HAND,
    SCANNER_STATES.PALM_ALIGNING,
    SCANNER_STATES.CAPTURING,
    SCANNER_STATES.CAMERA_READY,
    SCANNER_STATES.INITIALIZING
  ],
  [SCANNER_STATES.ERROR]: [
    SCANNER_STATES.INITIALIZING,
    SCANNER_STATES.CAMERA_PERMISSION_REQUIRED,
    SCANNER_STATES.CAMERA_READY,
    SCANNER_STATES.SEARCHING_FOR_HAND
  ]
};

export class ScannerStateMachine {
  constructor(initialState = SCANNER_STATES.INITIALIZING, initialContext = {}) {
    this.currentState = initialState;
    this.context = {
      handSide: 'RIGHT',
      countdown: 3,
      stabilityCount: 0,
      stabilityTarget: 3,
      qualityScore: 0,
      feedbackMessage: 'Align your palm with the guide',
      guidanceDetail: [],
      diagnosticCode: null,
      visionResult: null,
      featureModel: null,
      capturedImage: null,
      errorMessage: null,
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

  /**
   * Deterministic state transition
   * @param {string} targetState 
   * @param {Object} [contextUpdates={}] 
   * @param {Object} [options={ strict: true }]
   * @returns {boolean} True if transition was accepted
   */
  transition(targetState, contextUpdates = {}, { strict = true } = {}) {
    if (!SCANNER_STATES[targetState]) {
      const msg = `[ScannerStateMachine] Invalid target state: ${targetState}`;
      console.warn(msg);
      if (strict) throw new Error(msg);
      return false;
    }

    const allowed = VALID_TRANSITIONS[this.currentState];
    if (!allowed || !allowed.includes(targetState)) {
      const msg = `[ScannerStateMachine] Invalid state transition from ${this.currentState} to ${targetState}`;
      console.warn(msg);
      if (strict) throw new Error(msg);
      return false;
    }

    const previousState = this.currentState;
    this.currentState = targetState;
    this.context = { ...this.context, ...contextUpdates };
    this.history.push({ state: targetState, timestamp: Date.now() });

    // Notify subscribers
    for (const listener of this.listeners) {
      try {
        listener(this.currentState, previousState, this.context);
      } catch (err) {
        console.error('[ScannerStateMachine] Listener error:', err);
      }
    }

    return true;
  }

  canTransitionTo(targetState) {
    if (!SCANNER_STATES[targetState]) return false;
    const allowed = VALID_TRANSITIONS[this.currentState];
    return Boolean(allowed && allowed.includes(targetState));
  }

  updateContext(contextUpdates = {}) {
    this.context = { ...this.context, ...contextUpdates };
    for (const listener of this.listeners) {
      try {
        listener(this.currentState, this.currentState, this.context);
      } catch (err) {
        console.error('[ScannerStateMachine] Listener error:', err);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(initialState = SCANNER_STATES.INITIALIZING, initialContext = {}) {
    this.currentState = initialState;
    this.context = {
      handSide: 'RIGHT',
      countdown: 3,
      stabilityCount: 0,
      stabilityTarget: 3,
      qualityScore: 0,
      feedbackMessage: 'Align your palm with the guide',
      guidanceDetail: [],
      diagnosticCode: null,
      visionResult: null,
      featureModel: null,
      capturedImage: null,
      errorMessage: null,
      ...initialContext
    };
    this.history = [{ state: initialState, timestamp: Date.now() }];
    for (const listener of this.listeners) {
      listener(this.currentState, null, this.context);
    }
  }
}
