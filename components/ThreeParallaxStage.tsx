'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
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
  Box,
  Layers,
  Sparkle,
  Footprints,
} from 'lucide-react';
import { calmAudio } from '@/lib/audio-engine';
import { createCholaWarriorAndHorseRig, WalkingRigInstances } from './three-walking-rig';

export type ThreeTimeOfDay = 'dawn' | 'noon' | 'sunset' | 'night';
export type ThreeWeather = 'none' | 'golden-dust' | 'mist' | 'rain';

interface ThreeParallaxStageProps {
  onCaptureFrameForVeo?: (dataUrl: string) => void;
  onOpenVeoStudio?: () => void;
  showHud: boolean;
  onToggleHud: () => void;
  showControls?: boolean;
}

export default function ThreeParallaxStage({
  onCaptureFrameForVeo,
  onOpenVeoStudio,
  showHud,
  onToggleHud,
  showControls = false,
}: ThreeParallaxStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // User interactive state
  const [walkingMode, setWalkingMode] = useState<'3d-rig' | 'artwork'>('3d-rig');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [timeOfDay, setTimeOfDay] = useState<ThreeTimeOfDay>('dawn');
  const [weather, setWeather] = useState<ThreeWeather>('golden-dust');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [enable3DMouse, setEnable3DMouse] = useState<boolean>(true);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Three.js instances ref
  const threeRefs = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    artMesh?: THREE.Mesh;
    godRaysMesh?: THREE.Mesh;
    particles?: THREE.Points;
    fogParticles?: THREE.Points;
    rainParticles?: THREE.Points;
    eagleMesh?: THREE.Group;
    ambientLight?: THREE.AmbientLight;
    sunLight?: THREE.DirectionalLight;
    pointLight?: THREE.PointLight;
    animFrameId?: number;
    mouseX: number;
    mouseY: number;
    targetMouseX: number;
    targetMouseY: number;
    speed: number;
    isPlaying: boolean;
    timeOfDay: ThreeTimeOfDay;
    weather: ThreeWeather;
    walkingMode: '3d-rig' | 'artwork';
    walkingRig?: WalkingRigInstances;
  }>({
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    speed: 1.0,
    isPlaying: true,
    timeOfDay: 'dawn',
    weather: 'golden-dust',
    walkingMode: '3d-rig',
  });

  // Keep ref synchronized
  useEffect(() => {
    threeRefs.current.speed = speed;
    threeRefs.current.isPlaying = isPlaying;
    threeRefs.current.timeOfDay = timeOfDay;
    threeRefs.current.weather = weather;
    threeRefs.current.walkingMode = walkingMode;
  }, [speed, isPlaying, timeOfDay, weather, walkingMode]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1c1917, 0.0008);
    threeRefs.current.scene = scene;

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);
    threeRefs.current.camera = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true, // Required for screenshot & video recording
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    threeRefs.current.renderer = renderer;

    // 3. Procedural 3D Articulated Walking Rig (Warrior & War Stallion)
    const walkingRig = createCholaWarriorAndHorseRig();
    scene.add(walkingRig.group);
    threeRefs.current.walkingRig = walkingRig;

    // 4. Texture Loader & Main Artwork Quad (Background depth plane)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/soliter-tamil.png', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // 16:9 Aspect ratio plane placed in background
      const planeGeo = new THREE.PlaneGeometry(28.44, 16, 64, 64);

      // Add gentle depth curve for 3D panoramic immersion
      const pos = planeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Subtle concave parabolic curve for 2.5D depth curvature
        const z = -Math.pow(x / 14, 2) * 0.85;
        pos.setZ(i, z);
      }
      planeGeo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.position.set(0, 0, -2);
      scene.add(mesh);
      threeRefs.current.artMesh = mesh;
    });

    // 4. Volumetric God-Rays & Celestial Flare
    const godRayGeo = new THREE.ConeGeometry(8, 28, 32, 1, true);
    godRayGeo.rotateX(Math.PI / 2);
    const godRayMat = new THREE.MeshBasicMaterial({
      color: 0xffe89e,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const godRaysMesh = new THREE.Mesh(godRayGeo, godRayMat);
    godRaysMesh.position.set(-6.5, 3.8, 1);
    godRaysMesh.rotation.set(0.2, 0.4, -0.6);
    scene.add(godRaysMesh);
    threeRefs.current.godRaysMesh = godRaysMesh;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff3d6, 1.2);
    scene.add(ambientLight);
    threeRefs.current.ambientLight = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xffdd88, 2.2);
    sunLight.position.set(-8, 6, 10);
    scene.add(sunLight);
    threeRefs.current.sunLight = sunLight;

    const pointLight = new THREE.PointLight(0xff9933, 1.5, 30);
    pointLight.position.set(-6, 3.5, 3);
    scene.add(pointLight);
    threeRefs.current.pointLight = pointLight;

    // 6. GPU Particle Systems (Golden Dust Motes)
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 32;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 12 + 4;
      particleScales[i] = Math.random() * 0.25 + 0.08;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    // Particle Canvas Texture for soft glowing discs
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 245, 200, 1.0)');
      grad.addColorStop(0.4, 'rgba(251, 191, 36, 0.7)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      map: pTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    threeRefs.current.particles = particles;

    // 7. Valley Mist Points (Volumetric Fog)
    const fogCount = 70;
    const fogGeo = new THREE.BufferGeometry();
    const fogPos = new Float32Array(fogCount * 3);
    for (let i = 0; i < fogCount; i++) {
      fogPos[i * 3] = (Math.random() - 0.5) * 30;
      fogPos[i * 3 + 1] = (Math.random() - 0.5) * 8 - 2;
      fogPos[i * 3 + 2] = (Math.random() - 0.5) * 8 + 2;
    }
    fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));

    const fCanvas = document.createElement('canvas');
    fCanvas.width = 128;
    fCanvas.height = 128;
    const fCtx = fCanvas.getContext('2d');
    if (fCtx) {
      const fGrad = fCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      fGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      fGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.06)');
      fGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      fCtx.fillStyle = fGrad;
      fCtx.fillRect(0, 0, 128, 128);
    }
    const fTexture = new THREE.CanvasTexture(fCanvas);

    const fogMat = new THREE.PointsMaterial({
      size: 4.5,
      map: fTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const fogParticles = new THREE.Points(fogGeo, fogMat);
    scene.add(fogParticles);
    threeRefs.current.fogParticles = fogParticles;

    // 8. 3D Soaring Eagle Mesh
    const eagleGroup = new THREE.Group();
    const wingGeo = new THREE.BufferGeometry();
    const wingVerts = new Float32Array([
      -1.2, 0, 0,
      0, 0, 0.3,
      0, 0, -0.3,
      1.2, 0, 0,
      0, 0, -0.3,
      0, 0, 0.3,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVerts, 3));
    const eagleMat = new THREE.MeshBasicMaterial({
      color: 0x1c1917,
      side: THREE.DoubleSide,
    });
    const eagleMesh = new THREE.Mesh(wingGeo, eagleMat);
    eagleGroup.add(eagleMesh);
    eagleGroup.position.set(-15, 5, 2);
    scene.add(eagleGroup);
    threeRefs.current.eagleMesh = eagleGroup;

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Mouse / Gyro Parallax Tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      threeRefs.current.targetMouseX = x * 1.8;
      threeRefs.current.targetMouseY = y * 1.2;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 11. Main 60fps WebGL Animation Loop
    let clock = new THREE.Clock();
    let lastStepTime = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const currentSpeed = threeRefs.current.speed;
      const isPlay = threeRefs.current.isPlaying;
      const t = threeRefs.current.timeOfDay;
      const w = threeRefs.current.weather;

      // Smooth Camera Parallax (Damping interpolation)
      threeRefs.current.mouseX += (threeRefs.current.targetMouseX - threeRefs.current.mouseX) * 0.05;
      threeRefs.current.mouseY += (threeRefs.current.targetMouseY - threeRefs.current.mouseY) * 0.05;

      const breatheZoom = Math.sin(elapsedTime * 0.4) * 0.35;
      const walkBob = isPlay ? Math.sin(elapsedTime * 4.5 * currentSpeed) * 0.12 : 0;
      const walkPan = isPlay ? Math.sin(elapsedTime * 0.35 * currentSpeed) * 0.5 : 0;

      camera.position.x = threeRefs.current.mouseX * 1.2 + walkPan;
      camera.position.y = threeRefs.current.mouseY * 0.9 + walkBob;
      camera.position.z = 18 + breatheZoom;
      camera.lookAt(walkPan * 0.4, walkBob * 0.2, 0);

      // Trigger audio footstep & hoof sync
      const now = performance.now();
      if (isPlay && now - lastStepTime > 360 / currentSpeed) {
        lastStepTime = now;
        const phase = Math.floor(elapsedTime * 3.5 * currentSpeed) % 4;
        if (phase === 0 || phase === 2) {
          calmAudio.triggerStep('horse', 0.85);
        } else {
          calmAudio.triggerStep('soldier', 0.65);
        }
      }

      // Dynamic Time of Day Lighting Updates in Three.js
      if (ambientLight && sunLight && pointLight && godRaysMesh) {
        if (t === 'dawn') {
          ambientLight.color.setHex(0xffecd1);
          ambientLight.intensity = 1.3;
          sunLight.color.setHex(0xfbbf24);
          sunLight.intensity = 2.4;
          sunLight.position.set(-8, 5, 10);
          pointLight.color.setHex(0xf97316);
          pointLight.intensity = 1.8;
          godRaysMesh.visible = true;
          (godRaysMesh.material as THREE.MeshBasicMaterial).opacity = 0.22;
          renderer.toneMappingExposure = 1.1;
        } else if (t === 'noon') {
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 1.5;
          sunLight.color.setHex(0xfffaed);
          sunLight.intensity = 2.8;
          sunLight.position.set(0, 10, 10);
          pointLight.intensity = 0.5;
          godRaysMesh.visible = false;
          renderer.toneMappingExposure = 1.15;
        } else if (t === 'sunset') {
          ambientLight.color.setHex(0xff9966);
          ambientLight.intensity = 1.1;
          sunLight.color.setHex(0xe11d48);
          sunLight.intensity = 2.6;
          sunLight.position.set(-10, 3, 10);
          pointLight.color.setHex(0xd97706);
          pointLight.intensity = 2.5;
          godRaysMesh.visible = true;
          (godRaysMesh.material as THREE.MeshBasicMaterial).opacity = 0.32;
          renderer.toneMappingExposure = 1.0;
        } else {
          // Night
          ambientLight.color.setHex(0x38bdf8);
          ambientLight.intensity = 0.45;
          sunLight.color.setHex(0x93c5fd);
          sunLight.intensity = 0.8;
          sunLight.position.set(-6, 8, 10);
          pointLight.color.setHex(0x60a5fa);
          pointLight.intensity = 0.6;
          godRaysMesh.visible = false;
          renderer.toneMappingExposure = 0.75;
        }
      }

      // God rays rotation drift
      if (godRaysMesh && isPlay) {
        godRaysMesh.rotation.z = -0.6 + Math.sin(elapsedTime * 0.2) * 0.05;
      }

      // Particle Simulation
      if (particles) {
        particles.visible = w === 'golden-dust';
        if (particles.visible && isPlay) {
          const positions = particles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += Math.sin(elapsedTime * 0.5 + i) * 0.008 * currentSpeed;
            positions[i * 3 + 1] += 0.012 * currentSpeed;
            positions[i * 3 + 2] += Math.cos(elapsedTime * 0.3 + i) * 0.005;

            // Loop bounds
            if (positions[i * 3 + 1] > 9) positions[i * 3 + 1] = -9;
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Valley Mist Simulation
      if (fogParticles) {
        fogParticles.visible = w === 'mist' || t === 'dawn';
        if (fogParticles.visible && isPlay) {
          const fPositions = fogParticles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < fogCount; i++) {
            fPositions[i * 3] += 0.015 * currentSpeed;
            if (fPositions[i * 3] > 16) fPositions[i * 3] = -16;
          }
          fogParticles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Eagle flight
      if (eagleMesh && isPlay) {
        eagleMesh.position.x += 0.04 * currentSpeed;
        eagleMesh.position.y = 4.8 + Math.sin(elapsedTime * 0.8) * 0.5;
        if (eagleMesh.position.x > 18) {
          eagleMesh.position.x = -18;
        }
        eagleMesh.rotation.z = Math.sin(elapsedTime * 0.8) * 0.1;
      }

      // Update Procedural 3D Articulated Walking Rig
      if (walkingRig) {
        walkingRig.group.visible = threeRefs.current.walkingMode === '3d-rig';
        if (walkingRig.group.visible) {
          walkingRig.update(elapsedTime, currentSpeed, isPlay);
        }
      }

      renderer.render(scene, camera);
      threeRefs.current.animFrameId = requestAnimationFrame(animate);
    };

    threeRefs.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      if (threeRefs.current.animFrameId) {
        cancelAnimationFrame(threeRefs.current.animFrameId);
      }
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, []);

  // Snapshot WebGL canvas for Veo AI Video Generation
  const handleCaptureSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onCaptureFrameForVeo) {
      onCaptureFrameForVeo(dataUrl);
    }
  }, [onCaptureFrameForVeo]);

  // Video recording
  const startRecordingLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
        videoBitsPerSecond: 8000000,
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
        a.download = `chola-warrior-threejs-loop-${timeOfDay}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Three.js canvas capture failed:', err);
    }
  };

  const stopRecordingLoop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

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
      id="three-stage-container"
      className="relative w-full aspect-video max-h-[78vh] overflow-hidden bg-stone-950 select-none group rounded-2xl cursor-grab active:cursor-grabbing"
    >
      <canvas
        ref={canvasRef}
        id="three-webgl-canvas"
        className="w-full h-full object-cover block"
      />

      {/* 3D Depth Indicator Badge (Hidden when showControls is false) */}
      {showControls && (
        <div className="absolute top-4 left-4 z-40 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2 shadow-xl pointer-events-none animate-fade-in">
          <Box className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Three.js WebGL 3D Parallax Stage</span>
        </div>
      )}

      {/* FLOATING QUICK CONTROLS BAR (Bottom Center - Hidden when showControls is false) */}
      {showControls && (
        <div
          id="three-interactive-toolbar"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-2 bg-stone-950/85 backdrop-blur-xl border border-stone-800/80 px-3.5 py-2 rounded-2xl shadow-2xl transition-all duration-300 opacity-95 group-hover:opacity-100 animate-fade-in"
        >
          {/* Play/Pause */}
          <button
            id="btn-three-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold transition"
            title={isPlaying ? 'Pause 3D Stage' : 'Play 3D Stage'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* 3D Walking Mode Switcher */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
            <button
              id="btn-three-mode-rig"
              onClick={() => setWalkingMode('3d-rig')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                walkingMode === '3d-rig'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="3D Articulated Walking Rig (Active moving legs, trotting hooves, cape flow)"
            >
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">3D Walking Rig</span>
            </button>

            <button
              id="btn-three-mode-artwork"
              onClick={() => setWalkingMode('artwork')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                walkingMode === 'artwork'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Cinematic Artwork Background Plate"
            >
              <span className="hidden sm:inline">Artwork Plate</span>
            </button>
          </div>

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
              title="Dawn / Golden Hour (Volumetric God Rays)"
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

          {/* 3D Atmosphere FX */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setWeather('golden-dust')}
              className={`p-1.5 rounded-lg transition ${
                weather === 'golden-dust'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="3D Glowing Golden Dust Motes"
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
              title="Volumetric Valley Mist"
            >
              <Wind className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-stone-800 mx-0.5" />

          {/* Speed Slider */}
          <div className="flex items-center gap-1.5 text-stone-300 text-xs px-1">
            <span className="text-[11px] text-stone-400 font-mono">{speed.toFixed(1)}x</span>
            <input
              id="three-slider-speed"
              type="range"
              min="0.4"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              title="Pace Speed"
            />
          </div>

          <div className="w-px h-5 bg-stone-800 mx-0.5" />

          {/* Snapshot for Veo Studio */}
          <button
            id="btn-three-snapshot"
            onClick={handleCaptureSnapshot}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 transition flex items-center gap-1 text-xs"
            title="Snapshot 3D Stage for Veo 3.1 Video Generation"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Snapshot</span>
          </button>

          {/* Record WebM Video Loop directly */}
          <button
            id="btn-three-record"
            onClick={isRecording ? stopRecordingLoop : startRecordingLoop}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
              isRecording
                ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record 60fps 3D WebGL Loop'}
          >
            <Video className={`w-3.5 h-3.5 ${isRecording ? 'text-red-400' : 'text-amber-400'}`} />
            <span>{isRecording ? `REC ${recordingSeconds}s` : 'Record'}</span>
          </button>

          {/* Open Veo Studio Drawer */}
          {onOpenVeoStudio && (
            <button
              id="btn-three-open-veo"
              onClick={onOpenVeoStudio}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold transition flex items-center gap-1.5 text-xs shadow-lg"
              title="Generate Video with Veo AI (Upload photo or use 3D canvas)"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Veo AI</span>
            </button>
          )}

          {/* Fullscreen */}
          <button
            id="btn-three-fullscreen"
            onClick={toggleFullscreen}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}
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
