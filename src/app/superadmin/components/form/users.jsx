"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormUser({ initialData }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
    password: "", 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nama: initialData.nama || "",
        email: initialData.email || "",
        telp: initialData.telp || "",
        password: "", 
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

    if (!isEditMode) {
        setError("Superadmin tidak memiliki akses untuk membuat user baru.");
        setIsLoading(false);
        return;
    }

    const token = localStorage.getItem("token");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

    const payload = {
        name: formData.nama,           
        email: formData.email,         
        nomor_telepon: formData.telp,  
    };

    if (formData.password) {
        payload.password = formData.password;
    }

    const url = `${baseUrl}/users/${initialData.id}`;
    const method = "PUT"; 

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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Gagal menyimpan perubahan user.");
      }

      console.log("User updated successfully");
      router.push("/superadmin/users"); // Kembali ke list user
      router.refresh();

    } catch (err) {
      console.error("Failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditMode) {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold mb-2">Akses Ditolak</h3>
            <p>Superadmin hanya diperbolehkan mengedit atau menghapus user, tidak dapat membuat user baru.</p>
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-white border border-red-300 rounded hover:bg-red-50">Kembali</button>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        Edit Data User
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-sm">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input Nama */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">Nama User</label>
          <input 
            type="text" name="nama" value={formData.nama} onChange={handleChange} required
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-primary-500" 
          />
        </div>

        {/* Input Email */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">Email</label>
          <input 
            type="email" name="email" value={formData.email} onChange={handleChange} required
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-primary-500" 
          />
        </div>

        {/* Input Telepon */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">No. Telepon</label>
          <input 
            type="tel" name="telp" value={formData.telp} onChange={handleChange} required
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-primary-500" 
          />
        </div>

        {/* Input Password (Opsional) */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">
            Password <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin ubah)</span>
          </label>
          <input 
            type="password" name="password" value={formData.password} onChange={handleChange}
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-primary-500" 
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
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}