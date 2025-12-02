"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

export default function TopNav() {
  const navItems = [
    { name: "Beranda", href: "/admin/dashboard" },
    { name: "Manajemen Dokter", href: "/admin/dokter" },
    { name: "Manajemen Jadwal Dokter", href: "/admin/schedule" },
    // { name: "Manajemen Pasien", href: "/admin/pasien" },
    { name: "Manajemen Reservasi", href: "/admin/reservasi" },
    { name: "Manajemen Antrian", href: "/admin/antrian" },
    { name: "Manajemen Rekam Medis", href: "/admin/rekam-medis" },
  ];

  const pathname = usePathname();
  const router = useRouter();

  // 🔐 Tombol Logout
  const handleLogout = () => {
    if (window.confirm("Keluar dari akun admin?")) {
      localStorage.removeItem("token");
      router.push("/"); // redirect ke login/home
    }
  };

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex kiri = nav items, kanan = bell + logout */}
        <div className="flex items-center justify-between h-12 w-full">

          {/* ➤ NAV ITEMS (kiri) */}
          <div className="flex items-center space-x-6 text-sm overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link key={item.name} href={item.href}>
                  <p
                    className={`
                      font-medium cursor-pointer transition-colors duration-200
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
          
        </div>
      </div>
    </nav>
  );
}
