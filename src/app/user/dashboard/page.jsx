"use client";

import api from "@/services/api";
import {
  Calendar,
  Clock,
  FileText,
  History,
  MessageSquare,
  Users,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Components
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";
import StatusAntrian from "../../../components/user/StatusAntrian";

// Format tanggal helper
const formatDateLong = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/* ============================================================
   COMPONENT: StatBox
============================================================ */
const StatBox = ({ number, label, isActive = false }) => (
  <div
    className={`p-4 rounded-2xl flex flex-col justify-between h-24 w-full ${
      isActive ? "bg-white/20 text-white" : "bg-white/10 text-white"
    }`}
  >
    <span className="text-3xl font-bold">{number}</span>
    <span className="text-xs opacity-90">{label}</span>
  </div>
);

/* ============================================================
   COMPONENT: UpcomingReservationCard
============================================================ */
const UpcomingReservationCard = ({
  appointment,
  antrianData,
  loading,
  onViewQueue,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="h-40 bg-neutral-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg text-center py-8">
        <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="font-bold text-neutral-800 text-lg">Belum Ada Jadwal</h3>
        <p className="text-sm text-neutral-500 mb-4 px-6">
          Tidak ada reservasi aktif atau antrian yang sedang berjalan.
        </p>
        <a
          href="/user/reservasi"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Buat Reservasi Baru
        </a>
      </div>
    );
  }

  const isConfirmed = appointment.status === "confirmed";
  
  // Cek apakah sedang dipanggil (Realtime logic)
  const isDipanggil =
    isConfirmed &&
    antrianData?.sedang_dipanggil?.reservation_id === appointment.reservid;

  return (
    <div
      className={`p-6 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-500 ${
        isDipanggil
          ? "bg-green-600 text-white border-green-500 ring-4 ring-green-200"
          : "bg-white text-neutral-800 border-neutral-100"
      }`}
    >
      {isDipanggil && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full animate-ping" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3
            className={`text-lg font-bold ${
              isDipanggil ? "text-white" : "text-neutral-800"
            }`}
          >
            {isDipanggil ? "GILIRAN ANDA!" : "Reservasi Mendatang"}
          </h3>
          <p
            className={`text-xs flex items-center gap-1 ${
              isDipanggil ? "text-green-100" : "text-neutral-500"
            }`}
          >
            <Clock size={12} /> {formatDateLong(appointment.tanggal_reservasi)}
          </p>
        </div>

        <span
          className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm ${
            isDipanggil
              ? "bg-white text-green-700 animate-bounce"
              : isConfirmed
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isDipanggil
            ? "SEGERA MASUK"
            : isConfirmed
            ? "Terkonfirmasi"
            : "Menunggu Verifikasi"}
        </span>
      </div>

      {/* Poli & Dokter */}
      <div className="flex items-center space-x-4 mb-6 relative z-10">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
            isDipanggil
              ? "bg-white/20 text-white"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          <FileText className="w-6 h-6" />
        </div>

        <div>
          <p
            className={`font-bold text-lg ${
              isDipanggil ? "text-white" : "text-neutral-800"
            }`}
          >
            {appointment.poli?.poli_name}
          </p>
          <p
            className={`text-sm ${
              isDipanggil ? "text-green-100" : "text-neutral-500"
            }`}
          >
            {appointment.dokter?.nama_dokter || "-"}
          </p>
        </div>
      </div>

      {/* Informasi Nomor Antrian (Hanya jika confirmed) */}
      {isConfirmed && (
        <>
          <div
            className={`rounded-2xl p-5 border mb-5 relative z-10 ${
              isDipanggil
                ? "bg-white/10 border-white/20 text-white"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <span
              className={`text-xs ${
                isDipanggil ? "text-green-100" : "text-neutral-500"
              }`}
            >
              Nomor Antrian Anda
            </span>
            <div
              className={`text-4xl font-black ${
                isDipanggil ? "text-white" : "text-neutral-800"
              }`}
            >
              {appointment.nomor_antrian?.split("-").pop() || "?"}
            </div>
            <div
              className={`text-xs mt-1 ${
                isDipanggil ? "text-green-100" : "text-neutral-400"
              }`}
            >
              ({appointment.nomor_antrian})
            </div>

            {isDipanggil && (
              <div className="mt-2 text-sm font-semibold bg-white text-green-700 py-1 px-3 rounded-lg inline-block">
                Silakan Masuk ke Ruangan
              </div>
            )}
          </div>

          <button
            onClick={onViewQueue}
            className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
              isDipanggil
                ? "bg-white text-green-700 hover:bg-green-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Users size={18} />
            {isDipanggil ? "Lihat Monitor Antrian" : "Lihat Status Antrian"}
          </button>
        </>
      )}
    </div>
  );
};

/* ============================================================
   COMPONENT: MenuButton
============================================================ */
const MenuButton = ({ icon: Icon, label, href }) => (
  <a
    href={href}
    className="p-5 rounded-3xl bg-white shadow-sm border flex flex-col justify-between h-32 hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start">
      <Icon className="w-8 h-8 text-blue-600" />
    </div>
    <span className="font-bold text-sm">{label}</span>
  </a>
);

/* ============================================================
   PAGE: Dashboard
============================================================ */
export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showAntrian, setShowAntrian] = useState(false);
  const [userName, setUserName] = useState("");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [antrianInfo, setAntrianInfo] = useState(null);
  const [stats, setStats] = useState({
    active: 0,
    visits: 0,
    messages: 0,
  });

  useEffect(() => {
    // 1. Ambil Nama User
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserName(parsedUser.name || parsedUser.Nama || "Pengguna");
        } catch (e) {
          console.error("Gagal parse user data", e);
        }
      }
    }

    const fetchData = async () => {
      try {
        const res = await api.get("/my-reservations");
        const reservations = res.data;

        // Reset waktu hari ini ke 00:00:00 untuk perbandingan tanggal yang akurat
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStr = new Date().toISOString().split("T")[0];

        // 1. Filter awal: Hanya Pending/Confirmed & Tanggal >= Hari ini
        const potentialList = reservations
          .filter((r) => {
            const isStatusActive = ["pending", "confirmed"].includes(r.status);
            const rDate = new Date(r.tanggal_reservasi);
            rDate.setHours(0, 0, 0, 0);
            return isStatusActive && rDate >= todayStart;
          })
          .sort((a, b) => new Date(a.tanggal_reservasi) - new Date(b.tanggal_reservasi));

        let finalAppointment = null;
        let finalQueueData = null;

        // 2. LOOPING CERDAS UNTUK MENENTUKAN STATUS SEBENARNYA
        for (const candidate of potentialList) {
          
          // CASE A: Status Pending
          // Pasti valid ditampilkan karena belum ada proses antrian
          if (candidate.status === "pending") {
            finalAppointment = candidate;
            break; // Stop loop, ketemu.
          }

          // CASE B: Status Confirmed
          if (candidate.status === "confirmed") {
            const candidateDateStr = new Date(candidate.tanggal_reservasi)
              .toISOString()
              .split("T")[0];

            // B.1: Masa Depan (Besok dst) -> Valid ditampilkan
            if (candidateDateStr > todayStr) {
              finalAppointment = candidate;
              break; 
            }

            // B.2: Hari Ini -> Cek status antrian
            if (candidateDateStr === todayStr) {
              try {
                // Panggil API Antrian untuk poli & tanggal ini
                const antrianRes = await api.get("/antrian/dashboard", {
                  params: {
                    poli_id: candidate.poli_id,
                    tanggal: candidate.tanggal_reservasi,
                  },
                });

                if (antrianRes.data.success) {
                  const qData = antrianRes.data.data;

                  // Cek apakah reservasi ini ada di list "Sedang Dipanggil" atau "Daftar Tunggu"
                  // BE AntrianController hanya mengembalikan status 'menunggu' dan 'dipanggil'
                  const isDipanggil = qData.sedang_dipanggil?.reservation_id === candidate.reservid;
                  const isMenunggu = qData.daftar_tunggu?.some(
                    (item) => item.reservation_id === candidate.reservid
                  );

                  if (isDipanggil || isMenunggu) {
                    // MASIH AKTIF -> Tampilkan
                    finalAppointment = candidate;
                    finalQueueData = qData;
                    break;
                  } else {
                    // TIDAK ADA DI LIST -> Berarti sudah 'selesai' atau 'dilewati'
                    // SKIP candidate ini, jangan ditampilkan di dashboard "Mendatang"
                    // Loop akan lanjut ke item berikutnya (misal reservasi pending besok)
                    continue; 
                  }
                }
              } catch (err) {
                console.error("Gagal validasi antrian hari ini:", err);
                // Fallback: Jika API error, tampilkan saja daripada hilang
                finalAppointment = candidate;
                break;
              }
            }
          }
        }

        setNextAppointment(finalAppointment);
        setAntrianInfo(finalQueueData);

        // --- Update Stats ---
        // Total Kunjungan: Reservasi Confirmed yang sudah lewat (tanggal < hari ini)
        // ATAU reservasi hari ini yang sudah tidak aktif (tidak terpilih jadi finalAppointment)
        const pastConfirmed = reservations.filter((r) => {
            const rDate = new Date(r.tanggal_reservasi);
            rDate.setHours(0, 0, 0, 0);
            
            // Logic kasar: Confirmed dan tanggal <= hari ini
            return r.status === 'confirmed' && rDate <= todayStart;
        });

        // Agar angka 'Reservasi Aktif' konsisten dengan card
        setStats({
          active: finalAppointment ? 1 : 0, 
          visits: pastConfirmed.length, // Bisa disesuaikan lagi logikanya
          messages: 0,
        });

      } catch (err) {
        console.error("Gagal load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ============================================================
     VIEW ANTRIAN MODE
  ============================================================ */
  if (showAntrian && nextAppointment) {
    return (
      <StatusAntrian
        onBack={() => setShowAntrian(false)}
        reservation={nextAppointment}
        initialData={antrianInfo}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <Navbar
        navItems={[
          { name: "Beranda", href: "/user/dashboard", isActive: true },
          { name: "Cek Jadwal Poli", href: "/jadwal_DokterPoli" },
          { name: "Reservasi", href: "/user/reservasi" },
        ]}
      />

      <main className="flex-1 pb-24">
        <div className="bg-blue-600 px-6 pt-8 pb-32 rounded-b-[2.5rem] shadow-xl">
          <p className="text-blue-100 text-sm mb-1">Selamat Datang,</p>
          <h1 className="text-3xl font-bold text-white capitalize">
            {userName || "Pengguna"}
          </h1>
          <div className="flex space-x-3 mt-6">
            <StatBox number={stats.active} label="Reservasi Aktif" isActive />
            <StatBox number={stats.visits} label="Total Kunjungan" />
            <StatBox number={stats.messages} label="Pesan Baru" />
          </div>
        </div>

        <div className="px-6 -mt-20 space-y-6">
          <UpcomingReservationCard
            appointment={nextAppointment}
            loading={loading}
            antrianData={antrianInfo}
            onViewQueue={() => setShowAntrian(true)}
          />

          <h3 className="text-lg font-bold text-neutral-800">Menu Utama</h3>
          <div className="grid grid-cols-2 gap-4">
            <MenuButton icon={Clock} label="Buat Reservasi" href="/user/reservasi" />
            <MenuButton icon={Calendar} label="Jadwal Dokter" href="/jadwal_DokterPoli" />
            <MenuButton icon={History} label="Riwayat Medis" href="/user/riwayat" />
            <MenuButton icon={MessageSquare} label="Chat Admin" href="/user/chat" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}