# Kompresor Video Web Klien-Sisi (MicroVideo MP4) — Mode Kompresi Ekstrem (500 MB ➔ 50 MB)

Aplikasi web modern untuk mengompresi video berukuran besar menjadi file ultra-kompak dengan pemotongan ukuran drastis hingga 90% (10x lebih kecil, contoh 500 MB menjadi 50 MB) tanpa penurunan kualitas visual yang kentara, berjalan 100% lokal di browser tanpa batasan server.

> [!IMPORTANT]
> **Keputusan Kunci & Penyesuaian Sesuai Permintaan Pengguna:**
> - **Rasio Kompresi Ekstrem (Hingga 90% / 10x Lebih Kecil)**: Menambahkan preset khusus kompresi super tinggi untuk mereduksi file raksasa (contoh: 500 MB menjadi 50 MB, atau 100 MB menjadi 10 MB) dengan tetap mempertahankan kejernihan visual berkat kombinasi kalkulasi bitrate adaptif dan scaling resolusi cerdas.
> - **Input Target Ukuran Kustom (MB)**: Pengguna bisa langsung mengetik target MB yang diinginkan (misal: "50 MB" untuk video 500 MB), dan sistem akan secara otomatis mengkalkulasikan bitrate video dan audio yang presisi.
> - **Pemrosesan Klien 100%**: Tetap diproses sepenuhnya di browser tanpa upload data, aman untuk video pribadi/pekerjaan.
> - **Format Standar MP4**: Kompatibel penuh dengan semua perangkat (Android, iOS, Windows, Mac, WhatsApp, Discord, Instagram).

---

## 1. Ikhtisar & Strategi Kompresi Ekstrem

- **Fungsi Utama**: Mengurangi ukuran video besar (hingga ratusan MB) secara dramatis hingga 10x lebih kecil (misalnya 500 MB ➔ 50 MB) dengan tetap menjaga ketajaman gambar dan kejernihan audio.
- **Strategi Menjaga Kualitas pada Rasio 90%**:
  1. *Kalkulasi Bitrate Adaptif Presisi*:
     $$\text{Target Bitrate Video (kbps)} = \frac{(\text{Target Size in MB} \times 8192) - (\text{Audio Bitrate kbps} \times \text{Durasi detik})}{\text{Durasi detik}}$$
  2. *Optimasi Skala Resolusi Cerdas*: Jika video asli 4K atau 1080p dengan bitrate sangat padat, sistem secara otomatis menawarkan opsi scaling ke 1080p efisien atau 720p HD. Pada layar ponsel dan laptop, video 720p dengan bitrate bersih terlihat nyaris identik dengan 1080p namun memangkas ukuran hingga 60-70% seketika!
  3. *Optimasi Audio Efisiensi Tinggi*: Mengompres stream audio ke 96 kbps atau 64 kbps mono/stereo bersih, memotong ukuran audio hingga 75% tanpa kehilangan kejernihan vokal atau musik.
  4. *Frame Rate Smoothing*: Menjaga 30 FPS atau 24 FPS stabil untuk efisiensi kompresi maksimal.

---

## 2. Pilihan Preset Kompresi

Aplikasi menyediakan preset terstruktur yang sangat mudah dipilih:
1. **Ekstrem 90% (Ultra Compact - 10x Lebih Kecil)**: Dirancang khusus untuk memotong 500 MB menjadi ~50 MB, sangat cocok untuk pengarsipan dan pengiriman cepat.
2. **Agresif 80% (Hemat 5x Lipat)**: Contoh 500 MB ➔ 100 MB, kualitas sangat tajam untuk konsumsi layar besar.
3. **Seimbang 60% (Kualitas Tinggi)**: Contoh 500 MB ➔ 200 MB, mempertahankan detail halus untuk editing/presentasi.
4. **Target Ukuran Kustom (Pilihan Bebas MB)**: Kotak input interaktif di mana pengguna bisa mengetik angka spesifik (misal: "50 MB", "20 MB", "5 MB") dan slider responsif.
5. **Preset Sosial Media & Chat**:
   - WhatsApp Limit (16 MB)
   - Discord Standar (25 MB)
   - Email Attachment (10 MB)
