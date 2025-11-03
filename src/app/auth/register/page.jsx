"use client";

import { UserPlus, User, Mail, Smartphone, Lock } from "lucide-react";
import React, { useState } from "react";

// --- Komponen InputField yang Di-inline ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  value,
  onChange,
  options,
  ...props
}) => {
  // UBAH: Menggunakan neutral dan primary
  const inputClassName = `block w-full rounded-lg border border-neutral-200 py-2 ${
    Icon ? "pl-10" : "pl-3"
  } pr-3 text-neutral-900 placeholder-neutral-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150`;

  return (
    <div className="space-y-1">
      {/* UBAH: Menggunakan neutral-700 */}
      <label
        htmlFor={label}
        className="block text-sm font-medium text-neutral-700"
      >
        {label} {required && <span className="text-red-500">*</span>}{" "}
        {/* Warna red dipertahankan */}
      </label>
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* UBAH: Menggunakan neutral-600 */}
            <Icon className="h-5 w-5 text-neutral-600" aria-hidden="true" />
          </div>
        )}

        {type === "select" && options ? (
          <select
            id={label}
            name={label} // FIX: Seharusnya props.name atau label
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
            name={props.name || label} // FIX: Gunakan props.name jika ada, fallback ke label
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
const CompleteProfileModal = ({ isVisible, onClose, onConfirm }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center transform scale-100 transition-all duration-300">
        {/* UBAH: Menggunakan primary-600 */}
        <div className="text-primary-600 mb-4 flex justify-center">
          <UserPlus className="w-10 h-10" />
        </div>
        {/* UBAH: Menggunakan neutral-900 */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3">
          Lengkapi Data Diri Anda!
        </h3>
        {/* UBAH: Menggunakan neutral-600 */}
        <p className="text-neutral-600 mb-6">
          Untuk dapat melakukan **Reservasi Online**, Anda wajib mengisi data diri
          lengkap (KTP, KK, Alamat, dll.).
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            /* UBAH: Menggunakan neutral-200, neutral-700, hover:bg-neutral-100 */
            className="flex-1 px-4 py-2 border border-neutral-200 rounded-full text-neutral-700 hover:bg-neutral-100 transition"
          >
            Nanti Saja (Lihat Jadwal)
          </button>
          <button
            onClick={onConfirm}
            /* UBAH: Menggunakan primary-600, hover:bg-primary-800 */
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    password: "",
    confirmPassword: "",
  });
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    // FIX: Gunakan e.target.name yang benar dari InputField
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => { /* ... Logika register tetap sama ... */ };
  const handleCompleteProfile = () => { /* ... Logika modal tetap sama ... */ };
  const handleCloseModal = () => { /* ... Logika modal tetap sama ... */ };

  return (
    <>
      {/* UBAH: Menggunakan gradasi primary */}
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        {/* UBAH: Menggunakan border-primary-600 */}
        <div className="bg-white shadow-2xl border-t-8 border-primary-600 rounded-2xl p-8 md:p-12 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">
          <div className="flex justify-center mb-6">
            {/* UBAH: Menggunakan text-primary-600 */}
            <UserPlus className="w-10 h-10 text-primary-600" />
          </div>

          {/* UBAH: Menggunakan text-neutral-900 */}
          <h1 className="text-3xl font-extrabold text-center text-neutral-900 mb-2">
            DAFTAR AKUN BARU
          </h1>
          {/* UBAH: Menggunakan text-neutral-600 */}
          <p className="text-center text-neutral-600 mb-8 text-md">
            Hanya butuh beberapa detik untuk membuat akun Anda.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            <InputField label="Nama Lengkap" type="text" name="namaLengkap" placeholder="Nama lengkap Anda" required icon={User} value={formData.namaLengkap} onChange={handleChange} />
            <InputField label="Email" type="email" name="email" placeholder="contoh@mail.com" required icon={Mail} value={formData.email} onChange={handleChange} />
            <InputField label="Nomor Telepon (WA)" type="tel" name="noTelepon" placeholder="Contoh: 0812xxxxxxxx" required icon={Smartphone} value={formData.noTelepon} onChange={handleChange} />
            <InputField label="Kata Sandi" type="password" name="password" placeholder="Min. 8 Karakter" required icon={Lock} value={formData.password} onChange={handleChange} />
            <InputField label="Konfirmasi Kata Sandi" type="password" name="confirmPassword" placeholder="Ulangi Kata Sandi" required icon={Lock} value={formData.confirmPassword} onChange={handleChange} />

            <button
              type="submit"
              /* UBAH: Menggunakan secondary */
              className="w-full bg-secondary-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-secondary-600 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center space-x-2 mt-8"
            >
              <UserPlus className="w-5 h-5" />
              <span>Daftar Sekarang</span>
            </button>
          </form>

          {/* UBAH: Menggunakan text-neutral-600 dan primary-600 */}
          <p className="text-center text-sm mt-6 text-neutral-600">
            Sudah punya akun?{" "}
            <a href="/auth/login" className="text-primary-600 font-bold hover:text-primary-800 transition-colors">
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