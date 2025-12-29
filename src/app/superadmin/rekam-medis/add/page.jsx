"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Input } from "@/app/superadmin/components/ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function AddRekamMedisPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState([]);
  const [loadingReservasi, setLoadingReservasi] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Get today's date in WIB timezone
  const getTodayWIB = () => {
    const now = new Date();
    const wibDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return `${wibDate.getFullYear()}-${String(wibDate.getMonth() + 1).padStart(2, '0')}-${String(wibDate.getDate()).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    reservasi_id: "",
    no_medrec: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    resep_obat: "", // Ditambahkan
    tanggal_diperiksa: getTodayWIB(), // Default hari ini in WIB
  });

  // Fetch Data Reservasi (Confirmed only)
  useEffect(() => {
    const fetchReservasi = async () => {
      try {
        setLoadingReservasi(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/reservations`, { // Ambil semua reservasi dulu
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const allData = json.data || [];
        
        // Filter manual jika API belum support ?status=confirmed
        // Sesuaikan 'confirmed' dengan status yang ada di DB Anda (misal: 'confirmed', 'approved')
        const filtered = Array.isArray(allData) 
            ? allData.filter(r => r.status === 'confirmed' || r.status === 'pending') 
            : [];

        setReservations(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReservasi(false);
      }
    };
    fetchReservasi();
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const payload = {
        reservasi_id: Number(form.reservasi_id),
        no_medrec: form.no_medrec || null, // Kirim null agar backend auto-generate
        gejala: form.gejala,
        diagnosis: form.diagnosis,
        tindakan: form.tindakan,
        resep_obat: form.resep_obat,
        tanggal_diperiksa: form.tanggal_diperiksa,
      };

      const res = await fetch(`${API_BASE}/rekam-medis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan data.");
      }

      alert("Rekam medis berhasil disimpan!");
      router.push("/superadmin/rekam-medis");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-neutral-800">Tambah Rekam Medis</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reservasi Select */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">
              Pilih Reservasi Pasien
            </label>
            <select
              value={form.reservasi_id}
              onChange={handleChange("reservasi_id")}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">-- Pilih --</option>
              {reservations.map((r) => (
                <option key={r.reservid} value={r.reservid}>
                  {r.user?.name} - {r.poli?.nama_poli} ({r.tanggal_reservasi})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* No Medrec */}
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-1">
                No. Medrec (Opsional)
              </label>
              <Input
                value={form.no_medrec}
                onChange={handleChange("no_medrec")}
                placeholder="Kosongkan utk Auto-Generate"
              />
            </div>
            {/* Tanggal */}
            <div>
              <label className="text-sm font-semibold text-neutral-700 block mb-1">
                Tanggal Diperiksa
              </label>
              <Input
                type="date"
                value={form.tanggal_diperiksa}
                onChange={handleChange("tanggal_diperiksa")}
                required
              />
            </div>
          </div>

          {/* Area Text Inputs */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">Gejala / Keluhan</label>
            <textarea
              value={form.gejala}
              onChange={handleChange("gejala")}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">Diagnosis</label>
            <textarea
              value={form.diagnosis}
              onChange={handleChange("diagnosis")}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">Tindakan</label>
            <textarea
              value={form.tindakan}
              onChange={handleChange("tindakan")}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-neutral-700 block mb-1">Resep Obat</label>
            <textarea
              value={form.resep_obat}
              onChange={handleChange("resep_obat")}
              rows={3}
              placeholder="- Obat A 3x1..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-yellow-50 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push("/superadmin/rekam-medis")}
              className="bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}