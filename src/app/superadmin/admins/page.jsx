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

  // 🔍 state untuk search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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
          setAdmins((prev) => prev.filter((admin) => admin.adminID !== id));
          alert("Admin berhasil dihapus");
        } else {
          alert("Gagal menghapus admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    }
  };

  // 🔄 ambil daftar role unik untuk opsi filter
  const roleOptions = ["all", ...new Set(admins.map((a) => a.role))];

  // 🧠 logika filter: berdasarkan searchTerm + roleFilter
  const filteredAdmins = admins.filter((admin) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      term === "" ||
      admin.Nama?.toLowerCase().includes(term) ||
      admin.Email?.toLowerCase().includes(term) ||
      String(admin.adminID).includes(term);

    const matchesRole = roleFilter === "all" || admin.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 space-y-2">
          <UserIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 text-center">
            Manajemen Admin
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          <div />

          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-end">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Cari Admin (nama, email, ID)..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            </div>

            {/* Filter */}
            <div className="w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-start space-x-2 bg-white text-neutral-700 border border-neutral-200 px-3 py-2 rounded-lg shadow-sm">
                <FunnelIcon className="h-5 w-5 text-neutral-600" />
                <select
                  className="bg-transparent outline-none text-sm font-semibold w-full"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role === "all"
                        ? "Semua Role"
                        : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Admin */}
            <Link
              href="/superadmin/admins/add"
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold text-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tambah Admin</span>
            </Link>
          </div>
        </div>

        {/* Tabel + Scrollbar */}
        <div className="w-full overflow-x-auto overflow-y-hidden border rounded-lg scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {["ID", "Nama Admin", "Email", "Role", "Bergabung", "Aksi"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase tracking-wider first:rounded-tl-lg last:rounded-tr-lg"
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
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    Memuat data admin...
                  </td>
                </tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin, index) => (
                  <tr
                    key={admin.adminID}
                    className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap font-medium text-neutral-900">
                      {admin.adminID}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-neutral-800 font-semibold">
                      {admin.Nama}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-neutral-600">
                      {admin.Email}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                          admin.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-neutral-500">
                      {new Date(admin.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap font-medium">
                      <div className="flex space-x-2 sm:space-x-3">
                        <button
                          onClick={() => handleDelete(admin.adminID)}
                          className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                          title="Hapus Admin"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        <Link
                          href={`/superadmin/admins/edit/${admin.adminID}`}
                          className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50"
                          title="Edit Admin"
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
                    colSpan="6"
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    Tidak ada admin yang cocok dengan pencarian / filter.
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
