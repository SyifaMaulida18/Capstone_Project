"use client";

import React from "react";

export default function Navbar({ navItems }) {
  return (
    /* UBAH: Menggunakan 'border-neutral-200' */
    <div className="bg-white shadow-md border-b border-neutral-200 hidden md:block">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8 py-3">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`font-semibold transition duration-150 py-1 ${
                item.isActive
                  ? /* UBAH: Menggunakan 'text-primary-600' dan 'border-primary-600' */
                    "text-primary-600 border-b-2 border-primary-600"
                  : /* UBAH: Menggunakan 'text-neutral-600', 'hover:text-primary-600', dan 'hover:border-primary-200' */
                    "text-neutral-600 hover:text-primary-600 hover:border-b-2 hover:border-primary-200"
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