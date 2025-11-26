"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface"; 

// --- DUMMY DATA (Data Awal Chat) ---
const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Halo, selamat datang di layanan support RS. Ada yang bisa kami bantu?",
    sender: "admin",
    time: "08:00",
  },
  {
    id: 2,
    text: "Saya ingin bertanya jadwal dokter mata hari ini.",
    sender: "user",
    time: "08:05",
  },
  {
    id: 3,
    text: "Untuk Dokter Mata hari ini praktek pukul 09.00 - 12.00 WIB, Kak.",
    sender: "admin",
    time: "08:07",
  },
];

export default function UserChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Simulasi Load Awal ---
  useEffect(() => {
    // Simulasi loading sebentar saat halaman dibuka
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // --- 2. Fungsi Mengirim Pesan (Simulasi Lokal) ---
  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    setIsSending(true);

    // 1. Tambahkan pesan User ke list
    const userMsgId = Date.now();
    const newUserMessage = {
      id: userMsgId,
      text: text,
      sender: "user",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // 2. Simulasi "Sending..." delay dan Balasan Admin Otomatis
    setTimeout(() => {
      setIsSending(false);

      // Simulasi Admin membalas setelah 1.5 detik user mengirim pesan
      setTimeout(() => {
        const adminMsgId = Date.now() + 1;
        const autoReply = {
          id: adminMsgId,
          text: "Terima kasih atas pesannya. Admin kami akan segera merespons pertanyaan Anda.",
          sender: "admin",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, autoReply]);
      }, 1500);

    }, 500); // Delay tombol kirim
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
        {isLoading ? (
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
            isSending={isSending} 
          />
        )}
      </div>
    </div>
  );
}