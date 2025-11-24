"use client";

import {
  UserPlus,
  User,
  Mail,
  Smartphone,
  Lock,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import Image from "next/image"; // 1. Import Image dari Next.js
import api from "../../../services/api"; 

// --- Komponen InputField ---
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

// --- Komponen Modal (Tidak Berubah) ---
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
            Nanti Saja
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

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: ["Konfirmasi Kata Sandi tidak cocok."] });
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.namaLengkap,
      email: formData.email,
      nomor_telepon: formData.noTelepon,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    try {
      const response = await api.post('/api/register', payload);
      console.log("Registrasi berhasil:", response.data);
      setIsLoading(false);
      setShowModal(true); 

    } catch (error) {
      setIsLoading(false);
      
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        console.error("Error Validasi:", validationErrors);

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
            frontendErrors[key] = validationErrors[key];
          }
        }
        setErrors(frontendErrors);

      } else {
        console.error("Error Server:", error.message);
        setErrors({
          general: ["Terjadi kesalahan pada server. Silakan coba lagi nanti."],
        });
      }
    }
  };

  const handleCompleteProfile = () => {
    window.location.href = "/user/profile";
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.href = "/jadwal-dokter";
  };

  const ErrorMessage = ({ field }) => {
    return errors[field] ? (
      <p className="text-xs text-red-600 mt-1">{errors[field][0]}</p>
    ) : null;
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">
          
          {/* --- BAGIAN LOGO (Diperbarui) --- */}
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
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {errors.general[0]}
              </div>
            )}

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
                hasError={!!errors.namaLengkap}
              />
              <ErrorMessage field="namaLengkap" />
            </div>

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

            <div>
              <InputField
                label="Kata Sandi"
                type="password"
                name="password"
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
        onClose={handleCloseModal}
        onConfirm={handleCompleteProfile}
      />
    </>
  );
}