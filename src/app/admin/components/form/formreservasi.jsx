"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/admin/components/ui/input"; // pastikan path ini benar

// Opsi untuk form
const jkOptions = ["Perempuan", "Laki-laki"];
const penjaminOptions = ["BPJS", "Swasta", "Asuransi Lain"];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

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
    rekomPoli: "",        // cuma untuk tampilan
    poliId: "",           // poli tujuan (wajib)
    tanggalReservasi: "", // tanggal reservasi (wajib)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [polis, setPolis] = useState([]);
  const [loadingPoli, setLoadingPoli] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = Boolean(initialData);

  // Prefill kalau edit
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData((prev) => ({
        ...prev,
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
        poliId: initialData.poliId || "",
        tanggalReservasi: initialData.tanggalReservasi || "",
      }));
    }
  }, [initialData, isEditMode]);

  // Ambil daftar poli untuk dropdown
  useEffect(() => {
    const fetchPolis = async () => {
      try {
        setLoadingPoli(true);
        setErrorMsg("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        if (!token) {
          setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
          setLoadingPoli(false);
          return;
        }

        const res = await fetch(`${API_BASE}/polis`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Gagal mengambil data poli (status ${res.status}): ${text}`
          );
        }

        const json = await res.json();
        const dataPoli = json.data ?? json;

        setPolis(Array.isArray(dataPoli) ? dataPoli : []);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Gagal mengambil data poli.");
      } finally {
        setLoadingPoli(false);
      }
    };

    fetchPolis();
  }, []);

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
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
        setIsLoading(false);
        return;
      }

      // Mapping penjamin ke field backend
      const penjaminan =
        formData.penjamin === "Swasta" ? "cash" : "asuransi";

      const payload = {
        // field utama
        poli_id: formData.poliId,
        tanggal_reservasi: formData.tanggalReservasi,
        keluhan: formData.keluhan,
        is_self: false,
        penanggung_jawab_id: null,

        // data pasien (sesuai aturan is_self = false)
        nama: formData.nama,
        email: formData.email,
        jenis_kelamin: formData.jk,
        tempat_lahir: "-", // kamu bisa tambah field di form kalau mau
        tanggal_lahir: formData.tglLahir,
        nomor_ktp: formData.nik,
        nomor_whatsapp: formData.wa || formData.telp,
        penjaminan,
        status_keluarga: null,
        nama_keluarga: null,
        status_perkawinan: null,
        suku: null,
        agama: null,
        pendidikan_terakhir: null,
        alamat: null,
        provinsi: null,
        "kota/kabupaten": null,
        kecamatan: null,
        kelurahan: null,
        nomor_pegawai: null,

        // asuransi
        nama_asuransi:
          penjaminan === "asuransi" ? formData.penjamin : null,
        nomor_asuransi: null,
      };

      if (isEditMode) {
        // Belum ada endpoint update reservasi di routes-mu
        console.warn(
          "Mode edit: endpoint update reservasi belum tersedia di backend."
        );
        // Kalau nanti kamu buat PUT /reservations/{id}, tinggal panggil di sini
        // await fetch(`${API_BASE}/reservations/${initialData.id}`, { ... })
      } else {
        const res = await fetch(`${API_BASE}/reservations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          console.error("ERROR BODY:", errorBody);

          throw new Error(
            errorBody?.message ||
              `Gagal membuat reservasi (status ${res.status})`
          );
        }

        const json = await res.json();
        console.log("Reservasi berhasil dibuat:", json);
      }

      router.push("/admin/reservasi"); // sesuaikan dengan route list-mu
      router.refresh();
    } catch (error) {
      console.error("Failed to save data:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Reservasi" : "Tambah Reservasi Baru"}
      </h2>

      {errorMsg && (
        <p className="text-sm text-red-600 mb-4 text-center">{errorMsg}</p>
      )}

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* GRID DATA PASIEN */}
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
            <label className="text-sm text-neutral-600 block mb-1">
              NIK
            </label>
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
              required
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

        {/* KELUHAN */}
        <div>
          <label className="text-sm text-neutral-600 block mb-1">
            Keluhan
          </label>
          <textarea
            name="keluhan"
            value={formData.keluhan}
            onChange={handleChange}
            rows={3}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* REKOMENDASI POLI (optional, hanya teks) */}
        <div>
          <label className="text-sm text-neutral-600 block mb-1">
            Rekomendasi Poli (opsional, catatan saja)
          </label>
          <Input
            name="rekomPoli"
            value={formData.rekomPoli}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* PILIH POLI + TANGGAL RESERVASI */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Poli Tujuan
            </label>
            <select
              name="poliId"
              value={formData.poliId}
              onChange={handleChange}
              required
              disabled={isLoading || loadingPoli}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">
                {loadingPoli ? "Memuat data poli..." : "Pilih Poli"}
              </option>
              {polis.map((poli) => (
                <option key={poli.poli_id} value={poli.poli_id}>
                  {poli.poli_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Tanggal Reservasi
            </label>
            <Input
              type="date"
              name="tanggalReservasi"
              value={formData.tanggalReservasi}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
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
