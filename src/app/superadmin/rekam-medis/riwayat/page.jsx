"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

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

        // Sesuai RekamMedisController@index -> GET /rekam-medis
        const res = await fetch(`${API_BASE}/rekam-medis`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Gagal mengambil riwayat rekam medis (status ${res.status}): ${text}`
          );
        }

        const json = await res.json();
        const allRecords = Array.isArray(json) ? json : json.data || [];

        // Filter berdasarkan patient_id dari relasi reservasi.user
        const filtered = allRecords.filter((r) => {
          const reservation = r.reservasi || r.reservation || null;
          const user = reservation?.user || null;
          if (!user) return false;
          return String(user.userid) === String(patientId);
        });

        setRecords(filtered);
      } catch (err) {
        console.error("Error fetch riwayat rekam medis:", err);
        setErrorMsg(
          err.message ||
            "Terjadi kesalahan saat mengambil riwayat rekam medis pasien."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, [patientId]);

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Riwayat Rekam Medis
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Pasien: <span className="font-semibold">{patientName}</span>{" "}
              {patientId && (
                <span className="text-xs text-neutral-500">
                  {" "}
                  (ID: {patientId})
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-100"
          >
            Kembali
          </button>
        </div>

        {loading && (
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-700">
            Memuat riwayat rekam medis...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && records.length === 0 && (
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-700">
            Belum ada riwayat rekam medis untuk pasien ini.
          </div>
        )}

        {!loading && !errorMsg && records.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-primary-600">
                <tr>
                  {[
                    "No",
                    "Tanggal Diperiksa",
                    "No. Medrec",
                    "Gejala",
                    "Diagnosis",
                    "Tindakan",
                    "Resep Obat",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {records.map((item, idx) => (
                  <tr
                    key={item.rekam_medis_id || item.id || idx}
                    className={idx % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.tanggal_diperiksa
                        ? new Date(
                            item.tanggal_diperiksa
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.no_medrec || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.gejala || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.diagnosis || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.tindakan || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">
                      {item.resep_obat || "-"}
                    </td>
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
