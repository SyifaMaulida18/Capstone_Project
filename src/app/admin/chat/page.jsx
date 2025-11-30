"use client";

import api from "@/services/api";
import { ArrowLeft, Loader2, MessageSquare, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatInterface from "../../../components/ChatInterface";

export default function AdminChatPage() {
  const router = useRouter();
  
  const [contacts, setContacts] = useState([]); // List User
  const [activeChatId, setActiveChatId] = useState(null); // ID User yang sedang dibuka
  const [activeChatName, setActiveChatName] = useState("");
  const [activeMessages, setActiveMessages] = useState([]);
  
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // --- 1. Helper: Cek Status Unread di Frontend ---
  const checkUnreadStatus = (contactId, lastMessageTime) => {
    if (!lastMessageTime) return false;
    
    // Ambil waktu terakhir dibaca dari Local Storage
    const lastReadTime = localStorage.getItem(`chat_last_read_${contactId}`);
    
    // Jika belum pernah dibuka, anggap unread
    if (!lastReadTime) return true;

    // Bandingkan waktu: Jika pesan API > pesan disimpan, berarti unread
    return new Date(lastMessageTime) > new Date(lastReadTime);
  };

  // --- 2. Fetch Daftar Kontak ---
  const fetchContacts = async () => {
    try {
      const response = await api.get("/admin/chat/contacts");
      if (response.data.success) {
        const rawContacts = response.data.data;

        // Map data untuk menambahkan flag 'isUnread' berdasarkan Local Storage
        const processedContacts = rawContacts.map((contact) => ({
          ...contact,
          isUnread: checkUnreadStatus(contact.contact_id, contact.time),
        }));

        setContacts(processedContacts);
      }
    } catch (error) {
      console.error("Error fetch contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Polling kontak tiap 5 detik
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 3. Fetch Isi Percakapan ---
  const fetchConversation = async (userId) => {
    if (!userId) return;
    try {
      const response = await api.get(`/admin/chat/user/${userId}`);
      
      if (response.data.success) {
        const messageData = response.data.data.data || []; 

        const formatted = messageData.map((msg) => ({
          id: msg.id, 
          text: msg.message,
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

  // Efek saat memilih kontak (Polling Chat Aktif)
  useEffect(() => {
    if (activeChatId) {
      setIsLoadingChat(true);
      fetchConversation(activeChatId);
      
      const interval = setInterval(() => {
        const fetchSilent = async () => {
            try {
                const response = await api.get(`/admin/chat/user/${activeChatId}`);
                if (response.data.success) {
                    const messageData = response.data.data.data || [];
                    const formatted = messageData.map((msg) => ({
                        id: msg.id, 
                        text: msg.message,
                        sender: msg.senderable_type.includes("Admin") ? "admin" : "user",
                        time: new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    }));
                    setActiveMessages(formatted);
                }
            } catch (err) { console.error(err); }
        };
        fetchSilent();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  // --- 4. Handle Klik Kontak (MODIFIKASI: Update Status Read) ---
  const handleContactClick = (contact) => {
    if (activeChatId === contact.contact_id) return;

    setActiveChatId(contact.contact_id);
    setActiveChatName(contact.name);

    // LOGIKA BARU: Simpan waktu pesan terakhir ke Local Storage saat diklik
    // Ini menandakan pesan sampai detik ini sudah "dibaca"
    if (contact.time) {
      localStorage.setItem(`chat_last_read_${contact.contact_id}`, contact.time);
    }

    // Update state contacts secara manual agar titik merah hilang instan (tanpa nunggu polling)
    setContacts((prevContacts) => 
      prevContacts.map((c) => 
        c.contact_id === contact.contact_id ? { ...c, isUnread: false } : c
      )
    );
  };

  // --- 5. Kirim Pesan ---
  const handleSendMessage = async (text) => {
    if(!activeChatId || !text.trim()) return;
    setIsSending(true);

    try {
      const payload = {
        receiver_id: activeChatId,
        message: text,
      };

      await api.post("/admin/chat/send", payload);
      
      // Update juga last read admin agar chat sendiri tidak dianggap unread
      const nowISO = new Date().toISOString(); 
      localStorage.setItem(`chat_last_read_${activeChatId}`, nowISO);

      await fetchConversation(activeChatId);
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
      
      {/* --- INI STYLE SCROLLBAR YANG DISAMAKAN DENGAN USER --- */}
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

      <div className="w-full max-w-6xl h-[85vh] flex bg-white shadow-2xl rounded-2xl border border-neutral-200 overflow-hidden">
        
        {/* KOLOM 1: Sidebar Daftar Kontak */}
        <div className="w-1/3 min-w-[300px] border-r border-neutral-200 flex flex-col bg-white">
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
          
          {/* Scroll Area Sidebar */}
          <div className="flex-grow overflow-y-auto custom-scroll-area">
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
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 
                          ${isActive ? 'bg-blue-200 text-blue-700' : 'bg-neutral-200 text-neutral-500'}`}>
                          <User size={24} />
                        </div>
                        
                        {/* INDIKATOR TITIK MERAH (UNREAD) */}
                        {contact.isUnread && !isActive && (
                            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1 -translate-y-1"></span>
                        )}
                      </div>

                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`font-semibold truncate ${isActive ? 'text-blue-900' : 'text-neutral-800'}`}>
                            {contact.name}
                            </h3>
                            <span className={`text-xs flex-shrink-0 ml-2 ${contact.isUnread ? 'text-green-600 font-bold' : 'text-neutral-400'}`}>
                                {contact.time ? new Date(contact.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                        </div>
                        <p className={`text-sm truncate mt-1 ${
                            isActive ? 'text-blue-700/70' : 
                            contact.isUnread ? 'text-neutral-800 font-medium' : 'text-neutral-500'
                        }`}>
                          {contact.last_message || "File/Gambar..."}
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
              
              {/* Scroll Area Chat */}
              <div className="flex-1 overflow-hidden relative custom-scroll-area">
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