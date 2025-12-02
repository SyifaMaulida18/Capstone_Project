"use client";

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link"; // Menggunakan Link dari Next.js untuk navigasi yang lebih baik

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white px-6 py-16 grid md:grid-cols-4 gap-8 font-sans">
      
      {/* Kolom 1: Brand & Deskripsi */}
      <div className="col-span-full md:col-span-1">
        <h3 className="text-2xl font-bold mb-4 text-[#8CC63F]">
          RSPB Online
        </h3>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Sistem Reservasi Online Rumah Sakit Pertamina Balikpapan. 
          Memberikan kemudahan akses layanan kesehatan prioritas untuk Anda dan keluarga.
        </p>
        
        {/* Sosmed Icons */}
        <div className="flex gap-4 mt-6">
            <a href="#" className="text-neutral-400 hover:text-[#8CC63F] transition"><Instagram size={20}/></a>
            <a href="#" className="text-neutral-400 hover:text-[#8CC63F] transition"><Facebook size={20}/></a>
            <a href="#" className="text-neutral-400 hover:text-[#8CC63F] transition"><Twitter size={20}/></a>
        </div>
      </div>

      {/* Kolom 2: Navigasi */}
      <div>
        <h3 className="font-bold mb-4 text-white">Navigasi</h3>
        <ul className="space-y-3 text-sm text-neutral-300">
          <li>
            {/* Menggunakan "/" agar selalu kembali ke home dari halaman manapun */}
            <Link 
                href="/" 
                className="hover:text-[#8CC63F] transition-colors flex items-center gap-2"
            >
              Beranda
            </Link>
          </li>
          <li>
            <Link 
                href="/#jadwal-dokter" 
                className="hover:text-[#8CC63F] transition-colors flex items-center gap-2"
            >
              Cek Jadwal Dokter
            </Link>
          </li>
          <li>
            {/* UPDATE: Mengarah ke halaman terpisah */}
            <Link 
                href="/guest/tentang" 
                className="hover:text-[#8CC63F] transition-colors flex items-center gap-2"
            >
              Tentang Kami
            </Link>
          </li>
          <li>
            <Link 
                href="/#fasilitas" 
                className="hover:text-[#8CC63F] transition-colors flex items-center gap-2"
            >
              Fasilitas
            </Link>
          </li>
        </ul>
      </div>

      {/* Kolom 3: Layanan Pasien */}
      <div>
        <h3 className="font-bold mb-4 text-white">Layanan Pasien</h3>
        <ul className="space-y-3 text-sm text-neutral-300">
          <li>
            <Link href="/auth/login" className="hover:text-[#8CC63F] transition-colors">
              Masuk / Login
            </Link>
          </li>
          <li>
            <Link href="/auth/register" className="hover:text-[#8CC63F] transition-colors">
              Daftar Akun Baru
            </Link>
          </li>
          <li>
            <Link href="/auth/login" className="hover:text-[#8CC63F] transition-colors">
              Buat Reservasi
            </Link>
          </li>
          <li>
            <a href="#" className="hover:text-[#8CC63F] transition-colors">
              Layanan Darurat (UGD)
            </a>
          </li>
        </ul>
      </div>

      {/* Kolom 4: Kontak */}
      <div>
        <h3 className="font-bold mb-4 text-white">Hubungi Kami</h3>
        <ul className="space-y-4 text-sm text-neutral-300">
          <li className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#8CC63F] shrink-0" />
            <span>Jl. Jenderal Sudirman No.1, Balikpapan, Kalimantan Timur</span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#8CC63F] shrink-0" />
            <span>150-442 (Call Center)</span>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#8CC63F] shrink-0" />
            <span>info@rsbp.com</span>
          </li>
        </ul>
      </div>

      {/* Copyright */}
      <div className="col-span-full border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Rumah Sakit Pertamina Balikpapan. Semua Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}