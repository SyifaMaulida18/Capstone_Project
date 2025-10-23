"use client";

import React from "react";
import { LayoutDashboard, Bell, MessageSquare, User, LogOut } from "lucide-react";

export default function Header({ user }) {
  return (
    <div className="bg-[#003366] text-white shadow-xl">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold flex items-center">
          <LayoutDashboard className="w-6 h-6 mr-2" /> SiReS-RS
        </h1>

        {/* Navigasi Utilitas Kanan */}
        <div className="flex space-x-4 items-center">
          <a
            href="/dashboard/notifications"
            className="p-2 rounded-full hover:bg-indigo-600 transition duration-150 relative"
          >
            <Bell className="w-6 h-6" />
            {user.unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )}
          </a>
          <a
            href="/chat"
            className="p-2 rounded-full hover:bg-indigo-600 transition duration-150 relative"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
          </a>
          <div className="flex items-center space-x-2 border-l border-indigo-500 pl-4">
            <a
              href="/user/profile"
              className="flex items-center space-x-1 hover:text-indigo-200 transition duration-150"
            >
              <User className="w-6 h-6" />
              <span className="hidden sm:inline font-semibold">{user.name}</span>
            </a>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/login";
              }}
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