6. **Mode Manual Lanjutan**: Slider manual Bitrate Video (100 kbps s/d 10.000 kbps), Skala Resolusi (Original 100%, 75%, 50%, 33%), dan Bitrate Audio (64k, 96k, 128k).

---

## 3. Pengalaman Pengguna & Alur Kerja

1. **Unggah & Drag-and-Drop**: Pengguna dapat melempar video berukuran berapa pun (didukung file besar). Tersedia tombol demo untuk langsung menguji video contoh resolusi tinggi.
2. **Deteksi Spek Instan**: Begitu video masuk, tampilkan info detail:
   - Ukuran Asli: `512.4 MB` (format monospaced tabular)
   - Durasi & Dimensi: `03:45 · 1920×1080 (1080p) · 30 FPS`
   - Bitrate Asli: `18.2 Mbps`
3. **Pilih Preset atau Ketik Target 50 MB**:
   - Klik kartu "Ekstrem 90% (10x Lebih Kecil)" atau ketik `50` pada input Target MB.
   - Sistem langsung menampilkan proyeksi: `512.4 MB ➔ ~51.2 MB (-90.0%)` dan estimasi bitrate output `1.7 Mbps`.
4. **Proses Kompresi Berkecepatan Tinggi**:
   - Indikator progres persen `font-mono tabular-nums` (0% - 100%).
   - Timer waktu berjalan dan estimasi sisa waktu.
   - Tombol pembatalan kapan saja jika ingin mengubah konfigurasi.
5. **Pemutar Perbandingan Interaktif (Sebelum vs Sesudah)**:
   - Menampilkan video asli dan video hasil kompresi berdampingan atau dengan slider komparasi visual.
   - Statistik riil ukuran akhir yang dihasilkan (misal `48.7 MB`, hemat `463.7 MB`).
   - Tombol unduh file `.mp4` dengan nama file otomatis yang rapi (`[nama_video]_compressed_50MB.mp4`).

---

## 4. Arsitektur Teknis

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│  [MicroVideo Studio]  ·  [Mode Ekstrem 90%]  ·  [Privasi Lokal 100%]   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴─────────────────────────────────────┐
│                           Workspace Utama                              │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │   Panel Input & Preset       │    │  Area Pratinjau & Komparasi  │  │
│  │                              │    │                              │  │
│  │ • Drag & Drop / File Input   │    │ • Pemutar Video Awal         │  │
│  │ • Info File: 500 MB, 1080p   │    │ • Pemutar Hasil Kompresi     │  │
│  │ • [Preset Ekstrem 90% ~50MB] │    │ • Sinkronisasi Play/Seek     │  │
│  │ • Input Kustom Target (MB)   │    │ • Indikator Hemat -90%       │  │
│  │ • Slider Manual Bitrate/Res  │    │ • Tombol Unduh MP4           │  │
│  │ • Tombol "Kompres Sekarang"  │    │ • Reset / Kompres Video Lain │  │
│  └──────────────┬───────────────┘    └──────────────▲───────────────┘  │
│                 │                                   │                  │
│                 ▼                                   │                  │
│  ┌──────────────────────────────────────────────────┴───────────────┐  │
│  │             Engine Kompresor Klien-Sisi Adaptif                  │  │
│  │                                                                  │  │
│  │ • Parser Durasi & Bitrate Asli Video                             │  │
│  │ • Kalkulator Bitrate Presisi Target (Target MB / Durasi)         │  │
│  │ • Pipeline Canvas Offscreen & Scaling Frame Resizer              │  │
│  │ • Audio Context & Stream Merging (Video + Audio AAC)             │  │
│  │ • MediaRecorder H.264 MP4 dengan Bitrate Cap Ketat               │  │
│  │ • Live Stream Chunk Aggregator & Blob Exporter                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```
