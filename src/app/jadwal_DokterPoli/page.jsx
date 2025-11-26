"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Heart,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- IMPORTS KOMPONEN UI ---
import Header from "../../components/user/Header";
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";

// --- DATA KONSTAN ---
const ALL_POLI_OPTIONS = [
  "Semua Poli",
  "Poli Umum",
  "Poli Gigi",
  "Poli Mata",
  "Poli Anak",
  "Poli Penyakit Dalam",
  "Poli Jantung",
  "Poli Bedah",
  "Poli Kandungan",
  "Poli THT",
  "Poli Saraf",
];

// --- DUMMY DATA JADWAL (Untuk Tampilan Frontend) ---
const DUMMY_SCHEDULES = [
  {
    id: "1",
    doctor: "dr. Andi Wijaya, Sp.PD",
    poli: "Poli Penyakit Dalam",
    dateKey: "2023-11-20", // Format YYYY-MM-DD
    time: "08:00 - 12:00 (Pagi)",
    quota: 5,
    available: true,
    keterangan: "Harap datang 15 menit sebelum jadwal.",
  },
  {
    id: "2",
    doctor: "dr. Siti Aminah, Sp.A",
    poli: "Poli Anak",
    dateKey: "2023-11-20",
    time: "13:00 - 16:00 (Siang)",
    quota: 0,
    available: false,
    keterangan: "Cuti mendadak digantikan dr. Budi.",
  },
  {
    id: "3",
    doctor: "dr. Budi Santoso, Sp.M",
    poli: "Poli Mata",
    dateKey: "2023-11-21",
    time: "09:00 - 14:00 (Pagi)",
    quota: 12,
    available: true,
    keterangan: null,
  },
  {
    id: "4",
    doctor: "dr. Citra Kirana, Sp.OG",
    poli: "Poli Kandungan",
    dateKey: "2023-11-22",
    time: "08:00 - 11:00 (Pagi)",
    quota: 3,
    available: true,
    keterangan: null,
  },
  {
    id: "5",
    doctor: "dr. Eko Prasetyo, Sp.JP",
    poli: "Poli Jantung",
    dateKey: "2023-11-22",
    time: "15:00 - 18:00 (Sore)",
    quota: 8,
    available: true,
    keterangan: null,
  },
];

// --- KOMPONEN KARTU JADWAL ---
const ScheduleDisplayCard = ({ schedule }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`p-5 rounded-xl shadow-md border-l-4 transition duration-200 flex flex-col justify-between ${
        schedule.available
          ? "bg-white border-primary-500 hover:shadow-lg"
          : "bg-neutral-100 border-red-400 opacity-70"
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-primary-800 flex items-center">
              <User className="w-4 h-4 mr-2" />
              {schedule.doctor}
            </h3>
            <p className="text-sm font-medium text-neutral-600 flex items-center mt-1">
              <Heart className="w-4 h-4 mr-2" />
              {schedule.poli}
            </p>
          </div>
          <p
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              schedule.available
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {schedule.available ? `Kuota: ${schedule.quota}` : "Penuh"}
          </p>
        </div>

        <div className="text-sm text-neutral-600 space-y-1 border-t pt-2 mt-2">
          <p className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-neutral-500" />{" "}
            {formatDate(schedule.dateKey)}
          </p>
          <p className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-neutral-500" />
            {schedule.time}
          </p>
          {schedule.keterangan && (
            <p className="text-xs italic text-neutral-500 mt-1">
              Note: {schedule.keterangan}
            </p>
          )}
        </div>
      </div>

      {schedule.available && (
        <a
          href="/user/reservasi"
          className="mt-4 w-full text-center py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold transition"
        >
          Buat Reservasi
        </a>
      )}
    </div>
  );
};

// --- PAGE UTAMA ---
export default function JadwalDokterPoliPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoli, setSelectedPoli] = useState("Semua Poli");
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Konfigurasi Navigasi
  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: false },
    {
      name: "Cek Jadwal Poli & Dokter",
      href: "/user/jadwal_DokterPoli",
      isActive: true,
    },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  // --- SIMULASI FETCH DATA ---
  useEffect(() => {
    // Timer ini hanya untuk meniru loading agar UI terlihat natural
    const timer = setTimeout(() => {
      setSchedules(DUMMY_SCHEDULES);
      setIsLoading(false);
    }, 1500); // Loading selama 1.5 detik

    return () => clearTimeout(timer);
  }, []);

  // --- FILTER LOGIC (Tetap berjalan di Frontend) ---
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => {
        // Filter Poli (Case insensitive)
        const matchPoli =
          selectedPoli === "Semua Poli" ||
          (schedule.poli &&
            schedule.poli
              .toLowerCase()
              .includes(
                selectedPoli.toLowerCase().replace("poli ", "").trim()
              ));

        // Filter Search Nama Dokter
        const matchSearch = schedule.doctor
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return matchPoli && matchSearch;
      })
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) {
          return a.dateKey.localeCompare(b.dateKey);
        }
        return a.time.localeCompare(b.time);
      });
  }, [searchTerm, selectedPoli, schedules]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      {/* 1. HEADER */}
      <Header />

      {/* 2. NAVBAR */}
      <Navbar navItems={navItems} />

      {/* 3. KONTEN UTAMA */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 flex items-center justify-center">
            <Calendar className="w-8 h-8 mr-3 text-primary-600" /> Jadwal Dokter
            & Poli
          </h1>
          <p className="mt-2 text-neutral-600">
            Temukan jadwal praktek dokter untuk 14 hari ke depan.
          </p>
        </header>

        {/* Filter Section */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-neutral-200 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama Dokter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-3 text-neutral-900 placeholder-neutral-500 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          {/* Poli Dropdown */}
          <div className="relative w-full md:w-64">
            <select
              value={selectedPoli}
              onChange={(e) => setSelectedPoli(e.target.value)}
              className="block w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-10 text-neutral-900 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {ALL_POLI_OPTIONS.map((poli) => (
                <option key={poli} value={poli}>
                  {poli}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Heart className="h-5 w-5 text-neutral-500" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-neutral-600">Memuat jadwal terbaru...</p>
          </div>
        ) : filteredSchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule) => (
              <ScheduleDisplayCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          <div className="mt-12 p-8 bg-white rounded-xl shadow border border-neutral-200 text-center text-neutral-600">
            <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-yellow-500" />
            <p className="font-semibold">Jadwal tidak ditemukan.</p>
            <p className="text-sm mt-1">
              Tidak ada jadwal dokter yang sesuai dengan pencarian atau filter
              Anda.
            </p>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
}