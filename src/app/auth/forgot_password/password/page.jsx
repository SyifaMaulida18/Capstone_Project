"use client";

import { Lock, CheckCircle } from "lucide-react";
import React, { useState } from 'react';

// Komponen InputField yang di-inline
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok. Silakan coba lagi.');
      return;
    }
    if (password.length < 8) {
        setError('Password minimal harus 8 karakter.');
        return;
    }

    // Simulasi berhasil, tampilkan pesan sukses
    setSuccess(true);

    // Arahkan ke login setelah beberapa detik
    setTimeout(() => {
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'; 
        }
    }, 3000);
  };

  // Jika sukses, tampilkan pesan
  if (success) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Password Berhasil Diubah!</h1>
                <p className="text-gray-600 mt-2">Anda akan diarahkan ke halaman login dalam beberapa detik.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Atur Ulang Password</h1>
            <p className="text-gray-500 text-md">
                Masukkan password baru Anda di bawah ini.
            </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <InputField
            label="Password Baru"
            type="password"
            placeholder="Minimal 8 karakter"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputField
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            icon={Lock}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.01] !mt-6"
          >
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
}
