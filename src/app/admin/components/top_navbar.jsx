"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const navItems = [
    { name: "Beranda", href: "/admin/dashboard" }, 
    // { name: "Manajemen User", href: "/admin/users" },
    { name: "Manajemen Dokter", href: "/admin/dokter" },
    { name: "Manajemen Jadwal Dokter", href: "/admin/schedule" },
    { name: "Manajemen Pasien", href: "/admin/pasien" },
    { name: "Manajemen Reservasi", href: "/admin/reservasi" },
    { name: "Manajemen Antrian", href: "/admin/antrian" },
    { name: "Manajemen Rekam Medis", href: "/admin/rekam-medis" },
  ];

  const pathname = usePathname();

  return (
    // UBAH: Menggunakan border-neutral-200
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-12 space-x-6 text-sm">
          {navItems.map((item) => {
            // Cek rute aktif (lebih sederhana sekarang karena path konsisten)
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <p
                  className={`
                    font-medium transition-colors duration-200 cursor-pointer
                    ${
                      isActive
                        ? /* UBAH: Menggunakan text-primary-600 dan border-primary-600 */
                          "text-primary-600 border-b-2 border-primary-600 font-semibold"
                        : /* UBAH: Menggunakan text-neutral-600 dan hover:text-neutral-900 */
                          "text-neutral-600 hover:text-neutral-900"
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
    </nav>
  );
}