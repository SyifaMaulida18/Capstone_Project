"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// FIX: Path impor Header disesuaikan (asumsi header.jsx ada di folder components)
import Header from "../components/header";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const adminNavItems = [
  { name: "Manajemen Dokter", href: "/admin/dokter" }, // Fix: Path absolut lebih aman
  // { name: "Manajemen User", href: "/admin/users" },
  { name: "Manajemen Pasien", href: "/admin/pasien" },
  { name: "Manajemen Jadwal", href: "/admin/schedule" },
  { name: "Manajemen Rekam Medis", href: "/admin/rekam-medis" },
  { name: "Manajemen Antrian", href: "/admin/antrian" },
  { name: "Manajemen Reservasi", href: "/admin/reservasi" },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    // UBAH: Menggunakan bg-neutral-900 agar konsisten dengan sidebar user
    <aside className="w-64 bg-neutral-900 text-white shadow-xl flex flex-col p-4 space-y-6">
      {/* UBAH: Menggunakan border-primary-500 */}
      <div className="flex flex-col items-center border-b border-primary-500/50 pb-4">
        {/* UBAH: Menggunakan warna primary */}
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center border-4 border-primary-200">
          <UserCircleIcon className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-xl font-bold mt-3">Admin</h2>
      </div>

      {/* Navigasi Sidebar */}
      <nav className="flex flex-col space-y-2 flex-grow overflow-y-auto pr-2 scrollbar-hide"> {/* Added flex-grow, overflow, scrollbar-hide */}
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <p
                className={`
                  block p-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer
                  text-center ${
                    isActive
                      ? /* UBAH: Menggunakan primary-600 */
                        "bg-primary-600 text-white shadow-lg"
                      : /* UBAH: Menggunakan neutral-200 dan hover:bg-primary-800 */
                        "text-neutral-200 hover:bg-primary-800"
                  }
                `}
              >
                {item.name}
              </p>
            </Link>
          );
        })}
      </nav>
       {/* Tombol Keluar (Dipindahkan ke bawah dan style disesuaikan) */}
       {/* UBAH: Menggunakan border-primary-500 */}
       <div className="pt-4 border-t border-primary-500/50 mt-auto"> {/* Added mt-auto */}
          {/* CATATAN: Warna red dipertahankan */}
          <button className="w-full p-3 text-center font-medium text-red-300 hover:bg-red-700/20 rounded-lg transition-colors">
            Keluar
          </button>
       </div>
    </aside>
  );
}

// --- KOMPONEN UTAMA ADMIN LAYOUT ---
export default function AdminLayout({ children }) {
  return (
    // UBAH: Menggunakan bg-neutral-100
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden"> {/* Added overflow-hidden */}
        {/* Sidebar Kiri */}
        <AdminSidebar />

        {/* Konten Utama */}
        {/* Added overflow-y-auto */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}