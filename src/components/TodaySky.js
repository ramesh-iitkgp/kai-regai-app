/**
 * TodaySky — Vedic Celestial Positions & Rahu Kalam Display Component
 * Renders authentic daily planetary transits:
 * - Chandra Nakshatra (Moon star, Pada, Ruler, Deity)
 * - Guru Gochara (Jupiter transit house relative to user sign)
 * - Rahu Kalam time window with live "Active Now" indicator
 */

import { i18n } from '../services/i18n.js';

/**
 * Renders a full 3-row "Today's Sky" celestial insight card
 * Used in PersonalForecastModal and PersonalForecastScreen
 */
export function renderTodaySkyCard(forecast, { title = "Today's Celestial Sky" } = {}) {
  if (!forecast) return '';

  const nakshatra = forecast.nakshatra;
  const transit = forecast.planetaryTransit;
  const rahuKalam = forecast.rahuKalam || '12:00 - 13:30';
  const isActive = Boolean(forecast.rahuKalamActive);

  // If astronomy data is completely missing, return clean empty string
  if (!nakshatra && !transit) return '';

  return `
    <div class="today-sky-card" style="background: rgba(18, 14, 28, 0.7); border: 1px solid rgba(228, 194, 118, 0.3); border-radius: 16px; padding: 14px 16px; margin: 12px 0; backdrop-filter: blur(12px);">
      <!-- Card Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(228, 194, 118, 0.15); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 15px; color: #fbbf24; filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));">✦</span>
          <h4 style="font-family: var(--font-display, serif); font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.04em; margin: 0; text-transform: uppercase;">
            ${title}
          </h4>
        </div>
        <span style="font-size: 10px; color: #d6ad68; font-weight: 600; background: rgba(214, 173, 104, 0.12); padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(214, 173, 104, 0.25);">
          Live Sidereal Ephemeris
        </span>
      </div>

      <!-- 3 Rows Stack -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        
        <!-- Row 1: Moon Nakshatra -->
        ${nakshatra ? `
          <div class="sky-row" style="display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #38bdf8; font-size: 16px;">
              ☽
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 12px; font-weight: 700; color: #ffffff;">
                  Nakshatra: ${nakshatra.name} <span style="font-weight: 400; color: #38bdf8;">(Pada ${nakshatra.pada})</span>
                </span>
                <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Chandra</span>
              </div>
              <p style="font-size: 11px; color: #cbd5e1; margin: 2px 0 0 0; line-height: 1.35;">
                Ruler: <strong style="color: #e2e8f0;">${nakshatra.ruler ? nakshatra.ruler.toUpperCase() : 'Chandra'}</strong> · Deity: ${nakshatra.deity || 'Cosmic Guardian'}
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Row 2: Jupiter Planetary Transit House -->
        ${transit ? `
          <div class="sky-row" style="display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fbbf24; font-size: 15px;">
              ♃
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 12px; font-weight: 700; color: #ffffff;">
                  Guru in ${transit.sign} <span style="font-weight: 400; color: #fbbf24;">(${transit.degree}°)</span>
                </span>
                <span style="font-size: 10px; color: #d6ad68; text-transform: uppercase; letter-spacing: 0.05em;">Jupiter</span>
              </div>
              <p style="font-size: 11px; color: #cbd5e1; margin: 2px 0 0 0; line-height: 1.35;">
                House <strong style="color: #fbbf24;">${transit.house}</strong> from your Rashi · <em>${transit.domain}</em>
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Row 3: Rahu Kalam Window -->
        <div class="sky-row" style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: ${isActive ? 'rgba(239, 68, 68, 0.18)' : 'rgba(148, 163, 184, 0.1)'}; border: 1px solid ${isActive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.25)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${isActive ? '#f87171' : '#94a3b8'}; font-size: 15px;">
            ☊
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 700; color: ${isActive ? '#fca5a5' : '#ffffff'};">
                  Rahu Kalam: ${rahuKalam}
                </span>
                ${isActive ? `
                  <span class="sky-live-active-pill" style="font-size: 9px; font-weight: 800; background: #dc2626; color: #ffffff; padding: 1px 6px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; animation: pulse 1.5s infinite;">
                    Active Now
                  </span>
                ` : `
                  <span style="font-size: 9px; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 4px;">
                    Caution Window
                  </span>
                `}
              </div>
              <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Inauspicious</span>
            </div>
            <p style="font-size: 10.5px; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.35;">
              Avoid signing contracts, starting new journeys, or financial closings.
            </p>
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Renders a compact single-line sky summary for the Home screen forecast pill
 */
export function renderTodaySkyHomeLine(forecast) {
  if (!forecast) return '';

  const nakshatraName = forecast.nakshatra?.name;
  const rahuKalam = forecast.rahuKalam;
  const isActive = Boolean(forecast.rahuKalamActive);

  if (!nakshatraName && !rahuKalam) return '';

  return `
    <div class="home-sky-line" style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(228, 194, 118, 0.15); color: #cbd5e1; flex-wrap: wrap;">
      ${nakshatraName ? `
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="color: #38bdf8;">☽</span>
          <span>${nakshatraName}</span>
        </span>
      ` : ''}

      ${nakshatraName && rahuKalam ? `<span style="color: rgba(228, 194, 118, 0.4);">•</span>` : ''}

      ${rahuKalam ? `
        <span style="display: inline-flex; align-items: center; gap: 4px; ${isActive ? 'color: #f87171; font-weight: 700;' : ''}">
          <span style="color: ${isActive ? '#ef4444' : '#94a3b8'};">☊</span>
          <span>Rahu Kalam ≈ ${rahuKalam}</span>
          ${isActive ? `<span style="font-size: 8.5px; background: #dc2626; color: #fff; padding: 1px 5px; border-radius: 9999px; font-weight: 800;">ACTIVE NOW</span>` : ''}
        </span>
      ` : ''}
    </div>
  `;
}
