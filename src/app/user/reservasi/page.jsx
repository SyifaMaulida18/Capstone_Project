"use client";

import api from "@/services/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// --- DAFTAR KATA KUNCI KELUHAN (DARI GAMBAR) ---
const VALID_KEYWORDS = [
  "nyeri", "demam", "flu", "pilek", "pusing", "covid", "virus",
  "batuk", "sesak", "napas", "dada", "jantung", "telinga", 
  "radang", "sakit", "mata", "penglihatan", "kabur", "gusi", 
  "gigi", "mulut", "behel", "cabut", "ruam", "gatal", "jerawat", 
  "buang air", "mual", "muntah", "diare", "tifus", "hepatitis", 
  "diabetes", "kesemutan", "mati rasa", "patah", "tulang", "cedera", 
  "benjolan", "pendarahan", "darah", "bayi", "anak", "hamil", 
  "kandungan", "asi", "terapi", "fisik", "lansia", "diet", 
  "hiv", "cek", "kesehatan", "imunisasi", "kejang", "kepala", 
  "tangan", "bicara"
];

// --- Helper Input dengan Validasi Error ---
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  disabled,
  maxLength,
  placeholder,
  error,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-xl outline-none transition-all ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
        } ${disabled ? "font-medium" : "bg-white"}`}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-medium animate-pulse">{error}</p>}
    </div>
  );
}

// --- Helper Select dengan Validasi Error ---
function SelectField({ label, name, value, onChange, options, required, disabled, error }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full p-3 border rounded-xl outline-none transition-all ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
        } ${disabled ? "bg-gray-100" : "bg-white"}`}
      >
        <option value="">-- Pilih {label} --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

