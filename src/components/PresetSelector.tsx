import React from 'react';
import { CompressionPreset, CompressionSettings, PresetId, VideoSource } from '../types/video';
import { COMPRESSION_PRESETS } from '../utils/presets';
import { formatBytes, formatBitrate } from '../utils/formatters';
import { Sparkles, Sliders, ArrowRight, Zap, Target, CheckCircle2 } from 'lucide-react';

interface PresetSelectorProps {
  source: VideoSource;
  settings: CompressionSettings;
  onSelectPreset: (presetId: PresetId) => void;
  onCustomMBChange: (mb: number) => void;
  onToggleAdvanced: () => void;
  isAdvancedOpen: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  source,
  settings,
  onSelectPreset,
  onCustomMBChange,
  onToggleAdvanced,
  isAdvancedOpen
}) => {
  const originalMB = source.sizeBytes / (1024 * 1024);
  const targetMB = settings.targetMB;
  const projectedSavedMB = Math.max(0, originalMB - targetMB);
  const projectedPercent = originalMB > 0 
    ? Math.min(98, Math.max(0, (projectedSavedMB / originalMB) * 100))
    : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <span>Pilih Tingkat Kompresi Video</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Tersedia preset ekstrem 90% (500 MB ➔ 50 MB) atau ketik langsung target ukuran MB yang diinginkan.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAdvanced}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
            isAdvancedOpen
              ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
              : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>{isAdvancedOpen ? 'Tutup Pengaturan Bitrate' : 'Kustomisasi Bitrate & Resolusi'}</span>
        </button>
      </div>

      {/* Preset Cards Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {COMPRESSION_PRESETS.map((preset: CompressionPreset) => {
          const isSelected = settings.presetId === preset.id;
          
          // Calculate approx resulting MB for this card
          let approxMB = 50;
          if (preset.targetFixedMB) {
            approxMB = preset.targetFixedMB;
          } else if (preset.targetRatio) {
            approxMB = originalMB * preset.targetRatio;
          }

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-lg shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {preset.label}
                </span>
                {preset.tag && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      preset.isPopular
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {preset.tag}
                  </span>
                )}
              </div>

              <div className="mt-1 text-xs font-semibold text-blue-400">
                {preset.reductionLabel}
              </div>

              <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Estimasi Hasil:</span>
                <span className="font-bold text-white tabular-nums">
                  ~{approxMB.toFixed(1)} MB
                </span>
              </div>
            </button>
          );
        })}

        {/* Custom Target MB Card */}
        <div
          onClick={() => onSelectPreset('custom-mb')}
          className={`relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
            settings.presetId === 'custom-mb'
              ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-lg shadow-blue-500/10'
              : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Target className="h-4 w-4 text-cyan-400" />
              <span>Target Ukuran Kustom</span>
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/50">
              Input Bebas
            </span>
          </div>

          <div className="mt-1 text-xs font-semibold text-cyan-400">
            Tentukan Ukuran MB Maksimal
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={Math.max(10, Math.floor(originalMB))}
              step="1"
              value={settings.targetMB || 50}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onCustomMBChange(val);
                }
              }}
              onFocus={() => onSelectPreset('custom-mb')}
              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
            <span className="text-xs font-bold text-slate-300">MB</span>

            {/* Quick Chips */}
            <div className="flex gap-1 ml-auto">
              {[25, 50, 100].map((mb) => (
                <button
                  key={mb}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPreset('custom-mb');
                    onCustomMBChange(mb);
                  }}
                  className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                    settings.targetMB === mb && settings.presetId === 'custom-mb'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mb}M
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Sistem otomatis menghitung bitrate untuk mencapai target persis.
          </div>
        </div>
      </div>

      {/* Real-time Projection Summary Box */}
      <div className="mt-6 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-950/30 via-slate-900/40 to-cyan-950/30 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">
                Proyeksi Hasil Kompresi
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-slate-300 font-mono tabular-nums">
                  {formatBytes(source.sizeBytes)}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-lg font-extrabold text-blue-400 font-mono tabular-nums">
                  ~{targetMB.toFixed(1)} MB
                </span>
                <span className="rounded-md bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs font-bold font-mono border border-emerald-500/30">
                  -{projectedPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
            <div>
              <span className="text-slate-500 block">Bitrate Target:</span>
              <span className="font-semibold text-white">
                {formatBitrate(settings.videoBitrateKbps)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Resolusi Output:</span>
              <span className="font-semibold text-white">
                {settings.targetWidth}×{settings.targetHeight}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Format:</span>
              <span className="font-semibold text-emerald-400 uppercase">
                {settings.format} (H.264)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
