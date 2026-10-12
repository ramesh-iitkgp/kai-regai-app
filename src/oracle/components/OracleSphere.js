/**
 * OracleSphere Component — Mystic Obsidian Oracle Sphere
 * Proprietary Kai RegAI Mystical Experience:
 * - Continuously looping cinematic video/WebP/GIF animation generated with Imagen / Banana
 * - Luminous internal golden palm creases and swirling prana core vortex
 * - Dark smoky obsidian glass body floating above rotating energy rings
 * - Smooth fallback stack: HTML5 Video (H.264) -> Animated WebP (24-bit full color) -> Animated GIF
 * - 60 FPS CSS transforms, GPU acceleration, and prefers-reduced-motion fallback
 */

let sphereIdCounter = 0;

/**
 * Renders the Mystic Oracle Sphere
 * @param {object} options
 * @param {'idle'|'consulting'|'result'} [options.state='idle']
 * @param {number|string} [options.size=220] Diameter in px
 * @param {string} [options.statusText=''] Text shown beneath during consultation
 * @returns {string} HTML string
 */
export function renderOracleSphere({
  state = 'idle',
  size = 220,
  statusText = ''
} = {}) {
  sphereIdCounter += 1;
  const uid = `sphere_${sphereIdCounter}`;
  const isCompact = state === 'result';
  const displaySize = isCompact ? Math.round(size * 0.65) : size;

  return `
    <div class="oracle-sphere-wrapper ${isCompact ? 'compact' : ''}" data-state="${state}" style="--sphere-size: ${displaySize}px;">
      
      <!-- Ambient Outer Aura Glow -->
      <div class="oracle-ambient-halo"></div>

      <!-- Rotating Base Energy Ring -->
      <div class="oracle-energy-ring-container">
        <svg class="oracle-energy-ring-svg" viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="92" ry="34" stroke="url(#ringGrad_${uid})" stroke-width="1.8" stroke-dasharray="6 8" />
          <ellipse cx="100" cy="100" rx="80" ry="28" stroke="rgba(251, 191, 36, 0.35)" stroke-width="1.2" />
          <ellipse cx="100" cy="100" rx="64" ry="22" stroke="rgba(228, 194, 118, 0.2)" stroke-width="0.8" stroke-dasharray="3 4" />
          
          <defs>
            <linearGradient id="ringGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(251, 191, 36, 0.1)" />
              <stop offset="50%" stop-color="rgba(251, 191, 36, 0.85)" />
              <stop offset="100%" stop-color="rgba(251, 191, 36, 0.1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Floating Obsidian Sphere Glass Body with Continuously Looping Animation -->
      <div class="oracle-sphere-body">
        
        <!-- Primary Looping Hardware-Accelerated Video -->
        <video class="oracle-loop-video" 
               autoplay 
               loop 
               muted 
               playsinline 
               webkit-playsinline 
               preload="auto"
               poster="/assets/oracle/oracle_loop.webp"
               aria-label="Mystic Oracle Sphere Animation">
          <source src="/assets/oracle/oracle_loop.mp4" type="video/mp4" />
        </video>

        <!-- Continuous Looping WebP / GIF Fallback Layer -->
        <picture class="oracle-loop-fallback-wrap">
          <source srcset="/assets/oracle/oracle_loop.webp" type="image/webp" />
          <img class="oracle-loop-fallback-img" 
               src="/assets/oracle/oracle_loop.gif" 
               alt="Mystic Oracle Sphere" 
               loading="eager" />
        </picture>

        <!-- Specular 3D Obsidian Curved Glass Overlay & Depth Vignette -->
        <div class="oracle-sphere-specular-overlay"></div>
      </div>

      <!-- Dynamic Ceremony Status / Mantram Underneath -->
      ${statusText ? `
        <div class="oracle-status-text-wrap" aria-live="polite">
          <span class="oracle-status-sparkle">✦</span>
          <p class="oracle-status-text">${statusText}</p>
          <span class="oracle-status-sparkle">✦</span>
        </div>
      ` : ''}

    </div>
  `;
}
