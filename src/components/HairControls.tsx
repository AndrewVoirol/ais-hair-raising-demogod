import React from 'react';
import {
  Sparkles,
  Maximize2,
  ArrowUpNarrowWide,
  Activity,
  Mic,
  RotateCcw,
  Palette,
} from 'lucide-react';
import type { HairSettings } from '../types/studio';

interface HairControlsProps {
  hairSettings: HairSettings;
  setHairSettings: React.Dispatch<React.SetStateAction<HairSettings>>;
  onApplyPreset: (presetId: string) => void;
}

export const HairControls: React.FC<HairControlsProps> = ({
  hairSettings,
  setHairSettings,
  onApplyPreset,
}) => {
  const colorPresets = [
    { id: 'jet_black', name: 'Jet Obsidian', color: '#09090b', highlight: '#ffffff' },
    { id: 'espresso', name: 'Warm Espresso', color: '#27170e', highlight: '#fed7aa' },
    { id: 'golden', name: 'Golden Streak', color: '#451a03', highlight: '#fbbf24' },
    { id: 'cyber_blue', name: 'Cyber I/O Blue', color: '#0f172a', highlight: '#38bdf8' },
    { id: 'neon_pink', name: 'Electric Magenta', color: '#4a044e', highlight: '#f43f5e' },
    { id: 'super_gold', name: 'Demogod Gold', color: '#78350f', highlight: '#fde047' },
  ];

  const hairPresets = [
    { id: 'keynote', name: 'I/O Keynote', desc: 'Natural voluminous sweep', height: 1.0, bigness: 1.0, shine: 65 },
    { id: 'mega_pompadour', name: 'Mega Pompadour', desc: 'Extra tall & textured', height: 1.8, bigness: 1.35, shine: 80 },
    { id: 'sky_high', name: 'Sky-High Demogod', desc: 'Maximum gravity-defying height', height: 2.8, bigness: 1.7, shine: 95 },
    { id: 'sleek', name: 'Sleek Minimal', desc: 'Clean executive crop', height: 0.65, bigness: 0.85, shine: 40 },
    { id: 'hyper_gloss', name: 'Hyper Pomade', desc: 'Ultra shiny high-gloss', height: 1.2, bigness: 1.1, shine: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Hair Style Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Signature Hair Presets
          </label>
          <button
            onClick={() => onApplyPreset('keynote')}
            className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Default
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {hairPresets.map((p) => {
            const isSelected = hairSettings.activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setHairSettings((prev) => ({
                    ...prev,
                    height: p.height,
                    bigness: p.bigness,
                    shininess: p.shine,
                    activePresetId: p.id,
                  }));
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white'
                    : 'bg-neutral-900/70 border-white/5 text-neutral-300 hover:bg-white/5 hover:border-white/15'
                }`}
              >
                <div className="text-xs font-bold text-neutral-100 flex items-center justify-between">
                  {p.name}
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Real-Time Hair Sliders */}
      <div className="space-y-5 bg-neutral-900/60 border border-white/10 rounded-2xl p-4 shadow-inner">
        {/* 1. Tallness / Height Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <ArrowUpNarrowWide className="w-4 h-4 text-amber-400" />
              Hair Tallness & Height
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {Math.round(hairSettings.height * 100)}%
              </span>
              <button
                onClick={() => setHairSettings((prev) => ({ ...prev, height: 1.0 }))}
                title="Reset to 100%"
                className="text-[10px] text-neutral-400 hover:text-white px-1"
              >
                1x
              </button>
              <button
                onClick={() => setHairSettings((prev) => ({ ...prev, height: 2.5 }))}
                title="Max demogod height"
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold px-1"
              >
                Max ⚡
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.2"
            step="0.05"
            value={hairSettings.height}
            onChange={(e) =>
              setHairSettings((prev) => ({
                ...prev,
                height: parseFloat(e.target.value),
                activePresetId: undefined,
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>Sleek (50%)</span>
            <span>Natural (100%)</span>
            <span>Demogod (200%)</span>
            <span>Sky-High (320%)</span>
          </div>
        </div>

        {/* 2. Bigness / Width & Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-amber-400" />
              Hair Bigness & Volume
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {Math.round(hairSettings.bigness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.4"
            step="0.05"
            value={hairSettings.bigness}
            onChange={(e) =>
              setHairSettings((prev) => ({
                ...prev,
                bigness: parseFloat(e.target.value),
                activePresetId: undefined,
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>Tight Crop (50%)</span>
            <span>Standard (100%)</span>
            <span>Lion's Mane (240%)</span>
          </div>
        </div>

        {/* 3. Shininess & Specular Gloss Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Shininess & Specular Gloss
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${hairSettings.color} 75%)`,
                  opacity: Math.max(0.3, hairSettings.shininess / 100),
                }}
              />
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hairSettings.shininess}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={hairSettings.shininess}
            onChange={(e) =>
              setHairSettings((prev) => ({
                ...prev,
                shininess: parseInt(e.target.value),
                activePresetId: undefined,
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>Matte Clay (0%)</span>
            <span>Natural Sheen (50%)</span>
            <span>High Gloss Pomade (100%)</span>
          </div>
        </div>
      </div>

      {/* Hair Dynamics & Physics Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Spring Physics */}
        <button
          onClick={() =>
            setHairSettings((prev) => ({ ...prev, physics: !prev.physics }))
          }
          className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
            hairSettings.physics
              ? 'bg-amber-500/15 border-amber-500/40 text-white'
              : 'bg-neutral-900/60 border-white/5 text-neutral-400'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold flex items-center gap-1.5 text-neutral-200">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Hair Inertia Physics
            </div>
            <div className="text-[10px] text-neutral-400">
              Spring bounce on head nods & turns
            </div>
          </div>
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
              hairSettings.physics
                ? 'bg-amber-500 text-black border-amber-400'
                : 'border-neutral-600 text-neutral-600'
            }`}
          >
            {hairSettings.physics ? '✓' : ''}
          </span>
        </button>

        {/* Audio-Reactive Voice Bounce */}
        <button
          onClick={() =>
            setHairSettings((prev) => ({
              ...prev,
              audioReactive: !prev.audioReactive,
            }))
          }
          className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
            hairSettings.audioReactive
              ? 'bg-amber-500/15 border-amber-500/40 text-white'
              : 'bg-neutral-900/60 border-white/5 text-neutral-400'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold flex items-center gap-1.5 text-neutral-200">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              Audio-Reactive Bounce
            </div>
            <div className="text-[10px] text-neutral-400">
              Hair pulses with your speaking voice
            </div>
          </div>
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
              hairSettings.audioReactive
                ? 'bg-amber-500 text-black border-amber-400'
                : 'border-neutral-600 text-neutral-600'
            }`}
          >
            {hairSettings.audioReactive ? '✓' : ''}
          </span>
        </button>
      </div>

      {/* Hair Color Palette */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
          <Palette className="w-3.5 h-3.5" />
          Hair Color & Gloss Tint
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {colorPresets.map((c) => {
            const isCurrent = hairSettings.color === c.color;
            return (
              <button
                key={c.id}
                onClick={() =>
                  setHairSettings((prev) => ({
                    ...prev,
                    color: c.color,
                    highlightColor: c.highlight,
                  }))
                }
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-white/10 ring-1 ring-amber-400 shadow-md'
                    : 'border-white/5 bg-neutral-900/70 hover:bg-white/5'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border border-white/30 shadow-inner flex items-center justify-center"
                  style={{
                    backgroundColor: c.color,
                    boxShadow: `0 0 10px ${c.highlight}40`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.highlight }}
                  />
                </div>
                <span className="text-[10px] font-medium text-neutral-300 text-center leading-tight">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
