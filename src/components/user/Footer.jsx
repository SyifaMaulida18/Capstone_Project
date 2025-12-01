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
    /* PERUBAHAN: 
       1. Menghapus 'rounded-t-[2.5rem]' 
       2. Mengurangi padding vertical (py-8) 
       3. Font size diperkecil ke text-xs dan text-sm
    */
    <footer className="bg-slate-900 text-white mt-auto py-8 px-6 md:px-8 border-t border-slate-800">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Kolom 1: Brand */}
        <div>
            <h2 className="text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                RSPB
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Pelayanan kesehatan terbaik dengan teknologi reservasi terkini untuk kenyamanan Anda.
            </p>
        </div>

        {/* Kolom 2: Navigasi */}
        <div>
          <h3 className="font-bold text-sm mb-3 text-white">Navigasi</h3>
          <ul className="space-y-1.5 text-slate-300 text-xs">
            <li>
              <a href="/user/dashboard" className="hover:text-blue-400 transition-colors">Beranda</a>
            </li>
            <li>
              <a href="/jadwalDokterPoli" className="hover:text-blue-400 transition-colors">Jadwal Dokter</a>
            </li>
            <li>
              <a href="/user/reservasi" className="hover:text-blue-400 transition-colors">Buat Reservasi</a>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div>
          <h3 className="font-bold text-sm mb-3 text-white">Hubungi Kami</h3>
          <div className="space-y-1.5 text-slate-300 text-xs">
            <p className="flex items-center gap-2">
                <span className="text-blue-500 text-sm">📍</span> Balikpapan, Indonesia
            </p>
            <p className="flex items-center gap-2">
                <span className="text-blue-500 text-sm">📞</span> (0542) 878910
            </p>
            <p className="flex items-center gap-2">
                <span className="text-blue-500 text-sm">✉️</span> info@rsipb.com
            </p>
          </div>
        </div>

        {/* Kolom 4: Ulasan (Versi Compact) */}
        <div>
          <h3 className="font-bold text-sm mb-3 text-white">Masukan</h3>
          {sent ? (
            <div className="bg-green-900/30 border border-green-800 p-2 rounded-lg text-green-400 text-center text-xs italic">
              Terima kasih! ✨
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={ulasan}
                onChange={(e) => setUlasan(e.target.value)}
                placeholder="Tulis masukan..."
                /* UBAH: Tinggi input dikurangi (h-16) dan font diperkecil */
                className="w-full h-16 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
              />
              <button
                type="submit"
                /* UBAH: Padding tombol dikurangi */
                className="w-full bg-blue-600 text-white py-1.5 rounded-lg font-medium hover:bg-blue-500 transition text-xs shadow-md"
              >
                Kirim
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-8 pt-4 border-t border-slate-800 text-slate-600 text-[10px]">
        &copy; 2025 RS Online Balikpapan. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}