"use client";

import api from "@/services/api";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  User,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// --- DAFTAR KATA KUNCI KELUHAN (VALIDASI) ---
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
  "tangan", "bicara", "kontrol"
];

// --- Helper Components ---
function InputField({ label, name, value, onChange, type = "text", required, disabled, maxLength, placeholder, error }) {
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
  
  // --- STATE KONTROL & REKAM MEDIS ---
  const [isControl, setIsControl] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "", email: "", nomor_whatsapp: "", nomor_ktp: "",
    tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "Laki-laki",
    alamat: "", provinsi: "", kota_kabupaten: "", kecamatan: "", kelurahan: "",
    status_perkawinan: "", suku: "", agama: "", pendidikan_terakhir: "", nomor_pegawai: "",
    status_keluarga: "", nama_keluarga: "",
    keluhan: "", poli_id: "", dokter_id: "", tanggal_reservasi: "",
    penjaminan: "cash", nama_asuransi: "", nomor_asuransi: "",
  });

  // --- Helper untuk mengurutkan Poli berdasarkan AI ---
  const getSortedPolis = () => {
    // 1. Jika mode kontrol, kembalikan semua poli (karena dropdown disabled & auto-filled)
    if (isControl) return polis;

    // 2. Jika ada rekomendasi AI, urutkan poli sesuai urutan rekomendasi
    if (aiRecommendation?.rekomendasi_list?.length > 0) {
        // Mapping rekomendasi AI ke object poli asli
        const sorted = aiRecommendation.rekomendasi_list
            .map(rec => polis.find(p => String(p.poli_id) === String(rec.poli_id)))
            .filter(p => p !== undefined); // Hapus jika poli tidak ditemukan di master data

        return sorted;
    }

    // 3. Default: Kembalikan semua poli
    return polis;
  };
  
  // Hitung opsi poli yang akan ditampilkan
  const displayedPolis = getSortedPolis();

  // --- LOGIKA VALIDASI FIELD ---
  const validateField = (name, value) => {
    let errorMsg = "";
    const letterOnlyRegex = /^[a-zA-Z\s\.\,\']+$/;
    
    switch (name) {
      case "keluhan":
        if (isControl && value) return "";
        if (!value) {
            errorMsg = "Keluhan utama wajib diisi.";
        } else {
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 2) {
                errorMsg = "Keluhan minimal harus terdiri dari 2 kata.";
            } else if (!isControl) {
                const lowerVal = value.toLowerCase();
                const hasKeyword = VALID_KEYWORDS.some(keyword => lowerVal.includes(keyword));
                if (!hasKeyword) {
                    errorMsg = "Mohon jelaskan keluhan medis Anda lebih spesifik.";
                }
            }
        }
        break;
      case "nama":
        if (value && (!letterOnlyRegex.test(value) || value.trim().length <= 1)) errorMsg = "Nama tidak valid.";
        else if (!value) errorMsg = "Nama wajib diisi.";
        break;
      case "nomor_whatsapp":
        if (value && (!/^\d+$/.test(value) || value.length < 10)) errorMsg = "Nomor WhatsApp minimal 10 digit.";
        else if (!value) errorMsg = "Nomor WhatsApp wajib diisi.";
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Format email tidak valid.";
        break;
      case "nomor_ktp":
        if (value && (!/^\d+$/.test(value) || value.length !== 16)) errorMsg = "Nomor KTP harus 16 digit angka.";
        break;
      case "alamat":
      case "provinsi":
      case "kota_kabupaten":
      case "kecamatan":
      case "kelurahan":
        if (!value) errorMsg = "Wajib diisi.";
        break;
      default: break;
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

  // --- FUNGSI UTILS ---
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

  const getLocalTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filterMedicalRecords = useCallback((allRecords, isSelf, currentData, savedPatients, profileId) => {
    if (!allRecords || allRecords.length === 0) return [];
    if (isSelf) {
        const myKTP = currentData?.noKTP || currentData?.nomor_ktp;
        if (!myKTP) return [];
        return allRecords.filter(rm => String(rm.reservasi?.nomor_ktp).trim() === String(myKTP).trim());
    } else {
        if (profileId !== 'new' && savedPatients[profileId]) {
            const patientData = savedPatients[profileId];
            const patientKTP = patientData.nomor_ktp;
            if (patientKTP) return allRecords.filter(rm => String(rm.reservasi?.nomor_ktp).trim() === String(patientKTP).trim());
        }
    }
    return [];
  }, []);

  // --- FETCH DATA AWAL ---
  useEffect(() => {
    setTodayStr(getLocalTodayString());
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

        let records = [];
        try {
            const rmRes = await api.get("/rekam-medis");
            records = rmRes.data?.data ?? rmRes.data ?? [];
            setMedicalRecords(records);
            if (currentProfile) {
                const initialFiltered = filterMedicalRecords(records, true, currentProfile, [], "self");
                setFilteredRecords(initialFiltered);
            }
        } catch (rmErr) {}

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
  }, [fillSelfData, filterMedicalRecords]);

  const filterDoctorsByPoli = (poliId) => {
    if (!poliId) { setDokters([]); return; }
    const filteredSchedules = allSchedules.filter(s => String(s.poli_id) === String(poliId));
    setDokters(filteredSchedules);
  };

  const handleRegionChange = (type, e) => {
    const selectedId = e.target.value;
    const index = e.target.selectedIndex;
    const selectedName = index > 0 ? e.target.options[index].text : ""; 
    
    let fieldName = type;
    if (type === 'kota') fieldName = 'kota_kabupaten';

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
    setIsControl(false);
    setSelectedRecordId(null);
    setFormData(prev => ({ ...prev, keluhan: "", poli_id: "", dokter_id: "" })); 
    setDokters([]); 

    let isSelfProfile = false;
    let dataForFilter = null;

    if (val === "self") {
        isSelfProfile = true;
        setIsSelf(true);
        fillSelfData(localUserData, apiProfileData);
        dataForFilter = apiProfileData;
    } else if (val === "new") {
        isSelfProfile = false;
        setIsSelf(false);
        clearPatientData();
        dataForFilter = null;
    } else {
        isSelfProfile = false;
        setIsSelf(false);
        const patientData = savedPatients[parseInt(val)];
        if (patientData) fillHistoryData(patientData);
        dataForFilter = null;
    }
    const filtered = filterMedicalRecords(medicalRecords, isSelfProfile, dataForFilter, savedPatients, val);
    setFilteredRecords(filtered);
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
    if (dateVal < todayStr) {
        setFieldErrors(prev => ({ ...prev, tanggal_reservasi: "Tanggal sudah lewat." }));
        setFormData(prev => ({ ...prev, tanggal_reservasi: "" }));
        return;
    }
    if (!selectedDoctorSchedule) { setFieldErrors(prev => ({ ...prev, dokter_id: "Pilih dokter dulu" })); return; }
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

  const handleSelectRecord = (record) => {
    if (selectedRecordId === record.rekam_medis_id) {
        setSelectedRecordId(null);
        setFormData(prev => ({ ...prev, keluhan: "KONTROL RUTIN", poli_id: "", dokter_id: "" }));
        setDokters([]); 
    } else {
        setSelectedRecordId(record.rekam_medis_id);
        const formattedDate = new Date(record.tanggal_diperiksa).toLocaleDateString("id-ID");
        const diagnosis = record.diagnosis || "Umum";
        const autoText = `KONTROL RUTIN - ${diagnosis} (Tgl: ${formattedDate})`;
        const prevPoliId = record.reservasi?.poli_id;

        setFormData(prev => ({ 
            ...prev, 
            keluhan: autoText,
            poli_id: prevPoliId || "" 
        }));
        setFieldErrors(prev => ({ ...prev, keluhan: "", poli_id: "" })); 
        if (prevPoliId) {
            filterDoctorsByPoli(prevPoliId);
        }
    }
  };

  const toggleControl = (e) => {
    const isChecked = e.target.checked;
    setIsControl(isChecked);
    if (isChecked) {
        setFormData(prev => ({ ...prev, keluhan: "KONTROL RUTIN" }));
    } else {
        setFormData(prev => ({ ...prev, keluhan: "", poli_id: "", dokter_id: "" }));
        setSelectedRecordId(null);
        setDokters([]);
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.keluhan) errors.keluhan = "Keluhan wajib diisi.";
    if (isSelf) {
      if (!apiProfileData?.noKTP) errors.nomor_ktp = "Profil: KTP belum lengkap.";
      if (!apiProfileData?.tanggal_lahir) errors.tanggal_lahir = "Profil: Tanggal Lahir belum lengkap.";
    } else {
      if (!formData.nama) errors.nama = "Nama wajib diisi.";
      if (!formData.nomor_ktp) errors.nomor_ktp = "Nomor KTP wajib diisi.";
      if (!formData.email) errors.email = "Email wajib diisi.";
      if (!formData.nomor_whatsapp) errors.nomor_whatsapp = "WhatsApp wajib diisi.";
      if (!formData.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi.";
      if (!formData.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi.";
      if (!formData.alamat) errors.alamat = "Alamat wajib diisi.";
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
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) return;

      if (isControl) {
         setCurrentStep((prev) => prev + 1);
         setAiRecommendation(null); 
         return;
      }

      setIsCheckingAI(true);
      try {
        const payloadAI = {
          keluhan: formData.keluhan,
          is_self: isSelf,
          ...(!isSelf && { 
            tanggal_lahir: formData.tanggal_lahir, 
            jenis_kelamin: formData.jenis_kelamin 
          }),
        };
        const res = await api.post("/reservations/check-poli", payloadAI);
        if (res.data && res.data.success) {
          setAiRecommendation(res.data.data);
        }
      } catch (err) {
        setAiRecommendation(null);
      } finally {
        setIsCheckingAI(false);
        setCurrentStep((prev) => prev + 1);
      }
      return;
    }
    if (currentStep === 2) {
      if (!validateStep2()) return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalIsSelf = selectedProfileId === "self";
    
    let payloadKeluhan = formData.keluhan;
    const POLI_KEYWORDS_MAP = {
        "POL-ANK": "demam panas tinggi kejang pada anak",
        "POL-JTG": "nyeri dada jantung berdebar",
        "POL-DLM": "nyeri perut mual muntah diabetes",
        "POL-GIG": "sakit gigi berlubang",
        "POL-NEU": "pusing vertigo kejang",
    };
    if (isControl && formData.poli_id) {
        const triggerKeywords = POLI_KEYWORDS_MAP[formData.poli_id] || "";
        const selectedPoliName = polis.find(p => String(p.poli_id) === String(formData.poli_id))?.poli_name || "";
        payloadKeluhan = `KONTROL RUTIN ${selectedPoliName}. Keluhan: ${triggerKeywords}`;
    }

    const payload = {
      is_self: finalIsSelf ? 1 : 0,
      poli_id: formData.poli_id,
      tanggal_reservasi: formData.tanggal_reservasi,
      keluhan: payloadKeluhan,
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
        penjaminan: formData.penjaminan,
        nama_asuransi: formData.penjaminan === "asuransi" ? formData.nama_asuransi || "BPJS" : null,
        nomor_asuransi: formData.penjaminan === "asuransi" ? formData.nomor_asuransi : null,
      });
    }

    try {
      const response = await api.post("/reservations", payload);
      setShowSuccessModal(true);
    } catch (err) {
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
                  active ? "border-[#8CC63F] text-[#003B73]" : done ? "bg-[#003B73] text-white border-[#003B73]" : "border-gray-200 text-gray-400"
                }`}
              >
                {done ? <Check size={16} /> : stepNum}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? "text-[#003B73]" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#003B73]" size={40} /></div>;

  const STATIC_POLIS = [
    { id: "POL-ANK", name: "Poli Anak" }, { id: "POL-JTG", name: "Poli Jantung" }, { id: "POL-DLM", name: "Poli Penyakit Dalam" },
    { id: "POL-GIG", name: "Poli Gigi & Mulut" }, { id: "POL-ANS", name: "Poli Anastesi" }, { id: "POL-NEU", name: "Poli Neurologi" },
    { id: "POL-THT", name: "Poli THT" }, { id: "POL-BDH", name: "Poli Bedah Tulang" }, { id: "POL-UMM", name: "Poli Umum"},
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center items-start py-8 md:py-12 px-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-3xl overflow-hidden border border-neutral-100">
        <div className="bg-[#003B73] px-6 py-5 flex items-center gap-4 text-white">
          <button type="button" onClick={() => currentStep === 1 ? router.back() : setCurrentStep((prev) => prev - 1)}>
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Buat Reservasi Baru</h1>
        </div>

        <div className="p-6 md:p-8">
          <Stepper />
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex gap-3 border border-red-200 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* --- STEP 1: DATA PASIEN --- */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <label className="text-sm font-bold text-[#003B73] mb-3 flex items-center gap-2"><User size={18} /> Reservasi Untuk Siapa?</label>
                  <div className="relative">
                    <select value={selectedProfileId} onChange={handleProfileChange} className="w-full p-3 pl-10 border border-blue-200 rounded-xl bg-white outline-none">
                      <option value="self">Diri Sendiri ({localUserData?.name || "Saya"})</option>
                      {savedPatients.length > 0 && (
                        <optgroup label="Riwayat Orang Lain">
                          {savedPatients.map((patient, idx) => (<option key={idx} value={idx}>{patient.nama} - {patient.nomor_ktp}</option>))}
                        </optgroup>
                      )}
                      <option value="new">+ Input Orang Baru / Lainnya</option>
                    </select>
                    <Users className="absolute left-3 top-3.5 text-blue-500" size={18} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleChange} disabled={isSelf} required error={fieldErrors.nama} />
                  <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isSelf} required={!isSelf} error={fieldErrors.email} />
                  <InputField label="Nomor KTP" name="nomor_ktp" value={formData.nomor_ktp} onChange={handleChange} disabled={isSelf} required maxLength={16} error={fieldErrors.nomor_ktp} />
                  <InputField label="Nomor WhatsApp" name="nomor_whatsapp" value={formData.nomor_whatsapp} onChange={handleChange} disabled={isSelf} required error={fieldErrors.nomor_whatsapp} />
                  <InputField label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isSelf} required error={fieldErrors.tempat_lahir} />
                  <InputField label="Tanggal Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleChange} disabled={isSelf} required error={fieldErrors.tanggal_lahir} />
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                    <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} disabled={isSelf} className={`w-full p-3 border rounded-xl outline-none ${isSelf ? "bg-gray-100" : "bg-white"}`}>
                      <option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {!isSelf && (
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4 space-y-4">
                    <h3 className="font-bold text-[#003B73] flex items-center gap-2 border-b pb-2 mb-2"><MapPin size={18} /> Detail Alamat & Data Pribadi</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                        <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={2} className={`w-full p-3 border rounded-xl ${fieldErrors.alamat ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nama jalan, RT/RW..." />
                      </div>
                      <RegionSelect label="Provinsi" name="provinsi" placeholder="Pilih Provinsi" value={selectedRegionIds.provinceId} onChange={(e) => handleRegionChange("provinsi", e)} options={regions.provinces} error={fieldErrors.provinsi} />
                      <RegionSelect label="Kota/Kabupaten" name="kota_kabupaten" placeholder="Pilih Kota" value={selectedRegionIds.regencyId} onChange={(e) => handleRegionChange("kota", e)} options={regions.regencies} disabled={!selectedRegionIds.provinceId} error={fieldErrors.kota_kabupaten} />
                      <RegionSelect label="Kecamatan" name="kecamatan" placeholder="Pilih Kecamatan" value={selectedRegionIds.districtId} onChange={(e) => handleRegionChange("kecamatan", e)} options={regions.districts} disabled={!selectedRegionIds.regencyId} error={fieldErrors.kecamatan} />
                      <RegionSelect label="Kelurahan" name="kelurahan" placeholder="Pilih Kelurahan" value={selectedRegionIds.villageId} onChange={(e) => handleRegionChange("kelurahan", e)} options={regions.villages} disabled={!selectedRegionIds.districtId} error={fieldErrors.kelurahan} />
                    </div>
                    {/* Data Sosial Tambahan */}
                    <h3 className="font-bold text-[#003B73] flex items-center gap-2 border-b pb-2 pt-2 mb-2"><Briefcase size={18} /> Data Sosial</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <SelectField label="Agama" name="agama" value={formData.agama} onChange={handleChange} options={["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"]} />
                        <SelectField label="Status Perkawinan" name="status_perkawinan" value={formData.status_perkawinan} onChange={handleChange} options={["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"]} />
                        <InputField label="Suku" name="suku" value={formData.suku} onChange={handleChange} />
                        <SelectField label="Pendidikan Terakhir" name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} options={["SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3"]} />
                        <InputField label="Status Keluarga" name="status_keluarga" value={formData.status_keluarga} onChange={handleChange} placeholder="Hubungan dengan pasien" />
                        <InputField label="Nama Keluarga Penanggung Jawab" name="nama_keluarga" value={formData.nama_keluarga} onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3 bg-green-50 p-3 rounded-lg border border-green-200">
                        <input type="checkbox" id="check-kontrol" checked={isControl} onChange={toggleControl} className="w-5 h-5 text-green-600 rounded" />
                        <label htmlFor="check-kontrol" className="text-sm font-bold text-green-800 cursor-pointer select-none flex items-center gap-1"><Activity size={16} /> kunjungan kontrol</label>
                    </div>
                    {isControl && (
                        <div className="mb-4 animate-fadeIn">
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Pilih Riwayat Kunjungan Terakhir:</h4>
                             {filteredRecords.length > 0 ? (
                                <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
                                    {filteredRecords.map((rm) => {
                                        const poliName = polis.find(p => String(p.poli_id) === String(rm.reservasi?.poli_id))?.poli_name || STATIC_POLIS.find(p => String(p.id) === String(rm.reservasi?.poli_id))?.name || "Poli Tidak Diketahui";
                                        return (
                                            <div key={rm.rekam_medis_id} onClick={() => handleSelectRecord(rm)} className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedRecordId === rm.rekam_medis_id ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200"}`}>
                                                <div className={`mt-0.5 p-1.5 rounded-full ${selectedRecordId === rm.rekam_medis_id ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-500"}`}><FileText size={16} /></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase">{poliName}</span><span className="text-[10px] text-gray-400">{rm.no_medrec}</span></div>
                                                    <p className="font-bold text-sm text-gray-800 line-clamp-1">{rm.diagnosis || "Diagnosis Umum"}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1"><span className="flex items-center gap-1"><Calendar size={12} /> {new Date(rm.tanggal_diperiksa).toLocaleDateString("id-ID")}</span></div>
                                                </div>
                                                {selectedRecordId === rm.rekam_medis_id && <CheckCircle size={20} className="text-blue-500 ml-auto self-center shrink-0" />}
                                            </div>
                                        );
                                    })}
                                </div>
                             ) : <div className="text-center p-4 border border-dashed rounded-lg text-gray-500 text-sm">Tidak ada riwayat rekam medis ditemukan.</div>}
                        </div>
                    )}
                    <label className="block text-sm font-bold text-gray-700 mb-2">Keluhan Utama <span className="text-red-500">*</span></label>
                    <textarea name="keluhan" value={formData.keluhan} onChange={handleChange} readOnly={isControl} className={`w-full p-4 border rounded-xl focus:ring-2 outline-none ${fieldErrors.keluhan ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${isControl ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} rows={3} placeholder="Jelaskan keluhan Anda..." required />
                    {fieldErrors.keluhan && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.keluhan}</p>}
                </div>
              </div>
            )}

            {/* --- STEP 2: POLI & JADWAL --- */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                {!isControl && aiRecommendation?.rekomendasi_list?.length > 0 && (
                   <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
                       <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1 shrink-0"><Sparkles size={24} /></div>
                       <div className="w-full">
                           <h4 className="font-bold text-[#003B73] mb-1">Rekomendasi AI</h4>
                           <p className="text-sm text-gray-700 mb-3">Sistem menyarankan poli berikut berdasarkan keluhan Anda:</p>
                           <div className="flex flex-wrap gap-2">
                               {aiRecommendation.rekomendasi_list.map((rec, idx) => (
                                   <button key={idx} type="button" onClick={() => handlePoliChange({target: {value: rec.poli_id}})} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${String(formData.poli_id) === String(rec.poli_id) ? "bg-[#003B73] text-white" : "bg-white text-[#003B73]"}`}>
                                       #{idx+1} {rec.poli_name} {String(formData.poli_id) === String(rec.poli_id) && <Check size={14} />}
                                   </button>
                               ))}
                           </div>
                       </div>
                   </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Poli Tujuan <span className="text-red-500">*</span></label>
                        <select 
                            name="poli_id" 
                            value={formData.poli_id} 
                            onChange={handlePoliChange} 
                            disabled={isControl} // Disabled jika mode kontrol aktif
                            className={`w-full p-3 border rounded-xl bg-white ${isControl ? 'bg-gray-100 cursor-not-allowed' : ''} ${fieldErrors.poli_id ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">-- Pilih Poli --</option>
                            {/* OPSI POLI (Diurutkan sesuai rekomendasi AI & Tanpa Checkmark) */}
                            {displayedPolis.map((p) => (
                                <option key={p.poli_id} value={p.poli_id}>
                                    {p.poli_name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.poli_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.poli_id}</p>}
                        {isControl && <p className="text-xs text-blue-600 mt-1">*Poli otomatis terpilih berdasarkan rekam medis.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Dokter <span className="text-red-500">*</span></label>
                        <select name="dokter_id" value={formData.dokter_id} onChange={handleDokterChange} disabled={!formData.poli_id} className="w-full p-3 border rounded-xl bg-white border-gray-300 disabled:bg-gray-100">
                            <option value="">-- Pilih Dokter --</option>
                            {dokters.map((d) => (<option key={d.dokter_id} value={d.dokter_id}>{d.dokter?.nama_dokter || "Tanpa Nama"}</option>))}
                        </select>
                        {selectedDoctorSchedule && <div className="mt-2 text-xs flex items-start gap-1.5 text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100"><Clock size={14} className="mt-0.5" /><span><b>Jadwal:</b> {availableDaysText}</span></div>}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Rencana Tanggal <span className="text-red-500">*</span></label>
                        <input type="date" name="tanggal_reservasi" value={formData.tanggal_reservasi} onChange={handleDateChange} min={todayStr} disabled={!formData.dokter_id} className="w-full p-3 border rounded-xl disabled:bg-gray-100 border-gray-300" required />
                        {fieldErrors.tanggal_reservasi && <p className="text-red-500 text-xs mt-1">{fieldErrors.tanggal_reservasi}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Metode Penjaminan</label>
                        <select name="penjaminan" value={formData.penjaminan} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl bg-white">
                            <option value="cash">Umum / Cash</option><option value="asuransi">Asuransi Swasta</option>
                        </select>
                    </div>
                </div>

                {formData.penjaminan === "asuransi" && (
                    <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <InputField label="Nama Asuransi" name="nama_asuransi" value={formData.nama_asuransi} onChange={handleChange} required error={fieldErrors.nama_asuransi} />
                        <InputField label="Nomor Polis" name="nomor_asuransi" value={formData.nomor_asuransi} onChange={handleChange} required error={fieldErrors.nomor_asuransi} />
                    </div>
                )}
              </div>
            )}

            {/* --- STEP 3: KONFIRMASI --- */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gray-50 p-6 rounded-xl space-y-3 border border-gray-200">
                  <h3 className="font-bold text-[#003B73] border-b pb-2">Ringkasan Reservasi</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Pasien:</span><span className="font-bold">{formData.nama}</span>
                    <span className="text-gray-500">Poli:</span><span className="font-bold">{polis.find((p) => String(p.poli_id) === String(formData.poli_id))?.poli_name}</span>
                    <span className="text-gray-500">Dokter:</span><span className="font-bold">{dokters.find((d) => String(d.dokter_id) === String(formData.dokter_id))?.dokter?.nama_dokter}</span>
                    <span className="text-gray-500">Tanggal:</span><span className="font-bold">{formData.tanggal_reservasi}</span>
                    <span className="text-gray-500">Bayar:</span><span className="uppercase font-bold text-[#8CC63F]">{formData.penjaminan}</span>
                    <span className="text-gray-500">Ket:</span><span className="font-medium text-gray-800 italic">"{formData.keluhan}"</span>
                    {!isSelf && (
                        <>
                        <span className="text-gray-500">Alamat:</span>
                        <span className="font-bold col-span-2 md:col-span-1">{formData.alamat}, {formData.kelurahan}, {formData.kecamatan}, {formData.kota_kabupaten}, {formData.provinsi}</span>
                        </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t flex justify-between">
              {currentStep > 1 && <button type="button" onClick={() => setCurrentStep((prev) => prev - 1)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Kembali</button>}
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <button type="button" onClick={nextStep} disabled={isCheckingAI} className="bg-[#8CC63F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7ab332] transition flex items-center gap-2 shadow-lg shadow-green-100 disabled:opacity-70">
                    {isCheckingAI ? <><Loader2 className="animate-spin" size={18} /> Menganalisa...</> : <>Lanjut <ArrowRight size={18} /></>}
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="bg-[#003B73] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-70">
                    {loading ? <Loader2 className="animate-spin" /> : "Kirim Reservasi"}
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
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><CheckCircle size={32} /></div>
            <h3 className="text-xl font-bold text-[#003B73] mb-2">Reservasi Terkirim!</h3>
            <p className="text-gray-500 text-sm mb-4">Reservasi Anda telah berhasil diproses.</p>
            <button onClick={() => router.push("/user/dashboard")} className="w-full py-3 bg-[#003B73] text-white rounded-xl font-bold hover:bg-blue-900 transition">Ke Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}