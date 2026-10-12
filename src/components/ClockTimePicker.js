/**
 * ClockTimePicker Component — Sacred Aesthetic Radial Clock Face
 * 
 * Features:
 * - Interactive circular clock dial for hours (1-12) and exact minutes (0-59)
 * - Mouse & Touch dragging on the clock hand and dial surface
 * - Exact minute precision (e.g. 09:12, 09:13, 09:47) with 60-minute dial ticks
 * - Interactive -1m / +1m fine-tune steppers and direct numeric input
 * - Glowing celestial pointer hand with dynamic badge
 * - AM / PM toggle pill
 * - Quick "Solar Noon (12:00 PM)" shortcut
 * - Complete window listener cleanup on close/confirm
 */

export function renderClockTimePickerModal({
  initialTime = '12:00',
  onConfirm = () => {},
  onClose = () => {}
} = {}) {
  let [initialH, initialM] = (initialTime || '12:00').split(':').map(Number);
  initialH = isNaN(initialH) ? 12 : initialH;
  initialM = isNaN(initialM) ? 0 : initialM;

  let isPM = initialH >= 12;
  let displayHour = initialH % 12;
  if (displayHour === 0) displayHour = 12;
  let displayMinute = initialM;

  return `
    <div id="clock-picker-backdrop" class="kai-modal-backdrop open" style="display: flex; align-items: center; justify-content: center; z-index: 10001; background: rgba(8, 6, 14, 0.85); backdrop-filter: blur(8px);">
      <div id="clock-picker-modal" class="clock-picker-card" style="width: 330px; max-width: 92vw; background: radial-gradient(circle at top, rgba(251, 191, 36, 0.16) 0%, rgba(18, 14, 26, 0.98) 100%), #120e1a; border: 1.5px solid rgba(251, 191, 36, 0.45); border-radius: 24px; padding: 18px 20px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.9), 0 0 28px rgba(251, 191, 36, 0.2); animation: scaleUp 0.25s ease;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-outlined" style="font-size: 18px; color: #fbbf24;">schedule</span>
            <span style="font-size: 11px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.08em;">EXACT BIRTH TIME</span>
          </div>
          <button id="clock-close-btn" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; border-radius: 9999px; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Close">
            <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
          </button>
        </div>

        <!-- Big Digital Display Bar with AM/PM -->
        <div style="background: rgba(10, 8, 14, 0.7); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 2px;">
            <button id="clock-mode-hour-btn" type="button" style="background: none; border: none; font-size: 32px; font-weight: 800; color: #fbbf24; cursor: pointer; padding: 2px 6px; border-radius: 8px; text-shadow: 0 0 12px rgba(251, 191, 36, 0.5); font-family: var(--font-display, monospace);" title="Select Hour">
              <span id="clock-disp-hour">${String(displayHour).padStart(2, '0')}</span>
            </button>
            <span style="font-size: 26px; color: rgba(251, 191, 36, 0.6); font-weight: 700;">:</span>
            <button id="clock-mode-minute-btn" type="button" style="background: none; border: none; font-size: 32px; font-weight: 800; color: #94a3b8; cursor: pointer; padding: 2px 6px; border-radius: 8px; font-family: var(--font-display, monospace);" title="Select Minute">
              <span id="clock-disp-minute">${String(displayMinute).padStart(2, '0')}</span>
            </button>
          </div>

          <!-- AM/PM Toggle Buttons -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button id="clock-am-btn" type="button" style="border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; background: ${!isPM ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)'}; color: ${!isPM ? '#100e14' : '#cbd5e1'};">
              AM
            </button>
            <button id="clock-pm-btn" type="button" style="border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; background: ${isPM ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)'}; color: ${isPM ? '#100e14' : '#cbd5e1'};">
              PM
            </button>
          </div>
        </div>

        <!-- Precise Minute Stepper Pill -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 12px; padding: 4px 8px; margin-bottom: 10px;">
          <div style="display: flex; gap: 4px;">
            <button id="clock-min-minus-5" type="button" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(251,191,36,0.3); color: #fbbf24; border-radius: 6px; padding: 3px 6px; font-size: 10px; font-weight: 700; cursor: pointer;" title="Minus 5 minutes">-5m</button>
            <button id="clock-min-minus-1" type="button" style="background: rgba(255,255,255,0.09); border: 1px solid rgba(251,191,36,0.4); color: #fbbf24; border-radius: 6px; padding: 3px 7px; font-size: 11px; font-weight: 800; cursor: pointer;" title="Minus 1 minute">-1m</button>
          </div>
          <span id="clock-mode-hint" style="font-size: 10.5px; color: #e4c276; font-weight: 600; text-align: center;">Drag hand or fine-tune minute</span>
          <div style="display: flex; gap: 4px;">
            <button id="clock-min-plus-1" type="button" style="background: rgba(255,255,255,0.09); border: 1px solid rgba(251,191,36,0.4); color: #fbbf24; border-radius: 6px; padding: 3px 7px; font-size: 11px; font-weight: 800; cursor: pointer;" title="Plus 1 minute">+1m</button>
            <button id="clock-min-plus-5" type="button" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(251,191,36,0.3); color: #fbbf24; border-radius: 6px; padding: 3px 6px; font-size: 10px; font-weight: 700; cursor: pointer;" title="Plus 5 minutes">+5m</button>
          </div>
        </div>

        <!-- Radial Clock Dial Container with Dragging Enabled -->
        <div id="clock-dial-container" style="width: 240px; height: 240px; margin: 0 auto 12px; position: relative; background: radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, rgba(14, 10, 20, 0.98) 70%), #0e0a14; border: 2px solid rgba(251, 191, 36, 0.4); border-radius: 50%; box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8), 0 0 16px rgba(251, 191, 36, 0.15); cursor: grab; user-select: none; touch-action: none;">
          
          <!-- Minute Ticks SVG Layer (60 discrete minute marks) -->
          <svg id="clock-ticks-svg" viewBox="0 0 240 240" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;">
            ${generateClockTicksSvg()}
          </svg>

          <!-- Center Pin -->
          <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #fbbf24; top: 114px; left: 114px; z-index: 10; box-shadow: 0 0 8px #fbbf24; pointer-events: none;"></div>
          
          <!-- Dynamic Clock Hand with Floating Tip Value Badge -->
          <div id="clock-pointer-hand" style="position: absolute; width: 2px; height: 82px; background: #fbbf24; top: 38px; left: 119px; transform-origin: bottom center; z-index: 5; pointer-events: none; transition: transform 0.06s ease-out; box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);">
            <!-- Pointer Head Circle with Number -->
            <div id="clock-pointer-badge" style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(251, 191, 36, 0.35); border: 2px solid #fbbf24; top: -16px; left: -15px; box-shadow: 0 0 10px #fbbf24; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #ffffff;">
              <span id="clock-pointer-badge-val">${String(displayHour)}</span>
            </div>
          </div>

          <!-- Numbers Layer (Interactive Numerals) -->
          <div id="clock-numbers-layer" style="position: absolute; inset: 0; z-index: 8;"></div>
        </div>

        <!-- Footer Shortcuts & Confirm Button -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button id="clock-solar-noon-btn" type="button" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(251, 191, 36, 0.25); color: #fef08a; border-radius: 10px; padding: 7px 10px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
            <span class="material-symbols-outlined" style="font-size: 15px;">wb_sunny</span>
            <span>Use Solar Noon (12:00 PM)</span>
          </button>

          <button id="clock-confirm-btn" type="button" class="kai-btn kai-btn-gold" style="width: 100%; justify-content: center; padding: 11px 14px; font-size: 13px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 16px rgba(251, 191, 36, 0.35);">
            <span>CONFIRM TIME (<span id="clock-confirm-preview">${String(initialH).padStart(2, '0')}:${String(initialM).padStart(2, '0')}</span>)</span>
          </button>
        </div>

      </div>
    </div>
  `;
}

