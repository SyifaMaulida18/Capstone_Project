"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormAdmin({ initialData }) {
  const router = useRouter();
  
  // State untuk menampung inputan form
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cek apakah ini mode Edit atau Tambah
  const isEditMode = Boolean(initialData);

  // Mengisi form jika ada data awal (Mode Edit)
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nama: initialData.Nama || "", // Backend mengirim 'Nama'
        email: initialData.Email || "", // Backend mengirim 'Email'
        password: "", // Password dikosongkan (diisi hanya jika ingin mengubah)
      });
    }
  }, [initialData, isEditMode]);

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Ambil Token
    const token = localStorage.getItem("token"); 

    if (!token) {
        setError("Anda belum login atau sesi habis.");
        setIsLoading(false);
        return;
    }

    // 2. Siapkan Payload (Huruf Besar Sesuai Backend)
    const payload = {
        Nama: formData.nama,
        Email: formData.email,
    };

    // Logic Password:
    // - Jika diisi, kirim ke backend.
    // - Jika kosong & mode Tambah, error.
    // - Jika kosong & mode Edit, abaikan (backend pakai password lama).
    if (formData.password) {
        payload.Password = formData.password;
    } else if (!isEditMode) {
        setError("Password wajib diisi untuk admin baru.");
        setIsLoading(false);
        return;
    }

    // 3. Tentukan URL dan Method
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
    
    const url = isEditMode 
        ? `${baseUrl}/admins/${initialData.adminID}` 
        : `${baseUrl}/admins`;
        
    const method = isEditMode ? "PUT" : "POST";

    try {
      // 4. Kirim Request ke Backend
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
        throw new Error(errorData.message || "Gagal menyimpan data admin.");
      }

      console.log("Success:", isEditMode ? "Updated" : "Created");
      
      // 5. Redirect kembali ke list admin dan refresh data
      router.push("/superadmin/admins"); 
      router.refresh();
      
    } catch (err) {
      console.error("Failed to save data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Data Admin" : "Tambah Admin Baru"}
      </h2>

      {/* Tampilkan Banner Error jika ada */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Field Nama */}
        <div>
          <label htmlFor="nama" className="block mb-2 text-sm font-semibold text-neutral-700">
            Nama Admin
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            placeholder="Contoh: Admin Loket 1"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* Field Email */}
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-semibold text-neutral-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Contoh: admin@rs.com"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* Field Password */}
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-semibold text-neutral-700">
            Password {isEditMode && <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditMode} 
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold disabled:opacity-50"
          >
            {isLoading
              ? "Menyimpan..."
              : isEditMode
              ? "Simpan Perubahan"
              : "Tambah Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}