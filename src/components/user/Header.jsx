"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import komponen Image dari Next.js
import api from "../../services/api";
import {
  Bell,
  MessageSquare,
  User,
  LogOut,
  // LayoutDashboard dihapus karena sudah diganti image
} from "lucide-react";

export default function Header() {
  const [userName, setUserName] = useState("Memuat...");
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserName(userObj.name || "User");
      } catch (error) {
        console.error("Gagal parsing data user", error);
        setUserName("Tamu");
      }
    } else {
      setUserName("Tamu");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout-user");
    } catch (error) {
      console.error("Gagal logout di server:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth/login");
    }
  };

  return (
    <div className="bg-white text-neutral-800 border-b border-neutral-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* --- BAGIAN LOGO DIGANTI DI SINI --- */}
        {/* Menggunakan komponen Image Next.js untuk memuat SVG dari public/images/ */}
        <div className="flex items-center cursor-default relative h-10 w-40">
           <Image
            src="/images/logo.svg" // Path absolut dari root public folder
            alt="RSPB Logo"
            fill // Mengisi container parent (div h-10 w-40)
            style={{ objectFit: 'contain', objectPosition: 'left' }} // Agar logo tidak terpotong dan rata kiri
            priority // Prioritas loading tinggi untuk LCP (Largest Contentful Paint)
          />
        </div>
        {/* ----------------------------------- */}

        {/* Navigasi Utilitas Kanan */}
        <div className="flex space-x-3 items-center">
          {/* Tombol Notifikasi
          <button
            type="button"
            className="p-2 rounded-full text-neutral-500 hover:bg-blue-50 hover:text-blue-600 transition duration-150 relative focus:outline-none"
            onClick={() => router.push("/user/notifikasi")}
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </button> */}

          {/* Tombol Chat */}
          <button
            type="button"
            className="p-2 rounded-full text-neutral-500 hover:bg-blue-50 hover:text-blue-600 transition duration-150 relative focus:outline-none"
            onClick={() => router.push("/user/chat")}
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Profil & Logout */}
          <div className="flex items-center space-x-2 border-l border-neutral-200 pl-4">
            <button
              onClick={() => router.push("/user/profile")}
              className="flex items-center space-x-2 text-neutral-600 hover:text-blue-600 transition duration-150 focus:outline-none"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline font-semibold text-sm">
                {userName}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 ml-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition duration-150 focus:outline-none"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}