// src/app/user/profile/page.js

"use client";

import {
  User,
  Mail,
  Smartphone,
  Calendar,
  Clipboard,
  MapPin,
  Briefcase,
  X,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Menu,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Impor useRouter
import api from "../../../services/api"; // 2. Impor helper API Anda
import Sidebar from "@/components/user/Sidebar";

// --- Komponen InputField (Tidak Berubah) ---
const InputField = ({
  label,
  type,
  placeholder,
  required,
  icon: Icon,
  value,
  onChange,
  options,
  disabled,
  ...props
}) => {
  const inputClassName = `block w-full rounded-lg border ${
    disabled ? "border-neutral-200 bg-neutral-50" : "border-neutral-200"
  } py-2 ${Icon ? "pl-10" : "pl-3"} pr-3 ${
    disabled ? "text-neutral-600" : "text-neutral-900"
  } placeholder-neutral-600 focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition duration-150`;

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
            name={props.name || label}
            required={required}
            className={inputClassName}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
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
            name={props.name || label}
            type={type}
            placeholder={placeholder}
            required={required}
            className={inputClassName}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
        )}
      </div>
    </div>
  );
};
// -----------------------------------------------------------------------------------

// --- MODE 2: FORMULIR PENGISIAN/EDIT PROFIL ---
const ProfileCompletionForm = ({
  setViewMode,
  initialProfileData, // Ini adalah data profil yang ada (atau {} jika baru)
  userData, // Ini adalah data user (nama, email, tlp)
  setProfileData, // Fungsi untuk update state di parent
  isComplete,
}) => {
  // Inisialisasi state formData (Tidak Berubah)
  const [formData, setFormData] = useState({
    lokasi: initialProfileData.lokasi || "",
    jenis_kelamin: initialProfileData.jenis_kelamin || "",
    noKTP: initialProfileData.noKTP || "",
    suku: initialProfileData.suku || "",
    tempat_lahir: initialProfileData.tempat_lahir || "",
    tanggal_lahir: initialProfileData.tanggal_lahir || "",
    status_keluarga: initialProfileData.status_keluarga || "",
    nama_keluarga: initialProfileData.nama_keluarga || "",
    agama: initialProfileData.agama || "",
    status_perkawinan: initialProfileData.status_perkawinan || "",
    pendidikan_terakhir: initialProfileData.pendidikan_terakhir || "",
    alamat: initialProfileData.alamat || "",
    provinsi: initialProfileData.provinsi || "",
    "kota/kabupaten": initialProfileData["kota/kabupaten"] || "",
    kecamatan: initialProfileData.kecamatan || "",
    kelurahan: initialProfileData.kelurahan || "",
    nomor_telepon: initialProfileData.nomor_telepon || "",
    nomor_pegawai: initialProfileData.nomor_pegawai || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    // Validasi frontend sederhana (Tidak Berubah)
    if (!formData.noKTP || formData.noKTP.length !== 16) {
      setErrors({ noKTP: "No KTP harus 16 digit." });
      setIsSaving(false);
      return;
    }

    try {
      // 3. Menggunakan api.post (Axios). Header & Token sudah otomatis.
      const res = await api.post("/profile", formData);

      // Jika sukses (status 2xx)
      setProfileData(res.data.data); // Update state di parent dengan data baru
      console.log("Data diri berhasil disimpan!");
      setViewMode("summary"); // Kembali ke halaman ringkasan

    } catch (error) {
      // 4. Penanganan error untuk Axios
      if (error.response && error.response.status === 422) {
        // Handle error validasi dari Laravel
        setErrors(error.response.data.errors);
        console.error("Validasi gagal:", error.response.data.errors);
      } else {
        // Handle error server lainnya
        console.error("Gagal menyimpan profil:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    console.log("Kembali ke ringkasan profil.");
    setViewMode("summary");
  };

  const formTitle = isComplete
    ? "Edit Detail Profil"
    : "Lengkapi Data Profil (Wajib Reservasi)";

  // --- JSX untuk Form (Tidak Berubah) ---
  return (
    <div className="flex-1 bg-white p-6 md:p-10 rounded-r-xl shadow-inner overflow-y-auto h-full scrollbar-hide">
      <button
        onClick={handleGoBack}
        className="text-neutral-600 hover:text-primary-800 flex items-center mb-6 transition duration-150"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Kembali ke Ringkasan Profil
      </button>

      <h1 className="text-3xl font-extrabold text-neutral-900 mb-6 border-b pb-2">
        {formTitle}
      </h1>
      
      {errors.message && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {errors.message}
          </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* BAGIAN 1: DATA AKUN & IDENTITAS UTAMA */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 border-b pb-6">
          <h2 className="col-span-full text-xl font-bold text-primary-800 mb-4">
            Informasi Akun (Tidak dapat diubah)
          </h2>
          <InputField label="Nama Lengkap" type="text" value={userData.name} disabled icon={User} />
          <InputField label="Email" type="email" value={userData.email} disabled icon={Mail} />
          <InputField label="Nomor Telepon (WA)" type="tel" value={userData.nomor_telepon_user} disabled icon={Smartphone} />
          <InputField label="Kata Sandi" type="password" placeholder="******" value="******" disabled icon={Settings} />
        </div>

        {/* BAGIAN 2: DATA IDENTITAS & ALAMAT LENGKAP (Sesuai Controller) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <h2 className="col-span-full text-xl font-bold text-neutral-800 mb-4 mt-4">
            Data Diri & Alamat
          </h2>
          
          <InputField label="No KTP" type="text" name="noKTP" placeholder="16 digit No KTP" required value={formData.noKTP} onChange={handleChange} maxLength={16} icon={Clipboard} />
          {errors.noKTP && <p className="text-red-500 text-sm col-span-full md:col-span-1">{errors.noKTP[0]}</p>}

          <InputField label="Jenis Kelamin" type="select" name="jenis_kelamin" required options={['laki-laki', 'Perempuan']} value={formData.jenis_kelamin} onChange={handleChange} icon={User} />
          <InputField label="Tempat Lahir" type="text" name="tempat_lahir" placeholder="Kota/Kabupaten" required value={formData.tempat_lahir} onChange={handleChange} icon={MapPin} />
          <InputField label="Tanggal Lahir" type="date" name="tanggal_lahir" required value={formData.tanggal_lahir} onChange={handleChange} icon={Calendar} />
          <InputField label="Status Perkawinan" type="select" name="status_perkawinan" required options={['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']} value={formData.status_perkawinan} onChange={handleChange} icon={Briefcase} />
          <InputField label="Pendidikan Terakhir" type="select" name="pendidikan_terakhir" required options={['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3', 'Tidak Sekolah']} value={formData.pendidikan_terakhir} onChange={handleChange} icon={Briefcase} />
          <InputField label="Agama" type="select" name="agama" required options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']} value={formData.agama} onChange={handleChange} icon={Briefcase} />

          {/* Field opsional */}
          <InputField label="Lokasi" type="text" name="lokasi" placeholder="Lokasi (opsional)" value={formData.lokasi} onChange={handleChange} icon={MapPin} />
          <InputField label="Suku" type="text" name="suku" placeholder="Suku (opsional)" value={formData.suku} onChange={handleChange} icon={User} />
          <InputField label="Status Keluarga" type="text" name="status_keluarga" placeholder="Cth: Kepala Keluarga" value={formData.status_keluarga} onChange={handleChange} icon={User} />
          <InputField label="Nama Keluarga" type="text" name="nama_keluarga" placeholder="Nama Anggota Keluarga" value={formData.nama_keluarga} onChange={handleChange} icon={User} />
          <InputField label="Nomor Pegawai" type="text" name="nomor_pegawai" placeholder="Nomor Pegawai (jika ada)" value={formData.nomor_pegawai} onChange={handleChange} icon={Briefcase} />
          <InputField label="Nomor Telepon (Profil)" type="tel" name="nomor_telepon" placeholder="Nomor telepon (opsional)" value={formData.nomor_telepon} onChange={handleChange} icon={Smartphone} />

          {/* Alamat Lengkap */}
          <div className="col-span-full pt-4">
            <h3 className="font-semibold text-neutral-700">Detail Alamat</h3>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <InputField label="Alamat Jalan Lengkap" type="text" name="alamat" placeholder="Contoh: Jl. Sudirman No. 12 RT 01/RW 02" required value={formData.alamat} onChange={handleChange} icon={MapPin} />
          </div>
          <InputField label="Provinsi" type="text" name="provinsi" placeholder="Contoh: Kalimantan Timur" required value={formData.provinsi} onChange={handleChange} />
          <InputField label="Kabupaten/Kota" type="text" name="kota/kabupaten" placeholder="Contoh: Balikpapan" required value={formData['kota/kabupaten']} onChange={handleChange} />
          <InputField label="Kecamatan" type="text" name="kecamatan" placeholder="Nama Kecamatan" required value={formData.kecamatan} onChange={handleChange} />
          <InputField label="Kelurahan" type="text" name="kelurahan" placeholder="Nama Kelurahan/Desa" required value={formData.kelurahan} onChange={handleChange} />
        </div>

        {/* Footer Form: Tombol Simpan dan Kembali */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={handleGoBack}
            className="sm:w-auto w-full border border-neutral-200 text-neutral-700 font-medium py-3 px-6 rounded-xl shadow-sm hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Batal & Kembali</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="sm:w-auto w-full bg-primary-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-primary-800 transition-all duration-300 transform hover:scale-[1.005] flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- MODE 1: RINGKASAN PROFIL UTAMA (Tidak Berubah) ---
const ProfileSummaryView = ({ profileData, isComplete, setViewMode }) => {
  const StatusIcon = isComplete ? CheckCircle : AlertTriangle;
  const statusColor = isComplete ? "text-green-600" : "text-yellow-600";
  const statusBg = isComplete ? "bg-green-50" : "bg-yellow-50";
  const statusText = isComplete ? "LENGKAP" : "BELUM LENGKAP";

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-neutral-600 font-medium">{label}</p>
      <p className="font-semibold text-neutral-800">
        {value || "- Belum Diisi -"}
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-white p-6 md:p-10 rounded-r-xl shadow-inner overflow-y-auto h-full scrollbar-hide">
      <h1 className="text-3xl font-extrabold text-neutral-900 mb-6 border-b pb-2">
        Ringkasan Profil
      </h1>

      {/* Status Card */}
      <div
        className={`p-6 rounded-xl shadow-lg ${statusBg} border border-dashed ${
          isComplete ? "border-green-300" : "border-yellow-300"
        } mb-8`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <StatusIcon className={`w-8 h-8 ${statusColor}`} />
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Status Kelengkapan Data Medis
              </p>
              <h2 className={`text-2xl font-bold ${statusColor}`}>
                {statusText}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setViewMode("complete")}
            className={`px-6 py-2 rounded-full font-semibold transition duration-150 flex items-center space-x-2
              ${
                isComplete
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isComplete ? "Edit Data Profil" : "Lengkapi Sekarang"}</span>
          </button>
        </div>
      </div>

      {/* Detailed Info (Summary Grid) */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200">
        <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
          <Clipboard className="w-5 h-5 mr-2" /> Data Diri Utama
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <InfoItem label="No. KTP" value={profileData.noKTP} />
          <InfoItem label="Jenis Kelamin" value={profileData.jenis_kelamin} />
          <InfoItem label="Tanggal Lahir" value={profileData.tanggal_lahir} />
          <InfoItem label="Tempat Lahir" value={profileData.tempat_lahir} />
          <InfoItem label="Agama" value={profileData.agama} />
          <InfoItem
            label="Status Perkawinan"
            value={profileData.status_perkawinan}
          />
          <InfoItem
            label="Pendidikan"
            value={profileData.pendidikan_terakhir}
          />
          <InfoItem label="Suku" value={profileData.suku} />
          <InfoItem label="No. Pegawai" value={profileData.nomor_pegawai} />
        </div>
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" /> Alamat Terdaftar
          </h3>
          <p className="text-neutral-700 font-medium">
            {profileData.alamat || "Alamat belum terisi."}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            {profileData.kelurahan} - {profileData.kecamatan},{" "}
            {profileData["kota/kabupaten"]}, {profileData.provinsi}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA (PAGE) ---
export default function ProfilePage() {
  const [viewMode, setViewMode] = useState("summary");
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter(); // 5. Inisialisasi router

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // 1. Muat data user dasar dari localStorage (Tidak Berubah)
      const baseUserData = {
        name: localStorage.getItem("userName") || "Nama User",
        email: localStorage.getItem("userEmail") || "",
        nomor_telepon_user: localStorage.getItem("userPhone") || "",
      };
      setUserData(baseUserData);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token tidak ditemukan, harap login.");
        router.push("/auth/login"); // 6. Redirect jika tidak ada token
        setIsLoading(false);
        return;
      }

      // 2. Ambil data profil dari backend menggunakan api.js
      try {
        // 7. Menggunakan api.get (Axios). Header & Token sudah otomatis.
        const res = await api.get("/profile");

        // Jika sukses (status 2xx)
        setProfileData(res.data.data); // Data profil berhasil diambil
        setViewMode("summary");

      } catch (error) {
        // 8. Penanganan error untuk Axios
        if (error.response && error.response.status === 404) {
          // Kasus: User login tapi belum punya profil (respons 404 dari controller)
          console.log("Profil tidak ditemukan, mengarahkan ke form pelengkapan.");
          setProfileData({}); // Atur sebagai objek kosong agar form tidak error
          setViewMode("complete"); // Langsung arahkan ke form
        } else {
          // Error server lainnya
          console.error("Gagal memuat data profil:", error);
          // Mungkin tampilkan pesan error
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [router]); // Tambahkan router ke dependency array useEffect

  // Cek kelengkapan profil (Tidak Berubah)
  const isProfileComplete =
    profileData && profileData.noKTP && profileData.noKTP.length === 16;

  const scrollbarHideStyle = `
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
    `;

  // Tampilkan loading (Tidak Berubah)
  if (isLoading || !userData || !profileData) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 p-6 bg-white rounded-xl shadow-lg">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-neutral-700 font-medium">
            Memuat data profil...
          </span>
        </div>
      </div>
    );
  }

  // --- JSX Halaman Utama (Tidak Berubah) ---
  return (
    <div className="min-h-screen bg-neutral-100 flex items-start justify-center p-0 md:p-8">
      <style jsx>{scrollbarHideStyle}</style>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-full shadow-lg md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="w-full max-w-7xl bg-white rounded-xl shadow-2xl flex flex-col md:flex-row h-screen md:h-[90vh]">
        <Sidebar
          activeTab={viewMode}
          setActiveTab={setViewMode}
          profileData={{ name: userData.name, email: userData.email }} 
          isComplete={isProfileComplete}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Content Area */}
        {viewMode === "summary" || viewMode === "complete" ? (
          viewMode === "summary" ? (
            <ProfileSummaryView
              profileData={profileData}
              isComplete={isProfileComplete}
              setViewMode={setViewMode}
            />
          ) : (
            <ProfileCompletionForm
              setViewMode={setViewMode}
              initialProfileData={profileData}
              userData={userData}
              setProfileData={setProfileData}
              isComplete={isProfileComplete}
            />
          )
        ) : (
          <div className="flex-1 p-10 flex items-center justify-center text-neutral-600 h-full">
            Konten untuk tab lain (Dashboard, Riwayat, dll).
          </div>
        )}
      </div>
    </div>
  );
}