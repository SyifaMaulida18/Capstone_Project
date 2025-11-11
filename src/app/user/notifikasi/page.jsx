"use client";

import { useState } from "react";
import {
  CalendarCheck,
  AlertCircle,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
// 1. Impor komponen reusable (PATH SUDAH DIPERBAIKI)
import DaftarNotifikasi from "../../../components/DaftarNotifikasi";

// 2. Data notifikasi (pura-pura) untuk USER
const initialUserNotifications = [
  {
    id: 1,
    icon: CalendarCheck,
    color: "text-green-600",
    bgColor: "bg-green-100",
    title: "Reservasi Anda untuk Poli Jantung (dr. Budi) telah dikonfirmasi.",
    time: "15 menit lalu",
    isUnread: true,
  },
  {
    id: 2,
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    title: "Pembaruan Jadwal: dr. Andi (Poli Kulit) hari ini tidak tersedia.",
    time: "1 jam lalu",
    isUnread: true,
  },
  {
    id: 3,
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    title: "Admin membalas pesan Anda: 'Baik, akan kami periksa.'",
    time: "3 jam lalu",
    isUnread: false,
  },
  {
    id: 4,
    icon: ClipboardList,
    color: "text-primary-600",
    bgColor: "bg-primary-50",
    title: "Hasil lab Anda sudah tersedia. Silakan cek di menu Riwayat.",
    time: "1 hari lalu",
    isUnread: false,
  },
];

// Ini adalah 'Halaman' (Page)
export default function UserNotifikasiPage() {
  // 3. Logika (state) ada di Halaman, bukan di Komponen
  const [notifications, setNotifications] = useState(initialUserNotifications);

  // Fungsi untuk menandai semua notifikasi telah dibaca
  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, isUnread: false }))
    );
  };

  // Logika saat notifikasi diklik (tandai 1 sbg 'read')
  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isUnread: false } : n
      )
    );
    // Di sini Anda juga bisa menambahkan logika navigasi
    // cth: router.push('/user/reservasi/detail/' + id)
  };

  // Hitung jumlah notifikasi yang belum dibaca
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // 4. Render komponen reusable & kirim data/fungsi sbg props
  return (
    <DaftarNotifikasi
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAllAsRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
}