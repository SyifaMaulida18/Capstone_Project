"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// --- TopBar ---
export const TopBar = () => {
    return (
        // UBAH: Ganti background menjadi biru tua
        <div className="bg-[#0D3A6A]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        {/* UBAH: Ganti warna teks logo menjadi putih */}
                        <a href="/" className="text-2xl font-bold text-white">
                            SiReS-RS
                        </a>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        {/* UBAH: Sesuaikan style tombol "Masuk" untuk background gelap */}
                        <a
                            href="/auth/login"
                            className="px-4 py-2 border border-white rounded-full text-white hover:bg-white hover:text-[#0D3A6A] transition-colors duration-300 font-medium"
                        >
                            Masuk
                        </a>
                        {/* UBAH: Sesuaikan style tombol "Daftar" untuk background gelap */}
                        <a
                            href="/auth/register"
                            className="px-4 py-2 rounded-full bg-white text-[#0D3A6A] hover:bg-gray-200 transition-colors duration-300 font-medium"
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
        if (pathname === "/guest/cara_reservasi" && sectionName === "cara_reservasi") return true;
        // Default ke beranda jika tidak ada hash
        if (!hash && pathname === '/' && sectionName === 'beranda') return true;
        return false;
    };

    const getLinkClass = (sectionName) => {
        return isActive(sectionName)
            // UBAH: Ganti warna aksen aktif menjadi indigo
            ? "font-semibold text-indigo-600 border-b-2 border-indigo-500 transition-all"
            // UBAH: Sesuaikan warna hover
            : "font-semibold text-gray-600 hover:text-indigo-600 transition-colors";
    };

    const getMobileLinkClass = (sectionName) => {
        return isActive(sectionName)
            // UBAH: Ganti warna background aktif menjadi indigo
            ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600"
            // UBAH: Sesuaikan warna hover
            : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white hover:bg-indigo-500";
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-8 h-12">
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Buka Menu">
                        {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
                    </button>
                </div>

                <div className="hidden md:flex flex-grow justify-center items-center">
                    <div className="flex space-x-10">
                        <a href="/#beranda" className={getLinkClass("beranda")}>Beranda</a>
                        <a href="/guest/tentang" className={getLinkClass("tentang")}>Tentang</a>
                        <a href="/#jadwal-dokter" className={getLinkClass("jadwal-dokter")}>Cek Jadwal</a>
                        <a href="/guest/cara_reservasi" className={getLinkClass("cara_reservasi")}>Cara Reservasi</a>
                    </div>
                </div>

                <div className="hidden md:flex" style={{ width: "60px" }}></div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="/#beranda" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass("beranda")}>Beranda</a>
                        <a href="/guest/tentang" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass("tentang")}>Tentang</a>
                        <a href="/#jadwal-dokter" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass("jadwal-dokter")}>Cek Jadwal</a>
                        <a href="/guest/cara_reservasi" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass("cara_reservasi")}>Cara Reservasi</a>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="px-2 space-y-2">
                             {/* UBAH: Sesuaikan style tombol mobile */}
                            <a href="/auth/login" className="block w-full text-center px-4 py-2 border border-indigo-600 rounded-full text-indigo-600">Masuk</a>
                            <a href="/auth/register" className="block w-full text-center px-4 py-2 rounded-full bg-indigo-600 text-white">Daftar Akun</a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};