import { CompressionProgress, CompressionResult, CompressionSettings, VideoSource } from '../types/video';

export interface CompressorController {
  cancel: () => void;
}

export function compressVideo(
  source: VideoSource,
  settings: CompressionSettings,
  onProgress: (progress: CompressionProgress) => void
): { promise: Promise<CompressionResult>; controller: CompressorController } {
  let isCancelled = false;
  let recorder: MediaRecorder | null = null;
  let videoEl: HTMLVideoElement | null = null;
  let audioCtx: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let animFrameId: number | null = null;

  const controller: CompressorController = {
    cancel: () => {
      isCancelled = true;
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onProgress({
        status: 'cancelled',
        percent: 0,
        currentSeconds: 0,
        totalSeconds: source.duration,
        elapsedMs: 0,
        estimatedRemainingMs: 0,
        statusMessage: 'Kompresi dibatalkan.'
      });
    }
  };

  const promise = new Promise<CompressionResult>((resolve, reject) => {
    const startTime = performance.now();

    onProgress({
      status: 'preparing',
      percent: 0,
      currentSeconds: 0,
      totalSeconds: source.duration,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      statusMessage: 'Mempersiapkan pipeline kompresi & scaling...'
    });

    videoEl = document.createElement('video');
    videoEl.crossOrigin = 'anonymous';
    videoEl.playsInline = true;
    videoEl.muted = false; // Need audio routed through audio context
    videoEl.preload = 'auto';

    // Off-screen canvas for rendering & scaling
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(16, Math.floor(settings.targetWidth / 2) * 2); // even numbers for codecs
    canvas.height = Math.max(16, Math.floor(settings.targetHeight / 2) * 2);
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    if (!ctx) {
      reject(new Error('Gagal menginisialisasi canvas context'));
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    videoEl.src = source.url;

    videoEl.onloadedmetadata = async () => {
      if (isCancelled) return;

      try {
        const fps = settings.fps || 30;
        const canvasStream = canvas.captureStream(fps);

        // Audio pipeline
        const combinedStream = new MediaStream();
        // Add video track from canvas
        const videoTrack = canvasStream.getVideoTracks()[0];
        if (videoTrack) {
          combinedStream.addTrack(videoTrack);
        }

        // Handle Audio
        if (!settings.muteAudio) {
          try {
            audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const sourceNode = audioCtx.createMediaElementSource(videoEl!);
            const destNode = audioCtx.createMediaStreamDestination();
            sourceNode.connect(destNode);
            // Do not connect to audioCtx.destination so user does not hear playback while compressing

            const audioTrack = destNode.stream.getAudioTracks()[0];
            if (audioTrack) {
              combinedStream.addTrack(audioTrack);
            }
          } catch (e) {
            console.warn('Audio capture bypassed or not supported for this source format:', e);
          }
        }

        stream = combinedStream;

        // Determine MIME format (prefer mp4, fall back to webm)
        const requestedMp4 = settings.format === 'mp4';
        const mp4Candidates = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4;codecs=avc1.4d401f,mp4a.40.2',
          'video/mp4;codecs=avc1',
          'video/mp4'
        ];
        const webmCandidates = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm'
        ];

        let selectedMime = '';
        if (requestedMp4) {
          for (const m of mp4Candidates) {
            if (MediaRecorder.isTypeSupported(m)) {
              selectedMime = m;
              break;
            }
          }
        }

        if (!selectedMime) {
          // Fallback to whichever is supported
          for (const m of [...webmCandidates, ...mp4Candidates]) {
            if (MediaRecorder.isTypeSupported(m)) {
              selectedMime = m;
              break;
            }
          }
        }

        if (!selectedMime) {
          selectedMime = 'video/webm';
        }

        // Video and audio bitrates
        const videoBitrateBps = Math.max(50_000, settings.videoBitrateKbps * 1000);
        const audioBitrateBps = settings.muteAudio ? 0 : Math.max(32_000, settings.audioBitrateKbps * 1000);

        recorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: videoBitrateBps,
          audioBitsPerSecond: audioBitrateBps
        });

        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (isCancelled) return;

          onProgress({
            status: 'finalizing',
            percent: 100,
            currentSeconds: source.duration,
            totalSeconds: source.duration,
            elapsedMs: performance.now() - startTime,
            estimatedRemainingMs: 0,
            statusMessage: 'Menyusun paket file MP4 terkompresi...'
          });

          const outputBlob = new Blob(chunks, { type: selectedMime });
          const outputUrl = URL.createObjectURL(outputBlob);
          const extension = selectedMime.includes('mp4') ? 'mp4' : 'webm';
          const cleanBaseName = source.name.replace(/\.[^/.]+$/, '');
          const outputFileName = `${cleanBaseName}_compressed_${settings.targetMB ? Math.round(settings.targetMB) + 'MB' : 'optimized'}.${extension}`;

          const savedBytes = Math.max(0, source.sizeBytes - outputBlob.size);
          const reductionPercentage = source.sizeBytes > 0 
            ? parseFloat(((savedBytes / source.sizeBytes) * 100).toFixed(1))
            : 0;

          const processingTimeMs = Math.round(performance.now() - startTime);
          const finalBitrateKbps = Math.round((outputBlob.size * 8) / (source.duration * 1000));

          // Cleanup
          if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close().catch(() => {});
          }
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }

          onProgress({
            status: 'completed',
            percent: 100,
            currentSeconds: source.duration,
            totalSeconds: source.duration,
            elapsedMs: processingTimeMs,
            estimatedRemainingMs: 0,
            statusMessage: 'Kompresi berhasil diselesaikan!'
          });

          resolve({
            blob: outputBlob,
            url: outputUrl,
            fileName: outputFileName,
            originalSizeBytes: source.sizeBytes,
            compressedSizeBytes: outputBlob.size,
            savedBytes,
            reductionPercentage,
            duration: source.duration,
            width: canvas.width,
            height: canvas.height,
            processingTimeMs,
            finalBitrateKbps,
            mimeType: selectedMime
          });
        };

        recorder.onerror = (err) => {
          reject(err);
        };

        // Start recording
        recorder.start(250); // flush data every 250ms
        
        // Apply playback speed
        const speed = settings.playbackSpeed || 1.5;
        videoEl!.playbackRate = speed;

        // Frame rendering loop
        const renderLoop = () => {
          if (isCancelled || !videoEl) return;

          if (!videoEl.paused && !videoEl.ended) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

            const currentTime = videoEl.currentTime;
            const percent = Math.min(99.5, Math.max(0, (currentTime / source.duration) * 100));
            const elapsed = performance.now() - startTime;
            
            // ETA calculation
            const progressRatio = Math.max(0.01, percent / 100);
            const totalEstimatedMs = elapsed / progressRatio;
            const remainingMs = Math.max(0, totalEstimatedMs - elapsed);

            onProgress({
              status: 'compressing',
              percent: parseFloat(percent.toFixed(1)),
              currentSeconds: currentTime,
              totalSeconds: source.duration,
              elapsedMs: Math.round(elapsed),
              estimatedRemainingMs: Math.round(remainingMs),
              statusMessage: `Mengompres frame: ${currentTime.toFixed(1)}s / ${source.duration.toFixed(1)}s (${percent.toFixed(0)}%)`
            });
          }

          if (!videoEl.ended && !videoEl.paused) {
            animFrameId = requestAnimationFrame(renderLoop);
          }
        };

        const activeVideo = videoEl;
        if (!activeVideo) return;

        activeVideo.onended = () => {
          if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
          }
        };

        await activeVideo.play();
        animFrameId = requestAnimationFrame(renderLoop);

      } catch (err: unknown) {
        controller.cancel();
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan pemrosesan video';
        reject(new Error(msg));
      }
    };

    videoEl.onerror = () => {
      reject(new Error('Format video tidak dapat dimainkan atau file rusak.'));
    };
  });

  return { promise, controller };
}
