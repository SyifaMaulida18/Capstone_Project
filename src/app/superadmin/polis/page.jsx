"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrashIcon, PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SuperAdminLayout from "../components/superadmin_layout"; 

export default function PoliManagementPage() {
  const [polis, setPolis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
        
        const response = await fetch(`${baseUrl}/polis`, { 
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/polis/${id}`, {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
        });

        if (response.ok) {
          setPolis(polis.filter((p) => p.poli_id !== id));
          alert("Poli berhasil dihapus.");
        } else {
          alert("Gagal menghapus poli.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <SuperAdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Manajemen Poli</h1>
            <div className="flex space-x-3">
                <div className="relative w-full max-w-xs">
                    <input type="text" placeholder="Cari Poli..." className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500" />
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
                </div>
                <Link
                href="/superadmin/polis/add"
                className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
                >
                <PlusIcon className="h-5 w-5" />
                <span>Tambah Poli</span>
                </Link>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {/* Menampilkan Kolom Utama Saja Agar Rapi */}
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase first:rounded-tl-lg">ID Poli</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">Nama Poli</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">Kepala Poli</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">Kode Lokasi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase last:rounded-tr-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8 text-neutral-500">Memuat data poli...</td></tr>
              ) : polis.length > 0 ? (
                polis.map((poli, index) => (
                  <tr key={poli.poli_id} className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{poli.poli_id}</td>
                    <td className="px-6 py-4 text-sm text-neutral-800 font-semibold">{poli.poli_name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{poli.kepala || "-"}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{poli.kode_lokasi || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${poli.aktif === 'Y' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {poli.aktif === 'Y' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium flex space-x-3">
                      <button onClick={() => handleDelete(poli.poli_id)} className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50" title="Hapus">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <Link href={`/superadmin/polis/edit/${poli.poli_id}`} className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50" title="Edit Lengkap">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-8 text-neutral-500">Belum ada data poli.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}