function generateClockTicksSvg() {
  const center = 120;
  const outerR = 114;
  let lines = '';

  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? 105 : 109;
    const rad = ((i * 6) - 90) * (Math.PI / 180);
    const x1 = center + innerR * Math.cos(rad);
    const y1 = center + innerR * Math.sin(rad);
    const x2 = center + outerR * Math.cos(rad);
    const y2 = center + outerR * Math.sin(rad);
    const stroke = isMajor ? 'rgba(251, 191, 36, 0.7)' : 'rgba(251, 191, 36, 0.25)';
    const strokeWidth = isMajor ? '1.8' : '1.0';

    lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
  }
  return lines;
}

export function attachClockTimePickerListeners(container, {
  initialTime = '12:00',
  onConfirm = () => {},
  onClose = () => {}
} = {}) {
  let [h, m] = (initialTime || '12:00').split(':').map(Number);
  h = isNaN(h) ? 12 : h;
  m = isNaN(m) ? 0 : m;

  let isPM = h >= 12;
  let activeHour = h % 12;
  if (activeHour === 0) activeHour = 12;
  let activeMinute = m;
  let currentMode = 'HOUR'; // 'HOUR' or 'MINUTE'
  let isDragging = false;

  const dialContainer = container.querySelector('#clock-dial-container');
  const numbersLayer = container.querySelector('#clock-numbers-layer');
  const pointerHand = container.querySelector('#clock-pointer-hand');
  const pointerBadgeVal = container.querySelector('#clock-pointer-badge-val');
  const dispHour = container.querySelector('#clock-disp-hour');
  const dispMinute = container.querySelector('#clock-disp-minute');
  const hourBtn = container.querySelector('#clock-mode-hour-btn');
  const minuteBtn = container.querySelector('#clock-mode-minute-btn');
  const amBtn = container.querySelector('#clock-am-btn');
  const pmBtn = container.querySelector('#clock-pm-btn');
  const modeHint = container.querySelector('#clock-mode-hint');
  const confirmPreview = container.querySelector('#clock-confirm-preview');

  function get24HourTime() {
    let hour24 = activeHour % 12;
    if (isPM) hour24 += 12;
    return `${String(hour24).padStart(2, '0')}:${String(activeMinute).padStart(2, '0')}`;
  }

  function updateDisplay() {
    if (dispHour) dispHour.textContent = String(activeHour).padStart(2, '0');
    if (dispMinute) dispMinute.textContent = String(activeMinute).padStart(2, '0');
    if (confirmPreview) confirmPreview.textContent = get24HourTime();

    if (hourBtn) {
      hourBtn.style.color = currentMode === 'HOUR' ? '#fbbf24' : '#94a3b8';
      hourBtn.style.textShadow = currentMode === 'HOUR' ? '0 0 12px rgba(251, 191, 36, 0.5)' : 'none';
    }
    if (minuteBtn) {
      minuteBtn.style.color = currentMode === 'MINUTE' ? '#fbbf24' : '#94a3b8';
      minuteBtn.style.textShadow = currentMode === 'MINUTE' ? '0 0 12px rgba(251, 191, 36, 0.5)' : 'none';
    }

    if (modeHint) {
      modeHint.textContent = currentMode === 'HOUR' 
        ? 'Select Hour (Drag hand around dial)' 
        : 'Select Exact Minute (Drag hand or use steppers)';
    }

    if (amBtn && pmBtn) {
      amBtn.style.background = !isPM ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)';
      amBtn.style.color = !isPM ? '#100e14' : '#cbd5e1';
      pmBtn.style.background = isPM ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)';
      pmBtn.style.color = isPM ? '#100e14' : '#cbd5e1';
    }

    // Update hand angle & tip value badge
    const angle = currentMode === 'HOUR' ? (activeHour % 12) * 30 : activeMinute * 6;
    if (pointerHand) {
      pointerHand.style.transform = `rotate(${angle}deg)`;
    }
    if (pointerBadgeVal) {
      pointerBadgeVal.textContent = currentMode === 'HOUR' ? String(activeHour) : String(activeMinute).padStart(2, '0');
      // Keep number upright inside badge
      pointerBadgeVal.style.transform = `rotate(-${angle}deg)`;
      pointerBadgeVal.style.display = 'inline-block';
    }
  }

  function renderDialNumbers() {
    if (!numbersLayer) return;
    numbersLayer.innerHTML = '';

    const doc = (numbersLayer && numbersLayer.ownerDocument) || (typeof document !== 'undefined' ? document : null);
    if (!doc || typeof doc.createElement !== 'function') return;

    const radius = 90;
    const center = 120;

    if (currentMode === 'HOUR') {
      const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      hours.forEach((val, i) => {
        const rad = ((i * 30) - 90) * (Math.PI / 180);
        const x = center + radius * Math.cos(rad);
        const y = center + radius * Math.sin(rad);

        const isSelected = activeHour === val;
        const btn = doc.createElement('button');
        btn.textContent = String(val);
        btn.type = 'button';
        btn.style.cssText = `
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: ${isSelected ? '#fbbf24' : 'transparent'};
          color: ${isSelected ? '#100e14' : '#ffffff'};
          font-weight: ${isSelected ? '800' : '600'};
          font-size: 13px;
          left: ${x - 16}px;
          top: ${y - 16}px;
          cursor: pointer;
          transition: all 0.12s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          activeHour = val;
          updateDisplay();
          // After picking hour, smoothly transition to minute selection
          setTimeout(() => {
            currentMode = 'MINUTE';
            renderDialNumbers();
            updateDisplay();
          }, 200);
        });

        numbersLayer.appendChild(btn);
      });
    } else {
      // MINUTE mode (Major numbers: intervals of 5)
      const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
      minutes.forEach((val, i) => {
        const rad = ((i * 30) - 90) * (Math.PI / 180);
        const x = center + radius * Math.cos(rad);
        const y = center + radius * Math.sin(rad);

        const isExactMatch = activeMinute === val;
        const isNear = Math.abs(activeMinute - val) <= 2;
        const btn = doc.createElement('button');
        btn.textContent = String(val).padStart(2, '0');
        btn.type = 'button';
        btn.style.cssText = `
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: ${isExactMatch ? '#fbbf24' : (isNear ? 'rgba(251,191,36,0.2)' : 'transparent')};
          color: ${isExactMatch ? '#100e14' : '#ffffff'};
          font-weight: ${isExactMatch ? '800' : '600'};
          font-size: 12px;
          left: ${x - 16}px;
          top: ${y - 16}px;
          cursor: pointer;
          transition: all 0.12s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          activeMinute = val;
          updateDisplay();
          renderDialNumbers();
        });

        numbersLayer.appendChild(btn);
      });
    }
  }

  // --- Dynamic Mouse & Touch Dragging Engine ---
  function computeAngleFromPointer(clientX, clientY) {
    if (!dialContainer || typeof dialContainer.getBoundingClientRect !== 'function') return null;
    const rect = dialContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
    if (angle < 0) angle += 360;
    return angle;
  }

  function handlePointerMoveOrDown(clientX, clientY) {
    const angle = computeAngleFromPointer(clientX, clientY);
    if (angle === null) return;

    if (currentMode === 'HOUR') {
      let selectedHour = Math.round(angle / 30);
      if (selectedHour === 0) selectedHour = 12;
      activeHour = selectedHour;
    } else {
      // 60 minutes: exact 1-minute precision (e.g. 09:12, 09:13, etc.)
      let selectedMinute = Math.round(angle / 6) % 60;
      activeMinute = selectedMinute;
    }

    updateDisplay();
  }

  function onPointerDown(e) {
    isDragging = true;
    if (dialContainer) dialContainer.style.cursor = 'grabbing';
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX !== undefined && clientY !== undefined) {
      handlePointerMoveOrDown(clientX, clientY);
    }
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX !== undefined && clientY !== undefined) {
      handlePointerMoveOrDown(clientX, clientY);
    }
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    if (dialContainer) dialContainer.style.cursor = 'grab';
    renderDialNumbers();

    if (currentMode === 'HOUR') {
      // Smoothly advance to minute mode after releasing the hour
      setTimeout(() => {
        currentMode = 'MINUTE';
        renderDialNumbers();
        updateDisplay();
      }, 220);
    }
  }

  // Bind dial dragging
  dialContainer?.addEventListener('mousedown', onPointerDown);
  dialContainer?.addEventListener('touchstart', onPointerDown, { passive: true });

  const win = (typeof window !== 'undefined') ? window : null;
  if (win) {
    win.addEventListener('mousemove', onPointerMove);
    win.addEventListener('touchmove', onPointerMove, { passive: true });
    win.addEventListener('mouseup', onPointerUp);
    win.addEventListener('touchend', onPointerUp);
  }

  function cleanup() {
    if (win) {
      win.removeEventListener('mousemove', onPointerMove);
      win.removeEventListener('touchmove', onPointerMove);
      win.removeEventListener('mouseup', onPointerUp);
      win.removeEventListener('touchend', onPointerUp);
    }
  }

  // --- Exact Minute Stepper Listeners (-1m, +1m, -5m, +5m) ---
  container.querySelector('#clock-min-minus-1')?.addEventListener('click', () => {
    currentMode = 'MINUTE';
    activeMinute = (activeMinute - 1 + 60) % 60;
    updateDisplay();
    renderDialNumbers();
  });

  container.querySelector('#clock-min-plus-1')?.addEventListener('click', () => {
    currentMode = 'MINUTE';
    activeMinute = (activeMinute + 1) % 60;
    updateDisplay();
    renderDialNumbers();
  });

  container.querySelector('#clock-min-minus-5')?.addEventListener('click', () => {
    currentMode = 'MINUTE';
    activeMinute = (activeMinute - 5 + 60) % 60;
    updateDisplay();
    renderDialNumbers();
  });

  container.querySelector('#clock-min-plus-5')?.addEventListener('click', () => {
    currentMode = 'MINUTE';
    activeMinute = (activeMinute + 5) % 60;
    updateDisplay();
    renderDialNumbers();
  });

  // Switch modes on header click
  hourBtn?.addEventListener('click', () => {
    currentMode = 'HOUR';
    renderDialNumbers();
    updateDisplay();
  });

  minuteBtn?.addEventListener('click', () => {
    currentMode = 'MINUTE';
    renderDialNumbers();
    updateDisplay();
  });

  amBtn?.addEventListener('click', () => {
    isPM = false;
    updateDisplay();
  });

  pmBtn?.addEventListener('click', () => {
    isPM = true;
    updateDisplay();
  });

  // Solar noon shortcut
  container.querySelector('#clock-solar-noon-btn')?.addEventListener('click', () => {
    activeHour = 12;
    activeMinute = 0;
    isPM = true;
    currentMode = 'HOUR';
    renderDialNumbers();
    updateDisplay();
  });

  // Confirm
  container.querySelector('#clock-confirm-btn')?.addEventListener('click', () => {
    cleanup();
    const final24 = get24HourTime();
    onConfirm(final24);
  });

  // Close
  container.querySelector('#clock-close-btn')?.addEventListener('click', () => {
    cleanup();
    onClose();
  });

  container.querySelector('#clock-picker-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'clock-picker-backdrop') {
      cleanup();
      onClose();
    }
  });

  // Initial draw
  renderDialNumbers();
  updateDisplay();
}
