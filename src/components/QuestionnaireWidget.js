/**
 * QuestionnaireWidget Component — Guided Visual Biometric Observers
 * Matches Stitch: design/stitch/kai_regai_questionnaire_thumb_flexibility/
 * Source of truth: docs/p2/QUESTIONNAIRE_FLOW.md
 */

export const questionnaireModules = [
  {
    id: 'thumb_flexibility',
    title: 'Thumb Flexibility Arc',
    subtitle: 'Gently extend your thumb backward. Observe the angle of natural curvature.',
    options: [
      { id: 'FIRM', label: 'Firm & Steady (≤ 40°)', desc: 'Strong willpower, practical caution, and determined boundaries.' },
      { id: 'BALANCED', label: 'Balanced Arc (40° – 60°)', desc: 'Adaptive intellect, equilibrium between discipline and flexibility.' },
      { id: 'SUPPLE', label: 'Supple & Elastic (≥ 60°)', desc: 'Broad mental horizons, generous impulse, and fluid versatility.' }
    ]
  },
  {
    id: 'palm_firmness',
    title: 'Palm Tissue Resistance',
    subtitle: 'Press lightly into the center of your palm mount (Venus/Moon).',
    options: [
      { id: 'SOFT', label: 'Soft & Receptive', desc: 'High sensory attunement, rich imaginative reserves, and receptive empathy.' },
      { id: 'ELASTIC', label: 'Elastic & Resilient', desc: 'Optimal physical stamina with balanced emotional recuperation.' },
      { id: 'DENSE', label: 'Dense & Muscular', desc: 'Tireless bodily constitution, pragmatic directness, and tangible focus.' }
    ]
  },
  {
    id: 'thumb_phalanx',
    title: 'Phalanx Equilibrium',
    subtitle: 'Compare the upper nail phalanx (Will) to the lower middle phalanx (Logic).',
    options: [
      { id: 'EQUAL', label: 'Harmonious Balance', desc: 'Logic and willpower inform one another in measured synchronization.' },
      { id: 'WILL_DOMINANT', label: 'First Phalanx Longer', desc: 'Instinct for decisive execution; acts boldly on core convictions.' },
      { id: 'LOGIC_DOMINANT', label: 'Second Phalanx Longer', desc: 'Strategic deliberation; thoroughly analyzes scenarios before leaping.' }
    ]
  },
  {
    id: 'finger_spacing',
    title: 'Natural Finger Spacing',
    subtitle: 'Place your hand naturally on a flat surface. How do your fingers rest?',
    options: [
      { id: 'WIDE', label: 'Wide Open Spacing', desc: 'Free-thinking autonomy; natural aversion to rigid dogmatic limits.' },
      { id: 'MODERATE', label: 'Evenly Distributed', desc: 'Social grace, collaborative ease, and healthy self-reliance.' },
      { id: 'CLOSE', label: 'Closely Aligned', desc: 'Discreet, prudent guardian of inner private sanctuaries.' }
    ]
  },
  {
    id: 'special_markings',
    title: 'Sacred Markings Confirmation',
    subtitle: 'Inspect beneath your index finger and central palm for subtle motifs.',
    options: [
      { id: 'TRISHULA', label: 'Trident / Trishula', desc: 'Three-pronged terminal mark indicating wisdom and elevated protection.' },
      { id: 'FISH_YAV', label: 'Sacred Yav / Fish Mark', desc: 'Ancient auspicious sign of scholarly or spiritual discernment.' },
      { id: 'SOLOMON_RING', label: 'Solomon Ring', desc: 'Graceful semi-circle under Jupiter finger denoting empathic intuition.' },
      { id: 'NONE', label: 'Clean Smooth Field', desc: 'Unbroken planar clarity focusing direct energetic momentum.' }
    ]
  }
];

export function renderQuestionnaireStep(moduleIdx, currentAnswer, onSelect) {
  const currentModule = questionnaireModules[moduleIdx];
  const progressPercent = ((moduleIdx + 1) / questionnaireModules.length) * 100;

  return `
    <div class="questionnaire-step-card" style="display: flex; flex-direction: column; gap: 18px;">
      
      <!-- Top Step Header & Progress -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="kai-badge kai-badge-secondary" style="font-size: 10px;">
            Step 0${moduleIdx + 1} of 0${questionnaireModules.length}
          </span>
          <span style="font-family: monospace; font-size: 11px; color: var(--color-on-surface-variant);">
            ${Math.round(progressPercent)}% COMPLETE
          </span>
        </div>
        <div style="width: 100%; height: 4px; background: var(--color-surface-container-highest); border-radius: 9999px; overflow: hidden;">
          <div style="width: ${progressPercent}%; height: 100%; background: var(--gradient-primary-btn); transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Title & Instructions -->
      <div>
        <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-text-high);">
          ${currentModule.title}
        </h2>
        <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.5;">
          ${currentModule.subtitle}
        </p>
      </div>

      <!-- Visual Observation Illustration Box -->
      <div style="width: 100%; height: 140px; border-radius: var(--radius-lg); background: var(--color-surface-container-lowest); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
        <svg viewBox="0 0 280 120" style="width: 100%; height: 100%;" fill="none">
          <circle cx="140" cy="60" r="45" fill="rgba(147, 125, 255, 0.08)"/>
          <path d="M 60 90 Q 140 30 220 90" stroke="#e4c276" stroke-width="1.5" stroke-dasharray="3 3"/>
          <circle cx="140" cy="60" r="6" fill="#e4c276"/>
          <line x1="140" y1="60" x2="190" y2="40" stroke="#47d6ff" stroke-width="2" stroke-linecap="round"/>
          <circle cx="190" cy="40" r="4" fill="#47d6ff"/>
          <text x="140" y="105" text-anchor="middle" fill="#c9c4d6" font-size="10" font-family="monospace">
            OPTICAL ANGLE MAPPING
          </text>
        </svg>
      </div>

      <!-- Options List -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${currentModule.options.map(opt => {
          const isSelected = currentAnswer === opt.id;
          return `
            <div class="kai-card ${isSelected ? 'kai-card-gold-rim' : ''}" 
                 data-opt-id="${opt.id}"
                 role="button" tabindex="0"
                 style="padding: 14px 16px; cursor: pointer; background: ${isSelected ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)'}; transition: all 0.2s ease;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                <div style="flex: 1; padding-right: 12px;">
                  <h4 style="font-size: 14px; font-weight: 600; color: ${isSelected ? 'var(--color-secondary)' : 'var(--color-text-high)'};">
                    ${opt.label}
                  </h4>
                  <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 3px;">
                    ${opt.desc}
                  </p>
                </div>
                <div style="width: 20px; height: 20px; border-radius: 9999px; border: 1.5px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-outline-variant)'}; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
                  ${isSelected ? `<span style="width: 10px; height: 10px; border-radius: 9999px; background: var(--color-secondary);"></span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
