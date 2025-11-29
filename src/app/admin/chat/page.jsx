"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, User, Loader2, MessageSquare } from "lucide-react"; 
import { useRouter } from "next/navigation";
// Pastikan path component ini benar sesuai struktur folder projectmu
import ChatInterface from "../../../components/ChatInterface"; 
import api from "@/services/api";

export default function AdminChatPage() {
  const router = useRouter();
  
  const [contacts, setContacts] = useState([]); // List User
  const [activeChatId, setActiveChatId] = useState(null); // ID User yang sedang dibuka
  const [activeChatName, setActiveChatName] = useState("");
  const [activeMessages, setActiveMessages] = useState([]);
  
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // --- 1. Fetch Daftar Kontak ---
  const fetchContacts = async () => {
    try {
      const response = await api.get("/admin/chat/contacts");
      if (response.data.success) {
        // Backend mengembalikan array di response.data.data
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
    // Polling kontak tiap 5 detik untuk cek pesan baru dari user lain
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Fetch Isi Percakapan ---
  const fetchConversation = async (userId) => {
    if (!userId) return;
    try {
      // Endpoint: /admin/chat/user/{userId}
      const response = await api.get(`/admin/chat/user/${userId}`);
      
      if (response.data.success) {
        // PERHATIKAN: Backend menggunakan paginate(), jadi array ada di .data.data
        // Jika backend diubah menjadi get(), maka cukup response.data.data
        const messageData = response.data.data.data || response.data.data; 

        const formatted = messageData.map((msg) => ({
          id: msg.chatId, // Backend menggunakan 'chatId' sebagai primary key
          text: msg.message,
          // Logika: Jika sender type mengandung 'Admin', berarti 'me' (kanan)
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

  // Efek saat memilih kontak
  useEffect(() => {
    if (activeChatId) {
      setIsLoadingChat(true);
      fetchConversation(activeChatId);
      
      // Polling pesan aktif tiap 3 detik (Realtime sederhana)
      const interval = setInterval(() => {
        fetchConversation(activeChatId);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  // Handle Klik Kontak di Sidebar
  const handleContactClick = (contact) => {
    // Backend mengirim key 'contact_id', bukan 'id'
    if (activeChatId === contact.contact_id) return;

    setActiveChatId(contact.contact_id);
    setActiveChatName(contact.name);
  };

  // --- 3. Kirim Pesan (Admin ke User) ---
  const handleSendMessage = async (text) => {
    if(!activeChatId || !text.trim()) return;
    setIsSending(true);

    try {
      const payload = {
        receiver_id: activeChatId, // Backend perlu receiver_id
        message: text,
      };

      await api.post("/admin/chat/send", payload);
      
      // Refresh chat agar pesan muncul
      await fetchConversation(activeChatId);
      // Refresh list kontak agar "Last message" terupdate
      fetchContacts();

    } catch (error) {
      console.error("Gagal kirim:", error);
      alert("Gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl h-[85vh] flex bg-white shadow-2xl rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* KOLOM 1: Sidebar Daftar Kontak */}
        <div className="w-1/3 min-w-[300px] border-r border-neutral-200 flex flex-col bg-white">
          {/* Header Sidebar */}
          <div className="p-4 border-b border-neutral-200 flex-shrink-0 bg-neutral-50">
             <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200 transition"
                    title="Kembali"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-bold text-lg text-neutral-700">Inbox Pesan</h1>
             </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari pasien..."
                className="w-full border border-neutral-300 rounded-lg p-2 pl-9 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <Search className="absolute left-2.5 top-2.5 w-5 h-5 text-neutral-400" />
            </div>
          </div>
          
          {/* List Kontak */}
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {isLoadingContacts ? (
                 <div className="flex justify-center p-8"><Loader2 className="animate-spin text-neutral-400 w-8 h-8"/></div>
            ) : contacts.length === 0 ? (
                 <div className="p-8 text-center text-neutral-500 text-sm flex flex-col items-center">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-20"/>
                    Belum ada pesan masuk.
                 </div>
            ) : (
                contacts.map((contact) => {
                  const isActive = contact.contact_id === activeChatId;
                  return (
                    <button
                      key={contact.contact_id} 
                      onClick={() => handleContactClick(contact)}
                      className={`w-full text-left p-4 flex items-center gap-3 border-b border-neutral-100 transition duration-200 
                        ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-neutral-50 border-l-4 border-l-transparent'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 
                        ${isActive ? 'bg-blue-200 text-blue-700' : 'bg-neutral-200 text-neutral-500'}`}>
                        <User size={24} />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`font-semibold truncate ${isActive ? 'text-blue-900' : 'text-neutral-800'}`}>
                            {contact.name}
                            </h3>
                            <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                                {contact.time ? new Date(contact.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                        </div>
                        <p className={`text-sm truncate mt-1 ${isActive ? 'text-blue-700/70' : 'text-neutral-500'}`}>
                          {contact.last_message || "Gambar/File..."}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* KOLOM 2: Chat Interface */}
        <div className="w-2/3 flex flex-col bg-neutral-50/50">
          {activeChatId ? (
            <>
              {/* Header Chat Aktif */}
              <div className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-neutral-200 bg-white shadow-sm z-10">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-neutral-800">
                    {activeChatName}
                    </h2>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-xs text-neutral-500">Online</p>
                    </div>
                </div>
              </div>
              
              {/* Area Chat */}
              <div className="flex-1 overflow-hidden relative">
                  {isLoadingChat && activeMessages.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                            <Loader2 className="animate-spin text-blue-600 w-8 h-8"/>
                        </div>
                  ) : (
                      <ChatInterface
                        messages={activeMessages}
                        onSendMessage={handleSendMessage}
                        currentUserRole="admin" 
                        isSending={isSending}
                      />
                  )}
              </div>
            </>
          ) : (
            // State Kosong (Belum pilih kontak)
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 bg-neutral-50">
              <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-12 h-12 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-600">Admin Support</h3>
              <p className="max-w-xs text-center mt-2 text-neutral-500">Pilih salah satu percakapan dari daftar di sebelah kiri untuk mulai membalas pesan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}