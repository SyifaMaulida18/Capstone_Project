"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/user/Sidebar"; 
import {
  ArrowLeft,
  Search,
  FileText,
  Download,
  Eye,
  Clock,
  Loader2,
  AlertCircle,
  Menu,
  User,
  Users
} from "lucide-react";

// --- DUMMY DATA (Update: Tambah properti patient_name & relation) ---
const DUMMY_USER = {
  name: "Syifa",
  email: "syifa@example.com",
};

const DUMMY_HISTORY_DATA = [
  {
    id: 1,
    status: "upcoming",
    tanggal: "28 Nov 2025",
    kode_antrian: "A-012",
    poli: "Poli Gigi",
    dokter: "drg. Budi Santoso",
    diagnosa: "Pemeriksaan rutin",
    patient_name: "Syifa", // Diri Sendiri
    relation: "self",
    resep: null,
    hasLab: false,
  },
  {
    id: 2,
    status: "completed",
    tanggal: "15 Okt 2025",
    kode_antrian: "B-005",
    poli: "Poli Umum",
    dokter: "dr. Andi Pratama",
    diagnosa: "Demam viral",
    patient_name: "Syifa", // Diri Sendiri
    relation: "self",
    resep: "Paracetamol",
    hasLab: true, 
  },
  {
    id: 3,
    status: "completed",
    tanggal: "10 Okt 2025",
    kode_antrian: "A-020",
    poli: "Poli Anak",
    dokter: "dr. Siti Aminah, Sp.A",
    diagnosa: "Imunisasi Campak",
    patient_name: "Adik Budi", // Orang Lain
    relation: "family",
    relation_label: "Anak",
    resep: "Vitamin A",
    hasLab: false,
  },
  {
    id: 4,
    status: "completed",
    tanggal: "01 Sep 2025",
    kode_antrian: "C-003",
    poli: "Poli Penyakit Dalam",
    dokter: "dr. Hartono, Sp.PD",
    diagnosa: "Cek Gula Darah",
    patient_name: "Bapak Joko", // Orang Lain
    relation: "family",
    relation_label: "Ayah",
    resep: "Metformin",
    hasLab: true,
  },
];

export default function RiwayatKunjunganPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'self', 'family'
  const [riwayatData, setRiwayatData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isProfileComplete] = useState(true); 

  // --- SIMULASI FETCH DATA ---
  useEffect(() => {
    const timer = setTimeout(() => {
        setUserData(DUMMY_USER);
        setRiwayatData(DUMMY_HISTORY_DATA);
        setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter Logika (Search + Tab Filter)
  const filteredRiwayat = riwayatData.filter((item) => {
    // 1. Filter berdasarkan Search
    const matchSearch = 
      item.poli.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dokter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()); // Bisa cari nama pasien

    // 2. Filter berdasarkan Tab
    let matchTab = true;
    if (activeFilter === "self") matchTab = item.relation === "self";
    if (activeFilter === "family") matchTab = item.relation === "family";

    return matchSearch && matchTab;
  });

  // Hitung Statistik (Berdasarkan filter yang aktif)
  const stats = {
    selesai: filteredRiwayat.filter((i) => i.status === "completed").length,
    akanDatang: filteredRiwayat.filter((i) => i.status === "upcoming").length,
    total: filteredRiwayat.length,
  };

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
                                 <h1 className="text-2xl font-bold text-neutral-800">Riwayat Kunjungan</h1>
                                 <p className="text-sm text-neutral-500">Pantau rekam medis Anda dan Keluarga.</p>
                             </div>
                        </div>

                        {/* --- FILTER BARU --- */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            {/* Tabs Filter */}
                            <div className="flex bg-white p-1 rounded-xl border border-neutral-200 w-fit">
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

                            {/* Search Bar */}
                            <div className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Cari nama, diagnosa..." 
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
                                        <p>Tidak ada riwayat ditemukan.</p>
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

// --- COMPONENT: KARTU RIWAYAT (Diperbarui) ---
function RiwayatCard({ data, router }) {
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isSelf = data.relation === "self";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-neutral-100 relative overflow-hidden">
      {/* Header Kartu: Tanggal & Badge Pasien */}
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
            <span>{data.tanggal}</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
            
            {/* Badge Pemilik Data */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${isSelf ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                {isSelf ? <User size={12} /> : <Users size={12} />}
                <span className="font-bold">{isSelf ? "Anda" : data.patient_name}</span>
                {!isSelf && <span className="text-[10px] opacity-80">({data.relation_label})</span>}
            </div>
         </div>

         {/* Status Badge */}
         <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full ${
            isUpcoming ? "bg-blue-100 text-blue-700" : isCancelled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
         }`}>
            {isUpcoming ? "Akan Datang" : isCancelled ? "Dibatalkan" : "Selesai"}
         </span>
      </div>

      <div className="mb-4 pl-1">
         <h3 className="text-lg font-bold text-neutral-900">{data.poli}</h3>
         <p className="text-sm text-neutral-500">{data.dokter}</p>
      </div>

      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-5 space-y-2">
         <div>
            <p className="text-xs text-neutral-400 mb-0.5 uppercase font-semibold tracking-wider">
               {isUpcoming ? "Keluhan Awal" : "Diagnosa"}
            </p>
            <p className="text-neutral-800 font-medium text-sm leading-relaxed">{data.diagnosa}</p>
         </div>
         {isUpcoming && (
             <p className="text-xs text-blue-600 flex items-center gap-1 mt-2">
                <Clock className="w-3 h-3" /> Menunggu pemeriksaan
             </p>
         )}
      </div>

      {/* Actions */}
      {isUpcoming ? (
          <button onClick={() => router.push('/user/antrian')} className="w-full bg-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-blue-900 transition">
              Lihat Antrian
          </button>
      ) : (
          <div className="flex gap-3">
             <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-2 text-sm">
                 <FileText className="w-4 h-4" /> Detail
             </button>
             {data.hasLab && (
                 <button className="flex-1 bg-white border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-2 text-sm">
                     <Download className="w-4 h-4" /> Hasil Lab
                 </button>
             )}
          </div>
      )}
    </div>
  );
}