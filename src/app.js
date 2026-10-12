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
import { renderPersonalForecastModal, attachPersonalForecastListeners } from './components/PersonalForecastModal.js';
import { renderPersonalForecastInputModal, attachPersonalForecastInputListeners } from './components/PersonalForecastInputModal.js';
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
import { renderPersonalForecastScreen } from './screens/PersonalForecastScreen.js';
import { renderAstrologerChatScreen } from './screens/AstrologerChatScreen.js';
import { renderFaceScannerScreen } from './screens/FaceScannerScreen.js';
import { renderFaceReportScreen } from './screens/FaceReportScreen.js';
import { renderLineCalibratorScreen } from './screens/LineCalibratorScreen.js';
import { renderAskOracleScreen } from './oracle/screens/AskOracleScreen.js';
import { renderTarotReadingScreen } from './tarot/screens/TarotReadingScreen.js';

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

    // Listen for language changes across the app
    window.addEventListener('kai:language-changed', () => {
      this.renderRoute(router.currentRoute, router.currentParams);
    });

    // Initialize router
    router.init();
  }

  renderRoute(route, params) {
    // 1. Header Handling
    if (
      route === ROUTES.SCANNER || 
      route === ROUTES.SPLASH || 
      route === ROUTES.FORECAST || 
      route === ROUTES.CHAT || 
      route === ROUTES.FACE_SCANNER || 
      route === ROUTES.FACE_REPORT ||
      route === ROUTES.GUIDED_READING ||
      route === ROUTES.QUESTIONNAIRE ||
      route === ROUTES.CALIBRATOR ||
      route === ROUTES.ORACLE
    ) {
      this.headerContainer.innerHTML = '';
      this.screenContainer.style.paddingTop = '0px';
      this.screenContainer.style.height = (route === ROUTES.FORECAST || route === ROUTES.CHAT || route === ROUTES.FACE_SCANNER || route === ROUTES.GUIDED_READING || route === ROUTES.QUESTIONNAIRE || route === ROUTES.CALIBRATOR || route === ROUTES.ORACLE) ? '100vh' : 'auto';
      this.screenContainer.style.minHeight = '100vh';
    } else {
      renderAppHeader(this.headerContainer);
      this.screenContainer.style.paddingTop = 'var(--header-height)';
      this.screenContainer.style.height = 'auto';
      this.screenContainer.style.minHeight = 'auto';
    }

    // 2. Screen Mounting
    switch (route) {
      case ROUTES.SPLASH:
        renderSplashScreen(this.screenContainer);
        break;
      case ROUTES.SCANNER:
        renderScannerScreen(this.screenContainer);
        break;
      case ROUTES.FACE_SCANNER:
        renderFaceScannerScreen(this.screenContainer, params);
        break;
      case ROUTES.FACE_REPORT:
        renderFaceReportScreen(this.screenContainer, params);
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
      case ROUTES.FORECAST:
        renderPersonalForecastScreen(this.screenContainer, params);
        break;
      case ROUTES.CHAT:
        renderAstrologerChatScreen(this.screenContainer, params);
        break;
      case ROUTES.CALIBRATOR:
        renderLineCalibratorScreen(this.screenContainer, params);
        break;
      case ROUTES.ORACLE:
        renderAskOracleScreen(this.screenContainer, params);
        break;
      case ROUTES.TAROT:
        renderTarotReadingScreen(this.screenContainer, params);
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

    if (activeModal.id === 'personal_forecast') {
      const payload = activeModal.payload || {};
      const launchCorrelatePaywall = () => {
        router.closeModal();
        router.openModal('paywall', {
          featureKey: 'kai_daily_correlate',
          productId: 'kai_daily_correlate',
          onSuccess: () => {
            router.closeModal();
            router.navigate(ROUTES.SCANNER);
          }
        });
      };
      this.modalContainer.innerHTML = renderPersonalForecastModal({
        rashi: payload.rashi,
        onClose: () => router.closeModal(),
        onScanCorrelate: launchCorrelatePaywall
      });
      attachPersonalForecastListeners(this.modalContainer, {
        onClose: () => router.closeModal(),
        onScanCorrelate: launchCorrelatePaywall,
        onRashiChange: (newRashi) => {
          router.openModal('personal_forecast', { rashi: newRashi });
        }
      });
    }

    if (activeModal.id === 'forecast_context_input') {
      const handleContextSubmit = () => {
        router.closeModal();
        if (router.currentRoute === ROUTES.CHAT) {
          this.renderRoute(ROUTES.CHAT, router.routeParams);
        } else {
          router.navigate(ROUTES.FORECAST);
        }
      };

      this.modalContainer.innerHTML = renderPersonalForecastInputModal({
        onClose: () => router.closeModal(),
        onSubmit: handleContextSubmit
      });
      attachPersonalForecastInputListeners(this.modalContainer, {
        onClose: () => router.closeModal(),
        onSubmit: handleContextSubmit
      });
    }
  }
}
