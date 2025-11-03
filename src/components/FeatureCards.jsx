// components/FeatureCards.jsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const features = [
  {
    title: "Reservasi Online 24/7",
    desc: "Lakukan reservasi kapanpun dan dimanapun tanpa batas waktu. Akses mudah dari smartphone atau desktop.",
    icon: "⏰",
  },
  {
    title: "Rekomendasi Poli Cerdas",
    desc: "Sistem cerdas kami membantu memberikan rekomendasi poli yang paling sesuai dengan gejala Anda.",
    icon: "🧠",
  },
  {
    title: "Notifikasi Jadwal Real-Time",
    desc: "Dapatkan pengingat jadwal dokter dan informasi penting agar tidak ada janji yang terlewatkan.",
    icon: "🔔",
  },
  {
    title: "Manajemen Antrian Pasien",
    desc: "Lihat nomor antrian Anda secara real-time dan estimasi waktu tunggu tanpa harus berada di lokasi.",
    icon: "🔢",
  },
  {
    title: "Riwayat Pasien Lengkap",
    desc: "Akses riwayat reservasi dan kunjungan Anda untuk kemudahan rekam medis pribadi.",
    icon: "📜",
  },
  {
    title: "Integrasi Asuransi",
    desc: "Pilih metode pembayaran dengan mudah, baik tunai maupun terintegrasi dengan berbagai asuransi.",
    icon: "💳",
  },
];

export default function FeatureCards() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((prev) => (prev + 1) % features.length);
  const prev = () =>
    setIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));

  return (
    <section className="relative px-6 py-16 -mt-16 z-20 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-8">
        {/* UBAH: Menggunakan 'neutral-900' */}
        <h2 className="text-3xl font-bold text-neutral-900">Fitur Unggulan</h2>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-4 transition-transform duration-500">
          <button
            onClick={prev}
            /* UBAH: Menggunakan 'text-primary-500' dan 'hover:bg-neutral-100' */
            className="hidden lg:block absolute left-0 z-10 p-3 rounded-full bg-white shadow-lg text-primary-500 hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 gap-6 py-2">
            {features.map((item, idx) => (
              <div
                key={idx}
                /* UBAH: Menggunakan 'border-primary-500' */
                className="min-w-[80vw] sm:min-w-[40vw] lg:min-w-0 snap-center bg-white p-8 rounded-2xl shadow-xl border-t-4 border-primary-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4 text-center">{item.icon}</div>
                {/* UBAH: Menggunakan 'text-primary-800' */}
                <h3 className="font-bold text-xl mb-2 text-primary-800 text-center">
                  {item.title}
                </h3>
                {/* UBAH: Menggunakan 'text-neutral-600' */}
                <p className="text-neutral-600 text-center">{item.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={next}
            /* UBAH: Menggunakan 'text-primary-500' dan 'hover:bg-neutral-100' */
            className="hidden lg:block absolute right-0 z-10 p-3 rounded-full bg-white shadow-lg text-primary-500 hover:bg-neutral-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}