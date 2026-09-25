/**
 * Kai RegAI — App Shell Orchestrator
 * Connects router, header, active screens, bottom nav, and modal stack.
 */

import { router } from './navigation/router.js';
import { ROUTES } from './navigation/routes.js';
import { renderAppHeader } from './components/AppHeader.js';
import { renderBottomNav } from './components/BottomNavigation.js';
import { renderPdfExportModal } from './components/PdfExportModal.js';
import { renderErrorCalibrationModal } from './components/ErrorCalibrationModal.js';
import { renderPaywallModal, attachPaywallListeners } from './components/PaywallModal.js';
import { createReport, ReportExport, ReportShare, reportTelemetry, TELEMETRY_EVENTS } from './report/index.js';

// Screens
import { renderSplashScreen } from './screens/SplashScreen.js';
import { renderHomeScreen } from './screens/HomeScreen.js';
import { renderScannerScreen } from './screens/ScannerScreen.js';
import { renderQuickReportScreen } from './screens/QuickReportScreen.js';
import { renderGuidedReadingScreen } from './screens/GuidedReadingScreen.js';
import { renderQuestionnaireScreen } from './screens/QuestionnaireScreen.js';
import { renderDetailedReportScreen } from './screens/DetailedReportScreen.js';
import { renderReadingsArchiveScreen } from './screens/ReadingsArchiveScreen.js';
import { renderLearnCodexScreen } from './screens/LearnCodexScreen.js';
import { renderProfileScreen } from './screens/ProfileScreen.js';
import { renderOfflineFallbackScreen } from './screens/OfflineFallbackScreen.js';

export class App {
  constructor(rootElement) {
    this.root = rootElement;
    this.headerContainer = null;
    this.screenContainer = null;
    this.bottomNavContainer = null;
    this.modalContainer = null;
  }

  mount() {
    this.root.innerHTML = `
      <div id="header-root"></div>
      <main id="screen-container" style="flex: 1; width: 100%; display: flex; flex-direction: column; position: relative;"></main>
      <div id="bottom-nav-root"></div>
      <div id="modal-root"></div>
    `;

    this.headerContainer = this.root.querySelector('#header-root');
    this.screenContainer = this.root.querySelector('#screen-container');
    this.bottomNavContainer = this.root.querySelector('#bottom-nav-root');
    this.modalContainer = this.root.querySelector('#modal-root');

    // Subscribe to router state changes
    router.subscribe((route, params, activeModal) => {
      this.renderRoute(route, params);
      this.renderModal(activeModal);
    });

    // Initialize router
    router.init();
  }

  renderRoute(route, params) {
    // 1. Header Handling
    if (route === ROUTES.SCANNER || route === ROUTES.SPLASH) {
      this.headerContainer.innerHTML = '';
      this.screenContainer.style.paddingTop = '0px';
    } else {
      renderAppHeader(this.headerContainer);
      this.screenContainer.style.paddingTop = 'var(--header-height)';
    }

    // 2. Screen Mounting
    switch (route) {
      case ROUTES.SPLASH:
        renderSplashScreen(this.screenContainer);
        break;
      case ROUTES.SCANNER:
        renderScannerScreen(this.screenContainer);
        break;
      case ROUTES.QUICK_REPORT:
        renderQuickReportScreen(this.screenContainer, params);
        break;
      case ROUTES.GUIDED_READING:
        renderGuidedReadingScreen(this.screenContainer, params);
        break;
      case ROUTES.QUESTIONNAIRE:
        renderQuestionnaireScreen(this.screenContainer, params);
        break;
      case ROUTES.DETAILED_REPORT:
        renderDetailedReportScreen(this.screenContainer, params);
        break;
      case ROUTES.READINGS:
        renderReadingsArchiveScreen(this.screenContainer, params);
        break;
      case ROUTES.LEARN:
        renderLearnCodexScreen(this.screenContainer, params);
        break;
      case ROUTES.PROFILE:
        renderProfileScreen(this.screenContainer, params);
        break;
      case ROUTES.OFFLINE:
        renderOfflineFallbackScreen(this.screenContainer, params);
        break;
      case ROUTES.HOME:
      default:
        renderHomeScreen(this.screenContainer);
        break;
    }

    // 3. Bottom Nav Handling
    renderBottomNav(this.bottomNavContainer, route);

    // Scroll to top upon route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  renderModal(activeModal) {
    if (!activeModal) {
      this.modalContainer.innerHTML = '';
      return;
    }

    if (activeModal.id === 'pdf_export') {
      const dossier = activeModal.payload?.dossier || activeModal.payload || mockReadings[1];
      const report = createReport({ dossier, tier: 'PREMIUM' });

      this.modalContainer.innerHTML = renderPdfExportModal({
        readingTitle: report.summary.title,
        onClose: () => router.closeModal(),
        onDownload: () => {
          ReportExport.triggerBrowserPdfPrint(report);
          reportTelemetry.logEvent(TELEMETRY_EVENTS.PDF_EXPORTED, { reportTier: 'PREMIUM' });
          router.closeModal();
        }
      });

      this.modalContainer.querySelector('#modal-close-x-btn')?.addEventListener('click', () => {
        router.closeModal();
      });

      this.modalContainer.querySelector('#modal-download-pdf-btn')?.addEventListener('click', () => {
        ReportExport.triggerBrowserPdfPrint(report);
        reportTelemetry.logEvent(TELEMETRY_EVENTS.PDF_EXPORTED, { reportTier: 'PREMIUM' });
        router.closeModal();
      });

      this.modalContainer.querySelector('#modal-share-pdf-btn')?.addEventListener('click', async () => {
        await ReportShare.shareCard({ report, format: '1:1' });
        reportTelemetry.logEvent(TELEMETRY_EVENTS.REPORT_SHARED, { reportTier: 'PREMIUM', format: '1:1' });
        router.closeModal();
      });

      this.modalContainer.querySelector('#pdf-modal-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'pdf-modal-backdrop') router.closeModal();
      });
    }

    if (activeModal.id === 'error_calibration') {
      this.modalContainer.innerHTML = renderErrorCalibrationModal({
        errorType: activeModal.payload?.errorType || 'LOW_LIGHT',
        onRetry: () => {
          router.closeModal();
          router.navigate(ROUTES.SCANNER);
        },
        onSwitchToGuided: () => {
          router.closeModal();
          router.navigate(ROUTES.GUIDED_READING);
        },
        onClose: () => router.closeModal()
      });

      this.modalContainer.querySelector('#error-retry-btn')?.addEventListener('click', () => {
        router.closeModal();
        router.navigate(ROUTES.SCANNER);
      });

      this.modalContainer.querySelector('#error-guided-btn')?.addEventListener('click', () => {
        router.closeModal();
        router.navigate(ROUTES.GUIDED_READING);
      });
    }

    if (activeModal.id === 'paywall') {
      const payload = activeModal.payload || {};
      this.modalContainer.innerHTML = renderPaywallModal(payload);
      attachPaywallListeners(this.modalContainer, payload);
    }
  }
}
