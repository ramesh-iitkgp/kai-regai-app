/**
 * AskOracleScreen Component — Dedicated Mystical Oracle Experience
 * Proprietary Kai RegAI Feature:
 * - Indian traditional wisdom + palmistry aesthetics + intuition + reflection
 * - Dark obsidian sphere with internal glowing palm creases
 * - Phased ceremonial consultation animation (3.5-4s)
 * - Safe, non-deterministic guidance on sensitive queries
 * - Cross-sell into core Palm Reading
 */

import { router } from '../../navigation/router.js';
import { ROUTES } from '../../navigation/routes.js';
import { oracleEngine } from '../engine/oracleEngine.js';
import { renderOracleSphere } from '../components/OracleSphere.js';
import { renderOracleResultCard } from '../components/OracleResultCard.js';
import { renderOracleShareModal } from '../components/OracleShareModal.js';
import { renderOracleInfoSheet } from '../components/OracleInfoSheet.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../../report/ReportTelemetry.js';

export const SUGGESTED_QUESTIONS = [
  'Will I find love soon?',
  'Should I begin something new?',
  'Is this the right time for a change?',
  'Should I trust my instincts?',
  'Will this opportunity bring growth?',
  'What should I focus on right now?'
];

export function renderAskOracleScreen(container, params = {}) {
  // Telemetry log
  reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'ask_the_oracle' });

  // State Management
  let screenState = 'IDLE'; // 'IDLE' | 'CONSULTING' | 'RESULT' | 'ERROR'
  let selectedQuestion = params.initialQuestion || '';
  let activeResult = null;
  let validationError = null;
  let consultationPhase = 0; // 1: Awakening, 2: Reading, 3: Gathering, 4: Reveal
  let consultationStatusText = '';
  let activeTimers = [];
  let isBackConfirmOpen = false;

  function clearAllTimers() {
    activeTimers.forEach(id => clearTimeout(id));
    activeTimers = [];
  }

  function render() {
    let mainContentHtml = '';

    if (screenState === 'IDLE') {
      mainContentHtml = renderIdleView();
    } else if (screenState === 'CONSULTING') {
      mainContentHtml = renderConsultingView();
    } else if (screenState === 'RESULT') {
      mainContentHtml = renderResultView();
    } else if (screenState === 'ERROR') {
      mainContentHtml = renderErrorView();
    }

    container.innerHTML = `
      <div class="oracle-screen-root">
        <div class="oracle-watermark-bg"></div>

        <!-- Top Navigation Bar (Spec 4) -->
        <header class="oracle-top-header">
          <button id="oracle-nav-back-btn" class="oracle-top-btn" aria-label="Go Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="oracle-top-title-group">
            <h1 class="oracle-header-title">Ask the Oracle</h1>
            <span class="oracle-header-sub">Intuitive Inner Reflection</span>
          </div>

          <button id="oracle-info-trigger-btn" class="oracle-top-btn" aria-label="About the Oracle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </header>

        <!-- Dynamic Main Content -->
        ${mainContentHtml}

        <!-- Active Modals Mount Point -->
        <div id="oracle-modal-mount"></div>

      </div>
    `;

    attachListeners();
  }

  // =========================================================================
  // VIEW 1: IDLE VIEW (Sphere + Suggested Chips + Custom Input)
  // =========================================================================
  function renderIdleView() {
    const isReady = selectedQuestion.trim().length >= 3;

    return `
      <div class="oracle-idle-container">
        
        <!-- Hero: Mystic Oracle Sphere -->
        <div class="oracle-hero-stage">
          ${renderOracleSphere({ state: 'idle', size: 210 })}
          <p class="oracle-sphere-caption">Focus your thoughts. The signs reflect what is ready to be understood.</p>
        </div>

        <!-- Question Prompt Section (Spec 7) -->
        <section class="oracle-question-section" aria-labelledby="oracle-q-title">
          <div class="oracle-section-header">
            <h2 id="oracle-q-title" class="oracle-section-title">What's on your mind?</h2>
            <p class="oracle-section-sub">Choose a contemplation or write your own inquiry.</p>
          </div>

          <!-- Suggested Question Chips -->
          <div class="oracle-suggestions-grid" role="group" aria-label="Suggested inquiries">
            ${SUGGESTED_QUESTIONS.map((q, idx) => {
              const isSelected = selectedQuestion === q;
              return `
                <button class="oracle-chip-card ${isSelected ? 'selected' : ''}" 
                        data-suggested-idx="${idx}" 
                        type="button">
                  <span class="oracle-chip-flourish">${isSelected ? '✦' : '✧'}</span>
                  <span class="oracle-chip-text">${q}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Custom Question Input (Spec 8) -->
          <div class="oracle-custom-input-box">
            <label for="oracle-custom-text" class="oracle-input-label">Ask your own question</label>
            <div class="oracle-input-wrap ${validationError ? 'has-error' : ''}">
              <input type="text" 
                     id="oracle-custom-text" 
                     class="oracle-text-input" 
                     placeholder="Type your question..." 
                     maxlength="120" 
                     value="${escapeHtml(selectedQuestion)}" 
                     autocomplete="off" />
              <span id="oracle-char-counter" class="oracle-char-counter">${selectedQuestion.length}/120</span>
            </div>
            ${validationError ? `<p class="oracle-error-text" role="alert">${validationError}</p>` : ''}
          </div>

          <!-- Consult CTA Button (Spec 14) -->
          <div class="oracle-cta-wrap">
            <button id="oracle-consult-btn" 
                    class="oracle-btn-consult ${isReady ? 'active' : 'disabled'}" 
                    type="button" 
                    ${isReady ? '' : 'disabled'}>
              <span class="oracle-consult-icon">✦</span>
              <span>CONSULT THE ORACLE</span>
              <span class="oracle-consult-icon">✦</span>
            </button>
          </div>

        </section>

      </div>
    `;
  }

  // =========================================================================
  // VIEW 2: CONSULTING VIEW (Phased Ceremonial Animation)
  // =========================================================================
  function renderConsultingView() {
    return `
      <div class="oracle-consulting-container" role="status" aria-live="polite">
        
        <div class="oracle-consulting-hero">
          ${renderOracleSphere({ 
            state: 'consulting', 
            size: 230, 
            statusText: consultationStatusText 
          })}
        </div>

        <div class="oracle-consulting-copy">
          <p class="oracle-consulting-q">"${escapeHtml(selectedQuestion)}"</p>
          <div class="oracle-progress-dots">
            <span class="dot d1"></span>
            <span class="dot d2"></span>
            <span class="dot d3"></span>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // VIEW 3: RESULT VIEW (Compact Sphere + Answer Card + Cross-Sell)
  // =========================================================================
  function renderResultView() {
    return `
      <div class="oracle-result-container">
        
        <!-- Compact Sphere in Upper Screen -->
        <div class="oracle-result-sphere-box">
          ${renderOracleSphere({ state: 'result', size: 140 })}
        </div>

        <!-- Result Card & Cross-Sell -->
        ${renderOracleResultCard({
          question: selectedQuestion,
          response: activeResult
        })}

      </div>
    `;
  }

  // =========================================================================
  // VIEW 4: ERROR VIEW (Graceful Mystical Recovery)
  // =========================================================================
  function renderErrorView() {
    return `
      <div class="oracle-error-container">
        <div class="oracle-hero-stage">
          ${renderOracleSphere({ state: 'idle', size: 160 })}
        </div>
        <div class="oracle-error-card">
          <h2 class="oracle-error-title">The Oracle is quiet for a moment</h2>
          <p class="oracle-error-desc">The stillness of the temple invites a gentle breath. Try presenting your question again.</p>
          <button id="oracle-try-again-btn" class="oracle-btn-primary" type="button">
            Try Asking Again
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CEREMONIAL SEQUENCE CONTROLLER (Spec 15)
  // =========================================================================
  function startConsultationSequence() {
    clearAllTimers();
    screenState = 'CONSULTING';
    consultationPhase = 1;
    consultationStatusText = 'Listening...';
    render();

    // Evaluate result in background
    const resultOutcome = oracleEngine.consult(selectedQuestion);
    if (!resultOutcome.success) {
      screenState = 'IDLE';
      validationError = resultOutcome.error;
      render();
      return;
    }

    activeResult = resultOutcome.response;

    // Phase 1 -> Phase 2 (800ms)
    const t1 = setTimeout(() => {
      consultationPhase = 2;
      consultationStatusText = 'Reading the moment...';
      updateConsultationText('Reading the moment...');

      // Sub-phase: Seeking clarity (1500ms)
      const t2 = setTimeout(() => {
        consultationStatusText = 'Seeking clarity...';
        updateConsultationText('Seeking clarity...');
      }, 700);
      activeTimers.push(t2);

    }, 800);
    activeTimers.push(t1);

    // Phase 2 -> Phase 3 (2200ms)
    const t3 = setTimeout(() => {
      consultationPhase = 3;
      consultationStatusText = 'The Oracle speaks...';
      updateConsultationText('The Oracle speaks...');
    }, 2200);
    activeTimers.push(t3);

    // Phase 3 -> Phase 4 / Reveal (3400ms)
    const t4 = setTimeout(() => {
      consultationPhase = 4;
      screenState = 'RESULT';
      clearAllTimers();
      render();
    }, 3400);
    activeTimers.push(t4);
  }

  function updateConsultationText(text) {
    const el = container.querySelector('.oracle-status-text');
    if (el) {
      el.textContent = text;
    }
  }

  // =========================================================================
  // EVENT LISTENERS & DELEGATION
  // =========================================================================
  function attachListeners() {
    // 1. Back Navigation
    container.querySelector('#oracle-nav-back-btn')?.addEventListener('click', handleBackPress);

    // 2. Info Button
    container.querySelector('#oracle-info-trigger-btn')?.addEventListener('click', () => {
      openInfoSheet();
    });

    // 3. Suggested Question Chips
    container.querySelectorAll('[data-suggested-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-suggested-idx'), 10);
        selectedQuestion = SUGGESTED_QUESTIONS[idx] || '';
        validationError = null;
        render();
      });
    });

    // 4. Custom Question Input
    const textInput = container.querySelector('#oracle-custom-text');
    textInput?.addEventListener('input', (e) => {
      selectedQuestion = e.target.value;
      validationError = null;
      
      const charCounter = container.querySelector('#oracle-char-counter');
      if (charCounter) charCounter.textContent = `${selectedQuestion.length}/120`;

      const consultBtn = container.querySelector('#oracle-consult-btn');
      const isReady = selectedQuestion.trim().length >= 3;
      if (consultBtn) {
        if (isReady) {
          consultBtn.classList.add('active');
          consultBtn.classList.remove('disabled');
          consultBtn.removeAttribute('disabled');
        } else {
          consultBtn.classList.remove('active');
          consultBtn.classList.add('disabled');
          consultBtn.setAttribute('disabled', 'true');
        }
      }
    });

    // 5. Consult Button
    container.querySelector('#oracle-consult-btn')?.addEventListener('click', () => {
      if (selectedQuestion.trim().length >= 3) {
        startConsultationSequence();
      }
    });

    // 5b. Looping Video Playback Guarantee (handles mobile autoplay policies)
    container.querySelectorAll('.oracle-loop-video').forEach(vid => {
      if (vid.paused) {
        vid.play().catch(() => {});
      }
    });

    // 6. Result: Ask Another Question
    container.querySelector('#oracle-ask-again-btn')?.addEventListener('click', () => {
      screenState = 'IDLE';
      selectedQuestion = '';
      activeResult = null;
      validationError = null;
      render();
    });

    // 7. Result: Share
    container.querySelector('#oracle-share-btn')?.addEventListener('click', () => {
      openShareModal();
    });

    // 8. Result: Cross-sell to Palm Reading
    container.querySelector('#oracle-explore-palm-btn')?.addEventListener('click', () => {
      reportTelemetry.logEvent(TELEMETRY_EVENTS.CONVERSION_ACTION, { from: 'oracle_cross_sell' });
      router.navigate(ROUTES.GUIDED_READING);
    });

    // 9. Error: Try Again
    container.querySelector('#oracle-try-again-btn')?.addEventListener('click', () => {
      screenState = 'IDLE';
      render();
    });
  }

  // =========================================================================
  // MODALS & NAVIGATION HANDLING
  // =========================================================================
  function handleBackPress() {
    if (screenState === 'CONSULTING') {
      // Spec 29: Ask confirmation before destroying active consultation
      showLeaveConfirmation();
      return;
    }

    if (screenState === 'RESULT') {
      screenState = 'IDLE';
      selectedQuestion = '';
      activeResult = null;
      render();
      return;
    }

    // Return to home
    clearAllTimers();
    router.navigate(ROUTES.HOME);
  }

  function showLeaveConfirmation() {
    const mount = container.querySelector('#oracle-modal-mount');
    if (!mount) return;

    mount.innerHTML = `
      <div id="oracle-leave-overlay" class="oracle-modal-backdrop" role="dialog" aria-modal="true">
        <div class="oracle-modal-dialog oracle-dialog-confirm">
          <h3 class="oracle-modal-title">Leave the Oracle?</h3>
          <p class="oracle-confirm-msg">The Oracle is currently contemplating your inquiry. Leaving now will dissolve the reading.</p>
          <div class="oracle-confirm-actions">
            <button id="oracle-cancel-leave-btn" class="oracle-btn-secondary" type="button">Continue Reading</button>
            <button id="oracle-confirm-leave-btn" class="oracle-btn-primary" type="button">Leave</button>
          </div>
        </div>
      </div>
    `;

    mount.querySelector('#oracle-cancel-leave-btn')?.addEventListener('click', () => {
      mount.innerHTML = '';
    });

    mount.querySelector('#oracle-confirm-leave-btn')?.addEventListener('click', () => {
      clearAllTimers();
      mount.innerHTML = '';
      router.navigate(ROUTES.HOME);
    });
  }

  function openInfoSheet() {
    const mount = container.querySelector('#oracle-modal-mount');
    if (!mount) return;

    mount.innerHTML = renderOracleInfoSheet();

    const closeHandler = () => { mount.innerHTML = ''; };
    mount.querySelector('#oracle-info-close-btn')?.addEventListener('click', closeHandler);
    mount.querySelector('#oracle-info-dismiss-btn')?.addEventListener('click', closeHandler);
    mount.querySelector('#oracle-info-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'oracle-info-overlay') closeHandler();
    });
  }

  function openShareModal() {
    const mount = container.querySelector('#oracle-modal-mount');
    if (!mount || !activeResult) return;

    mount.innerHTML = renderOracleShareModal({
      question: selectedQuestion,
      response: activeResult
    });

    const closeHandler = () => { mount.innerHTML = ''; };
    mount.querySelector('#oracle-share-close-btn')?.addEventListener('click', closeHandler);
    mount.querySelector('#oracle-share-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'oracle-share-overlay') closeHandler();
    });

    // Copy to clipboard
    mount.querySelector('#oracle-copy-share-btn')?.addEventListener('click', async () => {
      const shareText = `✦ Kai RegAI — Ask the Oracle ✦\n\nQuestion: "${selectedQuestion}"\n\nThe Oracle says: ${activeResult.title}\n${activeResult.message}\n\n"The Story Written in Your Hands."`;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
        }
        const btn = mount.querySelector('#oracle-copy-share-btn');
        if (btn) btn.innerHTML = '<span>✓ Reading Copied!</span>';
        setTimeout(() => {
          if (btn) btn.innerHTML = '<span>📋 Copy Reading Text</span>';
        }, 2000);
      } catch (err) {
        console.warn('Clipboard copy error:', err);
      }
    });

    // Native Device Share
    mount.querySelector('#oracle-native-share-btn')?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Kai RegAI — Ask the Oracle',
            text: `Question: "${selectedQuestion}"\n\nThe Oracle says: ${activeResult.title}\n${activeResult.message}`
          });
        } catch (err) {
          // User dismissed or aborted share
        }
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Boot
  render();
}
