"use client";

import api from "@/services/api";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  History,
  Hourglass,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Components
import Footer from "../../../components/user/Footer";
import Header from "../../../components/user/Header";
import Navbar from "../../../components/user/Navbar";
import StatusAntrian from "../../../components/user/StatusAntrian";

// Helper: Format tanggal tampilan
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

// Helper: Format tanggal untuk API (YYYY-MM-DD)
const formatDateForApi = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-CA'); 
};

// Component: StatBox
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

// --- COMPONENT: UPCOMING RESERVATION CARD ---
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
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-lg text-center py-8 h-full flex flex-col justify-center items-center">
        <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="font-bold text-neutral-800 text-lg">Belum Ada Jadwal</h3>
        <p className="text-sm text-neutral-500 mb-4 px-6">Tidak ada reservasi aktif.</p>
        <a href="/user/reservasi" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold">Buat Reservasi</a>
      </div>
    );
  }

  const { status, queueData } = appointment;
  const isPending = status === "pending";
  const isConfirmed = status === "confirmed";

  // --- LOGIKA DETEKSI DIPANGGIL ---
  let isDipanggil = false;

  if (isConfirmed && queueData?.sedang_dipanggil) {
      const idYangDipanggil = String(queueData.sedang_dipanggil.reservation_id);
      const idSaya = String(appointment.reservid);
      
      const noAntrianDipanggil = queueData.sedang_dipanggil.nomor_antrian;
      const noAntrianSaya = appointment.nomor_antrian;

      if ((idYangDipanggil && idYangDipanggil === idSaya) || (noAntrianDipanggil && noAntrianDipanggil === noAntrianSaya)) {
          isDipanggil = true;
      }
  }

  // --- STYLING ---
  let cardStyle = "bg-white text-neutral-800 border-neutral-100";
  let badgeStyle = "bg-gray-100 text-gray-700";
  let badgeText = "Status Tidak Diketahui";
  let iconBoxStyle = "bg-blue-100 text-blue-600";
  let titleText = "Detail Reservasi";
  let subTitleClass = "text-neutral-500";

  if (isPending) {
    cardStyle = "bg-orange-50 text-neutral-800 border-orange-100";
    badgeStyle = "bg-orange-100 text-orange-700";
    badgeText = "Menunggu Konfirmasi";
    iconBoxStyle = "bg-orange-200 text-orange-700";
    titleText = "Verifikasi Admin";
    subTitleClass = "text-orange-600/80";
  } 
  else if (isDipanggil) {
    cardStyle = "bg-green-600 text-white border-green-500 ring-4 ring-green-200 shadow-xl shadow-green-200 scale-[1.02]";
    badgeStyle = "bg-white text-green-700 animate-bounce font-bold px-4";
    badgeText = "DIPANGGIL - MASUK SEKARANG";
    iconBoxStyle = "bg-white/20 text-white";
    titleText = "GILIRAN ANDA!";
    subTitleClass = "text-green-100";
  } 
  else if (isConfirmed) {
    cardStyle = "bg-white text-neutral-800 border-neutral-100 shadow-md";
    badgeStyle = "bg-blue-50 text-blue-700";
    badgeText = "Menunggu Giliran";
    iconBoxStyle = "bg-blue-100 text-blue-600";
    titleText = "Antrian Poli";
    subTitleClass = "text-neutral-500";
  }

  return (
    <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-500 h-full flex flex-col justify-between ${cardStyle}`}>
      
      {isDipanggil && (
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full animate-ping duration-1000" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className={`text-lg font-bold ${isDipanggil ? "text-white" : "text-neutral-800"}`}>
            {titleText}
          </h3>
          <p className={`text-xs flex items-center gap-1 mt-1 ${subTitleClass}`}>
            <Clock size={12} /> {formatDateLong(appointment.tanggal_reservasi)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
             <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap ${badgeStyle}`}>
                {badgeText}
             </span>
             {isConfirmed && (
                 <span className={`text-[10px] flex items-center gap-1 ${isDipanggil ? "text-green-100" : "text-neutral-400"}`}>
                    <RefreshCw size={8} className="animate-spin"/> Live Update
                 </span>
             )}
        </div>
      </div>

      {/* Body */}
      <div className="flex items-center space-x-4 mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${iconBoxStyle}`}>
          {isDipanggil ? <Megaphone className="w-6 h-6 animate-pulse" /> : (isPending ? <Hourglass className="w-6 h-6" /> : <FileText className="w-6 h-6" />)}
        </div>
        <div className="min-w-0">
          <p className={`font-bold text-lg truncate ${isDipanggil ? "text-white" : "text-neutral-800"}`}>
            {appointment.poli?.poli_name}
          </p>
          <p className={`text-sm truncate ${subTitleClass}`}>
            {appointment.dokter?.nama_dokter || "Dokter belum ditentukan"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto relative z-10">
        {isPending && (
           <div className="bg-white/60 p-3 rounded-xl border border-orange-100">
             <div className="flex gap-2 text-xs text-orange-800 leading-relaxed">
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
               <p>Sedang ditinjau admin.</p>
             </div>
           </div>
        )}

        {isConfirmed && (
          <>
            <div className={`rounded-2xl p-4 border mb-3 flex justify-between items-center ${isDipanggil ? "bg-white/10 border-white/20 text-white" : "bg-neutral-50 border-neutral-200"}`}>
               <div>
                  <span className={`text-[10px] uppercase tracking-wider ${isDipanggil ? "text-green-100" : "text-neutral-500"}`}>
                    No. Antrian
                  </span>
                  <div className={`text-3xl font-black leading-none mt-1 ${isDipanggil ? "text-white" : "text-neutral-800"}`}>
                    {appointment.nomor_antrian?.split("-").pop() || "?"}
                  </div>
               </div>
               
               <div className="text-right">
                  {isDipanggil ? (
                     <div className="flex flex-col items-end">
                       <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold animate-pulse mb-1">
                         GILIRAN ANDA
                       </span>
                       <span className="text-[10px] text-green-100">Silakan masuk ke poli</span>
                     </div>
                  ) : (
                    <>
                      <span className="text-[10px] text-neutral-400 block">Sisa Antrian</span>
                      <span className="font-bold text-sm text-neutral-700">
                          {queueData ? `${queueData.sisa_antrian} Org Lagi` : "-"}
                      </span>
                    </>
                  )}
               </div>
            </div>

            <button 
              onClick={() => onViewQueue(appointment, queueData)} 
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg ${
                isDipanggil 
                  ? "bg-white text-green-700 hover:bg-green-50 shadow-green-900/20" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              <Users size={16} />
              {isDipanggil ? "Lihat Detail Panggilan" : "Lihat Antrian"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Component: MenuButton
const MenuButton = ({ icon: Icon, label, href }) => (
  <a href={href} className="p-5 rounded-3xl bg-white shadow-sm border flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <Icon className="w-8 h-8 text-blue-600" />
    </div>
    <span className="font-bold text-sm">{label}</span>
  </a>
);

/* ============================================================
   PAGE: DASHBOARD UTAMA
============================================================ */
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAntrianModal, setShowAntrianModal] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const [activeAppointments, setActiveAppointments] = useState([]);
  const [selectedQueueAppt, setSelectedQueueAppt] = useState(null);
  const [selectedQueueData, setSelectedQueueData] = useState(null);
  const [stats, setStats] = useState({ active: 0, visits: 0, messages: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. FETCH INITIAL DATA
  useEffect(() => {
    let currentUserId = null;
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          currentUserId = parsedUser.userid || parsedUser.id; 
        } catch (e) { console.error(e); }
      }
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        try {
            const profileRes = await api.get("/profile");
            if (!profileRes.data) setShowProfileAlert(true);
        } catch (e) { 
             if (e.response?.status === 404) setShowProfileAlert(true); 
        }

        const [resReservations, resRekamMedis] = await Promise.all([
            api.get("/my-reservations"),
            api.get("/rekam-medis")
        ]);

        let reservations = [];
        if (Array.isArray(resReservations.data)) {
            reservations = resReservations.data;
        } else if (resReservations.data?.data && Array.isArray(resReservations.data.data)) {
            reservations = resReservations.data.data;
        }

        const rawRekamMedis = resRekamMedis.data?.data || resRekamMedis.data || [];
        let myTotalVisits = 0;
        if (currentUserId) {
            const myRekamMedis = rawRekamMedis.filter(rm => {
                const bookedUserId = rm.reservasi?.booked_user_id;
                return String(bookedUserId) === String(currentUserId);
            });
            myTotalVisits = myRekamMedis.length;
        }

        const todayStr = formatDateForApi(new Date());

        const potentialList = reservations
          .filter((r) => {
            const isPending = r.status === "pending";
            const rDate = formatDateForApi(r.tanggal_reservasi);
            const isConfirmedToday = r.status === "confirmed" && rDate === todayStr;
            return isPending || isConfirmedToday;
          })
          .sort((a, b) => new Date(a.tanggal_reservasi) - new Date(b.tanggal_reservasi));

        // Initial Fetch Queue Data
        const processedList = await Promise.all(potentialList.map(async (appt) => {
             const apptDateStr = formatDateForApi(appt.tanggal_reservasi);
             let queueData = null;

             if (appt.status === "confirmed" && apptDateStr === todayStr) {
                try {
                    const antrianRes = await api.get("/antrian/dashboard", {
                      params: {
                        poli_id: appt.poli_id,
                        tanggal: apptDateStr,
                      },
                    });
                    if (antrianRes.data.success) {
                        queueData = antrianRes.data.data;
                    }
                } catch (e) { console.error("Err fetch queue init:", e); }
             }
             return { ...appt, queueData };
        }));

        // --- FILTER FINAL: HAPUS JIKA SUDAH SELESAI ---
        const finalActiveList = processedList.filter(appt => {
             // Jika status pending, tetap tampilkan
             if (appt.status === "pending") return true;

             // Jika tidak ada queueData (mungkin error koneksi), tetap tampilkan sementara
             if (!appt.queueData) return true;

             // Cek apakah ID saya ada di daftar 'sudah_selesai'
             // Backend AntrianController return 'sudah_selesai' berisi array objek Antrian
             const isFinished = appt.queueData.sudah_selesai?.some(
                 q => String(q.reservation_id) === String(appt.reservid)
             );

             // Jika sudah selesai, JANGAN tampilkan (return false)
             return !isFinished;
        });

        setActiveAppointments(finalActiveList);
        setStats({ active: finalActiveList.length, visits: myTotalVisits, messages: 0 });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. POLLING REAL-TIME (AUTO UPDATE)
  useEffect(() => {
    const needsPolling = activeAppointments.some(appt => appt.status === "confirmed");
    if (!needsPolling) return;

    const intervalId = setInterval(async () => {
      const todayStr = formatDateForApi(new Date());

      // Fetch data baru
      const rawUpdatedList = await Promise.all(activeAppointments.map(async (appt) => {
          if (appt.status !== "confirmed") return appt;
          const apptDateStr = formatDateForApi(appt.tanggal_reservasi);
          if(apptDateStr !== todayStr) return appt;

          try {
             const antrianRes = await api.get("/antrian/dashboard", {
                params: {
                  poli_id: appt.poli_id,
                  tanggal: apptDateStr,
                },
             });
             if (antrianRes.data.success) {
                 return { ...appt, queueData: antrianRes.data.data };
             }
          } catch (e) {}
          return appt;
      }));

      // --- FILTER POLLING: HAPUS JIKA BARU SAJA SELESAI ---
      const filteredUpdatedList = rawUpdatedList.filter(appt => {
           if (appt.status !== "confirmed") return true;
           if (!appt.queueData) return true;

           // Cek lagi apakah sudah masuk daftar selesai
           const isFinished = appt.queueData.sudah_selesai?.some(
               q => String(q.reservation_id) === String(appt.reservid)
           );

           return !isFinished;
      });

      setActiveAppointments(filteredUpdatedList);
    }, 4000); 

    return () => clearInterval(intervalId);
  }, [activeAppointments]); 

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

      {showProfileAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center">
             <div className="bg-orange-100 p-4 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
             </div>
             <h2 className="text-xl font-bold text-neutral-800 mb-2">Profil Belum Lengkap</h2>
             <p className="text-sm text-neutral-500 mb-6">
                Mohon lengkapi data diri Anda (NIK, Tanggal Lahir, Alamat, dll).
             </p>
             <div className="w-full space-y-3">
                <button 
                  onClick={() => router.push('/user/profile')}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
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
          <div>
            {loading ? (
                <UpcomingReservationCard loading={true} />
            ) : activeAppointments.length > 0 ? (
                <>
                    <div 
                        className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 scrollbar-hide -mx-2 px-2"
                        onScroll={handleScroll}
                    >
                        {activeAppointments.map((appt) => (
                            <div key={appt.reservid} className="min-w-full snap-center">
                                <UpcomingReservationCard
                                    appointment={appt}
                                    onViewQueue={handleOpenQueue}
                                />
                            </div>
                        ))}
                    </div>
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
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}