"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Input } from "@/app/superadmin/components/ui/input";

// dummy data pasien & rekam medis, nanti ganti API
const patients = [
  { id: 1, name: "Ayu Gideon" },
  { id: 2, name: "Syifa Maulida" },
  { id: 3, name: "Sheva Rebecca" },
];

const medicalRecords = {
  1: [
    { id: "rec100", date: "2025-02-29", treatment: "Pemeriksaan Umum" },
    { id: "rec101", date: "2025-05-18", treatment: "Kontrol Jantung" },
  ],
  2: [],
  3: [],
};

export default function EditMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientId = searchParams.get("patientId");
  const recordId = searchParams.get("recordId");

  const patient = useMemo(
    () => patients.find((p) => String(p.id) === String(patientId)),
    [patientId]
  );

  const originalRecord = useMemo(() => {
    if (!patientId || !recordId) return null;
    const list = medicalRecords[patientId] || [];
    return list.find((r) => r.id === recordId) || null;
  }, [patientId, recordId]);

  const [form, setForm] = useState({
    date: "",
    treatment: "",
  });

  useEffect(() => {
    if (originalRecord) {
      setForm({
        date: originalRecord.date,
        treatment: originalRecord.treatment,
      });
    }
  }, [originalRecord]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // di sini nanti panggil API PUT/PATCH
    console.log("Update rekam medis:", {
      patientId,
      recordId,
      ...form,
    });

    alert("Perubahan rekam medis tersimpan (dummy).");
    router.push("/superadmin/rekam-medis");
  };

  const isNotFound = !patient || !originalRecord;

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-neutral-800">
          Edit Rekam Medis
        </h1>

        {isNotFound && (
          <p className="text-red-600 mb-4">
            Data rekam medis tidak ditemukan. Pastikan membuka halaman ini
            dari daftar rekam medis.
          </p>
        )}

        {!isNotFound && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Pasien</p>
              <p className="font-semibold text-neutral-800">
                {patient.name}
              </p>
            </div>

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
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
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
                value={form.treatment}
                onChange={(e) =>
                  setForm({ ...form, treatment: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
