"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api"; 
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  CheckCircle,
  User,
  Stethoscope,
  Calendar,
  Clock
} from "lucide-react";

export default function ReservasiPage() {
  const router = useRouter();

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data Master
  const [polis, setPolis] = useState([]);
  const [dokters, setDokters] = useState([]); // List object JadwalDokter lengkap
  
  // State untuk logic Validasi Hari
  const [selectedDoctorSchedule, setSelectedDoctorSchedule] = useState(null); 
  const [availableDaysText, setAvailableDaysText] = useState(""); // Info text: "Senin, Kamis"

  // AI & Analisa
  const [analyzing, setAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Form Data
  const [isSelf, setIsSelf] = useState(true);
  
  const [localUserData, setLocalUserData] = useState(null); 
  const [apiProfileData, setApiProfileData] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    nomor_whatsapp: "",
    nomor_ktp: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki",
    alamat: "",
    keluhan: "",
    poli_id: "",
    dokter_id: "",
    tanggal_reservasi: "",
    penjaminan: "cash",
    nama_asuransi: "",
    nomor_asuransi: ""
  });

  // --- 1. FETCH DATA AWAL ---
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const poliRes = await api.get("/polis");
        setPolis(poliRes.data);

        const storedUserStr = localStorage.getItem("user");
        let storedUser = null;
        if (storedUserStr) {
            storedUser = JSON.parse(storedUserStr);
            setLocalUserData(storedUser);
        }

        try {
            const profileRes = await api.get("/profile");
            if (profileRes.data && profileRes.data.data) {
                setApiProfileData(profileRes.data.data);
                fillSelfData(storedUser, profileRes.data.data);
            } else {
                fillSelfData(storedUser, null);
            }
        } catch (profileErr) {
            fillSelfData(storedUser, null);
        }

      } catch (err) {
        console.error("Gagal mengambil data poli:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const fillSelfData = (user, profile) => {
    setFormData((prev) => ({
      ...prev,
      nama: user?.name || user?.Nama || "", 
      email: user?.email || user?.Email || "",
      nomor_whatsapp: profile?.nomor_telepon || user?.nomor_telepon || "",
      nomor_ktp: profile?.noKTP || "",
      tempat_lahir: profile?.tempat_lahir || "",
      tanggal_lahir: profile?.tanggal_lahir || "",
      jenis_kelamin: profile?.jenis_kelamin || "Laki-laki",
      alamat: profile?.alamat || "",
      penjaminan: profile?.penjaminan || "cash",
      nama_asuransi: profile?.nama_asuransi || "",
      nomor_asuransi: profile?.nomor_asuransi || ""
    }));
  };

  const clearPatientData = () => {
    setFormData((prev) => ({
      ...prev,
      nama: "",
      email: "",
      nomor_whatsapp: "",
      nomor_ktp: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: "Laki-laki",
      alamat: "",
      nama_asuransi: "",
      nomor_asuransi: ""
    }));
  };

  // --- LOGIC JADWAL & VALIDASI HARI ---

  // Helper: Cek apakah field praktek di DB bernilai aktif (1, Y, atau true)
  const isPraktekActive = (val) => {
      return val === '1' || val === 1 || val === 'Y' || val === true;
  };

  // Helper: Ubah Data JadwalDokter DB menjadi Array angka hari JS (0=Minggu, 1=Senin, dst)
  const getDoctorActiveDays = (jadwal) => {
      if(!jadwal) return [];
      const days = [];
      if (isPraktekActive(jadwal.minggu_praktek)) days.push(0);
      if (isPraktekActive(jadwal.senin_praktek)) days.push(1);
      if (isPraktekActive(jadwal.selasa_praktek)) days.push(2);
      if (isPraktekActive(jadwal.rabu_praktek)) days.push(3);
      if (isPraktekActive(jadwal.kamis_praktek)) days.push(4);
      if (isPraktekActive(jadwal.jumat_praktek)) days.push(5);
      if (isPraktekActive(jadwal.sabtu_praktek)) days.push(6);
      return days;
  };

  // Helper: Generate teks hari tersedia untuk UI
  const generateAvailableDaysText = (jadwal) => {
      if(!jadwal) return "";
      const mapDay = {
          minggu_praktek: "Minggu",
          senin_praktek: "Senin",
          selasa_praktek: "Selasa",
          rabu_praktek: "Rabu",
          kamis_praktek: "Kamis",
          jumat_praktek: "Jumat",
          sabtu_praktek: "Sabtu"
      };
      
      let textArr = [];
      Object.keys(mapDay).forEach(key => {
          if (isPraktekActive(jadwal[key])) textArr.push(mapDay[key]);
      });
      
      return textArr.length > 0 ? textArr.join(", ") : "Tidak ada jadwal praktek";
  };

  // --- HANDLERS ---
  
  const handlePatientTypeChange = (e) => {
    const val = e.target.value === "self";
    setIsSelf(val);
    if (val) fillSelfData(localUserData, apiProfileData);
    else clearPatientData();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePoliChange = async (e) => {
    const selectedPoliId = e.target.value;
    // Reset dokter dan jadwal saat ganti poli
    setFormData((prev) => ({ ...prev, poli_id: selectedPoliId, dokter_id: "", tanggal_reservasi: "" }));
    setSelectedDoctorSchedule(null);
    setAvailableDaysText("");
    
    if (selectedPoliId) {
        try {
            const res = await api.get(`/public/jadwal-dokter/${selectedPoliId}`);
            setDokters(res.data);
        } catch (err) {
            console.error("Gagal ambil dokter", err);
            setDokters([]);
        }
    } else {
        setDokters([]);
    }
  };

  // Handler Khusus Saat Memilih Dokter
  const handleDokterChange = (e) => {
      const docId = e.target.value;
      setFormData(prev => ({ ...prev, dokter_id: docId, tanggal_reservasi: "" })); // Reset tanggal jika ganti dokter
      setError("");

      if (docId) {
          // Cari data object jadwal lengkap dari state 'dokters'
          const selectedSchedule = dokters.find(d => String(d.dokter_id) === String(docId));
          setSelectedDoctorSchedule(selectedSchedule);
          setAvailableDaysText(generateAvailableDaysText(selectedSchedule));
      } else {
          setSelectedDoctorSchedule(null);
          setAvailableDaysText("");
      }
  };

  // Handler Khusus Validasi Tanggal
  const handleDateChange = (e) => {
      const dateVal = e.target.value;
      setError("");

      if (!dateVal) {
        setFormData(prev => ({...prev, tanggal_reservasi: ""}));
        return;
      }

      // 1. Cek apakah dokter sudah dipilih
      if (!selectedDoctorSchedule) {
          setError("Silakan pilih dokter terlebih dahulu.");
          return;
      }

      // 2. Ambil Hari dari tanggal yang dipilih (0-6)
      const selectedDate = new Date(dateVal);
      const dayIndex = selectedDate.getDay(); 

      // 3. Ambil daftar hari aktif dokter
      const activeDays = getDoctorActiveDays(selectedDoctorSchedule);

      // 4. Validasi
      if (!activeDays.includes(dayIndex)) {
          setError(`Dokter tidak praktek pada tanggal tersebut. Hari tersedia: ${availableDaysText}`);
          // Reset tanggal di form
          setFormData(prev => ({...prev, tanggal_reservasi: ""}));
      } else {
          // Valid: Simpan tanggal
          setFormData(prev => ({...prev, tanggal_reservasi: dateVal}));
      }
  };


  // Simulasi AI Analysis
  const runAiAnalysis = () => {
    if (!formData.keluhan) return setError("Mohon isi keluhan terlebih dahulu.");
    setError("");
    setAnalyzing(true);
    
    setTimeout(() => {
        const keluhanLower = formData.keluhan.toLowerCase();
        let suggestion = "Poli Umum";
        let foundPoliId = polis.find(p => p.poli_name.toLowerCase().includes("umum"))?.poli_id;

        if (keluhanLower.includes("gigi") || keluhanLower.includes("mulut")) {
            suggestion = "Poli Gigi";
            foundPoliId = polis.find(p => p.poli_name.toLowerCase().includes("gigi"))?.poli_id;
        } else if (keluhanLower.includes("jantung") || keluhanLower.includes("dada")) {
            suggestion = "Poli Jantung";
             foundPoliId = polis.find(p => p.poli_name.toLowerCase().includes("jantung"))?.poli_id;
        }

        setAiRecommendation(suggestion);
        setAnalyzing(false);
        
        if (foundPoliId) {
            setFormData(prev => ({...prev, poli_id: foundPoliId, dokter_id: "", tanggal_reservasi: ""}));
            api.get(`/public/jadwal-dokter/${foundPoliId}`).then(res => setDokters(res.data));
        }
    }, 1500);
  };

  const nextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!formData.keluhan) return setError("Silakan isi keluhan utama Anda.");
      if (isSelf) {
          if (!formData.nomor_ktp || !formData.tanggal_lahir) {
              return setError("Data Profil Anda belum lengkap. Silakan lengkapi profil atau pilih 'Orang Lain'.");
          }
      } else {
          if(!formData.nama || !formData.nomor_ktp) return setError("Data pasien wajib diisi lengkap.");
      }
      runAiAnalysis();
    }
    
    if (currentStep === 2) {
      if (!formData.poli_id) return setError("Silakan pilih Poli tujuan.");
      if (!formData.dokter_id) return setError("Silakan pilih Dokter.");
      if (!formData.tanggal_reservasi) return setError("Silakan pilih tanggal kunjungan yang valid.");
    }
    
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
        is_self: isSelf ? 1 : 0,
        poli_id: formData.poli_id,
        tanggal_reservasi: formData.tanggal_reservasi,
        keluhan: formData.keluhan,
        dokter_id: formData.dokter_id, 
        penanggung_jawab_id: null,
    };

    if (!isSelf) {
        Object.assign(payload, {
            nama: formData.nama,
            email: formData.email,
            jenis_kelamin: formData.jenis_kelamin,
            tempat_lahir: formData.tempat_lahir,
            tanggal_lahir: formData.tanggal_lahir,
            nomor_ktp: formData.nomor_ktp,
            nomor_whatsapp: formData.nomor_whatsapp,
            penjaminan: formData.penjaminan,
            status_keluarga: "Lainnya",
            alamat: formData.alamat,
            nama_asuransi: formData.penjaminan === 'asuransi' ? formData.nama_asuransi : null,
            nomor_asuransi: formData.penjaminan === 'asuransi' ? formData.nomor_asuransi : null,
        });
    }

    try {
      await api.post("/reservations", payload);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat membuat reservasi.");
    } finally {
      setLoading(false);
    }
  };

  const Stepper = () => (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4 relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10"></div>
        <div className="flex justify-between items-start w-full">
          {["Data & Keluhan", "Poli & Jadwal", "Konfirmasi"].map((label, index) => {
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

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#003B73]" size={40}/></div>;

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center items-start py-8 md:py-12 px-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-3xl overflow-hidden border border-neutral-100">
        <div className="bg-[#003B73] px-6 py-5 flex items-center gap-4 text-white">
          <button onClick={() => currentStep === 1 ? router.back() : setCurrentStep(prev=>prev-1)}><ArrowLeft /></button>
          <h1 className="text-xl font-bold">Buat Reservasi Baru</h1>
        </div>

        <div className="p-6 md:p-8">
          <Stepper />
          {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2 border border-red-200"><AlertCircle size={18} className="shrink-0 mt-0.5"/><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <label className="text-sm font-bold text-[#003B73] mb-3 flex items-center gap-2">
                        <User size={18} /> Reservasi Untuk Siapa?
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="patient_type" value="self" checked={isSelf} onChange={handlePatientTypeChange} className="w-5 h-5 accent-[#003B73]" />
                            <span className="font-medium text-gray-700">Diri Sendiri</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="patient_type" value="other" checked={!isSelf} onChange={handlePatientTypeChange} className="w-5 h-5 accent-[#003B73]" />
                            <span className="font-medium text-gray-700">Orang Lain / Keluarga</span>
                        </label>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleChange} disabled={isSelf} required />
                    <InputField label="Nomor KTP" name="nomor_ktp" value={formData.nomor_ktp} onChange={handleChange} disabled={isSelf} required />
                    <InputField label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isSelf} required />
                    <InputField label="Tanggal Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleChange} disabled={isSelf} required />
                    <InputField label="Nomor WhatsApp" name="nomor_whatsapp" value={formData.nomor_whatsapp} onChange={handleChange} disabled={isSelf} required />
                    {!isSelf && (
                        <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-gray-700 mb-1">Alamat</label>
                             <textarea name="alamat" value={formData.alamat} onChange={handleChange} className="w-full p-3 border rounded-xl" rows={2} />
                        </div>
                    )}
                </div>

                <div className="border-t pt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Keluhan Utama <span className="text-red-500">*</span></label>
                    <textarea 
                        name="keluhan" value={formData.keluhan} onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" rows={3} required
                    />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                {analyzing ? (
                    <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                        <Loader2 className="animate-spin text-[#003B73] mb-2" size={32} />
                        <p className="font-bold text-[#003B73]">AI Sedang Menganalisa...</p>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-700 mt-1"><Stethoscope size={20}/></div>
                        <div>
                            <p className="text-sm font-bold text-green-800">Rekomendasi</p>
                            <p className="text-gray-700 text-sm">Saran: <span className="font-bold text-[#003B73]">{aiRecommendation || "Poli Umum"}</span></p>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Poli Tujuan</label>
                        <select name="poli_id" value={formData.poli_id} onChange={handlePoliChange} className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500">
                            <option value="">-- Pilih Poli --</option>
                            {polis.map((p) => <option key={p.poli_id} value={p.poli_id}>{p.poli_name}</option>)}
                        </select>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Dokter</label>
                         <select 
                            name="dokter_id" value={formData.dokter_id} 
                            onChange={handleDokterChange} // Gunakan Handler Baru
                            disabled={!formData.poli_id}
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                         >
                             <option value="">-- Pilih Dokter --</option>
                             {dokters.map((d) => (
                                 <option key={d.dokter_id} value={d.dokter_id}>
                                     {d.dokter?.nama_dokter}
                                 </option>
                             ))}
                         </select>
                         
                         {/* Info Jadwal yang muncul setelah memilih dokter */}
                         {selectedDoctorSchedule && (
                             <div className="mt-2 text-xs flex items-start gap-1.5 text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                 <Clock size={14} className="mt-0.5" />
                                 <span><b>Jadwal Praktek:</b> {availableDaysText}</span>
                             </div>
                         )}
                         
                         {formData.poli_id && dokters.length === 0 && (
                             <p className="text-xs text-red-400 mt-1">Belum ada jadwal dokter aktif.</p>
                         )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Rencana Tanggal</label>
                        <input 
                            type="date" 
                            name="tanggal_reservasi" 
                            value={formData.tanggal_reservasi} 
                            onChange={handleDateChange} // Gunakan Handler Validasi Baru
                            min={new Date().toISOString().split("T")[0]}
                            disabled={!formData.dokter_id} // Disable jika belum pilih dokter
                            className="w-full p-3 border border-gray-300 rounded-xl disabled:bg-gray-100"
                            required 
                        />
                        <p className="text-xs text-gray-400 mt-1">*Sesuaikan dengan hari praktek dokter</p>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Metode Penjaminan</label>
                        <select name="penjaminan" value={formData.penjaminan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl bg-white">
                            <option value="cash">Umum / Cash</option>
                            <option value="bpjs">BPJS Kesehatan</option>
                            <option value="asuransi">Asuransi Swasta</option>
                        </select>
                     </div>
                </div>
                
                {formData.penjaminan === 'asuransi' && (
                    <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                        <InputField label="Nama Asuransi" name="nama_asuransi" value={formData.nama_asuransi} onChange={handleChange} required />
                        <InputField label="Nomor Polis" name="nomor_asuransi" value={formData.nomor_asuransi} onChange={handleChange} required />
                    </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-200">
                        <h3 className="font-bold text-[#003B73] border-b pb-2">Ringkasan Reservasi</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Pasien:</span>
                            <span className="font-bold">{formData.nama}</span>
                            <span className="text-gray-500">Poli:</span>
                            <span className="font-bold">{polis.find(p=>p.poli_id == formData.poli_id)?.poli_name}</span>
                            <span className="text-gray-500">Dokter:</span>
                            <span className="font-bold">{dokters.find(d=>d.dokter_id == formData.dokter_id)?.dokter?.nama_dokter}</span>
                            <span className="text-gray-500">Tanggal:</span>
                            <span className="font-bold">{formData.tanggal_reservasi}</span>
                            <span className="text-gray-500">Bayar:</span>
                            <span className="uppercase font-bold text-[#8CC63F]">{formData.penjaminan}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t flex justify-between">
                {currentStep > 1 && (
                    <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Kembali</button>
                )}
                
                <div className="ml-auto">
                    {currentStep < 3 ? (
                        <button type="button" onClick={nextStep} className="bg-[#8CC63F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7ab332] transition flex items-center gap-2 shadow-lg shadow-green-100">
                            Lanjut <ArrowRight size={18}/>
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="bg-[#003B73] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center gap-2 shadow-lg shadow-blue-100">
                            {loading ? <Loader2 className="animate-spin"/> : "Kirim Reservasi"}
                        </button>
                    )}
                </div>
            </div>

          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center animate-fadeIn shadow-2xl">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><CheckCircle size={32}/></div>
                <h3 className="text-xl font-bold text-[#003B73] mb-2">Berhasil!</h3>
                <p className="text-gray-500 text-sm mb-6">Reservasi Anda telah dikirim.</p>
                <button onClick={() => router.push("/user/dashboard")} className="w-full py-3 bg-[#003B73] text-white rounded-xl font-bold hover:bg-blue-900 transition">Ke Dashboard</button>
            </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, name, value, onChange, type="text", required, disabled }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <input type={type} name={name} value={value} onChange={onChange} required={required} disabled={disabled}
                className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${disabled ? 'bg-gray-100 text-gray-600 font-medium' : 'bg-white'}`} 
            />
        </div>
    )
}