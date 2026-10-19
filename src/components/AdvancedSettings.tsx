import React from 'react';
import { CompressionSettings, VideoSource } from '../types/video';
import { formatBitrate } from '../utils/formatters';
import { Sliders, Volume2, VolumeX, Gauge, Monitor, FileCode } from 'lucide-react';

interface AdvancedSettingsProps {
  source: VideoSource;
  settings: CompressionSettings;
  onChange: (updated: Partial<CompressionSettings>) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  source,
  settings,
  onChange
}) => {
  const handleResolutionScaleChange = (scale: number) => {
    const targetWidth = Math.max(16, Math.floor((source.width * scale) / 2) * 2);
    const targetHeight = Math.max(16, Math.floor((source.height * scale) / 2) * 2);
    onChange({
      resolutionScale: scale,
      targetWidth,
      targetHeight
    });
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Sliders className="h-4 w-4 text-blue-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Pengaturan Lanjutan Bitrate & Output
        </h4>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slider 1: Video Bitrate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-blue-400" />
              <span>Bitrate Video (kbps)</span>
            </label>
            <span className="text-xs font-bold text-blue-400 font-mono tabular-nums">
              {formatBitrate(settings.videoBitrateKbps)}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="12000"
            step="50"
            value={settings.videoBitrateKbps}
            onChange={(e) => {
              const kbps = parseInt(e.target.value, 10);
              const targetMB = parseFloat((((kbps + settings.audioBitrateKbps) * source.duration) / (8 * 1024)).toFixed(1));
              onChange({ videoBitrateKbps: kbps, targetMB, presetId: 'manual' });
            }}
            className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>100 kbps (Ekstrem Kecil)</span>
            <span>2.500 kbps (HD)</span>
            <span>12.000 kbps (Master)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Nilai bitrate lebih rendah menghasilkan ukuran file jauh lebih kecil. Untuk kompresi 500 MB ke 50 MB, disarankan 1.000 - 1.800 kbps.
          </p>
        </div>

        {/* Resolution Scaling */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5 text-cyan-400" />
              <span>Skala Resolusi</span>
            </label>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {settings.targetWidth}×{settings.targetHeight} ({Math.round(settings.resolutionScale * 100)}%)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Asli 100%', scale: 1.0 },
              { label: '75%', scale: 0.75 },
              { label: '67% (720p)', scale: 0.67 },
              { label: '50% (Hemat)', scale: 0.5 }
            ].map((item) => (
              <button
                key={item.scale}
                type="button"
                onClick={() => handleResolutionScaleChange(item.scale)}
                className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                  Math.abs(settings.resolutionScale - item.scale) < 0.03
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            Menurunkan resolusi ke 720p menjaga ketajaman pada layar HP/laptop dan memotong beban kompresi hingga 50%.
          </p>
        </div>

        {/* Audio Quality & Bitrate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              {settings.muteAudio ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>Bitrate Audio (AAC)</span>
            </label>
            <button
              type="button"
              onClick={() => onChange({ muteAudio: !settings.muteAudio })}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                settings.muteAudio
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {settings.muteAudio ? 'Audio Dimatikan (Mute)' : 'Heningkan Audio?'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[64, 96, 128, 192].map((kbps) => (
              <button
                key={kbps}
                type="button"
                disabled={settings.muteAudio}
                onClick={() => onChange({ audioBitrateKbps: kbps })}
                className={`py-2 px-2 text-xs font-mono font-medium rounded-lg border transition-all text-center disabled:opacity-30 ${
                  settings.audioBitrateKbps === kbps && !settings.muteAudio
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {kbps} kbps
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            96 kbps adalah standar optimal untuk suara & musik jernih tanpa memboroskan megabyte.
          </p>
        </div>

        {/* Output Format & Speed */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>Format Output & Kecepatan Encode</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Format Video:</span>
              <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => onChange({ format: 'mp4' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                    settings.format === 'mp4'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MP4 (H.264)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ format: 'webm' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                    settings.format === 'webm'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WebM (VP9)
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Kecepatan Encode:</span>
              <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
                {[
                  { label: '1x', speed: 1 },
                  { label: '1.5x', speed: 1.5 },
                  { label: '2x', speed: 2 }
                ].map((item) => (
                  <button
                    key={item.speed}
                    type="button"
                    onClick={() => onChange({ playbackSpeed: item.speed })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                      settings.playbackSpeed === item.speed
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            1.5x mempercepat pemrosesan video tanpa menurunkan kualitas visual secara signifikan.
          </p>
        </div>
      </div>
    </div>
  );
};
