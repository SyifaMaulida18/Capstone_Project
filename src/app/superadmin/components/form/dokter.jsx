"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormDokter({ initialData }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama_dokter: "",
    bidang_keahlian: "",
    tipe: "",
    praktek: "",
    telpon_praktek: "",
    alamat_rumah: "",
    telp_rumah: "",
    aktif: "Y",           // char(1)
    flags: "",
    nama_dokter_asli: "",
    konsulen: "N",        // varchar(1)
    start_date: "",
    expire_date: "",
    id_dokter_inht: "",
    type_dok: "",
    sip_dokter: "",
    tmt_sip: "",
    str_perawat: "",
    tmt_str: "",
    id_dokter_bpjs: "",
    ttd_id: "",
    sts_peg: "",
    no_ktp: "",
    id_satu_sehat: "",
    jenis_kelamin: "L",   // char(1)
    ksm_role: "",
    last_update: "",
    last_update_by: "Superadmin",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(initialData);

  // helper: ubah value dari DB (datetime / timestamp) jadi 'YYYY-MM-DD' untuk input date
  const toDateOnly = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10); // '2025-11-25'
  };

  // isi form saat edit
  useEffect(() => {
    if (!isEditMode || !initialData) return;

    const populatedData = {};

    Object.keys(formData).forEach((key) => {
      let value = initialData[key];

      if (["tmt_sip", "tmt_str", "start_date", "expire_date"].includes(key)) {
        value = toDateOnly(value);
      } else if (value === null || value === undefined) {
        value = "";
      } else {
        value = String(value);
      }

      populatedData[key] = value;
    });

    setFormData((prev) => ({ ...prev, ...populatedData }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // helper: dari 'YYYY-MM-DD' / datetime ke 'YYYY-MM-DD HH:MM:SS'
  const toDateTime = (dateStr) => {
    if (!dateStr) return null;

    const s = String(dateStr);

    // kalau sudah datetime lengkap, jangan digandakan
    if (s.length > 10) {
      // contoh: '2025-11-25 00:00:00' atau '2025-11-25T00:00:00Z'
      return s.slice(0, 19).replace("T", " ");
    }

    // dari input date
    return `${s} 00:00:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

    const url = isEditMode
      ? `${baseUrl}/dokters/${initialData.dokter_id}`
      : `${baseUrl}/dokters`;

    const method = isEditMode ? "PUT" : "POST";

    // susun payload sesuai tipe kolom di DB
    const payload = {
      ...formData,
      last_update: new Date().toISOString().slice(0, 19).replace("T", " "),
      tmt_sip: toDateTime(formData.tmt_sip),
      tmt_str: toDateTime(formData.tmt_str),
      // batas panjang kolom
      id_dokter_inht: formData.id_dokter_inht
        ? formData.id_dokter_inht.slice(0, 5)
        : "",
      sts_peg: formData.sts_peg ? formData.sts_peg.slice(0, 20) : "",
      ksm_role: formData.ksm_role ? formData.ksm_role.slice(0, 20) : "",
      flags: formData.flags ? formData.flags.slice(0, 50) : "",
      // numeric
      ttd_id: formData.ttd_id ? Number(formData.ttd_id) : null,
      // pastikan char(1)
      aktif: formData.aktif ? formData.aktif.slice(0, 1) : "Y",
      konsulen: formData.konsulen ? formData.konsulen.slice(0, 1) : "N",
      jenis_kelamin: formData.jenis_kelamin
        ? formData.jenis_kelamin.slice(0, 1)
        : "L",
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            JSON.stringify(errorData) ||
            "Gagal menyimpan data dokter."
        );
      }

      router.push("/superadmin/dokter");
      router.refresh();
    } catch (err) {
      console.error("Failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label,
    name,
    type = "text",
    required = false,
    placeholder = ""
  ) => (
    <div className="col-span-1">
      <label className="block mb-2 text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
      />
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-800">
        {isEditMode ? "Edit Data Dokter" : "Tambah Dokter Baru"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Utama */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <h3 className="font-bold text-lg mb-4 text-primary-700">
            Informasi Dokter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderInput(
              "Nama Dokter",
              "nama_dokter",
              "text",
              true,
              "dr. Nama Lengkap"
            )}
            {renderInput(
              "Bidang Keahlian",
              "bidang_keahlian",
              "text",
              false,
              "Spesialis ..."
            )}
            {renderInput("Nama Dokter Asli", "nama_dokter_asli")}
            {renderInput("No KTP", "no_ktp")}

            {/* Jenis Kelamin */}
            <div className="col-span-1">
              <label className="block mb-2 text-sm font-semibold text-neutral-700">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Status Aktif */}
            <div className="col-span-1">
              <label className="block mb-2 text-sm font-semibold text-neutral-700">
                Status Aktif
              </label>
              <select
                name="aktif"
                value={formData.aktif}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="Y">Aktif (Y)</option>
                <option value="N">Tidak Aktif (N)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kontak & Alamat */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <h3 className="font-bold text-lg mb-4 text-primary-700">
            Kontak & Alamat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderInput("Telp Praktek", "telpon_praktek")}
            {renderInput("Telp Rumah", "telp_rumah")}
            {renderInput("Alamat Rumah", "alamat_rumah")}
            {renderInput("Lokasi Praktek", "praktek")}
          </div>
        </div>

        {/* Kepegawaian & Legalitas */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <h3 className="font-bold text-lg mb-4 text-primary-700">
            Kepegawaian & Legalitas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderInput("Tipe", "tipe", "text", false, "A / B / C")}
            {renderInput("Tipe Dok", "type_dok")}
            {renderInput("Status Pegawai", "sts_peg")}
            {renderInput("KSM Role", "ksm_role")}
            {renderInput("SIP Dokter", "sip_dokter")}
            {renderInput("TMT SIP", "tmt_sip", "date")}
            {renderInput("STR Perawat", "str_perawat")}
            {renderInput("TMT STR", "tmt_str", "date")}
            {renderInput("Start Date", "start_date", "date")}
            {renderInput("Expire Date", "expire_date", "date")}
          </div>
        </div>

        {/* Integrasi & Lainnya */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <h3 className="font-bold text-lg mb-4 text-primary-700">
            Integrasi & Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderInput("ID Satu Sehat", "id_satu_sehat")}
            {renderInput("ID Dokter BPJS", "id_dokter_bpjs")}
            {renderInput("ID Dokter INHT", "id_dokter_inht")}
            {renderInput("Flags", "flags")}

            {/* Konsulen */}
            <div className="col-span-1">
              <label className="block mb-2 text-sm font-semibold text-neutral-700">
                Konsulen
              </label>
              <select
                name="konsulen"
                value={formData.konsulen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="N">Bukan Konsulen (N)</option>
                <option value="Y">Konsulen (Y)</option>
              </select>
            </div>

            {renderInput("TTD ID", "ttd_id", "number")}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-6 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors font-semibold disabled:opacity-50"
          >
            {isLoading
              ? "Menyimpan..."
              : isEditMode
              ? "Simpan Perubahan"
              : "Tambah Dokter"}
          </button>
        </div>
      </form>
    </div>
  );
}
