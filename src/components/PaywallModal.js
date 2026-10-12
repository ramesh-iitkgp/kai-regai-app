/**
 * Kai RegAI — Paywall & Commercial Access Modal
 * Phase: P16 — Production UX, Reading Experience & Conversion
 * 
 * Clean commercial checkout & upgrade sheet:
 * - Product selection (Standard vs Premium)
 * - Dynamic pricing from central catalog with multi-currency support
 * - Invariant: "PAYMENT GRANTS ENTITLEMENT. ENTITLEMENT GRANTS ACCESS."
 * - Handles purchase execution, sandbox verification, and purchase restoration
 * - Privacy-safe product analytics tracking
 */

import { defaultProductCatalog } from '../monetization/ProductCatalog.js';
import { defaultEntitlementService } from '../monetization/EntitlementService.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { i18n } from '../services/i18n.js';

export function renderPaywallModal(options = {}) {
  const { readingId, featureKey, productId, currency = 'INR' } = options;
  const isCorrelate = productId === 'kai_daily_correlate' || featureKey === 'kai_daily_correlate';

  const standardPrice = defaultProductCatalog.formatPrice('kai_standard', currency);
  const premiumPrice = defaultProductCatalog.formatPrice('kai_premium', currency);
  const correlatePrice = defaultProductCatalog.formatPrice('kai_daily_correlate', currency);

  // Emit paywall exposure event
  reportTelemetry.logEvent(TELEMETRY_EVENTS.PAYWALL_VIEW, { 
    readingId, 
    featureKey: isCorrelate ? 'kai_daily_correlate' : featureKey, 
    productId: isCorrelate ? 'kai_daily_correlate' : (productId || 'kai_premium'),
    currency 
  });

  if (isCorrelate) {
    return `
    <div id="paywall-modal-backdrop" style="position: fixed; inset: 0; background: rgba(10, 14, 26, 0.88); backdrop-filter: blur(10px); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out;">
      <div class="kai-card kai-card-gold-rim" style="width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; background: radial-gradient(circle at top, rgba(251, 191, 36, 0.14) 0%, rgba(14, 12, 22, 0.98) 100%), var(--color-surface); border-radius: 24px 24px 0 0; padding: 22px 20px 32px; box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(251, 191, 36, 0.15); position: relative;">
        
        <!-- Handlebar -->
        <div style="width: 40px; height: 4px; border-radius: 2px; background: rgba(251, 191, 36, 0.4); margin: 0 auto 16px;"></div>

        <!-- Close Button -->
        <button id="paywall-close-btn" class="kai-btn-icon" style="position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.06); border-radius: 9999px; width: 34px; height: 34px; border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; display: flex; align-items: center; justify-content: center; cursor: pointer;" aria-label="${i18n.t('cancel')}">
          <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
        </button>

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="width: 56px; height: 56px; border-radius: 9999px; margin: 0 auto 12px; overflow: hidden; border: 1.5px solid rgba(251, 191, 36, 0.6); box-shadow: 0 0 20px rgba(251, 191, 36, 0.35); background: #000;">
            <img src="/assets/home/celestial_palm_gold.jpg" alt="Connect Palm" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <span class="kai-badge" style="font-size: 11px; margin-bottom: 6px; background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">
            ✦ SACRED PALM & COSMIC CORRELATION
          </span>
          <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 6px; letter-spacing: 0.02em;">
            Connect Your Palm
          </h2>
          <p style="font-size: 13px; color: #cbd5e1; margin-top: 6px; line-height: 1.45; max-width: 380px; margin-left: auto; margin-right: auto;">
            Synthesize your physical palm crease features with today's planetary transit for 100% personalized precision.
          </p>

          <!-- Currency Selector Toggle -->
          <div style="display: inline-flex; gap: 4px; background: rgba(255, 255, 255, 0.05); padding: 3px; border-radius: var(--radius-full); margin-top: 12px; border: 1px solid rgba(251, 191, 36, 0.2);">
            ${['INR', 'USD', 'EUR', 'GBP'].map(curr => `
              <button class="paywall-curr-btn" data-curr="${curr}" style="background: ${curr === currency ? '#fbbf24' : 'transparent'}; color: ${curr === currency ? '#1a160d' : '#94a3b8'}; border: none; border-radius: var(--radius-full); padding: 3px 8px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                ${curr}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Featured Dedicated ₹99 Price Card -->
        <div style="background: radial-gradient(circle at top right, rgba(251, 191, 36, 0.16) 0%, rgba(20, 18, 28, 0.95) 100%), #14121c; border: 2px solid rgba(251, 191, 36, 0.7); border-radius: 18px; padding: 18px 16px; margin-bottom: 18px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.2); position: relative;">
          
          <div style="position: absolute; top: -11px; right: 18px; background: linear-gradient(135deg, #fbbf24, #d97706); color: #100e14; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);">
            SPECIAL INTRODUCTORY OFFER
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); padding-bottom: 12px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">Personal Palm Correlation</h3>
              <span style="font-size: 11px; color: #fbbf24; font-weight: 600;">One-Time Sacred Synthesis • No Subscription</span>
            </div>
            <div style="text-align: right;">
              <span id="price-correlate" style="font-size: 26px; font-weight: 800; color: #fbbf24; text-shadow: 0 0 12px rgba(251, 191, 36, 0.4);">${correlatePrice}</span>
              <span style="display: block; font-size: 10px; color: #94a3b8; text-decoration: line-through;">${currency === 'INR' ? '₹499' : '$4.99'}</span>
            </div>
          </div>

          <!-- Features Inclusions -->
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: #e2e8f0;">
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #fbbf24; flex-shrink: 0; margin-top: 1px;">check_circle</span>
              <span><strong>Optical Crease Detection:</strong> Instant scanning of Life, Head, Heart, Fate & Sun lines.</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #fbbf24; flex-shrink: 0; margin-top: 1px;">check_circle</span>
              <span><strong>Mount & Transit Resonance:</strong> Live alignment with Jupiter, Saturn, Venus & Moon mounts.</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #fbbf24; flex-shrink: 0; margin-top: 1px;">check_circle</span>
              <span><strong>12-Month Cosmic Roadmap:</strong> Unveiling vocational peaks, love resonance & karmic timing.</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #38bdf8; flex-shrink: 0; margin-top: 1px;">lock</span>
              <span><strong>100% RAM-Only Biometric Privacy:</strong> Camera frame never saved or transmitted.</span>
            </div>
          </div>

        </div>

        <!-- Trust Badges -->
        <div style="display: flex; justify-content: center; align-items: center; gap: 14px; margin-bottom: 16px; font-size: 11px; color: #94a3b8;">
          <span style="display: flex; align-items: center; gap: 4px;">
            <span class="material-symbols-outlined" style="font-size: 14px; color: #4ade80;">verified_user</span> 256-Bit Encrypted
          </span>
          <span>•</span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span class="material-symbols-outlined" style="font-size: 14px; color: #fbbf24;">bolt</span> Instant Activation
          </span>
          <span>•</span>
          <span>UPI / Cards / NetBanking</span>
        </div>

        <!-- Status Message Banner -->
        <div id="paywall-status-msg" style="display: none; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; line-height: 1.4;"></div>

        <!-- Primary Action Button -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="paywall-purchase-btn" class="kai-btn kai-btn-gold" style="width: 100%; justify-content: center; padding: 14px; font-size: 15px; font-weight: 700; border-radius: 14px; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);" type="button">
            <span class="material-symbols-outlined" style="font-size: 20px;">lock_open</span>
            <span id="paywall-btn-text">PAY ${correlatePrice} & CONNECT PALM</span>
          </button>

          <button id="paywall-restore-btn" class="kai-btn kai-btn-secondary" style="width: 100%; justify-content: center; font-size: 12px; border-radius: 12px;" type="button">
            <span>${i18n.t('paywall_restore_btn')}</span>
          </button>
        </div>

        <p style="text-align: center; font-size: 10px; color: var(--color-outline); margin-top: 14px; line-height: 1.4;">
          ${i18n.t('paywall_disclaimer')}
        </p>

      </div>
    </div>
    `;
  }

  return `
    <div id="paywall-modal-backdrop" style="position: fixed; inset: 0; background: rgba(10, 14, 26, 0.85); backdrop-filter: blur(8px); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out;">
      <div class="kai-card kai-card-gold-rim" style="width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; background: var(--color-surface); border-radius: 24px 24px 0 0; padding: 24px 20px 32px; box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.6); position: relative;">
        
        <!-- Handlebar -->
        <div style="width: 40px; height: 4px; border-radius: 2px; background: var(--color-outline-variant); margin: 0 auto 16px;"></div>

        <!-- Close Button -->
        <button id="paywall-close-btn" class="kai-btn-icon" style="position: absolute; top: 16px; right: 16px;" aria-label="${i18n.t('cancel')}">
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="width: 52px; height: 52px; border-radius: 9999px; margin: 0 auto 12px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.5); box-shadow: 0 0 16px rgba(228, 194, 118, 0.3);">
            <img src="/assets/brand/logo_emblem.png" alt="Kai RegAI" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
          <span class="kai-badge kai-badge-secondary" style="font-size: 11px; margin-bottom: 8px;">
            ${i18n.t('paywall_badge')}
          </span>
          <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--color-text-high); margin-top: 6px;">
            ${i18n.t('paywall_title')}
          </h2>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.4;">
            ${i18n.t('paywall_sub')}
          </p>

          <!-- Currency Selector Toggle -->
          <div style="display: inline-flex; gap: 4px; background: var(--color-surface-container-lowest); padding: 3px; border-radius: var(--radius-full); margin-top: 12px; border: 1px solid var(--color-border-subtle);">
            ${['INR', 'USD', 'EUR', 'GBP'].map(curr => `
              <button class="paywall-curr-btn" data-curr="${curr}" style="background: ${curr === currency ? 'var(--color-secondary)' : 'transparent'}; color: ${curr === currency ? '#1a160d' : 'var(--color-outline)'}; border: none; border-radius: var(--radius-full); padding: 3px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">
                ${curr}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Product Cards -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          
          <!-- Premium Option (Recommended) -->
          <div id="opt-premium" class="kai-card" style="padding: 16px; border: 2px solid var(--color-secondary); background: rgba(228, 194, 118, 0.06); border-radius: 16px; cursor: pointer; position: relative;" role="button" tabindex="0" aria-label="Select Master Premium Synthesis">
            <div style="position: absolute; top: -10px; right: 16px; background: var(--color-secondary); color: #1a160d; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">
              ${i18n.t('paywall_best_value')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 15px; font-weight: 700; color: var(--color-text-high);">${i18n.t('paywall_master_title')}</h3>
                <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                  ${i18n.t('paywall_master_desc')}
                </p>
              </div>
              <div style="text-align: right;">
                <span id="price-premium" style="font-size: 18px; font-weight: 700; color: var(--color-secondary);">${premiumPrice}</span>
                <span style="display: block; font-size: 10px; color: var(--color-outline);">${i18n.t('paywall_one_time')}</span>
              </div>
            </div>
          </div>

          <!-- Standard Option -->
          <div id="opt-standard" class="kai-card" style="padding: 16px; border: 1px solid var(--color-border-subtle); background: var(--color-surface-container); border-radius: 16px; cursor: pointer;" role="button" tabindex="0" aria-label="Select Standard Dossier">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">${i18n.t('paywall_standard_title')}</h3>
                <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                  ${i18n.t('paywall_standard_desc')}
                </p>
              </div>
              <div style="text-align: right;">
                <span id="price-standard" style="font-size: 16px; font-weight: 700; color: var(--color-text-high);">${standardPrice}</span>
                <span style="display: block; font-size: 10px; color: var(--color-outline);">${i18n.t('paywall_one_time')}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Status Message Banner -->
        <div id="paywall-status-msg" style="display: none; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; line-height: 1.4;"></div>

        <!-- Primary Action Button -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="paywall-purchase-btn" class="kai-btn kai-btn-gold" style="width: 100%; justify-content: center; padding: 14px;" type="button">
            <span class="material-symbols-outlined">lock_open</span>
            <span id="paywall-btn-text">${i18n.t('paywall_unlock_prefix')} ${premiumPrice}</span>
          </button>

          <button id="paywall-restore-btn" class="kai-btn kai-btn-secondary" style="width: 100%; justify-content: center; font-size: 12px;" type="button">
            <span>${i18n.t('paywall_restore_btn')}</span>
          </button>
        </div>

        <p style="text-align: center; font-size: 10px; color: var(--color-outline); margin-top: 14px; line-height: 1.4;">
          ${i18n.t('paywall_disclaimer')}
        </p>

      </div>
    </div>
  `;
}

export function attachPaywallListeners(modalRoot, options = {}) {
  const { readingId, onUnlocked, onSuccess, productId, featureKey } = options;
  const isCorrelate = productId === 'kai_daily_correlate' || featureKey === 'kai_daily_correlate';
  let activeCurrency = options.currency || 'INR';
  let selectedProductId = isCorrelate ? 'kai_daily_correlate' : 'kai_premium';

  const optStandard = modalRoot.querySelector('#opt-standard');
  const optPremium = modalRoot.querySelector('#opt-premium');
  const purchaseBtn = modalRoot.querySelector('#paywall-purchase-btn');
  const restoreBtn = modalRoot.querySelector('#paywall-restore-btn');
  const closeBtn = modalRoot.querySelector('#paywall-close-btn');
  const backdrop = modalRoot.querySelector('#paywall-modal-backdrop');
  const statusMsg = modalRoot.querySelector('#paywall-status-msg');
  const btnText = modalRoot.querySelector('#paywall-btn-text');
  const priceStandardEl = modalRoot.querySelector('#price-standard');
  const pricePremiumEl = modalRoot.querySelector('#price-premium');
  const priceCorrelateEl = modalRoot.querySelector('#price-correlate');

  function updatePrices(currency) {
    activeCurrency = currency;
    if (isCorrelate) {
      const corrFormatted = defaultProductCatalog.formatPrice('kai_daily_correlate', activeCurrency);
      if (priceCorrelateEl) priceCorrelateEl.textContent = corrFormatted;
      if (btnText) btnText.textContent = `PAY ${corrFormatted} & CONNECT PALM`;
    } else {
      const stdFormatted = defaultProductCatalog.formatPrice('kai_standard', activeCurrency);
      const premFormatted = defaultProductCatalog.formatPrice('kai_premium', activeCurrency);

      if (priceStandardEl) priceStandardEl.textContent = stdFormatted;
      if (pricePremiumEl) pricePremiumEl.textContent = premFormatted;
      updateSelection(selectedProductId);
    }

    modalRoot.querySelectorAll('.paywall-curr-btn').forEach(btn => {
      const c = btn.getAttribute('data-curr');
      if (c === activeCurrency) {
        btn.style.background = isCorrelate ? '#fbbf24' : 'var(--color-secondary)';
        btn.style.color = '#1a160d';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = isCorrelate ? '#94a3b8' : 'var(--color-outline)';
      }
    });
  }

  function updateSelection(prodId) {
    if (isCorrelate) return;
    selectedProductId = prodId;
    const formatted = defaultProductCatalog.formatPrice(selectedProductId, activeCurrency);

    if (prodId === 'kai_premium') {
      if (optPremium) {
        optPremium.style.border = '2px solid var(--color-secondary)';
        optPremium.style.background = 'rgba(228, 194, 118, 0.06)';
      }
      if (optStandard) {
        optStandard.style.border = '1px solid var(--color-border-subtle)';
        optStandard.style.background = 'var(--color-surface-container)';
      }
      if (btnText) btnText.textContent = `${i18n.t('paywall_unlock_prefix')} ${formatted}`;
    } else {
      if (optStandard) {
        optStandard.style.border = '2px solid var(--color-secondary)';
        optStandard.style.background = 'rgba(228, 194, 118, 0.06)';
      }
      if (optPremium) {
        optPremium.style.border = '1px solid var(--color-border-subtle)';
        optPremium.style.background = 'var(--color-surface-container)';
      }
      if (btnText) btnText.textContent = `${i18n.t('paywall_unlock_std_prefix')} ${formatted}`;
    }
  }

  // Currency buttons
  modalRoot.querySelectorAll('.paywall-curr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const curr = btn.getAttribute('data-curr');
      if (curr) updatePrices(curr);
    });
  });

  optStandard?.addEventListener('click', () => updateSelection('kai_standard'));
  optPremium?.addEventListener('click', () => updateSelection('kai_premium'));

  closeBtn?.addEventListener('click', () => router.closeModal());
  backdrop?.addEventListener('click', (e) => {
    if (e.target.id === 'paywall-modal-backdrop') router.closeModal();
  });

  purchaseBtn?.addEventListener('click', async () => {
    purchaseBtn.disabled = true;
    btnText.textContent = i18n.t('scanner_analyzing');
    statusMsg.style.display = 'none';

    reportTelemetry.logEvent(TELEMETRY_EVENTS.PURCHASE_STARTED, {
      productId: selectedProductId,
      currency: activeCurrency,
      readingId: readingId || null
    });

    try {
      const res = await defaultEntitlementService.purchaseProduct({
        productId: selectedProductId,
        readingId: readingId || null
      });

      if (res.success && res.entitlement) {
        reportTelemetry.logEvent(TELEMETRY_EVENTS.PURCHASE_SUCCESS, {
          productId: selectedProductId,
          currency: activeCurrency,
          readingId: readingId || null
        });

        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(74, 222, 128, 0.15)';
        statusMsg.style.color = '#4ade80';
        statusMsg.textContent = isCorrelate
          ? `✓ Payment Verified • Launching Hand Scanner...`
          : `✓ ${i18n.t('profile_restore_success')}`;

        setTimeout(() => {
          router.closeModal();
          if (typeof onSuccess === 'function') {
            onSuccess();
          } else if (typeof onUnlocked === 'function') {
            onUnlocked();
          } else if (isCorrelate) {
            router.navigate(ROUTES.SCANNER);
          }
        }, 600);
      } else {
        throw new Error('Purchase authorization failed');
      }
    } catch (err) {
      reportTelemetry.logEvent(TELEMETRY_EVENTS.PURCHASE_FAILED, {
        productId: selectedProductId,
        currency: activeCurrency,
        error: err.message
      });

      purchaseBtn.disabled = false;
      if (isCorrelate) {
        const corrFormatted = defaultProductCatalog.formatPrice('kai_daily_correlate', activeCurrency);
        btnText.textContent = `PAY ${corrFormatted} & CONNECT PALM`;
      } else {
        updateSelection(selectedProductId);
      }
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.textContent = `${i18n.t('profile_restore_error')} ${err.message}`;
    }
  });

  restoreBtn?.addEventListener('click', async () => {
    restoreBtn.disabled = true;
    reportTelemetry.logEvent(TELEMETRY_EVENTS.RESTORE_STARTED, {});

    try {
      const result = await defaultEntitlementService.restorePurchases();
      if (result.restoredCount > 0) {
        reportTelemetry.logEvent(TELEMETRY_EVENTS.RESTORE_SUCCESS, { count: result.restoredCount });
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(74, 222, 128, 0.15)';
        statusMsg.style.color = '#4ade80';
        statusMsg.textContent = `${i18n.t('profile_restore_success')} (${result.restoredCount})`;
        setTimeout(() => {
          router.closeModal();
          if (typeof onSuccess === 'function') {
            onSuccess();
          } else if (typeof onUnlocked === 'function') {
            onUnlocked();
          } else if (isCorrelate) {
            router.navigate(ROUTES.SCANNER);
          }
        }, 800);
      } else {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(228, 194, 118, 0.15)';
        statusMsg.style.color = 'var(--color-secondary)';
        statusMsg.textContent = i18n.t('profile_restore_none');
        restoreBtn.disabled = false;
      }
    } catch (err) {
      restoreBtn.disabled = false;
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.textContent = `${i18n.t('profile_restore_error')} ${err.message}`;
    }
  });
}
