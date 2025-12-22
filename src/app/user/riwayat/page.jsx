"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Sidebar from "../../../components/user/Sidebar";
import {
  ArrowLeft,
  Search,
  FileText,
  Download,
  Loader2,
  Menu,
  User,
  Users,
  Calendar,
  CheckCircle
} from "lucide-react";

// Helper Format Tanggal
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function RiwayatKunjunganPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'self', 'family'
  const [riwayatData, setRiwayatData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Sidebar & User
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    let currentUser = null;
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                currentUser = JSON.parse(storedUser);
                setUserData(currentUser);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Reservasi & Rekam Medis
        const [resReservations, resRekamMedis] = await Promise.all([
            api.get("/my-reservations"),
            api.get("/rekam-medis")
        ]);

        const reservationsData = Array.isArray(resReservations.data) 
            ? resReservations.data 
            : (resReservations.data?.data || []);

        const rekamMedisData = Array.isArray(resRekamMedis.data) 
            ? resRekamMedis.data 
            : (resRekamMedis.data?.data || []);

        // Buat Set ID reservasi yang SUDAH ADA rekam medisnya (artinya SELESAI)
        const completedReservationIds = new Set(
            rekamMedisData.map(rm => String(rm.reservasi_id))
        );

        // 2. Proses Data
        const processedData = reservationsData.map((item) => {
            const currentUserName = currentUser?.name || currentUser?.Nama || "";
            const isSelf = item.nama.toLowerCase() === currentUserName.toLowerCase();
            const resDate = new Date(item.tanggal_reservasi);

            // Cek apakah data ini Selesai (Ada di rekam medis)
            const isCompleted = completedReservationIds.has(String(item.reservid));

            return {
                id: item.reservid,
                tanggal: formatDate(item.tanggal_reservasi),
                rawDate: resDate,
                poli: item.poli?.poli_name || "Poli Umum",
                dokter: item.dokter?.nama_dokter || "Dokter Jaga",
                diagnosa: item.keluhan, // Bisa diganti diagnosa asli dr rekam medis jika mau
                patient_name: item.nama,
                relation: isSelf ? "self" : "family",
                status: isCompleted ? "completed" : "pending_or_cancelled", 
                hasLab: false,
            };
        })
        // 3. FILTER HANYA YANG "COMPLETED" (Sudah ada rekam medis)
        .filter(item => item.status === "completed");

        // Urutkan: Terbaru di atas
        const sortedData = processedData.sort((a, b) => b.rawDate - a.rawDate);
        setRiwayatData(sortedData);

      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTERING SEARCH & TAB ---
  const filteredRiwayat = riwayatData.filter((item) => {
    // 1. Filter Search
    const matchSearch = 
      item.poli.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dokter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_name.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filter Tab
    let matchTab = true;
    if (activeFilter === "self") matchTab = item.relation === "self";
    if (activeFilter === "family") matchTab = item.relation === "family";

    return matchSearch && matchTab;
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex md:p-6 font-sans">
        
        <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-white text-neutral-700 rounded-lg shadow-md md:hidden border border-neutral-200"
        >
            <Menu className="w-6 h-6" />
        </button>

        <div className="w-full max-w-7xl mx-auto bg-white md:rounded-3xl shadow-xl shadow-neutral-200/50 flex flex-col md:flex-row overflow-hidden h-screen md:h-[85vh] border border-neutral-100">
            
            <Sidebar
                activeTab="history"
                profileData={userData}
                isComplete={isProfileComplete}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-neutral-50/50">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Header */}
                    <div className="flex flex-col gap-4 mb-2">
                        <div className="flex items-center gap-3">
                             <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white hover:shadow-sm transition text-neutral-600 md:hidden">
                                <ArrowLeft className="w-6 h-6" />
                             </button>
                             <div>
                                 <h1 className="text-2xl font-bold text-neutral-800">Riwayat Medis</h1>
                                 <p className="text-sm text-neutral-500">Daftar kunjungan yang telah selesai diperiksa.</p>
                             </div>
                        </div>

                        {/* --- FILTER BAR --- */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex bg-white p-1 rounded-xl border border-neutral-200 w-fit shadow-sm">
                                <button 
                                    onClick={() => setActiveFilter("all")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeFilter === 'all' ? 'bg-[#003B73] text-white shadow' : 'text-neutral-500 hover:bg-neutral-50'}`}
                                >
                                    Semua
                                </button>
                                <button 
                                    onClick={() => setActiveFilter("self")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeFilter === 'self' ? 'bg-[#003B73] text-white shadow' : 'text-neutral-500 hover:bg-neutral-50'}`}
                                >
                                    <User size={14} /> Diri Sendiri
                                </button>
                                <button 
                                    onClick={() => setActiveFilter("family")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeFilter === 'family' ? 'bg-[#003B73] text-white shadow' : 'text-neutral-500 hover:bg-neutral-50'}`}
                                >
                                    <Users size={14} /> Keluarga
                                </button>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Cari diagnosa, poli..." 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition shadow-sm bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                          <div className="flex flex-col items-center justify-center py-20">
                             <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                             <p className="text-neutral-500">Memuat riwayat...</p>
                          </div>
                    ) : (
                        <>
                            {/* Stats Bar Sederhana (Hanya Selesai) */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-full text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 font-medium">Total Kunjungan Selesai</p>
                                    <p className="text-2xl font-bold text-neutral-800">{filteredRiwayat.length}</p>
                                </div>
                            </div>

                            {/* List Kartu */}
                            <div className="space-y-4">
                                {filteredRiwayat.length > 0 ? (
                                    filteredRiwayat.map((item) => (
                                        <RiwayatCard key={item.id} data={item} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Belum ada riwayat medis selesai.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

// --- COMPONENT: KARTU RIWAYAT (Versi Bersih) ---
function RiwayatCard({ data }) {
  const isSelf = data.relation === "self";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-neutral-100 relative overflow-hidden">
      {/* Header Kartu */}
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
            <span className="flex items-center gap-1"><Calendar size={14}/> {data.tanggal}</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
            
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${isSelf ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                {isSelf ? <User size={12} /> : <Users size={12} />}
                <span className="font-bold truncate max-w-[100px]">{isSelf ? "Anda" : data.patient_name}</span>
            </div>
         </div>

         <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
            <CheckCircle size={12}/>
            Selesai
         </span>
      </div>

      <div className="mb-4 pl-1">
         <h3 className="text-lg font-bold text-neutral-900">{data.poli}</h3>
         <p className="text-sm text-neutral-500">{data.dokter}</p>
      </div>

      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-5">
         <p className="text-xs text-neutral-400 mb-0.5 uppercase font-semibold tracking-wider">
            Diagnosa / Keluhan
         </p>
         <p className="text-neutral-800 font-medium text-sm leading-relaxed line-clamp-2">
            {data.diagnosa || "-"}
         </p>
      </div>

      {/* Tombol Detail */}
      <div className="flex gap-3">
         <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-2 text-sm">
             <FileText className="w-4 h-4" /> Detail Medis
         </button>
         
         {data.hasLab && (
             <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-2 text-sm">
                 <Download className="w-4 h-4" /> Hasil Lab
             </button>
         )}
      </div>
    </div>
  );
}