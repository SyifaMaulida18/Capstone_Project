"use client";

import {
  User,
  Mail,
  Smartphone,
  Clipboard,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Menu,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/user/Sidebar"; // Pastikan path sidebar sesuai
import api from "@/services/api"; // Pastikan path api service sesuai

// --- InputField (Komponen UI - Tidak Berubah) ---
const InputField = ({ label, type, placeholder, required, icon: Icon, value, onChange, options, disabled, hasError, ...props }) => {
  const inputClassName = `block w-full rounded-xl border ${
    hasError 
      ? "border-red-500 bg-red-50 text-red-900 focus:ring-red-200" 
      : disabled 
        ? "border-neutral-200 bg-neutral-50 text-neutral-500" 
        : "border-neutral-200 text-neutral-900 focus:ring-blue-500/20 focus:border-blue-500"
  } py-2.5 ${Icon ? "pl-10" : "pl-4"} pr-4 placeholder-neutral-400 focus:ring-2 sm:text-sm transition duration-200`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={label} className="block text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${hasError ? "text-red-400" : "text-neutral-400"}`} aria-hidden="true" />
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
            <option value="" disabled>-- Pilih {label} --</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
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

// --- FORM COMPONENT (Create/Update) ---
const ProfileCompletionForm = ({ setViewMode, initialProfileData, userData, refreshProfile, isComplete }) => {
  // Inisialisasi state dengan data yang ada atau string kosong (agar controlled input)
  const [formData, setFormData] = useState({
    lokasi: initialProfileData?.lokasi || "",
    jenis_kelamin: initialProfileData?.jenis_kelamin || "",
    noKTP: initialProfileData?.noKTP || "",
    suku: initialProfileData?.suku || "",
    tempat_lahir: initialProfileData?.tempat_lahir || "",
    tanggal_lahir: initialProfileData?.tanggal_lahir || "",
    status_keluarga: initialProfileData?.status_keluarga || "",
    nama_keluarga: initialProfileData?.nama_keluarga || "",
    agama: initialProfileData?.agama || "",
    status_perkawinan: initialProfileData?.status_perkawinan || "",
    pendidikan_terakhir: initialProfileData?.pendidikan_terakhir || "",
    alamat: initialProfileData?.alamat || "",
    provinsi: initialProfileData?.provinsi || "",
    "kota/kabupaten": initialProfileData?.["kota/kabupaten"] || "",
    kecamatan: initialProfileData?.kecamatan || "",
    kelurahan: initialProfileData?.kelurahan || "",
    nomor_telepon: initialProfileData?.nomor_telepon || "",
    nomor_pegawai: initialProfileData?.nomor_pegawai || "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Hapus error spesifik field saat user mengetik ulang
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    setGeneralError("");

    try {
      // Kirim Data ke Backend (POST /profile untuk Create & Update)
      const response = await api.post("/profile", formData);

      if (response.status === 200 || response.status === 201) {
        await refreshProfile(); // Refresh data di state utama
        setViewMode("summary");   // Kembali ke summary
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      
      if (error.response) {
        if (error.response.status === 422) {
          // Error Validasi Laravel
          setErrors(error.response.data.errors);
          setGeneralError("Mohon periksa kembali data yang Anda masukkan.");
        } else {
          setGeneralError(error.response.data.message || "Terjadi kesalahan saat menyimpan data.");
        }
      } else {
        setGeneralError("Gagal terhubung ke server.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto h-full scrollbar-hide">
      <button
        onClick={() => setViewMode("summary")}
        className="text-neutral-500 hover:text-blue-600 flex items-center mb-6 transition duration-150 font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Kembali ke Ringkasan
      </button>

      <h1 className="text-2xl font-bold text-neutral-800 mb-1">
        {isComplete ? "Edit Profil" : "Lengkapi Profil"}
      </h1>
      <p className="text-neutral-500 mb-8 text-sm">Pastikan data sesuai dengan kartu identitas Anda.</p>
      
      {generalError && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center">
             <AlertTriangle className="w-5 h-5 mr-2" />
             {generalError}
          </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Akun (Read Only - Dari User Table) */}
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
             <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" /> Informasi Akun
             </h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField label="Nama Lengkap" type="text" value={userData?.name} disabled icon={User} />
                <InputField label="Email" type="email" value={userData?.email} disabled icon={Mail} />
                <InputField label="No. WhatsApp" type="tel" value={userData?.nomor_telepon} disabled icon={Smartphone} />
             </div>
             <p className="text-xs text-neutral-400 mt-2">*Informasi akun hanya bisa diubah melalui pengaturan akun.</p>
        </div>

        {/* Data Diri */}
        <div>
            <h2 className="text-lg font-bold text-neutral-800 mb-4 border-b pb-2">Data Diri & Kependudukan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="col-span-full md:col-span-1">
                    <InputField 
                        label="No KTP" 
                        type="text" 
                        name="noKTP" 
                        placeholder="16 digit angka" 
                        required 
                        value={formData.noKTP} 
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            handleChange({ target: { name: 'noKTP', value: val } });
                        }}
                        maxLength={16} 
                        icon={Clipboard}
                        hasError={!!errors.noKTP}
                    />
                    {errors.noKTP && <p className="text-red-500 text-xs mt-1 ml-1">{errors.noKTP[0]}</p>}
                </div>
                
                <div>
                    <InputField label="Jenis Kelamin" type="select" name="jenis_kelamin" required options={['laki-laki', 'Perempuan']} value={formData.jenis_kelamin} onChange={handleChange} hasError={!!errors.jenis_kelamin} />
                    {errors.jenis_kelamin && <p className="text-red-500 text-xs mt-1 ml-1">{errors.jenis_kelamin[0]}</p>}
                </div>

                <div>
                    <InputField label="Tempat Lahir" type="text" name="tempat_lahir" required value={formData.tempat_lahir} onChange={handleChange} hasError={!!errors.tempat_lahir} />
                    {errors.tempat_lahir && <p className="text-red-500 text-xs mt-1 ml-1">{errors.tempat_lahir[0]}</p>}
                </div>

                <div>
                    <InputField label="Tanggal Lahir" type="date" name="tanggal_lahir" required value={formData.tanggal_lahir} onChange={handleChange} hasError={!!errors.tanggal_lahir} />
                    {errors.tanggal_lahir && <p className="text-red-500 text-xs mt-1 ml-1">{errors.tanggal_lahir[0]}</p>}
                </div>

                <InputField label="Status Perkawinan" type="select" name="status_perkawinan" required options={['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']} value={formData.status_perkawinan} onChange={handleChange} />
                <InputField label="Pendidikan" type="select" name="pendidikan_terakhir" required options={['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3', 'Tidak Sekolah']} value={formData.pendidikan_terakhir} onChange={handleChange} />
                <InputField label="Agama" type="select" name="agama" required options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']} value={formData.agama} onChange={handleChange} />
                
                {/* Opsional */}
                <InputField label="Suku" type="text" name="suku" placeholder="Opsional" value={formData.suku} onChange={handleChange} />
                
                <div>
                     <InputField label="No. Pegawai (Opsional)" type="text" name="nomor_pegawai" placeholder="Opsional" value={formData.nomor_pegawai} onChange={handleChange} hasError={!!errors.nomor_pegawai} />
                     {errors.nomor_pegawai && <p className="text-red-500 text-xs mt-1 ml-1">{errors.nomor_pegawai[0]}</p>}
                </div>
            </div>
        </div>

        {/* Alamat */}
        <div>
             <h2 className="text-lg font-bold text-neutral-800 mb-4 border-b pb-2">Domisili Saat Ini</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="col-span-full">
                    <InputField label="Alamat Lengkap (Jalan, RT/RW)" type="text" name="alamat" placeholder="Contoh: Jl. Jendral Sudirman No. 10" required value={formData.alamat} onChange={handleChange} icon={MapPin} />
                </div>
                <InputField label="Provinsi" type="text" name="provinsi" required value={formData.provinsi} onChange={handleChange} />
                <InputField label="Kota/Kabupaten" type="text" name="kota/kabupaten" required value={formData['kota/kabupaten']} onChange={handleChange} />
                <InputField label="Kecamatan" type="text" name="kecamatan" required value={formData.kecamatan} onChange={handleChange} />
                <InputField label="Kelurahan/Desa" type="text" name="kelurahan" required value={formData.kelurahan} onChange={handleChange} />
             </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition transform disabled:opacity-70 disabled:scale-100 flex items-center justify-center"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- SUMMARY COMPONENT (Read Only) ---
const ProfileSummaryView = ({ profileData, isComplete, setViewMode }) => {
  const StatusIcon = isComplete ? CheckCircle : AlertTriangle;
  const statusConfig = isComplete 
    ? { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", text: "LENGKAP" }
    : { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", text: "BELUM LENGKAP" };

  const InfoItem = ({ label, value }) => (
    <div className="mb-1">
      <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="font-semibold text-neutral-800 text-sm sm:text-base truncate">
        {value || <span className="text-neutral-400 italic">Belum diisi</span>}
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto h-full scrollbar-hide">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
         <div>
            <h1 className="text-2xl font-bold text-neutral-900">Profil Saya</h1>
            <p className="text-neutral-500 text-sm mt-1">Kelola informasi pribadi dan data medis Anda.</p>
         </div>
      </div>

      {/* Status Card */}
      <div className={`p-6 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-full bg-white shadow-sm ${statusConfig.color}`}>
              <StatusIcon className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm font-medium text-neutral-600">Status Data Medis</p>
              <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.text}</h2>
           </div>
        </div>
        <button
          onClick={() => setViewMode("complete")}
          className="px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {isComplete ? "Edit Data" : "Lengkapi Data"}
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid gap-8">
          {/* Data Diri */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3"><Clipboard className="w-5 h-5 text-blue-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Identitas Utama</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <InfoItem label="No. KTP" value={profileData?.noKTP} />
                <InfoItem label="Jenis Kelamin" value={profileData?.jenis_kelamin} />
                <InfoItem label="TTL" value={profileData?.tempat_lahir ? `${profileData.tempat_lahir}, ${profileData.tanggal_lahir || ''}` : null} />
                <InfoItem label="Agama" value={profileData?.agama} />
                <InfoItem label="Status" value={profileData?.status_perkawinan} />
                <InfoItem label="Pendidikan" value={profileData?.pendidikan_terakhir} />
             </div>
          </div>

          {/* Alamat */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3"><MapPin className="w-5 h-5 text-blue-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Alamat Domisili</h3>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <InfoItem label="Jalan & Nomor" value={profileData?.alamat} />
                <InfoItem label="Wilayah" value={profileData?.kelurahan ? `${profileData.kelurahan}, ${profileData.kecamatan || '-'}` : null} />
                <InfoItem label="Kota/Kabupaten" value={profileData?.["kota/kabupaten"]} />
                <InfoItem label="Provinsi" value={profileData?.provinsi} />
             </div>
          </div>
      </div>
    </div>
  );
};

// --- PAGE UTAMA ---
export default function ProfilePage() {
  const [viewMode, setViewMode] = useState("summary");
  const [userData, setUserData] = useState(null); // Data dari tabel User
  const [profileData, setProfileData] = useState(null); // Data dari tabel Profile
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Fungsi Fetch Data dari API
  const fetchProfileData = async () => {
    try {
      // 1. Ambil User Data dari LocalStorage (Nama, Email, HP)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      } else {
        router.push("/auth/login"); // Redirect jika tidak ada sesi
        return;
      }

      // 2. Ambil Profile Data dari Backend
      const response = await api.get("/profile");
      
      if (response.data && response.data.data) {
        setProfileData(response.data.data);
      } 
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Profil belum ada, ini wajar untuk user baru
        console.log("Profil belum lengkap.");
        setProfileData({}); // Set objek kosong agar form bisa dirender
        setViewMode("complete"); // Langsung arahkan ke mode edit
      } else if (error.response && error.response.status === 401) {
        // Token expired
        router.push("/auth/login");
      } else {
        console.error("Gagal mengambil data profil:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Cek apakah No KTP sudah terisi sebagai indikator profil lengkap
  const isProfileComplete = profileData && profileData.noKTP && profileData.noKTP.length === 16;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
           <p className="text-neutral-500 font-medium">Memuat profil Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex md:p-6 font-sans">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Tombol Menu Mobile */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white text-neutral-700 rounded-lg shadow-md md:hidden border border-neutral-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Layout Card */}
      <div className="w-full max-w-7xl mx-auto bg-white md:rounded-3xl shadow-xl shadow-neutral-200/50 flex flex-col md:flex-row overflow-hidden h-screen md:h-[85vh] border border-neutral-100">
        
        {/* Sidebar Component */}
        <Sidebar
          activeTab={viewMode}
          setActiveTab={setViewMode}
          profileData={{ ...userData, ...profileData }} // Gabungkan data untuk sidebar
          isComplete={isProfileComplete}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Konten Kanan */}
        {viewMode === "summary" ? (
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
                refreshProfile={fetchProfileData} // Kirim fungsi refresh
                isComplete={isProfileComplete} 
            />
        )}
      </div>
    </div>
  );
}