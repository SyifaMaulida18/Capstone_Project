"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Input } from "@/app/superadmin/components/ui/input";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function AddRekamMedisPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState([]);
  const [loadingReservasi, setLoadingReservasi] = useState(true);

  const [form, setForm] = useState({
    reservasi_id: "",
    no_medrec: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    tanggal_diperiksa: "",
  });

  // ✅ Ambil daftar reservasi berdasarkan user yang login
  useEffect(() => {
    const fetchReservasi = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");

        if (!token || !userId) {
          console.error("Token atau user_id tidak ditemukan");
          setLoadingReservasi(false);
          return;
        }

        const res = await fetch(
          `${API_BASE}/reservasi?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const json = await res.json();

        if (!res.ok) {
          console.error("Gagal fetch reservasi:", json);
          setLoadingReservasi(false);
          return;
        }

        setReservations(json.data || json); // sesuaikan shape backend
      } catch (err) {
        console.error("Gagal fetch reservasi:", err);
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

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      if (!token || !userId) {
        alert("Token atau user tidak ditemukan");
        return;
      }

      // ✅ kalau backend perlu user_id di body, kita tambahkan di payload
      const payload = {
        ...form,
        user_id: userId,
      };

      const res = await fetch(
        `${API_BASE}/rekam-medis?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        console.error("Gagal menyimpan rekam medis:", json);
        alert("Gagal menyimpan rekam medis");
        return;
      }

      alert("Rekam medis berhasil disimpan");
      router.push("/superadmin/rekam-medis");
    } catch (err) {
      console.error("Error submit:", err);
      alert("Terjadi kesalahan saat menyimpan rekam medis");
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-neutral-800">
          Tambah Rekam Medis
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reservasi */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Reservasi
            </label>
            {loadingReservasi ? (
              <p className="text-neutral-500 text-sm">
                Memuat daftar reservasi...
              </p>
            ) : (
              <select
                value={form.reservasi_id}
                onChange={handleChange("reservasi_id")}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Pilih reservasi</option>
                {reservations.map((r) => (
                  <option key={r.reservid} value={r.reservid}>
                    {r.reservid} - {r.kode_reservasi || r.status || "Reservasi"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* No Medrec */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Nomor Medrec
            </label>
            <Input
              value={form.no_medrec}
              onChange={handleChange("no_medrec")}
              required
            />
          </div>

          {/* Gejala */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Gejala
            </label>
            <textarea
              value={form.gejala}
              onChange={handleChange("gejala")}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Diagnosis
            </label>
            <textarea
              value={form.diagnosis}
              onChange={handleChange("diagnosis")}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Tindakan */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Tindakan
            </label>
            <textarea
              value={form.tindakan}
              onChange={handleChange("tindakan")}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Tanggal diperiksa */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Tanggal Diperiksa
            </label>
            <Input
              type="date"
              value={form.tanggal_diperiksa}
              onChange={handleChange("tanggal_diperiksa")}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/superadmin/rekam-medis")}
              className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-secondary-500 text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
