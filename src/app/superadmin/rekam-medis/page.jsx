"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";

// Config API
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function MedicalRecordsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Params
  const initialReservasiId = searchParams.get("reservasi_id");
  const initialPatientId = searchParams.get("patient_id");
  const initialPatientName = searchParams.get("patient_name");

  // === STATE DATA ===
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // === STATE FORM ===
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [recordForm, setRecordForm] = useState({
    reservasiId: "",
    noMedrec: "",
    tanggalDiperiksa: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    resepObat: "",
  });

  // ==========================================
  // 1. FETCH DATA
  // ==========================================
  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/rekam-medis`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Gagal mengambil data (${res.status})`);

      const json = await res.json();
      const records = Array.isArray(json) ? json : json.data || [];

      // Grouping logic
      const grouped = {};
      records.forEach((r) => {
        const reservation = r.reservasi || {};
        const user = reservation.user || {};
        
        if (!user.userid && !user.id) return;
        const patientId = user.userid || user.id;
        const patientName = user.name || `Pasien #${patientId}`;

        if (!grouped[patientId]) {
          grouped[patientId] = {
            patient: { id: patientId, name: patientName },
            records: [],
          };
        }

        grouped[patientId].records.push({
          id: r.rekam_medis_id || r.id, 
          date: r.tanggal_diperiksa ? String(r.tanggal_diperiksa).slice(0, 10) : "",
          diagnosis: r.diagnosis || "-",
          tindakan: r.tindakan || "-",
          gejala: r.gejala || "-",
          resep_obat: r.resep_obat || "-",
          raw: {
            reservasi_id: r.reservasi_id || reservation.reservid,
            no_medrec: r.no_medrec,
            gejala: r.gejala,
            diagnosis: r.diagnosis,
            tindakan: r.tindakan,
            resep_obat: r.resep_obat,
          },
        });
      });

      // Mapping data
      let patientsList = Object.values(grouped).map((g) => ({
        id: g.patient.id,
        name: g.patient.name,
        count: g.records.length,
      }));

      const recordsMap = {};
      Object.values(grouped).forEach((g) => {
        recordsMap[g.patient.id] = g.records;
      });

      // Handle Ghost Patient (from URL)
      if (initialPatientId && initialPatientName) {
        const exists = patientsList.some((p) => String(p.id) === String(initialPatientId));
        if (!exists) {
          patientsList.unshift({
            id: Number(initialPatientId),
            name: initialPatientName,
            count: 0,
            isNew: true, 
          });
        }
      }

      setPatients(patientsList);
      setMedicalRecords(recordsMap);

      // Auto Select
      if (initialPatientId) {
        const target = patientsList.find((p) => String(p.id) === String(initialPatientId));
        if (target) setSelectedPatient(target);
      } else if (!selectedPatient && patientsList.length > 0) {
        setSelectedPatient(patientsList[0]);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  }, [initialPatientId, initialPatientName, selectedPatient]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // =========================
  // 2. HANDLER TOMBOL (ADD & EDIT)
  // =========================
  const handleOpenAddForm = () => {
    console.log("Tombol Tambah Diklik"); // Debug Log

    if (!selectedPatient) {
      alert("Silakan KLIK salah satu nama pasien di daftar sebelah kiri terlebih dahulu.");
      return;
    }
    
    setEditingRecord(null);
    setRecordForm({
      reservasiId: initialReservasiId || "", 
      noMedrec: "", 
      tanggalDiperiksa: new Date().toISOString().split('T')[0],
      gejala: "",
      diagnosis: "",
      tindakan: "",
      resepObat: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (record) => {
    console.log("Tombol Edit Diklik", record); // Debug Log

    setEditingRecord(record);
    setRecordForm({
      reservasiId: record.raw.reservasi_id || "",
      noMedrec: record.raw.no_medrec || "",
      tanggalDiperiksa: record.date,
      gejala: record.raw.gejala || "",
      diagnosis: record.raw.diagnosis || "",
      tindakan: record.raw.tindakan || "",
      resepObat: record.raw.resep_obat || "",
    });
    setIsFormOpen(true);
  };

  // =========================
  // 3. API SUBMIT
  // =========================
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // Validasi sederhana
    if(!recordForm.reservasiId && !editingRecord) {
        alert("ID Reservasi wajib diisi untuk data baru.");
        return;
    }

    try {
      const payload = {
        reservasi_id: Number(recordForm.reservasiId),
        no_medrec: recordForm.noMedrec,
        tanggal_diperiksa: recordForm.tanggalDiperiksa,
        gejala: recordForm.gejala,
        diagnosis: recordForm.diagnosis,
        tindakan: recordForm.tindakan,
        resep_obat: recordForm.resepObat,
      };

      let url = `${API_BASE}/rekam-medis`;
      let method = "POST";

      if (editingRecord) {
        url = `${API_BASE}/rekam-medis/${editingRecord.id}`;
        method = "PUT"; 
      }

      console.log("Sending payload:", payload); // Debug Log

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const jsonResponse = await res.json();

      if (!res.ok) {
        throw new Error(jsonResponse.message || "Gagal menyimpan data.");
      }

      alert("Data berhasil disimpan!");
      setIsFormOpen(false);
      loadRecords(); 

    } catch (err) {
      console.error(err);
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/rekam-medis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus.");
      loadRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  // =========================
  // 4. UI COMPONENTS
  // =========================
  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-xl shadow-sm min-h-[85vh] border border-gray-100 flex flex-col relative">
        
        {/* === HEADER === */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Rekam Medis</h1>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-1 gap-8 overflow-hidden">
          
          {/* === SIDEBAR KIRI (LIST PASIEN) === */}
          <div className="w-1/3 flex flex-col border-r pr-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">Pasien Terdaftar</h2>
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading && patients.length === 0 ? <p className="text-center text-sm mt-4">Memuat data...</p> : 
               patients.length === 0 ? <p className="text-center text-sm mt-4 text-gray-500">Tidak ada data rekam medis.</p> :
               patients.map((patient) => (
                  <div 
                    key={patient.id} 
                    onClick={() => setSelectedPatient(patient)} 
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedPatient?.id === patient.id ? "bg-blue-50 border-blue-500 ring-1 ring-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-700">{patient.name}</p>
                      {patient.isNew && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 rounded-full">BARU</span>}
                    </div>
                  </div>
               ))
              }
            </div>
          </div>

          {/* === KONTEN KANAN (DETAIL & HISTORY) === */}
          <div className="w-2/3 pl-2 h-full overflow-hidden">
            {!selectedPatient ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <DocumentTextIcon className="w-16 h-16 mb-2 opacity-20" />
                <p>Pilih pasien di sebelah kiri untuk melihat detail.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                      {selectedPatient.name}
                    </h2>
                    <p className="text-sm text-gray-500 ml-8">ID User: {selectedPatient.id}</p>
                  </div>
                  
                  {/* TOMBOL TAMBAH */}
                  <button
                    onClick={handleOpenAddForm}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Rekam Medis Baru</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-20">
                  {(!medicalRecords[selectedPatient.id] || medicalRecords[selectedPatient.id].length === 0) ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                       <p className="text-gray-500">Belum ada riwayat medis.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecords[selectedPatient.id].map((rec) => (
                        <div key={rec.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start border-b pb-2 mb-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <CalendarDaysIcon className="w-4 h-4" />
                              <span className="font-semibold text-gray-700">{rec.date}</span>
                              <span className="text-gray-300">|</span>
                              <span>No. RM: {rec.raw.no_medrec || "-"}</span>
                            </div>
                            <div className="flex gap-2">
                              {/* TOMBOL EDIT */}
                              <button 
                                onClick={() => handleOpenEditForm(rec)} 
                                className="text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1 bg-blue-50 rounded border border-blue-100"
                              >
                                EDIT
                              </button>
                              {/* TOMBOL DELETE */}
                              <button 
                                onClick={() => handleDelete(rec.id)} 
                                className="text-red-600 hover:text-red-800 text-xs font-bold px-3 py-1 bg-red-50 rounded border border-red-100"
                              >
                                HAPUS
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div><span className="text-xs text-gray-400 font-bold uppercase">Diagnosis</span><p>{rec.diagnosis}</p></div>
                            <div><span className="text-xs text-gray-400 font-bold uppercase">Tindakan</span><p>{rec.tindakan}</p></div>
                            <div className="col-span-2 pt-2 border-t border-dashed mt-2">
                                <span className="text-xs text-gray-400 font-bold uppercase">Resep Obat</span>
                                <p className="font-mono text-xs bg-yellow-50 p-2 rounded mt-1">{rec.resep_obat}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === MODAL FORM (MANUAL IMPLEMENTATION) === */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
                <h3 className="font-bold text-lg text-gray-800">
                  {editingRecord ? "Edit Rekam Medis" : "Tambah Data Baru"}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                
                {/* ID RESERVASI */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Reservasi *</label>
                  <input
                    type="number"
                    disabled={!!editingRecord}
                    value={recordForm.reservasiId}
                    onChange={(e) => setRecordForm({ ...recordForm, reservasiId: e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${editingRecord ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Masukkan ID Reservasi"
                    required={!editingRecord}
                  />
                  {!editingRecord && <p className="text-[10px] text-gray-400 mt-1">ID Reservasi wajib diisi.</p>}
                </div>

                {/* NO MEDREC & TANGGAL */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Medrec</label>
                        <input
                            type="text"
                            value={recordForm.noMedrec}
                            onChange={(e) => setRecordForm({ ...recordForm, noMedrec: e.target.value })}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Auto"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal</label>
                        <input
                            type="date"
                            value={recordForm.tanggalDiperiksa}
                            onChange={(e) => setRecordForm({ ...recordForm, tanggalDiperiksa: e.target.value })}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* FIELDS */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gejala</label>
                    <textarea
                        rows={2}
                        disabled={!!editingRecord}
                        value={recordForm.gejala}
                        onChange={(e) => setRecordForm({ ...recordForm, gejala: e.target.value })}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${editingRecord ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diagnosis</label>
                    <textarea
                        rows={2}
                        value={recordForm.diagnosis}
                        onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tindakan</label>
                    <textarea
                        rows={2}
                        disabled={!!editingRecord}
                        value={recordForm.tindakan}
                        onChange={(e) => setRecordForm({ ...recordForm, tindakan: e.target.value })}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${editingRecord ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resep Obat</label>
                    <textarea
                        rows={3}
                        disabled={!!editingRecord}
                        value={recordForm.resepObat}
                        onChange={(e) => setRecordForm({ ...recordForm, resepObat: e.target.value })}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm ${editingRecord ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-yellow-50'}`}
                    />
                </div>

                {editingRecord && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs p-3 rounded">
                        <strong>Info:</strong> Kolom Gejala, Tindakan, dan Resep dikunci saat Edit (Keterbatasan Sistem).
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                    >
                        Simpan
                    </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}