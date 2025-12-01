"use client";

import React, { useState } from "react";

export default function Footer() {
  const [ulasan, setUlasan] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ulasan.trim() !== "") {
      setSent(true);
      setUlasan("");
      setTimeout(() => setSent(false), 4000);
    }
  };

  return (
    /* UBAH: Menggunakan 'bg-blue-950' atau 'bg-slate-900' agar senada dengan tema biru tapi tetap gelap untuk footer */
    <footer className="bg-slate-900 text-white mt-10 pt-12 pb-8 px-6 md:px-8 rounded-t-[2.5rem]">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* Kolom 1: Brand */}
        <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                RSPB
            </h2>
            <p className="text-slate-400 leading-relaxed">
                Memberikan pelayanan kesehatan terbaik dengan teknologi reservasi terkini untuk kenyamanan Anda.
            </p>
        </div>

        {/* Kolom 2: Navigasi */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Navigasi</h3>
          <ul className="space-y-2 text-slate-300">
            <li>
              <a href="/dashboard" className="hover:text-blue-400 transition-colors">Beranda</a>
            </li>
            <li>
              <a href="/jadwal" className="hover:text-blue-400 transition-colors">Jadwal Dokter</a>
            </li>
            <li>
              <a href="/reservasi" className="hover:text-blue-400 transition-colors">Buat Reservasi</a>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Hubungi Kami</h3>
          <div className="space-y-2 text-slate-300">
            <p className="flex items-center gap-2">
                <span className="text-blue-500">📍</span> Balikpapan, Indonesia
            </p>
            <p className="flex items-center gap-2">
                <span className="text-blue-500">📞</span> (0542) 878910
            </p>
            <p className="flex items-center gap-2">
                <span className="text-blue-500">✉️</span> info@rsipb.com
            </p>
          </div>
        </div>

        {/* Kolom 4: Ulasan */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Masukan Anda</h3>
          {sent ? (
            <div className="bg-green-900/30 border border-green-800 p-3 rounded-xl text-green-400 text-center italic">
              Terima kasih atas ulasan Anda! ✨
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={ulasan}
                onChange={(e) => setUlasan(e.target.value)}
                placeholder="Bagaimana pengalaman Anda?"
                /* UBAH: Styling input agar modern (dark theme friendly) */
                className="w-full h-20 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
              <button
                type="submit"
                /* UBAH: Tombol menggunakan warna utama Dashboard (Blue-600) */
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
              >
                Kirim Masukan
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-12 pt-6 border-t border-slate-800 text-slate-500 text-xs">
        &copy; 2025 RS Online Balikpapan. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}