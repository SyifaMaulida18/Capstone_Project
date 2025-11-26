"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  CheckCircle,
  ClipboardList,
  User,
  Users,
  History,
  Calendar,
  Stethoscope,
  Plus
} from "lucide-react";

// --- DUMMY DATA ---
// 1. Profil User Utama
const DUMMY_USER_PROFILE = {
  id: "u1",
  name: "Syifa",
  relation: "self", // Penanda Diri Sendiri
  email: "syifa@example.com",
  nomor_telepon: "081234567890",
  noKTP: "6471000000000001",
  tempat_lahir: "Balikpapan",
  tanggal_lahir: "1999-05-20",
};

// 2. Daftar Keluarga yang tersimpan (Family Folder)
const DUMMY_FAMILY_MEMBERS = [
  {
    id: "f1",
    name: "Bapak Joko",
    relation: "Ayah",
    nomor_telepon: "08111111111",
    noKTP: "6471000000000002",
    tempat_lahir: "Surabaya",
    tanggal_lahir: "1965-01-01",
  },
  {
    id: "f2",
    name: "Adik Budi",
    relation: "Anak",
    nomor_telepon: "-",
    noKTP: "-",
    tempat_lahir: "Balikpapan",
    tanggal_lahir: "2015-06-10",
  }
];

const DUMMY_POLIS = [
  { poli_id: 1, poli_name: "Poli Umum" },
  { poli_id: 2, poli_name: "Poli Gigi" },
  { poli_id: 3, poli_name: "Poli Jantung" },
  { poli_id: 4, poli_name: "Poli Mata" },
];

// 3. Rekam Medis (Dicampur user & keluarga)
const DUMMY_MEDICAL_RECORDS = [
  {
    id: 101,
    patient_id: "u1", // Milik Syifa
    tanggal: "2023-10-15",
    poli_id: 2,
    poli_name: "Poli Gigi",
    dokter: "drg. Budi",
    diagnosa: "Perawatan Saluran Akar",
  },
  {
    id: 102,
    patient_id: "u1", // Milik Syifa
    tanggal: "2023-11-01",
    poli_id: 3,
    poli_name: "Poli Jantung",
    dokter: "dr. Hartono",
    diagnosa: "Hipertensi Rutin",
  },
  {
    id: 103,
    patient_id: "f1", // Milik Ayah
    tanggal: "2023-09-01",
    poli_id: 3,
    poli_name: "Poli Jantung",
    dokter: "dr. Hartono",
    diagnosa: "Kontrol Jantung",
  }
];

