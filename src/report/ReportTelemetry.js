/**
 * Kai RegAI — Privacy-Conscious Report Telemetry Engine
 * Phase: P10 — Report Engine
 * 
 * Tracks essential product interaction metrics with strict privacy safeguards:
 * - Zero biometric data: never captures image bytes, polylines, or coordinates
 * - Zero PII: never transmits names, emails, or personal questionnaire answers
 * - Non-blocking: failures in telemetry never affect report generation or UI rendering
 */

export const TELEMETRY_EVENTS = {
  // P10 base events
  REPORT_GENERATED: 'report_generated',
  REPORT_VIEWED: 'report_viewed',
  SECTION_OPENED: 'section_opened',
  PDF_EXPORTED: 'pdf_exported',
  SHARE_CARD_GENERATED: 'share_card_generated',
  REPORT_SHARED: 'report_shared',
  // P16 conversion funnel events
  LANDING_VIEW: 'landing_view',
  START_READING: 'start_reading',
  SCANNER_OPEN: 'scanner_open',
  HAND_DETECTED: 'hand_detected',
  CAPTURE_SUCCESS: 'capture_success',
  CAPTURE_RETAKE: 'capture_retake',
  QUESTIONNAIRE_STARTED: 'questionnaire_started',
  QUESTIONNAIRE_COMPLETED: 'questionnaire_completed',
  QUICK_REPORT_VIEW: 'quick_report_view',
  DETAILED_REPORT_VIEW: 'detailed_report_view',
  PAYWALL_VIEW: 'paywall_view',
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_SUCCESS: 'purchase_success',
  PURCHASE_FAILED: 'purchase_failed',
  RESTORE_STARTED: 'restore_started',
  RESTORE_SUCCESS: 'restore_success',
  READING_SAVED: 'reading_saved'
};

export class ReportTelemetry {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.eventBuffer = [];
    this.customSink = options.sink || null;
  }

  /**
   * Log an event safely
   * @param {string} eventName - One of TELEMETRY_EVENTS
   * @param {Object} [properties={}] - Privacy-safe metadata
   */
  logEvent(eventName, properties = {}) {
    if (!this.enabled) return;

    try {
      // Filter out any potential biometric or sensitive properties
      const sanitized = {
        event: eventName,
        timestamp: new Date().toISOString(),
        reportTier: properties.reportTier || 'UNKNOWN',
        readingMethod: properties.readingMethod || 'UNKNOWN',
        durationMs: properties.durationMs || 0,
        sectionId: properties.sectionId || null,
        format: properties.format || null,
        screen: properties.screen || null,
        productId: properties.productId || null,
        currency: properties.currency || null,
        success: properties.success ?? null
      };

      this.eventBuffer.push(sanitized);

      if (this.customSink && typeof this.customSink === 'function') {
        this.customSink(sanitized);
      }
    } catch {
      // Telemetry must never crash application flow
    }
  }

  getRecentEvents() {
    return [...this.eventBuffer];
  }

  clear() {
    this.eventBuffer = [];
  }
}

// Global telemetry singleton
export const reportTelemetry = new ReportTelemetry();
