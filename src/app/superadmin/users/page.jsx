"use client"; // Diperlukan untuk useState dan onClick

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import SuperAdminLayout from "../../superadmin/components/superadmin_layout";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 State untuk search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("all"); // "all" | "with-phone" | "without-phone"

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(`${baseUrl}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setUsers(result.data);
        } else {
          console.error("Gagal mengambil data user");
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data user ini?")) {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(`${baseUrl}/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setUsers((prev) => prev.filter((u) => u.userid !== id));
          alert("User berhasil dihapus.");
        } else {
          alert("Gagal menghapus user.");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // 🧠 Logika filter: search + filter no telp
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      term === "" ||
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.nomor_telepon?.toLowerCase().includes(term) ||
      String(user.userid).includes(term);

    const hasPhone =
      user.nomor_telepon && user.nomor_telepon.toString().trim() !== "";

    const matchesPhoneFilter =
      phoneFilter === "all" ||
      (phoneFilter === "with-phone" && hasPhone) ||
      (phoneFilter === "without-phone" && !hasPhone);

    return matchesSearch && matchesPhoneFilter;
  });

  return (
    <SuperAdminLayout>
      <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-neutral-800">
            Manajemen User
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          <div />

          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-end">
            {/* 🔍 Search */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Cari user (nama, email, id, no telp)..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            </div>

            {/* 🎯 Filter No Telp */}
            <div className="w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-start space-x-2 bg-white text-neutral-700 border border-neutral-200 px-3 py-2 rounded-lg shadow-sm">
                <FunnelIcon className="h-5 w-5 text-neutral-600" />
                <select
                  className="bg-transparent outline-none text-sm font-semibold w-full"
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                >
                  <option value="all">Semua User</option>
                  <option value="with-phone">Dengan No Telp</option>
                  <option value="without-phone">Tanpa No Telp</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel + Scrollbar horizontal */}
        <div className="w-full overflow-x-auto overflow-y-hidden border rounded-lg scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {["Id", "Nama", "Email", "No Telp", "Aksi"].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 sm:px-6 sm:py-3 text-left font-semibold text-white uppercase tracking-wider first:rounded-tl-lg last:rounded-tr-lg"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-neutral-500 text-sm"
                  >
                    Memuat data user...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.userid || index}
                    className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap font-medium text-neutral-900">
                      {user.userid}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-neutral-800">
                      {user.name}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-neutral-800">
                      {user.email}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-neutral-800">
                      {user.nomor_telepon || "-"}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap font-medium">
                      <div className="flex space-x-2 sm:space-x-3">
                        <button
                          onClick={() => handleDelete(user.userid)}
                          className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                          title="Hapus User"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        <Link
                          href={`/superadmin/users/edit/${user.userid}`}
                          className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50"
                          title="Edit User"
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
                    colSpan={5}
                    className="text-center py-10 text-neutral-500 text-sm"
                  >
                    Tidak ada user yang cocok dengan pencarian / filter.
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
