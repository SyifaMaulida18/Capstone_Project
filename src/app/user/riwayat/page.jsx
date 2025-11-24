"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import Sidebar from "../../../components/user/Sidebar"; // 1. Import Sidebar
import {
  ArrowLeft,
  Search,
  FileText,
  Download,
  Eye,
  Clock,
  Loader2,
  AlertCircle,
  Menu // 2. Import Menu Icon untuk Mobile
} from "lucide-react";

export default function RiwayatKunjunganPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [riwayatData, setRiwayatData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE UNTUK SIDEBAR ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Default true agar tidak memblokir menu

  useEffect(() => {
    const initData = async () => {
        try {
            // A. Ambil Data User (untuk Sidebar)
            const localName = localStorage.getItem("userName");
            const localEmail = localStorage.getItem("userEmail");
            // Set data awal dari localStorage biar instan
            setUserData({ name: localName, email: localEmail });

            // Opsional: Ambil data profil lengkap dari API untuk cek kelengkapan & update nama terbaru
            try {
                const profileRes = await api.get("/profile");
                if (profileRes.data && profileRes.data.data) {
                    setUserData(profileRes.data.data);
                    // Cek kelengkapan data (contoh: cek No KTP)
                    if (!profileRes.data.data.noKTP) {
                        setIsProfileComplete(false);
                    }
                }
            } catch (err) {
                // Silent error jika profile belum ada (404), gunakan data localStorage
                console.log("Profile fetch info:", err.response?.status);
            }

            // B. Ambil Data Riwayat
            const response = await api.get("/my-reservations");
            const mappedData = response.data.map((res) => {
                const today = new Date().toISOString().split('T')[0];
                let statusUI = 'completed';
                
                if (res.status === 'confirmed' && res.tanggal_reservasi >= today) {
                    statusUI = 'upcoming';
                } else if (res.status === 'cancelled') {
                    statusUI = 'cancelled';
                }

                return {
                    id: res.reservid,
                    status: statusUI,
                    tanggal: new Date(res.tanggal_reservasi).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric"
                    }),
                    kode_antrian: res.nomor_antrian || "-",
                    poli: res.poli?.poli_name || "Poli Umum",
                    dokter: res.dokter?.nama_dokter || "Dokter",
                    diagnosa: res.keluhan || "-", 
                    resep: null,
                    hasLab: false 
                };
            });
            setRiwayatData(mappedData);

        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    initData();
  }, []);

  // Filter Logika
  const filteredRiwayat = riwayatData.filter(
    (item) =>
      item.poli.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dokter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diagnosa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hitung Statistik
  const stats = {
    selesai: riwayatData.filter((i) => i.status === "completed").length,
    akanDatang: riwayatData.filter((i) => i.status === "upcoming").length,
    total: riwayatData.length,
  };

  return (
    // LAYOUT WRAPPER: Menggunakan style flex untuk Sidebar + Konten
    <div className="min-h-screen bg-neutral-50 flex md:p-6 font-sans">
        
        {/* Tombol Menu Mobile */}
        <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-white text-neutral-700 rounded-lg shadow-md md:hidden border border-neutral-200"
        >
            <Menu className="w-6 h-6" />
        </button>

        {/* MAIN CONTAINER (Card Besar Putih) */}
        <div className="w-full max-w-7xl mx-auto bg-white md:rounded-3xl shadow-xl shadow-neutral-200/50 flex flex-col md:flex-row overflow-hidden h-screen md:h-[85vh] border border-neutral-100">
            
            {/* --- SIDEBAR --- */}
            <Sidebar
                activeTab="history" // Tab aktif: history
                profileData={userData}
                isComplete={isProfileComplete}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* --- KONTEN KANAN (Scrollable) --- */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-neutral-50/50">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Header Page */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                             {/* Tombol back opsional jika di dalam sidebar, tapi tetap berguna */}
                             <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white hover:shadow-sm transition text-neutral-600 md:hidden">
                                <ArrowLeft className="w-6 h-6" />
                             </button>
                             <div>
                                 <h1 className="text-2xl font-bold text-neutral-800">Riwayat Kunjungan</h1>
                                 <p className="text-sm text-neutral-500">Pantau catatan medis dan jadwal Anda.</p>
                             </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                            <input 
                                type="text" 
                                placeholder="Cari diagnosa, dokter..." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-sm bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                            <p className="text-neutral-500">Memuat data riwayat...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Bar */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex justify-around items-center text-center">
                                <div>
                                    <span className="block text-2xl font-bold text-neutral-800">{stats.selesai}</span>
                                    <span className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wide">Selesai</span>
                                </div>
                                <div className="h-8 w-px bg-neutral-200"></div>
                                <div>
                                    <span className="block text-2xl font-bold text-blue-600">{stats.akanDatang}</span>
                                    <span className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wide">Akan Datang</span>
                                </div>
                                <div className="h-8 w-px bg-neutral-200"></div>
                                <div>
                                    <span className="block text-2xl font-bold text-neutral-800">{stats.total}</span>
                                    <span className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wide">Total</span>
                                </div>
                            </div>

                            {/* List Kartu */}
                            <div className="space-y-4">
                                {filteredRiwayat.length > 0 ? (
                                    filteredRiwayat.map((item) => (
                                        <RiwayatCard key={item.id} data={item} router={router} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Tidak ada riwayat ditemukan</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Footer Banner */}
                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 text-sm md:text-base">Rekam Medis Lengkap</h3>
                                <p className="text-xs md:text-sm text-blue-700/80 mt-1">
                                    Akses semua riwayat medis dan hasil lab Anda.
                                </p>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto whitespace-nowrap bg-white text-blue-700 font-bold text-sm py-2.5 px-5 rounded-xl border border-blue-200 shadow-sm hover:bg-blue-50 transition flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            Lihat Detail
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
  );
}

// --- COMPONENT: KARTU RIWAYAT (Sama seperti sebelumnya) ---
function RiwayatCard({ data, router }) {
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-neutral-100 relative overflow-hidden">
      {/* Header Kartu */}
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
            <span>{data.tanggal}</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
            <span className="text-neutral-800 font-bold">{data.kode_antrian}</span>
         </div>
         <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full ${
            isUpcoming ? "bg-blue-100 text-blue-700" : isCancelled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
         }`}>
            {isUpcoming ? "Akan Datang" : isCancelled ? "Dibatalkan" : "Selesai"}
         </span>
      </div>

      {/* Info Poli */}
      <div className="mb-4">
         <h3 className="text-lg font-bold text-neutral-900">{data.poli}</h3>
         <p className="text-sm text-neutral-500">{data.dokter}</p>
      </div>

      {/* Diagnosa Box */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-5 space-y-3">
         <div>
            <p className="text-xs text-neutral-400 mb-0.5 uppercase font-semibold tracking-wider">
                {isUpcoming ? "Keluhan Awal" : "Diagnosa / Keluhan"}
            </p>
            <p className="text-neutral-800 font-medium text-sm leading-relaxed">{data.diagnosa}</p>
         </div>
         {data.resep && (
             <div>
                <p className="text-xs text-neutral-400 mb-0.5 uppercase font-semibold tracking-wider">Resep</p>
                <p className="text-neutral-800 font-medium text-sm leading-relaxed">{data.resep}</p>
             </div>
         )}
         {isUpcoming && !data.resep && (
             <p className="text-xs text-blue-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Menunggu pemeriksaan dokter
             </p>
         )}
         {isCancelled && (
             <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Kunjungan dibatalkan
             </p>
         )}
      </div>

      {/* Tombol Aksi */}
      {isUpcoming ? (
          <button 
            onClick={() => router.push('/user/antrian')}
            className="w-full bg-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-900 transition active:scale-[0.99]"
          >
              Lihat Antrian
          </button>
      ) : (
          <div className="flex gap-3">
             <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-2 text-sm">
                 <FileText className="w-4 h-4" />
                 Lihat Detail
             </button>
             {data.hasLab && (
                 <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-2 text-sm">
                     <Download className="w-4 h-4" />
                     Hasil Lab
                 </button>
             )}
          </div>
      )}
    </div>
  );
}