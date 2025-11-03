"use client";

import { Bell, CalendarCheck, Search, UserPlus } from "lucide-react";
// Jalur impor diperbaiki untuk mencocokkan struktur direktori
import CallToAction from "../../../components/guest/CallToAction";
import Footer from "../../../components/guest/Footer";
import { Navbar, TopBar } from "../../../components/guest/Header";

export default function CaraReservasiPage() {
  const steps = [
    {
      icon: <UserPlus className="w-10 h-10 text-white" />,
      title: "1. Daftar & Lengkapi Profil",
      description:
        "Buat akun baru atau masuk jika sudah punya. Pastikan data diri dan profil Anda sudah terisi dengan lengkap dan benar.",
    },
    {
      icon: <Search className="w-10 h-10 text-white" />,
      title: "2. Cari Poli & Dokter",
      description:
        "Gunakan fitur pencarian untuk menemukan poli tujuan dan dokter yang tersedia sesuai dengan jadwal yang Anda inginkan.",
    },
    {
      icon: <CalendarCheck className="w-10 h-10 text-white" />,
      title: "3. Pilih Jadwal & Reservasi",
      description:
        "Pilih tanggal dan jam kunjungan, lalu konfirmasi reservasi Anda. Anda akan langsung mendapatkan kode booking.",
    },
    {
      icon: <Bell className="w-10 h-10 text-white" />,
      title: "4. Dapatkan Notifikasi",
      description:
        "Sistem akan mengirimkan notifikasi pengingat H-1 sebelum jadwal kunjungan Anda melalui Email atau WhatsApp.",
    },
  ];

  return (
    // UBAH: Menggunakan text-neutral-800
    <main className="bg-white min-h-screen flex flex-col text-neutral-800 font-sans">
      <TopBar isLoggedIn={false} />
      <Navbar currentPage="cara-reservasi" />

      {/* Hero Section */}
      {/* UBAH: Menggunakan gradasi primary */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 px-6 text-center">
        {/* UBAH: Menggunakan text-neutral-900 */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">
          Cara Melakukan Reservasi
        </h1>
        {/* UBAH: Menggunakan text-neutral-600 */}
        <p className="max-w-3xl mx-auto text-lg text-neutral-600">
          Ikuti langkah-langkah mudah berikut untuk mendapatkan jadwal konsultasi
          dengan dokter pilihan Anda.
        </p>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div
                key={step.title}
                // UBAH: Menggunakan border-primary-500
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-primary-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* UBAH: Menggunakan bg-primary-500 */}
                <div className="bg-primary-500 p-4 rounded-full mb-6">
                  {step.icon}
                </div>
                {/* UBAH: Menggunakan text-primary-800 */}
                <h3 className="text-xl font-bold text-primary-800 mb-2">
                  {step.title}
                </h3>
                {/* UBAH: Menggunakan text-neutral-600 */}
                <p className="text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
      <Footer />
    </main>
  );
}