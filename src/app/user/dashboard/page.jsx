"use client";

import api from "@/services/api";
import {
  Calendar,
  Clock,
  FileText,
  History,
  MessageSquare,
  Users,
  AlertCircle // Icon untuk pop up
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

const StatBox = ({ number, label, isActive = false, loading = false }) => (
  <div
    className={`p-4 rounded-2xl flex flex-col justify-between h-24 w-full transition-all ${
      isActive ? "bg-white/20 text-white" : "bg-white/10 text-white"
    }`}
  >
    {loading ? (
      <div className="h-8 w-12 bg-white/20 rounded animate-pulse" />
    ) : (
      <span className="text-3xl font-bold animate-fadeIn">{number}</span>
    )}
    <span className="text-xs opacity-90">{label}</span>
  </div>
);

const UpcomingReservationCard = ({
  appointment,
  loading,
  onViewQueue,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 h-full">
        <div className="flex justify-between mb-6">
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-neutral-200 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-12 bg-neutral-200 rounded-2xl animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // State Kosong
  if (!appointment) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg text-center py-8 animate-fadeIn h-full flex flex-col justify-center items-center">
        <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="font-bold text-neutral-800 text-lg">Belum Ada Jadwal</h3>
        <p className="text-sm text-neutral-500 mb-4 px-6">
          Tidak ada reservasi aktif saat ini.
        </p>
        <a
          href="/user/reservasi"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Buat Reservasi
        </a>
      </div>
    );
  }

  // Cek Status Antrian dari data yang sudah ditempel ke appointment
  const queueData = appointment.queueData || null;
  const isConfirmed = appointment.status === "confirmed";
  
  // Logika "Sedang Dipanggil": Status confirmed DAN ada di list 'sedang_dipanggil' antrian
  const isDipanggil =
    isConfirmed &&
    queueData?.sedang_dipanggil?.reservation_id === appointment.reservid;

  return (
    <div
      className={`p-6 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-500 h-full flex flex-col justify-between ${
        isDipanggil
          ? "bg-green-600 text-white border-green-500 ring-4 ring-green-200"
          : "bg-white text-neutral-800 border-neutral-100"
      }`}
    >
      {isDipanggil && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full animate-ping" />
      )}

      {/* Header Card */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className={`text-lg font-bold ${isDipanggil ? "text-white" : "text-neutral-800"}`}>
            {isDipanggil ? "GILIRAN ANDA!" : "Reservasi Aktif"}
          </h3>
          <p className={`text-xs flex items-center gap-1 mt-1 ${isDipanggil ? "text-green-100" : "text-neutral-500"}`}>
            <Clock size={12} /> {formatDateLong(appointment.tanggal_reservasi)}
          </p>
        </div>

        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap ${
            isDipanggil
              ? "bg-white text-green-700 animate-bounce"
              : isConfirmed
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}>
          {isDipanggil ? "MASUK RUANGAN" : isConfirmed ? "Terkonfirmasi" : "Pending"}
        </span>
      </div>

      {/* Body Card */}
      <div className="flex items-center space-x-4 mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${isDipanggil ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"}`}>
          <FileText className="w-6 h-6" />
        </div>
        <div className="min-w-0"> {/* min-w-0 ensures text truncation works if needed */}
          <p className={`font-bold text-lg truncate ${isDipanggil ? "text-white" : "text-neutral-800"}`}>
            {appointment.poli?.poli_name}
          </p>
          <p className={`text-sm truncate ${isDipanggil ? "text-green-100" : "text-neutral-500"}`}>
            {appointment.dokter?.nama_dokter || "-"}
          </p>
        </div>
      </div>

      {/* Footer / Antrian / Button */}
      {isConfirmed ? (
        <div className="mt-auto">
          <div className={`rounded-2xl p-4 border mb-3 relative z-10 ${isDipanggil ? "bg-white/10 border-white/20 text-white" : "bg-neutral-50 border-neutral-200"}`}>
            <div className="flex justify-between items-center">
                <div>
                    <span className={`text-[10px] uppercase tracking-wider ${isDipanggil ? "text-green-100" : "text-neutral-500"}`}>No. Antrian</span>
                    <div className={`text-3xl font-black leading-none mt-1 ${isDipanggil ? "text-white" : "text-neutral-800"}`}>
                    {appointment.nomor_antrian?.split("-").pop() || "?"}
                    </div>
                </div>
                 {/* Jika dipanggil, tampilkan pesan singkat */}
                 {isDipanggil && (
                    <div className="text-right text-xs font-medium bg-white/20 px-2 py-1 rounded">
                        Segera Masuk
                    </div>
                 )}
            </div>
          </div>
          <button 
            onClick={() => onViewQueue(appointment, queueData)} 
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${isDipanggil ? "bg-white text-green-700 hover:bg-green-50 shadow-lg" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg"}`}
          >
            <Users size={16} />
            {isDipanggil ? "Monitor Antrian" : "Lihat Antrian"}
          </button>
        </div>
      ) : (
        <div className="mt-auto pt-2 border-t border-dashed border-neutral-200">
             <p className="text-xs text-neutral-400 text-center italic">
                Menunggu verifikasi admin...
             </p>
        </div>
      )}
    </div>
  );
};

