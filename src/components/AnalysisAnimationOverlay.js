/**
 * AnalysisAnimationOverlay Component — 10-Second Progressive Scan Choreography
 * Matches Stitch: design/stitch/kai_regai_scanner_analysis_animation/
 */

import { scannerTimelineSteps } from '../mock/mockScannerStates.js';
import { renderPalmLineOverlay } from './PalmLineOverlay.js';

export class ScannerAnimationController {
  constructor(container, onComplete = () => {}) {
    this.container = container;
    this.onComplete = onComplete;
    this.currentStepIdx = 0;
    this.timer = null;
    this.progressInterval = null;
    this.currentProgress = 0;
  }

  start() {
    this.render();
    const totalDuration = 10000; // 10 seconds
    const intervalTime = 100;
    const progressIncrement = (intervalTime / totalDuration) * 100;

    this.progressInterval = setInterval(() => {
      this.currentProgress = Math.min(100, this.currentProgress + progressIncrement);
      
      // Check which step corresponds to this progress
      const currentSeconds = (this.currentProgress / 100) * 10;
      if (currentSeconds < 2) this.currentStepIdx = 0;
      else if (currentSeconds < 4) this.currentStepIdx = 1;
      else if (currentSeconds < 5.5) this.currentStepIdx = 2;
      else if (currentSeconds < 7) this.currentStepIdx = 3;
      else if (currentSeconds < 8.5) this.currentStepIdx = 4;
      else this.currentStepIdx = 5;

      this.updateUI();

      if (this.currentProgress >= 100) {
        clearInterval(this.progressInterval);
        setTimeout(() => {
          this.onComplete();
        }, 500);
      }
    }, intervalTime);
  }

  stop() {
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  updateUI() {
    const step = scannerTimelineSteps[this.currentStepIdx];
    const progressBar = this.container.querySelector('#scan-progress-bar');
    const stepTitle = this.container.querySelector('#scan-step-title');
    const stepSubtitle = this.container.querySelector('#scan-step-subtitle');
    const stepLineBadge = this.container.querySelector('#scan-line-badge');
    const overlayContainer = this.container.querySelector('#dynamic-overlay-box');

    if (progressBar) progressBar.style.width = `${this.currentProgress}%`;
    if (stepTitle) stepTitle.textContent = step.title;
    if (stepSubtitle) stepSubtitle.textContent = step.subtitle;

    if (stepLineBadge && step.color) {
      stepLineBadge.style.display = 'inline-flex';
      stepLineBadge.style.color = step.color;
      stepLineBadge.style.borderColor = step.color;
      stepLineBadge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 9999px; background: ${step.color}; margin-right: 6px;"></span> Active Line Isolation`;
    } else if (stepLineBadge) {
      stepLineBadge.style.display = 'none';
    }

    // Highlight corresponding active line
    if (overlayContainer) {
      let activeLineCode = null;
      if (step.line === 'LIFE_LINE') activeLineCode = 'LIFE';
      else if (step.line === 'HEAD_LINE') activeLineCode = 'HEAD';
      else if (step.line === 'HEART_LINE') activeLineCode = 'HEART';
      else if (step.line === 'FATE_SUN') activeLineCode = 'FATE';

      overlayContainer.innerHTML = renderPalmLineOverlay({
        highlightedLine: activeLineCode,
        animateGlow: true
      });
    }
  }

  render() {
    this.container.innerHTML = `
      <div style="position: relative; width: 100%; min-height: 100vh; background: var(--color-background); display: flex; flex-direction: column; justify-content: space-between; padding: 24px 16px; overflow: hidden;">
        
        <!-- Top Status & Progress Bar -->
        <div style="z-index: 20; padding-top: max(8px, env(safe-area-inset-top));">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 9999px; background: var(--color-tertiary);" class="glow-pulsing"></span>
              <span style="font-size: 11px; font-weight: 700; color: var(--color-tertiary); letter-spacing: 0.1em; text-transform: uppercase;">
                Neural Feature Synthesis
              </span>
            </div>
            <span style="font-family: monospace; font-size: 11px; color: var(--color-secondary);">
              10s RAPID SCAN
            </span>
          </div>

          <!-- Progress Bar Container -->
          <div style="width: 100%; height: 4px; background: var(--color-surface-container-highest); border-radius: var(--radius-full); overflow: hidden;">
            <div id="scan-progress-bar" style="width: 0%; height: 100%; background: var(--gradient-primary-btn); transition: width 0.1s linear;"></div>
          </div>
        </div>

        <!-- Viewfinder with active line highlighting -->
        <div style="position: relative; width: 100%; aspect-ratio: 4/5; margin: 16px 0; border-radius: var(--radius-xl); overflow: hidden; background: var(--color-surface-container-lowest); box-shadow: var(--shadow-modal); display: flex; align-items: center; justify-content: center;">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2oNLuCqgmkZOjy5WtDmuwiq-ek3dL4voCj9NN6mJcrwt6EuWSslznL-7exzbwCM0kU4wE6_oJkgm8JOy8WDIDH8NltNQPh86n00LU7CKYs4JxJOoQ8HyyPmvBFlXC-uUAG8imeknXpRjRjnzPHPj9dfvFAdGRZg5GgaXzoKosXhSBwL3K3S8UDU7QAYP7Op5zkhAAYmzbT0QU5JjEa5h_RgHlpXXOamJ_mklvSrHxMp-SbqQV9pGDjshN-o0t2izmtQ" 
               alt="Analyzing hand"
               style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.9; filter: contrast(1.15);">
          
          <div style="position: absolute; inset: 0; background: radial-gradient(circle, transparent 40%, rgba(10,14,26,0.85) 100%);"></div>

          <!-- Sweeping Laser Beam -->
          <div class="laser-beam" style="position: absolute; top: 8%; left: 8%; right: 8%; height: 3px; background: linear-gradient(90deg, transparent 0%, #cabeff 50%, transparent 100%); box-shadow: 0 0 16px #cabeff; z-index: 25;"></div>

          <!-- Dynamic Palm Line Overlay Container -->
          <div id="dynamic-overlay-box" style="position: absolute; inset: 0;">
            ${renderPalmLineOverlay()}
          </div>
        </div>

        <!-- Dynamic Status & Step Information Card -->
        <div class="kai-card kai-card-gold-rim" style="padding: 16px 20px; z-index: 20; background: var(--color-surface-container);">
          <div id="scan-line-badge" class="kai-badge" style="display: none; margin-bottom: 8px; font-size: 10px;"></div>
          <h3 id="scan-step-title" style="font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--color-text-high);">
            Detecting Palm Geometry
          </h3>
          <p id="scan-step-subtitle" style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 4px;">
            Aligning 21 anatomical landmarks & Mount plane
          </p>
        </div>

      </div>
    `;
  }
}
