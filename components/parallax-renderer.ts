// Canvas 2D Rendering Engine for Historical Strategy Walking Parallax

export type TimeOfDay = 'dawn' | 'noon' | 'sunset' | 'night';
export type WeatherEffect = 'none' | 'golden-dust' | 'mist' | 'leaves' | 'rain';

export interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  angle: number;
  rotSpeed: number;
}

/**
 * Photorealistic Stage Renderer with Cinematic Lighting & Particle FX
 */
export function drawRealisticArtworkStage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  w: number,
  h: number,
  t: TimeOfDay,
  time: number,
  speed: number,
  isPlaying: boolean,
  weather: WeatherEffect,
  particles: Particle[],
  eagleX: number,
  eagleY: number
) {
  if (!img || !img.complete || img.naturalWidth === 0) {
    // Fallback loading placeholder if image is still loading
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Loading High-Definition Chola Warrior Artwork...', w / 2, h / 2);
    return;
  }

  ctx.save();

  // 1. Cinematic Camera Pan & Subtle Walking Cadence Drift
  const zoom = 1.05 + Math.sin(time * 0.0005) * 0.02;
  const panX = isPlaying ? Math.sin(time * 0.0003 * speed) * 35 : 0;
  const panY = isPlaying ? Math.cos(time * 0.0004 * speed) * 12 : 0;
  const walkBob = isPlaying ? Math.sin(time * 0.0045 * speed) * 4 : 0;

  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2 + panX, -h / 2 + panY + walkBob);

  // Draw base high-resolution image
  ctx.drawImage(img, 0, 0, w, h);

  ctx.restore();

  // 2. Dynamic Time-of-Day Lighting Shaders
  ctx.save();
  const sunX = w * 0.22 + panX * 0.5;
  const sunY = h * 0.24 + panY * 0.5;

  if (t === 'dawn') {
    // Warm morning golden rays from the rising sun behind the peaks
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 700);
    sunGrad.addColorStop(0, 'rgba(255, 240, 180, 0.45)');
    sunGrad.addColorStop(0.35, 'rgba(251, 191, 36, 0.22)');
    sunGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.12)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle volumetric god-rays
    const rayCount = 8;
    for (let r = 0; r < rayCount; r++) {
      const rayAngle = ((r / rayCount) * Math.PI * 0.6) - 0.2 + Math.sin(time * 0.0008 + r) * 0.05;
      const rayLen = 900;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(
        sunX + Math.cos(rayAngle - 0.08) * rayLen,
        sunY + Math.sin(rayAngle - 0.08) * rayLen
      );
      ctx.lineTo(
        sunX + Math.cos(rayAngle + 0.08) * rayLen,
        sunY + Math.sin(rayAngle + 0.08) * rayLen
      );
      ctx.closePath();
      const rayGrad = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, rayLen);
      rayGrad.addColorStop(0, 'rgba(255, 245, 200, 0.18)');
      rayGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.05)');
      rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = rayGrad;
      ctx.fill();
    }
  } else if (t === 'noon') {
    // Clear crisp high-noon ambience
    const noonGrad = ctx.createLinearGradient(0, 0, 0, h);
    noonGrad.addColorStop(0, 'rgba(186, 230, 253, 0.12)');
    noonGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.08)');
    noonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = noonGrad;
    ctx.fillRect(0, 0, w, h);
  } else if (t === 'sunset') {
    // Intense crimson & amber sunset glow
    const sunsetGrad = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 800);
    sunsetGrad.addColorStop(0, 'rgba(255, 180, 100, 0.5)');
    sunsetGrad.addColorStop(0.3, 'rgba(244, 63, 94, 0.3)');
    sunsetGrad.addColorStop(0.7, 'rgba(190, 24, 93, 0.2)');
    sunsetGrad.addColorStop(1, 'rgba(40, 10, 30, 0.35)');
    ctx.globalCompositeOperation = 'color-burn';
    ctx.fillStyle = sunsetGrad;
    ctx.fillRect(0, 0, w, h);

    // Warm highlights overlay
    ctx.globalCompositeOperation = 'screen';
    const sunsetLight = ctx.createLinearGradient(0, 0, w, h);
    sunsetLight.addColorStop(0, 'rgba(251, 146, 60, 0.25)');
    sunsetLight.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
    ctx.fillStyle = sunsetLight;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Mystical Midnight Chola Moonlight Filter
    ctx.globalCompositeOperation = 'multiply';
    const nightTone = ctx.createLinearGradient(0, 0, 0, h);
    nightTone.addColorStop(0, '#0f172a');
    nightTone.addColorStop(0.5, '#1e293b');
    nightTone.addColorStop(1, '#090d16');
    ctx.fillStyle = nightTone;
    ctx.fillRect(0, 0, w, h);

    // Soft silver moonlight highlight
    ctx.globalCompositeOperation = 'screen';
    const moonGrad = ctx.createRadialGradient(w * 0.25, h * 0.2, 10, w * 0.25, h * 0.2, 500);
    moonGrad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
    moonGrad.addColorStop(0.5, 'rgba(147, 197, 253, 0.15)');
    moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGrad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling stars in the night sky region
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 197.3) % (w * 0.85)) + w * 0.05;
      const sy = ((i * 73.7) % (h * 0.38));
      const starBlink = Math.sin(time * 0.003 + i * 2) * 0.4 + 0.6;
      ctx.globalAlpha = starBlink;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 4 === 0 ? 1.8 : 1.1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();

  // 3. Dynamic Soaring Mountain Eagle
  ctx.save();
  const egX = ((eagleX % (w + 400)) + (w + 400)) % (w + 400) - 200;
  const egY = eagleY;
  const flap = Math.sin(time * 0.006) * 6;
  ctx.fillStyle = t === 'night' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(30, 20, 10, 0.85)';
  ctx.beginPath();
  ctx.moveTo(egX, egY);
  ctx.quadraticCurveTo(egX - 12, egY - 10 + flap, egX - 25, egY - 6 + flap);
  ctx.quadraticCurveTo(egX - 14, egY + 2, egX, egY + 3);
  ctx.quadraticCurveTo(egX + 14, egY + 2, egX + 25, egY - 6 + flap);
  ctx.quadraticCurveTo(egX + 12, egY - 10 + flap, egX, egY);
  ctx.fill();
  ctx.restore();

  // 4. Atmospheric Weather Simulation (Particles, Golden Dust, Mist, Rain)
  ctx.save();
  if (weather === 'golden-dust' || weather === 'mist' || weather === 'rain') {
    particles.forEach((p) => {
      // Update particle position
      if (isPlaying) {
        p.x += p.speedX * speed;
        p.y += p.speedY * speed;
        p.angle += p.rotSpeed;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      if (weather === 'golden-dust') {
        // Glowing gold/amber light particles
        const glowColor =
          t === 'night'
            ? 'rgba(190, 220, 255, '
            : t === 'sunset'
            ? 'rgba(251, 146, 60, '
            : 'rgba(253, 224, 71, ';
        const pulse = Math.sin(time * 0.004 + p.angle) * 0.3 + 0.7;
        ctx.fillStyle = glowColor + (p.opacity * pulse) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (weather === 'mist') {
        // Soft rolling mist clouds
        const mistGrad = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, p.size * 50);
        mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
        mistGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.04)');
        mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 50, 0, Math.PI * 2);
        ctx.fill();
      } else if (weather === 'rain') {
        // Slanted rainfall streaks
        ctx.strokeStyle = t === 'night' ? 'rgba(186, 230, 253, 0.35)' : 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 14, p.y + 26);
        ctx.stroke();
      }
    });
  }
  ctx.restore();

  // 5. Cinematic Edge Vignette
  ctx.save();
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.65);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.25)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}


