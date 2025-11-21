"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon, 
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/admins", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAdmins(data); 
        } else {
          console.error("Gagal mengambil data admin");
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus Admin ini?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/admins/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setAdmins(admins.filter((admin) => admin.adminID !== id));
          alert("Admin berhasil dihapus");
        } else {
          alert("Gagal menghapus admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        
        {/* Header */}
        <div className="flex items-center justify-center mb-8 space-x-3">
            <UserIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-neutral-800">
            Manajemen Admin
            </h1>
        </div>

        {/* Toolbar (Search, Filter, Add) */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            {/* Search */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari Admin..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
            </div>

            {/* Filter */}
            <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-neutral-600" />
              <span>Filter</span>
            </button>

            {/* Tombol Add (Link ke Halaman Tambah Admin) */}
            <Link
              href="/superadmin/admins/add" 
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tambah Admin</span>
            </Link>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {["ID", "Nama Admin", "Email", "Role", "Bergabung", "Aksi"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider first:rounded-tl-lg last:rounded-tr-lg"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    Memuat data admin...
                  </td>
                </tr>
              ) : admins.length > 0 ? (
                admins.map((admin, index) => (
                  <tr
                    key={admin.adminID} // Gunakan adminID sesuai database Anda
                    className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {admin.adminID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 font-semibold">
                      {admin.Nama} {/* Huruf Besar sesuai Backend */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {admin.Email} {/* Huruf Besar sesuai Backend */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            admin.role === 'superadmin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                            {admin.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(admin.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {/* Tombol Delete */}
                        <button
                          onClick={() => handleDelete(admin.adminID)}
                          className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                          title="Hapus Admin"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>

                        {/* Tombol Edit */}
                        <Link
                          href={`/superadmin/admins/edit/${admin.adminID}`}
                          className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50"
                          title="Edit Admin"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    Belum ada data admin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}