const MenuButton = ({ icon: Icon, label, href }) => (
  <a href={href} className="p-5 rounded-3xl bg-white shadow-sm border flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
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
  const [showAntrianModal, setShowAntrianModal] = useState(false);
  
  // NEW STATE: Untuk pop up profile
  const [showProfileAlert, setShowProfileAlert] = useState(false);

  const [userData, setUserData] = useState(null);
  
  // Menyimpan LIST reservasi aktif, bukan cuma satu
  const [activeAppointments, setActiveAppointments] = useState([]);
  
  // Untuk modal antrian, kita perlu tahu data mana yang sedang dilihat
  const [selectedQueueAppt, setSelectedQueueAppt] = useState(null);
  const [selectedQueueData, setSelectedQueueData] = useState(null);

  const [stats, setStats] = useState({
    active: 0,
    visits: 0,
    messages: 0,
  });

  // State untuk Carousel dots
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let currentUserId = null;

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          currentUserId = parsedUser.userid || parsedUser.id; 
        } catch (e) {
          console.error("Gagal parse user data", e);
        }
      }
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        
        // Cek Profile terlebih dahulu
        try {
            const profileRes = await api.get("/profile");
            // Jika response success tapi data kosong (tergantung return backend)
            // Biasanya backend return 404 kalau profile not found, 
            // atau return 200 dengan data null. Kita handle keduanya.
            if (!profileRes.data) {
                setShowProfileAlert(true);
            }
        } catch (profileError) {
            // Jika error 404, artinya profile belum dibuat
            if (profileError.response && profileError.response.status === 404) {
                setShowProfileAlert(true);
            }
        }

        const [resReservations, resRekamMedis] = await Promise.all([
            api.get("/my-reservations"),
            api.get("/rekam-medis")
        ]);

        const reservations = resReservations.data;
        const rawRekamMedis = resRekamMedis.data?.data || resRekamMedis.data || [];

        // 1. Identifikasi ID Reservasi yang SUDAH SELESAI (Sudah ada di Rekam Medis)
        // Jika ID reservasi ada di rekam medis, berarti sudah diperiksa dokter -> SELESAI
        const finishedReservationIds = rawRekamMedis.map(rm => rm.reservasi?.reservid || rm.reservasi_id);

        // 2. Hitung total kunjungan user (Berdasarkan Rekam Medis)
        let myTotalVisits = 0;
        if (currentUserId) {
            const myRekamMedis = rawRekamMedis.filter(rm => {
                const bookedUserId = rm.reservasi?.booked_user_id;
                return String(bookedUserId) === String(currentUserId);
            });
            myTotalVisits = myRekamMedis.length;
        }

        // --- LOGIC LIST RESERVASI AKTIF ---
        const todayStr = new Date().toLocaleDateString('en-CA'); 
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 3. Filter Reservasi Aktif
        // Syarat: 
        // a. Status pending/confirmed
        // b. Tanggal hari ini atau masa depan
        // c. ID Reservasi TIDAK ADA di daftar finishedReservationIds (Belum diperiksa dokter)
        const potentialList = reservations
          .filter((r) => {
            const isStatusActive = ["pending", "confirmed"].includes(r.status);
            const rDate = new Date(r.tanggal_reservasi);
            rDate.setHours(0, 0, 0, 0);

            // Cek apakah reservasi ini sudah selesai (ada rekam medisnya)
            const isFinished = finishedReservationIds.includes(r.reservid);

            // Return true jika status aktif, tanggal valid, DAN BELUM SELESAI
            return isStatusActive && rDate >= todayStart && !isFinished;
          })
          .sort((a, b) => new Date(a.tanggal_reservasi) - new Date(b.tanggal_reservasi));

        // Proses setiap reservasi aktif untuk cek antrian
        const processedList = await Promise.all(potentialList.map(async (appt) => {
             const apptDateStr = new Date(appt.tanggal_reservasi).toLocaleDateString('en-CA');
             
             let queueData = null;

             if (appt.status === "confirmed" && apptDateStr === todayStr) {
                try {
                    const antrianRes = await api.get("/antrian/dashboard", {
                      params: {
                        poli_id: appt.poli_id,
                        tanggal: appt.tanggal_reservasi,
                      },
                    });
                    if (antrianRes.data.success) {
                        queueData = antrianRes.data.data;
                    }
                } catch (e) {
                    console.warn("Gagal fetch antrian untuk poli", appt.poli_id);
                }
             }
             return { ...appt, queueData };
        }));

        setActiveAppointments(processedList);

        setStats({
          active: processedList.length, 
          visits: myTotalVisits,
          messages: 0,
        });

      } catch (err) {
        console.error("Gagal load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler scroll carousel untuk update dots
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentSlide(index);
  };

  const handleOpenQueue = (appt, qData) => {
      setSelectedQueueAppt(appt);
      setSelectedQueueData(qData);
      setShowAntrianModal(true);
  };

  // --- RENDER MODAL ANTRIAN ---
  if (showAntrianModal && selectedQueueAppt) {
    return (
      <StatusAntrian
        onBack={() => setShowAntrianModal(false)}
        reservation={selectedQueueAppt}
        initialData={selectedQueueData}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 relative">
      <Header />
      <Navbar
        navItems={[
          { name: "Beranda", href: "/user/dashboard", isActive: true },
          { name: "Cek Jadwal Poli", href: "/jadwal_DokterPoli" },
          { name: "Reservasi", href: "/user/reservasi" },
        ]}
      />

      {/* POP UP PROFILE ALERT */}
      {showProfileAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center">
             <div className="bg-orange-100 p-4 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
             </div>
             <h2 className="text-xl font-bold text-neutral-800 mb-2">Profil Belum Lengkap</h2>
             <p className="text-sm text-neutral-500 mb-6">
                Mohon lengkapi data diri Anda (NIK, Tanggal Lahir, Alamat, dll) untuk keperluan administrasi dan rekam medis.
             </p>
             <div className="w-full space-y-3">
                <button 
                  onClick={() => router.push('/user/profile')}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    Lengkapi Sekarang
                </button>
                <button 
                  onClick={() => setShowProfileAlert(false)}
                  className="w-full py-3 bg-transparent text-neutral-500 rounded-xl font-semibold hover:bg-neutral-100 transition"
                >
                    Nanti Saja
                </button>
             </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-24">
        {/* Banner Biru */}
        <div className="bg-blue-600 px-6 pt-8 pb-32 rounded-b-[2.5rem] shadow-xl">
          <p className="text-blue-100 text-sm mb-1">Selamat Datang,</p>
          <h1 className="text-3xl font-bold text-white capitalize">
            {userData?.name || userData?.Nama || "Pengguna"}
          </h1>
          <div className="flex space-x-3 mt-6">
            <StatBox number={stats.active} label="Reservasi Aktif" isActive loading={loading} />
            <StatBox number={stats.visits} label="Total Kunjungan" loading={loading} />
            <StatBox number={stats.messages} label="Pesan Baru" loading={loading} />
          </div>
        </div>

        <div className="px-6 -mt-20 space-y-8">
          
          {/* CAROUSEL RESERVASI */}
          <div>
            {loading ? (
                // Loading Skeleton
                <UpcomingReservationCard loading={true} />
            ) : activeAppointments.length > 0 ? (
                <>
                    {/* Container Scroll */}
                    <div 
                        className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 scrollbar-hide -mx-2 px-2"
                        onScroll={handleScroll}
                    >
                        {activeAppointments.map((appt, idx) => (
                            <div key={appt.reservid} className="min-w-full snap-center">
                                <UpcomingReservationCard
                                    appointment={appt}
                                    onViewQueue={handleOpenQueue}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dots Indicator (Hanya jika > 1 item) */}
                    {activeAppointments.length > 1 && (
                        <div className="flex justify-center gap-2 mt-[-10px]">
                            {activeAppointments.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        currentSlide === idx ? "w-6 bg-blue-600" : "w-2 bg-neutral-300"
                                    }`} 
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                // State Kosong
                <UpcomingReservationCard appointment={null} />
            )}
          </div>

          <div>
             <h3 className="text-lg font-bold text-neutral-800 mb-4">Menu Utama</h3>
             <div className="grid grid-cols-2 gap-4">
                <MenuButton icon={Clock} label="Buat Reservasi" href="/user/reservasi" />
                <MenuButton icon={Calendar} label="Jadwal Dokter" href="/jadwal_DokterPoli" />
                <MenuButton icon={History} label="Riwayat Medis" href="/user/riwayat" />
                <MenuButton icon={MessageSquare} label="Chat Admin" href="/user/chat" />
             </div>
          </div>

        </div>
      </main>
      <Footer />

      {/* Helper CSS untuk hide scrollbar tapi tetap bisa scroll */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}