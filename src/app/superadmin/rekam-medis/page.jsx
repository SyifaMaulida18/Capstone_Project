"use client";

import { useState } from "react";
import {
  FunnelIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Dialog } from "@/app/superadmin/components/ui/dialog"; // Pastikan path ini benar
import { Input } from "@/app/superadmin/components/ui/input"; // Pastikan path ini benar

// --- DATA DUMMY ---
const initialPatients = [
  { id: 1, name: "Ayu Gideon", hasRecord: true },
  { id: 2, name: "Syifa Maulida", hasRecord: false },
  { id: 3, name: "Sheva Rebecca", hasRecord: false },
];

const initialMedicalRecords = {
  1: [
    { id: "rec100", date: "2025-02-29", treatment: "Pemeriksaan Umum" },
    { id: "rec101", date: "2025-05-18", treatment: "Kontrol Jantung" },
  ],
  2: [],
  3: [],
};

export default function MedicalRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(initialPatients);
  const [medicalRecords, setMedicalRecords] = useState(initialMedicalRecords);

  // --- STATE UNTUK DIALOG ---
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- STATE UNTUK FORM ---
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({
    date: "",
    treatment: "",
  });

  // --- HANDLER ---

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleOpenViewDialog = () => {
    if (!selectedPatient) {
      alert("Pilih pasien terlebih dahulu.");
      return;
    }
    setShowViewDialog(true);
  };

  const handleOpenAddForm = () => {
    if (!selectedPatient) {
      alert("Pilih pasien terlebih dahulu untuk menambahkan rekam medis.");
      return;
    }
    setEditingRecord(null);
    setRecordForm({ date: "", treatment: "" });
    setIsFormOpen(true);
    // Opsional: Tutup view dialog jika ingin fokus ke form saja, 
    // atau biarkan terbuka jika dialog Anda mendukung tumpukan (stacking).
    // setShowViewDialog(false); 
  };

  const handleOpenEditForm = (record) => {
    setEditingRecord(record);
    setRecordForm({
      date: record.date,
      treatment: record.treatment,
    });
    // Kita tutup view list sementara agar fokus ke form edit
    setShowViewDialog(false);
    setIsFormOpen(true);
  };

  const handleDeleteRecord = (recordId) => {
    if (
      !selectedPatient ||
      !window.confirm("Yakin ingin menghapus entri rekam medis ini?")
    ) {
      return;
    }

    const patientId = selectedPatient.id;
    const updatedRecords = medicalRecords[patientId].filter(
      (r) => r.id !== recordId
    );

    setMedicalRecords({
      ...medicalRecords,
      [patientId]: updatedRecords,
    });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const patientId = selectedPatient.id;

    if (editingRecord) {
      // --- Logika UPDATE ---
      const updatedRecords = medicalRecords[patientId].map((r) =>
        r.id === editingRecord.id ? { ...r, ...recordForm } : r
      );
      setMedicalRecords({
        ...medicalRecords,
        [patientId]: updatedRecords,
      });
    } else {
      // --- Logika ADD ---
      const newRecord = {
        id: `rec${Date.now()}`,
        ...recordForm,
      };
      // Pastikan array ada sebelum di-spread, jaga-jaga jika undefined
      const currentRecords = medicalRecords[patientId] || [];
      const updatedRecords = [...currentRecords, newRecord];

      setMedicalRecords({
        ...medicalRecords,
        [patientId]: updatedRecords,
      });

      // Update status 'hasRecord' jika ini data pertama
      if (!selectedPatient.hasRecord) {
        setPatients(
          patients.map((p) =>
            p.id === patientId ? { ...p, hasRecord: true } : p
          )
        );
        // Update juga state selectedPatient agar UI langsung berubah
        setSelectedPatient({ ...selectedPatient, hasRecord: true });
      }
    }

    // Reset dan tutup form
    setIsFormOpen(false);
    setEditingRecord(null);
    
    // Opsional: Buka kembali dialog view untuk melihat hasil perubahan
    setShowViewDialog(true);
  };

  // --- RENDER (UI YANG HILANG) ---
  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-lg shadow min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Rekam Medis</h1>

        <div className="flex gap-6">
          {/* BAGIAN KIRI: DAFTAR PASIEN */}
          <div className="w-1/3 border-r pr-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Daftar Pasien</h2>
              <FunnelIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
            </div>
            
            <div className="space-y-2">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-3 rounded-md cursor-pointer border transition-colors ${
                    selectedPatient?.id === patient.id
                      ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium">{patient.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    patient.hasRecord ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {patient.hasRecord ? "Ada Rekam Medis" : "Belum Ada Data"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BAGIAN KANAN: DETAIL / ACTIONS */}
          <div className="w-2/3 pl-2">
            {selectedPatient ? (
              <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center">
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Pasien: {selectedPatient.name}
                </h3>
                <p className="text-gray-500 mb-6">Apa yang ingin Anda lakukan?</p>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleOpenViewDialog}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700"
                  >
                    Lihat Riwayat
                  </button>
                  <button
                    onClick={handleOpenAddForm}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Tambah Rekam Medis
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Pilih pasien di sebelah kiri untuk melihat opsi.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DIALOG 1: VIEW RECORDS --- */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        {/* Catatan: Sesuaikan struktur DialogContent dengan library UI Anda */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Riwayat: {selectedPatient?.name}</h3>
                    <button onClick={() => setShowViewDialog(false)} className="text-gray-500 hover:text-black">&times;</button>
                </div>
                
                <div className="p-4 overflow-y-auto">
                    {selectedPatient && medicalRecords[selectedPatient.id]?.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-semibold">
                                <tr>
                                    <th className="p-2">Tanggal</th>
                                    <th className="p-2">Perawatan</th>
                                    <th className="p-2 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicalRecords[selectedPatient.id].map((rec) => (
                                    <tr key={rec.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{rec.date}</td>
                                        <td className="p-2">{rec.treatment}</td>
                                        <td className="p-2 flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenEditForm(rec)}
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRecord(rec.id)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Belum ada data rekam medis.</p>
                    )}
                </div>
                
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                     <button 
                        onClick={() => {
                            setShowViewDialog(false);
                            handleOpenAddForm();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                     >
                        + Tambah Baru
                     </button>
                </div>
            </div>
        </div>
      </Dialog>

      {/* --- DIALOG 2: FORM INPUT (ADD/EDIT) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="font-bold text-lg mb-4">
                    {editingRecord ? "Edit Rekam Medis" : "Tambah Rekam Medis"}
                </h3>
                
                <form onSubmit={handleSubmitForm} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <Input 
                            type="date" 
                            required
                            value={recordForm.date}
                            onChange={(e) => setRecordForm({...recordForm, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Perawatan / Diagnosis</label>
                        <Input 
                            type="text" 
                            placeholder="Contoh: Pemeriksaan Gigi"
                            required
                            value={recordForm.treatment}
                            onChange={(e) => setRecordForm({...recordForm, treatment: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsFormOpen(false);
                                // Jika mode edit dan dibatalkan, mungkin ingin kembali ke list
                                if(editingRecord) setShowViewDialog(true);
                            }}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
         </div>
      </Dialog>

    </AdminLayout>
  );
}