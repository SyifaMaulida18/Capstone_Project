"use client";

<<<<<<< HEAD
import { useState } from "react";
import {
  FunnelIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon, // Impor TrashIcon
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Dialog } from "@/app/superadmin/components/ui/dialog";
import { Input } from "@/app/superadmin/components/ui/input"; // Impor Input untuk form

// --- DATA DUMMY (Saya tambahkan ID unik ke rekam medis) ---
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
// ---------------------------------------------------------

export default function MedicalRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(initialPatients);
  const [medicalRecords, setMedicalRecords] = useState(initialMedicalRecords);

  // --- STATE UNTUK DIALOG ---
  const [showViewDialog, setShowViewDialog] = useState(false); // Dialog untuk Melihat Riwayat
  const [isFormOpen, setIsFormOpen] = useState(false); // Dialog for Form Add/Edit

  // --- STATE UNTUK FORM ---
  const [editingRecord, setEditingRecord] = useState(null); // null = Add, Object = Edit
  const [recordForm, setRecordForm] = useState({
    date: "",
    treatment: "",
  });

  // --- HANDLER ---

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  // Membuka dialog VIEW riwayat
  const handleOpenViewDialog = () => {
    if (!selectedPatient) {
      alert("Pilih pasien terlebih dahulu.");
      return;
    }
    setShowViewDialog(true);
  };

  // Membuka dialog FORM (mode ADD)
  const handleOpenAddForm = () => {
    if (!selectedPatient) {
      alert("Pilih pasien terlebih dahulu untuk menambahkan rekam medis.");
      return;
    }
    setEditingRecord(null); // Mode Add
    setRecordForm({ date: "", treatment: "" }); // Reset form
    setIsFormOpen(true);
  };

  // Membuka dialog FORM (mode EDIT)
  const handleOpenEditForm = (record) => {
    setEditingRecord(record);
    setRecordForm({
      date: record.date,
      treatment: record.treatment,
    });
    setShowViewDialog(false); // Tutup dialog view
    setIsFormOpen(true); // Buka dialog form
  };

  // Menghapus rekam medis
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

  // Submit form (Add / Edit)
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
        id: `rec${Date.now()}`, // ID unik dummy
        ...recordForm,
      };
      const updatedRecords = [...medicalRecords[patientId], newRecord];
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
      }
    }

    setIsFormOpen(false);
    setEditingRecord(null);
=======
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Input } from "@/app/superadmin/components/ui/input";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function EditRekamMedisPage() {
  const router = useRouter();
  const params = useParams(); // { id: '1' }

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    no_medrec: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    tanggal_diperiksa: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/rekam-medis/${params.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const json = await res.json();
        const data = json.data || json;

        setForm({
          no_medrec: data.no_medrec || "",
          gejala: data.gejala || "",
          diagnosis: data.diagnosis || "",
          tindakan: data.tindakan || "",
          tanggal_diperiksa: (data.tanggal_diperiksa || "").slice(0, 10),
        });
      } catch (err) {
        console.error("Gagal fetch detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchDetail();
    }
  }, [params?.id]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/rekam-medis/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error(json);
        alert("Gagal mengupdate rekam medis");
        return;
      }

      alert("Rekam medis berhasil diupdate");
      router.push("/superadmin/rekam-medis");
    } catch (err) {
      console.error("Error submit:", err);
    }
