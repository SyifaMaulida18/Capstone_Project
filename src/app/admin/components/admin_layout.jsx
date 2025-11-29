"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "../components/header";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Bars3Icon } from "@heroicons/react/24/outline";

const adminNavItems = [
  { name: "Manajemen Jadwal Dokter", href: "/admin/schedule" },
  { name: "Manajemen User", href: "/admin/users" },
  { name: "Manajemen Reservasi", href: "/admin/reservasi" },
  { name: "Manajemen Antrian", href: "/admin/antrian" },
  { name: "Manajemen Rekam Medis", href: "/admin/rekam-medis" },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-primary-800 text-white shadow-xl flex flex-col p-4 space-y-6 h-full">
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
    </aside>
  );
}

/* ============================
      ADMIN LAYOUT RESPONSIVE
============================= */

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar overlay (MOBILE) */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 md:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar />
        </div>

        {/* Backdrop (klik untuk tutup) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar DESKTOP */}
        <div className="hidden md:flex md:shrink-0">
          <AdminSidebar />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 py-4 sm:p-6 lg:p-8 overflow-y-auto relative">
          {/* Tombol buka sidebar (MOBILE) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 mb-4 shadow-md"
            aria-label="Buka menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Konten sebenarnya */}
          <div className="md:mt-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
