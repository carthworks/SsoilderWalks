// Web Audio API Procedural Calm Historical Music & Soundscape Engine

export interface AudioEngineConfig {
  droneVolume: number;
  melodyVolume: number;
  ambienceVolume: number;
  footstepsVolume: number;
  masterVolume: number;
  preset: string;
}

class CalmMusicEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private droneOscillators: OscillatorNode[] = [];
  private ambienceSource: AudioBufferSourceNode | null = null;
  private melodyTimer: NodeJS.Timeout | null = null;
  private bellTimer: NodeJS.Timeout | null = null;

  // Custom audio playback
  private customAudioEl: HTMLAudioElement | null = null;
  private customAudioSource: MediaElementAudioSourceNode | null = null;

  private config: AudioEngineConfig = {
    droneVolume: 0.5,
    melodyVolume: 0.6,
    ambienceVolume: 0.4,
    footstepsVolume: 0.35,
    masterVolume: 0.7,
    preset: 'dawn-flute',
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.config.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(this.config.droneVolume, this.ctx.currentTime);
      this.droneGain.connect(this.masterGain);

      this.melodyGain = this.ctx.createGain();
      this.melodyGain.gain.setValueAtTime(this.config.melodyVolume, this.ctx.currentTime);
      this.melodyGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(this.config.ambienceVolume, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.config.footstepsVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start() {
    this.initContext();
    if (this.isRunning) return;
    this.isRunning = true;

    this.startDrone();
    this.startAmbience();
    this.startMelodyLoop();
    this.startTempleBells();

    if (this.customAudioEl && !this.customAudioEl.paused) {
      this.customAudioEl.play().catch(() => {});
    }
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    // Stop drone oscillators
    this.droneOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    this.droneOscillators = [];

    // Clear timers
    if (this.melodyTimer) clearInterval(this.melodyTimer);
    if (this.bellTimer) clearInterval(this.bellTimer);

    if (this.ambienceSource) {
      try {
        this.ambienceSource.stop();
      } catch (_) {}
      this.ambienceSource = null;
    }

    if (this.customAudioEl) {
      this.customAudioEl.pause();
    }
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public setMasterVolume(vol: number) {
    this.config.masterVolume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = vol;
    }
  }

  public setDroneVolume(vol: number) {
    this.config.droneVolume = vol;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public setMelodyVolume(vol: number) {
    this.config.melodyVolume = vol;
    if (this.melodyGain && this.ctx) {
      this.melodyGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public setAmbienceVolume(vol: number) {
    this.config.ambienceVolume = vol;
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public setFootstepsVolume(vol: number) {
    this.config.footstepsVolume = vol;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  // Play realistic hoof & footstep sound effect in sync with walking animation
  public triggerStep(type: 'horse' | 'soldier', volumeScale: number = 1.0) {
    if (!this.ctx || !this.isRunning || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;

      if (type === 'horse') {
        // Double-tap hoof strike (clip-clop) on gravel/stone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25 * volumeScale, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);

        // Clop resonance
        const noiseBuffer = this.generatePinkNoise(0.05);
        if (noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.08 * volumeScale, now + 0.01);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          noise.connect(noiseGain);
          noiseGain.connect(this.sfxGain);
          noise.start(now + 0.015);
        }
      } else {
        // Soldier leather sandal strike on mountain stone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110 + Math.random() * 15, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18 * volumeScale, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (_) {}
  }

  // Synthesize Tanpura / Drone in D
  private startDrone() {
    if (!this.ctx || !this.droneGain) return;

    // D2, A2, D3, F#3 harmonic chord
    const baseFreqs = [73.42, 110.0, 146.83, 220.0, 293.66];

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Subtle detuning for warm shimmering chorus
      const detune = (idx - 2) * 4 + (Math.random() * 2 - 1);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + idx * 80, this.ctx.currentTime);

      // Slow breathing amplitude LFO
      gain.gain.setValueAtTime(0.15 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.droneGain!);

      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  // Synthesize soft mountain wind & distant waterfall
  private startAmbience() {
    if (!this.ctx || !this.ambienceGain) return;

    try {
      const buffer = this.generatePinkNoise(5.0);
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      // Low frequency oscillator for wind gusts
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);

      lfo.connect(filter.frequency);
      lfo.start();

      source.connect(filter);
      filter.connect(this.ambienceGain);

      source.start();
      this.ambienceSource = source;
    } catch (_) {}
  }

  // Procedural ancient wooden flute / bansuri melody
  private startMelodyLoop() {
    // Raag Bhupali / Mohanam pentatonic scale in D:
    // D4 (293.66), E4 (329.63), F#4 (369.99), A4 (440.00), B4 (493.88), D5 (587.33)
    const scale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 440.0, 369.99];

    let noteIdx = 0;
    const playNextPhrase = () => {
      if (!this.isRunning || !this.ctx || !this.melodyGain) return;

      const freq = scale[noteIdx % scale.length];
      noteIdx = (noteIdx + 1 + Math.floor(Math.random() * 2)) % scale.length;

      const duration = 2.2 + Math.random() * 1.5;
      this.playFluteTone(freq, duration);

      // Schedule next note with meditative pause
      const rest = duration * 1000 + (1200 + Math.random() * 2500);
      this.melodyTimer = setTimeout(playNextPhrase, rest);
    };

    // Begin with gentle delay
    this.melodyTimer = setTimeout(playNextPhrase, 1800);
  }

  private playFluteTone(freq: number, duration: number) {
    if (!this.ctx || !this.melodyGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const breathOsc = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle pitch glide (meend/portamento)
      osc.frequency.exponentialRampToValueAtTime(freq * (1 + (Math.random() * 0.015 - 0.007)), now + duration);

      // Breath noise harmonic
      breathOsc.type = 'triangle';
      breathOsc.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, now);

      // Soft envelope (woodwind breath attack and gentle release)
      toneGain.gain.setValueAtTime(0.0001, now);
      toneGain.gain.linearRampToValueAtTime(0.22, now + 0.4);
      toneGain.gain.setValueAtTime(0.18, now + duration * 0.7);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      breathOsc.connect(filter);
      filter.connect(toneGain);
      toneGain.connect(this.melodyGain);

      osc.start(now);
      breathOsc.start(now);
      osc.stop(now + duration + 0.1);
      breathOsc.stop(now + duration + 0.1);
    } catch (_) {}
  }

  // Soft temple bell / singing bowl chime every 14-20 seconds
  private startTempleBells() {
    const ringBell = () => {
      if (!this.isRunning || !this.ctx || !this.melodyGain) return;
      try {
        const now = this.ctx.currentTime;
        const freqs = [528, 1056, 1584]; // Pure solfeggio harmonic resonance
        freqs.forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.06 / (i + 1), now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.0);

          osc.connect(gain);
          gain.connect(this.melodyGain!);
          osc.start(now);
          osc.stop(now + 7.2);
        });
      } catch (_) {}

      const nextBell = 14000 + Math.random() * 8000;
      this.bellTimer = setTimeout(ringBell, nextBell);
    };

    this.bellTimer = setTimeout(ringBell, 4000);
  }

  private generatePinkNoise(seconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Load custom calm music file uploaded by user
  public loadCustomAudioFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.initContext();
        if (this.customAudioEl) {
          this.customAudioEl.pause();
          this.customAudioEl = null;
        }

        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = this.config.masterVolume;
        this.customAudioEl = audio;

        if (this.isRunning) {
          audio.play().catch(console.error);
        }

        resolve(file.name);
      } catch (err) {
        reject(err);
      }
    });
  }

  public clearCustomAudio() {
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl = null;
    }
  }
}

export const calmAudio = new CalmMusicEngine();
