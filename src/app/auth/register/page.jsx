"use client";

import {
  UserPlus,
  User,
  Mail,
  Smartphone,
  Lock,
  Loader2,
  CheckCircle,
  X,
  Send
} from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/services/api"; // Pastikan path ini sesuai dengan file api.js Anda

// --- Komponen InputField ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  value,
  onChange,
  name,
  disabled
}) => {
  const inputClassName = `block w-full rounded-lg border py-2 ${
    Icon ? "pl-10" : "pl-3"
  } pr-3 text-neutral-900 placeholder-neutral-600 sm:text-sm transition duration-150 border-neutral-200 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500`;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-600" />
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          className={inputClassName}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

// --- Halaman Register ---
export default function RegisterPage() {
  const router = useRouter();

  // State Form Register
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nomor_telepon: "",
    password: "",
    password_confirmation: "",
  });

  // State OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // State UI (Loading & Error)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // Pesan sukses OTP/Register

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- 1. Fungsi Register ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    // Validasi Password Match di Frontend
    if (formData.password !== formData.password_confirmation) {
        setErrorMsg("Konfirmasi kata sandi tidak cocok.");
        setIsLoading(false);
        return;
    }

    try {
      // Panggil API Register
      const response = await api.post("/register", formData);

      if (response.data.success) {
        // Jika sukses, buka modal OTP
        setSuccessMsg(response.data.message || "Registrasi berhasil! Cek email Anda.");
        setShowOtpModal(true);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
         // Ambil error pertama dari validasi backend
         const firstErrorKey = Object.keys(error.response.data.errors)[0];
         setErrorMsg(error.response.data.errors[firstErrorKey][0]);
      } else {
         setErrorMsg(error.response?.data?.message || "Terjadi kesalahan saat registrasi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Fungsi Verifikasi OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
        const response = await api.post("/otp/verify", {
            email: formData.email, // Email diambil dari state form register
            otp: otpCode
        });

        if (response.data.success) {
            setSuccessMsg("Verifikasi Berhasil! Mengalihkan...");
            // Delay sebentar agar user lihat pesan sukses
            setTimeout(() => {
                router.push("/auth/login");
            }, 1500);
        }
    } catch (error) {
        console.error(error);
        setErrorMsg(error.response?.data?.message || "Kode OTP Salah atau Kadaluarsa.");
        setIsLoading(false); // Stop loading jika error, biar bisa input ulang
    }
  };

  // --- 3. Fungsi Resend OTP (Opsional) ---
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
        await api.post("/otp/resend", { email: formData.email });
        alert("Kode OTP baru telah dikirim ke email Anda.");
    } catch (error) {
        alert("Gagal mengirim ulang OTP.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4 relative">
        <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">

          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.svg"
              alt="Logo Aplikasi"
              width={120}
              height={120}
              className="object-contain h-24 w-auto"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">
            DAFTAR AKUN BARU
          </h1>
          <p className="text-center text-neutral-600 mb-8 text-md">
            Hanya butuh beberapa detik untuk membuat akun Anda.
          </p>

          {/* Alert Error General */}
          {errorMsg && !showOtpModal && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {errorMsg}
             </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <InputField
              label="Nama Lengkap"
              type="text"
              name="name"
              placeholder="Nama lengkap Anda"
              required
              icon={User}
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="contoh@mail.com"
              required
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />

            <InputField
              label="Nomor Telepon (WA)"
              type="tel"
              name="nomor_telepon"
              placeholder="Contoh: 0812xxxxxxxx"
              required
              icon={Smartphone}
              value={formData.nomor_telepon}
              onChange={handleChange}
              disabled={isLoading}
            />

            <InputField
              label="Kata Sandi"
              type="password"
              name="password"
              placeholder="Min. 6 Karakter"
              required
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />

            <InputField
              label="Konfirmasi Kata Sandi"
              type="password"
              name="password_confirmation"
              placeholder="Ulangi Kata Sandi"
              required
              icon={Lock}
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 mt-8 transition-all duration-300 transform
                ${isLoading ? "bg-neutral-400 cursor-not-allowed" : "bg-secondary-500 hover:bg-secondary-600 hover:scale-[1.01]"}`}
            >
              {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memproses...</span>
                  </>
              ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Daftar Sekarang</span>
                  </>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-neutral-600">
            Sudah punya akun?{" "}
            <a
              href="/auth/login"
              className={`text-primary-600 font-bold hover:text-primary-800 ${isLoading ? "pointer-events-none text-neutral-400" : ""}`}
            >
              Masuk
            </a>
          </p>
        </div>

        {/* --- MODAL VERIFIKASI OTP --- */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
              
              {/* Tombol Tutup Modal (Opsional, hati-hati user bisa close tanpa verif) */}
              {/* <button 
                onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button> */}

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Verifikasi Email</h3>
                <p className="text-sm text-neutral-500 mt-2">
                  Kami telah mengirimkan kode OTP 6 digit ke email: <br/>
                  <span className="font-semibold text-neutral-800">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div>
                   <label className="sr-only">Kode OTP</label>
                   <input
                     type="text"
                     maxLength={6}
                     value={otpCode}
                     onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Hanya angka
                     className="block w-full text-center text-2xl tracking-widest font-bold text-neutral-900 border-2 border-neutral-300 rounded-lg py-3 focus:ring-primary-500 focus:border-primary-500"
                     placeholder="000000"
                     required
                   />
                </div>

                {/* Pesan Error / Sukses di Modal */}
                {errorMsg && (
                    <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{errorMsg}</p>
                )}
                {successMsg && successMsg !== "Registrasi berhasil! Cek email Anda." && (
                    <p className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded flex justify-center items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> {successMsg}
                    </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white 
                    ${isLoading ? "bg-neutral-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"}`}
                >
                   {isLoading ? "Memverifikasi..." : "Verifikasi Akun"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-600">
                  Tidak menerima kode?{" "}
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-semibold text-primary-600 hover:text-primary-500 disabled:text-neutral-400"
                  >
                    Kirim Ulang
                  </button>
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}