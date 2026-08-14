import type { HairSettings, StudioSettings, FaceTrackingData } from '../types/studio';
import { HairEngine } from './HairEngine';

export class StudioRenderer {
  private hairEngine: HairEngine;
  private bgImg: HTMLImageElement | null = null;
  private charImg: HTMLImageElement | null = null;
  private charCanvas: HTMLCanvasElement | null = null;
  private charCtx: CanvasRenderingContext2D | null = null;
  private bgLoaded = false;
  private isCharLoaded = false;

  constructor() {
    this.hairEngine = new HairEngine();
    this.loadAssets();
  }

  private loadAssets() {
    this.bgImg = new Image();
    this.bgImg.src = '/assets/brooklyn_loft.jpg';
    this.bgImg.onload = () => {
      this.bgLoaded = true;
    };

    this.charImg = new Image();
    this.charImg.src = '/assets/demogod_character.jpg';
    this.charImg.onload = () => {
      this.createTransparentCharTexture();
    };
  }

  private createTransparentCharTexture() {
    if (!this.charImg) return;
    const w = this.charImg.width;
    const h = this.charImg.height;

    this.charCanvas = document.createElement('canvas');
    this.charCanvas.width = w;
    this.charCanvas.height = h;
    this.charCtx = this.charCanvas.getContext('2d');
    if (!this.charCtx) return;

    this.charCtx.drawImage(this.charImg, 0, 0);
    const imgData = this.charCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const centerX = w * 0.5;
    const centerY = h * 0.52;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const brightness = (r + g + b) / 3;
        const isNeutralWall = Math.abs(r - g) < 20 && Math.abs(g - b) < 20;

        const dx = (x - centerX) / (w * 0.44);
        const dy = (y - centerY) / (h * 0.48);
        const radialDist = Math.sqrt(dx * dx + dy * dy);

        if (isNeutralWall && brightness > 172 && y < h * 0.72) {
          data[idx + 3] = 0;
        } else if (radialDist > 0.92 && y < h * 0.72) {
          const edgeAlpha = Math.max(0, Math.min(1, (1.12 - radialDist) / 0.2));
          data[idx + 3] = Math.round(data[idx + 3] * edgeAlpha);
        }
      }
    }

    this.charCtx.putImageData(imgData, 0, 0);
    this.isCharLoaded = true;
  }

  public render(
    canvas: HTMLCanvasElement,
    videoElement: HTMLVideoElement | null,
    tracking: FaceTrackingData,
    hairSettings: HairSettings,
    studioSettings: StudioSettings,
    dt: number
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    this.hairEngine.update(dt, tracking, hairSettings);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Loft Background
    this.renderBackground(ctx, width, height, studioSettings);

    // Presenter Coordinates in Viewport
    const headX = width * 0.5 + (tracking.faceX - 0.5) * width * 0.35;
    const headY = height * 0.52 + (tracking.faceY - 0.45) * height * 0.25;
    const headRadius = Math.min(width, height) * 0.15;

    // 2. Character & Face Layer
    if (studioSettings.mode === 'avatar') {
      // Full Avatar Mode: Render stylized character portrait with facial expressions
      this.renderPresenterBase(ctx, headX, headY, headRadius, tracking, studioSettings);
    } else {
      // Live Face Swap Mode: Render presenter crewneck body ONLY (NO avatar face behind user)
      if (studioSettings.showOutfit) {
        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(tracking.roll * 0.35 + tracking.yaw * 0.08);
        this.renderProceduralOutfit(ctx, headRadius);
        ctx.restore();
      }

      // Render live camera feed seamlessly onto neck collar
      this.renderCameraFaceSwap(ctx, videoElement, headX, headY, headRadius, tracking);

      // Glasses overlay for face swap mode if enabled
      if (studioSettings.showGlasses) {
        this.renderDesignerGlasses(ctx, headX, headY, headRadius, tracking);
      }
    }

    // 3. Dynamic Signature Hair System (Height, Bigness, Shininess & Physics)
    const hairAnchorY = headY - headRadius * 0.92;
    this.hairEngine.render(ctx, headX, hairAnchorY, headRadius, tracking, hairSettings);

    // 4. Desk & DeepBrain Laptop & Mug Props
    if (studioSettings.showLaptopProps || studioSettings.showMugProps) {
      this.renderForegroundProps(ctx, width, height, studioSettings);
    }

    // 5. Post Lighting & LUT Filters
    this.applyStudioLightingAndLut(ctx, width, height, studioSettings);

    ctx.restore();
  }

  private renderBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    studio: StudioSettings
  ) {
    ctx.save();

    if (studio.backgroundBlur > 0) {
      ctx.filter = `blur(${studio.backgroundBlur}px)`;
    }

    if (this.bgLoaded && this.bgImg) {
      this.drawCover(ctx, this.bgImg, 0, 0, w, h);
    } else {
      const brickGrad = ctx.createLinearGradient(0, 0, 0, h);
      brickGrad.addColorStop(0, '#2e1c14');
      brickGrad.addColorStop(0.5, '#451a03');
      brickGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = brickGrad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.filter = 'none';

    if (studio.ambientWarmth > 0) {
      ctx.fillStyle = `rgba(245, 158, 11, ${studio.ambientWarmth * 0.0018})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  private renderPresenterBase(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    r: number,
    tracking: FaceTrackingData,
    studio: StudioSettings
  ) {
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(tracking.roll * 0.85 + tracking.yaw * 0.12);

    if (this.isCharLoaded && this.charCanvas) {
      const charW = r * 4.4;
      const charH = r * 4.8;
      const charX = -charW * 0.5 + tracking.yaw * 14;
      const charY = -charH * 0.44 + tracking.pitch * 10;

      ctx.drawImage(this.charCanvas, charX, charY, charW, charH);

      // Speaking mouth subtle shading
      if (tracking.mouthOpen > 0.25) {
        const mouthY = charY + charH * 0.415;
        const mouthX = charX + charW * 0.50 + tracking.yaw * 8;
        const mouthW = r * 0.38 * (0.8 + tracking.mouthSmile * 0.25);
        const openH = tracking.mouthOpen * 10;

        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, mouthW * 0.5, Math.max(2, openH), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(76, 5, 25, 0.65)';
        ctx.fill();
      }

      // Blinking eyes subtle curve
      if (tracking.leftEyeOpen < 0.25 || tracking.rightEyeOpen < 0.25) {
        const eyeY = charY + charH * 0.33;
        const leftEyeX = charX + charW * 0.44 + tracking.yaw * 6;
        const rightEyeX = charX + charW * 0.56 + tracking.yaw * 6;
        const eyeW = r * 0.18;

        ctx.strokeStyle = '#27170e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        if (tracking.leftEyeOpen < 0.25) {
          ctx.beginPath();
          ctx.arc(leftEyeX, eyeY, eyeW * 0.4, 0.1, Math.PI - 0.1);
          ctx.stroke();
        }

        if (tracking.rightEyeOpen < 0.25) {
          ctx.beginPath();
          ctx.arc(rightEyeX, eyeY, eyeW * 0.4, 0.1, Math.PI - 0.1);
          ctx.stroke();
        }
      }
    } else {
      if (studio.showOutfit) {
        this.renderProceduralOutfit(ctx, r);
      }
      this.renderProceduralFace(ctx, r, tracking);
    }

    ctx.restore();
  }

  private renderCameraFaceSwap(
    ctx: CanvasRenderingContext2D,
    videoElement: HTMLVideoElement | null,
    headX: number,
    headY: number,
    r: number,
    tracking: FaceTrackingData
  ) {
    if (!videoElement || videoElement.readyState < 2) return;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(tracking.roll * 0.85 + tracking.yaw * 0.12);

    const fw = r * 2.2;
    const fh = r * 2.6;
    const yawX = tracking.yaw * 16;
    const pitchY = tracking.pitch * 12 - r * 0.15;

    // Smooth feathered oval clipping path for face swap
    ctx.beginPath();
    ctx.ellipse(yawX, pitchY, fw * 0.54, fh * 0.58, 0, 0, Math.PI * 2);
    ctx.clip();

    const vw = videoElement.videoWidth || 640;
    const vh = videoElement.videoHeight || 480;
    const cropSize = Math.min(vw, vh) * 0.78;
    const sx = (vw - cropSize) * 0.5;
    const sy = (vh - cropSize) * 0.28;

    // Draw user webcam centered inside face aperture
    ctx.drawImage(
      videoElement,
      sx, sy, cropSize, cropSize,
      -fw * 0.58 + yawX, -fh * 0.54 + pitchY, fw * 1.16, fh * 1.16
    );

    ctx.restore();
  }

  private renderDesignerGlasses(
    ctx: CanvasRenderingContext2D,
    headX: number,
    headY: number,
    r: number,
    tracking: FaceTrackingData
  ) {
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(tracking.roll * 0.85 + tracking.yaw * 0.12);

    const yawX = tracking.yaw * 18;
    const pitchY = tracking.pitch * 14 - r * 0.08;
    const eyeDist = r * 0.42;
    const lensR = r * 0.24;

    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 4.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';

    // Left Frame
    ctx.beginPath();
    ctx.arc(yawX - eyeDist, pitchY, lensR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Frame
    ctx.beginPath();
    ctx.arc(yawX + eyeDist, pitchY, lensR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nose Bridge
    ctx.beginPath();
    ctx.arc(yawX, pitchY - lensR * 0.25, eyeDist * 0.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Temple arms
    ctx.beginPath();
    ctx.moveTo(yawX - eyeDist - lensR, pitchY);
    ctx.lineTo(yawX - eyeDist - lensR * 1.6, pitchY - 4);
    ctx.moveTo(yawX + eyeDist + lensR, pitchY);
    ctx.lineTo(yawX + eyeDist + lensR * 1.6, pitchY - 4);
    ctx.stroke();

    ctx.restore();
  }

  private renderProceduralOutfit(ctx: CanvasRenderingContext2D, r: number) {
    const neckWidth = r * 1.05;
    const neckY = r * 0.72;
    const shoulderWidth = r * 4.6;
    const shoulderY = r * 1.35;
    const bodyBottom = r * 5.2;

    // Neck Base
    ctx.beginPath();
    ctx.moveTo(-neckWidth * 0.5, neckY);
    ctx.lineTo(neckWidth * 0.5, neckY);
    ctx.lineTo(neckWidth * 0.46, shoulderY);
    ctx.lineTo(-neckWidth * 0.46, shoulderY);
    ctx.closePath();
    ctx.fillStyle = '#b45309';
    ctx.fill();

    // Oversized Presenter Black Crewneck Tee
    ctx.beginPath();
    ctx.moveTo(-neckWidth * 0.55, neckY + 14);
    ctx.bezierCurveTo(-shoulderWidth * 0.35, shoulderY - 8, -shoulderWidth * 0.75, shoulderY + 28, -shoulderWidth * 0.98, shoulderY + 85);
    ctx.lineTo(-shoulderWidth * 0.95, bodyBottom);
    ctx.lineTo(shoulderWidth * 0.95, bodyBottom);
    ctx.lineTo(shoulderWidth * 0.98, shoulderY + 85);
    ctx.bezierCurveTo(shoulderWidth * 0.75, shoulderY + 28, shoulderWidth * 0.35, shoulderY - 8, neckWidth * 0.55, neckY + 14);
    ctx.bezierCurveTo(neckWidth * 0.3, neckY + 42, -neckWidth * 0.3, neckY + 42, -neckWidth * 0.55, neckY + 14);
    ctx.closePath();

    const teeGrad = ctx.createLinearGradient(0, neckY, 0, bodyBottom);
    teeGrad.addColorStop(0, '#1c1917');
    teeGrad.addColorStop(0.15, '#141416');
    teeGrad.addColorStop(0.6, '#0c0c0e');
    teeGrad.addColorStop(1, '#050505');
    ctx.fillStyle = teeGrad;
    ctx.fill();

    // Collar Ribbing
    ctx.beginPath();
    ctx.ellipse(0, neckY + 26, neckWidth * 0.52, 14, 0, 0, Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  private renderProceduralFace(ctx: CanvasRenderingContext2D, r: number, tracking: FaceTrackingData) {
    const fw = r * 1.55;
    const fh = r * 1.95;
    const yawX = tracking.yaw * 18;
    const pitchY = tracking.pitch * 14;

    ctx.beginPath();
    ctx.moveTo(-fw * 0.48 + yawX * 0.5, -fh * 0.36 + pitchY);
    ctx.bezierCurveTo(-fw * 0.54 + yawX * 0.7, fh * 0.12 + pitchY, -fw * 0.44 + yawX * 0.8, fh * 0.50 + pitchY, 0 + yawX, fh * 0.56 + pitchY);
    ctx.bezierCurveTo(fw * 0.44 + yawX * 0.8, fh * 0.50 + pitchY, fw * 0.54 + yawX * 0.7, fh * 0.12 + pitchY, fw * 0.48 + yawX * 0.5, -fh * 0.36 + pitchY);
    ctx.bezierCurveTo(fw * 0.42 + yawX * 0.4, -fh * 0.56 + pitchY, -fw * 0.42 + yawX * 0.4, -fh * 0.56 + pitchY, -fw * 0.48 + yawX * 0.5, -fh * 0.36 + pitchY);
    ctx.closePath();

    const skinGrad = ctx.createRadialGradient(yawX * 0.5, pitchY - fh * 0.08, fw * 0.15, yawX * 0.5, pitchY, fw * 0.68);
    skinGrad.addColorStop(0, '#f59e0b');
    skinGrad.addColorStop(0.5, '#d97706');
    skinGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = skinGrad;
    ctx.fill();
  }

  private renderForegroundProps(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    studio: StudioSettings
  ) {
    ctx.save();

    const deskHeight = h * 0.22;
    const deskY = h - deskHeight;

    const deskGrad = ctx.createLinearGradient(0, deskY, 0, h);
    deskGrad.addColorStop(0, '#59321c');
    deskGrad.addColorStop(0.12, '#432311');
    deskGrad.addColorStop(1, '#271408');
    ctx.fillStyle = deskGrad;
    ctx.fillRect(0, deskY, w, deskHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const y = deskY + 16 + i * 24;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y - 3, w * 0.7, y + 5, w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, deskY);
    ctx.lineTo(w, deskY);
    ctx.stroke();

    // DeepBrain Laptop centered in foreground
    if (studio.showLaptopProps) {
      this.renderDeepBrainLaptop(ctx, w * 0.5, deskY + 28, w * 0.35, h * 0.27);
    }

    // Yellow Mug placed on the right
    if (studio.showMugProps) {
      this.renderYellowMug(ctx, w * 0.78, deskY + 10, w * 0.080, h * 0.17);
    }

    ctx.restore();
  }

  private renderDeepBrainLaptop(
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    lapW: number,
    lapH: number
  ) {
    ctx.save();

    const topW = lapW * 0.94;
    const topY = baseY - lapH * 0.85;

    ctx.beginPath();
    ctx.roundRect(cx - topW * 0.5, topY, topW, lapH * 0.88, [12, 12, 4, 4]);
    const lidGrad = ctx.createLinearGradient(cx, topY, cx, baseY);
    lidGrad.addColorStop(0, '#334155');
    lidGrad.addColorStop(0.5, '#1e293b');
    lidGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = lidGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fictitious Brand Wordmark: "DeepBrain AI"
    ctx.save();
    ctx.font = '600 12px var(--font-heading), sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('DeepBrain AI', cx - topW * 0.5 + 16, topY + 22);
    ctx.restore();

    // Fictitious I/Ø Rainbow Badge
    this.renderIoBadge(ctx, cx, topY + lapH * 0.44, lapW * 0.11);

    ctx.beginPath();
    ctx.ellipse(cx, baseY + 6, lapW * 0.55, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(cx - lapW * 0.52, baseY - 4, lapW * 1.04, 10, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.restore();
  }

  private renderIoBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fillStyle = '#09090b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const logoGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    logoGrad.addColorStop(0, '#38bdf8');
    logoGrad.addColorStop(0.3, '#818cf8');
    logoGrad.addColorStop(0.6, '#ec4899');
    logoGrad.addColorStop(0.85, '#f59e0b');
    logoGrad.addColorStop(1, '#10b981');

    ctx.lineWidth = 4.5;
    ctx.strokeStyle = logoGrad;
    ctx.lineCap = 'round';

    // Stylized "I"
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.38, cy - r * 0.48);
    ctx.lineTo(cx - r * 0.38, cy + r * 0.48);
    ctx.stroke();

    // Stylized slash "/"
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.08, cy + r * 0.48);
    ctx.lineTo(cx + r * 0.08, cy - r * 0.48);
    ctx.stroke();

    // Stylized "Ø" (circle with diagonal slash)
    ctx.beginPath();
    ctx.arc(cx + r * 0.46, cy, r * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + r * 0.24, cy + r * 0.32);
    ctx.lineTo(cx + r * 0.68, cy - r * 0.32);
    ctx.stroke();

    ctx.restore();
  }

  private renderYellowMug(
    ctx: CanvasRenderingContext2D,
    mx: number,
    my: number,
    mw: number,
    mh: number
  ) {
    ctx.save();

    ctx.beginPath();
    ctx.ellipse(mx + mw * 0.5, my + mh, mw * 0.65, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mx + mw * 1.05, my + mh * 0.52, mw * 0.32, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, [6, 6, 12, 12]);

    const mugGrad = ctx.createLinearGradient(mx, my, mx + mw, my);
    mugGrad.addColorStop(0, '#facc15');
    mugGrad.addColorStop(0.3, '#eab308');
    mugGrad.addColorStop(0.85, '#ca8a04');
    mugGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = mugGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(161, 98, 7, 0.45)';
    ctx.lineWidth = 2.2;
    for (let j = 1; j <= 5; j++) {
      const gy = my + (mh / 7) * j;
      ctx.beginPath();
      ctx.ellipse(mx + mw * 0.5, gy, mw * 0.48, 3.5, 0, 0, Math.PI);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(mx + mw * 0.5, my, mw * 0.5, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(mx + mw * 0.5, my + 1, mw * 0.44, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#271408';
    ctx.fill();

    ctx.restore();
  }

  private applyStudioLightingAndLut(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    studio: StudioSettings
  ) {
    ctx.save();

    switch (studio.lutFilter) {
      case 'warm_loft':
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'io_keynote':
        {
          const ioGrad = ctx.createLinearGradient(0, 0, w, h);
          ioGrad.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
          ioGrad.addColorStop(1, 'rgba(129, 140, 248, 0.07)');
          ctx.fillStyle = ioGrad;
          ctx.fillRect(0, 0, w, h);
        }
        break;
      case 'cinematic_teal':
        ctx.fillStyle = 'rgba(20, 184, 166, 0.07)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'crisp_tech':
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'noir':
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, w, h);
        break;
      default:
        break;
    }

    const vigGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.45, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  private drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (targetRatio > imgRatio) {
      sh = img.width / targetRatio;
      sy = (img.height - sh) * 0.5;
    } else {
      sw = img.height * targetRatio;
      sx = (img.width - sw) * 0.5;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
}
