import { BellIcon, ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link'; // 1. Impor Link dari next/link

export default function Header() {
  return (
    // UBAH: Menggunakan bg-neutral-900
    <header className="flex justify-end items-center space-x-4 h-16 bg-neutral-900 text-white px-8 shadow-md">

      <div className="flex items-center space-x-6">

        {/* UBAH: Menggunakan hover:text-primary-200 */}
        <div className="cursor-pointer hover:text-primary-200 transition-colors">
          <BellIcon className="h-7 w-7" />
        </div>

        {/* UBAH: Menggunakan hover:text-primary-200 */}
        <div className="cursor-pointer hover:text-primary-200 transition-colors">
          <ChatBubbleLeftIcon className="h-7 w-7" />
        </div>

        {/* 2. Bungkus div dengan Link dan tambahkan href */}
        <Link 
          href="/admin/dashboard" // Tentukan path ke dashboard Anda
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <UserCircleIcon className="h-9 w-9" />
          <span className="font-semibold text-lg"> Admin </span>
        </Link>

      </div>
    </header>
  );
}