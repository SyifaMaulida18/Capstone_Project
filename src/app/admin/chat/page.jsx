"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface"; // <-- Impor komponen

// --- DATA MOCKUP UNTUK ADMIN ---
const allConversations = {
  "1": {
    name: "Syifa Maulida",
    messages: [
      { id: 1, text: "Selamat pagi, Dok.", sender: "user", time: "09:00" },
      { id: 2, text: "Pagi, ada yang bisa dibantu?", sender: "admin", time: "09:01" },
    ],
  },
  "2": {
    name: "Dila Wahyu",
    messages: [
      { id: 1, text: "Saya mau konfirmasi reservasi.", sender: "user", time: "11:00" },
    ],
  },
  "3": {
    name: "Budi Santoso",
    messages: [
       { id: 1, text: "Hasil lab saya bagaimana?", sender: "user", time: "Kemarin" },
       { id: 2, text: "Sedang kami periksa.", sender: "admin", time: "Kemarin" },
       { id: 3, text: "Oke.", sender: "user", time: "Kemarin" },
    ],
  }
};
// ------------------------------

export default function AdminChatPage() {
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState("1"); // Chat yg aktif pertama
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeChatName, setActiveChatName] = useState("");

  // Efek untuk memuat data chat saat 'activeChatId' berubah
  useEffect(() => {
    if (activeChatId) {
      setActiveMessages(allConversations[activeChatId].messages);
      setActiveChatName(allConversations[activeChatId].name);
    }
  }, [activeChatId]);

  // Fungsi untuk mengirim pesan (dari Admin)
  const handleSendMessage = (text) => {
    const newMessage = {
      id: activeMessages.length + 1,
      text,
      sender: "admin", // Pengirim adalah 'admin'
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    
    // Update state lokal (di aplikasi nyata, ini dikirim ke DB)
    const updatedMessages = [...activeMessages, newMessage];
    setActiveMessages(updatedMessages);
    
    // Update data mockup (agar tetap ada saat ganti chat)
    allConversations[activeChatId].messages = updatedMessages;
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl h-[80vh] flex bg-white shadow-2xl rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* KOLOM 1: Daftar Kontak / Percakapan */}
        <div className="w-1/3 border-r border-neutral-200 flex flex-col">
          {/* Header Daftar Kontak */}
          <div className="p-4 border-b border-neutral-200 flex-shrink-0">
             <button
                onClick={() => router.back()}
                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 mb-2"
                title="Kembali ke Dashboard"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari pasien..."
                className="w-full border border-neutral-300 rounded-lg p-2 pl-9"
              />
              <Search className="absolute left-2.5 top-2.5 w-5 h-5 text-neutral-400" />
            </div>
          </div>
          
          {/* List Kontak */}
          <div className="flex-grow overflow-y-auto">
            {Object.keys(allConversations).map((id) => {
              const chat = allConversations[id];
              const isActive = id === activeChatId;
              const lastMessage = chat.messages[chat.messages.length - 1];
              
              return (
                <button
                  key={id}
                  onClick={() => setActiveChatId(id)}
                  className={`w-full text-left p-4 flex items-center gap-3 border-b border-neutral-100 ${isActive ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h3 className={`font-semibold ${isActive ? 'text-primary-700' : 'text-neutral-800'}`}>
                      {chat.name}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate">
                      {lastMessage.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* KOLOM 2: Jendela Chat Aktif */}
        <div className="w-2/3 flex flex-col">
          {activeChatId ? (
            <>
              {/* Header Chat Aktif */}
              <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-neutral-200">
                <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                    <User size={20} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-800">
                  {activeChatName}
                </h2>
              </div>
              
              {/* Render Komponen Chat Interface */}
              <ChatInterface
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                currentUserRole="admin" // <-- Role saat ini adalah 'admin'
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              Pilih percakapan untuk memulai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}