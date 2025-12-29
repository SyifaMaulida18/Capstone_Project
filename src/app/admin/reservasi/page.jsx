"use client";

import AdminLayout from "@/app/admin/components/admin_layout"; 
import api from "@/services/api";
import {
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon, // (Optional)
  XCircleIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Pastikan useState diimport

// Simple dialog component
function Dialog({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800 text-xl font-bold transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function ReservasiPage() {
  const router = useRouter();

  // Helper Date
  const formatDateOnly = (d) => {
    if (!d || d === "-") return "-";
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return String(d).split("T")[0];
      return dt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return String(d).split("T")[0];
    }
  };

  // State Data
  const [reservations, setReservations] = useState([]);
  const [polis, setPolis] = useState([]);
  const [dokters, setDokters] = useState([]); 

  // State UI & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  // State Dialog Detail
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  
  // State Form Edit di dalam Dialog
  const [formPoliId, setFormPoliId] = useState("");
  const [formDokterId, setFormDokterId] = useState("");
  const [formTanggal, setFormTanggal] = useState("");

  // === 1. FETCH DATA RESERVASI ===
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      let url = "/reservations";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle Laravel Pagination Structure
      const responseData = res.data?.data ?? res.data; 
      const rawData = Array.isArray(responseData) ? responseData : responseData?.data || [];

      const mapped = rawData.map((r) => ({
        id: r.reservid,
        userId: r.booked_user_id,
        nama: r.nama,
        email: r.email,
        telp: r.nomor_whatsapp,
        tglLahir: r.tanggal_lahir,
        jk: r.jenis_kelamin,
        nik: r.nomor_ktp,
        wa: r.nomor_whatsapp,
        penjamin: r.penjaminan === "asuransi" ? r.nama_asuransi : "Cash",
        keluhan: r.keluhan,
        
        poli: r.poli?.poli_name || "-",
        poliId: r.poli_id, 
        dokter: r.dokter?.nama_dokter || "-",
        dokterId: r.dokter_id, 
        
        tanggal: r.tanggal_reservasi,
        status: r.status,
      }));

      setReservations(mapped);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Gagal mengambil data reservasi.");
    } finally {
      setLoading(false);
    }
  };

  // === 2. FETCH DATA MASTER (POLI & DOKTER) ===
  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // 1. Fetch Poli
      const resPoli = await api.get("/polis", { headers: { Authorization: `Bearer ${token}` } });
      const poliData = resPoli.data?.data ?? resPoli.data ?? [];
      setPolis(Array.isArray(poliData) ? poliData : []);

      // 2. Fetch Dokter
      try {
        const resDokter = await api.get("/dokters", { headers: { Authorization: `Bearer ${token}` } });
        // console.log("Data Dokter:", resDokter.data); // Debugging
        const dokterData = resDokter.data?.data ?? resDokter.data ?? [];
        setDokters(Array.isArray(dokterData) ? dokterData : []);
      } catch (e) {
        console.warn("Gagal fetch dokter. Pastikan endpoint GET /dokters tersedia.", e);
      }

    } catch (err) {
      console.error("Master data error:", err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchMasterData();
  }, [statusFilter]); 

  // === 3. HANDLER BUKA DETAIL ===
  const handleDetail = (reservasi) => {
    setSelectedReservation(reservasi);
    
    // Isi form dengan data yang ada, pastikan string agar dropdown terpilih
    setFormPoliId(reservasi.poliId ? String(reservasi.poliId) : "");
    setFormDokterId(reservasi.dokterId ? String(reservasi.dokterId) : "");
    setFormTanggal(reservasi.tanggal || "");
    
    setShowDetailDialog(true);
  };

  const handleOpenChat = (reservasi) => {
    const userId = reservasi.userId;
    if (!userId) return alert('User ID pasien tidak tersedia.');
    localStorage.setItem('chat_open_with_id', String(userId));
    localStorage.setItem('chat_open_with_name', reservasi.nama || 'Pasien');
    router.push('/admin/chat');
  };

  // === 4. UPDATE RESERVASI ===
  const handleUpdateReservation = async () => {
    if (!selectedReservation) return;
    
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const id = selectedReservation.id;

      await api.put(
        `/reservations/${id}`,
        {
          poli_id: formPoliId,
          dokter_id: formDokterId,
          tanggal_reservasi: formTanggal
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Data reservasi berhasil diperbarui.");
      setShowDetailDialog(false);
      fetchReservations(); // Refresh list
    } catch (err) {
      console.error("Update Error:", err);
      alert(err.response?.data?.message || "Gagal memperbarui data.");
    } finally {
      setProcessing(false);
    }
  };

  // === 5. VERIFIKASI ===
  const handleVerifyReservation = async () => {
    if (!selectedReservation) return;
    
    if (!formDokterId) {
        alert("Harap pilih DOKTER terlebih dahulu sebelum verifikasi.");
        return;
    }

    // Cek jika ada perubahan data, harus disimpan dulu
    if (String(formDokterId) !== String(selectedReservation.dokterId) || 
        String(formPoliId) !== String(selectedReservation.poliId)) {
        if(!confirm("Anda mengubah Poli/Dokter. Data akan disimpan otomatis sebelum verifikasi. Lanjutkan?")) {
            return;
        }
        await handleUpdateReservation(); 
        return; 
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const id = selectedReservation.id;

      const res = await api.post(
        `/reservations/${id}/verify`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data?.message || "Berhasil diverifikasi.");
      setShowDetailDialog(false);
      fetchReservations();
    } catch (err) {
      console.error("Verify Error:", err);
      const msg = err.response?.data?.message;
      alert(`Gagal Verifikasi: ${msg || "Terjadi kesalahan"}`);
    } finally {
      setProcessing(false);
    }
  };

  // === 6. BATALKAN ===
  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    if (!confirm("Yakin ingin membatalkan reservasi ini?")) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const id = selectedReservation.id;

      await api.post(
        `/reservations/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Reservasi dibatalkan.");
      setShowDetailDialog(false);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membatalkan.");
    } finally {
      setProcessing(false);
    }
  };

  // Filter Frontend (Search Bar)
  const filteredReservations = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.nama?.toLowerCase().includes(q) ||
      r.poli?.toLowerCase().includes(q) ||
      r.id?.toString().includes(q)
    );
  });

  // Filter dokter berdasarkan poli yang dipilih
  const filteredDokters = dokters.filter(d => {
    if (!formPoliId) return false;
    // Konversi ke string agar aman (misal backend kirim integer 1, form string "1")
    return String(d.poli_id) === String(formPoliId);
  });

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-7xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Reservasi Pasien
        </h1>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Cari ID, Nama, Poli..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <FunnelIcon className="h-5 w-5 text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-auto"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* TABEL */}
        <div className="overflow-x-auto border border-neutral-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 text-white">
              <tr>
                {["ID", "Nama", "Poli", "Dokter", "Tanggal", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    Tidak ada data reservasi.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">{r.id}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900">{r.nama}</td>
                    <td className="px-6 py-4 text-neutral-600">{r.poli}</td>
                    <td className="px-6 py-4 text-neutral-600">{r.dokter}</td>
                    <td className="px-6 py-4 text-neutral-600">{formatDateOnly(r.tanggal)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.status === "confirmed" ? "bg-green-100 text-green-700 border-green-200" :
                        r.status === "cancelled" ? "bg-red-100 text-red-700 border-red-200" :
                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenChat(r)}
                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded bg-blue-50 hover:bg-blue-100 transition"
                                title="Chat Pasien"
                            >
                                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDetail(r)}
                                className="text-gray-600 hover:text-gray-800 p-1.5 rounded bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1 text-xs font-semibold"
                            >
                                <PencilSquareIcon className="h-4 w-4" /> Detail
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* DIALOG DETAIL & EDIT */}
        <Dialog
          show={showDetailDialog}
          onClose={() => !processing && setShowDetailDialog(false)}
        >
          {selectedReservation && (
            <div className="space-y-5">
              <div className="border-b pb-3 mb-3">
                <h2 className="text-xl font-bold text-gray-800">Detail Reservasi</h2>
                <p className="text-xs text-gray-500">ID: {selectedReservation.id}</p>
              </div>

              {/* DATA PASIEN */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                <div><span className="font-semibold">Nama:</span> {selectedReservation.nama}</div>
                <div><span className="font-semibold">No HP:</span> {selectedReservation.wa}</div>
                <div><span className="font-semibold">Tgl Lahir:</span> {formatDateOnly(selectedReservation.tglLahir)}</div>
                <div><span className="font-semibold">Jenis Kelamin:</span> {selectedReservation.jk}</div>
                <div className="col-span-2"><span className="font-semibold">Keluhan:</span> <span className="italic text-gray-600">{selectedReservation.keluhan}</span></div>
                <div className="col-span-2"><span className="font-semibold">Penjamin:</span> {selectedReservation.penjamin}</div>
              </div>

              {/* FORM EDIT (POLI, DOKTER, TANGGAL) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <h3 className="font-bold text-sm text-gray-800 uppercase mb-2">Jadwal & Penugasan</h3>
                
                {/* Tanggal */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal Kunjungan</label>
                    <input 
                        type="date" 
                        value={formTanggal}
                        onChange={(e) => setFormTanggal(e.target.value)}
                        disabled={selectedReservation.status !== 'pending' || processing}
                        className="w-full p-2 border rounded text-sm disabled:bg-gray-200"
                    />
                </div>

                {/* Poli */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Poli Tujuan</label>
                    <select
                        value={formPoliId}
                        onChange={(e) => {
                            setFormPoliId(e.target.value);
                            setFormDokterId(""); // Reset dokter jika poli berubah
                        }}
                        disabled={selectedReservation.status !== 'pending' || processing}
                        className="w-full p-2 border rounded text-sm disabled:bg-gray-200"
                    >
                        <option value="">-- Pilih Poli --</option>
                        {polis.map(p => (
                            <option key={p.poli_id} value={p.poli_id}>{p.poli_name}</option>
                        ))}
                    </select>
                </div>

                {/* Dokter (WAJIB UNTUK VERIFY) */}
                {/* <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Dokter Penanggung Jawab <span className="text-red-500">*</span></label>
                    <select
                        value={formDokterId}
                        onChange={(e) => setFormDokterId(e.target.value)}
                        disabled={selectedReservation.status !== 'pending' || !formPoliId || processing}
                        className="w-full p-2 border rounded text-sm disabled:bg-gray-200"
                    >
                        <option value="">-- Pilih Dokter --</option>
                        {filteredDokters.length > 0 ? (
                            filteredDokters.map(d => (
                                <option key={d.dokter_id} value={d.dokter_id}>{d.nama_dokter}</option>
                            ))
                        ) : (
                            <option value="" disabled>Tidak ada dokter di poli ini</option>
                        )}
                    </select>
                    {!formDokterId && <p className="text-[10px] text-red-500 mt-1">Wajib dipilih sebelum verifikasi</p>}
                </div> */}

                {selectedReservation.status === 'pending' && (
                    <button
                        onClick={handleUpdateReservation}
                        disabled={processing}
                        className="w-full py-2 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-900 disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                )}
              </div>

              {/* ACTION BUTTONS (VERIFY / CANCEL) */}
              {selectedReservation.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleCancelReservation}
                        disabled={processing}
                        className="flex-1 py-2 border border-red-200 bg-red-50 text-red-600 rounded text-sm font-bold hover:bg-red-100 transition disabled:opacity-50"
                    >
                        Batalkan
                    </button>
                    <button
                        onClick={handleVerifyReservation}
                        disabled={processing || !formDokterId}
                        className="flex-1 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        Verifikasi
                    </button>
                  </div>
              )}

              {selectedReservation.status !== 'pending' && (
                  <div className={`p-3 text-center rounded text-sm font-bold ${selectedReservation.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Status: {selectedReservation.status.toUpperCase()}
                  </div>
              )}

            </div>
          )}
        </Dialog>
      </div>
    </AdminLayout>
  );
}