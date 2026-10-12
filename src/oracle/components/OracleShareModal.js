/**
 * OracleShareModal Component
 * 9:16 Visual Share Card for social sharing & clipboard export
 */

/**
 * Renders the 9:16 Share Modal
 * @param {object} options
 * @param {string} options.question User question
 * @param {object} options.response Oracle response record
 * @returns {string} HTML string
 */
export function renderOracleShareModal({ question, response }) {
  return `
    <div id="oracle-share-overlay" class="oracle-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div class="oracle-modal-dialog">
        
        <div class="oracle-modal-header">
          <h3 id="share-modal-title" class="oracle-modal-title">Share Your Reading</h3>
          <button id="oracle-share-close-btn" class="oracle-modal-close" aria-label="Close dialog">✕</button>
        </div>

        <!-- 9:16 Visual Share Card Preview -->
        <div id="oracle-share-card-canvas" class="oracle-share-card-frame">
          <div class="oracle-share-bg-glow"></div>
          
          <!-- Top Branding -->
          <div class="oracle-share-top">
            <h4 class="oracle-share-brand">Kai Reg<span style="color:#FBBF24;">AI</span></h4>
            <span class="oracle-share-sub">ASK THE ORACLE</span>
          </div>

          <!-- Central Mystical Sphere Icon -->
          <div class="oracle-share-orb-icon">
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" fill="#0C0A14" stroke="#FBBF24" stroke-width="2" />
              <circle cx="50" cy="50" r="28" fill="rgba(251, 191, 36, 0.25)" />
              <path d="M 28 58 C 44 64 50 78 48 88" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
              <path d="M 30 56 C 50 62 66 68 80 76" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>

          <!-- Middle Question & Response -->
          <div class="oracle-share-body">
            <span class="oracle-share-q-label">MY QUESTION</span>
            <p class="oracle-share-q-text">"${question}"</p>

            <div class="oracle-share-divider">✦</div>

            <span class="oracle-share-ans-label">THE ORACLE SAYS</span>
            <h2 class="oracle-share-ans-title">${response.title}</h2>
            <p class="oracle-share-ans-msg">${response.message}</p>
          </div>

          <!-- Bottom Tagline -->
          <div class="oracle-share-footer">
            <p class="oracle-share-tagline">The Story Written in Your Hands.</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="oracle-share-actions">
          <button id="oracle-copy-share-btn" class="oracle-btn-primary" type="button">
            <span>📋 Copy Reading Text</span>
          </button>
          ${navigator.share ? `
            <button id="oracle-native-share-btn" class="oracle-btn-secondary" type="button">
              <span>📤 Share via Device</span>
            </button>
          ` : ''}
        </div>

      </div>
    </div>
  `;
}
