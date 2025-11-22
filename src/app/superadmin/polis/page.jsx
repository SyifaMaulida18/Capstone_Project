"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrashIcon, PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// Sesuaikan path layout
import SuperAdminLayout from "../components/superadmin_layout"; 

export default function PoliManagementPage() {
  const [polis, setPolis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data (GET /polis)
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
          // PoliController index() mengembalikan array langsung: [...]
          // atau { success: true, data: [...] } tergantung controller Anda.
          // Asumsi berdasarkan User: Anda mungkin mengembalikan array langsung karena PoliController index() return Poli::all().
          // Jika backend return Poli::all(), maka 'data' adalah arraynya.
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

  // Delete Data (DELETE /polis/{poli_id})
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
          alert("Gagal menghapus poli. Pastikan poli tidak sedang digunakan di data lain.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <SuperAdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Poli
        </h1>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            {/* Search Box dummy */}
            <div className="relative w-full max-w-xs">
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-primary-500" />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
            </div>

            <Link
              href="/superadmin/polis/add"
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase first:rounded-tl-lg">ID Poli</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">Nama Poli</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase last:rounded-tr-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading ? (
                <tr><td colSpan="3" className="text-center py-8 text-neutral-500">Memuat data poli...</td></tr>
              ) : polis.length > 0 ? (
                polis.map((poli, index) => (
                  <tr key={poli.poli_id} className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {poli.poli_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                      {poli.poli_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button onClick={() => handleDelete(poli.poli_id)} className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <Link href={`/superadmin/polis/edit/${poli.poli_id}`} className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50">
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-8 text-neutral-500">Belum ada data poli.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}