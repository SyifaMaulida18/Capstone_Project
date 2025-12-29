"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../components/admin_layout";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function AdminPoliPage() {
  const [polis, setPolis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // search + filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  useEffect(() => {
    const fetchPolis = async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const res = await fetch(`${baseUrl}/polis`, {
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Token tidak valid/kadaluarsa. Silakan login ulang.");
          if (res.status === 403) throw new Error("Akses ditolak. Halaman ini khusus Admin/Superadmin.");
          throw new Error(`Gagal mengambil data poli (status ${res.status}).`);
        }

        const json = await res.json();
        const list = Array.isArray(json) ? json : json.data || [];
        setPolis(Array.isArray(list) ? list : []);
      } catch (err) {
        setErrorMsg(err.message || "Gagal memuat data poli.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolis();
  }, []);

  const filteredPolis = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return (polis || []).filter((p) => {
      const matchesSearch =
        !term ||
        p.poli_name?.toLowerCase().includes(term) ||
        p.kepala?.toLowerCase().includes(term) ||
        p.kode_lokasi?.toLowerCase().includes(term) ||
        String(p.poli_id).includes(term);

      const isActive = p.aktif === "Y";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [polis, searchTerm, statusFilter]);

  return (
    <AdminLayout>
      <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Daftar Poli</h1>

          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-end">
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Cari Poli (nama, kepala, kode, ID)..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            </div>

            <div className="w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-start space-x-2 bg-white text-neutral-700 border border-neutral-200 px-3 py-2 rounded-lg shadow-sm">
                <FunnelIcon className="h-5 w-5 text-neutral-600" />
                <select
                  className="bg-transparent outline-none text-sm font-semibold w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto overflow-y-hidden border rounded-lg">
          <table className="min-w-[720px] sm:min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase first:rounded-tl-lg">ID Poli</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">Nama Poli</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">Kepala Poli</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">Kode Lokasi</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-500 text-sm">Memuat data poli...</td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-red-600 text-sm">{errorMsg}</td>
                </tr>
              ) : filteredPolis.length > 0 ? (
                filteredPolis.map((poli, idx) => (
                  <tr key={poli.poli_id} className={idx % 2 === 1 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm font-medium text-neutral-900 whitespace-nowrap">{poli.poli_id}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-neutral-800 font-semibold whitespace-nowrap">{poli.poli_name}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-neutral-600 whitespace-nowrap">{poli.kepala || "-"}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-neutral-600 whitespace-nowrap">{poli.kode_lokasi || "-"}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold ${poli.aktif === "Y" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {poli.aktif === "Y" ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-500 text-sm">Tidak ada poli yang cocok dengan pencarian / filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
