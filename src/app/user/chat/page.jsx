"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface"; 
import api from "@/services/api"; // Pastikan path ini benar

export default function UserChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- HELPER: Format Pesan dari Backend ke Frontend ---
  const formatMessages = (backendData) => {
    return backendData.map((msg) => ({
      id: msg.id || msg.chatId,
      text: msg.message,
      // Mapping: Jika senderable_type adalah User, berarti 'me'. Jika Admin, berarti 'admin'.
      sender: msg.senderable_type.includes("User") ? "user" : "admin",
      time: new Date(msg.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  };

  // --- 1. Fetch Pesan (Polling) ---
  const fetchMessages = async () => {
    try {
      // User selalu chat dengan Admin ID 0 (Sistem Shared Inbox)
      const response = await api.get("/chat/admin/0");
      if (response.data.success) {
        setMessages(formatMessages(response.data.data));
      }
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(); // Load pertama

    // Polling setiap 3 detik untuk cek balasan admin
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Fungsi Mengirim Pesan ---
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setIsSending(true);

    try {
      const payload = {
        receiver_type: "admin",
        receiver_id: 0, // Kirim ke "Sistem"
        message: text,
      };

      const response = await api.post("/chat/send", payload);

      if (response.data.success) {
        // Refresh pesan setelah mengirim
        fetchMessages();
      }
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      alert("Gagal mengirim pesan. Coba lagi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl h-[700px] flex flex-col bg-white shadow-lg rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
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
              Customer Service
            </h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online Support
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Memuat percakapan...</p>
          </div>
        ) : (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserRole="user" // Supaya bubble user ada di kanan
            isSending={isSending} 
          />
        )}
      </div>
    </div>
  );
}