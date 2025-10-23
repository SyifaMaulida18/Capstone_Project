"use client";

import {
    History,
    MessageSquare,
    PlusCircle,
    Search,
    UploadCloud,
    CheckCircle,
    Calendar,
    Clock
} from "lucide-react";
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";

// Mock data user & jadwal
const mockUserData = {
  name: "Syifa Maulida",
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

// 1. Kartu Status Reservasi Utama (Menggantikan StatusCard dan NextAppointmentCard)
const PrimaryStatusCard = ({ user }) => {
    const { activeReservations, nextAppointment } = user;
    const isReserved = activeReservations > 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl border-l-8 border-indigo-600">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                Selamat Datang, {user.name}
            </h2>

            {/* Status Reservasi */}
            <div className={`p-4 rounded-lg transition duration-300 ${isReserved ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
                <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-5 h-5 ${isReserved ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className="font-semibold text-gray-700">Status Reservasi</span>
                </div>
                <p className={`mt-1 font-medium ${isReserved ? 'text-green-700' : 'text-yellow-700'}`}>
                    {isReserved ? `Anda terdaftar di ${nextAppointment.poli}` : 'Belum ada Reservasi Apapun'}
                </p>
            </div>

            {/* Detail Janji Temu (Jika ada) */}
            {isReserved && (
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
                    <div>
                        <span className="text-gray-500">Dokter</span>
                        <p className="font-bold text-gray-800">{nextAppointment.doctor}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Jadwal</span>
                        <p className="font-bold text-gray-800">{nextAppointment.date} - {nextAppointment.time}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">No. Antrian Poli</span>
                        <p className="font-bold text-gray-800">{nextAppointment.antrianRS}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Status</span>
                        <p className="font-bold text-gray-800">{nextAppointment.status}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Kartu Jadwal Poli Tujuan
const ScheduleCard = ({ scheduleData }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> Jadwal Dokter Poli Tujuan
        </h2>
        
        {scheduleData.length > 0 ? (
            <div className="space-y-3">
                {scheduleData.map((s, index) => (
                    <div key={index} className="border-b pb-2 last:border-b-0">
                        <p className="font-semibold text-gray-800">{s.doctor}</p>
                        <p className="text-sm text-gray-500">{s.poli} | {s.time}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-600 italic">Silakan lakukan reservasi untuk melihat jadwal dokter.</p>
        )}
        
        <a 
            href="/reservasi"
            className="mt-4 text-center py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition"
        >
            Lakukan Reservasi
        </a>
    </div>
);

// 3. Kartu Kontrol Antrian (Posisi saat ini & estimasi)
const QueueControlCard = ({ nextAppointment }) => {
    const isReserved = mockUserData.activeReservations > 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" /> Kontrol Antrian
            </h2>

            {isReserved ? (
                <div className="space-y-3 text-sm">
                    <p className="flex justify-between">
                        <span className="text-gray-500">No. Antrian Anda:</span>
                        <span className="font-bold text-lg text-indigo-700">{nextAppointment.antrianRS}</span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-500">Posisi Saat Ini Dipanggil:</span>
                        <span className="font-bold text-lg text-green-600">{nextAppointment.posisiSaatIni}</span>
                    </p>
                    <div className="pt-2 border-t mt-2">
                        <span className="text-gray-500 font-bold">Estimasi Waktu Tunggu:</span>
                        <p className="text-2xl font-extrabold text-red-500 mt-1">{nextAppointment.estimasiWaktu}</p>
                    </div>
                </div>
            ) : (
                <p className="text-gray-600 italic">Anda harus memiliki reservasi aktif untuk melacak antrian.</p>
            )}

            <button 
                disabled={!isReserved}
                className="mt-4 w-full text-center py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
                Lihat Jadwal & Antrian
            </button>
        </div>
    );
};

// 4. Kartu Riwayat Kunjungan & Upload Foto
const OtherFeatureCard = ({ title, icon: Icon, placeholder, link, isHistory }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Icon className="w-5 h-5 mr-2 text-indigo-600" /> {title}
        </h2>
        
        {isHistory ? (
            <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2" />
                <p className="italic">{placeholder}</p>
            </div>
        ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
                <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                <p className="italic">{placeholder}</p>
                <button className="mt-4 px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                    Pilih File
                </button>
            </div>
        )}
        
        <a href={link} className="block mt-4 text-indigo-600 font-semibold hover:text-indigo-800 text-sm">
            {isHistory ? 'Lihat Semua Riwayat' : 'Kelola Dokumen'}
        </a>
    </div>
);


export default function DashboardPage() {
  const user = mockUserData;
  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: true },
    { name: "Cek Jadwal Poli & Dokter", href: "/user/jadwal", isActive: false },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
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
            link="/profile"
            isHistory={false}
          />
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-t-4 border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Akses Fitur Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/reservasi" className="text-center p-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition shadow-md">
              <PlusCircle className="w-5 h-5 mx-auto mb-1" /> Reservasi Baru
            </a>
            <a href="/dashboard/history" className="text-center p-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition shadow-md">
              <History className="w-5 h-5 mx-auto mb-1" /> Riwayat Kunjungan
            </a>
            <a href="/chat" className="text-center p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow-md">
              <MessageSquare className="w-5 h-5 mx-auto mb-1" /> Chat Admin
            </a>
            <a href="/jadwal" className="text-center p-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition shadow-md">
              <Search className="w-5 h-5 mx-auto mb-1" /> Cek Jadwal Dokter
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
