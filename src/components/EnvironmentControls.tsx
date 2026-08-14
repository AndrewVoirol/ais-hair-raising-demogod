import React from 'react';
import {
  Laptop,
  Coffee,
  Glasses,
  Shirt,
  Sliders,
  Sun,
  Camera,
  Layers,
} from 'lucide-react';
import type { StudioSettings, LutFilterType } from '../types/studio';

interface EnvironmentControlsProps {
  studioSettings: StudioSettings;
  setStudioSettings: React.Dispatch<React.SetStateAction<StudioSettings>>;
}

export const EnvironmentControls: React.FC<EnvironmentControlsProps> = ({
  studioSettings,
  setStudioSettings,
}) => {
  const lutFilters: { id: LutFilterType; name: string; desc: string; badge: string }[] = [
    { id: 'warm_loft', name: 'Brooklyn Warm', desc: 'Warm exposed brick tones', badge: 'Cozy' },
    { id: 'io_keynote', name: 'Google I/O Keynote', desc: 'Sleek keynote blue/magenta tint', badge: 'Tech' },
    { id: 'crisp_tech', name: 'Studio Crisp', desc: 'High-clarity neutral studio light', badge: 'Clean' },
    { id: 'cinematic_teal', name: 'Cinematic Teal', desc: 'Modern 35mm cinema grade', badge: 'Cinema' },
    { id: 'noir', name: 'Studio Noir', desc: 'Moody high-contrast monochrome', badge: 'Moody' },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Props & Presenter Fit Toggles */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5" />
          Desk Props & Presenter Fit
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* DeepMind Laptop */}
          <button
            onClick={() =>
              setStudioSettings((prev) => ({
                ...prev,
                showLaptopProps: !prev.showLaptopProps,
              }))
            }
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              studioSettings.showLaptopProps
                ? 'bg-amber-500/15 border-amber-500/40 text-white'
                : 'bg-neutral-900/60 border-white/5 text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-xs font-bold text-neutral-200">
                  DeepMind Laptop
                </div>
                <div className="text-[10px] text-neutral-400">
                  Rainbow I/O sticker
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                studioSettings.showLaptopProps
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'border-neutral-600 text-neutral-600'
              }`}
            >
              {studioSettings.showLaptopProps ? '✓' : ''}
            </span>
          </button>

          {/* Yellow Ribbed Mug */}
          <button
            onClick={() =>
              setStudioSettings((prev) => ({
                ...prev,
                showMugProps: !prev.showMugProps,
              }))
            }
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              studioSettings.showMugProps
                ? 'bg-amber-500/15 border-amber-500/40 text-white'
                : 'bg-neutral-900/60 border-white/5 text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coffee className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-xs font-bold text-neutral-200">
                  Yellow Ribbed Mug
                </div>
                <div className="text-[10px] text-neutral-400">
                  Brooklyn loft ceramic
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                studioSettings.showMugProps
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'border-neutral-600 text-neutral-600'
              }`}
            >
              {studioSettings.showMugProps ? '✓' : ''}
            </span>
          </button>

          {/* Designer Round Glasses */}
          <button
            onClick={() =>
              setStudioSettings((prev) => ({
                ...prev,
                showGlasses: !prev.showGlasses,
              }))
            }
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              studioSettings.showGlasses
                ? 'bg-amber-500/15 border-amber-500/40 text-white'
                : 'bg-neutral-900/60 border-white/5 text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Glasses className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-neutral-200">
                  Round Glasses
                </div>
                <div className="text-[10px] text-neutral-400">
                  Signature tortoiseshell
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                studioSettings.showGlasses
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'border-neutral-600 text-neutral-600'
              }`}
            >
              {studioSettings.showGlasses ? '✓' : ''}
            </span>
          </button>

          {/* Black Crewneck Fit */}
          <button
            onClick={() =>
              setStudioSettings((prev) => ({
                ...prev,
                showOutfit: !prev.showOutfit,
              }))
            }
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              studioSettings.showOutfit
                ? 'bg-amber-500/15 border-amber-500/40 text-white'
                : 'bg-neutral-900/60 border-white/5 text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shirt className="w-4 h-4 text-neutral-300" />
              <div>
                <div className="text-xs font-bold text-neutral-200">
                  Black Crewneck Fit
                </div>
                <div className="text-[10px] text-neutral-400">
                  Oversized presenter tee
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                studioSettings.showOutfit
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'border-neutral-600 text-neutral-600'
              }`}
            >
              {studioSettings.showOutfit ? '✓' : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Loft Atmosphere & Depth of Field Sliders */}
      <div className="space-y-4 bg-neutral-900/60 border border-white/10 rounded-2xl p-4 shadow-inner">
        {/* Background Depth / Blur */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              Loft Depth of Field / Bokeh Blur
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {studioSettings.backgroundBlur}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={studioSettings.backgroundBlur}
            onChange={(e) =>
              setStudioSettings((prev) => ({
                ...prev,
                backgroundBlur: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>Sharp Brick (0px)</span>
            <span>Studio F/2.8 (6px)</span>
            <span>Dreamy Bokeh (20px)</span>
          </div>
        </div>

        {/* Ambient Loft Warmth */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              Ambient Loft Warmth & Light
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {studioSettings.ambientWarmth}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={studioSettings.ambientWarmth}
            onChange={(e) =>
              setStudioSettings((prev) => ({
                ...prev,
                ambientWarmth: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Studio Color Grading LUTs */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
          <Sliders className="w-3.5 h-3.5" />
          Studio Color Grading & Lighting LUTs
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lutFilters.map((lut) => {
            const isActive = studioSettings.lutFilter === lut.id;
            return (
              <button
                key={lut.id}
                onClick={() =>
                  setStudioSettings((prev) => ({ ...prev, lutFilter: lut.id }))
                }
                className={`p-2.5 rounded-xl text-left border flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-neutral-900/70 border-white/5 text-neutral-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                    {lut.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {lut.desc}
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                  {lut.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
