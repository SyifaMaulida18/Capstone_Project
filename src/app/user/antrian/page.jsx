"use client";

import {
  ArrowLeft,
  Calendar,
  User,
  Activity,
  Clock,
  MapPin,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";

export default function StatusAntrianPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [myReservation, setMyReservation] = useState(null);
  const [queueData, setQueueData] = useState({
    sedang_dipanggil: null,
    sisa_antrian: 0,
    daftar_tunggu: [],
  });

  // --- 1. Fungsi Fetch Data ---
  const fetchData = useCallback(async () => {
    try {
      // A. Ambil Reservasi User Terlebih Dahulu
      const resReservations = await api.get("/my-reservations");
      const allReservations = resReservations.data;

      // Cari reservasi yang statusnya confirmed hari ini atau masa depan
      const todayStr = new Date().toISOString().split("T")[0];
      const active = allReservations.find(
        (r) => r.status === "confirmed" && r.tanggal_reservasi >= todayStr
      );

      setMyReservation(active);

      if (active) {
        // B. Jika ada reservasi, ambil data antrian spesifik poli & tanggal tersebut
        const resQueue = await api.get("/antrian/dashboard", {
          params: {
            poli_id: active.poli_id,
            tanggal: active.tanggal_reservasi,
          },
        });
        setQueueData(resQueue.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data antrian:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 2. Initial Load & Auto Refresh ---
  useEffect(() => {
    fetchData();

    // Refresh data setiap 30 detik agar realtime
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // --- 3. Format Tanggal Indonesia ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- 4. Hitung Posisi User ---
  const getUserPosition = () => {
    if (!myReservation || !queueData.daftar_tunggu) return 0;
    
    // Cari index user di daftar tunggu (status menunggu)
    // Filter dulu yang statusnya menunggu & urutannya di bawah user
    // Namun cara paling mudah: hitung berapa 'menunggu' yang nomor antriannya lebih kecil/awal dari user? 
    // Atau backend 'sisa_antrian' mungkin global.
    
    // Kita hitung manual berdasarkan array daftar_tunggu agar akurat "X antrian lagi"
    let countAhead = 0;
    let foundMe = false;

    for (let q of queueData.daftar_tunggu) {
      if (q.nomor_antrian === myReservation.nomor_antrian) {
        foundMe = true;
        break; 
      }
      if (q.status === 'menunggu' || q.status === 'dipanggil') {
        countAhead++;
      }
    }
    
    return foundMe ? countAhead : 0;
  };

  const peopleAhead = getUserPosition();

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // --- Render Jika Tidak Ada Reservasi ---
  if (!myReservation) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        {/* Header Biru */}
        <div className="bg-blue-600 p-6 pb-12 rounded-b-[2rem]">
            <div className="flex items-center text-white mb-6">
                <button onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">Status Antrian</h1>
            </div>
        </div>
        <div className="px-6 -mt-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-800 mb-2">Tidak Ada Antrian</h3>
                <p className="text-neutral-500 mb-6 text-sm">Anda belum memiliki jadwal reservasi aktif untuk hari ini atau masa depan.</p>
                <button onClick={() => router.push('/user/reservasi')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium w-full">Buat Reservasi</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans pb-10">
      
      {/* --- HEADER BIRU --- */}
      <div className="bg-blue-600 px-6 pt-6 pb-24 rounded-b-[2.5rem] relative">
        <div className="flex items-center text-white mb-6">
          <button onClick={() => router.back()} className="mr-4 hover:bg-white/20 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Status Antrian</h1>
        </div>

        {/* Kartu Status Utama (Floating inside header visually) */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-3xl p-6 text-center text-white mb-4">
            <p className="text-sm text-blue-100 mb-1">Nomor Antrian Anda</p>
            <h2 className="text-4xl font-bold mb-6">{myReservation.nomor_antrian}</h2>

            <div className="flex justify-between items-center border-t border-white/20 pt-4">
                <div className="text-left">
                    <p className="text-xs text-blue-100">Sedang Dilayani</p>
                    <p className="text-xl font-semibold">
                        {queueData.sedang_dipanggil ? queueData.sedang_dipanggil.nomor_antrian : "-"}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-100">Estimasi Tunggu</p>
                    {/* Estimasi kasar: sisa antrian * 5 menit */}
                    <p className="text-xl font-semibold">{peopleAhead * 5} menit</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- KONTEN HALAMAN --- */}
      <div className="px-6 -mt-10 space-y-6">

        {/* 1. Detail Reservasi Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-800 mb-4">Detail Reservasi</h3>
            
            <div className="space-y-4">
                <div className="flex items-start">
                    <div className="w-8">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Poli</p>
                        <p className="font-medium text-neutral-800">{myReservation.poli.poli_name}</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="w-8">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Dokter</p>
                        <p className="font-medium text-neutral-800">{myReservation.dokter.nama_dokter}</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="w-8">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Tanggal & Waktu</p>
                        <p className="font-medium text-neutral-800">
                            {formatDate(myReservation.tanggal_reservasi)}
                        </p>
                        <p className="text-sm font-bold text-blue-600">09:00 WIB</p> {/* Jam bisa diambil dari jadwal jika ada */}
                    </div>
                </div>
            </div>
        </div>

        {/* 2. Posisi Antrian Info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-neutral-100">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-neutral-800">Posisi Antrian</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                    {peopleAhead > 0 ? `${peopleAhead} antrian lagi` : "Giliran Anda!"}
                </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
                Mohon bersiap dan pastikan Anda berada di area tunggu saat nomor antrian Anda dipanggil.
            </p>
        </div>

        {/* 3. Daftar Antrian Scroll */}
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-800 pl-1">Daftar Antrian</h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-2 max-h-[400px] overflow-y-auto">
                {queueData.daftar_tunggu.length > 0 ? (
                    queueData.daftar_tunggu.map((item, index) => {
                        const isMe = item.nomor_antrian === myReservation.nomor_antrian;
                        const isServing = item.status === 'dipanggil';
                        const isDone = item.status === 'selesai';

                        // Jangan tampilkan yang sudah selesai agar list tidak kepanjangan (opsional)
                        if (isDone) return null;

                        return (
                            <div 
                                key={index}
                                className={`flex justify-between items-center p-4 rounded-xl mb-2 transition-all ${
                                    isMe 
                                      ? "bg-blue-50 border-2 border-blue-500 shadow-md transform scale-[1.02]" 
                                      : isServing 
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-neutral-50 border border-neutral-100"
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                        isMe ? "bg-blue-600 text-white" : 
                                        isServing ? "bg-green-500 text-white" : "bg-neutral-300 text-neutral-600"
                                    }`}>
                                        {item.nomor_antrian.split('-').pop()} {/* Ambil angka belakangnya saja misal A01 -> 01 */}
                                    </div>
                                    <div>
                                        <p className={`font-bold ${isMe ? "text-blue-800" : "text-neutral-700"}`}>
                                            {isMe ? "Anda" : `Pasien ${item.nomor_antrian.split('-').pop()}`}
                                        </p>
                                    </div>
                                </div>
                                
                                {isServing && (
                                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                                        Sedang Dilayani
                                    </span>
                                )}
                                {isMe && !isServing && (
                                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                        Anda
                                    </span>
                                )}
                            </div>
                        );
                    })
                ) : (
                   <p className="text-center text-sm text-neutral-400 py-4">Belum ada antrian lain.</p> 
                )}
            </div>
        </div>

        {/* 4. Footer Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
             <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
             <p className="text-xs text-yellow-800 leading-relaxed">
                <span className="font-bold">Penting:</span> Jika Anda tidak hadir saat nomor dipanggil, Anda akan dipindahkan ke urutan terakhir atau perlu mendaftar ulang di loket.
             </p>
        </div>

      </div>
    </div>
  );
}