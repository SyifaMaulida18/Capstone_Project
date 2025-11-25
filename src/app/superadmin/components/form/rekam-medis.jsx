"use client";

import { useState, useEffect } from "react";

// Komponen Modal Sederhana (Pengganti Dialog Import)
function SimpleModal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        {children}
      </div>
    </div>
  );
}

export default function FormMedicalRecord({
  isOpen,
  onClose,
  patient,
  recordToEdit, // Jika null berarti mode ADD, jika ada objek berarti mode EDIT
  onSuccess,    // Callback untuk refresh data di parent
}) {
  const [formData, setFormData] = useState({
    date: "",
    treatment: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset atau isi form saat modal dibuka/data berubah
  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        // Mode Edit
        setFormData({
          date: recordToEdit.date || "", 
          treatment: recordToEdit.treatment || "",
        });
      } else {
        // Mode Add
        setFormData({ date: "", treatment: "" });
      }
      setError(null);
    }
  }, [isOpen, recordToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setIsLoading(false);
        return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
    
    // Tentukan URL dan Method berdasarkan mode Add/Edit
    const url = recordToEdit
      ? `${baseUrl}/medical-records/${recordToEdit.id}`
      : `${baseUrl}/medical-records`;
      
    const method = recordToEdit ? "PUT" : "POST";

    // Payload
    const payload = {
      user_id: patient?.id, // ID Pasien
      date: formData.date,
      treatment: formData.treatment, 
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menyimpan rekam medis.");
      }

      // Jika sukses
      onSuccess(); // Refresh data di parent
      onClose();   // Tutup modal
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SimpleModal show={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-neutral-800 mb-2 border-b pb-2">
          {recordToEdit ? "Edit" : "Tambah"} Rekam Medis
          <span className="block text-sm font-normal text-neutral-500 mt-1">
            Pasien: {patient?.name || patient?.nama}
          </span>
        </h2>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                {error}
            </div>
        )}

        <div>
          <label htmlFor="date" className="text-sm font-semibold text-neutral-700 block mb-1">
            Tanggal Perawatan
          </label>
          <input
            type="date"
            id="date"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="treatment" className="text-sm font-semibold text-neutral-700 block mb-1">
            Keterangan (Perawatan/Diagnosa)
          </label>
          <textarea
            id="treatment"
            rows={4}
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-neutral-100"
            placeholder="Contoh: Pemeriksaan umum, keluhan demam 3 hari."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors font-medium border border-transparent hover:border-neutral-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors font-medium flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : "Simpan"}
          </button>
        </div>
      </form>
    </SimpleModal>
  );
}