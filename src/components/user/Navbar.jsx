"use client";

import React from "react";

export default function Navbar({ navItems }) {
  return (
    /* UBAH: Background putih bersih */
    <div className="bg-white hidden md:block">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8 py-1"> 
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`font-semibold transition duration-150 py-3 border-b-[3px] text-sm ${
                item.isActive
                  ? /* UBAH: Warna Aktif menggunakan Blue-600 (Warna Utama Dashboard) */
                    "text-blue-600 border-blue-600"
                  : /* UBAH: Warna Pasif Neutral, Hover jadi Blue-400 */
                    "text-neutral-500 border-transparent hover:text-blue-500 hover:border-blue-200"
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}