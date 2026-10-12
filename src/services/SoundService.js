/**
 * Kai RegAI — Sacred Sound & Haptic Service
 * Phase: P6 — Hand Scanner Experience & Multi-Sensory Feedback
 * 
 * Provides sacred harmonic frequency synthesis using the Web Audio API
 * and tactile haptic pulse patterns. Zero external audio file dependencies.
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.muted = false;
    if (typeof window !== 'undefined' && window.localStorage) {
      this.muted = window.localStorage.getItem('kai_sound_muted') === 'true';
    }
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('kai_sound_muted', String(this.muted));
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Synthesize a clean harmonic sine wave tone with gentle envelope
   */
  playTone(freq, duration = 0.4, type = 'sine', gainVal = 0.15) {
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Gentle attack and exponential decay release envelope
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVal, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // Audio autoplay policies or background restrictions
    }
  }

  /**
   * Viewfinder alignment locked chime
   */
  playAlignmentChime() {
    if (this.muted) return;
    this.playTone(528, 0.35, 'sine', 0.14);
    setTimeout(() => this.playTone(660, 0.45, 'sine', 0.12), 100);
    this.vibrate([30]);
  }

  /**
   * Crease line harmonic resonance (Solfeggio frequencies)
   */
  playLineTone(lineKey) {
    if (this.muted) return;
    const FREQS = {
      life: 396,   // Liberating Vitality
      head: 528,   // Transformation & Intellect
      heart: 639,  // Connection & Relationship
      fate: 741,   // Intuition & Expression
      sun: 852     // Pure Radiance
    };
    const freq = FREQS[lineKey?.toLowerCase()] || 528;
    this.playTone(freq, 0.45, 'sine', 0.16);
    this.vibrate([25]);
  }

  /**
   * Camera capture flash click + shimmering resolution chord
   */
  playShutterSound() {
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Click transient
      this.playTone(1200, 0.06, 'triangle', 0.25);

      // Harmonic celestial triad
      setTimeout(() => {
        this.playTone(528, 0.6, 'sine', 0.12);
        this.playTone(660, 0.65, 'sine', 0.10);
        this.playTone(792, 0.7, 'sine', 0.08);
      }, 70);
    } catch (_) {}
    this.vibrate([40, 50, 60]);
  }

  /**
   * Device tactile vibration
   */
  vibrate(pattern = [30]) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  }
}

export const soundService = new SoundService();
