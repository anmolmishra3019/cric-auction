// Web Audio API Synthesizer with Master Volume Control & Zero External Dependencies
class SoundEffects {
  constructor() {
    this.ctx = null;
    const savedMute = localStorage.getItem('cric_auction_sound_muted');
    this.enabled = savedMute !== 'true';
    const savedVol = localStorage.getItem('cric_auction_sound_vol');
    this.volume = savedVol !== null ? parseFloat(savedVol) : 0.6;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('cric_auction_sound_vol', this.volume.toString());
  }

  setMuted(muted) {
    this.enabled = !muted;
    localStorage.setItem('cric_auction_sound_muted', muted.toString());
  }

  playBid() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5
      const peak = 0.3 * this.volume;
      gain.gain.setValueAtTime(peak, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playGavel() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);
      const peak = 0.7 * this.volume;
      gain.gain.setValueAtTime(peak, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playSoldFanfare() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        const peak = 0.35 * this.volume;
        gain.gain.setValueAtTime(peak, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playTick() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      const peak = 0.1 * this.volume;
      gain.gain.setValueAtTime(peak, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundFX = new SoundEffects();