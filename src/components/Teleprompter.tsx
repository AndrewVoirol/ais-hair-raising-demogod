import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Type,
  X,
  Sparkles,
} from 'lucide-react';
import type { TeleprompterSettings } from '../types/studio';

interface TeleprompterProps {
  settings: TeleprompterSettings;
  setSettings: React.Dispatch<React.SetStateAction<TeleprompterSettings>>;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({
  settings,
  setSettings,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sampleKeynoteScript = `Welcome to Google I/O! Today, we are thrilled to unveil our next-generation multimodal AI models.

Notice the unprecedented reasoning capabilities, real-time audio-visual comprehension, and instantaneous response latency.

As you can see right here on my DeepMind workstation, complex multimodal agentic workflows now execute directly in your browser with zero server latency.

And of course, when the demo works flawlessly on the first try... my hair literally rises to the occasion!

Thank you all, and let's dive straight into the code.`;

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (settings.isScrolling && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += settings.speed * 28 * dt;
      }

      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animId);
  }, [settings.isScrolling, settings.speed]);

  if (!settings.isOpen) return null;

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg rounded-2xl glass-panel-glow border border-amber-500/40 p-4 z-30 shadow-2xl transition-all"
      style={{ backgroundColor: `rgba(15, 15, 20, ${settings.opacity})` }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Studio Teleprompter
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setSettings((prev) => ({ ...prev, text: sampleKeynoteScript }))
            }
            className="text-[10px] text-amber-400 hover:text-amber-300 font-medium px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Keynote Script
          </button>

          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
              }
            }}
            title="Reset to Top"
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSettings((prev) => ({ ...prev, isOpen: false }))}
            className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="h-36 overflow-y-auto teleprompter-track pr-2 text-center select-none"
      >
        <div
          className="font-medium text-amber-100/90 leading-relaxed transition-all"
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {settings.text.split('\n\n').map((para, i) => (
            <p key={i} className="mb-3">
              {para}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          onClick={() =>
            setSettings((prev) => ({ ...prev, isScrolling: !prev.isScrolling }))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            settings.isScrolling
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {settings.isScrolling ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Scroll</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-400">Speed:</span>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={settings.speed}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, speed: parseInt(e.target.value) }))
            }
            className="w-16"
          />
          <span className="font-mono text-[10px] text-amber-300 w-4">
            {settings.speed}x
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Type className="w-3 h-3 text-neutral-400" />
          <input
            type="range"
            min="14"
            max="26"
            step="1"
            value={settings.fontSize}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                fontSize: parseInt(e.target.value),
              }))
            }
            className="w-14"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-neutral-400" />
          <input
            type="range"
            min="0.3"
            max="0.95"
            step="0.05"
            value={settings.opacity}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                opacity: parseFloat(e.target.value),
              }))
            }
            className="w-14"
          />
        </div>
      </div>
    </div>
  );
};
