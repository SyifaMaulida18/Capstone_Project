"use client";
import { useState } from "react";
import AdminLayout from "@/app/admin/components/admin_layout";
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon } from "@heroicons/react/24/outline";

// Komponen Dialog
function Dialog({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg relative">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Data dummy
const dataPasien = [
  {
    id: 1,
    nama: "Ayu Gideon",
    email: "ayugideon@gmail.com",
    telp: "081254345678",
    tglLahir: "12-07-1997",
    jk: "Perempuan",
    nik: "12321323",
    wa: "08123123123",
    penjamin: "BPJS",
    keluhan: "Sering sakit kepala",
    rekomPoli: "Saraf",
  },
  {
    id: 2,
    nama: "Niko Affandi",
    email: "nikoaffandi@gmail.com",
    telp: "0822123212321",
    tglLahir: "05-03-1995",
    jk: "Laki-laki",
    nik: "12345678",
    wa: "0821123123123",
    penjamin: "Swasta",
    keluhan: "Demam dan batuk",
    rekomPoli: "Umum",
  },
  {
    id: 3,
    nama: "Angger Karis",
    email: "anggerkaris@gmail.com",
    telp: "0821321321321",
    tglLahir: "12-07-1997",
    jk: "Laki-laki",
    nik: "132132133",
    wa: "0821321321321",
    penjamin: "Swasta",
    keluhan: "Sering mual saat ingin BAB",
    rekomPoli: "Organ Dalam",
  },
];

export default function VerifikasiReservasiPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleDetail = (pasien) => {
    setSelectedPatient(pasien);
    setShowDialog(true);
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-400 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Verifikasi Reservasi Pasien
        </h1>

        {/* Header Filter & Search */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-xs ml-auto flex items-center space-x-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            <button className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <span>Filter</span>
            </button>

            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors font-semibold">
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-400 rounded-t-lg">
              <tr>
                {["Id", "Nama", "Email", "No Telp", "Aksi"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {dataPasien.map((p, i) => (
                <tr
                  key={p.id}
                  className={i % 2 === 1 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {p.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{p.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{p.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{p.telp}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleDetail(p)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md font-semibold transition-all"
                    >
                      Lihat detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dialog Detail Pasien */}
        <Dialog show={showDialog} onClose={() => setShowDialog(false)}>
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
            Verifikasi Reservasi Pasien
          </h2>
          {selectedPatient && (
            <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
              <p><strong>Nama Lengkap:</strong> {selectedPatient.nama}</p>
              <p><strong>Tanggal Lahir:</strong> {selectedPatient.tglLahir}</p>
              <p><strong>Jenis Kelamin:</strong> {selectedPatient.jk}</p>
              <p><strong>Nomor KTP:</strong> {selectedPatient.nik}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Nomor WA:</strong> {selectedPatient.wa}</p>
              <p><strong>Penjamin:</strong> {selectedPatient.penjamin}</p>
              <p><strong>Keluhan:</strong> {selectedPatient.keluhan}</p>
              <p><strong>Rekomendasi Poli:</strong> {selectedPatient.rekomPoli}</p>
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setShowDialog(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-lg font-bold"
            >
              ✖
            </button>
            <button
              onClick={() => setShowDialog(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-lg font-bold"
            >
              ✔
            </button>
          </div>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
