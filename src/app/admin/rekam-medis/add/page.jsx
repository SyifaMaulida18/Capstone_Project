"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/app/admin/components/admin_layout";
import { Input } from "@/app/admin/components/ui/input";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function AddRekamMedisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservations, setReservations] = useState([]);
  const [loadingReservasi, setLoadingReservasi] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    reservasi_id: "",
    no_medrec: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    tanggal_diperiksa: "",
  });

  // Prefill dari query param (reservasi_id)
  useEffect(() => {
    const qReservasiId = searchParams?.get("reservasi_id");
    if (qReservasiId) {
      setForm((prev) => ({ ...prev, reservasi_id: qReservasiId }));
    }
  }, [searchParams]);

  // ✅ Ambil daftar reservasi (misalnya hanya yang confirmed)
  useEffect(() => {
    const fetchReservasi = async () => {
      try {
        setLoadingReservasi(true);
        setErrorMsg("");

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setErrorMsg("Token tidak ditemukan, silakan login ulang.");
          setLoadingReservasi(false);
          return;
        }

        // Sesuai ReservationController@index
        // GET /reservations?status=confirmed
        const res = await fetch(
          `${API_BASE}/reservations?status=confirmed`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const json = await res.json();

        if (!res.ok || json.success === false) {
          console.error("Gagal fetch reservasi:", json);
          setErrorMsg(json.message || "Gagal mengambil data reservasi.");
          setLoadingReservasi(false);
          return;
        }

        // Laravel paginator -> json.data.data
        const paginated = json.data;
        const items = Array.isArray(paginated)
          ? paginated
          : paginated?.data || [];

        setReservations(items);
      } catch (err) {
        console.error("Gagal fetch reservasi:", err);
        setErrorMsg("Terjadi kesalahan saat mengambil data reservasi.");
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

      if (!token) {
        alert("Token tidak ditemukan, silakan login ulang.");
        return;
      }

      // ✅ Payload sesuai RekamMedisController::store
      const payload = {
        reservasi_id: Number(form.reservasi_id),
        no_medrec: form.no_medrec,
        gejala: form.gejala || null,
        diagnosis: form.diagnosis || null,
        tindakan: form.tindakan || null,
        resep_obat: null, // belum ada field di form, kirim null dulu
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
        console.error("Gagal menyimpan rekam medis:", json);
        const msg =
          json.message || "Gagal menyimpan rekam medis. Periksa input Anda.";
        alert(msg);
        return;
      }

      alert("Rekam medis berhasil disimpan");
      router.push("/admin/rekam-medis");
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

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600">{errorMsg}</div>
        )}

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
                    {r.reservid} - {r.nama || r.status || "Reservasi"} -{" "}
                    {r.tanggal_reservasi
                      ? new Date(r.tanggal_reservasi).toLocaleDateString(
                          "id-ID"
                        )
                      : ""}
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
              placeholder="Contoh: RM-00001"
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
              placeholder="Keluhan / gejala utama pasien"
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
              placeholder="Diagnosis dokter"
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
              placeholder="Tindakan medis yang dilakukan"
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
              onClick={() => router.push("/admin/rekam-medis")}
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
