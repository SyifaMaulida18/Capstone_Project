"use client";

import { User, Clock, CalendarX, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api'; 

// Helper: Mapping index hari JS (0=Minggu) ke key database (minggu)
const getTodayKey = () => {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const todayIndex = new Date().getDay();
    return days[todayIndex]; // return "senin", "selasa", dst.
};

// Helper: Nama hari untuk tampilan
const getTodayLabel = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
};

const ScheduleCard = ({ poli, doctor, time, session, quota }) => {
    const isAvailable = quota > 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-t border-primary-500 transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-lg font-bold text-[#003B73] line-clamp-2 leading-tight">{poli}</h3>
                    <span className={`shrink-0 px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md ${
                        isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {isAvailable ? `${quota} Kuota` : 'Penuh'}
                    </span>
                </div>
                
                <p className="flex items-center text-slate-700 font-medium mb-2 text-sm">
                    <User className="w-4 h-4 mr-2 text-[#8CC63F] shrink-0" />
                    <span className="truncate">{doctor}</span>
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <p className="flex items-center text-slate-500 text-xs">
                    <Clock className="w-3 h-3 mr-2 text-[#8CC63F] shrink-0" />
                    <span className="font-semibold mr-1">{time}</span> 
                    <span className="text-slate-400">({session})</span>
                </p>
            </div>
        </div>
    );
};

export default function DoctorScheduleSection() {
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todayLabel, setTodayLabel] = useState("");

    useEffect(() => {
        setTodayLabel(getTodayLabel());
        const todayKey = getTodayKey(); // contoh: "senin"

        const fetchSchedules = async () => {
            try {
                // Gunakan endpoint PUBLIC yang sudah ada di api.php
                const response = await api.get('/jadwal-dokter');
                
                if (response.data && response.data.success) {
                    const rawData = response.data.data;
                    const formatted = [];

                    // --- LOGIKA TRANSFORMASI DATA (Horizontal ke Vertikal) ---
                    // Kita hanya mengambil data untuk HARI INI saja
                    const sessions = ['pagi', 'siang', 'sore'];

                    rawData.forEach(record => {
                        // 1. Cek apakah dokter praktek hari ini (contoh: senin_praktek == 'Y')
                        const isActiveToday = record[`${todayKey}_praktek`] === 'Y' || record[`${todayKey}_praktek`] === 1;

                        if (isActiveToday) {
                            // 2. Loop sesi (pagi, siang, sore)
                            sessions.forEach(session => {
                                const start = record[`${todayKey}_${session}_dari`];
                                const end = record[`${todayKey}_${session}_sampai`];
                                const quota = record[`${todayKey}_${session}_kuota`];

                                // 3. Jika jam tersedia, masukkan ke list
                                if (start && end) {
                                    formatted.push({
                                        id: `${record.dokter_id}-${session}`,
                                        poli: record.poli?.poli_name || "Poli Umum",
                                        doctor: record.dokter?.nama_dokter || "Dokter",
                                        time: `${start.substring(0, 5)} - ${end.substring(0, 5)}`,
                                        session: session.charAt(0).toUpperCase() + session.slice(1), // Capitalize
                                        quota: quota
                                    });
                                }
                            });
                        }
                    });

                    setTodaySchedules(formatted);
                }
            } catch (err) {
                console.error("Gagal mengambil jadwal:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    return (
        <section id="jadwal-dokter" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-[#003B73]">Jadwal Praktek Hari Ini</h3>
                    <p className="text-slate-500 text-sm">
                        Menampilkan jadwal dokter untuk hari <span className="font-bold text-[#8CC63F]">{todayLabel}</span>
                    </p>
                </div>
                <a href="/auth/login" className="text-sm font-bold text-[#003B73] hover:text-[#8CC63F] hover:underline transition">
                    Lihat Jadwal Lengkap →
                </a>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    // Skeleton Loading
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow border border-slate-100 h-32 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2 mb-6"></div>
                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                        </div>
                    ))
                ) : todaySchedules.length > 0 ? (
                    todaySchedules.map((item, idx) => (
                        <ScheduleCard 
                            key={idx}
                            poli={item.poli}
                            doctor={item.doctor}
                            time={item.time}
                            session={item.session}
                            quota={item.quota}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="inline-flex bg-slate-100 p-4 rounded-full mb-3">
                            <CalendarX className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">Tidak ada dokter yang praktek hari ini.</p>
                        <p className="text-slate-400 text-sm">Silakan cek jadwal untuk hari lain di menu lengkap.</p>
                    </div>
                )}
            </div>
        </section>
    );
}