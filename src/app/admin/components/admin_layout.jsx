"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from "../components/header"; 
import { UserCircleIcon } from '@heroicons/react/24/solid'; 

const adminNavItems = [
    { name: 'Manajemen Dokter', href: './dokter' },
    { name: 'Manajemen User', href: '/admin/users' },
    { name: 'Manajemen Pasien', href: '/admin/pasien' },
    { name: 'Manajemen Jadwal', href: '/admin/schedule'}, 
    { name: 'Manajemen Rekam Medis', href: '/admin/rekam-medis'},
    { name: 'Manajemen Antrian', href: '/admin/antrian'},
    { name: 'Manajemen Reservasi', href: '/admin/reservasi'},
];

function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-blue-500 text-white shadow-xl flex flex-col p-4 space-y-6">

            <div className="flex flex-col items-center border-b border-blueAdmin/80 pb-4">
                <div className="w-20 h-20 rounded-full bg-pink-400 flex items-center justify-center border-4 border-pink-300">
                    <UserCircleIcon className="h-16 w-16 text-white" /> 
                </div>
                
                <h2 className="text-xl font-bold mt-3">Super Admin</h2>
            </div>

            {/* Navigasi Sidebar */}
            <nav className="flex flex-col space-y-2">
                {adminNavItems.map((item) => {
                    // Cek apakah rute saat ini cocok dengan href
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <p 
                                className={`
                                    block p-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer 
                                    text-center ${isActive 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'hover:bg-blue-700 text-blue-100'
                                    }
                                `}
                            >
                                {item.name}
                            </p>
                        </Link>
                    );
                })}
                {/* Tombol Keluar */}
                <button className="mt-8 p-3 text-center font-medium text-red-300 hover:text-red-100 transition-colors">
                    Keluar
                </button>
            </nav>
        </aside>
    );
}


// --- KOMPONEN UTAMA ADMIN LAYOUT ---
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header (Notifikasi & Profil di atas) */}
      <Header /> 

      <div className="flex flex-1">
        {/* Sidebar Kiri - Navigasi Vertikal */}
        <AdminSidebar />

        {/* Konten Utama */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
