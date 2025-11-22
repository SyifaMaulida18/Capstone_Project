"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormPoli({ initialData }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    poli_id: "",
    poli_name: "",
    // Tambahkan field lain sesuai kebutuhan (misal: kepala poli)
    // kepala: "", 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

  // Isi form jika ada data awal (Mode Edit)
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        poli_id: initialData.poli_id || "",
        poli_name: initialData.poli_name || "",
      });
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

    // Validasi ID Poli wajib diisi saat tambah baru
    if (!formData.poli_id.trim()) {
        setError("ID Poli wajib diisi.");
        setIsLoading(false);
        return;
    }

    // Payload (Sesuaikan dengan Controller store/update)
    const payload = {
        poli_id: formData.poli_id,
        poli_name: formData.poli_name,
    };

    // Tentukan URL dan Method
    // Jika Edit: PUT /polis/{poli_id}
    // Jika Add:  POST /polis
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
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Tampilkan pesan error validasi jika ada (misal ID kembar)
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

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Data Poli" : "Tambah Poli Baru"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Input ID Poli */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">
            ID Poli <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="poli_id" 
            value={formData.poli_id} 
            onChange={handleChange} 
            required
            // Jika mode edit, ID Poli tidak boleh diubah (Primary Key)
            disabled={isEditMode} 
            placeholder="Contoh: P001"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500" 
          />
          {isEditMode && <p className="text-xs text-neutral-500 mt-1">ID Poli tidak dapat diubah.</p>}
        </div>

        {/* Input Nama Poli */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">
            Nama Poli <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="poli_name" 
            value={formData.poli_name} 
            onChange={handleChange} 
            required
            placeholder="Contoh: Poli Umum"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500" 
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={() => router.back()} disabled={isLoading}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={isLoading}
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50">
            {isLoading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Poli"}
          </button>
        </div>
      </form>
    </div>
  );
}