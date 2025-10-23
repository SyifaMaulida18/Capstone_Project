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
    <footer className="bg-[#003366] text-white mt-10 p-6 md:p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h3 className="font-bold mb-2">Navigasi</h3>
          <ul className="space-y-1">
            <li><a href="/dashboard" className="hover:text-indigo-200">Beranda</a></li>
            <li><a href="/jadwal" className="hover:text-indigo-200">Cek Jadwal Poli & Dokter</a></li>
            <li><a href="/reservasi" className="hover:text-indigo-200">Reservasi</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-2">Kontak Kami</h3>
          <p>RS Online Balikpapan</p>
          <p>(1234) 878910</p>
          <p>info@rsipb.com</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Informasi</h3>
          <p className="text-indigo-100">
            Sistem Reservasi Online digunakan untuk kemudahan pasien dalam melihat jadwal, ketersediaan dokter, dan mengunci nomor antrian poli.
          </p>
        </div>

        {/* Form Ulasan */}
        <div>
          <h3 className="font-bold mb-2">Ulasan Pasien</h3>
          {sent ? (
            <p className="text-green-300 italic">Terima kasih atas ulasan Anda 💬</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                value={ulasan}
                onChange={(e) => setUlasan(e.target.value)}
                placeholder="Tulis pengalaman Anda di sini..."
                className="w-full h-20 p-2 rounded-md text-gray-800 text-sm"
              />
              <button
                type="submit"
                className="mt-2 w-full bg-indigo-600 text-white py-1 rounded-md text-sm hover:bg-indigo-700 transition"
              >
                Kirim
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-indigo-500 text-xs text-indigo-200">
        &copy; 2025 SiReS-RS. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}
