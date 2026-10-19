import React from 'react';
import { CompressionProgress, CompressionSettings, VideoSource } from '../types/video';
import { formatDuration, formatTimeRemaining } from '../utils/formatters';
import { Loader2, XCircle, HardDrive, Cpu, ShieldCheck } from 'lucide-react';

interface CompressionProgressModalProps {
  source: VideoSource;
  settings: CompressionSettings;
  progress: CompressionProgress;
  onCancel: () => void;
}

export const CompressionProgressModal: React.FC<CompressionProgressModalProps> = ({
  source,
  settings,
  progress,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl shadow-blue-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Memproses Kompresi Video...
              </h3>
              <p className="text-xs text-slate-400">
                Mengompres ke target ~{settings.targetMB} MB (H.264 MP4)
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Batalkan proses"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Display */}
        <div className="mt-6 text-center">
          <div className="text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {progress.percent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs font-mono text-slate-400 tabular-nums">
            {formatDuration(progress.currentSeconds)} / {formatDuration(source.duration)}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-6 overflow-hidden rounded-full bg-slate-800 p-0.5 border border-slate-700/50">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 transition-all duration-150 shadow-sm"
            style={{ width: `${Math.max(2, Math.min(100, progress.percent))}%` }}
          />
        </div>

        {/* Status Message */}
        <div className="mt-3 text-center text-xs text-slate-400 font-mono">
          {progress.statusMessage || 'Sedang merender & mengompres frame...'}
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
          <div>
            <span className="text-slate-500 block">Waktu Berjalan:</span>
            <span className="font-mono font-semibold text-slate-200 tabular-nums">
              {(progress.elapsedMs / 1000).toFixed(1)} detik
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Estimasi Sisa Waktu:</span>
            <span className="font-mono font-semibold text-cyan-400 tabular-nums">
              {formatTimeRemaining(progress.estimatedRemainingMs)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Resolusi Target:</span>
            <span className="font-mono font-semibold text-slate-200">
              {settings.targetWidth}×{settings.targetHeight}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Bitrate Video:</span>
            <span className="font-mono font-semibold text-blue-400">
              {Math.round(settings.videoBitrateKbps)} kbps
            </span>
          </div>
        </div>

        {/* Privacy Note & Cancel */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Semua proses berjalan di RAM lokal</span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
};
