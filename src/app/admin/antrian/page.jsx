"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  PhoneArrowDownLeftIcon,
  CheckCircleIcon,
  UsersIcon,
  XCircleIcon,
  ForwardIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
const MEDICAL_RECORDS_PATH = "/admin/rekam-medis";

export default function AntrianDashboardPage() {
  const [polis, setPolis] = useState([]);
  const [selectedPoli, setSelectedPoli] = useState("");
  
  // Data State
  const [groupedData, setGroupedData] = useState(null);
  const [sedangDipanggil, setSedangDipanggil] = useState(null);
  const [sisaAntrian, setSisaAntrian] = useState(0);
  const [daftarTunggu, setDaftarTunggu] = useState([]);

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );

  // Loading States
  const [loading, setLoading] = useState(false); 
  const [loadingPoli, setLoadingPoli] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Background refresh state
  const [errorMsg, setErrorMsg] = useState("");

  // === 1. AMBIL DATA POLI ===
  useEffect(() => {
    const fetchPolis = async () => {
      try {
        setLoadingPoli(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/polis`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        const data = json.data || json;

        setPolis(data);
        if (data.length > 0) {
          setSelectedPoli(data[0].poli_id.toString());
        }
      } catch (err) {
        console.error("Gagal ambil poli:", err);
        setErrorMsg("Gagal mengambil data poli.");
      } finally {
        setLoadingPoli(false);
      }
    };

    fetchPolis();
  }, []);

  // === 2. FUNGSI FETCH DASHBOARD ===
  const fetchDashboard = async (isBackground = false) => {
    if (!tanggal) return;
    try {
      if (!isBackground) setLoading(true);
      setIsRefreshing(true); 
      setErrorMsg("");

      const token = localStorage.getItem("token");
      
      // Kirim string kosong jika "all" agar backend membaca null
      const poliParam = selectedPoli === "all" ? "" : selectedPoli;
      
      const url = `${API_BASE}/antrian/dashboard?poli_id=${encodeURIComponent(
        poliParam
      )}&tanggal=${encodeURIComponent(tanggal)}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Gagal mengambil data antrian (${res.status})`);
      }

      const json = await res.json();
      const data = json.data || {};

      // Logic Penentuan Tampilan
      if (!poliParam || Array.isArray(data)) {
        setGroupedData(data); // Array Dashboard per Poli
        setSedangDipanggil(null);
        setSisaAntrian(0);
        setDaftarTunggu([]);
      } else {
        setGroupedData(null);
        setSedangDipanggil(data.sedang_dipanggil || null);
        setSisaAntrian(data.sisa_antrian || 0);
        setDaftarTunggu(data.daftar_tunggu || []);
      }
    } catch (err) {
      console.error("Error fetch dashboard:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat mengambil data antrian.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loadingPoli && selectedPoli && tanggal) {
      fetchDashboard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPoli, selectedPoli, tanggal]);

  // === 3. LOGIC GABUNGAN DATA (GLOBAL LIST) ===
  // Menggabungkan semua daftar tunggu dari semua poli menjadi satu array flat
  const allQueues = useMemo(() => {
    if (!groupedData || !Array.isArray(groupedData)) return [];
    
    // Gabungkan data
    let combined = [];
    groupedData.forEach((group) => {
        if (group.daftar_tunggu && Array.isArray(group.daftar_tunggu)) {
            const withPoliName = group.daftar_tunggu.map(item => ({
                ...item,
                poli_name: group.poli_name // Tambahkan nama poli ke item
            }));
            combined = [...combined, ...withPoliName];
        }
    });

    // Urutkan: Dipanggil duluan, lalu Menunggu berdasarkan waktu/nomor
    return combined.sort((a, b) => {
        if (a.status === 'dipanggil' && b.status !== 'dipanggil') return -1;
        if (a.status !== 'dipanggil' && b.status === 'dipanggil') return 1;
        return a.nomor_antrian.localeCompare(b.nomor_antrian);
    });
  }, [groupedData]);


  // === 4. ACTION HANDLERS ===
  const handlePanggilBerikutnya = async () => {
    if (!selectedPoli || selectedPoli === "all") {
      alert("Silakan pilih spesifik poli terlebih dahulu untuk memanggil.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/antrian/panggil-berikutnya`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          poli_id: selectedPoli,
        }),
      });

      const json = await res.json();

      if (res.status === 404) {
        alert("Tidak ada antrian lagi yang menunggu.");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memanggil antrian berikutnya.");
      }

      await fetchDashboard(true);
      
    } catch (err) {
      console.error("Error panggil berikutnya:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelesaikanPanggilan = async () => {
    if (!sedangDipanggil) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/antrian/selesai-dipanggil`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomor_antrian: sedangDipanggil.nomor_antrian,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyelesaikan panggilan.");
      }

      await fetchDashboard(true);
      
    } catch (err) {
      console.error("Error selesaikan panggilan:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLewatiAntrian = async (antrianId) => {
    if(!confirm("Tandai antrian ini sebagai terlewat?")) return;
    try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_BASE}/antrian/terlewat`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ antrian_id: antrianId }),
        });

        const json = await res.json();
        if(!res.ok) throw new Error(json.message || "Gagal melewati antrian");

        fetchDashboard(true);
    } catch(err) { alert(err.message); } 
    finally { setLoading(false); }
  }

  const handleBatalkanAntrian = async (antrianId) => {
    if(!confirm("Batalkan antrian ini?")) return;
    try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/antrian/batal`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ antrian_id: antrianId }),
        });
        const json = await res.json();
        if(!res.ok) throw new Error(json.message || "Gagal membatalkan antrian");
        fetchDashboard(true);
    } catch(err) { alert(err.message); } 
    finally { setLoading(false); }
  }

  const getStatusBadge = (status) => {
    switch(status) {
        case 'menunggu': return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case 'dipanggil': return "bg-blue-100 text-blue-800 border-blue-200 animate-pulse";
        case 'selesai': return "bg-green-100 text-green-800 border-green-200";
        case 'terlewat': return "bg-gray-100 text-gray-600 border-gray-200";
        case 'batal': return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-50 text-gray-600";
    }
  };

  // === RENDER ===
  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-6 text-neutral-800">
          Dashboard Antrian Poli
        </h1>

        {/* FILTER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Pilih Poli</label>
              <select
                value={selectedPoli}
                onChange={(e) => setSelectedPoli(e.target.value)}
                disabled={loadingPoli || loading}
                className="w-full md:w-64 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">-- Semua Poli --</option>
                {!loadingPoli && polis.map((p) => (
                    <option key={p.poli_id} value={p.poli_id}>{p.poli_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                disabled={loading}
                className="w-full md:w-48 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => fetchDashboard(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-semibold"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {selectedPoli && selectedPoli !== "all" && (
                <>
                    <button
                    onClick={handleSelesaikanPanggilan}
                    disabled={loading || !sedangDipanggil}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-semibold shadow-md disabled:opacity-50"
                    >
                    <CheckCircleIcon className="h-4 w-4" />
                    Selesai
                    </button>
                    <button
                    onClick={handlePanggilBerikutnya}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold shadow-md disabled:opacity-50"
                    >
                    <PhoneArrowDownLeftIcon className="h-4 w-4" />
                    Panggil Next
                    </button>
                </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{errorMsg}</div>
        )}

        {/* CONTAINER UTAMA */}
        <div className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            
            {/* TAMPILAN SINGLE POLI */}
            {selectedPoli && selectedPoli !== "all" && (
                <>
                    {/* ... (Kode Single Poli sama seperti sebelumnya) ... */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-600 shadow-md"><UsersIcon className="h-6 w-6 text-white" /></div>
                            <div><p className="text-sm text-neutral-600">Menunggu</p><p className="text-2xl font-bold text-blue-800">{sisaAntrian}</p></div>
                        </div>
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 md:col-span-2 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><PhoneArrowDownLeftIcon className="w-24 h-24 text-amber-600" /></div>
                            <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Sedang Melayani</p>
                            {sedangDipanggil ? (
                                <div className="flex flex-col md:flex-row md:items-end justify-between mt-2 gap-4">
                                    <div>
                                        <p className="text-4xl font-extrabold text-amber-600">{sedangDipanggil.nomor_antrian}</p>
                                        <p className="text-sm text-neutral-600 font-medium">Pasien: {sedangDipanggil.reservation?.user?.name || "Umum"}</p>
                                    </div>
                                    <div className="z-10">
                                        {sedangDipanggil.reservation?.reservid && (
                                            <Link href={`${MEDICAL_RECORDS_PATH}?reservasi_id=${sedangDipanggil.reservation.reservid}&patient_id=${sedangDipanggil.reservation.user?.userid || sedangDipanggil.reservation.user?.id}&patient_name=${encodeURIComponent(sedangDipanggil.reservation.user?.name || "")}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow">
                                                <DocumentTextIcon className="w-4 h-4"/> Input Rekam Medis
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ) : (<p className="text-lg text-neutral-400 font-medium mt-2">-- Tidak ada panggilan aktif --</p>)}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-gray-100">
                                <tr>{["No", "Nomor", "Pasien", "Status", "Panggil", "Selesai", "Aksi"].map((h) => (<th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>))}</tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {daftarTunggu.length === 0 ? (<tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada antrian untuk tanggal ini.</td></tr>) : (
                                    daftarTunggu.map((row, idx) => (
                                        <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${row.status === 'dipanggil' ? 'bg-amber-50/50' : ''}`}>
                                            <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.nomor_antrian}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{row.reservation?.user?.name || "-"}</td>
                                            <td className="px-6 py-4 text-sm"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(row.status)}`}>{row.status.toUpperCase()}</span></td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.waktu_panggil ? new Date(row.waktu_panggil).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.waktu_selesai ? new Date(row.waktu_selesai).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    {row.status === 'menunggu' && (
                                                        <>
                                                            <button onClick={() => handleLewatiAntrian(row.id)} className="text-gray-500 hover:text-orange-600" title="Lewati"><ForwardIcon className="w-5 h-5" /></button>
                                                            <button onClick={() => handleBatalkanAntrian(row.id)} className="text-gray-500 hover:text-red-600" title="Batal"><XCircleIcon className="w-5 h-5" /></button>
                                                        </>
                                                    )}
                                                    {row.status !== 'menunggu' && <span className="text-gray-300">-</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* TAMPILAN ALL POLI (RINGKASAN & TABEL GLOBAL) */}
            {(!selectedPoli || selectedPoli === "all") && groupedData && Array.isArray(groupedData) && (
                <div className="space-y-8">
                    
                    {/* BAGIAN 1: KARTU PER POLI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {groupedData.map((poli) => (
                            <div key={poli.poli_id} className="border rounded-xl p-5 bg-gray-50 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">{poli.poli_name}</h2>
                                    <button onClick={() => setSelectedPoli(poli.poli_id.toString())} className="text-sm text-blue-600 hover:underline font-medium">Kelola &rarr;</button>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white p-3 rounded border">
                                        <span className="text-xs text-gray-500 font-bold uppercase">Sisa</span>
                                        <p className="text-2xl font-bold text-blue-600">{poli.sisa_antrian}</p>
                                    </div>
                                    <div className="flex-1 bg-white p-3 rounded border border-l-4 border-l-amber-400">
                                        <span className="text-xs text-gray-500 font-bold uppercase">Dipanggil</span>
                                        <p className="text-2xl font-bold text-gray-800">{poli.sedang_dipanggil ? poli.sedang_dipanggil.nomor_antrian : "-"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BAGIAN 2: TABEL SELURUH ANTRIAN (BARU) */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mt-8 overflow-hidden">
                        <div className="p-4 bg-gray-100 border-b flex items-center justify-between">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <BuildingOfficeIcon className="w-5 h-5" />
                                Daftar Seluruh Antrian Hari Ini
                            </h3>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">Total: {allQueues.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-white">
                                    <tr>
                                        {["No", "Nomor", "Poli", "Pasien", "Status", "Jam Panggil"].map((h) => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {allQueues.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data antrian.</td></tr>
                                    ) : (
                                        allQueues.map((row, idx) => (
                                            <tr key={`${row.id}-${idx}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-3 text-sm font-bold text-gray-900">{row.nomor_antrian}</td>
                                                <td className="px-6 py-3 text-sm text-blue-600 font-medium">{row.poli_name}</td>
                                                <td className="px-6 py-3 text-sm text-gray-700">{row.reservation?.user?.name || "-"}</td>
                                                <td className="px-6 py-3 text-sm">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(row.status)}`}>{row.status}</span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500 font-mono">
                                                    {row.waktu_panggil ? new Date(row.waktu_panggil).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>

      </div>
    </AdminLayout>
  );
}

