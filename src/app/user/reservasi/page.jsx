// app/user/reservasi/page.js
// VERSI UNTUK MENDAFTARKAN ORANG LAIN

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import {
  Stethoscope,
  ClipboardList,
  Activity,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  AlertCircle,
  Users, // Ganti ikon
} from "lucide-react";

export default function ReservasiPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // 1. SEMUA DATA PASIEN SEKARANG KOSONG (UNTUK DIISI MANUAL)
    nama: "",
    email: "",
    nomor_whatsapp: "",
    nomor_ktp: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    penjaminan: "cash",
    keluhan: "",
    poli_id: "", 
    tanggal_reservasi: "",
  });

  const [polis, setPolis] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [loadingDiagnosa, setLoadingDiagnosa] = useState(false);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState(""); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 2. useEffect SEKARANG HANYA MENGAMBIL POLI
  useEffect(() => {
    // Ambil data poli (untuk "model AI")
    const fetchPolis = async () => {
      try {
        const response = await api.get("/polis-public");
        setPolis(response.data);
      } catch (err) {
        console.error("Gagal mengambil data poli:", err);
        setError(
          "Gagal memuat model AI (poli). Silakan refresh halaman."
        );
      }
    };

    fetchPolis();
  }, []); // <-- Logika localStorage.getItem() sudah dihapus

  // Handle perubahan di setiap input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi "Diagnosa Otomatis" (Tetap sama)
  const handleDiagnosis = () => {
    setLoadingDiagnosa(true);
    setError("");
    setDiagnosis("");

    const keluhan = formData.keluhan;
    if (keluhan.trim() === "") {
      setError("Mohon isi keluhan / gejala terlebih dahulu.");
      setLoadingDiagnosa(false);
      return;
    }

    if (polis.length === 0) {
      setError("Data poli (model AI) belum siap. Coba beberapa saat lagi.");
      setLoadingDiagnosa(false);
      return;
    }

    // --- Logika AI Palsu (Simulasi) ---
    const keluhanLower = keluhan.toLowerCase();
    let foundPoli = null;

    const poliJantung = polis.find(p => p.poli_name.toLowerCase().includes("jantung"));
    const poliGigi = polis.find(p => p.poli_name.toLowerCase().includes("gigi"));
    const poliAnak = polis.find(p => p.poli_name.toLowerCase().includes("anak"));

    if ((keluhanLower.includes("jantung") || keluhanLower.includes("dada sesak")) && poliJantung) {
      foundPoli = poliJantung;
    } else if ((keluhanLower.includes("gigi") || keluhanLower.includes("gusi")) && poliGigi) {
      foundPoli = poliGigi;
    } else if ((keluhanLower.includes("anak") || keluhanLower.includes("bayi")) && poliAnak) {
      foundPoli = poliAnak;
    }

    if (!foundPoli) {
      foundPoli = polis.find(p => p.poli_name.toLowerCase().includes("umum"));
    }
    if (!foundPoli && polis.length > 0) {
      foundPoli = polis[0];
    }
    // ---------------------------------

    setTimeout(() => {
      if (foundPoli) {
        setFormData(prev => ({
          ...prev,
          poli_id: foundPoli.poli_id 
        }));
        setDiagnosis(`Analisis AI: Keluhan Anda disarankan untuk ke ${foundPoli.poli_name}.`);
      } else {
        setError("Tidak dapat menentukan poli. Silakan hubungi admin.");
      }
      setLoadingDiagnosa(false);
    }, 1000); 
  };


  // Handle submit form ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi frontend (sekarang cek semua data pasien)
    if (!formData.nama || !formData.nomor_ktp || !formData.nomor_whatsapp || !formData.tempat_lahir || !formData.tanggal_lahir) {
        setError("Data pasien (Nama, KTP, No. HP, Tempat & Tgl. Lahir) wajib diisi.");
        setLoading(false);
        return;
    }
    if (!formData.poli_id) {
        setError("Harap jalankan \"Diagnosa Otomatis\" terlebih dahulu.");
        setLoading(false);
        return;
    }
    if (!formData.tanggal_reservasi || !formData.keluhan) {
      setError("Tanggal Reservasi dan Keluhan wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/reservations", formData);

      if (response.status === 201) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Error submit reservasi:", err);
      if (err.response && err.response.status === 422) {
        const validationErrors = err.response.data.errors;
        const firstError = Object.values(validationErrors)[0][0];
        setError(`Validasi gagal: ${firstError}`);
      } else {
        setError("Terjadi kesalahan saat mengirim reservasi. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push("/user/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-neutral-50 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8 border border-neutral-200">
        {/* ... Header ... */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-primary-600 w-6 h-6" /> {/* Ikon diubah */}
            <h1 className="text-2xl font-semibold text-neutral-800">
              Formulir Pendaftaran Pasien
            </h1>
          </div>
          <button
            onClick={handleBack}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Form Utama */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-700 border-b pb-2">
            Data Pasien (Keluarga Anda)
          </h2>
          {/* 3. SEMUA FIELD PASIEN SEKARANG EDITABLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nama Lengkap Pasien"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Budi Gunawan"
              required
            />
            <InputField 
              label="Email Pasien (Opsional)" 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@pasien.com"
            />
            <InputField
              label="No. HP (WhatsApp) Pasien"
              name="nomor_whatsapp"
              value={formData.nomor_whatsapp}
              onChange={handleChange}
              placeholder="0812..."
              required
            />
            <InputField
              label="NIK (Nomor KTP) Pasien"
              name="nomor_ktp"
              value={formData.nomor_ktp}
              onChange={handleChange}
              placeholder="Wajib diisi (16 digit)"
              required
            />
            <InputField
              label="Tempat Lahir Pasien"
              name="tempat_lahir"
              value={formData.tempat_lahir}
              onChange={handleChange}
              placeholder="Wajib diisi"
              required
            />
            <InputField
              label="Tanggal Lahir Pasien"
              name="tanggal_lahir"
              type="date"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              required
            />
          </div>

          <hr className="my-4" />
          
          <h2 className="text-lg font-semibold text-neutral-700 border-b pb-2">
            Data Kunjungan
          </h2>
          {/* Data Reservasi (Tetap sama) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col">
              <label className="text-sm text-neutral-700 font-medium mb-1.5">
                Penjaminan
              </label>
              <select
                name="penjaminan"
                value={formData.penjaminan}
                onChange={handleChange}
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="cash">Pribadi (Cash)</option>
                <option value="asuransi">Asuransi</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-neutral-700 font-medium mb-1.5">
                Pilih Tanggal Reservasi
              </label>
              <input
                type="date"
                name="tanggal_reservasi"
                value={formData.tanggal_reservasi}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Gejala (Tetap sama) */}
          <div className="mt-4">
            <label className="block text-neutral-700 font-medium mb-2">
              Keluhan / Gejala yang Dirasakan Pasien
            </label>
            <textarea
              name="keluhan"
              className="w-full border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700"
              rows={4}
              placeholder="Ceritakan keluhan atau gejala yang dirasakan pasien..."
              value={formData.keluhan}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Tombol Diagnosa (Tetap sama) */}
          <div className="mt-4">
            <button
              type="button" 
              onClick={handleDiagnosis}
              disabled={loadingDiagnosa}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-neutral-400"
            >
              {loadingDiagnosa ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Stethoscope size={18} />
              )}
              {loadingDiagnosa ? "Menganalisis..." : "Diagnosa Otomatis (Cek Poli)"}
            </button>
          </div>

          {/* Error & Hasil Diagnosa (Tetap sama) */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 w-5 h-5" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}
          {diagnosis && !error && (
            <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center gap-3">
              <Activity className="text-primary-600 w-5 h-5" />
              <p className="text-primary-800 text-sm font-medium">{diagnosis}</p>
            </div>
          )}

          {/* Tombol Submit (Tetap sama) */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading || loadingDiagnosa}
              className="bg-primary-800 hover:bg-secondary-600 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors disabled:bg-neutral-400"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              {loading ? "Mengirim..." : "Daftar Reservasi"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Sukses (Tetap sama) */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Reservasi Terkirim
            </h3>
            <p className="text-neutral-600 text-sm">
              Permintaan reservasi Anda telah terkirim dan sedang menunggu
              konfirmasi dari admin. Silakan cek statusnya secara berkala.
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen InputField (Tetap sama, tidak perlu diubah)
function InputField({
  label,
  value,
  name,
  type = "text",
  placeholder = "",
  readOnly = false,
  required = false,
  onChange = () => {},
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-neutral-700 font-medium mb-1.5">
        {label}
        {required && !readOnly && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border border-neutral-200 rounded-lg p-2.5 text-neutral-700 ${
          readOnly
            ? "bg-neutral-100 cursor-not-allowed"
            : "focus:outline-none focus:ring-2 focus:ring-primary-500"
        } transition-colors`}
      />
    </div>
  );
}