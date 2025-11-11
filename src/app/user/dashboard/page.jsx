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
  AlertTriangle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api"; // Sesuaikan path jika perlu
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";

// --- KOMPONEN BANTUAN DISESUAIKAN ---

// 1. Kartu Status Reservasi Utama (Props diubah)
const PrimaryStatusCard = ({ userName, nextAppointment }) => {
  const isReserved = nextAppointment != null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border-l-8 border-primary-600">
      <h2 className="text-2xl font-extrabold text-neutral-900 mb-4">
        Selamat Datang, {userName}
      </h2>

      <div
        className={`p-4 rounded-lg transition duration-300 ${
          isReserved
            ? "bg-green-50 border-green-300"
            : "bg-yellow-50 border-yellow-300"
        }`}
      >
        <div className="flex items-center space-x-2">
          {isReserved ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
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
            ? `Anda terdaftar di ${nextAppointment.poli.poli_name}`
            : "Belum ada Reservasi Apapun"}
        </p>
      </div>

      {/* Detail Janji Temu (Jika ada) */}
      {isReserved && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
          <div>
            <span className="text-neutral-600">Dokter</span>
            <p className="font-bold text-neutral-800">
              {nextAppointment.dokter.nama_dokter}
            </p>
          </div>
          <div>
            <span className="text-neutral-600">Jadwal</span>
            <p className="font-bold text-neutral-800">
              {nextAppointment.tanggal_reservasi}
            </p>
          </div>
          <div>
            <span className="text-neutral-600">No. Antrian Poli</span>
            <p className="font-bold text-neutral-800">
              {nextAppointment.nomor_antrian}
            </p>
          </div>
          <div>
            <span className="text-neutral-600">Status</span>
            <p className="font-bold text-neutral-800">
              {nextAppointment.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Kartu Jadwal Poli Tujuan (Logika format data di component utama)
const ScheduleCard = ({ scheduleData }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
      <Calendar className="w-5 h-5 mr-2 text-primary-600" /> Jadwal Dokter Poli
      Tujuan
    </h2>

    {scheduleData.length > 0 ? (
      <div className="space-y-3">
        {scheduleData.map((s, index) => (
          <div key={index} className="border-b pb-2 last:border-b-0">
            <p className="font-semibold text-neutral-800">{s.doctor}</p>
            <p className="text-sm text-neutral-600">
              {s.days} | {s.time}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-neutral-600 italic">
        Silakan lakukan reservasi untuk melihat jadwal dokter.
      </p>
    )}

    <a
      href="/user/reservasi"
      className="mt-4 text-center py-2 bg-primary-100 text-primary-800 rounded-lg font-semibold hover:bg-primary-200 transition"
    >
      Lakukan Reservasi
    </a>
  </div>
);

// 3. Kartu Kontrol Antrian (Props diubah)
const QueueControlCard = ({ nextAppointment, queueData }) => {
  const isReserved = nextAppointment != null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
      <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-primary-600" /> Kontrol Antrian
      </h2>

      {isReserved ? (
        <div className="space-y-3 text-sm">
          <p className="flex justify-between">
            <span className="text-neutral-600">No. Antrian Anda:</span>
            <span className="font-bold text-lg text-primary-800">
              {nextAppointment.nomor_antrian}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-neutral-600">Posisi Saat Ini Dipanggil:</span>
            <span className="font-bold text-lg text-green-600">
              {queueData?.sedang_dipanggil?.nomor_antrian || "-"}
            </span>
          </p>
          <div className="pt-2 border-t mt-2">
            <span className="text-neutral-600 font-bold">
              Sisa Antrian Saat Ini:
            </span>
            <p className="text-2xl font-extrabold text-red-500 mt-1">
              {queueData?.sisa_antrian ?? 0} Orang
            </p>
          </div>
        </div>
      ) : (
        <p className="text-neutral-600 italic">
          Anda harus memiliki reservasi aktif untuk melacak antrian.
        </p>
      )}

      <button
        disabled={!isReserved}
        className="mt-4 w-full text-center py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-800 transition disabled:opacity-50"
      >
        Lihat Jadwal & Antrian
      </button>
    </div>
  );
};

// 4. Kartu Riwayat Kunjungan & Upload Foto (Disesuaikan untuk data live)
const OtherFeatureCard = ({
  title,
  icon: Icon,
  placeholder,
  link,
  isHistory,
  historyData, // Prop baru
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary-500">
    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-2 text-primary-600" /> {title}
    </h2>

    {isHistory ? (
      // Tampilkan history jika ada
      historyData && historyData.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {historyData.map((h) => (
            <div
              key={h.reservid}
              className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <p className="font-semibold text-neutral-800">{h.poli.poli_name}</p>
              <p className="text-sm text-neutral-600">
                {h.tanggal_reservasi} -{" "}
                <span
                  className={`font-medium ${
                    h.status === "selesai"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {h.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Tampilkan placeholder jika tidak ada history
        <div className="p-8 bg-neutral-50 rounded-lg text-center text-neutral-600">
          <History className="w-8 h-8 mx-auto mb-2" />
          <p className="italic">{placeholder}</p>
        </div>
      )
    ) : (
      // Bagian Upload (tidak berubah)
      <div className="p-8 bg-neutral-50 rounded-lg text-center text-neutral-600">
        <UploadCloud className="w-8 h-8 mx-auto mb-2" />
        <p className="italic">{placeholder}</p>
        <button className="mt-4 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          Pilih File
        </button>
      </div>
    )}

    <a
      href={link}
      className="block mt-4 text-primary-600 font-semibold hover:text-primary-800 text-sm"
    >
      {isHistory ? "Lihat Semua Riwayat" : "Kelola Dokumen"}
    </a>
  </div>
);

// --- KOMPONEN UTAMA (PAGE) ---
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  const router = useRouter();

  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: true },
    { name: "Cek Jadwal Poli & Dokter", href: "/jadwal_DokterPoli", isActive: false },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  // Fungsi untuk memformat tanggal YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Fungsi untuk memformat data jadwal
  const formatScheduleData = (schedules, targetPoliId) => {
    const poliSchedules = schedules.filter(s => s.poli_id === targetPoliId);

    return poliSchedules.map(s => {
      let days = [];
      let time = "Tutup";
      
      // Cek setiap hari
      if (s.senin_jam_mulai) {
        days.push("Senin");
        time = `${s.senin_jam_mulai.substring(0,5)} - ${s.senin_jam_selesai.substring(0,5)}`;
      }
      if (s.selasa_jam_mulai) days.push("Selasa");
      if (s.rabu_jam_mulai) days.push("Rabu");
      if (s.kamis_jam_mulai) days.push("Kamis");
      if (s.jumat_jam_mulai) days.push("Jumat");
      if (s.sabtu_jam_mulai) days.push("Sabtu");
      if (s.minggu_jam_mulai) days.push("Minggu");

      // Ambil jam praktek pertama yang valid sebagai contoh
      if (time === "Tutup" && days.length > 0) {
         if (s.selasa_jam_mulai) time = `${s.selasa_jam_mulai.substring(0,5)} - ${s.selasa_jam_selesai.substring(0,5)}`;
         // ... (bisa dilanjutkan untuk hari lain)
      }

      return {
          doctor: s.dokter.nama_dokter,
          days: days.join(', ') || 'Tidak ada jadwal',
          time: time
      };
    });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("userName");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      setUserName(name || "Pasien");

      try {
        // 1. Ambil semua reservasi user
        const resReservations = await api.get("/my-reservations");
        const allReservations = resReservations.data; // Backend mengembalikan array

        // 2. Cari reservasi aktif (confirmed & hari ini atau di masa depan)
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const confirmedApps = allReservations.filter(
          (r) =>
            r.status === "confirmed" && new Date(r.tanggal_reservasi) >= today
        );
        
        // Ambil yang paling dekat
        const nextAppt = confirmedApps.length > 0 ? confirmedApps[0] : null;
        setNextAppointment(nextAppt);

        // 3. Ambil data history (selesai atau dibatalkan)
        const history = allReservations.filter(
          (r) => r.status === "selesai" || r.status === "cancelled"
        );
        setHistoryData(history);

        // 4. Jika ada reservasi aktif, ambil data jadwal & antrian
        if (nextAppt) {
          // 4a. Ambil data antrian
          try {
            const resQueue = await api.get("/antrian/dashboard", {
              params: {
                poli_id: nextAppt.poli_id,
                tanggal: nextAppt.tanggal_reservasi, // Gunakan tanggal reservasi
              },
            });
            setQueueData(resQueue.data.data);
          } catch (qError) {
            console.error("Gagal mengambil data antrian:", qError);
          }

          // 4b. Ambil data jadwal
          try {
            const resSchedules = await api.get("/jadwal-dokter");
            const formatted = formatScheduleData(resSchedules.data.data, nextAppt.poli_id);
            setScheduleData(formatted);
          } catch (sError) {
            console.error("Gagal mengambil data jadwal:", sError);
          }

        }
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 p-6 bg-white rounded-xl shadow-lg">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-neutral-700 font-medium">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      <Header /> {/* Header mengambil datanya sendiri */}
      <Navbar navItems={navItems} />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <PrimaryStatusCard userName={userName} nextAppointment={nextAppointment} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <ScheduleCard scheduleData={scheduleData} />
          <QueueControlCard
            nextAppointment={nextAppointment}
            queueData={queueData}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <OtherFeatureCard
            title="History Kunjungan"
            icon={History}
            placeholder="Belum ada History Kunjungan"
            link="/dashboard/history"
            isHistory={true}
            historyData={historyData} // Kirim data history
          />
          <OtherFeatureCard
            title="Upload Dokumen/Foto"
            icon={UploadCloud}
            placeholder="Sisipkan atau Tarik File Disini"
            link="/user/profile"
            isHistory={false}
          />
        </div>

        {/* Quick Access (Tidak berubah) */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-t-4 border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">
            Akses Fitur Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/user/reservasi" className="text-center p-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition shadow-md">
              <PlusCircle className="w-5 h-5 mx-auto mb-1" /> Reservasi Baru
            </a>
            <a href="/dashboard/history" className="text-center p-3 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition shadow-md">
              <History className="w-5 h-5 mx-auto mb-1" /> Riwayat Kunjungan
            </a>
            <a href="/chat" className="text-center p-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition shadow-md">
              <MessageSquare className="w-5 h-5 mx-auto mb-1" /> Chat Admin
            </a>
            <a href="/jadwal" className="text-center p-3 bg-neutral-600 text-white rounded-lg font-semibold hover:bg-neutral-700 transition shadow-md">
              <Search className="w-5 h-5 mx-auto mb-1" /> Cek Jadwal Dokter
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}