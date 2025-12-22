"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  FunnelIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout";
import { Dialog } from "@/app/admin/components/ui/dialog";
import { Input } from "../../admin/components/ui/input";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function MedicalRecordsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialReservasiId = searchParams.get("reservasi_id");
  const initialPatientId = searchParams.get("patient_id");
  const initialPatientName = searchParams.get("patient_name");

  // === STATE DATA DARI BACKEND ===
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState({}); // { patientId: [records] }
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);

  // === STATE DIALOG ===
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // === STATE FORM ===
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({
    date: "",
    treatment: "",
    reservasiId: "",
    noMedrec: "",
  });

  // =========================
  // 1. FETCH DATA REKAM MEDIS
  // =========================
  const loadRecords = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API_BASE}/rekam-medis`, {
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Gagal mengambil rekam medis (status ${res.status}): ${text}`
        );
      }

      const json = await res.json();

      // RekamMedisController@index -> return array langsung
      const records = Array.isArray(json) ? json : json.data || [];

      const grouped = {};

      records.forEach((r) => {
        const reservation = r.reservasi || null;
        const user = reservation?.user || null; // Reservation::user()

        // Resolve patient id robustly: prefer reservation.user.userid, fall back to booked_user_id, or top-level fields
        const patientId =
          user?.userid || reservation?.booked_user_id || r.booked_user_id || null;

        // Resolve patient name with sensible fallbacks
        const patientName =
          user?.name || reservation?.booked_user?.name || reservation?.name || `Pasien ${patientId}`;

        if (!patientId) return;

        if (!grouped[patientId]) {
          grouped[patientId] = {
            patient: { id: patientId, name: patientName },
            records: [],
          };
        }

        grouped[patientId].records.push({
          id: r.rekam_medis_id || r.id,
          date: r.tanggal_diperiksa
            ? String(r.tanggal_diperiksa).slice(0, 10)
            : "",
          treatment: r.diagnosis || r.tindakan || "",
          raw: r,
        });
      });

      let patientsArr = Object.values(grouped).map((g) => ({
        id: g.patient.id,
        name: g.patient.name,
        hasRecord: g.records.length > 0,
      }));

      const recordsMap = {};
      Object.values(grouped).forEach((g) => {
        recordsMap[g.patient.id] = g.records;
      });
      setMedicalRecords(recordsMap);

      // kalau datang dari antrian (ada patient_id & name di URL),
      // pastikan pasien tsb ikut muncul walau belum punya rekam medis
      if (initialPatientId && initialPatientName) {
        const exists = patientsArr.some(
          (p) => String(p.id) === String(initialPatientId)
        );
        if (!exists) {
          patientsArr = [
            ...patientsArr,
            {
              id: Number(initialPatientId) || initialPatientId,
              name: initialPatientName,
              hasRecord: !!recordsMap[initialPatientId]?.length,
            },
          ];
        }
      }

      setPatients(patientsArr);

      if (!selectedPatient) {
        if (initialPatientId && initialPatientName) {
          setSelectedPatient({
            id: Number(initialPatientId) || initialPatientId,
            name: initialPatientName,
            hasRecord: !!recordsMap[initialPatientId]?.length,
          });
        } else if (patientsArr.length > 0) {
          setSelectedPatient(patientsArr[0]);
        }
      }
    } catch (err) {
      console.error("Error load rekam medis:", err);
      setErrorMsg(
        err.message || "Terjadi kesalahan saat mengambil data rekam medis."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // 2. HANDLER PILIH PASIEN
  // =========================
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
    setRecordForm({
      date: "",
      treatment: "",
      reservasiId: initialReservasiId || "",
      noMedrec: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (record) => {
    const raw = record.raw || {};

    setEditingRecord(record);
    setRecordForm({
      date: record.date,
      treatment: record.treatment,
      reservasiId:
        raw.reservasi_id || (raw.reservasi && raw.reservasi.reservid) || "",
      noMedrec: raw.no_medrec || "",
    });
    setShowViewDialog(false);
    setIsFormOpen(true);
  };

  // =========================
  // 3. DELETE REKAM MEDIS
  // =========================
  const handleDeleteRecord = async (recordId) => {
    if (
      !selectedPatient ||
      !window.confirm("Yakin ingin menghapus entri rekam medis ini?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/rekam-medis/${recordId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus rekam medis.");
      }

      await loadRecords();
    } catch (err) {
      console.error("Error delete rekam medis:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus data.");
    }
  };

  // =========================
  // 4. SUBMIT FORM (ADD / EDIT)
  // =========================
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const token = localStorage.getItem("token");

    try {
      if (editingRecord) {
        // UPDATE
        const payload = {
          diagnosis: recordForm.treatment,
          tanggal_diperiksa: recordForm.date,
        };

        if (recordForm.noMedrec) {
          payload.no_medrec = recordForm.noMedrec;
        }

        const res = await fetch(
          `${API_BASE}/rekam-medis/${editingRecord.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Gagal mengupdate rekam medis.");
        }
      } else {
        // CREATE
        const payload = {
          reservasi_id: Number(recordForm.reservasiId),
          no_medrec: recordForm.noMedrec,
          gejala: null,
          diagnosis: recordForm.treatment,
          tindakan: null,
          resep_obat: null,
          tanggal_diperiksa: recordForm.date,
        };

        const res = await fetch(`${API_BASE}/rekam-medis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json.message || "Gagal menambahkan rekam medis."
          );
        }
      }

      setIsFormOpen(false);
      setEditingRecord(null);
      setShowViewDialog(true);
      await loadRecords();
    } catch (err) {
      console.error("Error submit rekam medis:", err);
      alert(err.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  // =========================
  // 5. RENDER
  // =========================
  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-lg shadow min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-3 text-gray-800">
          Manajemen Rekam Medis
        </h1>

        {loading && (
          <p className="text-sm text-gray-500 mb-3">
            Memuat data rekam medis…
          </p>
        )}
        {errorMsg && (
          <p className="text-sm text-red-600 mb-3">{errorMsg}</p>
        )}

        <div className="flex gap-6 mt-2">
          {/* KIRI: DAFTAR PASIEN */}
          <div className="w-1/3 border-r pr-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Daftar Pasien</h2>
              <FunnelIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
            </div>

            <div className="space-y-2">
              {patients.length === 0 && !loading && (
                <p className="text-xs text-gray-500">
                  Belum ada rekam medis yang tercatat.
                </p>
              )}

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
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      patient.hasRecord
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {patient.hasRecord ? "Ada Rekam Medis" : "Belum Ada Data"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KANAN: DETAIL / AKSI */}
          <div className="w-2/3 pl-2">
            {selectedPatient ? (
              <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center">
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Pasien: {selectedPatient.name}
                </h3>
                <p className="text-gray-500 mb-6">
                  Apa yang ingin Anda lakukan?
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push(`/admin/rekam-medis/riwayat?patient_id=${selectedPatient.id}&patient_name=${encodeURIComponent(selectedPatient.name)}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700"
                  >
                    Lihat Riwayat
                  </button>
                  <button
                    onClick={() => router.push("/admin/rekam-medis/add")}
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

      {/* DIALOG 1: VIEW RECORDS */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  Riwayat: {selectedPatient.name}
                </h3>
                <button
                  onClick={() => setShowViewDialog(false)}
                  className="text-gray-500 hover:text-black"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                {medicalRecords[selectedPatient.id]?.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-semibold">
                      <tr>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Perawatan / Diagnosis</th>
                        <th className="p-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords[selectedPatient.id].map((rec) => (
                        <tr
                          key={rec.id}
                          className="border-b hover:bg-gray-50"
                        >
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
                  <p className="text-center text-gray-500 py-4">
                    Belum ada data rekam medis.
                  </p>
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
        )}
      </Dialog>

      {/* DIALOG 2: FORM INPUT (ADD/EDIT) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">
              {editingRecord ? "Edit Rekam Medis" : "Tambah Rekam Medis"}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Reservasi ID (manual / dari antrian) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Reservasi
                </label>
                <Input
                  type="number"
                  required={!editingRecord}
                  value={recordForm.reservasiId}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      reservasiId: e.target.value,
                    })
                  }
                  placeholder="Masukkan ID reservasi (reservid)"
                />
                {initialReservasiId && !editingRecord && (
                  <p className="text-xs text-gray-500 mt-1">
                    Diisi otomatis dari antrian (Reservasi ID:{" "}
                    <span className="font-semibold">
                      {initialReservasiId}
                    </span>
                    ). Bisa diubah jika diperlukan.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Medrec
                </label>
                <Input
                  type="text"
                  required
                  value={recordForm.noMedrec}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      noMedrec: e.target.value,
                    })
                  }
                  placeholder="Contoh: RM-0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Diperiksa
                </label>
                <Input
                  type="date"
                  required
                  value={recordForm.date}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perawatan / Diagnosis
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Pemeriksaan Umum"
                  required
                  value={recordForm.treatment}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      treatment: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    if (editingRecord) setShowViewDialog(true);
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
