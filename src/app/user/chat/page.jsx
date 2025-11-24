"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface"; 
import api from "../../../services/api"; // Pastikan path ini benar

// ID Admin tujuan chat (Misal: Admin Utama ID = 1)
// Nanti bisa dibuat dinamis jika ada fitur pilih admin
const TARGET_ADMIN_ID = 1; 

export default function UserChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Ref untuk interval polling agar bisa dibersihkan
  const pollingInterval = useRef(null);

  // --- 1. Fungsi Mengambil Pesan dari API ---
  const fetchMessages = async () => {
    try {
      // Panggil endpoint: GET /api/chat/{receiverType}/{receiverId}
      const response = await api.get(`/chat/admin/${TARGET_ADMIN_ID}`);
      
      if (response.data.success) {
        const rawMessages = response.data.data;

        // Format data dari Database Laravel ke Format UI React
        const formattedMessages = rawMessages.map((msg) => ({
          id: msg.id,
          text: msg.message,
          // Logika: Jika senderable_type mengandung 'User', maka itu 'user', selain itu 'admin'
          sender: msg.senderable_type.includes("User") ? "user" : "admin",
          time: new Date(msg.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. useEffect untuk Load Awal & Polling ---
  useEffect(() => {
    // Load pertama kali
    fetchMessages();

    // Set interval untuk mengecek pesan baru setiap 3 detik (Polling)
    pollingInterval.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    // Bersihkan interval saat komponen di-unmount (pindah halaman)
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // --- 3. Fungsi Mengirim Pesan ---
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    setIsSending(true);

    // Optimistic UI: Tampilkan pesan di layar sebelum sukses masuk DB (agar terasa cepat)
    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      text,
      sender: "user",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isPending: true, // Flag opsional untuk indikator loading
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Panggil endpoint: POST /api/chat/send
      await api.post("/chat/send", {
        receiver_type: "admin",
        receiver_id: TARGET_ADMIN_ID,
        message: text,
      });

      // Setelah sukses, refresh data dari server untuk sinkronisasi ID dan waktu server
      fetchMessages(); 
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      // Opsional: Beri notifikasi gagal atau hapus pesan dari UI
      alert("Gagal mengirim pesan. Silakan coba lagi.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl h-[700px] flex flex-col bg-white shadow-lg rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header Halaman Chat User */}
        <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-neutral-200 bg-white z-10">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <MessageSquare className="text-primary-600 w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">
              Chat with Admin
            </h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online Support
            </p>
          </div>
        </div>

        {/* Loading State Awal */}
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Memuat percakapan...</p>
          </div>
        ) : (
          /* Render Komponen Chat Interface */
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserRole="user"
            isSending={isSending} // Props tambahan jika ChatInterface mendukung loading state tombol kirim
          />
        )}
      </div>
    </div>
  );
}