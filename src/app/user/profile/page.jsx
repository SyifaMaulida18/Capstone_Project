"use client";

import { User, Mail, Smartphone, Calendar, Clipboard, MapPin, Briefcase, X, CheckCircle, AlertTriangle, ArrowLeft, Settings, Menu } from "lucide-react";
import React, { useState, useEffect } from 'react';
// FIX: Mengubah jalur relatif yang bermasalah ke jalur alias root (@/) untuk stabilitas
import Sidebar from '@/components/user/Sidebar';

// --- Komponen InputField yang Di-inline ---
const InputField = ({ label, type, placeholder, required, icon: Icon, value, onChange, options, disabled, ...props }) => {
    // Styling input field
    const inputClassName = `block w-full rounded-lg border ${disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300'} py-2 ${Icon ? 'pl-10' : 'pl-3'} pr-3 text-gray-900 placeholder-gray-400 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm transition duration-150`;

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
                {/* Input Tipe Select */}
                {type === 'select' && options ? (
                    <select
                        id={label}
                        name={props.name || label}
                        required={required}
                        className={inputClassName}
                        value={value || ''}
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
                    // Input Tipe Text/Email/Date/Telp
                    <input
                        id={label}
                        name={props.name || label}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        className={inputClassName}
                        value={value || ''}
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

// Mocking the complex data structure for the profile
const emptyProfileData = {
    jenisKelamin: '', golonganDarah: '', tempatLahir: '', tanggalLahir: '', agama: '',
    wargaNegara: 'WNI', statusPerkawinan: '', pendidikan: '', pekerjaan: '', noKTP: '', noKK: '',
    alamatJalan: '', kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '', kodePos: ''
};

// Data dummy yang sudah terisi dari halaman register (5 field awal)
const initialData = {
    namaLengkap: 'Syifa Maulida',
    email: 'syifamaulida18@gmail.com',
    noTelepon: '083849375372',
};

// Gabungan data awal dan data kosong untuk initial state
const mockInitialProfile = { ...initialData, ...emptyProfileData };

/**
 * =================================================================================
 * KONEKSI BACKEND DUMMY (Menggunakan localStorage untuk simulasi penyimpanan)
 * =================================================================================
 * Catatan: Dalam Next.js, ini akan diganti dengan API Route atau integrasi Firebase/Firestore.
 */
const mockBackendApi = async (endpoint, method, data = null) => {
    // Simulasi latensi jaringan
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); 

    const userKey = 'profileData_user123';

    if (method === 'GET') {
        const storedData = typeof window !== 'undefined' ? localStorage.getItem(userKey) : null;
        if (storedData) {
            return { ...mockInitialProfile, ...JSON.parse(storedData) };
        }
        return mockInitialProfile; 
    }

    if (method === 'POST') {
        const dataToStore = Object.fromEntries(
            Object.entries(data).filter(([key]) => !['namaLengkap', 'email', 'noTelepon'].includes(key))
        );
        if (typeof window !== 'undefined') {
            localStorage.setItem(userKey, JSON.stringify(dataToStore));
        }
        return { success: true, message: "Data berhasil disimpan." };
    }

    console.error("Metode API tidak dikenal.");
    throw new Error("Metode API tidak dikenal.");
};
/**
 * =================================================================================
 * AKHIR KONEKSI BACKEND DUMMY
 * =================================================================================
 */


// --- MODE 2: FORMULIR PENGISIAN/EDIT PROFIL ---
const ProfileCompletionForm = ({ setViewMode, initialProfileData, setProfileData, isComplete }) => {
    // Gunakan state untuk data formulir yang dapat diubah
    const [formData, setFormData] = useState(initialProfileData); 
    const [isSaving, setIsSaving] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Cek validasi KTP minimal (16 digit)
        if (!formData.noKTP || formData.noKTP.length !== 16) {
             console.error("Gagal: No KTP harus 16 digit.");
             setIsSaving(false);
             return;
        }
        
        const finalData = { 
            ...initialData, 
            ...formData 
        };
        
        try {
            await mockBackendApi('/profile/save', 'POST', finalData);
            setProfileData(finalData); 
            console.log("Data diri berhasil dilengkapi/diperbarui!"); 
            setViewMode('summary'); 

        } catch (error) {
            console.error("Terjadi kesalahan jaringan saat menyimpan profil:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGoBack = () => {
        console.log("Kembali ke ringkasan profil.");
        setViewMode('summary');
    };

    const formTitle = isComplete ? "Edit Detail Profil" : "Lengkapi Data Profil (Wajib Reservasi)";

    return (
        <div className="flex-1 bg-white p-6 md:p-10 rounded-r-xl shadow-inner overflow-y-auto h-full scrollbar-hide">
            <button 
                onClick={handleGoBack}
                className="text-gray-600 hover:text-indigo-800 flex items-center mb-6 transition duration-150"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Kembali ke Ringkasan Profil
            </button>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">{formTitle}</h1>

            <form onSubmit={handleSaveProfile} className="space-y-8">
                
                {/* BAGIAN 1: DATA AKUN & IDENTITAS UTAMA */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 border-b pb-6">
                    <h2 className="col-span-full text-xl font-bold text-indigo-700 mb-4">Informasi Akun</h2>
                    {/* Data akun dibuat disabled karena diasumsikan dari proses register/login */}
                    <InputField label="Nama Lengkap" type="text" value={initialData.namaLengkap} disabled icon={User} />
                    <InputField label="Email" type="email" value={initialData.email} disabled icon={Mail} />
                    <InputField label="Nomor Telepon (WA)" type="tel" value={initialData.noTelepon} disabled icon={Smartphone} />
                    <InputField label="Kata Sandi" type="password" placeholder="******" value="******" disabled icon={Settings} />
                </div>
                
                {/* BAGIAN 2: DATA IDENTITAS & ALAMAT LENGKAP */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <h2 className="col-span-full text-xl font-bold text-gray-800 mb-4 mt-4">Data Rekam Medis & Alamat (18 Fields)</h2>
                    
                    {/* Data Identitas */}
                    <InputField label="No KTP" type="text" name="noKTP" placeholder="16 digit No KTP" required value={formData.noKTP} onChange={handleChange} maxLength={16} icon={Clipboard} />
                    <InputField label="No KK" type="text" name="noKK" placeholder="16 digit No KK" required value={formData.noKK} onChange={handleChange} maxLength={16} icon={Clipboard} />
                    <InputField label="Jenis Kelamin" type="select" name="jenisKelamin" required options={['Laki-laki', 'Perempuan']} value={formData.jenisKelamin} onChange={handleChange} icon={User} />
                    
                    <InputField label="Tempat Lahir" type="text" name="tempatLahir" placeholder="Kota/Kabupaten" required value={formData.tempatLahir} onChange={handleChange} icon={MapPin} />
                    <InputField label="Tanggal Lahir" type="date" name="tanggalLahir" required value={formData.tanggalLahir} onChange={handleChange} icon={Calendar} />
                    <InputField label="Golongan Darah" type="select" name="golonganDarah" options={['A', 'B', 'AB', 'O', 'Tidak Tahu']} value={formData.golonganDarah} onChange={handleChange} icon={Briefcase} />

                    <InputField label="Status Perkawinan" type="select" name="statusPerkawinan" required options={['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']} value={formData.statusPerkawinan} onChange={handleChange} icon={Briefcase} />
                    <InputField label="Pendidikan Terakhir" type="select" name="pendidikan" required options={['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3', 'Tidak Sekolah']} value={formData.pendidikan} onChange={handleChange} icon={Briefcase} />
                    <InputField label="Pekerjaan" type="text" name="pekerjaan" placeholder="Contoh: Karyawan Swasta" required value={formData.pekerjaan} onChange={handleChange} icon={Briefcase} />
                    
                    <InputField label="Agama" type="select" name="agama" required options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']} value={formData.agama} onChange={handleChange} icon={Briefcase} />
                    <InputField label="Warga Negara" type="select" name="wargaNegara" required options={['WNI', 'WNA']} value={formData.wargaNegara} onChange={handleChange} icon={Briefcase} />
                    
                    {/* Alamat Lengkap */}
                    <div className="col-span-full pt-4"><h3 className="font-semibold text-gray-700">Detail Alamat</h3></div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <InputField label="Alamat Jalan Lengkap" type="text" name="alamatJalan" placeholder="Contoh: Jl. Sudirman No. 12 RT 01/RW 02" required value={formData.alamatJalan} onChange={handleChange} icon={MapPin} />
                    </div>
                    
                    <InputField label="Provinsi" type="text" name="provinsi" placeholder="Contoh: Kalimantan Timur" required value={formData.provinsi} onChange={handleChange} />
                    <InputField label="Kabupaten/Kota" type="text" name="kabupaten" placeholder="Contoh: Balikpapan" required value={formData.kabupaten} onChange={handleChange} />
                    <InputField label="Kecamatan" type="text" name="kecamatan" placeholder="Nama Kecamatan" required value={formData.kecamatan} onChange={handleChange} />
                    <InputField label="Kelurahan" type="text" name="kelurahan" placeholder="Nama Kelurahan/Desa" required value={formData.kelurahan} onChange={handleChange} />
                    <InputField label="Kode Pos" type="text" name="kodePos" placeholder="Contoh: 76111" required value={formData.kodePos} onChange={handleChange} />
                </div>

                {/* Footer Form: Tombol Simpan dan Kembali */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t">
                    <button
                        type="button" 
                        onClick={handleGoBack}
                        className="sm:w-auto w-full border border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                        <X className="w-5 h-5" />
                        <span>Batal & Kembali</span>
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="sm:w-auto w-full bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.005] flex items-center justify-center space-x-3 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <span className="flex items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...</span>
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

// --- MODE 1: RINGKASAN PROFIL UTAMA ---
const ProfileSummaryView = ({ profileData, isComplete, setViewMode }) => {
    // Tentukan status kelengkapan data
    const StatusIcon = isComplete ? CheckCircle : AlertTriangle;
    const statusColor = isComplete ? 'text-green-600' : 'text-yellow-600';
    const statusBg = isComplete ? 'bg-green-50' : 'bg-yellow-50';
    const statusText = isComplete ? 'LENGKAP' : 'BELUM LENGKAP';

    const InfoItem = ({ label, value }) => (
        <div>
            <p className="text-gray-500 font-medium">{label}</p>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    );

    return (
        <div className="flex-1 bg-white p-6 md:p-10 rounded-r-xl shadow-inner overflow-y-auto h-full scrollbar-hide">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Ringkasan Profil</h1>
            
            {/* Status Card */}
            <div className={`p-6 rounded-xl shadow-lg ${statusBg} border border-dashed ${isComplete ? 'border-green-300' : 'border-yellow-300'} mb-8`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <StatusIcon className={`w-8 h-8 ${statusColor}`} />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Status Kelengkapan Data Medis</p>
                            <h2 className={`text-2xl font-bold ${statusColor}`}>{statusText}</h2>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setViewMode('complete')}
                        className={`px-6 py-2 rounded-full font-semibold transition duration-150 flex items-center space-x-2
                            ${isComplete 
                                ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>{isComplete ? 'Edit Data Profil' : 'Lengkapi Sekarang'}</span>
                    </button>
                </div>
            </div>

            {/* Detailed Info (Summary Grid) */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Clipboard className="w-5 h-5 mr-2"/> Data Medis Utama</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <InfoItem label="No. KTP" value={profileData.noKTP || '- Belum Diisi -'} />
                    <InfoItem label="No. KK" value={profileData.noKK || '- Belum Diisi -'} />
                    <InfoItem label="Jenis Kelamin" value={profileData.jenisKelamin || '-'} />
                    <InfoItem label="Golongan Darah" value={profileData.golonganDarah || '-'} />
                    <InfoItem label="Tanggal Lahir" value={profileData.tanggalLahir || '-'} />
                    <InfoItem label="Pekerjaan" value={profileData.pekerjaan || '-'} />
                </div>
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2"/> Alamat Terdaftar</h3>
                    <p className="text-gray-700 font-medium">{profileData.alamatJalan || 'Alamat belum terisi.'}</p>
                    <p className="text-sm text-gray-500 mt-1">{profileData.kelurahan} - {profileData.kecamatan}, {profileData.kabupaten}, {profileData.provinsi} ({profileData.kodePos})</p>
                </div>
            </div>
            
        </div>
    );
};


export default function ProfilePage() {
    const [viewMode, setViewMode] = useState('summary'); 
    const [profileData, setProfileData] = useState(mockInitialProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk sidebar mobile

    // 1. Ambil data saat komponen dimuat (simulasi GET API)
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await mockBackendApi('/profile/get', 'GET');
                setProfileData(data);
                // Setelah memuat data, kita cek kelengkapan untuk menentukan viewMode
                if (!data.noKTP || data.noKTP.length !== 16) {
                    // Jika data KTP belum lengkap, otomatis masuk ke mode pengisian
                    setViewMode('summary'); 
                }
            } catch (error) {
                console.error("Gagal memuat data profil:", error);
                setProfileData(mockInitialProfile);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Status simulasi kelengkapan data
    const isProfileComplete = profileData.noKTP && profileData.noKTP.length === 16;
    
    // Gaya CSS global untuk menyembunyikan scrollbar di area konten utama
    const scrollbarHideStyle = `
        .scrollbar-hide {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
    `;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center space-x-3 p-6 bg-white rounded-xl shadow-lg">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-gray-700 font-medium">Memuat data profil...</span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center p-0 md:p-8">
            {/* Sisipkan gaya CSS untuk menyembunyikan scrollbar */}
            <style jsx>{scrollbarHideStyle}</style>

            {/* Tombol menu untuk mobile */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Main Container - Tetapkan tinggi agar Sidebar fixed */}
            <div className="w-full max-w-7xl bg-white rounded-xl shadow-2xl flex flex-col md:flex-row h-screen md:h-[90vh]">
                
                {/* Sidebar - Diimpor dari komponen eksternal */}
                <Sidebar 
                    activeTab={viewMode} 
                    setActiveTab={setViewMode} 
                    profileData={profileData} 
                    isComplete={isProfileComplete} 
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                {/* Content Area - Scrollable */}
                {viewMode === 'summary' || viewMode === 'complete' ? (
                    viewMode === 'summary' ? (
                        <ProfileSummaryView 
                            profileData={profileData} 
                            isComplete={isProfileComplete}
                            setViewMode={setViewMode} 
                        />
                    ) : (
                        <ProfileCompletionForm 
                            setViewMode={setViewMode}
                            initialProfileData={profileData}
                            setProfileData={setProfileData}
                            isComplete={isProfileComplete}
                        />
                    )
                ) : (
                    <div className="flex-1 p-10 flex items-center justify-center text-gray-500 h-full">
                        Konten untuk tab lain akan ditampilkan di sini (misalnya Dashboard Utama, Riwayat, dll).
                    </div>
                )}
            </div>
        </div>
    );
}
