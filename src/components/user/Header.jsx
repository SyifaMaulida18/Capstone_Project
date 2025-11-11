"use client";

import React, { useState, useEffect } from "react"; // 1. Impor state & effect
import { useRouter } from "next/navigation"; // 2. Impor router
import api from "../../services/api"; // 3. Impor helper API (pastikan path alias '@' sudah benar)
import {
  LayoutDashboard,
  Bell,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";

export default function Header() {
  // 4. Hapus prop 'user', ganti dengan state internal
  const [userName, setUserName] = useState("Memuat...");
  const [notificationCount, setNotificationCount] = useState(0); // State untuk notifikasi
  const router = useRouter();

  // 5. useEffect untuk memuat data user dari localStorage saat komponen dimuat
  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    } else {
      setUserName("Tamu"); // Fallback jika tidak ada
    }

    // TODO: Nanti, Anda bisa fetch jumlah notifikasi dari API di sini
    // try {
    //   const res = await api.get("/notifications/count");
    //   setNotificationCount(res.data.count);
    // } catch (e) { console.error(e); }
  }, []); // [] = jalankan sekali saat komponen mount

  // 6. Buat fungsi logout yang benar
  const handleLogout = async () => {
    try {
      // Panggil API backend untuk membatalkan token
      await api.post("/logout");
    } catch (error) {
      console.error("Gagal logout di server:", error);
      // Tetap lanjutkan proses logout di client
    } finally {
      // Bersihkan semua data dari local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userID");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");

      // Arahkan ke halaman login
      router.push("/auth/login");
    }
  };

  return (
    <div className="bg-neutral-900 text-white shadow-xl">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold flex items-center">
          <LayoutDashboard className="w-6 h-6 mr-2" /> RSPB
        </h1>

        {/* Navigasi Utilitas Kanan */}
        <div className="flex space-x-4 items-center">
          <a
            href="/dashboard/notifications"
            className="p-2 rounded-full hover:bg-primary-600 transition duration-150 relative"
          >
            <Bell className="w-6 h-6" />
            {/* 7. Gunakan state notificationCount */}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </a>
          <a
            href="/chat"
            className="p-2 rounded-full hover:bg-primary-600 transition duration-150 relative"
          >
            <MessageSquare className="w-6 h-6" />
            {/* Asumsi ini juga menggunakan state yg sama */}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </a>
          <div className="flex items-center space-x-2 border-l border-primary-500 pl-4">
            <a
              href="/user/profile"
              className="flex items-center space-x-1 hover:text-primary-200 transition duration-150"
            >
              <User className="w-6 h-6" />
              {/* 8. Gunakan state userName */}
              <span className="hidden sm:inline font-semibold">{userName}</span>
            </a>
            <button
              onClick={handleLogout} // 9. Panggil fungsi handleLogout
              className="p-2 ml-2 hover:text-red-300 transition duration-150"
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
