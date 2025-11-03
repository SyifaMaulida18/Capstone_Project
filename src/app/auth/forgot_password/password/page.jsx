"use client";

import { Lock, CheckCircle } from "lucide-react";
import React, { useState } from "react";

// Komponen InputField yang di-inline
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok. Silakan coba lagi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }, 3000);
  };

  if (success) {
    return (
      // UBAH: Menggunakan gradasi primary
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md text-center">
          {/* CATATAN: Warna green dipertahankan */}
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          {/* UBAH: Menggunakan text-neutral-900 */}
          <h1 className="text-2xl font-bold text-neutral-900">
            Password Berhasil Diubah!
          </h1>
          {/* UBAH: Menggunakan text-neutral-600 */}
          <p className="text-neutral-600 mt-2">
            Anda akan diarahkan ke halaman login dalam beberapa detik.
          </p>
        </div>
      </div>
    );
  }

  return (
    // UBAH: Menggunakan gradasi primary
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          {/* UBAH: Menggunakan text-neutral-900 */}
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
            Atur Ulang Password
          </h1>
          {/* UBAH: Menggunakan text-neutral-600 */}
          <p className="text-neutral-600 text-md">
            Masukkan password baru Anda di bawah ini.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <InputField
            label="Password Baru"
            type="password"
            name="password" // Tambah name
            placeholder="Minimal 8 karakter"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputField
            label="Konfirmasi Password Baru"
            type="password"
            name="confirmPassword" // Tambah name
            placeholder="Ulangi password baru"
            icon={Lock}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* CATATAN: Warna red dipertahankan */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            /* UBAH: Menggunakan bg-primary-600 dan hover:bg-primary-800 */
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-primary-800 transition-all duration-300 transform hover:scale-[1.01] !mt-6"
          >
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
}