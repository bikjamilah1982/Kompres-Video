import React from 'react';
import { Film, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
  isLoadingSample: boolean;
  onReset: () => void;
  hasActiveVideo: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  isLoadingSample,
  onReset,
  hasActiveVideo
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Film className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-100">
            Micro<span className="text-blue-500">Video</span>
          </span>
        </button>

        {/* Zone 2: Informational / Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Pemrosesan Lokal</span>
          </div>
          <span className="text-slate-700">·</span>
          <span>Kompresi Ekstrem 90%</span>
          <span className="text-slate-700">·</span>
          <span>Ekspor MP4 Universal</span>
          <span className="text-slate-700">·</span>
          <a href="#panduan-kompresi" className="hover:text-blue-400 transition-colors">
            Panduan Bitrate
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasActiveVideo ? (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white whitespace-nowrap shrink-0"
            >
              Ganti Video
            </button>
          ) : (
            <button
              onClick={onLoadSample}
              disabled={isLoadingSample}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-lg disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isLoadingSample ? 'Menyiapkan Sampel...' : 'Coba Video Demo HD'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
