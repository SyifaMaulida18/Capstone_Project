"use client";

import {
  Calendar,
  Clock,
  FileText,
  History,
  MessageSquare,
  Stethoscope,
  ChevronRight,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api"; // Import API helper

// --- IMPORT KOMPONEN LAIN ---
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";
import StatusAntrian from "../../../components/user/StatusAntrian";

// --- HELPER: Format Tanggal Indonesia ---
const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// --- HELPER: Get Today's Schedule Data ---
const getTodayScheduleInfo = (schedule) => {
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  const todayIndex = new Date().getDay(); // 0 = Minggu, 1 = Senin, dst.
  const todayName = days[todayIndex];

  // 1. Cek apakah praktek hari ini aktif
  const praktekKey = `${todayName}_praktek`;
  const isActive = schedule[praktekKey] == '1' || schedule[praktekKey] == 'Y';

  if (!isActive) return null;

  // 2. Ambil Jam Praktek (Gabungkan Pagi, Siang, Sore jika ada)
  let times = [];
  
  // Pagi
  if (schedule[`${todayName}_pagi_kuota`] > 0) {
      times.push(`${schedule[`${todayName}_pagi_dari`]} - ${schedule[`${todayName}_pagi_sampai`]}`);
  }
  // Siang (jika pagi kosong, atau mau ditampilkan semua, disini kita ambil semua yg ada)
  if (schedule[`${todayName}_siang_kuota`] > 0) {
      times.push(`${schedule[`${todayName}_siang_dari`]} - ${schedule[`${todayName}_siang_sampai`]}`);
  }
  // Sore
  if (schedule[`${todayName}_sore_kuota`] > 0) {
      times.push(`${schedule[`${todayName}_sore_dari`]} - ${schedule[`${todayName}_sore_sampai`]}`);
  }

  // Jika tidak ada jam spesifik tapi status aktif (fallback)
  if (times.length === 0) times.push("Jadwal Tersedia");

  return times.join(", ");
};


// --- SUB-KOMPONEN UI ---

// 1. Stat Box
const StatBox = ({ number, label, isActive = false }) => (
  <div className={`p-4 rounded-2xl flex flex-col justify-between h-24 w-full ${
    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white'
  }`}>
    <span className="text-3xl font-bold">{number}</span>
    <span className="text-xs font-medium opacity-90 leading-tight">{label}</span>
  </div>
);

// 2. Kartu Reservasi Mendatang
const UpcomingReservationCard = ({ appointment, loading, onViewQueue }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 h-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="h-5 w-40 bg-neutral-200 rounded-md animate-pulse"></div>
          <div className="h-6 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-12 w-full bg-neutral-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-neutral-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-neutral-800">Reservasi Mendatang</h3>
        </div>
        <div className="text-center py-6 text-neutral-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
          <p className="text-sm">Tidak ada reservasi aktif saat ini.</p>
          <a href="/user/reservasi" className="text-blue-600 font-bold text-sm mt-2 block hover:underline">
            Buat Reservasi Baru
          </a>
        </div>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'confirmed';
  const statusColor = isConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  const statusLabel = isConfirmed ? 'Terkonfirmasi' : 'Menunggu Verifikasi';

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-neutral-100 relative overflow-hidden transition-all duration-500 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-neutral-800">Reservasi Mendatang</h3>
        <span className={`${statusColor} text-xs font-bold px-3 py-1 rounded-full uppercase`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-start space-x-3 mb-2">
        <div className="mt-1 bg-blue-100 p-2 rounded-lg">
           <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-neutral-800 text-lg">{appointment.poli?.poli_name || 'Poli Umum'}</p>
          <p className="text-sm text-neutral-500">{appointment.dokter?.nama_dokter || 'Dokter belum ditentukan'}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 text-sm text-neutral-600 pl-[3.25rem]">
        <Clock className="w-4 h-4" />
        <span>{formatDateIndo(appointment.tanggal_reservasi)}</span>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center mb-4 border border-blue-100">
        <span className="text-sm text-blue-600 font-medium">Nomor Antrian Anda</span>
        <span className="text-3xl font-extrabold text-blue-800 mt-1">
            {appointment.nomor_antrian || "-"}
        </span>
        {!appointment.nomor_antrian && (
            <span className="text-xs text-blue-400 mt-1">(Akan muncul setelah diverifikasi)</span>
        )}
      </div>

      {isConfirmed && (
          <button 
            onClick={onViewQueue}
            className="w-full py-3 rounded-xl border border-neutral-200 font-semibold text-neutral-700 hover:bg-neutral-50 transition flex justify-center items-center"
          >
            Lihat Status Antrian
          </button>
      )}
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

// 4. Item Jadwal Dokter Hari Ini
const DoctorScheduleItem = ({ doctorName, poliName, time }) => (
    <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm mb-3">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <User size={24} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-neutral-800 truncate">{doctorName}</p>
            <p className="text-xs text-neutral-500 truncate">{poliName}</p>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-md">
                <Clock size={10} /> {time}
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
export default function DashboardPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAntrian, setShowAntrian] = useState(false);

  const [userName, setUserName] = useState("");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [stats, setStats] = useState({ active: 0, total: 0, messages: 0 });
  const [todayDoctors, setTodayDoctors] = useState([]); // State untuk jadwal dokter hari ini

  const navItems = [
    { name: "Beranda", href: "/user/dashboard", isActive: true },
    { name: "Cek Jadwal Poli", href: "/jadwal_DokterPoli", isActive: false },
    { name: "Reservasi", href: "/user/reservasi", isActive: false },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            // 1. Ambil Nama User
            const storedUserStr = localStorage.getItem("user");
            if (storedUserStr) {
                const userObj = JSON.parse(storedUserStr);
                setUserName(userObj.name || userObj.Nama || "Pasien");
            }

            // 2. Ambil Data Reservasi
            const response = await api.get('/my-reservations');
            const reservations = response.data;

            const activeReservations = reservations.filter(r => 
                ['pending', 'confirmed'].includes(r.status)
            );
            
            const today = new Date().setHours(0,0,0,0);
            const upcoming = activeReservations
                .filter(r => new Date(r.tanggal_reservasi) >= today)
                .sort((a, b) => new Date(a.tanggal_reservasi) - new Date(b.tanggal_reservasi));

            setNextAppointment(upcoming[0] || null);
            setStats({
                active: activeReservations.length,
                total: reservations.length,
                messages: 0 
            });

            // 3. Ambil Jadwal Dokter & Filter Hari Ini
            const jadwalRes = await api.get('/jadwal-dokter'); // Endpoint publik
            if (jadwalRes.data && jadwalRes.data.success) {
                const allSchedules = jadwalRes.data.data;
                
                // Filter di Frontend
                const todayList = allSchedules.reduce((acc, schedule) => {
                    const timeInfo = getTodayScheduleInfo(schedule);
                    if (timeInfo) {
                        acc.push({
                            id: `${schedule.dokter_id}-${schedule.poli_id}`,
                            doctorName: schedule.dokter?.nama_dokter || "Dokter",
                            poliName: schedule.poli?.poli_name || "Poli",
                            time: timeInfo
                        });
                    }
                    return acc;
                }, []);

                setTodayDoctors(todayList);
            }

        } catch (error) {
            console.error("Gagal memuat dashboard:", error);
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
        
        {/* --- BLUE HEADER SECTION --- */}
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

        {/* --- MAIN CONTENT --- */}
        <div className="px-6 -mt-16 space-y-6">
            
            {/* 1. Main Card */}
            <UpcomingReservationCard 
                appointment={nextAppointment} 
                loading={isLoading} 
                onViewQueue={() => setShowAntrian(true)} 
            />

            {/* 2. Grid Menu */}
            <div className="grid grid-cols-2 gap-4">
                <MenuButton icon={Clock} label="Buat Reservasi" href="/user/reservasi" isActive={true} />
                <MenuButton icon={Calendar} label="Jadwal Dokter" href="/jadwal_DokterPoli" />
                <MenuButton icon={History} label="Riwayat" href="/user/riwayat" />
                <MenuButton icon={MessageSquare} label="Chat Admin" href="/user/chat" hasNotif={stats.messages > 0} />
            </div>

            {/* 3. Jadwal Dokter Hari Ini (Partial View) */}
            <div className="pt-2">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                        <Stethoscope size={20} className="text-blue-600"/>
                        Jadwal Hari Ini
                    </h3>
                    <a href="/jadwal_DokterPoli" className="text-sm font-semibold text-blue-600 flex items-center hover:underline">
                        Lihat Semua <ChevronRight size={16} />
                    </a>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <div className="h-20 bg-neutral-200 rounded-2xl animate-pulse"></div>
                        <div className="h-20 bg-neutral-200 rounded-2xl animate-pulse"></div>
                    </div>
                ) : todayDoctors.length > 0 ? (
                    <div>
                        {todayDoctors.slice(0, 3).map((doc) => (
                            <DoctorScheduleItem 
                                key={doc.id}
                                doctorName={doc.doctorName}
                                poliName={doc.poliName}
                                time={doc.time}
                            />
                        ))}
                        {todayDoctors.length > 3 && (
                            <div className="text-center mt-2">
                                <span className="text-xs text-gray-400">
                                    + {todayDoctors.length - 3} dokter lainnya tersedia hari ini
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6 bg-white rounded-2xl border border-dashed border-neutral-300 text-center text-neutral-400 text-sm">
                        Tidak ada jadwal praktek hari ini.
                    </div>
                )}
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}