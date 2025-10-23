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
            description: "Buat akun baru atau masuk jika sudah punya. Pastikan data diri dan profil Anda sudah terisi dengan lengkap dan benar."
        },
        {
            icon: <Search className="w-10 h-10 text-white" />,
            title: "2. Cari Poli & Dokter",
            description: "Gunakan fitur pencarian untuk menemukan poli tujuan dan dokter yang tersedia sesuai dengan jadwal yang Anda inginkan."
        },
        {
            icon: <CalendarCheck className="w-10 h-10 text-white" />,
            title: "3. Pilih Jadwal & Reservasi",
            description: "Pilih tanggal dan jam kunjungan, lalu konfirmasi reservasi Anda. Anda akan langsung mendapatkan kode booking."
        },
        {
            icon: <Bell className="w-10 h-10 text-white" />,
            title: "4. Dapatkan Notifikasi",
            description: "Sistem akan mengirimkan notifikasi pengingat H-1 sebelum jadwal kunjungan Anda melalui Email atau WhatsApp."
        }
    ];

    return (
        <main className="bg-white min-h-screen flex flex-col text-gray-800 font-sans">
            <TopBar isLoggedIn={false} />
            {/* Di sini kita memberi tahu Navbar bahwa halaman saat ini adalah 'cara-reservasi',
              sehingga link di navigasi akan otomatis aktif.
            */}
            <Navbar currentPage="cara-reservasi" />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Cara Melakukan Reservasi</h1>
                <p className="max-w-3xl mx-auto text-lg text-gray-600">
                    Ikuti langkah-langkah mudah berikut untuk mendapatkan jadwal konsultasi dengan dokter pilihan Anda.
                </p>
            </section>

            {/* Steps Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => (
                            <div key={step.title} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <div className="bg-blue-500 p-4 rounded-full mb-6">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-blue-800 mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
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

