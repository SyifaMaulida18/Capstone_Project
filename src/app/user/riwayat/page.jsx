"use client";

import api from "@/services/api";
import {
    Activity,
    ArrowLeft,
    Calendar,
    CheckCircle,
    FileText,
    Loader2,
    Menu,
    Pill,
    Search,
    Stethoscope,
    User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/user/Sidebar";

// Helper Format Tanggal
const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function RiwayatKunjunganPage() {
    const router = useRouter();
    
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState("");
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
                
                // 1. Fetch Reservasi User & Semua Rekam Medis
                // Note: Idealnya backend memfilter rekam medis by user, 
                // tapi disini kita filter di FE sesuai request logika yang ada.
                const [resReservations, resRekamMedis] = await Promise.all([
                    api.get("/my-reservations"),
                    api.get("/rekam-medis")
                ]);

                const myReservations = Array.isArray(resReservations.data) 
                    ? resReservations.data 
                    : (resReservations.data?.data || []);

                const allRekamMedis = Array.isArray(resRekamMedis.data) 
                    ? resRekamMedis.data 
                    : (resRekamMedis.data?.data || []);

                // 2. Buat Map Reservasi milik User agar pencarian cepat
                // Kunci: reservid, Nilai: Object Reservasi
                const myReservationMap = new Map();
                myReservations.forEach(res => {
                    myReservationMap.set(String(res.reservid), res);
                });

                // 3. Filter & Map Data Rekam Medis
                // Hanya ambil rekam medis yang ID Reservasinya ada di myReservationMap
                const processedData = allRekamMedis.reduce((acc, rm) => {
                    const linkedReservation = myReservationMap.get(String(rm.reservasi_id));

                    if (linkedReservation) {
                        acc.push({
                            id: rm.rekam_medis_id,
                            reservasi_id: rm.reservasi_id,
                            tanggal: formatDate(rm.tanggal_diperiksa),
                            rawDate: new Date(rm.tanggal_diperiksa),
                            
                            // Data dari Reservasi
                            poli: linkedReservation.poli?.poli_name || "Poli Umum",
                            dokter: linkedReservation.dokter?.nama_dokter || "Dokter Jaga",
                            pasien: linkedReservation.nama,
                            
                            // Data HASIL MEDIS (Dari Tabel Rekam Medis)
                            no_medrec: rm.no_medrec,
                            gejala: rm.gejala || "-",
                            diagnosa: rm.diagnosis || "-",
                            tindakan: rm.tindakan || "-",
                            resep: rm.resep_obat || "-"
                        });
                    }
                    return acc;
                }, []);

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

    // --- FILTER SEARCH ---
    const filteredRiwayat = riwayatData.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.poli.toLowerCase().includes(term) ||
            item.dokter.toLowerCase().includes(term) ||
            item.pasien.toLowerCase().includes(term) ||
            item.diagnosa.toLowerCase().includes(term)
        );
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
                                     <p className="text-sm text-neutral-500">Hasil pemeriksaan dokter dan resep obat.</p>
                                 </div>
                            </div>

                            {/* --- FILTER BAR (Hanya Search) --- */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                                {/* Stats Counter */}
                                <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-2 text-sm text-neutral-600">
                                    <CheckCircle size={16} className="text-green-600"/>
                                    <span className="font-bold text-neutral-800">{filteredRiwayat.length}</span> Kunjungan Selesai
                                </div>

                                {/* Search Input */}
                                <div className="relative w-full sm:w-72">
                                    <input 
                                        type="text" 
                                        placeholder="Cari diagnosa, poli, dokter..." 
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
                                 <p className="text-neutral-500">Memuat rekam medis...</p>
                              </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRiwayat.length > 0 ? (
                                    filteredRiwayat.map((item) => (
                                        <RiwayatMedisCard key={item.id} data={item} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Belum ada riwayat rekam medis ditemukan.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT: KARTU REKAM MEDIS LENGKAP ---
function RiwayatMedisCard({ data }) {
    return (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            
            {/* Header: Info Dasar */}
            <div className="p-5 border-b border-neutral-100 flex flex-col md:flex-row justify-between md:items-center gap-3 bg-neutral-50/50">
                <div>
                     <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                        <Calendar size={14} /> 
                        <span>{data.tanggal}</span>
                     </div>
                     <h3 className="text-lg font-bold text-neutral-800">{data.poli}</h3>
                     <p className="text-sm text-neutral-600">{data.dokter}</p>
                </div>
                
                <div className="flex items-center gap-2">
                     <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1">
                        <User size={12}/> {data.pasien}
                     </span>
                     <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                        {data.no_medrec}
                     </span>
                </div>
            </div>

            {/* Body: Detail Medis */}
            <div className="p-5 grid gap-4">
                
                {/* Diagnosa */}
                <div className="flex gap-3 items-start">
                    <div className="mt-1 p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                        <Activity size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Diagnosa Dokter</p>
                        <p className="text-neutral-800 font-medium leading-relaxed">{data.diagnosa}</p>
                    </div>
                </div>

                <div className="h-px bg-neutral-100 w-full" />

                {/* Tindakan */}
                <div className="flex gap-3 items-start">
                    <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Stethoscope size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Tindakan Medis</p>
                        <p className="text-neutral-800 text-sm leading-relaxed">{data.tindakan}</p>
                    </div>
                </div>

                <div className="h-px bg-neutral-100 w-full" />

                {/* Resep Obat */}
                <div className="flex gap-3 items-start">
                    <div className="mt-1 p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                        <Pill size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Resep Obat</p>
                        <p className="text-neutral-800 text-sm leading-relaxed whitespace-pre-line">
                            {data.resep}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}