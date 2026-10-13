/**
 * PersonalForecastInputModal Component — Celestial & Palm Context Verification
 * Gathers DOB, TOB (with "Don't know" option), Place of Birth, and Dominant Hand.
 * Prefills existing data and allows effortless editing before generating the forecast.
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { dailyForecastService, VEDIC_RASHIS } from '../services/DailyForecastService.js';
import { i18n } from '../services/i18n.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';
import { GeoLocationService } from '../services/GeoLocationService.js';
import { renderClockTimePickerModal, attachClockTimePickerListeners } from './ClockTimePicker.js';

export function renderPersonalForecastInputModal({
  onClose = () => router.closeModal(),
  onSubmit = () => {}
} = {}) {
  const currentLang = i18n.getLanguage();
  
  // Read prefilled data from localStorage
  const savedDob = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_dob')) || '1998-05-15';
  const savedTob = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_tob')) || '12:00';
  const savedTobUnknown = typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_tob_unknown') === 'true';
  const savedPob = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_user_pob')) || 'Chennai, India';
  const savedDominant = (typeof window !== 'undefined' && window.localStorage?.getItem('kai_dominant_hand')) || 'RIGHT';

  return `
    <div id="forecast-input-backdrop" class="kai-modal-backdrop open" style="display: flex; align-items: flex-end; justify-content: center; z-index: 9999;">
      <div class="kai-modal-sheet" style="max-height: 92vh; overflow-y: auto; padding: 22px 20px 32px; background: radial-gradient(circle at top, rgba(251, 191, 36, 0.14) 0%, rgba(14, 12, 20, 0.98) 100%), #0e0c14; border-top: 1.5px solid rgba(251, 191, 36, 0.45); box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.85), 0 0 28px rgba(251, 191, 36, 0.22); border-radius: 24px 24px 0 0; width: 100%; max-width: 480px;">
        
        <!-- Sheet Handlebar -->
        <div style="width: 40px; height: 4px; border-radius: 9999px; background: rgba(251, 191, 36, 0.45); margin: 0 auto 16px;"></div>

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
          <div>
            <div class="kai-badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); font-size: 10px; margin-bottom: 4px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
              <span>✦</span>
              <span>VEDIC COORDINATES</span>
            </div>
            <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #ffffff; margin: 2px 0 0 0; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);">
              Personalize Your Forecast
            </h2>
            <p style="font-size: 11px; color: #cbd5e1; margin: 4px 0 0 0; line-height: 1.35;">
              Confirm your birth coordinates and dominant palm to generate your exact transit alignment.
            </p>
          </div>

          <button id="forecast-input-close-btn" class="kai-btn-icon" aria-label="Close" style="background: rgba(255, 255, 255, 0.08); border-radius: 9999px; width: 34px; height: 34px; border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
          </button>
        </div>

        <form id="forecast-context-form" style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Date of Birth (DOB) -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 14px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <label for="input-dob" style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.06em; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">calendar_today</span>
                <span>Date of Birth</span>
              </label>
              <span style="font-size: 10px; color: #94a3b8;">Prefilled</span>
            </div>
            <input 
              type="date" 
              id="input-dob" 
              name="dob" 
              value="${savedDob}" 
              style="width: 100%; background: rgba(10, 8, 14, 0.8); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 10px; padding: 10px 12px; color: #ffffff; font-size: 14px; font-weight: 600; outline: none; box-sizing: border-box;"
              required
            />
          </div>

          <!-- Time of Birth (TOB) with "Don't know" toggle -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 14px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <label for="input-tob" style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.06em; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">schedule</span>
                <span>Time of Birth</span>
              </label>
              <span id="tob-status-tag" style="font-size: 10px; color: ${savedTobUnknown ? '#f59e0b' : '#94a3b8'};">
                ${savedTobUnknown ? 'Solar Noon' : 'Exact Time'}
              </span>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <input 
                type="time" 
                id="input-tob" 
                name="tob" 
                value="${savedTob}" 
                style="flex: 1; background: rgba(10, 8, 14, 0.8); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 10px; padding: 10px 12px; color: #ffffff; font-size: 14px; font-weight: 600; outline: none; box-sizing: border-box; opacity: ${savedTobUnknown ? '0.4' : '1'}; cursor: pointer;"
                ${savedTobUnknown ? 'disabled' : ''}
              />
              <button type="button" id="modal-open-clock-btn" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; border-radius: 10px; padding: 10px 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; white-space: nowrap; opacity: ${savedTobUnknown ? '0.4' : '1'};" ${savedTobUnknown ? 'disabled' : ''}>
                <span class="material-symbols-outlined" style="font-size: 17px;">schedule</span>
                <span>Clock Face</span>
              </button>
            </div>

            <!-- Don't Know Checkbox -->
            <label style="display: flex; align-items: center; gap: 8px; margin-top: 8px; cursor: pointer; user-select: none;">
              <input type="checkbox" id="check-tob-unknown" ${savedTobUnknown ? 'checked' : ''} style="accent-color: #fbbf24; width: 16px; height: 16px; cursor: pointer;" />
              <span style="font-size: 11.5px; color: #e2e8f0;">I don't know my exact time (Use Solar Noon calculation)</span>
            </label>
          </div>

          <!-- Place of Birth (POB) -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 14px; padding: 12px 14px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <label for="input-pob" style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.06em; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">location_on</span>
                <span>Place of Birth</span>
              </label>
              <button type="button" id="modal-use-location-btn" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; border-radius: 9999px; padding: 2px 8px; font-size: 9.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 12px;">my_location</span>
                <span id="modal-location-btn-text">Use My Location</span>
              </button>
            </div>
            <div style="position: relative;">
              <input 
                type="text" 
                id="input-pob" 
                name="pob" 
                autocomplete="off"
                value="${savedPob}" 
                placeholder="Type city (e.g. Madurai, Mumbai, London)..." 
                style="width: 100%; background: rgba(10, 8, 14, 0.8); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 10px; padding: 10px 12px; color: #ffffff; font-size: 13.5px; font-weight: 600; outline: none; box-sizing: border-box;"
                required
              />
              <!-- Floating Keystroke Autocomplete Popup List -->
              <div id="modal-pob-popup" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #14101e; border: 1.5px solid rgba(251, 191, 36, 0.5); border-radius: 12px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 16px rgba(251, 191, 36, 0.2);"></div>
            </div>
          </div>

          <!-- Dominant Hand Selection -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 14px; padding: 12px 14px;">
            <label style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 0.06em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">back_hand</span>
              <span>Dominant Hand</span>
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div 
                id="hand-opt-right" 
                class="hand-select-card ${savedDominant === 'RIGHT' ? 'active' : ''}" 
                data-hand="RIGHT"
                style="border-radius: 12px; padding: 10px 12px; cursor: pointer; text-align: center; border: 1.5px solid ${savedDominant === 'RIGHT' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${savedDominant === 'RIGHT' ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.03)'}; box-shadow: ${savedDominant === 'RIGHT' ? '0 0 14px rgba(251,191,36,0.3)' : 'none'}; transition: all 0.2s ease;">
                <span style="font-size: 22px;">✋</span>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-top: 2px;">Right Hand</div>
                <div style="font-size: 9.5px; color: #fbbf24;">Active Karma</div>
              </div>

              <div 
                id="hand-opt-left" 
                class="hand-select-card ${savedDominant === 'LEFT' ? 'active' : ''}" 
                data-hand="LEFT"
                style="border-radius: 12px; padding: 10px 12px; cursor: pointer; text-align: center; border: 1.5px solid ${savedDominant === 'LEFT' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${savedDominant === 'LEFT' ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.03)'}; box-shadow: ${savedDominant === 'LEFT' ? '0 0 14px rgba(251,191,36,0.3)' : 'none'}; transition: all 0.2s ease;">
                <span style="font-size: 22px;">🤚</span>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-top: 2px;">Left Hand</div>
                <div style="font-size: 9.5px; color: #fbbf24;">Innate Blueprint</div>
              </div>
            </div>
            <input type="hidden" id="input-dominant-hand" name="dominantHand" value="${savedDominant}" />
          </div>

          <!-- Submit CTA -->
          <button 
            type="submit" 
            id="forecast-submit-btn" 
            class="kai-btn kai-btn-gold" 
            style="width: 100%; padding: 14px; font-size: 14px; font-weight: 700; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.35); cursor: pointer; margin-top: 6px;">
            <span>CALCULATE MY PERSONAL FORECAST</span>
            <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
          </button>
        </form>

        <!-- Dedicated Clock Picker Slot -->
        <div id="forecast-clock-modal-slot"></div>

      </div>
    </div>
  `;
}

export function attachPersonalForecastInputListeners(container, { onClose, onSubmit }) {
  const closeBtn = container.querySelector('#forecast-input-close-btn');
  const backdrop = container.querySelector('#forecast-input-backdrop');
  const form = container.querySelector('#forecast-context-form');
  const tobInput = container.querySelector('#input-tob');
  const tobUnknownCheck = container.querySelector('#check-tob-unknown');
  const tobStatusTag = container.querySelector('#tob-status-tag');
  const openClockBtn = container.querySelector('#modal-open-clock-btn');
  const clockSlot = container.querySelector('#forecast-clock-modal-slot');
  const pobInput = container.querySelector('#input-pob');
  const pobPopup = container.querySelector('#modal-pob-popup');
  const useLocationBtn = container.querySelector('#modal-use-location-btn');
  const locationBtnText = container.querySelector('#modal-location-btn-text');
  const dominantHandInput = container.querySelector('#input-dominant-hand');
  const handRight = container.querySelector('#hand-opt-right');
  const handLeft = container.querySelector('#hand-opt-left');

  let selectedModalCoords = null;

  const closeHandler = () => {
    if (onClose) onClose();
    else router.closeModal();
  };

  closeBtn?.addEventListener('click', closeHandler);
  backdrop?.addEventListener('click', (e) => {
    if (e.target.id === 'forecast-input-backdrop') closeHandler();
  });

  // Toggle "Don't know birth time"
  tobUnknownCheck?.addEventListener('change', (e) => {
    const isUnknown = e.target.checked;
    if (tobInput) {
      tobInput.disabled = isUnknown;
      tobInput.style.opacity = isUnknown ? '0.4' : '1';
    }
    if (openClockBtn) {
      openClockBtn.disabled = isUnknown;
      openClockBtn.style.opacity = isUnknown ? '0.4' : '1';
    }
    if (tobStatusTag) {
      tobStatusTag.textContent = isUnknown ? 'Solar Noon' : 'Exact Time';
      tobStatusTag.style.color = isUnknown ? '#f59e0b' : '#94a3b8';
    }
  });

  // Interactive Clock Picker
  function openClockModal() {
    if (tobUnknownCheck?.checked || !clockSlot) return;
    const currentVal = tobInput?.value || '12:00';
    clockSlot.innerHTML = renderClockTimePickerModal({
      initialTime: currentVal,
      onConfirm: (selectedTime) => {
        if (tobInput) tobInput.value = selectedTime;
        clockSlot.innerHTML = '';
      },
      onClose: () => {
        clockSlot.innerHTML = '';
      }
    });
    attachClockTimePickerListeners(clockSlot, {
      initialTime: currentVal,
      onConfirm: (selectedTime) => {
        if (tobInput) tobInput.value = selectedTime;
        clockSlot.innerHTML = '';
      },
      onClose: () => {
        clockSlot.innerHTML = '';
      }
    });
  }

  openClockBtn?.addEventListener('click', openClockModal);
  tobInput?.addEventListener('click', () => {
    if (!tobUnknownCheck?.checked) openClockModal();
  });

  // City Autocomplete Keystroke Popup
  function renderCitySuggestions(query) {
    if (!pobPopup) return;
    const matches = GeoLocationService.searchCities(query, 7);
    if (!matches || matches.length === 0) {
      pobPopup.style.display = 'none';
      return;
    }

    pobPopup.innerHTML = matches.map(c => `
      <div class="city-popup-item" data-name="${c.name}" data-lat="${c.lat}" data-lon="${c.lon}" data-tz="${c.tz}" style="padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff;">${c.short}</div>
          <div style="font-size: 10.5px; color: #94a3b8;">${c.name}</div>
        </div>
        <span style="font-size: 9px; background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 4px; padding: 2px 6px;">
          ${c.lat.toFixed(1)}°N, ${c.lon.toFixed(1)}°E
        </span>
      </div>
    `).join('');

    pobPopup.style.display = 'block';

    pobPopup.querySelectorAll('.city-popup-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(251, 191, 36, 0.15)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = item.dataset.name;
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        const tz = item.dataset.tz;

        if (pobInput) pobInput.value = name;
        selectedModalCoords = { lat, lon, tz };
        pobPopup.style.display = 'none';
      });
    });
  }

  pobInput?.addEventListener('input', (e) => {
    renderCitySuggestions(e.target.value);
  });

  pobInput?.addEventListener('focus', () => {
    if (pobInput && pobInput.value) {
      renderCitySuggestions(pobInput.value);
    }
  });

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', (e) => {
      if (pobPopup && pobInput && e.target !== pobInput && !pobPopup.contains(e.target)) {
        pobPopup.style.display = 'none';
      }
    });
  }

  // Device GPS Location Service
  useLocationBtn?.addEventListener('click', async () => {
    if (locationBtnText) locationBtnText.textContent = 'Locating GPS...';
    try {
      const res = await GeoLocationService.requestDeviceLocation();
      if (pobInput) pobInput.value = res.city.name;
      selectedModalCoords = { lat: res.exactLat, lon: res.exactLon, tz: res.city.tz };
      if (locationBtnText) locationBtnText.textContent = `📍 ${res.city.short}`;
      if (pobPopup) pobPopup.style.display = 'none';
    } catch (err) {
      if (locationBtnText) locationBtnText.textContent = 'GPS Unavailable';
      setTimeout(() => {
        if (locationBtnText) locationBtnText.textContent = 'Use My Location';
      }, 3000);
      console.warn('Geolocation failed:', err.message);
    }
  });

  // Dominant hand selector
  const selectHand = (hand) => {
    if (dominantHandInput) dominantHandInput.value = hand;
    if (hand === 'RIGHT') {
      handRight?.classList.add('active');
      handLeft?.classList.remove('active');
      if (handRight) {
        handRight.style.borderColor = '#fbbf24';
        handRight.style.background = 'rgba(251,191,36,0.18)';
        handRight.style.boxShadow = '0 0 14px rgba(251,191,36,0.3)';
      }
      if (handLeft) {
        handLeft.style.borderColor = 'rgba(255,255,255,0.1)';
        handLeft.style.background = 'rgba(255,255,255,0.03)';
        handLeft.style.boxShadow = 'none';
      }
    } else {
      handLeft?.classList.add('active');
      handRight?.classList.remove('active');
      if (handLeft) {
        handLeft.style.borderColor = '#fbbf24';
        handLeft.style.background = 'rgba(251,191,36,0.18)';
        handLeft.style.boxShadow = '0 0 14px rgba(251,191,36,0.3)';
      }
      if (handRight) {
        handRight.style.borderColor = 'rgba(255,255,255,0.1)';
        handRight.style.background = 'rgba(255,255,255,0.03)';
        handRight.style.boxShadow = 'none';
      }
    }
  };

  handRight?.addEventListener('click', () => selectHand('RIGHT'));
  handLeft?.addEventListener('click', () => selectHand('LEFT'));

  // Form submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const dob = container.querySelector('#input-dob')?.value || '1998-05-15';
    const isUnknown = container.querySelector('#check-tob-unknown')?.checked || false;
    const tob = isUnknown ? '12:00' : (container.querySelector('#input-tob')?.value || '12:00');
    const pob = container.querySelector('#input-pob')?.value || 'Chennai, India';
    const hand = dominantHandInput?.value || 'RIGHT';

    // Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('kai_user_dob', dob);
      window.localStorage.setItem('kai_user_tob', tob);
      window.localStorage.setItem('kai_user_tob_unknown', String(isUnknown));
      window.localStorage.setItem('kai_user_pob', pob);
      window.localStorage.setItem('kai_dominant_hand', hand);

      if (selectedModalCoords) {
        window.localStorage.setItem('kai_user_lat', String(selectedModalCoords.lat));
        window.localStorage.setItem('kai_user_lon', String(selectedModalCoords.lon));
        window.localStorage.setItem('kai_user_tz', selectedModalCoords.tz);
      } else {
        const matches = GeoLocationService.searchCities(pob, 1);
        if (matches && matches.length > 0) {
          const c = matches[0];
          window.localStorage.setItem('kai_user_lat', String(c.lat));
          window.localStorage.setItem('kai_user_lon', String(c.lon));
          window.localStorage.setItem('kai_user_tz', c.tz);
        } else {
          window.localStorage.setItem('kai_user_lat', '13.0827');
          window.localStorage.setItem('kai_user_lon', '80.2707');
          window.localStorage.setItem('kai_user_tz', 'Asia/Kolkata');
        }
      }

      // Janma Rashi = Vedic Moon sign, worked out from the birth details just saved
      // (the old calendar-date lookup gave the Sun sign, which is a different thing)
      window.localStorage.setItem('kai_user_rashi', dailyForecastService.resolveUserRashi().key);
    }

    reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'personal_forecast_configured', hand });

    if (onSubmit) {
      onSubmit({ dob, tob, isUnknown, pob, hand });
    } else {
      router.closeModal();
      router.navigate(ROUTES.FORECAST);
    }
  });
}
