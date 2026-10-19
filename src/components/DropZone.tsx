import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles, FileVideo, ShieldCheck, Zap, HardDrive } from 'lucide-react';

interface DropZoneProps {
  onVideoSelected: (file: File) => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onVideoSelected,
  onLoadSample,
  isLoadingSample
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name)) {
        onVideoSelected(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onVideoSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex min-h-[380px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-950/20 shadow-2xl shadow-blue-500/10 scale-[1.005]'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Central Icon */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/30 text-blue-400 shadow-inner">
          <UploadCloud className="h-10 w-10 animate-bounce" style={{ animationDuration: '2.5s' }} />
        </div>

        {/* Headline & Subhead */}
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Tarik & Lepas Video Anda di Sini
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Mendukung video resolusi tinggi berukuran besar hingga <span className="text-slate-200 font-semibold">500 MB+</span> untuk dikompresi menjadi <span className="text-blue-400 font-semibold">50 MB</span> secara instan.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-xl active:scale-[0.98]"
          >
            <FileVideo className="h-4 w-4" />
            <span>Pilih File Video</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            disabled={isLoadingSample}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>{isLoadingSample ? 'Membuat Sampel Video...' : 'Coba Video Demo HD (Sample)'}</span>
          </button>
        </div>

        {/* Formats info */}
        <div className="mt-6 text-xs text-slate-500">
          Mendukung format MP4, MOV, WebM, AVI, MKV · Ekspor universal MP4 H.264
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl pt-6 border-t border-slate-800/60">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>100% Offline & Privat (No Server Upload)</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <HardDrive className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Kompresi Ekstrem 90% (10x Lebih Kecil)</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Akselerasi Grafis Hardware Klien</span>
          </div>
        </div>
      </div>
    </div>
  );
};
