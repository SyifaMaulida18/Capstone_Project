"use client";

import { useState } from "react";
import {
  FunnelIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout"; // Path AdminLayout
import { Dialog } from "@/app/admin/components/ui/dialog"; // Path Dialog

export default function MedicalRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Data dummy pasien dan rekam medis
  const patients = [
    { id: 1, name: "Ayu Gideon", hasRecord: true },
    { id: 2, name: "Syifa Maulida", hasRecord: false },
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
      {/* UBAH: Menggunakan border-primary-200 */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        {/* UBAH: Menggunakan text-neutral-800 */}
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Rekam Medis
        </h1>

        {/* Header buttons */}
        <div className="flex justify-end mb-6 space-x-3">
          {/* UBAH: Menggunakan neutral */}
          <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
            <FunnelIcon className="h-5 w-5 text-neutral-600" />
            <span>Filter</span>
          </button>

          {/* UBAH: Menggunakan neutral */}
          <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
            <PencilIcon className="h-5 w-5 text-neutral-600" />
            <span>Edit</span>
          </button>

          {/* UBAH: Menggunakan secondary */}
          <button className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold">
            <PlusIcon className="h-5 w-5" />
            <span>Add</span>
          </button>
        </div>

        {/* Dua kolom utama */}
        <div className="grid grid-cols-2 gap-6">
          {/* Kolom kiri: daftar pasien */}
          {/* UBAH: Menggunakan bg-neutral-100 dan border-neutral-200 */}
          <div className="bg-neutral-100 p-4 rounded-lg border border-neutral-200">
            <ul className="space-y-3">
              {patients.map((p) => (
                <li
                  key={p.id}
                  /* UBAH: Menggunakan hover:bg-primary-50 dan border-primary-500 */
                  className={`flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border hover:bg-primary-50 cursor-pointer transition ${
                    p.id === selectedPatient?.id
                      ? "border-primary-500"
                      : "border-transparent" // Border default transparan
                  }`}
                  onClick={() => handleSelectPatient(p)}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      // UBAH: Menggunakan accent-primary-500
                      className="accent-primary-500"
                      checked={p.id === selectedPatient?.id}
                      readOnly
                    />
                    {/* UBAH: Menggunakan text-neutral-800 */}
                    <span className="text-neutral-800 font-medium">
                      {p.name}
                    </span>
                  </label>
                  {p.hasRecord && <span className="text-sm">📁</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom kanan: daftar tanggal rekam medis */}
          {/* UBAH: Menggunakan bg-neutral-100 dan border-neutral-200 */}
          <div className="bg-neutral-100 p-4 rounded-lg border border-neutral-200">
            {selectedPatient ? (
              <>
                {medicalRecords[selectedPatient.id]?.length > 0 ? (
                  <ul className="space-y-3">
                    {medicalRecords[selectedPatient.id].map((r, i) => (
                      <li
                        key={i}
                        // UBAH: Menggunakan border-neutral-100 dan hover:bg-neutral-50
                        className="bg-white p-3 rounded-lg border border-neutral-100 shadow-sm hover:bg-neutral-50"
                      >
                        {/* UBAH: Menggunakan text-neutral-700 */}
                        <span className="text-neutral-700">{r.date}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // UBAH: Menggunakan text-neutral-600
                  <p className="text-neutral-600 italic text-center mt-10">
                    Belum ada rekam medis untuk pasien ini
                  </p>
                )}
              </>
            ) : (
              // UBAH: Menggunakan text-neutral-600
              <p className="text-neutral-600 italic text-center mt-10">
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
            {/* UBAH: Menggunakan text-neutral-800 */}
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Riwayat Perawatan — {selectedPatient.name}
            </h2>

            {medicalRecords[selectedPatient.id]?.length > 0 ? (
              <ul className="space-y-2">
                {medicalRecords[selectedPatient.id].map((record, index) => (
                  <li
                    key={index}
                    // UBAH: Menggunakan bg-neutral-50 dan border-neutral-200
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    {/* UBAH: Menggunakan text-neutral-700 */}
                    <p className="font-medium text-neutral-700">
                      {record.date}
                    </p>
                    {/* UBAH: Menggunakan text-neutral-600 */}
                    <p className="text-sm text-neutral-600">
                      {record.treatment}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              // UBAH: Menggunakan text-neutral-600
              <p className="text-neutral-600 italic">Tidak ada riwayat perawatan</p>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowDialog(false)}
                // UBAH: Menggunakan bg-primary-600 dan hover:bg-primary-800
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition"
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