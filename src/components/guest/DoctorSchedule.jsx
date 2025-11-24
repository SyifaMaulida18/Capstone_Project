"use client";

import { User, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api'; // Pastikan path ini sesuai dengan struktur folder Anda

// Helper: Mendapatkan nama hari ini dalam Bahasa Indonesia
const getTodayName = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayIndex = new Date().getDay();
    return days[todayIndex];
};

// Card individual untuk setiap jadwal (TAMPILAN TETAP SAMA)
const ScheduleCard = ({ poly, doctor, time, quota }) => {
    // Pastikan quota dibaca sebagai angka
    const quotaNum = parseInt(quota, 10);
    const isAvailable = quotaNum > 0;

    return (
        // UBAH: Menggunakan border 'primary-500'
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-t border-primary-500 transition-all duration-300 hover:shadow-xl h-full">
            <div className="flex justify-between items-center mb-3">
                {/* UBAH: Menggunakan 'text-primary-800' untuk judul poli */}
                <h3 className="text-xl font-bold text-primary-800 truncate pr-2">{poly}</h3>
                <span className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
                    isAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                    {isAvailable ? `${quotaNum} Kuota` : 'Penuh'}
                </span>
            </div>
            
            {/* UBAH: Menggunakan 'text-neutral-700' untuk teks utama */}
            <p className="flex items-center text-neutral-700 font-medium mb-2">
                {/* UBAH: Menggunakan 'text-primary-500' untuk ikon */}
                <User className="w-4 h-4 mr-2 text-primary-500 shrink-0" />
                <span className="truncate">{doctor}</span>
            </p>
            {/* UBAH: Menggunakan 'text-neutral-600' untuk teks sekunder */}
            <p className="flex items-center text-neutral-600 text-sm">
                {/* UBAH: Menggunakan 'text-primary-500' untuk ikon */}
                <Clock className="w-4 h-4 mr-2 text-primary-500 shrink-0" />
                {time}
            </p>
        </div>
    );
};

// Section utama yang menampilkan jadwal (TERHUBUNG API)
export default function DoctorScheduleSection() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todayName, setTodayName] = useState("");

    useEffect(() => {
        // 1. Set nama hari saat ini
        setTodayName(getTodayName());

        // 2. Ambil data dari Backend Laravel
        const fetchSchedules = async () => {
            try {
                const response = await api.get('/jadwal-dokter-public');
                if (response.data && response.data.success) {
                    setSchedules(response.data.data);
                } else {
                    // Fallback jika struktur data berbeda
                    setSchedules(Array.isArray(response.data) ? response.data : []);
                }
            } catch (err) {
                console.error("Gagal mengambil jadwal:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    // --- LOGIKA FILTER ---
    // 1. Filter berdasarkan hari ini (case insensitive)
    // 2. Ambil 4 data saja (.slice)
    const filteredSchedules = schedules.filter(item => 
        item.hari?.toLowerCase() === todayName.toLowerCase()
    ).slice(0, 4);

    return (
        <section id="jadwal-dokter" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
            {/* UBAH: Menggunakan 'text-neutral-900' untuk judul section */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900">
                Cek Jadwal Poli & Dokter Hari Ini ({todayName})
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    // Skeleton Loading sederhana agar layout tidak bergeser
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-t border-gray-200 h-40 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))
                ) : filteredSchedules.length > 0 ? (
                    // Tampilkan Data dari API
                    filteredSchedules.map((item, idx) => (
                        <ScheduleCard 
                            key={idx}
                            // Mapping data backend ke props frontend
                            poly={item.poli?.nama_poli || item.poli?.nama || "Poli Umum"} 
                            doctor={item.dokter?.nama_dokter || item.dokter?.nama || "Dokter"}
                            time={`${item.jam_mulai} - ${item.jam_selesai}`} 
                            quota={item.kuota}
                        />
                    ))
                ) : (
                    // Tampilan jika tidak ada jadwal hari ini (tetap menjaga layout grid)
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">Tidak ada jadwal dokter praktek pada hari {todayName}.</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-12">
                <a
                    href="/auth/login"
                    // UBAH: Menggunakan 'primary-500' dan 'primary-600' (bukan 600/700)
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-500 hover:bg-primary-600 md:py-4 md:text-lg md:px-10 shadow-lg transition-colors"
                >
                    Login untuk Melakukan Reservasi
                </a>
            </div>
        </section>
    );
}