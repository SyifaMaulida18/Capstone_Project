"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface"; // <-- Impor komponen

// Data Mockup untuk chat User
const initialUserMessages = [
  { id: 1, text: "Halo, saya mau tanya jadwal dokter Budi.", sender: "user", time: "10:30" },
  { id: 2, text: "Tentu, dr. Budi Santoso tersedia hari Senin & Rabu jam 09:00 - 12:00.", sender: "admin", time: "10:31" },
  { id: 3, text: "Baik, terima kasih.", sender: "user", time: "10:32" },
];

export default function UserChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(initialUserMessages);

  // Fungsi untuk mengirim pesan (dari User)
  const handleSendMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender: "user", // Pengirim adalah 'user'
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMessage]);

    // Simulasi balasan admin
    setTimeout(() => {
        const adminReply = {
            id: messages.length + 2,
            text: "Baik, pesan Anda kami terima. Admin akan segera merespon.",
            sender: "admin",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => [...prev, adminReply]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl h-[700px] flex flex-col bg-white shadow-lg rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header Halaman Chat User */}
        <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-neutral-200">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <MessageSquare className="text-primary-600 w-6 h-6" />
          <h1 className="text-xl font-semibold text-neutral-800">
            Chat with Admin
          </h1>
        </div>

        {/* Render Komponen Chat Interface */}
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserRole="user" // <-- Role saat ini adalah 'user'
        />
      </div>
    </div>
  );
}