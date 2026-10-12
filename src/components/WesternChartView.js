/**
 * WesternChartView — Presentation Component for Western Tropical Birth Charts
 * 
 * Features:
 * - High-aesthetic SVG Circular Chart Wheel (Zodiac ring, 12 house sectors, aspect chords)
 * - Tropical Placements Table (Sign, Degrees, House, Retrograde flag)
 * - Major Angular Aspects Table with applying/separating dynamics
 * - Element (Fire/Earth/Air/Water) & Modality (Cardinal/Fixed/Mutable) balance bars
 */

export function renderWesternChartView(chart) {
  if (!chart || chart.astrologySystem !== 'WESTERN') {
    return `<div class="western-chart-empty">No Western chart calculated.</div>`;
  }

  const { ascendant, planetaryPositions, aspects = [], westernSynthesis, settings, warnings = [] } = chart;
  const planets = planetaryPositions?.list || [];
  const balances = westernSynthesis?.balances || { elements: {}, modalities: {} };

  // Calculate SVG Wheel dimensions
  const size = 320;
  const center = size / 2;
  const radius = 135;
  const innerRadius = 90;

  // Render SVG Planets and Aspect lines
  const ascLon = ascendant?.longitude ?? 0;

  // Convert ecliptic longitude to SVG angle (Ascendant on left horizon at 180° SVG / 9 o'clock)
  function lonToSvgAngle(lon) {
    const relLon = (lon - ascLon + 360) % 360;
    // Ascendant (relLon = 0) is at 180° (left). Counter-clockwise rotation:
    const angleDeg = (180 - relLon + 360) % 360;
    return (angleDeg * Math.PI) / 180;
  }

  // Generate Aspect chords
  const aspectLines = aspects.slice(0, 15).map(asp => {
    const p1 = planets.find(p => p.key === asp.body1);
    const p2 = planets.find(p => p.key === asp.body2);
    if (!p1 || !p2) return '';

    const a1 = lonToSvgAngle(p1.apparentLongitude);
    const a2 = lonToSvgAngle(p2.apparentLongitude);

    const x1 = center + innerRadius * 0.9 * Math.cos(a1);
    const y1 = center + innerRadius * 0.9 * Math.sin(a1);
    const x2 = center + innerRadius * 0.9 * Math.cos(a2);
    const y2 = center + innerRadius * 0.9 * Math.sin(a2);

    const color = asp.nature === 'DYNAMIC' ? 'rgba(239, 68, 68, 0.5)' : asp.nature === 'HARMONIOUS' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(251, 191, 36, 0.4)';

    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1" stroke-dasharray="${asp.direction === 'APPLYING' ? 'none' : '3,2'}" />`;
  }).join('');

  // Generate Planet markers on wheel
  const planetMarkers = planets.map(p => {
    const angle = lonToSvgAngle(p.apparentLongitude);
    const r = (radius + innerRadius) / 2;
    const px = center + r * Math.cos(angle);
    const py = center + r * Math.sin(angle);

    return `
      <g transform="translate(${px.toFixed(1)}, ${py.toFixed(1)})">
        <circle r="7" fill="#1e182e" stroke="#fbbf24" stroke-width="1.2" />
        <text text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-size="8" font-weight="700">${p.name.slice(0, 2)}</text>
      </g>
    `;
  }).join('');

  return `
    <div class="western-chart-wrapper" style="background: radial-gradient(circle at top, rgba(0, 210, 255, 0.08) 0%, rgba(14, 12, 20, 0.98) 100%), #0e0c14; border: 1px solid rgba(0, 210, 255, 0.35); border-radius: 18px; padding: 18px; margin-bottom: 18px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);">
      
      <!-- Chart Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(0, 210, 255, 0.2); padding-bottom: 10px;">
        <div>
          <span class="kai-badge" style="background: rgba(0, 210, 255, 0.15); color: #00d2ff; border: 1px solid rgba(0, 210, 255, 0.4); font-size: 9.5px; padding: 2px 7px;">
            ✦ WESTERN TROPICAL NATAL CHART
          </span>
          <h4 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #ffffff; margin: 4px 0 0 0;">
            Sun in ${westernSynthesis?.sunSign || '—'} • Moon in ${westernSynthesis?.moonSign || '—'}
          </h4>
        </div>
        <div style="text-align: right; font-size: 10px; color: #94a3b8;">
          <div>House System: <span style="color: #00d2ff;">${settings.houseSystem || 'Placidus'}</span></div>
          <div>Chart Ruler: <span style="color: #fbbf24; text-transform: capitalize;">${westernSynthesis?.chartRuler || '—'}</span></div>
        </div>
      </div>

      <!-- Warnings Notice -->
      ${warnings.length > 0 ? `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; color: #fde68a;">
          ⚠ ${warnings.join(' ')}
        </div>
      ` : ''}

      <!-- Interactive SVG Chart Wheel -->
      <div style="display: flex; justify-content: center; margin: 10px 0 16px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background: rgba(10, 8, 16, 0.6); border-radius: 50%; border: 1.5px solid rgba(0, 210, 255, 0.35); box-shadow: 0 0 24px rgba(0, 210, 255, 0.15);">
          <!-- Outer Wheel Rings -->
          <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(0, 210, 255, 0.4)" stroke-width="1.5" />
          <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="rgba(14, 12, 22, 0.85)" stroke="rgba(0, 210, 255, 0.3)" stroke-width="1" />
          
          <!-- Horizon & Meridian Axes -->
          <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="rgba(244, 63, 94, 0.7)" stroke-width="1.8" />
          <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="rgba(251, 191, 36, 0.6)" stroke-width="1.5" />
          
          <!-- Axis Labels -->
          <text x="${center - radius + 8}" y="${center - 5}" fill="#f43f5e" font-size="9" font-weight="800">ASC</text>
          <text x="${center + radius - 24}" y="${center - 5}" fill="#94a3b8" font-size="9">DSC</text>
          <text x="${center + 5}" y="${center - radius + 14}" fill="#fbbf24" font-size="9" font-weight="800">MC</text>
          <text x="${center + 5}" y="${center + radius - 8}" fill="#94a3b8" font-size="9">IC</text>

          <!-- Aspect Chords in Wheel Center -->
          ${aspectLines}

          <!-- Planet Markers -->
          ${planetMarkers}
        </svg>
      </div>

      <!-- Elemental and Modality Balance Bars -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #00d2ff; text-transform: uppercase; margin-bottom: 6px;">Elements</div>
          <div style="font-size: 10.5px; color: #cbd5e1; display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; justify-content: space-between;"><span>🔥 Fire:</span> <span style="color: #fbbf24; font-weight: 700;">${balances.elements?.FIRE || 0}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>🌱 Earth:</span> <span style="color: #4ade80; font-weight: 700;">${balances.elements?.EARTH || 0}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>💨 Air:</span> <span style="color: #00d2ff; font-weight: 700;">${balances.elements?.AIR || 0}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>🌊 Water:</span> <span style="color: #818cf8; font-weight: 700;">${balances.elements?.WATER || 0}</span></div>
          </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #00d2ff; text-transform: uppercase; margin-bottom: 6px;">Modalities</div>
          <div style="font-size: 10.5px; color: #cbd5e1; display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; justify-content: space-between;"><span>⚡ Cardinal:</span> <span style="color: #ffffff; font-weight: 700;">${balances.modalities?.CARDINAL || 0}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>🏛 Fixed:</span> <span style="color: #ffffff; font-weight: 700;">${balances.modalities?.FIXED || 0}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>🌀 Mutable:</span> <span style="color: #ffffff; font-weight: 700;">${balances.modalities?.MUTABLE || 0}</span></div>
          </div>
        </div>
      </div>

      <!-- Placements Table -->
      <div style="margin-top: 10px; overflow-x: auto;">
        <h5 style="font-size: 11.5px; font-weight: 700; color: #00d2ff; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px 0;">
          Tropical Planetary Positions
        </h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #cbd5e1;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(0, 210, 255, 0.25); text-align: left; color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">
              <th style="padding: 4px 6px;">Body</th>
              <th style="padding: 4px 6px;">Sign</th>
              <th style="padding: 4px 6px;">Degrees</th>
              <th style="padding: 4px 6px;">House</th>
              <th style="padding: 4px 6px;">Motion</th>
            </tr>
          </thead>
          <tbody>
            ${planets.map(p => `
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 5px 6px; font-weight: 600; color: #ffffff;">${p.name}</td>
                <td style="padding: 5px 6px; color: #00d2ff;">${p.symbol || ''} ${p.signName}</td>
                <td style="padding: 5px 6px;">${p.degreeInSign.toFixed(2)}°</td>
                <td style="padding: 5px 6px; color: #cbd5e1;">${p.house ? `House ${p.house}` : '—'}</td>
                <td style="padding: 5px 6px; font-size: 10px; color: ${p.isRetrograde ? '#f87171' : '#4ade80'};">${p.motionStatus || (p.isRetrograde ? 'RETROGRADE' : 'DIRECT')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Major Aspects Table -->
      ${aspects.length > 0 ? `
        <div style="margin-top: 14px; overflow-x: auto;">
          <h5 style="font-size: 11.5px; font-weight: 700; color: #00d2ff; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px 0;">
            Major Planetary Aspects
          </h5>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; color: #cbd5e1;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(0, 210, 255, 0.25); text-align: left; color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">
                <th style="padding: 4px 6px;">Aspect</th>
                <th style="padding: 4px 6px;">Angle</th>
                <th style="padding: 4px 6px;">Orb</th>
                <th style="padding: 4px 6px;">Dynamics</th>
              </tr>
            </thead>
            <tbody>
              ${aspects.slice(0, 10).map(a => `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                  <td style="padding: 4px 6px; font-weight: 600; color: #ffffff;">${a.body1Name} ${a.aspectName} ${a.body2Name}</td>
                  <td style="padding: 4px 6px; color: #94a3b8;">${a.targetAngle}° (${a.actualSeparation.toFixed(1)}°)</td>
                  <td style="padding: 4px 6px; color: #fbbf24;">${a.orbDeviation.toFixed(2)}°</td>
                  <td style="padding: 4px 6px; font-size: 9.5px; color: ${a.direction === 'APPLYING' ? '#4ade80' : '#cbd5e1'};">${a.direction}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

    </div>
  `;
}
