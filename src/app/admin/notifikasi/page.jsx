"use client";

import { useState } from "react";
import {
  UserPlus,
  UploadCloud,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
// 1. Impor komponen reusable yang SAMA (PATH SUDAH DIPERBAIKI)
import DaftarNotifikasi from "../../../components/DaftarNotifikasi";

// 2. Data notifikasi (pura-pura) untuk ADMIN (DATANYA BEDA)
const initialAdminNotifications = [
  {
    id: 1,
    icon: UserPlus,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    title: "Reservasi baru masuk atas nama Syifa Maulida (Poli Jantung).",
    time: "5 menit lalu",
    isUnread: true,
  },
  {
    id: 2,
    icon: UploadCloud,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    title: "Pasien Dila Wahyu mengupload dokumen baru (Hasil Lab).",
    time: "20 menit lalu",
    isUnread: true,
  },
  {
    id: 3,
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-100",
    title: "Pesan baru dari 'Budi Santoso': 'Mohon cek jadwal.'",
    time: "45 menit lalu",
    isUnread: false,
  },
  {
    id: 4,
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    title: "Stok obat 'Paracetamol' di farmasi menipis.",
    time: "2 jam lalu",
    isUnread: false,
  },
];

// Ini adalah 'Halaman' (Page)
export default function AdminNotifikasiPage() {
  // 3. Logika (state) ada di Halaman
  const [notifications, setNotifications] = useState(initialAdminNotifications);

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, isUnread: false }))
    );
  };

  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isUnread: false } : n
      )
    );
    // Logika navigasi admin
    // cth: router.push('/admin/reservasi/' + id)
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // 4. Render komponen reusable yang SAMA
  return (
    <DaftarNotifikasi
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAllAsRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
}