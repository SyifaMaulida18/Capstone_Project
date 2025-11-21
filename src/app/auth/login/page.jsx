"use client";

import { Lock, LogIn, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation'; 
import api from '../../../services/api'; 

// --- Komponen InputField ---
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
  const [emailOrKTP, setEmailOrKTP] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // LOGIN ADMIN / SUPERADMIN
      const adminRes = await api.post("/login", {
        Email: emailOrKTP, 
        Password: password, 
      });

      const data = adminRes.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userRole", data.role);
      
      if (data.admin) {
          localStorage.setItem("userName", data.admin.Nama); 
          localStorage.setItem("userID", data.admin.adminID);
      }

      if (data.role === 'superadmin') {
        router.push("/superadmin/dashboard"); 
      } else {
        router.push("/admin/dashboard");
      }

      return;

    } catch (adminError) {
      console.error("Gagal Login Admin:", adminError.response?.data || adminError.message);
      // 2️⃣ Kalau login admin gagal, coba login user biasa
      try {
        const userRes = await api.post("/login-user", {
          email: emailOrKTP,
          password: password,
        });

        // Jika sukses
        const userData = userRes.data; // Data ada di dalam `userRes.data`
        localStorage.setItem("token", userData.access_token);
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userID", userData.user.id);
        localStorage.setItem("userName", userData.user.name);
        localStorage.setItem("userEmail", userData.user.email);
        localStorage.setItem("userPhone", userData.user.nomor_telepon);
        
        router.push("/user/dashboard"); // 4. Gunakan router.push
        return;

      } catch (userError) {
        // Kalau keduanya gagal
        console.error("Login gagal:", userError);
        if (userError.response && userError.response.data) {
             setErrorMsg(userError.response.data.message || "Email/NIK atau password salah.");
        } else if (adminError.response && adminError.response.data) {
             setErrorMsg(adminError.response.data.message || "Login gagal.");
        } else {
             setErrorMsg("Terjadi kesalahan server atau koneksi.");
        }
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LogIn className="w-10 h-10 text-primary-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">
          SELAMAT DATANG
        </h1>
        <p className="text-center text-neutral-600 mb-8 text-md">
          Masuk untuk melanjutkan
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <InputField
            label="Email atau No. KTP"
            type="text"
            placeholder="Masukkan Email atau No. KTP"
            icon={User}
            required
            value={emailOrKTP}
            onChange={(e) => setEmailOrKTP(e.target.value)}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Masukkan Password Anda"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-primary-800 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Masuk ke Akun</span>
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-600">
          Belum punya akun?{" "}
          <a href="/auth/register" className="text-primary-600 font-bold hover:text-primary-800">
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
}
