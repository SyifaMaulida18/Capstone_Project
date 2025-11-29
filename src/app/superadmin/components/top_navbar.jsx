"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function TopNav() {
  const navItems = [
    { name: "Beranda", href: "/superadmin/dashboard" },
    { name: "Manajemen Admin", href: "/superadmin/admins" },
    { name: "Manajemen User", href: "/superadmin/users" },
    { name: "Manajemen Poli", href: "/superadmin/polis" },
    { name: "Manajemen Dokter", href: "/superadmin/dokter" },
    { name: "Manajemen Jadwal Dokter", href: "/superadmin/schedule" },
    { name: "Manajemen Reservasi", href: "/superadmin/reservasi" },
    { name: "Manajemen Antrian", href: "/superadmin/antrian" },
    { name: "Manajemen Rekam Medis", href: "/superadmin/rekam-medis" },
  ];

  const pathname = usePathname();
  const router = useRouter();

  // 🔐 Logout Function
  const handleLogout = () => {
    if (window.confirm("Apakah kamu yakin ingin keluar?")) {
      localStorage.removeItem("token");
      router.push("/"); // redirect ke halaman login/home
    }
  };

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 w-full">

          {/* LEFT SIDE: Navigasi Horizontal */}
          <div className="flex items-center space-x-6 text-sm overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <p
                    className={`
                      font-medium transition-colors duration-200 cursor-pointer
                      ${
                        isActive
                          ? "text-primary-600 border-b-2 border-primary-600 font-semibold"
                          : "text-neutral-600 hover:text-neutral-900"
                      }
                      h-full flex items-center
                    `}
                  >
                    {item.name}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE: Bell + Logout Button */}
          <div className="flex items-center space-x-4 ml-4 flex-shrink-0">

            {/* Bell Icon */}
            <button
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="Notifikasi"
            >
              <BellIcon className="h-6 w-6 text-neutral-600" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium p-2 rounded-md hover:bg-red-50 transition-colors"
              title="Keluar"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
