"use client";

import {
  History,
  MessageSquare,
  PlusCircle,
  Search,
  UploadCloud,
  CheckCircle,
  Calendar,
  Clock,
} from "lucide-react";
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";

// Mock data user & jadwal
const mockUserData = {
  name: "Dila Wahyu",
  isProfileComplete: true,
  activeReservations: 1,
  unreadNotifications: 3,
  nextAppointment: {
    poli: "Poli Penyakit Dalam",
    doctor: "dr. Budi Santoso",
    date: "05 Sept 2025",
    time: "10:00 WIT",
    antrianRS: 9,
    posisiSaatIni: 1,
    estimasiWaktu: "30 Menit Lagi",
    status: "Terdaftar di Poli Penyakit Dalam",
  },
};

const mockScheduleData = [
  { doctor: "dr. Budi", poli: "Seri, Rabu, Jumat", time: "09:00-12:00 WIT" },
  { doctor: "dr. Andi", poli: "Senin, Kamis", time: "16:00-17:00 WIT" },
];

// --- KOMPONEN BANTUAN ---

// 1. Kartu Status Reservasi Utama
const PrimaryStatusCard = ({ user }) => {
  const { activeReservations, nextAppointment } = user;
  const isReserved = activeReservations > 0;

  return (
    // UBAH: Menggunakan 'border-primary-600'
    <div className="bg-white p-6 rounded-xl shadow-2xl border-l-8 border-primary-600">
      {/* UBAH: Menggunakan 'text-neutral-900' */}
      <h2 className="text-2xl font-extrabold text-neutral-900 mb-4">
        Selamat Datang, {user.name}
      </h2>

      {/* Status Reservasi (Warna semantik dipertahankan) */}
      <div
        className={`p-4 rounded-lg transition duration-300 ${
          isReserved
            ? "bg-green-50 border-green-300"
            : "bg-yellow-50 border-yellow-300"
        }`}
      >
        <div className="flex items-center space-x-2">
          <CheckCircle
            className={`w-5 h-5 ${
              isReserved ? "text-green-600" : "text-yellow-600"
            }`}
          />
          {/* UBAH: Menggunakan 'text-neutral-700' */}
          <span className="font-semibold text-neutral-700">
            Status Reservasi
          </span>
        </div>
        <p
          className={`mt-1 font-medium ${
            isReserved ? "text-green-700" : "text-yellow-700"
          }`}
        >
          {isReserved
            ? `Anda terdaftar di ${nextAppointment.poli}`
            : "Belum ada Reservasi Apapun"}
        </p>
      </div>

      {/* Detail Janji Temu (Jika ada) */}
      {isReserved && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
          <div>
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600">Dokter</span>
            {/* UBAH: Menggunakan 'text-neutral-800' */}
            <p className="font-bold text-neutral-800">
              {nextAppointment.doctor}
            </p>
          </div>
          <div>
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600">Jadwal</span>
            {/* UBAH: Menggunakan 'text-neutral-800' */}
            <p className="font-bold text-neutral-800">
              {nextAppointment.date} - {nextAppointment.time}
            </p>
          </div>
          <div>
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600">No. Antrian Poli</span>
            {/* UBAH: Menggunakan 'text-neutral-800' */}
            <p className="font-bold text-neutral-800">
              {nextAppointment.antrianRS}
            </p>
          </div>
          <div>
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600">Status</span>
            {/* UBAH: Menggunakan 'text-neutral-800' */}
            <p className="font-bold text-neutral-800">
              {nextAppointment.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Kartu Jadwal Poli Tujuan
const ScheduleCard = ({ scheduleData }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
    {/* UBAH: Menggunakan 'text-neutral-800' dan 'text-primary-600' */}
    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
      <Calendar className="w-5 h-5 mr-2 text-primary-600" /> Jadwal Dokter Poli
      Tujuan
    </h2>

    {scheduleData.length > 0 ? (
      <div className="space-y-3">
        {scheduleData.map((s, index) => (
          <div key={index} className="border-b pb-2 last:border-b-0">
            {/* UBAH: Menggunakan 'text-neutral-800' */}
            <p className="font-semibold text-neutral-800">{s.doctor}</p>
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <p className="text-sm text-neutral-600">
              {s.poli} | {s.time}
            </p>
          </div>
        ))}
      </div>
    ) : (
      // UBAH: Menggunakan 'text-neutral-600'
      <p className="text-neutral-600 italic">
        Silakan lakukan reservasi untuk melihat jadwal dokter.
      </p>
    )}

    <a
      href="/user/reservasi"
      // UBAH: Menggunakan 'bg-primary-100', 'text-primary-800', 'hover:bg-primary-200'
      className="mt-4 text-center py-2 bg-primary-100 text-primary-800 rounded-lg font-semibold hover:bg-primary-200 transition"
    >
      Lakukan Reservasi
    </a>
  </div>
);

// 3. Kartu Kontrol Antrian
const QueueControlCard = ({ nextAppointment }) => {
  const isReserved = mockUserData.activeReservations > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
      {/* UBAH: Menggunakan 'text-neutral-800' dan 'text-primary-600' */}
      <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-primary-600" /> Kontrol Antrian
      </h2>

      {isReserved ? (
        <div className="space-y-3 text-sm">
          <p className="flex justify-between">
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600">No. Antrian Anda:</span>
            {/* UBAH: Menggunakan 'text-primary-800' */}
            <span className="font-bold text-lg text-primary-800">
              {nextAppointment.antrianRS}
            </span>
          </p>
          <p className="flex justify-between">
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600">Posisi Saat Ini Dipanggil:</span>
            {/* CATATAN: 'text-green-600' dipertahankan (semantik) */}
            <span className="font-bold text-lg text-green-600">
              {nextAppointment.posisiSaatIni}
            </span>
          </p>
          <div className="pt-2 border-t mt-2">
            {/* UBAH: Menggunakan 'text-neutral-600' */}
            <span className="text-neutral-600 font-bold">
              Estimasi Waktu Tunggu:
            </span>
            {/* CATATAN: 'text-red-500' dipertahankan (semantik) */}
            <p className="text-2xl font-extrabold text-red-500 mt-1">
              {nextAppointment.estimasiWaktu}
            </p>
          </div>
        </div>
      ) : (
        // UBAH: Menggunakan 'text-neutral-600'
        <p className="text-neutral-600 italic">
          Anda harus memiliki reservasi aktif untuk melacak antrian.
        </p>
      )}

      <button
        disabled={!isReserved}
        // UBAH: Menggunakan 'bg-primary-600' dan 'hover:bg-primary-800'
        className="mt-4 w-full text-center py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-800 transition disabled:opacity-50"
      >
        Lihat Jadwal & Antrian
      </button>
    </div>
  );
};

// 4. Kartu Riwayat Kunjungan & Upload Foto
const OtherFeatureCard = ({ title, icon: Icon, placeholder, link, isHistory }) => (
  // UBAH: Menggunakan 'border-primary-500'
  <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary-500">
    {/* UBAH: Menggunakan 'text-neutral-800' dan 'text-primary-600' */}
    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-2 text-primary-600" /> {title}
    </h2>

    {/* UBAH: Menggunakan 'bg-neutral-50' dan 'text-neutral-600' */}
    {isHistory ? (
      <div className="p-8 bg-neutral-50 rounded-lg text-center text-neutral-600">
        <History className="w-8 h-8 mx-auto mb-2" />
        <p className="italic">{placeholder}</p>
      </div>
    ) : (
      <div className="p-8 bg-neutral-50 rounded-lg text-center text-neutral-600">
        <UploadCloud className="w-8 h-8 mx-auto mb-2" />
        <p className="italic">{placeholder}</p>
        {/* UBAH: Menggunakan 'bg-primary-500' dan 'hover:bg-primary-600' */}
        <button className="mt-4 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          Pilih File
        </button>
      </div>
    )}

    {/* UBAH: Menggunakan 'text-primary-600' dan 'hover:text-primary-800' */}
    <a
      href={link}
      className="block mt-4 text-primary-600 font-semibold hover:text-primary-800 text-sm"
    >
      {isHistory ? "Lihat Semua Riwayat" : "Kelola Dokumen"}
    </a>
  </div>
);

export default function DashboardPage() {
  const user = mockUserData;
  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: true },
    { name: "Cek Jadwal Poli & Dokter", href: "/jadwal_DokterPoli", isActive: false },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  return (
    // UBAH: Menggunakan 'bg-neutral-100'
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      <Header user={user} />
      <Navbar navItems={navItems} />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Kartu utama */}
        <PrimaryStatusCard user={user} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <ScheduleCard scheduleData={mockScheduleData} />
          <QueueControlCard nextAppointment={user.nextAppointment} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <OtherFeatureCard
            title="History Kunjungan"
            icon={History}
            placeholder="Belum ada History Kunjungan"
            link="/dashboard/history"
            isHistory={true}
          />
          <OtherFeatureCard
            title="Upload Dokumen/Foto"
            icon={UploadCloud}
            placeholder="Sisipkan atau Tarik File Disini"
            link="/user/profile"
            isHistory={false}
          />
        </div>

        {/* UBAH: Menggunakan 'border-neutral-200' dan 'text-neutral-800' */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-t-4 border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">
            Akses Fitur Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* UBAH: Menggunakan 'bg-primary-500' dan 'hover:bg-primary-600' */}
            <a
              href="/user/reservasi"
              className="text-center p-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition shadow-md"
            >
              <PlusCircle className="w-5 h-5 mx-auto mb-1" /> Reservasi Baru
            </a>
            {/* UBAH: Menggunakan 'bg-secondary-500' dan 'hover:bg-secondary-600' */}
            <a
              href="/dashboard/history"
              className="text-center p-3 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition shadow-md"
            >
              <History className="w-5 h-5 mx-auto mb-1" /> Riwayat Kunjungan
            </a>
            {/* UBAH: Menggunakan 'bg-primary-500' (agar konsisten dgn "Reservasi") */}
            <a
              href="/chat"
              className="text-center p-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition shadow-md"
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-1" /> Chat Admin
            </a>
            {/* UBAH: Menggunakan 'bg-neutral-600' dan 'hover:bg-neutral-700' */}
            <a
              href="/jadwal"
              className="text-center p-3 bg-neutral-600 text-white rounded-lg font-semibold hover:bg-neutral-700 transition shadow-md"
            >
              <Search className="w-5 h-5 mx-auto mb-1" /> Cek Jadwal Dokter
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}