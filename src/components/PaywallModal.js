/**
 * Kai RegAI — Paywall & Commercial Access Modal
 * Phase: P12 — Monetization & Entitlement Architecture
 * 
 * Clean commercial checkout & upgrade sheet:
 * - Product selection (Standard vs Premium)
 * - Dynamic pricing from central catalog
 * - Invariant: "PAYMENT GRANTS ENTITLEMENT. ENTITLEMENT GRANTS ACCESS."
 * - Handles purchase execution, sandbox verification, and purchase restoration
 */

import { defaultProductCatalog } from '../monetization/ProductCatalog.js';
import { defaultEntitlementService } from '../monetization/EntitlementService.js';
import { router } from '../navigation/router.js';

export function renderPaywallModal(options = {}) {
  const { readingId, featureKey, onUnlocked, currency = 'INR' } = options;
  const standardProduct = defaultProductCatalog.getProduct('kai_standard');
  const premiumProduct = defaultProductCatalog.getProduct('kai_premium');

  const standardPrice = defaultProductCatalog.formatPrice('kai_standard', currency);
  const premiumPrice = defaultProductCatalog.formatPrice('kai_premium', currency);

  return `
    <div id="paywall-modal-backdrop" style="position: fixed; inset: 0; background: rgba(10, 14, 26, 0.85); backdrop-filter: blur(8px); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out;">
      <div class="kai-card kai-card-gold-rim" style="width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; background: var(--color-surface); border-radius: 24px 24px 0 0; padding: 24px 20px 32px; box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.6); position: relative;">
        
        <!-- Handlebar -->
        <div style="width: 40px; height: 4px; border-radius: 2px; background: var(--color-outline-variant); margin: 0 auto 16px;"></div>

        <!-- Close Button -->
        <button id="paywall-close-btn" class="kai-btn-icon" style="position: absolute; top: 16px; right: 16px;" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="kai-badge kai-badge-secondary" style="font-size: 11px; margin-bottom: 8px;">
            KAI REGAI COMMERCIAL ACCESS
          </span>
          <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--color-text-high); margin-top: 6px;">
            Unlock Your Complete Palm Story
          </h2>
          <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 6px; line-height: 1.4;">
            Traditional Hastarekha synthesis, all three karmic chapters, and archival PDF export.
          </p>
        </div>

        <!-- Product Cards -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          
          <!-- Premium Option (Recommended) -->
          <div id="opt-premium" class="kai-card" style="padding: 16px; border: 2px solid var(--color-secondary); background: rgba(228, 194, 118, 0.06); border-radius: 16px; cursor: pointer; position: relative;">
            <div style="position: absolute; top: -10px; right: 16px; background: var(--color-secondary); color: #1a160d; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">
              Best Value
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 15px; font-weight: 700; color: var(--color-text-high);">Master Premium Synthesis</h3>
                <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                  All 3 Chapters, Sacred Markings, High-Res Visualizer & Social Cards
                </p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 18px; font-weight: 700; color: var(--color-secondary);">${premiumPrice}</span>
                <span style="display: block; font-size: 10px; color: var(--color-outline);">One-time</span>
              </div>
            </div>
          </div>

          <!-- Standard Option -->
          <div id="opt-standard" class="kai-card" style="padding: 16px; border: 1px solid var(--color-border-subtle); background: var(--color-surface-container); border-radius: 16px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text-high);">Standard Dossier</h3>
                <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                  Complete 5-line telemetry, Chapter I & II, and PDF export
                </p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 16px; font-weight: 700; color: var(--color-text-high);">${standardPrice}</span>
                <span style="display: block; font-size: 10px; color: var(--color-outline);">One-time</span>
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
            <span id="paywall-btn-text">Unlock Premium Synthesis — ${premiumPrice}</span>
          </button>

          <button id="paywall-restore-btn" class="kai-btn kai-btn-secondary" style="width: 100%; justify-content: center; font-size: 12px;" type="button">
            <span>Restore Purchases</span>
          </button>
        </div>

        <p style="text-align: center; font-size: 10px; color: var(--color-outline); margin-top: 14px; line-height: 1.4;">
          Secure payment simulation • Purchases are preserved with reading archive • Zero biometric data shared
        </p>

      </div>
    </div>
  `;
}

