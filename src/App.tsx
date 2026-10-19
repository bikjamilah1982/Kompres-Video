import React, { useState, useEffect, useRef } from 'react';
import { 
  CompressionProgress, 
  CompressionResult, 
  CompressionSettings, 
  PresetId, 
  VideoSource 
} from './types/video';
import { calculateSettingsForPreset } from './utils/presets';
import { generateSampleVideo } from './utils/sampleVideoGenerator';
import { compressVideo, CompressorController } from './utils/videoCompressor';
import { Navbar } from './components/Navbar';
import { DropZone } from './components/DropZone';
import { VideoInfoCard } from './components/VideoInfoCard';
import { PresetSelector } from './components/PresetSelector';
import { AdvancedSettings } from './components/AdvancedSettings';
import { CompressionProgressModal } from './components/CompressionProgressModal';
import { ComparisonViewer } from './components/ComparisonViewer';
import { HelpAndTips } from './components/HelpAndTips';
import { Play, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<CompressionSettings>({
    presetId: 'extreme-90',
    mode: 'preset',
    targetMB: 50,
    videoBitrateKbps: 1200,
    audioBitrateKbps: 96,
    resolutionScale: 0.67,
    targetWidth: 1280,
    targetHeight: 720,
    fps: 30,
    playbackSpeed: 1.5,
    muteAudio: false,
    format: 'mp4'
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Compression processing state
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<CompressionProgress>({
    status: 'idle',
    percent: 0,
    currentSeconds: 0,
    totalSeconds: 0,
    elapsedMs: 0,
    estimatedRemainingMs: 0
  });
  const [result, setResult] = useState<CompressionResult | null>(null);

  const compressorControllerRef = useRef<CompressorController | null>(null);

  // Handle uploaded video
  const handleVideoSelected = (file: File) => {
    setErrorMessage(null);
    setResult(null);

    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;

    tempVideo.onloadedmetadata = () => {
      const duration = tempVideo.duration || 1;
      const width = tempVideo.videoWidth || 1920;
      const height = tempVideo.videoHeight || 1080;
      const calculatedBitrateKbps = Math.round((file.size * 8) / (duration * 1000));

      const newSource: VideoSource = {
        file,
        name: file.name,
        sizeBytes: file.size,
        duration,
        width,
        height,
        originalBitrateKbps: calculatedBitrateKbps,
        url
      };

      setVideoSource(newSource);

      // Default to extreme 90% preset
      const initialSettings = calculateSettingsForPreset('extreme-90', newSource);
      setSettings(initialSettings);
    };

    tempVideo.onerror = () => {
      setErrorMessage('Gagal memuat video. Pastikan format didukung (MP4, WebM, MOV).');
      URL.revokeObjectURL(url);
    };
  };

  // Handle generated sample video
  const handleLoadSample = async () => {
    try {
      setIsLoadingSample(true);
      setErrorMessage(null);
      setResult(null);

      // Generate a ~8s high bitrate HD test video
      const sample = await generateSampleVideo(8);
      setVideoSource(sample);

      const initialSettings = calculateSettingsForPreset('extreme-90', sample);
      setSettings(initialSettings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat video demo.';
      setErrorMessage(msg);
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Handle preset selection
  const handleSelectPreset = (presetId: PresetId) => {
    if (!videoSource) return;
    const newSettings = calculateSettingsForPreset(presetId, videoSource, settings.targetMB);
    setSettings(newSettings);
  };

  // Handle custom target MB change
  const handleCustomMBChange = (mb: number) => {
    if (!videoSource) return;
    const newSettings = calculateSettingsForPreset('custom-mb', videoSource, mb);
    setSettings(newSettings);
  };

  // Handle manual settings tweaks
  const handleAdvancedSettingsChange = (updated: Partial<CompressionSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updated
    }));
  };

  // Start compression process
  const handleStartCompression = async () => {
    if (!videoSource) return;
    setIsCompressing(true);
    setErrorMessage(null);

    const { promise, controller } = compressVideo(
      videoSource,
      settings,
      (p) => setProgress(p)
    );

    compressorControllerRef.current = controller;

    try {
      const compressionResult = await promise;
      setResult(compressionResult);
    } catch (err: unknown) {
      if (progress.status !== 'cancelled') {
        const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat mengompresi video.';
        setErrorMessage(msg);
      }
    } finally {
      setIsCompressing(false);
      compressorControllerRef.current = null;
    }
  };

  // Cancel ongoing compression
  const handleCancelCompression = () => {
    if (compressorControllerRef.current) {
      compressorControllerRef.current.cancel();
      compressorControllerRef.current = null;
    }
    setIsCompressing(false);
  };

  // Reset all and clean up
  const handleReset = () => {
    if (isCompressing) {
      handleCancelCompression();
    }
    if (videoSource) {
      URL.revokeObjectURL(videoSource.url);
    }
    if (result) {
      URL.revokeObjectURL(result.url);
    }
    setVideoSource(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingSample}
        onReset={handleReset}
        hasActiveVideo={!!videoSource}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* View 1: Zero State (DropZone) */}
        {!videoSource && (
          <div className="space-y-10">
            {/* Hero Kicker & Intro */}
            <div className="text-center max-w-3xl mx-auto pt-4 pb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Teknologi Kompresi Klien H.264 MP4</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Kompres Video Besar hingga <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">90% Lebih Kecil</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Pangkas ukuran video dari <span className="text-slate-200 font-semibold">500 MB menjadi 50 MB</span> dengan kualitas visual tetap jernih. Bebas upload ke server, tanpa watermark, dan 100% aman di perangkat Anda.
              </p>
            </div>

            {/* Drop Zone Box */}
            <DropZone
              onVideoSelected={handleVideoSelected}
              onLoadSample={handleLoadSample}
              isLoadingSample={isLoadingSample}
            />

            {/* Educational & Explanatory Guide */}
            <HelpAndTips />
          </div>
        )}

        {/* View 2: Video Loaded & Configuring (Before Compression) */}
        {videoSource && !result && (
          <div className="space-y-6">
            {/* Video Metadata & Source Player */}
            <VideoInfoCard source={videoSource} onReset={handleReset} />

            {/* Preset Selector & Custom Target MB */}
            <PresetSelector
              source={videoSource}
              settings={settings}
              onSelectPreset={handleSelectPreset}
              onCustomMBChange={handleCustomMBChange}
              onToggleAdvanced={() => setIsAdvancedOpen(!isAdvancedOpen)}
              isAdvancedOpen={isAdvancedOpen}
            />

            {/* Advanced Bitrate & Resolution Controls */}
            {isAdvancedOpen && (
              <AdvancedSettings
                source={videoSource}
                settings={settings}
                onChange={handleAdvancedSettingsChange}
              />
            )}

            {/* Floating / Sticky Bottom Action Bar */}
            <div className="sticky bottom-4 z-30 rounded-2xl border border-blue-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Target Kompresi:</span>{' '}
                <span className="text-blue-400 font-bold font-mono">
                  {settings.presetId === 'extreme-90'
                    ? 'Ekstrem 90% (~' + settings.targetMB + ' MB)'
                    : settings.targetMB + ' MB'}
                </span>{' '}
                · Resolusi {settings.targetWidth}×{settings.targetHeight} · Bitrate {Math.round(settings.videoBitrateKbps)} kbps
              </div>

              <button
                type="button"
                onClick={handleStartCompression}
                disabled={isCompressing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:brightness-110 hover:shadow-2xl active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Mulai Kompresi Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* View 3: Compression Result & Comparison View */}
        {videoSource && result && (
          <ComparisonViewer
            source={videoSource}
            result={result}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Modal: Active Compression Progress */}
      {isCompressing && videoSource && (
        <CompressionProgressModal
          source={videoSource}
          settings={settings}
          progress={progress}
          onCancel={handleCancelCompression}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070b11] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MicroVideo · Kompresi Video Klien Berkinerja Tinggi</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Privasi Penuh (Zero-Upload)</span>
            <span>·</span>
            <span>MP4 H.264 Universal</span>
            <span>·</span>
            <span>Browser Hardware Accelerated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
