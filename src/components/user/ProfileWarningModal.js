"use client";

import { AlertCircle, ArrowRight, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileWarningModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header Warna */}
        <div className="bg-yellow-50 p-6 flex justify-center border-b border-yellow-100">
          <div className="bg-yellow-100 p-4 rounded-full">
            <UserCog className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-neutral-800 mb-2">
            Lengkapi Profil Anda
          </h3>
          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
            Halo! Kami mendeteksi data profil Anda belum lengkap (NIK, Alamat, dll). 
            Mohon lengkapi data Anda untuk kemudahan proses reservasi dan administrasi medis.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/user/profile")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              Lengkapi Sekarang <ArrowRight size={16} />
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-transparent hover:bg-neutral-50 text-neutral-500 rounded-xl font-medium text-sm transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}