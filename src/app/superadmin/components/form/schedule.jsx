"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Helper: Daftar Hari
const DAYS = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
];

export default function JadwalForm({ initialData }) {
  const router = useRouter();
  
  // State Data
  const [formData, setFormData] = useState({
    dokter_id: "",
    poli_id: "",
    gedung: "",
    pelayanan_cash: "N",
    pelayanan_bpjs: "N",
    pelayanan_asuransi: "N",
    // ... (Field hari akan di-handle dinamis)
  });

  // State untuk Dropdown Dokter & Poli (Penting!)
  const [dokters, setDokters] = useState([]);
  const [polis, setPolis] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

  // 1. Fetch Data Master (Dokter & Poli) untuk Dropdown
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Dokter & Poli secara paralel
        const [resDokter, resPoli] = await Promise.all([
            fetch(`${baseUrl}/dokters`, { headers }),
            fetch(`${baseUrl}/polis`, { headers })
        ]);

        const dataDokter = await resDokter.json();
        const dataPoli = await resPoli.json();

        setDokters(Array.isArray(dataDokter) ? dataDokter : dataDokter.data || []);
        setPolis(Array.isArray(dataPoli) ? dataPoli : dataPoli.data || []);

      } catch (err) {
        console.error("Gagal load master data:", err);
      }
    };

    fetchMasterData();
  }, []);

  // 2. Isi Form jika Edit Mode
  useEffect(() => {
    if (isEditMode && initialData) {
      // Spread initialData ke state
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData, isEditMode]);

  // Handle Input Change Umum
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

    // Tentukan URL (Edit pakai Composite Key)
    const url = isEditMode 
        ? `${baseUrl}/jadwal-dokter/${initialData.dokter_id}/${initialData.poli_id}` 
        : `${baseUrl}/jadwal-dokter`;
        
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan jadwal.");
      }

      console.log("Jadwal saved successfully");
      router.push("/superadmin/schedule"); 
      router.refresh();

    } catch (err) {
      console.error("Failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Render Input Hari
  const renderDayInputs = (day) => (
    <div key={day.key} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-4">
      <h4 className="font-bold text-primary-700 mb-3 capitalize border-b border-neutral-200 pb-2">
        {day.label}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pagi */}
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500">Pagi</p>
            <div className="flex gap-2">
                <input type="time" name={`${day.key}_pagi_dari`} value={formData[`${day.key}_pagi_dari`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                <span className="self-center">-</span>
                <input type="time" name={`${day.key}_pagi_sampai`} value={formData[`${day.key}_pagi_sampai`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <input type="number" placeholder="Kuota" name={`${day.key}_pagi_kuota`} value={formData[`${day.key}_pagi_kuota`] || 0} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
        </div>

        {/* Siang */}
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500">Siang</p>
            <div className="flex gap-2">
                <input type="time" name={`${day.key}_siang_dari`} value={formData[`${day.key}_siang_dari`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                <span className="self-center">-</span>
                <input type="time" name={`${day.key}_siang_sampai`} value={formData[`${day.key}_siang_sampai`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <input type="number" placeholder="Kuota" name={`${day.key}_siang_kuota`} value={formData[`${day.key}_siang_kuota`] || 0} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
        </div>

        {/* Sore */}
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500">Sore</p>
            <div className="flex gap-2">
                <input type="time" name={`${day.key}_sore_dari`} value={formData[`${day.key}_sore_dari`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                <span className="self-center">-</span>
                <input type="time" name={`${day.key}_sore_sampai`} value={formData[`${day.key}_sore_sampai`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            </div>
            <input type="number" placeholder="Kuota" name={`${day.key}_sore_kuota`} value={formData[`${day.key}_sore_kuota`] || 0} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
        </div>

        {/* Status Praktek & Keterangan */}
        <div className="md:col-span-2 flex gap-4 mt-2">
            <div className="flex-1">
                <label className="text-xs block font-semibold text-gray-500 mb-1">Status Praktek</label>
                <select name={`${day.key}_praktek`} value={formData[`${day.key}_praktek`] || "N"} onChange={handleChange} className="w-full p-2 border rounded text-sm">
                    <option value="Y">Praktek (Y)</option>
                    <option value="N">Tutup (N)</option>
                </select>
            </div>
            <div className="flex-[2]">
                <label className="text-xs block font-semibold text-gray-500 mb-1">Keterangan</label>
                <input type="text" name={`${day.key}_keterangan`} value={formData[`${day.key}_keterangan`] || ""} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Catatan..." />
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Jadwal Dokter" : "Tambah Jadwal Baru"}
      </h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Bagian Utama: Pilih Dokter & Poli */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-4 text-blue-800">Identitas Jadwal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2 text-sm font-semibold">Dokter</label>
                    <select 
                        name="dokter_id" 
                        value={formData.dokter_id} 
                        onChange={handleChange} 
                        required 
                        disabled={isEditMode} // Composite Key tidak boleh diubah saat edit
                        className="w-full p-2 border rounded disabled:bg-gray-200"
                    >
                        <option value="">-- Pilih Dokter --</option>
                        {dokters.map(d => (
                            <option key={d.dokter_id} value={d.dokter_id}>{d.nama_dokter}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-semibold">Poli</label>
                    <select 
                        name="poli_id" 
                        value={formData.poli_id} 
                        onChange={handleChange} 
                        required 
                        disabled={isEditMode} // Composite Key tidak boleh diubah saat edit
                        className="w-full p-2 border rounded disabled:bg-gray-200"
                    >
                        <option value="">-- Pilih Poli --</option>
                        {polis.map(p => (
                            <option key={p.poli_id} value={p.poli_id}>{p.poli_name}</option>
                        ))}
                    </select>
                </div>
                {/* Info Tambahan */}
                <div>
                    <label className="block mb-2 text-sm font-semibold">Gedung</label>
                    <input type="text" name="gedung" value={formData.gedung || ""} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
            </div>
        </div>

        {/* Loop Jadwal Hari */}
        <div>
            <h3 className="font-bold text-xl mb-4 text-neutral-800">Jadwal Mingguan</h3>
            {DAYS.map(day => renderDayInputs(day))}
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end pt-4 space-x-3 sticky bottom-0 bg-white py-4 border-t">
          <button type="button" onClick={() => router.back()} disabled={isLoading} className="px-6 py-2 border rounded hover:bg-gray-100">Batal</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600 disabled:opacity-50">
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}