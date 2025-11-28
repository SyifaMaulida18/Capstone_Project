"use client";

import api from "@/services/api"; 
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// --- Komponen InputField (Reusable) ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  endIcon, 
  onEndIconClick,
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={props.id || label}
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
        <input
          id={props.id || label}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border border-neutral-200 py-2 ${
            Icon ? "pl-10" : "pl-3"
          } ${
            endIcon ? "pr-10" : "pr-3"
          } text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 disabled:bg-neutral-100 disabled:text-neutral-500`}
          {...props}
        />
        {endIcon && (
          <button
            type="button"
            onClick={onEndIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-neutral-500 hover:text-neutral-700"
          >
            {endIcon}
          </button>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------------

export default function LoginAdminPage() {
  const router = useRouter();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Fungsi Login Admin ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const payload = {
        Email: email,
        Password: password,
      };

      const response = await api.post("/login", payload);
      const { access_token, role, admin } = response.data;

      if (access_token) {
        // 1. Simpan Token & Data
        localStorage.setItem("token", access_token);
        localStorage.setItem("user_role", role);
        localStorage.setItem("admin_data", JSON.stringify(admin));

        // 2. Redirect Berdasarkan Role
        if (role === 'superadmin') {
          router.push("/superadmin/admins");
        } else if (role === 'admin') {
          router.push("/admin/dashboard");
        } else {
          // Fallback jika role tidak dikenali (opsional)
          setErrorMsg("Role tidak dikenali.");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        setErrorMsg(
          error.response.data.message || "Email atau Password salah."
        );
      } else if (error.request) {
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan backend Laravel menyala.");
      } else {
        setErrorMsg("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-md">
        
        <div className="flex justify-center mb-6">
           <div className="bg-primary-100 p-4 rounded-full">
              <LogIn className="w-12 h-12 text-primary-600" />
           </div>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">
          PORTAL ADMIN
        </h1>
        <p className="text-center text-neutral-600 mb-8 text-md">
          Masuk untuk mengelola sistem
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <InputField
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="admin@rumahsakit.com"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
          />

          <InputField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan kata sandi"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
            endIcon={showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
            onEndIconClick={() => setShowPassword(!showPassword)}
          />

          {errorMsg && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200 animate-pulse">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 
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
                <LogIn className="w-5 h-12" />
                <span>Masuk Dashboard</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-8 text-neutral-500">
          Lupa kata sandi? Hubungi tim IT Support.
        </p>
      </div>
    </div>
  );
}