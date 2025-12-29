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
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [medicalForm, setMedicalForm] = useState({
    reservasi_id: "",
    no_medrec: "",
    tanggal_diperiksa: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    resep_obat: ""
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Filter tanggal (default ke hari ini)
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

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
      
      const url = `/antrian/dashboard?poli_id=${admin.poli_id}&tanggal=${tanggal}`;
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
  }, [admin, tanggal]);

  const openMedicalForm = () => {
    if (!queueData.sedang_dipanggil?.reservation?.reservid) {
      alert("Tidak ada pasien yang sedang dilayani.");
      return;
    }
    setMedicalForm({
      reservasi_id: queueData.sedang_dipanggil.reservation.reservid.toString(),
      no_medrec: "",
      tanggal_diperiksa: tanggal,
      gejala: "",
      diagnosis: "",
      tindakan: "",
      resep_obat: ""
    });
    setShowMedicalForm(true);
  };

  const submitMedicalRecord = async (e) => {
    e.preventDefault();
    
    if (!medicalForm.reservasi_id) {
      alert("ID Reservasi wajib diisi.");
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");
      
      const payload = {
        reservasi_id: Number(medicalForm.reservasi_id),
        no_medrec: medicalForm.no_medrec,
        tanggal_diperiksa: medicalForm.tanggal_diperiksa,
        gejala: medicalForm.gejala,
        diagnosis: medicalForm.diagnosis,
        tindakan: medicalForm.tindakan,
        resep_obat: medicalForm.resep_obat
      };

      const res = await api.post('/rekam-medis', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Rekam medis berhasil disimpan!");
      setShowMedicalForm(false);
      await fetchQueue(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan rekam medis.";
      alert(msg);
      console.error("Error submit medical record:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Trigger fetch
  useEffect(() => {
    if (admin) {
        fetchQueue();
        const interval = setInterval(() => fetchQueue(true), 30000); // Auto refresh 30s
        return () => clearInterval(interval);
    }
  }, [admin, fetchQueue, tanggal]);


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
        
        <div className="flex gap-3 items-center">
          {/* Filter Tanggal */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
            <label htmlFor="tanggal" className="text-gray-500">Tanggal</label>
            <input
              id="tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                    <div className="bg-gray-50 p-6 flex flex-col gap-4 border-t border-gray-100">
                        <div className="flex gap-4">
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
                        {queueData.sedang_dipanggil && (
                            <button
                                onClick={openMedicalForm}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow hover:shadow-lg transition"
                            >
                                📋 Tambah Rekam Medis
                            </button>
                        )}
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

      {/* MODAL REKAM MEDIS */}
      {showMedicalForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">Tambah Rekam Medis</h3>
              <button
                onClick={() => setShowMedicalForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitMedicalRecord} className="p-6 space-y-4">
              {/* ID RESERVASI */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ID Reservasi</label>
                <input
                  type="number"
                  value={medicalForm.reservasi_id}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>

              {/* NO MEDREC & TANGGAL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">No. Medrec</label>
                  <input
                    type="text"
                    value={medicalForm.no_medrec}
                    onChange={(e) => setMedicalForm({ ...medicalForm, no_medrec: e.target.value })}
                    placeholder="Auto-generated"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Diperiksa</label>
                  <input
                    type="date"
                    value={medicalForm.tanggal_diperiksa}
                    onChange={(e) => setMedicalForm({ ...medicalForm, tanggal_diperiksa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* GEJALA */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gejala</label>
                <textarea
                  value={medicalForm.gejala}
                  onChange={(e) => setMedicalForm({ ...medicalForm, gejala: e.target.value })}
                  rows={3}
                  placeholder="Keluhan / gejala pasien"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DIAGNOSIS */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis</label>
                <textarea
                  value={medicalForm.diagnosis}
                  onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })}
                  rows={3}
                  placeholder="Hasil diagnosis dokter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TINDAKAN */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tindakan</label>
                <textarea
                  value={medicalForm.tindakan}
                  onChange={(e) => setMedicalForm({ ...medicalForm, tindakan: e.target.value })}
                  rows={3}
                  placeholder="Tindakan medis yang dilakukan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* RESEP OBAT */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Resep Obat</label>
                <textarea
                  value={medicalForm.resep_obat}
                  onChange={(e) => setMedicalForm({ ...medicalForm, resep_obat: e.target.value })}
                  rows={4}
                  placeholder="Daftar obat dan aturan pakai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* TOMBOL */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowMedicalForm(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? "Menyimpan..." : "Simpan Rekam Medis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}