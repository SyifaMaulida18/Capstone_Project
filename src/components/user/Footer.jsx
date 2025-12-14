"use client";

import React, { useState } from "react";
import api from "@/services/api"; // Pastikan path import api sesuai struktur project Anda
import { Star, Loader2, Send } from "lucide-react"; // Pastikan lucide-react terinstall

export default function Footer() {
  // State untuk Form Data
  const [rating, setRating] = useState(5);
  const [kategori, setKategori] = useState("umum");
  const [isiFeedback, setIsiFeedback] = useState("");

  // State untuk UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // Object: { type: 'success' | 'error', text: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Cek apakah user login (Token ada)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!token) {
        setMessage({ type: "error", text: "Silakan login untuk mengirim masukan." });
        setLoading(false);
        return;
    }

    if (isiFeedback.trim() === "") {
        setMessage({ type: "error", text: "Pesan tidak boleh kosong." });
        setLoading(false);
        return;
    }

    try {
      // Sesuai dengan validasi Backend: rating, kategori, isi_feedback
      const payload = {
        rating: parseInt(rating),
        kategori: kategori,
        isi_feedback: isiFeedback,
      };

      await api.post("/feedback", payload);

      // Sukses
      setMessage({ type: "success", text: "Terima kasih! Masukan terkirim." });
      setIsiFeedback("");
      setRating(5);
      setKategori("umum");

      // Hilangkan pesan sukses setelah 4 detik
      setTimeout(() => setMessage(null), 4000);

    } catch (error) {
      console.error("Feedback Error:", error);
      
      // Handle Error dari Backend
      if (error.response) {
        if (error.response.status === 403) {
            // Handle validasi $cekHariIni dari controller
            setMessage({ type: "error", text: "Anda sudah mengirim feedback hari ini." });
        } else if (error.response.data && error.response.data.message) {
            setMessage({ type: "error", text: error.response.data.message });
        } else {
            setMessage({ type: "error", text: "Gagal mengirim masukan." });
        }
      } else {
        setMessage({ type: "error", text: "Gagal terhubung ke server." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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

        {/* Kolom 4: Ulasan / Feedback (Functional) */}
        <div>
          <h3 className="font-bold text-sm mb-3 text-white">Berikan Masukan</h3>
          
          {/* Pesan Sukses / Error */}
          {message && (
            <div className={`mb-2 p-2 rounded-lg text-center text-xs border ${
                message.type === 'success' 
                ? 'bg-green-900/30 border-green-800 text-green-400' 
                : 'bg-red-900/30 border-red-800 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            
            <div className="flex gap-2">
                {/* Input Kategori */}
                <select 
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-1/2 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="umum">Umum</option>
                    <option value="pelayanan">Pelayanan</option>
                    <option value="bug">Lapor Bug</option>
                    <option value="lainnya">Lainnya</option>
                </select>

                {/* Input Rating (Star Interactive) */}
                <div className="w-1/2 flex items-center justify-end bg-slate-800 border border-slate-700 rounded-lg px-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star 
                                size={12} 
                                className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-500"}`} 
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Isi Feedback */}
            <textarea
              value={isiFeedback}
              onChange={(e) => setIsiFeedback(e.target.value)}
              placeholder="Tulis masukan Anda..."
              className="w-full h-16 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs resize-none"
              disabled={loading}
            />

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-1.5 rounded-lg font-medium hover:bg-blue-500 transition text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Mengirim...
                  </>
              ) : (
                  <>
                    Kirim <Send size={12} />
                  </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-8 pt-4 border-t border-slate-800 text-slate-600 text-[10px]">
        &copy; 2025 RS Online Balikpapan. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}