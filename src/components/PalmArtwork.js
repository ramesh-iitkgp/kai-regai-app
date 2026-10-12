/**
 * PalmArtwork Component — Photorealistic 3D Palm Artwork with Dynamic Line Illumination
 * Replaces cartoon/animated vector hands with authentic 3D photorealistic hand imagery
 * matching the homepage and thumbnail cards, supporting both Left & Right palms.
 *
 * Features:
 * - Real 3D Palm Base Photo (Dakshina Kara / Right Hand by default, Vama Kara / Left Hand via anatomical mirroring)
 * - 3D Multi-Layer Luminous Laser Paths with Gaussian Glow & Core Highlights:
 *   - Jivita Rekha (Life Line): Luminous Violet (#A855F7, #C084FC)
 *   - Shiro Rekha (Head Line): Electric Cyan / Blue (#00D2FF, #38BDF8)
 *   - Hridaya Rekha (Heart Line): Radiant Rose Pink (#F43F5E, #FB7185)
 *   - Bhagya Rekha (Fate / Destiny Line): Celestial Warm Gold (#FBBF24, #FDE047)
 *   - Vivaha Rekha (Marriage Line): Golden Amber (#F59E0B, #FBBF24)
 *   - Kara Namyata (Hand Flexibility): Sacred Emerald (#34D399, #10B981)
 * - Specific variant line trajectories mapped anatomically onto real hand creases
 */

let artworkIdCounter = 0;

/**
 * Render Front Open Palm with Realistic 3D Hand Photo & 3D Glowing Neon Creases
 * @param {Object} options
 * @param {'RIGHT'|'LEFT'} [options.hand='RIGHT']
 * @param {'LIFE'|'HEAD'|'HEART'|'FATE'|'MARRIAGE'|'ALL'|'NONE'} [options.highlightLine='ALL']
 * @param {string} [options.variant='DEFAULT']
 * @param {number|string} [options.width='100%']
 * @param {number|string} [options.height='100%']
 * @param {string} [options.customClass='']
 * @returns {string} SVG HTML with embedded photorealistic 3D hand and 3D glowing lines
 */
