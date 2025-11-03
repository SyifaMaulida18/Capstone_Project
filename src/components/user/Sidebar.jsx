import React from 'react';
import { User, LogOut, LayoutDashboard, History, Bell, Settings, Send, X } from "lucide-react";

// --- 1. Komponen NavItem (Item tunggal di Sidebar) ---
const NavItem = ({ icon: Icon, label, tab, activeTab, setActiveTab, isComplete, href = '#', setIsSidebarOpen }) => {
    
    // Logika untuk menangani klik navigasi
    const handleClick = (e) => {
        e.preventDefault();
        
        // Cek kelengkapan data sebelum Reservasi
        if (tab === 'reservasi' && !isComplete) {
            console.log("Aksi dicekal: Profil belum lengkap.");
            if (typeof window !== 'undefined') {
                alert(`⚠️ Mohon lengkapi data profil (KTP, KK, dll.) terlebih dahulu sebelum melanjutkan ke ${label}.`); 
            }
            setActiveTab('summary'); // Arahkan ke halaman profile summary/edit
            return;
        }

        // Jika mengarah ke Pengaturan Profil
        if (tab === 'summary') {
            setActiveTab('summary');
        } 
        
        // Tutup sidebar di mode mobile setelah memilih menu
        if (setIsSidebarOpen) {
            setIsSidebarOpen(false); 
        }

        // Simulasi routing untuk tab lain
        if (typeof window !== 'undefined' && href !== '#') {
            window.location.href = href;
        }
    };

    // Tentukan apakah item ini adalah tab aktif (termasuk saat mode 'complete' untuk edit)
    const isActive = activeTab === tab || (activeTab === 'complete' && tab === 'summary');

    return (
        <a
            href={href}
            onClick={handleClick}
            /* UBAH: Menggunakan 'primary-600', 'neutral-200', dan 'primary-800' */
            className={`flex items-center space-x-3 p-3 rounded-lg transition duration-150 cursor-pointer text-left w-full
                ${isActive 
                    ? 'bg-primary-600 font-bold shadow-md text-white' /* Status Aktif */
                    : 'text-neutral-200 hover:bg-primary-800'} /* Status Default & Hover */
                ${tab === 'reservasi' && !isComplete ? 'opacity-70 cursor-not-allowed' : ''}
            `}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </a>
    );
};

// --- 2. Komponen Sidebar Utama ---
export default function Sidebar({ activeTab, setActiveTab, profileData, isComplete, isSidebarOpen, setIsSidebarOpen }) {
    
    const profileInitial = profileData?.namaLengkap ? profileData.namaLengkap[0] : (profileData?.name ? profileData.name[0] : 'U');
    const profileName = profileData?.namaLengkap || profileData?.name || "Pengguna";
    const profileEmail = profileData?.email || "email@contoh.com";
    
    const menuItems = [
        { name: 'Dashboard Utama', icon: LayoutDashboard, tab: 'dashboard', href: "/user/dashboard" },
        { name: 'Notifikasi', icon: Bell, tab: 'notifications', href: "/dashboard/notifications" },
        { name: 'Riwayat Reservasi', icon: History, tab: 'history', href: "/dashboard/history" },
        { name: 'Pengaturan Profil', icon: Settings, tab: 'summary', href: "/profile" }, 
    ];

    // CSS untuk menyembunyikan scrollbar
    const scrollbarHideStyle = {
        scrollbarWidth: 'none', /* Firefox */
        WebkitOverflowScrolling: 'touch',
    };
    
    const scrollbarHidePseudo = `
        .sidebar-nav::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
    `;

    return (
        <>
            <style jsx>{scrollbarHidePseudo}</style>

            {/* Overlay untuk mobile saat sidebar terbuka */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
                /* UBAH: Menggunakan 'bg-neutral-900' agar konsisten dengan Header/Footer */
                w-64 bg-neutral-900 text-white flex flex-col p-4 md:p-6 rounded-t-xl md:rounded-l-xl md:rounded-tr-none shadow-2xl h-full md:min-h-full
            `}>
                
                {/* Tombol Tutup Sidebar (Mobile) */}
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 text-white md:hidden"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Profil */}
                {/* UBAH: Menggunakan 'border-primary-500' */}
                <div className="flex items-center space-x-3 mb-8 border-b border-primary-500 pb-5">
                    {/* UBAH: Menggunakan 'bg-primary-500' */}
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-xl font-bold text-white mb-0">
                        {profileInitial}
                    </div>
                    <div>
                        <p className="font-semibold text-lg">{profileName}</p>
                        {/* UBAH: Menggunakan 'text-primary-100' */}
                        <p className="text-sm text-primary-100">{profileEmail}</p>
                    </div>
                </div>

                {/* Navigasi Utama */}
                <div 
                    className="space-y-2 flex-grow overflow-y-auto pr-2 sidebar-nav"
                    style={scrollbarHideStyle}
                > 
                    {menuItems.map((item) => (
                        <NavItem
                            key={item.tab}
                            icon={item.icon}
                            label={item.name}
                            tab={item.tab}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isComplete={isComplete}
                            href={item.href}
                            setIsSidebarOpen={setIsSidebarOpen}
                        />
                    ))}

                    {/* UBAH: Menggunakan 'border-primary-500' dan 'text-primary-100' */}
                    <div className="pt-4 border-t border-primary-500 mt-2">
                        <h3 className="text-sm font-semibold text-primary-100 mb-1">Fitur Utama</h3>
                        <NavItem 
                            icon={Send} 
                            label="Mulai Reservasi" 
                            tab="reservasi" 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                            isComplete={isComplete} 
                            href="/dashboard/reservasi" 
                            setIsSidebarOpen={setIsSidebarOpen}
                        />
                    </div>
                </div>

                {/* Logout */}
                {/* UBAH: Menggunakan 'border-primary-500' */}
                <div className="pt-4 border-t border-primary-500 mt-auto">
                    <button
                        onClick={() => { 
                            if (typeof window !== 'undefined') {
                                setIsSidebarOpen(false); 
                                window.location.href = '/login'; 
                            }
                        }}
                        /* CATATAN: Warna 'red' dipertahankan (semantik) */
                        className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-300 hover:bg-red-700/70 transition duration-150"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </div>
        </>
    );
};