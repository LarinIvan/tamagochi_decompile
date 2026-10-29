// Сервис тактильной отдачи (Vibration) и звуковых эффектов (Web Audio API)
// Работает полностью автономно без загрузки внешних звуковых файлов

class SoundHapticService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Тактильная виброотдача на телефоне
  vibrate(pattern: number | number[]) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Игнорируем ограничения WebView / не поддерживается
    }
  }

  // Звук захвата соты (приятный звонкий щелчок колокольчика)
  playHexCapture() {
    this.vibrate(40);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio error ignored
    }
  }

  // Звук замыкания контура (победная трель)
  playLoopEnclosed() {
    this.vibrate([80, 50, 120]);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.2);
      });
    } catch {
      // Audio error ignored
    }
  }

  // Сигнал опасности (двойной предупредительный импульс)
  playHazardWarning() {
    this.vibrate([150, 100, 150]);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.15].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(329.63, now + offset); // E4

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    } catch {
      // Audio error ignored
    }
  }
}

export const soundService = new SoundHapticService();
