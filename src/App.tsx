import React, { useState, useRef, useEffect, useCallback } from 'react';
import type {
  HairSettings,
  StudioSettings,
  RecordingState,
  TeleprompterSettings,
} from './types/studio';
import { FaceTracker } from './engine/FaceTracker';
import { AudioReactor } from './engine/AudioReactor';
import { RecordingEngine } from './engine/RecordingEngine';
import { HeaderBar } from './components/HeaderBar';
import { StudioViewport } from './components/StudioViewport';
import { ControlDock } from './components/ControlDock';
import { RecordingModal } from './components/RecordingModal';

export const App: React.FC = () => {
  // Core State
  const [hairSettings, setHairSettings] = useState<HairSettings>({
    height: 1.0,
    bigness: 1.0,
    shininess: 65,
    hairlineLift: 0,
    color: '#09090b',
    highlightColor: '#ffffff',
    physics: true,
    springStiffness: 0.18,
    audioReactive: true,
    superDemogodMode: false,
    activePresetId: 'keynote',
  });

  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    mode: 'avatar',
    showGlasses: true,
    showOutfit: true,
    showLaptopProps: true,
    showMugProps: true,
    showPlants: true,
    backgroundBlur: 0,
    ambientWarmth: 35,
    lutFilter: 'warm_loft',
    aspectRatio: '16:9',
    cameraMirror: true,
    enableAudioVisualizer: true,
    hairWobbleReaction: 50,
  });

  const [teleprompter, setTeleprompter] = useState<TeleprompterSettings>({
    isOpen: false,
    text: `Welcome to Google I/O! Today, we are thrilled to unveil our next-generation multimodal AI models.

Notice the unprecedented reasoning capabilities, real-time audio-visual comprehension, and instantaneous response latency.

As you can see right here on my DeepMind workstation, complex multimodal agentic workflows now execute directly in your browser with zero server latency.

And of course, when the demo works flawlessly on the first try... my hair literally rises to the occasion!

Thank you all, and let's dive straight into the code.`,
    fontSize: 18,
    speed: 3,
    isScrolling: false,
    opacity: 0.85,
  });

  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    durationSec: 0,
    blobUrl: null,
    recordedBlob: null,
    mimeType: 'video/webm',
  });

  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Engine Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceTrackerRef = useRef<FaceTracker | null>(null);
  const audioReactorRef = useRef<AudioReactor | null>(null);
  const recordingEngineRef = useRef<RecordingEngine>(new RecordingEngine());
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // Initialize FaceTracker & AudioReactor
  useEffect(() => {
    faceTrackerRef.current = new FaceTracker();
    audioReactorRef.current = new AudioReactor();

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioReactorRef.current) {
        audioReactorRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Audio level polling loop
  useEffect(() => {
    let animId: number;
    const updateAudio = () => {
      if (audioReactorRef.current && isMicActive) {
        const lvl = audioReactorRef.current.getAudioLevel();
        setAudioLevel(lvl);
      } else {
        setAudioLevel(0);
      }
      animId = requestAnimationFrame(updateAudio);
    };

    animId = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(animId);
  }, [isMicActive]);

  // Toggle Camera
  const handleToggleCamera = useCallback(async () => {
    if (isCameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (faceTrackerRef.current) {
        faceTrackerRef.current.enableSimulation(true);
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });

        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (faceTrackerRef.current) {
            faceTrackerRef.current.setVideoSource(videoRef.current);
          }
        }
        setIsCameraActive(true);
      } catch (err) {
        console.warn('Webcam access was denied or is unavailable. Using realistic simulation mode.', err);
        setIsCameraActive(false);
      }
    }
  }, [isCameraActive]);

  // Toggle Microphone
  const handleToggleMic = useCallback(async () => {
    if (isMicActive) {
      if (audioReactorRef.current) {
        audioReactorRef.current.stop();
      }
      setIsMicActive(false);
    } else {
      if (audioReactorRef.current) {
        const stream = await audioReactorRef.current.start();
        if (stream) {
          setIsMicActive(true);
        }
      }
    }
  }, [isMicActive]);

  // Start Recording
  const handleStartRecording = useCallback(() => {
    if (!canvasRef.current) return;

    const micStream = audioReactorRef.current ? audioReactorRef.current.getStream() : null;

    const success = recordingEngineRef.current.startRecording(
      canvasRef.current,
      micStream,
      (blob, url) => {
        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          blobUrl: url,
          recordedBlob: blob,
        }));
        setIsRecordingModalOpen(true);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      }
    );

    if (success) {
      setRecordingState({
        isRecording: true,
        isPaused: false,
        durationSec: 0,
        blobUrl: null,
        recordedBlob: null,
        mimeType: 'video/webm',
      });

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingState((prev) => {
          if (prev.isRecording && !prev.isPaused) {
            return { ...prev, durationSec: prev.durationSec + 1 };
          }
          return prev;
        });
      }, 1000);
    }
  }, []);

  // Pause / Resume Recording
  const handlePauseResumeRecording = useCallback(() => {
    if (!recordingState.isRecording) return;
    if (recordingState.isPaused) {
      recordingEngineRef.current.resumeRecording();
      setRecordingState((prev) => ({ ...prev, isPaused: false }));
    } else {
      recordingEngineRef.current.pauseRecording();
      setRecordingState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [recordingState]);

  // Stop Recording
  const handleStopRecording = useCallback(() => {
    recordingEngineRef.current.stopRecording();
  }, []);

  // Take Instant Snapshot
  const handleTakeSnapshot = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = recordingEngineRef.current.takeSnapshot(canvasRef.current);
      recordingEngineRef.current.downloadDataUrl(dataUrl, `demogod-keynote-${Date.now()}.png`);
    }
  }, []);

  // Toggle Super Demogod Power Mode
  const handleToggleSuperDemogod = useCallback(() => {
    setHairSettings((prev) => {
      const nextSuper = !prev.superDemogodMode;
      return {
        ...prev,
        superDemogodMode: nextSuper,
        height: nextSuper ? Math.max(prev.height, 2.2) : 1.0,
        bigness: nextSuper ? Math.max(prev.bigness, 1.4) : 1.0,
        shininess: nextSuper ? 100 : 65,
        color: nextSuper ? '#78350f' : '#09090b',
        highlightColor: nextSuper ? '#fde047' : '#ffffff',
      };
    });
  }, []);

  // Preset Handler
  const handleApplyPreset = useCallback((presetId: string) => {
    switch (presetId) {
      case 'keynote':
        setHairSettings((prev) => ({
          ...prev,
          height: 1.0,
          bigness: 1.0,
          shininess: 65,
          color: '#09090b',
          highlightColor: '#ffffff',
          superDemogodMode: false,
          activePresetId: 'keynote',
        }));
        setStudioSettings((prev) => ({
          ...prev,
          backgroundBlur: 0,
          ambientWarmth: 35,
          lutFilter: 'warm_loft',
        }));
        break;
      case 'mega_pompadour':
        setHairSettings((prev) => ({
          ...prev,
          height: 1.8,
          bigness: 1.35,
          shininess: 80,
          color: '#09090b',
          highlightColor: '#ffffff',
          superDemogodMode: false,
          activePresetId: 'mega_pompadour',
        }));
        break;
      case 'sky_high':
        setHairSettings((prev) => ({
          ...prev,
          height: 2.8,
          bigness: 1.7,
          shininess: 95,
          color: '#1c1917',
          highlightColor: '#fef08a',
          superDemogodMode: false,
          activePresetId: 'sky_high',
        }));
        break;
      case 'sleek':
        setHairSettings((prev) => ({
          ...prev,
          height: 0.65,
          bigness: 0.85,
          shininess: 40,
          color: '#09090b',
          highlightColor: '#e2e8f0',
          superDemogodMode: false,
          activePresetId: 'sleek',
        }));
        break;
      default:
        break;
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-amber-500 selection:text-black">
      {/* Studio Header Bar */}
      <HeaderBar
        studioSettings={studioSettings}
        setStudioSettings={setStudioSettings}
        recordingState={recordingState}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onPauseResumeRecording={handlePauseResumeRecording}
        onTakeSnapshot={handleTakeSnapshot}
        teleprompter={teleprompter}
        setTeleprompter={setTeleprompter}
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        superDemogodMode={hairSettings.superDemogodMode}
        onToggleSuperDemogod={handleToggleSuperDemogod}
        audioLevel={audioLevel}
      />

      {/* Main Studio Workspace Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-5 max-w-[1720px] w-full mx-auto">
        {/* Left / Center Viewport Area */}
        <section className="lg:col-span-8 xl:col-span-8 flex flex-col items-center justify-center min-h-[460px]">
          <StudioViewport
            hairSettings={hairSettings}
            studioSettings={studioSettings}
            teleprompter={teleprompter}
            setTeleprompter={setTeleprompter}
            isCameraActive={isCameraActive}
            audioLevel={audioLevel}
            canvasRef={canvasRef}
            videoRef={videoRef}
            faceTrackerRef={faceTrackerRef}
          />
        </section>

        {/* Right Studio Dock Panel */}
        <aside className="lg:col-span-4 xl:col-span-4 h-[580px] lg:h-auto max-h-[820px]">
          <ControlDock
            hairSettings={hairSettings}
            setHairSettings={setHairSettings}
            studioSettings={studioSettings}
            setStudioSettings={setStudioSettings}
            teleprompter={teleprompter}
            setTeleprompter={setTeleprompter}
            onApplyPreset={handleApplyPreset}
            onTakeSnapshot={handleTakeSnapshot}
            onStartRecording={handleStartRecording}
            isRecording={recordingState.isRecording}
          />
        </aside>
      </main>

      {/* Video Preview & Export Modal */}
      <RecordingModal
        isOpen={isRecordingModalOpen}
        blobUrl={recordingState.blobUrl}
        recordedBlob={recordingState.recordedBlob}
        durationSec={recordingState.durationSec}
        onClose={() => setIsRecordingModalOpen(false)}
        onDownload={() => {
          if (recordingState.recordedBlob) {
            recordingEngineRef.current.downloadBlob(
              recordingState.recordedBlob,
              `hair-raising-demogod-${Date.now()}.webm`
            );
          }
        }}
      />
    </div>
  );
};

export default App;
