class AudioService {
  private ctx: AudioContext | null = null;
  private tanpuraGain: GainNode | null = null;
  private tanpuraOscs: OscillatorNode[] = [];
  private isTanpuraPlaying = false;
  private masterVolume = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.tanpuraGain && this.ctx) {
      this.tanpuraGain.gain.setValueAtTime(this.masterVolume * 0.15, this.ctx.currentTime);
    }
  }

  /**
   * Play an authentic Tibetan singing bowl / sacred bell chime
   */
  public playSingingBowl(durationSeconds = 4.0) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Base fundamental + sacred harmonic overtones
      const freqs = [432, 864, 1296, 1728];
      const gains = [0.4, 0.25, 0.15, 0.08];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), now);

        const initialGain = gains[i] * this.masterVolume;
        gain.gain.setValueAtTime(initialGain, now);
        // Exponential bell decay
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + durationSeconds);
      });
    } catch (e) {
      console.warn('Audio playSingingBowl error:', e);
    }
  }

  /**
   * Play a gentle wooden Mala bead click sound for Naam Jap
   */
  public playBeadClick() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio playBeadClick error:', e);
    }
  }

  /**
   * Toggle peaceful meditative Tanpura drone
   */
  public toggleTanpura(onStateChange?: (playing: boolean) => void): boolean {
    if (this.isTanpuraPlaying) {
      this.stopTanpura();
      onStateChange?.(false);
      return false;
    } else {
      this.startTanpura();
      onStateChange?.(true);
      return true;
    }
  }

  public startTanpura() {
    try {
      if (this.isTanpuraPlaying) return;
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.0001, now);
      mainGain.gain.linearRampToValueAtTime(this.masterVolume * 0.15, now + 2);
      mainGain.connect(ctx.destination);
      this.tanpuraGain = mainGain;

      // 4 harmonic strings (Pa, Sa, Sa, Sa at lower octave)
      const droneFreqs = [144, 216, 216.5, 108]; // D note tuning
      this.tanpuraOscs = droneFreqs.map((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        // Subtly modulate pitch for natural acoustic vibration
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2 + Math.random() * 0.3;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 1.2;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);

        osc.connect(mainGain);
        osc.start(now);
        return osc;
      });

      this.isTanpuraPlaying = true;
    } catch (e) {
      console.warn('Audio startTanpura error:', e);
    }
  }

  public stopTanpura() {
    try {
      if (!this.isTanpuraPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      if (this.tanpuraGain) {
        this.tanpuraGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
      }
      setTimeout(() => {
        this.tanpuraOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {}
        });
        this.tanpuraOscs = [];
        this.isTanpuraPlaying = false;
      }, 1300);
    } catch (e) {
      console.warn('Audio stopTanpura error:', e);
      this.isTanpuraPlaying = false;
    }
  }

  public isDroneActive(): boolean {
    return this.isTanpuraPlaying;
  }
}

export const audio = new AudioService();
