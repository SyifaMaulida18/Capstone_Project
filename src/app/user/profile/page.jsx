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
  Loader2,
  Save
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/user/Sidebar"; 
import api from "@/services/api"; 

// --- KOMPONEN UI: InputField (Tidak Berubah) ---
const InputField = ({ label, type, placeholder, required, icon: Icon, value, onChange, options, disabled, hasError, name, ...props }) => {
  const inputClassName = `block w-full rounded-xl border ${
    hasError 
      ? "border-red-500 bg-red-50 text-red-900 focus:ring-red-200" 
      : disabled 
        ? "border-neutral-200 bg-neutral-100 text-neutral-500 cursor-not-allowed" 
        : "border-neutral-200 text-neutral-900 focus:ring-primary-500/20 focus:border-primary-500"
  } py-2.5 ${Icon ? "pl-10" : "pl-4"} pr-4 placeholder-neutral-400 focus:ring-2 sm:text-sm transition duration-200`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-neutral-700">
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
            id={name}
            name={name}
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
            id={name}
            name={name}
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

// --- KOMPONEN FORM (Edit Data Profil) ---
const ProfileCompletionForm = ({ setViewMode, initialProfileData, userData, refreshProfile, isComplete }) => {
  // State untuk Data Profil (Tabel profiles)
  const [formData, setFormData] = useState({
    noKTP: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    status_perkawinan: "",
    pendidikan_terakhir: "",
    agama: "",
    suku: "",
    nomor_pegawai: "",
    alamat: "",
    provinsi: "",
    "kota/kabupaten": "",
    kecamatan: "",
    kelurahan: "",
  });

  // Sinkronisasi data saat fetch selesai
  useEffect(() => {
    if (initialProfileData) {
      setFormData((prev) => {
        const newData = {};
        Object.keys(prev).forEach((key) => {
          newData[key] = initialProfileData[key] !== null && initialProfileData[key] !== undefined 
            ? initialProfileData[key] 
            : "";
        });
        return { ...prev, ...newData };
      });
    }
  }, [initialProfileData]);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    setGeneralError("");

    try {
      await api.post("/profile", formData);
      await refreshProfile();
      setViewMode("summary");
    } catch (error) {
      console.error("Error saving profile:", error);
      if (error.response) {
        if (error.response.status === 422) {
          setErrors(error.response.data.errors);
          setGeneralError("Mohon periksa kembali data yang bertanda merah.");
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setGeneralError(error.response.data.message || "Gagal menyimpan data.");
        }
      } else {
        setGeneralError("Gagal terhubung ke server.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto h-full">
      <button
        onClick={() => setViewMode("summary")}
        className="text-neutral-500 hover:text-primary-600 flex items-center mb-6 transition duration-150 font-medium group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Ringkasan
      </button>

      <h1 className="text-2xl font-bold text-neutral-900 mb-1">
        {isComplete ? "Edit Data Profil" : "Lengkapi Data Diri"}
      </h1>
      <p className="text-neutral-500 mb-8 text-sm">Pastikan data sesuai dengan KTP untuk keperluan administrasi medis.</p>
      
      {generalError && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center animate-pulse">
             <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
             {generalError}
          </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8 pb-20">
        {/* SECTION 1: Akun (Read Only - Dari Tabel Users) 
            Sesuai Migrasi: name, email, nomor_telepon
        */}
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
             <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" /> Informasi Akun
             </h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField 
                    label="Nama Lengkap" 
                    name="name" 
                    type="text" 
                    value={userData?.name} 
                    disabled 
                    icon={User} 
                />
                <InputField 
                    label="Email" 
                    name="email" 
                    type="email" 
                    value={userData?.email} 
                    disabled 
                    icon={Mail} 
                />
                <InputField 
                    label="Nomor Telepon" 
                    name="nomor_telepon" 
                    type="text" 
                    value={userData?.nomor_telepon} 
                    disabled 
                    icon={Smartphone} 
                />
             </div>
             <p className="text-xs text-neutral-400 mt-3 italic">*Informasi akun (Tabel Users) tidak dapat diubah di sini.</p>
        </div>

        {/* SECTION 2: Data Kependudukan (Editable - Tabel Profiles) */}
        <div>
            <h2 className="text-lg font-bold text-neutral-800 mb-4 border-b pb-2">Data Kependudukan</h2>
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
                        icon={Clipboard}
                        hasError={!!errors.noKTP}
                    />
                    {errors.noKTP && <p className="text-red-500 text-xs mt-1">{errors.noKTP[0]}</p>}
                </div>
                
                <div>
                    <InputField label="Jenis Kelamin" type="select" name="jenis_kelamin" required options={['Laki-laki', 'Perempuan']} value={formData.jenis_kelamin} onChange={handleChange} hasError={!!errors.jenis_kelamin} />
                    {errors.jenis_kelamin && <p className="text-red-500 text-xs mt-1">{errors.jenis_kelamin[0]}</p>}
                </div>

                <div>
                    <InputField label="Tempat Lahir" type="text" name="tempat_lahir" required value={formData.tempat_lahir} onChange={handleChange} hasError={!!errors.tempat_lahir} />
                    {errors.tempat_lahir && <p className="text-red-500 text-xs mt-1">{errors.tempat_lahir[0]}</p>}
                </div>

                <div>
                    <InputField label="Tanggal Lahir" type="date" name="tanggal_lahir" required value={formData.tanggal_lahir} onChange={handleChange} hasError={!!errors.tanggal_lahir} />
                    {errors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{errors.tanggal_lahir[0]}</p>}
                </div>

                <InputField label="Status Perkawinan" type="select" name="status_perkawinan" required options={['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']} value={formData.status_perkawinan} onChange={handleChange} />
                <InputField label="Pendidikan Terakhir" type="select" name="pendidikan_terakhir" required options={['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3', 'Tidak Sekolah']} value={formData.pendidikan_terakhir} onChange={handleChange} />
                <InputField label="Agama" type="select" name="agama" required options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']} value={formData.agama} onChange={handleChange} />
                
                <InputField label="Suku (Opsional)" type="text" name="suku" value={formData.suku} onChange={handleChange} />
                <InputField label="No. Pegawai (Opsional)" type="text" name="nomor_pegawai" value={formData.nomor_pegawai} onChange={handleChange} />
            </div>
        </div>

        {/* SECTION 3: Alamat (Editable - Tabel Profiles) */}
        <div>
             <h2 className="text-lg font-bold text-neutral-800 mb-4 border-b pb-2">Domisili Saat Ini</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="col-span-full">
                    <InputField label="Alamat Lengkap (Jalan, No Rumah, RT/RW)" type="text" name="alamat" placeholder="Jl. Mawar No. 12 RT 01/02" required value={formData.alamat} onChange={handleChange} icon={MapPin} />
                </div>
                <InputField label="Provinsi" type="text" name="provinsi" required value={formData.provinsi} onChange={handleChange} />
                <InputField label="Kota/Kabupaten" type="text" name="kota/kabupaten" required value={formData['kota/kabupaten']} onChange={handleChange} />
                <InputField label="Kecamatan" type="text" name="kecamatan" required value={formData.kecamatan} onChange={handleChange} />
                <InputField label="Kelurahan/Desa" type="text" name="kelurahan" required value={formData.kelurahan} onChange={handleChange} />
             </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t mt-8">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] transition transform disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSaving ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" /> Simpan Data
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- KOMPONEN SUMMARY (Read Only View) ---
const ProfileSummaryView = ({ profileData, userData, isComplete, setViewMode }) => {
  const StatusIcon = isComplete ? CheckCircle : AlertTriangle;
  const statusConfig = isComplete 
    ? { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", text: "LENGKAP" }
    : { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", text: "BELUM LENGKAP" };

  const InfoItem = ({ label, value }) => (
    <div className="mb-1">
      <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="font-semibold text-neutral-800 text-sm sm:text-base break-words">
        {value ? value : <span className="text-neutral-400 italic font-normal">Belum diisi</span>}
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-neutral-900">Profil Saya</h1>
            <p className="text-neutral-500 text-sm mt-1">Informasi pribadi dan data kependudukan.</p>
         </div>
      </div>

      {/* Status Card */}
      <div className={`p-6 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-full bg-white shadow-sm ${statusConfig.color}`}>
              <StatusIcon className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm font-medium text-neutral-600">Status Data Profil</p>
              <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.text}</h2>
           </div>
        </div>
        <button
          onClick={() => setViewMode("complete")}
          className="px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 hover:text-primary-600 transition shadow-sm flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {isComplete ? "Edit Data" : "Lengkapi Data"}
        </button>
      </div>

      <div className="grid gap-8 pb-10">
          {/* Info Akun (Tabel Users) */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6">
                <div className="p-2 bg-primary-50 rounded-lg mr-3"><User className="w-5 h-5 text-primary-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Akun Pengguna</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem label="Nama Lengkap" value={userData?.name} />
                <InfoItem label="Email" value={userData?.email} />
                <InfoItem label="Nomor Telepon" value={userData?.nomor_telepon} />
             </div>
          </div>

          {/* Data Identitas (Tabel Profiles) */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6">
                <div className="p-2 bg-primary-50 rounded-lg mr-3"><Clipboard className="w-5 h-5 text-primary-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Identitas Kependudukan</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <InfoItem label="No. KTP" value={profileData?.noKTP} />
                <InfoItem label="Jenis Kelamin" value={profileData?.jenis_kelamin} />
                <InfoItem label="Tempat, Tanggal Lahir" value={profileData?.tempat_lahir ? `${profileData.tempat_lahir}, ${profileData.tanggal_lahir || ''}` : null} />
                <InfoItem label="Agama" value={profileData?.agama} />
                <InfoItem label="Status Perkawinan" value={profileData?.status_perkawinan} />
                <InfoItem label="Pendidikan Terakhir" value={profileData?.pendidikan_terakhir} />
             </div>
          </div>

          {/* Alamat (Tabel Profiles) */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6">
                <div className="p-2 bg-primary-50 rounded-lg mr-3"><MapPin className="w-5 h-5 text-primary-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Alamat Domisili</h3>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <InfoItem label="Alamat Lengkap" value={profileData?.alamat} />
                <div className="grid grid-cols-2 gap-4">
                   <InfoItem label="Kelurahan/Desa" value={profileData?.kelurahan} />
                   <InfoItem label="Kecamatan" value={profileData?.kecamatan} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Kota/Kabupaten" value={profileData?.["kota/kabupaten"]} />
                    <InfoItem label="Provinsi" value={profileData?.provinsi} />
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE CONTROLLER ---
export default function ProfilePage() {
  const [viewMode, setViewMode] = useState("summary");
  const [userData, setUserData] = useState(null); // Menyimpan data dari tabel users
  const [profileData, setProfileData] = useState(null); // Menyimpan data dari tabel profiles
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const fetchProfileData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Ambil data User dari localStorage sebagai data awal
      const storedUser = localStorage.getItem("user");
      setUserData(storedUser ? JSON.parse(storedUser) : { name: "Loading..." });

      // Fetch data Profil dari Backend
      const response = await api.get("/profile");
      
      if (response.data && (response.data.data || response.data)) {
         const fetchedData = response.data.data || response.data;
         
         // 1. Set Data Profile (KTP, Alamat, dll)
         setProfileData(fetchedData);
         
         // 2. Set Data User (Akun) jika relasi 'user' dikembalikan oleh controller profile
         if (fetchedData.user) {
             setUserData(fetchedData.user);
             localStorage.setItem("user", JSON.stringify(fetchedData.user));
         }
      } 
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Profil (tabel profiles) belum ada, tapi User (tabel users) sudah login
        setProfileData({});
        setViewMode("complete");
      } else if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else {
        console.error("Gagal load profil:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const isProfileComplete = profileData && profileData.noKTP && profileData.noKTP.length >= 16;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
         <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary-600 mb-4" />
            <p className="text-neutral-500 font-medium">Memuat data profil...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex md:p-6 font-sans">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white text-neutral-700 rounded-lg shadow-md md:hidden border border-neutral-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="w-full max-w-7xl mx-auto bg-white md:rounded-3xl shadow-xl shadow-neutral-200/50 flex flex-col md:flex-row overflow-hidden h-screen md:h-[85vh] border border-neutral-100 relative">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          profileData={{ ...userData, ...profileData }} 
        />

        {viewMode === "summary" ? (
            <ProfileSummaryView 
                profileData={profileData} 
                userData={userData}
                isComplete={isProfileComplete} 
                setViewMode={setViewMode} 
            />
        ) : (
            <ProfileCompletionForm 
                setViewMode={setViewMode} 
                initialProfileData={profileData} 
                userData={userData} 
                refreshProfile={fetchProfileData} 
                isComplete={isProfileComplete} 
            />
        )}
      </div>
    </div>
  );
}