/**
 * Kai RegAI — Report Engine Master Export
 * Phase: P10 — Report Engine
 * 
 * "P8 DECIDES. P9 EXPLAINS. P10 PRESENTS."
 * Unifies report composition, validation, rendering (Web/Print/PDF),
 * social cards, and privacy-conscious telemetry.
 */

import { ReportModel, REPORT_TIERS } from './ReportSchema.js';
import { REPORT_THEME } from './ReportTheme.js';
import { ReportSchemaValidator } from './ReportSchemaValidator.js';
import { ReportContextBuilder } from './ReportContextBuilder.js';
import { ReportComposer } from './ReportComposer.js';
import { ReportSections } from './ReportSections.js';
import { ReportRenderer } from './ReportRenderer.js';
import { ReportExport } from './ReportExport.js';
import { ReportShare, SOCIAL_CARD_FORMATS } from './ReportShare.js';
import { ReportTelemetry, TELEMETRY_EVENTS, reportTelemetry } from './ReportTelemetry.js';

export {
  ReportModel,
  REPORT_TIERS,
  REPORT_THEME,
  ReportSchemaValidator,
  ReportContextBuilder,
  ReportComposer,
  ReportSections,
  ReportRenderer,
  ReportExport,
  ReportShare,
  SOCIAL_CARD_FORMATS,
  ReportTelemetry,
  TELEMETRY_EVENTS,
  reportTelemetry
};

/**
 * Master report creation pipeline
 * @param {Object} params
 * @param {import('../interpretation/InterpretationDossier.js').InterpretationDossier} params.dossier
 * @param {import('../narration/NarratedReading.js').NarratedReading} [params.narratedReading]
 * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} [params.featureModel]
 * @param {string} [params.tier='PREMIUM']
 * @param {string} [params.displayName]
 * @returns {ReportModel}
 */
export function createReport(params) {
  const startTime = Date.now();

  // 1. Build unified context
  const context = ReportContextBuilder.build(params);

  // 2. Compose canonical ReportModel
  const report = ReportComposer.compose(context);

  // 3. Pre-render integrity validation
  const validation = ReportSchemaValidator.validate(report);
  if (!validation.valid) {
    throw new Error(`Report validation failed: ${validation.errors.join('; ')}`);
  }

  // 4. Dispatch privacy-conscious telemetry event
  reportTelemetry.logEvent(TELEMETRY_EVENTS.REPORT_GENERATED, {
    reportTier: report.reportTier,
    readingMethod: report.readingMethod,
    durationMs: Date.now() - startTime
  });

  return report;
}
