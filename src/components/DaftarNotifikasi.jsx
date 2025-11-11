"use client";

// 1. Ini adalah Komponen Reusable (Bisa Dipakai Ulang)
// Path file ini sekarang: src/components/DaftarNotifikasi.jsx

import { Bell, Check, ArrowLeft } from "lucide-react"; // <-- TAMBAHKAN ArrowLeft
import { useRouter } from "next/navigation"; // <-- TAMBAHKAN useRouter

// Komponen Halaman diubah menjadi Komponen 'DaftarNotifikasi'
export default function DaftarNotifikasi({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onNotificationClick,
}) {
  const router = useRouter(); // <-- TAMBAHKAN hook router

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header Halaman */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {/* --- TOMBOL KEMBALI DITAMBAHKAN --- */}
            <button
              onClick={() => router.back()} // <-- TAMBAHKAN onClick
              className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            {/* --- BATAS TAMBAHAN --- */}

            <Bell className="text-primary-600 w-7 h-7" />
            <h1 className="text-3xl font-semibold text-neutral-800">
              Notifikasi
            </h1>
          </div>
          {/* Tombol Tandai Semua Telah Dibaca */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              <Check size={16} />
              Tandai semua telah dibaca
            </button>
          )}
        </div>

        {/* Kontainer Kartu Notifikasi */}
        <div className="bg-white shadow-lg rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="flex flex-col divide-y divide-neutral-200">
            {/* Tampilkan notifikasi atau pesan kosong */}
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  icon={notif.icon}
                  color={notif.color}
                  bgColor={notif.bgColor}
                  title={notif.title}
                  time={notif.time}
                  isUnread={notif.isUnread}
                  onClick={() => onNotificationClick(notif.id)}
                />
              ))
            ) : (
              // Tampilan jika tidak ada notifikasi
              <div className="p-20 text-center">
                <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-700">
                  Tidak Ada Notifikasi
                </h3>
                <p className="text-sm text-neutral-500">
                  Semua notifikasi Anda akan muncul di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Bantuan untuk setiap item notifikasi
function NotificationItem({
  icon: Icon,
  color,
  bgColor,
  title,
  time,
  isUnread,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 flex items-start gap-4 transition-colors ${
        isUnread ? "bg-primary-50" : "bg-white"
      } hover:bg-neutral-100`}
    >
      {/* Ikon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgColor} ${color}`}
      >
        <Icon size={20} />
      </div>

      {/* Konten Teks */}
      <div className="flex-grow">
        <p className="text-sm text-neutral-700 leading-snug">{title}</p>
        <p
          className={`text-xs mt-1 ${
            isUnread ? "text-primary-600 font-medium" : "text-neutral-500"
          }`}
        >
          {time}
        </p>
      </div>

      {/* Tanda Belum Dibaca (Titik Biru) */}
      {isUnread && (
        <div className="flex-shrink-0 w-3 h-3 bg-primary-500 rounded-full mt-1.5"></div>
      )}
    </button>
  );
}