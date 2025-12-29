"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");

  // Ambil data admin dari localStorage saat komponen mount
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin);
        // Sesuaikan dengan field yang dikirim backend, di contoh: "Nama"
        if (parsed?.Nama) {
          setAdminName(parsed.Nama);
        } else if (parsed?.name) {
          setAdminName(parsed.name);
        }
      }
    } catch (error) {
      console.error("Gagal membaca admin dari localStorage:", error);
    }
  }, []);

  // 🔐 Fungsi Logout
  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar dari akun?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin"); // hapus data admin juga
      router.push("/"); // redirect ke login/home
    }
  };

  return (
    <header className="flex justify-end items-center space-x-4 h-16 bg-primary-800 text-white px-8 shadow-md">
      <div className="flex items-center space-x-6">
        {/* 🚪 Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-red-600/20 text-red-300 hover:text-red-400 transition-colors font-medium"
          title="Keluar"
        >
          <ArrowRightOnRectangleIcon className="h-7 w-7" />
          <span className="hidden sm:inline text-base">Keluar</span>
        </button>

        {/* 🔔 Notifikasi
        <div className="cursor-pointer hover:text-primary-200 transition-colors">
          <BellIcon className="h-7 w-7" />
        </div> */}

        {/* 💬 Pesan → diarahkan ke /admin/chat */}
        <Link
          href="/admin/chat"
          className="cursor-pointer hover:text-primary-200 transition-colors p-1 rounded-md"
          title="Pesan"
        >
          <ChatBubbleLeftIcon className="h-7 w-7" />
        </Link>

        {/* 👤 Profil Admin (non-clickable) */}
        <div className="flex items-center space-x-3 p-2 opacity-60 select-none cursor-default">
          <UserCircleIcon className="h-9 w-9" />
          <span className="font-semibold text-lg">{adminName}</span>
        </div>
      </div>
    </header>
  );
}
