"use client";

import { useState } from "react";
import {
  FunnelIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout";
import { Dialog } from "@/app/admin/components/ui/dialog";

export default function MedicalRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Data dummy pasien dan rekam medis
  const patients = [
    { id: 1, name: "Ayu Gideon", hasRecord: true },
    { id: 2, name: "Syifa Tito", hasRecord: false },
    { id: 3, name: "Sheva Rebecca", hasRecord: false },
  ];

  const medicalRecords = {
    1: [
      { date: "29 Februari 2025", treatment: "Pemeriksaan Umum" },
      { date: "18 Mei 2025", treatment: "Kontrol Jantung" },
    ],
    2: [],
    3: [],
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setShowDialog(true);
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-400 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Manajemen Rekam Medis
        </h1>

        {/* Header buttons */}
        <div className="flex justify-end mb-6 space-x-3">
          <button className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-semibold">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <span>Filter</span>
          </button>

          <button className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-semibold">
            <PencilIcon className="h-5 w-5 text-gray-600" />
            <span>Edit</span>
          </button>

          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors font-semibold">
            <PlusIcon className="h-5 w-5" />
            <span>Add</span>
          </button>
        </div>

        {/* Dua kolom utama */}
        <div className="grid grid-cols-2 gap-6">
          {/* Kolom kiri: daftar pasien */}
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <ul className="space-y-3">
              {patients.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border hover:bg-blue-50 cursor-pointer transition ${
                    p.id === selectedPatient?.id ? "border-blue-500" : ""
                  }`}
                  onClick={() => handleSelectPatient(p)}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-blue-500"
                      checked={p.id === selectedPatient?.id}
                      readOnly
                    />
                    <span className="text-gray-800 font-medium">{p.name}</span>
                  </label>
                  {p.hasRecord && <span className="text-sm">📁</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom kanan: daftar tanggal rekam medis pasien aktif */}
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            {selectedPatient ? (
              <>
                {medicalRecords[selectedPatient.id]?.length > 0 ? (
                  <ul className="space-y-3">
                    {medicalRecords[selectedPatient.id].map((r, i) => (
                      <li
                        key={i}
                        className="bg-white p-3 rounded-lg border shadow-sm hover:bg-gray-50"
                      >
                        {r.date}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-center mt-10">
                    Belum ada rekam medis untuk pasien ini
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic text-center mt-10">
                Pilih pasien untuk melihat rekam medis
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up dialog detail rekam medis */}
      <Dialog show={showDialog} onClose={() => setShowDialog(false)}>
        {selectedPatient && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Riwayat Perawatan — {selectedPatient.name}
            </h2>

            {medicalRecords[selectedPatient.id]?.length > 0 ? (
              <ul className="space-y-2">
                {medicalRecords[selectedPatient.id].map((record, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-medium text-gray-700">{record.date}</p>
                    <p className="text-sm text-gray-500">{record.treatment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Tidak ada riwayat perawatan</p>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowDialog(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </AdminLayout>
  );
}
