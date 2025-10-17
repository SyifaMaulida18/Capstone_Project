"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Menu untuk Sidebar
const adminNavItems = [
    { name: 'Manajemen Dokter', href: '/dashboardadmin/doctors' },
    { name: 'Manajemen User', href: '/dashboardadmin/users' },
    { name: 'Manajemen Pasien', href: '/dashboardadmin/patients' },
    { name: 'Manajemen Jadwal', href: '/dashboardadmin/schedules' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-800 text-white shadow-xl flex flex-col p-4 space-y-6">
      
      {/* Info Admin (Sesuai Gambar) */}
      <div className="flex flex-col items-center border-b border-blue-700 pb-4">
        <img 
          src="https://placehold.co/80x80/FFB4C4/333333?text=Admin" 
          alt="Admin Profile" 
          className="w-20 h-20 rounded-full object-cover border-4 border-pink-400" 
        />
        <h2 className="text-xl font-bold mt-3">Super Admin</h2>
      </div>

      {/* Navigasi Sidebar */}
      <nav className="flex flex-col space-y-2">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <p 
                className={`
                  block p-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer 
                  ${isActive 
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
         <button className="mt-8 p-3 text-left font-medium text-red-300 hover:text-red-100 transition-colors">
            Keluar
         </button>
      </nav>
    </aside>
  );
}