// --- Helper Region Select ---
function RegionSelect({ label, name, value, onChange, options, disabled, placeholder, error }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-3 border rounded-xl outline-none transition-all appearance-none ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50"
              : disabled
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
          }`}
        >
          <option value="">-- {placeholder} --</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default function ReservasiPage() {
  const router = useRouter();

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [todayStr, setTodayStr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [polis, setPolis] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [selectedDoctorSchedule, setSelectedDoctorSchedule] = useState(null);
  const [availableDaysText, setAvailableDaysText] = useState("");
  const [isSelf, setIsSelf] = useState(true);
  const [localUserData, setLocalUserData] = useState(null);
  const [apiProfileData, setApiProfileData] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState("self");
  const [savedPatients, setSavedPatients] = useState([]);
  const [regions, setRegions] = useState({ provinces: [], regencies: [], districts: [], villages: [] });
  const [selectedRegionIds, setSelectedRegionIds] = useState({ provinceId: "", regencyId: "", districtId: "", villageId: "" });
  
  const [formData, setFormData] = useState({
    nama: "", email: "", nomor_whatsapp: "", nomor_ktp: "",
    tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "Laki-laki",
    alamat: "", provinsi: "", kota_kabupaten: "", kecamatan: "", kelurahan: "",
    status_perkawinan: "", suku: "", agama: "", pendidikan_terakhir: "", nomor_pegawai: "",
    status_keluarga: "", nama_keluarga: "",
    keluhan: "", poli_id: "", dokter_id: "", tanggal_reservasi: "",
    penjaminan: "cash", nama_asuransi: "", nomor_asuransi: "",
  });

  // --- LOGIKA VALIDASI REAL-TIME (DIPERBARUI) ---
  const validateField = (name, value) => {
    let errorMsg = "";
    const letterOnlyRegex = /^[a-zA-Z\s\.\,\']+$/;
    
    switch (name) {
      case "keluhan":
        if (!value) {
            errorMsg = "Keluhan utama wajib diisi.";
        } else {
            // 1. Cek Minimal 2 Kata
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 2) {
                errorMsg = "Keluhan minimal harus terdiri dari 2 kata.";
            } else {
                // 2. Cek Keyword (Hanya jika jumlah kata sudah cukup)
                const lowerVal = value.toLowerCase();
                const hasKeyword = VALID_KEYWORDS.some(keyword => lowerVal.includes(keyword));
                if (!hasKeyword) {
                    errorMsg = "Mohon jelaskan keluhan medis Anda lebih spesifik (contoh: demam, nyeri, pusing, dll).";
                }
            }
        }
        break;

      case "nama":
        if (value) {
            if (value.trim().length <= 1) {
                errorMsg = "Nama harus lebih dari 1 huruf.";
            } else if (!letterOnlyRegex.test(value)) {
                errorMsg = "Nama hanya boleh berisi huruf.";
            }
        } else {
            errorMsg = "Nama wajib diisi.";
        }
        break;

      case "nomor_whatsapp":
        if (value) {
            if (!/^\d+$/.test(value)) {
                errorMsg = "Nomor HP hanya boleh angka.";
            } else if (value.length < 10) {
                errorMsg = "Nomor WhatsApp minimal 10 digit.";
            }
        } else {
            errorMsg = "Nomor WhatsApp wajib diisi.";
        }
        break;

      case "tempat_lahir":
        if (value && !letterOnlyRegex.test(value)) {
            errorMsg = "Tempat lahir hanya boleh huruf.";
        } else if (!value) {
            errorMsg = "Tempat lahir wajib diisi.";
        }
        break;

      case "suku":
        if (value && !letterOnlyRegex.test(value)) {
            errorMsg = "Suku hanya boleh huruf.";
        }
        break;

      case "status_keluarga":
        if (value && !letterOnlyRegex.test(value)) {
            errorMsg = "Status hubungan hanya boleh huruf.";
        }
        break;

      case "nama_keluarga":
        if (value && !letterOnlyRegex.test(value)) {
            errorMsg = "Nama keluarga hanya boleh huruf.";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Format email tidak valid.";
        break;

      case "nomor_ktp":
        if (value && (!/^\d+$/.test(value) || value.length !== 16)) errorMsg = "Nomor KTP harus 16 digit angka.";
        break;

      case "tanggal_lahir":
      case "alamat":
      case "provinsi":
      case "kota_kabupaten":
      case "kecamatan":
      case "kelurahan":
        if (!value) errorMsg = "Field ini wajib diisi.";
        break;

      default:
        break;
    }
    return errorMsg;
  };

  const isPraktekActive = (val) => val == 1 || val === "1" || val === "Y" || val === "y" || val === true;
  const getDoctorActiveDays = (jadwal) => {
    if (!jadwal) return [];
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
  const generateAvailableDaysText = (jadwal) => {
    if (!jadwal) return "";
    const mapDay = {
      minggu_praktek: "Minggu", senin_praktek: "Senin", selasa_praktek: "Selasa",
      rabu_praktek: "Rabu", kamis_praktek: "Kamis", jumat_praktek: "Jumat", sabtu_praktek: "Sabtu",
    };
    const textArr = Object.keys(mapDay).reduce((acc, key) => {
      if (isPraktekActive(jadwal[key])) acc.push(mapDay[key]);
      return acc;
    }, []);
    return textArr.length > 0 ? textArr.join(", ") : "Tidak ada jadwal praktek";
  };

  const fillSelfData = useCallback((user, profile) => {
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
      provinsi: profile?.provinsi || "",
      kota_kabupaten: profile?.["kota/kabupaten"] || "",
      kecamatan: profile?.kecamatan || "",
      kelurahan: profile?.kelurahan || "",
      status_perkawinan: profile?.status_perkawinan || "",
      suku: profile?.suku || "",
      agama: profile?.agama || "",
      pendidikan_terakhir: profile?.pendidikan_terakhir || "",
      nomor_pegawai: profile?.nomor_pegawai || "",
      status_keluarga: profile?.status_keluarga || "",
      nama_keluarga: profile?.nama_keluarga || "",
      penjaminan: profile?.penjaminan || "cash",
      nama_asuransi: profile?.nama_asuransi || "",
      nomor_asuransi: profile?.nomor_asuransi || "",
    }));
    setFieldErrors({});
  }, []);

  const clearPatientData = () => {
    setFormData((prev) => ({
      ...prev,
      nama: "", email: "", nomor_whatsapp: "", nomor_ktp: "",
      tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "Laki-laki",
      alamat: "", provinsi: "", kota_kabupaten: "", kecamatan: "", kelurahan: "",
      status_perkawinan: "", suku: "", agama: "", pendidikan_terakhir: "", nomor_pegawai: "",
      status_keluarga: "", nama_keluarga: "",
      penjaminan: "cash", nama_asuransi: "", nomor_asuransi: "",
    }));
    setSelectedRegionIds({ provinceId: "", regencyId: "", districtId: "", villageId: "" });
    setFieldErrors({});
  };

  const fillHistoryData = (patientData) => {
    setFormData((prev) => ({
      ...prev,
      nama: patientData.nama || "",
      email: patientData.email || "",
      nomor_whatsapp: patientData.nomor_whatsapp || "",
      nomor_ktp: patientData.nomor_ktp || "",
      tempat_lahir: patientData.tempat_lahir || "",
      tanggal_lahir: patientData.tanggal_lahir ? String(patientData.tanggal_lahir).split("T")[0] : "",
      jenis_kelamin: patientData.jenis_kelamin || "Laki-laki",
      alamat: patientData.alamat || "",
      provinsi: patientData.provinsi || "",
      kota_kabupaten: patientData.kota_kabupaten || patientData["kota/kabupaten"] || "",
      kecamatan: patientData.kecamatan || "",
      kelurahan: patientData.kelurahan || "",
      status_perkawinan: patientData.status_perkawinan || "",
      suku: patientData.suku || "",
      agama: patientData.agama || "",
      pendidikan_terakhir: patientData.pendidikan_terakhir || "",
      nomor_pegawai: patientData.nomor_pegawai || "",
      status_keluarga: patientData.status_keluarga || "",
      nama_keluarga: patientData.nama_keluarga || "",
      penjaminan: patientData.penjaminan || "cash",
      nama_asuransi: patientData.nama_asuransi || "",
      nomor_asuransi: patientData.nomor_asuransi || "",
    }));
    setFieldErrors({});
  };

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const provRes = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const provinces = await provRes.json();
        setRegions(prev => ({ ...prev, provinces }));

        const jadwalRes = await api.get("/jadwal-dokter");
        const rawSchedules = jadwalRes.data?.data ?? jadwalRes.data ?? [];
        setAllSchedules(rawSchedules);

        const uniquePolisMap = new Map();
        rawSchedules.forEach((item) => {
          if (item.poli && item.poli.poli_id) {
            if (!uniquePolisMap.has(item.poli.poli_id)) uniquePolisMap.set(item.poli.poli_id, item.poli);
          }
        });
        setPolis(Array.from(uniquePolisMap.values()));

        const storedUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        let storedUser = null;
        if (storedUserStr) {
          storedUser = JSON.parse(storedUserStr);
          setLocalUserData(storedUser);
        }

        let currentProfile = null;
        try {
          const profileRes = await api.get("/profile");
          currentProfile = profileRes.data?.data ?? null;
          setApiProfileData(currentProfile);
          fillSelfData(storedUser, currentProfile);
        } catch (profileErr) {
          fillSelfData(storedUser, null);
        }

        try {
          const historyRes = await api.get("/my-reservations");
          const historyData = historyRes.data?.data ?? historyRes.data ?? [];
          const uniquePatients = [];
          const seenKTP = new Set();
          if (currentProfile?.noKTP) seenKTP.add(currentProfile.noKTP);
          historyData.forEach((res) => {
            if (res.nomor_ktp && res.is_self !== 1 && res.is_self !== true) {
              if (!seenKTP.has(res.nomor_ktp)) {
                seenKTP.add(res.nomor_ktp);
                uniquePatients.push(res);
              }
            }
          });
          setSavedPatients(uniquePatients);
        } catch (histErr) {}
      } catch (err) {
        setError("Gagal memuat data awal.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [fillSelfData]);

  const filterDoctorsByPoli = (poliId) => {
    if (!poliId) { setDokters([]); return; }
    const filteredSchedules = allSchedules.filter(s => String(s.poli_id) === String(poliId));
    setDokters(filteredSchedules);
  };

  const handleRegionChange = (type, e) => {
    const selectedId = e.target.value;
    const index = e.target.selectedIndex;
    const selectedName = e.target.options[index].text;
    const fieldName = type === 'kota' ? 'kota_kabupaten' : type;
    setFieldErrors(prev => ({ ...prev, [fieldName]: "" }));

    if (type === "provinsi") {
        setSelectedRegionIds({ provinceId: selectedId, regencyId: "", districtId: "", villageId: "" });
        setFormData(prev => ({ ...prev, provinsi: selectedName, kota_kabupaten: "", kecamatan: "", kelurahan: "" }));
        setRegions(prev => ({ ...prev, regencies: [], districts: [], villages: [] }));
        if (selectedId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedId}.json`)
                .then(res => res.json()).then(data => setRegions(prev => ({ ...prev, regencies: data })));
        }
    } else if (type === "kota") {
        setSelectedRegionIds(prev => ({ ...prev, regencyId: selectedId, districtId: "", villageId: "" }));
        setFormData(prev => ({ ...prev, kota_kabupaten: selectedName, kecamatan: "", kelurahan: "" }));
        setRegions(prev => ({ ...prev, districts: [], villages: [] }));
        if (selectedId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedId}.json`)
                .then(res => res.json()).then(data => setRegions(prev => ({ ...prev, districts: data })));
        }
    } else if (type === "kecamatan") {
        setSelectedRegionIds(prev => ({ ...prev, districtId: selectedId, villageId: "" }));
        setFormData(prev => ({ ...prev, kecamatan: selectedName, kelurahan: "" }));
        setRegions(prev => ({ ...prev, villages: [] }));
        if (selectedId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedId}.json`)
                .then(res => res.json()).then(data => setRegions(prev => ({ ...prev, villages: data })));
        }
    } else if (type === "kelurahan") {
        setSelectedRegionIds(prev => ({ ...prev, villageId: selectedId }));
        setFormData(prev => ({ ...prev, kelurahan: selectedName }));
    }
  };

  const handleProfileChange = (e) => {
    const val = e.target.value;
    setSelectedProfileId(val);
    setError("");
    if (val === "self") {
      setIsSelf(true);
      fillSelfData(localUserData, apiProfileData);
    } else if (val === "new") {
      setIsSelf(false);
      clearPatientData();
    } else {
      setIsSelf(false);
      const patientData = savedPatients[parseInt(val)];
      if (patientData) fillHistoryData(patientData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handlePoliChange = (e) => {
    const selectedPoliId = e.target.value;
    setFormData(prev => ({ ...prev, poli_id: selectedPoliId, dokter_id: "", tanggal_reservasi: "" }));
    setFieldErrors(prev => ({ ...prev, poli_id: "", dokter_id: "", tanggal_reservasi: "" }));
    setSelectedDoctorSchedule(null);
    setAvailableDaysText("");
    filterDoctorsByPoli(selectedPoliId);
  };

  const handleDokterChange = (e) => {
    const docId = e.target.value;
    setFormData(prev => ({ ...prev, dokter_id: docId, tanggal_reservasi: "" }));
    setFieldErrors(prev => ({ ...prev, dokter_id: "", tanggal_reservasi: "" }));
    if (docId) {
      const selectedSchedule = dokters.find(d => String(d.dokter_id) === String(docId));
      setSelectedDoctorSchedule(selectedSchedule || null);
      setAvailableDaysText(generateAvailableDaysText(selectedSchedule));
    } else {
      setSelectedDoctorSchedule(null);
      setAvailableDaysText("");
    }
  };

  const handleDateChange = (e) => {
    const dateVal = e.target.value;
    setFieldErrors(prev => ({ ...prev, tanggal_reservasi: "" }));
    if (!dateVal) { setFormData(prev => ({ ...prev, tanggal_reservasi: "" })); return; }
    if (!selectedDoctorSchedule) { setFieldErrors(prev => ({ ...prev, dokter_id: "Pilih dokter dulu" })); setFormData(prev => ({ ...prev, tanggal_reservasi: "" })); return; }
    
    const selectedDate = new Date(dateVal);
    const dayIndex = selectedDate.getDay();
    const activeDays = getDoctorActiveDays(selectedDoctorSchedule);
    if (!activeDays.includes(dayIndex)) {
      setFieldErrors(prev => ({ ...prev, tanggal_reservasi: `Dokter libur. Tersedia: ${availableDaysText}` }));
      setFormData(prev => ({ ...prev, tanggal_reservasi: "" }));
    } else {
      setFormData(prev => ({ ...prev, tanggal_reservasi: dateVal }));
    }
  };

  // --- LOGIKA STEP VALIDATION (DIPERBARUI) ---
  const validateStep1 = () => {
    const errors = {};
    const letterOnlyRegex = /^[a-zA-Z\s\.\,\']+$/;

    // VALIDASI KELUHAN (Keyword Check + Min 2 Words)
    if (!formData.keluhan) {
        errors.keluhan = "Keluhan utama wajib diisi.";
    } else {
        // 1. Cek jumlah kata
        const wordCount = formData.keluhan.trim().split(/\s+/).length;
        if (wordCount < 2) {
            errors.keluhan = "Keluhan minimal harus terdiri dari 2 kata.";
        } else {
            // 2. Cek keyword jika kata sudah cukup
            const lowerVal = formData.keluhan.toLowerCase();
            const hasKeyword = VALID_KEYWORDS.some(keyword => lowerVal.includes(keyword));
            if (!hasKeyword) {
                errors.keluhan = "Mohon jelaskan keluhan medis Anda lebih spesifik (contoh: demam, nyeri, pusing, dll).";
            }
        }
    }

    if (isSelf) {
      if (!apiProfileData?.noKTP) errors.nomor_ktp = "Profil: KTP belum lengkap.";
      if (!apiProfileData?.tanggal_lahir) errors.tanggal_lahir = "Profil: Tanggal Lahir belum lengkap.";
    } else {
      // Validasi Nama
      if (!formData.nama) {
          errors.nama = "Nama wajib diisi.";
      } else if (formData.nama.trim().length <= 1) {
          errors.nama = "Nama harus lebih dari 1 huruf.";
      } else if (!letterOnlyRegex.test(formData.nama)) {
          errors.nama = "Nama hanya boleh berisi huruf.";
      }

      // Validasi KTP
      if (!formData.nomor_ktp) errors.nomor_ktp = "Nomor KTP wajib diisi.";
      else if (!/^\d+$/.test(formData.nomor_ktp) || formData.nomor_ktp.length !== 16) errors.nomor_ktp = "KTP harus 16 digit angka.";
      
      // Validasi Email
      if (!formData.email) errors.email = "Email wajib diisi.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Format email salah.";

      // Validasi WhatsApp
      if (!formData.nomor_whatsapp) {
          errors.nomor_whatsapp = "WhatsApp wajib diisi.";
      } else if (!/^\d+$/.test(formData.nomor_whatsapp)) {
          errors.nomor_whatsapp = "Nomor HP hanya boleh angka.";
      } else if (formData.nomor_whatsapp.length < 10) {
          errors.nomor_whatsapp = "Nomor WhatsApp minimal 10 digit.";
      }

      // Validasi Tempat Lahir
      if (!formData.tempat_lahir) {
          errors.tempat_lahir = "Tempat lahir wajib diisi.";
      } else if (!letterOnlyRegex.test(formData.tempat_lahir)) {
          errors.tempat_lahir = "Tempat lahir hanya boleh huruf.";
      }

      if (!formData.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi.";
      if (!formData.alamat) errors.alamat = "Alamat wajib diisi.";
      
      // Validasi Suku
      if (formData.suku && !letterOnlyRegex.test(formData.suku)) {
          errors.suku = "Suku hanya boleh huruf.";
      }

      // Validasi Status Keluarga
      if (formData.status_keluarga && !letterOnlyRegex.test(formData.status_keluarga)) {
          errors.status_keluarga = "Status hubungan hanya boleh huruf.";
      }

      // Validasi Nama Keluarga
      if (formData.nama_keluarga && !letterOnlyRegex.test(formData.nama_keluarga)) {
          errors.nama_keluarga = "Nama keluarga hanya boleh huruf.";
      }

      // Validasi Wilayah
      if (!formData.provinsi) errors.provinsi = "Pilih provinsi.";
      if (!formData.kota_kabupaten) errors.kota_kabupaten = "Pilih kota.";
      if (!formData.kecamatan) errors.kecamatan = "Pilih kecamatan.";
      if (!formData.kelurahan) errors.kelurahan = "Pilih kelurahan.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.poli_id) errors.poli_id = "Silakan pilih Poli.";
    if (!formData.dokter_id) errors.dokter_id = "Silakan pilih Dokter.";
    if (!formData.tanggal_reservasi) errors.tanggal_reservasi = "Silakan pilih Tanggal.";
    
    if (formData.penjaminan === "asuransi") {
        if (!formData.nama_asuransi) errors.nama_asuransi = "Nama asuransi wajib diisi.";
        if (!formData.nomor_asuransi) errors.nomor_asuransi = "Nomor polis wajib diisi.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

const nextStep = async () => {
    setError("");

    // --- STEP 1: VALIDASI & CEK AI ---
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) return;

      setIsCheckingAI(true); // Aktifkan loading indicator
      
      try {
        // Persiapkan payload sesuai kebutuhan Backend getRecommendation
        const payloadAI = {
          keluhan: formData.keluhan,
          is_self: isSelf, // Mengambil state isSelf
          // Jika bukan diri sendiri, kirim data tambahan untuk akurasi prediksi
          ...(!isSelf && { 
            tanggal_lahir: formData.tanggal_lahir, 
            jenis_kelamin: formData.jenis_kelamin,
            riwayat_penyakit: "" // Opsional, bisa dikosongkan jika tidak ada input
          }),
        };

        // Panggil Endpoint Backend
        const res = await api.post("/reservations/check-poli", payloadAI);
        
        if (res.data && res.data.success) {
          // Simpan hasil rekomendasi dari Backend ke state
          setAiRecommendation(res.data.data);
        }
      } catch (err) {
        console.warn("Gagal mendapatkan rekomendasi AI:", err);
        // Jika gagal, user tetap bisa lanjut (hanya rekomendasi tidak muncul)
        setAiRecommendation(null);
      } finally {
        setIsCheckingAI(false); // Matikan loading
        setCurrentStep((prev) => prev + 1); // Pindah ke Step 2
      }
      return;
    }

    // --- STEP 2: VALIDASI POLI & JADWAL ---
    if (currentStep === 2) {
      const isValid = validateStep2();
      if (!isValid) return;
    }

    // --- LANJUT KE STEP BERIKUTNYA ---
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAiResult(null);

    const finalIsSelf = selectedProfileId === "self";
    const normalizePenjaminan = (val) => (val === "asuransi" ? "asuransi" : "cash");
    const normalizedPenjaminan = normalizePenjaminan(formData.penjaminan);

    const payload = {
      is_self: finalIsSelf ? 1 : 0,
      poli_id: formData.poli_id,
      tanggal_reservasi: formData.tanggal_reservasi,
      keluhan: formData.keluhan,
      dokter_id: formData.dokter_id,
      penanggung_jawab_id: null,
    };

    if (!finalIsSelf) {
      Object.assign(payload, {
        nama: formData.nama,
        email: formData.email,
        jenis_kelamin: formData.jenis_kelamin,
        tempat_lahir: formData.tempat_lahir,
        tanggal_lahir: formData.tanggal_lahir,
        nomor_ktp: formData.nomor_ktp,
        nomor_whatsapp: formData.nomor_whatsapp,
        alamat: formData.alamat,
        provinsi: formData.provinsi || null,
        "kota/kabupaten": formData.kota_kabupaten || null,
        kecamatan: formData.kecamatan || null,
        kelurahan: formData.kelurahan || null,
        status_perkawinan: formData.status_perkawinan || null,
        suku: formData.suku || null,
        agama: formData.agama || null,
        pendidikan_terakhir: formData.pendidikan_terakhir || null,
        nomor_pegawai: formData.nomor_pegawai || null,
        status_keluarga: formData.status_keluarga || "Lainnya",
        nama_keluarga: formData.nama_keluarga || null,
        penjaminan: normalizedPenjaminan,
        nama_asuransi: normalizedPenjaminan === "asuransi" ? formData.nama_asuransi || "BPJS" : null,
        nomor_asuransi: normalizedPenjaminan === "asuransi" ? formData.nomor_asuransi : null,
      });
    }

    try {
      const response = await api.post("/reservations", payload);
      if (response.data && response.data.ai_analysis) {
        setAiResult(response.data.ai_analysis);
      }
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Terjadi kesalahan.";
      if (err.response?.data?.errors) {
        const errorList = err.response.data.errors;
        const firstErrKey = Object.keys(errorList)[0];
        setError(`${firstErrKey}: ${errorList[firstErrKey][0]}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const Stepper = () => (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4 relative">
      <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10" />
      <div className="flex justify-between items-start w-full">
        {["Data & Keluhan", "Poli & Jadwal", "Konfirmasi"].map((label, index) => {
          const stepNum = index + 1;
          const active = stepNum === currentStep;
          const done = stepNum < currentStep;
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 bg-white ${
                  active
                    ? "border-[#8CC63F] text-[#003B73]"
                    : done
                    ? "bg-[#003B73] text-white border-[#003B73]"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                {done ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? "text-[#003B73]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#003B73]" size={40} />
      </div>
    );
  }

  // --- DAFTAR POLI HARDCODE (Sesuai Database Seeder) ---
const STATIC_POLIS = [
  { id: "POL-ANK", name: "Poli Anak" },
  { id: "POL-JTG", name: "Poli Jantung" },
  { id: "POL-DLM", name: "Poli Penyakit Dalam" },
  { id: "POL-GIG", name: "Poli Gigi & Mulut" },
  { id: "POL-ANS", name: "Poli Anastesi" },
  { id: "POL-NEU", name: "Poli Neurologi" },
  { id: "POL-THT", name: "Poli THT" },
  { id: "POL-BDH", name: "Poli Bedah Tulang" },
];

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center items-start py-8 md:py-12 px-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-3xl overflow-hidden border border-neutral-100">
        <div className="bg-[#003B73] px-6 py-5 flex items-center gap-4 text-white">
          <button
            type="button"
            onClick={() =>
              currentStep === 1
                ? router.back()
                : setCurrentStep((prev) => prev - 1)
            }
          >
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Buat Reservasi Baru</h1>
        </div>

        <div className="p-6 md:p-8">
          <Stepper />

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex gap-3 border border-red-200 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1: DATA PASIEN */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <label className="text-sm font-bold text-[#003B73] mb-3 flex items-center gap-2">
                    <User size={18} /> Reservasi Untuk Siapa?
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProfileId}
                      onChange={handleProfileChange}
                      className="w-full p-3 pl-10 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-700"
                    >
                      <option value="self">
                        Diri Sendiri ({localUserData?.name || "Saya"})
                      </option>
                      {savedPatients.length > 0 && (
                        <optgroup label="Riwayat Orang Lain">
                          {savedPatients.map((patient, idx) => (
                            <option key={idx} value={idx}>
                              {patient.nama} - {patient.nomor_ktp}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <option value="new">+ Input Orang Baru / Lainnya</option>
                    </select>
                    <Users
                      className="absolute left-3 top-3.5 text-blue-500"
                      size={18}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField
                    label="Nama Lengkap"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    disabled={isSelf}
                    required
                    error={fieldErrors.nama}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSelf}
                    required={!isSelf}
                    error={fieldErrors.email}
                  />
                  <InputField
                    label="Nomor KTP"
                    name="nomor_ktp"
                    value={formData.nomor_ktp}
                    onChange={handleChange}
                    disabled={isSelf}
                    required
                    maxLength={16}
                    error={fieldErrors.nomor_ktp}
                  />
                  <InputField
                    label="Nomor WhatsApp"
                    name="nomor_whatsapp"
                    value={formData.nomor_whatsapp}
                    onChange={handleChange}
                    disabled={isSelf}
                    required
                    error={fieldErrors.nomor_whatsapp}
                  />
                  <InputField
                    label="Tempat Lahir"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleChange}
                    disabled={isSelf}
                    required
                    error={fieldErrors.tempat_lahir}
                  />
                  <InputField
                    label="Tanggal Lahir"
                    name="tanggal_lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    disabled={isSelf}
                    required
                    error={fieldErrors.tanggal_lahir}
                  />
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                      disabled={isSelf}
                      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${
                        isSelf ? "bg-gray-100" : "bg-white border-gray-300"
                      }`}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {!isSelf && (
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4 space-y-4">
                    <h3 className="font-bold text-[#003B73] flex items-center gap-2 border-b pb-2 mb-2">
                      <MapPin size={18} /> Detail Alamat & Data Pribadi
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Alamat Lengkap
                        </label>
                        <textarea
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleChange}
                          rows={2}
                          className={`w-full p-3 border rounded-xl ${fieldErrors.alamat ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          placeholder="Nama jalan, RT/RW, No. Rumah"
                        />
                        {fieldErrors.alamat && <p className="text-red-500 text-xs mt-1">{fieldErrors.alamat}</p>}
                      </div>

                      {/* IMPLEMENTASI DEPENDENT DROPDOWN WILAYAH */}
                      <RegionSelect 
                        label="Provinsi"
                        name="provinsi"
                        placeholder="Pilih Provinsi"
                        value={selectedRegionIds.provinceId}
                        onChange={(e) => handleRegionChange("provinsi", e)}
                        options={regions.provinces}
                        error={fieldErrors.provinsi}
                      />

                      <RegionSelect 
                        label="Kota/Kabupaten"
                        name="kota_kabupaten"
                        placeholder="Pilih Kota/Kab"
                        value={selectedRegionIds.regencyId}
                        onChange={(e) => handleRegionChange("kota", e)}
                        options={regions.regencies}
                        disabled={!selectedRegionIds.provinceId}
                        error={fieldErrors.kota_kabupaten}
                      />

                      <RegionSelect 
                        label="Kecamatan"
                        name="kecamatan"
                        placeholder="Pilih Kecamatan"
                        value={selectedRegionIds.districtId}
                        onChange={(e) => handleRegionChange("kecamatan", e)}
                        options={regions.districts}
                        disabled={!selectedRegionIds.regencyId}
                        error={fieldErrors.kecamatan}
                      />

                      <RegionSelect 
                        label="Kelurahan"
                        name="kelurahan"
                        placeholder="Pilih Kelurahan"
                        value={selectedRegionIds.villageId}
                        onChange={(e) => handleRegionChange("kelurahan", e)}
                        options={regions.villages}
                        disabled={!selectedRegionIds.districtId}
                        error={fieldErrors.kelurahan}
                      />
                    </div>

                    <h3 className="font-bold text-[#003B73] flex items-center gap-2 border-b pb-2 pt-2 mb-2">
                      <Briefcase size={18} /> Data Sosial & Pekerjaan
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <SelectField
                        label="Agama"
                        name="agama"
                        value={formData.agama}
                        onChange={handleChange}
                        options={[
                          "Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu",
                        ]}
                      />
                      <SelectField
                        label="Status Perkawinan"
                        name="status_perkawinan"
                        value={formData.status_perkawinan}
                        onChange={handleChange}
                        options={[
                          "Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati",
                        ]}
                      />
                      <InputField
                        label="Suku"
                        name="suku"
                        value={formData.suku}
                        onChange={handleChange}
                        error={fieldErrors.suku}
                      />
                      <SelectField
                        label="Pendidikan Terakhir"
                        name="pendidikan_terakhir"
                        value={formData.pendidikan_terakhir}
                        onChange={handleChange}
                        options={[
                          "SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3", "Tidak Sekolah",
                        ]}
                      />
                      <InputField
                        label="Nomor Pegawai (Opsional)"
                        name="nomor_pegawai"
                        value={formData.nomor_pegawai}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField
                        label="Status Hubungan Keluarga"
                        name="status_keluarga"
                        placeholder="Contoh: Suami, Istri, Anak"
                        value={formData.status_keluarga}
                        onChange={handleChange}
                        error={fieldErrors.status_keluarga}
                      />
                      <InputField
                        label="Nama Keluarga Penanggung Jawab"
                        name="nama_keluarga"
                        value={formData.nama_keluarga}
                        onChange={handleChange}
                        error={fieldErrors.nama_keluarga}
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Keluhan Utama <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="keluhan"
                    value={formData.keluhan}
                    onChange={handleChange}
                    className={`w-full p-4 border rounded-xl focus:ring-2 outline-none ${fieldErrors.keluhan ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
                    rows={3}
                    required
                  />
                  {fieldErrors.keluhan && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.keluhan}</p>}
                </div>
              </div>
            )}

{/* STEP 2: PILIH POLI & JADWAL */}
{currentStep === 2 && (
  <div className="space-y-6 animate-fadeIn">
    
    {/* KOTAK SARAN POLI (DARI BE) */}
    {aiRecommendation && aiRecommendation.rekomendasi_list && aiRecommendation.rekomendasi_list.length > 0 && (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4 shadow-sm transition-all hover:shadow-md">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1 shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-[#003B73]">
              Rekomendasi AI
            </h4>
            {aiRecommendation.confidence && (
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">
                Akurasi: {Math.round(aiRecommendation.confidence * 100)}%
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mb-3">
            Berdasarkan keluhan:{" "}
            <span className="italic font-medium text-gray-900">
              "{formData.keluhan}"
            </span>
            , sistem menyarankan:
          </p>

          {/* LIST REKOMENDASI */}
          <div className="flex flex-wrap gap-2">
            {aiRecommendation.rekomendasi_list.map((rec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  // Otomatis set Poli saat diklik
                  const eventMock = { target: { value: rec.poli_id } };
                  handlePoliChange(eventMock);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                  String(formData.poli_id) === String(rec.poli_id)
                    ? "bg-[#003B73] text-white border-[#003B73] shadow-md"
                    : "bg-white text-[#003B73] border-blue-200 hover:bg-blue-100"
                }`}
              >
                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 rounded-full">
                  #{idx + 1}
                </span>
                {rec.poli_name}
                {String(formData.poli_id) === String(rec.poli_id) && <Check size={14} />}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            *Klik salah satu tombol di atas untuk memilih poli secara otomatis.
          </p>
        </div>
      </div>
    )}

    {/* ... (Sisa kode Dropdown Poli dan Dokter tetap sama) ... */}
    
    <div className="grid md:grid-cols-2 gap-5">
      {/* DROPDOWN PILIH POLI */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Pilih Poli Tujuan <span className="text-red-500">*</span>
        </label>
        <select
          name="poli_id"
          value={formData.poli_id}
          onChange={handlePoliChange}
          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white ${
            fieldErrors.poli_id
              ? "border-red-500 ring-1 ring-red-500 bg-red-50"
              : aiRecommendation?.rekomendasi_list?.some(r => String(r.poli_id) === String(formData.poli_id))
              ? "border-green-500 ring-1 ring-green-500"
              : "border-gray-300"
          }`}
        >
          <option value="">-- Pilih Poli --</option>
          {polis.map((p) => {
            // Cek apakah poli ini direkomendasikan AI
            const isRecommended = aiRecommendation?.rekomendasi_list?.some(
              (rec) => String(rec.poli_id) === String(p.poli_id)
            );

            return (
              <option
                key={p.poli_id}
                value={p.poli_id}
                className={isRecommended ? "font-bold text-green-700 bg-green-50" : ""}
              >
                {p.poli_name} {isRecommended ? "✅ (Disarankan)" : ""}
              </option>
            );
          })}
        </select>
        {fieldErrors.poli_id && (
          <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.poli_id}</p>
        )}
      </div>  

      {/* DROPDOWN PILIH DOKTER */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Pilih Dokter <span className="text-red-500">*</span>
        </label>
        <select
          name="dokter_id"
          value={formData.dokter_id}
          onChange={handleDokterChange}
          disabled={!formData.poli_id}
          className={`w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            fieldErrors.dokter_id ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        >
          <option value="">-- Pilih Dokter --</option>
          {dokters.map((d) => (
            <option key={d.dokter_id} value={d.dokter_id}>
              {d.dokter?.nama_dokter || "Tanpa Nama"}
            </option>
          ))}
        </select>
        {fieldErrors.dokter_id && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {fieldErrors.dokter_id}
          </p>
        )}

        {selectedDoctorSchedule && (
          <div className="mt-2 text-xs flex items-start gap-1.5 text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
            <Clock size={14} className="mt-0.5" />
            <span>
              <b>Jadwal Praktek:</b> {availableDaysText}
            </span>
          </div>
        )}
        
        {formData.poli_id && dokters.length === 0 && (
          <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            Tidak ada dokter aktif untuk poli ini.
          </p>
        )}
      </div>
    </div>

    {/* INPUT TANGGAL & PENJAMINAN (Tetap sama) */}
    <div className="grid md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Rencana Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="tanggal_reservasi"
          value={formData.tanggal_reservasi}
          onChange={handleDateChange}
          min={todayStr || undefined}
          disabled={!formData.dokter_id}
          className={`w-full p-3 border rounded-xl disabled:bg-gray-100 ${
            fieldErrors.tanggal_reservasi
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          required
        />
        {fieldErrors.tanggal_reservasi && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {fieldErrors.tanggal_reservasi}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Metode Penjaminan
        </label>
        <select
          name="penjaminan"
          value={formData.penjaminan}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-xl bg-white"
        >
          <option value="cash">Umum / Cash</option>
          <option value="asuransi">Asuransi Swasta</option>
        </select>
      </div>
    </div>

    {formData.penjaminan === "asuransi" && (
      <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <InputField
          label="Nama Asuransi"
          name="nama_asuransi"
          value={formData.nama_asuransi}
          onChange={handleChange}
          required
          error={fieldErrors.nama_asuransi}
        />
        <InputField
          label="Nomor Polis"
          name="nomor_asuransi"
          value={formData.nomor_asuransi}
          onChange={handleChange}
          required
          error={fieldErrors.nomor_asuransi}
        />
      </div>
    )}
  </div>
)}

            {/* STEP 3: KONFIRMASI */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-200">
                  <h3 className="font-bold text-[#003B73] border-b pb-2">
                    Ringkasan Reservasi
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Pasien:</span>
                    <span className="font-bold">{formData.nama}</span>

                    <span className="text-gray-500">Poli:</span>
                    <span className="font-bold">
                      {
                        polis.find(
                          (p) => String(p.poli_id) === String(formData.poli_id)
                        )?.poli_name
                      }
                    </span>

                    <span className="text-gray-500">Dokter:</span>
                    <span className="font-bold">
                      {
                        dokters.find(
                          (d) =>
                            String(d.dokter_id) === String(formData.dokter_id)
                        )?.dokter?.nama_dokter
                      }
                    </span>

                    <span className="text-gray-500">Tanggal:</span>
                    <span className="font-bold">
                      {formData.tanggal_reservasi}
                    </span>

                    <span className="text-gray-500">Bayar:</span>
                    <span className="uppercase font-bold text-[#8CC63F]">
                      {formData.penjaminan}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM ACTIONS */}
            <div className="mt-8 pt-6 border-t flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                >
                  Kembali
                </button>
              )}
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isCheckingAI}
                    className="bg-[#8CC63F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7ab332] transition flex items-center gap-2 shadow-lg shadow-green-100 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCheckingAI ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />{" "}
                        Menganalisa...
                      </>
                    ) : (
                      <>
                        Lanjut <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#003B73] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Kirim Reservasi"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center animate-fadeIn shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#003B73] mb-2">
              Reservasi Terkirim!
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Reservasi Anda telah berhasil diproses.
            </p>
            <button
              onClick={() => router.push("/user/dashboard")}
              className="w-full py-3 bg-[#003B73] text-white rounded-xl font-bold hover:bg-blue-900 transition"
            >
              Ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}