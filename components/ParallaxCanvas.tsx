'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Wind,
  Sparkles,
  Maximize2,
  Camera,
  Video,
  Film,
  Compass,
} from 'lucide-react';
import { calmAudio } from '@/lib/audio-engine';
import {
  TimeOfDay,
  WeatherEffect,
  Particle,
  drawSky,
  drawCelestial,
  drawDistantMountains,
  drawAncientEmpireFortress,
  drawWaterfallsAndGorge,
  drawRidgeAndValley,
  drawPathAndMonolith,
  drawSoldierAndHorse,
  drawAtmosphericWeather,
  drawForegroundElements,
} from './parallax-renderer';

interface ParallaxCanvasProps {
  onCaptureFrameForVeo?: (dataUrl: string) => void;
  onOpenVeoStudio?: () => void;
  showHud: boolean;
  onToggleHud: () => void;
}

export default function ParallaxCanvas({
  onCaptureFrameForVeo,
  onOpenVeoStudio,
  showHud,
  onToggleHud,
}: ParallaxCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // User Interactive Settings
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('dawn');
  const [weather, setWeather] = useState<WeatherEffect>('golden-dust');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // MediaRecorder Ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Simulation State in Ref to prevent re-instantiating render loop
  const stateRef = useRef({
    scrollX: 0,
    walkPhase: 0,
    flagPhase: 0,
    waterfallPhase: 0,
    speed: 1.0,
    isPlaying: true,
    timeOfDay: 'dawn' as TimeOfDay,
    weather: 'golden-dust' as WeatherEffect,
    lastTime: 0,
    eagleX: -100,
    eagleY: 80,
    particles: [] as Particle[],
  });

  // Keep stateRef synchronized with React state
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.speed = speed;
    stateRef.current.timeOfDay = timeOfDay;
    stateRef.current.weather = weather;
  }, [isPlaying, speed, timeOfDay, weather]);

  // Initialize atmospheric particles
  useEffect(() => {
    const parts: Particle[] = [];
    const count = weather === 'rain' ? 120 : weather === 'mist' ? 35 : 65;
    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        size: Math.random() * (weather === 'mist' ? 3 : 2.5) + 1,
        speedX:
          weather === 'rain'
            ? -1.8 - Math.random() * 1.5
            : (Math.random() - 0.5) * 1.2 - 0.6,
        speedY:
          weather === 'rain'
            ? 7.0 + Math.random() * 4.0
            : (Math.random() - 0.5) * 0.8 + 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
      });
    }
    stateRef.current.particles = parts;
  }, [weather]);

  // Main 60fps Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    stateRef.current.lastTime = performance.now();
    let lastStepSoundTime = 0;

    const render = (now: number) => {
      const dt = Math.min((now - stateRef.current.lastTime) / 1000, 0.1);
      stateRef.current.lastTime = now;

      if (stateRef.current.isPlaying) {
        const currentSpeed = stateRef.current.speed;
        stateRef.current.scrollX += 120 * currentSpeed * dt;
        stateRef.current.walkPhase += 2.8 * currentSpeed * dt;
        stateRef.current.flagPhase += 4.5 * dt;
        stateRef.current.waterfallPhase += 6.0 * dt;

        // Eagle movement
        stateRef.current.eagleX += 45 * dt;
        if (stateRef.current.eagleX > canvas.width + 300) {
          stateRef.current.eagleX = -200;
          stateRef.current.eagleY = 60 + Math.random() * 80;
        }

        // Trigger procedural hoof & footstep audio synchronization
        if (now - lastStepSoundTime > 360 / currentSpeed) {
          lastStepSoundTime = now;
          // Alternate soldier and horse steps
          const stepPhase = Math.floor(stateRef.current.walkPhase) % 4;
          if (stepPhase === 0 || stepPhase === 2) {
            calmAudio.triggerStep('horse', 0.8);
          } else {
            calmAudio.triggerStep('soldier', 0.6);
          }
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const t = stateRef.current.timeOfDay;
      const scroll = stateRef.current.scrollX;
      const walk = stateRef.current.walkPhase;

      // 1. SKY & ATMOSPHERE
      drawSky(ctx, width, height, t, now);

      // 2. CELESTIAL & SUN RAYS
      drawCelestial(
        ctx,
        width,
        height,
        t,
        now,
        stateRef.current.eagleX,
        stateRef.current.eagleY
      );

      // 3. LAYER 0: Distant Mountain Range (0.08x scroll)
      drawDistantMountains(ctx, width, height, scroll * 0.08, t);

      // 4. LAYER 1: Ancient Empire Fortress & Mountain Temples (0.22x scroll)
      drawAncientEmpireFortress(
        ctx,
        width,
        height,
        scroll * 0.22,
        t,
        stateRef.current.flagPhase
      );

      // 5. LAYER 2: Cascading Waterfalls & Misty Gorges (0.45x scroll)
      drawWaterfallsAndGorge(
        ctx,
        width,
        height,
        scroll * 0.45,
        t,
        stateRef.current.waterfallPhase
      );

      // 6. LAYER 3: Jungle Ridge & Roadway (0.75x scroll)
      drawRidgeAndValley(ctx, width, height, scroll * 0.75, t);

      // 7. LAYER 4: Cobblestone Path & Inscribed Monolith (1.0x scroll)
      drawPathAndMonolith(ctx, width, height, scroll * 1.0, t);

      // 8. THE CHARACTERS (Centered hero positioning with walking biomechanics)
      drawSoldierAndHorse(
        ctx,
        width,
        height,
        walk,
        stateRef.current.flagPhase,
        t
      );

      // 9. WEATHER & PARTICLES
      drawAtmosphericWeather(
        ctx,
        width,
        height,
        stateRef.current.weather,
        t,
        stateRef.current.particles
      );

      // 10. FOREGROUND CANOPY & VIGNETTE (1.35x scroll)
      drawForegroundElements(ctx, width, height, scroll * 1.35, t);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // ResizeObserver for high-DPI canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Standardize 16:9 internal virtual resolution
          canvas.width = 1920;
          canvas.height = 1080;
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Snapshot frame for Veo Video Generation
  const handleCaptureSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onCaptureFrameForVeo) {
      onCaptureFrameForVeo(dataUrl);
    }
  }, [onCaptureFrameForVeo]);

  // Record 60fps Video Loop from Canvas
  const startRecordingLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
        videoBitsPerSecond: 6000000,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historical-soldier-horse-loop-${timeOfDay}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Canvas capture failed:', err);
    }
  };

  const stopRecordingLoop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div
      ref={containerRef}
      id="parallax-canvas-container"
      className="relative w-full aspect-video max-h-[78vh] overflow-hidden bg-stone-950 select-none group"
    >
      <canvas
        ref={canvasRef}
        id="main-parallax-canvas"
        className="w-full h-full object-cover block"
      />

      {/* FLOATING QUICK CONTROLS BAR (Bottom Center) */}
      <div
        id="parallax-interactive-toolbar"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-2 bg-stone-950/85 backdrop-blur-xl border border-stone-800/80 px-3.5 py-2 rounded-2xl shadow-2xl transition-opacity duration-300 opacity-95 group-hover:opacity-100"
      >
        {/* Play/Pause */}
        <button
          id="btn-play-pause"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold transition"
          title={isPlaying ? 'Pause Animation' : 'Play Animation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="w-px h-5 bg-stone-800 mx-0.5" />

        {/* Time of Day */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setTimeOfDay('dawn')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
              timeOfDay === 'dawn'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Dawn / Golden Hour"
          >
            <SunriseIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Dawn</span>
          </button>

          <button
            onClick={() => setTimeOfDay('noon')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
              timeOfDay === 'noon'
                ? 'bg-sky-500/20 text-sky-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="High Noon Daylight"
          >
            <Sun className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Noon</span>
          </button>

          <button
            onClick={() => setTimeOfDay('sunset')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
              timeOfDay === 'sunset'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Sunset Twilight"
          >
            <Sunset className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Sunset</span>
          </button>

          <button
            onClick={() => setTimeOfDay('night')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
              timeOfDay === 'night'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Moonlit Night"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Night</span>
          </button>
        </div>

        <div className="w-px h-5 bg-stone-800 mx-0.5" />

        {/* Weather & Atmosphere */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setWeather('golden-dust')}
            className={`p-1.5 rounded-lg transition ${
              weather === 'golden-dust'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Atmospheric Golden Dust Particles"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWeather('mist')}
            className={`p-1.5 rounded-lg transition ${
              weather === 'mist'
                ? 'bg-stone-500/20 text-stone-200'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Mountain Valley Mist"
          >
            <Wind className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWeather('rain')}
            className={`p-1.5 rounded-lg transition ${
              weather === 'rain'
                ? 'bg-sky-500/20 text-sky-300'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Monsoon Mountain Rain"
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-stone-800 mx-0.5" />

        {/* Speed Slider */}
        <div className="flex items-center gap-1.5 text-stone-300 text-xs px-1">
          <span className="text-[11px] text-stone-400 font-mono">{speed.toFixed(1)}x</span>
          <input
            id="slider-gait-speed"
            type="range"
            min="0.4"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-16 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            title="Walking Gait Pace"
          />
        </div>

        <div className="w-px h-5 bg-stone-800 mx-0.5" />

        {/* Snapshot for Veo Studio */}
        <button
          id="btn-snapshot-frame"
          onClick={handleCaptureSnapshot}
          className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 transition flex items-center gap-1 text-xs"
          title="Snapshot Current Frame for Veo 3.1 Video Generation"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Snapshot</span>
        </button>

        {/* Record WebM Video Loop directly */}
        <button
          id="btn-record-loop"
          onClick={isRecording ? stopRecordingLoop : startRecordingLoop}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
            isRecording
              ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
          }`}
          title={isRecording ? 'Stop Recording' : 'Record High-Definition Video Loop'}
        >
          <Video className={`w-3.5 h-3.5 ${isRecording ? 'text-red-400' : 'text-amber-400'}`} />
          <span>{isRecording ? `REC ${recordingSeconds}s` : 'Record'}</span>
        </button>

        {/* Open Veo Studio Drawer */}
        {onOpenVeoStudio && (
          <button
            id="btn-open-veo-drawer"
            onClick={onOpenVeoStudio}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold transition flex items-center gap-1.5 text-xs shadow-lg"
            title="Generate Video with Veo AI (Upload photo or use canvas)"
          >
            <Film className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Veo AI</span>
          </button>
        )}

        {/* Toggle Game HUD */}
        <button
          onClick={onToggleHud}
          className={`p-2 rounded-xl border transition ${
            showHud
              ? 'bg-stone-800 text-amber-400 border-amber-500/40'
              : 'text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
          title="Toggle Strategy Game HUD"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          id="btn-fullscreen"
          onClick={toggleFullscreen}
          className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SunriseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v6" />
      <path d="M4.93 10.93l4.24-4.24" />
      <path d="M2 18h20" />
      <path d="M20 18a8 8 0 0 0-16 0" />
      <path d="M19.07 10.93l-4.24-4.24" />
    </svg>
  );
}
