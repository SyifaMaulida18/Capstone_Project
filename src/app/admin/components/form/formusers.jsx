"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormUser({ initialData }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nama: initialData.nama || "",
        email: initialData.email || "",
        telp: initialData.telp || "",
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

      if (isEditMode) {
        // Backend expects: name, email, nomor_telepon, optional password
        const payload = {
          name: formData.nama,
          email: formData.email,
          nomor_telepon: formData.telp,
        };

        const res = await fetch(`${baseUrl}/users/${initialData.id}`, {
          method: "PUT",
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          const msg = errBody?.message || "Gagal memperbarui data user";
          throw new Error(msg);
        }
      } else {
        // Tidak ada endpoint POST /users untuk superadmin di backend saat ini
        throw new Error("Fitur tambah user belum tersedia dari frontend ini.");
      }

      router.push("/admin/users"); // Kembali ke halaman list user
      router.refresh();
    } catch (error) {
      console.error("Failed to save data:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Data User" : "Tambah User Baru"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
        <div>
          <label
            htmlFor="nama"
            className="block mb-2 text-sm font-semibold text-neutral-700"
          >
            Nama User
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            placeholder="Contoh: Saputra"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-semibold text-neutral-700"
          >
            Email
          </label>
          <input
            type="email" // Tipe input email
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Contoh: saputra123@gmail.com"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="telp"
            className="block mb-2 text-sm font-semibold text-neutral-700"
          >
            No. Telepon
          </label>
          <input
            type="tel"
            id="telp"
            name="telp"
            value={formData.telp}
            onChange={handleChange}
            required
            placeholder="Contoh: 081234567890"
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

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
              : "Tambah User"}
          </button>
        </div>
      </form>
    </div>
  );
}