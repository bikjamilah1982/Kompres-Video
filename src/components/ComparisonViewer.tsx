import React, { useRef, useState, useEffect } from 'react';
import { CompressionResult, VideoSource } from '../types/video';
import { formatBytes, formatBitrate, formatDuration } from '../utils/formatters';
import { 
  Download, 
  RotateCcw, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  HardDrive, 
  Clock, 
  Zap, 
  Layers
} from 'lucide-react';

interface ComparisonViewerProps {
  source: VideoSource;
  result: CompressionResult;
  onReset: () => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  source,
  result,
  onReset
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'compressed-only' | 'original-only'>('side-by-side');

  const origVideoRef = useRef<HTMLVideoElement>(null);
  const compVideoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (origVideoRef.current) {
      if (nextState) origVideoRef.current.play().catch(() => {});
      else origVideoRef.current.pause();
    }
    if (compVideoRef.current) {
      if (nextState) compVideoRef.current.play().catch(() => {});
      else compVideoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    // Keep playback synchronized
    if (origVideoRef.current && compVideoRef.current) {
      const diff = Math.abs(origVideoRef.current.currentTime - compVideoRef.current.currentTime);
      if (diff > 0.15) {
        compVideoRef.current.currentTime = origVideoRef.current.currentTime;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (origVideoRef.current) origVideoRef.current.currentTime = time;
    if (compVideoRef.current) compVideoRef.current.currentTime = time;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Success & Massive Reduction Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Kompresi Berhasil Selesai
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ukuran Berkurang Hingga{' '}
              <span className="text-emerald-400 font-mono">
                {result.reductionPercentage}%
              </span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="font-semibold line-through text-slate-400 font-mono">
                {formatBytes(result.originalSizeBytes)}
              </span>
              <span className="text-slate-500">➔</span>
              <span className="text-xl font-bold text-white font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {formatBytes(result.compressedSizeBytes)}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                Hemat {formatBytes(result.savedBytes)}!
              </span>
            </div>
          </div>

          {/* Primary Action: Download Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:from-emerald-500 hover:to-teal-400 hover:shadow-xl active:scale-95"
            >
              <Download className="h-5 w-5" />
              <span>Unduh Video MP4 ({formatBytes(result.compressedSizeBytes)})</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Kompres Video Lain</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Bitrate Akhir:</span>
            <span className="font-semibold text-slate-200">{formatBitrate(result.finalBitrateKbps)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Resolusi:</span>
            <span className="font-semibold text-slate-200">{result.width}×{result.height}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Waktu Proses:</span>
            <span className="font-semibold text-slate-200">{(result.processingTimeMs / 1000).toFixed(1)} detik</span>
          </div>
          <div>
            <span className="text-slate-500 block">Format:</span>
            <span className="font-semibold text-emerald-400 uppercase">MP4 H.264</span>
          </div>
        </div>
      </div>

      {/* Comparison Player Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <h4 className="text-base font-bold text-white">
              Bandingkan Kualitas Video Sebelum vs Sesudah
            </h4>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            <button
              onClick={() => setActiveTab('side-by-side')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'side-by-side'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Berdampingan
            </button>
            <button
              onClick={() => setActiveTab('compressed-only')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'compressed-only'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hasil Kompresi Saja
            </button>
            <button
              onClick={() => setActiveTab('original-only')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'original-only'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Video Asli Saja
            </button>
          </div>
        </div>

        {/* Video Containers */}
        <div className={`mt-5 grid gap-4 ${activeTab === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Original Player */}
          {(activeTab === 'side-by-side' || activeTab === 'original-only') && (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black border border-slate-800">
              <div className="absolute top-3 left-3 z-10 rounded-md bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-300 border border-slate-700/50">
                Sebelum ({formatBytes(result.originalSizeBytes)})
              </div>
              <video
                ref={origVideoRef}
                src={source.url}
                className="h-full w-full object-contain"
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Compressed Player */}
          {(activeTab === 'side-by-side' || activeTab === 'compressed-only') && (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black border border-emerald-500/40 shadow-lg shadow-emerald-950/20">
              <div className="absolute top-3 left-3 z-10 rounded-md bg-emerald-950/80 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                Sesudah ({formatBytes(result.compressedSizeBytes)} · -{result.reductionPercentage}%)
              </div>
              <video
                ref={compVideoRef}
                src={result.url}
                className="h-full w-full object-contain"
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}
        </div>

        {/* Unified Synchronized Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="w-full flex-1">
            <input
              type="range"
              min="0"
              max={source.duration || 10}
              step="0.05"
              defaultValue="0"
              onChange={handleSeek}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="text-xs font-mono text-slate-400 shrink-0">
            Durasi: {formatDuration(source.duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
