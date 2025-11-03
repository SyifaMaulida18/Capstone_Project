import { BellIcon, ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    // Tambahkan kelas h-20 di sini untuk mengatur tingginya
    <header className="flex justify-end items-center space-x-4 h-16 bg-blue-800 text-white px-8 shadow-md">
      
      {/* Container utama untuk ikon dan profil */}
      <div className="flex items-center space-x-6">

        {/* Ikon Notifikasi (Ubah ukuran ikon agar proporsional) */}
        <div className="cursor-pointer hover:text-blue-200 transition-colors">
          <BellIcon className="h-7 w-7" /> 
        </div>

        {/* Ikon Chat */}
        <div className="cursor-pointer hover:text-blue-200 transition-colors">
          <ChatBubbleLeftIcon className="h-7 w-7" /> 
        </div>
        
        {/* Profil Admin */}
        <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-blue-700 transition-colors">
          <UserCircleIcon className="h-9 w-9" />
          <span className="font-semibold text-lg">Admin</span>
        </div>

      </div>
    </header>
  );
}
