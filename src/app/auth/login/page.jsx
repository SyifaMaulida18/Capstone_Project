"use client";

import { Lock, LogIn, User } from "lucide-react";
import { useState } from "react";

// --- Komponen InputField ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={label}
        className="block text-sm font-medium text-neutral-700"
      >
        {label} {required && <span className="text-red-500">*</span>}{" "}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
          </div>
        )}
        <input
          id={label}
          name={props.name || label} // Gunakan props.name jika ada, fallback ke label
          type={type}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border border-neutral-200 py-2 ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150`}
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

  // --- Fungsi Handle Login yang Sudah Diperbaiki ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Reset pesan error setiap kali login dicoba

    try {
      // Pastikan db.json ada di folder /public
      const res = await fetch("/db.json");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const { users, admins, superadmins, profile } = data; // Tambahkan profile

      // 1️⃣ Cek Superadmin (berdasarkan email ATAU superID)
      const superAdmin = superadmins.find(
        (s) =>
          (s.email === emailOrKTP || s.superID.toString() === emailOrKTP) &&
          s.password === password
      );
      if (superAdmin) {
        localStorage.setItem("userRole", "superadmin");
        localStorage.setItem("userName", superAdmin.nama);
        localStorage.setItem("userID", superAdmin.superID.toString()); // Simpan ID juga jika perlu
        window.location.href = "/superadmin/dashboard"; // Sesuaikan path jika perlu
        return;
      }

      // 2️⃣ Cek Admin (berdasarkan email ATAU adminID)
      const admin = admins.find(
        (a) =>
          (a.email === emailOrKTP || a.adminID.toString() === emailOrKTP) &&
          a.password === password
      );
      if (admin) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", admin.nama);
        localStorage.setItem("userID", admin.adminID.toString()); // Simpan ID juga jika perlu
        window.location.href = "/admin/dashboard"; // Sesuaikan path jika perlu
        return;
      }

      // 3️⃣ Cek User
      let foundUser = null;

      // Coba cari berdasarkan email atau nomor telepon dulu di tabel 'users'
      foundUser = users.find(
        (u) =>
          (u.email === emailOrKTP || u.nomor_telpon === emailOrKTP) &&
          u.password === password
      );

      // Jika TIDAK ketemu berdasarkan email/telp, coba cari berdasarkan NIK di tabel 'profile'
      if (!foundUser) {
        const userProfile = profile.find((p) => p.noKTP === emailOrKTP);
        if (userProfile) {
          // Jika profile ketemu berdasarkan NIK, cari user yang cocok berdasarkan userID
          foundUser = users.find(
            (u) => u.userID === userProfile.userID && u.password === password
          );
        }
      }

      // Jika user ditemukan (baik dari email/telp ATAU NIK)
      if (foundUser) {
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userName", foundUser.nama);
        localStorage.setItem("userID", foundUser.userID.toString()); // Simpan userID
        window.location.href = "/user/dashboard"; // Sesuaikan path jika perlu
        return;
      }

      // Jika tidak ditemukan sama sekali
      setErrorMsg("Email/No KTP atau Password salah.");

    } catch (err) {
      console.error("Gagal memproses login:", err);
      setErrorMsg(
        "Terjadi kesalahan saat mencoba login. Periksa koneksi atau data."
      );
    }
  };
  // --- Akhir Fungsi Handle Login ---

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
          Masuk untuk melanjutkan reservasi Anda
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <InputField
            label="Email atau No. KTP"
            type="text"
            name="emailOrKTP" // Gunakan name agar lebih standar
            placeholder="Masukkan Email atau No. KTP"
            icon={User}
            required
            value={emailOrKTP}
            onChange={(e) => setEmailOrKTP(e.target.value)}
          />
          <InputField
            label="Password"
            type="password"
            name="password" // Gunakan name agar lebih standar
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
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-primary-800 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Masuk ke Akun</span>
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-600">
          Belum punya akun?{" "}
          <a
            href="/auth/register"
            className="text-primary-600 font-bold hover:text-primary-800 transition-colors"
          >
            Daftar Sekarang
          </a>
        </p>

        <p className="text-center text-xs mt-4 text-neutral-600">
          <a href="/" className="hover:underline">
            Kembali ke Beranda
          </a>
        </p>
      </div>
    </div>
  );
}