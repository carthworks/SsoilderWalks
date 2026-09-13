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
  Layers,
  Box,
  Footprints,
} from 'lucide-react';
import { calmAudio } from '@/lib/audio-engine';

export type TimeOfDay = 'dawn' | 'noon' | 'sunset' | 'night';
export type WeatherType = 'golden-dust' | 'mist' | 'rain' | 'none';

interface ThreeMultiLayerStageProps {
  onCaptureFrameForVeo?: (dataUrl: string) => void;
  onOpenVeoStudio?: () => void;
  showHud: boolean;
  onToggleHud: () => void;
  showControls?: boolean;
}

export default function ThreeMultiLayerStage({
  onCaptureFrameForVeo,
  onOpenVeoStudio,
  showHud,
  onToggleHud,
  showControls = false,
}: ThreeMultiLayerStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stage controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('dawn');
  const [weather, setWeather] = useState<WeatherType>('golden-dust');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Simulation ref
  const simRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    ambientLight?: THREE.AmbientLight;
    sunLight?: THREE.DirectionalLight;
    pointLight?: THREE.PointLight;
    godRays?: THREE.Mesh;
    soldierMesh?: THREE.Mesh;
    horseMesh?: THREE.Mesh;
    flagMesh?: THREE.Mesh;
    groundMesh?: THREE.Mesh;
    mountainFarMesh?: THREE.Mesh;
    mountainMidMesh?: THREE.Mesh;
    waterfallMesh?: THREE.Mesh;
    foregroundRocksMesh?: THREE.Mesh;
    particles?: THREE.Points;
    fogParticles?: THREE.Points;
    rainParticles?: THREE.Points;
    eagleMesh?: THREE.Group;
    animFrameId?: number;
    mouseX: number;
    mouseY: number;
    targetMouseX: number;
    targetMouseY: number;
    speed: number;
    isPlaying: boolean;
    timeOfDay: TimeOfDay;
    weather: WeatherType;
    scrollDistance: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    speed: 1.0,
    isPlaying: true,
    timeOfDay: 'dawn',
    weather: 'golden-dust',
    scrollDistance: 0,
  });

  useEffect(() => {
    simRef.current.speed = speed;
    simRef.current.isPlaying = isPlaying;
    simRef.current.timeOfDay = timeOfDay;
    simRef.current.weather = weather;
  }, [speed, isPlaying, timeOfDay, weather]);

  // Main Three.js Setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene & 3D Depth Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1c1917, 0.0006);
    simRef.current.scene = scene;

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);
    simRef.current.camera = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    simRef.current.renderer = renderer;

    const textureLoader = new THREE.TextureLoader();

    // 1. Background Landscape Panoramic Mesh (Z = -16)
    const bgTex = textureLoader.load('/landscape-bg.jpg');
    bgTex.colorSpace = THREE.SRGBColorSpace;
    bgTex.wrapS = THREE.RepeatWrapping;
    bgTex.wrapT = THREE.ClampToEdgeWrapping;
    bgTex.minFilter = THREE.LinearFilter;
    bgTex.magFilter = THREE.LinearFilter;

    const bgGeo = new THREE.PlaneGeometry(58, 32.5, 32, 32);
    const bgMat = new THREE.MeshStandardMaterial({
      map: bgTex,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 2.0, -16);
    scene.add(bgMesh);
    simRef.current.mountainFarMesh = bgMesh;

    // Helper to slice sub-regions from the atlas image with clean black background chroma-keying
    const extractSubTextureFromAtlas = (
      img: HTMLImageElement,
      sx: number,
      sy: number,
      sw: number,
      sh: number
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      const pw = Math.max(1, Math.round(sw * img.naturalWidth));
      const ph = Math.max(1, Math.round(sh * img.naturalHeight));
      canvas.width = pw;
      canvas.height = ph;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.clearRect(0, 0, pw, ph);
        ctx.drawImage(
          img,
          Math.round(sx * img.naturalWidth),
          Math.round(sy * img.naturalHeight),
          pw,
          ph,
          0,
          0,
          pw,
          ph
        );

        // Alpha key out pure black background from sprite atlas
        const imgData = ctx.getImageData(0, 0, pw, ph);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxVal = Math.max(r, g, b);
          if (maxVal < 14) {
            data[i + 3] = 0;
          } else if (maxVal < 28) {
            data[i + 3] = Math.round(((maxVal - 14) / 14) * 255);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    const buildLayerMesh = (
      texture: THREE.Texture,
      w: number,
      h: number,
      segX: number = 16,
      segY: number = 16
    ) => {
      const geo = new THREE.PlaneGeometry(w, h, segX, segY);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.55,
        metalness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      return new THREE.Mesh(geo, mat);
    };

    // Load Atlas Image to carve out the horse, flag, ground, and rocks in 3D
    const atlasImg = new Image();
    atlasImg.crossOrigin = 'anonymous';
    atlasImg.src = '/all-aparted.png';

    atlasImg.onload = () => {
      // 2. LAYER -2.2: Royal White War Stallion (center horse region)
      const horseTex = extractSubTextureFromAtlas(atlasImg, 0.32, 0.28, 0.53, 0.50);
      const horseMesh = buildLayerMesh(horseTex, 11, 8.5);
      horseMesh.position.set(3.2, -2.1, -2.2);
      scene.add(horseMesh);
      simRef.current.horseMesh = horseMesh;

      // 6. LAYER -0.6: Royal Tiger Standard Flag Banner (top-right banner)
      const flagTex = extractSubTextureFromAtlas(atlasImg, 0.78, 0.0, 0.215, 0.53);
      const flagMesh = buildLayerMesh(flagTex, 5.2, 9.0, 24, 24);
      flagMesh.position.set(5.8, -0.2, -0.6);
      scene.add(flagMesh);
      simRef.current.flagMesh = flagMesh;

      // 7. LAYER 2.6: Cobblestone Path Ground Strip (Positioned lower along bottom baseline)
      const groundTex = extractSubTextureFromAtlas(atlasImg, 0.0, 0.785, 0.57, 0.095);
      groundTex.wrapS = THREE.RepeatWrapping;
      groundTex.wrapT = THREE.ClampToEdgeWrapping;
      groundTex.repeat.set(3.0, 1);
      const groundMesh = buildLayerMesh(groundTex, 48, 5.0);
      groundMesh.position.set(0, -6.8, 2.6);
      groundMesh.rotation.x = -Math.PI / 14;
      scene.add(groundMesh);
      simRef.current.groundMesh = groundMesh;

      // 8. LAYER 4.4: Foreground Boulders & Foliage (Positioned lower along bottom right corner)
      const fgRocksTex = extractSubTextureFromAtlas(atlasImg, 0.58, 0.765, 0.41, 0.235);
      const fgRocksMesh = buildLayerMesh(fgRocksTex, 15, 4.8);
      fgRocksMesh.position.set(5.2, -6.4, 4.4);
      scene.add(fgRocksMesh);
      simRef.current.foregroundRocksMesh = fgRocksMesh;
    };

    // 9. LAYER 1.8: THE ONLY HERO CHOLA SOLDIER (Foreground Walking Prince grounded on path)
    const soldierTex = textureLoader.load('/all-aparted-person.png');
    soldierTex.colorSpace = THREE.SRGBColorSpace;
    soldierTex.minFilter = THREE.LinearFilter;
    soldierTex.magFilter = THREE.LinearFilter;

    const soldierGeo = new THREE.PlaneGeometry(8.0, 10.2, 32, 32);
    const soldierMat = new THREE.MeshStandardMaterial({
      map: soldierTex,
      transparent: true,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const soldierMesh = new THREE.Mesh(soldierGeo, soldierMat);
    soldierMesh.position.set(-2.0, -2.6, 1.8);
    scene.add(soldierMesh);
    simRef.current.soldierMesh = soldierMesh;

    // 10. 3D Natural Lighting Setup (Soft volumetric sunlight without harsh circular masks)
    const ambientLight = new THREE.AmbientLight(0xfff0db, 1.45);
    scene.add(ambientLight);
    simRef.current.ambientLight = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xffdd88, 2.6);
    sunLight.position.set(-9, 7, 8);
    scene.add(sunLight);
    simRef.current.sunLight = sunLight;

    const pointLight = new THREE.PointLight(0xff9933, 1.2, 40);
    pointLight.position.set(-7, 5, 4);
    scene.add(pointLight);
    simRef.current.pointLight = pointLight;

    // 12. 3D GPU Particle Systems (Golden Dust Motes)
    const pCount = 260;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 36;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 16 + 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const g = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255, 245, 200, 1.0)');
      g.addColorStop(0.4, 'rgba(251, 191, 36, 0.8)');
      g.addColorStop(1, 'rgba(251, 191, 36, 0)');
      pCtx.fillStyle = g;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const pTex = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.4,
      map: pTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    simRef.current.particles = particles;

    // 13. 3D Soaring Eagle
    const eagleGroup = new THREE.Group();
    const wingGeo = new THREE.BufferGeometry();
    const wingVerts = new Float32Array([
      -1.3, 0, 0,
      0, 0, 0.35,
      0, 0, -0.35,
      1.3, 0, 0,
      0, 0, -0.35,
      0, 0, 0.35,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVerts, 3));
    const eagleMat = new THREE.MeshBasicMaterial({
      color: 0x18181b,
      side: THREE.DoubleSide,
    });
    const eagleMesh = new THREE.Mesh(wingGeo, eagleMat);
    eagleGroup.add(eagleMesh);
    eagleGroup.position.set(-18, 5.5, -2);
    scene.add(eagleGroup);
    simRef.current.eagleMesh = eagleGroup;

    // 14. Resize Handling
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 15. Mouse / Gyro 3D Perspective Tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      simRef.current.targetMouseX = x * 2.2;
      simRef.current.targetMouseY = y * 1.5;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 16. Main 60fps WebGL Animation Loop
    let clock = new THREE.Clock();
    let lastStepTime = 0;

    const animate = () => {
      const dt = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const curSpeed = simRef.current.speed;
      const isPlay = simRef.current.isPlaying;
      const t = simRef.current.timeOfDay;
      const w = simRef.current.weather;

      if (isPlay) {
        simRef.current.scrollDistance += dt * 1.8 * curSpeed;
      }
      const scroll = simRef.current.scrollDistance;

      // Smooth Camera Damping Parallax
      simRef.current.mouseX += (simRef.current.targetMouseX - simRef.current.mouseX) * 0.05;
      simRef.current.mouseY += (simRef.current.targetMouseY - simRef.current.mouseY) * 0.05;

      const breatheZoom = Math.sin(elapsedTime * 0.35) * 0.4;
      const walkPan = isPlay ? Math.sin(elapsedTime * 0.25 * curSpeed) * 0.6 : 0;

      camera.position.x = simRef.current.mouseX * 1.3 + walkPan;
      camera.position.y = simRef.current.mouseY * 0.95;
      camera.position.z = 16 + breatheZoom;
      camera.lookAt(walkPan * 0.3, 0, 0);

      // ===============================================
      // REAL BIOMECHANICAL WALKING KINEMATICS FOR THE ONLY HERO SOLDIER
      // ===============================================
      const currentSoldier = simRef.current.soldierMesh;
      if (currentSoldier) {
        const pace = elapsedTime * 4.2 * curSpeed;
        if (isPlay) {
          // Double-frequency vertical stepping bounce (heel strike & push-off)
          const verticalBob = Math.abs(Math.sin(pace)) * 0.22;
          // Stride sway and forward lunging pendulum
          const strideTiltZ = Math.sin(pace) * 0.045;
          const strideTiltX = Math.cos(pace) * 0.035;

          currentSoldier.position.y = -2.6 + verticalBob;
          currentSoldier.position.x = -2.0 + Math.sin(pace * 0.5) * 0.12;
          currentSoldier.rotation.z = strideTiltZ;
          currentSoldier.rotation.x = strideTiltX;

          // Flowing cape & silk sash cloth wave deformation in 3D
          const pos = currentSoldier.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vy = pos.getY(i);
            // Wave cape edges trailing behind
            if (vx < 0.2) {
              const wave = Math.sin(elapsedTime * 6.5 + vy * 3.2) * (0.14 - vx * 0.05);
              pos.setZ(i, wave);
            }
          }
          currentSoldier.geometry.attributes.position.needsUpdate = true;
        }
      }

      // ===============================================
      // ROYAL WHITE WAR STALLION TROTTING
      // ===============================================
      const currentHorse = simRef.current.horseMesh;
      if (currentHorse) {
        const horsePace = elapsedTime * 4.2 * curSpeed + Math.PI * 0.3;
        if (isPlay) {
          const horseBob = Math.abs(Math.sin(horsePace * 2)) * 0.16;
          const horseTilt = Math.sin(horsePace) * 0.03;
          currentHorse.position.y = -2.1 + horseBob;
          currentHorse.position.x = 3.2 + Math.sin(horsePace * 0.5) * 0.1;
          currentHorse.rotation.z = horseTilt;
        }
      }

      // ===============================================
      // ROYAL TIGER STANDARD FLAG WAVING IN BREEZE
      // ===============================================
      const currentFlag = simRef.current.flagMesh;
      if (currentFlag && isPlay) {
        const pos = currentFlag.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          // Wave flag silk in wind
          const wave = Math.sin(elapsedTime * 5.0 + vx * 2.0 + vy * 1.5) * 0.22 * (vx + 2.4);
          pos.setZ(i, wave);
        }
        currentFlag.geometry.attributes.position.needsUpdate = true;
      }

      // ===============================================
      // MILD SEAMLESS 3D SCENE LOOP & SERENE BACKGROUND PAN
      // ===============================================
      const bg = simRef.current.mountainFarMesh;
      if (bg) {
        const bgMat = bg.material as THREE.MeshStandardMaterial;
        if (bgMat && bgMat.map) {
          // Ultra-slow serene panoramic drift loop for the entire landscape
          bgMat.map.offset.x = (scroll * 0.003) % 1;
        }
        bg.position.y = 2.0 + Math.sin(elapsedTime * 0.3) * 0.05;
      }

      const ground = simRef.current.groundMesh;
      if (ground) {
        const groundMat = ground.material as THREE.MeshStandardMaterial;
        if (groundMat && groundMat.map) {
          // Slow, smooth, and seamless ground texture scroll
          groundMat.map.offset.x = (scroll * 0.08) % 1;
        }
      }

      const fgRocks = simRef.current.foregroundRocksMesh;
      if (fgRocks) {
        // Gentle foreground rocks drift
        fgRocks.position.x = -((scroll * 0.25) % 24) + 5.2;
      }

      // Audio footstep & hoofbeat synchronization
      const now = performance.now();
      if (isPlay && now - lastStepTime > 340 / curSpeed) {
        lastStepTime = now;
        const phase = Math.floor(elapsedTime * 4.0 * curSpeed) % 4;
        if (phase === 0 || phase === 2) {
          calmAudio.triggerStep('soldier', 0.8);
        } else {
          calmAudio.triggerStep('horse', 0.7);
        }
      }

      // Dynamic Time of Day Lighting
      if (ambientLight && sunLight && pointLight) {
        if (t === 'dawn') {
          ambientLight.color.setHex(0xffecd1);
          ambientLight.intensity = 1.35;
          sunLight.color.setHex(0xfbbf24);
          sunLight.intensity = 2.6;
          pointLight.color.setHex(0xf97316);
          pointLight.intensity = 2.0;
          renderer.toneMappingExposure = 1.1;
        } else if (t === 'noon') {
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 1.6;
          sunLight.color.setHex(0xfffaed);
          sunLight.intensity = 2.9;
          pointLight.intensity = 0.6;
          renderer.toneMappingExposure = 1.18;
        } else if (t === 'sunset') {
          ambientLight.color.setHex(0xff9966);
          ambientLight.intensity = 1.15;
          sunLight.color.setHex(0xe11d48);
          sunLight.intensity = 2.7;
          pointLight.color.setHex(0xd97706);
          pointLight.intensity = 2.6;
          renderer.toneMappingExposure = 1.02;
        } else {
          // Night
          ambientLight.color.setHex(0x38bdf8);
          ambientLight.intensity = 0.5;
          sunLight.color.setHex(0x93c5fd);
          sunLight.intensity = 0.9;
          pointLight.color.setHex(0x60a5fa);
          pointLight.intensity = 0.7;
          renderer.toneMappingExposure = 0.78;
        }
      }

      // Floating dust particles
      if (particles) {
        particles.visible = w === 'golden-dust';
        if (particles.visible && isPlay) {
          const pos = particles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < pCount; i++) {
            pos[i * 3] += Math.sin(elapsedTime * 0.6 + i) * 0.01 * curSpeed;
            pos[i * 3 + 1] += 0.015 * curSpeed;
            pos[i * 3 + 2] += Math.cos(elapsedTime * 0.4 + i) * 0.006;
            if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Soaring eagle
      if (eagleMesh && isPlay) {
        eagleMesh.position.x += 0.045 * curSpeed;
        eagleMesh.position.y = 5.2 + Math.sin(elapsedTime * 0.8) * 0.5;
        if (eagleMesh.position.x > 20) eagleMesh.position.x = -20;
        eagleMesh.rotation.z = Math.sin(elapsedTime * 0.8) * 0.12;
      }

      renderer.render(scene, camera);
      simRef.current.animFrameId = requestAnimationFrame(animate);
    };

    simRef.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      if (simRef.current.animFrameId) {
        cancelAnimationFrame(simRef.current.animFrameId);
      }
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, []);

  // Snapshot frame for Veo Studio
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
        a.download = `chola-soldier-walk-3d-loop-${timeOfDay}.webm`;
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
      id="three-multi-layer-stage-container"
      className="relative w-full aspect-video max-h-[78vh] overflow-hidden bg-stone-950 select-none group rounded-2xl cursor-grab active:cursor-grabbing"
    >
      <canvas
        ref={canvasRef}
        id="three-multi-layer-canvas"
        className="w-full h-full object-cover block"
      />

      {/* 3D Depth Indicator Badge (Hidden when showControls is false) */}
      {showControls && (
        <div className="absolute top-4 left-4 z-40 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2 shadow-xl pointer-events-none animate-fade-in">
          <Layers className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Three.js Multi-Layer 3D Walking Stage</span>
        </div>
      )}

      {/* FLOATING QUICK CONTROLS BAR (Bottom Center - Hidden when showControls is false) */}
      {showControls && (
        <div
          id="three-multi-interactive-toolbar"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-2 bg-stone-950/85 backdrop-blur-xl border border-stone-800/80 px-3.5 py-2 rounded-2xl shadow-2xl transition-all duration-300 opacity-95 group-hover:opacity-100 animate-fade-in"
        >
          {/* Play/Pause */}
          <button
            id="btn-three-multi-play"
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
              title="Dawn Golden Hour"
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
              title="High Noon Sunlight"
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

          {/* Atmosphere FX */}
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
              title="Mountain Valley Mist"
            >
              <Wind className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-stone-800 mx-0.5" />

          {/* Speed Slider */}
          <div className="flex items-center gap-1.5 text-stone-300 text-xs px-1">
            <span className="text-[11px] text-stone-400 font-mono">{speed.toFixed(1)}x</span>
            <input
              id="three-multi-slider-speed"
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
            id="btn-three-multi-snapshot"
            onClick={handleCaptureSnapshot}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 transition flex items-center gap-1 text-xs"
            title="Snapshot Current Frame for Veo 3.1 Video Generation"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Snapshot</span>
          </button>

          {/* Record WebM Video Loop */}
          <button
            id="btn-three-multi-record"
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
              id="btn-three-multi-open-veo"
              onClick={onOpenVeoStudio}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold transition flex items-center gap-1.5 text-xs shadow-lg"
              title="Generate Video with Veo AI"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Veo AI</span>
            </button>
          )}

          {/* Fullscreen */}
          <button
            id="btn-three-multi-fullscreen"
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
