"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// --- TopBar ---
export const TopBar = () => {
  return (
    // UBAH: Menggunakan 'neutral-900' (paling gelap) dari config Anda
    <div className="bg-neutral-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-white">
              RSPB
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/auth/login"
              // UBAH: Menggunakan 'neutral-900' untuk hover text
              className="px-4 py-2 border border-white rounded-full text-white hover:bg-white hover:text-neutral-900 transition-colors duration-300 font-medium"
            >
              Masuk
            </a>
            <a
              href="/auth/register"
              // UBAH: Menggunakan 'neutral-900' dan 'neutral-200'
              className="px-4 py-2 rounded-full bg-white text-neutral-900 hover:bg-neutral-200 transition-colors duration-300 font-medium"
            >
              Daftar Akun
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Navbar ---
export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isActive = (sectionName) => {
    if (hash === `#${sectionName}`) return true;
    if (pathname === "/guest/tentang" && sectionName === "tentang") return true;
    if (pathname === "/guest/cara_reservasi" && sectionName === "cara_reservasi")
      return true;
    if (!hash && pathname === "/" && sectionName === "beranda") return true;
    return false;
  };

  const getLinkClass = (sectionName) => {
    return isActive(sectionName)
      // UBAH: Menggunakan 'primary-600' dan 'primary-500' dari config
      ? "font-semibold text-primary-600 border-b-2 border-primary-500 transition-all"
      // UBAH: Menggunakan 'neutral-600' dan 'primary-600'
      : "font-semibold text-neutral-600 hover:text-primary-600 transition-colors";
  };

  const getMobileLinkClass = (sectionName) => {
    return isActive(sectionName)
      // UBAH: Menggunakan 'primary-600'
      ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600"
      // UBAH: Menggunakan 'neutral-700' dan 'primary-500'
      : "block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-white hover:bg-primary-500";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-8 h-12">
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Buka Menu"
          >
            {/* UBAH: Menggunakan 'neutral-700' */}
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-neutral-700" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-700" />
            )}
          </button>
        </div>

        <div className="hidden md:flex flex-grow justify-center items-center">
          <div className="flex space-x-10">
            <a href="/#beranda" className={getLinkClass("beranda")}>
              Beranda
            </a>
            <a href="/guest/tentang" className={getLinkClass("tentang")}>
              Tentang
            </a>
            <a href="/#jadwal-dokter" className={getLinkClass("jadwal-dokter")}>
              Cek Jadwal
            </a>
            <a
              href="/guest/cara_reservasi"
              className={getLinkClass("cara_reservasi")}
            >
              Cara Reservasi
            </a>
          </div>
        </div>

        {/* Ini adalah spacer, tidak perlu diubah */}
        <div className="hidden md:flex" style={{ width: "60px" }}></div>
      </div>

      {isMobileMenuOpen && (
        // UBAH: Menggunakan 'neutral-200'
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="/#beranda"
              onClick={() => setIsMobileMenuOpen(false)}
              className={getMobileLinkClass("beranda")}
            >
              Beranda
            </a>
            <a
              href="/guest/tentang"
              onClick={() => setIsMobileMenuOpen(false)}
              className={getMobileLinkClass("tentang")}
            >
              Tentang
            </a>
            <a
              href="/#jadwal-dokter"
              onClick={() => setIsMobileMenuOpen(false)}
              className={getMobileLinkClass("jadwal-dokter")}
            >
              Cek Jadwal
            </a>
            <a
              href="/guest/cara_reservasi"
              onClick={() => setIsMobileMenuOpen(false)}
              className={getMobileLinkClass("cara_reservasi")}
            >
              Cara Reservasi
            </a>
          </div>
          {/* UBAH: Menggunakan 'neutral-200' */}
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="px-2 space-y-2">
              {/* UBAH: Menggunakan 'primary-600' */}
              <a
                href="/auth/login"
                className="block w-full text-center px-4 py-2 border border-primary-600 rounded-full text-primary-600"
              >
                Masuk
              </a>
              {/* UBAH: Menggunakan 'primary-600' */}
              <a
                href="/auth/register"
                className="block w-full text-center px-4 py-2 rounded-full bg-primary-600 text-white"
              >
                Daftar Akun
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};