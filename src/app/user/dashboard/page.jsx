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

// Format tanggal
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
          Anda tidak memiliki reservasi aktif saat ini.
        </p>
        <a
          href="/user/reservasi"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold"
        >
          Buat Reservasi Baru
        </a>
      </div>
    );
  }

  const isConfirmed = appointment.status === "confirmed";

  // 🔥 Cari antrian user dalam daftar_tunggu
  const antrianUser = antrianData?.daftar_tunggu?.find(
    (x) => x.reservation_id === appointment.reservid
  );

  const isFinished = antrianUser?.status === "selesai";

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border relative overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-neutral-800">
            Reservasi Mendatang
          </h3>
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <Clock size={12} /> {formatDateLong(appointment.tanggal_reservasi)}
          </p>
        </div>

        <span
          className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
            isConfirmed
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isConfirmed ? "Terkonfirmasi" : "Menunggu Verifikasi"}
        </span>
      </div>

      {/* Poli & Dokter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <p className="font-bold text-neutral-800 text-lg">
            {appointment.poli?.poli_name}
          </p>
          <p className="text-sm text-neutral-500">
            {appointment.dokter?.nama_dokter || "-"}
          </p>
        </div>
      </div>

      {/* === CASE 1: Antrian Selesai === */}
      {isConfirmed && isFinished && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <p className="font-bold text-green-700">Antrian Anda Telah Selesai</p>
        </div>
      )}

      {/* === CASE 2: Belum Selesai → Tampilkan Nomor Antrian === */}
      {isConfirmed && !isFinished && (
        <>
          <div className="bg-neutral-50 rounded-2xl p-5 border mb-5">
            <span className="text-xs text-neutral-500">Nomor Antrian Anda</span>
            <div className="text-4xl font-black text-neutral-800">
              {appointment.nomor_antrian.split("-").pop()}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              ({appointment.nomor_antrian})
            </div>
          </div>

          {/* Button lihat antrian */}
          <button
            onClick={onViewQueue}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Users size={18} />
            Lihat Status Antrian
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
    className="p-5 rounded-3xl bg-white shadow-sm border flex flex-col justify-between h-32"
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
    total: 0,
    messages: 0,
  });

  /* ============================================================
     FETCH DATA DASHBOARD
  ============================================================ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Profile
        const profile = await api.get("/profile");
        setUserName(profile.data.data?.name || "Pengguna");

        // 2. Ambil semua reservasi user
        const res = await api.get("/my-reservations");
        const reservations = res.data;

        const today = new Date().setHours(0, 0, 0, 0);
        const activeReservations = reservations.filter((r) =>
          ["pending", "confirmed"].includes(r.status)
        );

        const upcoming = activeReservations
          .filter(
            (r) => new Date(r.tanggal_reservasi).setHours(0, 0, 0, 0) >= today
          )
          .sort(
            (a, b) =>
              new Date(a.tanggal_reservasi) - new Date(b.tanggal_reservasi)
          );

        const next = upcoming[0] || null;
        setNextAppointment(next);

        setStats({
          active: activeReservations.length,
          total: reservations.length,
          messages: 0,
        });

        // 3. Jika reservasi confirmed → ambil data antrian full
        if (next && next.status === "confirmed") {
          const antrian = await api.get("/antrian/dashboard", {
            params: {
              poli_id: next.poli_id,
              tanggal: next.tanggal_reservasi,
            },
          });

          if (antrian.data.success) {
            setAntrianInfo(antrian.data.data);
          }
        }
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

  /* ============================================================
     MAIN UI
  ============================================================ */
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
            <StatBox number={stats.active} label="Jadwal Aktif" isActive />
            <StatBox number={stats.total} label="Total Riwayat" />
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
            <MenuButton
              icon={Clock}
              label="Buat Reservasi"
              href="/user/reservasi"
            />
            <MenuButton
              icon={Calendar}
              label="Jadwal Dokter"
              href="/jadwal_DokterPoli"
            />
            <MenuButton icon={History} label="Riwayat Medis" href="/user/riwayat" />
            <MenuButton icon={MessageSquare} label="Chat Admin" href="/user/chat" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
