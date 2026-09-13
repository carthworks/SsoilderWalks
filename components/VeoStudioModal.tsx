'use client';

import React, { useState, useRef } from 'react';
import {
  Film,
  Upload,
  Sparkles,
  X,
  Play,
  Pause,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Image as ImageIcon,
  Wand2,
  Layers,
} from 'lucide-react';

interface VeoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageBase64?: string | null;
  onApplyVideoToBackground?: (videoUrl: string) => void;
}

export default function VeoStudioModal({
  isOpen,
  onClose,
  initialImageBase64,
  onApplyVideoToBackground,
}: VeoStudioModalProps) {
  // Model and format settings
  const [model, setModel] = useState<string>('veo-3.1-fast-generate-preview');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(
    'Seamless endless loop of an ancient Tamil Chola warrior soldier walking side-by-side with a noble white war horse, carrying royal tiger banner along a misty mountain ridge at golden sunrise, epic historical strategy game background, continuous walking gait, smooth loop motion, 4k cinematic lighting.'
  );

  // Uploaded image
  const [imageBase64, setImageBase64] = useState<string | null>(initialImageBase64 || null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [imageFileName, setImageFileName] = useState<string | null>(
    initialImageBase64 ? 'Captured_Parallax_Frame.png' : null
  );

  // Pipeline execution state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generated Video Result
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // AI Prompt Refiner
  const [isRefining, setIsRefining] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const [prevInitial, setPrevInitial] = useState<string | null | undefined>(initialImageBase64);
  if (initialImageBase64 !== prevInitial) {
    setPrevInitial(initialImageBase64);
    if (initialImageBase64) {
      setImageBase64(initialImageBase64);
      setImageFileName('Captured_Parallax_Frame.png');
    }
  }

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    setImageFileName(file.name);
    setImageMimeType(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImageBase64(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const loadPreloadedCholaArtwork = async () => {
    try {
      const res = await fetch('/soliter-tamil.png');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setImageBase64(e.target.result);
          setImageFileName('soliter-tamil.png');
          setImageMimeType('image/png');
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load preset artwork:', err);
    }
  };

  // AI Prompt Refiner
  const handleRefinePrompt = async () => {
    try {
      setIsRefining(true);
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: prompt }),
      });
      const data = await res.json();
      if (data.refinedPrompt) {
        setPrompt(data.refinedPrompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  // 3-Step Veo Generation Execution
  const handleStartGeneration = async () => {
    setErrorMsg(null);
    setIsGenerating(true);
    setProgressPercent(5);
    setGenerationStep('Submitting video job to Veo 3.1 neural model...');

    try {
      // Step 1: Start Operation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBase64,
          imageMimeType,
          aspectRatio,
          model,
        }),
      });

      const startData = await startRes.json().catch(() => ({}));
      if (!startRes.ok || startData.error) {
        setErrorMsg(startData.error || 'Failed to start video generation.');
        setIsGenerating(false);
        return;
      }

      const operationName = startData.operationName;
      if (!operationName) {
        setErrorMsg('No operation name returned from model service.');
        setIsGenerating(false);
        return;
      }

      setProgressPercent(15);
      setGenerationStep('Model queued: Synthesizing walking motion & background physics...');

      // Step 2: Poll operation status
      const reassuranceMessages = [
        'Veo is rendering character walking gait and camera tracking...',
        'Simulating flowing cape, banner cloth, and horse mane motion...',
        'Rendering mountain ridge parallax depth and golden sunrise mist...',
        'Finalizing temporal frame coherence and seamless looping...',
        'Encoding 720p cinematic MP4 stream...',
      ];

      let pollCount = 0;
      let isDone = false;

      while (!isDone) {
        await new Promise((resolve) => setTimeout(resolve, 6000));
        pollCount++;

        const msgIdx = Math.min(pollCount, reassuranceMessages.length - 1);
        setGenerationStep(reassuranceMessages[msgIdx]);
        setProgressPercent((prev) => Math.min(prev + 10, 90));

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const statusData = await statusRes.json().catch(() => ({}));
        if (!statusRes.ok || statusData.error) {
          setErrorMsg(statusData.error || 'Status check failed.');
          setIsGenerating(false);
          return;
        }

        if (statusData.done) {
          isDone = true;
        }
      }

      setProgressPercent(95);
      setGenerationStep('Video complete! Streaming download to player...');

      // Step 3: Download Video Stream
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        const errData = await downloadRes.json().catch(() => ({}));
        setErrorMsg(errData.error || 'Failed to download generated video.');
        setIsGenerating(false);
        return;
      }

      const videoBlob = await downloadRes.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoUrl);
      setProgressPercent(100);
      setGenerationStep('Video ready!');
    } catch (err: any) {
      console.error('Generation failure:', err);
      setErrorMsg(err?.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="veo-studio-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-xl animate-fade-in"
    >
      <div
        id="veo-studio-modal-window"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                Veo Video Generator Studio
                <span className="text-[11px] font-normal bg-amber-950/80 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-full font-mono">
                  {model}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Animate photos into seamless walking video loops for historical strategy games
              </p>
            </div>
          </div>

          <button
            id="btn-close-veo-modal"
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Row: Photo Input & Output Format Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Upload Photo */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Source Photo (Starting Frame)
                </span>
                {imageBase64 && (
                  <button
                    onClick={() => {
                      setImageBase64(null);
                      setImageFileName(null);
                    }}
                    className="text-[11px] text-red-400 hover:underline cursor-pointer lowercase"
                  >
                    Clear photo
                  </button>
                )}
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !imageBase64 && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl text-center transition cursor-pointer overflow-hidden min-h-[170px] ${
                  imageBase64
                    ? 'border-amber-500/40 bg-stone-950/60'
                    : 'border-stone-700 hover:border-amber-500/50 bg-stone-950/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f);
                  }}
                />

                {imageBase64 ? (
                  <div className="relative w-full h-36 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageBase64}
                      alt="Source Starting Frame"
                      className="max-h-full max-w-full rounded-lg object-contain shadow-md"
                    />
                    <div className="absolute bottom-1 right-2 bg-stone-950/80 px-2 py-0.5 rounded text-[10px] text-stone-300 backdrop-blur-sm">
                      {imageFileName || 'Image attached'}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <div className="p-3 bg-stone-800/80 rounded-2xl">
                      <Upload className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-stone-200">
                      Drag & drop a photo, or click to browse
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Upload warrior & horse artwork (PNG, JPG, WEBP)
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Preset Action */}
              <div className="flex items-center justify-between text-xs mt-1.5 px-0.5">
                <button
                  type="button"
                  onClick={loadPreloadedCholaArtwork}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Attached Artwork (soliter-tamil.png)</span>
                </button>
                {imageBase64 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-stone-400 hover:text-stone-200"
                  >
                    Change photo
                  </button>
                )}
              </div>
            </div>

            {/* Right: Aspect Ratio & Model Parameters */}
            <div className="flex flex-col gap-4">
              {/* Aspect Ratio Selector (16:9 or 9:16 per specification) */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 block mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-aspect-16-9"
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      aspectRatio === '16:9'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">16:9 Landscape</div>
                      <div className="text-[10px] text-stone-400">Strategy Game / Video BG</div>
                    </div>
                    <div className="w-6 h-3.5 border-2 border-current rounded-sm" />
                  </button>

                  <button
                    id="btn-aspect-9-16"
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      aspectRatio === '9:16'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">9:16 Portrait</div>
                      <div className="text-[10px] text-stone-400">Mobile / Shorts / Reels</div>
                    </div>
                    <div className="w-3.5 h-6 border-2 border-current rounded-sm" />
                  </button>
                </div>
              </div>

              {/* Model Choice */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 block mb-2">
                  Veo Generation Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 outline-none"
                >
                  <option value="veo-3.1-fast-generate-preview">
                    veo-3.1-fast-generate-preview (Recommended Fast)
                  </option>
                  <option value="veo-3.1-generate-preview">
                    veo-3.1-generate-preview (High-Quality Cinematic)
                  </option>
                  <option value="veo-3.1-lite-generate-preview">
                    veo-3.1-lite-generate-preview (General Video)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Cinematic Motion & Scene Prompt
              </label>
              <button
                type="button"
                onClick={handleRefinePrompt}
                disabled={isRefining}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>{isRefining ? 'Refining...' : 'Refine with Gemini AI'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the walking loop, lighting, and camera motion..."
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:border-amber-500/60 outline-none resize-none leading-relaxed"
            />

            {/* Prompt presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] text-stone-500 self-center">Presets:</span>
              {[
                {
                  label: 'Sunrise Golden Pass',
                  text: 'Seamless slow-motion loop of ancient Tamil warrior walking beside noble white horse with tiger standard banner along golden mountain ridge, mist in valley, strategy game art.',
                },
                {
                  label: 'Temple Fortress March',
                  text: 'Continuous side-scrolling tracking shot: Historical commander and armored war horse pacing steadily past ancient stone temples and roaring waterfalls at dawn.',
                },
                {
                  label: 'Moonlit Calm Expedition',
                  text: 'Atmospheric serene night walk: Soldier leading majestic white stallion across a starry mountain pass, silver moonlight glinting on armor and waterfall mist, peaceful loop.',
                },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p.text)}
                  className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-[10px] text-stone-300 hover:text-amber-300 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress / Status / Error Banner */}
          {isGenerating && (
            <div className="bg-stone-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  {generationStep}
                </span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Veo models perform deep temporal synthesis to generate fluid walking loops. This usually takes ~1-2 minutes.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-3 bg-red-950/60 border border-red-500/50 rounded-2xl p-4 text-xs text-red-200 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="font-semibold text-red-300">Veo Generation Notice</div>
                <div className="text-red-200/90 leading-relaxed">{errorMsg}</div>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-bold rounded-xl text-xs transition shadow-md"
                  >
                    🚶‍♂️ Switch to Free In-Browser 3D Walking Rig
                  </button>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs transition"
                  >
                    Upgrade Google AI Studio Billing ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* GENERATED VIDEO PLAYER */}
          {generatedVideoUrl && (
            <div className="bg-stone-950 border border-emerald-500/30 rounded-3xl p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Veo Video Generated Successfully!
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      isLooping
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'border-stone-800 text-stone-400'
                    }`}
                  >
                    Endless Loop: {isLooping ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Video Player Container */}
              <div
                className={`relative mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl border border-stone-800 ${
                  aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'w-full aspect-video'
                }`}
              >
                <video
                  ref={videoPlayerRef}
                  src={generatedVideoUrl}
                  autoPlay
                  playsInline
                  loop={isLooping}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Actions: Download & Apply as background */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={generatedVideoUrl}
                    download="historical-soldier-horse-walking-loop.mp4"
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-stone-700"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download MP4</span>
                  </a>

                  {onApplyVideoToBackground && (
                    <button
                      onClick={() => onApplyVideoToBackground(generatedVideoUrl)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-semibold transition shadow-lg flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Set as Active Background</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-stone-500">
                  Ready to combine with your calm soundtrack for the perfect video.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
          >
            Close
          </button>

          <button
            id="btn-generate-veo-video"
            disabled={isGenerating}
            onClick={handleStartGeneration}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-2xl transition shadow-xl flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating with Veo 3.1...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Generate Video with Veo ({model})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
