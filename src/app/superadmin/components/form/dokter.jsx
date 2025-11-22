"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormDokter({ initialData }) {
  const router = useRouter();
  
  // State untuk semua field (Sesuaikan dengan model Dokter)
  const [formData, setFormData] = useState({
    nama_dokter: "",
    bidang_keahlian: "",
    tipe: "",
    praktek: "",
    telpon_praktek: "",
    alamat_rumah: "",
    telp_rumah: "",
    aktif: "Y", // Default 'Y'
    flags: "",
    nama_dokter_asli: "",
    konsulen: "",
    start_date: "",
    expire_date: "",
    id_dokter_inht: "",
    type_dok: "",
    sip_dokter: "",
    tmt_sip: "",
    str_perawat: "",
    tmt_str: "",
    id_dokter_bpjs: "",
    ttd_id: "",
    sts_peg: "",
    no_ktp: "",
    id_satu_sehat: "",
    jenis_kelamin: "",
    ksm_role: "",
    last_update: new Date().toISOString().split('T')[0],
    last_update_by: "Superadmin",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

  // Isi form jika ada data awal (Mode Edit)
  useEffect(() => {
    if (isEditMode && initialData) {
      const populatedData = {};
      Object.keys(formData).forEach(key => {
        populatedData[key] = initialData[key] || "";
      });
      setFormData(populatedData);
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

    const url = isEditMode 
        ? `${baseUrl}/dokters/${initialData.dokter_id}` 
        : `${baseUrl}/dokters`;
        
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
        throw new Error(errorData.message || JSON.stringify(errorData) || "Gagal menyimpan data dokter.");
      }

      console.log("Dokter saved successfully");
      router.push("/superadmin/dokter"); 
      router.refresh();

    } catch (err) {
      console.error("Failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label, name, type = "text", required = false, placeholder = "") => (
    <div className="col-span-1">
      <label className="block mb-2 text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        name={name} 
        value={formData[name]} 
        onChange={handleChange} 
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm" 
      />
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Data Dokter" : "Tambah Dokter Baru"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm break-words">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Informasi Utama */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Informasi Dokter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput("Nama Dokter", "nama_dokter", "text", true, "dr. Nama Lengkap")}
                {renderInput("Bidang Keahlian", "bidang_keahlian", "text", false, "Spesialis ...")}
                {renderInput("Nama Dokter Asli", "nama_dokter_asli")}
                {renderInput("No KTP", "no_ktp")}
                {renderInput("Jenis Kelamin", "jenis_kelamin", "text", false, "L / P")}
                {renderInput("Status Aktif", "aktif", "text", false, "Y / T")}
            </div>
        </div>

        {/* Kontak & Alamat */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Kontak & Alamat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput("Telp Praktek", "telpon_praktek")}
                {renderInput("Telp Rumah", "telp_rumah")}
                {renderInput("Alamat Rumah", "alamat_rumah")}
                {renderInput("Lokasi Praktek", "praktek")}
            </div>
        </div>

        {/* Detail Kepegawaian & SIP */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Kepegawaian & Legalitas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderInput("Tipe", "tipe")}
                {renderInput("Tipe Dok", "type_dok")}
                {renderInput("Status Pegawai", "sts_peg")}
                {renderInput("KSM Role", "ksm_role")}
                {renderInput("SIP Dokter", "sip_dokter")}
                {renderInput("TMT SIP", "tmt_sip", "date")}
                {renderInput("STR Perawat", "str_perawat")}
                {renderInput("TMT STR", "tmt_str", "date")}
                {renderInput("Start Date", "start_date", "date")}
                {renderInput("Expire Date", "expire_date", "date")}
            </div>
        </div>

        {/* Integrasi & Kode */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Integrasi & Lainnya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput("ID Satu Sehat", "id_satu_sehat")}
                {renderInput("ID Dokter BPJS", "id_dokter_bpjs")}
                {renderInput("ID Dokter INHT", "id_dokter_inht")}
                {renderInput("Flags", "flags")}
                {renderInput("Konsulen", "konsulen")}
                {renderInput("TTD ID", "ttd_id", "number")}
            </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={() => router.back()} disabled={isLoading}
            className="px-6 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors font-semibold">
            Batal
          </button>
          <button type="submit" disabled={isLoading}
            className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors font-semibold disabled:opacity-50">
            {isLoading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Dokter"}
          </button>
        </div>
      </form>
    </div>
  );
}