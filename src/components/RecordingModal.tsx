import React, { useEffect } from 'react';
import {
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecordingModalProps {
  isOpen: boolean;
  blobUrl: string | null;
  recordedBlob: Blob | null;
  durationSec: number;
  onClose: () => void;
  onDownload: () => void;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({
  isOpen,
  blobUrl,
  recordedBlob,
  durationSec,
  onClose,
  onDownload,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#38bdf8', '#ec4899', '#10b981'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !blobUrl) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Demo Recording Ready!
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-neutral-400">
                Duration: {formatTime(durationSec)} • Size:{' '}
                {recordedBlob ? formatSize(recordedBlob.size) : 'Ready'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner">
          <video
            src={blobUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Discard</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <button
              onClick={() => {
                if (navigator.share && recordedBlob) {
                  const file = new File([recordedBlob], 'demogod-demo.webm', {
                    type: recordedBlob.type,
                  });
                  navigator.share({
                    title: 'Hair-Raising Demogod Demo',
                    files: [file],
                  }).catch(() => {});
                } else {
                  onDownload();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Share</span>
            </button>

            <button
              onClick={onDownload}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download Video (.webm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
