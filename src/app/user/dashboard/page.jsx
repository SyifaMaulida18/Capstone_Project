"use client";

import {
  Calendar,
  Clock,
  FileText,
  History,
  MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api"; 

// --- IMPORT KOMPONEN UI ---
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";
import StatusAntrian from "../../../components/user/StatusAntrian";

// --- HELPER: Format Tanggal Reservasi (Senin, 20 November 2025) ---
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

// --- SUB-KOMPONEN UI ---

const StatBox = ({ number, label, isActive = false }) => (
  <div className={`p-4 rounded-2xl flex flex-col justify-between h-24 w-full ${
    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white'
  }`}>
    <span className="text-3xl font-bold">{number}</span>
    <span className="text-xs font-medium opacity-90 leading-tight">{label}</span>
  </div>
);

const UpcomingReservationCard = ({ appointment, loading, onViewQueue }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 h-auto">
        <div className="h-40 bg-neutral-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-neutral-100 text-center py-8">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="text-sm text-neutral-500">Tidak ada reservasi aktif.</p>
        <a href="/user/reservasi" className="text-blue-600 font-bold text-sm mt-2 block hover:underline">
          Buat Reservasi Baru
        </a>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'confirmed';
  const statusColor = isConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  const statusLabel = isConfirmed ? 'Terkonfirmasi' : 'Menunggu Verifikasi';

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-neutral-100 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-neutral-800">Reservasi Mendatang</h3>
        <span className={`${statusColor} text-xs font-bold px-3 py-1 rounded-full uppercase`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-start space-x-3 mb-2">
        <div className="mt-1 bg-blue-100 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
        <div>
          <p className="font-bold text-neutral-800 text-lg">{appointment.poli?.poli_name || 'Poli Umum'}</p>
          <p className="text-sm text-neutral-500">{appointment.dokter?.nama_dokter || '-'}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 text-sm text-neutral-600 pl-[3.25rem]">
        <Clock className="w-4 h-4" />
        <span>{formatDateLong(appointment.tanggal_reservasi)}</span>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center mb-4 border border-blue-100">
        <span className="text-sm text-blue-600 font-medium">Nomor Antrian Anda</span>
        <span className="text-3xl font-extrabold text-blue-800 mt-1">{appointment.nomor_antrian || "-"}</span>
        {!appointment.nomor_antrian && <span className="text-xs text-blue-400 mt-1">(Menunggu verifikasi)</span>}
      </div>

      {isConfirmed && (
          <button onClick={onViewQueue} className="w-full py-3 rounded-xl border border-neutral-200 font-semibold text-neutral-700 hover:bg-neutral-50 transition">
            Lihat Status Antrian
          </button>
      )}
    </div>
  );
};

const MenuButton = ({ icon: Icon, label, href, isActive = false, hasNotif = false }) => (
  <a href={href} className={`p-5 rounded-3xl shadow-md flex flex-col justify-between h-32 transition-all duration-200 hover:scale-[1.02] ${
    isActive ? 'bg-blue-600 text-white' : 'bg-white text-neutral-800'
  }`}>
    <div className="flex justify-between items-start">
      <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-blue-600'}`} />
      {hasNotif && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
    </div>
    <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-neutral-700'}`}>{label}</span>
  </a>
);

// --- MAIN PAGE ---
export default function DashboardPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAntrian, setShowAntrian] = useState(false);

  const [userName, setUserName] = useState("");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [stats, setStats] = useState({ active: 0, total: 0, messages: 0 });

  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: true },
    { name: "Cek Jadwal Poli", href: "/jadwal_DokterPoli", isActive: false },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            // 1. Setup User Name
            const storedUserStr = localStorage.getItem("user");
            if (storedUserStr) {
                const userObj = JSON.parse(storedUserStr);
                setUserName(userObj.name || userObj.Nama || "Pasien");
            }

            // 2. Fetch Data Reservasi (Hanya ini yang di-fetch)
            const reservRes = await api.get('/my-reservations');

            // --- PROSES DATA RESERVASI ---
            const reservations = reservRes.data;
            const activeReservations = reservations.filter(r => ['pending', 'confirmed'].includes(r.status));
            const todayDate = new Date().setHours(0,0,0,0);
            const upcoming = activeReservations
                .filter(r => new Date(r.tanggal_reservasi) >= todayDate)
                .sort((a, b) => new Date(a.tanggal_reservasi) - new Date(b.tanggal_reservasi));

            setNextAppointment(upcoming[0] || null);
            setStats({
                active: activeReservations.length,
                total: reservations.length,
                messages: 0 
            });

        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchDashboardData();
  }, []);

  if (showAntrian) {
    return <StatusAntrian onBack={() => setShowAntrian(false)} reservation={nextAppointment} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
      <Header />
      <Navbar navItems={navItems} />

      <main className="flex-1 pb-20">
        
        {/* Header Biru */}
        <div className="bg-blue-600 px-6 pt-6 pb-24 rounded-b-[2.5rem] shadow-lg">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-blue-100 text-sm mb-1">Selamat datang,</p>
                    {isLoading ? (
                        <div className="h-8 w-32 bg-white/20 rounded animate-pulse"></div>
                    ) : (
                        <h1 className="text-3xl font-bold text-white capitalize">{userName}</h1>
                    )}
                </div>
            </div>
            <div className="flex space-x-3">
                <StatBox number={stats.active} label="Reservasi Aktif" isActive={true} />
                <StatBox number={stats.total} label="Total Kunjungan" />
                <StatBox number={stats.messages} label="Pesan Baru" />
            </div>
        </div>

        {/* Konten Utama */}
        <div className="px-6 -mt-16 space-y-6">
            
            {/* Card Reservasi Mendatang */}
            <UpcomingReservationCard 
                appointment={nextAppointment} 
                loading={isLoading} 
                onViewQueue={() => setShowAntrian(true)} 
            />

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MenuButton icon={Clock} label="Buat Reservasi" href="/user/reservasi" isActive={true} />
                <MenuButton icon={Calendar} label="Jadwal Dokter" href="/user/jadwal_DokterPoli" />
                <MenuButton icon={History} label="Riwayat" href="/user/riwayat" />
                <MenuButton icon={MessageSquare} label="Chat Admin" href="/user/chat" hasNotif={stats.messages > 0} />
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}