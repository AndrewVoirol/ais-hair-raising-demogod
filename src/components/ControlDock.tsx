import React, { useState } from 'react';
import {
  Scissors,
  Layers,
  FileText,
  Video,
  Download,
  Sparkles,
} from 'lucide-react';
import type {
  HairSettings,
  StudioSettings,
  TeleprompterSettings,
} from '../types/studio';
import { HairControls } from './HairControls';
import { EnvironmentControls } from './EnvironmentControls';

interface ControlDockProps {
  hairSettings: HairSettings;
  setHairSettings: React.Dispatch<React.SetStateAction<HairSettings>>;
  studioSettings: StudioSettings;
  setStudioSettings: React.Dispatch<React.SetStateAction<StudioSettings>>;
  teleprompter: TeleprompterSettings;
  setTeleprompter: React.Dispatch<React.SetStateAction<TeleprompterSettings>>;
  onApplyPreset: (presetId: string) => void;
  onTakeSnapshot: () => void;
  onStartRecording: () => void;
  isRecording: boolean;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  hairSettings,
  setHairSettings,
  studioSettings,
  setStudioSettings,
  teleprompter,
  setTeleprompter,
  onApplyPreset,
  onTakeSnapshot,
  onStartRecording,
  isRecording,
}) => {
  const [activeTab, setActiveTab] = useState<'hair' | 'env' | 'teleprompter'>('hair');

  return (
    <div className="w-full h-full flex flex-col glass-panel border-t lg:border-t-0 lg:border-l border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Dock Tabs Header */}
      <div className="flex items-center border-b border-white/10 p-2 gap-1.5 bg-neutral-950/60">
        <button
          onClick={() => setActiveTab('hair')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'hair'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Hair Lab</span>
          {hairSettings.height > 1.5 && (
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('env')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'env'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Loft & Props</span>
        </button>

        <button
          onClick={() => setActiveTab('teleprompter')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'teleprompter'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Script</span>
          {teleprompter.isOpen && (
            <span className="w-2 h-2 rounded-full bg-sky-400" />
          )}
        </button>
      </div>

      {/* Dock Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === 'hair' && (
          <HairControls
            hairSettings={hairSettings}
            setHairSettings={setHairSettings}
            onApplyPreset={onApplyPreset}
          />
        )}

        {activeTab === 'env' && (
          <EnvironmentControls
            studioSettings={studioSettings}
            setStudioSettings={setStudioSettings}
          />
        )}

        {activeTab === 'teleprompter' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Presentation Script & Notes
              </label>
              <button
                onClick={() =>
                  setTeleprompter((prev) => ({ ...prev, isOpen: !prev.isOpen }))
                }
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  teleprompter.isOpen
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                }`}
              >
                {teleprompter.isOpen ? 'Active on Screen' : 'Show Overlay'}
              </button>
            </div>

            <textarea
              value={teleprompter.text}
              onChange={(e) =>
                setTeleprompter((prev) => ({ ...prev, text: e.target.value }))
              }
              rows={9}
              placeholder="Paste or write your demo presentation script here..."
              className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-3.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
            />

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Tip: The teleprompter floats right in your eye-line so you can look directly into the camera while reading your keynote notes!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dock Quick Action Footer */}
      <div className="p-3.5 border-t border-white/10 bg-neutral-950/80 flex items-center justify-between gap-2.5">
        <button
          onClick={onTakeSnapshot}
          className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Save Still</span>
        </button>

        <button
          onClick={onStartRecording}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-orange-500/25'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>{isRecording ? 'Recording...' : 'Record Demo'}</span>
        </button>
      </div>
    </div>
  );
};
