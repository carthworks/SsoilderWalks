'use client';

import React, { useState } from 'react';
import ParallaxCanvas from '@/components/ParallaxCanvas';
import GameHudOverlay from '@/components/GameHudOverlay';
import AudioControlBar from '@/components/AudioControlBar';
import VeoStudioModal from '@/components/VeoStudioModal';
import {
  Film,
  Sparkles,
  Compass,
  Layers,
  Video,
  Music,
  Info,
  ChevronRight,
  Shield,
  Upload,
} from 'lucide-react';

export default function HomePage() {
  const [showHud, setShowHud] = useState<boolean>(true);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState<boolean>(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [activeBackgroundVideo, setActiveBackgroundVideo] = useState<string | null>(null);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);

  const handleCaptureFrameForVeo = (dataUrl: string) => {
    setCapturedFrame(dataUrl);
    setIsVeoModalOpen(true);
  };

  return (
    <main
      id="app-root-container"
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950"
    >
      {/* TOP COMPACT HEADER */}
      <header
        id="app-header"
        className="h-14 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-red-800 flex items-center justify-center shadow-lg border border-amber-500/40 text-sm">
            🐅
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-100 tracking-tight flex items-center gap-2">
              Historical Soldier & Horse Walking Parallax
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider bg-stone-900 border border-stone-700 text-amber-400 px-2 py-0.5 rounded-full">
                Strategy Game Loop
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Strategy HUD Toggle */}
          <button
            id="btn-header-hud-toggle"
            onClick={() => setShowHud(!showHud)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
              showHud
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle Civilization / Total War Style Game HUD"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Game HUD</span>
          </button>

          {/* Switch back to Canvas if custom video is active */}
          {activeBackgroundVideo && (
            <button
              onClick={() => setActiveBackgroundVideo(null)}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/40 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Back to Canvas</span>
            </button>
          )}

          {/* Veo Video Studio Modal Trigger */}
          <button
            id="btn-header-open-veo"
            onClick={() => setIsVeoModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
            title="Open Veo Video Generator (Upload photo & generate with Veo 3.1)"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Generate with Veo</span>
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfoDrawer(!showInfoDrawer)}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition"
            title="About Historical Background & Architecture"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col p-3 sm:p-6 max-w-7xl w-full mx-auto gap-4">
        {/* VIEWPORT CANVAS / VIDEO STAGE */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-950">
          {activeBackgroundVideo ? (
            <div className="relative w-full aspect-video bg-black">
              <video
                src={activeBackgroundVideo}
                autoPlay
                playsInline
                loop
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 z-40 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Veo Generated Video Loop</span>
              </div>
            </div>
          ) : (
            <ParallaxCanvas
              onCaptureFrameForVeo={handleCaptureFrameForVeo}
              onOpenVeoStudio={() => setIsVeoModalOpen(true)}
              showHud={showHud}
              onToggleHud={() => setShowHud(!showHud)}
            />
          )}

          {/* Strategy Game UI HUD Overlay (Active on both canvas and video) */}
          <GameHudOverlay show={showHud} />
        </div>

        {/* CALM MUSIC BACKGROUND ENGINE CONTROLS */}
        <div className="w-full">
          <AudioControlBar />
        </div>

        {/* HISTORICAL STRATEGY GAME LORE & FEATURE GUIDE */}
        {showInfoDrawer && (
          <div
            id="info-drawer-panel"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-900/60 border border-stone-800 rounded-2xl p-5 text-xs text-stone-300 animate-fade-in"
          >
            <div className="space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                Historical Tamil Chola Vanguard
              </div>
              <p className="text-stone-400 leading-relaxed">
                Depicting a Chola commander and royal white war stallion traversing the mist-cloaked mountain
                passes of the Eastern Ghats. Features the royal tiger standard flag (Pulikodi), flowing scarlet cape,
                pleated veshti, and bronze cuirass armor.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                Multi-Plane Parallax Depth
              </div>
              <p className="text-stone-400 leading-relaxed">
                Rendered across 7 differential parallax depth planes: moving sky and cloud cover, soaring eagle,
                snowy peaks, ancient tiered temple gopurams with fluttering pennants, cascading waterfalls with mist,
                carved Tamil inscription monolith (&quot;வீரம் அறிவு நாட்டுக்காக&quot;), and foreground banyan vines.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-amber-400" />
                Veo 3.1 Fast Video Generation
              </div>
              <p className="text-stone-400 leading-relaxed">
                Upload your own artwork or snapshot the live canvas to generate high-definition 16:9 or 9:16 looping
                video clips with model <code className="text-amber-200">veo-3.1-fast-generate-preview</code>, perfect for
                seamless game backgrounds or video editing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* VEO VIDEO GENERATOR MODAL / DRAWER */}
      <VeoStudioModal
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
        initialImageBase64={capturedFrame}
        onApplyVideoToBackground={(url) => {
          setActiveBackgroundVideo(url);
          setIsVeoModalOpen(false);
        }}
      />
    </main>
  );
}
