"use client";

import { UserPlus, User, Mail, Smartphone, Lock, Loader2 } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/services/api"; // Pastikan path ini sesuai dengan file api.js kamu

// --- Komponen InputField (TIDAK ADA PERUBAHAN) ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  value,
  onChange,
  options,
  hasError,
  ...props
}) => {
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const normalClasses =
    "border-neutral-200 focus:ring-primary-500 focus:border-primary-500";

  const inputClassName = `block w-full rounded-lg border py-2 ${
    Icon ? "pl-10" : "pl-3"
  } pr-3 text-neutral-900 placeholder-neutral-600 sm:text-sm transition duration-150 ${
    hasError ? errorClasses : normalClasses
  }`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={label}
        className="block text-sm font-medium text-neutral-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
          </div>
        )}

        {type === "select" && options ? (
          <select
            id={label}
            name={props.name}
            required={required}
            className={inputClassName}
            value={value}
            onChange={onChange}
            {...props}
          >
            <option value="" disabled>
              -- Pilih {label} --
            </option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={label}
            name={props.name}
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

// --- Komponen Modal (DIUPDATE PESANNYA) ---
const CompleteProfileModal = ({ isVisible, onClose, onConfirm, email }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center transform scale-100 transition-all duration-300">
        <div className="text-primary-600 mb-4 flex justify-center">
          <UserPlus className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-3">
          Registrasi Berhasil!
        </h3>
        <p className="text-neutral-600 mb-6 text-sm">
          Kode OTP telah dikirim ke email <strong>{email}</strong>.
          <br />
          Silakan cek <strong>Inbox</strong> atau <strong>Spam</strong>, lalu login menggunakan kode tersebut.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-800 transition"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Halaman Register (LOGIC UTAMA) ---
export default function RegisterPage() {
  const router = useRouter();

  // State disesuaikan dengan kolom database Laravel
  const [formData, setFormData] = useState({
    name: "",                  // Sesuai DB
    email: "",                 // Sesuai DB
    nomor_telepon: "",         // Sesuai DB
    password: "",              // Sesuai DB
    password_confirmation: "", // Dibutuhkan Laravel validation 'confirmed'
  });

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // 1. Request Register ke Backend
      const registerResponse = await api.post("/register", formData);

      if (registerResponse.data.success) {
        
        // 2. Jika Register Sukses, Langsung Request OTP (Chaining)
        try {
            await api.post("/otp/request", { 
                email: formData.email 
            });
            // Tidak perlu handling khusus jika sukses, langsung ke modal
        } catch (otpError) {
            console.error("Gagal mengirim trigger OTP otomatis:", otpError);
            // Tetap tampilkan sukses register, user bisa request OTP manual nanti di login
        }

        // 3. Tampilkan Modal Sukses
        setShowModal(true);
      }

    } catch (error) {
      console.error("Register Error:", error);

      if (error.response) {
        // Handle Error Validasi (422) dari Laravel
        if (error.response.status === 422) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: ["Terjadi kesalahan pada server. Silakan coba lagi."] });
        }
      } else {
        // Handle Network Error
        setErrors({ general: ["Gagal terhubung ke server. Periksa koneksi internet Anda."] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    // Arahkan ke halaman login agar user bisa memasukkan OTP
    router.push("/auth/login");
  };

  const handleCloseModal = () => {
    router.push("/auth/login");
  };

  const ErrorMessage = ({ field }) => {
    return errors[field] ? (
      <p className="text-xs text-red-600 mt-1 text-left">{errors[field][0]}</p>
    ) : null;
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">
          {/* --- BAGIAN LOGO --- */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.svg"
              alt="Logo Aplikasi"
              width={120}
              height={120}
              priority
              className="object-contain h-24 w-auto"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">
            DAFTAR AKUN BARU
          </h1>
          <p className="text-center text-neutral-600 mb-8 text-md">
            Hanya butuh beberapa detik untuk membuat akun Anda.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
                {errors.general[0]}
              </div>
            )}

            <div>
              <InputField
                label="Nama Lengkap"
                type="text"
                name="name" // Disesuaikan dengan DB
                placeholder="Nama lengkap Anda"
                required
                icon={User}
                value={formData.name}
                onChange={handleChange}
                hasError={!!errors.name}
              />
              <ErrorMessage field="name" />
            </div>

            <div>
              <InputField
                label="Email"
                type="email"
                name="email" // Disesuaikan dengan DB
                placeholder="contoh@mail.com"
                required
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                hasError={!!errors.email}
              />
              <ErrorMessage field="email" />
            </div>

            <div>
              <InputField
                label="Nomor Telepon (WA)"
                type="tel"
                name="nomor_telepon" // Disesuaikan dengan DB
                placeholder="Contoh: 0812xxxxxxxx"
                required
                icon={Smartphone}
                value={formData.nomor_telepon}
                onChange={handleChange}
                hasError={!!errors.nomor_telepon}
              />
              <ErrorMessage field="nomor_telepon" />
            </div>

            <div>
              <InputField
                label="Kata Sandi"
                type="password"
                name="password" // Disesuaikan dengan DB
                placeholder="Min. 6 Karakter"
                required
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
              />
              <ErrorMessage field="password" />
            </div>

            <div>
              <InputField
                label="Konfirmasi Kata Sandi"
                type="password"
                name="password_confirmation" // Disesuaikan untuk Laravel
                placeholder="Ulangi Kata Sandi"
                required
                icon={Lock}
                value={formData.password_confirmation}
                onChange={handleChange}
                hasError={!!errors.password} // Error biasanya gabung di field password
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-secondary-600 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span>{isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}</span>
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-neutral-600">
            Sudah punya akun?{" "}
            <a
              href="/auth/login"
              className="text-primary-600 font-bold hover:text-primary-800 transition-colors"
            >
              Masuk
            </a>
          </p>
        </div>
      </div>

      <CompleteProfileModal
        isVisible={showModal}
        email={formData.email}
        onClose={handleCloseModal}
        onConfirm={handleCompleteProfile}
      />
    </>
  );
}