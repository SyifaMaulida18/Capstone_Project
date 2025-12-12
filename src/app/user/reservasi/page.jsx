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
  error, // Props error baru
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
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

// --- Helper Select dengan Validasi Error ---
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  disabled,
  error, // Props error baru
}) {
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

export default function ReservasiPage() {
  const router = useRouter();

  // --- STATE UMUM ---
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [error, setError] = useState(""); // Error global (API)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  // State Validasi Form (Per Field)
  const [fieldErrors, setFieldErrors] = useState({});

  // Hasil AI
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  // Data master
  const [allSchedules, setAllSchedules] = useState([]);
  const [polis, setPolis] = useState([]);
  const [dokters, setDokters] = useState([]);

  // Jadwal dokter
  const [selectedDoctorSchedule, setSelectedDoctorSchedule] = useState(null);
  const [availableDaysText, setAvailableDaysText] = useState("");

  // Data user & Pasien
  const [isSelf, setIsSelf] = useState(true);
  const [localUserData, setLocalUserData] = useState(null);
  const [apiProfileData, setApiProfileData] = useState(null);

  // State Dropdown Profil
  const [selectedProfileId, setSelectedProfileId] = useState("self");
  const [savedPatients, setSavedPatients] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    nama: "", email: "", nomor_whatsapp: "", nomor_ktp: "",
    tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "Laki-laki",
    alamat: "", provinsi: "", kota_kabupaten: "", kecamatan: "", kelurahan: "",
    status_perkawinan: "", suku: "", agama: "", pendidikan_terakhir: "", nomor_pegawai: "",
    status_keluarga: "", nama_keluarga: "",
    keluhan: "", poli_id: "", dokter_id: "", tanggal_reservasi: "",
    penjaminan: "cash", nama_asuransi: "", nomor_asuransi: "",
  });

  // --- LOGIKA VALIDASI REAL-TIME ---
  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMsg = "Format email tidak valid.";
        }
        break;
      case "nomor_ktp":
        if (value && (!/^\d+$/.test(value) || value.length !== 16)) {
          errorMsg = "Nomor KTP harus 16 digit angka.";
        }
        break;
      case "nomor_whatsapp":
        if (value && !/^\d+$/.test(value)) {
          errorMsg = "Nomor HP hanya boleh angka.";
        }
        break;
      case "nama":
      case "tempat_lahir":
      case "tanggal_lahir":
      case "alamat":
      case "keluhan":
        if (!value) errorMsg = "Field ini wajib diisi.";
        break;
      default:
        break;
    }
    return errorMsg;
  };

  // --- UTIL: HARI PRAKTEK ---
  const isPraktekActive = (val) =>
    val == 1 || val === "1" || val === "Y" || val === "y" || val === true;

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

  // --- PREFILL DATA ---
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
    // Reset error saat autofill
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

  // --- FETCH DATA AWAL ---
  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);

    const fetchData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const jadwalRes = await api.get("/jadwal-dokter");
        const rawSchedules = jadwalRes.data?.data ?? jadwalRes.data ?? [];
        setAllSchedules(rawSchedules);

        const uniquePolisMap = new Map();
        rawSchedules.forEach((item) => {
          if (item.poli && item.poli.poli_id) {
            if (!uniquePolisMap.has(item.poli.poli_id)) {
              uniquePolisMap.set(item.poli.poli_id, item.poli);
            }
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
            if (res.nomor_ktp && res.is_self !== 1 && res.is_self !== "1" && res.is_self !== true) {
              if (!seenKTP.has(res.nomor_ktp)) {
                seenKTP.add(res.nomor_ktp);
                uniquePatients.push(res);
              }
            }
          });
          setSavedPatients(uniquePatients);
        } catch (histErr) {
          console.warn("History fetch warning:", histErr);
        }
      } catch (err) {
        setError("Gagal memuat data jadwal dokter.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [fillSelfData]);

  const filterDoctorsByPoli = (poliId) => {
    if (!poliId) {
      setDokters([]);
      return;
    }
    const filteredSchedules = allSchedules.filter(
      (schedule) => String(schedule.poli_id) === String(poliId)
    );
    setDokters(filteredSchedules);
  };

  // --- HANDLERS DENGAN VALIDASI ---
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
      if (patientData) {
        fillHistoryData(patientData);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validasi langsung saat mengetik
    const errorMsg = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  const handlePoliChange = (e) => {
    const selectedPoliId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      poli_id: selectedPoliId,
      dokter_id: "",
      tanggal_reservasi: "",
    }));
    setFieldErrors((prev) => ({ ...prev, poli_id: "", dokter_id: "", tanggal_reservasi: "" }));
    setSelectedDoctorSchedule(null);
    setAvailableDaysText("");
    filterDoctorsByPoli(selectedPoliId);
  };

  const handleDokterChange = (e) => {
    const docId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      dokter_id: docId,
      tanggal_reservasi: "",
    }));
    setFieldErrors((prev) => ({ ...prev, dokter_id: "", tanggal_reservasi: "" }));

    if (docId) {
      const selectedSchedule = dokters.find(
        (d) => String(d.dokter_id) === String(docId)
      );
      setSelectedDoctorSchedule(selectedSchedule || null);
      setAvailableDaysText(generateAvailableDaysText(selectedSchedule));
    } else {
      setSelectedDoctorSchedule(null);
      setAvailableDaysText("");
    }
  };

  const handleDateChange = (e) => {
    const dateVal = e.target.value;
    setFieldErrors((prev) => ({ ...prev, tanggal_reservasi: "" }));

    if (!dateVal) {
      setFormData((prev) => ({ ...prev, tanggal_reservasi: "" }));
      return;
    }

    if (!selectedDoctorSchedule) {
      setFieldErrors((prev) => ({ ...prev, dokter_id: "Pilih dokter dulu" }));
      setFormData((prev) => ({ ...prev, tanggal_reservasi: "" }));
      return;
    }

    const selectedDate = new Date(dateVal);
    const dayIndex = selectedDate.getDay();
    const activeDays = getDoctorActiveDays(selectedDoctorSchedule);

    if (!activeDays.includes(dayIndex)) {
      setFieldErrors((prev) => ({
        ...prev,
        tanggal_reservasi: `Dokter libur. Tersedia: ${availableDaysText}`,
      }));
      setFormData((prev) => ({ ...prev, tanggal_reservasi: "" }));
    } else {
      setFormData((prev) => ({ ...prev, tanggal_reservasi: dateVal }));
    }
  };

  // --- LOGIKA STEP VALIDATION SEBELUM LANJUT ---
  const validateStep1 = () => {
    const errors = {};
    if (!formData.keluhan) errors.keluhan = "Keluhan utama wajib diisi.";

    if (isSelf) {
      if (!apiProfileData?.noKTP) errors.nomor_ktp = "Profil: KTP belum lengkap.";
      if (!apiProfileData?.tanggal_lahir) errors.tanggal_lahir = "Profil: Tanggal Lahir belum lengkap.";
    } else {
      if (!formData.nama) errors.nama = "Nama wajib diisi.";
      if (!formData.nomor_ktp) errors.nomor_ktp = "Nomor KTP wajib diisi.";
      else if (formData.nomor_ktp.length !== 16) errors.nomor_ktp = "KTP harus 16 digit.";
      
      if (!formData.email) errors.email = "Email wajib diisi.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Format email salah.";

      if (!formData.nomor_whatsapp) errors.nomor_whatsapp = "WhatsApp wajib diisi.";
      if (!formData.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi.";
      if (!formData.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi.";
      if (!formData.alamat) errors.alamat = "Alamat wajib diisi.";
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
      if (!isValid) return; // Stop jika ada error

      setIsCheckingAI(true);
      try {
        const payloadAI = {
          keluhan: formData.keluhan,
          is_self: isSelf,
          ...(!isSelf && {
            tanggal_lahir: formData.tanggal_lahir,
            jenis_kelamin: formData.jenis_kelamin,
          }),
        };
        const res = await api.post("/reservations/check-poli", payloadAI);
        if (res.data && res.data.success) {
          setAiRecommendation(res.data.data);
        }
      } catch (err) {
        console.warn("Gagal cek AI:", err);
      } finally {
        setIsCheckingAI(false);
        setCurrentStep((prev) => prev + 1);
      }
      return;
    }

    if (currentStep === 2) {
      const isValid = validateStep2();
      if (!isValid) return; // Stop jika ada error
    }

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
                      <InputField
                        label="Provinsi"
                        name="provinsi"
                        value={formData.provinsi}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Kota/Kabupaten"
                        name="kota_kabupaten"
                        value={formData.kota_kabupaten}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Kecamatan"
                        name="kecamatan"
                        value={formData.kecamatan}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Kelurahan"
                        name="kelurahan"
                        value={formData.kelurahan}
                        onChange={handleChange}
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
                          "Islam",
                          "Kristen",
                          "Katolik",
                          "Hindu",
                          "Buddha",
                          "Konghucu",
                        ]}
                      />
                      <SelectField
                        label="Status Perkawinan"
                        name="status_perkawinan"
                        value={formData.status_perkawinan}
                        onChange={handleChange}
                        options={[
                          "Belum Kawin",
                          "Kawin",
                          "Cerai Hidup",
                          "Cerai Mati",
                        ]}
                      />
                      <InputField
                        label="Suku"
                        name="suku"
                        value={formData.suku}
                        onChange={handleChange}
                      />
                      <SelectField
                        label="Pendidikan Terakhir"
                        name="pendidikan_terakhir"
                        value={formData.pendidikan_terakhir}
                        onChange={handleChange}
                        options={[
                          "SD",
                          "SMP",
                          "SMA/SMK",
                          "D3",
                          "S1",
                          "S2",
                          "S3",
                          "Tidak Sekolah",
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
                      />
                      <InputField
                        label="Nama Keluarga Penanggung Jawab"
                        name="nama_keluarga"
                        value={formData.nama_keluarga}
                        onChange={handleChange}
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
                {aiRecommendation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#003B73] mb-1">
                        Rekomendasi AI
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Berdasarkan keluhan:{" "}
                        <span className="italic font-medium">
                          "{formData.keluhan}"
                        </span>
                        , kami menyarankan Anda untuk memilih:
                      </p>
                      <div className="inline-block bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-sm">
                        Poli {aiRecommendation.rekomendasi_nama}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        *Silakan pilih poli lain jika saran ini dirasa kurang
                        tepat.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pilih Poli Tujuan
                    </label>
                    <select
                      name="poli_id"
                      value={formData.poli_id}
                      onChange={handlePoliChange}
                      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white ${
                        fieldErrors.poli_id 
                            ? "border-red-500 ring-1 ring-red-500 bg-red-50"
                            : aiRecommendation?.rekomendasi_poli_id && String(formData.poli_id) === String(aiRecommendation.rekomendasi_poli_id)
                                ? "border-green-500 ring-1 ring-green-500"
                                : "border-gray-300"
                      }`}
                    >
                      <option value="">-- Pilih Poli --</option>
                      {polis.map((p) => {
                        const isRecommended =
                          aiRecommendation?.rekomendasi_poli_id &&
                          String(p.poli_id) ===
                            String(aiRecommendation.rekomendasi_poli_id);
                        return (
                          <option
                            key={p.poli_id}
                            value={p.poli_id}
                            className={
                              isRecommended ? "font-bold text-green-700" : ""
                            }
                          >
                            {p.poli_name} {isRecommended ? "(Disarankan ✅)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    {fieldErrors.poli_id && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.poli_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pilih Dokter
                    </label>
                    <select
                      name="dokter_id"
                      value={formData.dokter_id}
                      onChange={handleDokterChange}
                      disabled={!formData.poli_id}
                      className={`w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${fieldErrors.dokter_id ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    >
                      <option value="">-- Pilih Dokter --</option>
                      {dokters.map((d) => (
                        <option key={d.dokter_id} value={d.dokter_id}>
                          {d.dokter?.nama_dokter || "Tanpa Nama"}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.dokter_id && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.dokter_id}</p>}
                    
                    {selectedDoctorSchedule && (
                      <div className="mt-2 text-xs flex items-start gap-1.5 text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <Clock size={14} className="mt-0.5" />
                        <span>
                          <b>Jadwal:</b> {availableDaysText}
                        </span>
                      </div>
                    )}
                    {formData.poli_id && dokters.length === 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        Belum ada jadwal dokter aktif.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Rencana Tanggal
                    </label>
                    <input
                      type="date"
                      name="tanggal_reservasi"
                      value={formData.tanggal_reservasi}
                      onChange={handleDateChange}
                      min={todayStr || undefined}
                      disabled={!formData.dokter_id}
                      className={`w-full p-3 border rounded-xl disabled:bg-gray-100 ${fieldErrors.tanggal_reservasi ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      required
                    />
                    {fieldErrors.tanggal_reservasi && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.tanggal_reservasi}</p>}
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
                      <option value="bpjs">BPJS Kesehatan</option>
                      <option value="asuransi">Asuransi Swasta</option>
                    </select>
                  </div>
                </div>

                {formData.penjaminan === "asuransi" && (
                  <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
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