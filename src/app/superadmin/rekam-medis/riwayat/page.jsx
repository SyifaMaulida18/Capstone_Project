"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function RekamMedisRiwayatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patientId = searchParams.get("patient_id");
  const patientName = searchParams.get("patient_name") || "Pasien";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!patientId) {
      setErrorMsg("ID pasien tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    const fetchRiwayat = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan. Silakan login ulang.");
        }

        // GET /rekam-medis (Mengambil semua data)
        const res = await fetch(`${API_BASE}/rekam-medis`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Gagal mengambil data (Status ${res.status})`);
        }

        const json = await res.json();
        const allRecords = Array.isArray(json) ? json : json.data || [];

        // Filter Client-Side berdasarkan ID Pasien (User ID)
        // Backend: RekamMedis -> belongsTo Reservasi -> belongsTo User
        const filtered = allRecords.filter((r) => {
          const reservasi = r.reservasi || {};
          const user = reservasi.user || {};
          
          // Pastikan user.id atau user.userid sesuai dengan database Anda
          const recordUserId = user.id || user.userid;
          
          return String(recordUserId) === String(patientId);
        });

        setRecords(filtered);
      } catch (err) {
        console.error("Error fetch riwayat:", err);
        setErrorMsg(err.message || "Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, [patientId]);

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Riwayat Rekam Medis</h1>
            <p className="text-sm text-neutral-600 mt-1">
              Pasien: <span className="font-bold text-primary-600">{patientName}</span>
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            Kembali
          </button>
        </div>

        {loading && <p className="text-center py-10">Memuat data riwayat...</p>}
        {errorMsg && <p className="text-center py-10 text-red-600">{errorMsg}</p>}

        {!loading && !errorMsg && records.length === 0 && (
          <div className="text-center py-10 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
            <p className="text-neutral-500">Belum ada rekam medis untuk pasien ini.</p>
          </div>
        )}

        {!loading && !errorMsg && records.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-primary-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No. Medrec</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Diagnosis</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tindakan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Resep Obat</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {records.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-800">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.tanggal_diperiksa || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-neutral-600">
                      {item.no_medrec || <span className="italic text-xs">Auto</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">{item.diagnosis || "-"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800">{item.tindakan || "-"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800">{item.resep_obat || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}