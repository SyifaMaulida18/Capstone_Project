"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import {
  LayoutDashboard,
  Bell,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";

export default function Header() {
  const [userName, setUserName] = useState("Memuat...");
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    } else {
      setUserName("Tamu");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Gagal logout di server:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userID");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
      router.push("/auth/login");
    }
  };

  return (
    /* UBAH: bg-white agar bersih, border bawah tipis agar terpisah rapi dari Navbar */
    <div className="bg-white text-neutral-800 border-b border-neutral-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo: Menggunakan Blue-600 agar senada dengan Dashboard */}
        <h1 className="text-2xl font-extrabold flex items-center text-blue-600">
          <LayoutDashboard className="w-7 h-7 mr-2" /> RSPB
        </h1>

        {/* Navigasi Utilitas Kanan */}
        <div className="flex space-x-3 items-center">
          {/* Tombol Notifikasi */}
          <a
            href="/user/notifikasi"
            className="p-2 rounded-full text-neutral-500 hover:bg-blue-50 hover:text-blue-600 transition duration-150 relative"
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </a>

          {/* Tombol Chat */}
          <a
            href="/user/chat"
            className="p-2 rounded-full text-neutral-500 hover:bg-blue-50 hover:text-blue-600 transition duration-150 relative"
          >
            <MessageSquare className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </a>

          {/* Profil & Logout */}
          <div className="flex items-center space-x-2 border-l border-neutral-200 pl-4">
            <a
              href="/user/profile"
              className="flex items-center space-x-2 text-neutral-600 hover:text-blue-600 transition duration-150"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline font-semibold text-sm">{userName}</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-2 ml-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition duration-150"
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