>>>>>>> 3829dbf4eadcbddd75c6f4bd78a3659b1882f227
  };

  return (
    <AdminLayout>
<<<<<<< HEAD
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Rekam Medis
        </h1>

        <div className="flex justify-end mb-6 space-x-3">
          <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
            <FunnelIcon className="h-5 w-5 text-neutral-600" />
            <span>Filter</span>
          </button>

          {/* Tombol Add Buka Form Dialog */}
          <button
            onClick={handleOpenAddForm} // --- UBAH DI SINI ---
            className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Record</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Kolom kiri: daftar pasien */}
          <div className="bg-neutral-100 p-4 rounded-lg border border-neutral-200">
            <ul className="space-y-3">
              {patients.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border hover:bg-primary-50 cursor-pointer transition ${
                    p.id === selectedPatient?.id
                      ? "border-primary-500"
                      : "border-transparent"
                  }`}
                  onClick={() => handleSelectPatient(p)}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-primary-500"
                      checked={p.id === selectedPatient?.id}
                      readOnly
                    />
                    <span className="text-neutral-800 font-medium">
                      {p.name}
                    </span>
                  </label>
                  {p.hasRecord && (
                    <span
                      className="text-sm cursor-pointer hover:text-primary-600"
                      onClick={(e) => {
                        e.stopPropagation(); // Hindari trigger handleSelectPatient
                        handleSelectPatient(p); // Pilih pasien
                        handleOpenViewDialog(); // Langsung buka dialog
                      }}
                    >
                      📁
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom kanan: daftar tanggal rekam medis */}
          <div className="bg-neutral-100 p-4 rounded-lg border border-neutral-200">
            {selectedPatient ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-neutral-700">
                    Riwayat: {selectedPatient.name}
                  </h3>
                  <button
                    onClick={handleOpenViewDialog}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>
                {medicalRecords[selectedPatient.id]?.length > 0 ? (
                  <ul className="space-y-3">
                    {medicalRecords[selectedPatient.id].map((r, i) => (
                      <li
                        key={i}
                        className="bg-white p-3 rounded-lg border border-neutral-100 shadow-sm hover:bg-neutral-50"
                      >
                        <span className="text-neutral-700">{r.date}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600 italic text-center mt-10">
                    Belum ada rekam medis
                  </p>
                )}
              </>
            ) : (
              <p className="text-neutral-600 italic text-center mt-10">
                Pilih pasien untuk melihat rekam medis
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up dialog DETAIL/VIEW rekam medis */}
      <Dialog show={showViewDialog} onClose={() => setShowViewDialog(false)}>
        {selectedPatient && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Riwayat Perawatan — {selectedPatient.name}
            </h2>

            {medicalRecords[selectedPatient.id]?.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {medicalRecords[selectedPatient.id].map((record) => (
                  <li
                    key={record.id}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium text-neutral-700">
                        {record.date}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {record.treatment}
                      </p>
                    </div>
                    {/* --- TOMBOL EDIT/DELETE DI SINI --- */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditForm(record)}
                        className="text-neutral-500 hover:text-primary-600 p-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-neutral-500 hover:text-red-600 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-600 italic">
                Tidak ada riwayat perawatan
              </p>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewDialog(false)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* --- DIALOG BARU UNTUK FORM ADD/EDIT --- */}
      <Dialog show={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">
            {editingRecord ? "Edit" : "Tambah"} Rekam Medis untuk{" "}
            {selectedPatient?.name}
          </h2>

          <div>
            <label
              htmlFor="date"
              className="text-sm text-neutral-600 block mb-1"
            >
              Tanggal Perawatan
            </label>
            <Input
              type="date"
              id="date"
              value={recordForm.date}
              onChange={(e) =>
                setRecordForm({ ...recordForm, date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="treatment"
              className="text-sm text-neutral-600 block mb-1"
            >
              Keterangan (Perawatan/Diagnosa)
            </label>
            <textarea
              id="treatment"
              rows={4}
              value={recordForm.treatment}
              onChange={(e) =>
                setRecordForm({ ...recordForm, treatment: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Contoh: Pemeriksaan umum, keluhan demam 3 hari."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-secondary-500 text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition"
            >
              {editingRecord ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
=======
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-neutral-800">
          Rekam Medis
        </h1>

        {loading ? (
          <p className="text-neutral-600">Memuat data...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* No Medrec */}
            <div>
              <label className="text-sm text-neutral-600 block mb-1">
                Nomor Medrec
              </label>
              <Input
                value={form.no_medrec}
                onChange={handleChange("no_medrec")}
                required
              />
            </div>

            {/* Gejala */}
            <div>
              <label className="text-sm text-neutral-600 block mb-1">
                Gejala
              </label>
              <textarea
                value={form.gejala}
                onChange={handleChange("gejala")}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="text-sm text-neutral-600 block mb-1">
                Diagnosis
              </label>
              <textarea
                value={form.diagnosis}
                onChange={handleChange("diagnosis")}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Tindakan */}
            <div>
              <label className="text-sm text-neutral-600 block mb-1">
                Tindakan
              </label>
              <textarea
                value={form.tindakan}
                onChange={handleChange("tindakan")}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Tanggal diperiksa */}
            <div>
              <label className="text-sm text-neutral-600 block mb-1">
                Tanggal Diperiksa
              </label>
              <Input
                type="date"
                value={form.tanggal_diperiksa}
                onChange={handleChange("tanggal_diperiksa")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/superadmin/rekam-medis")}
                className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-secondary-500 text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
>>>>>>> 3829dbf4eadcbddd75c6f4bd78a3659b1882f227
