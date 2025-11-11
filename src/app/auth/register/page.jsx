"use client";

import {
  UserPlus,
  User,
  Mail,
  Smartphone,
  Lock,
  Loader2, // <-- Import ikon loading
} from "lucide-react";
import React, { useState } from "react";
// 1. GANTI import axios biasa dengan instance 'api' kustom Anda
import api from "../../../services/api"; // <-- SESUAIKAN PATH INI

// --- Komponen InputField ---
// (Termasuk prop 'hasError' untuk styling border merah)
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  value,
  onChange,
  options,
  hasError, // <-- Prop untuk styling error
  ...props
}) => {
  // Tentukan kelas CSS berdasarkan ada tidaknya error
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const normalClasses =
    "border-neutral-200 focus:ring-primary-500 focus:border-primary-500";

  const inputClassName = `block w-full rounded-lg border py-2 ${
    Icon ? "pl-10" : "pl-3"
  } pr-3 text-neutral-900 placeholder-neutral-600 sm:text-sm transition duration-150 ${
    hasError ? errorClasses : normalClasses // <-- Terapkan style error
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
// -----------------------------------------------------------------------------------

// --- Komponen Modal Permintaan Lengkapi Data ---
// (Kode ini diambil dari file Anda, tidak ada perubahan)
const CompleteProfileModal = ({ isVisible, onClose, onConfirm }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center transform scale-100 transition-all duration-300">
        <div className="text-primary-600 mb-4 flex justify-center">
          <UserPlus className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-3">
          Lengkapi Data Diri Anda!
        </h3>
        <p className="text-neutral-600 mb-6">
          Untuk dapat melakukan **Reservasi Online**, Anda wajib mengisi data diri
          lengkap (KTP, KK, Alamat, dll.).
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-neutral-200 rounded-full text-neutral-700 hover:bg-neutral-100 transition"
          >
            Nanti Saja (Lihat Jadwal)
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-800 transition"
          >
            Lengkapi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
// ---------------------------------------------------

// --- Komponen Halaman Register ---
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    password: "",
    confirmPassword: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State untuk menyimpan error validasi

  // Fungsi untuk menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Hapus error untuk field ini jika user mulai mengetik lagi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Fungsi untuk menangani submit form registrasi
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Bersihkan error sebelumnya

    // 1. Validasi konfirmasi password di frontend
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: ["Konfirmasi Kata Sandi tidak cocok."] });
      setIsLoading(false);
      return;
    }

    // 2. Siapkan payload untuk dikirim ke API Laravel
    //    (Mapping keys frontend ke keys backend)
    const payload = {
      name: formData.namaLengkap,
      email: formData.email,
      nomor_telepon: formData.noTelepon,
      password: formData.password,
      password_confirmation: formData.confirmPassword, // Wajib untuk aturan 'confirmed'
    };

    try {
      // 3. Kirim permintaan POST ke endpoint /api/register
      //    'api' adalah instance axios kustom Anda
      const response = await api.post('/api/register', payload);

      // 4. Handle jika registrasi sukses
      console.log("Registrasi berhasil:", response.data);
      setIsLoading(false);
      setShowModal(true); // Tampilkan modal untuk melengkapi profil

    } catch (error) {
      setIsLoading(false);
      
      // 5. Handle jika terjadi error validasi (status 422)
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        console.error("Error Validasi:", validationErrors);

        // Map balik keys error dari backend (e.g., 'nomor_telepon')
        // ke keys state frontend (e.g., 'noTelepon')
        const frontendErrors = {};
        for (const key in validationErrors) {
          const frontendKey = {
            name: "namaLengkap",
            nomor_telepon: "noTelepon",
            password: "password",
            email: "email",
            confirmPassword: "confirmPassword"
          }[key];
          
          if (frontendKey) {
            frontendErrors[frontendKey] = validationErrors[key];
          } else {
            frontendErrors[key] = validationErrors[key]; // Fallback
          }
        }
        setErrors(frontendErrors);

      } else {
        // 6. Handle error server lainnya (500, 404, dll)
        console.error("Error Server:", error.message);
        setErrors({
          general: ["Terjadi kesalahan pada server. Silakan coba lagi nanti."],
        });
      }
    }
  };

  // Fungsi untuk tombol "Lengkapi Sekarang" pada modal
  const handleCompleteProfile = () => {
    // Arahkan user ke halaman profil
    // Ganti '/profile' jika path Anda berbeda
    window.location.href = "/user/profile";
  };

  // Fungsi untuk tombol "Nanti Saja" pada modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Arahkan user ke halaman lain (misal: dashboard atau jadwal)
    // Ganti '/jadwal-dokter' jika path Anda berbeda
    window.location.href = "/jadwal-dokter";
  };

  // Komponen helper untuk menampilkan pesan error di bawah input
  const ErrorMessage = ({ field }) => {
    return errors[field] ? (
      <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>
    ) : null;
  };

  // Render JSX
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">
          
          <div className="flex justify-center mb-6">
            <UserPlus className="w-10 h-10 text-primary-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">
            DAFTAR AKUN BARU
          </h1>
          <p className="text-center text-neutral-600 mb-8 text-md">
            Hanya butuh beberapa detik untuk membuat akun Anda.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Menampilkan error general (misal: server down) */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {errors.general[0]}
              </div>
            )}

            {/* --- Input Field Nama Lengkap --- */}
            <div>
              <InputField
                label="Nama Lengkap"
                type="text"
                name="namaLengkap"
                placeholder="Nama lengkap Anda"
                required
                icon={User}
                value={formData.namaLengkap}
                onChange={handleChange}
                hasError={!!errors.namaLengkap} // Kirim status error ke komponen
              />
              <ErrorMessage field="namaLengkap" /> {/* Tampilkan error jika ada */}
            </div>

            {/* --- Input Field Email --- */}
            <div>
              <InputField
                label="Email"
                type="email"
                name="email"
                placeholder="contoh@mail.com"
                required
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                hasError={!!errors.email}
              />
              <ErrorMessage field="email" />
            </div>

            {/* --- Input Field Nomor Telepon --- */}
            <div>
              <InputField
                label="Nomor Telepon (WA)"
                type="tel"
                name="noTelepon"
                placeholder="Contoh: 0812xxxxxxxx"
                required
                icon={Smartphone}
                value={formData.noTelepon}
                onChange={handleChange}
                hasError={!!errors.noTelepon}
              />
              <ErrorMessage field="noTelepon" />
            </div>

            {/* --- Input Field Kata Sandi --- */}
            <div>
              <InputField
                label="Kata Sandi"
                type="password"
                name="password"
                placeholder="Min. 6 Karakter" // Disesuaikan dengan validasi backend (min:6)
                required
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                hasError={!!errors.password}
              />
              <ErrorMessage field="password" />
            </div>

            {/* --- Input Field Konfirmasi Kata Sandi --- */}
            <div>
              <InputField
                label="Konfirmasi Kata Sandi"
                type="password"
                name="confirmPassword"
                placeholder="Ulangi Kata Sandi"
                required
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                hasError={!!errors.confirmPassword}
              />
              <ErrorMessage field="confirmPassword" />
            </div>

            {/* --- Tombol Submit --- */}
            <button
              type="submit"
              disabled={isLoading} // Nonaktifkan tombol saat loading
              className="w-full bg-secondary-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-secondary-600 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" /> // Ikon loading
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span>{isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}</span>
            </button>
          </form>

          {/* --- Link ke Halaman Login --- */}
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

      {/* --- Modal --- */}
      <CompleteProfileModal
        isVisible={showModal}
        onClose={handleCloseModal}
        onConfirm={handleCompleteProfile}
      />
    </>
  );
}