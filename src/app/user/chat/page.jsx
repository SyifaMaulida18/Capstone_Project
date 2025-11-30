"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface"; 
import api from "@/services/api";

export default function UserChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatMessages = (data) =>
    data.map((msg) => ({
      id: msg.chatId,
      text: msg.message,
      sender: msg.senderable_type.includes("User") ? "user" : "admin",
      time: new Date(msg.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  const fetchMessages = async () => {
    try {
      const response = await api.get("/chat/admin/0");

      if (response.data.success) {
        const list = response.data.data.data;
        setMessages(formatMessages(list));
      }
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setIsSending(true);

    try {
      await api.post("/chat/send", {
        receiver_type: "admin",
        receiver_id: 0,
        message: text,
      });

      fetchMessages();
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      alert("Gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* CSS Scrollbar (Auto Hide) */}
      <style>{`
        .custom-scroll-area *::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll-area *::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll-area *::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scroll-area:hover *::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
        }
        .custom-scroll-area * {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scroll-area:hover * {
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>

      {/* PERUBAHAN DI SINI:
          1. max-w-2xl diganti jadi max-w-6xl (supaya jauh lebih lebar)
          2. h-[85vh] diganti jadi h-[90vh] (supaya lebih tinggi sedikit, lebih immersive)
          3. md:h-[700px] dihapus agar tingginya dinamis mengikuti layar (90vh)
      */}
      <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-white shadow-xl rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-neutral-200 bg-white z-10 relative shadow-sm">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <MessageSquare className="text-primary-600 w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">Customer Service</h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online Support
            </p>
          </div>
        </div>

        {/* Area Konten Chat */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-neutral-50/30 custom-scroll-area">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 bg-white/80 z-20">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserRole="user"
              isSending={isSending}
            />
          )}
        </div>
      </div>
    </div>
  );
}