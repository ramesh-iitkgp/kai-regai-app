/**
 * SplashScreen Component — Cold-Boot Genesis & Onboarding Experience
 * Matches Stitch: design/stitch/kai_regai_splash_onboarding/
 * Source of truth: docs/p2/USER_JOURNEYS.md (JRN-01)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';

export function renderSplashScreen(container) {
  let step = 0; // 0: Genesis / Value Prop, 1: Modes Overview, 2: Camera Permission Primer

  const stepsData = [
    {
      badge: 'Vedic Biometric Reading',
      headline: 'Ancient Indian Wisdom <span style="color: var(--color-secondary); font-style: italic;">×</span> Modern AI',
      desc: 'Discover the life patterns and narrative geometry encoded within your natural palm creases.',
      btnLabel: 'Begin Your Reading'
    },
    {
      badge: 'Two Pathways of Insight',
      headline: 'Hand Scanner & Deep Guided Chiromancy',
      desc: 'Choose between an instant 10-second optical scan or an in-depth traditional consultation.',
      btnLabel: 'Continue'
    },
    {
      badge: 'Camera & Biometric Privacy',
      headline: 'Private & Secure On-Device Analysis',
      desc: 'Camera frames are processed in temporary RAM to extract geometry. No raw palm photographs are ever stored without your consent.',
      btnLabel: 'Enable Camera & Enter Home'
    }
  ];

  function updateView() {
    const cur = stepsData[step];

    container.innerHTML = `
      <div style="position: relative; width: 100%; min-height: 100vh; padding: 24px 20px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; background: var(--color-background); overflow: hidden; select-none;">
        
        <!-- Atmospheric Background Glows -->
        <div style="position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 320px; height: 320px; border-radius: 9999px; background: rgba(147, 125, 255, 0.2); filter: blur(90px); pointer-events: none;"></div>
        <div style="position: absolute; bottom: -80px; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; border-radius: 9999px; background: rgba(228, 194, 118, 0.15); filter: blur(80px); pointer-events: none;"></div>

        <!-- Top Badge -->
        <div style="z-index: 10; margin-top: max(16px, env(safe-area-inset-top));">
          <span style="font-size: 11px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.2em; text-transform: uppercase;">
            ${cur.badge}
          </span>
        </div>

        <!-- Center Sacred Device Disc -->
        <div style="position: relative; width: 260px; height: 260px; border-radius: 9999px; border: 1.5px solid rgba(228, 194, 118, 0.35); box-shadow: 0 0 40px rgba(147, 125, 255, 0.25); display: flex; align-items: center; justify-content: center; background: var(--color-surface-container-lowest); overflow: hidden; z-index: 10;">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8uYs13KgVf-z6fZ6KfdEY7Fnu30zH6fRMefHojFDtoGc6sVVt9-lxfT3DHCj9t209l4Ka5_k09d47Iydq20N5xvyG90VqIeyyqGeJk84G-13r4yr5WqiJ1MS_y8BzMjBfLfuMsNZl9onKbMWpgxnUFZP-4LWMefrCZz9w3dYbUTMKYhnRVnu1QhxYR5SFB3N3GDdwKFWtT9dWPcl5Di1WJ9GSalXNCOVlA7RumRH74lPyBjs0p3aA" 
               alt="Sacred biometric palm emblem" 
               style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
          
          <div style="position: absolute; bottom: 16px; background: rgba(38, 41, 55, 0.85); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: var(--radius-full); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; gap: 6px;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: var(--color-secondary);" class="glow-pulsing"></span>
            <span style="font-size: 10px; font-weight: 700; color: var(--color-secondary); letter-spacing: 0.08em; text-transform: uppercase;">Optical Sensor Ready</span>
          </div>
        </div>

        <!-- Narrative Copy & Stepper Dots -->
        <div style="text-align: center; z-index: 10; max-width: 360px;">
          <!-- Dots -->
          <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: 16px;">
            <span style="width: ${step === 0 ? '24px' : '6px'}; height: 6px; border-radius: 9999px; background: ${step === 0 ? 'var(--color-secondary)' : 'var(--color-surface-container-highest)'}; transition: all 0.3s ease;"></span>
            <span style="width: ${step === 1 ? '24px' : '6px'}; height: 6px; border-radius: 9999px; background: ${step === 1 ? 'var(--color-secondary)' : 'var(--color-surface-container-highest)'}; transition: all 0.3s ease;"></span>
            <span style="width: ${step === 2 ? '24px' : '6px'}; height: 6px; border-radius: 9999px; background: ${step === 2 ? 'var(--color-secondary)' : 'var(--color-surface-container-highest)'}; transition: all 0.3s ease;"></span>
          </div>

          <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--color-text-high); line-height: 1.25;">
            ${cur.headline}
          </h1>
          <p style="font-size: 14px; color: var(--color-on-surface-variant); margin-top: 10px; line-height: 1.5;">
            ${cur.desc}
          </p>
        </div>

        <!-- Bottom Action CTA -->
        <div style="width: 100%; z-index: 10; margin-bottom: max(12px, env(safe-area-inset-bottom));">
          <button id="splash-next-btn" class="kai-btn kai-btn-primary" type="button">
            <span>${cur.btnLabel}</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          
          <button id="splash-skip-btn" style="width: 100%; background: transparent; border: none; color: var(--color-outline); font-size: 12px; margin-top: 12px; cursor: pointer; padding: 6px;">
            Skip directly to Home Hub
          </button>
        </div>

      </div>
    `;

    document.getElementById('splash-next-btn')?.addEventListener('click', () => {
      if (step < 2) {
        step++;
        updateView();
      } else {
        router.navigate(ROUTES.HOME);
      }
    });

    document.getElementById('splash-skip-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });
  }

  updateView();
}
