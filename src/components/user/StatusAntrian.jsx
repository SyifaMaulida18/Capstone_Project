"use client";

import { 
  ArrowLeft, 
  Activity, 
  User, 
  Calendar, 
  Info, 
} from "lucide-react";

// --- DUMMY DATA ANTRIAN (Diupdate) ---
const QUEUE_LIST = [
  { number: "A08", status: "serving", label: "Pasien A08" }, // Sedang Dilayani
  { number: "A09", status: "waiting", label: "Pasien A09" },
  { number: "A10", status: "waiting", label: "Pasien A10" },
  { number: "A11", status: "waiting", label: "Pasien A11" },
  { number: "A12", status: "user", label: "Anda" },         // User (Posisi Tengah)
  { number: "A13", status: "waiting", label: "Pasien A13" }, // Antrian Setelah Anda
  { number: "A14", status: "waiting", label: "Pasien A14" }, // Antrian Setelah Anda
];

const RESERVATION_DETAIL = {
  poli: "Poli Umum",
  dokter: "Dr. Budi Santoso, Sp.PD",
  tanggal: "Rabu, 5 November 2025",
  jam: "09:00",
  estimasi: "20 menit",
  sedang_dilayani: "A08",
  nomor_anda: "A12"
};

export default function StatusAntrian({ onBack }) {
  return (
    <div className="min-h-screen bg-[#003B73] flex flex-col font-sans animate-fadeIn relative">
      
      {/* --- HEADER --- */}
      <div className="px-6 pt-8 pb-4 flex items-center text-white">
        <button 
          onClick={onBack} 
          className="p-2 rounded-full hover:bg-white/10 transition mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Status Antrian</h1>
      </div>

      {/* --- BLUE CARD (Nomor Antrian Utama) --- */}
      <div className="px-6 mb-6">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-6 text-center text-white backdrop-blur-sm relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <p className="text-sm text-blue-100 mb-2 font-medium">Nomor Antrian Anda</p>
          <h2 className="text-7xl font-extrabold mb-8 tracking-tight">{RESERVATION_DETAIL.nomor_anda}</h2>

          <div className="flex justify-between items-center border-t border-white/10 pt-6">
            <div className="text-left">
              <p className="text-xs text-blue-200 mb-1">Sedang Dilayani</p>
              <p className="text-2xl font-bold">{RESERVATION_DETAIL.sedang_dilayani}</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-right">
              <p className="text-xs text-blue-200 mb-1">Estimasi Tunggu</p>
              <p className="text-2xl font-bold">{RESERVATION_DETAIL.estimasi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- WHITE CONTAINER (Detail & List) --- */}
      <div className="flex-1 bg-neutral-50 rounded-t-[2.5rem] px-6 py-8 shadow-2xl overflow-y-auto">
        
        {/* Detail Reservasi */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-6">
          <h3 className="text-center font-bold text-neutral-800 mb-6 text-lg">Detail Reservasi</h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2.5 rounded-xl text-[#003B73]">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">Poli</p>
                <p className="text-neutral-800 font-bold">{RESERVATION_DETAIL.poli}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2.5 rounded-xl text-[#003B73]">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">Dokter</p>
                <p className="text-neutral-800 font-bold">{RESERVATION_DETAIL.dokter}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-2.5 rounded-xl text-[#003B73]">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase">Tanggal & Waktu</p>
                <p className="text-neutral-800 font-bold">{RESERVATION_DETAIL.tanggal}</p>
                <p className="text-neutral-500 text-sm">{RESERVATION_DETAIL.jam}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Mohon bersiap di ruang tunggu saat nomor antrian Anda tinggal <strong>3 antrian lagi</strong>.
          </p>
        </div>

        {/* Daftar Antrian */}
        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-neutral-800">Daftar Antrian</h3>
            {/* Hitung sisa antrian di depan user saja */}
            <span className="text-xs text-blue-600 font-medium">
               {QUEUE_LIST.findIndex(x => x.status === 'user') - QUEUE_LIST.findIndex(x => x.status === 'serving')} antrian lagi
            </span>
          </div>

          {/* Container List dengan Scroll */}
          <div className="space-y-3 pb-10">
            {QUEUE_LIST.map((item, idx) => {
              // Style Conditional
              let containerStyle = "bg-white border-neutral-100 text-neutral-600";
              let badge = null;

              if (item.status === 'serving') {
                containerStyle = "bg-green-50 border-green-200 text-green-800 ring-1 ring-green-200";
                badge = <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-1 rounded-full">Sedang Dilayani</span>;
              } else if (item.status === 'user') {
                containerStyle = "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 transform scale-[1.02] z-10 sticky top-0 my-4"; // Sticky agar user selalu terlihat
                badge = <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-1 rounded-full">Anda</span>;
              } else if (QUEUE_LIST.findIndex(x => x.status === 'user') < idx) {
                 // Style untuk antrian SETELAH user (sedikit lebih transparan/kecil)
                 containerStyle = "bg-neutral-50 border-neutral-100 text-neutral-400";
              }

              return (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-4 rounded-2xl border ${containerStyle} transition-all duration-200`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      item.status === 'user' ? 'bg-white/20 text-white' : 
                      item.status === 'serving' ? 'bg-green-200 text-green-800' : 
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      {item.number}
                    </div>
                    <span className="font-bold text-sm md:text-base">{item.label}</span>
                  </div>
                  {badge}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}