export function renderOpenPalmArtwork({
  hand = 'RIGHT',
  highlightLine = 'ALL',
  variant = 'DEFAULT',
  width = '100%',
  height = '100%',
  customClass = ''
} = {}) {
  artworkIdCounter += 1;
  const uniqueId = `palm_${artworkIdCounter}`;
  const isLeft = hand.toUpperCase() === 'LEFT';
  
  const showLife = highlightLine === 'ALL' || highlightLine === 'LIFE';
  const showHead = highlightLine === 'ALL' || highlightLine === 'HEAD';
  const showHeart = highlightLine === 'ALL' || highlightLine === 'HEART';
  const showFate = highlightLine === 'ALL' || highlightLine === 'FATE';
  const showMarriage = highlightLine === 'ALL' || highlightLine === 'MARRIAGE';

  // Determine realistic 3D photograph background source
  let baseImgSrc = '/assets/lines/realistic_3d_palm_base.jpg';

  if (highlightLine === 'ALL') {
    baseImgSrc = '/assets/lines/realistic_3d_palm_all_lines.jpg';
  } else if (variant === 'DEFAULT') {
    if (highlightLine === 'LIFE') baseImgSrc = '/assets/lines/thumb_life_line.jpg';
    else if (highlightLine === 'HEAD') baseImgSrc = '/assets/lines/thumb_head_line.jpg';
    else if (highlightLine === 'HEART') baseImgSrc = '/assets/lines/thumb_heart_line.jpg';
    else if (highlightLine === 'FATE') baseImgSrc = '/assets/lines/thumb_fate_line.jpg';
    else if (highlightLine === 'MARRIAGE') baseImgSrc = '/assets/lines/thumb_marriage_line.jpg';
  }

  // Precision 3D Crease Coordinates mapped to 240x300 viewBox on realistic palm photo

  // 1. Shiro Rekha (Head line) — Electric Blue (#00D2FF)
  // Origin: Between thumb and index finger (68, 158)
  let headD = 'M 68 158 Q 128 168 184 195'; // balanced gentle curve
  if (variant === 'NOT_CURVED') {
    headD = 'M 68 158 L 192 168'; // straight horizontal to Upper Mars
  } else if (variant === 'CURVED') {
    headD = 'M 68 158 Q 128 168 184 195'; // gently curved
  } else if (variant === 'VERY_CURVED') {
    headD = 'M 68 158 Q 120 178 168 248'; // deeply descending toward Moon Mount
  }

  // 2. Hridaya Rekha (Heart line) — Rose Pink (#F43F5E)
  // Origin: Outer edge below pinky (208, 150)
  let heartD = 'M 208 150 C 165 138 125 128 92 120'; // standard high sweep
  if (variant === 'CONNECTED') {
    heartD = 'M 208 150 C 160 142 115 145 68 158'; // joined at thumb origin with head line
  } else if (variant === 'NOT_CONNECTED') {
    heartD = 'M 208 150 C 165 138 125 128 92 120'; // distinct clear gap
  } else if (variant === 'GURU_GAMI') {
    heartD = 'M 208 150 C 165 138 120 120 73 116'; // high arc ascending onto Jupiter Mount
  }

  // 3. Bhagya Rekha (Fate line) — Warm Gold (#FBBF24)
  // Ascends vertically toward Saturn Mount (115, 112)
  let fateD = 'M 112 276 L 115 195 L 115 112'; // standard vertical
  let fateExtraSvg = '';
  if (variant === 'CROSSES_PALM') {
    fateD = 'M 112 276 L 115 195 L 115 110';
  } else if (variant === 'DOUBLE_LINE') {
    fateD = 'M 108 270 L 110 195 L 110 114';
    fateExtraSvg = `
      <path d="M 120 262 L 122 195 L 122 118" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" filter="url(#glowFate_${uniqueId})" />
      <path d="M 120 262 L 122 195 L 122 118" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" />
    `;
  } else if (variant === 'FROM_LUNA') {
    fateD = 'M 180 235 Q 142 198 115 116'; // curving from Mount of Moon
  } else if (variant === 'CENTER_ONLY') {
    fateD = 'M 114 218 L 115 142'; // strong mid-palm segment only
  }

  // 4. Jivita Rekha (Life line) — Royal Violet (#A855F7)
  // Origin: (68, 158), curves around Mount of Venus to wrist base (112, 276)
  let lifeD = 'M 68 158 C 96 178 126 215 118 250 C 114 265 106 272 112 278';
  let lifeExtraSvg = '';
  if (variant === 'WIDE_SWEEP') {
    lifeD = 'M 68 158 C 102 180 134 220 124 256 C 120 270 112 276 116 280'; // expansive arc
  } else if (variant === 'NARROW_ARC') {
    lifeD = 'M 68 158 C 82 178 88 215 78 248 C 74 262 72 270 82 276'; // hugging thumb
  } else if (variant === 'UPWARD_BRANCHES') {
    lifeD = 'M 68 158 C 96 178 126 215 118 250 C 114 265 106 272 112 278';
    lifeExtraSvg = `
      <path d="M 82 195 Q 76 172 72 152" stroke="#A855F7" stroke-width="2.6" stroke-linecap="round" filter="url(#glowLife_${uniqueId})" />
      <path d="M 96 225 Q 106 205 110 188" stroke="#A855F7" stroke-width="2.6" stroke-linecap="round" filter="url(#glowLife_${uniqueId})" />
    `;
  }

  // 5. Vivaha Rekha (Marriage line) — Warm Amber (#F59E0B)
  const marriageD = 'M 218 142 L 194 142';

  // Inner SVG group mirroring transformation:
  // For LEFT hand, transform="translate(240, 0) scale(-1, 1)" cleanly mirrors both the photo & line paths
  const transformAttr = isLeft ? 'transform="translate(240, 0) scale(-1, 1)"' : '';

  return `
    <svg class="palm-art-svg ${customClass}" viewBox="0 0 240 300" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Multi-tier 3D Laser Glow Filters -->
        <filter id="glowLife_${uniqueId}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge><feMergeNode in="blur1" /><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowHead_${uniqueId}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge><feMergeNode in="blur1" /><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowHeart_${uniqueId}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge><feMergeNode in="blur1" /><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowFate_${uniqueId}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge><feMergeNode in="blur1" /><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowMarriage_${uniqueId}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <!-- Rounded Card Viewport Clip -->
        <clipPath id="palmClip_${uniqueId}">
          <rect x="0" y="0" width="240" height="300" rx="16" ry="16" />
        </clipPath>

        <!-- Radial Cosmic Shading -->
        <radialGradient id="sacredPalmGlow_${uniqueId}" cx="50%" cy="55%" r="55%">
          <stop offset="60%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(10, 8, 18, 0.75)" />
        </radialGradient>
      </defs>

      <!-- Mirrored Hand Container -->
      <g ${transformAttr}>
        
        <!-- 1. Photorealistic 3D Hand Photo Base -->
        <g clip-path="url(#palmClip_${uniqueId})">
          <image href="${baseImgSrc}" x="0" y="0" width="240" height="300" preserveAspectRatio="none" style="filter: contrast(1.08) brightness(1.02);" />
          
          <!-- Subtle Dark Vignette Border -->
          <rect x="0" y="0" width="240" height="300" fill="url(#sacredPalmGlow_${uniqueId})" />
          <rect x="0" y="0" width="240" height="300" fill="none" stroke="rgba(228, 194, 118, 0.35)" stroke-width="1.8" rx="16" />
        </g>

        <!-- 2. Jivita Rekha (Life Line) — Luminous Violet (#A855F7) -->
        ${showLife ? `
          <g class="palm-art-line life-group">
            <!-- Atmospheric Outer Glow Tube -->
            <path d="${lifeD}" stroke="#A855F7" stroke-width="${highlightLine === 'LIFE' ? 9 : 6}" stroke-linecap="round" opacity="0.4" />
            <!-- Primary Chromatic Neon Beam -->
            <path d="${lifeD}" stroke="#A855F7" stroke-width="${highlightLine === 'LIFE' ? 4.2 : 2.8}" stroke-linecap="round" filter="url(#glowLife_${uniqueId})" />
            <!-- Ultra-Bright Center Laser Spine -->
            <path d="${lifeD}" stroke="#FFFFFF" stroke-width="${highlightLine === 'LIFE' ? 1.6 : 1.0}" stroke-linecap="round" opacity="0.85" />
            ${lifeExtraSvg}
            ${highlightLine === 'LIFE' ? `
              <circle cx="68" cy="158" r="3.8" fill="#FFFFFF" style="filter: drop-shadow(0 0 6px #A855F7);" />
              <circle cx="112" cy="278" r="3.8" fill="#F3E8FF" style="filter: drop-shadow(0 0 6px #A855F7);" />
            ` : ''}
          </g>
        ` : ''}

        <!-- 3. Shiro Rekha (Head Line) — Electric Cyan / Blue (#00D2FF) -->
        ${showHead ? `
          <g class="palm-art-line head-group">
            <path d="${headD}" stroke="#00D2FF" stroke-width="${highlightLine === 'HEAD' ? 9 : 6}" stroke-linecap="round" opacity="0.4" />
            <path d="${headD}" stroke="#00D2FF" stroke-width="${highlightLine === 'HEAD' ? 4.2 : 2.8}" stroke-linecap="round" filter="url(#glowHead_${uniqueId})" />
            <path d="${headD}" stroke="#FFFFFF" stroke-width="${highlightLine === 'HEAD' ? 1.6 : 1.0}" stroke-linecap="round" opacity="0.85" />
            ${highlightLine === 'HEAD' ? `
              <circle cx="68" cy="158" r="3.8" fill="#FFFFFF" style="filter: drop-shadow(0 0 6px #00D2FF);" />
              <circle cx="184" cy="195" r="3.8" fill="#E0F2FE" style="filter: drop-shadow(0 0 6px #00D2FF);" />
            ` : ''}
          </g>
        ` : ''}

        <!-- 4. Hridaya Rekha (Heart Line) — Radiant Rose Pink (#F43F5E) -->
        ${showHeart ? `
          <g class="palm-art-line heart-group">
            <path d="${heartD}" stroke="#F43F5E" stroke-width="${highlightLine === 'HEART' ? 9 : 6}" stroke-linecap="round" opacity="0.4" />
            <path d="${heartD}" stroke="#F43F5E" stroke-width="${highlightLine === 'HEART' ? 4.2 : 2.8}" stroke-linecap="round" filter="url(#glowHeart_${uniqueId})" />
            <path d="${heartD}" stroke="#FFFFFF" stroke-width="${highlightLine === 'HEART' ? 1.6 : 1.0}" stroke-linecap="round" opacity="0.85" />
            ${highlightLine === 'HEART' ? `
              <circle cx="208" cy="150" r="3.8" fill="#FFFFFF" style="filter: drop-shadow(0 0 6px #F43F5E);" />
              <circle cx="92" cy="120" r="3.8" fill="#FFE4E6" style="filter: drop-shadow(0 0 6px #F43F5E);" />
            ` : ''}
          </g>
        ` : ''}

        <!-- 5. Bhagya Rekha (Fate / Destiny Line) — Celestial Warm Gold (#FBBF24) -->
        ${showFate ? `
          <g class="palm-art-line fate-group">
            <path d="${fateD}" stroke="#FBBF24" stroke-width="${highlightLine === 'FATE' ? 8.5 : 5.5}" stroke-linecap="round" opacity="0.4" />
            <path d="${fateD}" stroke="#FBBF24" stroke-width="${highlightLine === 'FATE' ? 4 : 2.6}" stroke-linecap="round" filter="url(#glowFate_${uniqueId})" />
            <path d="${fateD}" stroke="#FFFFFF" stroke-width="${highlightLine === 'FATE' ? 1.5 : 0.9}" stroke-linecap="round" opacity="0.9" />
            ${fateExtraSvg}
            ${highlightLine === 'FATE' ? `
              <circle cx="112" cy="276" r="3.8" fill="#FFFFFF" style="filter: drop-shadow(0 0 6px #FBBF24);" />
              <circle cx="115" cy="112" r="3.8" fill="#FEF3C7" style="filter: drop-shadow(0 0 6px #FBBF24);" />
            ` : ''}
          </g>
        ` : ''}

        <!-- 6. Vivaha Rekha (Marriage Line) — Warm Amber (#F59E0B) -->
        ${showMarriage ? `
          <g class="palm-art-line marriage-group">
            <path d="${marriageD}" stroke="#F59E0B" stroke-width="${highlightLine === 'MARRIAGE' ? 8 : 5}" stroke-linecap="round" opacity="0.4" />
            <path d="${marriageD}" stroke="#F59E0B" stroke-width="${highlightLine === 'MARRIAGE' ? 4 : 2.5}" stroke-linecap="round" filter="url(#glowMarriage_${uniqueId})" />
            <path d="${marriageD}" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" />
          </g>
        ` : ''}

      </g>
    </svg>
  `;
}

