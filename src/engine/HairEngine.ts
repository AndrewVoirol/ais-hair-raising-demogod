import type { HairSettings, FaceTrackingData } from '../types/studio';

interface SpringState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  wobble: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
}

export class HairEngine {
  private spring: SpringState = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vRot: 0, wobble: 0 };
  private sparkles: Sparkle[] = [];
  private hairImg: HTMLImageElement | null = null;
  private hairCanvas: HTMLCanvasElement | null = null;
  private hairCtx: CanvasRenderingContext2D | null = null;
  private isHairLoaded = false;
  private time = 0;

  // Previous tracking state for velocity impulse calculation
  private prevYaw = 0;
  private prevPitch = 0;
  private prevRoll = 0;
  private prevFaceX = 0.5;
  private prevFaceY = 0.5;

  constructor() {
    this.initSparkles();
    this.loadHairAsset();
  }

  private loadHairAsset() {
    this.hairImg = new Image();
    this.hairImg.src = '/assets/demogod_hair_isolated.jpg';
    this.hairImg.onload = () => {
      this.createTransparentHairTexture();
    };
  }

  private createTransparentHairTexture() {
    if (!this.hairImg) return;
    this.hairCanvas = document.createElement('canvas');
    this.hairCanvas.width = this.hairImg.width;
    this.hairCanvas.height = this.hairImg.height;
    this.hairCtx = this.hairCanvas.getContext('2d');
    if (!this.hairCtx) return;

    this.hairCtx.drawImage(this.hairImg, 0, 0);
    const imgData = this.hairCtx.getImageData(0, 0, this.hairCanvas.width, this.hairCanvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 238) {
        data[i + 3] = 0;
      } else if (brightness > 210) {
        data[i + 3] = Math.round(((238 - brightness) / 28) * 255);
      }
    }

    this.hairCtx.putImageData(imgData, 0, 0);
    this.isHairLoaded = true;
  }

  private initSparkles() {
    for (let i = 0; i < 28; i++) {
      this.sparkles.push({
        x: (Math.random() - 0.5) * 220,
        y: (Math.random() - 0.5) * 140,
        size: Math.random() * 4 + 2,
        alpha: Math.random(),
        speed: Math.random() * 0.06 + 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  public update(dt: number, tracking: FaceTrackingData, settings: HairSettings) {
    this.time += dt;

    if (!settings.physics) {
      this.spring.x = 0;
      this.spring.y = 0;
      this.spring.vx = 0;
      this.spring.vy = 0;
      this.spring.rot = 0;
      this.spring.vRot = 0;
      this.spring.wobble = 0;
      return;
    }

    // Calculate instantaneous motion delta/velocity from head movements
    const deltaYaw = tracking.yaw - this.prevYaw;
    const deltaPitch = tracking.pitch - this.prevPitch;
    const deltaRoll = tracking.roll - this.prevRoll;
    const deltaX = tracking.faceX - this.prevFaceX;
    const deltaY = tracking.faceY - this.prevFaceY;

    this.prevYaw = tracking.yaw;
    this.prevPitch = tracking.pitch;
    this.prevRoll = tracking.roll;
    this.prevFaceX = tracking.faceX;
    this.prevFaceY = tracking.faceY;

    // Apply high-energy inertia impulse on head movements
    this.spring.vx -= deltaYaw * 95 + deltaX * 180;
    this.spring.vy -= deltaPitch * 90 + deltaY * 160;
    this.spring.vRot -= deltaRoll * 1.8 + deltaYaw * 0.45;

    // Audio-reactive voice bounce pulse
    if (settings.audioReactive && tracking.audioLevel > 0.08) {
      this.spring.vy -= tracking.audioLevel * 32;
      this.spring.wobble += tracking.audioLevel * 0.35;
    }

    // Target displacement based on head pose
    const targetX = -tracking.yaw * 48;
    const targetY = -tracking.pitch * 38;
    const targetRot = -tracking.roll * 0.65 - tracking.yaw * 0.22;

    // Elastic spring physics with bouncy recoil
    const stiffness = settings.springStiffness || 0.22;
    const damping = 0.88; // Lower damping allows satisfying spring oscillations

    const ax = (targetX - this.spring.x) * stiffness;
    const ay = (targetY - this.spring.y) * stiffness;
    const aRot = (targetRot - this.spring.rot) * stiffness;

    this.spring.vx = (this.spring.vx + ax) * damping;
    this.spring.vy = (this.spring.vy + ay) * damping;
    this.spring.vRot = (this.spring.vRot + aRot) * damping;

    this.spring.x += this.spring.vx;
    this.spring.y += this.spring.vy;
    this.spring.rot += this.spring.vRot;

    // Secondary harmonic flex / jiggle
    this.spring.wobble *= 0.85;

    this.sparkles.forEach((s) => {
      s.phase += s.speed;
      s.alpha = Math.max(0, Math.sin(s.phase));
    });
  }

  public render(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    headRadius: number,
    tracking: FaceTrackingData,
    settings: HairSettings
  ) {
    ctx.save();

    // Position origin directly at forehead hairline anchor with amplified bouncy physics
    const hairAnchorY = headY + settings.hairlineLift;
    const springX = this.spring.x * 0.85;
    const springY = this.spring.y * 0.85;
    
    ctx.translate(headX + springX, hairAnchorY + springY);

    const totalRotation = tracking.roll * 0.85 + this.spring.rot * 0.95 + tracking.yaw * 0.12;
    ctx.rotate(totalRotation);

    // Dynamic height and width with bounce scaling
    const bounceFactor = 1 + (settings.audioReactive ? tracking.audioLevel * 0.45 : 0) + Math.abs(this.spring.vy) * 0.008;
    const hairW = headRadius * 2.2 * settings.bigness * (1 + Math.abs(this.spring.vx) * 0.005);
    const hairH = headRadius * 2.1 * settings.height * bounceFactor;

    // 1. Demogod Golden Aura
    if (settings.superDemogodMode) {
      this.renderSuperDemogodAura(ctx, hairW, hairH);
    }

    // 2. High-Res Textured Hair Render
    if (this.isHairLoaded && this.hairCanvas) {
      ctx.save();
      if (settings.color !== '#09090b') {
        ctx.filter = `sepia(0.3) hue-rotate(15deg) brightness(1.1)`;
      }

      const drawW = hairW;
      const drawH = hairH;
      const drawX = -drawW * 0.5 + tracking.yaw * 12 + this.spring.x * 0.15;
      const drawY = -drawH * 0.58;

      ctx.drawImage(this.hairCanvas, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      this.renderProceduralHairSilhouette(ctx, hairW, hairH, tracking, settings);
    }

    // 3. Ultra Tall Demogod Extension (When height > 1.25)
    if (settings.height > 1.25) {
      this.renderSkyHighExtension(ctx, hairW, hairH, tracking, settings);
    }

    // 4. Marschner Anisotropic Specular Highlight & Gloss Sheen
    if (settings.shininess > 0) {
      this.renderHairShininess(ctx, hairW, hairH, tracking, settings);
    }

    // 5. Specular Glint Sparkles
    if (settings.shininess > 45 || settings.superDemogodMode) {
      this.renderSparkles(ctx, hairW, hairH, settings);
    }

    ctx.restore();
  }

  private renderSkyHighExtension(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tracking: FaceTrackingData,
    settings: HairSettings
  ) {
    const extraH = (settings.height - 1.0) * h * 0.7;
    const hw = w * 0.44;
    const topY = -h * 0.58 - extraH;
    const baseY = -h * 0.45;
    const yawX = tracking.yaw * 20 + this.spring.x * 0.3;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-hw * 0.75, baseY);
    ctx.bezierCurveTo(-hw * 0.9, baseY - extraH * 0.5, -hw * 0.4 + yawX, topY + 10, yawX, topY);
    ctx.bezierCurveTo(hw * 0.4 + yawX, topY + 10, hw * 0.9, baseY - extraH * 0.5, hw * 0.75, baseY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, topY, 0, baseY);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, settings.color);
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fill();

    // Strands
    ctx.strokeStyle = this.lightenColor(settings.color, 30 + settings.shininess * 0.2);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.45;
    for (let k = 0; k < 18; k++) {
      const u = (k / 17) * 2 - 1;
      ctx.beginPath();
      ctx.moveTo(u * hw * 0.6, baseY);
      ctx.quadraticCurveTo(u * hw * 0.3 + yawX, topY + extraH * 0.4, yawX + u * 15, topY + 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderProceduralHairSilhouette(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tracking: FaceTrackingData,
    settings: HairSettings
  ) {
    const hw = w * 0.5;
    const hh = h;
    const yawShift = tracking.yaw * (w * 0.2) + this.spring.x * 0.2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-hw * 0.88, 15);
    ctx.bezierCurveTo(-hw * 1.05, -hh * 0.25, -hw * 1.15, -hh * 0.65, -hw * 0.85 + yawShift * 0.5, -hh * 0.95);
    ctx.bezierCurveTo(-hw * 0.45 + yawShift * 0.8, -hh * 1.15, hw * 0.25 + yawShift * 0.9, -hh * 1.25, hw * 0.75 + yawShift * 0.6, -hh * 0.95);
    ctx.bezierCurveTo(hw * 1.12, -hh * 0.65, hw * 1.05, -hh * 0.25, hw * 0.88, 15);
    ctx.bezierCurveTo(hw * 0.5, -hh * 0.12, -hw * 0.5, -hh * 0.12, -hw * 0.88, 15);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -hh * 1.2, 0, 20);
    grad.addColorStop(0, this.lightenColor(settings.color, 25));
    grad.addColorStop(0.3, settings.color);
    grad.addColorStop(0.8, this.darkenColor(settings.color, 35));
    grad.addColorStop(1, '#050507');

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  private renderHairShininess(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tracking: FaceTrackingData,
    settings: HairSettings
  ) {
    const hw = w * 0.5;
    const hh = h;
    const shineIntensity = settings.shininess / 100;
    const highlightY = -hh * 0.35 + tracking.pitch * 20 + Math.sin(this.time * 2) * 3 + this.spring.y * 0.1;
    const highlightX = tracking.yaw * 30 + this.spring.x * 0.15;

    ctx.save();

    const shineGrad = ctx.createRadialGradient(
      highlightX, highlightY, 4,
      highlightX, highlightY, hw * 0.65
    );

    const hlColor = settings.highlightColor || '#ffffff';
    shineGrad.addColorStop(0, this.hexToRgba(hlColor, 0.85 * shineIntensity));
    shineGrad.addColorStop(0.35, this.hexToRgba(hlColor, 0.45 * shineIntensity));
    shineGrad.addColorStop(0.7, this.hexToRgba(hlColor, 0.12 * shineIntensity));
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.ellipse(highlightX, highlightY, hw * 0.52, hh * 0.18, tracking.yaw * 0.2 - 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Silky Crest Edge Glint
    const rimGrad = ctx.createLinearGradient(-hw * 0.4, -hh * 0.52, hw * 0.4, -hh * 0.52);
    rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rimGrad.addColorStop(0.5, this.hexToRgba(hlColor, 0.6 * shineIntensity));
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 3.5 + shineIntensity * 5;
    ctx.beginPath();
    ctx.arc(highlightX * 0.5, -hh * 0.48, hw * 0.36, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.restore();
  }

  private renderSparkles(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    settings: HairSettings
  ) {
    const shineFactor = settings.superDemogodMode ? 1.5 : (settings.shininess - 35) / 65;
    if (shineFactor <= 0) return;

    ctx.save();
    const hlColor = settings.superDemogodMode ? '#fbbf24' : (settings.highlightColor || '#ffffff');

    this.sparkles.forEach((s) => {
      const sx = s.x * (w / 240);
      const sy = -h * 0.42 + s.y * (h / 190);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(this.time * 2 + s.phase);
      ctx.fillStyle = hlColor;
      ctx.globalAlpha = s.alpha * shineFactor * 0.85;

      const sz = s.size * (settings.superDemogodMode ? 1.8 : 1.0);
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz * 0.25, -sz * 0.25);
      ctx.lineTo(sz, 0);
      ctx.lineTo(sz * 0.25, sz * 0.25);
      ctx.lineTo(0, sz);
      ctx.lineTo(-sz * 0.25, sz * 0.25);
      ctx.lineTo(-sz, 0);
      ctx.lineTo(-sz * 0.25, -sz * 0.25);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  private renderSuperDemogodAura(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    const pulse = Math.sin(this.time * 8) * 0.15 + 0.85;

    const auraGrad = ctx.createRadialGradient(0, -h * 0.35, w * 0.2, 0, -h * 0.35, w * 0.95);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
    auraGrad.addColorStop(0.8, 'rgba(234, 88, 12, 0.1)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.35, w * 0.75 * pulse, h * 0.75 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      const angle = (k / 5) * Math.PI * 2 + this.time * 3;
      const r1 = w * 0.45;
      const r2 = w * 0.75;
      const x1 = Math.cos(angle) * r1;
      const y1 = -h * 0.35 + Math.sin(angle) * r1 * 0.6;
      const x2 = Math.cos(angle + 0.3) * r2;
      const y2 = -h * 0.35 + Math.sin(angle + 0.3) * r2 * 0.6;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo((x1 + x2) * 0.5 + (Math.random() - 0.5) * 20, (y1 + y2) * 0.5 + (Math.random() - 0.5) * 20);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * (percent / 100)));
    const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100)));
    const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * (percent / 100)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * (percent / 100)));
    const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * (percent / 100)));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * (percent / 100)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgba(hex: string, alpha: number): string {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
