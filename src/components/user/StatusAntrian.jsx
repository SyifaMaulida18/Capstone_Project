"use client";

import { 
  ArrowLeft, 
  Activity, 
  User, 
  Calendar, 
  Info
} from "lucide-react";
import { useEffect, useState } from "react";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function StatusAntrian({ onBack, reservation, initialData }) {
  const [queueList, setQueueList] = useState([]);
  const [currentServing, setCurrentServing] = useState("-");
  const [peopleAhead, setPeopleAhead] = useState(0);

  useEffect(() => {
    // Pastikan initialData ada isinya
    if (initialData && reservation) {
      const rawList = initialData.daftar_tunggu || [];
      const serving = initialData.sedang_dipanggil;

      // 1. Tentukan nomor yang sedang dilayani
      setCurrentServing(serving ? serving.nomor_antrian.split('-').pop() : "-");

      // 2. Hitung posisi user
      // Karena Backend mengurutkan ASC (yang duluan di atas), kita cari indexnya
      // Filter dulu listnya agar hanya berisi status 'menunggu' (opsional, tergantung logika antrian Anda)
      // Tapi biasanya 'daftar_tunggu' dari BE sudah berisi 'menunggu' dan 'dipanggil'.
      
      const userIndex = rawList.findIndex(item => item.reservation_id === reservation.reservid);
      
      // Jika user ditemukan
      if (userIndex !== -1) {
         // Jumlah orang di depan = index user. 
         // Contoh: User di index 0 -> 0 orang di depan (giliran dia)
         // Contoh: User di index 2 -> 2 orang di depan
         setPeopleAhead(userIndex);
      } else if (serving && serving.reservation_id === reservation.reservid) {
         // Jika user sedang dilayani (ada di object serving, tapi mungkin gak ada di list daftar_tunggu array)
         setPeopleAhead(0);
      } else {
         // User tidak ditemukan (kemungkinan error data atau sudah selesai tapi status belum update di FE)
         setPeopleAhead(0);
      }

      // 3. Format List untuk Tampilan
      const formattedList = rawList.map((item) => {
        const isUser = item.reservation_id === reservation.reservid;
        const isServing = item.status === 'dipanggil';
        const noAntrianSimple = item.nomor_antrian.split('-').pop();

        return {
          id: item.id, // Pastikan ada key unik
          originalNumber: item.nomor_antrian,
          number: noAntrianSimple,
          status: isServing ? 'serving' : (isUser ? 'user' : 'waiting'),
          label: isUser ? "Anda" : `Pasien ${noAntrianSimple}`,
          isUser: isUser,
          waktu: item.waktu_panggil // Opsional jika mau menampilkan jam
        };
      });

      setQueueList(formattedList);
    }
  }, [initialData, reservation]);

  const userQueueNumberSimple = reservation.nomor_antrian ? reservation.nomor_antrian.split('-').pop() : "---";

  return (
    <div className="min-h-screen bg-[#003B73] flex flex-col font-sans animate-fadeIn relative">
      
      {/* Header Nav */}
      <div className="px-6 pt-8 pb-4 flex items-center text-white">
        <button 
          onClick={onBack} 
          className="p-2 rounded-full hover:bg-white/10 transition mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Status Antrian</h1>
      </div>

      {/* --- BLUE CARD UTAMA --- */}
      <div className="px-6 mb-6">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-6 text-center text-white backdrop-blur-sm relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <p className="text-sm text-blue-100 mb-2 font-medium">Nomor Antrian Anda</p>
          <h2 className="text-7xl font-extrabold mb-8 tracking-tight">
            {userQueueNumberSimple}
          </h2>

          <div className="flex justify-between items-center border-t border-white/10 pt-6">
            <div className="text-left">
              <p className="text-xs text-blue-200 mb-1">Sedang Dilayani</p>
              <p className="text-3xl font-bold">{currentServing}</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-right">
              <p className="text-xs text-blue-200 mb-1">Sisa Antrian</p>
              <p className="text-3xl font-bold">{peopleAhead} <span className="text-sm font-normal">Orang</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* --- WHITE CONTAINER --- */}
      <div className="flex-1 bg-neutral-50 rounded-t-[2.5rem] px-6 py-8 shadow-2xl overflow-y-auto">
        
        {/* Detail Ringkas */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-2 rounded-lg text-[#003B73]">
                <Activity size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-400 uppercase font-bold">Poli</p>
                <p className="text-neutral-800 font-bold text-sm">{reservation.poli?.poli_name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-2 rounded-lg text-[#003B73]">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-400 uppercase font-bold">Dokter</p>
                <p className="text-neutral-800 font-bold text-sm">{reservation.dokter?.nama_dokter || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifikasi Status */}
        {peopleAhead <= 2 && peopleAhead > 0 && (
            <div className="flex gap-3 bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6 animate-pulse">
            <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                Giliran Anda hampir tiba! Mohon bersiap di area ruang tunggu poli.
            </p>
            </div>
        )}
        
        {(currentServing === userQueueNumberSimple || queueList.find(x => x.isUser && x.status === 'serving')) && (
            <div className="flex gap-3 bg-green-50 p-4 rounded-xl border border-green-200 mb-6 animate-bounce">
            <Info className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800 leading-relaxed font-bold">
                Giliran Anda! Silakan masuk ke ruangan dokter sekarang.
            </p>
            </div>
        )}

        {/* List Antrian */}
        <h3 className="font-bold text-neutral-800 mb-4 px-1">Urutan Panggilan</h3>
        <div className="space-y-3 pb-12">
          {queueList.length > 0 ? (
              queueList.map((item, idx) => {
                let containerStyle = "bg-white border-neutral-100 text-neutral-600";
                let badge = null;

                if (item.status === 'serving') {
                    containerStyle = "bg-green-50 border-green-200 text-green-800 ring-1 ring-green-200";
                    badge = <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-1 rounded-full">Dipanggil</span>;
                }

                if (item.isUser) {
                    if (item.status === 'serving') {
                         containerStyle = "bg-green-600 border-green-600 text-white shadow-lg transform scale-[1.02] sticky top-0 z-10";
                         badge = <span className="text-[10px] font-bold bg-white text-green-600 px-2 py-1 rounded-full">Anda</span>;
                    } else {
                         containerStyle = "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02] sticky top-0 z-10";
                         badge = <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-1 rounded-full">Anda</span>;
                    }
                }

                return (
                  <div key={idx} className={`flex justify-between items-center p-3 rounded-2xl border ${containerStyle} transition-all`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.isUser ? 'bg-white/20' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                            {item.number}
                        </div>
                        <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    {badge}
                  </div>
                );
              })
          ) : (
              <div className="text-center py-8 text-neutral-400 text-sm italic">
                  Belum ada antrian dimulai.
              </div>
          )}
        </div>

      </div>
    </div>
  );
}