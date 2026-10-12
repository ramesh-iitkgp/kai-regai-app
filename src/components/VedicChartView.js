/**
 * VedicChartView — Presentation Component for Classical Vedic Birth Charts
 * 
 * Features:
 * - South Indian Chart Layout (Traditional 4x4 perimeter grid with signs fixed counter-clockwise)
 * - Highlights Ascendant (Lagna) and planetary placements
 * - Planetary placements table (Sign, Degree, Nakshatra, Pada, Dignity, House)
 * - Vimshottari Dasha current timeline
 * - Epistemic distinction: Pure astronomical facts separated from interpretations
 */

export function renderVedicChartView(chart) {
  if (!chart || chart.astrologySystem !== 'VEDIC') {
    return `<div class="vedic-chart-empty">No Vedic chart calculated.</div>`;
  }

  const { ascendant, planetaryPositions, nakshatraData, dashaData, settings, warnings = [] } = chart;
  const planets = planetaryPositions?.list || [];

  // Map planets to sign index (0 = Mesha/Aries ... 11 = Meena/Pisces)
  const signPlanets = Array.from({ length: 12 }, () => []);
  for (const p of planets) {
    if (typeof p.signIndex === 'number' && p.signIndex >= 0 && p.signIndex < 12) {
      signPlanets[p.signIndex].push(p);
    }
  }

  // South Indian Chart Grid (Fixed signs):
  // [11: Pisces]  [0: Aries]    [1: Taurus]   [2: Gemini]
  // [10: Aquarius]                            [3: Cancer]
  // [9: Capricorn]                            [4: Leo]
  // [8: Sagittarius] [7: Scorpio] [6: Libra]   [5: Virgo]

  const southIndianBoxes = [
    { signIdx: 11, label: 'Pisces (Meena)', row: 1, col: 1 },
    { signIdx: 0,  label: 'Aries (Mesha)',  row: 1, col: 2 },
    { signIdx: 1,  label: 'Taurus (Vrishabha)', row: 1, col: 3 },
    { signIdx: 2,  label: 'Gemini (Mithuna)', row: 1, col: 4 },

    { signIdx: 10, label: 'Aquarius (Kumbha)', row: 2, col: 1 },
    // Center 2x2 spans rows 2-3, cols 2-3
    { signIdx: 3,  label: 'Cancer (Karka)', row: 2, col: 4 },

    { signIdx: 9,  label: 'Capricorn (Makara)', row: 3, col: 1 },
    { signIdx: 4,  label: 'Leo (Simha)', row: 3, col: 4 },

    { signIdx: 8,  label: 'Sagittarius (Dhanu)', row: 4, col: 1 },
    { signIdx: 7,  label: 'Scorpio (Vrishchika)', row: 4, col: 2 },
    { signIdx: 6,  label: 'Libra (Tula)', row: 4, col: 3 },
    { signIdx: 5,  label: 'Virgo (Kanya)', row: 4, col: 4 }
  ];

  function renderBoxContent(box) {
    const isAscSign = ascendant && ascendant.signIndex === box.signIdx;
    const boxPlanets = signPlanets[box.signIdx] || [];

    let badges = '';
    if (isAscSign) {
      badges += `<span style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">ASC (${ascendant.degreeInSign.toFixed(1)}°)</span> `;
    }

    const planetTags = boxPlanets.map(p => {
      const retro = p.isRetrograde ? '<span style="color: #ef4444; font-size: 8px;">(R)</span>' : '';
      return `<span style="color: #fbbf24; font-weight: 600; font-size: 10px;">${p.name.slice(0, 2)}${retro} <span style="color: #94a3b8; font-size: 8.5px;">${p.degreeInSign.toFixed(0)}°</span></span>`;
    }).join(' ');

    return `
      <div style="font-size: 8.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; display: flex; justify-content: space-between;">
        <span>${box.label.split(' ')[0]}</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
        ${badges}
        ${planetTags}
      </div>
    `;
  }

  return `
    <div class="vedic-chart-wrapper" style="background: radial-gradient(circle at top, rgba(251, 191, 36, 0.08) 0%, rgba(14, 12, 20, 0.98) 100%), #0e0c14; border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 18px; padding: 18px; margin-bottom: 18px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);">
      
      <!-- Chart Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); padding-bottom: 10px;">
        <div>
          <span class="kai-badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); font-size: 9.5px; padding: 2px 7px;">
            ✦ VEDIC KUNDALI (SOUTH INDIAN)
          </span>
          <h4 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #ffffff; margin: 4px 0 0 0;">
            ${nakshatraData ? `${nakshatraData.janmaRashi} Rashi • ${nakshatraData.janmaNakshatra} (Pada ${nakshatraData.janmaPada})` : 'Sidereal Birth Chart'}
          </h4>
        </div>
        <div style="text-align: right; font-size: 10px; color: #94a3b8;">
          <div>Ayanamsa: <span style="color: #fbbf24;">${settings.ayanamsa || 'Lahiri'} (${settings.ayanamsaFormatted || ''})</span></div>
          <div>House: <span style="color: #cbd5e1;">Whole Sign</span></div>
        </div>
      </div>

      <!-- Warnings Notice -->
      ${warnings.length > 0 ? `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; color: #fde68a;">
          ⚠ ${warnings.join(' ')}
        </div>
      ` : ''}

      <!-- South Indian 4x4 Grid -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 70px); gap: 4px; border: 1.5px solid rgba(251, 191, 36, 0.5); border-radius: 12px; background: rgba(0, 0, 0, 0.4); padding: 4px; margin-bottom: 16px;">
        
        <!-- Row 1 -->
        <div style="grid-column: 1; grid-row: 1; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[0])}</div>
        <div style="grid-column: 2; grid-row: 1; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[1])}</div>
        <div style="grid-column: 3; grid-row: 1; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[2])}</div>
        <div style="grid-column: 4; grid-row: 1; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[3])}</div>

        <!-- Row 2 -->
        <div style="grid-column: 1; grid-row: 2; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[4])}</div>
        <!-- Center Box (Spans 2x2) -->
        <div style="grid-column: 2 / span 2; grid-row: 2 / span 2; border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 8px; background: radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, rgba(20, 16, 28, 0.95) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8px;">
          <span style="font-size: 18px; color: #fbbf24;">✦</span>
          <span style="font-family: var(--font-display); font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase;">KAI REGAI</span>
          <span style="font-size: 9.5px; color: #94a3b8;">RASI KUNDALI</span>
          ${ascendant ? `<span style="font-size: 10px; color: #f87171; font-weight: 700; margin-top: 4px;">LAGNA: ${ascendant.signName}</span>` : ''}
        </div>
        <div style="grid-column: 4; grid-row: 2; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[5])}</div>

        <!-- Row 3 -->
        <div style="grid-column: 1; grid-row: 3; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[6])}</div>
        <div style="grid-column: 4; grid-row: 3; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[7])}</div>

        <!-- Row 4 -->
        <div style="grid-column: 1; grid-row: 4; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[8])}</div>
        <div style="grid-column: 2; grid-row: 4; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[9])}</div>
        <div style="grid-column: 3; grid-row: 4; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[10])}</div>
        <div style="grid-column: 4; grid-row: 4; border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 6px; padding: 6px; background: rgba(255, 255, 255, 0.02);">${renderBoxContent(southIndianBoxes[11])}</div>

      </div>

      <!-- Planetary Positions Table -->
      <div style="margin-top: 14px; overflow-x: auto;">
        <h5 style="font-size: 11.5px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px 0;">
          Graha Spashta (Planetary Longitudes)
        </h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #cbd5e1;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(251, 191, 36, 0.25); text-align: left; color: #94a3b8; font-size: 9.5px; text-transform: uppercase;">
              <th style="padding: 4px 6px;">Body</th>
              <th style="padding: 4px 6px;">Rashi</th>
              <th style="padding: 4px 6px;">Degrees</th>
              <th style="padding: 4px 6px;">Nakshatra</th>
              <th style="padding: 4px 6px;">Pada</th>
              <th style="padding: 4px 6px;">Dignity</th>
              <th style="padding: 4px 6px;">Bhava</th>
            </tr>
          </thead>
          <tbody>
            ${planets.map(p => `
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 5px 6px; font-weight: 600; color: #ffffff;">${p.name} ${p.isRetrograde ? '<span style="color: #ef4444; font-size: 9px;">(R)</span>' : ''}</td>
                <td style="padding: 5px 6px; color: #fbbf24;">${p.signName}</td>
                <td style="padding: 5px 6px;">${p.degreeInSign.toFixed(2)}°</td>
                <td style="padding: 5px 6px;">${p.nakshatra?.nakshatraName || '—'}</td>
                <td style="padding: 5px 6px;">${p.nakshatra?.pada || '—'}</td>
                <td style="padding: 5px 6px; font-size: 9.5px; color: ${p.dignity === 'EXALTED' ? '#4ade80' : p.dignity === 'DEBILITATED' ? '#f87171' : '#94a3b8'};">${p.dignity}</td>
                <td style="padding: 5px 6px; color: #cbd5e1;">H${p.house || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Vimshottari Dasha Section -->
      ${dashaData ? `
        <div style="margin-top: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 10px; padding: 10px 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase;">Vimshottari Mahadasha Timeline</span>
            <span style="font-size: 10px; color: #94a3b8;">120 Year Cycle</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            ${dashaData.periods?.slice(0, 5).map((p, idx) => `
              <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid ${idx === 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 6px; padding: 6px 10px; min-width: 100px; flex-shrink: 0;">
                <div style="font-size: 11px; font-weight: 700; color: ${idx === 0 ? '#fbbf24' : '#ffffff'}; text-transform: capitalize;">${p.ruler}</div>
                <div style="font-size: 9.5px; color: #94a3b8;">${p.startDate.slice(0, 4)} – ${p.endDate.slice(0, 4)}</div>
                <div style="font-size: 8.5px; color: #cbd5e1;">${p.durationYears} yrs</div>
              </div>
            `).join('') || ''}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}
