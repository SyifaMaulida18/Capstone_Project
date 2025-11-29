"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function RekamMedisListPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/rekam-medis`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        setRecords(json.data || []);
      } catch (err) {
        console.error("Error fetch list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6">Rekam Medis</h1>

        {loading ? (
          <p>Memuat data...</p>
        ) : records.length === 0 ? (
          <p className="text-neutral-500">Belum ada rekam medis.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-primary-600 text-white">
                <th className="p-3">No Medrec</th>
                <th className="p-3">Diagnosis</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b">
                  <td className="p-3">{rec.no_medrec}</td>
                  <td className="p-3">{rec.diagnosis}</td>
                  <td className="p-3">{rec.tanggal_diperiksa?.slice(0, 10)}</td>
                  <td className="p-3">
                    <Link
                      href={`/superadmin/rekam-medis/${rec.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
