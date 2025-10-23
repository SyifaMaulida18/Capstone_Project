"use client";

import { UserPlus, User, Mail, Smartphone, Lock } from "lucide-react";
import React, { useState } from 'react';

// --- Komponen InputField yang Di-inline (tetap di sini agar tidak ada error path) ---
const InputField = ({ label, type, placeholder, required, icon: Icon, value, onChange, options, ...props }) => {
  const inputClassName = `block w-full rounded-lg border border-gray-300 py-2 ${Icon ? 'pl-10' : 'pl-3'} pr-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150`;

  return (
    <div className="space-y-1">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {type === 'select' && options ? (
          <select
            id={label}
            name={label}
            required={required}
            className={inputClassName}
            value={value}
            onChange={onChange}
            {...props}
          >
            <option value="" disabled>-- Pilih {label} --</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            id={label}
            name={label}
            type={type}
            placeholder={placeholder}
            required={required}
            className={inputClassName}
            value={value}
            onChange={onChange}
            {...props}
          />
        )}
      </div>
    </div>
  );
};
// -----------------------------------------------------------------------------------

// --- Komponen Baru: Modal Permintaan Lengkapi Data ---
const CompleteProfileModal = ({ isVisible, onClose, onConfirm }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center transform scale-100 transition-all duration-300">
                <div className="text-blue-600 mb-4 flex justify-center">
                    <UserPlus className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lengkapi Data Diri Anda!</h3>
                <p className="text-gray-600 mb-6">
                    Untuk dapat melakukan **Reservasi Online**, Anda wajib mengisi data diri lengkap (KTP, KK, Alamat, dll.).
                </p>
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
                    >
                        Nanti Saja (Lihat Jadwal)
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
                    >
                        Lengkapi Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------------


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    namaLengkap: '', 
    email: '', 
    noTelepon: '', 
    password: '', 
    confirmPassword: '',
  });
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      // Mengganti alert dengan modal custom di aplikasi nyata. Di sini menggunakan alert untuk simulasi.
      alert("Kata sandi dan konfirmasi sandi tidak cocok!"); 
      return;
    }
    
    // 1. Logika pendaftaran ke Firebase (Simulasi)
    console.log("Data Pendaftaran Cepat:", formData);

    // 2. Tampilkan Pop-up Permintaan Lengkapi Data
    setShowModal(true);
  };

  // Logika ketika user memilih "Lengkapi Sekarang"
  const handleCompleteProfile = () => {
    // Simulasi pengarahan ke halaman Profile Setting (misalnya /dashboard/profile)
    if (typeof window !== 'undefined') {
        setShowModal(false);
        // Anggap user sudah login, arahkan ke halaman pengisian profil
        window.location.href = '/dashboard/profile'; 
    }
  };
  
  // Logika ketika user memilih "Nanti Saja"
  const handleCloseModal = () => {
      setShowModal(false);
      // Arahkan kembali ke halaman utama (guest/dashboard)
      if (typeof window !== 'undefined') {
          window.location.href = '/'; 
      }
  };


  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* === PERUBAHAN DI SINI: max-w-md diganti menjadi max-w-lg === */}
        <div className="bg-white shadow-2xl border-t-8 border-blue-600 rounded-2xl p-8 md:p-12 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">
          
          <div className="flex justify-center mb-6">
              <UserPlus className="w-10 h-10 text-blue-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-2">DAFTAR AKUN BARU</h1>
          <p className="text-center text-gray-500 mb-8 text-md">
            Hanya butuh beberapa detik untuk membuat akun Anda.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            
            <InputField 
              label="Nama Lengkap" type="text" name="namaLengkap" placeholder="Nama lengkap Anda" required 
              icon={User} value={formData.namaLengkap} onChange={handleChange}
            />
            <InputField 
              label="Email" type="email" name="email" placeholder="contoh@mail.com" required 
              icon={Mail} value={formData.email} onChange={handleChange} 
            />
            <InputField 
              label="Nomor Telepon (WA)" type="tel" name="noTelepon" placeholder="Contoh: 0812xxxxxxxx" required 
              icon={Smartphone} value={formData.noTelepon} onChange={handleChange} 
            />
            <InputField 
              label="Kata Sandi" type="password" name="password" placeholder="Min. 8 Karakter" required 
              icon={Lock} value={formData.password} onChange={handleChange} 
            />
            <InputField 
              label="Konfirmasi Kata Sandi" type="password" name="confirmPassword" placeholder="Ulangi Kata Sandi" required 
              icon={Lock} value={formData.confirmPassword} onChange={handleChange} 
            />
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2 mt-8"
            >
              <UserPlus className="w-5 h-5" />
              <span>Daftar Sekarang</span>
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Sudah punya akun?{" "}
            <a href="/auth/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Masuk
            </a>
          </p>
        </div>
      </div>
      
      {/* Modal yang muncul setelah pendaftaran berhasil */}
      <CompleteProfileModal 
        isVisible={showModal} 
        onClose={handleCloseModal} 
        onConfirm={handleCompleteProfile} 
      />
    </>
  );
}
