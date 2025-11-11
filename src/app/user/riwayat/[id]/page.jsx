"use client";

import {
    ArrowLeft,
    CalendarDays,
    ClipboardCheck,
    FilePlus,
    FileText,
    HeartPulse,
    Pill,
    Stethoscope,
    Thermometer,
    User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- DATA MOCKUP DETAIL (Pura-pura) ---
// Data ini mensimulasikan apa yang akan Anda ambil dari database menggunakan 'id'
const mockDetailData = {
  "1": {
    id: 1,
    pasien: {
      nama: "Syifa Maulida",
      nik: "6403021204020002",
      noRekamMedis: "RM20231023",
    },
    kunjungan: {
      tanggal: "12 Agustus 2025",
      poli: "Poli Jantung",
      dokter: "dr. Budi Santoso",
    },
    soap: {
      subjective: "Pasien datang untuk kontrol rutin. Mengeluh sedikit pusing sesekali, tidak ada nyeri dada.",
      objective: "Kesadaran: Compos Mentis. Tensi: 130/85 mmHg. Nadi: 80x/menit. Suhu: 36.5°C. RR: 18x/menit. Pemeriksaan fisik jantung dalam batas normal.",
      assessment: "Hipertensi esensial (I10), terkontrol baik.",
      plan: "Lanjutkan obat Amlodipine 1x5mg. Edukasi diet rendah garam. Kontrol kembali 1 bulan.",
    },
    resep: [
      { nama: "Amlodipine 5mg", jumlah: 30, aturan: "1 x 1 tablet (sesudah makan)" },
      { nama: "Paracetamol 500mg", jumlah: 10, aturan: "3 x 1 tablet (jika pusing)" },
    ]
  },
  "2": {
    id: 2,
     pasien: {
      nama: "Syifa Maulida",
      nik: "6403021204020002",
      noRekamMedis: "RM20231023",
    },
    kunjungan: {
      tanggal: "05 Juli 2025",
      poli: "Poli Kulit dan Kelamin",
      dokter: "dr. Andi",
    },
     soap: {
      subjective: "Pasien mengeluh gatal-gatal di area lengan dan kaki sejak 2 hari lalu, terutama saat cuaca dingin.",
      objective: "Tampak lesi urtikaria (biduran) di regio brachii dextra et sinistra dan cruris dextra. Tensi: 120/80 mmHg. Nadi: 76x/menit. Suhu: 36.2°C.",
      assessment: "Urtikaria Akut (L50.0) e.c. Alergi Dingin.",
      plan: "Resep obat antihistamin (Cetirizine). Edukasi hindari paparan dingin berlebih.",
    },
    resep: [
      { nama: "Cetirizine 10mg", jumlah: 10, aturan: "1 x 1 tablet (malam hari)" },
    ]
  },
  // ... data detail lainnya
};
// ------------------------------------

export default function DetailRiwayatPage() {
  const router = useRouter();
  const params = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { id } = params;
    if (id) {
      // Simulasi pengambilan data
      const data = mockDetailData[id];
      if (data) {
        setVisit(data);
      }
      setLoading(false);
    }
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center">
        <p className="text-neutral-600 animate-pulse">Memuat data...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center text-center p-4">
        <div>
           <h2 className="text-2xl font-semibold text-red-600 mb-4">Data Tidak Ditemukan</h2>
           <p className="text-neutral-600 mb-6">Detail riwayat dengan ID ini tidak dapat ditemukan.</p>
           <button
            onClick={() => router.back()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Komponen kecil untuk menampilkan info
  const InfoItem = ({ icon: Icon, label, value }) => (
    <div>
      <div className="flex items-center gap-2 text-neutral-500">
        <Icon size={14} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="font-semibold text-neutral-800">{value}</p>
    </div>
  );
  
  // Komponen kecil untuk menampilkan data SOAP
  const SoapSection = ({ icon: Icon, title, text }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 text-primary-600"/>
          <h3 className="text-lg font-semibold text-primary-700">{title} (SOAP)</h3>
      </div>
      <p className="text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
        {text}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Halaman */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <FileText className="text-primary-600 w-7 h-7" />
          <h1 className="text-3xl font-semibold text-neutral-800">
            Detail Riwayat Kunjungan
          </h1>
        </div>

        {/* Konten Detail */}
        <div className="bg-white shadow-lg rounded-2xl border border-neutral-200">
          
          {/* Bagian 1: Info Kunjungan & Pasien */}
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-primary-700 mb-4">
              Informasi Kunjungan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem icon={CalendarDays} label="Tanggal" value={visit.kunjungan.tanggal} />
              <InfoItem icon={Stethoscope} label="Poli" value={visit.kunjungan.poli} />
              <InfoItem icon={User} label="Dokter" value={visit.kunjungan.dokter} />
              <InfoItem icon={FilePlus} label="No. Rekam Medis" value={visit.pasien.noRekamMedis} />
            </div>
          </div>
          
          {/* Bagian 2: SOAP */}
          <div className="p-6 border-b border-neutral-200 space-y-4">
             <h2 className="text-xl font-bold text-primary-700 mb-4">
              Hasil Pemeriksaan (SOAP)
            </h2>
             <SoapSection icon={ClipboardCheck} title="Subjective" text={visit.soap.subjective} />
             <SoapSection icon={HeartPulse} title="Objective" text={visit.soap.objective} />
             <SoapSection icon={Thermometer} title="Assessment" text={visit.soap.assessment} />
             <SoapSection icon={Pill} title="Plan" text={visit.soap.plan} />
          </div>

          {/* Bagian 3: Resep Obat */}
          <div className="p-6">
             <h2 className="text-xl font-bold text-primary-700 mb-4">
              Resep Obat
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-neutral-600">Nama Obat</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-neutral-600">Jumlah</th>
                    <th className="py-2 px-3 text-left text-sm font-semibold text-neutral-600">Aturan Pakai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {visit.resep.map((obat, index) => (
                    <tr key={index}>
                      <td className="py-2 px-3 text-neutral-700">{obat.nama}</td>
                      <td className="py-2 px-3 text-neutral-700">{obat.jumlah}</td>
                      <td className="py-2 px-3 text-neutral-700">{obat.aturan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}