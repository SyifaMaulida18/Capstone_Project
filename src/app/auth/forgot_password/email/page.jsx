"use client";

import { Mail } from "lucide-react";
import React from "react";

// Komponen InputField yang di-inline untuk konsistensi
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {/* UBAH: Menggunakan neutral-700 */}
      <label
        htmlFor={label}
        className="block text-sm font-medium text-neutral-700"
      >
        {label} {required && <span className="text-red-500">*</span>}{" "}
        {/* Warna red dipertahankan */}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* UBAH: Menggunakan neutral-600 */}
            <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
          </div>
        )}
        <input
          id={label}
          name={label} // Sebaiknya gunakan props.name
          type={type}
          placeholder={placeholder}
          required={required}
          /* UBAH: Menggunakan neutral dan primary */
          className={`block w-full rounded-lg border border-neutral-200 py-2.5 ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150`}
          {...props}
        />
      </div>
    </div>
  );
};

export default function ForgotPasswordPage() {
  const handleRequestReset = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/forgot-password/verify"; // Seharusnya /auth/forgot_password/verify
    }
  };

  return (
    // UBAH: Menggunakan gradasi primary
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          {/* UBAH: Menggunakan text-neutral-900 */}
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
            Lupa Password?
          </h1>
          {/* UBAH: Menggunakan text-neutral-600 */}
          <p className="text-neutral-600 text-md">
            Jangan khawatir. Masukkan email Anda dan kami akan mengirimkan
            instruksi untuk mengatur ulang password Anda.
          </p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-6">
          <InputField
            label="Email Terdaftar"
            type="email"
            placeholder="contoh@email.com"
            icon={Mail}
            required
            name="email" // Tambahkan name
          />
          <button
            type="submit"
            /* UBAH: Menggunakan bg-primary-600 dan hover:bg-primary-800 */
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-primary-800 transition-all duration-300 transform hover:scale-[1.01]"
          >
            Kirim
          </button>
        </form>

        {/* UBAH: Menggunakan text-neutral-600 dan primary-600/800 */}
        <p className="text-center text-sm mt-6 text-neutral-600">
          <a
            href="/auth/login"
            className="text-primary-600 font-bold hover:text-primary-800 transition-colors"
          >
            Kembali ke Halaman Login
          </a>
        </p>
      </div>
    </div>
  );
}