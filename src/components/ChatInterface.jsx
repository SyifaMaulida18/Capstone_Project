"use client";

import { Send, User, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/**
 * Komponen ini HANYA berisi jendela pesan dan input.
 * Header dan tombol kembali diatur oleh Halaman (page) yang menggunakannya.
 */
export default function ChatInterface({
  messages,
  onSendMessage,
  currentUserRole, // 'user' atau 'admin'
}) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // Ref untuk auto-scroll

  // Fungsi untuk auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll setiap kali ada pesan baru
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 1. Jendela Pesan (Chat Window) */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            time={msg.time}
            isMine={msg.sender === currentUserRole}
            senderIcon={msg.sender === "admin" ? Shield : User}
          />
        ))}
        {/* Elemen kosong untuk target auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* 2. Input Pesan (Chat Input) */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-neutral-200">
        <div className="flex items-start gap-3">
          <textarea
            className="flex-grow border border-neutral-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder="Ketik pesan Anda..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="h-11 px-4 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Bantuan untuk Gelembung Chat (Chat Bubble)
function ChatBubble({ message, time, isMine, senderIcon: Icon }) {
  return (
    <div className={`flex items-end gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
      {/* Ikon Sender (hanya untuk 'mereka') */}
      {!isMine && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
          <Icon size={16} />
        </div>
      )}

      {/* Konten Pesan */}
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-xl ${
          isMine
            ? "bg-primary-600 text-white rounded-br-lg"
            : "bg-white text-neutral-800 border border-neutral-200 rounded-bl-lg"
        }`}
      >
        <p className="text-sm">{message}</p>
        <p className={`text-xs mt-1 ${isMine ? "text-primary-100" : "text-neutral-500"} ${isMine ? 'text-right' : 'text-left'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}