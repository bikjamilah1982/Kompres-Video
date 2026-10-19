import React from 'react';
import { HelpCircle, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export const HelpAndTips: React.FC = () => {
  return (
    <section id="panduan-kompresi" className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <HelpCircle className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          Panduan & Rahasia Kompresi Ekstrem (500 MB ➔ 50 MB)
        </h3>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Bagaimana 500 MB Bisa Jadi 50 MB Tanpa Pecah?</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kamera smartphone dan perekam layar modern sering merekam video dengan bitrate berlebih (15–30 Mbps) yang memakan ratusan megabyte untuk hal yang tidak tampak oleh mata. Algoritma kami menyesuaikan bitrate target secara adaptif ke tingkat optimal (1.2–2 Mbps) sehingga ukuran berkurang 90% tanpa artefak buram.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <CheckCircle className="h-4 w-4 text-cyan-400" />
            <span>Mengapa Skala 720p Dianjurkan untuk File Raksasa?</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Jika video asli beresolusi 1080p dipaksa ke 50 MB tanpa di-scaling, setiap frame harus mengompres 2 juta piksel dalam ruang bitrate kecil. Dengan menyelaraskan ke 720p HD (0.9 juta piksel), alokasi data per piksel meningkat dua kali lipat, membuat video tampak jauh lebih jernih dan mulus di layar smartphone & monitor.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Privasi Penuh Tanpa Server Pihak Ketiga</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Berbeda dengan web kompresor lain yang mengunggah video Anda ke cloud eksternal, MicroVideo memanfaatkan mesin akselerasi perangkat keras langsung di browser Anda. Tidak ada data yang keluar dari komputer Anda, hemat kuota internet, dan aman untuk dokumen rahasia.
          </p>
        </div>
      </div>
    </section>
  );
};
