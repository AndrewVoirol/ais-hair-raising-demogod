import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Zap,
  Flame,
  Camera,
} from 'lucide-react';
import type {
  HairSettings,
  StudioSettings,
  FaceTrackingData,
  TeleprompterSettings,
} from '../types/studio';
import { StudioRenderer } from '../engine/StudioRenderer';
import { FaceTracker } from '../engine/FaceTracker';
import { Teleprompter } from './Teleprompter';

interface StudioViewportProps {
  hairSettings: HairSettings;
  studioSettings: StudioSettings;
  teleprompter: TeleprompterSettings;
  setTeleprompter: React.Dispatch<React.SetStateAction<TeleprompterSettings>>;
  isCameraActive: boolean;
  audioLevel: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  faceTrackerRef: React.RefObject<FaceTracker | null>;
}

export const StudioViewport: React.FC<StudioViewportProps> = ({
  hairSettings,
  studioSettings,
  teleprompter,
  setTeleprompter,
  isCameraActive,
  audioLevel,
  canvasRef,
  videoRef,
  faceTrackerRef,
}) => {
  const rendererRef = useRef<StudioRenderer | null>(null);
  const [fps, setFps] = useState(60);
  const [trackingData, setTrackingData] = useState<FaceTrackingData>({
    detected: false,
    yaw: 0,
    pitch: 0,
    roll: 0,
    faceX: 0.5,
    faceY: 0.45,
    faceWidth: 0.32,
    faceHeight: 0.42,
    leftEyeOpen: 1,
    rightEyeOpen: 1,
    mouthOpen: 0,
    mouthSmile: 0.2,
    eyebrowRaise: 0,
    audioLevel: 0,
  });

  useEffect(() => {
    rendererRef.current = new StudioRenderer();
    if (!faceTrackerRef.current) {
      (faceTrackerRef as any).current = new FaceTracker();
    }
  }, [faceTrackerRef]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const loop = async (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      frameCount++;

      if (time - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = time;
      }

      if (faceTrackerRef.current) {
        faceTrackerRef.current.setAudioLevel(audioLevel);
        const data = await faceTrackerRef.current.processFrame();
        setTrackingData(data);

        if (canvasRef.current && rendererRef.current) {
          rendererRef.current.render(
            canvasRef.current,
            videoRef.current,
            data,
            hairSettings,
            studioSettings,
            dt
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef, videoRef, faceTrackerRef, hairSettings, studioSettings, audioLevel]);

  const getCanvasDimensions = () => {
    switch (studioSettings.aspectRatio) {
      case '9:16':
        return { width: 720, height: 1280, aspectClass: 'aspect-[9/16] max-h-[75vh]' };
      case '1:1':
        return { width: 960, height: 960, aspectClass: 'aspect-square max-h-[75vh]' };
      case '16:9':
      default:
        return { width: 1280, height: 720, aspectClass: 'aspect-video w-full' };
    }
  };

  const dimensions = getCanvasDimensions();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
      />

      <div
        className={`relative ${dimensions.aspectClass} rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-950 flex items-center justify-center`}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full object-contain"
        />

        <Teleprompter
          settings={teleprompter}
          setSettings={setTeleprompter}
        />

        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 pointer-events-none z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-neutral-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraActive
                  ? trackingData.detected
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
            />
            <span>
              {isCameraActive
                ? trackingData.detected
                  ? 'Face Mesh Locked'
                  : 'Searching Face...'
                : 'Demo Simulation'}
            </span>
          </div>

          <div className="hidden sm:flex items-center px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-400">
            {fps} FPS
          </div>
        </div>

        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 pointer-events-none z-20">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-amber-300">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>
              Height: {Math.round(hairSettings.height * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-sky-500/30 text-[11px] font-mono text-sky-300">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>
              Gloss: {hairSettings.shininess}%
            </span>
          </div>
        </div>

        {studioSettings.enableAudioVisualizer && audioLevel > 0.02 && (
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono text-emerald-400 pointer-events-none z-20">
            <div className="flex items-end gap-0.5 h-3">
              {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((factor, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(2, audioLevel * factor * 14)}px`,
                  }}
                />
              ))}
            </div>
            <span className="ml-1">Live Audio</span>
          </div>
        )}

        {hairSettings.superDemogodMode && (
          <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[11px] shadow-lg shadow-amber-500/50 animate-bounce pointer-events-none z-20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>DEMOGOD ENERGY ACTIVE</span>
          </div>
        )}

        {!isCameraActive && (
          <div className="absolute bottom-3.5 left-3.5 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-[10px] text-neutral-400 pointer-events-none z-20">
            <Camera className="w-3 h-3 text-amber-400" />
            <span>Turn on camera to track your face 1:1</span>
          </div>
        )}
      </div>
    </div>
  );
};
