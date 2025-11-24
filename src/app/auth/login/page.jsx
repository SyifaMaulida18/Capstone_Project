"use client";

import { Lock, LogIn, Mail, Loader2 } from "lucide-react"; // Tambah Loader2 untuk ikon loading
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image"; 
import api from '../../../services/api';

// --- Komponen InputField (Tidak ada perubahan) ---
const InputField = ({ label, type, placeholder, required, icon: Icon, ...props }) => {
  return (
    <div className="space-y-1">
      <label htmlFor={label} className="block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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
          className={`block w-full rounded-lg border border-neutral-200 py-2 ${Icon ? "pl-10" : "pl-3"} pr-3 text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150`}
          {...props}
        />
      </div>
    </div>
  );
};
// -----------------------------------------------------------------------------------

export default function LoginPage() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 1. Tambah state loading
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault(); // Ini memastikan Enter men-trigger submit tanpa reload halaman
    setErrorMsg("");
    setIsLoading(true); // Mulai loading

    try {
      // 1️⃣ Coba login admin/superadmin
      const adminRes = await api.post("/login", {
        Email: email, 
        Password: password, 
      });

      localStorage.setItem("token", adminRes.data.access_token);
      localStorage.setItem("userRole", adminRes.data.role);
      localStorage.setItem("userName", adminRes.data.admin.nama);
      localStorage.setItem("userID", adminRes.data.admin.id);
      
      router.push("/admin/dashboard");
      // Jangan set isLoading(false) di sini agar tombol tetap loading saat redirect
      return;

    } catch (adminError) {
      // 2️⃣ Kalau login admin gagal, coba login user biasa
      try {
        const userRes = await api.post("/login-user", {
          email: email, 
          password: password,
        });

        const userData = userRes.data;
        localStorage.setItem("token", userData.access_token);
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userID", userData.user.id);
        localStorage.setItem("userName", userData.user.name);
        localStorage.setItem("userEmail", userData.user.email);
        localStorage.setItem("userPhone", userData.user.nomor_telepon);
        
        router.push("/user/dashboard");
        return;

      } catch (userError) {
        console.error("Login gagal:", userError);
        if (userError.response && userError.response.data) {
          setErrorMsg(userError.response.data.message || "Email atau password salah.");
        } else {
          setErrorMsg("Terjadi kesalahan server atau koneksi.");
        }
        setIsLoading(false); // Matikan loading hanya jika GAGAL total
      }
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
          Masuk untuk melanjutkan
        </p>

        {/* Form handle onSubmit, jadi tekan ENTER otomatis submit */}
        <form onSubmit={handleLogin} className="space-y-6">
          <InputField
            label="Email"
            type="email" 
            placeholder="Masukkan Email Anda"
            icon={Mail} 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading} // Disable input saat loading
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Masukkan Password Anda"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading} // Disable input saat loading
          />

          {errorMsg && <p className="text-red-600 text-sm text-center animate-pulse">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isLoading} // Matikan tombol saat loading
            className={`w-full text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 
              ${isLoading 
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
                <span>Masuk ke Akun</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-600">
          Belum punya akun?{" "}
          <a href="/auth/register" className={`text-primary-600 font-bold hover:text-primary-800 ${isLoading ? "pointer-events-none text-neutral-400" : ""}`}>
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
}