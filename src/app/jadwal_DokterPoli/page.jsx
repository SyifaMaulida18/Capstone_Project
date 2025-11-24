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
// Pastikan path ini sesuai dengan struktur folder Anda
import Header from "../../components/user/Header";
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import api from "../../services/api";

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
          Buat  Reservasi
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
  const [error, setError] = useState(null);

  // Konfigurasi Navigasi (Agar tombol "Cek Jadwal" aktif)
  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: false },
    {
      name: "Cek Jadwal Poli & Dokter",
      href: "/user/jadwal_DokterPoli",
      isActive: true,
    }, // Aktif
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  // --- LOGIKA KONVERSI DATA ---
  const generateUpcomingSchedules = (backendData) => {
    const generatedList = [];
    const today = new Date();
    const daysLookahead = 14; // Lihat 2 minggu ke depan

    const dayKeys = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];

    for (let i = 0; i < daysLookahead; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dayIndex = currentDate.getDay();
      const dayName = dayKeys[dayIndex];
      const dateString = currentDate.toISOString().split("T")[0];

      backendData.forEach((record) => {
        if (record[`${dayName}_praktek`] === "Y") {
          const sessions = ["pagi", "siang", "sore"];

          sessions.forEach((session) => {
            const jamMulai = record[`${dayName}_${session}_dari`];
            const jamSelesai = record[`${dayName}_${session}_sampai`];
            const kuota = record[`${dayName}_${session}_kuota`];

            if (jamMulai) {
              generatedList.push({
                id: `${record.dokter_id}-${record.poli_id}-${dateString}-${session}`,
                doctor: record.dokter?.nama_dokter || "Dokter",
                poli: record.poli?.poli_name || "Poli",
                dateKey: dateString,
                time: `${jamMulai.substring(0, 5)} - ${
                  jamSelesai ? jamSelesai.substring(0, 5) : "Selesai"
                } (${session.charAt(0).toUpperCase() + session.slice(1)})`,
                quota: kuota || 0,
                available: kuota > 0,
                keterangan: record[`${dayName}_keterangan`],
              });
            }
          });
        }
      });
    }
    return generatedList;
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        setIsLoading(true);
        // Menggunakan endpoint publik yang kita buat sebelumnya
        const response = await api.get("/jadwal-dokter-public");

        if (response.data && response.data.data) {
          const formattedData = generateUpcomingSchedules(response.data.data);
          setSchedules(formattedData);
        }
      } catch (err) {
        console.error("Gagal mengambil jadwal:", err);
        setError(
          "Gagal memuat jadwal dokter. Pastikan koneksi internet lancar."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  // --- FILTER LOGIC ---
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
      {/* 1. HEADER (Mengambil data user sendiri) */}
      <Header />

      {/* 2. NAVBAR (Navigasi aktif di Cek Jadwal) */}
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
        ) : error ? (
          <div className="p-8 bg-red-50 rounded-xl text-center text-red-600 border border-red-200">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
            <p>{error}</p>
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