export function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: TimeOfDay,
  time: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
  if (t === 'dawn') {
    grad.addColorStop(0, '#2d1832');
    grad.addColorStop(0.3, '#5c2c3e');
    grad.addColorStop(0.55, '#c85e43');
    grad.addColorStop(0.8, '#f39c5b');
    grad.addColorStop(1, '#ffdf9e');
  } else if (t === 'noon') {
    grad.addColorStop(0, '#1c528e');
    grad.addColorStop(0.4, '#3978b5');
    grad.addColorStop(0.7, '#6ca5d8');
    grad.addColorStop(1, '#e3f1ff');
  } else if (t === 'sunset') {
    grad.addColorStop(0, '#1d1030');
    grad.addColorStop(0.3, '#4d1e42');
    grad.addColorStop(0.6, '#a43444');
    grad.addColorStop(0.85, '#e56336');
    grad.addColorStop(1, '#ffb852');
  } else {
    // night
    grad.addColorStop(0, '#060a16');
    grad.addColorStop(0.4, '#0d1527');
    grad.addColorStop(0.8, '#14223d');
    grad.addColorStop(1, '#233857');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars at night
  if (t === 'night') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137.5) % w);
      const sy = ((i * 83.1) % (h * 0.5));
      const blink = Math.sin(time * 0.003 + i) * 0.3 + 0.7;
      ctx.globalAlpha = blink;
      ctx.fillRect(sx, sy, (i % 3 === 0 ? 2 : 1.2), (i % 3 === 0 ? 2 : 1.2));
    }
    ctx.globalAlpha = 1.0;
  }

  // Distant soft clouds
  ctx.save();
  for (let c = 0; c < 4; c++) {
    const cloudX = ((time * 0.015 * (c + 1) + c * 500) % (w + 600)) - 300;
    const cloudY = 70 + c * 45;
    const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 10, cloudX, cloudY, 240);
    const color =
      t === 'dawn'
        ? 'rgba(255, 190, 150, '
        : t === 'sunset'
        ? 'rgba(255, 140, 110, '
        : t === 'night'
        ? 'rgba(70, 90, 130, '
        : 'rgba(255, 255, 255, ';
    cloudGrad.addColorStop(0, color + '0.35)');
    cloudGrad.addColorStop(0.6, color + '0.15)');
    cloudGrad.addColorStop(1, color + '0)');
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, 220, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCelestial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: TimeOfDay,
  time: number,
  eagleX: number,
  eagleY: number
) {
  ctx.save();
  const sunX = w * 0.28;
  const sunY = h * 0.26;

  if (t !== 'night') {
    // Glowing Sun
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 320);
    sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
    sunGrad.addColorStop(0.15, 'rgba(255, 230, 160, 0.7)');
    sunGrad.addColorStop(0.4, 'rgba(255, 180, 90, 0.3)');
    sunGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 320, 0, Math.PI * 2);
    ctx.fill();

    // Atmospheric God Rays / Sunbeams
    ctx.save();
    ctx.translate(sunX, sunY);
    const rayCount = 14;
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 2 + Math.sin(time * 0.0004) * 0.05;
      ctx.rotate(angle);
      const rayGrad = ctx.createLinearGradient(0, 0, 800, 0);
      rayGrad.addColorStop(0, 'rgba(255, 245, 210, 0.12)');
      rayGrad.addColorStop(0.7, 'rgba(255, 210, 140, 0.03)');
      rayGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(800, -80);
      ctx.lineTo(800, 80);
      ctx.lineTo(0, 18);
      ctx.fill();
      ctx.rotate(-angle);
    }
    ctx.restore();
  } else {
    // Moon & Moon Halo
    const moonX = w * 0.78;
    const moonY = h * 0.2;
    const moonHalo = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 140);
    moonHalo.addColorStop(0, 'rgba(240, 248, 255, 0.9)');
    moonHalo.addColorStop(0.25, 'rgba(200, 220, 255, 0.4)');
    moonHalo.addColorStop(1, 'rgba(150, 190, 255, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
    ctx.fill();

    // Moon disc
    ctx.fillStyle = '#f8fbff';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soaring Royal Eagle
  const wingFlap = Math.sin(time * 0.006) * 8;

  ctx.fillStyle = t === 'night' ? 'rgba(10, 15, 25, 0.8)' : 'rgba(45, 30, 25, 0.85)';
  ctx.beginPath();
  // Body
  ctx.ellipse(eagleX, eagleY, 7, 3, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Left Wing
  ctx.beginPath();
  ctx.moveTo(eagleX - 2, eagleY);
  ctx.quadraticCurveTo(eagleX - 12, eagleY - 10 + wingFlap, eagleX - 24, eagleY - 4 + wingFlap * 0.8);
  ctx.quadraticCurveTo(eagleX - 10, eagleY - 2, eagleX - 2, eagleY + 2);
  ctx.fill();
  // Right Wing
  ctx.beginPath();
  ctx.moveTo(eagleX + 2, eagleY);
  ctx.quadraticCurveTo(eagleX + 12, eagleY - 10 - wingFlap, eagleX + 24, eagleY - 4 - wingFlap * 0.8);
  ctx.quadraticCurveTo(eagleX + 10, eagleY - 2, eagleX + 2, eagleY + 2);
  ctx.fill();

  ctx.restore();
}

export function drawDistantMountains(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  t: TimeOfDay
) {
  ctx.save();
  const peakColor =
    t === 'dawn'
      ? '#643949'
      : t === 'sunset'
      ? '#572739'
      : t === 'night'
      ? '#131e33'
      : '#476587';

  ctx.fillStyle = peakColor;
  ctx.beginPath();
  ctx.moveTo(0, h);

  const step = 80;
  const count = Math.ceil(w / step) + 4;
  const baseOffset = offset % (step * 8);

  for (let i = -2; i <= count; i++) {
    const x = i * step - baseOffset;
    const seed = Math.sin((i + Math.floor(offset / (step * 8))) * 4.31);
    const seed2 = Math.cos((i + Math.floor(offset / (step * 8))) * 2.17);
    const peakH = h * 0.38 + seed * 90 + seed2 * 40;
    ctx.lineTo(x, peakH);
  }
  ctx.lineTo(w + 50, h);
  ctx.closePath();
  ctx.fill();

  // Snow caps & light highlights on peaks
  ctx.fillStyle =
    t === 'dawn'
      ? 'rgba(255, 215, 180, 0.45)'
      : t === 'sunset'
      ? 'rgba(255, 180, 140, 0.4)'
      : t === 'night'
      ? 'rgba(180, 210, 255, 0.15)'
      : 'rgba(255, 255, 255, 0.55)';

  for (let i = -2; i <= count; i += 2) {
    const x = i * step - baseOffset;
    const seed = Math.sin((i + Math.floor(offset / (step * 8))) * 4.31);
    const seed2 = Math.cos((i + Math.floor(offset / (step * 8))) * 2.17);
    const peakH = h * 0.38 + seed * 90 + seed2 * 40;

    ctx.beginPath();
    ctx.moveTo(x, peakH);
    ctx.lineTo(x - 22, peakH + 36);
    ctx.lineTo(x + 18, peakH + 42);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function drawAncientEmpireFortress(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  t: TimeOfDay,
  flagPhase: number
) {
  ctx.save();
  const fortBaseY = h * 0.52;
  const fortColor =
    t === 'dawn'
      ? '#57333a'
      : t === 'sunset'
      ? '#4a2530'
      : t === 'night'
      ? '#182740'
      : '#394f66';

  const mistColor =
    t === 'dawn'
      ? 'rgba(240, 195, 160, 0.32)'
      : t === 'sunset'
      ? 'rgba(230, 140, 120, 0.28)'
      : t === 'night'
      ? 'rgba(30, 48, 75, 0.35)'
      : 'rgba(215, 235, 255, 0.3)';

  // Rolling mountain plateau
  ctx.fillStyle = fortColor;
  ctx.beginPath();
  ctx.moveTo(0, h);

  const step = 140;
  const count = Math.ceil(w / step) + 3;
  const baseOffset = offset % (step * 10);

  for (let i = -1; i <= count; i++) {
    const x = i * step - baseOffset;
    const noise = Math.sin((i + Math.floor(offset / (step * 10))) * 3.7) * 45;
    ctx.lineTo(x, fortBaseY + noise);
  }
  ctx.lineTo(w + 50, h);
  ctx.closePath();
  ctx.fill();

  // Ancient Chola Gopuram Temple Spoilers & Fortress Spires
  for (let i = -1; i <= count; i += 3) {
    const x = i * step - baseOffset + 60;
    const noise = Math.sin((i + Math.floor(offset / (step * 10))) * 3.7) * 45;
    const templeY = fortBaseY + noise;

    const tw = 48;
    const th = 68;

    ctx.fillStyle = fortColor;
    ctx.fillRect(x - tw / 2, templeY - 20, tw, 22);
    ctx.fillRect(x - tw * 0.4, templeY - 40, tw * 0.8, 20);
    ctx.fillRect(x - tw * 0.28, templeY - 56, tw * 0.56, 16);
    ctx.beginPath();
    ctx.moveTo(x, templeY - th - 12);
    ctx.lineTo(x - 7, templeY - 56);
    ctx.lineTo(x + 7, templeY - 56);
    ctx.closePath();
    ctx.fill();

    // Fluttering Temple Flag
    const flagWave = Math.sin(flagPhase + i * 1.5) * 6;
    ctx.fillStyle = '#b92828';
    ctx.beginPath();
    ctx.moveTo(x, templeY - th - 12);
    ctx.lineTo(x + 22 + flagWave, templeY - th - 7);
    ctx.lineTo(x, templeY - th - 2);
    ctx.closePath();
    ctx.fill();
  }

  // Valley Mist Ribbon
  ctx.fillStyle = mistColor;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, fortBaseY + 30, w * 0.7, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawWaterfallsAndGorge(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  t: TimeOfDay,
  waterfallPhase: number
) {
  ctx.save();
  const gorgeBaseY = h * 0.62;
  const gorgeColor =
    t === 'dawn'
      ? '#3b282c'
      : t === 'sunset'
      ? '#331d25'
      : t === 'night'
      ? '#132034'
      : '#2d3d4b';

  ctx.fillStyle = gorgeColor;
  ctx.beginPath();
  ctx.moveTo(0, h);

  const step = 200;
  const count = Math.ceil(w / step) + 3;
  const baseOffset = offset % (step * 8);

  for (let i = -1; i <= count; i++) {
    const x = i * step - baseOffset;
    const noise = Math.sin((i + Math.floor(offset / (step * 8))) * 2.9) * 55;
    ctx.lineTo(x, gorgeBaseY + noise);
  }
  ctx.lineTo(w + 50, h);
  ctx.closePath();
  ctx.fill();

  // Cascading Waterfalls
  for (let i = 0; i <= count; i += 2) {
    const x = i * step - baseOffset + 90;
    const noise = Math.sin((i + Math.floor(offset / (step * 8))) * 2.9) * 55;
    const wy = gorgeBaseY + noise;

    ctx.fillStyle =
      t === 'night'
        ? 'rgba(170, 200, 240, 0.65)'
        : 'rgba(255, 255, 255, 0.85)';

    const streamWidth = 18;
    const streamHeight = 110;

    ctx.beginPath();
    ctx.moveTo(x - streamWidth / 2, wy);
    const jitter = Math.sin(waterfallPhase + i) * 2;
    ctx.lineTo(x - streamWidth * 0.6 + jitter, wy + streamHeight);
    ctx.lineTo(x + streamWidth * 0.6 - jitter, wy + streamHeight);
    ctx.lineTo(x + streamWidth / 2, wy);
    ctx.closePath();
    ctx.fill();

    const mistRadius = 26 + Math.sin(waterfallPhase * 1.5) * 4;
    const sprayGrad = ctx.createRadialGradient(
      x,
      wy + streamHeight,
      5,
      x,
      wy + streamHeight,
      mistRadius
    );
    sprayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    sprayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sprayGrad;
    ctx.beginPath();
    ctx.arc(x, wy + streamHeight, mistRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawRidgeAndValley(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  t: TimeOfDay
) {
  ctx.save();
  const ridgeY = h * 0.72;
  const ridgeColor =
    t === 'dawn'
      ? '#281c20'
      : t === 'sunset'
      ? '#221419'
      : t === 'night'
      ? '#0e1828'
      : '#1c2833';

  ctx.fillStyle = ridgeColor;
  ctx.beginPath();
  ctx.moveTo(0, h);

  const step = 60;
  const count = Math.ceil(w / step) + 4;
  const baseOffset = offset % (step * 12);

  for (let i = -2; i <= count; i++) {
    const x = i * step - baseOffset;
    const treeJitter = Math.sin((i + Math.floor(offset / (step * 12))) * 1.8) * 28;
    const canopy = Math.cos(i * 1.1) * 12;
    ctx.lineTo(x, ridgeY + treeJitter + canopy);
  }
  ctx.lineTo(w + 50, h);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function drawPathAndMonolith(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  t: TimeOfDay
) {
  ctx.save();
  const pathY = h * 0.81;
  const pathColor =
    t === 'dawn'
      ? '#1b1418'
      : t === 'sunset'
      ? '#160e13'
      : t === 'night'
      ? '#0a101b'
      : '#131b22';

  ctx.fillStyle = pathColor;
  ctx.beginPath();
  ctx.moveTo(0, h);

  const step = 40;
  const count = Math.ceil(w / step) + 4;
  const baseOffset = offset % (step * 14);

  for (let i = -2; i <= count; i++) {
    const x = i * step - baseOffset;
    const rockNoise = Math.sin((i + Math.floor(offset / (step * 14))) * 0.8) * 12;
    ctx.lineTo(x, pathY + rockNoise);
  }
  ctx.lineTo(w + 50, h);
  ctx.closePath();
  ctx.fill();

  // Cobblestones
  ctx.fillStyle =
    t === 'dawn'
      ? 'rgba(215, 175, 140, 0.22)'
      : t === 'sunset'
      ? 'rgba(195, 135, 110, 0.2)'
      : t === 'night'
      ? 'rgba(100, 140, 190, 0.12)'
      : 'rgba(180, 200, 215, 0.25)';

  for (let i = -2; i <= count; i += 2) {
    const x = i * step - baseOffset;
    const rockNoise = Math.sin((i + Math.floor(offset / (step * 14))) * 0.8) * 12;
    ctx.beginPath();
    ctx.ellipse(x + 15, pathY + rockNoise + 14, 18, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tamil Inscribed Stone Monolith
  const monolithCycle = 1800;
  const monolithOffset = offset % monolithCycle;
  const monoX = w * 0.18 - (monolithOffset % (w + 400));
  const monoY = pathY - 30;

  if (monoX > -150 && monoX < w + 150) {
    ctx.fillStyle =
      t === 'dawn'
        ? '#241a20'
        : t === 'sunset'
        ? '#20151b'
        : t === 'night'
        ? '#0c1320'
        : '#1a2430';

    ctx.beginPath();
    ctx.moveTo(monoX - 45, monoY + 95);
    ctx.lineTo(monoX - 35, monoY - 20);
    ctx.lineTo(monoX + 5, monoY - 45);
    ctx.lineTo(monoX + 42, monoY - 25);
    ctx.lineTo(monoX + 52, monoY + 95);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle =
      t === 'dawn'
        ? 'rgba(255, 200, 150, 0.35)'
        : t === 'sunset'
        ? 'rgba(255, 160, 120, 0.3)'
        : 'rgba(200, 220, 255, 0.2)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle =
      t === 'dawn'
        ? '#f3cf8c'
        : t === 'sunset'
        ? '#e9b56f'
        : t === 'night'
        ? '#9ab3d4'
        : '#ffe2a3';

    ctx.font = 'bold 13px serif';
    ctx.textAlign = 'center';
    ctx.fillText('வீரம்', monoX, monoY - 8);
    ctx.fillText('அறிவு', monoX, monoY + 14);
    ctx.fillText('நாட்டுக்காக', monoX, monoY + 36);

    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(monoX, monoY + 54, 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSoldierAndHorse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  walk: number,
  flagPhase: number,
  t: TimeOfDay
) {
  ctx.save();
  const baseY = h * 0.81;
  const horseX = w * 0.65;
  const warriorX = w * 0.42;

  // Horse shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(horseX, baseY + 20, 120, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Warrior shadow
  ctx.beginPath();
  ctx.ellipse(warriorX, baseY + 18, 55, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw horse
  drawWhiteHorse(ctx, horseX, baseY, walk, flagPhase, t);

  // Draw warrior
  drawWarriorSoldier(ctx, warriorX, baseY, walk, flagPhase, t);

  // Reins
  drawReins(ctx, warriorX, baseY, horseX, baseY, walk);

  ctx.restore();
}

function drawWhiteHorse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  walk: number,
  flagPhase: number,
  t: TimeOfDay
) {
  ctx.save();
  const rHindPhase = walk;
  const rForePhase = walk + Math.PI * 0.5;
  const lHindPhase = walk + Math.PI;
  const lForePhase = walk + Math.PI * 1.5;

  const horseBob = Math.sin(walk * 2) * 5;
  const horsePitch = Math.cos(walk * 2) * 0.02;
  const horseY = y - 110 + horseBob;

  const horseBodyColor = t === 'night' ? '#c5d2e0' : '#f9f9fa';
  const horseShadowColor = t === 'night' ? '#92a3b8' : '#d2d6dc';
  const goldAccent = '#d4af37';
  const royalCrimson = '#8f1d24';

  // Far legs
  drawHorseLeg(ctx, x - 75, horseY + 40, lHindPhase, true, horseShadowColor);
  drawHorseLeg(ctx, x + 65, horseY + 40, lForePhase, false, horseShadowColor);

  // Tail
  ctx.save();
  ctx.translate(x - 90, horseY + 10);
  const tailSway = Math.sin(walk * 1.2) * 12 + Math.cos(flagPhase) * 6;
  ctx.fillStyle = horseBodyColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-25, 20, -40 + tailSway, 65, -30 + tailSway * 1.5, 115);
  ctx.bezierCurveTo(-15 + tailSway, 105, -10, 50, 5, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Torso
  ctx.save();
  ctx.translate(x, horseY);
  ctx.rotate(horsePitch);

  ctx.fillStyle = horseBodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 20, 82, 44, 0.02, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-65, 10, 38, 40, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(55, 15, 36, 42, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Saddle blanket
  ctx.fillStyle = royalCrimson;
  ctx.beginPath();
  ctx.roundRect(-42, -5, 78, 52, 6);
  ctx.fill();
  ctx.strokeStyle = goldAccent;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Gold Tiger crest
  ctx.fillStyle = goldAccent;
  ctx.beginPath();
  ctx.arc(-3, 20, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = royalCrimson;
  ctx.beginPath();
  ctx.arc(-3, 20, 8, 0, Math.PI * 2);
  ctx.fill();

  // Saddle leather
  ctx.fillStyle = '#4a2511';
  ctx.beginPath();
  ctx.moveTo(-32, -8);
  ctx.quadraticCurveTo(-5, -2, 22, -8);
  ctx.lineTo(26, 4);
  ctx.lineTo(-36, 4);
  ctx.closePath();
  ctx.fill();

  // Stirrup
  ctx.strokeStyle = '#2b1509';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.lineTo(-3, 44);
  ctx.stroke();
  ctx.strokeStyle = goldAccent;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-8, 44, 10, 10);

  // Neck & Head
  const neckBob = Math.sin(walk * 2 + 0.5) * 4;
  ctx.fillStyle = horseBodyColor;
  ctx.beginPath();
  ctx.moveTo(40, -5);
  ctx.quadraticCurveTo(65, -45 + neckBob, 85, -65 + neckBob);
  ctx.lineTo(105, -78 + neckBob);
  ctx.lineTo(125, -60 + neckBob);
  ctx.lineTo(112, -40 + neckBob);
  ctx.quadraticCurveTo(85, -15, 62, 22);
  ctx.closePath();
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(98, -78 + neckBob);
  ctx.lineTo(104, -96 + neckBob);
  ctx.lineTo(108, -78 + neckBob);
  ctx.closePath();
  ctx.fill();

  // Mane
  const maneWave = Math.sin(walk * 3) * 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(48, -10);
  ctx.bezierCurveTo(35 - maneWave, -30, 50 - maneWave * 1.5, -60, 95, -78 + neckBob);
  ctx.bezierCurveTo(75, -50, 65, -25, 48, -10);
  ctx.fill();

  // Bridle
  ctx.strokeStyle = '#681c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(102, -76 + neckBob);
  ctx.lineTo(116, -55 + neckBob);
  ctx.lineTo(122, -62 + neckBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(114, -58 + neckBob);
  ctx.lineTo(123, -54 + neckBob);
  ctx.stroke();

  ctx.fillStyle = goldAccent;
  ctx.beginPath();
  ctx.arc(115, -56 + neckBob, 5, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#1c1717';
  ctx.beginPath();
  ctx.arc(104, -62 + neckBob, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Near legs
  drawHorseLeg(ctx, x - 55, horseY + 40, rHindPhase, true, horseBodyColor);
  drawHorseLeg(ctx, x + 45, horseY + 40, rForePhase, false, horseBodyColor);

  ctx.restore();
}

function drawHorseLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  phase: number,
  isHind: boolean,
  color: string
) {
  ctx.save();
  const cycle = phase % (Math.PI * 2);
  const isContact = cycle < Math.PI;

  let hipAngle = Math.sin(phase) * 0.35;
  let kneeAngle = 0;
  let fetlockAngle = 0;

  if (isHind) {
    hipAngle = Math.sin(phase) * 0.32;
    kneeAngle = !isContact ? Math.sin(phase) * 0.55 : -0.05;
    fetlockAngle = isContact ? 0.15 : -0.2;
  } else {
    hipAngle = Math.sin(phase) * 0.38;
    kneeAngle = !isContact ? -Math.sin(phase) * 0.7 : 0.05;
    fetlockAngle = isContact ? -0.1 : 0.25;
  }

  ctx.translate(hipX, hipY);
  ctx.rotate(hipAngle);

  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  const upperLen = 42;
  ctx.lineTo(0, upperLen);
  ctx.stroke();

  ctx.save();
  ctx.translate(0, upperLen);
  ctx.rotate(kneeAngle);
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const lowerLen = 38;
  ctx.lineTo(0, lowerLen);
  ctx.stroke();

  ctx.translate(0, lowerLen);
  ctx.rotate(fetlockAngle);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#221915';
  ctx.beginPath();
  ctx.moveTo(-5, 4);
  ctx.lineTo(7, 4);
  ctx.lineTo(9, 15);
  ctx.lineTo(-7, 15);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawWarriorSoldier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  walk: number,
  flagPhase: number,
  t: TimeOfDay
) {
  ctx.save();
  const walkCycle = walk;
  const bob = Math.sin(walkCycle * 2) * 4;
  const soldierY = y - 95 + bob;

  const skinTone = '#9c6644';
  const armorGold = '#c9933b';
  const silkRed = '#b91c1c';
  const dhotiWhite = '#f4ede2';

  // Cape
  ctx.save();
  ctx.translate(x - 6, soldierY - 30);
  const capeFlutter = Math.sin(flagPhase * 1.2) * 14 + Math.cos(walkCycle) * 8;
  ctx.fillStyle = silkRed;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-35, 10, -65 + capeFlutter, 45, -75 + capeFlutter * 1.4, 92);
  ctx.bezierCurveTo(-50 + capeFlutter, 86, -30, 48, -4, 25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = armorGold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Far leg
  drawSoldierLeg(ctx, x - 8, soldierY + 28, walkCycle + Math.PI, '#805335');

  // Torso
  ctx.save();
  ctx.translate(x, soldierY);

  const dhotiWave = Math.sin(walkCycle) * 6;
  ctx.fillStyle = dhotiWhite;
  ctx.beginPath();
  ctx.moveTo(-16, 20);
  ctx.lineTo(16, 20);
  ctx.lineTo(18 + dhotiWave, 62);
  ctx.lineTo(-14 + dhotiWave, 62);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = armorGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14 + dhotiWave, 59);
  ctx.lineTo(18 + dhotiWave, 59);
  ctx.stroke();

  ctx.fillStyle = silkRed;
  ctx.fillRect(-16, 16, 32, 8);

  ctx.fillStyle = armorGold;
  ctx.beginPath();
  ctx.roundRect(-15, -24, 30, 42, 6);
  ctx.fill();

  ctx.strokeStyle = '#7c541b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-6, -10, 6, 0, Math.PI);
  ctx.arc(6, -10, 6, 0, Math.PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-16, -22, 7, 10, -0.2, 0, Math.PI * 2);
  ctx.ellipse(16, -22, 7, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Swords
  ctx.save();
  ctx.translate(-4, 18);
  ctx.rotate(-0.55);
  ctx.fillStyle = '#3a1f10';
  ctx.fillRect(0, 0, 75, 7);
  ctx.fillStyle = armorGold;
  ctx.fillRect(70, -1, 8, 9);
  ctx.fillRect(-18, -2, 18, 11);
  ctx.restore();

  // Head & Hair
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(2, -38, 11, 14, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a110b';
  ctx.beginPath();
  ctx.ellipse(8, -34, 5, 7, 0.4, 0, Math.PI * 2);
  ctx.fill();

  const hairSway = Math.sin(flagPhase * 1.5) * 5;
  ctx.fillStyle = '#140c07';
  ctx.beginPath();
  ctx.arc(-6, -42, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-7, -36);
  ctx.quadraticCurveTo(-22, -30 + hairSway, -32, -18 + hairSway * 1.5);
  ctx.lineTo(-24, -14);
  ctx.lineTo(-6, -30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = armorGold;
  ctx.fillRect(-6, -46, 18, 5);

  ctx.restore();

  // Near leg
  drawSoldierLeg(ctx, x + 6, soldierY + 28, walkCycle, skinTone);

  // Tiger Flag Banner
  drawCholaBanner(ctx, x - 18, soldierY - 10, flagPhase);

  ctx.restore();
}

function drawSoldierLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  phase: number,
  skinColor: string
) {
  ctx.save();
  const hipAngle = Math.sin(phase) * 0.45;
  const kneeAngle = Math.sin(phase) > 0 ? Math.sin(phase) * 0.65 : 0.05;

  ctx.translate(hipX, hipY);
  ctx.rotate(hipAngle);

  ctx.strokeStyle = skinColor;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 32);
  ctx.stroke();

  ctx.translate(0, 32);
  ctx.rotate(kneeAngle);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 30);
  ctx.stroke();

  ctx.fillStyle = '#4a2b16';
  ctx.beginPath();
  ctx.roundRect(-4, 28, 18, 7, 2);
  ctx.fill();

  ctx.strokeStyle = '#2b170c';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(4, 28);
  ctx.stroke();

  ctx.restore();
}

function drawCholaBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  phase: number
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = '#5a381e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 80);
  ctx.lineTo(0, -135);
  ctx.stroke();

  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.moveTo(0, -155);
  ctx.lineTo(-7, -133);
  ctx.lineTo(7, -133);
  ctx.closePath();
  ctx.fill();

  const wave1 = Math.sin(phase) * 12;
  const wave2 = Math.cos(phase * 1.3) * 16;

  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(0, -132);
  ctx.bezierCurveTo(-25, -132 + wave1, -55, -130 + wave2, -95, -125 + wave1);
  ctx.lineTo(-95, -50 + wave2);
  ctx.bezierCurveTo(-55, -52 + wave1, -25, -55 + wave2, 0, -60);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#f3cf8c';
  ctx.beginPath();
  ctx.arc(-45, -92 + wave1 * 0.5, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1c1717';
  ctx.beginPath();
  ctx.arc(-42, -92 + wave1 * 0.5, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawReins(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  hx: number,
  hy: number,
  walk: number
) {
  ctx.save();
  const handX = wx + 18;
  const handY = wy - 100 + Math.sin(walk * 2) * 3;
  const bitX = hx + 115;
  const bitY = hy - 165 + Math.sin(walk * 2 + 0.5) * 4;

  ctx.strokeStyle = '#5a2d1d';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.quadraticCurveTo((handX + bitX) / 2, Math.max(handY, bitY) + 28, bitX, bitY);
  ctx.stroke();
  ctx.restore();
}

export function drawAtmosphericWeather(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fx: WeatherEffect,
  t: TimeOfDay,
  particles: Particle[]
) {
  ctx.save();

  particles.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.angle += p.rotSpeed;

    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    if (fx === 'golden-dust') {
      const moteColor =
        t === 'night'
          ? 'rgba(160, 210, 255, '
          : t === 'sunset'
          ? 'rgba(255, 175, 90, '
          : 'rgba(255, 225, 140, ';
      ctx.fillStyle = moteColor + p.opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx === 'leaves') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle =
        p.size > 3
          ? 'rgba(180, 85, 35, 0.75)'
          : 'rgba(215, 145, 45, 0.7)';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 2.2, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (fx === 'mist') {
      const mistGrad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.size * 25);
      mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 25, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx === 'rain') {
      ctx.strokeStyle = 'rgba(200, 225, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 4, p.y + 16);
      ctx.stroke();
    }
  });

  ctx.restore();
}

export function drawForegroundElements(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  t: TimeOfDay
) {
  ctx.save();
  ctx.fillStyle =
    t === 'night'
      ? '#050912'
      : t === 'dawn'
      ? '#130d12'
      : '#0d131a';

  // Top-left banyan branch
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.28, 0);
  ctx.bezierCurveTo(w * 0.22, 60, w * 0.12, 110, 0, 140);
  ctx.closePath();
  ctx.fill();

  // Hanging vines
  for (let i = 0; i < 5; i++) {
    const vx = 40 + i * 48;
    const vy = 50 + Math.sin(i * 1.5) * 30;
    const vLen = 65 + (i % 3) * 35;
    ctx.strokeStyle = '#0a080a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.quadraticCurveTo(vx - 8, vy + vLen * 0.5, vx + 4, vy + vLen);
    ctx.stroke();
  }

  // Bottom-right boulder
  ctx.beginPath();
  ctx.moveTo(w, h);
  ctx.lineTo(w * 0.82, h);
  ctx.quadraticCurveTo(w * 0.88, h - 85, w, h - 60);
  ctx.closePath();
  ctx.fill();

  // Vignette
  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.35,
    w / 2,
    h / 2,
    w * 0.75
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}
