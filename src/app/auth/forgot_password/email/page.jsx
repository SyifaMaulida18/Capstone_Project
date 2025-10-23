"use client";

import { Mail } from "lucide-react";
import React from 'react';

// Komponen InputField yang di-inline untuk konsistensi
const InputField = ({ label, type, placeholder, required, icon: Icon, ...props }) => {
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
        <input
          id={label}
          name={label}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border border-gray-300 py-2.5 ${Icon ? 'pl-10' : 'pl-3'} pr-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150`}
          {...props}
        />
      </div>
    </div>
  );
};

export default function ForgotPasswordPage() {
  
  // Fungsi ini akan mensimulasikan pengiriman email dan mengarahkan ke halaman verifikasi
  const handleRequestReset = (e) => {
    e.preventDefault();
    // Di aplikasi nyata, di sini Anda akan memanggil API untuk mengirim email.
    // Kita langsung arahkan ke halaman verifikasi.
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/forgot-password/verify'; 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Lupa Password?</h1>
            <p className="text-gray-500 text-md">
                Jangan khawatir. Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang password Anda.
            </p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-6">
          <InputField
            label="Email Terdaftar"
            type="email"
            placeholder="contoh@email.com"
            icon={Mail}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.01]"
          >
            Kirim
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-gray-600">
          <a href="/auth/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Kembali ke Halaman Login
          </a>
        </p>
      </div>
    </div>
  );
}
