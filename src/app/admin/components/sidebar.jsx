"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/solid"; // Menggunakan ikon standar

// Menu untuk Sidebar
const adminNavItems = [
  // FIX: Path href disesuaikan ke /admin/...
  { name: "Manajemen Dokter", href: "/admin/dokter" },
  { name: "Manajemen User", href: "/admin/users" },
  { name: "Manajemen Pasien", href: "/admin/pasien" },
  { name: "Manajemen Jadwal", href: "/admin/schedule" },
  { name: "Manajemen Rekam Medis", href: "/admin/rekam-medis" },
  { name: "Manajemen Antrian", href: "/admin/antrian" },
  { name: "Manajemen Reservasi", href: "/admin/reservasi" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // UBAH: Menggunakan bg-neutral-900 agar konsisten
    <aside className="w-64 bg-neutral-900 text-white shadow-xl flex flex-col p-4 space-y-6">
      {/* Info Admin */}
      {/* UBAH: Menggunakan border-primary-500/50 */}
      <div className="flex flex-col items-center border-b border-primary-500/50 pb-4">
        {/* UBAH: Menggunakan warna primary */}
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center border-4 border-primary-200">
          {/* Menggunakan ikon standar */}
          <UserCircleIcon className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-xl font-bold mt-3">Super Admin</h2>
      </div>

      {/* Navigasi Sidebar */}
      {/* Added flex-grow, overflow, scrollbar-hide */}
      <nav className="flex flex-col space-y-2 flex-grow overflow-y-auto pr-2 scrollbar-hide">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <p
                className={`
                  block p-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer
                  text-center ${ // text-center ditambahkan agar sama dengan layout sebelumnya
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
      {/* Tombol Keluar */}
       {/* UBAH: Dipindahkan ke bawah dengan border, style disesuaikan */}
       <div className="pt-4 border-t border-primary-500/50 mt-auto"> {/* Added mt-auto */}
          {/* CATATAN: Warna red dipertahankan */}
          <button className="w-full p-3 text-center font-medium text-red-300 hover:bg-red-700/20 rounded-lg transition-colors">
            Keluar
          </button>
       </div>
    </aside>
  );
}