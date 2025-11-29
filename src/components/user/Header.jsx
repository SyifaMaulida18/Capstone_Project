"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api"; // Pastikan path ini benar
import {
  LayoutDashboard,
  Bell,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";

export default function Header() {
  const [userName, setUserName] = useState("Memuat...");
  const [notificationCount, setNotificationCount] = useState(0); // Bisa dihubungkan ke endpoint notifikasi nanti
  const router = useRouter();

  useEffect(() => {
    // Ambil data user yang disimpan saat Login
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        // Backend Laravel mengirim field 'name', bukan 'userName'
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
      // PENTING: Gunakan endpoint '/logout-user' sesuai route api.php untuk Pasien
      await api.post("/logout-user");
    } catch (error) {
      console.error("Gagal logout di server:", error);
      // Tetap lanjutkan proses di client meskipun server error (misal token expired)
    } finally {
      // Hapus semua data sesi di client
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Hapus object user utama

      // Hapus item lain jika ada (opsional, amannya clear semua)
      // localStorage.clear();

      // Redirect ke halaman login
      router.push("/auth/login");
    }
  };

  return (
    <div className="bg-white text-neutral-800 border-b border-neutral-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo: Menggunakan Blue-600 agar senada dengan Dashboard */}
        <h1 className="text-2xl font-extrabold flex items-center text-blue-600 cursor-default">
          <LayoutDashboard className="w-7 h-7 mr-2" /> RSPB
        </h1>

        {/* Navigasi Utilitas Kanan */}
        <div className="flex space-x-3 items-center">
          {/* Tombol Notifikasi */}
          <button
            type="button"
            className="p-2 rounded-full text-neutral-500 hover:bg-blue-50 hover:text-blue-600 transition duration-150 relative focus:outline-none"
            onClick={() => router.push("/user/notifikasi")}
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </button>

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
      </div>x
    </div>
  );
}
