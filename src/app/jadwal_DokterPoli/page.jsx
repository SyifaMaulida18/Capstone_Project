"use client";

import React, { useState, useMemo } from "react";
import { Search, Heart, Calendar, Clock, User, AlertTriangle } from "lucide-react";
// Asumsi Anda punya komponen Header dan Footer umum atau khusus guest/user
// Sesuaikan path jika perlu
import Header from "@/components/guest/Header"; // Ganti jika ini halaman user
import Footer from "@/components/guest/Footer"; // Ganti jika ini halaman user

// --- DATA MOCK JADWAL (Sama seperti di halaman reservasi) ---
const MOCK_SCHEDULE = [
  { id: "s1", doctor: "Dr. Iqbal Sp.JP", poli: "Poli Jantung", date: "2025-10-03", time: "08:00 - 10:00", quota: 5, price: 150000, available: true, dateKey: "2025-10-03" },
  { id: "s2", doctor: "Dr. Iqbal Sp.JP", poli: "Poli Jantung", date: "2025-10-04", time: "08:00 - 10:00", quota: 3, price: 150000, available: true, dateKey: "2025-10-04" },
  { id: "s3", doctor: "Dr. Rina Sp.PD", poli: "Poli Penyakit Dalam", date: "2025-10-03", time: "10:00 - 12:00", quota: 8, price: 120000, available: true, dateKey: "2025-10-03" },
  { id: "s4", doctor: "Dr. Rina Sp.PD", poli: "Poli Penyakit Dalam", date: "2025-10-04", time: "10:00 - 12:00", quota: 0, price: 120000, available: false, dateKey: "2025-10-04" },
  { id: "s5", doctor: "Dr. Bima Sp.A", poli: "Poli Anak", date: "2025-10-05", time: "14:00 - 16:00", quota: 10, price: 140000, available: true, dateKey: "2025-10-05" },
  { id: "s6", doctor: "Dr. Bima Sp.A", poli: "Poli Anak", date: "2025-10-04", time: "16:00 - 18:00", quota: 2, price: 140000, available: true, dateKey: "2025-10-04" },
  // Tambahkan jadwal lain jika perlu
];

const ALL_POLI_OPTIONS = [
  "Semua Poli", // Opsi untuk menampilkan semua
  "Poli Jantung",
  "Poli Penyakit Dalam",
  "Poli Anak",
  "Poli Mata",
  "Poli Gigi",
  "Poli Umum",
];
// --------------------------------------------------------------------------

// --- Komponen Kartu Jadwal ---
const ScheduleDisplayCard = ({ schedule }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      className={`p-5 rounded-xl shadow-md border-l-4 transition duration-200 ${
        schedule.available
          ? "bg-white border-primary-500 hover:shadow-lg" // Menggunakan border primary
          : "bg-neutral-100 border-red-400 opacity-70" // Background netral untuk yang tidak tersedia
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          {/* Menggunakan text primary */}
          <h3 className="font-bold text-lg text-primary-800 flex items-center">
            <User className="w-4 h-4 mr-2" />
            {schedule.doctor}
          </h3>
          {/* Menggunakan text neutral */}
          <p className="text-sm font-medium text-neutral-600 flex items-center mt-1">
            <Heart className="w-4 h-4 mr-2" />
            {schedule.poli}
          </p>
        </div>
        {/* Status Ketersediaan (Warna semantik dipertahankan) */}
        <p
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            schedule.available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {schedule.available ? `Sisa: ${schedule.quota}` : "Penuh"}
        </p>
      </div>
      {/* Detail Waktu (Menggunakan text neutral) */}
      <div className="text-sm text-neutral-600 space-y-1 border-t pt-2 mt-2">
        <p className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-neutral-500" />{" "}
          {formatDate(schedule.dateKey)}
        </p>
        <p className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-neutral-500" /> Jam:{" "}
          {schedule.time}
        </p>
      </div>
    </div>
  );
};

// --- Komponen Utama Halaman ---
export default function JadwalDokterPoliPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoli, setSelectedPoli] = useState("Semua Poli");

  // Filter jadwal berdasarkan pencarian dan poli terpilih
  const filteredSchedules = useMemo(() => {
    return MOCK_SCHEDULE.filter((schedule) => {
      const matchPoli =
        selectedPoli === "Semua Poli" || schedule.poli === selectedPoli;
      const matchSearch = schedule.doctor
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchPoli && matchSearch;
    }).sort((a, b) => {
      // Urutkan berdasarkan tanggal, lalu jam
      if (a.dateKey !== b.dateKey) {
        return a.dateKey.localeCompare(b.dateKey);
      }
      return a.time.localeCompare(b.time);
    });
  }, [searchTerm, selectedPoli]);

  return (
    // Menggunakan bg-neutral-100 untuk background utama
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      {/* <Header /> Sesuaikan Header jika perlu */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Judul Halaman */}
        <header className="text-center mb-8 md:mb-12">
          {/* Menggunakan text-neutral dan text-primary */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 flex items-center justify-center">
            <Calendar className="w-8 h-8 mr-3 text-primary-600" /> Jadwal Dokter & Poli
          </h1>
          <p className="mt-2 text-neutral-600">
            Temukan jadwal praktek dokter yang tersedia.
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
              // Menggunakan warna neutral dan primary untuk input
              className="block w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-3 text-neutral-900 placeholder-neutral-500 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          {/* Poli Select */}
          <div className="relative w-full md:w-64">
            <select
              value={selectedPoli}
              onChange={(e) => setSelectedPoli(e.target.value)}
              // Menggunakan warna neutral dan primary untuk select
              className="block w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-10 text-neutral-900 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {ALL_POLI_OPTIONS.map((poli) => (
                <option key={poli} value={poli}>
                  {poli}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Heart className="h-5 w-5 text-neutral-500" aria-hidden="true" /> {/* Icon Poli */}
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        {filteredSchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule) => (
              <ScheduleDisplayCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          // Pesan jika tidak ada hasil
          <div className="mt-12 p-8 bg-white rounded-xl shadow border border-neutral-200 text-center text-neutral-600">
            <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-yellow-500" /> {/* Warna semantik */}
            <p className="font-semibold">Jadwal tidak ditemukan.</p>
            <p className="text-sm mt-1">
              Coba ubah kata kunci pencarian atau filter poli Anda.
            </p>
          </div>
        )}
      </main>
      {/* <Footer /> Sesuaikan Footer jika perlu */}
    </div>
  );
}