export default function ReservasiPage() {
  const router = useRouter();

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  
  // State Pasien
  const [selectedPatientId, setSelectedPatientId] = useState("u1"); // Default diri sendiri
  const [patientList] = useState([DUMMY_USER_PROFILE, ...DUMMY_FAMILY_MEMBERS]); // Gabung list
  
  const [isControl, setIsControl] = useState(false); 
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const [formData, setFormData] = useState({
    nama: DUMMY_USER_PROFILE.name, // Default isi nama user
    email: DUMMY_USER_PROFILE.email,
    nomor_whatsapp: DUMMY_USER_PROFILE.nomor_telepon,
    nomor_ktp: DUMMY_USER_PROFILE.noKTP,
    tempat_lahir: DUMMY_USER_PROFILE.tempat_lahir,
    tanggal_lahir: DUMMY_USER_PROFILE.tanggal_lahir,
    penjaminan: "cash",
    keluhan: "",
    poli_id: "",
    poli_nama: "",
    tanggal_reservasi: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingDiagnosa, setLoadingDiagnosa] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Filter Rekam Medis berdasarkan pasien yang dipilih
  const filteredMedicalRecords = DUMMY_MEDICAL_RECORDS.filter(r => r.patient_id === selectedPatientId);

  // --- HANDLER GANTI PASIEN ---
  const handlePatientChange = (e) => {
    const newId = e.target.value;
    setSelectedPatientId(newId);
    setIsControl(false); // Reset kontrol
    setSelectedRecordId(null);

    if (newId === "new") {
      // Reset form kosong untuk orang baru
      setFormData(prev => ({
        ...prev,
        nama: "", email: "", nomor_whatsapp: "", nomor_ktp: "", tempat_lahir: "", tanggal_lahir: "",
        poli_id: "", poli_nama: "", keluhan: ""
      }));
    } else {
      // Isi form sesuai data keluarga yg dipilih
      const patient = patientList.find(p => p.id === newId);
      if (patient) {
        setFormData(prev => ({
          ...prev,
          nama: patient.name,
          email: patient.email || "",
          nomor_whatsapp: patient.nomor_telepon || "",
          nomor_ktp: patient.noKTP || "",
          tempat_lahir: patient.tempat_lahir || "",
          tanggal_lahir: patient.tanggal_lahir || "",
          poli_id: "", poli_nama: "", keluhan: "" // Reset poli & keluhan
        }));
      }
    }
  };

  // --- HANDLER LAINNYA ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleControlCheck = (e) => {
    setIsControl(e.target.checked);
    // Reset poli saat mode berubah
    setFormData(prev => ({ ...prev, keluhan: "", poli_id: "", poli_nama: "" }));
    setSelectedRecordId(null);
  };

  const handleSelectRecord = (record) => {
    setSelectedRecordId(record.id);
    setFormData(prev => ({
      ...prev,
      poli_id: record.poli_id,
      poli_nama: record.poli_name,
      keluhan: `Kontrol Rutin: ${record.diagnosa} (Dokter sebelumnya: ${record.dokter})`,
    }));
  };

  const handleDiagnosis = () => {
    setLoadingDiagnosa(true);
    setTimeout(() => {
        // Dummy logic: Selalu ke Poli Umum
        const foundPoli = DUMMY_POLIS[0]; 
        setFormData((prev) => ({
          ...prev,
          poli_id: foundPoli.poli_id,
          poli_nama: foundPoli.poli_name,
        }));
        setLoadingDiagnosa(false);
    }, 1500);
  };

  const nextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!formData.poli_id) return setError("Silakan pilih Poli / Riwayat Kontrol.");
      if (!formData.keluhan) return setError("Silakan isi keluhan.");
    }
    if (currentStep === 2) {
      if (!formData.nama || !formData.tanggal_lahir) return setError("Lengkapi data diri pasien.");
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setShowSuccessModal(true);
    }, 2000);
  };

  const Stepper = () => (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4 relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10"></div>
        <div className="flex justify-between items-start w-full">
          {["Tujuan", "Data Pasien", "Konfirmasi"].map((label, index) => {
            const stepNum = index + 1;
            const active = stepNum === currentStep;
            const done = stepNum < currentStep;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 bg-white ${active ? "border-[#8CC63F] text-[#003B73]" : done ? "bg-[#003B73] text-white border-[#003B73]" : "border-gray-200 text-gray-400"}`}>
                  {done ? <Check size={16} /> : stepNum}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? "text-[#003B73]" : "text-gray-400"}`}>{label}</span>
              </div>
            );
          })}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center items-start py-8 md:py-12 px-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-3xl overflow-hidden border border-neutral-100">
        <div className="bg-[#003B73] px-6 py-5 flex items-center gap-4 text-white">
          <button onClick={() => router.back()}><ArrowLeft /></button>
          <h1 className="text-xl font-bold">Buat Reservasi</h1>
        </div>

        <div className="p-6 md:p-8">
          <Stepper />
          {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2"><AlertCircle size={18}/>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. PILIH PASIEN (Fitur Baru) */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="text-sm font-bold text-[#003B73] mb-2 flex items-center gap-2">
                        <Users size={18} /> Reservasi Untuk Siapa?
                    </label>
                    <select 
                        value={selectedPatientId} 
                        onChange={handlePatientChange}
                        className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
                    >
                        {patientList.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.relation === 'self' ? `${p.name} (Saya Sendiri)` : `${p.name} (${p.relation})`}
                            </option>
                        ))}
                        <option value="new">+ Tambah Pasien Baru</option>
                    </select>
                </div>

                {/* 2. KONTROL CHECKBOX (Hanya muncul jika bukan pasien baru & ada history) */}
                {selectedPatientId !== "new" && (
                    <div className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => !filteredMedicalRecords.length ? null : document.getElementById('ctrl').click()}>
                        <input 
                            id="ctrl" type="checkbox" checked={isControl} onChange={handleControlCheck} 
                            disabled={filteredMedicalRecords.length === 0}
                            className="w-5 h-5 accent-[#003B73]" 
                        />
                        <div className="flex-1">
                            <span className={`font-bold block ${filteredMedicalRecords.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>Kunjungan Kontrol</span>
                            {filteredMedicalRecords.length === 0 && <span className="text-xs text-red-400">Tidak ada riwayat medis untuk pasien ini.</span>}
                        </div>
                    </div>
                )}

                {/* 3. KONTEN DINAMIS */}
                {isControl ? (
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-700">Pilih Riwayat {patientList.find(p=>p.id===selectedPatientId)?.name}:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                            {filteredMedicalRecords.map(rec => (
                                <div key={rec.id} onClick={() => handleSelectRecord(rec)} className={`p-4 border rounded-xl cursor-pointer relative ${selectedRecordId === rec.id ? "border-[#8CC63F] bg-green-50" : "hover:bg-gray-50"}`}>
                                    {selectedRecordId === rec.id && <CheckCircle size={18} className="absolute top-2 right-2 text-[#8CC63F]" />}
                                    <p className="text-xs text-gray-500 mb-1">{rec.tanggal}</p>
                                    <p className="font-bold text-[#003B73]">{rec.poli_name}</p>
                                    <p className="text-xs text-gray-600 mt-1">{rec.dokter}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Keluhan</label>
                        <textarea 
                            value={formData.keluhan} 
                            onChange={(e) => setFormData({...formData, keluhan: e.target.value})}
                            className="w-full p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                            rows={3} placeholder="Ceritakan keluhan pasien..." 
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={handleDiagnosis} disabled={loadingDiagnosa} className="flex-1 py-3 bg-[#003B73] text-white rounded-xl font-bold flex justify-center items-center gap-2">
                                {loadingDiagnosa ? <Loader2 className="animate-spin"/> : <Activity size={18}/>} Analisa AI
                            </button>
                        </div>
                        {/* Manual Select */}
                        <div className="mt-4">
                             <label className="block text-sm font-bold text-gray-700 mb-2">Atau Pilih Poli Manual</label>
                             <select 
                                value={formData.poli_id}
                                onChange={(e) => {
                                    const p = DUMMY_POLIS.find(x => x.poli_id == e.target.value);
                                    setFormData(prev => ({...prev, poli_id: p.poli_id, poli_nama: p.poli_name}));
                                }}
                                className="w-full p-3 border rounded-xl bg-white"
                             >
                                <option value="">-- Pilih Poli --</option>
                                {DUMMY_POLIS.map(p => <option key={p.poli_id} value={p.poli_id}>{p.poli_name}</option>)}
                             </select>
                        </div>
                    </div>
                )}

                {/* Result Display */}
                {formData.poli_id && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-xs text-green-600 font-bold uppercase">Poli Tujuan</p>
                            <p className="text-lg font-bold text-[#003B73]">{formData.poli_nama}</p>
                        </div>
                        <CheckCircle className="text-green-600" />
                    </div>
                )}
              </div>
            )}

            {/* STEP 2: DATA DIRI (Otomatis Terisi / Manual jika Pasien Baru) */}
            {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 flex items-center gap-3">
                        <div className="bg-blue-200 p-2 rounded-full text-[#003B73]"><User size={20}/></div>
                        <div>
                            <p className="text-xs text-gray-500">Data Pasien:</p>
                            <p className="font-bold text-[#003B73]">{selectedPatientId === 'new' ? "Pasien Baru" : formData.nama}</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField label="Nama Lengkap" value={formData.nama} onChange={handleChange} name="nama" required />
                        <InputField label="NIK / KTP" value={formData.nomor_ktp} onChange={handleChange} name="nomor_ktp" required />
                        <InputField label="Tempat Lahir" value={formData.tempat_lahir} onChange={handleChange} name="tempat_lahir" required />
                        <InputField label="Tanggal Lahir" value={formData.tanggal_lahir} onChange={handleChange} name="tanggal_lahir" type="date" required />
                        <InputField label="No. HP / WA" value={formData.nomor_whatsapp} onChange={handleChange} name="nomor_whatsapp" required />
                        <InputField label="Email (Opsional)" value={formData.email} onChange={handleChange} name="email" />
                    </div>
                </div>
            )}

            {/* STEP 3: JADWAL */}
            {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Metode Bayar</label>
                            <select name="penjaminan" value={formData.penjaminan} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white">
                                <option value="cash">Umum / Cash</option>
                                <option value="bpjs">BPJS Kesehatan</option>
                                <option value="asuransi">Asuransi Lain</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Kunjungan</label>
                            <input type="date" name="tanggal_reservasi" value={formData.tanggal_reservasi} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                        </div>
                    </div>
                </div>
            )}

            {/* BUTTONS */}
            <div className="mt-8 pt-6 border-t flex justify-between">
                {currentStep > 1 ? <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 text-gray-500 font-bold">Kembali</button> : <div/>}
                {currentStep < 3 ? (
                    <button type="button" onClick={nextStep} className="bg-[#8CC63F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7ab332] transition flex items-center gap-2">Lanjut <ArrowRight size={18}/></button>
                ) : (
                    <button type="submit" disabled={loading} className="bg-[#003B73] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : "Kirim Reservasi"}
                    </button>
                )}
            </div>

          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center animate-fadeIn">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><ClipboardList size={32}/></div>
                <h3 className="text-xl font-bold text-[#003B73] mb-2">Reservasi Berhasil!</h3>
                <p className="text-gray-500 text-sm mb-6">Reservasi untuk <b>{formData.nama}</b> telah dibuat.</p>
                <button onClick={() => router.push("/user/dashboard")} className="w-full py-3 bg-[#003B73] text-white rounded-xl font-bold">Ke Dashboard</button>
            </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, name, value, onChange, type="text", required }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <input type={type} name={name} value={value} onChange={onChange} required={required} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
    )
}