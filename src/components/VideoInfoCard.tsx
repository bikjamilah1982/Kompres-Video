import React, { useRef, useState } from 'react';
import { VideoSource } from '../types/video';
import { formatBytes, formatBitrate, formatDuration } from '../utils/formatters';
import { Play, Pause, RefreshCw, Clock, Maximize2, Activity, HardDrive } from 'lucide-react';

interface VideoInfoCardProps {
  source: VideoSource;
  onReset: () => void;
}

export const VideoInfoCard: React.FC<VideoInfoCardProps> = ({ source, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const resolutionLabel = () => {
    if (source.height >= 2160) return '4K Ultra HD';
    if (source.height >= 1440) return '2K QHD';
    if (source.height >= 1080) return '1080p Full HD';
    if (source.height >= 720) return '720p HD';
    return `${source.width}×${source.height}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Video Sumber
            </span>
            {source.isSample && (
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Video Demo
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-base font-semibold text-white" title={source.name}>
            {source.name}
          </h3>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Ganti Video</span>
        </button>
      </div>

      {/* Grid: Player Preview + Key Specs */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Video Player */}
        <div className="md:col-span-5 relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-slate-800 group">
          <video
            ref={videoRef}
            src={source.url}
            className="h-full w-full object-contain"
            playsInline
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:opacity-100 focus:opacity-100"
            aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </div>
          </button>
        </div>

        {/* Video Specs Breakdown */}
        <div className="md:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HardDrive className="h-3.5 w-3.5 text-blue-400" />
              <span>Ukuran Asli</span>
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
              {formatBytes(source.sizeBytes)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {(source.sizeBytes / (1024 * 1024)).toFixed(1)} MB
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Durasi</span>
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
              {formatDuration(source.duration)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {source.duration.toFixed(1)} detik
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Resolusi</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {source.width}×{source.height}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {resolutionLabel()}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Bitrate Asli</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              {formatBitrate(source.originalBitrateKbps)}
            </div>
            <div className="text-[11px] text-slate-500">
              Kepadatan data master
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
