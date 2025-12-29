"use client";

import { useState, useEffect, useCallback } from "react";
// Hapus import AdminLayout
// import AdminLayout from "@/app/admin/components/admin_layout"; 
import api from "@/services/api";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ForwardIcon,
  XCircleIcon,
  ArrowRightStartOnRectangleIcon // Icon untuk Logout
} from "@heroicons/react/24/outline";

export default function PoliQueuePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Queue State
  const [queueData, setQueueData] = useState({
    sedang_dipanggil: null,
    sisa_antrian: 0,
    list_antrian: []
  });
  
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const today = new Date().toISOString().slice(0, 10);

  // 1. AMBIL DATA ADMIN YANG LOGIN
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        // Ambil data user dari localStorage
        const userStr = localStorage.getItem("user"); 
        const userData = userStr ? JSON.parse(userStr) : null;

        if (userData) {
            setAdmin(userData);
        } else {
            router.push('/login'); // Redirect jika tidak ada user
        }
      } catch (err) {
        console.error("Gagal load user:", err);
        router.push('/login');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [router]);

  // Fungsi Logout Manual (Karena Sidebar hilang)
  const handleLogout = () => {
    if(confirm("Keluar dari Counter Poli?")) {
        localStorage.clear();
        router.push('/');
    }
  };

  // 2. FETCH ANTRIAN
  const fetchQueue = useCallback(async (isBackground = false) => {
    if (!admin?.poli_id) return;

    try {
      if (!isBackground) setLoadingData(true);
      const token = localStorage.getItem("token");
      
      const url = `/antrian/dashboard?poli_id=${admin.poli_id}&tanggal=${today}`;
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};
      
      const waiting = data.daftar_tunggu || [];
      const finished = data.sudah_selesai || [];
      
      const allList = [...waiting, ...finished].sort((a, b) => 
        a.nomor_antrian.localeCompare(b.nomor_antrian)
      );

      setQueueData({
        sedang_dipanggil: data.sedang_dipanggil,
        sisa_antrian: data.sisa_antrian,
        list_antrian: allList
      });

    } catch (err) {
      console.error("Error fetch queue:", err);
    } finally {
      setLoadingData(false);
    }
  }, [admin, today]);

  // Trigger fetch
  useEffect(() => {
    if (admin) {
        fetchQueue();
        const interval = setInterval(() => fetchQueue(true), 30000); // Auto refresh 30s
        return () => clearInterval(interval);
    }
  }, [admin, fetchQueue]);


  // === ACTIONS ===
  const handleAction = async (endpoint, payload = {}) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      
      await api.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchQueue(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memproses aksi.";
      if(err.response?.status === 404) {
          alert("Tidak ada antrian lagi.");
      } else {
          alert(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const panggilNext = () => {
    if(!admin?.poli_id) return;
    handleAction('/antrian/panggil-berikutnya', { poli_id: admin.poli_id });
  };

  const selesai = () => {
    if(!queueData.sedang_dipanggil) return;
    handleAction('/antrian/selesai-dipanggil', { nomor_antrian: queueData.sedang_dipanggil.nomor_antrian });
  };

  const lewati = (id) => {
    if(confirm("Lewati pasien ini?")) handleAction('/antrian/terlewat', { antrian_id: id });
  };

  const batalkan = (id) => {
    if(confirm("Batalkan antrian ini?")) handleAction('/antrian/batal', { antrian_id: id });
  };

  // === RENDER ===
  if (loadingUser) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">Memuat profil...</div>;
  
  if (!admin?.poli_id) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 text-center text-red-600 bg-white shadow rounded-xl max-w-md">
            <h2 className="font-bold text-lg mb-2">Akses Ditolak</h2>
            <p className="mb-4">Akun Anda tidak terhubung dengan Poli manapun.</p>
            <button onClick={handleLogout} className="text-blue-600 hover:underline">Keluar</button>
        </div>
    </div>
  );

  return (
    // Ganti AdminLayout dengan div biasa (Full Screen)
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* NAVBAR SEDERHANA (PENGGANTI SIDEBAR) */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
                <MegaphoneIcon className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800 leading-tight">Counter Poli</h1>
                <p className="text-xs text-gray-500">
                    Petugas: {admin.Nama || admin.name} | Poli ID: {admin.poli_id}
                </p>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => fetchQueue(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition text-gray-700 font-medium"
            >
                <ArrowPathIcon className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                Refresh
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-100 transition font-medium"
            >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                Logout
            </button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KIRI: KONTROL UTAMA (BESAR) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* KARTU NOMOR PANGGILAN */}
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden relative min-h-[300px] flex flex-col justify-between">
                    <div className="absolute top-0 w-full h-2 bg-blue-500"></div>
                    <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
                        <h3 className="text-gray-500 uppercase tracking-widest font-semibold text-sm mb-4">Sedang Melayani Antrian</h3>
                        
                        {queueData.sedang_dipanggil ? (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <span className="text-9xl font-black text-gray-800 tracking-tighter block mb-2">
                                    {queueData.sedang_dipanggil.nomor_antrian}
                                </span>
                                <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-lg font-medium shadow-sm">
                                    <UserIcon className="w-5 h-5" />
                                    {queueData.sedang_dipanggil.reservation?.user?.name || "Pasien Umum"}
                                </div>
                                <div className="mt-4 text-gray-400 text-sm flex justify-center items-center gap-1">
                                    <ClockIcon className="w-4 h-4" />
                                    Waktu Panggil: {new Date(queueData.sedang_dipanggil.waktu_panggil).toLocaleTimeString('id-ID')}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-300 py-10">
                                <p className="text-4xl font-bold mb-2">ISTIRAHAT</p>
                                <p className="text-lg">Belum ada panggilan aktif</p>
                            </div>
                        )}
                    </div>

                    {/* TOMBOL AKSI UTAMA */}
                    <div className="bg-gray-50 p-6 flex gap-4 border-t border-gray-100">
                        <button
                            onClick={selesai}
                            disabled={!queueData.sedang_dipanggil || actionLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl font-bold text-xl shadow hover:shadow-lg transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            <CheckCircleIcon className="w-8 h-8" />
                            SELESAI
                        </button>
                        <button
                            onClick={panggilNext}
                            disabled={actionLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-xl font-bold text-xl shadow hover:shadow-lg transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            <MegaphoneIcon className="w-8 h-8" />
                            {actionLoading ? 'MEMPROSES...' : 'PANGGIL NEXT'}
                        </button>
                    </div>
                </div>

                {/* INFO STATISTIK */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium">Sisa Antrian</p>
                            <p className="text-4xl font-bold text-blue-600">{queueData.sisa_antrian}</p>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                            <UserIcon className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium">Total Hari Ini</p>
                            <p className="text-4xl font-bold text-gray-800">{queueData.list_antrian.length}</p>
                        </div>
                        <div className="p-4 bg-gray-50 text-gray-600 rounded-full">
                            <ClockIcon className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* KANAN: LIST ANTRIAN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)]">
                <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 text-lg">Daftar Antrian</h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Live Update</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {queueData.list_antrian.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <UserIcon className="w-12 h-12 mb-2 opacity-20" />
                            <p>Tidak ada antrian hari ini.</p>
                        </div>
                    ) : (
                        queueData.list_antrian.map((item) => (
                            <div 
                                key={item.id} 
                                className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                                    item.status === 'dipanggil' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100 shadow-md transform scale-[1.02]' : 
                                    item.status === 'selesai' ? 'bg-gray-50 border-gray-200 opacity-60' :
                                    'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xl font-bold ${item.status === 'dipanggil' ? 'text-blue-700' : 'text-gray-800'}`}>
                                            {item.nomor_antrian}
                                        </span>
                                        {item.status === 'dipanggil' && <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>}
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium truncate max-w-[140px]">
                                        {item.reservation?.user?.name || "Pasien Umum"}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                                        item.status === 'menunggu' ? 'bg-yellow-100 text-yellow-700' :
                                        item.status === 'dipanggil' ? 'bg-blue-100 text-blue-700' :
                                        item.status === 'selesai' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                    
                                    {/* Tombol aksi kecil untuk item menunggu */}
                                    {item.status === 'menunggu' && (
                                        <div className="flex gap-1">
                                            <button onClick={() => lewati(item.id)} className="p-1.5 hover:bg-orange-100 text-gray-400 hover:text-orange-600 rounded transition" title="Lewati">
                                                <ForwardIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => batalkan(item.id)} className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded transition" title="Batalkan">
                                                <XCircleIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}