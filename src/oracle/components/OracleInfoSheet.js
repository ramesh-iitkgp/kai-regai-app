/**
 * OracleInfoSheet Component
 * Bottom sheet disclosure describing the philosophical nature of the Oracle.
 */

export function renderOracleInfoSheet() {
  return `
    <div id="oracle-info-overlay" class="oracle-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="oracle-info-title">
      <div class="oracle-modal-dialog oracle-sheet-bottom">
        <div class="oracle-modal-header">
          <h3 id="oracle-info-title" class="oracle-modal-title">ABOUT THE ORACLE</h3>
          <button id="oracle-info-close-btn" class="oracle-modal-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="oracle-info-content">
          <p class="oracle-info-lead">
            The Oracle offers reflective insights for moments of curiosity and uncertainty.
          </p>
          <p class="oracle-info-body">
            Its answers are meant for personal reflection and entertainment, not guaranteed predictions or professional advice.
          </p>
          <div class="oracle-info-card">
            <span class="oracle-info-gem">❖</span>
            <p>
              Ancient Indian Samudrika treatises teach that wisdom begins with attentive self-inquiry. Use the Oracle's answers as mirrors to listen more closely to your own natural intuition.
            </p>
          </div>
        </div>

        <div class="oracle-sheet-footer">
          <button id="oracle-info-dismiss-btn" class="oracle-btn-primary" type="button">
            Understood
          </button>
        </div>
      </div>
    </div>
  `;
}
