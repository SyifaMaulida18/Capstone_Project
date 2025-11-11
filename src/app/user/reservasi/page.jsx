"use client";

import { useState, useEffect } from "react";
import { 
  Stethoscope, 
  ClipboardList, 
  Activity, 
  ArrowRight, 
  ArrowLeft, // 1. Impor ikon panah kiri
  X // Ikon untuk menutup modal
} from "lucide-react";

export default function ReservasiPage() {
  const [patientData, setPatientData] = useState(null);
  const [symptom, setSymptom] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State untuk modal

  // Simulasi ambil data pasien dari profile (dummy)
  useEffect(() => {
    const dummyPatient = {
      nama: "Syifa Maulida",
      nik: "6403021204020002",
      tanggalLahir: "2002-04-12",
      jenisKelamin: "Perempuan",
      noHp: "081234567890",
      alamat: "Jl. Manggar Balikpapan",
      noRekamMedis: "RM20231023", // jika sudah pernah berkunjung
    };
    setPatientData(dummyPatient);
    setHasVisited(!!dummyPatient.noRekamMedis);
  }, []);

  const handleDiagnosis = () => {
    if (symptom.trim() === "") {
      setDiagnosis("Mohon isi gejala terlebih dahulu.");
      return;
    }
    // Dummy hasil diagnosa (AI Based)
    const hasil = symptom.toLowerCase().includes("jantung")
      ? "Poli Jantung"
      : symptom.toLowerCase().includes("kulit")
      ? "Poli Kulit dan Kelamin"
      : "Poli Umum";

    setDiagnosis(`Hasil analisis: ${hasil}`);
  };

  const handleNext = () => {
    // Ganti alert dengan modal
    // alert("Data dikirim. Lanjut ke pemilihan jadwal dokter...");
    setShowSuccessModal(true);
  };

  const handleBack = () => {
    // Fungsi untuk kembali ke halaman sebelumnya
    window.history.back();
  };

  return (
    <div className="relative min-h-screen bg-neutral-50 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8 border border-neutral-200">
        
        {/* 2. Header diubah jadi flex justify-between */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-primary-600 w-6 h-6" />
            <h1 className="text-2xl font-semibold text-neutral-800">
              Formulir Pendaftaran Reservasi
            </h1>
          </div>
          {/* 3. Tombol kembali ditambahkan di sini */}
          <button
            onClick={handleBack}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Data Pasien */}
        {patientData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nama Lengkap" value={patientData.nama} readOnly />
              <InputField label="NIK" value={patientData.nik} readOnly />
              <InputField label="Tanggal Lahir" value={patientData.tanggalLahir} readOnly />
              <InputField label="Jenis Kelamin" value={patientData.jenisKelamin} readOnly />
              <InputField label="No. HP" value={patientData.noHp} readOnly />
              <InputField label="Alamat" value={patientData.alamat} readOnly />
              {hasVisited && (
                <InputField label="Nomor Rekam Medis" value={patientData.noRekamMedis} readOnly />
              )}
            </div>

            {/* Gejala */}
            <div className="mt-6">
              <label className="block text-neutral-700 font-medium mb-2">
                Gejala yang Dirasakan
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-700"
                rows={4}
                placeholder="Ceritakan gejala yang Anda rasakan..."
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
              ></textarea>
            </div>

            {/* Tombol Diagnosa */}
            <button
              onClick={handleDiagnosis}
              className="mt-3 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Stethoscope size={18} />
              Diagnosa Otomatis
            </button>

            {/* Hasil Diagnosa */}
            {diagnosis && (
              <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center gap-3">
                <Activity className="text-primary-600 w-5 h-5" />
                <p className="text-primary-800 text-sm font-medium">{diagnosis}</p>
              </div>
            )}

            {/* Tombol Lanjut */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNext}
                className="bg-primary-800 hover:bg-secondary-600 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors"
              >
                Daftar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-neutral-600 animate-pulse">Memuat data pasien...</p>
        )}
      </div>

      {/* 4. Modal pengganti alert */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              Data Terkirim
            </h3>
            <p className="text-neutral-600 text-sm">
              Lanjut ke pemilihan jadwal dokter...
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen kecil untuk input field agar rapi
function InputField({ label, value, readOnly = false }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-neutral-700 font-medium mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        className={`w-full border border-neutral-200 rounded-lg p-2.5 text-neutral-700 ${
          readOnly 
            ? "bg-neutral-100 cursor-not-allowed" 
            : "focus:outline-none focus:ring-2 focus:ring-primary-500"
        } transition-colors`}
      />
    </div>
  );
}
