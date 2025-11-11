"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  ArrowLeft,
  History,
  Search,
  FileText, // Icon Download dihapus
  Stethoscope,
  User,
  CalendarDays,
} from "lucide-react";

// --- DATA MOCKUP (Pura-pura) ---
const mockRiwayat = [
  {
    id: 1,
    tanggal: "12 Agustus 2025",
    poli: "Poli Jantung",
    dokter: "dr. Budi Santoso",
    diagnosis: "Pemeriksaan rutin, Hipertensi ringan terkontrol.",
    status: "Selesai",
  },
  {
    id: 2,
    tanggal: "05 Juli 2025",
    poli: "Poli Kulit dan Kelamin",
    dokter: "dr. Andi",
    diagnosis: "Alergi musiman, diresepkan obat antihistamin.",
    status: "Selesai",
  },
  // ... data lainnya
];
// ------------------------------

export default function RiwayatKunjunganPage() {
  const router = useRouter();
  const [riwayat, setRiwayat] = useState(mockRiwayat);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRiwayat = riwayat.filter(
    (item) =>
      item.poli.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dokter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl">
        {/* Header Halaman */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <History className="text-primary-600 w-7 h-7" />
          <h1 className="text-3xl font-semibold text-neutral-800">
            Riwayat Kunjungan
          </h1>
        </div>

        {/* Search Bar untuk Filter */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Cari berdasarkan poli, dokter, atau diagnosis..."
            className="w-full border border-neutral-300 rounded-lg p-3 pl-10 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
        </div>

        {/* Daftar Kartu Riwayat */}
        <div className="space-y-4">
          {filteredRiwayat.length > 0 ? (
            filteredRiwayat.map((item) => (
              <RiwayatCard key={item.id} visit={item} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Komponen Bantuan untuk 1 Kartu Riwayat (DIPERBARUI) ---
function RiwayatCard({ visit }) {
  const router = useRouter(); // Tambahkan router di sini

  const handleLihatDetail = () => {
    // Arahkan ke halaman detail dinamis berdasarkan ID
    router.push(`/user/riwayat/${visit.id}`);
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-neutral-200 overflow-hidden transition-all hover:shadow-xl">
      <div className="p-5">
        {/* Header Kartu: Tanggal dan Status */}
        <div className="flex justify-between items-center border-b border-neutral-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-lg text-primary-700">
              {visit.tanggal}
            </span>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-100 py-1 px-3 rounded-full">
            {visit.status}
          </span>
        </div>

        {/* Body Kartu: Detail Kunjungan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Info Poli */}
          <div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Stethoscope size={14} />
              <span className="text-sm font-medium">Poli</span>
            </div>
            <p className="font-semibold text-neutral-800">{visit.poli}</p>
          </div>
          {/* Info Dokter */}
          <div>
            <div className="flex items-center gap-2 text-neutral-500">
              <User size={14} />
              <span className="text-sm font-medium">Dokter</span>
            </div>
            <p className="font-semibold text-neutral-800">{visit.dokter}</p>
          </div>
          {/* Info Diagnosis */}
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-neutral-500">
              Diagnosis Singkat
            </p>
            <p className="text-neutral-700 text-sm">{visit.diagnosis}</p>
          </div>
        </div>

        {/* Footer Kartu: Tombol Aksi (DIPERBARUI) */}
        <div className="flex justify-end">
          {/* Tombol Download dihapus, tombol ini sekarang mengambil lebar penuh di container-nya */}
          <button
            onClick={handleLihatDetail} // Tambahkan onClick handler
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FileText size={16} />
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Bantuan untuk Tampilan Kosong
function EmptyState() {
  return (
    <div className="text-center p-16 bg-white rounded-2xl shadow border border-neutral-200">
      <History className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
      <h3 className="font-semibold text-xl text-neutral-700">
        Riwayat Tidak Ditemukan
      </h3>
      <p className="text-neutral-500 mt-2">
        Tidak ada riwayat kunjungan yang sesuai dengan pencarian Anda, atau Anda
        belum memiliki riwayat.
      </p>
    </div>
  );
}