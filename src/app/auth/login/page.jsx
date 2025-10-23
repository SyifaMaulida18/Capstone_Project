"use client";

import { Lock, LogIn, User } from "lucide-react";
import { useState } from "react";

// --- Komponen InputField ---
const InputField = ({ label, type, placeholder, required, icon: Icon, ...props }) => {
  return (
    <div className="space-y-1">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          id={label}
          name={label}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border border-gray-300 py-2 ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150`}
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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Ambil data dari file lokal db.json
      const res = await fetch("/db.json");
      const data = await res.json();

      const { users, admins, superadmins } = data;

      // 1️⃣ Cek Superadmin
      const superAdmin = superadmins.find(
        (s) =>
          (s.email === emailOrKTP || s.superID.toString() === emailOrKTP) &&
          s.password === password
      );
      if (superAdmin) {
        localStorage.setItem("userRole", "superadmin");
        localStorage.setItem("userName", superAdmin.nama);
        window.location.href = "/superadmin/dashboard";
        return;
      }

      // 2️⃣ Cek Admin
      const admin = admins.find(
        (a) =>
          (a.email === emailOrKTP || a.adminID.toString() === emailOrKTP) &&
          a.password === password
      );
      if (admin) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", admin.nama);
        window.location.href = "/admin/dashboard";
        return;
      }

      // 3️⃣ Cek User
      const user = users.find(
        (u) =>
          (u.email === emailOrKTP || u.nomor_telpon === emailOrKTP || u.userID.toString() === emailOrKTP) &&
          u.password === password
      );
      if (user) {
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userName", user.nama);
        window.location.href = "/user/dashboard";
        return;
      }

      // Jika tidak ditemukan
      setErrorMsg("Email/No KTP atau Password salah.");
    } catch (err) {
      console.error("Gagal membaca db.json:", err);
      setErrorMsg("Terjadi kesalahan saat memuat data login.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white shadow-2xl border-t-8 border-blue-600 rounded-2xl p-8 md:p-12 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LogIn className="w-10 h-10 text-blue-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          SELAMAT DATANG
        </h1>
        <p className="text-center text-gray-500 mb-8 text-md">
          Masuk untuk melanjutkan reservasi Anda
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

          {errorMsg && (
            <p className="text-red-600 text-sm text-center font-medium">
              {errorMsg}
            </p>
          )}

          <div className="text-right text-sm">
            <a
              href="/auth/forgot_password/email"
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Lupa Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Masuk ke Akun</span>
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Belum punya akun?{" "}
          <a
            href="/auth/register"
            className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
          >
            Daftar Sekarang
          </a>
        </p>

        <p className="text-center text-xs mt-4 text-gray-400">
          <a href="/" className="hover:underline">
            Kembali ke Beranda
          </a>
        </p>
      </div>
    </div>
  );
}
