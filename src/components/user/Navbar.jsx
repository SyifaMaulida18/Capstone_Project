"use client";

import React from "react";

export default function Navbar({ navItems }) {
  return (
    <div className="bg-white shadow-md border-b border-gray-200 hidden md:block">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8 py-3">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`font-semibold transition duration-150 py-1 ${
                item.isActive
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-300"
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
