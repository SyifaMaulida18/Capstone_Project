"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // ⬅️ TAMBAH useRouter di sini
import Header from "./header";
import { UserCircleIcon } from "@heroicons/react/24/solid";

// --- UBAH: Path navigasi untuk Super Admin ---
const superAdminNavItems = [
  { name: "Manajemen Admin", href: "/superadmin/admins" },
  { name: "Manajemen User", href: "/superadmin/users" },
  { name: "Manajemen Poli", href: "/superadmin/polis" },
  { name: "Manajemen Dokter", href: "/superadmin/dokter" },
  { name: "Manajemen Jadwal Dokter", href: "/superadmin/schedule" },
  // { name: "Manajemen Pasien", href: "/superadmin/pasien" },
  { name: "Manajemen Reservasi", href: "/superadmin/reservasi" },
  { name: "Manajemen Antrian", href: "/superadmin/antrian" },
  { name: "Manajemen Rekam Medis", href: "/superadmin/rekam-medis" },
];

// --- UBAH: Nama komponen Sidebar ---
function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // ⬅️ INI WAJIB, BIAR router TEREDEFINISI

  const handleLogout = () => {
    // kalau kamu pakai token, bisa sekalian dihapus di sini
    // localStorage.removeItem("token");
    router.push("/"); // arahkan ke halaman home
  };

  return (
    <aside className="w-64 bg-neutral-900 text-white shadow-xl flex flex-col p-4 space-y-6">
      <div className="flex flex-col items-center border-b border-primary-500/50 pb-4">
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center border-4 border-primary-200">
          <UserCircleIcon className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-xl font-bold mt-3">Super Admin</h2>
      </div>

      <nav className="flex flex-col space-y-2 flex-grow overflow-y-auto pr-2 scrollbar-hide">
        {superAdminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <p
                className={`block p-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer text-center ${
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

// --- Layout Utama ---
export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <SuperAdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
