"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Input } from "@/app/superadmin/components/ui/input";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function EditRekamMedisPage() {
  const router = useRouter();
  const params = useParams(); // { id: '1' }

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    no_medrec: "",
    gejala: "",
    diagnosis: "",
    tindakan: "",
    tanggal_diperiksa: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/rekam-medis/${params.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const json = await res.json();
        const data = json.data || json;

        setForm({
          no_medrec: data.no_medrec || "",
          gejala: data.gejala || "",
          diagnosis: data.diagnosis || "",
          tindakan: data.tindakan || "",
          tanggal_diperiksa: (data.tanggal_diperiksa || "").slice(0, 10),
        });
      } catch (err) {
        console.error("Gagal fetch detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchDetail();
    }
  }, [params?.id]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/rekam-medis/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error(json);
        alert("Gagal mengupdate rekam medis");
        return;
      }

      alert("Rekam medis berhasil diupdate");
      router.push("/superadmin/rekam-medis");
    } catch (err) {
      console.error("Error submit:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-neutral-800">
          Rekam Medis
        </h1>

        {loading ? (
          <p className="text-neutral-600">Memuat data...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
