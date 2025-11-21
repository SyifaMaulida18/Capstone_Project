"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/admin/components/ui/input"; // Asumsi path Input benar

// Opsi untuk form
const jkOptions = ["Perempuan", "Laki-laki"];
const penjaminOptions = ["BPJS", "Swasta", "Asuransi Lain"];

export default function FormReservasi({ initialData }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
    tglLahir: "",
    jk: "Perempuan",
    nik: "",
    wa: "",
    penjamin: "BPJS",
    keluhan: "",
    rekomPoli: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nama: initialData.nama || "",
        email: initialData.email || "",
        telp: initialData.telp || "",
        tglLahir: initialData.tglLahir || "",
        jk: initialData.jk || "Perempuan",
        nik: initialData.nik || "",
        wa: initialData.wa || "",
        penjamin: initialData.penjamin || "BPJS",
        keluhan: initialData.keluhan || "",
        rekomPoli: initialData.rekomPoli || "",
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

    try {
      if (isEditMode) {
        console.log("Updating data reservasi:", { ...initialData, ...formData });
        // Ganti dengan API call PUT/PATCH Anda
      } else {
        console.log("Creating data reservasi:", formData);
        // Ganti dengan API call POST Anda
      }

      router.push("/admin/reservasi"); // Kembali ke halaman list reservasi
      router.refresh();
    } catch (error) {
      console.error("Failed to save data:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Reservasi" : "Tambah Reservasi Baru"}
      </h2>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Form Penuh */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Nama Lengkap
            </label>
            <Input
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Tanggal Lahir
            </label>
            <Input
              type="date"
              name="tglLahir"
              value={formData.tglLahir}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Jenis Kelamin
            </label>
            <select
              name="jk"
              value={formData.jk}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {jkOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">NIK</label>
            <Input
              name="nik"
              value={formData.nik}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              No. Telepon (HP)
            </label>
            <Input
              type="tel"
              name="telp"
              value={formData.telp}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              No. WhatsApp
            </label>
            <Input
              type="tel"
              name="wa"
              value={formData.wa}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Penjamin
            </label>
            <select
              name="penjamin"
              value={formData.penjamin}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {penjaminOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field di bawah grid */}
        <div>
          <label className="text-sm text-neutral-600 block mb-1">
            Keluhan
          </label>
          <textarea
            name="keluhan"
            value={formData.keluhan}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600 block mb-1">
            Rekomendasi Poli
          </label>
          <Input
            name="rekomPoli"
            value={formData.rekomPoli}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
          >
            {isLoading
              ? "Menyimpan..."
              : isEditMode
              ? "Simpan Perubahan"
              : "Tambah Reservasi"}
          </button>
        </div>
      </form>
    </div>
  );
}