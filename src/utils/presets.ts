import { CompressionPreset, CompressionSettings, PresetId, VideoSource } from '../types/video';

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    id: 'extreme-90',
    label: 'Ekstrem 90%',
    reductionLabel: '10x Lebih Kecil (500 MB ➔ 50 MB)',
    description: 'Paling hemat untuk arsip & kirim cepat. Menghasilkan ukuran file ultra kecil dengan visual tajam.',
    targetRatio: 0.10, // 90% cut
    recommendedResolutionScale: 0.67, // e.g. 1080p -> 720p
    tag: 'Rekomendasi Utama',
    isPopular: true
  },
  {
    id: 'aggressive-80',
    label: 'Agresif 80%',
    reductionLabel: '5x Lebih Kecil (500 MB ➔ 100 MB)',
    description: 'Kompresi tinggi yang mempertahankan ketajaman prima untuk tayang di monitor & laptop.',
    targetRatio: 0.20,
    recommendedResolutionScale: 0.75,
    tag: 'Kualitas Tinggi'
  },
  {
    id: 'balanced-60',
    label: 'Seimbang 60%',
    reductionLabel: '2.5x Lebih Kecil (500 MB ➔ 200 MB)',
    description: 'Pengurangan ukuran moderat dengan resolusi nyaris 100% identik dengan master aslinya.',
    targetRatio: 0.40,
    recommendedResolutionScale: 1.0,
    tag: 'Master Detail'
  },
  {
    id: 'whatsapp-16',
    label: 'WhatsApp',
    reductionLabel: 'Pas Limit 16 MB',
    description: 'Disesuaikan otomatis dengan batas maksimum upload WhatsApp tanpa terpotong.',
    targetFixedMB: 15.5,
    recommendedResolutionScale: 0.5,
    tag: 'Chat App'
  },
  {
    id: 'discord-25',
    label: 'Discord',
    reductionLabel: 'Pas Limit 25 MB',
    description: 'Optimal untuk upload gratis di Discord server tanpa perlu Discord Nitro.',
    targetFixedMB: 24.5,
    recommendedResolutionScale: 0.67,
    tag: 'Gaming'
  },
  {
    id: 'email-10',
    label: 'Email',
    reductionLabel: 'Batas Lampiran 10 MB',
    description: 'Aman dikirim lewat Gmail, Outlook, atau Yahoo Mail tanpa link Google Drive.',
    targetFixedMB: 9.5,
    recommendedResolutionScale: 0.5,
    tag: 'Kantor'
  }
];

/**
 * Calculates optimal bitrate, resolution, and target MB for a given preset and video source.
 */
export function calculateSettingsForPreset(
  presetId: PresetId,
  source: VideoSource,
  customMB?: number,
  manualBitrateKbps?: number
): CompressionSettings {
  const duration = Math.max(1, source.duration);
  const originalSizeMB = source.sizeBytes / (1024 * 1024);

  let targetMB = 50;
  let scale = 1.0;
  let audioBitrateKbps = 96;

  if (presetId === 'custom-mb' && customMB && customMB > 0) {
    targetMB = customMB;
    // Adapt scale based on target MB
    const ratio = targetMB / Math.max(1, originalSizeMB);
    if (ratio <= 0.15) {
      scale = 0.67; // 720p
      audioBitrateKbps = 64;
    } else if (ratio <= 0.35) {
      scale = 0.75;
      audioBitrateKbps = 96;
    } else {
      scale = 1.0;
      audioBitrateKbps = 128;
    }
  } else if (presetId === 'manual') {
    const videoKbps = manualBitrateKbps || 1200;
    targetMB = parseFloat((((videoKbps + audioBitrateKbps) * duration) / (8 * 1024)).toFixed(1));
    return {
      presetId,
      mode: 'manual',
      targetMB,
      videoBitrateKbps: videoKbps,
      audioBitrateKbps,
      resolutionScale: 1.0,
      targetWidth: source.width,
      targetHeight: source.height,
      fps: 30,
      playbackSpeed: 1.5,
      muteAudio: false,
      format: 'mp4'
    };
  } else {
    const preset = COMPRESSION_PRESETS.find((p) => p.id === presetId) || COMPRESSION_PRESETS[0];
    scale = preset.recommendedResolutionScale || 0.75;

    if (preset.targetFixedMB) {
      targetMB = Math.min(originalSizeMB * 0.95, preset.targetFixedMB);
    } else if (preset.targetRatio) {
      targetMB = Math.max(1, originalSizeMB * preset.targetRatio);
    }
  }

  // Calculate target video bitrate in kbps:
  // Total Target Bits = Target MB * 8192 kb
  // Total Target kbps = Total Target Bits / Duration (seconds)
  // Video kbps = Total Target kbps - Audio kbps
  const totalTargetKbps = (targetMB * 8192) / duration;
  let videoBitrateKbps = Math.floor(totalTargetKbps - audioBitrateKbps);

  // Safety clamps
  if (videoBitrateKbps < 120) {
    videoBitrateKbps = 120;
    audioBitrateKbps = 48;
    scale = Math.min(scale, 0.5);
  }

  const targetWidth = Math.max(16, Math.floor((source.width * scale) / 2) * 2);
  const targetHeight = Math.max(16, Math.floor((source.height * scale) / 2) * 2);

  return {
    presetId,
    mode: presetId === 'custom-mb' ? 'target_mb' : 'preset',
    targetMB: parseFloat(targetMB.toFixed(1)),
    videoBitrateKbps,
    audioBitrateKbps,
    resolutionScale: scale,
    targetWidth,
    targetHeight,
    fps: 30,
    playbackSpeed: 1.5,
    muteAudio: false,
    format: 'mp4'
  };
}
