"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormPoli({ initialData }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    poli_id: "",
    poli_name: "",
    kepala: "",
    wadir: "",
    tipe_poli: "",
    tipe_layanan: "",
    kode_lokasi: "",
    kode_urutan: "",
    create_mr: "",
    as_gudang: "",
    kode_bagian_1: "",
    create_miv: "",
    kode_bag_rs: "",
    rekening_p_5: "",
    rekening_r_5: "",
    rekening_b_5: "",
    ppk: "",
    petty_cash: "",
    hbi: "",
    kode_apotik: "",
    kode_konsul: "",
    aktif: "Y", // Default 'Y'
    id_mysap: "",
    rawat_jalan: "",
    desk_lama: "",
    teknik: "",
    pertg_jwbn: "",
    kode_korporat: "",
    kode_rs: "",
    proses_stock: "",
    poli_id_inht: "",
    poli_pdk: "",
    poli_id_bpjs: "",
    kode_printer: "",
    kode_rujuk_bpjs: "",
    poli_id_main: "",
    d_satu_sehat: "",
    panjar_kerja: "",
    view_mjkn: "",
    update_date: new Date().toISOString().split('T')[0], 
    update_by: "Superadmin", 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

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

    if (!formData.poli_id.trim()) {
        setError("ID Poli wajib diisi.");
        setIsLoading(false);
        return;
    }

    const url = isEditMode 
        ? `${baseUrl}/polis/${initialData.poli_id}` 
        : `${baseUrl}/polis`;
        
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
        throw new Error(errorData.message || JSON.stringify(errorData) || "Gagal menyimpan data poli.");
      }

      console.log("Success");
      router.push("/superadmin/polis"); 
      router.refresh();

    } catch (err) {
      console.error("Failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper untuk membuat Input Field agar kode lebih ringkas
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
        disabled={name === 'poli_id' && isEditMode}
        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm disabled:bg-neutral-100" 
      />
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Data Poli" : "Tambah Poli Baru"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm break-words">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Bagian Utama */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Informasi Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput("ID Poli", "poli_id", "text", true, "Contoh: P001")}
                {renderInput("Nama Poli", "poli_name", "text", true, "Contoh: Poli Umum")}
                {renderInput("Kepala Poli", "kepala")}
                {renderInput("Wakil Direktur", "wadir")}
                {renderInput("Status Aktif", "aktif", "text", false, "Y / T")}
            </div>
        </div>

        {/* Detail Teknis & Kode */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Detail & Kode Referensi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderInput("Tipe Poli", "tipe_poli")}
                {renderInput("Tipe Layanan", "tipe_layanan")}
                {renderInput("Kode Lokasi", "kode_lokasi")}
                {renderInput("Kode Urutan", "kode_urutan")}
                {renderInput("Kode Bagian RS", "kode_bag_rs")}
                {renderInput("Kode Apotik", "kode_apotik")}
                {renderInput("Kode Konsul", "kode_konsul")}
                {renderInput("Kode Korporat", "kode_korporat")}
                {renderInput("Kode RS", "kode_rs")}
                {renderInput("Kode Printer", "kode_printer")}
                {renderInput("Kode Rujuk BPJS", "kode_rujuk_bpjs")}
            </div>
        </div>

        {/* Akuntansi & Rekening */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Akuntansi & Keuangan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput("Rekening P5", "rekening_p_5")}
                {renderInput("Rekening R5", "rekening_r_5")}
                {renderInput("Rekening B5", "rekening_b_5")}
                {renderInput("PPK", "ppk")}
                {renderInput("Petty Cash", "petty_cash")}
                {renderInput("HBI", "hbi")}
            </div>
        </div>

        {/* Integrasi Sistem Lain */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Integrasi Sistem (BPJS/Satu Sehat)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput("ID Satu Sehat", "d_satu_sehat")}
                {renderInput("ID MySAP", "id_mysap")}
                {renderInput("ID Poli Inhealth", "poli_id_inht")}
                {renderInput("ID Poli BPJS", "poli_id_bpjs")}
                {renderInput("ID Poli Main", "poli_id_main")}
                {renderInput("View MJKN", "view_mjkn")}
            </div>
        </div>

        {/* Lain-lain (Sisa Field) */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h3 className="font-bold text-lg mb-4 text-primary-700">Pengaturan Lainnya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderInput("Create MR", "create_mr")}
                {renderInput("Create MIV", "create_miv")}
                {renderInput("As Gudang", "as_gudang")}
                {renderInput("Kode Bagian 1", "kode_bagian_1")}
                {renderInput("Rawat Jalan", "rawat_jalan")}
                {renderInput("Deskripsi Lama", "desk_lama")}
                {renderInput("Teknik", "teknik")}
                {renderInput("Pertanggungjawaban", "pertg_jwbn")}
                {renderInput("Proses Stock", "proses_stock")}
                {renderInput("Poli PDK", "poli_pdk")}
                {renderInput("Panjar Kerja", "panjar_kerja")}
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
            {isLoading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Poli"}
          </button>
        </div>
      </form>
    </div>
  );
}