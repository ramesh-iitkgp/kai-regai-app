/**
 * OracleResultCard Component
 * Displays the revealed insight card, reflection, cross-sell to palm reading, and action buttons.
 */

/**
 * Renders the Oracle Result Card
 * @param {object} options
 * @param {string} options.question The user's asked question
 * @param {object} options.response The Oracle response object
 * @returns {string} HTML string
 */
export function renderOracleResultCard({ question, response }) {
  if (!response) return '';

  return `
    <div class="oracle-result-wrapper" role="region" aria-label="The Oracle's Insight">
      
      <!-- User's Question Banner -->
      <div class="oracle-question-badge">
        <span class="oracle-question-tag">Your Question</span>
        <p class="oracle-question-quote">"${question}"</p>
      </div>

      <!-- Main Parchment/Obsidian Answer Card -->
      <div class="oracle-answer-card">
        
        <div class="oracle-card-header">
          <span class="oracle-card-label">THE ORACLE SAYS</span>
          <span class="oracle-card-flourish">✦</span>
        </div>

        <h2 class="oracle-answer-title">${response.title}</h2>
        <p class="oracle-answer-message">${response.message}</p>

        <div class="oracle-card-divider">
          <span class="oracle-divider-line"></span>
          <span class="oracle-divider-gem">❖</span>
          <span class="oracle-divider-line"></span>
        </div>

        <!-- Philosophical Reflection -->
        ${response.reflection ? `
          <div class="oracle-reflection-block">
            <span class="oracle-reflection-label">Reflection</span>
            <p class="oracle-reflection-text">${response.reflection}</p>
          </div>
        ` : ''}

      </div>

      <!-- Subtle Cross-Sell to Core Palm Reading (Spec 22) -->
      <div class="oracle-cross-sell-card">
        <div class="oracle-cross-sell-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
            <path d="M12 12 2.1 12.05"></path>
            <path d="M12 12a10 10 0 0 1 7.07-7.07"></path>
          </svg>
        </div>
        <div class="oracle-cross-sell-content">
          <h4 class="oracle-cross-sell-title">WANT A DEEPER READING?</h4>
          <p class="oracle-cross-sell-sub">The Oracle offers a moment of insight. Your palm reveals the patterns behind your journey.</p>
        </div>
        <button id="oracle-explore-palm-btn" class="oracle-cross-sell-btn" type="button">
          Explore Palm Reading ›
        </button>
      </div>

      <!-- Bottom Action Row -->
      <div class="oracle-result-actions">
        <button id="oracle-ask-again-btn" class="oracle-btn-primary" type="button">
          Ask Another Question
        </button>
        <button id="oracle-share-btn" class="oracle-btn-secondary" type="button" aria-label="Share Reading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Share
        </button>
      </div>

    </div>
  `;
}
