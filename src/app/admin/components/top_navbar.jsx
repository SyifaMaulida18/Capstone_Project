"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Diperlukan untuk menandai item aktif

export default function TopNav() {
  const navItems = [
    { name: 'Beranda', href: '/dashboardadmin' },
    { name: 'Manajemen User', href: '/dashboardadmin/users' },
    { name: 'Manajemen Poli & Dokter', href: '/dashboardadmin/poli' },
    { name: 'Manajemen Reservasi', href: '/dashboardadmin/reservasi' },
    { name: 'Riwayat Reservasi', href: '/dashboardadmin/riwayat' },
  ];

  // Gunakan usePathname, yang sekarang diizinkan karena 'use client'
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-12 space-x-6 text-sm">
          {navItems.map((item) => {
            // Menentukan apakah item ini adalah rute aktif saat ini
            // Kita harus menyesuaikan rute aktif, karena rute utama di sini adalah /dashboardadmin
            const isActive = pathname === item.href || (item.href === '/dashboardadmin' && pathname === '/');

            return (
              <Link key={item.name} href={item.href}>
                <p 
                  className={`
                    font-medium transition-colors duration-200 cursor-pointer 
                    ${isActive 
                      ? 'text-gray-900 border-b-2 border-black font-semibold' 
                      : 'text-gray-500 hover:text-gray-700'
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
