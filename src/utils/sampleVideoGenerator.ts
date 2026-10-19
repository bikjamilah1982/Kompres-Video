import { VideoSource } from '../types/video';

/**
 * Generates an HD animated sample video in-browser with audio.
 * Allows instant testing of the compression engine without needing to upload a huge file.
 */
export async function generateSampleVideo(durationSeconds: number = 8): Promise<VideoSource> {
  const canvas = document.createElement('canvas');
  const width = 1280;
  const height = 720;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context tidak didukung.');
  }

  // Audio generation using Web Audio API
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  
  // Create pleasant ambient melody / beats
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  // Combine canvas stream + audio stream
  const canvasStream = canvas.captureStream(30);
  const audioTrack = dest.stream.getAudioTracks()[0];
  if (audioTrack) {
    canvasStream.addTrack(audioTrack);
  }

  // Find best supported recorder type
  const mimeTypes = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  let selectedMime = 'video/webm';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  // Generate high bitrate to simulate large source file (15 Mbps)
  const recorder = new MediaRecorder(canvasStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 15_000_000,
    audioBitsPerSecond: 128_000
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start(100);

  const startTime = performance.now();
  const totalFrames = durationSeconds * 30;
  let frame = 0;

  // Particle simulation for visual richness
  const particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    radius: Math.random() * 20 + 8,
    color: ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981'][Math.floor(Math.random() * 4)]
  }));

  const drawFrame = () => {
    frame++;
    const progress = Math.min(1, frame / totalFrames);
    const currentTimeSec = (progress * durationSeconds).toFixed(1);

    // Dynamic gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    const hueOffset = (progress * 180) % 360;
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Floating particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Center circular badge with live timer
    const cx = width / 2;
    const cy = height / 2 - 20;

    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Progress ring
    ctx.beginPath();
    ctx.arc(cx, cy, 140, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentTimeSec}s`, cx, cy - 10);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`HD 720p · 30 FPS · SAMPLE`, cx, cy + 40);

    // Title banner
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MICROVIDEO HIGH BITRATE SOURCE', cx, 80);

    // Grid lines for high detail frequency (forces compressor to work)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Audio frequency shift
    osc.frequency.setValueAtTime(220 + Math.sin(progress * Math.PI * 4) * 110, audioCtx.currentTime);

    if (frame < totalFrames) {
      requestAnimationFrame(drawFrame);
    }
  };

  drawFrame();

  return new Promise<VideoSource>((resolve, reject) => {
    setTimeout(async () => {
      try {
        recorder.stop();
        osc.stop();
        await audioCtx.close();

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMime });
          const url = URL.createObjectURL(blob);
          const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
          const file = new File([blob], `sample_hd_video_source.${ext}`, { type: selectedMime });

          const calculatedBitrateKbps = Math.round((blob.size * 8) / (durationSeconds * 1000));

          resolve({
            file,
            name: `Sample_Video_HighBitrate_${durationSeconds}s.${ext}`,
            sizeBytes: blob.size,
            duration: durationSeconds,
            width,
            height,
            originalBitrateKbps: calculatedBitrateKbps,
            url,
            isSample: true
          });
        };
      } catch (err) {
        reject(err);
      }
    }, durationSeconds * 1000 + 300);
  });
}
