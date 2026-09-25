/**
 * ReadingSession Model (P2 Session Lifecycle Contract)
 * Source of truth: docs/p2/STATE_MACHINE.md & docs/p2/DATA_FLOW.md
 */

import { PalmFeatureModel } from './PalmFeatureModel.js';

export const ReadingMode = {
  MODE_1_SCANNER: 'MODE_1_SCANNER',
  MODE_2_GUIDED: 'MODE_2_GUIDED'
};

export const SessionStatus = {
  INITIALIZING: 'INITIALIZING',
  VIEWFINDER_ACTIVE: 'VIEWFINDER_ACTIVE',
  SCANNING_PROGRESSIVE: 'SCANNING_PROGRESSIVE',
  QUESTIONNAIRE_ACTIVE: 'QUESTIONNAIRE_ACTIVE',
  SYNTHESIZING_REPORT: 'SYNTHESIZING_REPORT',
  COMPLETED: 'COMPLETED',
  ERROR_RECOVERY: 'ERROR_RECOVERY'
};

export class ReadingSession {
  constructor(options = {}) {
    this.session_id = options.session_id || `SES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.user_id = options.user_id || 'USR-CURRENT';
    this.mode = options.mode || ReadingMode.MODE_1_SCANNER;
    this.hand_side = options.hand_side || 'RIGHT';
    this.created_at = options.created_at || new Date().toISOString();
    this.status = options.status || SessionStatus.INITIALIZING;
    this.quality_score = options.quality_score ?? 0;
    this.palm_feature_model = options.palm_feature_model || new PalmFeatureModel({ session_id: this.session_id });
    this.questionnaire_answers = options.questionnaire_answers || {};
    this.report = options.report || null;
    this.error_code = options.error_code || null;
  }

  setQuality(score) {
    this.quality_score = score;
    this.palm_feature_model.quality_score = score;
  }

  transitionTo(newStatus) {
    this.status = newStatus;
  }
}
