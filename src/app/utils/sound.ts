'use client';

class SoundManager {
  private ctx: AudioContext | null = null;

  private initCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Soft click sound for buttons and general tabs
  playClick() {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("AudioContext block: Interaction requires user click first.", e);
    }
  }

  // 2. Rising chime sound when successfully adding item to cart
  playSuccess() {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.initCtx();
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playNote(523.25, now, 0.12); // C5
      playNote(659.25, now + 0.07, 0.18); // E5
      playNote(783.99, now + 0.14, 0.28); // G5
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  }

  // 3. Popping bubble sound when toggling items to wishlist
  playPop() {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  }

  // 4. Descending soft sweep sound when removing items from cart/wishlist
  playDelete() {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  }

  // 5. Bright notification chime for coupon codes and live support alerts
  playNotice() {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.initCtx();
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playNote(783.99, now, 0.1); // G5
      playNote(987.77, now + 0.05, 0.15); // B5
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  }

  // 6. Low double buzz sound for validation errors / invalid inputs
  playError() {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.initCtx();
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playNote(130, now, 0.12);
      playNote(130, now + 0.15, 0.12);
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  }
}

export const playSound = new SoundManager();
