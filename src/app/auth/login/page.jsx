"use client";

import api from "@/services/api";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Komponen Input Helper
const InputField = ({ label, type, placeholder, required, icon: Icon, endIcon, onEndIconClick, ...props }) => {
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
          className={`block w-full rounded-lg border border-neutral-200 py-2 ${Icon ? "pl-10" : "pl-3"} ${endIcon ? "pr-10" : "pr-3"} text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 disabled:bg-neutral-100 disabled:text-neutral-500`}
          {...props}
        />
        {endIcon && (
          <button type="button" onClick={onEndIconClick} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-neutral-500 hover:text-neutral-700">
            {endIcon}
          </button>
        )}
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // -----------------------------------------------------------
      // 1. COBA LOGIN SEBAGAI USER (PASIEN)
      // -----------------------------------------------------------
      try {
        const responseUser = await api.post("/login-user", { 
            email: email, 
            password: password 
        });

        if (responseUser.data.success) {
          const { access_token, user } = responseUser.data.data;

          localStorage.setItem("token", access_token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", "user");

          router.push("/user/dashboard");
          return; 
        }
      } catch (userError) {
        // Cek Verifikasi 403 (User ada tapi belum verifikasi OTP)
        if (userError.response && userError.response.status === 403) {
            const data = userError.response.data;
            if(data.needs_verification) {
                localStorage.setItem("pending_verification_email", email);
                router.push("/otp/verify"); 
                return;
            }
        }
        
        // Jika Error Server (500), lempar error (jangan lanjut ke admin)
        if (userError.response && userError.response.status >= 500) {
            throw userError;
        }

        // Jika Error 401 (Password Salah) atau 404 (User tidak ketemu),
        // Kita ABAIKAN error ini dan LANJUT mencoba Login Admin di bawah.
      }

      // -----------------------------------------------------------
      // 2. COBA LOGIN SEBAGAI ADMIN (FALLBACK)
      // -----------------------------------------------------------
      
      const responseAdmin = await api.post("/login", { 
          Email: email, 
          Password: password 
      });
      
      const adminData = responseAdmin.data; 
      
      if (adminData.access_token || adminData.token) {
          const token = adminData.access_token || adminData.token;
          const userAdmin = adminData.admin || adminData.user; 

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userAdmin));
          
          const role = adminData.role || userAdmin?.role || "admin"; 
          localStorage.setItem("role", role);

          // === LOGIKA PENGALIHAN HALAMAN ===
          if (role === "superadmin") {
            router.push("/superadmin/admins");
          } 
          else if (role === "admin") {
            // Cek apakah Admin punya Poli ID?
            if (userAdmin.poli_id) {
                // Admin Poli -> Ke Counter Poli
                router.push("/admin-poli/dashboard");
            } else {
                // Admin Biasa (Tanpa Poli) -> Ke Dashboard Umum
                router.push("/admin/dashboard");
            }
          } 
          else {
            // Fallback default
            router.push("/admin/dashboard");
          }

      } else {
        throw new Error("Gagal login admin.");
      }

    } catch (error) {
      console.error("Login Failed:", error);
      if (error.response) {
        if(error.response.status === 401 || error.response.status === 404) {
            setErrorMsg("Email atau kata sandi salah.");
        } else if (error.response.status === 422) {
            setErrorMsg("Format data tidak sesuai.");
        } else {
            setErrorMsg(error.response.data.message || "Terjadi kesalahan server.");
        }
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
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.svg" alt="Logo Aplikasi" width={120} height={120} priority className="object-contain h-24 w-auto" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">SELAMAT DATANG</h1>
        <p className="text-center text-neutral-600 mb-8 text-md">Masuk ke akun Anda</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <InputField label="Email" type="email" placeholder="Masukkan Email Anda" icon={Mail} required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
          
          <InputField 
            label="Kata Sandi" 
            type={showPassword ? "text" : "password"} 
            placeholder="Masukkan Kata Sandi" 
            icon={Lock} 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isLoading} 
            endIcon={showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>} 
            onEndIconClick={() => setShowPassword(!showPassword)} 
          />

          {errorMsg && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded animate-pulse border border-red-200">{errorMsg}</p>
          )}

          <button type="submit" disabled={isLoading} className={`w-full text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 ${isLoading ? "bg-neutral-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-800 hover:scale-[1.01]"}`}>
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Memproses...</span></> : <><LogIn className="w-5 h-5" /><span>Masuk Sekarang</span></>}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-600">
          Belum punya akun? <a href="/auth/register" className={`text-primary-600 font-bold hover:text-primary-800 ${isLoading ? "pointer-events-none text-neutral-400" : ""}`}>Daftar Sekarang</a>
        </p>
      </div>
    </div>
  );
}