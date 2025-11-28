"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // ⬅️ Tambah useRouter
import Header from "../components/header";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const adminNavItems = [
  { name: "Manajemen Dokter", href: "/admin/dokter" },
  { name: "Manajemen Jadwal Dokter", href: "/admin/schedule" },
  { name: "Manajemen Pasien", href: "/admin/pasien" },
  { name: "Manajemen Reservasi", href: "/admin/reservasi" },
  { name: "Manajemen Antrian", href: "/admin/antrian" },
  { name: "Manajemen Rekam Medis", href: "/admin/rekam-medis" },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // ⬅️ WAJIB ada biar router.push bisa jalan

  const handleLogout = () => {
    // kalau kamu simpan token login, bisa hapus juga:
    // localStorage.removeItem("token");

    router.push("/"); // arahkan ke halaman home
  };

  return (
    <aside className="w-64 bg-neutral-900 text-white shadow-xl flex flex-col p-4 space-y-6">
      <div className="flex flex-col items-center border-b border-primary-500/50 pb-4">
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center border-4 border-primary-200">
          <UserCircleIcon className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-xl font-bold mt-3">Admin</h2>
      </div>

      <nav className="flex flex-col space-y-2 flex-grow overflow-y-auto pr-2 scrollbar-hide">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <p
                className={`block p-3 rounded-lg font-medium text-center transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-neutral-200 hover:bg-primary-800"
                }`}
              >
                {item.name}
              </p>
            </Link>
          );
        })}
      </nav>

      {/* TOMBOL KELUAR */}
      <div className="pt-4 border-t border-primary-500/50 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full p-3 text-center font-medium text-red-300 hover:bg-red-700/20 rounded-lg transition-colors"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}

/* ============================
      ADMIN LAYOUT
============================= */

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
