"use client";

import { useState, useEffect } from "react";
// Tambahkan MessageSquare di dalam kurung kurawal
import { ArrowLeft, Search, User, Loader2, MessageSquare } from "lucide-react"; 
import { useRouter } from "next/navigation";
import ChatInterface from "../../../components/ChatInterface";
import api from "@/services/api";

export default function AdminChatPage() {
  const router = useRouter();
  
  const [contacts, setContacts] = useState([]); // List User
  const [activeChatId, setActiveChatId] = useState(null); // ID User yang sedang dibuka
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeChatName, setActiveChatName] = useState("");
  
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // --- 1. Fetch Daftar Kontak (User yang pernah chat) ---
  const fetchContacts = async () => {
    try {
      const response = await api.get("/chat/contacts");
      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetch contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Polling kontak tiap 5 detik (cek user baru chat)
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Fetch Isi Percakapan (Ketika Admin klik User) ---
  const fetchConversation = async (userId) => {
    if (!userId) return;
    try {
      // Ambil chat dengan tipe 'user' dan id specific
      const response = await api.get(`/chat/user/${userId}`);
      
      if (response.data.success) {
        const formatted = response.data.data.map((msg) => ({
          id: msg.id || msg.chatId,
          text: msg.message,
          // Jika tipe pengirim Admin = 'me' (kanan), User = 'user' (kiri)
          sender: msg.senderable_type.includes("Admin") ? "admin" : "user",
          time: new Date(msg.created_at).toLocaleTimeString("id-ID", {
             hour: "2-digit", minute: "2-digit" 
          }),
        }));
        setActiveMessages(formatted);
      }
    } catch (error) {
      console.error("Error fetch chat:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Efek ganti chat
  useEffect(() => {
    if (activeChatId) {
      setIsLoadingChat(true);
      fetchConversation(activeChatId);
      
      // Polling pesan aktif tiap 3 detik
      const interval = setInterval(() => {
        fetchConversation(activeChatId);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  // Handle Klik Kontak di Sidebar
  const handleContactClick = (contact) => {
    setActiveChatId(contact.id);
    setActiveChatName(contact.name);
  };

  // --- 3. Kirim Pesan (Admin ke User) ---
  const handleSendMessage = async (text) => {
    if(!activeChatId) return;

    try {
      const payload = {
        receiver_type: "user",
        receiver_id: activeChatId, // ID User yang sedang dibuka
        message: text,
      };

      await api.post("/chat/send", payload);
      
      // Refresh chat langsung
      fetchConversation(activeChatId);
      // Refresh list kontak (update last message)
      fetchContacts();

    } catch (error) {
      console.error("Gagal kirim:", error);
      alert("Gagal mengirim pesan.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl h-[80vh] flex bg-white shadow-2xl rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* KOLOM 1: Daftar Kontak */}
        <div className="w-1/3 border-r border-neutral-200 flex flex-col">
          {/* Header */}
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
            {isLoadingContacts ? (
                 <div className="flex justify-center p-4"><Loader2 className="animate-spin text-neutral-400"/></div>
            ) : contacts.length === 0 ? (
                 <div className="p-4 text-center text-neutral-500 text-sm">Belum ada pesan masuk.</div>
            ) : (
                contacts.map((contact) => {
                  const isActive = contact.id === activeChatId;
                  return (
                    <button
                      key={`${contact.type}-${contact.id}`} // Unique key
                      onClick={() => handleContactClick(contact)}
                      className={`w-full text-left p-4 flex items-center gap-3 border-b border-neutral-100 transition ${isActive ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center flex-shrink-0">
                        <User size={20} />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center">
                            <h3 className={`font-semibold ${isActive ? 'text-primary-700' : 'text-neutral-800'}`}>
                            {contact.name}
                            </h3>
                            <span className="text-xs text-neutral-400">
                                {new Date(contact.last_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 truncate">
                          {contact.last_message}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* KOLOM 2: Chat Interface */}
        <div className="w-2/3 flex flex-col">
          {activeChatId ? (
            <>
              {/* Header Chat */}
              <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-neutral-200 bg-neutral-50">
                <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-neutral-800">
                    {activeChatName}
                    </h2>
                    <p className="text-xs text-green-600">Active Now</p>
                </div>
              </div>
              
              {/* Pesan */}
              {isLoadingChat && activeMessages.length === 0 ? (
                   <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-neutral-400"/></div>
              ) : (
                  <ChatInterface
                    messages={activeMessages}
                    onSendMessage={handleSendMessage}
                    currentUserRole="admin" // Admin bubble di kanan
                  />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Pilih percakapan untuk melihat detail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}