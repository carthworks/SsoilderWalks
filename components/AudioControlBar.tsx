'use client';

import React, { useState, useEffect, useRef } from 'react';
import { calmAudio } from '@/lib/audio-engine';
import {
  Volume2,
  VolumeX,
  Music,
  Upload,
  Sliders,
  Sparkles,
  Wind,
  Footprints,
  FileAudio,
  Play,
  Pause,
} from 'lucide-react';

export default function AudioControlBar() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [masterVol, setMasterVol] = useState<number>(0.7);
  const [melodyVol, setMelodyVol] = useState<number>(0.6);
  const [droneVol, setDroneVol] = useState<number>(0.5);
  const [windVol, setWindVol] = useState<number>(0.4);
  const [stepsVol, setStepsVol] = useState<number>(0.35);
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [customTrackName, setCustomTrackName] = useState<string | null>('Dawn Temple Garden');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    calmAudio.loadTrackFromUrl('/music/Dawn Temple Garden.mp3', 'Dawn Temple Garden');
  }, []);

  const togglePlay = () => {
    const running = calmAudio.toggle();
    setIsPlaying(running);
  };

  const handleMasterVol = (v: number) => {
    setMasterVol(v);
    if (!isMuted) calmAudio.setMasterVolume(v);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      calmAudio.setMasterVolume(masterVol);
    } else {
      setIsMuted(true);
      calmAudio.setMasterVolume(0);
    }
  };

  const handleSelectDefaultTrack = async () => {
    const name = await calmAudio.loadTrackFromUrl('/music/Dawn Temple Garden.mp3', 'Dawn Temple Garden');
    setCustomTrackName(name);
    if (!isPlaying) {
      calmAudio.start();
      setIsPlaying(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const name = await calmAudio.loadCustomAudioFile(file);
      setCustomTrackName(name);
      setIsPlaying(true);
      calmAudio.start();
    } catch (err) {
      console.error('Failed to load custom audio file:', err);
    }
  };

  return (
    <div
      id="calm-audio-control-bar"
      className="flex items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl text-stone-200 text-xs w-full max-w-2xl mx-auto"
    >
      {/* Left: Play / Pause & Title */}
      <div className="flex items-center gap-3">
        <button
          id="btn-audio-toggle"
          onClick={togglePlay}
          className={`p-2.5 rounded-xl font-semibold transition flex items-center gap-1.5 shadow-lg ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
              : 'bg-stone-800 hover:bg-stone-700 text-amber-400'
          }`}
          title={isPlaying ? 'Pause calm music background' : 'Start calm music background'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="font-sans text-xs">{isPlaying ? 'Playing Music' : 'Play Background Music'}</span>
        </button>

        <div className="flex flex-col cursor-pointer" onClick={handleSelectDefaultTrack} title="Click to reload Dawn Temple Garden track">
          <div className="flex items-center gap-1.5 text-stone-200 font-semibold">
            <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{customTrackName || 'Procedural Ancient Soundscape'}</span>
          </div>
          <span className="text-[10px] text-amber-400/80">
            Historical Background Music (music/ folder)
          </span>
        </div>
      </div>

      {/* Right: Master Volume & Upload & Mixer */}
      <div className="flex items-center gap-2">
        {/* Mute toggle */}
        <button
          id="btn-audio-mute"
          onClick={toggleMute}
          className="p-2 hover:bg-stone-800 rounded-xl transition text-stone-400 hover:text-stone-200"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Master Slider */}
        <input
          id="slider-master-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : masterVol}
          onChange={(e) => handleMasterVol(parseFloat(e.target.value))}
          className="w-20 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          title={`Volume: ${Math.round(masterVol * 100)}%`}
        />

        {/* Custom Audio Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          id="btn-upload-calm-music"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300 hover:text-stone-100 transition flex items-center gap-1.5 border border-stone-700/60"
          title="Upload your own calm music track (MP3, WAV, AAC)"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">My Audio</span>
        </button>

        {/* Advanced Synthesizer Layers Drawer Toggle */}
        <button
          id="btn-toggle-audio-mixer"
          onClick={() => setShowMixer(!showMixer)}
          className={`p-2 rounded-xl transition ${
            showMixer ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'hover:bg-stone-800 text-stone-400'
          }`}
          title="Audio Soundscape Mixer"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* EXPANDABLE MULTI-LAYER SOUNDSCAPE MIXER */}
      {showMixer && (
        <div
          id="audio-layers-mixer-panel"
          className="absolute bottom-full mb-3 right-0 w-80 bg-stone-950/95 border border-stone-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-3.5 text-xs animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="font-semibold text-stone-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Soundscape Stem Mixer
            </span>
            <span className="text-[10px] text-stone-400">Web Audio API</span>
          </div>

          {/* Flute Melody Volume */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-stone-300 w-32">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              Bamboo Flute
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={melodyVol}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setMelodyVol(v);
                calmAudio.setMelodyVolume(v);
              }}
              className="w-28 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Drone Volume */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-stone-300 w-32">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tanpura Drone
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={droneVol}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setDroneVol(v);
                calmAudio.setDroneVolume(v);
              }}
              className="w-28 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Wind & Waterfall Ambiance */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-stone-300 w-32">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              Mountain Wind
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={windVol}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setWindVol(v);
                calmAudio.setAmbienceVolume(v);
              }}
              className="w-28 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Hoofbeats & Leather Footsteps */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-stone-300 w-32">
              <Footprints className="w-3.5 h-3.5 text-amber-300" />
              Hooves & Steps
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={stepsVol}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setStepsVol(v);
                calmAudio.setFootstepsVolume(v);
              }}
              className="w-28 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {customTrackName && (
            <button
              onClick={() => {
                calmAudio.clearCustomAudio();
                setCustomTrackName(null);
              }}
              className="mt-1 text-[11px] text-red-400 hover:text-red-300 text-center underline cursor-pointer"
            >
              Reset to procedural synthesizer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
