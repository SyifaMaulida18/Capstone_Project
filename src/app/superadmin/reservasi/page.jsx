"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import api from "@/services/api"; // ✅ pakai axios service



function Dialog({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-neutral-600 hover:text-neutral-900 text-2xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function VerifikasiReservasiPage() {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [verifyingPatient, setVerifyingPatient] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [processingVerify, setProcessingVerify] = useState(false);

  // === FETCH DATA RESERVASI DARI LARAVEL (ADMIN) ===
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      // 🔎 ambil cuma status pending (kalau backend support query ?status=pending)
      const res = await api.get("/reservations", {
        params: { status: "pending" },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? res.data ?? [];

      // support dua bentuk:
      // - array langsung
      // - paginate: { data: [...] }
      const raw = Array.isArray(data) ? data : data?.data || [];

      const mapped = (raw || []).map((r) => {
        const id = r.reservid ?? r.id ?? r.reservation_id;

        return {
          id,
          nama: r.nama,
          email: r.email,
          telp: r.nomor_whatsapp,
          tglLahir: r.tanggal_lahir,
          jk: r.jenis_kelamin,
          nik: r.nomor_ktp,
          wa: r.nomor_whatsapp,
          penjamin:
            r.penjaminan === "asuransi"
              ? r.nama_asuransi || "Asuransi"
              : "Cash",
          keluhan: r.keluhan,
          poli: r.poli?.poli_name ?? "-",
          tanggal: r.tanggal_reservasi ?? "-",
          status: r.status ?? "-",
        };
      });

      setReservations(mapped);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleDetail = (pasien) => {
    setVerifyingPatient(pasien);
    setShowVerifyDialog(true);
  };

  const handleDelete = (id) => {
    if (typeof window === "undefined") return;
    if (window.confirm("Yakin ingin menghapus reservasi ini?")) {
      setReservations((prev) => prev.filter((r) => r.id !== id));
      // Kalau mau benar-benar hapus / cancel di backend, pakai handleCancel
      // atau bikin endpoint delete khusus.
    }
  };

  // ✅ VERIFIKASI RESERVASI (✔)
  const handleVerify = async () => {
    if (!verifyingPatient) return;
    const id = verifyingPatient.id;

    try {
      setProcessingVerify(true);
      const token = localStorage.getItem("token");

      await api.post(
        `/reservations/${id}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update list di FE: hapus dari pending
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setShowVerifyDialog(false);
      setVerifyingPatient(null);
} catch (err) {
  console.error("VERIFY ERROR RAW:", err);

  console.error("VERIFY ERROR DATA:", err.response?.data);

  alert(
    "Error 422:\n" + JSON.stringify(err.response?.data, null, 2)
  );
}

  };

  // ❌ BATALKAN / CANCEL RESERVASI (✖)
  const handleCancel = async () => {
    if (!verifyingPatient) return;
    const id = verifyingPatient.id;

    try {
      setProcessingVerify(true);
      const token = localStorage.getItem("token");

      await api.post(
        `/reservations/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservations((prev) => prev.filter((r) => r.id !== id));
      setShowVerifyDialog(false);
      setVerifyingPatient(null);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Gagal membatalkan reservasi pasien."
      );
    } finally {
      setProcessingVerify(false);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.nama?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.poli?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Verifikasi Reservasi Pasien
        </h1>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari nama, email, poli..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
            </div>

            <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-neutral-600" />
              <span>Filter</span>
            </button>

            <Link
              href="/superadmin/reservasi/add"
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </Link>
          </div>
        </div>

        {loading && (
          <p className="text-center text-sm text-neutral-600 mb-4">
            Mengambil data reservasi...
          </p>
        )}
        {errorMsg && (
          <p className="text-center text-sm text-red-600 mb-4">{errorMsg}</p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {[
                  "Id",
                  "Nama",
                  "Email",
                  "No Telp",
                  "Poli",
                  "Tanggal",
                  "Status",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {!loading && filteredReservations.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-sm text-neutral-500"
                  >
                    Tidak ada data reservasi pending.
                  </td>
                </tr>
              )}

              {filteredReservations.map((p, i) => (
                <tr
                  key={p.id}
                  className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {p.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.nama}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.telp}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.poli}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.tanggal}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : p.status === "verified"
                          ? "bg-green-100 text-green-700"
                          : p.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/superadmin/reservasi/edit/${p.id}`}
                        className="text-neutral-600 hover:text-primary-600 p-1 rounded-md hover:bg-primary-50"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-neutral-600 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDetail(p)}
                        className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition-all"
                      >
                        Lihat detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog
          show={showVerifyDialog}
          onClose={() => {
            if (processingVerify) return;
            setShowVerifyDialog(false);
          }}
        >
          <h2 className="text-xl font-semibold text-center mb-4 text-neutral-700">
            Verifikasi Reservasi Pasien
          </h2>
          {verifyingPatient && (
            <div className="space-y-2 text-neutral-700 text-sm leading-relaxed">
              <p>
                <strong>Nama Lengkap:</strong> {verifyingPatient.nama}
              </p>
              <p>
                <strong>Tanggal Lahir:</strong> {verifyingPatient.tglLahir}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong> {verifyingPatient.jk}
              </p>
              <p>
                <strong>Nomor KTP:</strong> {verifyingPatient.nik}
              </p>
              <p>
                <strong>Email:</strong> {verifyingPatient.email}
              </p>
              <p>
                <strong>Nomor WA:</strong> {verifyingPatient.wa}
              </p>
              <p>
                <strong>Penjamin:</strong> {verifyingPatient.penjamin}
              </p>
              <p>
                <strong>Keluhan:</strong> {verifyingPatient.keluhan}
              </p>
              <p>
                <strong>Poli:</strong> {verifyingPatient.poli}
              </p>
              <p>
                <strong>Tanggal Reservasi:</strong> {verifyingPatient.tanggal}
              </p>
              <p>
                <strong>Status Saat Ini:</strong> {verifyingPatient.status}
              </p>
            </div>
          )}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={handleCancel}
              disabled={processingVerify}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-lg font-bold"
            >
              ✖
            </button>
            <button
              onClick={handleVerify}
              disabled={processingVerify}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-lg font-bold"
            >
              ✔
            </button>
          </div>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
