"use client";

import {
  Calendar,
  Clock,
  History,
  MessageSquare,
  PlusCircle,
  CheckCircle,
  Bell,
  ChevronRight,
  MapPin,
  FileText,
  LogOut // Ikon tambahan untuk logout jika perlu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";
import api from "../../../services/api";

// --- KOMPONEN UI BARU SESUAI DESAIN ---

// 1. Stat Box (Kotak Angka di Header Biru)
const StatBox = ({ number, label, isActive = false }) => (
  <div className={`p-4 rounded-2xl flex flex-col justify-between h-24 w-full ${
    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white'
  }`}>
    <span className="text-3xl font-bold">{number}</span>
    <span className="text-xs font-medium opacity-90 leading-tight">{label}</span>
  </div>
);

// 2. Kartu Reservasi Mendatang (Main Card) - DIPERBAIKI
const UpcomingReservationCard = ({ appointment, loading }) => {
  // --- TAMPILAN LOADING (SKELETON UI) ---
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 h-auto">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-6">
          <div className="h-5 w-40 bg-neutral-200 rounded-md animate-pulse"></div>
          <div className="h-6 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
        </div>

        {/* Info Dokter Skeleton */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-neutral-200 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Nomor Antrian Skeleton (Kotak Besar) */}
        <div className="bg-neutral-100 rounded-xl p-4 h-24 w-full animate-pulse mb-4"></div>

        {/* Tombol Skeleton */}
        <div className="h-12 w-full bg-neutral-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // --- TAMPILAN JIKA TIDAK ADA DATA ---
  if (!appointment) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-neutral-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-neutral-800">Reservasi Mendatang</h3>
        </div>
        <div className="text-center py-6 text-neutral-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
          <p className="text-sm">Tidak ada reservasi aktif saat ini.</p>
          <a href="/user/reservasi" className="text-primary-600 font-bold text-sm mt-2 block hover:underline">
            Buat Reservasi Baru
          </a>
        </div>
      </div>
    );
  }

  // --- TAMPILAN DATA ASLI ---
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-neutral-100 relative overflow-hidden transition-all duration-500 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-neutral-800">Reservasi Mendatang</h3>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
          Terkonfirmasi
        </span>
      </div>

      <div className="flex items-start space-x-3 mb-2">
        <div className="mt-1 bg-blue-100 p-2 rounded-lg">
           <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-neutral-800 text-lg">{appointment.poli.poli_name}</p>
          <p className="text-sm text-neutral-500">{appointment.dokter.nama_dokter}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 text-sm text-neutral-600 pl-[3.25rem]">
        <Clock className="w-4 h-4" />
        <span>{appointment.tanggal_reservasi}</span>
      </div>

      {/* Kotak Nomor Antrian */}
      <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center mb-4 border border-blue-100">
        <span className="text-sm text-blue-600 font-medium">Nomor Antrian Anda</span>
        <span className="text-3xl font-extrabold text-blue-800 mt-1">{appointment.nomor_antrian}</span>
      </div>

      <button className="w-full py-3 rounded-xl border border-neutral-200 font-semibold text-neutral-700 hover:bg-neutral-50 transition flex justify-center items-center">
        Lihat Status Antrian
      </button>
    </div>
  );
};

// 3. Menu Grid Item
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

// 4. Notification Item
const NotificationItem = ({ title, time, isNew = false }) => (
  <div className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-2xl mb-3">
    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${isNew ? 'bg-blue-600' : 'bg-neutral-300'}`}></div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      <p className="text-xs text-neutral-500 mt-1">{time}</p>
    </div>
  </div>
);


export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [stats, setStats] = useState({ active: 0, total: 0, messages: 2 }); // Messages hardcoded for demo
  
  // Notification Mock Data (Bisa diganti API nanti)
  const notifications = [
    { id: 1, title: "Jangan lupa bawa kartu identitas saat kunjungan", time: "5 jam lalu", isNew: true },
    { id: 2, title: "Hasil lab Anda sudah tersedia", time: "1 hari lalu", isNew: true },
  ];

  // Jika ada appointment, tambahkan notifikasi dinamis
  if (nextAppointment) {
     notifications.unshift({
        id: 0, 
        title: `Reservasi Anda dikonfirmasi untuk ${nextAppointment.tanggal_reservasi}`, 
        time: "Baru saja", 
        isNew: true 
     });
  }

  const router = useRouter();

  // Navigasi tetap sama seperti kode lama
  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: true },
    { name: "Cek Jadwal Poli", href: "/jadwal_DokterPoli", isActive: false },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("userName");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Ambil nama depan saja agar fit di desain
      const firstName = name ? name.split(" ")[0] : "Pasien";
      setUserName(firstName);

      try {
        // 1. Ambil semua reservasi user
        const resReservations = await api.get("/my-reservations");
        const allReservations = resReservations.data;

        // 2. Cari reservasi aktif (confirmed & hari ini atau di masa depan)
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const confirmedApps = allReservations.filter(
          (r) => r.status === "confirmed" && new Date(r.tanggal_reservasi) >= today
        );

        // Ambil yang paling dekat
        const nextAppt = confirmedApps.length > 0 ? confirmedApps[0] : null;
        setNextAppointment(nextAppt);

        // 3. Hitung Stats
        setStats(prev => ({
            ...prev,
            active: confirmedApps.length,
            total: allReservations.length
        }));

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
      {/* Header & Navbar Global (Tetap ada sesuai request) */}
      <Header />
      <Navbar navItems={navItems} />

      <main className="flex-1 pb-20">
        
        {/* --- BLUE HEADER SECTION --- */}
        <div className="bg-blue-600 px-6 pt-6 pb-24 rounded-b-[2.5rem] shadow-lg">
            {/* Top Bar: Greeting & Icons */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-blue-100 text-sm mb-1">Selamat datang,</p>
                    <h1 className="text-3xl font-bold text-white capitalize">{userName}</h1>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex space-x-3">
                <StatBox number={stats.active} label="Reservasi Aktif" isActive={true} />
                <StatBox number={stats.total} label="Total Kunjungan" />
                <StatBox number={stats.messages} label="Pesan Baru" />
            </div>
        </div>

        {/* --- MAIN CONTENT (Overlapping the blue header) --- */}
        <div className="px-6 -mt-16 space-y-6">
            
            {/* 1. Main Card (Reservasi) */}
            <UpcomingReservationCard appointment={nextAppointment} loading={isLoading} />

            {/* 2. Grid Menu */}
            <div className="grid grid-cols-2 gap-4">
                <MenuButton 
                    icon={Clock} 
                    label="Buat Reservasi" 
                    href="/user/reservasi" 
                    isActive={true} // Blue button
                />
                <MenuButton 
                    icon={Calendar} 
                    label="Jadwal Dokter" 
                    href="/jadwal_DokterPoli" 
                />
                <MenuButton 
                    icon={History} 
                    label="Riwayat" 
                    href="/user/riwayat" 
                />
                <MenuButton 
                    icon={MessageSquare} 
                    label="Chat Admin" 
                    href="/user/chat"
                    hasNotif={true}
                />
            </div>

            {/* 3. Notifications Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Notifikasi</h3>
                <div>
                    {notifications.map((notif) => (
                        <NotificationItem 
                            key={notif.id} 
                            title={notif.title} 
                            time={notif.time} 
                            isNew={notif.isNew} 
                        />
                    ))}
                </div>
            </div>
            
        </div>
      </main>

      <Footer />
    </div>
  );
}