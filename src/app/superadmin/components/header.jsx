"use client";

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

  // 🔐 Fungsi Logout
  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar dari akun?")) {
      localStorage.removeItem("token");
      router.push("/"); // redirect ke login/home
    }
  };

  return (
    <header className="flex justify-end items-center space-x-4 h-16 bg-primary-800 text-white px-8 shadow-md">
      <div className="flex items-center space-x-6">



        {/* 🔔 Notifikasi */}
        <div className="cursor-pointer hover:text-primary-200 transition-colors">
          <BellIcon className="h-7 w-7" />
        </div>

        {/* 💬 Pesan → diarahkan ke /admin/chat */}
        <Link
          href="/admin/chat"
          className="cursor-pointer hover:text-primary-200 transition-colors p-1 rounded-md"
          title="Pesan"
        >
          <ChatBubbleLeftIcon className="h-7 w-7" />
        </Link>

        {/* 👤 Profil Admin */}
        <Link
          href="/superadmin/dashboard"
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <UserCircleIcon className="h-9 w-9" />
          <span className="font-semibold text-lg">SuperAdmin</span>
        </Link>

      </div>
    </header>
  );
}
