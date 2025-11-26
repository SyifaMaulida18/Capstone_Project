"use client";

import { KeyRound, LogIn, Mail, Loader2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api"; // Pastikan import api service kamu

// --- Komponen InputField ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  extraButton, // Props tambahan untuk tombol 'Kirim OTP'
  ...props
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label
          htmlFor={label}
          className="block text-sm font-medium text-neutral-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {extraButton} {/* Tempat tombol Kirim OTP */}
      </div>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
          </div>
        )}
        <input
          id={label}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border border-neutral-200 py-2 ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 disabled:bg-neutral-100 disabled:text-neutral-500`}
          {...props}
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  
  // State
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(""); // Ganti Password jadi OTP
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // Pesan sukses kirim OTP
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false); // Loading khusus tombol OTP
  
  // Cooldown Timer untuk tombol Kirim OTP
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // --- Fungsi 1: Minta Kode OTP (Resend) ---
  const handleRequestOTP = async () => {
    if (!email) {
      setErrorMsg("Mohon isi email terlebih dahulu untuk meminta OTP.");
      return;
    }
    
    setErrorMsg("");
    setSuccessMsg("");
    setIsSendingOtp(true);

    try {
      // Tembak endpoint /otp/request
      await api.post("/otp/request", { email });
      
      setSuccessMsg("Kode OTP terkirim! Cek email Anda.");
      setCooldown(60); // Set timer 60 detik sebelum bisa kirim lagi
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors?.email) {
          setErrorMsg(error.response.data.errors.email[0]);
      } else {
          setErrorMsg(error.response?.data?.message || "Gagal mengirim OTP.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // --- Fungsi 2: Login dengan OTP ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      // Tembak endpoint /otp/login
      // Perhatikan key 'otp_code' harus sama dengan validasi Laravel
      const response = await api.post("/otp/login", {
        email: email,
        otp_code: otpCode, 
      });

      if (response.data.success) {
        const { access_token, user } = response.data;

        // 1. Simpan Token
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));

        // 2. Redirect berdasarkan Role (Opsional)
        // Sesuaikan dengan role yang ada di database kamu (misal: 'patient', 'admin')
        if (user.role === 'admin' || user.role === 'superadmin') {
             router.push("/admin/dashboard");
        } else {
             router.push("/user/dashboard");
        }
      }

    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        // Menampilkan pesan error dari Backend (misal: "Kode OTP salah")
        setErrorMsg(error.response.data.message || "Terjadi kesalahan saat login.");
      } else {
        setErrorMsg("Gagal terhubung ke server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-md">
        
        {/* BAGIAN LOGO */}
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
          SELAMAT DATANG
        </h1>
        <p className="text-center text-neutral-600 mb-8 text-md">
          Masuk menggunakan Email & Kode OTP
        </p>

        {/* Form handle onSubmit */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* INPUT EMAIL */}
          <InputField
            label="Email"
            type="email"
            placeholder="Masukkan Email Anda"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          {/* INPUT OTP */}
          <InputField
            label="Kode OTP"
            type="text" // OTP biasanya angka, tapi text safe
            placeholder="6 digit kode (Cek Email)"
            icon={KeyRound} // Ganti icon jadi Key
            required
            value={otpCode}
            onChange={(e) => {
                // Hanya boleh input angka & max 6 digit
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(val);
            }}
            disabled={isLoading}
            // --- Tombol Minta OTP ada di sebelah label input OTP ---
            extraButton={
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={isSendingOtp || cooldown > 0 || !email}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                {isSendingOtp ? (
                    "Mengirim..."
                ) : cooldown > 0 ? (
                    `Kirim Ulang (${cooldown}s)`
                ) : (
                    <>
                     Kirim Kode OTP <Send className="w-3 h-3" />
                    </>
                )}
              </button>
            }
          />

          {/* Notifikasi Error / Sukses */}
          {errorMsg && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded animate-pulse border border-red-200">
                {errorMsg}
            </p>
          )}
          {successMsg && (
             <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded border border-green-200">
                {successMsg}
             </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 
              ${
                isLoading
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-800 hover:scale-[1.01]"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-600">
          Belum punya akun?{" "}
          <a
            href="/auth/register"
            className={`text-primary-600 font-bold hover:text-primary-800 ${
              isLoading ? "pointer-events-none text-neutral-400" : ""
            }`}
          >
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
}