export function attachPaywallListeners(modalRoot, options = {}) {
  const { readingId, onUnlocked } = options;
  let selectedProductId = 'kai_premium';

  const optStandard = modalRoot.querySelector('#opt-standard');
  const optPremium = modalRoot.querySelector('#opt-premium');
  const purchaseBtn = modalRoot.querySelector('#paywall-purchase-btn');
  const restoreBtn = modalRoot.querySelector('#paywall-restore-btn');
  const closeBtn = modalRoot.querySelector('#paywall-close-btn');
  const backdrop = modalRoot.querySelector('#paywall-modal-backdrop');
  const statusMsg = modalRoot.querySelector('#paywall-status-msg');
  const btnText = modalRoot.querySelector('#paywall-btn-text');

  function updateSelection(prodId) {
    selectedProductId = prodId;
    if (prodId === 'kai_premium') {
      optPremium.style.border = '2px solid var(--color-secondary)';
      optPremium.style.background = 'rgba(228, 194, 118, 0.06)';
      optStandard.style.border = '1px solid var(--color-border-subtle)';
      optStandard.style.background = 'var(--color-surface-container)';
      btnText.textContent = `Unlock Premium Synthesis — ${defaultProductCatalog.formatPrice('kai_premium')}`;
    } else {
      optStandard.style.border = '2px solid var(--color-secondary)';
      optStandard.style.background = 'rgba(228, 194, 118, 0.06)';
      optPremium.style.border = '1px solid var(--color-border-subtle)';
      optPremium.style.background = 'var(--color-surface-container)';
      btnText.textContent = `Unlock Standard Dossier — ${defaultProductCatalog.formatPrice('kai_standard')}`;
    }
  }

  optStandard?.addEventListener('click', () => updateSelection('kai_standard'));
  optPremium?.addEventListener('click', () => updateSelection('kai_premium'));

  closeBtn?.addEventListener('click', () => router.closeModal());
  backdrop?.addEventListener('click', (e) => {
    if (e.target.id === 'paywall-modal-backdrop') router.closeModal();
  });

  purchaseBtn?.addEventListener('click', async () => {
    purchaseBtn.disabled = true;
    btnText.textContent = 'Processing Purchase...';
    statusMsg.style.display = 'none';

    try {
      const res = await defaultEntitlementService.purchaseProduct({
        productId: selectedProductId,
        readingId: readingId || null
      });

      if (res.success && res.entitlement) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(74, 222, 128, 0.15)';
        statusMsg.style.color = '#4ade80';
        statusMsg.textContent = '✓ Access granted! Revealing complete reading...';

        setTimeout(() => {
          router.closeModal();
          if (typeof onUnlocked === 'function') onUnlocked();
        }, 600);
      } else {
        throw new Error('Purchase authorization failed');
      }
    } catch (err) {
      purchaseBtn.disabled = false;
      updateSelection(selectedProductId);
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.textContent = `Payment could not be completed: ${err.message}. Your reading has not been changed.`;
    }
  });

  restoreBtn?.addEventListener('click', async () => {
    restoreBtn.disabled = true;
    try {
      const result = await defaultEntitlementService.restorePurchases();
      if (result.restoredCount > 0) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(74, 222, 128, 0.15)';
        statusMsg.style.color = '#4ade80';
        statusMsg.textContent = `✓ Successfully restored ${result.restoredCount} previous purchase(s).`;
        setTimeout(() => {
          router.closeModal();
          if (typeof onUnlocked === 'function') onUnlocked();
        }, 800);
      } else {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(228, 194, 118, 0.15)';
        statusMsg.style.color = 'var(--color-secondary)';
        statusMsg.textContent = 'No previous purchases found to restore for this identity.';
        restoreBtn.disabled = false;
      }
    } catch (err) {
      restoreBtn.disabled = false;
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.textContent = `Restore failed: ${err.message}`;
    }
  });
}
