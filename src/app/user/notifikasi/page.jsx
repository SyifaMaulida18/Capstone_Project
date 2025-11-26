"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Info,
  AlertTriangle,
  Check,
  MailOpen
} from "lucide-react";

// --- DUMMY DATA (Simulasi Data Notifikasi) ---
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "success", // success | warning | info
    title: "Reservasi Dikonfirmasi",
    message: "Jadwal Anda dengan dr. Budi Santoso (Poli Jantung) pada 12 Agustus 2025 telah dikonfirmasi.",
    time: "15 menit lalu",
    isUnread: true,
  },
  {
    id: 2,
    type: "warning",
    title: "Perubahan Jadwal Dokter",
    message: "Mohon maaf, dr. Andi Pratama berhalangan hadir sore ini. Jadwal dialihkan ke dr. Siti.",
    time: "1 jam lalu",
    isUnread: true,
  },
  {
    id: 3,
    type: "info",
    title: "Balasan Pesan Admin",
    message: "Admin: 'Baik kak, untuk hasil lab bisa diambil di loket 2 ya.'",
    time: "3 jam lalu",
    isUnread: false,
  },
  {
    id: 4,
    type: "success",
    title: "Hasil Lab Tersedia",
    message: "Hasil pemeriksaan laboratorium Anda (No. Ref: LAB-2025-001) sudah dapat diunduh.",
    time: "1 hari lalu",
    isUnread: false,
  },
  {
    id: 5,
    type: "info",
    title: "Pengingat Kontrol",
    message: "Jangan lupa jadwal kontrol gigi Anda besok pagi pukul 09:00 WIB.",
    time: "2 hari lalu",
    isUnread: false,
  },
];

export default function NotifikasiPage() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'

  // Hitung jumlah belum dibaca
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // --- HANDLERS (Logika Frontend) ---

  // Tandai satu notifikasi sudah dibaca
  const handleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  // Tandai SEMUA sudah dibaca
  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isUnread: false }))
    );
  };

  // Hapus satu notifikasi
  const handleDelete = (id, e) => {
    e.stopPropagation(); // Mencegah trigger klik card (handleRead)
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Hapus semua notifikasi
  const handleClearAll = () => {
    // Cek window untuk menghindari error saat server-side rendering
    if (typeof window !== "undefined" && window.confirm("Hapus semua notifikasi?")) {
      setNotifications([]);
    }
  };

  // Filter notifikasi berdasarkan Tab
  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "unread") return n.isUnread;
    return true;
  });

  // Helper untuk Icon & Warna berdasarkan tipe notifikasi
  const getIconStyle = (type) => {
    switch (type) {
      case "success":
        return { icon: Calendar, bg: "bg-green-100", text: "text-green-600" };
      case "warning":
        return { icon: AlertTriangle, bg: "bg-amber-100", text: "text-amber-600" };
      case "info":
      default:
        return { icon: Info, bg: "bg-blue-100", text: "text-blue-600" };
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6">
      <div className="w-full max-w-3xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white hover:shadow-sm transition text-neutral-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                Notifikasi
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-sm text-neutral-500">Update terbaru aktivitas Anda</p>
            </div>
          </div>
          
          {/* Tombol Aksi Header */}
          <div className="flex gap-2">
             {unreadCount > 0 && (
                <button 
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
                    title="Tandai semua dibaca"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Baca Semua</span>
                </button>
             )}
             {notifications.length > 0 && (
                 <button 
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
                    title="Hapus semua"
                 >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Hapus Semua</span>
                 </button>
             )}
          </div>
        </div>

        {/* --- TABS FILTER --- */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200 pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all relative ${
              activeTab === "all"
                ? "text-blue-600 bg-white border-b-2 border-blue-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all relative ${
              activeTab === "unread"
                ? "text-blue-600 bg-white border-b-2 border-blue-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Belum Dibaca
          </button>
        </div>

        {/* --- LIST NOTIFIKASI --- */}
        <div className="space-y-3">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((item) => {
              const style = getIconStyle(item.type);
              const IconComponent = style.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleRead(item.id)}
                  className={`
                    relative group flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md
                    ${
                      item.isUnread
                        ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-100" // Style Belum Dibaca
                        : "bg-neutral-50/50 border-transparent hover:bg-white hover:border-neutral-200" // Style Sudah Dibaca
                    }
                  `}
                >
                  {/* Indikator Titik Merah (Unread) */}
                  {item.isUnread && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}

                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 ${style.bg} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${style.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pr-6">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-base font-bold ${item.isUnread ? 'text-neutral-900' : 'text-neutral-600'}`}>
                            {item.title}
                        </h3>
                    </div>
                    <p className={`text-sm mb-2 ${item.isUnread ? 'text-neutral-700 font-medium' : 'text-neutral-500'}`}>
                        {item.message}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                        </span>
                        
                        {/* Status Text (Opsional) */}
                        {!item.isUnread && (
                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                <Check className="w-3 h-3" /> Dibaca
                            </span>
                        )}
                    </div>
                  </div>

                  {/* Tombol Hapus (Muncul saat Hover) */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute bottom-4 right-4 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                    title="Hapus notifikasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            // --- EMPTY STATE ---
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
              <div className="bg-neutral-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                 {activeTab === 'unread' ? (
                     <MailOpen className="w-10 h-10 text-neutral-300" />
                 ) : (
                     <Bell className="w-10 h-10 text-neutral-300" />
                 )}
              </div>
              <h3 className="text-lg font-bold text-neutral-700">Tidak ada notifikasi</h3>
              <p className="text-neutral-500 text-sm mt-1">
                {activeTab === 'unread' 
                    ? "Semua notifikasi sudah Anda baca." 
                    : "Anda belum memiliki notifikasi apapun."}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}