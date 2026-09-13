'use client';

import React from 'react';
import { Shield, Coins, Wheat, Users, Anchor, Flag, MapPin } from 'lucide-react';

interface GameHudOverlayProps {
  show: boolean;
}

export default function GameHudOverlay({ show }: GameHudOverlayProps) {
  if (!show) return null;

  return (
    <div
      id="strategy-game-hud"
      className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 select-none font-serif text-amber-100"
    >
      {/* TOP IMPERIAL EMPIRE BAR */}
      <div className="flex items-center justify-between w-full">
        {/* Kingdom Seal & Title */}
        <div
          id="hud-empire-title"
          className="flex items-center gap-3 bg-stone-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-2xl"
        >
          {/* Royal Tiger Crest Icon */}
          <div className="w-8 h-8 rounded-lg bg-red-900 border border-amber-400 flex items-center justify-center font-bold text-amber-300 text-sm shadow-inner">
            🐅
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              Chola Empire
            </div>
            <div className="text-[11px] text-stone-300 font-sans">
              Reign of Emperor Rajendra I • 1018 CE
            </div>
          </div>
        </div>

        {/* Imperial Strategy Resources */}
        <div
          id="hud-resources-bar"
          className="flex items-center gap-5 bg-stone-950/80 backdrop-blur-md px-5 py-2 rounded-xl border border-stone-800 shadow-xl font-sans text-xs"
        >
          <div className="flex items-center gap-1.5" title="Gold Treasury">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-stone-100">18,450</span>
            <span className="text-[10px] text-emerald-400 font-mono">(+340)</span>
          </div>

          <div className="w-px h-4 bg-stone-800" />

          <div className="flex items-center gap-1.5" title="Grain Granaries">
            <Wheat className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-stone-100">32,200</span>
            <span className="text-[10px] text-emerald-400 font-mono">(+510)</span>
          </div>

          <div className="w-px h-4 bg-stone-800" />

          <div className="flex items-center gap-1.5" title="Active Infantry & Cavalry">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-stone-100">84,000</span>
          </div>

          <div className="w-px h-4 bg-stone-800" />

          <div className="flex items-center gap-1.5" title="Royal Armada Ships">
            <Anchor className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-stone-100">340</span>
          </div>

          <div className="w-px h-4 bg-stone-800" />

          <div className="flex items-center gap-1.5" title="Army Morale">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span className="font-semibold text-stone-100">98%</span>
            <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Exalted</span>
          </div>
        </div>

        {/* Current Turn & Season */}
        <div
          id="hud-turn-indicator"
          className="bg-stone-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-800 text-right text-xs"
        >
          <span className="text-amber-400 font-semibold">Turn 142</span>
          <span className="text-stone-400 text-[10px] block">Autumn Monsoons</span>
        </div>
      </div>

      {/* BOTTOM STRATEGIC MINIMAP & MISSION BANNER */}
      <div className="flex items-end justify-between w-full">
        {/* Strategic Minimap Radar */}
        <div
          id="hud-strategic-minimap"
          className="bg-stone-950/85 backdrop-blur-md p-3 rounded-2xl border border-stone-800 shadow-2xl flex flex-col gap-2 w-52"
        >
          <div className="flex items-center justify-between text-[11px] text-stone-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-400" />
              <span>Ghats Expedition</span>
            </span>
            <span className="text-[9px] text-stone-400 font-mono">MAP: REGION 4</span>
          </div>

          {/* Minimap Box Graphic */}
          <div className="relative w-full h-24 bg-stone-900/90 rounded-lg border border-stone-800 overflow-hidden">
            {/* Topographic contours */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:8px_8px]" />
            <svg className="w-full h-full text-stone-700" viewBox="0 0 100 60">
              <path
                d="M 10 50 Q 30 20 60 40 T 90 25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="20" cy="45" r="3" fill="#b91c1c" />
              <circle cx="75" cy="30" r="3.5" fill="#d4af37" />
            </svg>
            {/* Marching Army Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-amber-500/20 border border-amber-400/60 px-1.5 py-0.5 rounded text-[9px] text-amber-200 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Vanguard Army</span>
            </div>
          </div>
        </div>

        {/* Current Objective Banner */}
        <div
          id="hud-campaign-objective"
          className="bg-stone-950/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-stone-800 shadow-2xl text-center max-w-md"
        >
          <div className="text-[10px] uppercase tracking-widest text-amber-400 font-sans font-bold flex items-center justify-center gap-1.5">
            <Flag className="w-3 h-3 text-red-500" />
            <span>Campaign Directive</span>
          </div>
          <div className="text-sm font-semibold text-stone-100 mt-0.5">
            Secure the Sacred Mountain Passes to Kanchi & Beyond
          </div>
          <div className="text-[11px] text-stone-400 font-sans mt-0.5">
            Royal Vanguard marching alongside the War Steed of Tanjore
          </div>
        </div>
      </div>
    </div>
  );
}
