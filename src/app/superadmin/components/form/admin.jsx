"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Sesuaikan URL Backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function FormAdmin({ initialData }) {
  const router = useRouter();
  
  // State Form
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "admin", // Default role
    poliId: "",    // Untuk relasi poli
  });

  // State Data Master (Poli)
  const [polis, setPolis] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMaster, setIsFetchingMaster] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

  // 1. Fetch Data Poli untuk Dropdown
  useEffect(() => {
    const fetchPolis = async () => {
      setIsFetchingMaster(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/polis`, {
            headers: { 
                "Accept": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });
        const json = await res.json();
        // Handle struktur respons: { data: [...] } atau [...]
        const data = Array.isArray(json) ? json : (json.data || []);
        setPolis(data);
      } catch (err) {
        console.error("Gagal load poli:", err);
      } finally {
        setIsFetchingMaster(false);
      }
    };
    fetchPolis();
  }, []);

  // 2. Isi Form jika Edit Mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nama: initialData.Nama || "",
        email: initialData.Email || "",
        password: "", // Password kosong saat edit
        role: initialData.role || "admin",
        poliId: initialData.poli_id || "",
      });
    }
  }, [initialData, isEditMode]);

  // Handle Perubahan Input
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
    if (!token) {
        setError("Sesi habis, silakan login ulang.");
        setIsLoading(false);
        return;
    }

    // Payload sesuai Controller Laravel (Huruf Besar/Kecil harus pas)
    const payload = {
        Nama: formData.nama,
        Email: formData.email,
        role: formData.role,
        poli_id: formData.poliId || null, // Kirim null jika kosong
    };

    // Logic Password
    if (formData.password) {
        payload.Password = formData.password;
    } else if (!isEditMode) {
        setError("Password wajib diisi untuk admin baru.");
        setIsLoading(false);
        return;
    }

    const url = isEditMode 
        ? `${API_BASE}/admins/${initialData.adminID}` 
        : `${API_BASE}/admins`;
        
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

      const jsonResponse = await response.json();

      if (!response.ok) {
        // Tangkap pesan error validasi dari Laravel
        const msg = jsonResponse.message || "Gagal menyimpan data.";
        const validationErrors = jsonResponse.errors ? JSON.stringify(jsonResponse.errors) : "";
        throw new Error(`${msg} ${validationErrors}`);
      }

      console.log("Success:", isEditMode ? "Updated" : "Created");
      
      // Redirect
      router.push("/superadmin/admins"); 
      router.refresh();
      
    } catch (err) {
      console.error("Submit Error:", err);
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm break-words">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NAMA */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">Nama Admin</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-neutral-700">
            Password {isEditMode && <span className="text-gray-400 font-normal text-xs">(Isi hanya jika ingin mengubah)</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditMode}
            minLength={6}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* GRID: ROLE & POLI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ROLE */}
            <div>
                <label className="block mb-2 text-sm font-semibold text-neutral-700">Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white"
                    disabled={isLoading}
                >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                </select>
            </div>

            {/* POLI (Opsional) */}
            <div>
                <label className="block mb-2 text-sm font-semibold text-neutral-700">Poli (Opsional)</label>
                <select
                    name="poliId"
                    value={formData.poliId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white"
                    disabled={isLoading || isFetchingMaster}
                >
                    <option value="">-- Tidak Ada Poli --</option>
                    {polis.map((p) => (
                        <option key={p.poli_id} value={p.poli_id}>
                            {p.poli_name}
                        </option>
                    ))}
                </select>
                {isFetchingMaster && <p className="text-xs text-gray-400 mt-1">Memuat data poli...</p>}
            </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-4 py-2 bg-white text-neutral-700 border rounded-lg hover:bg-neutral-100 font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 font-semibold shadow-md disabled:opacity-50"
          >
            {isLoading ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </form>
    </div>
  );
}