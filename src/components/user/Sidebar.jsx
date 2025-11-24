"use client";

import React from 'react';
import { LogOut, LayoutDashboard, History, Bell, Settings, X } from "lucide-react"; // Ikon Send dihapus

// --- Komponen NavItem (Tidak Berubah) ---
const NavItem = ({ icon: Icon, label, tab, activeTab, setActiveTab, isComplete, href = '#', setIsSidebarOpen }) => {
    
    const handleClick = (e) => {
        e.preventDefault();
        
        if (tab === 'reservasi' && !isComplete) {
            console.warn(`⚠️ Mohon lengkapi data profil terlebih dahulu.`); 
            if (setActiveTab) setActiveTab('summary');
            return;
        }

        if (tab === 'summary' && setActiveTab) {
            setActiveTab('summary');
        } 
        
        if (setIsSidebarOpen) {
            setIsSidebarOpen(false); 
        }

        if (typeof window !== 'undefined' && href !== '#') {
           if (window.location.pathname !== href) {
              window.location.href = href;
           }
        }
    };

    const isActive = activeTab === tab || (activeTab === 'complete' && tab === 'summary');

    return (
        <a
            href={href}
            onClick={handleClick}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-left w-full mb-1
                ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-neutral-600 hover:bg-blue-50 hover:text-blue-700'} 
                ${tab === 'reservasi' && !isComplete ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-blue-600'}`} />
            <span className="font-semibold text-sm">{label}</span>
        </a>
    );
};

// --- Komponen Sidebar Utama ---
export default function Sidebar({ activeTab, setActiveTab, profileData, isComplete, isSidebarOpen, setIsSidebarOpen }) {
    
    const profileInitial = profileData?.namaLengkap ? profileData.namaLengkap[0] : (profileData?.name ? profileData.name[0] : 'U');
    const profileName = profileData?.namaLengkap || profileData?.name || "Pengguna";
    const profileEmail = profileData?.email || "email@contoh.com";
    
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard', href: "/user/dashboard" },
        { name: 'Notifikasi', icon: Bell, tab: 'notifications', href: "/user/notifikasi" },
        { name: 'Riwayat', icon: History, tab: 'history', href: "/user/riwayat" },
        { name: 'Profil Saya', icon: Settings, tab: 'summary', href: "/user/profile" },
    ];

    const scrollbarHidePseudo = `
        .sidebar-nav::-webkit-scrollbar { display: none; }
    `;

    return (
        <>
            <style jsx>{scrollbarHidePseudo}</style>

            {/* Overlay Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-neutral-800/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
                w-72 bg-white border-r border-neutral-100 flex flex-col p-6 h-full md:h-auto
            `}>
                
                {/* Tombol Tutup (Mobile) */}
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800 md:hidden"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Profil Sidebar */}
                <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-neutral-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-700 shadow-sm">
                        {profileInitial}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-neutral-800 truncate">{profileName}</p>
                        <p className="text-xs text-neutral-500 truncate">{profileEmail}</p>
                    </div>
                </div>

                {/* Navigasi */}
                <div className="space-y-1 flex-grow overflow-y-auto sidebar-nav"> 
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 px-3">Menu Utama</p>
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
                    
                    {/* Bagian "Layanan" (Buat Reservasi) TELAH DIHAPUS */}
                </div>

                {/* Logout */}
                <div className="pt-4 border-t border-neutral-100 mt-auto">
                    <button
                        onClick={() => { 
                            if (typeof window !== 'undefined') {
                                setIsSidebarOpen(false); 
                                window.location.href = '/auth/login'; 
                            }
                        }}
                        className="flex items-center space-x-3 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold text-sm">Keluar Aplikasi</span>
                    </button>
                </div>
            </div>
        </>
    );
};