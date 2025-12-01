"use client";

import {
  ArrowLeft,
  Calendar,
  User,
  Activity,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- DUMMY DATA (Simulasi Backend) ---
const DUMMY_RESERVATION = {
  nomor_antrian: "A-12",
  status: "confirmed",
  tanggal_reservasi: new Date().toISOString(),
  poli: { poli_name: "Poli Umum" },
  dokter: { nama_dokter: "dr. Budi Santoso" }
};

const DUMMY_QUEUE_DATA = {
  sedang_dipanggil: { nomor_antrian: "A-05" },
  sisa_antrian: 6,
  daftar_tunggu: [
    { nomor_antrian: "A-05", status: "dipanggil" },
    { nomor_antrian: "A-06", status: "menunggu" },
    { nomor_antrian: "A-07", status: "menunggu" },
    { nomor_antrian: "A-08", status: "menunggu" },
    { nomor_antrian: "A-09", status: "menunggu" },
    { nomor_antrian: "A-10", status: "menunggu" },
    { nomor_antrian: "A-11", status: "menunggu" },
    { nomor_antrian: "A-12", status: "menunggu" }, // Ini user
    { nomor_antrian: "A-13", status: "menunggu" },
  ],
};

export default function StatusAntrianPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [myReservation, setMyReservation] = useState(null);
  const [queueData, setQueueData] = useState({
    sedang_dipanggil: null,
    sisa_antrian: 0,
    daftar_tunggu: [],
  });

  // --- 1. Simulasi Load Data ---
  useEffect(() => {
    // Simulasi delay jaringan 1.5 detik
    const timer = setTimeout(() => {
      setMyReservation(DUMMY_RESERVATION);
      setQueueData(DUMMY_QUEUE_DATA);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // --- 2. Format Tanggal Indonesia ---
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

  // --- 3. Hitung Posisi User (Logic Frontend Tetap Ada) ---
  const getUserPosition = () => {
    if (!myReservation || !queueData.daftar_tunggu) return 0;
    
    let countAhead = 0;
    let foundMe = false;

    for (let q of queueData.daftar_tunggu) {
      if (q.nomor_antrian === myReservation.nomor_antrian) {
        foundMe = true;
        break; 
      }
      // Hitung orang yang sedang dipanggil atau menunggu sebelum user
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

  // --- Render Jika Tidak Ada Reservasi (Kondisi Dummy Null) ---
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

  // --- Render Tampilan Utama ---
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
                        <p className="text-sm font-bold text-blue-600">09:00 WIB</p>
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
                                        {item.nomor_antrian.split('-').pop()}
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