/**
 * Render Side Hand / Edge Profile with Realistic 3D Hand Photo Base
 * Used for:
 * 1. Hand Flexibility (Kara Namyata) — Emerald green angle guides
 * 2. Marriage Lines (Vivaha Rekha) — Outer edge amber creases
 * @param {Object} options
 * @param {'RIGHT'|'LEFT'} [options.hand='RIGHT']
 * @param {'FLEXIBILITY'|'MARRIAGE'} [options.mode='FLEXIBILITY']
 * @param {string} [options.variant='MEDIUM']
 * @param {number|string} [options.width='100%']
 * @param {number|string} [options.height='100%']
 * @param {string} [options.customClass='']
 * @returns {string} SVG HTML
 */
export function renderSideHandArtwork({
  hand = 'RIGHT',
  mode = 'FLEXIBILITY',
  variant = 'MEDIUM',
  width = '100%',
  height = '100%',
  customClass = ''
} = {}) {
  artworkIdCounter += 1;
  const uniqueId = `side_${artworkIdCounter}`;
  const isLeft = hand.toUpperCase() === 'LEFT';
  const transformAttr = isLeft ? 'transform="translate(200, 0) scale(-1, 1)"' : '';

  if (mode === 'FLEXIBILITY') {
    // Hand Flexibility on Realistic 3D Hand Base:
    // Displays realistic palm with glowing emerald elasticity arc guides
    let arcD = 'M 100 65 A 160 160 0 0 1 135 78'; // ~20° Balanced
    let angleLabel = '20°';

    if (variant === 'NOT_FLEXIBLE') {
      arcD = 'M 100 65 L 100 35'; // 0° Firm vertical alignment axis
      angleLabel = '0°';
    } else if (variant === 'VERY_FLEXIBLE') {
      arcD = 'M 100 65 A 160 160 0 0 1 160 100'; // ~45° High flexibility
      angleLabel = '45°';
    }

    return `
      <svg class="palm-art-side-svg ${customClass}" viewBox="0 0 200 240" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="sideFlexClip_${uniqueId}">
            <rect x="0" y="0" width="200" height="240" rx="16" ry="16" />
          </clipPath>
          <filter id="glowFlex_${uniqueId}" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g ${transformAttr}>
          <!-- Realistic 3D Hand Photo Base -->
          <g clip-path="url(#sideFlexClip_${uniqueId})">
            <image href="/assets/lines/thumb_flexibility.jpg" x="0" y="0" width="200" height="240" preserveAspectRatio="none" style="filter: contrast(1.08) brightness(1.02);" />
            <rect x="0" y="0" width="200" height="240" fill="none" stroke="rgba(228, 194, 118, 0.35)" stroke-width="1.8" rx="16" />
          </g>

          <!-- Glowing 3D Elasticity Guides in Sacred Emerald (#34D399) -->
          <g filter="url(#glowFlex_${uniqueId})">
            <!-- Center Palm Reference Axis -->
            <line x1="100" y1="210" x2="100" y2="65" stroke="rgba(52, 211, 153, 0.45)" stroke-width="1.8" stroke-dasharray="4 3" />
            
            <!-- Flexibility Arc Guide -->
            <path d="${arcD}" stroke="#34D399" stroke-width="4" stroke-linecap="round" />
            <path d="${arcD}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />

            <!-- Luminous Angle Pivot Node -->
            <circle cx="100" cy="65" r="4" fill="#FFFFFF" style="filter: drop-shadow(0 0 6px #34D399);" />
          </g>

          <!-- Degree Readout Badge -->
          <rect x="18" y="18" width="48" height="22" rx="11" fill="rgba(10, 27, 20, 0.85)" stroke="rgba(52, 211, 153, 0.6)" stroke-width="1.2" />
          <text x="42" y="33" fill="#34D399" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${angleLabel}</text>
        </g>
      </svg>
    `;
  }

  // MARRIAGE LINE MODE (Vivaha Rekha on Realistic 3D Palm Edge)
  // Amber color (#F59E0B) with 1, 2, or multiple stacked lines
  let linesSvg = '';
  if (variant === 'ONE_LINE') {
    linesSvg = `
      <g filter="url(#glowMarriageSide_${uniqueId})">
        <line x1="130" y1="112" x2="182" y2="112" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <line x1="130" y1="112" x2="182" y2="112" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="182" cy="112" r="3" fill="#FFFFFF" />
      </g>
    `;
  } else if (variant === 'TWO_LINES') {
    linesSvg = `
      <g filter="url(#glowMarriageSide_${uniqueId})">
        <line x1="132" y1="104" x2="180" y2="104" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />
        <line x1="132" y1="104" x2="180" y2="104" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" />
        <line x1="128" y1="122" x2="182" y2="122" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />
        <line x1="128" y1="122" x2="182" y2="122" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" />
      </g>
    `;
  } else {
    // MULTIPLE_LINES
    linesSvg = `
      <g filter="url(#glowMarriageSide_${uniqueId})">
        <line x1="135" y1="98" x2="178" y2="98" stroke="#F59E0B" stroke-width="2.6" stroke-linecap="round" />
        <line x1="135" y1="98" x2="178" y2="98" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" />
        <line x1="130" y1="112" x2="182" y2="112" stroke="#F59E0B" stroke-width="3.2" stroke-linecap="round" />
        <line x1="130" y1="112" x2="182" y2="112" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" />
        <line x1="133" y1="126" x2="179" y2="126" stroke="#F59E0B" stroke-width="2.6" stroke-linecap="round" />
        <line x1="133" y1="126" x2="179" y2="126" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" />
      </g>
    `;
  }

  return `
    <svg class="palm-art-marriage-svg ${customClass}" viewBox="0 0 200 240" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="sideMarriageClip_${uniqueId}">
          <rect x="0" y="0" width="200" height="240" rx="16" ry="16" />
        </clipPath>
        <filter id="glowMarriageSide_${uniqueId}" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g ${transformAttr}>
        <!-- Realistic 3D Hand Photo Base -->
        <g clip-path="url(#sideMarriageClip_${uniqueId})">
          <image href="/assets/lines/thumb_marriage_line.jpg" x="0" y="0" width="200" height="240" preserveAspectRatio="none" style="filter: contrast(1.08) brightness(1.02);" />
          <rect x="0" y="0" width="200" height="240" fill="none" stroke="rgba(228, 194, 118, 0.35)" stroke-width="1.8" rx="16" />
        </g>

        <!-- Illuminated 3D Marriage Creases on Outer Percussion Edge -->
        ${linesSvg}
      </g>
    </svg>
  `;
}
