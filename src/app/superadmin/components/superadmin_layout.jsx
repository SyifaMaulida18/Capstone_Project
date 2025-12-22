"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Header from "./header";
import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// --- Path navigasi untuk Super Admin ---
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
  { name: "Manajemen Feedback", href: "/superadmin/feedback" },
];

// --- Sidebar Super Admin (responsive: drawer di mobile, fixed di desktop) ---
function SuperAdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // contoh kalau pakai token:
    // localStorage.removeItem("token");
    router.push("/");
    if (onClose) onClose();
  };

  return (
    <>
      {/* BACKDROP HP */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-primary-800 text-white shadow-xl
          flex flex-col p-4 space-y-6 transform transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:flex
        `}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between border-b border-primary-500/50 pb-4">
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center border-4 border-primary-200">
              <UserCircleIcon className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-xl font-bold mt-3 text-center">
              Super Admin
            </h2>
          </div>

          {/* Tombol close di HP */}
          <button
            className="md:hidden ml-2 p-1 rounded-full hover:bg-neutral-800"
            onClick={onClose}
            aria-label="Tutup sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col space-y-2 flex-grow overflow-y-auto pr-2 scrollbar-hide mt-2">
          {superAdminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // biar sidebar nutup setelah klik di HP
              >
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

        {/* Tombol logout di bawah (opsional) */}
      </aside>
    </>
  );
}

// --- Layout Utama ---
export default function SuperAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header atas (ikon bell, chat, profil, dll) */}
      <Header />

      {/* BAR MOBILE: tombol menu + judul */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg border border-neutral-700 hover:bg-neutral-800"
          aria-label="Buka menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <span className="font-semibold text-lg">Dashboard Super Admin</span>
        <div className="w-8" /> {/* spacer biar title tetap center */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: drawer di mobile, fixed di kiri di md+ */}
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Konten utama */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
