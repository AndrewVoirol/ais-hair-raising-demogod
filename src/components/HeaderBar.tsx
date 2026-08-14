import React from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Video,
  Square,
  Pause,
  Play,
  FileText,
  Sparkles,
  Zap,
  Flame,
} from 'lucide-react';
import type {
  StudioSettings,
  RecordingState,
  TeleprompterSettings,
  AspectRatioType,
  PresentationMode,
} from '../types/studio';

interface HeaderBarProps {
  studioSettings: StudioSettings;
  setStudioSettings: React.Dispatch<React.SetStateAction<StudioSettings>>;
  recordingState: RecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseResumeRecording: () => void;
  onTakeSnapshot: () => void;
  teleprompter: TeleprompterSettings;
  setTeleprompter: React.Dispatch<React.SetStateAction<TeleprompterSettings>>;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  superDemogodMode: boolean;
  onToggleSuperDemogod: () => void;
  audioLevel: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  studioSettings,
  setStudioSettings,
  recordingState,
  onStartRecording,
  onStopRecording,
  onPauseResumeRecording,
  onTakeSnapshot,
  teleprompter,
  setTeleprompter,
  isCameraActive,
  onToggleCamera,
  isMicActive,
  onToggleMic,
  superDemogodMode,
  onToggleSuperDemogod,
  audioLevel,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className="w-full glass-panel border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-4 z-40">
      {/* Brand & Studio Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 shadow-lg shadow-orange-500/20 text-white font-black text-xl">
          <Flame className="w-5 h-5 animate-pulse" />
          {superDemogodMode && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Hair-Raising Demogod
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Studio
              </span>
            </h1>
          </div>
          <p className="text-xs text-neutral-400 font-normal">
            Live Presentation & Face-Swap
          </p>
        </div>
      </div>

      {/* Center Controls: Mode & Aspect Ratio & Teleprompter */}
      <div className="hidden lg:flex items-center gap-2 bg-neutral-900/90 border border-white/10 rounded-xl p-1 shadow-inner">
        {/* Presentation Mode Selector */}
        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
          {(
            [
              { id: 'avatar', label: 'Demogod Avatar' },
              { id: 'face_swap', label: 'Live Face-Swap' },
            ] as { id: PresentationMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() =>
                setStudioSettings((prev) => ({ ...prev, mode: m.id }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                studioSettings.mode === m.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1 px-1">
          {(['16:9', '9:16', '1:1'] as AspectRatioType[]).map((ar) => (
            <button
              key={ar}
              onClick={() =>
                setStudioSettings((prev) => ({ ...prev, aspectRatio: ar }))
              }
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                studioSettings.aspectRatio === ar
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {ar}
            </button>
          ))}
        </div>

        {/* Teleprompter Toggle */}
        <button
          onClick={() =>
            setTeleprompter((prev) => ({ ...prev, isOpen: !prev.isOpen }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            teleprompter.isOpen
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Teleprompter
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Super Demogod Power Mode Button */}
        <button
          onClick={onToggleSuperDemogod}
          title="Toggle Super Demogod Mode (Lightning Sparks & Golden Aura)"
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            superDemogodMode
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-lg shadow-amber-500/50 animate-pulse scale-105'
              : 'bg-neutral-900/80 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${superDemogodMode ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">
            {superDemogodMode ? 'DEMOGOD ⚡' : 'Power Mode'}
          </span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          title={isCameraActive ? 'Turn Off Webcam' : 'Turn On Webcam'}
          className={`p-2 rounded-xl border text-xs font-medium transition-all ${
            isCameraActive
              ? 'bg-white/10 border-white/20 text-emerald-400 hover:bg-white/15'
              : 'bg-neutral-900 border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>

        {/* Microphone Toggle + VU Meter */}
        <button
          onClick={onToggleMic}
          title={isMicActive ? 'Mute Microphone' : 'Enable Microphone'}
          className={`relative p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
            isMicActive
              ? 'bg-white/10 border-white/20 text-emerald-400 hover:bg-white/15'
              : 'bg-neutral-900 border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {isMicActive && (
            <div className="w-1.5 h-4 bg-neutral-800 rounded-full overflow-hidden flex flex-col justify-end">
              <div
                className="w-full bg-emerald-400 transition-all duration-75"
                style={{ height: `${Math.min(100, audioLevel * 100 * 2.5)}%` }}
              />
            </div>
          )}
        </button>

        {/* Snapshot Photo Button */}
        <button
          onClick={onTakeSnapshot}
          title="Take 4K Snapshot"
          className="p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
        </button>

        {/* Recording Button Suite */}
        {recordingState.isRecording ? (
          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 p-1 rounded-xl shadow-lg shadow-rose-900/30 animate-pulse">
            <div className="flex items-center gap-2 px-2.5 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-rose-200">
                REC {formatTime(recordingState.durationSec)}
              </span>
            </div>

            <button
              onClick={onPauseResumeRecording}
              className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white transition-all"
              title={recordingState.isPaused ? 'Resume Recording' : 'Pause Recording'}
            >
              {recordingState.isPaused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={onStopRecording}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/50"
              title="Stop and Export Video"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Finish</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onStartRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Video className="w-4 h-4" />
            <span>Record Demo</span>
          </button>
        )}
      </div>
    </header>
  );
};
