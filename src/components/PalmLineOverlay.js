/**
 * PalmLineOverlay Component — Scalable Biometric Line Overlays
 * Non-negotiable: Non-color-only identifiers (dashed patterns + symbols + labels)
 * Source of truth: docs/p2/ACCESSIBILITY_SPEC.md & docs/p2/HAND_SCANNER_FLOW.md
 */

export function renderPalmLineOverlay({
  lines = null,
  highlightedLine = null,
  showLabels = true,
  animateGlow = true
} = {}) {
  const isLifeActive = !highlightedLine || highlightedLine === 'LIFE';
  const isHeadActive = !highlightedLine || highlightedLine === 'HEAD';
  const isHeartActive = !highlightedLine || highlightedLine === 'HEART';
  const isFateActive = !highlightedLine || highlightedLine === 'FATE';
  const isSunActive = !highlightedLine || highlightedLine === 'SUN';

  // Support dynamic CV polylines or fallback to canonical mock paths
  const lifeD = lines?.life?.path || 'M 128 178 Q 146 220 148 290 Q 148 340 185 372';
  const headD = lines?.head?.path || 'M 128 180 Q 185 190 236 215 Q 260 228 274 250';
  const heartD = lines?.heart?.path || 'M 285 158 Q 230 148 185 142 Q 160 138 145 118';
  const fateD = lines?.fate?.path || 'M 190 380 L 188 235 L 185 132';
  const sunD = lines?.sun?.path || 'M 224 235 L 222 135';

  const isLifeVisible = lines ? (lines.life?.detected !== false && lines.life?.status !== 'NOT_DETECTED') : true;
  const isHeadVisible = lines ? (lines.head?.detected !== false && lines.head?.status !== 'NOT_DETECTED') : true;
  const isHeartVisible = lines ? (lines.heart?.detected !== false && lines.heart?.status !== 'NOT_DETECTED') : true;
  const isFateVisible = lines ? (lines.fate?.detected !== false && lines.fate?.status !== 'NOT_DETECTED') : true;
  const isSunVisible = lines ? (lines.sun?.detected !== false && lines.sun?.status !== 'NOT_DETECTED') : true;

  return `
    <svg class="palm-lines-svg" viewBox="0 0 360 450" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 15;" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Filter for ethereal sacred line glow -->
        <filter id="glow-life" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-head" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-heart" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-fate" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-sun" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- 1. Life Line (Ayur Rekha) — Violet (#A855F7), Solid continuous stroke -->
      <g opacity="${!isLifeVisible ? 0 : (isLifeActive ? 1 : 0.2)}" style="transition: opacity 0.3s ease; ${!isLifeVisible ? 'display: none;' : ''}">
        <path d="${lifeD}" 
              stroke="#A855F7" 
              stroke-width="${highlightedLine === 'LIFE' ? 4 : 2.5}" 
              stroke-linecap="round"
              filter="${animateGlow ? 'url(#glow-life)' : 'none'}"/>
        <!-- Accessible Keypoint Node: Square symbol for Life/Earth -->
        <rect x="124" y="174" width="7" height="7" fill="#A855F7" rx="1"/>
        <rect x="182" y="369" width="7" height="7" fill="#A855F7" rx="1"/>
      </g>

      <!-- 2. Head Line (Matru Rekha) — Blue (#00D2FF), Dashed pattern (8 2) -->
      <g opacity="${!isHeadVisible ? 0 : (isHeadActive ? 1 : 0.2)}" style="transition: opacity 0.3s ease; ${!isHeadVisible ? 'display: none;' : ''}">
        <path d="${headD}" 
              stroke="#00D2FF" 
              stroke-width="${highlightedLine === 'HEAD' ? 4 : 2.5}" 
              stroke-linecap="round"
              stroke-dasharray="8 2"
              filter="${animateGlow ? 'url(#glow-head)' : 'none'}"/>
        <!-- Accessible Keypoint Node: Diamond symbol for Head/Intellect -->
        <polygon points="128,175 133,180 128,185 123,180" fill="#00D2FF"/>
        <polygon points="274,245 279,250 274,255 269,250" fill="#00D2FF"/>
      </g>

      <!-- 3. Heart Line (Pitri/Hridaya Rekha) — Rose (#F43F5E), Dashed pattern (12 3) -->
      <g opacity="${!isHeartVisible ? 0 : (isHeartActive ? 1 : 0.2)}" style="transition: opacity 0.3s ease; ${!isHeartVisible ? 'display: none;' : ''}">
        <path d="${heartD}" 
              stroke="#F43F5E" 
              stroke-width="${highlightedLine === 'HEART' ? 4 : 2.5}" 
              stroke-linecap="round"
              stroke-dasharray="12 3"
              filter="${animateGlow ? 'url(#glow-heart)' : 'none'}"/>
        <!-- Accessible Keypoint Node: Circle for Heart/Affect -->
        <circle cx="285" cy="158" r="3.5" fill="#F43F5E"/>
        <circle cx="145" cy="118" r="3.5" fill="#F43F5E"/>
      </g>

      <!-- 4. Fate Line (Urdhva/Karma Rekha) — Gold (#FBBF24), Dash-dot pattern (10 3 2 3) -->
      <g opacity="${!isFateVisible ? 0 : (isFateActive ? 1 : 0.2)}" style="transition: opacity 0.3s ease; ${!isFateVisible ? 'display: none;' : ''}">
        <path d="${fateD}" 
              stroke="#FBBF24" 
              stroke-width="${highlightedLine === 'FATE' ? 3.5 : 2}" 
              stroke-linecap="round"
              stroke-dasharray="10 3 2 3"
              filter="${animateGlow ? 'url(#glow-fate)' : 'none'}"/>
        <!-- Accessible Keypoint Node: Triangle for Fate/Karma -->
        <polygon points="185,127 189,134 181,134" fill="#FBBF24"/>
      </g>

      <!-- 5. Sun Line (Surya Rekha) — Amber (#F59E0B), Dotted pattern (3 3) -->
      <g opacity="${!isSunVisible ? 0 : (isSunActive ? 1 : 0.2)}" style="transition: opacity 0.3s ease; ${!isSunVisible ? 'display: none;' : ''}">
        <path d="${sunD}" 
              stroke="#F59E0B" 
              stroke-width="${highlightedLine === 'SUN' ? 3.5 : 1.8}" 
              stroke-linecap="round"
              stroke-dasharray="3 3"
              filter="${animateGlow ? 'url(#glow-sun)' : 'none'}"/>
        <!-- Accessible Keypoint Node: Sunburst disc -->
        <circle cx="222" cy="135" r="3" fill="#F59E0B"/>
      </g>
    </svg>
  `;
}
