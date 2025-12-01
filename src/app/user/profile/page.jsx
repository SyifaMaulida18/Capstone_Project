"use client";

import Sidebar from "@/components/user/Sidebar";
import api from "@/services/api"; // Pastikan path ini sesuai dengan konfigurasi axios Anda
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clipboard,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Menu,
  Save,
  Settings,
  Shield,
  Smartphone,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- KOMPONEN UI: InputField ---
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
  hasError, 
  name, 
  helperText, 
  ...props 
}) => {
  const inputClassName = `block w-full rounded-xl border ${
    hasError 
      ? "border-red-500 bg-red-50 text-red-900 focus:ring-red-200" 
      : disabled 
        ? "border-neutral-200 bg-neutral-100 text-neutral-500 cursor-not-allowed" 
        : "border-neutral-200 text-neutral-900 focus:ring-primary-500/20 focus:border-primary-500"
  } py-2.5 ${Icon ? "pl-10" : "pl-4"} pr-4 placeholder-neutral-400 focus:ring-2 sm:text-sm transition duration-200`;

  return (
    <div className="space-y-1.5 w-full">
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
      {/* Tampilkan Error Message dari Backend jika ada */}
      {helperText && (
        <p className={`text-xs mt-1 ${hasError ? "text-red-600 font-medium" : "text-neutral-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// --- KOMPONEN FORM (Create / Edit Data Profil) ---
const ProfileCompletionForm = ({ setViewMode, initialProfileData, userData, refreshProfile, isComplete }) => {
  // State Data Profil (Sesuai Controller & Model Laravel)
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
    nomor_telepon: "", // Di backend: Rule::unique('profiles')
    
    // Keluarga
    status_keluarga: "",
    nama_keluarga: "",

    // Alamat
    alamat: "",
    provinsi: "",
    "kota/kabupaten": "", // Perhatikan key ini menggunakan slash sesuai database
    kecamatan: "",
    kelurahan: "",
    lokasi: "", 

    // Penjaminan
    penjaminan: "cash", // Default cash sesuai logika controller
    nama_asuransi: "",
    nomor_asuransi: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // Sinkronisasi data saat komponen dimuat (Pre-fill)
  useEffect(() => {
    if (initialProfileData && Object.keys(initialProfileData).length > 0) {
      setFormData((prev) => {
        const newData = { ...prev };
        Object.keys(newData).forEach((key) => {
          // Ambil value dari initialData jika ada, jika null set string kosong
          if (initialProfileData[key] !== undefined && initialProfileData[key] !== null) {
            newData[key] = initialProfileData[key];
          }
        });
        
        // Pastikan penjaminan terisi default jika kosong
        if (!newData.penjaminan) newData.penjaminan = "cash";
        
        return newData;
      });
    } else {
      // Jika profil baru, pre-fill nomor telepon dari data User Akun
      if (userData?.nomor_telepon) {
        setFormData(prev => ({ ...prev, nomor_telepon: userData.nomor_telepon }));
      }
    }
  }, [initialProfileData, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Logika Reset Asuransi: Jika pindah ke cash, kosongkan data asuransi
    if (name === "penjaminan" && value === "cash") {
        setFormData(prev => ({ 
          ...prev, 
          penjaminan: value, 
          nama_asuransi: "", 
          nomor_asuransi: "" 
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Hapus error field saat user mengetik
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    setGeneralError("");

    try {
      // Endpoint: Route::post('/profile', [ProfileController::class, 'store']);
      await api.post("/profile", formData);
      
      await refreshProfile();
      setViewMode("summary");
      
    } catch (error) {
      console.error("Error saving profile:", error);
      if (error.response) {
        // Handle Error Validasi Laravel (422)
        if (error.response.status === 422) {
          setErrors(error.response.data.errors);
          setGeneralError("Terdapat kesalahan pada input data. Mohon periksa field bertanda merah.");
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setGeneralError(error.response.data.message || "Gagal menyimpan data.");
        }
      } else {
        setGeneralError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-neutral-200">
      <button
        onClick={() => setViewMode("summary")}
        className="text-neutral-500 hover:text-primary-600 flex items-center mb-6 transition duration-150 font-medium group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Ringkasan
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            {isComplete ? "Perbarui Data Profil" : "Lengkapi Data Diri"}
        </h1>
        <p className="text-neutral-500 text-sm">Data ini wajib diisi untuk kebutuhan administrasi medis (Sesuai KTP).</p>
      </div>
      
      {generalError && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center animate-pulse">
             <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
             {generalError}
          </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8 pb-24">
        
        {/* SECTION 1: Data Identitas (KTP) */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
           <h2 className="text-lg font-bold text-neutral-800 mb-5 flex items-center pb-2 border-b border-neutral-100">
             <Clipboard className="w-5 h-5 mr-2 text-primary-600" /> Identitas Diri (Sesuai KTP)
           </h2>
           <div className="grid md:grid-cols-2 gap-5">
                <div className="col-span-full md:col-span-1">
                    <InputField 
                        label="Nomor KTP (NIK)" 
                        type="text" 
                        name="noKTP" 
                        placeholder="16 digit angka" 
                        required 
                        value={formData.noKTP} 
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16); // Hanya angka, max 16
                            handleChange({ target: { name: 'noKTP', value: val } });
                        }}
                        icon={Clipboard}
                        hasError={!!errors.noKTP}
                        helperText={errors.noKTP ? errors.noKTP[0] : "Wajib 16 digit sesuai KTP"}
                    />
                </div>
                
                {/* Opsi harus sama persis dengan Enum Database: 'Laki-laki', 'Perempuan' */}
                <InputField 
                    label="Jenis Kelamin" 
                    type="select" 
                    name="jenis_kelamin" 
                    required 
                    options={['Laki-laki', 'Perempuan']} 
                    value={formData.jenis_kelamin} 
                    onChange={handleChange} 
                    hasError={!!errors.jenis_kelamin} 
                    helperText={errors.jenis_kelamin?.[0]}
                />

                <InputField 
                    label="Tempat Lahir" 
                    type="text" 
                    name="tempat_lahir" 
                    required 
                    value={formData.tempat_lahir} 
                    onChange={handleChange} 
                    hasError={!!errors.tempat_lahir}
                    helperText={errors.tempat_lahir?.[0]}
                />
                
                <InputField 
                    label="Tanggal Lahir" 
                    type="date" 
                    name="tanggal_lahir" 
                    required 
                    value={formData.tanggal_lahir} 
                    onChange={handleChange} 
                    hasError={!!errors.tanggal_lahir}
                    helperText={errors.tanggal_lahir?.[0]}
                />

                <InputField 
                    label="Status Perkawinan" 
                    type="select" 
                    name="status_perkawinan" 
                    required 
                    options={['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']} 
                    value={formData.status_perkawinan} 
                    onChange={handleChange} 
                    hasError={!!errors.status_perkawinan}
                />
                
                <InputField 
                    label="Agama" 
                    type="select" 
                    name="agama" 
                    required 
                    options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']} 
                    value={formData.agama} 
                    onChange={handleChange}
                    hasError={!!errors.agama} 
                />
                
                <InputField 
                    label="Pendidikan Terakhir" 
                    type="select" 
                    name="pendidikan_terakhir" 
                    options={['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3', 'Tidak Sekolah']} 
                    value={formData.pendidikan_terakhir} 
                    onChange={handleChange} 
                />
                
                <InputField 
                    label="Suku (Opsional)" 
                    type="text" 
                    name="suku" 
                    value={formData.suku} 
                    onChange={handleChange} 
                />
                
                <InputField 
                    label="No. Pegawai (Jika Ada)" 
                    type="text" 
                    name="nomor_pegawai" 
                    placeholder="Kosongkan jika pasien umum" 
                    value={formData.nomor_pegawai} 
                    onChange={handleChange}
                    hasError={!!errors.nomor_pegawai}
                    helperText={errors.nomor_pegawai?.[0]}
                />
           </div>
        </div>

        {/* SECTION 2: Kontak & Keluarga */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
           <h2 className="text-lg font-bold text-neutral-800 mb-5 flex items-center pb-2 border-b border-neutral-100">
             <Users className="w-5 h-5 mr-2 text-primary-600" /> Kontak & Penanggung Jawab
           </h2>
           <div className="grid md:grid-cols-2 gap-5">
                <div className="col-span-full">
                    <InputField 
                        label="Nomor Telepon / WhatsApp" 
                        type="text" 
                        name="nomor_telepon" 
                        placeholder="Contoh: 08123456789"
                        value={formData.nomor_telepon} 
                        onChange={handleChange}
                        icon={Smartphone} 
                        hasError={!!errors.nomor_telepon}
                        helperText={errors.nomor_telepon ? errors.nomor_telepon[0] : "Nomor aktif yang bisa dihubungi."}
                    />
                </div>
                <div className="col-span-full my-2 border-t border-dashed border-neutral-200"></div>
                
                <InputField 
                    label="Nama Penanggung Jawab / Keluarga" 
                    type="text" 
                    name="nama_keluarga" 
                    placeholder="Nama Kerabat" 
                    value={formData.nama_keluarga} 
                    onChange={handleChange} 
                />
                <InputField 
                    label="Hubungan Keluarga" 
                    type="text" 
                    name="status_keluarga" 
                    placeholder="Contoh: Ayah, Istri, Kakak" 
                    value={formData.status_keluarga} 
                    onChange={handleChange} 
                />
           </div>
        </div>

        {/* SECTION 3: Domisili */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
           <h2 className="text-lg font-bold text-neutral-800 mb-5 flex items-center pb-2 border-b border-neutral-100">
             <MapPin className="w-5 h-5 mr-2 text-primary-600" /> Alamat Domisili
           </h2>
           <div className="grid md:grid-cols-2 gap-5">
                <div className="col-span-full">
                    <InputField 
                        label="Alamat Lengkap" 
                        type="text" 
                        name="alamat" 
                        placeholder="Nama Jalan, No. Rumah, RT/RW" 
                        required 
                        value={formData.alamat} 
                        onChange={handleChange} 
                        icon={MapPin} 
                        hasError={!!errors.alamat}
                    />
                </div>
                <InputField 
                    label="Provinsi" 
                    type="text" 
                    name="provinsi" 
                    required 
                    value={formData.provinsi} 
                    onChange={handleChange} 
                />
                {/* Perhatikan name menggunakan 'kota/kabupaten' sesuai backend */}
                <InputField 
                    label="Kota / Kabupaten" 
                    type="text" 
                    name="kota/kabupaten" 
                    required 
                    value={formData["kota/kabupaten"]} 
                    onChange={handleChange} 
                />
                <InputField 
                    label="Kecamatan" 
                    type="text" 
                    name="kecamatan" 
                    required 
                    value={formData.kecamatan} 
                    onChange={handleChange} 
                />
                <InputField 
                    label="Kelurahan / Desa" 
                    type="text" 
                    name="kelurahan" 
                    required 
                    value={formData.kelurahan} 
                    onChange={handleChange} 
                />
                <div className="col-span-full">
                     <InputField 
                        label="Lokasi / Patokan (Opsional)" 
                        type="text" 
                        name="lokasi" 
                        placeholder="Dekat masjid besar / Depan toko merah" 
                        value={formData.lokasi} 
                        onChange={handleChange} 
                    />
                </div>
           </div>
        </div>

        {/* SECTION 4: Penjaminan / Asuransi */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
           <h2 className="text-lg font-bold text-neutral-800 mb-5 flex items-center pb-2 border-b border-neutral-100">
             <CreditCard className="w-5 h-5 mr-2 text-primary-600" /> Penjaminan Pembayaran
           </h2>
           <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Metode Penjaminan <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition ${formData.penjaminan === 'cash' ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}>
                            <input 
                                type="radio" 
                                name="penjaminan" 
                                value="cash" 
                                checked={formData.penjaminan === 'cash'} 
                                onChange={handleChange} 
                                className="hidden" 
                            />
                            <span>Umum / Cash</span>
                        </label>
                        <label className={`cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition ${formData.penjaminan === 'asuransi' ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}>
                            <input 
                                type="radio" 
                                name="penjaminan" 
                                value="asuransi" 
                                checked={formData.penjaminan === 'asuransi'} 
                                onChange={handleChange} 
                                className="hidden" 
                            />
                            <Shield className="w-4 h-4" />
                            <span>Asuransi</span>
                        </label>
                    </div>
                </div>

                {/* Logika Tampilan Field Asuransi: Hanya muncul jika penjaminan = asuransi */}
                {formData.penjaminan === 'asuransi' && (
                    <div className="grid md:grid-cols-2 gap-5 p-5 bg-neutral-50 rounded-xl border border-neutral-200 mt-4 animate-in fade-in slide-in-from-top-2">
                        <InputField 
                            label="Nama Asuransi" 
                            type="text" 
                            name="nama_asuransi" 
                            placeholder="Contoh: Allianz / Prudential"
                            required={formData.penjaminan === 'asuransi'} 
                            value={formData.nama_asuransi} 
                            onChange={handleChange} 
                            hasError={!!errors.nama_asuransi}
                            helperText={errors.nama_asuransi?.[0]}
                        />
                        <InputField 
                            label="Nomor Kartu / Polis" 
                            type="text" 
                            name="nomor_asuransi" 
                            placeholder="Nomor kartu asuransi anda"
                            required={formData.penjaminan === 'asuransi'} 
                            value={formData.nomor_asuransi} 
                            onChange={handleChange} 
                            hasError={!!errors.nomor_asuransi}
                            helperText={errors.nomor_asuransi?.[0]}
                        />
                    </div>
                )}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 md:static md:bg-transparent md:border-0 md:p-0 flex flex-col-reverse sm:flex-row justify-end gap-3 z-10">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition w-full sm:w-auto"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] transition transform disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 w-full sm:w-auto"
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
    ? { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", text: "DATA LENGKAP" }
    : { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", text: "DATA BELUM LENGKAP" };

  const InfoItem = ({ label, value, isPrimary }) => (
    <div className="mb-2">
      <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className={`font-semibold text-neutral-800 text-sm sm:text-base break-words ${isPrimary ? 'text-lg text-primary-900' : ''}`}>
        {value ? value : <span className="text-neutral-400 italic font-normal text-xs">Belum diisi</span>}
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-neutral-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-neutral-900">Profil Saya</h1>
            <p className="text-neutral-500 text-sm mt-1">Kelola informasi pribadi dan data kependudukan Anda.</p>
         </div>
      </div>

      {/* Status Card */}
      <div className={`p-6 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-full bg-white shadow-sm ${statusConfig.color}`}>
              <StatusIcon className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm font-medium text-neutral-600">Status Kelengkapan</p>
              <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.text}</h2>
           </div>
        </div>
        <button
          onClick={() => setViewMode("complete")}
          className="px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 hover:text-primary-600 transition shadow-sm flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {isComplete ? "Edit Data" : "Lengkapi Sekarang"}
        </button>
      </div>

      <div className="grid gap-6 pb-10">
          {/* Data Identitas */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6 pb-2 border-b border-neutral-50">
                <div className="p-2 bg-primary-50 rounded-lg mr-3"><Clipboard className="w-5 h-5 text-primary-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Identitas Diri</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div className="col-span-full md:col-span-1">
                    <InfoItem label="Nomor KTP (NIK)" value={profileData?.noKTP} isPrimary />
                </div>
                <InfoItem label="Nama Lengkap (Akun)" value={userData?.name} />
                <InfoItem label="Email" value={userData?.email} />
                
                <InfoItem label="Jenis Kelamin" value={profileData?.jenis_kelamin} />
                <InfoItem label="TTL" value={profileData?.tempat_lahir ? `${profileData.tempat_lahir}, ${profileData.tanggal_lahir || ''}` : null} />
                <InfoItem label="Agama" value={profileData?.agama} />
                <InfoItem label="Status Perkawinan" value={profileData?.status_perkawinan} />
                <InfoItem label="Pendidikan Terakhir" value={profileData?.pendidikan_terakhir} />
                <InfoItem label="Nomor Pegawai" value={profileData?.nomor_pegawai || "-"} />
             </div>
          </div>

          {/* Kontak & Keluarga */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center mb-6 pb-2 border-b border-neutral-50">
                <div className="p-2 bg-orange-50 rounded-lg mr-3"><Users className="w-5 h-5 text-orange-600" /></div>
                <h3 className="text-lg font-bold text-neutral-800">Kontak & Keluarga</h3>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-bold text-neutral-900 mb-3">Kontak Pribadi</h4>
                    {/* Tampilkan nomor telepon dari tabel profil */}
                    <InfoItem label="Nomor Telepon" value={profileData?.nomor_telepon} />
                 </div>
                 <div className="bg-neutral-50 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-neutral-900 mb-3">Keluarga / Penanggung Jawab</h4>
                    <InfoItem label="Nama Keluarga" value={profileData?.nama_keluarga} />
                    <InfoItem label="Hubungan" value={profileData?.status_keluarga} />
                 </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Domisili */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center mb-6 pb-2 border-b border-neutral-50">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3"><MapPin className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="text-lg font-bold text-neutral-800">Domisili</h3>
                </div>
                <div className="space-y-4">
                    <InfoItem label="Alamat Lengkap" value={profileData?.alamat} />
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Kelurahan" value={profileData?.kelurahan} />
                        <InfoItem label="Kecamatan" value={profileData?.kecamatan} />
                        {/* Mengakses key dengan bracket notation karena ada slash */}
                        <InfoItem label="Kota/Kab" value={profileData?.["kota/kabupaten"]} />
                        <InfoItem label="Provinsi" value={profileData?.provinsi} />
                    </div>
                    <InfoItem label="Lokasi/Patokan" value={profileData?.lokasi} />
                </div>
            </div>

            {/* Penjaminan */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center mb-6 pb-2 border-b border-neutral-50">
                    <div className="p-2 bg-emerald-50 rounded-lg mr-3"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="text-lg font-bold text-neutral-800">Penjaminan</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-4">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">Metode Bayar</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${profileData?.penjaminan === 'asuransi' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-700'}`}>
                            {profileData?.penjaminan === 'asuransi' ? 'ASURANSI' : 'UMUM / CASH'}
                        </span>
                    </div>
                    {profileData?.penjaminan === 'asuransi' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                             <InfoItem label="Nama Asuransi" value={profileData?.nama_asuransi} />
                             <InfoItem label="Nomor Kartu/Polis" value={profileData?.nomor_asuransi} />
                        </div>
                    )}
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
  const [userData, setUserData] = useState(null); 
  const [profileData, setProfileData] = useState(null);
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

      // Ambil data User dari localStorage (untuk nama dan email)
      const storedUser = localStorage.getItem("user");
      setUserData(storedUser ? JSON.parse(storedUser) : { name: "Loading..." });

      // GET data profil dari backend (ProfileController@show)
      const response = await api.get("/profile");
      
      // Response backend: { message: "...", data: { ... } }
      if (response.data && response.data.data) {
         setProfileData(response.data.data);
         // Jika profil ditemukan, pastikan mode summary
         setViewMode("summary");
      } else {
         // Fallback jika format response berbeda
         setProfileData(response.data);
      }

    } catch (error) {
      if (error.response && error.response.status === 404) {
        // 404 dari Backend artinya "Profile tidak ditemukan" -> Arahkan user untuk mengisi form
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

  // Cek apakah data kritikal sudah terisi (sebagai indikator profil lengkap)
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
          // Menggabungkan data user (akun) dan data profil untuk ditampilkan di sidebar
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