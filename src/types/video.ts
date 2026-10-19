export interface VideoSource {
  file?: File;
  name: string;
  sizeBytes: number;
  duration: number; // in seconds
  width: number;
  height: number;
  originalBitrateKbps: number;
  url: string;
  isSample?: boolean;
}

export type PresetId = 
  | 'extreme-90' 
  | 'aggressive-80' 
  | 'balanced-60' 
  | 'whatsapp-16' 
  | 'discord-25' 
  | 'email-10' 
  | 'custom-mb' 
  | 'manual';

export interface CompressionPreset {
  id: PresetId;
  label: string;
  reductionLabel: string;
  description: string;
  targetRatio?: number; // e.g. 0.10 means 90% reduction (final size is 10%)
  targetFixedMB?: number;
  recommendedResolutionScale?: number;
  tag?: string;
  isPopular?: boolean;
}

export interface CompressionSettings {
  presetId: PresetId;
  mode?: 'preset' | 'target_mb' | 'manual';
  targetMB: number; // for custom-mb or calculated
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  resolutionScale: number; // 1 = original, 0.75, 0.67, 0.5, 0.33
  targetWidth: number;
  targetHeight: number;
  fps: number; // 24, 30, 60
  playbackSpeed: number; // 1 = 1x, 1.5 = 1.5x, 2 = 2x
  muteAudio: boolean;
  format: 'mp4' | 'webm';
}

export interface CompressionProgress {
  status: 'idle' | 'preparing' | 'compressing' | 'finalizing' | 'completed' | 'error' | 'cancelled';
  percent: number; // 0 - 100
  currentSeconds: number;
  totalSeconds: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  statusMessage?: string;
  errorMessage?: string;
}

export interface CompressionResult {
  blob: Blob;
  url: string;
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savedBytes: number;
  reductionPercentage: number;
  duration: number;
  width: number;
  height: number;
  processingTimeMs: number;
  finalBitrateKbps: number;
  mimeType: string;
}
