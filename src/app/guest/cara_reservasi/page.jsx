"use client";

import { Bell, CalendarCheck, Search, UserPlus } from "lucide-react";
// Jalur impor diperbaiki untuk mencocokkan struktur direktori
import CallToAction from "../../../components/guest/CallToAction";
import Footer from "../../../components/guest/Footer";
import { Navbar, TopBar } from "../../../components/guest/Header";

export default function CaraReservasiPage() {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-white" />,
      title: "1. Daftar & Lengkapi Profil",
      description:
        "Buat akun baru atau masuk jika sudah punya. Pastikan data diri dan profil Anda sudah terisi dengan lengkap dan benar.",
    },
    {
      icon: <Search className="w-8 h-8 text-white" />,
      title: "2. Cari Poli & Dokter",
      description:
        "Gunakan fitur pencarian untuk menemukan poli tujuan dan dokter yang tersedia sesuai dengan jadwal yang Anda inginkan.",
    },
    {
      icon: <CalendarCheck className="w-8 h-8 text-white" />,
      title: "3. Pilih Jadwal & Reservasi",
      description:
        "Pilih tanggal dan jam kunjungan, lalu konfirmasi reservasi Anda. Anda akan langsung mendapatkan kode booking.",
    },
    {
      icon: <Bell className="w-8 h-8 text-white" />,
      title: "4. Dapatkan Notifikasi",
      description:
        "Sistem akan mengirimkan notifikasi pengingat H-1 sebelum jadwal kunjungan Anda melalui Email atau WhatsApp.",
    },
  ];

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
      <TopBar />
      <Navbar activeSection="panduan" /> 

      {/* --- 1. HERO SECTION --- */}
      <section className="relative bg-[#003B73] text-white py-20 px-6 text-center overflow-hidden">
        {/* Pattern Background Halus */}
        <div className="absolute top-0 right-0 w-full h-full bg-white/5 opacity-30 skew-y-12 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* PERUBAHAN DI SINI: Style disamakan persis (Putih, Besar, Tebal) */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            <span className="block mb-2">Panduan Pasien</span>
            <span className="block">Cara Melakukan Reservasi</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-blue-100 leading-relaxed">
            Ikuti 4 langkah mudah berikut untuk mendapatkan layanan kesehatan prioritas tanpa harus mengantre lama.
          </p>
        </div>
      </section>

      {/* --- 2. STEPS SECTION --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg border-t-4 border-[#8CC63F] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                {/* Icon Circle */}
                <div className="w-20 h-20 bg-[#003B73] rounded-full flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-[#003B73] mb-4">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-slate-600 leading-relaxed text-sm">
                    {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. CTA & FOOTER --- */}
      <CallToAction />
      <Footer />
    </main>
  );
}