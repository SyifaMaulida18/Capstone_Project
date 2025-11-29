"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import SuperAdminLayout from "../components/superadmin_layout";

export default function PoliManagementPage() {
  const [polis, setPolis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 state untuk search & filter status
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"

  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/polis`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPolis(Array.isArray(data) ? data : data.data || []);
        } else {
          console.error("Gagal mengambil data poli");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolis();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(`Yakin hapus Poli ID: ${id}?`)) {
      try {
        const token = localStorage.getItem("token");
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/polis/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          setPolis((prev) => prev.filter((p) => p.poli_id !== id));
          alert("Poli berhasil dihapus.");
        } else {
          alert("Gagal menghapus poli.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // 🧠 Logika filter: search + status aktif / non-aktif
  const filteredPolis = polis.filter((poli) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      term === "" ||
      poli.poli_name?.toLowerCase().includes(term) ||
      poli.kepala?.toLowerCase().includes(term) ||
      poli.kode_lokasi?.toLowerCase().includes(term) ||
      String(poli.poli_id).includes(term);

    const isActive = poli.aktif === "Y";

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <SuperAdminLayout>
      <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        {/* Header + Toolbar wrapper */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          {/* Judul */}
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 text-center md:text-left">
            Manajemen Poli
          </h1>

          {/* Toolbar (Search, Filter, Add) */}
          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-end">
            {/* 🔍 Search */}
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

            {/* 🎯 Filter Status */}
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

            {/* ➕ Tambah Poli */}
            <Link
              href="/superadmin/polis/add"
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold text-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tambah Poli</span>
            </Link>
          </div>
        </div>

        {/* Tabel + Scrollbar horizontal */}
        <div className="w-full overflow-x-auto overflow-y-hidden border rounded-lg scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-neutral-200">
          <table className="min-w-[720px] sm:min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase first:rounded-tl-lg">
                  ID Poli
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">
                  Nama Poli
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">
                  Kepala Poli
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">
                  Kode Lokasi
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase">
                  Status
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase last:rounded-tr-lg">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-neutral-500 text-sm"
                  >
                    Memuat data poli...
                  </td>
                </tr>
              ) : filteredPolis.length > 0 ? (
                filteredPolis.map((poli, index) => (
                  <tr
                    key={poli.poli_id}
                    className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm font-medium text-neutral-900 whitespace-nowrap">
                      {poli.poli_id}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-neutral-800 font-semibold whitespace-nowrap">
                      {poli.poli_name}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-neutral-600 whitespace-nowrap">
                      {poli.kepala || "-"}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-neutral-600 whitespace-nowrap">
                      {poli.kode_lokasi || "-"}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                          poli.aktif === "Y"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {poli.aktif === "Y" ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2 sm:space-x-3">
                        <button
                          onClick={() => handleDelete(poli.poli_id)}
                          className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                          title="Hapus"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <Link
                          href={`/superadmin/polis/edit/${poli.poli_id}`}
                          className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50"
                          title="Edit Lengkap"
                        >
                          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-neutral-500 text-sm"
                  >
                    Tidak ada poli yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
