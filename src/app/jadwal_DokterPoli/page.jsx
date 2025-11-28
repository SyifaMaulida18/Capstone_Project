"use client";

import axios from "axios";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Heart,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- IMPORTS KOMPONEN UI ---
// Pastikan path ini sesuai dengan struktur folder project kamu
import Footer from "../../components/user/Footer";
import Header from "../../components/user/Header";
import Navbar from "../../components/user/Navbar";

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

// --- HELPER: Mengubah Nama Hari ke Tanggal Terdekat ---
const getNextDateForDay = (dayName) => {
  const daysMap = {
    minggu: 0, senin: 1, selasa: 2, rabu: 3,
    kamis: 4, jumat: 5, sabtu: 6
  };
  
  const targetDay = daysMap[dayName.toLowerCase()];
  if (targetDay === undefined) return null;

  const date = new Date();
  const currentDay = date.getDay();
  
  // Hitung selisih hari untuk mendapatkan tanggal target terdekat
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7; // Jika hari sudah lewat minggu ini, ambil minggu depan
  }
  
  date.setDate(date.getDate() + daysUntilTarget);
  return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
};

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
        {/* Header Kartu: Dokter & Poli */}
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
          {/* Badge Kuota */}
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

        {/* Info Waktu & Tanggal */}
        <div className="text-sm text-neutral-600 space-y-1 border-t pt-2 mt-2">
          <p className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-neutral-500" />{" "}
            {formatDate(schedule.dateKey)}
          </p>
          <p className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-neutral-500" />
            {schedule.time} <span className="ml-1 font-semibold text-primary-600">({schedule.session})</span>
          </p>
          {schedule.keterangan && (
            <p className="text-xs italic text-neutral-500 mt-1">
              Note: {schedule.keterangan}
            </p>
          )}
        </div>
      </div>

      {/* Tombol Reservasi - Mengirim Data via URL Query */}
      {schedule.available && (
        <a
          href={`/user/reservasi?dokter_id=${schedule.raw_dokter_id}&poli_id=${schedule.raw_poli_id}&tanggal=${schedule.dateKey}&sesi=${schedule.session}`}
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

  // Konfigurasi Navigasi Navbar
  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: false },
    { name: "Cek Jadwal Poli & Dokter", href: "/user/jadwal_DokterPoli", isActive: true },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  // --- FETCH DATA (useEffect) ---
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // 1. Ambil Token dari LocalStorage (Sesuai Login)
        const token = localStorage.getItem("token");

        // 2. Siapkan Header Authorization
        const config = {
          headers: {
             Authorization: token ? `Bearer ${token}` : "",
          }
        };

        // 3. Request ke Backend
        const response = await axios.get("http://localhost:8000/api/jadwal-dokter", config);
        
        if (response.data.success) {
          const backendData = response.data.data;
          const formattedList = [];

          // Array bantuan untuk looping kolom dinamis database
          const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
          const sessions = ['pagi', 'siang', 'sore'];

          // --- LOGIKA TRANSFORMASI DATA (Horizontal -> Vertikal) ---
          backendData.forEach((record) => {
            // Loop setiap hari (Senin s/d Minggu)
            days.forEach((day) => {
              // Cek apakah dokter praktek di hari tersebut (Y/N)
              const isPraktek = record[`${day}_praktek`] === 'Y';

              if (isPraktek) {
                // Loop setiap sesi (Pagi, Siang, Sore)
                sessions.forEach((session) => {
                   // Ambil data dinamis: senin_pagi_dari, senin_pagi_sampai, dst.
                   const startTime = record[`${day}_${session}_dari`];
                   const endTime = record[`${day}_${session}_sampai`];
                   const quota = record[`${day}_${session}_kuota`];

                   // Hanya tampilkan jika jam mulai & selesai valid (tidak null)
                   if (startTime && endTime) {
                     const dateKey = getNextDateForDay(day);

                     formattedList.push({
                        // ID unik kombinasi dokter-poli-hari-sesi
                        id: `${record.dokter_id}-${record.poli_id}-${day}-${session}`,
                        
                        // Data Mentah untuk URL Param
                        raw_dokter_id: record.dokter_id,
                        raw_poli_id: record.poli_id,
                        
                        // Data Tampilan
                        doctor: record.dokter?.nama_dokter || "Dokter Tidak Diketahui",
                        poli: record.poli?.poli_name || "Poli Tidak Diketahui",
                        dateKey: dateKey,
                        time: `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`,
                        session: session.charAt(0).toUpperCase() + session.slice(1), // Capitalize
                        quota: quota,
                        available: quota > 0, // Logic ketersediaan
                        keterangan: record[`${day}_keterangan`],
                     });
                   }
                });
              }
            });
          });

          setSchedules(formattedList);
        }
      } catch (error) {
        console.error("Gagal mengambil jadwal:", error);
        // Jika token expired (401), redirect ke login (opsional)
        if (error.response && error.response.status === 401) {
            // router.push("/login"); // Uncomment jika ingin auto redirect
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // --- LOGIKA FILTER (Search & Dropdown) ---
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => {
        // Filter Poli
        const matchPoli =
          selectedPoli === "Semua Poli" ||
          (schedule.poli &&
            schedule.poli.toLowerCase().includes(
                selectedPoli.toLowerCase().replace("poli ", "").trim()
            ));

        // Filter Search Nama Dokter
        const matchSearch = schedule.doctor
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return matchPoli && matchSearch;
      })
      .sort((a, b) => {
        // Urutkan berdasarkan Tanggal dulu, baru Jam
        if (a.dateKey !== b.dateKey) {
          return a.dateKey.localeCompare(b.dateKey);
        }
        return a.time.localeCompare(b.time);
      });
  }, [searchTerm, selectedPoli, schedules]);

  // --- RENDER UI ---
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      {/* 1. Header & Navbar */}
      <Header />
      <Navbar navItems={navItems} />

      {/* 2. Konten Utama */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 flex items-center justify-center">
            <Calendar className="w-8 h-8 mr-3 text-primary-600" /> Jadwal Dokter & Poli
          </h1>
          <p className="mt-2 text-neutral-600">
            Temukan jadwal praktek dokter terbaru untuk minggu ini.
          </p>
        </header>

        {/* Filter Section (Search & Dropdown) */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-neutral-200 flex flex-col md:flex-row gap-4 items-center">
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

        {/* Grid Jadwal */}
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
              Tidak ada jadwal dokter yang sesuai dengan pencarian atau filter Anda saat ini.
            </p>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}